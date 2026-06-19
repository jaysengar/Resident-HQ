// ─── API Service Layer ───
// Real Supabase endpoints with input validation and sanitization.

import type {
  ActiveEntry,
  EntryRequest,
  DashboardStats,
  MonthlyCollection,
  Resident,
  HelpdeskTicket,
  TicketStatus,
  Society,
  AdminOverviewStats,
  SystemLog,
  RevenueTrend,
  PlanBreakdown,
} from "@/lib/types";

// ─── HELPERS ───

/** Sanitize text input — trim whitespace, collapse multiple spaces */
function sanitize(text: string): string {
  return text.trim().replace(/\s+/g, " ");
}

/** Validate 10-digit Indian phone number */
function validatePhone(phone: string): string {
  const cleaned = phone.replace(/[\s\-()]/g, "");
  if (!/^\d{10}$/.test(cleaned)) throw new Error("Phone number must be exactly 10 digits.");
  return cleaned;
}

/** Validate 12-digit Aadhaar number */
function validateAadhaar(aadhaar: string): string {
  const cleaned = aadhaar.replace(/[\s\-]/g, "");
  if (!/^\d{12}$/.test(cleaned)) throw new Error("Aadhaar number must be exactly 12 digits.");
  return cleaned;
}

import type { DuesStatus, TicketPriority } from "@/lib/types";

async function getCurrentUserContext() {
  const { supabase } = await import("@/lib/supabase");
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not logged in");

  const { data: userData, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error || !userData) throw new Error("User profile not found");
  return userData;
}

// ─── SHARED ENDPOINTS ───

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


// ─── GUARD ENDPOINTS ───

export async function getActiveEntries(): Promise<ActiveEntry[]> {
  const { supabase } = await import("@/lib/supabase");
  const { data, error } = await supabase
    .from("visitors")
    .select("*")
    .in("status", ["pending", "approved"])
    .order("entered_at", { ascending: false });

  if (error) throw new Error(error.message);

  return data.map((d: any) => ({
    id: d.id,
    type: d.type as any,
    name: d.name,
    company: d.company || undefined,
    flatNo: d.flat_number,
    enteredAt: d.entered_at,
    phone: d.phone || undefined,
    status: d.status,
  }));
}

