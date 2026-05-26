alter table public.monthly_commission_records
  add column if not exists manual_bonus_remarks text not null default '',
  add column if not exists manual_deduction_remarks text not null default '';

comment on column public.monthly_commission_records.manual_bonus_remarks is 'Payslip remarks for manual bonus/addition';
comment on column public.monthly_commission_records.manual_deduction_remarks is 'Payslip remarks for manual deduction';
