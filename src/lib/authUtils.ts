// ─── DEPRECATED ───
// This file is no longer used. Account creation has been moved to server functions
// in src/lib/api/admin.functions.ts to keep the service role key server-side.
// Keeping this file for reference only — it can be safely deleted.

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://placeholder-url.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "placeholder-key";

// Secondary client for creating users without signing out the current logged-in user
export const createUserClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export async function createAccount(
  email: string,
  password: string,
  role: string,
  name: string,
  societyId: string,
  flatNo?: string,
) {
  const { supabaseAdmin } = await import("@/lib/supabase");

  // 1. Create the user in Supabase Auth using Admin API to bypass rate limits
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      name,
      role,
    },
  });

  if (authError) throw authError;
  if (!authData.user) throw new Error("Failed to create user account");

  // 2. Insert into our custom users table using supabaseAdmin to bypass RLS
  // (Manager cannot insert for others under current RLS policies)
  const { error: dbError } = await supabaseAdmin.from("users").insert({
    id: authData.user.id,
    society_id: societyId,
    role,
    name,
    phone: "",
    flat_no: flatNo,
  });

  if (dbError) throw dbError;

  return authData.user;
}
