
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkSchedules() {
  const { count, error } = await supabase
    .from('shift_schedules')
    .select('*', { count: 'exact', head: true });

  if (error) {
    console.error("Error fetching schedules:", error);
  } else {
    console.log(`Total shift schedules found: ${count}`);
  }
}

checkSchedules();
