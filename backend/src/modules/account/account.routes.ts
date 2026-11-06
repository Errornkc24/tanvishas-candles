import { Router } from "express";
import { requireAuth } from "../../middleware/require-auth.js";
import { validateAddressMutation, validateProfileMutation } from "./account.schema.js";
import { accountController } from "./account.controller.js";

export const accountRoutes = Router();
accountRoutes.all("/rest/v1/profiles", requireAuth, validateProfileMutation, accountController);
accountRoutes.all("/rest/v1/addresses", requireAuth, validateAddressMutation, accountController);
accountRoutes.all("/rest/v1/rpc/set_default_address", requireAuth, accountController);
