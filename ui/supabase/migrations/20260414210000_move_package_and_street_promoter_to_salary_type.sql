alter type public.employee_salary_type rename to employee_salary_type_old;

create type public.employee_salary_type as enum ('monthly', 'daily', 'hourly', 'package', 'street_promoter');

alter table public.employee_salary_profiles
  alter column salary_type type public.employee_salary_type
  using (
    case
      when commission_method::text = 'package' then 'package'
      when commission_method::text = 'street_promoter' then 'street_promoter'
      when salary_type is null then null
      else salary_type::text
    end
  )::public.employee_salary_type;

drop type public.employee_salary_type_old;

alter type public.employee_commission_method rename to employee_commission_method_old;

create type public.employee_commission_method as enum ('standard', 'none', 'custom');

alter table public.employee_salary_profiles
  alter column commission_method drop default,
  alter column commission_method type public.employee_commission_method
  using (
    case
      when commission_method::text = 'street_promoter' then 'standard'
      when commission_method::text = 'package' then 'none'
      when commission_method is null then null
      else commission_method::text
    end
  )::public.employee_commission_method,
  alter column commission_method set default 'none';

drop type public.employee_commission_method_old;

comment on column public.employee_salary_profiles.commission_method is '佣金計算方法: standard=標準佣金, custom=自訂佣金, none=無佣金';
comment on column public.employee_salary_profiles.salary_type is '薪金類型: monthly=月薪, daily=日薪, hourly=時薪, package=包佣, street_promoter=街霸';