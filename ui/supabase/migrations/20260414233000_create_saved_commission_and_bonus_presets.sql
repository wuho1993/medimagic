create table if not exists public.saved_commission_presets (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  tiers jsonb not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint saved_commission_presets_name_check check (length(btrim(name)) > 0),
  constraint saved_commission_presets_tiers_check check (jsonb_typeof(tiers) = 'array')
);

create table if not exists public.saved_payroll_bonus_presets (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  tiers jsonb not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint saved_payroll_bonus_presets_name_check check (length(btrim(name)) > 0),
  constraint saved_payroll_bonus_presets_tiers_check check (jsonb_typeof(tiers) = 'array')
);

alter table public.employee_salary_profiles
  add column if not exists commission_preset_id uuid references public.saved_commission_presets(id) on delete set null,
  add column if not exists payroll_bonus_preset_id uuid references public.saved_payroll_bonus_presets(id) on delete set null;

create index if not exists idx_employee_salary_profiles_commission_preset_id
  on public.employee_salary_profiles (commission_preset_id);

create index if not exists idx_employee_salary_profiles_payroll_bonus_preset_id
  on public.employee_salary_profiles (payroll_bonus_preset_id);

create or replace function public.touch_saved_scheme_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists trg_saved_commission_presets_updated_at on public.saved_commission_presets;
create trigger trg_saved_commission_presets_updated_at
before update on public.saved_commission_presets
for each row
execute function public.touch_saved_scheme_updated_at();

drop trigger if exists trg_saved_payroll_bonus_presets_updated_at on public.saved_payroll_bonus_presets;
create trigger trg_saved_payroll_bonus_presets_updated_at
before update on public.saved_payroll_bonus_presets
for each row
execute function public.touch_saved_scheme_updated_at();

comment on table public.saved_commission_presets is 'Reusable custom commission schemes for employee salary profiles.';
comment on table public.saved_payroll_bonus_presets is 'Reusable custom sales bonus schemes for employee salary profiles.';
comment on column public.employee_salary_profiles.commission_preset_id is 'Reference to reusable custom commission preset when commission_method = custom.';
comment on column public.employee_salary_profiles.payroll_bonus_preset_id is 'Reference to reusable custom payroll bonus preset when payroll_bonus_scheme = custom.';