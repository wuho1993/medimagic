ALTER TABLE public.monthly_commission_records
  ADD COLUMN IF NOT EXISTS package_no_pay_handling text;

ALTER TABLE public.monthly_commission_records
  DROP CONSTRAINT IF EXISTS monthly_commission_records_package_no_pay_handling_check;

ALTER TABLE public.monthly_commission_records
  ADD CONSTRAINT monthly_commission_records_package_no_pay_handling_check
  CHECK (package_no_pay_handling IN ('no_package', 'pro_rate') OR package_no_pay_handling IS NULL);

COMMENT ON COLUMN public.monthly_commission_records.package_no_pay_handling IS 'Handling mode for package-commission employees with no-pay attendance when actual commission does not exceed package commission';