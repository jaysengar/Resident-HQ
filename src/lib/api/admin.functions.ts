// ─── Server-side Admin Functions ───
// These run ONLY on the server via TanStack Start's createServerFn.
// The Supabase Service Role Key never reaches the browser.

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

// ─── Helper: Generate a random password ───
// ─── Helper: Verify Auth ───
async function verifyServerAuth(admin: any, token: string | undefined, allowedRoles?: string[]) {
  if (!token) throw new Error("Missing access token");
  const { data: { user }, error } = await admin.auth.getUser(token);
  if (error || !user) throw new Error("Unauthorized");
  if (allowedRoles && allowedRoles.length > 0) {
    const { data: userData } = await admin.from("users").select("role").eq("id", user.id).single();
    if (!userData || !allowedRoles.includes(userData.role)) throw new Error("Forbidden: Insufficient role");
  }
  return user;
}

function generateRandomPassword(length = 12): string {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

// ─── Create User Account (used by addResident & addGuard) ───
export const serverCreateAccount = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      accessToken: z.string(),
      email: z.string().email(),
      role: z.string(),
      name: z.string(),
      societyId: z.string().uuid(),
      flatNo: z.string().optional(),
      phone: z.string().optional(),
      membersCount: z.number().optional(),
      aadhaarNumber: z.string().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const { getSupabaseAdmin } = await import("@/lib/supabase-admin.server");
    const admin = getSupabaseAdmin();
    await verifyServerAuth(admin, data.accessToken, ["manager", "admin"]);

    // 1. Create user in Supabase Auth via invite
    const { data: authData, error: authError } = await admin.auth.admin.inviteUserByEmail(
      data.email,
      { data: { name: data.name, role: data.role } }
    );

    if (authError) throw new Error(authError.message);
    if (!authData.user) throw new Error("Failed to create user account");

    // 2. Insert into custom users table (with email)
    const { error: dbError } = await admin.from("users").insert({
      id: authData.user.id,
      society_id: data.societyId,
      role: data.role,
      name: data.name,
      email: data.email,
      phone: data.phone || "",
      flat_no: data.flatNo,
    });

    if (dbError) throw new Error(dbError.message);

    // 3. Update extended info if provided
    if (data.phone || data.membersCount || data.aadhaarNumber) {
      await admin
        .from("users")
        .update({
          ...(data.phone && { phone: data.phone }),
          ...(data.membersCount && { members_count: data.membersCount }),
          ...(data.aadhaarNumber && { aadhaar_number: data.aadhaarNumber }),
        })
        .eq("id", authData.user.id);
    }

    await internalLogEvent(admin, {
      severity: "info",
      message: `Created new ${data.role} account: ${data.name} (${data.email}). Temporary password generated.`,
      source: "auth-service",
      societyId: data.societyId,
    });

    return { id: authData.user.id, email: data.email };
  });

