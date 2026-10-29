import type { NextFunction, Request, Response } from "express";
import { createPaymentOrder, verifyPayment } from "./payments.service.js";
import { createPaymentOrderSchema, verifyPaymentSchema } from "./payments.schema.js";

export async function createPaymentOrderController(req: Request, res: Response, next: NextFunction) {
  try {
    const { orderId } = createPaymentOrderSchema.parse(req.body);
    res.json(await createPaymentOrder(orderId, req.userId!));
  } catch (error) { next(error); }
}

export async function verifyPaymentController(req: Request, res: Response, next: NextFunction) {
  try {
    const body = verifyPaymentSchema.parse(req.body);
    res.json(await verifyPayment(body, req.userId!));
  } catch (error) { next(error); }
}
