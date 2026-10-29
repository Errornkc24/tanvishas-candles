import type { NextFunction, Request, Response } from "express";
import { handleCartRequest } from "./cart.service.js";

export function cartController(req: Request, res: Response, next: NextFunction) {
  return handleCartRequest(req, res, next);
}
