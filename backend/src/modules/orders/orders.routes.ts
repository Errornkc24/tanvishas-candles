import { Router } from "express";
import { requireAuth } from "../../middleware/require-auth.js";
import { ordersController } from "./orders.controller.js";

export const ordersRoutes = Router();
  ordersRoutes.all("/rest/v1/orders", requireAuth, ordersController);
  ordersRoutes.all("/rest/v1/order_items", requireAuth, ordersController);
  ordersRoutes.all("/rest/v1/order_status_history", requireAuth, ordersController);
  ordersRoutes.all("/rest/v1/rpc/place_order", requireAuth, ordersController);
  ordersRoutes.all("/rest/v1/rpc/cancel_order", requireAuth, ordersController);
  ordersRoutes.all("/rest/v1/rpc/admin_update_order", requireAuth, ordersController);
