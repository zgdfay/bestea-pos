-- Migration: Add breakdown columns to payroll_records for snapshotting
ALTER TABLE payroll_records 
ADD COLUMN IF NOT EXISTS attendance_days INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS excused_days INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS alpha_days INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS scheduled_days INTEGER DEFAULT 0;

-- Optionally, make sure deductions column is used for total_deduction
-- It already exists in schema.sql
