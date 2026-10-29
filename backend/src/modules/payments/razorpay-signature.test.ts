import { createHmac } from "node:crypto";
import assert from "node:assert/strict";
import { test } from "node:test";
import { verifyRazorpaySignature } from "./razorpay-signature.js";

const signature = (orderId: string, paymentId: string, secret: string) =>
  createHmac("sha256", secret).update(`${orderId}|${paymentId}`).digest("hex");

test("accepts a valid Razorpay signature", () => {
  assert.equal(verifyRazorpaySignature("order_1", "pay_1", signature("order_1", "pay_1", "secret"), "secret"), true);
});

test("rejects a wrong secret and a malformed signature", () => {
  assert.equal(verifyRazorpaySignature("order_1", "pay_1", signature("order_1", "pay_1", "wrong"), "secret"), false);
  assert.equal(verifyRazorpaySignature("order_1", "pay_1", "bad", "secret"), false);
});
