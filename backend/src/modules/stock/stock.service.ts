import type { NextFunction, Request, Response } from "express";
import { forwardStock } from "./stock.repository.js";

export function handleStockRequest(req: Request, res: Response, next: NextFunction) {
  return forwardStock(req, res, next);
}
