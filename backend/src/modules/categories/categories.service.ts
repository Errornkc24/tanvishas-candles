import type { NextFunction, Request, Response } from "express";
import { forwardCategories } from "./categories.repository.js";

export function handleCategoriesRequest(req: Request, res: Response, next: NextFunction) {
  return forwardCategories(req, res, next);
}
