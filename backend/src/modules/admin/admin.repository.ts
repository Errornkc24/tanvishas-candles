import { forwardSupabaseRest } from "../../lib/supabase-rest.repository.js";
import type { NextFunction, Request, Response } from "express";
import { adminResources } from "./admin.schema.js";

export function forwardAdmin(req: Request, res: Response, next: NextFunction) {
  return forwardSupabaseRest(req, res, next, adminResources);
}