export async function requestEntry(
  payload: EntryRequest,
): Promise<{ status: "approved" | "denied" | "pending"; entryId: string }> {
  const { supabase } = await import("@/lib/supabase");
  const userCtx = await getCurrentUserContext();

  const { data, error } = await supabase
    .from("visitors")
    .insert({
      society_id: userCtx.society_id,
      flat_number: payload.flatNo,
      name: payload.name || payload.company || "Unknown",
      company: payload.company,
      phone: payload.phone,
      type: payload.type,
      status: "pending",
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  // Use Realtime to wait for approval
  return new Promise((resolve) => {
    // Timeout after 60s
    const timeout = setTimeout(async () => {
      supabase.removeChannel(channel);
      // Auto reject if resident doesn't respond
      await supabase.from("visitors").update({ status: "denied" }).eq("id", data.id);
      resolve({ status: "denied", entryId: data.id });
    }, 60000);

    const channel = supabase
      .channel(`visitor_status_${data.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "visitors",
          filter: `id=eq.${data.id}`,
        },
        (payload) => {
          const newStatus = payload.new.status;
          if (newStatus === "approved" || newStatus === "denied") {
            clearTimeout(timeout);
            supabase.removeChannel(channel);
            resolve({ status: newStatus, entryId: data.id });
          }
        }
      )
      .subscribe();
  });
}

export async function respondToEntry(entryId: string, status: "approved" | "denied"): Promise<{ success: boolean }> {
  const { supabase } = await import("@/lib/supabase");
  const { error } = await supabase
    .from("visitors")
    .update({ status })
    .eq("id", entryId);

  if (error) throw new Error(error.message);
  return { success: true };
}

export async function markExit(entryId: string): Promise<{ success: boolean }> {
  const { supabase } = await import("@/lib/supabase");
  const { error } = await supabase
    .from("visitors")
    .update({ status: "exited", exited_at: new Date().toISOString() })
    .eq("id", entryId);

  if (error) throw new Error(error.message);
  return { success: true };
}

export async function preApproveVisitor(payload: {
  name: string;
  type: string;
  expectedDate?: string;
}): Promise<{ code: string }> {
  const { supabase } = await import("@/lib/supabase");
  const userCtx = await getCurrentUserContext();

  const code = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code

  const { error } = await supabase.from("visitors").insert({
    society_id: userCtx.society_id,
    flat_number: userCtx.flat_no || userCtx.flat, // Support different property names
    name: payload.name,
    type: payload.type,
    status: "pre_approved",
    entry_code: code,
  });

  if (error) throw new Error(error.message);

  return { code };
}

export async function verifyEntryCode(code: string): Promise<{ success: boolean; visitor: any }> {
  const { supabase } = await import("@/lib/supabase");
  const userCtx = await getCurrentUserContext();

  // 1. Find the pre_approved visitor
  const { data, error } = await supabase
    .from("visitors")
    .select("*")
    .eq("society_id", userCtx.society_id)
    .eq("entry_code", code)
    .eq("status", "pre_approved")
    .single();

  if (error || !data) {
    throw new Error("Invalid or expired entry code");
  }

  // 2. Update status to approved
  const { error: updateError } = await supabase
    .from("visitors")
    .update({ status: "approved", entered_at: new Date().toISOString() })
    .eq("id", data.id);

  if (updateError) throw new Error("Failed to approve entry");

  return { success: true, visitor: data };
}

// ─── POLLS & SURVEYS ───

export async function getActivePoll(): Promise<any> {
  const { supabase } = await import("@/lib/supabase");
  const userCtx = await getCurrentUserContext();

  const { data: poll, error } = await supabase
    .from("polls")
    .select("*")
    .eq("society_id", userCtx.society_id)
    .eq("active", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error || !poll) return null;

  // Check if resident already voted
  const flat = userCtx.flat_no || userCtx.flat;
  if (!flat) return poll;

  const { data: vote } = await supabase
    .from("poll_votes")
    .select("id")
    .eq("poll_id", poll.id)
    .eq("flat_number", flat)
    .single();

  if (vote) return null; // Already voted

  return poll;
}

export async function submitPollVote(pollId: string, optionIndex: number): Promise<void> {
  const { supabase } = await import("@/lib/supabase");
  const userCtx = await getCurrentUserContext();
  const flat = userCtx.flat_no || userCtx.flat;
  
  if (!flat) throw new Error("Flat number not found");

  const { error } = await supabase.from("poll_votes").insert({
    poll_id: pollId,
    flat_number: flat,
    option_index: optionIndex,
  });

  if (error) throw new Error(error.message);
}

export async function createPoll(question: string, options: string[]): Promise<void> {
  const { serverCreatePoll } = await import("@/lib/api/admin.functions");
  const userCtx = await getCurrentUserContext();
  
  await serverCreatePoll({
    data: {
      accessToken: (await (await import("@/lib/supabase")).supabase.auth.getSession()).data.session?.access_token || "",
      societyId: userCtx.society_id,
      question,
      options,
    },
  });
}

// ─── DOCUMENTS ───

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

// ─── DIRECTORY ───

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

// ─── PAYMENTS ───

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

// ─── MANAGER ENDPOINTS ───

export async function getSocietySettings(): Promise<{ razorpay_key_id: string; razorpay_key_secret: string } | null> {
  const { supabase } = await import("@/lib/supabase");
  const userCtx = await getCurrentUserContext();
  if (userCtx.role !== "manager") throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("society_settings")
    .select("razorpay_key_id, razorpay_key_secret")
    .eq("society_id", userCtx.society_id)
    .single();

  if (error && error.code !== "PGRST116") {
    console.error("Failed to fetch society settings", error);
    return null;
  }
  return data;
}

export async function updateSocietySettings(settings: { razorpay_key_id: string; razorpay_key_secret: string }): Promise<void> {
  const { supabase } = await import("@/lib/supabase");
  const userCtx = await getCurrentUserContext();
  if (userCtx.role !== "manager") throw new Error("Unauthorized");

  const { error } = await supabase
    .from("society_settings")
    .upsert({
      society_id: userCtx.society_id,
      razorpay_key_id: settings.razorpay_key_id,
      razorpay_key_secret: settings.razorpay_key_secret,
      updated_at: new Date().toISOString(),
    });

  if (error) throw new Error(error.message);
}

// ─── BRANDING ───

export interface SocietyBranding {
  logo_url?: string;
  banner_url?: string;
  tagline?: string;
  primary_color?: string;
  secondary_color?: string;
  society_photos?: string[];
  contact_phone?: string;
  contact_email?: string;
}

/** Public — fetch branding for a colony public page */
export async function getSocietyBranding(slug: string): Promise<{
  society: { id: string; name: string; slug: string; address: string; plan: string; logo_url: string; primary_color: string };
  branding: SocietyBranding | null;
} | null> {
  const { supabase } = await import("@/lib/supabase");

  const { data: society, error: socError } = await supabase
    .from("societies")
    .select("id, name, slug, address, plan, logo_url, primary_color")
    .eq("slug", slug)
    .single();

  if (socError || !society) return null;

  const { data: branding } = await supabase
    .from("society_settings")
    .select("logo_url, banner_url, tagline, primary_color, secondary_color, society_photos, contact_phone, contact_email")
    .eq("society_id", society.id)
    .single();

  return { society, branding: branding as SocietyBranding | null };
}

/** Manager — get branding settings for their society */
export async function getManagerBranding(): Promise<SocietyBranding | null> {
  const { supabase } = await import("@/lib/supabase");
  const userCtx = await getCurrentUserContext();
  if (userCtx.role !== "manager") throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("society_settings")
    .select("logo_url, banner_url, tagline, primary_color, secondary_color, society_photos, contact_phone, contact_email")
    .eq("society_id", userCtx.society_id)
    .single();

  if (error && error.code !== "PGRST116") return null;
  return data as SocietyBranding | null;
}

/** Manager — update branding */
export async function updateSocietyBranding(branding: SocietyBranding): Promise<void> {
  const { supabase } = await import("@/lib/supabase");
  const userCtx = await getCurrentUserContext();
  if (userCtx.role !== "manager") throw new Error("Unauthorized");

  const { error } = await supabase
    .from("society_settings")
    .upsert({
      society_id: userCtx.society_id,
      ...branding,
      updated_at: new Date().toISOString(),
    });

  if (error) throw new Error(error.message);
}

/** Get the current society's plan (for feature gating) */
export async function getSocietyPlan(): Promise<{ plan: string; subscription_expires_at: string | null; id: string }> {
  const { supabase } = await import("@/lib/supabase");
  const userCtx = await getCurrentUserContext();

  const { data } = await supabase
    .from("societies")
    .select("id, plan, subscription_expires_at")
    .eq("id", userCtx.society_id)
    .single();

  return {
    id: data?.id || userCtx.society_id,
    plan: data?.plan || "basic",
    subscription_expires_at: data?.subscription_expires_at || null,
  };
}


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

export async function getResidentProfile() {
  const { supabase } = await import("@/lib/supabase");
  const userCtx = await getCurrentUserContext();
  
  // Fetch flat data
  const { data: flatData } = await supabase
    .from("flats")
    .select("dues_amount, dues_status, flat_type, occupancy_type")
    .eq("society_id", userCtx.society_id)
    .eq("flat_number", userCtx.flat_no)
    .single();

  // Fetch society name
  const { data: societyData } = await supabase
    .from("societies")
    .select("name")
    .eq("id", userCtx.society_id)
    .single();

  // Sum up unpaid bills
  const { data: bills } = await supabase
    .from("bills")
    .select("amount")
    .eq("society_id", userCtx.society_id)
    .eq("flat_number", userCtx.flat_no)
    .neq("status", "paid");
    
  const dues_amount = bills?.reduce((sum, b) => sum + Number(b.amount), 0) || 0;
  const dues_status = dues_amount > 0 ? "unpaid" : "paid";

  return {
    ...(flatData || { flat_type: "3 BHK", occupancy_type: "Owner" }),
    dues_amount,
    dues_status,
    society_id: userCtx.society_id,
    society_name: societyData?.name || "My Society",
  };
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

export async function getResidentBills(): Promise<import("@/lib/types").Bill[]> {
  const { supabase } = await import("@/lib/supabase");
  const userCtx = await getCurrentUserContext();

  const { data, error } = await supabase
    .from("bills")
    .select("*")
    .eq("society_id", userCtx.society_id)
    .eq("flat_number", userCtx.flat_no)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data || [];
}

export async function generateBills(payload: { title: string; amount: number; dueDate: string; flatNumber?: string }) {
  const { serverGenerateBills } = await import("@/lib/api/admin.functions");
  const userCtx = await getCurrentUserContext();
  
  await serverGenerateBills({ data: {
      accessToken: (await (await import("@/lib/supabase")).supabase.auth.getSession()).data.session?.access_token || "", 
    societyId: userCtx.society_id,
    title: payload.title,
    amount: payload.amount,
    dueDate: payload.dueDate,
    flatNumber: payload.flatNumber
  }});
}

export async function getResidents(): Promise<Resident[]> {
  const { supabase } = await import("@/lib/supabase");

  // RLS policy on flats ensures we only get flats for current user's society_id.
  const { data: flats, error: flatsError } = await supabase.from("flats").select(`
      flat_number,
      dues_status,
      dues_amount,
      due_date,
      flat_type,
      occupancy_type,
      move_in_date,
      users ( id, name, phone, email, members_count, aadhaar_number )
    `);

  if (flatsError) throw new Error(flatsError.message);

  return (flats || []).map((f: any) => ({
    id: f.users?.[0]?.id || f.flat_number,
    flatNo: f.flat_number,
    name: f.users?.[0]?.name || "Unoccupied",
    phone: f.users?.[0]?.phone || "N/A",
    email: f.users?.[0]?.email || "N/A",
    duesStatus: f.dues_status as DuesStatus,
    duesAmount: f.dues_amount || 0,
    moveInDate: f.move_in_date ? new Date(f.move_in_date).toISOString().split("T")[0] : "N/A",
    flatType: f.flat_type || "3 BHK",
    occupancyType: f.occupancy_type || "Owner",
    membersCount: f.users?.[0]?.members_count || 1,
    dueDate: f.due_date || null,
  }));
}
export async function addResident(payload: {
  name: string;
  email: string;
  phone: string;
  flatNo: string;
  membersCount: number;
  aadhaarNumber: string;
  flatType: string;
  occupancyType: string;
}): Promise<{ success: boolean; message: string; tempPassword?: string }> {
  // Input validation
  payload.name = sanitize(payload.name);
  payload.email = payload.email.trim().toLowerCase();
  payload.phone = validatePhone(payload.phone);
  payload.flatNo = sanitize(payload.flatNo).toUpperCase();
  if (payload.aadhaarNumber) payload.aadhaarNumber = validateAadhaar(payload.aadhaarNumber);

  const { supabase } = await import("@/lib/supabase");
  const { serverCreateAccount, serverInsertFlat } = await import("@/lib/api/admin.functions");
  const userCtx = await getCurrentUserContext();

  // 1. Check max_flats limit
  const [societyRes, flatsRes] = await Promise.all([
    supabase.from("societies").select("max_flats").eq("id", userCtx.society_id).single(),
    supabase.from("flats").select("id", { count: "exact" }).eq("society_id", userCtx.society_id),
  ]);

  if (societyRes.error) throw new Error("Failed to fetch society details");
  const maxFlats = societyRes.data.max_flats;
  const currentFlats = flatsRes.count || 0;

  if (currentFlats >= maxFlats) {
    throw new Error(`Cannot add more flats. Your plan limit is ${maxFlats} flats.`);
  }

  // 2. Check if flat already exists
  const { data: existingFlat } = await supabase
    .from("flats")
    .select("id")
    .eq("society_id", userCtx.society_id)
    .eq("flat_number", payload.flatNo)
    .single();

  if (existingFlat) {
    throw new Error(`Flat ${payload.flatNo} already exists.`);
  }

  // 3. Create Resident Account via server function (random password generated server-side)
  const user = await serverCreateAccount({
    data: {
      accessToken: (await (await import("@/lib/supabase")).supabase.auth.getSession()).data.session?.access_token || "",
      email: payload.email,
      role: "resident",
      name: payload.name,
      societyId: userCtx.society_id,
      flatNo: payload.flatNo,
      phone: payload.phone,
      membersCount: payload.membersCount,
      aadhaarNumber: payload.aadhaarNumber,
    },
  });

  // 4. Insert Flat via server function
  await serverInsertFlat({
    data: {
      accessToken: (await (await import("@/lib/supabase")).supabase.auth.getSession()).data.session?.access_token || "",
      societyId: userCtx.society_id,
      flatNumber: payload.flatNo,
      residentId: user.id,
      flatType: payload.flatType,
      occupancyType: payload.occupancyType,
    },
  });

  return { success: true, message: `Resident ${payload.name} added successfully.`, tempPassword: user.tempPassword };
}

export async function addGuard(payload: { name: string; email: string; phone: string }): Promise<{ success: boolean; message: string; tempPassword?: string }> {
  const { serverCreateAccount } = await import("@/lib/api/admin.functions");
  const userCtx = await getCurrentUserContext();

  const user = await serverCreateAccount({
    data: {
      accessToken: (await (await import("@/lib/supabase")).supabase.auth.getSession()).data.session?.access_token || "",
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

export async function sendReminder(flatNo: string): Promise<{ success: boolean; message: string }> {
  const { supabase } = await import("@/lib/supabase");
  const userCtx = await getCurrentUserContext();

  // Insert a real notification into the notifications table
  const { error } = await supabase.from("notifications").insert({
    society_id: userCtx.society_id,
    flat_number: flatNo,
    type: "payment_reminder",
    title: "Payment Reminder",
    body: `Your maintenance dues are pending. Please pay at your earliest convenience.`,
  });

  if (error) throw new Error(error.message);
  return { success: true, message: `Payment reminder sent to ${flatNo}` };
}

export async function sendBulkReminders(): Promise<{ success: boolean; count: number; message: string }> {
  const { serverSendBulkReminders } = await import("@/lib/api/admin.functions");
  const userCtx = await getCurrentUserContext();
  return await serverSendBulkReminders({ data: {
      accessToken: (await (await import("@/lib/supabase")).supabase.auth.getSession()).data.session?.access_token || "", societyId: userCtx.society_id } });
}

export async function deleteResident(userId: string, flatNo: string): Promise<{ success: boolean }> {
  const { serverDeleteUser, serverDeleteFlat } = await import("@/lib/api/admin.functions");
  const userCtx = await getCurrentUserContext();

  // Delete flat first, then user (cascade will handle auth.users)
  await serverDeleteFlat({ data: {
      accessToken: (await (await import("@/lib/supabase")).supabase.auth.getSession()).data.session?.access_token || "", societyId: userCtx.society_id, flatNumber: flatNo } });
  await serverDeleteUser({ data: {
      accessToken: (await (await import("@/lib/supabase")).supabase.auth.getSession()).data.session?.access_token || "", userId } });

  return { success: true };
}

export async function deleteGuard(userId: string): Promise<{ success: boolean }> {
  const { serverDeleteUser } = await import("@/lib/api/admin.functions");
  await serverDeleteUser({ data: {
      accessToken: (await (await import("@/lib/supabase")).supabase.auth.getSession()).data.session?.access_token || "", userId } });
  return { success: true };
}

export async function triggerEmergency(): Promise<{ success: boolean; emergencyId: string }> {
  const { supabase } = await import("@/lib/supabase");
  const userCtx = await getCurrentUserContext();

  const { data, error } = await supabase
    .from("emergencies")
    .insert({
      society_id: userCtx.society_id,
      flat_number: userCtx.flat_no || userCtx.flat,
      user_id: userCtx.id,
      status: "active",
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);
  return { success: true, emergencyId: data.id };
}

export async function getVisitorLog(): Promise<any[]> {
  const { supabase } = await import("@/lib/supabase");
  const userCtx = await getCurrentUserContext();
  
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("society_id", userCtx.society_id)
    .or(`flat_number.eq.${userCtx.flat_no},flat_number.is.null`)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) throw new Error(error.message);
  return data || [];
}

export async function getNotifications(): Promise<any[]> {
  const { supabase } = await import("@/lib/supabase");
  const userCtx = await getCurrentUserContext();
  
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("society_id", userCtx.society_id)
    .or(`flat_number.eq.${userCtx.flat_no},flat_number.is.null`)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) throw new Error(error.message);
  return data || [];
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

// ─── HELPDESK ENDPOINTS ───

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
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return { success: true, id: data.id };
}

// ─── COMMUNITY ENDPOINTS ───

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

// ─── ADMIN ENDPOINTS ───

export async function getSocieties(): Promise<Society[]> {
  const { serverGetSocietiesWithStats } = await import("@/lib/api/admin.functions");
  return await serverGetSocietiesWithStats({ data: { accessToken: (await (await import("@/lib/supabase")).supabase.auth.getSession()).data.session?.access_token || "" } });
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
  await serverDeleteSociety({ data: {
      accessToken: (await (await import("@/lib/supabase")).supabase.auth.getSession()).data.session?.access_token || "", societyId } });
  return { success: true };
}

export async function getRevenueTrend(): Promise<RevenueTrend[]> {
  const { serverGetAllPayments } = await import("@/lib/api/admin.functions");
  
  const data = await serverGetAllPayments({ data: { accessToken: (await (await import("@/lib/supabase")).supabase.auth.getSession()).data.session?.access_token || "" } });
  
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

export async function getSystemLogs(): Promise<SystemLog[]> {
  const { serverGetSystemLogs } = await import("@/lib/api/admin.functions");
  return await serverGetSystemLogs({ data: { accessToken: (await (await import("@/lib/supabase")).supabase.auth.getSession()).data.session?.access_token || "" } });
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

export async function getServiceCategories(): Promise<any[]> {
  const { supabase } = await import("@/lib/supabase");
  const { data, error } = await supabase
    .from("service_categories")
    .select("*");
  if (error) throw new Error(error.message);
  return data || [];
}

export async function submitNocRequest(type: "Move-In" | "Move-Out", moving_date: string, reason: string): Promise<{ success: boolean; id?: string }> {
  const { supabase } = await import("@/lib/supabase");
  const userCtx = await getCurrentUserContext();

  const { data, error } = await supabase
    .from("noc_requests")
    .insert({
      society_id: userCtx.society_id,
      user_id: userCtx.id,
      flat_number: userCtx.flat_no || userCtx.flat,
      type,
      moving_date,
      reason,
      status: "Pending"
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);
  return { success: true, id: data.id };
}

export async function getNocRequests(): Promise<any[]> {
  const { supabase } = await import("@/lib/supabase");
  const userCtx = await getCurrentUserContext();

  let query = supabase
    .from("noc_requests")
    .select(`
      *,
      users!noc_requests_user_id_fkey(name, phone)
    `)
    .eq("society_id", userCtx.society_id)
    .order("created_at", { ascending: false });

  // Residents only see their own
  if (userCtx.role === "resident") {
    query = query.eq("user_id", userCtx.id);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  return data.map((n: any) => ({
    ...n,
    user_name: n.users?.name,
    user_phone: n.users?.phone,
  }));
}

export async function updateNocStatus(id: string, status: "Approved" | "Rejected", admin_notes?: string): Promise<{ success: boolean }> {
  const { supabase } = await import("@/lib/supabase");
  
  const { error } = await supabase
    .from("noc_requests")
    .update({ 
      status, 
      admin_notes,
      updated_at: new Date().toISOString()
    })
    .eq("id", id);

  if (error) throw new Error(error.message);
  return { success: true };
}

// ─── Notifications ───



export async function markNotificationRead(notificationId: string) {
  const { supabase } = await import("@/lib/supabase");

  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", notificationId);

  if (error) throw new Error(error.message);
  return { success: true };
}

export async function markAllNotificationsRead() {
  const { supabase } = await import("@/lib/supabase");
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("user_id", user.id)
    .eq("is_read", false);

  if (error) throw new Error(error.message);
  return { success: true };
}
