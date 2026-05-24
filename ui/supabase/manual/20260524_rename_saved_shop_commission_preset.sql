update public.saved_shop_commission_presets
set
  name = 'Moon and Iris 大圍鋪數方案',
  rules = '[
    {"code":"shop_rate_commission","name":"Moon and Iris 大圍鋪數方案","type":"rate","metric":"shop","enabled":true,"stackable":false,"tiers":[
      {"minAmount":0,"maxAmount":799999.99,"rate":0.03},
      {"minAmount":800000,"maxAmount":999999.99,"rate":0.032},
      {"minAmount":1000000,"maxAmount":1199999.99,"rate":0.034},
      {"minAmount":1200000,"maxAmount":1399999.99,"rate":0.036},
      {"minAmount":1400000,"maxAmount":1599999.99,"rate":0.038},
      {"minAmount":1600000,"maxAmount":null,"rate":0.04}
    ]}
  ]'::jsonb,
  updated_at = now()
where name in ('大圍鋪數', 'Moon and Iris 大圍鋪數方案');

insert into public.saved_shop_commission_presets (name, rules)
select 'Moon and Iris 大圍鋪數方案', '[
  {"code":"shop_rate_commission","name":"Moon and Iris 大圍鋪數方案","type":"rate","metric":"shop","enabled":true,"stackable":false,"tiers":[
    {"minAmount":0,"maxAmount":799999.99,"rate":0.03},
    {"minAmount":800000,"maxAmount":999999.99,"rate":0.032},
    {"minAmount":1000000,"maxAmount":1199999.99,"rate":0.034},
    {"minAmount":1200000,"maxAmount":1399999.99,"rate":0.036},
    {"minAmount":1400000,"maxAmount":1599999.99,"rate":0.038},
    {"minAmount":1600000,"maxAmount":null,"rate":0.04}
  ]}
]'
where not exists (
  select 1
  from public.saved_shop_commission_presets
  where name = 'Moon and Iris 大圍鋪數方案'
);
