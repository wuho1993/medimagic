alter table public.employees
  add column if not exists termination_reason text,
  add column if not exists final_payroll_month text check (final_payroll_month is null or final_payroll_month ~ '^\d{4}-\d{2}$');

create index if not exists idx_employees_final_payroll_month
  on public.employees (final_payroll_month);
