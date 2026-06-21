import type { Resident, DuesStatus } from "@/lib/types";
import { getCurrentUserContext, sanitize, validatePhone, validateAadhaar } from "./core";

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

export async function updateResidentProfile(payload: { name: string; phone: string }): Promise<{ success: boolean }> {
  const { supabase } = await import("@/lib/supabase");
  const userCtx = await getCurrentUserContext();
  
  const cleanName = sanitize(payload.name);
  const cleanPhone = validatePhone(payload.phone);
  
  const { error } = await supabase
    .from("users")
    .update({ name: cleanName, phone: cleanPhone })
    .eq("id", userCtx.id);
    
  if (error) throw new Error(error.message);
  
  // Update auth metadata if needed
  await supabase.auth.updateUser({
    data: { name: cleanName, phone: cleanPhone }
  });
  
  return { success: true };
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
      accessToken: (await supabase.auth.getSession()).data.session?.access_token || "",
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
      accessToken: (await supabase.auth.getSession()).data.session?.access_token || "",
      societyId: userCtx.society_id,
      flatNumber: payload.flatNo,
      residentId: user.id,
      flatType: payload.flatType,
      occupancyType: payload.occupancyType,
    },
  });

  return { success: true, message: `Resident ${payload.name} added successfully.`, tempPassword: user.tempPassword };
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

  // Send Push Notification
  supabase.functions.invoke("send-notification", {
    body: {
      title: "Payment Reminder",
      body: `Your maintenance dues are pending. Please pay at your earliest convenience.`,
      societyId: userCtx.society_id,
      flatNumber: flatNo
    }
  }).catch(err => console.error("Push notification failed:", err));

  return { success: true, message: `Payment reminder sent to ${flatNo}` };
}

export async function sendBulkReminders(): Promise<{ success: boolean; count: number; message: string }> {
  const { serverSendBulkReminders } = await import("@/lib/api/admin.functions");
  const userCtx = await getCurrentUserContext();
  const { supabase } = await import("@/lib/supabase");
  
  return await serverSendBulkReminders({ data: {
      accessToken: (await supabase.auth.getSession()).data.session?.access_token || "", societyId: userCtx.society_id } });
}

export async function deleteResident(userId: string, flatNo: string): Promise<{ success: boolean }> {
  const { serverDeleteUser, serverDeleteFlat } = await import("@/lib/api/admin.functions");
  const userCtx = await getCurrentUserContext();
  const { supabase } = await import("@/lib/supabase");

  // Delete flat first, then user (cascade will handle auth.users)
  await serverDeleteFlat({ data: {
      accessToken: (await supabase.auth.getSession()).data.session?.access_token || "", societyId: userCtx.society_id, flatNumber: flatNo } });
  await serverDeleteUser({ data: {
      accessToken: (await supabase.auth.getSession()).data.session?.access_token || "", userId } });

  return { success: true };
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
  const { supabase } = await import("@/lib/supabase");
  
  await serverGenerateBills({ data: {
      accessToken: (await supabase.auth.getSession()).data.session?.access_token || "", 
    societyId: userCtx.society_id,
    title: payload.title,
    amount: payload.amount,
    dueDate: payload.dueDate,
    flatNumber: payload.flatNumber
  }});
}
