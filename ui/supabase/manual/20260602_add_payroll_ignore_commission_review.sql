alter table public.employee_salary_profiles
  add column if not exists payroll_ignore_commission_review boolean not null default false;
