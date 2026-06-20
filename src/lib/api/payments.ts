import { getCurrentUserContext } from "./core";

export async function createRazorpayOrder(amount: number): Promise<{ orderId: string; amount: number; currency: string; mocked?: boolean; razorpayKeyId?: string }> {
  const { serverCreateRazorpayOrder } = await import("@/lib/api/payment.functions");
  const userCtx = await getCurrentUserContext();
  const order = await serverCreateRazorpayOrder({ data: { amount, societyId: userCtx.society_id } });
  return { ...order, amount: Number(order.amount) };
}

export async function createPublicRazorpayOrder(amount: number): Promise<{ orderId: string; amount: number; currency: string; mocked?: boolean; razorpayKeyId?: string }> {
  const { serverCreateRazorpayOrder } = await import("@/lib/api/payment.functions");
  const order = await serverCreateRazorpayOrder({ data: { amount, societyId: undefined } });
  return { ...order, amount: Number(order.amount) };
}

export async function getTransactions(): Promise<any[]> {
  const { supabase } = await import("@/lib/supabase");
  const userCtx = await getCurrentUserContext();
  const { data } = await supabase
    .from("payments")
    .select("*")
    .eq("society_id", userCtx.society_id)
    .eq("flat_number", userCtx.flat_no)
    .order("created_at", { ascending: false });
  return data || [];
}

export async function payDues(amount: number, method: string) {
  // Deprecated for generic dues payment. Use payBill instead.
  throw new Error("Generic payDues is deprecated. Use payBill to pay specific invoices.");
}

export async function payBill(billId: string, amount: number, method: string) {
  const { supabase } = await import("@/lib/supabase");
  const { serverPayBill } = await import("@/lib/api/payment.functions");
  const userCtx = await getCurrentUserContext();
  
  const accessToken = (await supabase.auth.getSession()).data.session?.access_token || "";

  await serverPayBill({
    data: {
      accessToken,
      societyId: userCtx.society_id,
      flatNumber: userCtx.flat_no!,
      billId,
      amount,
      method,
    }
  });
}

export async function getOverdueAmount(): Promise<number> {
  const { supabase } = await import("@/lib/supabase");
  const userCtx = await getCurrentUserContext();

  const { data } = await supabase
    .from("bills")
    .select("amount")
    .eq("society_id", userCtx.society_id)
    .neq("status", "paid")
    .lt("due_date", new Date().toISOString());

  return data?.reduce((sum: number, b: any) => sum + Number(b.amount || 0), 0) || 0;
}
