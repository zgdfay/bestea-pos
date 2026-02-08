
-- Enable RLS for payroll_records (already enabled, but good to be safe)
ALTER TABLE payroll_records ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to INSERT payroll records
CREATE POLICY "Allow authenticated insert" ON payroll_records FOR INSERT TO authenticated WITH CHECK (true);

-- Allow authenticated users to UPDATE payroll records
CREATE POLICY "Allow authenticated update" ON payroll_records FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- Allow authenticated users to DELETE payroll records
CREATE POLICY "Allow authenticated delete" ON payroll_records FOR DELETE TO authenticated USING (true);
