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

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const authHeader = req.headers.get('Authorization')!
  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    { global: { headers: { Authorization: authHeader } } }
  )

  try {
    const payload = await req.json()
    const { title, body, userIds, societyId, flatNumber } = payload

    console.log(`Processing notification: ${title}`)

    let targetUserIds: string[] = [];

    if (userIds && userIds.length > 0) {
      targetUserIds = userIds;
    } else if (societyId) {
      // Find users by societyId
      let query = supabaseClient.from('users').select('id').eq('society_id', societyId);
      if (flatNumber) {
        query = query.eq('flat_no', flatNumber);
      }
      const { data: users, error: usersErr } = await query;
      if (!usersErr && users) {
        targetUserIds = users.map(u => u.id);
      }
    }

    if (targetUserIds.length === 0) {
      return new Response(JSON.stringify({ message: "No target users found" }), { status: 200, headers: corsHeaders })
    }

    // Fetch the FCM tokens for the target users
    const { data: tokens, error } = await supabaseClient
      .from('user_fcm_tokens')
      .select('token')
      .in('user_id', targetUserIds)

    if (error || !tokens || tokens.length === 0) {
      console.log('No FCM tokens found for users:', targetUserIds)
      return new Response(JSON.stringify({ message: "No tokens found" }), { status: 200, headers: corsHeaders })
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
      { headers: { "Content-Type": "application/json", ...corsHeaders } },
    )
  } catch (err) {
    console.error("Failed to process notification:", err)
    return new Response(String(err?.message ?? err), { status: 500, headers: corsHeaders })
  }
})
