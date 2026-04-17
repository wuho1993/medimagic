ALTER TABLE public.employee_salary_profiles
  DROP COLUMN IF EXISTS meal_deduction_enabled,
  DROP COLUMN IF EXISTS meal_deduction_amount;