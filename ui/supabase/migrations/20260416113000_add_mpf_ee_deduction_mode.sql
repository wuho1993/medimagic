alter table public.monthly_commission_records
  add column if not exists mpf_ee_deduction_mode text not null default 'split';

alter table public.monthly_commission_records
  drop constraint if exists monthly_commission_records_mpf_ee_deduction_mode_check;

alter table public.monthly_commission_records
  add constraint monthly_commission_records_mpf_ee_deduction_mode_check
  check (mpf_ee_deduction_mode in ('split', 'month_end'));

comment on column public.monthly_commission_records.mpf_ee_deduction_mode is 'How employee MPF is deducted for the month: split across payroll payouts or once at month end';
