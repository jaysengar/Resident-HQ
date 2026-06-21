import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import Razorpay from "razorpay";
import crypto from "crypto";

// ─── Create Razorpay Order ───
export const serverCreateRazorpayOrder = createServerFn({ method: "POST" })
  .inputValidator(z.object({ amount: z.number(), societyId: z.string().uuid().optional() }))
  .handler(async ({ data }) => {
    let key_id = process.env.VITE_RAZORPAY_KEY_ID;
    let key_secret = process.env.RAZORPAY_KEY_SECRET;

    if (data.societyId) {
      try {
        const { getSupabaseAdmin } = await import("@/lib/supabase-admin.server");
        const admin = getSupabaseAdmin();
        const { data: settingsResult } = await admin
          .from("society_settings")
          .select("razorpay_key_id, razorpay_key_secret")
          .eq("society_id", data.societyId)
          .single();
        const settings = settingsResult as any;

        if (settings?.razorpay_key_id && settings?.razorpay_key_secret) {
          key_id = settings.razorpay_key_id;
          key_secret = settings.razorpay_key_secret;
        }
      } catch (err) {
        console.warn("Failed to fetch custom society settings, falling back to global keys", err);
      }
    }

    if (!key_id || !key_secret || key_secret === "placeholder_secret") {
      console.warn("Razorpay API keys missing or invalid, using mock mode.");
      return {
        orderId: "mock_order_" + Date.now(),
        amount: Math.round(data.amount * 100),
        currency: "INR",
        mocked: true,
        razorpayKeyId: "mock_key",
      };
    }

    try {
      const razorpay = new Razorpay({ key_id, key_secret });

      const options = {
        amount: Math.round(data.amount * 100), // amount in smallest currency unit (paise)
        currency: "INR",
        receipt: "receipt_" + Date.now(),
      };

      const order = await razorpay.orders.create(options);
      
      return {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        mocked: false,
        razorpayKeyId: key_id,
      };
    } catch (error: any) {
      console.error("Razorpay Order Error:", error);
      console.warn("Falling back to mock payment mode due to Razorpay error.");
      return {
        orderId: "mock_order_" + Date.now(),
        amount: Math.round(data.amount * 100),
        currency: "INR",
        mocked: true,
        razorpayKeyId: "mock_key",
      };
    }
  });

// ─── Verify Razorpay Signature ───
export const serverVerifyRazorpayPayment = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      orderId: z.string(),
      paymentId: z.string(),
      signature: z.string(),
      societyId: z.string().uuid().optional(),
    })
  )
  .handler(async ({ data }) => {
    let key_secret = process.env.RAZORPAY_KEY_SECRET;

    if (data.societyId) {
      try {
        const { getSupabaseAdmin } = await import("@/lib/supabase-admin.server");
        const admin = getSupabaseAdmin();
        const { data: settingsResult } = await admin
          .from("society_settings")
          .select("razorpay_key_secret")
          .eq("society_id", data.societyId)
          .single();
        const settings = settingsResult as any;

        if (settings?.razorpay_key_secret) {
          key_secret = settings.razorpay_key_secret;
        }
      } catch (err) {
        console.warn("Failed to fetch custom society settings for verification", err);
      }
    }
    
    if (!key_secret || key_secret === "placeholder_secret") {
      throw new Error("Razorpay API secret is missing or invalid in .env");
    }

    const body = data.orderId + "|" + data.paymentId;
    const expectedSignature = crypto
      .createHmac("sha256", key_secret)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== data.signature) {
      throw new Error("Invalid payment signature");
    }

    return { success: true };
  });

// ─── Renew Subscription ───
export const serverRenewSubscription = createServerFn({ method: "POST" })
  .inputValidator(z.object({ societyId: z.string().uuid() }))
  .handler(async ({ data }) => {
    const { getSupabaseAdmin } = await import("@/lib/supabase-admin.server");
    const admin = getSupabaseAdmin();

    const { data: society } = await (admin.from("societies") as any)
      .select("subscription_expires_at")
      .eq("id", data.societyId)
      .single();

    if (!society) throw new Error("Society not found");

    const currentExpiry = society.subscription_expires_at 
      ? new Date(society.subscription_expires_at) 
      : new Date();
      
    // If already expired, start from today. If not, add 30 days to existing expiry
    const newExpiry = currentExpiry < new Date() 
      ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      : new Date(currentExpiry.getTime() + 30 * 24 * 60 * 60 * 1000);

    const { error } = await (admin.from("societies") as any)
      .update({ subscription_expires_at: newExpiry.toISOString() })
      .eq("id", data.societyId);

    if (error) throw new Error("Failed to renew subscription: " + error.message);

    return { success: true, newExpiry: newExpiry.toISOString() };
  });

// ─── Record Payment & Mark Bill Paid ───
export const serverPayBill = createServerFn({ method: "POST" })
  .inputValidator(z.object({
    accessToken: z.string(),
    societyId: z.string(),
    flatNumber: z.string().optional().nullable(),
    billId: z.string(),
    amount: z.number(),
    method: z.string(),
  }))
  .handler(async ({ data }) => {
    const { getSupabaseAdmin } = await import("@/lib/supabase-admin.server");
    const admin = getSupabaseAdmin();
    const month = new Date().toLocaleDateString("en-IN", { month: "short", year: "numeric" });

    // 1. Insert payment record
    const { error: insertErr } = await admin.from("payments").insert({
      society_id: data.societyId,
      flat_number: data.flatNumber || "UNKNOWN",
      amount: data.amount,
      method: data.method,
      month
    });
    
    if (insertErr) throw new Error("Failed to record payment: " + insertErr.message);

    // 2. Update bills table to set status to paid
    const { error: updateErr } = await admin
      .from("bills")
      .update({ status: "paid" })
      .eq("id", data.billId)
      .eq("society_id", data.societyId);

    if (updateErr) throw new Error("Failed to update bill status: " + updateErr.message);

    // 3. Update flats table dues
    if (data.flatNumber && data.flatNumber !== "UNKNOWN") {
      const { data: flatData } = await admin.from("flats")
        .select("dues_amount")
        .eq("society_id", data.societyId)
        .eq("flat_number", data.flatNumber)
        .single();
        
      const currentDues = flatData?.dues_amount || 0;
      const newDues = Math.max(0, currentDues - data.amount);
      await admin.from("flats").update({
        dues_amount: newDues,
        dues_status: newDues > 0 ? "partial" : "paid"
      }).eq("society_id", data.societyId).eq("flat_number", data.flatNumber);
    }

    return { success: true };
  });
