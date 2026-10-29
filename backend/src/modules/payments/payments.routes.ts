import { Router } from "express";
import { requireAuth } from "../../middleware/require-auth.js";
import { createPaymentOrderController, verifyPaymentController } from "./payments.controller.js";

export const paymentRoutes = Router();
paymentRoutes.post("/orders", requireAuth, createPaymentOrderController);
paymentRoutes.post("/verify", requireAuth, verifyPaymentController);
