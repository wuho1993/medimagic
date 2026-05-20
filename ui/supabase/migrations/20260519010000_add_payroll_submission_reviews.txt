create table if not exists public.payroll_submission_reviews (
  id uuid primary key default gen_random_uuid(),
  year_month text not null check (year_month ~ '^\d{4}-\d{2}$'),
  employee_code text not null,
  issue_key text not null,
  issue_type text not null,
  reason text not null,
  action text,
  detail jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (year_month, issue_key)
);

create index if not exists idx_payroll_submission_reviews_month
  on public.payroll_submission_reviews (year_month);

create index if not exists idx_payroll_submission_reviews_employee
  on public.payroll_submission_reviews (employee_code);

alter table public.payroll_submission_reviews enable row level security;

drop policy if exists "payroll reviews authenticated read" on public.payroll_submission_reviews;
create policy "payroll reviews authenticated read"
  on public.payroll_submission_reviews
  for select
  to authenticated
  using (true);

drop policy if exists "payroll reviews authenticated write" on public.payroll_submission_reviews;
create policy "payroll reviews authenticated write"
  on public.payroll_submission_reviews
  for all
  to authenticated
  using (true)
  with check (true);
