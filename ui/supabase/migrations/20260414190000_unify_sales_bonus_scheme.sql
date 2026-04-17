alter table public.employee_salary_profiles
  drop constraint if exists employee_salary_profiles_payroll_bonus_scheme_check;

alter table public.employee_salary_profiles
  add constraint employee_salary_profiles_payroll_bonus_scheme_check
  check (payroll_bonus_scheme is null or payroll_bonus_scheme in ('bonus_1', 'bonus_2', 'custom'));

update public.employee_salary_profiles
set sales_bonus_enabled = true
where payroll_bonus_enabled = true
  and coalesce(sales_bonus_enabled, false) = false;

update public.employee_salary_profiles
set payroll_bonus_scheme = 'custom'
where coalesce(sales_bonus_enabled, false) = true
  and sales_bonus_rate is not null
  and payroll_bonus_scheme is null;

comment on column public.employee_salary_profiles.payroll_bonus_scheme is 'Sales bonus scheme: bonus_1, bonus_2, or custom';