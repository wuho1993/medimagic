-- Enable browser-based create/update of employee profiles in GitHub Pages builds.
--
-- Why this file exists:
-- 1. GitHub Pages uses the anon key + authenticated session, so RLS applies.
-- 2. public.employees only had SELECT policy.
-- 3. public.employee_salary_profiles only had SELECT policy.
-- 4. Saved preset tables did not have browser-friendly write policies.
--
-- This script adds idempotent RLS policies for the roles that can access
-- the People / People Detail screens in the app:
--   super_admin, boss, hr_manager, department_manager

alter table public.saved_commission_presets enable row level security;
alter table public.saved_payroll_bonus_presets enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'employees'
      and policyname = 'People roles can insert employees'
  ) then
    create policy "People roles can insert employees"
      on public.employees for insert
      to authenticated
      with check (
        coalesce(
          auth.jwt()->'app_metadata'->>'role',
          auth.jwt()->'user_metadata'->>'role'
        ) in ('super_admin', 'boss', 'hr_manager', 'department_manager')
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'employees'
      and policyname = 'People roles can update employees'
  ) then
    create policy "People roles can update employees"
      on public.employees for update
      to authenticated
      using (
        coalesce(
          auth.jwt()->'app_metadata'->>'role',
          auth.jwt()->'user_metadata'->>'role'
        ) in ('super_admin', 'boss', 'hr_manager', 'department_manager')
      )
      with check (
        coalesce(
          auth.jwt()->'app_metadata'->>'role',
          auth.jwt()->'user_metadata'->>'role'
        ) in ('super_admin', 'boss', 'hr_manager', 'department_manager')
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'employee_salary_profiles'
      and policyname = 'People roles can insert employee salary profiles'
  ) then
    create policy "People roles can insert employee salary profiles"
      on public.employee_salary_profiles for insert
      to authenticated
      with check (
        coalesce(
          auth.jwt()->'app_metadata'->>'role',
          auth.jwt()->'user_metadata'->>'role'
        ) in ('super_admin', 'boss', 'hr_manager', 'department_manager')
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'employee_salary_profiles'
      and policyname = 'People roles can update employee salary profiles'
  ) then
    create policy "People roles can update employee salary profiles"
      on public.employee_salary_profiles for update
      to authenticated
      using (
        coalesce(
          auth.jwt()->'app_metadata'->>'role',
          auth.jwt()->'user_metadata'->>'role'
        ) in ('super_admin', 'boss', 'hr_manager', 'department_manager')
      )
      with check (
        coalesce(
          auth.jwt()->'app_metadata'->>'role',
          auth.jwt()->'user_metadata'->>'role'
        ) in ('super_admin', 'boss', 'hr_manager', 'department_manager')
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'employee_salary_profiles'
      and policyname = 'People roles can delete employee salary profiles'
  ) then
    create policy "People roles can delete employee salary profiles"
      on public.employee_salary_profiles for delete
      to authenticated
      using (
        coalesce(
          auth.jwt()->'app_metadata'->>'role',
          auth.jwt()->'user_metadata'->>'role'
        ) in ('super_admin', 'boss', 'hr_manager', 'department_manager')
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'saved_commission_presets'
      and policyname = 'People roles can read saved commission presets'
  ) then
    create policy "People roles can read saved commission presets"
      on public.saved_commission_presets for select
      to authenticated
      using (
        coalesce(
          auth.jwt()->'app_metadata'->>'role',
          auth.jwt()->'user_metadata'->>'role'
        ) in ('super_admin', 'boss', 'hr_manager', 'department_manager')
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'saved_commission_presets'
      and policyname = 'People roles can insert saved commission presets'
  ) then
    create policy "People roles can insert saved commission presets"
      on public.saved_commission_presets for insert
      to authenticated
      with check (
        coalesce(
          auth.jwt()->'app_metadata'->>'role',
          auth.jwt()->'user_metadata'->>'role'
        ) in ('super_admin', 'boss', 'hr_manager', 'department_manager')
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'saved_commission_presets'
      and policyname = 'People roles can update saved commission presets'
  ) then
    create policy "People roles can update saved commission presets"
      on public.saved_commission_presets for update
      to authenticated
      using (
        coalesce(
          auth.jwt()->'app_metadata'->>'role',
          auth.jwt()->'user_metadata'->>'role'
        ) in ('super_admin', 'boss', 'hr_manager', 'department_manager')
      )
      with check (
        coalesce(
          auth.jwt()->'app_metadata'->>'role',
          auth.jwt()->'user_metadata'->>'role'
        ) in ('super_admin', 'boss', 'hr_manager', 'department_manager')
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'saved_payroll_bonus_presets'
      and policyname = 'People roles can read saved payroll bonus presets'
  ) then
    create policy "People roles can read saved payroll bonus presets"
      on public.saved_payroll_bonus_presets for select
      to authenticated
      using (
        coalesce(
          auth.jwt()->'app_metadata'->>'role',
          auth.jwt()->'user_metadata'->>'role'
        ) in ('super_admin', 'boss', 'hr_manager', 'department_manager')
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'saved_payroll_bonus_presets'
      and policyname = 'People roles can insert saved payroll bonus presets'
  ) then
    create policy "People roles can insert saved payroll bonus presets"
      on public.saved_payroll_bonus_presets for insert
      to authenticated
      with check (
        coalesce(
          auth.jwt()->'app_metadata'->>'role',
          auth.jwt()->'user_metadata'->>'role'
        ) in ('super_admin', 'boss', 'hr_manager', 'department_manager')
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'saved_payroll_bonus_presets'
      and policyname = 'People roles can update saved payroll bonus presets'
  ) then
    create policy "People roles can update saved payroll bonus presets"
      on public.saved_payroll_bonus_presets for update
      to authenticated
      using (
        coalesce(
          auth.jwt()->'app_metadata'->>'role',
          auth.jwt()->'user_metadata'->>'role'
        ) in ('super_admin', 'boss', 'hr_manager', 'department_manager')
      )
      with check (
        coalesce(
          auth.jwt()->'app_metadata'->>'role',
          auth.jwt()->'user_metadata'->>'role'
        ) in ('super_admin', 'boss', 'hr_manager', 'department_manager')
      );
  end if;
end
$$;