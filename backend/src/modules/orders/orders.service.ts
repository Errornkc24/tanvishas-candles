import type { NextFunction, Request, Response } from "express";
import { forwardOrders } from "./orders.repository.js";

export function handleOrdersRequest(req: Request, res: Response, next: NextFunction) {
  return forwardOrders(req, res, next);
}
