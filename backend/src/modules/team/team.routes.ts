import { Router } from "express";
import { requireAuth } from "../../middleware/require-auth.js";
import { teamController } from "./team.controller.js";

export const teamRoutes = Router();
  teamRoutes.all("/rest/v1/rpc/admin_team", requireAuth, teamController);
  teamRoutes.all("/rest/v1/rpc/admin_set_role", requireAuth, teamController);
