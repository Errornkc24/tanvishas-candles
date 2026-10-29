import { createClient } from "@supabase/supabase-js";
import type { Database } from "../../../shared/src/database.types.js";
import { env } from "../config/env.js";

export const supabaseAuth = createClient<Database>(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

export const supabaseAdmin = createClient<Database>(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});
