import { apiPost } from "@/services/api-client";

export type PaymentOrder = {
  keyId: string;
  razorpayOrderId: string;
  amount: number;
  orderNumber: string;
  prefill: { name: string; email: string; contact: string };
};

export function createPaymentOrder(orderId: string) {
  return apiPost<PaymentOrder>("/payments/orders", { orderId });
}

export function verifyPayment(
  orderId: string,
  details: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string },
) {
  return apiPost("/payments/verify", { orderId, ...details });
}
