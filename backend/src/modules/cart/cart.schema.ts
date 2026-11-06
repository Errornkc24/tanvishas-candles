import type { NextFunction, Request, Response } from "express";
import { z } from "zod";

export const cartResources = ["/cart_items"] as const;

const cartItemSchema = z.object({
  user_id: z.string().uuid(),
  product_id: z.string().uuid(),
  quantity: z.number().int().min(1).max(50),
}).strict();

export function validateCartMutation(req: Request, _res: Response, next: NextFunction) {
  if (req.method !== "POST" && req.method !== "PATCH" && req.method !== "PUT") return next();
  try {
    const raw = Buffer.isBuffer(req.body) ? req.body.toString("utf8") : "";
    const body = JSON.parse(raw) as unknown;
    const validated = Array.isArray(body)
      ? z.array(cartItemSchema).min(1).parse(body)
      : cartItemSchema.parse(body);
    req.body = Buffer.from(JSON.stringify(validated));
    next();
  } catch (error) {
    next(error);
  }
}
