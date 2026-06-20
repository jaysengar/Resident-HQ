import { getCurrentUserContext } from "./core";

export async function submitNocRequest(type: "Move-In" | "Move-Out", moving_date: string, reason: string): Promise<{ success: boolean; id?: string }> {
  const { supabase } = await import("@/lib/supabase");
  const userCtx = await getCurrentUserContext();

  const { data, error } = await supabase
    .from("noc_requests")
    .insert({
      society_id: userCtx.society_id,
      user_id: userCtx.id,
      flat_number: userCtx.flat_no || userCtx.flat,
      type,
      moving_date,
      reason,
      status: "Pending"
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);
  return { success: true, id: data.id };
}

export async function getNocRequests(): Promise<any[]> {
  const { supabase } = await import("@/lib/supabase");
  const userCtx = await getCurrentUserContext();

  let query = supabase
    .from("noc_requests")
    .select(`
      *,
      users!noc_requests_user_id_fkey(name, phone)
    `)
    .eq("society_id", userCtx.society_id)
    .order("created_at", { ascending: false });

  // Residents only see their own
  if (userCtx.role === "resident") {
    query = query.eq("user_id", userCtx.id);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  return data.map((n: any) => ({
    ...n,
    user_name: n.users?.name,
    user_phone: n.users?.phone,
  }));
}

export async function updateNocStatus(id: string, status: "Approved" | "Rejected", admin_notes?: string): Promise<{ success: boolean }> {
  const { supabase } = await import("@/lib/supabase");
  
  const { error } = await supabase
    .from("noc_requests")
    .update({ 
      status, 
      admin_notes,
      updated_at: new Date().toISOString()
    })
    .eq("id", id);

  if (error) throw new Error(error.message);
  return { success: true };
}
