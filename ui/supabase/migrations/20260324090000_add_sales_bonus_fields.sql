-- Add sales bonus fields to employee_salary_profiles
ALTER TABLE employee_salary_profiles
  ADD COLUMN IF NOT EXISTS sales_bonus_enabled BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS sales_bonus_rate NUMERIC(5,4) DEFAULT NULL;

COMMENT ON COLUMN employee_salary_profiles.sales_bonus_enabled IS 'Whether this employee receives a sales bonus';
COMMENT ON COLUMN employee_salary_profiles.sales_bonus_rate IS 'Sales bonus rate (decimal, e.g. 0.01 = 1%)';
