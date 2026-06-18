import re

with open('src/lib/api/admin.functions.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Add verifyServerAuth
helper = '''// ─── Helper: Verify Auth ───
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

'''
content = content.replace('function generateRandomPassword', helper + 'function generateRandomPassword')

# 1. Update serverCreateAccount
old_create = '''export const serverCreateAccount = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      email: z.string().email(),
      password: z.string().min(6).optional(), // Optional — will generate random if not provided
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

    // Generate random password if not provided
    const password = data.password || generateRandomPassword();

    // 1. Create user in Supabase Auth
    const { data: authData, error: authError } =
      await admin.auth.admin.createUser({
        email: data.email,
        password,
        email_confirm: true,
        user_metadata: { name: data.name, role: data.role },
      });'''

new_create = '''export const serverCreateAccount = createServerFn({ method: "POST" })
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
    );'''

content = content.replace(old_create, new_create)
content = content.replace('return { id: authData.user.id, email: data.email, tempPassword: password };', 'return { id: authData.user.id, email: data.email };')

# 2. Update serverPublicOnboardSociety
old_onboard_val = '''  .inputValidator(
    z.object({
      name: z.string(),
      address: z.string(),
      totalFlats: z.number(),
      adminEmail: z.string().email(),
      subscriptionPlan: z.string(),
    })
  )'''
new_onboard_val = '''  .inputValidator(
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
  )'''
content = content.replace(old_onboard_val, new_onboard_val)

old_onboard_hand = '''  .handler(async ({ data }) => {
    const { getSupabaseAdmin } = await import("@/lib/supabase-admin.server");
    const admin = getSupabaseAdmin();

    let baseSlug = data.name'''
new_onboard_hand = '''  .handler(async ({ data }) => {
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

    let baseSlug = data.name'''
content = content.replace(old_onboard_hand, new_onboard_hand)

# 3. Add accessToken to all other functions
functions_to_update = [
    ('serverDeleteSociety', 'z.object({ societyId: z.string().uuid() })', 'z.object({ accessToken: z.string(), societyId: z.string().uuid() })', '["admin"]'),
    ('serverDeleteUser', 'z.object({\\n      userId: z.string().uuid(),\\n    })', 'z.object({ accessToken: z.string(), userId: z.string().uuid() })', '["manager", "admin"]'),
    ('serverInsertFlat', 'z.object({\\n      societyId: z.string().uuid(),', 'z.object({\\n      accessToken: z.string(),\\n      societyId: z.string().uuid(),', '["manager", "admin"]'),
    ('serverDeleteFlat', 'z.object({\\n      societyId: z.string().uuid(),', 'z.object({\\n      accessToken: z.string(),\\n      societyId: z.string().uuid(),', '["manager", "admin"]'),
    ('serverGenerateBills', 'z.object({ \\n    societyId: z.string().uuid(),', 'z.object({ accessToken: z.string(), societyId: z.string().uuid(),', '["manager", "admin"]'),
    ('serverCreatePoll', 'z.object({\\n      societyId: z.string().uuid(),', 'z.object({\\n      accessToken: z.string(),\\n      societyId: z.string().uuid(),', '["manager", "admin"]'),
    ('serverSendBulkReminders', 'z.object({ societyId: z.string().uuid() })', 'z.object({ accessToken: z.string(), societyId: z.string().uuid() })', '["manager", "admin"]'),
    ('serverGetMonthlyGrowth', 'z.object({ societyId: z.string().uuid() })', 'z.object({ accessToken: z.string(), societyId: z.string().uuid() })', '["manager", "admin"]'),
]

for fn, old_val, new_val, roles in functions_to_update:
    content = content.replace(old_val, new_val)
    content = re.sub(rf'(export const {fn} =.*?const admin = getSupabaseAdmin\(\);\n)', rf'\\1    await verifyServerAuth(admin, data.accessToken, {roles});\n', content, flags=re.DOTALL)

# For parameter-less functions like serverGetAllPayments, serverGetSocietiesWithStats, serverGetSystemLogs
for fn in ['serverGetAllPayments', 'serverGetSocietiesWithStats', 'serverGetSystemLogs']:
    content = content.replace(f'export const {fn} = createServerFn({{ method: "GET" }}).handler(', f'export const {fn} = createServerFn({{ method: "POST" }}).inputValidator(z.object({{ accessToken: z.string() }})).handler(')
    content = re.sub(rf'(export const {fn}.*?const admin = getSupabaseAdmin\(\);\n)', rf'\\1    await verifyServerAuth(admin, data.accessToken, ["admin"]);\n', content, flags=re.DOTALL)

with open('src/lib/api/admin.functions.ts', 'w', encoding='utf-8') as f:
    f.write(content)
print("Patched admin.functions.ts")
