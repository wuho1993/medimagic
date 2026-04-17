create extension if not exists pgcrypto;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'employee_gender') then
    create type public.employee_gender as enum ('male', 'female', 'other');
  end if;

  if not exists (select 1 from pg_type where typname = 'employee_identity_type') then
    create type public.employee_identity_type as enum ('hkid', 'passport', 'other');
  end if;

  if not exists (select 1 from pg_type where typname = 'employee_company_type') then
    create type public.employee_company_type as enum ('ASA', 'ASAS');
  end if;

  if not exists (select 1 from pg_type where typname = 'employee_employment_type') then
    create type public.employee_employment_type as enum ('full_time', 'part_time');
  end if;

  if not exists (select 1 from pg_type where typname = 'employee_status') then
    create type public.employee_status as enum ('active', 'on_leave', 'resigned', 'terminated');
  end if;

  if not exists (select 1 from pg_type where typname = 'employee_payment_method') then
    create type public.employee_payment_method as enum ('autopay', 'cash', 'cheque', 'fps');
  end if;
end
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.positions (
  id uuid primary key default gen_random_uuid(),
  code text unique,
  name_zh text not null,
  name_en text not null,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.banks (
  id uuid primary key default gen_random_uuid(),
  code text unique,
  name_zh text not null,
  name_en text not null,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.employees (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique,
  employee_code text not null unique,
  name_zh text not null,
  name_en text not null,
  alias text,
  gender public.employee_gender not null,
  identity_type public.employee_identity_type not null default 'hkid',
  identity_number text not null,
  date_of_birth date,
  address text,
  phone text,
  company_type public.employee_company_type not null,
  employment_type public.employee_employment_type not null,
  employment_status public.employee_status not null default 'active',
  position_id uuid references public.positions (id) on delete set null,
  hire_date date not null,
  payment_method public.employee_payment_method,
  bank_id uuid references public.banks (id) on delete set null,
  bank_account_number text,
  probation_months integer check (probation_months is null or probation_months >= 0),
  annual_leave_days numeric(5,2) check (annual_leave_days is null or annual_leave_days >= 0),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists employees_company_type_idx on public.employees (company_type);
create index if not exists employees_status_idx on public.employees (employment_status);
create index if not exists employees_employment_type_idx on public.employees (employment_type);
create index if not exists employees_hire_date_idx on public.employees (hire_date desc);

drop trigger if exists trg_positions_updated_at on public.positions;
drop trigger if exists trg_banks_updated_at on public.banks;
drop trigger if exists trg_employees_updated_at on public.employees;

create trigger trg_employees_updated_at
before update on public.employees
for each row
execute function public.set_updated_at();

alter table public.positions enable row level security;
alter table public.banks enable row level security;
alter table public.employees enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'positions' and policyname = 'Authenticated users can read positions'
  ) then
    create policy "Authenticated users can read positions"
      on public.positions for select
      to authenticated
      using (true);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'banks' and policyname = 'Authenticated users can read banks'
  ) then
    create policy "Authenticated users can read banks"
      on public.banks for select
      to authenticated
      using (true);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'employees' and policyname = 'Authenticated users can read employees'
  ) then
    create policy "Authenticated users can read employees"
      on public.employees for select
      to authenticated
      using (auth.uid() is not null);
  end if;
end
$$;

insert into public.positions (code, name_zh, name_en)
values
  ('BEAUTICIAN', '美容師', 'Beautician'),
  ('CONSULTANT', '顧問', 'Consultant')
on conflict (code) do update
set
  name_zh = excluded.name_zh,
  name_en = excluded.name_en;

insert into public.banks (code, name_zh, name_en)
values
  ('HSBC', '匯豐銀行', 'HSBC'),
  ('HANG_SENG', '恒生銀行', 'Hang Seng Bank')
on conflict (code) do update
set
  name_zh = excluded.name_zh,
  name_en = excluded.name_en;

