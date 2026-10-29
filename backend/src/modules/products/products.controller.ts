import type { NextFunction, Request, Response } from "express";
import { handleProductsRequest } from "./products.service.js";

export function productsController(req: Request, res: Response, next: NextFunction) {
  return handleProductsRequest(req, res, next);
}
