import type { NextFunction, Request, Response } from "express";
import { z } from "zod";

export const productsResources = ["/products"] as const;

const productFields = {
  name: z.string().trim().min(1),
  slug: z.string().trim().min(1).max(80),
  short_description: z.string().nullable(),
  description: z.string().nullable(),
  scent_notes: z.array(z.string()),
  burn_time: z.string().nullable(),
  size: z.string().nullable(),
  price: z.number().finite().nonnegative(),
  category_id: z.string().uuid().nullable(),
  images: z.array(z.string()),
  low_stock_threshold: z.number().int().nonnegative(),
  featured: z.boolean(),
  bestseller: z.boolean(),
  archived: z.boolean(),
};

const createProductSchema = z.object(productFields).strict();
const updateProductSchema = z.object(productFields).partial().strict();

export function validateProductMutation(req: Request, _res: Response, next: NextFunction) {
  if (req.method !== "POST" && req.method !== "PATCH" && req.method !== "PUT") return next();
  try {
    const raw = Buffer.isBuffer(req.body) ? req.body.toString("utf8") : "";
    const body = JSON.parse(raw) as unknown;
    const schema = req.method === "POST" ? createProductSchema : updateProductSchema;
    req.body = Buffer.from(JSON.stringify(schema.parse(body)));
    next();
  } catch (error) {
    next(error);
  }
}
