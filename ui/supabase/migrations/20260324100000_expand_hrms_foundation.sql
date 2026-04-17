do $$
begin
  if not exists (select 1 from pg_type where typname = 'employee_contract_type') then
    create type public.employee_contract_type as enum ('permanent', 'probation', 'fixed_term', 'part_time', 'freelance');
  end if;

  if not exists (select 1 from pg_type where typname = 'employee_pay_schedule') then
    create type public.employee_pay_schedule as enum ('day_7', 'day_20');
  end if;

  if not exists (select 1 from pg_type where typname = 'employee_document_type') then
    create type public.employee_document_type as enum ('hkid', 'passport', 'visa', 'contract', 'tax', 'other');
  end if;

  if not exists (select 1 from pg_type where typname = 'visa_status') then
    create type public.visa_status as enum ('active', 'expiring', 'expired', 'cancelled');
  end if;
end
$$;

create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name_zh text not null,
  name_en text not null,
  business_registration_no text,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.branches (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  code text not null,
  name_zh text not null,
  name_en text not null,
  address text,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.departments (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  code text not null unique,
  name_zh text not null,
  name_en text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.employees
  add column if not exists company_id uuid references public.companies (id) on delete set null,
  add column if not exists branch_id uuid references public.branches (id) on delete set null,
  add column if not exists department_id uuid references public.departments (id) on delete set null,
  add column if not exists manager_employee_id uuid references public.employees (id) on delete set null,
  add column if not exists contract_type public.employee_contract_type,
  add column if not exists probation_end_date date,
  add column if not exists employment_end_date date,
  add column if not exists branch_code text,
  add column if not exists notes text;

create table if not exists public.employee_documents (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.employees (id) on delete cascade,
  document_type public.employee_document_type not null,
  file_name text not null,
  file_path text not null,
  expiry_date date,
  remarks text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.employee_visas (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.employees (id) on delete cascade,
  visa_type text not null,
  visa_number text,
  expiry_date date not null,
  status public.visa_status not null default 'active',
  reminder_days integer[] not null default array[30, 60, 90],
  remarks text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.employee_salary_profiles
  add column if not exists pay_schedule public.employee_pay_schedule,
  add column if not exists attendance_bonus_enabled boolean not null default false,
  add column if not exists attendance_bonus_amount numeric(12,2) check (attendance_bonus_amount is null or attendance_bonus_amount >= 0),
  add column if not exists transport_allowance numeric(12,2) check (transport_allowance is null or transport_allowance >= 0),
  add column if not exists meal_deduction_enabled boolean not null default false,
  add column if not exists meal_deduction_amount numeric(12,2) check (meal_deduction_amount is null or meal_deduction_amount >= 0),
  add column if not exists mpf_enabled boolean not null default true,
  add column if not exists standard_daily_hours numeric(6,2) check (standard_daily_hours is null or standard_daily_hours > 0),
  add column if not exists ot_multiplier numeric(6,2) check (ot_multiplier is null or ot_multiplier >= 0),
  add column if not exists tb8_rule text,
  add column if not exists package_expiry_date date,
  add column if not exists package_holiday_rule text;

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid,
  module_key text not null,
  action_key text not null,
  entity_type text not null,
  entity_id text,
  summary text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists branches_company_id_idx on public.branches (company_id);
create unique index if not exists branches_company_id_code_uidx on public.branches (company_id, code);
create index if not exists departments_company_id_idx on public.departments (company_id);
create index if not exists employees_company_id_idx on public.employees (company_id);
create index if not exists employees_branch_id_idx on public.employees (branch_id);
create index if not exists employees_department_id_idx on public.employees (department_id);
create index if not exists employee_documents_employee_id_idx on public.employee_documents (employee_id);
create index if not exists employee_visas_employee_id_idx on public.employee_visas (employee_id);
create index if not exists employee_visas_expiry_date_idx on public.employee_visas (expiry_date);
create index if not exists audit_logs_module_key_idx on public.audit_logs (module_key, created_at desc);

drop trigger if exists trg_companies_updated_at on public.companies;
drop trigger if exists trg_branches_updated_at on public.branches;
drop trigger if exists trg_departments_updated_at on public.departments;
drop trigger if exists trg_employee_documents_updated_at on public.employee_documents;
drop trigger if exists trg_employee_visas_updated_at on public.employee_visas;

create trigger trg_companies_updated_at before update on public.companies for each row execute function public.set_updated_at();
create trigger trg_branches_updated_at before update on public.branches for each row execute function public.set_updated_at();
create trigger trg_departments_updated_at before update on public.departments for each row execute function public.set_updated_at();
create trigger trg_employee_documents_updated_at before update on public.employee_documents for each row execute function public.set_updated_at();
create trigger trg_employee_visas_updated_at before update on public.employee_visas for each row execute function public.set_updated_at();

alter table public.companies enable row level security;
alter table public.branches enable row level security;
alter table public.departments enable row level security;
alter table public.employee_documents enable row level security;
alter table public.employee_visas enable row level security;
alter table public.audit_logs enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'companies' and policyname = 'Authenticated users can read companies') then
    create policy "Authenticated users can read companies" on public.companies for select to authenticated using (auth.uid() is not null);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'branches' and policyname = 'Authenticated users can read branches') then
    create policy "Authenticated users can read branches" on public.branches for select to authenticated using (auth.uid() is not null);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'departments' and policyname = 'Authenticated users can read departments') then
    create policy "Authenticated users can read departments" on public.departments for select to authenticated using (auth.uid() is not null);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'employee_documents' and policyname = 'Authenticated users can read employee documents') then
    create policy "Authenticated users can read employee documents" on public.employee_documents for select to authenticated using (auth.uid() is not null);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'employee_visas' and policyname = 'Authenticated users can read employee visas') then
    create policy "Authenticated users can read employee visas" on public.employee_visas for select to authenticated using (auth.uid() is not null);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'audit_logs' and policyname = 'Authenticated users can read audit logs') then
    create policy "Authenticated users can read audit logs" on public.audit_logs for select to authenticated using (auth.uid() is not null);
  end if;