insert into public.employees (
  employee_code,
  name_zh,
  name_en,
  alias,
  gender,
  identity_type,
  identity_number,
  date_of_birth,
  address,
  phone,
  company_type,
  employment_type,
  employment_status,
  position_id,
  hire_date,
  payment_method,
  bank_id,
  bank_account_number,
  probation_months,
  annual_leave_days
)
select
  'SF102',
  '溫婉華',
  'Wan Yuen Wa',
  'Carol',
  'female'::public.employee_gender,
  'hkid'::public.employee_identity_type,
  'J2545263(6)',
  date '1989-08-22',
  'Flat D, 17/F, Tower One, Twin Peaks, TKO',
  '63901341',
  'ASA'::public.employee_company_type,
  'full_time'::public.employee_employment_type,
  'active'::public.employee_status,
  p.id,
  date '2021-04-12',
  'autopay'::public.employee_payment_method,
  b.id,
  '004-5550041403',
  3,
  7
from public.positions p
cross join public.banks b
where p.code = 'BEAUTICIAN' and b.code = 'HSBC'
on conflict (employee_code) do update
set
  name_zh = excluded.name_zh,
  name_en = excluded.name_en,
  alias = excluded.alias,
  gender = excluded.gender,
  identity_type = excluded.identity_type,
  identity_number = excluded.identity_number,
  date_of_birth = excluded.date_of_birth,
  address = excluded.address,
  phone = excluded.phone,
  company_type = excluded.company_type,
  employment_type = excluded.employment_type,
  employment_status = excluded.employment_status,
  position_id = excluded.position_id,
  hire_date = excluded.hire_date,
  payment_method = excluded.payment_method,
  bank_id = excluded.bank_id,
  bank_account_number = excluded.bank_account_number,
  probation_months = excluded.probation_months,
  annual_leave_days = excluded.annual_leave_days,
  updated_at = timezone('utc', now());

insert into public.employees (
  employee_code,
  name_zh,
  name_en,
  alias,
  gender,
  identity_type,
  identity_number,
  date_of_birth,
  address,
  phone,
  company_type,
  employment_type,
  employment_status,
  position_id,
  hire_date,
  payment_method,
  bank_id,
  bank_account_number,
  probation_months,
  annual_leave_days
)
select
  'SF011',
  '李珮斯',
  'Lee Sui Sze Sylvia',
  'Sylvia',
  'female'::public.employee_gender,
  'hkid'::public.employee_identity_type,
  'C672456(4)',
  date '2016-12-19',
  'Flat C, 31/F, Tower 2, One East Coast, 1 Lei Yue Mun Path, Yau Tong, Kowloon, HK',
  '95048989',
  'ASAS'::public.employee_company_type,
  'full_time'::public.employee_employment_type,
  'active'::public.employee_status,
  p.id,
  date '2016-12-19',
  'autopay'::public.employee_payment_method,
  b.id,
  '024-228160982882',
  3,
  8
from public.positions p
cross join public.banks b
where p.code = 'CONSULTANT' and b.code = 'HANG_SENG'
on conflict (employee_code) do update
set
  name_zh = excluded.name_zh,
  name_en = excluded.name_en,
  alias = excluded.alias,
  gender = excluded.gender,
  identity_type = excluded.identity_type,
  identity_number = excluded.identity_number,
  date_of_birth = excluded.date_of_birth,
  address = excluded.address,
  phone = excluded.phone,
  company_type = excluded.company_type,
  employment_type = excluded.employment_type,
  employment_status = excluded.employment_status,
  position_id = excluded.position_id,
  hire_date = excluded.hire_date,
  payment_method = excluded.payment_method,
  bank_id = excluded.bank_id,
  bank_account_number = excluded.bank_account_number,
  probation_months = excluded.probation_months,
  annual_leave_days = excluded.annual_leave_days,
  updated_at = timezone('utc', now());