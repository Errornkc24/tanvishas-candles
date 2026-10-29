import { forwardSupabaseRest } from "../../lib/supabase-rest.repository.js";
import type { NextFunction, Request, Response } from "express";
import { productsResources } from "./products.schema.js";

export function forwardProducts(req: Request, res: Response, next: NextFunction) {
  return forwardSupabaseRest(req, res, next, productsResources);
}
