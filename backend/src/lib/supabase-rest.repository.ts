import type { NextFunction, Request, Response } from "express";
import { env } from "../config/env.js";

const forwardedHeaders = [
  "authorization",
  "apikey",
  "content-type",
  "accept",
  "prefer",
  "range",
  "range-unit",
  "accept-profile",
  "content-profile",
  "x-client-info",
];

/** Forward a whitelisted PostgREST resource while preserving the user's JWT for RLS/auth.uid(). */
export async function forwardSupabaseRest(
  req: Request,
  res: Response,
  next: NextFunction,
  allowedResources: readonly string[],
) {
  try {
    const requestUrl = new URL(req.originalUrl, "http://api.local");
    const prefix = "/api/database/rest/v1";
    if (!requestUrl.pathname.startsWith(`${prefix}/`)) {
      return res.status(404).json({ error: "Database route not found" });
    }

    const resource = requestUrl.pathname.slice(prefix.length);
    if (!allowedResources.includes(resource)) {
      return res.status(404).json({ error: "Database resource not found" });
    }
    if (!["GET", "HEAD", "POST", "PATCH", "PUT", "DELETE"].includes(req.method)) {
      return res.status(405).json({ error: "Method not allowed" });
    }

    return await forwardSupabaseResource(req, res, next, resource, requestUrl.search);
  } catch (error) {
    next(error);
  }
}

export async function forwardSupabaseResource(
  req: Request,
  res: Response,
  next: NextFunction,
  resource: string,
  search = "",
  range?: string,
) {
  try {
    const target = new URL(`/rest/v1${resource}${search}`, env.SUPABASE_URL);
    const headers = new Headers();
    const authorization = req.header("authorization");
    const bearer = authorization?.startsWith("Bearer ") ? authorization.slice(7) : "";
    const publicApiKey = req.header("apikey") || env.SUPABASE_ANON_KEY;
    const isPublicCredential =
      !bearer || bearer === env.SUPABASE_ANON_KEY || bearer === publicApiKey;
    for (const name of forwardedHeaders) {
      if (name === "authorization" && isPublicCredential) continue;
      const value = req.header(name);
      if (value) headers.set(name, value);
    }
    if (!headers.has("apikey")) headers.set("apikey", env.SUPABASE_ANON_KEY);
    if (range) headers.set("range", range);

    const hasBody = !["GET", "HEAD"].includes(req.method);
    const requestInit: RequestInit = {
      method: req.method,
      headers,
      ...(hasBody && req.body ? { body: req.body as BodyInit } : {}),
    };
    let upstream: globalThis.Response | undefined;
    let lastNetworkError: unknown;
    const attempts = req.method === "GET" || req.method === "HEAD" ? 3 : 1;

    for (let attempt = 0; attempt < attempts; attempt += 1) {
      try {
        upstream = await fetch(target, requestInit);
        break;
      } catch (error) {
        lastNetworkError = error;
        if (attempt + 1 < attempts) {
          await new Promise((resolve) => setTimeout(resolve, 250 * 2 ** attempt));
        }
      }
    }

    if (!upstream) throw lastNetworkError;

    for (const name of ["content-type", "content-range", "preference-applied", "range-unit"]) {
      const value = upstream.headers.get(name);
      if (value) res.setHeader(name, value);
    }
    res.status(upstream.status).send(Buffer.from(await upstream.arrayBuffer()));
  } catch (error) {
    next(error);
  }
}
