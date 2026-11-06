import type { NextFunction, Request, Response } from "express";
import { env } from "../config/env.js";
import { supabaseAdmin, supabaseAuth } from "../lib/supabase.js";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      sessionExpiresAt?: string;
    }
  }
}

type ValidSession = { userId: string; expiresAt: string };

function bearerToken(req: Request) {
  const authorization = req.header("authorization");
  return authorization?.startsWith("Bearer ") ? authorization.slice(7) : "";
}

async function validateSession(token: string): Promise<ValidSession | null> {
  const { data, error } = await supabaseAuth.auth.getUser(token);
  if (error || !data.user) return null;

  // getUser verifies the JWT before its session_id claim is read.
  const payloadPart = token.split(".")[1];
  if (!payloadPart) return null;
  let claims: { session_id?: unknown };
  try {
    claims = JSON.parse(Buffer.from(payloadPart, "base64url").toString("utf8")) as {
      session_id?: unknown;
    };
  } catch {
    return null;
  }

  if (typeof claims.session_id !== "string" || !/^[0-9a-f-]{36}$/i.test(claims.session_id)) {
    return null;
  }

  const { data: expiresAt, error: expiryError } = await supabaseAdmin.rpc(
    "get_auth_session_expiry",
    { _session_id: claims.session_id },
  );
  if (expiryError) throw expiryError;
  if (!expiresAt || Date.parse(expiresAt) <= Date.now()) return null;

  return { userId: data.user.id, expiresAt };
}

async function authorize(
  req: Request,
  res: Response,
  next: NextFunction,
  token: string,
) {
  try {
    const session = await validateSession(token);
    if (!session) {
      res.status(401).json({ error: "Session is invalid or expired. Please sign in again." });
      return;
    }
    req.userId = session.userId;
    req.sessionExpiresAt = session.expiresAt;
    next();
  } catch (error) {
    console.error("Session validation failed", error);
    res.status(503).json({ error: "Session validation is temporarily unavailable." });
  }
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = bearerToken(req);
  if (!token || token === env.SUPABASE_ANON_KEY) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }
  await authorize(req, res, next, token);
}

/** Validate signed-in requests on otherwise public catalog routes, while allowing guests. */
export async function optionalAuth(req: Request, res: Response, next: NextFunction) {
  const token = bearerToken(req);
  const apiKey = req.header("apikey");
  // supabase-js uses the configured public API key as its fallback bearer token
  // when there is no signed-in session. That key may be the newer publishable
  // key, which differs from the backend's legacy anon key.
  if (!token || token === env.SUPABASE_ANON_KEY || token === apiKey) {
    next();
    return;
  }
  await authorize(req, res, next, token);
}
