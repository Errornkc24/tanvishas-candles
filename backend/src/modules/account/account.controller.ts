import type { NextFunction, Request, Response } from "express";
import { handleAccountRequest } from "./account.service.js";

export function accountController(req: Request, res: Response, next: NextFunction) {
  return handleAccountRequest(req, res, next);
}
