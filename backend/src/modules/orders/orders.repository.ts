import { forwardSupabaseRest } from "../../lib/supabase-rest.repository.js";
import type { NextFunction, Request, Response } from "express";
import { ordersResources } from "./orders.schema.js";

export function forwardOrders(req: Request, res: Response, next: NextFunction) {
  return forwardSupabaseRest(req, res, next, ordersResources);
}
