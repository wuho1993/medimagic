drop index if exists public.employees_department_id_idx;

alter table public.employees
  drop column if exists department_id;

delete from public.system_field_configs
where module_key = 'employee'
  and field_key in ('department', 'departmentId', 'department_id');

drop table if exists public.departments cascade;