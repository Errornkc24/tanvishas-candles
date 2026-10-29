import type { NextFunction, Request, Response } from "express";
import { supabaseAuth } from "../lib/supabase.js";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authorization = req.header("authorization");
  const token = authorization?.startsWith("Bearer ") ? authorization.slice(7) : "";
  if (!token) return res.status(401).json({ error: "Authentication required" });

  const { data, error } = await supabaseAuth.auth.getUser(token);
  if (error || !data.user) return res.status(401).json({ error: "Session is invalid or expired" });

  req.userId = data.user.id;
  next();
}
