begin;

alter table public.monthly_attendance_records
  add column if not exists worked_hours numeric default 0;

comment on column public.monthly_attendance_records.worked_hours is
  'Worked hours entered in attendance management for hourly-paid staff; Payroll uses this as paid hours.';

commit;
