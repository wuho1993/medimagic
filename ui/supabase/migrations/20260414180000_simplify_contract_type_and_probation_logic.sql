do $$
begin
  if exists (select 1 from pg_trigger where tgname = 'trg_employees_sync_contract_probation') then
    drop trigger trg_employees_sync_contract_probation on public.employees;
  end if;

  if exists (select 1 from pg_trigger where tgname = 'trg_employees_sync_probation_end_date') then
    drop trigger trg_employees_sync_probation_end_date on public.employees;
  end if;
end
$$;

drop function if exists public.sync_employee_contract_and_probation();
drop function if exists public.sync_employee_probation_end_date();

alter table public.employees
  drop column if exists contract_type;

update public.employees
set
  probation_end_date = case
    when hire_date is null or probation_months is null then null
    else (hire_date + make_interval(months => greatest(probation_months, 0)))::date
  end;

create or replace function public.sync_employee_probation_end_date()
returns trigger
language plpgsql
as $$
begin
  new.probation_end_date := case
    when new.hire_date is null or new.probation_months is null then null
    else (new.hire_date + make_interval(months => greatest(new.probation_months, 0)))::date
  end;

  return new;
end;
$$;

create trigger trg_employees_sync_probation_end_date
before insert or update of hire_date, probation_months
on public.employees
for each row
execute function public.sync_employee_probation_end_date();

drop type if exists public.employee_contract_type;