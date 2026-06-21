import { getCurrentUserContext } from "./core";

export interface DirectMessage {
  id: string;
  society_id: string;
  flat_number: string;
  sender_id: string;
  sender_role: "resident" | "manager";
  content: string;
  created_at: string;
}

export async function getDirectMessages(): Promise<DirectMessage[]> {
  const { supabase } = await import("@/lib/supabase");
  const userCtx = await getCurrentUserContext();

  const { data, error } = await supabase
    .from("direct_messages")
    .select("*")
    .eq("society_id", userCtx.society_id)
    .eq("flat_number", userCtx.flat_no || userCtx.flat) // Fallback for diff objects
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return data as DirectMessage[];
}

export async function sendDirectMessage(content: string): Promise<DirectMessage> {
  const { supabase } = await import("@/lib/supabase");
  const userCtx = await getCurrentUserContext();

  const { data, error } = await supabase
    .from("direct_messages")
    .insert({
      society_id: userCtx.society_id,
      flat_number: userCtx.flat_no || userCtx.flat,
      sender_id: userCtx.id,
      sender_role: userCtx.role,
      content,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as DirectMessage;
}
