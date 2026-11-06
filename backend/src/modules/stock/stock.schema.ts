import type { NextFunction, Request, Response } from "express";
import { z } from "zod";

export const stockResources = ["/stock_adjustments", "/rpc/admin_adjust_stock"] as const;

const stockAdjustmentSchema = z.object({
  _product_id: z.string().uuid(),
  _change: z.number().int().refine((value) => value !== 0),
  _reason: z.enum(["initial", "restock", "returned", "correction", "damaged", "lost", "gifted"]),
  _note: z.string().max(500).optional(),
}).strict();

export function validateStockAdjustment(req: Request, _res: Response, next: NextFunction) {
  if (req.method !== "POST") return next();
  try {
    const raw = Buffer.isBuffer(req.body) ? req.body.toString("utf8") : "";
    req.body = Buffer.from(JSON.stringify(stockAdjustmentSchema.parse(JSON.parse(raw))));
    next();
  } catch (error) {
    next(error);
  }
}
