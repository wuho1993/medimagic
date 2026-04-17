ALTER TABLE public.monthly_commission_records
  ADD COLUMN IF NOT EXISTS manual_deduction_applied boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS manual_deduction_amount numeric NOT NULL DEFAULT 0 CHECK (manual_deduction_amount >= 0);

COMMENT ON COLUMN public.monthly_commission_records.manual_deduction_applied IS 'Whether a manual deduction amount is applied for the employee in the given month';
COMMENT ON COLUMN public.monthly_commission_records.manual_deduction_amount IS 'Manual deduction amount applied for the employee in the given month';
