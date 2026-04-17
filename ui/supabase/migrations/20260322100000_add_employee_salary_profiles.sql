do $$
begin
  if not exists (select 1 from pg_type where typname = 'employee_salary_type') then
    create type public.employee_salary_type as enum ('monthly', 'daily', 'hourly');
  end if;
end
$$;

create table if not exists public.employee_salary_profiles (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null unique references public.employees (id) on delete cascade,
  salary_type public.employee_salary_type,
  base_salary numeric(12,2) check (base_salary is null or base_salary >= 0),
  allowance_amount numeric(12,2) check (allowance_amount is null or allowance_amount >= 0),
  effective_from date,
  remarks text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists employee_salary_profiles_effective_from_idx on public.employee_salary_profiles (effective_from desc);

drop trigger if exists trg_employee_salary_profiles_updated_at on public.employee_salary_profiles;

create trigger trg_employee_salary_profiles_updated_at
before update on public.employee_salary_profiles
for each row
execute function public.set_updated_at();

alter table public.employee_salary_profiles enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'employee_salary_profiles'
      and policyname = 'Authenticated users can read employee salary profiles'
  ) then
    create policy "Authenticated users can read employee salary profiles"
      on public.employee_salary_profiles for select
      to authenticated
      using (auth.uid() is not null);
  end if;
end
$$;