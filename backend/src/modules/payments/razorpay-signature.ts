import { createHmac, timingSafeEqual } from "node:crypto";

export function verifyRazorpaySignature(orderId: string, paymentId: string, signature: string, secret: string) {
  const expected = createHmac("sha256", secret).update(`${orderId}|${paymentId}`).digest();
  const received = Buffer.from(signature, "hex");
  return expected.length === received.length && timingSafeEqual(expected, received);
}
