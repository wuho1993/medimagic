alter type public.employee_employment_type rename to employee_employment_type_old;

create type public.employee_employment_type as enum ('全職', '兼職', '自僱人士');

alter table public.employees
  alter column employment_type drop default,
  alter column employment_type type public.employee_employment_type
  using (
    case employment_type::text
      when 'full_time' then '全職'
      when 'part_time' then '兼職'
      else employment_type::text
    end
  )::public.employee_employment_type;

drop type public.employee_employment_type_old;