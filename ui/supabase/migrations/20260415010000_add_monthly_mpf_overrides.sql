ALTER TABLE public.monthly_commission_records
  ADD COLUMN IF NOT EXISTS mpf_ee_applied boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS mpf_ee_amount numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS mpf_ee_manual_override boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS mpf_er_applied boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS mpf_er_amount numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS mpf_er_manual_override boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN public.monthly_commission_records.mpf_ee_applied IS 'Whether employee MPF contribution applies for the month';
COMMENT ON COLUMN public.monthly_commission_records.mpf_ee_amount IS 'Employee MPF contribution amount for the month';
COMMENT ON COLUMN public.monthly_commission_records.mpf_ee_manual_override IS 'Whether employee MPF amount is manually overridden';
COMMENT ON COLUMN public.monthly_commission_records.mpf_er_applied IS 'Whether employer MPF contribution applies for the month';
COMMENT ON COLUMN public.monthly_commission_records.mpf_er_amount IS 'Employer MPF contribution amount for the month';
COMMENT ON COLUMN public.monthly_commission_records.mpf_er_manual_override IS 'Whether employer MPF amount is manually overridden';