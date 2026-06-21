import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')!
    
    // Check caller is admin (optional extra security since the function itself is public)
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user }, error: authErr } = await supabaseClient.auth.getUser()
    if (authErr || !user) throw new Error("Unauthorized")

    // Check if caller is super admin
    const { data: callerData } = await supabaseClient.from('users').select('role').eq('id', user.id).single()
    if (callerData?.role !== 'admin') throw new Error("Forbidden: Super Admin only")

    const { email, newPassword } = await req.json()
    if (!email || !newPassword) throw new Error("Email and new password required")

    // Use service role to update the target user
    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 1. Find user by email using database query (case-insensitive)
    const { data: targetUser, error: listErr } = await adminClient.from("users").select("id").ilike("email", email).maybeSingle()
    if (listErr) throw new Error("Database error while looking up user: " + listErr.message)
    if (!targetUser) throw new Error("User not found in database for email: " + email)

    // 2. Update password and auto-confirm the account so they can login immediately
    const { error: updateErr } = await adminClient.auth.admin.updateUserById(targetUser.id, {
      password: newPassword,
      email_confirm: true
    })

    if (updateErr) throw new Error("Auth update failed: " + updateErr.message)

    return new Response(JSON.stringify({ success: true }), { headers: { "Content-Type": "application/json", ...corsHeaders } })

  } catch (err: any) {
    console.error(err)
    // Return 200 so the frontend fetch doesn't throw a generic HTTP error and we can read the JSON error message
    return new Response(JSON.stringify({ error: err.message || "Unknown error occurred" }), { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } })
  }
})
