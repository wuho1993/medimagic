ALTER TABLE public.monthly_commission_records
  ADD COLUMN IF NOT EXISTS briefing_bonus_applied BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS briefing_bonus_amount NUMERIC NOT NULL DEFAULT 0 CHECK (briefing_bonus_amount >= 0);

COMMENT ON COLUMN public.monthly_commission_records.briefing_bonus_applied IS 'Whether briefing bonus is applied for the employee in the given month';
COMMENT ON COLUMN public.monthly_commission_records.briefing_bonus_amount IS 'Snapshot of briefing bonus amount applied for the employee in the given month';