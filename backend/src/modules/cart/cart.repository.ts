import { forwardSupabaseRest } from "../../lib/supabase-rest.repository.js";
import type { NextFunction, Request, Response } from "express";
import { cartResources } from "./cart.schema.js";

export function forwardCart(req: Request, res: Response, next: NextFunction) {
  return forwardSupabaseRest(req, res, next, cartResources);
}
