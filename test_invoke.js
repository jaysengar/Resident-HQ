import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env" });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testPush() {
  console.log("Invoking Edge Function...");
  const { data, error } = await supabase.functions.invoke("send-notification", {
    body: {
      title: "Test from Server",
      body: "If you see this, push notifications are finally working!",
      userIds: ["36a1c9b3-2700-42a5-831b-61a9a48ab9fb"] // The user from the token check
    }
  });

  if (error) {
    console.error("Invoke Error:", error);
    if (error.context) {
       const text = await error.context.text();
       console.error("Response text:", text);
    }
  } else {
    console.log("Success Response:", data);
  }
}

testPush();
