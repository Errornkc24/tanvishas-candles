import { z } from "zod";

export const createPaymentOrderSchema = z.object({ orderId: z.string().uuid() });
export const verifyPaymentSchema = z.object({
  orderId: z.string().uuid(),
  razorpay_order_id: z.string().min(1).max(100),
  razorpay_payment_id: z.string().min(1).max(100),
  razorpay_signature: z.string().min(1).max(200),
});
