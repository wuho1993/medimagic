create table if not exists public.saved_shop_commission_presets (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  rules jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint saved_shop_commission_presets_rules_array_check check (jsonb_typeof(rules) = 'array')
);

comment on table public.saved_shop_commission_presets is 'Saved shop commission presets used by employee shop bonus setup and payroll shop commission calculation.';
comment on column public.saved_shop_commission_presets.rules is 'Commission rules filtered to metric=shop. Payroll uses employee_salary_profiles.commission_rules after a preset is applied.';

insert into public.saved_shop_commission_presets (name, rules)
select '大圍鋪數', '[
  {"code":"shop_rate_commission","name":"大圍鋪數佣金","type":"rate","metric":"shop","enabled":true,"stackable":false,"tiers":[
    {"minAmount":0,"maxAmount":799999.99,"rate":0.03},
    {"minAmount":800000,"maxAmount":999999.99,"rate":0.032},
    {"minAmount":1000000,"maxAmount":1199999.99,"rate":0.034},
    {"minAmount":1200000,"maxAmount":1399999.99,"rate":0.036},
    {"minAmount":1400000,"maxAmount":1599999.99,"rate":0.038},
    {"minAmount":1600000,"maxAmount":null,"rate":0.04}
  ]}
]'::jsonb
where not exists (
  select 1 from public.saved_shop_commission_presets where name = '大圍鋪數'
);
