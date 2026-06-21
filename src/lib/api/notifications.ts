import { getCurrentUserContext } from "./core";

export async function getVisitorLog(): Promise<any[]> {
  const { supabase } = await import("@/lib/supabase");
  const userCtx = await getCurrentUserContext();
  
  let query = supabase
    .from("notifications")
    .select("*")
    .eq("society_id", userCtx.society_id)
    .order("created_at", { ascending: false })
    .limit(50);
    
  if (userCtx.flat_no) {
    query = query.or(`flat_number.eq.${userCtx.flat_no},flat_number.is.null`);
  } else {
    query = query.is("flat_number", null);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data || [];
}

export async function getNotifications(): Promise<any[]> {
  const { supabase } = await import("@/lib/supabase");
  const userCtx = await getCurrentUserContext();
  
  let query = supabase
    .from("notifications")
    .select("*")
    .eq("society_id", userCtx.society_id)
    .order("created_at", { ascending: false })
    .limit(50);

  if (userCtx.flat_no) {
    // If they have a flat, show flat-specific + society-wide
    query = query.or(`flat_number.eq.${userCtx.flat_no},flat_number.is.null`);
  } else {
    // If manager, maybe show society-wide, or maybe don't filter by flat_number at all?
    // Let's show all notifications for managers
    // actually, let's just not filter by flat_number
  }

  const { data, error } = await query;
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
  const userCtx = await getCurrentUserContext();

  let query = supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("society_id", userCtx.society_id)
    .eq("is_read", false);
    
  if (userCtx.flat_no) {
    query = query.eq("flat_number", userCtx.flat_no);
  }

  const { error } = await query;

  if (error) throw new Error(error.message);
  return { success: true };
}
