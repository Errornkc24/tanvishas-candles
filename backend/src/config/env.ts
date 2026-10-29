import { z } from "zod";

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3001),
  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  RAZORPAY_KEY_ID: z.string().optional(),
  RAZORPAY_KEY_SECRET: z.string().optional(),
  CORS_ORIGIN: z.string().optional(),
});

const result = schema.safeParse(process.env);
if (!result.success) {
  const missing = result.error.issues.map((issue) => issue.path.join(".")).join(", ");
  throw new Error(`Backend environment configuration is invalid. Check: ${missing}`);
}

export const env = result.data;
export const corsOrigins = (env.CORS_ORIGIN ?? "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