// ─── Public Society Onboarding (Bypasses RLS for registration) ───
export const serverPublicOnboardSociety = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      name: z.string(),
      address: z.string(),
      totalFlats: z.number(),
      adminEmail: z.string().email(),
      subscriptionPlan: z.string(),
      paymentDetails: z.object({
        orderId: z.string(),
        paymentId: z.string(),
        signature: z.string(),
      }),
    })
  )
  .handler(async ({ data }) => {
    const { getSupabaseAdmin } = await import("@/lib/supabase-admin.server");
    const admin = getSupabaseAdmin();

    const crypto = await import("crypto");
    const key_secret = process.env.RAZORPAY_KEY_SECRET;
    if (!key_secret || key_secret === "placeholder_secret") {
      throw new Error("Razorpay API secret is missing or invalid");
    }
    const body = data.paymentDetails.orderId + "|" + data.paymentDetails.paymentId;
    const expectedSignature = crypto.createHmac("sha256", key_secret).update(body).digest("hex");
    if (expectedSignature !== data.paymentDetails.signature) {
      throw new Error("Invalid payment signature");
    }

    let baseSlug = data.name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
    
    let slug = baseSlug;
    let isUnique = false;
    let counter = 1;

    // 1. Check if slug exists, append number if it does
    while (!isUnique) {
      const { data: existing } = await admin.from("societies").select("id").eq("slug", slug).single();
      if (existing) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      } else {
        isUnique = true;
      }
    }

    // 2. Insert Society
    const { data: societyData, error: socError } = await admin
      .from("societies")
      .insert({
        name: data.name,
        slug,
        address: data.address,
        max_flats: data.totalFlats,
        plan: data.subscriptionPlan.toLowerCase(),
        status: "active",
      })
      .select()
      .single();

    if (socError || !societyData) throw new Error(socError?.message || "Failed to create society");

    // 3. Create Manager Account via Invite (No password leak)
    const { data: authData, error: authError } = await admin.auth.admin.inviteUserByEmail(
      data.adminEmail,
      { data: { name: "Manager - " + data.name, role: "manager" } }
    );

    if (authError) throw new Error(authError.message);

    await admin.from("users").insert({
      id: authData.user!.id,
      society_id: societyData.id,
      role: "manager",
      name: "Manager - " + data.name,
      email: data.adminEmail,
    });

    return { 
      success: true, 
      slug, 
      societyId: societyData.id, 
      email: data.adminEmail 
    };
  });

// ─── Delete Society (Bypasses RLS to allow cascading delete) ───
export const serverDeleteSociety = createServerFn({ method: "POST" })
  .inputValidator(z.object({ accessToken: z.string(), societyId: z.string().uuid() }))
  .handler(async ({ data }) => {
    const { getSupabaseAdmin } = await import("@/lib/supabase-admin.server");
    const admin = getSupabaseAdmin();
    await verifyServerAuth(admin, data.accessToken, ["admin"]);

    const { error } = await admin.from("societies").delete().eq("id", data.societyId);
    if (error) throw new Error(error.message);

    await internalLogEvent(admin, {
      severity: "warning",
      message: `Deleted society ${data.societyId}`,
      source: "admin-service",
    });

    return { success: true };
  });
// ─── Delete User Account (used by deleteResident & deleteGuard) ───
export const serverDeleteUser = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({ accessToken: z.string(), userId: z.string().uuid() }),
  )
  .handler(async ({ data }) => {
    const { getSupabaseAdmin } = await import("@/lib/supabase-admin.server");
    const admin = getSupabaseAdmin();
    await verifyServerAuth(admin, data.accessToken, ["manager", "admin"]);

    // Get user info for logging before deletion
    const { data: userData } = await admin
      .from("users")
      .select("name, role, society_id")
      .eq("id", data.userId)
      .single();

    // Delete from auth.users (cascades to public.users)
    const { error } = await admin.auth.admin.deleteUser(data.userId);
    if (error) throw new Error(error.message);

    if (userData) {
      await internalLogEvent(admin, {
        severity: "warning",
        message: `Deleted ${userData.role} account: ${userData.name}`,
        source: "auth-service",
        societyId: userData.society_id,
      });
    }

    return { success: true };
  });

// ─── Insert Flat (bypasses RLS) ───
export const serverInsertFlat = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      accessToken: z.string(),
      societyId: z.string().uuid(),
      flatNumber: z.string(),
      residentId: z.string().uuid(),
      flatType: z.string().optional(),
      occupancyType: z.string().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const { getSupabaseAdmin } = await import("@/lib/supabase-admin.server");
    const admin = getSupabaseAdmin();
    await verifyServerAuth(admin, data.accessToken, ["manager", "admin"]);

    const { error } = await admin.from("flats").insert({
      society_id: data.societyId,
      flat_number: data.flatNumber,
      resident_id: data.residentId,
      dues_amount: 0,
      dues_status: "paid",
      flat_type: data.flatType || "3 BHK",
      occupancy_type: data.occupancyType || "Owner",
      move_in_date: new Date().toISOString(),
    });

    if (error) throw new Error(error.message);
    return { success: true };
  });

