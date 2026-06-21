import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import admin from 'npm:firebase-admin@11.11.0'

// Initialize Firebase Admin (Only initialize once)
if (!admin.apps.length) {
  try {
    const serviceAccount = JSON.parse(Deno.env.get('FIREBASE_SERVICE_ACCOUNT') || '{}')
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    })
  } catch (error) {
    console.error("Firebase Admin initialization failed. Make sure FIREBASE_SERVICE_ACCOUNT secret is set.", error)
  }
}

serve(async (req) => {
  const authHeader = req.headers.get('Authorization')!
  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    { global: { headers: { Authorization: authHeader } } }
  )

  const payload = await req.json()
  const { type, record } = payload

  console.log(`Processing notification for table: ${record.table}`)

  try {
    let targetUserId = null;
    let title = 'Resident HQ Alert';
    let body = 'You have a new notification.';

    // Logic to map database events to notification content
    if (record.table === 'visitors') {
      targetUserId = record.host_id; // The resident to notify
      title = 'Visitor Alert';
      body = `${record.name} is at the gate. Please approve or deny.`;
    } else if (record.table === 'notices') {
      title = 'New Notice';
      body = record.title;
    }

    if (!targetUserId) {
      return new Response(JSON.stringify({ message: "No target user specified" }), { status: 200 })
    }

    // Fetch the FCM token for the target user
    const { data: tokens, error } = await supabaseClient
      .from('user_fcm_tokens')
      .select('token')
      .eq('user_id', targetUserId)

    if (error || !tokens || tokens.length === 0) {
      console.log('No FCM tokens found for user:', targetUserId)
      return new Response(JSON.stringify({ message: "No tokens found" }), { status: 200 })
    }

    // Send the push notification via Firebase Admin SDK
    const pushTokens = tokens.map(t => t.token);
    const message = {
      notification: { title, body },
      tokens: pushTokens,
    };

    const response = await admin.messaging().sendMulticast(message);
    console.log(`Successfully sent message: ${response.successCount} successes, ${response.failureCount} failures.`);

    return new Response(
      JSON.stringify({ success: true, message: "Push notification sent" }),
      { headers: { "Content-Type": "application/json" } },
    )
  } catch (err) {
    console.error("Failed to process notification:", err)
    return new Response(String(err?.message ?? err), { status: 500 })
  }
})
