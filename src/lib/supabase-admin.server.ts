import { createClient } from "@supabase/supabase-js";
import { Database } from "./database.types";
import process from "node:process";

// Server-only Supabase Admin client.
// The .server.ts suffix prevents Vite from bundling this into the client.
// The Service Role Key NEVER reaches the browser.

let adminClient: ReturnType<typeof createClient<Database>> | null = null;

export function getSupabaseAdmin() {
  if (adminClient) return adminClient;

  const url = process.env.VITE_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      "Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in server environment.",
    );
  }

  adminClient = createClient<Database>(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });

  return adminClient;
}
