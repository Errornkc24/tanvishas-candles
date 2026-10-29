import { Router } from "express";
import { requireAuth } from "../../middleware/require-auth.js";
import { salesOrdersController } from "./sales.controller.js";

export const salesRoutes = Router();
salesRoutes.get("/orders", requireAuth, salesOrdersController);
