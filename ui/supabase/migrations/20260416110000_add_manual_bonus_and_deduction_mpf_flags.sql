alter table public.monthly_commission_records
  add column if not exists manual_bonus_mpf_included boolean not null default false,
  add column if not exists manual_deduction_mpf_included boolean not null default false;

comment on column public.monthly_commission_records.manual_bonus_mpf_included is 'Whether the manual monthly bonus should be included in MPF relevant income calculation';
comment on column public.monthly_commission_records.manual_deduction_mpf_included is 'Whether the manual deduction should reduce MPF relevant income calculation';