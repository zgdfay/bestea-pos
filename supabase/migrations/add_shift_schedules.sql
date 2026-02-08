-- =============================================
-- SHIFT SCHEDULES TABLE
-- For storing employee weekly shift schedules
-- =============================================

CREATE TABLE IF NOT EXISTS shift_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
    week_start DATE NOT NULL, -- Monday of the week (e.g., '2026-02-03')
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Monday, 6=Sunday
    shift_type VARCHAR(20) NOT NULL DEFAULT 'Libur' CHECK (shift_type IN ('Pagi', 'Sore', 'Office', 'Libur')),
    start_time TIME, -- e.g., '08:00'
    end_time TIME,   -- e.g., '15:00'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(employee_id, week_start, day_of_week)
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_shift_schedules_employee ON shift_schedules(employee_id);
CREATE INDEX IF NOT EXISTS idx_shift_schedules_week ON shift_schedules(week_start);
CREATE INDEX IF NOT EXISTS idx_shift_schedules_branch ON shift_schedules(branch_id);

-- Enable RLS
ALTER TABLE shift_schedules ENABLE ROW LEVEL SECURITY;

-- Policies for public access (like other tables)
CREATE POLICY "Allow public read" ON shift_schedules FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON shift_schedules FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON shift_schedules FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON shift_schedules FOR DELETE USING (true);

-- Trigger for updated_at
CREATE TRIGGER trigger_shift_schedules_updated_at
    BEFORE UPDATE ON shift_schedules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
