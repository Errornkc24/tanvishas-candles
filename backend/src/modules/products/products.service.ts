import type { NextFunction, Request, Response } from "express";
import { forwardProducts } from "./products.repository.js";

export function handleProductsRequest(req: Request, res: Response, next: NextFunction) {
  return forwardProducts(req, res, next);
}
