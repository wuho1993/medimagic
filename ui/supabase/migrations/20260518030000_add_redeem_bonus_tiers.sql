alter table public.employee_salary_profiles
  add column if not exists redeem_bonus_enabled boolean not null default false,
  add column if not exists redeem_bonus_custom_name text,
  add column if not exists redeem_bonus_custom_tiers jsonb,
  add column if not exists performance_bonus_rules jsonb;

alter table public.employee_salary_profiles
  drop constraint if exists employee_salary_profiles_redeem_bonus_custom_name_check;

alter table public.employee_salary_profiles
  add constraint employee_salary_profiles_redeem_bonus_custom_name_check
  check (
    redeem_bonus_custom_name is null
    or length(btrim(redeem_bonus_custom_name)) > 0
  );

alter table public.employee_salary_profiles
  drop constraint if exists employee_salary_profiles_redeem_bonus_custom_tiers_check;

alter table public.employee_salary_profiles
  add constraint employee_salary_profiles_redeem_bonus_custom_tiers_check
  check (
    redeem_bonus_custom_tiers is null
    or jsonb_typeof(redeem_bonus_custom_tiers) = 'array'
  );

alter table public.monthly_commission_records
  add column if not exists redeem_bonus_amount numeric not null default 0,
  add column if not exists performance_bonus_amount numeric not null default 0;

comment on column public.employee_salary_profiles.redeem_bonus_enabled is 'Whether the employee uses fixed threshold bonus based on Redeem volume.';
comment on column public.employee_salary_profiles.redeem_bonus_custom_name is 'Display name for custom Redeem threshold bonus scheme.';
comment on column public.employee_salary_profiles.redeem_bonus_custom_tiers is 'Redeem threshold bonus tiers: [{"minSales": number, "amount": number}], where minSales stores Redeem volume threshold.';
comment on column public.monthly_commission_records.redeem_bonus_amount is 'Redeem threshold bonus snapshot amount for the payroll month.';
comment on column public.employee_salary_profiles.performance_bonus_rules is 'Generic performance bonus rules: [{code,name,metric,enabled,tiers:[{minAmount,amount}]}]. Metrics include sales, redeem, salesAmountTotal, job, sgm.';
comment on column public.monthly_commission_records.performance_bonus_amount is 'Generic performance bonus total snapshot amount for the payroll month.';

with target_employees as (
  select id
  from public.employees
  where employee_code in ('SF066', 'SF164')
)
update public.employee_salary_profiles esp
set
  commission_method = 'none',
  sales_bonus_enabled = false,
  payroll_bonus_enabled = false,
  payroll_bonus_scheme = null,
  sales_bonus_custom_name = null,
  sales_bonus_custom_tiers = null,
  redeem_bonus_enabled = false,
  redeem_bonus_custom_name = null,
  redeem_bonus_custom_tiers = null,
  performance_bonus_rules = '[
    {"code":"sales_bar_bonus","name":"Sales BAR Bonus","metric":"sales","enabled":true,"tiers":[{"minAmount":150000,"amount":1500},{"minAmount":200000,"amount":2000},{"minAmount":250000,"amount":2500},{"minAmount":300000,"amount":3000},{"minAmount":350000,"amount":3500},{"minAmount":400000,"amount":4000}]},
    {"code":"redeem_bar_bonus","name":"Redeem BAR Bonus","metric":"redeem","enabled":true,"tiers":[{"minAmount":105000,"amount":1500},{"minAmount":140000,"amount":2000},{"minAmount":175000,"amount":2500},{"minAmount":210000,"amount":3000},{"minAmount":245000,"amount":3500},{"minAmount":280000,"amount":4000}]}
  ]'::jsonb,
  updated_at = now()
from target_employees
where esp.employee_id = target_employees.id;
