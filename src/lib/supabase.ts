import { createClient } from "@supabase/supabase-js";
import { Database } from "./database.types";

// Initialize Supabase client
// Note: In Vite, environment variables are prefixed with VITE_
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://placeholder-url.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "placeholder-key";

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// NOTE: supabaseAdmin has been moved to src/lib/supabase-admin.server.ts
// The service role key is now server-only and never reaches the browser.
// All admin operations go through createServerFn in src/lib/api/admin.functions.ts
