import type { NextFunction, Request, Response } from "express";
import { handleCategoriesRequest } from "./categories.service.js";

export function categoriesController(req: Request, res: Response, next: NextFunction) {
  return handleCategoriesRequest(req, res, next);
}
