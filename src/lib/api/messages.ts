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

export async function sendDirectMessage(content: string, targetFlat?: string): Promise<DirectMessage> {
  const { supabase } = await import("@/lib/supabase");
  const userCtx = await getCurrentUserContext();

  const { data, error } = await supabase
    .from("direct_messages")
    .insert({
      society_id: userCtx.society_id,
      flat_number: targetFlat || userCtx.flat_no || userCtx.flat,
      sender_id: userCtx.id,
      sender_role: userCtx.role,
      content,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  // If a manager sends a message to a resident, create a notification for them
  if (userCtx.role === "manager" && targetFlat) {
    const { error: notifError } = await supabase.from("notifications").insert({
      society_id: userCtx.society_id,
      flat_number: targetFlat,
      title: "New Message from Manager",
      body: content.length > 50 ? content.substring(0, 47) + "..." : content,
      type: "announcement", // using announcement to pass the DB CHECK constraint
    });
    if (notifError) {
      console.error("Failed to insert notification:", notifError);
    }
  }

  return data as DirectMessage;
}

export interface ManagerConversation {
  flat_number: string;
  last_message: string;
  last_message_at: string;
  unread_count?: number;
}

export async function getManagerConversations(): Promise<ManagerConversation[]> {
  const { supabase } = await import("@/lib/supabase");
  const userCtx = await getCurrentUserContext();

  const { data, error } = await supabase
    .from("direct_messages")
    .select("*")
    .eq("society_id", userCtx.society_id)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  const flatMap = new Map<string, ManagerConversation>();
  
  for (const msg of data as DirectMessage[]) {
    if (!flatMap.has(msg.flat_number)) {
      flatMap.set(msg.flat_number, {
        flat_number: msg.flat_number,
        last_message: msg.content,
        last_message_at: msg.created_at,
      });
    }
  }

  return Array.from(flatMap.values());
}

export async function getMessagesForFlat(flat_number: string): Promise<DirectMessage[]> {
  const { supabase } = await import("@/lib/supabase");
  const userCtx = await getCurrentUserContext();

  const { data, error } = await supabase
    .from("direct_messages")
    .select("*")
    .eq("society_id", userCtx.society_id)
    .eq("flat_number", flat_number)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return data as DirectMessage[];
}
