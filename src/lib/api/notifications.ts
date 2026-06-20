import { getCurrentUserContext } from "./core";

export async function getVisitorLog(): Promise<any[]> {
  const { supabase } = await import("@/lib/supabase");
  const userCtx = await getCurrentUserContext();
  
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("society_id", userCtx.society_id)
    .or(`flat_number.eq.${userCtx.flat_no},flat_number.is.null`)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) throw new Error(error.message);
  return data || [];
}

export async function getNotifications(): Promise<any[]> {
  const { supabase } = await import("@/lib/supabase");
  const userCtx = await getCurrentUserContext();
  
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("society_id", userCtx.society_id)
    .or(`flat_number.eq.${userCtx.flat_no},flat_number.is.null`)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) throw new Error(error.message);
  return data || [];
}

export async function markNotificationRead(notificationId: string) {
  const { supabase } = await import("@/lib/supabase");

  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", notificationId);

  if (error) throw new Error(error.message);
  return { success: true };
}

export async function markAllNotificationsRead() {
  const { supabase } = await import("@/lib/supabase");
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("user_id", user.id)
    .eq("is_read", false);

  if (error) throw new Error(error.message);
  return { success: true };
}
