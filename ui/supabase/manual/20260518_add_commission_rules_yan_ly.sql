-- Generic commission rules: supports multiple commission methods per employee without mixing them with Bonus.
-- Existing fields remain as fallback; Payroll should use commission_rules first when present.

alter table public.employee_salary_profiles
  add column if not exists commission_rules jsonb;

alter table public.employee_salary_profiles
  drop constraint if exists employee_salary_profiles_commission_rules_check;

alter table public.employee_salary_profiles
  add constraint employee_salary_profiles_commission_rules_check
  check (
    commission_rules is null
    or jsonb_typeof(commission_rules) = 'array'
  );

comment on column public.employee_salary_profiles.commission_rules is 'Generic commission rules: [{code,name,type,metric,enabled,stackable,tiers:[{minAmount,maxAmount,rate,amount}]}]. Types: rate, bar. Metrics: redeem, sales, salesAmountTotal, job, sgm.';

with target_employees as (
  select id
  from public.employees
  where employee_code in ('SF066', 'SF164')
)
update public.employee_salary_profiles esp
set
  commission_method = 'custom',
  commission_custom_name = 'BAR Commission',
  commission_custom_tiers = null,
  commission_redeem_rate = null,
  commission_sales_rate = null,
  commission_sgm_rate = null,
  commission_rules = '[
    {
      "code": "sales_bar_commission",
      "name": "Sales BAR Commission",
      "type": "bar",
      "metric": "sales",
      "enabled": true,
      "stackable": false,
      "tiers": [
        {"minAmount": 150000, "amount": 1500},
        {"minAmount": 200000, "amount": 2000},
        {"minAmount": 250000, "amount": 2500},
        {"minAmount": 300000, "amount": 3000},
        {"minAmount": 350000, "amount": 3500},
        {"minAmount": 400000, "amount": 4000}
      ]
    },
    {
      "code": "redeem_bar_commission",
      "name": "Redeem BAR Commission",
      "type": "bar",
      "metric": "redeem",
      "enabled": true,
      "stackable": false,
      "tiers": [
        {"minAmount": 105000, "amount": 1500},
        {"minAmount": 140000, "amount": 2000},
        {"minAmount": 175000, "amount": 2500},
        {"minAmount": 210000, "amount": 3000},
        {"minAmount": 245000, "amount": 3500},
        {"minAmount": 280000, "amount": 4000}
      ]
    }
  ]'::jsonb,
  -- This was a temporary representation. Keep generic performance bonus available, but Yan/LY should not use it.
  performance_bonus_rules = null,
  sales_bonus_enabled = false,
  payroll_bonus_enabled = false,
  payroll_bonus_scheme = null,
  sales_bonus_custom_name = null,
  sales_bonus_custom_tiers = null,
  redeem_bonus_enabled = false,
  redeem_bonus_custom_name = null,
  redeem_bonus_custom_tiers = null,
  updated_at = now()
from target_employees
where esp.employee_id = target_employees.id;
