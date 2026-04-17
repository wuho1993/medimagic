begin;

alter table public.monthly_commission_records
  drop column if exists use_commission_calculation;

alter table public.monthly_commission_records
  add column if not exists mpf_ee_applied boolean not null default false,
  add column if not exists mpf_ee_deduction_mode text not null default 'split',
  add column if not exists mpf_ee_amount numeric not null default 0,
  add column if not exists mpf_ee_manual_override boolean not null default false,
  add column if not exists mpf_er_applied boolean not null default false,
  add column if not exists mpf_er_amount numeric not null default 0,
  add column if not exists mpf_er_manual_override boolean not null default false,
  add column if not exists worked_days numeric not null default 0,
  add column if not exists worked_hours numeric not null default 0,
  add column if not exists manual_bonus_applied boolean not null default false,
  add column if not exists manual_bonus_amount numeric not null default 0,
  add column if not exists manual_bonus_mpf_included boolean not null default false,
  add column if not exists manual_deduction_applied boolean not null default false,
  add column if not exists manual_deduction_amount numeric not null default 0,
  add column if not exists manual_deduction_mpf_included boolean not null default false,
  add column if not exists sales_amount_total numeric not null default 0,
  add column if not exists sales_amount_commission numeric not null default 0,
  add column if not exists shop_target_amount numeric not null default 0,
  add column if not exists shop_actual_sales_amount numeric not null default 0,
  add column if not exists shop_target_percent numeric not null default 0,
  add column if not exists shop_bonus_amount numeric not null default 0,
  add column if not exists street_promoter_headcount integer not null default 0,
  add column if not exists street_promoter_commission_amount numeric not null default 0,
  add column if not exists telesales_headcount integer not null default 0,
  add column if not exists telesales_commission_amount numeric not null default 0;

alter table public.monthly_commission_records
  drop constraint if exists monthly_commission_records_manual_bonus_amount_check,
  drop constraint if exists monthly_commission_records_manual_deduction_amount_check,
  drop constraint if exists monthly_commission_records_sales_amount_total_check,
  drop constraint if exists monthly_commission_records_sales_amount_commission_check,
  drop constraint if exists monthly_commission_records_mpf_ee_deduction_mode_check,
  drop constraint if exists monthly_commission_records_worked_days_check,
  drop constraint if exists monthly_commission_records_worked_hours_check,
  drop constraint if exists monthly_commission_records_shop_target_amount_check,
  drop constraint if exists monthly_commission_records_shop_actual_sales_amount_check,
  drop constraint if exists monthly_commission_records_shop_target_percent_check,
  drop constraint if exists monthly_commission_records_shop_bonus_amount_check,
  drop constraint if exists monthly_commission_records_street_promoter_headcount_check,
  drop constraint if exists monthly_commission_records_street_promoter_commission_amount_check,
  drop constraint if exists monthly_commission_records_telesales_headcount_check,
  drop constraint if exists monthly_commission_records_telesales_commission_amount_check;

alter table public.monthly_commission_records
  add constraint monthly_commission_records_manual_bonus_amount_check
  check (manual_bonus_amount >= 0),
  add constraint monthly_commission_records_manual_deduction_amount_check
  check (manual_deduction_amount >= 0),
  add constraint monthly_commission_records_sales_amount_total_check
  check (sales_amount_total >= 0),
  add constraint monthly_commission_records_sales_amount_commission_check
  check (sales_amount_commission >= 0),
  add constraint monthly_commission_records_mpf_ee_deduction_mode_check
  check (mpf_ee_deduction_mode in ('split', 'month_end')),
  add constraint monthly_commission_records_worked_days_check
  check (worked_days >= 0),
  add constraint monthly_commission_records_worked_hours_check
  check (worked_hours >= 0),
  add constraint monthly_commission_records_shop_target_amount_check
  check (shop_target_amount >= 0),
  add constraint monthly_commission_records_shop_actual_sales_amount_check
  check (shop_actual_sales_amount >= 0),
  add constraint monthly_commission_records_shop_target_percent_check
  check (shop_target_percent >= 0),
  add constraint monthly_commission_records_shop_bonus_amount_check
  check (shop_bonus_amount >= 0),
  add constraint monthly_commission_records_street_promoter_headcount_check
  check (street_promoter_headcount >= 0),
  add constraint monthly_commission_records_street_promoter_commission_amount_check
  check (street_promoter_commission_amount >= 0),
  add constraint monthly_commission_records_telesales_headcount_check
  check (telesales_headcount >= 0),
  add constraint monthly_commission_records_telesales_commission_amount_check
  check (telesales_commission_amount >= 0);