// ─── Delete Flat (bypasses RLS) ───
export const serverDeleteFlat = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      accessToken: z.string(),
      societyId: z.string().uuid(),
      flatNumber: z.string(),
    }),
  )
  .handler(async ({ data }) => {
    const { getSupabaseAdmin } = await import("@/lib/supabase-admin.server");
    const admin = getSupabaseAdmin();
    await verifyServerAuth(admin, data.accessToken, ["manager", "admin"]);

    const { error } = await admin
      .from("flats")
      .delete()
      .eq("society_id", data.societyId)
      .eq("flat_number", data.flatNumber);

    if (error) throw new Error(error.message);
    return { success: true };
  });

// ─── Generate Bills (insert into bills table) ───
export const serverGenerateBills = createServerFn({ method: "POST" })
  .inputValidator(z.object({ accessToken: z.string(), societyId: z.string().uuid(),
    title: z.string(),
    amount: z.number(),
    dueDate: z.string(),
    flatNumber: z.string().optional()
  }))
  .handler(async ({ data }) => {
    const { getSupabaseAdmin } = await import("@/lib/supabase-admin.server");
    const admin = getSupabaseAdmin();
    await verifyServerAuth(admin, data.accessToken, ["manager", "admin"]);

    let targetFlats: string[] = [];

    if (data.flatNumber) {
      targetFlats.push(data.flatNumber);
    } else {
      const { data: flats, error: flatsError } = await admin
        .from("flats")
        .select("flat_number")
        .eq("society_id", data.societyId);
      if (flatsError) throw new Error(flatsError.message);
      if (flats) {
        targetFlats = flats.map((f: any) => f.flat_number);
      }
    }

    if (targetFlats.length === 0) {
      throw new Error("No flats found to bill.");
    }

    const billsToInsert = targetFlats.map(flatNo => ({
      society_id: data.societyId,
      flat_number: flatNo,
      title: data.title,
      amount: data.amount,
      status: "unpaid",
      due_date: data.dueDate,
    }));

    const { error } = await admin.from("bills").insert(billsToInsert);
    if (error) throw new Error(error.message);

    // 5. Update billing_history
    const now = new Date();
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthStr = monthNames[now.getMonth()];
    const year = now.getFullYear();
    const totalBilled = data.amount * targetFlats.length;

    const { data: hist } = await admin
      .from("billing_history")
      .select("*")
      .eq("society_id", data.societyId)
      .eq("month", monthStr)
      .eq("year", year)
      .single();

    if (hist) {
       await admin.from("billing_history").update({
         total_billed: Number(hist.total_billed) + totalBilled,
         total_pending: Number(hist.total_pending) + totalBilled
       }).eq("id", hist.id);
    } else {
       await admin.from("billing_history").insert({
          society_id: data.societyId,
          month: monthStr,
          year,
          total_billed: totalBilled,
          total_collected: 0,
          total_pending: totalBilled,
          flats_count: targetFlats.length, // approximation
       });
    }
    
    await internalLogEvent(admin, {
      severity: "info",
      message: `Generated bill "${data.title}" (₹${data.amount.toLocaleString("en-IN")}) for ${targetFlats.length} flat(s).`,
      source: "billing-service",
      societyId: data.societyId,
    });

    return { success: true, count: targetFlats.length };
  });

// ─── Create Poll (bypasses RLS) ───
export const serverCreatePoll = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      accessToken: z.string(),
      societyId: z.string().uuid(),
      question: z.string(),
      options: z.array(z.string()),
    }),
  )
  .handler(async ({ data }) => {
    const { getSupabaseAdmin } = await import("@/lib/supabase-admin.server");
    const admin = getSupabaseAdmin();
    await verifyServerAuth(admin, data.accessToken, ["manager", "admin"]);

    const { error } = await admin.from("polls").insert({
      society_id: data.societyId,
      question: data.question,
      options: data.options,
      active: true,
    });

    if (error) throw new Error(error.message);
    
    await internalLogEvent(admin, {
      severity: "info",
      message: `Created new community poll: "${data.question}"`,
      source: "community-service",
      societyId: data.societyId,
    });

    return { success: true };
  });

