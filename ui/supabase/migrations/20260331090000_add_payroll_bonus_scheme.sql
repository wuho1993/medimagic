-- Add payroll bonus scheme fields to employee salary profiles.
-- Bonus 1 / Bonus 2 are payroll bonuses based on monthly Sales amount,
-- independent from commission rate calculation.

ALTER TABLE employee_salary_profiles
  ADD COLUMN IF NOT EXISTS payroll_bonus_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS payroll_bonus_scheme TEXT
    CHECK (payroll_bonus_scheme IS NULL OR payroll_bonus_scheme IN ('bonus_1', 'bonus_2'));

COMMENT ON COLUMN employee_salary_profiles.payroll_bonus_enabled IS 'Whether the employee uses the payroll bonus scheme based on sales amount';
COMMENT ON COLUMN employee_salary_profiles.payroll_bonus_scheme IS 'Payroll bonus scheme: bonus_1 or bonus_2';

ALTER TABLE monthly_commission_records
  ADD COLUMN IF NOT EXISTS payroll_bonus NUMERIC NOT NULL DEFAULT 0;

COMMENT ON COLUMN monthly_commission_records.payroll_bonus IS 'Payroll bonus amount based on the selected bonus scheme and sales volume';