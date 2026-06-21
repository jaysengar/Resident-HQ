import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env" });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testMatch() {
  const societyId = "d7d13063-470a-4a69-807d-fc794b1a4a49"; // Get from auth users maybe?
  
  // Find all users in the society
  const { data: allUsers } = await supabase.from("users").select("id, name, society_id, flat_no");
  console.log("All users:", allUsers);
  
}

testMatch();
