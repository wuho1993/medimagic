alter table public.saved_shop_commission_presets enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'saved_shop_commission_presets'
      and policyname = 'People roles can read saved shop commission presets'
  ) then
    create policy "People roles can read saved shop commission presets"
      on public.saved_shop_commission_presets for select
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
      and tablename = 'saved_shop_commission_presets'
      and policyname = 'People roles can insert saved shop commission presets'
  ) then
    create policy "People roles can insert saved shop commission presets"
      on public.saved_shop_commission_presets for insert
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
      and tablename = 'saved_shop_commission_presets'
      and policyname = 'People roles can update saved shop commission presets'
  ) then
    create policy "People roles can update saved shop commission presets"
      on public.saved_shop_commission_presets for update
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