// ─── Send Bulk Reminders (insert notifications for all unpaid flats) ───
export const serverSendBulkReminders = createServerFn({ method: "POST" })
  .inputValidator(z.object({ accessToken: z.string(), societyId: z.string().uuid() }))
  .handler(async ({ data }) => {
    const { getSupabaseAdmin } = await import("@/lib/supabase-admin.server");
    const admin = getSupabaseAdmin();
    await verifyServerAuth(admin, data.accessToken, ["manager", "admin"]);

    // Get all unpaid flats
    const { data: unpaidFlats, error: flatsError } = await admin
      .from("flats")
      .select("flat_number, dues_amount")
      .eq("society_id", data.societyId)
      .neq("dues_status", "paid")
      .gt("dues_amount", 0);

    if (flatsError) throw new Error(flatsError.message);
    if (!unpaidFlats || unpaidFlats.length === 0) {
      return { success: true, count: 0, message: "No unpaid flats found" };
    }

    // Insert notifications for each unpaid flat
    const notifications = unpaidFlats.map((flat) => ({
      society_id: data.societyId,
      flat_number: flat.flat_number,
      type: "payment_reminder" as const,
      title: "Payment Reminder",
      body: `Your maintenance dues of ₹${Number(flat.dues_amount).toLocaleString("en-IN")} are pending. Please pay at your earliest convenience.`,
    }));

    const { error: notifError } = await admin.from("notifications").insert(notifications);
    if (notifError) throw new Error(notifError.message);

    await internalLogEvent(admin, {
      severity: "info",
      message: `Sent bulk payment reminders to ${unpaidFlats.length} unpaid flats`,
      source: "billing-service",
      societyId: data.societyId,
    });

    return { success: true, count: unpaidFlats.length, message: `Reminders sent to ${unpaidFlats.length} flats` };
  });

// ─── Get All Payments (admin revenue view — cross-society) ───
export const serverGetAllPayments = createServerFn({ method: "POST" }).inputValidator(z.object({ accessToken: z.string() })).handler(
  async ({ data }) => {
    const { getSupabaseAdmin } = await import("@/lib/supabase-admin.server");
    const admin = getSupabaseAdmin();
    await verifyServerAuth(admin, data.accessToken, ["admin"]);

    const { data: responseData, error } = await admin
      .from("payments")
      .select("month, amount, society_id");

    if (error) throw new Error(error.message);
    return responseData || [];
  },
);

// ─── Get Societies with Stats (Admin) ───
export const serverGetSocietiesWithStats = createServerFn({ method: "POST" }).inputValidator(z.object({ accessToken: z.string() })).handler(
  async ({ data }) => {
    const { getSupabaseAdmin } = await import("@/lib/supabase-admin.server");
    const admin = getSupabaseAdmin();
    await verifyServerAuth(admin, data.accessToken, ["admin"]);

    const { data: societies, error: socError } = await admin.from("societies").select("*");
    if (socError) throw new Error(socError.message);

    const { data: users, error: usersError } = await admin
      .from("users")
      .select("society_id")
      .eq("role", "resident");
      
    if (usersError) throw new Error(usersError.message);

    // Get actual payment totals per society
    const { data: payments } = await admin
      .from("payments")
      .select("society_id, amount");

    const revenuePerSociety: Record<string, number> = {};
    payments?.forEach(p => {
      if (!revenuePerSociety[p.society_id]) revenuePerSociety[p.society_id] = 0;
      revenuePerSociety[p.society_id] += Number(p.amount);
    });

    const residentCounts: Record<string, number> = {};
    users?.forEach(u => {
      if (!residentCounts[u.society_id]) residentCounts[u.society_id] = 0;
      residentCounts[u.society_id]++;
    });

    return societies.map((s: any) => ({
      id: s.id,
      name: s.name,
      address: s.address || "",
      totalFlats: s.max_flats,
      billAmount: s.bill_amount || 2500,
      adminEmail: "Admin Managed",
      subscriptionPlan: s.plan,
      status: s.status as "active" | "suspended",
      createdAt: s.created_at,
      activeSince: s.created_at,
      monthlyRevenue: revenuePerSociety[s.id] || 0,
      totalResidents: residentCounts[s.id] || 0,
    }));
  }
);

