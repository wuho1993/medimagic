begin;

alter table public.employee_salary_profiles
  add column if not exists sales_amount_rate_percent numeric;

alter table public.employee_salary_profiles
  drop constraint if exists employee_salary_profiles_sales_amount_rate_percent_check;

alter table public.employee_salary_profiles
  add constraint employee_salary_profiles_sales_amount_rate_percent_check
  check (sales_amount_rate_percent is null or sales_amount_rate_percent >= 0);

comment on column public.employee_salary_profiles.sales_amount_rate_percent is 'Commission rate percentage used for monthly sales amount input, e.g. 5 means 5%';

alter table public.monthly_commission_records
  add column if not exists sales_amount_total numeric not null default 0,
  add column if not exists sales_amount_commission numeric not null default 0;

alter table public.monthly_commission_records
  drop constraint if exists monthly_commission_records_sales_amount_total_check,
  drop constraint if exists monthly_commission_records_sales_amount_commission_check;

alter table public.monthly_commission_records
  add constraint monthly_commission_records_sales_amount_total_check
  check (sales_amount_total >= 0),
  add constraint monthly_commission_records_sales_amount_commission_check
  check (sales_amount_commission >= 0);

comment on column public.monthly_commission_records.sales_amount_total is 'Monthly total sales amount entered for percentage-based commission calculation';
comment on column public.monthly_commission_records.sales_amount_commission is 'Calculated commission snapshot derived from sales_amount_total and employee sales_amount_rate_percent';

commit;