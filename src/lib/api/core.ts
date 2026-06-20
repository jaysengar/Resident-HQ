// ─── Core Utilities & Context ───

/** Sanitize text input — trim whitespace, collapse multiple spaces */
export function sanitize(text: string): string {
  return text.trim().replace(/\s+/g, " ");
}

/** Validate 10-digit Indian phone number */
export function validatePhone(phone: string): string {
  const cleaned = phone.replace(/[\s\-()]/g, "");
  if (!/^\d{10}$/.test(cleaned)) throw new Error("Phone number must be exactly 10 digits.");
  return cleaned;
}

/** Validate 12-digit Aadhaar number */
export function validateAadhaar(aadhaar: string): string {
  const cleaned = aadhaar.replace(/[\s\-]/g, "");
  if (!/^\d{12}$/.test(cleaned)) throw new Error("Aadhaar number must be exactly 12 digits.");
  return cleaned;
}

export async function getCurrentUserContext() {
  const { supabase } = await import("@/lib/supabase");
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not logged in");

  const { data: userData, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error || !userData) throw new Error("User profile not found");
  return userData;
}
