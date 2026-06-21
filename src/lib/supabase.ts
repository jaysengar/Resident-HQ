import { createClient } from "@supabase/supabase-js";
import { Database } from "./database.types";
import { Preferences } from "@capacitor/preferences";

// Initialize Supabase client
// Note: In Vite, environment variables are prefixed with VITE_
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://placeholder-url.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "placeholder-key";

// Custom storage for Capacitor to ensure auth persists across app restarts
const capacitorStorage = {
  getItem: async (key: string): Promise<string | null> => {
    const { value } = await Preferences.get({ key });
    return value;
  },
  setItem: async (key: string, value: string): Promise<void> => {
    await Preferences.set({ key, value });
  },
  removeItem: async (key: string): Promise<void> => {
    await Preferences.remove({ key });
  },
};

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: typeof window !== "undefined" && (window as any).Capacitor?.isNative 
      ? capacitorStorage 
      : (typeof window !== "undefined" ? window.localStorage : undefined),
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

// NOTE: supabaseAdmin has been moved to src/lib/supabase-admin.server.ts
// The service role key is now server-only and never reaches the browser.
// All admin operations go through createServerFn in src/lib/api/admin.functions.ts
