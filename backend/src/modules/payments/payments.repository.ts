import { supabaseAdmin } from "../../lib/supabase.js";

export async function getOrderForPayment(orderId: string) {
  return supabaseAdmin.from("orders")
    .select("id,user_id,order_number,total,status,payment_status,contact,razorpay_order_id")
    .eq("id", orderId).maybeSingle();
}

export async function setRazorpayOrderId(orderId: string, razorpayOrderId: string) {
  return supabaseAdmin.from("orders").update({ razorpay_order_id: razorpayOrderId }).eq("id", orderId);
}

export async function markOrderPaid(orderId: string, paymentId: string, paidAt: string) {
  return supabaseAdmin.from("orders").update({
    payment_method: "online",
    payment_status: "paid",
    razorpay_payment_id: paymentId,
    paid_at: paidAt,
    updated_at: paidAt,
  }).eq("id", orderId).neq("payment_status", "paid");
}
