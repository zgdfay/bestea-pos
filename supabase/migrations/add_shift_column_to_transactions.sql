-- Add shift_session_id column to transactions table
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS shift_session_id UUID REFERENCES shift_sessions(id);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_transactions_shift_session_id ON transactions(shift_session_id);
