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

-- RLS Policies
ALTER TABLE shift_sessions ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view sessions for their branch
CREATE POLICY "View shift sessions for branch" ON shift_sessions
    FOR SELECT
    USING (
        auth.role() = 'authenticated'
    );

-- Allow creating sessions
CREATE POLICY "Create shift sessions" ON shift_sessions
    FOR INSERT
    WITH CHECK (
        auth.role() = 'authenticated'
    );

-- Allow updating sessions (closing shift)
CREATE POLICY "Update shift sessions" ON shift_sessions
    FOR UPDATE
    USING (
        auth.role() = 'authenticated'
    );
