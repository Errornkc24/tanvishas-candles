import { Router } from "express";
import { requireAuth } from "../../middleware/require-auth.js";
import { cartController } from "./cart.controller.js";

export const cartRoutes = Router();
  cartRoutes.all("/rest/v1/cart_items", requireAuth, cartController);
