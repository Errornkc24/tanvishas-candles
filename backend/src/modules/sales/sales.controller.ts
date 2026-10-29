import type { NextFunction, Request, Response } from "express";
import { getSalesOrders } from "./sales.service.js";
import { salesOrdersQuery } from "./sales.schema.js";

export function salesOrdersController(req: Request, res: Response, next: NextFunction) {
  const parsed = salesOrdersQuery.safeParse(req.query);
  if (!parsed.success) return res.status(400).json({ error: "Invalid sales query parameters" });
  const { offset, limit } = parsed.data;
  return getSalesOrders(req, res, next, offset, limit);
}
