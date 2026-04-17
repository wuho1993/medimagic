ALTER TABLE public.employee_salary_profiles
  ADD COLUMN IF NOT EXISTS street_promoter_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS telesales_enabled boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN public.employee_salary_profiles.street_promoter_enabled IS 'Whether the employee uses the special street promoter headcount commission formula';
COMMENT ON COLUMN public.employee_salary_profiles.telesales_enabled IS 'Whether the employee uses the special telesales headcount commission formula';