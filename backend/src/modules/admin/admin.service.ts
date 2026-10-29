import type { NextFunction, Request, Response } from "express";
import { forwardAdmin } from "./admin.repository.js";

export function handleAdminRequest(req: Request, res: Response, next: NextFunction) {
  return forwardAdmin(req, res, next);
}
