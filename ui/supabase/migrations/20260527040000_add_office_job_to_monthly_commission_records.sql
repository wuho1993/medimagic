alter table public.employee_salary_profiles
  add column if not exists office_job_amount numeric not null default 0;

comment on column public.employee_salary_profiles.office_job_amount is 'Default Job (Office) amount from employee profile. This is fixed payroll income, not commission Job.';

alter table public.monthly_commission_records
  add column if not exists office_job_applied boolean not null default false,
  add column if not exists office_job_amount numeric not null default 0;

comment on column public.monthly_commission_records.office_job_applied is 'Whether Job (Office) is paid for this payroll month. This is fixed payroll income, not commission Job.';
comment on column public.monthly_commission_records.office_job_amount is 'Job (Office) amount paid in the primary/fixed payroll bucket. Separate from commission job_amount.';
