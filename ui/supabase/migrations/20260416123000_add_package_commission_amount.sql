alter table public.employee_salary_profiles
  add column if not exists package_commission_amount numeric;

alter table public.employee_salary_profiles
  drop constraint if exists employee_salary_profiles_package_commission_amount_check;

alter table public.employee_salary_profiles
  add constraint employee_salary_profiles_package_commission_amount_check
  check (package_commission_amount is null or package_commission_amount >= 0);

comment on column public.employee_salary_profiles.package_commission_amount is 'Guaranteed package commission floor used for 包佣包薪 employees';