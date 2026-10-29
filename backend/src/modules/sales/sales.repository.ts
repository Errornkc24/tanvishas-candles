import type { NextFunction, Request, Response } from "express";
import { forwardSupabaseResource } from "../../lib/supabase-rest.repository.js";

const salesOrderSelect = "select=id,order_number,created_at,status,payment_status,payment_method,subtotal,shipping,total,order_items(name,product_id,price,quantity)&order=created_at.desc,id.asc";

export function listSalesOrders(req: Request, res: Response, next: NextFunction, offset: number, limit: number) {
  return forwardSupabaseResource(req, res, next, "/orders", `?${salesOrderSelect}`, `${offset}-${offset + limit - 1}`);
}
