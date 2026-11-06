import type { NextFunction, Request, Response } from "express";
import { z } from "zod";

export const accountResources = ["/profiles", "/addresses", "/rpc/set_default_address"] as const;

const phone = z.string().trim().regex(/^[6-9]\d{9}$/);
const addressFields = {
  full_name: z.string().trim().min(2).max(100),
  phone,
  line1: z.string().trim().min(5).max(300),
  landmark: z.string().trim().max(120).optional().nullable(),
  city: z.string().trim().min(2).max(80),
  state: z.string().trim().min(2).max(80),
  pincode: z.string().trim().regex(/^\d{6}$/),
};

const addressCreateSchema = z.object({
  ...addressFields,
  user_id: z.string().uuid(),
  is_default: z.boolean().optional(),
}).strict();
const addressUpdateSchema = z.object(addressFields).partial().strict();
const profileUpdateSchema = z.object({
  first_name: z.string().trim().max(60).nullable().optional(),
  last_name: z.string().trim().max(60).nullable().optional(),
  phone: z.union([phone, z.literal("")]).nullable().optional(),
  instagram: z.string().trim().max(60).nullable().optional(),
}).strict();

function parseJsonBody(req: Request) {
  const raw = Buffer.isBuffer(req.body) ? req.body.toString("utf8") : "";
  return JSON.parse(raw) as unknown;
}

function applySchema(req: Request, next: NextFunction, schema: z.ZodType) {
  try {
    req.body = Buffer.from(JSON.stringify(schema.parse(parseJsonBody(req))));
    next();
  } catch (error) {
    next(error);
  }
}

export function validateProfileMutation(req: Request, _res: Response, next: NextFunction) {
  if (req.method !== "PATCH" && req.method !== "POST") return next();
  applySchema(req, next, profileUpdateSchema);
}

export function validateAddressMutation(req: Request, _res: Response, next: NextFunction) {
  if (req.method !== "PATCH" && req.method !== "POST") return next();
  applySchema(req, next, req.method === "POST" ? addressCreateSchema : addressUpdateSchema);
}
