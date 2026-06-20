import { getCurrentUserContext } from "./core";

export async function getAnnouncements() {
  const { supabase } = await import("@/lib/supabase");
  const userCtx = await getCurrentUserContext();
  const { data, error } = await supabase
    .from("announcements")
    .select("*")
    .eq("society_id", userCtx.society_id)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return (data || []).map((d: any) => ({
    id: d.id,
    title: d.title,
    body: d.body,
    time: new Date(d.created_at).toLocaleString(),
    authorRole: d.author_role,
  }));
}

export async function sendAnnouncement(payload: {
  title: string;
  body: string;
  authorRole: import("@/lib/types").UserRole;
}) {
  const { supabase } = await import("@/lib/supabase");
  const userCtx = await getCurrentUserContext();

  const { data, error } = await supabase
    .from("announcements")
    .insert({
      society_id: userCtx.society_id,
      title: payload.title,
      body: payload.body,
      author_role: payload.authorRole,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  return {
    id: data.id,
    title: data.title,
    body: data.body,
    time: "Just now",
    authorRole: data.author_role,
  };
}

export async function deleteAnnouncement(id: string) {
  const { supabase } = await import("@/lib/supabase");
  const { error } = await supabase
    .from("announcements")
    .delete()
    .eq("id", id);
    
  if (error) throw new Error(error.message);
  return { success: true };
}
