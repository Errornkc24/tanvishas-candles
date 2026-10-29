import type { NextFunction, Request, Response } from "express";
import { handleTeamRequest } from "./team.service.js";

export function teamController(req: Request, res: Response, next: NextFunction) {
  return handleTeamRequest(req, res, next);
}
