import { supabaseAdmin } from "../../lib/supabase.js";

export async function getOrderForPayment(orderId: string) {
  return supabaseAdmin.from("orders")
    .select("id,user_id,order_number,total,status,payment_status,contact,razorpay_order_id")
    .eq("id", orderId).maybeSingle();
}

export async function setRazorpayOrderId(orderId: string, razorpayOrderId: string) {
  return supabaseAdmin.rpc("backend_set_razorpay_order", {
    _order_id: orderId,
    _razorpay_order_id: razorpayOrderId,
  });
}

export async function markOrderPaid(
  orderId: string,
  razorpayOrderId: string,
  paymentId: string,
  paidAt: string,
) {
  return supabaseAdmin.rpc("backend_mark_order_paid", {
    _order_id: orderId,
    _razorpay_order_id: razorpayOrderId,
    _payment_id: paymentId,
    _paid_at: paidAt,
  });
}
