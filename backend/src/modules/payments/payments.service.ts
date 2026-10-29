import { env } from "../../config/env.js";
import { getOrderForPayment, markOrderPaid, setRazorpayOrderId } from "./payments.repository.js";
import { verifyRazorpaySignature } from "./razorpay-signature.js";

type Contact = { first_name?: string; last_name?: string; email?: string; phone?: string };

function paymentCredentials() {
  if (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET) {
    throw new Error("Online payments are not configured. Choose Cash on Delivery.");
  }
  return { id: env.RAZORPAY_KEY_ID, secret: env.RAZORPAY_KEY_SECRET };
}

async function getPayableOrder(orderId: string, userId: string) {
  const { data: order, error } = await getOrderForPayment(orderId);
  if (error) throw new Error("Could not load the order");
  if (!order || order.user_id !== userId) throw new Error("Order not found");
  if (order.status === "cancelled") throw new Error("This order was cancelled");
  if (order.payment_status === "paid") throw new Error("This order is already paid");
  return order;
}

export async function createPaymentOrder(orderId: string, userId: string) {
  const { id, secret } = paymentCredentials();
  const order = await getPayableOrder(orderId, userId);
  const response = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString("base64")}`,
    },
    body: JSON.stringify({
      amount: Math.round(Number(order.total) * 100),
      currency: "INR",
      receipt: order.order_number,
      notes: { order_id: order.id },
    }),
  });
  if (!response.ok) {
    console.error("Razorpay order API failed", response.status, await response.text());
    throw new Error("Could not start the payment. Please try again.");
  }

  const razorpayOrder = (await response.json()) as { id: string; amount: number };
  const { error } = await setRazorpayOrderId(order.id, razorpayOrder.id);
  if (error) throw new Error("Could not save the payment reference");

  const contact = (order.contact ?? {}) as Contact;
  return {
    keyId: id,
    razorpayOrderId: razorpayOrder.id,
    amount: razorpayOrder.amount,
    orderNumber: order.order_number,
    prefill: {
      name: [contact.first_name, contact.last_name].filter(Boolean).join(" "),
      email: contact.email ?? "",
      contact: contact.phone ?? "",
    },
  };
}

export async function verifyPayment(input: {
  orderId: string;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}, userId: string) {
  const { secret } = paymentCredentials();
  const { data: order, error } = await getOrderForPayment(input.orderId);
  if (error) throw new Error("Could not verify the order");
  if (!order || order.user_id !== userId) throw new Error("Order not found");
  if (order.status === "cancelled") throw new Error("This order was cancelled");
  if (order.payment_status === "paid") return { ok: true };
  if (order.razorpay_order_id !== input.razorpay_order_id) throw new Error("Payment does not match this order");

  if (!verifyRazorpaySignature(input.razorpay_order_id, input.razorpay_payment_id, input.razorpay_signature, secret)) {
    throw new Error("Payment could not be verified");
  }

  const { error: updateError } = await markOrderPaid(order.id, input.razorpay_payment_id, new Date().toISOString());
  if (updateError) throw new Error("Payment was verified but the order update failed");
  return { ok: true };
}