end
$$;

insert into public.companies (code, name_zh, name_en, business_registration_no)
values
  ('ASA', 'ASA', 'ASA', null),
  ('ASAS', 'ASAS', 'ASAS', null)
on conflict (code) do update set
  name_zh = excluded.name_zh,
  name_en = excluded.name_en,
  business_registration_no = excluded.business_registration_no,
  updated_at = timezone('utc', now());

insert into public.branches (company_id, code, name_zh, name_en)
select companies.id, seeded.code, seeded.name_zh, seeded.name_en
from public.companies
join (
  values
    ('ASA', 'HQ', 'ASA 總店', 'ASA Head Office'),
    ('ASAS', 'HQ', 'ASAS 總店', 'ASAS Head Office')
) as seeded(company_code, code, name_zh, name_en)
  on companies.code = seeded.company_code
on conflict (company_id, code) do update set
  name_zh = excluded.name_zh,
  name_en = excluded.name_en,
  updated_at = timezone('utc', now());

insert into public.departments (company_id, code, name_zh, name_en)
select companies.id, seeded.code, seeded.name_zh, seeded.name_en
from public.companies
join (
  values
    ('ASA', 'ASA-HR', '人力資源部', 'Human Resources'),
    ('ASAS', 'ASAS-OPS', '營運部', 'Operations')
) as seeded(company_code, code, name_zh, name_en)
  on companies.code = seeded.company_code
on conflict (code) do update set
  name_zh = excluded.name_zh,
  name_en = excluded.name_en,
  updated_at = timezone('utc', now());

update public.employees
set
  company_id = companies.id,
  branch_id = branches.id,
  department_id = departments.id,
  branch_code = branches.code,
  contract_type = coalesce(contract_type, case when employees.employment_type = 'part_time' then 'part_time'::public.employee_contract_type else 'permanent'::public.employee_contract_type end),
  probation_end_date = coalesce(probation_end_date, (employees.hire_date + ((coalesce(employees.probation_months, 0) || ' months')::interval))::date)
from public.companies
left join public.branches on branches.company_id = companies.id
left join public.departments on departments.company_id = companies.id
where employees.company_type::text = companies.code
  and employees.company_id is null;