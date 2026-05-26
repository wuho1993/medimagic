alter table public.monthly_commission_records
  add column if not exists manual_bonus_payout text not null default 'month_end',
  add column if not exists manual_deduction_payout text not null default 'month_end';

alter table public.monthly_commission_records
  drop constraint if exists monthly_commission_records_manual_bonus_payout_check,
  drop constraint if exists monthly_commission_records_manual_deduction_payout_check;

alter table public.monthly_commission_records
  add constraint monthly_commission_records_manual_bonus_payout_check
  check (manual_bonus_payout in ('primary', 'month_end')),
  add constraint monthly_commission_records_manual_deduction_payout_check
  check (manual_deduction_payout in ('primary', 'month_end'));

comment on column public.monthly_commission_records.manual_bonus_payout is 'Payout timing for manual bonus: primary or month_end';
comment on column public.monthly_commission_records.manual_deduction_payout is 'Payout timing for manual deduction: primary or month_end';