// ─── Get Monthly Growth (for calculating % change) ───
export const serverGetMonthlyGrowth = createServerFn({ method: "POST" })
  .inputValidator(z.object({ accessToken: z.string(), societyId: z.string().uuid() }))
  .handler(async ({ data }) => {
    const { getSupabaseAdmin } = await import("@/lib/supabase-admin.server");
    const admin = getSupabaseAdmin();
    await verifyServerAuth(admin, data.accessToken, ["manager", "admin"]);

    const { data: payments } = await admin
      .from("payments")
      .select("month, amount")
      .eq("society_id", data.societyId);

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const currentMonthIdx = new Date().getMonth();
    const prevMonthIdx = currentMonthIdx === 0 ? 11 : currentMonthIdx - 1;

    let currentMonthTotal = 0;
    let prevMonthTotal = 0;

    payments?.forEach(p => {
      const monthIdx = months.indexOf(p.month);
      if (monthIdx === currentMonthIdx) currentMonthTotal += Number(p.amount);
      if (monthIdx === prevMonthIdx) prevMonthTotal += Number(p.amount);
    });

    const growthPercent = prevMonthTotal === 0
      ? (currentMonthTotal > 0 ? 100 : 0)
      : Math.round(((currentMonthTotal - prevMonthTotal) / prevMonthTotal) * 100);

    return { currentMonthTotal, prevMonthTotal, growthPercent };
  });

// ─── System Logs ───
export async function internalLogEvent(adminClient: any, payload: {
  severity: "info" | "warning" | "error";
  message: string;
  source: string;
  societyId?: string;
}) {
  await adminClient.from("system_logs").insert({
    severity: payload.severity,
    message: payload.message,
    source: payload.source,
    ...(payload.societyId && { society_id: payload.societyId }),
  });
}

export const serverGetSystemLogs = createServerFn({ method: "POST" }).inputValidator(z.object({ accessToken: z.string() })).handler(
  async ({ data }) => {
    const { getSupabaseAdmin } = await import("@/lib/supabase-admin.server");
    const admin = getSupabaseAdmin();
    await verifyServerAuth(admin, data.accessToken, ["admin"]);

    const { data: responseData, error } = await admin
      .from("system_logs")
      .select("*")
      .order("timestamp", { ascending: false })
      .limit(100);

    if (error) throw new Error(error.message);
    return responseData || [];
  }
);

// ─── Save branding during onboarding (no auth needed, uses admin) ───
export const serverSaveBranding = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      societyId: z.string().uuid(),
      logo_url: z.string().optional(),
      banner_url: z.string().optional(),
      tagline: z.string().optional(),
      primary_color: z.string().optional(),
      secondary_color: z.string().optional(),
      society_photos: z.array(z.string()).optional(),
      contact_phone: z.string().optional(),
      contact_email: z.string().optional(),
    })
  )
  .handler(async ({ data }) => {
    const { getSupabaseAdmin } = await import("@/lib/supabase-admin.server");
    const admin = getSupabaseAdmin();

    const { societyId, ...brandingData } = data;

    const { error } = await admin
      .from("society_settings")
      .upsert({
        society_id: societyId,
        ...brandingData,
        updated_at: new Date().toISOString(),
      });

    if (error) throw new Error(error.message);

    // Also update logo_url and primary_color on the societies table itself
    if (data.logo_url || data.primary_color) {
      const updateData: any = {};
      if (data.logo_url) updateData.logo_url = data.logo_url;
      if (data.primary_color) updateData.primary_color = data.primary_color;

      await admin
        .from("societies")
        .update(updateData)
        .eq("id", societyId);
    }

    return { success: true };
  });
