import type { NextFunction, Request, Response } from "express";
import { z } from "zod";

export const categoriesResources = ["/categories"] as const;

const createCategorySchema = z.object({
  name: z.string().trim().min(1).max(80),
  slug: z.string().trim().min(1).max(80).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  sort: z.number().int().nonnegative(),
}).strict();
const updateCategorySchema = z.object({ name: z.string().trim().min(1).max(80) }).strict();

export function validateCategoryMutation(req: Request, _res: Response, next: NextFunction) {
  if (req.method !== "POST" && req.method !== "PATCH" && req.method !== "PUT") return next();
  try {
    const raw = Buffer.isBuffer(req.body) ? req.body.toString("utf8") : "";
    const body = JSON.parse(raw) as unknown;
    const schema = req.method === "POST" ? createCategorySchema : updateCategorySchema;
    req.body = Buffer.from(JSON.stringify(schema.parse(body)));
    next();
  } catch (error) {
    next(error);
  }
}
