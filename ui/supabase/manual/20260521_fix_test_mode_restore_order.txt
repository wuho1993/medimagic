create or replace function public.finish_test_mode_snapshot(
  p_session_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_session public.test_mode_sessions%rowtype;
  v_tables text;
  v_snapshot record;
begin
  select * into v_session
  from public.test_mode_sessions
  where id = p_session_id
  for update;

  if not found then
    raise exception 'Test mode session not found: %', p_session_id;
  end if;

  if v_session.status <> 'active' then
    return;
  end if;

  select string_agg(format('%I.%I', schema_name, table_name), ', ' order by table_name)
  into v_tables
  from public.test_mode_snapshots
  where session_id = p_session_id;

  if v_tables is null or length(v_tables) = 0 then
    update public.test_mode_sessions
    set status = 'failed', finished_at = now(), error_message = 'No snapshot tables found.'
    where id = p_session_id;
    raise exception 'No snapshot tables found for session: %', p_session_id;
  end if;

  begin
    execute 'truncate table ' || v_tables || ' restart identity cascade';

    for v_snapshot in
      select schema_name, table_name, rows
      from public.test_mode_snapshots
      where session_id = p_session_id
      order by
        case table_name
          when 'companies' then 10
          when 'branches' then 20
          when 'positions' then 30
          when 'banks' then 40
          when 'commission_rate_tiers' then 50
          when 'payroll_scheme_configs' then 60
          when 'system_settings' then 70
          when 'system_field_configs' then 80
          when 'saved_commission_presets' then 90
          when 'saved_payroll_bonus_presets' then 100
          when 'saved_shop_commission_presets' then 110
          when 'employees' then 120
          when 'branch_label_mappings' then 130
          when 'employee_salary_profiles' then 140
          when 'employee_documents' then 150
          when 'employee_visas' then 160
          when 'employee_commission_average_seed' then 170
          when 'employee_commission_average_monthly' then 180
          when 'commission_average_employee_mappings' then 190
          when 'monthly_attendance_records' then 200
          when 'monthly_commission_records' then 210
          when 'leave_balances' then 220
          when 'leave_requests' then 230
          when 'payroll_submission_reviews' then 240
          when 'audit_logs' then 250
          else 1000
        end,
        table_name
    loop
      if jsonb_array_length(v_snapshot.rows) > 0 then
        execute format(
          'insert into %I.%I select * from jsonb_populate_recordset(null::%I.%I, $1)',
          v_snapshot.schema_name,
          v_snapshot.table_name,
          v_snapshot.schema_name,
          v_snapshot.table_name
        ) using v_snapshot.rows;
      end if;
    end loop;

    update public.test_mode_sessions
    set status = 'finished', finished_at = now(), restored_at = now(), error_message = null
    where id = p_session_id;

    delete from public.test_mode_snapshots where session_id = p_session_id;
  exception when others then
    update public.test_mode_sessions
    set status = 'failed', finished_at = now(), error_message = sqlerrm
    where id = p_session_id;
    raise;
  end;
end;
$$;

grant execute on function public.finish_test_mode_snapshot(uuid) to authenticated, service_role;
