-- Add deduction_amount column to employees table
ALTER TABLE employees 
ADD COLUMN IF NOT EXISTS deduction_amount NUMERIC DEFAULT 0;

COMMENT ON COLUMN employees.deduction_amount IS 'Amount to deduct per day of absence';
