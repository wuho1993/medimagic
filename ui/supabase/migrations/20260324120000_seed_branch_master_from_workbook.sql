create table if not exists public.branch_label_mappings (
  id uuid primary key default gen_random_uuid(),
  branch_id uuid not null references public.branches (id) on delete cascade,
  source_label text not null,
  source_system text not null default 'excel_workbook',
  priority integer not null default 100,
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (branch_id, source_label)
);

create index if not exists branch_label_mappings_source_label_idx
  on public.branch_label_mappings (source_label);

drop trigger if exists trg_branch_label_mappings_updated_at on public.branch_label_mappings;
create trigger trg_branch_label_mappings_updated_at
before update on public.branch_label_mappings
for each row execute function public.set_updated_at();

alter table public.branch_label_mappings enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'branch_label_mappings'
      and policyname = 'Authenticated users can read branch label mappings'
  ) then
    create policy "Authenticated users can read branch label mappings"
      on public.branch_label_mappings
      for select
      to authenticated
      using (auth.uid() is not null);
  end if;
end
$$;

with branch_seed(branch_key, name_zh, name_en) as (
  values
    ('OFFICE', 'Office', 'Office'),
    ('CWB', 'CWB', 'CWB'),
    ('TOP', 'TOP', 'TOP'),
    ('TM', 'TM', 'TM'),
    ('TW', 'Tai Wai', 'Tai Wai'),
    ('MKCY', 'MKCY', 'MKCY'),
    ('MOS', 'MOS', 'MOS'),
    ('CBA', 'CBA', 'CBA')
)
insert into public.branches (company_id, code, name_zh, name_en)
select companies.id, branch_seed.branch_key, branch_seed.name_zh, branch_seed.name_en
from public.companies
cross join branch_seed
where companies.code in ('ASA', 'ASAS')
on conflict (company_id, code) do update set
  name_zh = excluded.name_zh,
  name_en = excluded.name_en,
  updated_at = timezone('utc', now());

with mapping_seed(source_label, branch_key, priority, notes) as (
  values
    ('Office', 'OFFICE', 10, 'Workbook branch label'),
    ('OFfice', 'OFFICE', 20, 'Workbook branch label typo'),
    ('CWB', 'CWB', 10, 'Workbook branch label'),
    ('TOP', 'TOP', 10, 'Workbook branch label'),
    ('MK TOP', 'TOP', 20, 'Workbook branch alias'),
    ('MK-TOP', 'TOP', 20, 'Booking-Redeem branch alias'),
    ('TM', 'TM', 10, 'Workbook branch label'),
    ('TW', 'TW', 10, 'Workbook branch label'),
    ('Tai Wai', 'TW', 20, 'Workbook branch alias'),
    ('Tai wai', 'TW', 20, 'Workbook branch alias'),
    ('MKCY', 'MKCY', 10, 'Workbook branch label'),
    ('MK-CY', 'MKCY', 20, 'Booking-Redeem branch alias'),
    ('MOS', 'MOS', 10, 'Workbook branch label'),
    ('CBA', 'CBA', 10, 'Workbook branch label'),
    ('CBA/MKCY', 'CBA', 30, 'Workbook combined branch label'),
    ('CBA/MKCY', 'MKCY', 40, 'Workbook combined branch label'),
    ('MOS/MKCY', 'MOS', 30, 'Workbook combined branch label'),
    ('MOS/MKCY', 'MKCY', 40, 'Workbook combined branch label')
)
insert into public.branch_label_mappings (branch_id, source_label, source_system, priority, notes)
select branches.id, mapping_seed.source_label, 'excel_workbook', mapping_seed.priority, mapping_seed.notes
from public.branches
join public.companies on companies.id = branches.company_id
join mapping_seed on branches.code = mapping_seed.branch_key
on conflict (branch_id, source_label) do update set
  priority = excluded.priority,
  notes = excluded.notes,
  updated_at = timezone('utc', now());