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

    // 1. Find user by email using Admin API
    const { data: listUsers, error: listErr } = await adminClient.auth.admin.listUsers()
    if (listErr) throw listErr

    const targetUser = listUsers.users.find(u => u.email === email)
    if (!targetUser) throw new Error("User not found")

    // 2. Update password
    const { error: updateErr } = await adminClient.auth.admin.updateUserById(targetUser.id, {
      password: newPassword
    })

    if (updateErr) throw updateErr

    return new Response(JSON.stringify({ success: true }), { headers: { "Content-Type": "application/json", ...corsHeaders } })

  } catch (err: any) {
    console.error(err)
    return new Response(JSON.stringify({ error: err.message }), { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } })
  }
})
