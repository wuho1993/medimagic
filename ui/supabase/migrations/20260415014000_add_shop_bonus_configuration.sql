ALTER TABLE public.employee_salary_profiles
  ADD COLUMN IF NOT EXISTS shop_bonus_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS shop_bonus_custom_name text,
  ADD COLUMN IF NOT EXISTS shop_bonus_custom_tiers jsonb,
  ADD COLUMN IF NOT EXISTS shop_bonus_scheme text CHECK (shop_bonus_scheme IN ('standard', 'custom'));

COMMENT ON COLUMN public.employee_salary_profiles.shop_bonus_enabled IS 'Whether the employee participates in the independent shop bonus scheme';
COMMENT ON COLUMN public.employee_salary_profiles.shop_bonus_custom_name IS 'Optional display name for the employee-specific custom shop bonus tiers';
COMMENT ON COLUMN public.employee_salary_profiles.shop_bonus_custom_tiers IS 'Custom shop bonus tiers based on monthly target achievement percentage';
COMMENT ON COLUMN public.employee_salary_profiles.shop_bonus_scheme IS 'Shop bonus scheme selection: standard or custom';

ALTER TABLE public.monthly_commission_records
  ADD COLUMN IF NOT EXISTS shop_target_percent numeric NOT NULL DEFAULT 0 CHECK (shop_target_percent >= 0),
  ADD COLUMN IF NOT EXISTS shop_bonus_amount numeric NOT NULL DEFAULT 0 CHECK (shop_bonus_amount >= 0);

COMMENT ON COLUMN public.monthly_commission_records.shop_target_percent IS 'Monthly target achievement percentage entered for employees with shop bonus enabled';
COMMENT ON COLUMN public.monthly_commission_records.shop_bonus_amount IS 'Calculated monthly shop bonus amount snapshot';
