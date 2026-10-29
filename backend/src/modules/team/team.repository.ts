import { forwardSupabaseRest } from "../../lib/supabase-rest.repository.js";
import type { NextFunction, Request, Response } from "express";
import { teamResources } from "./team.schema.js";

export function forwardTeam(req: Request, res: Response, next: NextFunction) {
  return forwardSupabaseRest(req, res, next, teamResources);
}
