ALTER TABLE public.monthly_commission_records
  ADD COLUMN IF NOT EXISTS manual_bonus_applied boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS manual_bonus_amount numeric NOT NULL DEFAULT 0 CHECK (manual_bonus_amount >= 0);

COMMENT ON COLUMN public.monthly_commission_records.manual_bonus_applied IS 'Whether an extra manual monthly bonus is applied for the employee in the given month';
COMMENT ON COLUMN public.monthly_commission_records.manual_bonus_amount IS 'Manual monthly bonus amount applied for the employee in the given month';