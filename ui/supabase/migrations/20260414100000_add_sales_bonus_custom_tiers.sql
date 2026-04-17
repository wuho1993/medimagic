alter table public.employee_salary_profiles
  add column if not exists sales_bonus_custom_tiers jsonb;

alter table public.employee_salary_profiles
  drop constraint if exists employee_salary_profiles_sales_bonus_custom_tiers_check;

alter table public.employee_salary_profiles
  add constraint employee_salary_profiles_sales_bonus_custom_tiers_check
  check (
    sales_bonus_custom_tiers is null
    or jsonb_typeof(sales_bonus_custom_tiers) = 'array'
  );

comment on column public.employee_salary_profiles.sales_bonus_custom_tiers is 'Custom sales bonus tiers in JSON array format: [{"minSales": number, "amount": number}]';