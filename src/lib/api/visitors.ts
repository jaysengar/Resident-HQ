import type { ActiveEntry, EntryRequest } from "@/lib/types";
import { getCurrentUserContext } from "./core";

export async function getActiveEntries(): Promise<ActiveEntry[]> {
  const { supabase } = await import("@/lib/supabase");
  const { data, error } = await supabase
    .from("visitors")
    .select("*")
    .in("status", ["pending", "approved"])
    .order("entered_at", { ascending: false });

  if (error) throw new Error(error.message);

  return data.map((d: any) => ({
    id: d.id,
    type: d.type as any,
    name: d.name,
    company: d.company || undefined,
    flatNo: d.flat_number,
    enteredAt: d.entered_at,
    phone: d.phone || undefined,
    status: d.status,
  }));
}

export async function getVisitorHistory(): Promise<ActiveEntry[]> {
  const { supabase } = await import("@/lib/supabase");
  const userCtx = await getCurrentUserContext();
  
  const { data, error } = await supabase
    .from("visitors")
    .select("*")
    .eq("society_id", userCtx.society_id)
    .eq("flat_number", userCtx.flat_no || userCtx.flat)
    .order("entered_at", { ascending: false });

  if (error) throw new Error(error.message);

  return data.map((d: any) => ({
    id: d.id,
    type: d.type as any,
    name: d.name,
    company: d.company || undefined,
    flatNo: d.flat_number,
    enteredAt: d.entered_at || d.created_at,
    phone: d.phone || undefined,
    status: d.status,
  }));
}

export async function requestEntry(
  payload: EntryRequest,
): Promise<{ status: "approved" | "denied" | "pending"; entryId: string }> {
  const { supabase } = await import("@/lib/supabase");
  const userCtx = await getCurrentUserContext();

  const { data, error } = await supabase
    .from("visitors")
    .insert({
      society_id: userCtx.society_id,
      flat_number: payload.flatNo,
      name: payload.name || payload.company || "Unknown",
      company: payload.company,
      phone: payload.phone,
      type: payload.type,
      status: "pending",
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  // Send push notification to the resident
  supabase.functions.invoke("send-notification", {
    body: {
      title: "Visitor Alert",
      body: `${payload.name} is at the gate. Please approve or deny.`,
      societyId: userCtx.society_id,
      flatNumber: payload.flatNo
    }
  }).catch(err => console.error("Push notification failed:", err));

  // Also log into notifications table for in-app panel
  supabase.from("notifications").insert({
    society_id: userCtx.society_id,
    flat_number: payload.flatNo,
    type: "visitor",
    title: "Visitor Alert",
    body: `${payload.name} is at the gate. Please approve or deny.`
  }).then();

  // Use Realtime to wait for approval
  return new Promise((resolve) => {
    // Timeout after 60s
    const timeout = setTimeout(async () => {
      supabase.removeChannel(channel);
      // Auto reject if resident doesn't respond
      await supabase.from("visitors").update({ status: "denied" }).eq("id", data.id);
      resolve({ status: "denied", entryId: data.id });
    }, 60000);

    const channel = supabase
      .channel(`visitor_status_${data.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "visitors",
          filter: `id=eq.${data.id}`,
        },
        (payload) => {
          const newStatus = payload.new.status;
          if (newStatus === "approved" || newStatus === "denied") {
            clearTimeout(timeout);
            supabase.removeChannel(channel);
            resolve({ status: newStatus, entryId: data.id });
          }
        }
      )
      .subscribe();
  });
}

export async function respondToEntry(entryId: string, status: "approved" | "denied"): Promise<{ success: boolean }> {
  const { supabase } = await import("@/lib/supabase");
  const { error } = await supabase
    .from("visitors")
    .update({ status })
    .eq("id", entryId);

  if (error) throw new Error(error.message);
  return { success: true };
}

export async function markExit(entryId: string): Promise<{ success: boolean }> {
  const { supabase } = await import("@/lib/supabase");
  const { error } = await supabase
    .from("visitors")
    .update({ status: "exited", exited_at: new Date().toISOString() })
    .eq("id", entryId);

  if (error) throw new Error(error.message);
  return { success: true };
}

export async function preApproveVisitor(payload: {
  name: string;
  type: string;
  expectedDate?: string;
}): Promise<{ code: string }> {
  const { supabase } = await import("@/lib/supabase");
  const userCtx = await getCurrentUserContext();

  const code = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code

  const { error } = await supabase.from("visitors").insert({
    society_id: userCtx.society_id,
    flat_number: userCtx.flat_no || userCtx.flat, // Support different property names
    name: payload.name,
    type: payload.type,
    status: "pre_approved",
    entry_code: code,
  });

  if (error) throw new Error(error.message);

  return { code };
}

export async function verifyEntryCode(code: string): Promise<{ success: boolean; visitor: any }> {
  const { supabase } = await import("@/lib/supabase");
  const userCtx = await getCurrentUserContext();

  // 1. Find the pre_approved visitor
  const { data, error } = await supabase
    .from("visitors")
    .select("*")
    .eq("society_id", userCtx.society_id)
    .eq("entry_code", code)
    .eq("status", "pre_approved")
    .single();

  if (error || !data) {
    throw new Error("Invalid or expired entry code");
  }

  // 2. Update status to approved
  const { error: updateError } = await supabase
    .from("visitors")
    .update({ status: "approved", entered_at: new Date().toISOString() })
    .eq("id", data.id);

  if (updateError) throw new Error("Failed to approve entry");

  return { success: true, visitor: data };
}
