import { Router } from "express";
import { requireAuth } from "../../middleware/require-auth.js";
import { adminController } from "./admin.controller.js";

export const adminRoutes = Router();
  adminRoutes.all("/rest/v1/user_roles", requireAuth, adminController);
  adminRoutes.all("/rest/v1/rpc/store_has_owner", requireAuth, adminController);
  adminRoutes.all("/rest/v1/rpc/claim_owner", requireAuth, adminController);
  adminRoutes.all("/rest/v1/rpc/admin_dashboard_summary", requireAuth, adminController);
  adminRoutes.all("/rest/v1/rpc/admin_sales_report", requireAuth, adminController);
