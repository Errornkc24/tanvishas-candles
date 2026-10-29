import { forwardSupabaseRest } from "../../lib/supabase-rest.repository.js";
import type { NextFunction, Request, Response } from "express";
import { stockResources } from "./stock.schema.js";

export function forwardStock(req: Request, res: Response, next: NextFunction) {
  return forwardSupabaseRest(req, res, next, stockResources);
}
