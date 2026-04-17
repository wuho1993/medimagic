alter table public.employee_salary_profiles
  add column if not exists sales_bonus_custom_name text;

alter table public.employee_salary_profiles
  drop constraint if exists employee_salary_profiles_sales_bonus_custom_name_check;

alter table public.employee_salary_profiles
  add constraint employee_salary_profiles_sales_bonus_custom_name_check
  check (
    sales_bonus_custom_name is null
    or length(btrim(sales_bonus_custom_name)) > 0
  );

comment on column public.employee_salary_profiles.sales_bonus_custom_name is 'Editable display name for custom sales bonus scheme.';