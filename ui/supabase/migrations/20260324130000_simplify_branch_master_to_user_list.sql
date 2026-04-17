with renamed_codes(old_code, new_code, new_name_zh, new_name_en) as (
  values
    ('TOP', 'MKTOP', 'MKTOP', 'MKTOP'),
    ('TM', 'TMA', 'TMA', 'TMA')
)
update public.branches
set
  code = renamed_codes.new_code,
  name_zh = renamed_codes.new_name_zh,
  name_en = renamed_codes.new_name_en,
  is_active = true,
  updated_at = timezone('utc', now())
from renamed_codes
where public.branches.code = renamed_codes.old_code;

with branch_seed(branch_code, name_zh, name_en) as (
  values
    ('OFFICE', 'Office', 'Office'),
    ('TAIWAI', 'TAIWAI', 'TAIWAI'),
    ('TW', 'TW', 'TW'),
    ('MKTOP', 'MKTOP', 'MKTOP'),
    ('TMA', 'TMA', 'TMA'),
    ('MOS', 'MOS', 'MOS'),
    ('CBA', 'CBA', 'CBA'),
    ('MKCY', 'MKCY', 'MKCY')
)
insert into public.branches (company_id, code, name_zh, name_en, is_active)
select companies.id, branch_seed.branch_code, branch_seed.name_zh, branch_seed.name_en, true
from public.companies
cross join branch_seed
where companies.code in ('ASA', 'ASAS')
on conflict (company_id, code) do update set
  name_zh = excluded.name_zh,
  name_en = excluded.name_en,
  is_active = true,
  updated_at = timezone('utc', now());

update public.branches
set
  is_active = code in ('OFFICE', 'TAIWAI', 'TW', 'MKTOP', 'TMA', 'MOS', 'CBA', 'MKCY'),
  updated_at = timezone('utc', now())
where company_id in (
  select id from public.companies where code in ('ASA', 'ASAS')
);

with label_seed(branch_code, source_label, priority, notes) as (
  values
    ('OFFICE', 'Office', 5, 'User confirmed branch label'),
    ('OFFICE', 'OFfice', 10, 'Workbook typo alias'),
    ('TAIWAI', 'TAIWAI', 5, 'User confirmed branch label'),
    ('TAIWAI', 'Tai Wai', 10, 'Common English alias'),
    ('TAIWAI', 'Tai wai', 10, 'Common English alias'),
    ('TW', 'TW', 5, 'User confirmed branch label'),
    ('MKTOP', 'MKTOP', 5, 'User confirmed branch label'),
    ('MKTOP', 'MK TOP', 10, 'Workbook alias'),
    ('MKTOP', 'MK-TOP', 10, 'Workbook alias'),
    ('TMA', 'TMA', 5, 'User confirmed branch label'),
    ('TMA', 'TM', 10, 'Legacy branch code alias'),
    ('MOS', 'MOS', 5, 'User confirmed branch label'),
    ('CBA', 'CBA', 5, 'User confirmed branch label'),
    ('MKCY', 'MKCY', 5, 'User confirmed branch label'),
    ('MKCY', 'MK-CY', 10, 'Workbook alias')
)
insert into public.branch_label_mappings (branch_id, source_label, source_system, priority, notes)
select branches.id, label_seed.source_label, 'user_defined_master', label_seed.priority, label_seed.notes
from public.branches
join label_seed on branches.code = label_seed.branch_code
on conflict (branch_id, source_label) do update set
  source_system = excluded.source_system,
  priority = excluded.priority,
  notes = excluded.notes,
  updated_at = timezone('utc', now());