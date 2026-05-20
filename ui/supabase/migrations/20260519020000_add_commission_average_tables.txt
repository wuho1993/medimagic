create table if not exists public.commission_average_employee_mappings (
  id uuid primary key default gen_random_uuid(),
  source_file text not null,
  source_sheet text not null,
  source_row integer not null,
  source_code text,
  source_alias text,
  source_name text,
  matched_employee_code text,
  match_status text not null default 'needs_review' check (match_status in ('confirmed', 'needs_review', 'excluded')),
  match_confidence numeric(8,2),
  remark text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (source_file, source_sheet, source_row)
);

create index if not exists idx_commission_average_mappings_status
  on public.commission_average_employee_mappings (match_status);

create index if not exists idx_commission_average_mappings_employee
  on public.commission_average_employee_mappings (matched_employee_code);

create table if not exists public.employee_commission_average_seed (
  id uuid primary key default gen_random_uuid(),
  employee_code text not null,
  period_start date not null,
  period_end date not null,
  total_commission numeric(14,2) not null default 0,
  eligible_days numeric(8,2) not null default 0,
  daily_average_commission numeric(14,4) not null default 0,
  source_file text not null,
  source_row integer not null,
  created_at timestamptz not null default now(),
  unique (employee_code, period_start, period_end, source_file, source_row)
);

create index if not exists idx_employee_commission_average_seed_employee
  on public.employee_commission_average_seed (employee_code, period_start, period_end);

create table if not exists public.employee_commission_average_monthly (
  id uuid primary key default gen_random_uuid(),
  employee_code text not null,
  year_month text not null check (year_month ~ '^\d{4}-\d{2}$'),
  average_commission_amount numeric(14,2) not null default 0,
  eligible_days numeric(8,2),
  source text not null default 'payroll',
  payroll_record_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (employee_code, year_month, source)
);

create index if not exists idx_employee_commission_average_monthly_employee
  on public.employee_commission_average_monthly (employee_code, year_month);

alter table public.commission_average_employee_mappings enable row level security;
alter table public.employee_commission_average_seed enable row level security;
alter table public.employee_commission_average_monthly enable row level security;

drop policy if exists "commission average mappings authenticated read" on public.commission_average_employee_mappings;
create policy "commission average mappings authenticated read" on public.commission_average_employee_mappings
  for select to authenticated using (true);

drop policy if exists "commission average mappings authenticated write" on public.commission_average_employee_mappings;
create policy "commission average mappings authenticated write" on public.commission_average_employee_mappings
  for all to authenticated using (true) with check (true);

drop policy if exists "commission average seed authenticated read" on public.employee_commission_average_seed;
create policy "commission average seed authenticated read" on public.employee_commission_average_seed
  for select to authenticated using (true);

drop policy if exists "commission average seed authenticated write" on public.employee_commission_average_seed;
create policy "commission average seed authenticated write" on public.employee_commission_average_seed
  for all to authenticated using (true) with check (true);

drop policy if exists "commission average monthly authenticated read" on public.employee_commission_average_monthly;
create policy "commission average monthly authenticated read" on public.employee_commission_average_monthly
  for select to authenticated using (true);

drop policy if exists "commission average monthly authenticated write" on public.employee_commission_average_monthly;
create policy "commission average monthly authenticated write" on public.employee_commission_average_monthly
  for all to authenticated using (true) with check (true);