comment on column public.monthly_commission_records.mpf_ee_applied is 'Whether employee MPF contribution applies for the month';
comment on column public.monthly_commission_records.mpf_ee_deduction_mode is 'How employee MPF is deducted for the month: split across payroll payouts or once at month end';
comment on column public.monthly_commission_records.mpf_ee_amount is 'Employee MPF contribution amount for the month';
comment on column public.monthly_commission_records.mpf_ee_manual_override is 'Whether employee MPF amount is manually overridden';
comment on column public.monthly_commission_records.mpf_er_applied is 'Whether employer MPF contribution applies for the month';
comment on column public.monthly_commission_records.mpf_er_amount is 'Employer MPF contribution amount for the month';
comment on column public.monthly_commission_records.mpf_er_manual_override is 'Whether employer MPF amount is manually overridden';
comment on column public.monthly_commission_records.worked_days is 'Worked days entered for daily-paid employees in the given month';
comment on column public.monthly_commission_records.worked_hours is 'Worked hours entered for hourly-paid employees in the given month';
comment on column public.monthly_commission_records.manual_bonus_applied is 'Whether an extra manual monthly bonus is applied for the employee in the given month';
comment on column public.monthly_commission_records.manual_bonus_amount is 'Manual monthly bonus amount applied for the employee in the given month';
comment on column public.monthly_commission_records.manual_bonus_mpf_included is 'Whether the manual monthly bonus should be included in MPF relevant income calculation';
comment on column public.monthly_commission_records.manual_deduction_applied is 'Whether a manual deduction amount is applied for the employee in the given month';
comment on column public.monthly_commission_records.manual_deduction_amount is 'Manual deduction amount applied for the employee in the given month';
comment on column public.monthly_commission_records.manual_deduction_mpf_included is 'Whether the manual deduction should reduce MPF relevant income calculation';
comment on column public.monthly_commission_records.sales_amount_total is 'Monthly total sales amount entered for percentage-based commission calculation';
comment on column public.monthly_commission_records.sales_amount_commission is 'Calculated commission snapshot derived from sales_amount_total and employee sales_amount_rate_percent';
comment on column public.monthly_commission_records.shop_target_amount is 'Monthly sales target amount entered for employees with shop bonus enabled';
comment on column public.monthly_commission_records.shop_actual_sales_amount is 'Actual monthly sales amount entered for employees with shop bonus enabled';
comment on column public.monthly_commission_records.shop_target_percent is 'Monthly target achievement percentage entered for employees with shop bonus enabled';
comment on column public.monthly_commission_records.shop_bonus_amount is 'Calculated monthly shop bonus amount snapshot';
comment on column public.monthly_commission_records.street_promoter_headcount is 'Monthly street promoter headcount input';
comment on column public.monthly_commission_records.street_promoter_commission_amount is 'Calculated street promoter commission snapshot for the month';
comment on column public.monthly_commission_records.telesales_headcount is 'Monthly telesales headcount input';
comment on column public.monthly_commission_records.telesales_commission_amount is 'Calculated telesales commission snapshot for the month';

alter table public.employee_salary_profiles
  add column if not exists package_commission_amount numeric,
  add column if not exists sales_amount_rate_percent numeric,
  add column if not exists shop_bonus_enabled boolean not null default false,
  add column if not exists street_promoter_enabled boolean not null default false,
  add column if not exists telesales_enabled boolean not null default false,
  add column if not exists shop_bonus_custom_name text,
  add column if not exists shop_bonus_custom_tiers jsonb,
  add column if not exists shop_bonus_scheme text;

alter table public.employee_salary_profiles
  drop constraint if exists employee_salary_profiles_package_commission_amount_check,
  drop constraint if exists employee_salary_profiles_sales_amount_rate_percent_check,
  drop constraint if exists employee_salary_profiles_shop_bonus_scheme_check;

