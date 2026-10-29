import type { NextFunction, Request, Response } from "express";
import { handleOrdersRequest } from "./orders.service.js";

export function ordersController(req: Request, res: Response, next: NextFunction) {
  return handleOrdersRequest(req, res, next);
}
