import type { NextFunction, Request, Response } from "express";
import { handleStockRequest } from "./stock.service.js";

export function stockController(req: Request, res: Response, next: NextFunction) {
  return handleStockRequest(req, res, next);
}
