import { getCurrentUserContext } from "./core";

export async function addGuard(payload: { name: string; email: string; phone: string }): Promise<{ success: boolean; message: string; tempPassword?: string }> {
  const { serverCreateAccount } = await import("@/lib/api/admin.functions");
  const userCtx = await getCurrentUserContext();
  const { supabase } = await import("@/lib/supabase");

  const user = await serverCreateAccount({
    data: {
      accessToken: (await supabase.auth.getSession()).data.session?.access_token || "",
      email: payload.email,
      role: "guard",
      name: payload.name,
      societyId: userCtx.society_id,
      phone: payload.phone,
    },
  });

  return { success: true, message: "Guard added successfully", tempPassword: user.tempPassword };
}

export async function getGuards(): Promise<{ id: string; name: string; phone: string; email: string }[]> {
  const { supabase } = await import("@/lib/supabase");
  const { data, error } = await supabase
    .from("users")
    .select("id, name, phone, email")
    .eq("role", "guard");

  if (error) throw new Error(error.message);
  return data.map(d => ({
    id: d.id,
    name: d.name,
    phone: d.phone || "N/A",
    email: d.email || "N/A",
  }));
}

export async function deleteGuard(userId: string): Promise<{ success: boolean }> {
  const { serverDeleteUser } = await import("@/lib/api/admin.functions");
  const { supabase } = await import("@/lib/supabase");
  
  await serverDeleteUser({ data: {
      accessToken: (await supabase.auth.getSession()).data.session?.access_token || "", userId } });
  return { success: true };
}
