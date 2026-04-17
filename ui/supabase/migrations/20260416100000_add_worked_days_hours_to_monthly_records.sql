ALTER TABLE public.monthly_commission_records
  ADD COLUMN IF NOT EXISTS worked_days numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS worked_hours numeric NOT NULL DEFAULT 0;

ALTER TABLE public.monthly_commission_records
  DROP CONSTRAINT IF EXISTS monthly_commission_records_worked_days_check,
  DROP CONSTRAINT IF EXISTS monthly_commission_records_worked_hours_check;

ALTER TABLE public.monthly_commission_records
  ADD CONSTRAINT monthly_commission_records_worked_days_check CHECK (worked_days >= 0),
  ADD CONSTRAINT monthly_commission_records_worked_hours_check CHECK (worked_hours >= 0);

COMMENT ON COLUMN public.monthly_commission_records.worked_days IS 'Worked days entered for daily-paid employees in the given month';
COMMENT ON COLUMN public.monthly_commission_records.worked_hours IS 'Worked hours entered for hourly-paid employees in the given month';
