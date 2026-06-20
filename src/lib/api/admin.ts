import type { Society, AdminOverviewStats, SystemLog } from "@/lib/types";

export async function getSocieties(): Promise<Society[]> {
  const { serverGetSocietiesWithStats } = await import("@/lib/api/admin.functions");
  const { supabase } = await import("@/lib/supabase");
  return await serverGetSocietiesWithStats({ data: { accessToken: (await supabase.auth.getSession()).data.session?.access_token || "" } });
}

export async function getAdminOverview(): Promise<AdminOverviewStats> {
  const societies = await getSocieties();
  const active = societies.filter((s) => s.status === "active");
  const suspended = societies.filter((s) => s.status === "suspended");
  const churnRate = societies.length === 0 ? 0 : Math.round((suspended.length / societies.length) * 100 * 10) / 10;

  return {
    activeSocieties: active.length,
    totalMRR: active.reduce((sum, s) => sum + s.monthlyRevenue, 0),
    totalUsers: societies.reduce((sum, s) => sum + s.totalResidents, 0),
    newThisMonth: societies.filter(
      (s) => new Date(s.createdAt).getMonth() === new Date().getMonth() &&
             new Date(s.createdAt).getFullYear() === new Date().getFullYear(),
    ).length,
    churnRate,
  };
}

export async function onboardSociety(payload: {
  name: string;
  address: string;
  totalFlats: number;
  adminEmail: string;
  subscriptionPlan: string;
}): Promise<Society> {
  const { serverAdminOnboardSociety } = await import("@/lib/api/admin.functions");
  const { supabase } = await import("@/lib/supabase");

  const accessToken = (await supabase.auth.getSession()).data.session?.access_token || "";

  const societyData = await serverAdminOnboardSociety({
    data: {
      ...payload,
      accessToken,
    },
  });

  return {
    id: societyData.id,
    name: societyData.name,
    address: societyData.address || "",
    totalFlats: societyData.max_flats,
    adminEmail: payload.adminEmail,
    subscriptionPlan: societyData.plan as any,
    status: societyData.status as any,
    createdAt: societyData.created_at,
    activeSince: societyData.created_at,
    monthlyRevenue: 0,
    totalResidents: 0,
  };
}

export async function toggleSocietyAccess(
  societyId: string,
): Promise<{ success: boolean; newStatus: "active" | "suspended" }> {
  const { supabase } = await import("@/lib/supabase");

  const { data: society } = await supabase
    .from("societies")
    .select("status")
    .eq("id", societyId)
    .single();
  const newStatus = society?.status === "active" ? "suspended" : "active";

  const { error } = await supabase
    .from("societies")
    .update({ status: newStatus })
    .eq("id", societyId);

  if (error) {
    throw new Error(error.message);
  }
  return { success: true, newStatus };
}

export async function deleteSociety(societyId: string): Promise<{ success: boolean }> {
  const { serverDeleteSociety } = await import("@/lib/api/admin.functions");
  const { supabase } = await import("@/lib/supabase");
  await serverDeleteSociety({ data: {
      accessToken: (await supabase.auth.getSession()).data.session?.access_token || "", societyId } });
  return { success: true };
}

export async function getSystemLogs(): Promise<SystemLog[]> {
  const { serverGetSystemLogs } = await import("@/lib/api/admin.functions");
  const { supabase } = await import("@/lib/supabase");
  return await serverGetSystemLogs({ data: { accessToken: (await supabase.auth.getSession()).data.session?.access_token || "" } });
}

export async function getSubscriptionPlans(): Promise<any[]> {
  const { supabase } = await import("@/lib/supabase");
  const { data, error } = await supabase
    .from("subscription_plans")
    .select("*")
    .order("price_inr", { ascending: true });
  if (error) throw new Error(error.message);
  
  if (!data || data.length === 0) {
    // Fallback if the database is not populated
    return [
      { id: "Basic", price_inr: 5000, max_flats: 100 },
      { id: "Pro", price_inr: 10000, max_flats: 300 },
      { id: "Enterprise", price_inr: 15000, max_flats: 1000 },
    ];
  }
  return data;
}
