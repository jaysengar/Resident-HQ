import { getCurrentUserContext } from "./core";

export async function getSocietyDocuments(): Promise<any[]> {
  const { supabase } = await import("@/lib/supabase");
  const userCtx = await getCurrentUserContext();

  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .eq("society_id", userCtx.society_id)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data || [];
}

export async function uploadDocument(payload: { title: string; category: string; url: string }) {
  const { supabase } = await import("@/lib/supabase");
  const userCtx = await getCurrentUserContext();

  const { error } = await supabase.from("documents").insert({
    society_id: userCtx.society_id,
    title: payload.title,
    category: payload.category,
    url: payload.url,
  });

  if (error) throw new Error(error.message);
  return { success: true };
}
