import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env" });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkTokens() {
  const { data, error } = await supabase.from("user_fcm_tokens").select("*");
  if (error) {
    console.error("Error fetching tokens:", error);
    return;
  }
  
  console.log(`Found ${data.length} FCM tokens registered in the database:`);
  data.forEach((row) => {
    console.log(`User ID: ${row.user_id}`);
    console.log(`Token: ${row.token.substring(0, 30)}...`);
    console.log(`Updated At: ${row.updated_at}`);
    console.log("------------------------");
  });
}

checkTokens();
