import { Router } from "express";
import { requireAuth } from "../../middleware/require-auth.js";
import { accountController } from "./account.controller.js";

export const accountRoutes = Router();
  accountRoutes.all("/rest/v1/profiles", requireAuth, accountController);
  accountRoutes.all("/rest/v1/addresses", requireAuth, accountController);
