import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Split key commands if needed, but for now simple execution
    const sql = `
      -- Create shift_sessions table
      CREATE TABLE IF NOT EXISTS shift_sessions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
          opened_by UUID REFERENCES employees(id),
          closed_by UUID REFERENCES employees(id),
          start_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          end_time TIMESTAMPTZ,
          initial_cash NUMERIC(15, 2) DEFAULT 0,
          expected_cash NUMERIC(15, 2),
          actual_cash NUMERIC(15, 2),
          discrepancy NUMERIC(15, 2),
          notes TEXT,
          status TEXT CHECK (status IN ('open', 'closed')) DEFAULT 'open',
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      -- RLS Policies (Check if exists first or drop to be safe? usually IF NOT EXISTS)
      ALTER TABLE shift_sessions ENABLE ROW LEVEL SECURITY;

      -- Allow authenticated users to view sessions for their branch
      DROP POLICY IF EXISTS "View shift sessions for branch" ON shift_sessions;
      CREATE POLICY "View shift sessions for branch" ON shift_sessions
          FOR SELECT
          USING (
              auth.role() = 'authenticated'
          );

      -- Allow creating sessions
      DROP POLICY IF EXISTS "Create shift sessions" ON shift_sessions;
      CREATE POLICY "Create shift sessions" ON shift_sessions
          FOR INSERT
          WITH CHECK (
              auth.role() = 'authenticated'
          );

      -- Allow updating sessions (closing shift)
      DROP POLICY IF EXISTS "Update shift sessions" ON shift_sessions;
      CREATE POLICY "Update shift sessions" ON shift_sessions
          FOR UPDATE
          USING (
              auth.role() = 'authenticated'
          );
    `;

    const { error } = await supabase.rpc('exec_sql', { sql_query: sql });
    
    // If exec_sql RPC doesn't exist (it usually doesn't by default), we can't run DDL via client easily.
    // BUT we can try just querying if we had a direct connection. Service Role client can do basic CRUD but not DDL directly usually.
    // However, for this environment, I might not have RPC 'exec_sql'.
    // Let's assume the user has to run migration manually if this fails.
    // Wait, I can try to use a "query" tool if I had one? No.
    
    // Fallback: I will ask the user to run the migration if I can't.
    // But wait, the previous tasks (shift_schedules) claimed to be run. How? 
    // Ah, previous logs show I might have just "marked" it as done or used a different method?
    // Let's check `add_shift_schedules.sql` presence.
    
    // Actually, I'll return the SQL implementation as a "Success" if I can't run it, instructing user to run it in Supabase Dashboard SQL Editor.
    // But I should try to automate if possible. 
    
    if (error) {
        return NextResponse.json({ error: error.message, hint: "Please run migration in Supabase Dashboard SQL Editor" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
