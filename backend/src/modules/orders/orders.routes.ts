import { Router, type NextFunction, type Request, type Response } from "express";
import { requireAuth } from "../../middleware/require-auth.js";
import { ordersController } from "./orders.controller.js";
import { placeOrderBodySchema } from "./orders.schema.js";

export const ordersRoutes = Router();
ordersRoutes.all("/rest/v1/orders", requireAuth, ordersController);
ordersRoutes.all("/rest/v1/order_items", requireAuth, ordersController);
ordersRoutes.all("/rest/v1/order_status_history", requireAuth, ordersController);
ordersRoutes.post("/rest/v1/rpc/place_order", requireAuth, validatePlaceOrder, ordersController);
ordersRoutes.all("/rest/v1/rpc/cancel_order", requireAuth, ordersController);
ordersRoutes.all("/rest/v1/rpc/admin_update_order", requireAuth, ordersController);

function validatePlaceOrder(req: Request, _res: Response, next: NextFunction) {
  try {
    const raw = Buffer.isBuffer(req.body) ? req.body.toString("utf8") : "";
    req.body = Buffer.from(JSON.stringify(placeOrderBodySchema.parse(JSON.parse(raw))));
    next();
  } catch (error) {
    next(error);
  }
}
