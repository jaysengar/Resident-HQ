import { getCurrentUserContext, sanitize } from "./core";

export async function getCommunityPosts() {
  const { supabase } = await import("@/lib/supabase");
  const userCtx = await getCurrentUserContext();
  const { data, error } = await supabase
    .from("community_posts")
    .select("*")
    .eq("society_id", userCtx.society_id)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return (data || []).map((d: any) => ({
    id: d.id,
    author: d.author_name,
    flat: d.flat_number,
    content: d.content,
    type: d.type,
    price: d.price || undefined,
    imageUrl: d.image_url || undefined,
    contact: d.contact || undefined,
    time: new Date(d.created_at).toLocaleString(),
  }));
}

export async function addCommunityPost(payload: {
  content: string;
  type: string;
  price?: string;
  imageUrl?: string;
  contact?: string;
}) {
  const { supabase } = await import("@/lib/supabase");
  const userCtx = await getCurrentUserContext();

  const { data, error } = await supabase
    .from("community_posts")
    .insert({
      society_id: userCtx.society_id,
      author_name: userCtx.name,
      flat_number: userCtx.flat_no || "Staff",
      content: sanitize(payload.content),
      type: payload.type,
      price: payload.price ? sanitize(payload.price) : null,
      image_url: payload.imageUrl || null,
      contact: payload.contact ? sanitize(payload.contact) : null,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  return {
    id: data.id,
    author: data.author_name,
    flat: data.flat_number,
    content: data.content,
    type: data.type,
    price: data.price || undefined,
    imageUrl: data.image_url || undefined,
    contact: data.contact || undefined,
    time: "Just now",
  };
}
