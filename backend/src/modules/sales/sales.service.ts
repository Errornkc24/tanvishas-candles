import type { NextFunction, Request, Response } from "express";
import { listSalesOrders } from "./sales.repository.js";

export function getSalesOrders(req: Request, res: Response, next: NextFunction, offset: number, limit: number) {
  return listSalesOrders(req, res, next, offset, limit);
}
