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