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
      title: "Visitor Alert Test",
      body: "Test guard visitor alert to flat A-1",
      societyId: "1399295b-c904-44e9-8f94-454fdcb537c0",
      flatNumber: "A-1"
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
