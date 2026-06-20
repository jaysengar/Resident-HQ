import { getCurrentUserContext } from "./core";

export async function triggerEmergency(): Promise<{ success: boolean; emergencyId: string }> {
  const { supabase } = await import("@/lib/supabase");
  const userCtx = await getCurrentUserContext();

  const { data, error } = await supabase
    .from("emergencies")
    .insert({
      society_id: userCtx.society_id,
      flat_number: userCtx.flat_no || userCtx.flat,
      user_id: userCtx.id,
      status: "active",
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);
  return { success: true, emergencyId: data.id };
}
