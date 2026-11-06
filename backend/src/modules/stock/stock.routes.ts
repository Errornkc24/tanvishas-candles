import { Router } from "express";
import { requireAuth } from "../../middleware/require-auth.js";
import { stockController } from "./stock.controller.js";
import { validateStockAdjustment } from "./stock.schema.js";

export const stockRoutes = Router();
  stockRoutes.all("/rest/v1/stock_adjustments", requireAuth, stockController);
  stockRoutes.all(
    "/rest/v1/rpc/admin_adjust_stock",
    requireAuth,
    validateStockAdjustment,
    stockController,
  );
