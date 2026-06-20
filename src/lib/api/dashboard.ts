import type { DashboardStats, MonthlyCollection, RevenueTrend, PlanBreakdown } from "@/lib/types";
import { getCurrentUserContext } from "./core";
import { getSocieties } from "./admin";

export async function getDashboardStats(): Promise<DashboardStats> {
  const { supabase } = await import("@/lib/supabase");
  const userCtx = await getCurrentUserContext();

  const [flatsRes, ticketsRes, paymentsRes, billsRes] = await Promise.all([
    supabase.from("flats").select("resident_id").eq("society_id", userCtx.society_id),
    supabase.from("helpdesk_tickets").select("id", { count: "exact" }).eq("society_id", userCtx.society_id).neq("status", "Resolved"),
    supabase.from("payments").select("amount").eq("society_id", userCtx.society_id),
    supabase.from("bills").select("amount").eq("society_id", userCtx.society_id).neq("status", "paid"),
  ]);

  const pendingDues = billsRes.data?.reduce((sum: number, b: any) => sum + Number(b.amount || 0), 0) || 0;
  const totalCollection = paymentsRes.data?.reduce((sum: number, p: any) => sum + Number(p.amount || 0), 0) || 0;
  const expectedTotal = pendingDues + totalCollection;
  const collectionRate = expectedTotal === 0 ? 100 : (totalCollection / expectedTotal) * 100;

  return {
    totalFlats: flatsRes.data?.length || 0,
    occupiedFlats: flatsRes.data?.filter((f: any) => f.resident_id !== null).length || 0,
    pendingDues,
    openTickets: ticketsRes.count || 0,
    totalCollection,
    collectionRate: Math.round(collectionRate * 10) / 10,
  };
}

export async function getMonthlyCollection(): Promise<MonthlyCollection[]> {
  const { supabase } = await import("@/lib/supabase");
  const userCtx = await getCurrentUserContext();
  
  // Fetch real payments grouped by month
  const { data: payments } = await supabase
    .from("payments")
    .select("month, amount")
    .eq("society_id", userCtx.society_id);

  // Fetch billing_history for past pending data
  const { data: billingHistory } = await supabase
    .from("billing_history")
    .select("month, total_pending, total_collected")
    .eq("society_id", userCtx.society_id)
    .eq("year", new Date().getFullYear());

  // Fetch current pending dues from bills
  const { data: billsRes } = await supabase
    .from("bills")
    .select("amount")
    .eq("society_id", userCtx.society_id)
    .neq("status", "paid");
    
  const currentPending = billsRes?.reduce((sum: number, b: any) => sum + Number(b.amount || 0), 0) || 0;

  // Group payments by month
  const collectedByMonth: Record<string, number> = {};
  payments?.forEach(p => {
    collectedByMonth[p.month] = (collectedByMonth[p.month] || 0) + Number(p.amount);
  });

  // Build billing history lookup
  const historyByMonth: Record<string, number> = {};
  billingHistory?.forEach(h => {
    historyByMonth[h.month] = Number(h.total_pending || 0);
  });

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const currentMonthIdx = new Date().getMonth();
  
  return months.slice(0, currentMonthIdx + 1).map((month, idx) => {
    const isCurrentMonth = idx === currentMonthIdx;
    return {
      month,
      collected: collectedByMonth[month] || 0,
      pending: isCurrentMonth ? currentPending : (historyByMonth[month] || 0),
    };
  });
}

export async function getRevenueTrend(): Promise<RevenueTrend[]> {
  const { serverGetAllPayments } = await import("@/lib/api/admin.functions");
  const { supabase } = await import("@/lib/supabase");
  
  const data = await serverGetAllPayments({ data: { accessToken: (await supabase.auth.getSession()).data.session?.access_token || "" } });
  
  const grouped: Record<string, { revenue: number, societies: Set<string> }> = {};
  data?.forEach((p: any) => {
    if (!grouped[p.month]) grouped[p.month] = { revenue: 0, societies: new Set() };
    grouped[p.month].revenue += Number(p.amount);
    grouped[p.month].societies.add(p.society_id);
  });

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const currentMonthIdx = new Date().getMonth();
  
  return months.slice(0, currentMonthIdx + 1).map(month => ({
    month,
    revenue: grouped[month]?.revenue || 0,
    societies: grouped[month]?.societies.size || 0,
  }));
}

export async function getPlanBreakdown(): Promise<PlanBreakdown[]> {
  const societies = await getSocieties();
  
  const breakdown: Record<string, { count: number, revenue: number }> = {
    Basic: { count: 0, revenue: 0 },
    Pro: { count: 0, revenue: 0 },
    Enterprise: { count: 0, revenue: 0 },
  };

  societies.filter(s => s.status === "active").forEach(s => {
    const plan = s.subscriptionPlan.charAt(0).toUpperCase() + s.subscriptionPlan.slice(1);
    if (breakdown[plan]) {
      breakdown[plan].count++;
      // Use actual revenue from payments, or bill_amount as fallback
      breakdown[plan].revenue += s.monthlyRevenue || (s as any).billAmount || 0;
    }
  });

  return Object.keys(breakdown).map(plan => ({
    plan: plan as "Basic" | "Pro" | "Enterprise",
    count: breakdown[plan].count,
    revenue: breakdown[plan].revenue,
  }));
}
