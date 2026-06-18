import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(__dirname, '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log("Seeding service providers...");

  // Get a valid society ID
  const { data: societies, error: socError } = await supabase.from('societies').select('id').limit(1);
  if (socError || !societies || societies.length === 0) {
    console.error("No societies found to attach providers to.");
    return;
  }
  const societyId = societies[0].id;

  const providers = [
    { society_id: societyId, name: "Suresh Plumber", category: "Plumbing", phone: "9876543210", rating: 4.8, reviews_count: 124 },
    { society_id: societyId, name: "Ramesh Electrician", category: "Electrical", phone: "9876543211", rating: 4.5, reviews_count: 89 },
    { society_id: societyId, name: "Anita Maid Services", category: "Maids", phone: "9876543212", rating: 4.9, reviews_count: 210 },
    { society_id: societyId, name: "Priya Cooks", category: "Cook", phone: "9876543213", rating: 4.7, reviews_count: 156 },
    { society_id: societyId, name: "Sparkle Car Wash", category: "Car Wash", phone: "9876543214", rating: 4.6, reviews_count: 342 },
    { society_id: societyId, name: "Sharma Tuitions", category: "Tuition", phone: "9876543215", rating: 4.9, reviews_count: 55 },
  ];

  const { error } = await supabase.from('service_providers').insert(providers);
  
  if (error) {
    console.error("Seeding failed:", error);
  } else {
    console.log("Successfully seeded 6 service providers!");
  }
}

seed();
