create table if not exists public.employee_ir56b_profiles (
  employee_id uuid primary key references public.employees (id) on delete cascade,
  marital_status text check (marital_status is null or marital_status in ('1', '2')),
  res_address_line1 text,
  res_address_line2 text,
  res_address_line3 text,
  res_address_area text check (res_address_area is null or res_address_area in ('H', 'K', 'N', 'F')),
  postal_address_line1 text,
  postal_address_line2 text,
  postal_address_line3 text,
  postal_address_area text check (postal_address_area is null or postal_address_area in ('H', 'K', 'N', 'F')),
  spouse_name text,
  spouse_hkid text,
  spouse_passport text,
  place_of_residence_indicator text not null default '0' check (place_of_residence_indicator in ('0', '1')),
  overseas_company_indicator text not null default '0' check (overseas_company_indicator in ('0', '1')),
  remarks text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

drop trigger if exists trg_employee_ir56b_profiles_updated_at on public.employee_ir56b_profiles;

create trigger trg_employee_ir56b_profiles_updated_at
before update on public.employee_ir56b_profiles
for each row
execute function public.set_updated_at();

alter table public.employee_ir56b_profiles enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'employee_ir56b_profiles'
      and policyname = 'Authenticated users can read employee IR56B profiles'
  ) then
    create policy "Authenticated users can read employee IR56B profiles"
      on public.employee_ir56b_profiles for select
      to authenticated
      using (auth.uid() is not null);
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'employee_ir56b_profiles'
      and policyname = 'Authenticated users can write employee IR56B profiles'
  ) then
    create policy "Authenticated users can write employee IR56B profiles"
      on public.employee_ir56b_profiles for all
      to authenticated
      using (auth.uid() is not null)
      with check (auth.uid() is not null);
  end if;
end
$$;
