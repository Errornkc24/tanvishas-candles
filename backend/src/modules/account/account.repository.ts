import { forwardSupabaseRest } from "../../lib/supabase-rest.repository.js";
import type { NextFunction, Request, Response } from "express";
import { accountResources } from "./account.schema.js";

export function forwardAccount(req: Request, res: Response, next: NextFunction) {
  return forwardSupabaseRest(req, res, next, accountResources);
}
