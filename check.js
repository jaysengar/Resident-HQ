import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xcielbbdgzeqtzkgxugx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhjaWVsYmJkZ3plcXR6a2d4dWd4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTYxNDAzOCwiZXhwIjoyMDk3MTkwMDM4fQ.2Gy-z1ESsu95ynEQN6OrbTMu1k3nfLFJ4GX4b68dQRs';

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data, error } = await supabase.rpc('run_sql', { query: "SELECT pg_get_constraintdef(oid) FROM pg_constraint WHERE conname = 'notifications_type_check'" });
  console.log('Constraint:', data, error);
}

check();
