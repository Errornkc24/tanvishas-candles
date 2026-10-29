import type { NextFunction, Request, Response } from "express";
import { handleAdminRequest } from "./admin.service.js";

export function adminController(req: Request, res: Response, next: NextFunction) {
  return handleAdminRequest(req, res, next);
}
