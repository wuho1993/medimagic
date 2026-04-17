with website_branch_seed(branch_code, name_zh, name_en, address, source_label, notes) as (
  values
    ('CWB', '銅鑼灣', 'Causeway Bay', '渣甸街54-58號富盛商業大廈22樓', '銅鑼灣', 'Official Medi Magic website branch network page'),
    ('TOP', '旺角 T.O.P', 'Mong Kok T.O.P', '彌敦道700號T.O.P Shopping Mall 8樓805-807舖', '旺角', 'Official Medi Magic website branch network page'),
    ('MKCY', '旺角 窩打老道', 'Mong Kok Waterloo Road', '旺角窩打老道39號翠園大廈地下10號舖', '窩打老道', 'Official Medi Magic website branch network page'),
    ('CBA', '荃灣', 'Tsuen Wan', '眾安街68號荃灣千色匯一期10樓1010', '荃灣', 'Official Medi Magic website branch network page'),
    ('TW', '大圍', 'Tai Wai', '積富街83號德安樓地下', '大圍', 'Official Medi Magic website branch network page'),
    ('MOS', '馬鞍山', 'Ma On Shan', '西沙路608號馬鞍山廣場2樓235B舖', '馬鞍山', 'Official Medi Magic website branch network page'),
    ('TM', '屯門', 'Tuen Mun', '屯喜路2號柏麗廣場15樓1518室', '屯門', 'Official Medi Magic website branch network page')
), internal_branch_seed(branch_code, name_zh, name_en, address) as (
  values
    ('OFFICE', 'Office', 'Office', null),
    ('HQ', '總部 / 內部據點', 'Head Office / Internal', null)
)
update public.branches
set
  name_zh = website_branch_seed.name_zh,
  name_en = website_branch_seed.name_en,
  address = website_branch_seed.address,
  updated_at = timezone('utc', now())
from website_branch_seed
where public.branches.code = website_branch_seed.branch_code;

with internal_branch_seed(branch_code, name_zh, name_en, address) as (
  values
    ('OFFICE', 'Office', 'Office', null),
    ('HQ', '總部 / 內部據點', 'Head Office / Internal', null)
)
update public.branches
set
  name_zh = internal_branch_seed.name_zh,
  name_en = internal_branch_seed.name_en,
  updated_at = timezone('utc', now())
from internal_branch_seed
where public.branches.code = internal_branch_seed.branch_code;

with label_seed(branch_code, source_label, priority, notes) as (
  values
    ('CWB', '銅鑼灣', 5, 'Official website branch name'),
    ('CWB', 'Causeway Bay', 10, 'Official website English branch name'),
    ('TOP', '旺角', 5, 'Official website district label for T.O.P branch'),
    ('TOP', '旺角 T.O.P', 6, 'Official website branch name'),
    ('TOP', 'Mong Kok T.O.P', 10, 'Official website English branch name'),
    ('TOP', 'T.O.P Shopping Mall', 15, 'Official website address label'),
    ('MKCY', '窩打老道', 5, 'Official website district label for Waterloo Road branch'),
    ('MKCY', '旺角 窩打老道', 6, 'Official website branch name'),
    ('MKCY', 'Mong Kok Waterloo Road', 10, 'Official website English branch name'),
    ('MKCY', '翠園大廈', 15, 'Official website address label'),
    ('CBA', '荃灣', 5, 'Official website branch name'),
    ('CBA', 'Tsuen Wan', 10, 'Official website English branch name'),
    ('CBA', '荃灣千色匯', 15, 'Official website address label'),
    ('TW', '大圍', 5, 'Official website branch name'),
    ('TW', 'Tai Wai', 10, 'Official website English branch name'),
    ('MOS', '馬鞍山', 5, 'Official website branch name'),
    ('MOS', 'Ma On Shan', 10, 'Official website English branch name'),
    ('TM', '屯門', 5, 'Official website branch name'),
    ('TM', 'Tuen Mun', 10, 'Official website English branch name')
)
insert into public.branch_label_mappings (branch_id, source_label, source_system, priority, notes)
select branches.id, label_seed.source_label, 'official_website', label_seed.priority, label_seed.notes
from public.branches
join label_seed on branches.code = label_seed.branch_code
on conflict (branch_id, source_label) do update set
  source_system = excluded.source_system,
  priority = excluded.priority,
  notes = excluded.notes,
  updated_at = timezone('utc', now());