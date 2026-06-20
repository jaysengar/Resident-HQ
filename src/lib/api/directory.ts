import { getCurrentUserContext } from "./core";

export async function getServiceProviders(category?: string): Promise<any[]> {
  const { supabase } = await import("@/lib/supabase");
  const userCtx = await getCurrentUserContext();

  let query = supabase
    .from("service_providers")
    .select("*")
    .eq("society_id", userCtx.society_id)
    .order("rating", { ascending: false });

  if (category) {
    query = query.eq("category", category);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data || [];
}

export async function getServiceCategories(): Promise<any[]> {
  const { supabase } = await import("@/lib/supabase");
  const { data, error } = await supabase
    .from("service_categories")
    .select("*");
  if (error) throw new Error(error.message);
  return data || [];
}
