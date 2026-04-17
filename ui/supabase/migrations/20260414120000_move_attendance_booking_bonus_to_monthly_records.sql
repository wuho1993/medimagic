ALTER TABLE public.monthly_commission_records
  ADD COLUMN IF NOT EXISTS attendance_bonus_applied BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS attendance_bonus_amount NUMERIC NOT NULL DEFAULT 0 CHECK (attendance_bonus_amount >= 0),
  ADD COLUMN IF NOT EXISTS booking_bonus_applied BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS booking_bonus_amount NUMERIC NOT NULL DEFAULT 0 CHECK (booking_bonus_amount >= 0);

COMMENT ON COLUMN public.monthly_commission_records.attendance_bonus_applied IS 'Whether attendance bonus is applied for the employee in the given month';
COMMENT ON COLUMN public.monthly_commission_records.attendance_bonus_amount IS 'Snapshot of attendance bonus amount applied for the employee in the given month';
COMMENT ON COLUMN public.monthly_commission_records.booking_bonus_applied IS 'Whether booking bonus is applied for the employee in the given month';
COMMENT ON COLUMN public.monthly_commission_records.booking_bonus_amount IS 'Snapshot of booking bonus amount applied for the employee in the given month';