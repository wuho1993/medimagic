-- Postgres functions for client-side user management.
-- These use SECURITY DEFINER to access auth.users from the browser client
-- (anon key) while enforcing admin role checks via JWT.

-- 1. List users (admin only)
create or replace function public.admin_list_users()
returns json
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  caller_role text;
  result json;
begin
  caller_role := coalesce(
    current_setting('request.jwt.claims', true)::json->'app_metadata'->>'role',
    current_setting('request.jwt.claims', true)::json->'user_metadata'->>'role'
  );

  if caller_role not in ('super_admin', 'boss') then
    raise exception 'Permission denied: only super_admin or boss can list users';
  end if;

  select json_agg(row_to_json(t)) into result
  from (
    select
      u.id,
      u.email,
      u.raw_user_meta_data->>'full_name' as full_name,
      u.raw_user_meta_data->>'name' as name,
      coalesce(u.raw_app_meta_data->>'role', u.raw_user_meta_data->>'role', 'employee') as role,
      u.raw_user_meta_data->'access_scope' as user_access_scope,
      u.raw_app_meta_data->'access_scope' as app_access_scope,
      u.email_confirmed_at,
      u.last_sign_in_at,
      u.created_at
    from auth.users u
    order by u.created_at desc
    limit 50
  ) t;

  return coalesce(result, '[]'::json);
end;
$$;

-- 2. Create user (admin only)
create or replace function public.admin_create_user(
  p_email text,
  p_password text,
  p_full_name text default '',
  p_role text default 'employee'
)
returns json
language plpgsql
security definer
set search_path = public, auth, extensions
as $$
declare
  caller_role text;
  new_user_id uuid;
  result json;
begin
  caller_role := coalesce(
    current_setting('request.jwt.claims', true)::json->'app_metadata'->>'role',
    current_setting('request.jwt.claims', true)::json->'user_metadata'->>'role'
  );

  if caller_role not in ('super_admin', 'boss') then
    raise exception 'Permission denied: only super_admin or boss can create users';
  end if;

  if p_email is null or length(trim(p_email)) = 0 then
    raise exception 'Email is required';
  end if;

  if p_password is null or length(p_password) < 8 then
    raise exception 'Password must be at least 8 characters';
  end if;

  -- Check if user already exists
  if exists (select 1 from auth.users where email = lower(trim(p_email))) then
    raise exception 'User with this email already exists';
  end if;

  new_user_id := gen_random_uuid();

  insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at, updated_at,
    confirmation_token, recovery_token,
    email_change_token_new, email_change
  ) values (
    '00000000-0000-0000-0000-000000000000',
    new_user_id,
    'authenticated',
    'authenticated',
    lower(trim(p_email)),
    crypt(p_password, gen_salt('bf')),
    now(),
    jsonb_build_object(
      'provider', 'email',
      'providers', jsonb_build_array('email'),
      'role', p_role
    ),
    jsonb_build_object(
      'full_name', coalesce(nullif(trim(p_full_name), ''), split_part(lower(trim(p_email)), '@', 1)),
      'role', p_role
    ),
    now(), now(),
    '', '', '', ''
  );

  -- Insert identity record (required by Supabase auth)
  insert into auth.identities (
    id, user_id, provider_id, provider,
    identity_data, last_sign_in_at, created_at, updated_at
  ) values (
    gen_random_uuid(),
    new_user_id,
    new_user_id::text,
    'email',
    jsonb_build_object(
      'sub', new_user_id::text,
      'email', lower(trim(p_email)),
      'email_verified', true,
      'phone_verified', false
    ),
    now(), now(), now()
  );

  select json_build_object(
    'id', new_user_id,
    'email', lower(trim(p_email)),
    'full_name', coalesce(nullif(trim(p_full_name), ''), split_part(lower(trim(p_email)), '@', 1)),
    'role', p_role
  ) into result;

  return result;
end;
$$;

-- 3. Update user role and access scope (admin only)
create or replace function public.admin_update_user_role(
  p_user_id uuid,
  p_role text,
  p_access_scope jsonb default null
)
returns json
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  caller_role text;
  existing_user_meta jsonb;
  existing_app_meta jsonb;
  final_scope jsonb;
begin
  caller_role := coalesce(
    current_setting('request.jwt.claims', true)::json->'app_metadata'->>'role',
    current_setting('request.jwt.claims', true)::json->'user_metadata'->>'role'
  );

  if caller_role not in ('super_admin', 'boss') then
    raise exception 'Permission denied: only super_admin or boss can update user roles';
  end if;

  if p_role not in ('super_admin', 'boss', 'hr_manager', 'department_manager', 'employee') then
    raise exception 'Invalid role: %', p_role;
  end if;

  select raw_user_meta_data, raw_app_meta_data
  into existing_user_meta, existing_app_meta
  from auth.users
  where id = p_user_id;

  if not found then
    raise exception 'User not found';
  end if;

  final_scope := coalesce(p_access_scope, '{"all_companies":true,"all_branches":true,"company_ids":[],"branch_ids":[]}'::jsonb);

  update auth.users
  set
    raw_user_meta_data = coalesce(existing_user_meta, '{}'::jsonb)
      || jsonb_build_object('role', p_role, 'access_scope', final_scope),
    raw_app_meta_data = coalesce(existing_app_meta, '{}'::jsonb)
      || jsonb_build_object('role', p_role, 'access_scope', final_scope),
    updated_at = now()
  where id = p_user_id;

  return json_build_object('success', true, 'user_id', p_user_id, 'role', p_role);
end;
$$;

-- Grant execute to authenticated and anon roles
grant execute on function public.admin_list_users() to authenticated;
grant execute on function public.admin_create_user(text, text, text, text) to authenticated;
grant execute on function public.admin_update_user_role(uuid, text, jsonb) to authenticated;
