
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Load .env.local manually
const envPath = path.resolve(process.cwd(), '.env.local');
let envConfig: any = {};

try {
  const envFile = fs.readFileSync(envPath, 'utf8');
  envFile.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
      envConfig[key.trim()] = value.trim();
    }
  });
} catch (e) {
  console.log('Error loading .env.local', e);
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || envConfig.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

// NOTE: We need SERVICE_ROLE_KEY to modify policies/RLS usually, unless anon has rights (unlikely).
// If service role key is not available in env, this might fail.
// Codebase assumes NEXT_PUBLIC_SUPABASE_ANON_KEY.
// But changing policies requires admin rigths.
// If the user's local instance allows anon to do DDL (unlikely), we try anon.
// Otherwise we might need the user to run it in Supabase dashboard.
// Let's try with what we have. If we lack service key, we'll try anon (but probably fail).
// Actually, for local dev with `npm run dev`, usually there is no service key in .env.local?
// Wait, looking at `check_roles.ts` output, it worked with anon key for SELECT.

if (!supabaseKey) {
  console.error("No service role key found. Using anon key, but DDL might fail.");
}

const keyToUse = supabaseKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || envConfig.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, keyToUse!);

const sql = `
DO $$
BEGIN
    -- Enable RLS for payroll_records
    ALTER TABLE payroll_records ENABLE ROW LEVEL SECURITY;

    -- Drop existing policies if any to avoid conflict
    DROP POLICY IF EXISTS "Allow authenticated insert" ON payroll_records;
    DROP POLICY IF EXISTS "Allow authenticated update" ON payroll_records;
    DROP POLICY IF EXISTS "Allow authenticated delete" ON payroll_records;

    -- Create policies
    CREATE POLICY "Allow authenticated insert" ON payroll_records FOR INSERT TO authenticated WITH CHECK (true);
    CREATE POLICY "Allow authenticated update" ON payroll_records FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
    CREATE POLICY "Allow authenticated delete" ON payroll_records FOR DELETE TO authenticated USING (true);
END
$$;
`;

async function runMigration() {
  const { error } = await supabase.rpc('exec_sql', { query: sql });
  // Note: exec_sql is a custom RPC usually needed for raw SQL. 
  // Supabase-js doesn't have a method to run raw SQL directly unless an RPC function exists.
  // Codebase doesn't seem to have `exec_sql`.

  // Alternative: Use postgres.js or similar if available, but we only have supabase-js.
  // WE CANNOT RUN RAW SQL via supabase-js client without a helper function in DB.
  
  // So I cannot verify this step automatically if `exec_sql` or similar doesn't exist.
  // The user might have to run the migration manually.
  
  // However, I can try to use `POST` to my own API to run it? No.
  
  // Wait, I can't apply migration easily if I don't have db access.
  // But I can instruct the user.
  
  // But I said "Saya akan menerapkan perbaikan database sekarang".
  // I should check if there is a way.
  
  console.log("SQL Migration must be run manually or via Supabase Dashboard SQL Editor.");
  console.log("SQL Content:", sql);
}

// Since I cannot run SQL directly, I will just log it.
runMigration();
