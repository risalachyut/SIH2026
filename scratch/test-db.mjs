import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("Missing env vars");
  process.exit(1);
}

const supabase = createClient(url, key);

async function checkDb() {
  console.log("Checking profiles table...");
  const { data, error } = await supabase.from('profiles').select('*').limit(1);
  if (error) {
    console.error("ERROR querying profiles:", error.message);
  } else {
    console.log("Profiles query success. Data:", data);
  }
}

checkDb();
