import type { NextFunction, Request, Response } from "express";
import { forwardCart } from "./cart.repository.js";

export function handleCartRequest(req: Request, res: Response, next: NextFunction) {
  return forwardCart(req, res, next);
}
