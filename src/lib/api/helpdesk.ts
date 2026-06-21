import type { HelpdeskTicket, TicketStatus, TicketPriority } from "@/lib/types";
import { getCurrentUserContext } from "./core";

export async function getHelpdeskTickets(): Promise<HelpdeskTicket[]> {
  const { supabase } = await import("@/lib/supabase");
  const { data, error } = await supabase
    .from("helpdesk_tickets")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return data.map((d: any) => ({
    id: d.id,
    flatNo: d.flat_number,
    residentName: d.resident_name,
    title: d.title,
    description: d.description || "",
    category: d.category || "General",
    status: d.status as TicketStatus,
    priority: d.priority as TicketPriority,
    createdAt: d.created_at,
    updatedAt: d.updated_at,
  }));
}

export async function resolveTicket(
  ticketId: string,
  newStatus: TicketStatus,
): Promise<{ success: boolean }> {
  const { supabase } = await import("@/lib/supabase");
  const { error } = await supabase
    .from("helpdesk_tickets")
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq("id", ticketId);

  if (error) throw new Error(error.message);
  return { success: true };
}

export async function createTicket(
  payload: Omit<HelpdeskTicket, "id" | "status" | "createdAt" | "updatedAt">,
): Promise<{ success: boolean; id: string }> {
  const { supabase } = await import("@/lib/supabase");
  const userCtx = await getCurrentUserContext();

  const { data, error } = await supabase
    .from("helpdesk_tickets")
    .insert({
      society_id: userCtx.society_id,
      flat_number: payload.flatNo,
      resident_name: payload.residentName,
      title: payload.title,
      description: payload.description,
      category: payload.category,
      priority: payload.priority,
      status: "Open"
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return { success: true, id: data.id };
}
