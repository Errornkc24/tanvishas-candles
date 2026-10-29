import { forwardSupabaseRest } from "../../lib/supabase-rest.repository.js";
import type { NextFunction, Request, Response } from "express";
import { categoriesResources } from "./categories.schema.js";

export function forwardCategories(req: Request, res: Response, next: NextFunction) {
  return forwardSupabaseRest(req, res, next, categoriesResources);
}
