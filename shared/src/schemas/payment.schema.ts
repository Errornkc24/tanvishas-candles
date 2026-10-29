export type CreatePaymentOrderRequest = { orderId: string };
export type VerifyPaymentRequest = {
  orderId: string;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};
