-- Add RLS write policies for admin roles on system management tables.
-- Previously these tables only had SELECT policies for authenticated users,
-- so all writes via the browser (anon key) were blocked by RLS.
-- The server deployment uses the service role key (bypasses RLS),
-- but GitHub Pages uses the anon key with authenticated user sessions.

-- Helper: check if the current user has an admin role via JWT metadata
-- roles: super_admin, boss, hr_manager
-- We check raw_app_meta_data and raw_user_meta_data in the JWT

-- system_field_configs: allow admin INSERT/UPDATE/DELETE
create policy "Admins can insert system field configs"
on public.system_field_configs for insert
to authenticated
with check (
  coalesce(
    auth.jwt()->'app_metadata'->>'role',
    auth.jwt()->'user_metadata'->>'role'
  ) in ('super_admin', 'boss', 'hr_manager')
);

create policy "Admins can update system field configs"
on public.system_field_configs for update
to authenticated
using (
  coalesce(
    auth.jwt()->'app_metadata'->>'role',
    auth.jwt()->'user_metadata'->>'role'
  ) in ('super_admin', 'boss', 'hr_manager')
);

create policy "Admins can delete system field configs"
on public.system_field_configs for delete
to authenticated
using (
  coalesce(
    auth.jwt()->'app_metadata'->>'role',
    auth.jwt()->'user_metadata'->>'role'
  ) in ('super_admin', 'boss', 'hr_manager')
);

-- positions: allow admin INSERT/UPDATE/DELETE
create policy "Admins can insert positions"
on public.positions for insert
to authenticated
with check (
  coalesce(
    auth.jwt()->'app_metadata'->>'role',
    auth.jwt()->'user_metadata'->>'role'
  ) in ('super_admin', 'boss', 'hr_manager')
);

create policy "Admins can update positions"
on public.positions for update
to authenticated
using (
  coalesce(
    auth.jwt()->'app_metadata'->>'role',
    auth.jwt()->'user_metadata'->>'role'
  ) in ('super_admin', 'boss', 'hr_manager')
);

create policy "Admins can delete positions"
on public.positions for delete
to authenticated
using (
  coalesce(
    auth.jwt()->'app_metadata'->>'role',
    auth.jwt()->'user_metadata'->>'role'
  ) in ('super_admin', 'boss', 'hr_manager')
);

-- banks: allow admin INSERT/UPDATE/DELETE
create policy "Admins can insert banks"
on public.banks for insert
to authenticated
with check (
  coalesce(
    auth.jwt()->'app_metadata'->>'role',
    auth.jwt()->'user_metadata'->>'role'
  ) in ('super_admin', 'boss', 'hr_manager')
);

create policy "Admins can update banks"
on public.banks for update
to authenticated
using (
  coalesce(
    auth.jwt()->'app_metadata'->>'role',
    auth.jwt()->'user_metadata'->>'role'
  ) in ('super_admin', 'boss', 'hr_manager')
);

create policy "Admins can delete banks"
on public.banks for delete
to authenticated
using (
  coalesce(
    auth.jwt()->'app_metadata'->>'role',
    auth.jwt()->'user_metadata'->>'role'
  ) in ('super_admin', 'boss', 'hr_manager')
);

-- companies: allow admin INSERT/UPDATE/DELETE
create policy "Admins can insert companies"
on public.companies for insert
to authenticated
with check (
  coalesce(
    auth.jwt()->'app_metadata'->>'role',
    auth.jwt()->'user_metadata'->>'role'
  ) in ('super_admin', 'boss', 'hr_manager')
);

create policy "Admins can update companies"
on public.companies for update
to authenticated
using (
  coalesce(
    auth.jwt()->'app_metadata'->>'role',
    auth.jwt()->'user_metadata'->>'role'
  ) in ('super_admin', 'boss', 'hr_manager')
);

create policy "Admins can delete companies"
on public.companies for delete
to authenticated
using (
  coalesce(
    auth.jwt()->'app_metadata'->>'role',
    auth.jwt()->'user_metadata'->>'role'
  ) in ('super_admin', 'boss', 'hr_manager')
);

-- branches: allow admin INSERT/UPDATE/DELETE
create policy "Admins can insert branches"
on public.branches for insert
to authenticated
with check (
  coalesce(
    auth.jwt()->'app_metadata'->>'role',
    auth.jwt()->'user_metadata'->>'role'
  ) in ('super_admin', 'boss', 'hr_manager')
);

create policy "Admins can update branches"
on public.branches for update
to authenticated
using (
  coalesce(
    auth.jwt()->'app_metadata'->>'role',
    auth.jwt()->'user_metadata'->>'role'
  ) in ('super_admin', 'boss', 'hr_manager')
);

create policy "Admins can delete branches"
on public.branches for delete
to authenticated
using (
  coalesce(
    auth.jwt()->'app_metadata'->>'role',
    auth.jwt()->'user_metadata'->>'role'
  ) in ('super_admin', 'boss', 'hr_manager')
);

-- system_settings: enable RLS and add policies
-- (this table had NO RLS before — add it with both read and write policies)
alter table public.system_settings enable row level security;

create policy "Authenticated users can read system settings"
on public.system_settings for select
to authenticated
using (true);

create policy "Admins can insert system settings"
on public.system_settings for insert
to authenticated
with check (
  coalesce(
    auth.jwt()->'app_metadata'->>'role',
    auth.jwt()->'user_metadata'->>'role'
  ) in ('super_admin', 'boss', 'hr_manager')
);

create policy "Admins can update system settings"
on public.system_settings for update
to authenticated
using (
  coalesce(
    auth.jwt()->'app_metadata'->>'role',
    auth.jwt()->'user_metadata'->>'role'
  ) in ('super_admin', 'boss', 'hr_manager')
);
