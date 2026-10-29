import type { NextFunction, Request, Response } from "express";
import { forwardTeam } from "./team.repository.js";

export function handleTeamRequest(req: Request, res: Response, next: NextFunction) {
  return forwardTeam(req, res, next);
}
