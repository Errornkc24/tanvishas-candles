import type { NextFunction, Request, Response } from "express";
import { forwardAccount } from "./account.repository.js";

export function handleAccountRequest(req: Request, res: Response, next: NextFunction) {
  return forwardAccount(req, res, next);
}
