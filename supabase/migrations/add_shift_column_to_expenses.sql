-- Add shift_session_id column to expenses table
ALTER TABLE expenses
ADD COLUMN IF NOT EXISTS shift_session_id UUID REFERENCES shift_sessions(id);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_expenses_shift_session_id ON expenses(shift_session_id);
