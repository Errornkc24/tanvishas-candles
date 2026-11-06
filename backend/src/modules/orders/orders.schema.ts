import { z } from "zod";

export const ordersResources = ["/orders", "/order_items", "/order_status_history", "/rpc/place_order", "/rpc/cancel_order", "/rpc/admin_update_order"] as const;

const indianPhone = z.string().trim().regex(/^[6-9]\d{9}$/);

export const placeOrderBodySchema = z.object({
  _items: z.array(z.object({
    product_id: z.string().uuid(),
    quantity: z.number().int().min(1).max(50),
  }).strict()).min(1),
  _address: z.object({
    full_name: z.string().trim().min(2).max(100),
    phone: indianPhone,
    line1: z.string().trim().min(5).max(300),
    landmark: z.string().trim().max(120).optional().nullable(),
    city: z.string().trim().min(2).max(80),
    state: z.string().trim().min(2).max(80),
    pincode: z.string().trim().regex(/^\d{6}$/),
  }).strict(),
  _contact: z.object({
    first_name: z.string().trim().min(1).max(60),
    last_name: z.string().trim().min(1).max(60),
    email: z.string().trim().email().max(255),
    phone: indianPhone,
    instagram: z.string().trim().max(60).optional().default(""),
  }).strict(),
}).strict();