alter table public.employee_salary_profiles
  add constraint employee_salary_profiles_package_commission_amount_check
  check (package_commission_amount is null or package_commission_amount >= 0),
  add constraint employee_salary_profiles_sales_amount_rate_percent_check
  check (sales_amount_rate_percent is null or sales_amount_rate_percent >= 0),
  add constraint employee_salary_profiles_shop_bonus_scheme_check
  check (shop_bonus_scheme in ('standard', 'custom'));

comment on column public.employee_salary_profiles.package_commission_amount is 'Guaranteed package commission floor used for 包佣包薪 employees';
comment on column public.employee_salary_profiles.sales_amount_rate_percent is 'Commission rate percentage used for monthly sales amount input, e.g. 5 means 5%';
comment on column public.employee_salary_profiles.shop_bonus_enabled is 'Whether the employee participates in the independent shop bonus scheme';
comment on column public.employee_salary_profiles.street_promoter_enabled is 'Whether the employee uses the special street promoter headcount commission formula';
comment on column public.employee_salary_profiles.telesales_enabled is 'Whether the employee uses the special telesales headcount commission formula';
comment on column public.employee_salary_profiles.shop_bonus_custom_name is 'Optional display name for the employee-specific custom shop bonus tiers';
comment on column public.employee_salary_profiles.shop_bonus_custom_tiers is 'Custom shop bonus tiers based on monthly target achievement percentage';
comment on column public.employee_salary_profiles.shop_bonus_scheme is 'Shop bonus scheme selection: standard or custom';

create table if not exists public.payroll_scheme_configs (
  id uuid primary key default gen_random_uuid(),
  scheme_category text not null check (scheme_category in ('payroll_bonus', 'shop_bonus')),
  scheme_code text not null,
  name_zh text not null,
  name_en text not null default '',
  tiers jsonb not null,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (scheme_category, scheme_code),
  constraint payroll_scheme_configs_tiers_check check (jsonb_typeof(tiers) = 'array')
);

alter table public.payroll_scheme_configs enable row level security;

drop policy if exists "Authenticated users can read payroll scheme configs" on public.payroll_scheme_configs;
create policy "Authenticated users can read payroll scheme configs"
on public.payroll_scheme_configs
for select
to authenticated
using (true);

drop trigger if exists set_payroll_scheme_configs_updated_at on public.payroll_scheme_configs;
create trigger set_payroll_scheme_configs_updated_at
before update on public.payroll_scheme_configs
for each row
execute function public.set_updated_at();

insert into public.payroll_scheme_configs (scheme_category, scheme_code, name_zh, name_en, tiers, sort_order)
values
  (
    'payroll_bonus',
    'bonus_1',
    'Bonus 1',
    'Bonus 1',
    jsonb_build_array(
      jsonb_build_object('minSales', 280000, 'amount', 1000),
      jsonb_build_object('minSales', 350000, 'amount', 2000),
      jsonb_build_object('minSales', 430000, 'amount', 3000)
    ),
    10
  ),
  (
    'payroll_bonus',
    'bonus_2',
    'Bonus 2',
    'Bonus 2',
    jsonb_build_array(
      jsonb_build_object('minSales', 280000, 'amount', 500),
      jsonb_build_object('minSales', 380000, 'amount', 800),
      jsonb_build_object('minSales', 480000, 'amount', 1200),
      jsonb_build_object('minSales', 580000, 'amount', 1500),
      jsonb_build_object('minSales', 680000, 'amount', 2000),
      jsonb_build_object('minSales', 780000, 'amount', 2500)
    ),
    20
  ),
  (
    'shop_bonus',
    'standard',
    '鋪數標準方案',
    'Standard Shop Bonus',
    jsonb_build_array(
      jsonb_build_object('minPercent', 70, 'amount', 500),
      jsonb_build_object('minPercent', 80, 'amount', 800),
      jsonb_build_object('minPercent', 90, 'amount', 1200),
      jsonb_build_object('minPercent', 100, 'amount', 1500),
      jsonb_build_object('minPercent', 110, 'amount', 2000),
      jsonb_build_object('minPercent', 120, 'amount', 2500)
    ),
    10
  )
on conflict (scheme_category, scheme_code) do update set
  name_zh = excluded.name_zh,
  name_en = excluded.name_en,
  tiers = excluded.tiers,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order,
  updated_at = timezone('utc', now());

commit;