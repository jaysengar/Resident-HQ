import { getCurrentUserContext } from "./core";

export async function getSocietySettings(): Promise<{ razorpay_key_id: string; razorpay_key_secret: string } | null> {
  const { supabase } = await import("@/lib/supabase");
  const userCtx = await getCurrentUserContext();
  if (userCtx.role !== "manager") throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("society_settings")
    .select("razorpay_key_id, razorpay_key_secret")
    .eq("society_id", userCtx.society_id)
    .single();

  if (error && error.code !== "PGRST116") {
    console.error("Failed to fetch society settings", error);
    return null;
  }
  return data;
}

export async function updateSocietySettings(settings: { razorpay_key_id: string; razorpay_key_secret: string }): Promise<void> {
  const { supabase } = await import("@/lib/supabase");
  const userCtx = await getCurrentUserContext();
  if (userCtx.role !== "manager") throw new Error("Unauthorized");

  const { error } = await supabase
    .from("society_settings")
    .upsert({
      society_id: userCtx.society_id,
      razorpay_key_id: settings.razorpay_key_id,
      razorpay_key_secret: settings.razorpay_key_secret,
      updated_at: new Date().toISOString(),
    });

  if (error) throw new Error(error.message);
}

export interface SocietyBranding {
  logo_url?: string;
  banner_url?: string;
  tagline?: string;
  primary_color?: string;
  secondary_color?: string;
  society_photos?: string[];
  contact_phone?: string;
  contact_email?: string;
}

export async function getSocietyBranding(slug: string): Promise<{
  society: { id: string; name: string; slug: string; address: string; plan: string; logo_url: string; primary_color: string };
  branding: SocietyBranding | null;
} | null> {
  const { supabase } = await import("@/lib/supabase");

  const { data: society, error: socError } = await supabase
    .from("societies")
    .select("id, name, slug, address, plan, logo_url, primary_color")
    .eq("slug", slug)
    .single();

  if (socError || !society) return null;

  const { data: branding } = await supabase
    .from("society_settings")
    .select("logo_url, banner_url, tagline, primary_color, secondary_color, society_photos, contact_phone, contact_email")
    .eq("society_id", society.id)
    .single();

  return { society, branding: branding as SocietyBranding | null };
}

export async function getManagerBranding(): Promise<SocietyBranding | null> {
  const { supabase } = await import("@/lib/supabase");
  const userCtx = await getCurrentUserContext();
  if (userCtx.role !== "manager") throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("society_settings")
    .select("logo_url, banner_url, tagline, primary_color, secondary_color, society_photos, contact_phone, contact_email")
    .eq("society_id", userCtx.society_id)
    .single();

  if (error && error.code !== "PGRST116") return null;
  return data as SocietyBranding | null;
}

export async function updateSocietyBranding(branding: SocietyBranding): Promise<void> {
  const { supabase } = await import("@/lib/supabase");
  const userCtx = await getCurrentUserContext();
  if (userCtx.role !== "manager") throw new Error("Unauthorized");

  const { error } = await supabase
    .from("society_settings")
    .upsert({
      society_id: userCtx.society_id,
      ...branding,
      updated_at: new Date().toISOString(),
    });

  if (error) throw new Error(error.message);
}

export async function getSocietyPlan(): Promise<{ plan: string; subscription_expires_at: string | null; id: string }> {
  const { supabase } = await import("@/lib/supabase");
  const userCtx = await getCurrentUserContext();

  const { data } = await supabase
    .from("societies")
    .select("id, plan, subscription_expires_at")
    .eq("id", userCtx.society_id)
    .single();

  return {
    id: data?.id || userCtx.society_id,
    plan: data?.plan || "basic",
    subscription_expires_at: data?.subscription_expires_at || null,
  };
}
