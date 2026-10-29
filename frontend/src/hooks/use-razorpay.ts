import { createPaymentOrder, verifyPayment } from "@/services/payments.service";

declare global {
  interface Window {
    Razorpay?: new (options: {
      key: string;
      order_id: string;
      amount: number;
      currency: string;
      name: string;
      description: string;
      image: string;
      prefill: { name: string; email: string; contact: string };
      theme: { color: string };
      handler: (response: {
        razorpay_order_id: string;
        razorpay_payment_id: string;
        razorpay_signature: string;
      }) => void;
      modal: { ondismiss: () => void };
    }) => {
      on: (event: string, callback: () => void) => void;
      open: () => void;
    };
  }
}

function loadScript() {
  return new Promise<boolean>((resolve) => {
    if (window.Razorpay) return resolve(true);
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

/** Opens Razorpay for an existing order. Resolves "paid", "dismissed", or throws. */
export function useRazorpay() {
  return async (orderId: string): Promise<"paid" | "dismissed"> => {
    if (!(await loadScript()))
      throw new Error("Couldn't load the payment window. Check your connection.");
    const rp = await createPaymentOrder(orderId);
    return new Promise((resolve, reject) => {
      const Razorpay = window.Razorpay;
      if (!Razorpay) {
        reject(new Error("Payment window is unavailable."));
        return;
      }
      const checkout = new Razorpay({
        key: rp.keyId,
        order_id: rp.razorpayOrderId,
        amount: rp.amount,
        currency: "INR",
        name: "Tanvishas Candles",
        description: `Order #${rp.orderNumber}`,
        image: `${window.location.origin}/images/logo.webp`,
        prefill: rp.prefill,
        theme: { color: "#d4a24c" },
        handler: async (r: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          try {
            await verifyPayment(orderId, r);
            resolve("paid");
          } catch (e) {
            reject(e);
          }
        },
        modal: { ondismiss: () => resolve("dismissed") },
      });
      checkout.on("payment.failed", () => {});
      checkout.open();
    });
  };
}
