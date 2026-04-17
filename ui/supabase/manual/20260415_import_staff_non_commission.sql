begin;

-- Clean staged staff import only. Review rows are intentionally excluded.

insert into public.employees (
  employee_code,
  name_zh,
  name_en,
  alias,
  gender,
  identity_type,
  identity_number,
  company_type,
  company_id,
  branch_id,
  branch_code,
  employment_type,
  employment_status,
  position_id,
  hire_date,
  probation_months
)
select
  'SF247',
  '賀蓉花',
  'He Ronghua',
  'Anna',
  'other'::public.employee_gender,
  'hkid'::public.employee_identity_type,
  'M454095(1)',
  'ASA'::public.employee_company_type,
  company.id,
  branch.id,
  'MKTOP',
  'full_time'::public.employee_employment_type,
  'active'::public.employee_status,
  position.id,
  date '2023-08-01',
  1
from public.companies company
join public.branches branch
  on branch.company_id = company.id
 and branch.code = 'MKTOP'
join public.positions position
  on position.code = 'BEAUTICIAN'
where company.code = 'ASA'
on conflict (employee_code) do update set
  name_zh = excluded.name_zh,
  name_en = excluded.name_en,
  alias = excluded.alias,
  gender = excluded.gender,
  identity_type = excluded.identity_type,
  identity_number = excluded.identity_number,
  company_type = excluded.company_type,
  company_id = excluded.company_id,
  branch_id = excluded.branch_id,
  branch_code = excluded.branch_code,
  employment_type = excluded.employment_type,
  employment_status = excluded.employment_status,
  position_id = excluded.position_id,
  hire_date = excluded.hire_date,
  probation_months = excluded.probation_months,
  updated_at = timezone('utc', now());

insert into public.employees (
  employee_code,
  name_zh,
  name_en,
  alias,
  gender,
  identity_type,
  identity_number,
  company_type,
  company_id,
  branch_id,
  branch_code,
  employment_type,
  employment_status,
  position_id,
  hire_date,
  probation_months
)
select
  'SF313',
  '楊達偉',
  'Yeung Tat Wai',
  'Barry',
  'other'::public.employee_gender,
  'hkid'::public.employee_identity_type,
  'Z472686(4)',
  'ASAS'::public.employee_company_type,
  company.id,
  branch.id,
  'OFFICE',
  'full_time'::public.employee_employment_type,
  'active'::public.employee_status,
  position.id,
  date '2024-07-23',
  1
from public.companies company
join public.branches branch
  on branch.company_id = company.id
 and branch.code = 'OFFICE'
join public.positions position
  on position.code = 'CONSULTANT'
where company.code = 'ASAS'
on conflict (employee_code) do update set
  name_zh = excluded.name_zh,
  name_en = excluded.name_en,
  alias = excluded.alias,
  gender = excluded.gender,
  identity_type = excluded.identity_type,
  identity_number = excluded.identity_number,
  company_type = excluded.company_type,
  company_id = excluded.company_id,
  branch_id = excluded.branch_id,
  branch_code = excluded.branch_code,
  employment_type = excluded.employment_type,
  employment_status = excluded.employment_status,
  position_id = excluded.position_id,
  hire_date = excluded.hire_date,
  probation_months = excluded.probation_months,
  updated_at = timezone('utc', now());

insert into public.employees (
  employee_code,
  name_zh,
  name_en,
  alias,
  gender,
  identity_type,
  identity_number,
  company_type,
  company_id,
  branch_id,
  branch_code,
  employment_type,
  employment_status,
  position_id,
  hire_date,
  probation_months
)
select
  'SF182',
  '陳家寶',
  'Chan Ka Po',
  'Bo Yi',
  'other'::public.employee_gender,
  'hkid'::public.employee_identity_type,
  'Y117412(4)',
  'ASAS'::public.employee_company_type,
  company.id,
  branch.id,
  'TMA',
  'full_time'::public.employee_employment_type,
  'active'::public.employee_status,
  position.id,
  date '2022-06-02',
  1
from public.companies company
join public.branches branch
  on branch.company_id = company.id
 and branch.code = 'TMA'
join public.positions position
  on position.code = 'CONSULTANT'
where company.code = 'ASAS'
on conflict (employee_code) do update set
  name_zh = excluded.name_zh,
  name_en = excluded.name_en,
  alias = excluded.alias,
  gender = excluded.gender,
  identity_type = excluded.identity_type,
  identity_number = excluded.identity_number,
  company_type = excluded.company_type,
  company_id = excluded.company_id,
  branch_id = excluded.branch_id,
  branch_code = excluded.branch_code,
  employment_type = excluded.employment_type,
  employment_status = excluded.employment_status,
  position_id = excluded.position_id,
  hire_date = excluded.hire_date,
  probation_months = excluded.probation_months,
  updated_at = timezone('utc', now());

insert into public.employees (
  employee_code,
  name_zh,
  name_en,
  alias,
  gender,
  identity_type,
  identity_number,
  company_type,
  company_id,
  branch_id,
  branch_code,
  employment_type,
  employment_status,
  position_id,
  hire_date,
  probation_months
)
select
  'SF323',
  '費曉蓮',
  'Fei Xiao Lian',
  'Candy',
  'other'::public.employee_gender,
  'hkid'::public.employee_identity_type,
  'R808067(3)',
  'ASA'::public.employee_company_type,
  company.id,
  branch.id,
  'MOS',
  'full_time'::public.employee_employment_type,
  'active'::public.employee_status,
  position.id,
  date '2024-09-03',
  1
from public.companies company
join public.branches branch
  on branch.company_id = company.id
 and branch.code = 'MOS'
join public.positions position
  on position.code = 'CONSULTANT'
where company.code = 'ASA'
on conflict (employee_code) do update set
  name_zh = excluded.name_zh,
  name_en = excluded.name_en,
  alias = excluded.alias,
  gender = excluded.gender,
  identity_type = excluded.identity_type,
  identity_number = excluded.identity_number,
  company_type = excluded.company_type,
  company_id = excluded.company_id,
  branch_id = excluded.branch_id,
  branch_code = excluded.branch_code,
  employment_type = excluded.employment_type,
  employment_status = excluded.employment_status,
  position_id = excluded.position_id,
  hire_date = excluded.hire_date,
  probation_months = excluded.probation_months,
  updated_at = timezone('utc', now());

insert into public.employees (
  employee_code,
  name_zh,
  name_en,
  alias,
  gender,
  identity_type,
  identity_number,
  company_type,
  company_id,
  branch_id,
  branch_code,
  employment_type,
  employment_status,
  position_id,
  hire_date,
  probation_months
)
select
  'SF139',
  '金琴娣',
  'Kam Kam Tai/Kam Kan Tai',
  'Candy Kam',
  'other'::public.employee_gender,
  'hkid'::public.employee_identity_type,
  'P476594(3)',
  'ASAS'::public.employee_company_type,
  company.id,
  branch.id,
  'TW',
  'full_time'::public.employee_employment_type,
  'active'::public.employee_status,
  position.id,
  date '2021-08-01',
  1
from public.companies company
join public.branches branch
  on branch.company_id = company.id
 and branch.code = 'TW'
join public.positions position
  on position.code = 'BEAUTICIAN'
where company.code = 'ASAS'
on conflict (employee_code) do update set
  name_zh = excluded.name_zh,
  name_en = excluded.name_en,
  alias = excluded.alias,
  gender = excluded.gender,
  identity_type = excluded.identity_type,
  identity_number = excluded.identity_number,
  company_type = excluded.company_type,
  company_id = excluded.company_id,
  branch_id = excluded.branch_id,
  branch_code = excluded.branch_code,
  employment_type = excluded.employment_type,
  employment_status = excluded.employment_status,
  position_id = excluded.position_id,
  hire_date = excluded.hire_date,
  probation_months = excluded.probation_months,
  updated_at = timezone('utc', now());

insert into public.employees (
  employee_code,
  name_zh,
  name_en,
  alias,
  gender,
  identity_type,
  identity_number,
  company_type,
  company_id,
  branch_id,
  branch_code,
  employment_type,
  employment_status,
  position_id,
  hire_date,
  probation_months
)
select
  'SF068',
  '焦麗萍',
  'Chiu Lai Ping',
  'Canice',
  'other'::public.employee_gender,
  'hkid'::public.employee_identity_type,
  'Y021950(7)',
  'ASAS'::public.employee_company_type,
  company.id,
  branch.id,
  'OFFICE',
  'full_time'::public.employee_employment_type,
  'active'::public.employee_status,
  position.id,
  date '2020-07-13',
  1
from public.companies company
join public.branches branch
  on branch.company_id = company.id
 and branch.code = 'OFFICE'
join public.positions position
  on position.code = 'CONSULTANT'
where company.code = 'ASAS'
on conflict (employee_code) do update set
  name_zh = excluded.name_zh,
  name_en = excluded.name_en,
  alias = excluded.alias,
  gender = excluded.gender,
  identity_type = excluded.identity_type,
  identity_number = excluded.identity_number,
  company_type = excluded.company_type,
  company_id = excluded.company_id,
  branch_id = excluded.branch_id,
  branch_code = excluded.branch_code,
  employment_type = excluded.employment_type,
  employment_status = excluded.employment_status,
  position_id = excluded.position_id,
  hire_date = excluded.hire_date,
  probation_months = excluded.probation_months,
  updated_at = timezone('utc', now());

insert into public.employees (
  employee_code,
  name_zh,
  name_en,
  alias,
  gender,
  identity_type,
  identity_number,
  company_type,
  company_id,
  branch_id,
  branch_code,
  employment_type,
  employment_status,
  position_id,
  hire_date,
  probation_months
)
select
  'SF155',
  '吳嘉敏',
  'Ng Ka Man Carman',
  'Carman',
  'other'::public.employee_gender,
  'hkid'::public.employee_identity_type,
  'Z539776(7)',
  'ASA'::public.employee_company_type,
  company.id,
  branch.id,
  'OFFICE',
  'full_time'::public.employee_employment_type,
  'active'::public.employee_status,
  position.id,
  date '2021-10-16',
  1
from public.companies company
join public.branches branch
  on branch.company_id = company.id
 and branch.code = 'OFFICE'
join public.positions position
  on position.code = 'CONSULTANT'
where company.code = 'ASA'
on conflict (employee_code) do update set
  name_zh = excluded.name_zh,
  name_en = excluded.name_en,
  alias = excluded.alias,
  gender = excluded.gender,
  identity_type = excluded.identity_type,
  identity_number = excluded.identity_number,
  company_type = excluded.company_type,
  company_id = excluded.company_id,
  branch_id = excluded.branch_id,
  branch_code = excluded.branch_code,
  employment_type = excluded.employment_type,
  employment_status = excluded.employment_status,
  position_id = excluded.position_id,
  hire_date = excluded.hire_date,
  probation_months = excluded.probation_months,
  updated_at = timezone('utc', now());

insert into public.employees (
  employee_code,
  name_zh,
  name_en,
  alias,
  gender,
  identity_type,
  identity_number,
  company_type,
  company_id,
  branch_id,
  branch_code,
  employment_type,
  employment_status,
  position_id,
  hire_date,
  probation_months
)
select
  'SF102',
  '溫婉華',
  'Wan Yuen Wa',
  'Carol',
  'other'::public.employee_gender,
  'hkid'::public.employee_identity_type,
  'V112473(0)',
  'ASA'::public.employee_company_type,
  company.id,
  branch.id,
  'MKTOP',
  'full_time'::public.employee_employment_type,
  'active'::public.employee_status,
  position.id,
  date '2020-09-07',
  1
from public.companies company
join public.branches branch
  on branch.company_id = company.id
 and branch.code = 'MKTOP'
join public.positions position
  on position.code = 'BEAUTICIAN'
where company.code = 'ASA'
on conflict (employee_code) do update set
  name_zh = excluded.name_zh,
  name_en = excluded.name_en,
  alias = excluded.alias,
  gender = excluded.gender,
  identity_type = excluded.identity_type,
  identity_number = excluded.identity_number,
  company_type = excluded.company_type,
  company_id = excluded.company_id,
  branch_id = excluded.branch_id,
  branch_code = excluded.branch_code,
  employment_type = excluded.employment_type,
  employment_status = excluded.employment_status,
  position_id = excluded.position_id,
  hire_date = excluded.hire_date,
  probation_months = excluded.probation_months,
  updated_at = timezone('utc', now());

insert into public.employees (
  employee_code,
  name_zh,
  name_en,
  alias,
  gender,
  identity_type,
  identity_number,
  company_type,
  company_id,
  branch_id,
  branch_code,
  employment_type,
  employment_status,
  position_id,
  hire_date,
  probation_months
)
select
  'SF243',
  '廖舒欣',
  'Liu Shu Yan',
  'Chilly',
  'other'::public.employee_gender,
  'hkid'::public.employee_identity_type,
  'Z659025(0)',
  'ASAS'::public.employee_company_type,
  company.id,
  branch.id,
  'TW',
  'full_time'::public.employee_employment_type,
  'active'::public.employee_status,
  position.id,
  date '2023-07-01',
  1
from public.companies company
join public.branches branch
  on branch.company_id = company.id
 and branch.code = 'TW'
join public.positions position
  on position.code = 'BEAUTICIAN'
where company.code = 'ASAS'
on conflict (employee_code) do update set
  name_zh = excluded.name_zh,
  name_en = excluded.name_en,
  alias = excluded.alias,
  gender = excluded.gender,
  identity_type = excluded.identity_type,
  identity_number = excluded.identity_number,
  company_type = excluded.company_type,
  company_id = excluded.company_id,
  branch_id = excluded.branch_id,
  branch_code = excluded.branch_code,
  employment_type = excluded.employment_type,
  employment_status = excluded.employment_status,
  position_id = excluded.position_id,
  hire_date = excluded.hire_date,
  probation_months = excluded.probation_months,
  updated_at = timezone('utc', now());

insert into public.employees (
  employee_code,
  name_zh,
  name_en,
  alias,
  gender,
  identity_type,
  identity_number,
  company_type,
  company_id,
  branch_id,
  branch_code,
  employment_type,
  employment_status,
  position_id,
  hire_date,
  probation_months
)
select
  'SF190',
  '鄒善盈',
  'Chow Sin Ying Dorcas',
  'Dorcas',
  'other'::public.employee_gender,
  'hkid'::public.employee_identity_type,
  'Y021740(7)',
  'ASAS'::public.employee_company_type,
  company.id,
  branch.id,
  'TMA',
  'full_time'::public.employee_employment_type,
  'active'::public.employee_status,
  position.id,
  date '2022-06-28',
  7
from public.companies company
join public.branches branch
  on branch.company_id = company.id
 and branch.code = 'TMA'
join public.positions position
  on position.code = 'CONSULTANT'
where company.code = 'ASAS'
on conflict (employee_code) do update set
  name_zh = excluded.name_zh,
  name_en = excluded.name_en,
  alias = excluded.alias,
  gender = excluded.gender,
  identity_type = excluded.identity_type,
  identity_number = excluded.identity_number,
  company_type = excluded.company_type,
  company_id = excluded.company_id,
  branch_id = excluded.branch_id,
  branch_code = excluded.branch_code,
  employment_type = excluded.employment_type,
  employment_status = excluded.employment_status,
  position_id = excluded.position_id,
  hire_date = excluded.hire_date,
  probation_months = excluded.probation_months,
  updated_at = timezone('utc', now());

insert into public.employees (
  employee_code,
  name_zh,
  name_en,
  alias,
  gender,
  identity_type,
  identity_number,
  company_type,
  company_id,
  branch_id,
  branch_code,
  employment_type,
  employment_status,
  position_id,
  hire_date,
  probation_months
)
select
  'SF341',
  '李紅妹',
  'Li Hong Mei',
  'Esther',
  'other'::public.employee_gender,
  'hkid'::public.employee_identity_type,
  'R753960(5)',
  'ASA'::public.employee_company_type,
  company.id,
  branch.id,
  'MKCY',
  'full_time'::public.employee_employment_type,
  'active'::public.employee_status,
  position.id,
  date '2025-01-06',
  1
from public.companies company
join public.branches branch
  on branch.company_id = company.id
 and branch.code = 'MKCY'
join public.positions position
  on position.code = 'BEAUTICIAN'
where company.code = 'ASA'
on conflict (employee_code) do update set
  name_zh = excluded.name_zh,
  name_en = excluded.name_en,
  alias = excluded.alias,
  gender = excluded.gender,
  identity_type = excluded.identity_type,
  identity_number = excluded.identity_number,
  company_type = excluded.company_type,
  company_id = excluded.company_id,
  branch_id = excluded.branch_id,
  branch_code = excluded.branch_code,
  employment_type = excluded.employment_type,
  employment_status = excluded.employment_status,
  position_id = excluded.position_id,
  hire_date = excluded.hire_date,
  probation_months = excluded.probation_months,
  updated_at = timezone('utc', now());

insert into public.employees (
  employee_code,
  name_zh,
  name_en,
  alias,
  gender,
  identity_type,
  identity_number,
  company_type,
  company_id,
  branch_id,
  branch_code,
  employment_type,
  employment_status,
  position_id,
  hire_date,
  probation_months
)
select
  'SF339',
  '余敏慧',
  'Yu Man Wai',
  'Fanny',
  'other'::public.employee_gender,
  'hkid'::public.employee_identity_type,
  'Y048581(9)',
  'ASAS'::public.employee_company_type,
  company.id,
  branch.id,
  'OFFICE',
  'full_time'::public.employee_employment_type,
  'active'::public.employee_status,
  position.id,
  date '2024-11-18',
  1
from public.companies company
join public.branches branch
  on branch.company_id = company.id
 and branch.code = 'OFFICE'
join public.positions position
  on position.code = 'CONSULTANT'
where company.code = 'ASAS'
on conflict (employee_code) do update set
  name_zh = excluded.name_zh,
  name_en = excluded.name_en,
  alias = excluded.alias,
  gender = excluded.gender,
  identity_type = excluded.identity_type,
  identity_number = excluded.identity_number,
  company_type = excluded.company_type,
  company_id = excluded.company_id,
  branch_id = excluded.branch_id,
  branch_code = excluded.branch_code,
  employment_type = excluded.employment_type,
  employment_status = excluded.employment_status,
  position_id = excluded.position_id,
  hire_date = excluded.hire_date,
  probation_months = excluded.probation_months,
  updated_at = timezone('utc', now());

insert into public.employees (
  employee_code,
  name_zh,
  name_en,
  alias,
  gender,
  identity_type,
  identity_number,
  company_type,
  company_id,
  branch_id,
  branch_code,
  employment_type,
  employment_status,
  position_id,
  hire_date,
  probation_months
)
select
  'SF250',
  '蔡文瑛',
  'Choi Man Ying',
  'Gina',
  'other'::public.employee_gender,
  'hkid'::public.employee_identity_type,
  'K040808(5)',
  'ASAS'::public.employee_company_type,
  company.id,
  branch.id,
  'OFFICE',
  'full_time'::public.employee_employment_type,
  'active'::public.employee_status,
  position.id,
  date '2023-08-14',
  1
from public.companies company
join public.branches branch
  on branch.company_id = company.id
 and branch.code = 'OFFICE'
join public.positions position
  on position.code = 'CONSULTANT'
where company.code = 'ASAS'
on conflict (employee_code) do update set
  name_zh = excluded.name_zh,
  name_en = excluded.name_en,
  alias = excluded.alias,
  gender = excluded.gender,
  identity_type = excluded.identity_type,
  identity_number = excluded.identity_number,
  company_type = excluded.company_type,
  company_id = excluded.company_id,
  branch_id = excluded.branch_id,
  branch_code = excluded.branch_code,
  employment_type = excluded.employment_type,
  employment_status = excluded.employment_status,
  position_id = excluded.position_id,
  hire_date = excluded.hire_date,
  probation_months = excluded.probation_months,
  updated_at = timezone('utc', now());

insert into public.employees (
  employee_code,
  name_zh,
  name_en,
  alias,
  gender,
  identity_type,
  identity_number,
  company_type,
  company_id,
  branch_id,
  branch_code,
  employment_type,
  employment_status,
  position_id,
  hire_date,
  probation_months
)
select
  'SF260',
  '許靜婷',
  'Hui Ching Ting',
  'Jay',
  'other'::public.employee_gender,
  'hkid'::public.employee_identity_type,
  'Y425013(1)',
  'ASAS'::public.employee_company_type,
  company.id,
  branch.id,
  'TW',
  'full_time'::public.employee_employment_type,
  'active'::public.employee_status,
  position.id,
  date '2023-10-09',
  1
from public.companies company
join public.branches branch
  on branch.company_id = company.id
 and branch.code = 'TW'
join public.positions position
  on position.code = 'BEAUTICIAN'
where company.code = 'ASAS'
on conflict (employee_code) do update set
  name_zh = excluded.name_zh,
  name_en = excluded.name_en,
  alias = excluded.alias,
  gender = excluded.gender,
  identity_type = excluded.identity_type,
  identity_number = excluded.identity_number,
  company_type = excluded.company_type,
  company_id = excluded.company_id,
  branch_id = excluded.branch_id,
  branch_code = excluded.branch_code,
  employment_type = excluded.employment_type,
  employment_status = excluded.employment_status,
  position_id = excluded.position_id,
  hire_date = excluded.hire_date,
  probation_months = excluded.probation_months,
  updated_at = timezone('utc', now());

insert into public.employees (
  employee_code,
  name_zh,
  name_en,
  alias,
  gender,
  identity_type,
  identity_number,
  company_type,
  company_id,
  branch_id,
  branch_code,
  employment_type,
  employment_status,
  position_id,
  hire_date,
  probation_months
)
select
  'SF014',
  '沈雯美',
  'Shum  Man Mei',
  'Jess',
  'other'::public.employee_gender,
  'hkid'::public.employee_identity_type,
  'K564713(4)',
  'ASA'::public.employee_company_type,
  company.id,
  branch.id,
  'MKTOP',
  'full_time'::public.employee_employment_type,
  'active'::public.employee_status,
  position.id,
  date '2017-02-03',
  1
from public.companies company
join public.branches branch
  on branch.company_id = company.id
 and branch.code = 'MKTOP'
join public.positions position
  on position.code = 'BEAUTICIAN'
where company.code = 'ASA'
on conflict (employee_code) do update set
  name_zh = excluded.name_zh,
  name_en = excluded.name_en,
  alias = excluded.alias,
  gender = excluded.gender,
  identity_type = excluded.identity_type,
  identity_number = excluded.identity_number,
  company_type = excluded.company_type,
  company_id = excluded.company_id,
  branch_id = excluded.branch_id,
  branch_code = excluded.branch_code,
  employment_type = excluded.employment_type,
  employment_status = excluded.employment_status,
  position_id = excluded.position_id,
  hire_date = excluded.hire_date,
  probation_months = excluded.probation_months,
  updated_at = timezone('utc', now());

insert into public.employees (
  employee_code,
  name_zh,
  name_en,
  alias,
  gender,
  identity_type,
  identity_number,
  company_type,
  company_id,
  branch_id,
  branch_code,
  employment_type,
  employment_status,
  position_id,
  hire_date,
  probation_months
)
select
  'SF173',
  '何嘉慧',
  'Ho Ka Wai Karen',
  'Karrie',
  'other'::public.employee_gender,
  'hkid'::public.employee_identity_type,
  'Z819778(5)',
  'ASA'::public.employee_company_type,
  company.id,
  branch.id,
  'MKCY',
  'full_time'::public.employee_employment_type,
  'active'::public.employee_status,
  position.id,
  date '2022-04-22',
  7
from public.companies company
join public.branches branch
  on branch.company_id = company.id
 and branch.code = 'MKCY'
join public.positions position
  on position.code = 'CONSULTANT'
where company.code = 'ASA'
on conflict (employee_code) do update set
  name_zh = excluded.name_zh,
  name_en = excluded.name_en,
  alias = excluded.alias,
  gender = excluded.gender,
  identity_type = excluded.identity_type,
  identity_number = excluded.identity_number,
  company_type = excluded.company_type,
  company_id = excluded.company_id,
  branch_id = excluded.branch_id,
  branch_code = excluded.branch_code,
  employment_type = excluded.employment_type,
  employment_status = excluded.employment_status,
  position_id = excluded.position_id,
  hire_date = excluded.hire_date,
  probation_months = excluded.probation_months,
  updated_at = timezone('utc', now());

insert into public.employees (
  employee_code,
  name_zh,
  name_en,
  alias,
  gender,
  identity_type,
  identity_number,
  company_type,
  company_id,
  branch_id,
  branch_code,
  employment_type,
  employment_status,
  position_id,
  hire_date,
  probation_months
)
select
  'SF259',
  '張月時琦',
  'Cheung Yuet Si Kei',
  'Ki Ki',
  'other'::public.employee_gender,
  'hkid'::public.employee_identity_type,
  'P623734(0)',
  'ASA'::public.employee_company_type,
  company.id,
  branch.id,
  'MKCY',
  'full_time'::public.employee_employment_type,
  'active'::public.employee_status,
  position.id,
  date '2023-10-07',
  1
from public.companies company
join public.branches branch
  on branch.company_id = company.id
 and branch.code = 'MKCY'
join public.positions position
  on position.code = 'BEAUTICIAN'
where company.code = 'ASA'
on conflict (employee_code) do update set
  name_zh = excluded.name_zh,
  name_en = excluded.name_en,
  alias = excluded.alias,
  gender = excluded.gender,
  identity_type = excluded.identity_type,
  identity_number = excluded.identity_number,
  company_type = excluded.company_type,
  company_id = excluded.company_id,
  branch_id = excluded.branch_id,
  branch_code = excluded.branch_code,
  employment_type = excluded.employment_type,
  employment_status = excluded.employment_status,
  position_id = excluded.position_id,
  hire_date = excluded.hire_date,
  probation_months = excluded.probation_months,
  updated_at = timezone('utc', now());

insert into public.employees (
  employee_code,
  name_zh,
  name_en,
  alias,
  gender,
  identity_type,
  identity_number,
  company_type,
  company_id,
  branch_id,
  branch_code,
  employment_type,
  employment_status,
  position_id,
  hire_date,
  probation_months
)
select
  'SF006',
  '鄭家彤',
  'Cheng Ka Tung',
  'KT',
  'other'::public.employee_gender,
  'hkid'::public.employee_identity_type,
  'Y270111(A)',
  'ASA'::public.employee_company_type,
  company.id,
  branch.id,
  'MKTOP',
  'full_time'::public.employee_employment_type,
  'active'::public.employee_status,
  position.id,
  date '2016-12-12',
  1
from public.companies company
join public.branches branch
  on branch.company_id = company.id
 and branch.code = 'MKTOP'
join public.positions position
  on position.code = 'BEAUTICIAN'
where company.code = 'ASA'
on conflict (employee_code) do update set
  name_zh = excluded.name_zh,
  name_en = excluded.name_en,
  alias = excluded.alias,
  gender = excluded.gender,
  identity_type = excluded.identity_type,
  identity_number = excluded.identity_number,
  company_type = excluded.company_type,
  company_id = excluded.company_id,
  branch_id = excluded.branch_id,
  branch_code = excluded.branch_code,
  employment_type = excluded.employment_type,
  employment_status = excluded.employment_status,
  position_id = excluded.position_id,
  hire_date = excluded.hire_date,
  probation_months = excluded.probation_months,
  updated_at = timezone('utc', now());

insert into public.employees (
  employee_code,
  name_zh,
  name_en,
  alias,
  gender,
  identity_type,
  identity_number,
  company_type,
  company_id,
  branch_id,
  branch_code,
  employment_type,
  employment_status,
  position_id,
  hire_date,
  probation_months
)
select
  'SF154',
  '毛曉春',
  'Mo Hiu Chun',
  'Lanke',
  'other'::public.employee_gender,
  'hkid'::public.employee_identity_type,
  'V062304(0)',
  'ASAS'::public.employee_company_type,
  company.id,
  branch.id,
  'TMA',
  'full_time'::public.employee_employment_type,
  'active'::public.employee_status,
  position.id,
  date '2021-10-01',
  7
from public.companies company
join public.branches branch
  on branch.company_id = company.id
 and branch.code = 'TMA'
join public.positions position
  on position.code = 'CONSULTANT'
where company.code = 'ASAS'
on conflict (employee_code) do update set
  name_zh = excluded.name_zh,
  name_en = excluded.name_en,
  alias = excluded.alias,
  gender = excluded.gender,
  identity_type = excluded.identity_type,
  identity_number = excluded.identity_number,
  company_type = excluded.company_type,
  company_id = excluded.company_id,
  branch_id = excluded.branch_id,
  branch_code = excluded.branch_code,
  employment_type = excluded.employment_type,
  employment_status = excluded.employment_status,
  position_id = excluded.position_id,
  hire_date = excluded.hire_date,
  probation_months = excluded.probation_months,
  updated_at = timezone('utc', now());

insert into public.employees (
  employee_code,
  name_zh,
  name_en,
  alias,
  gender,
  identity_type,
  identity_number,
  company_type,
  company_id,
  branch_id,
  branch_code,
  employment_type,
  employment_status,
  position_id,
  hire_date,
  probation_months
)
select
  'SF164',
  '楊樂兒',
  'Yeung Lok Yi',
  'Lok Yi',
  'other'::public.employee_gender,
  'hkid'::public.employee_identity_type,
  'Y289319(1)',
  'ASAS'::public.employee_company_type,
  company.id,
  branch.id,
  'TMA',
  'full_time'::public.employee_employment_type,
  'active'::public.employee_status,
  position.id,
  date '2017-12-01',
  1
from public.companies company
join public.branches branch
  on branch.company_id = company.id
 and branch.code = 'TMA'
join public.positions position
  on position.code = 'BEAUTICIAN'
where company.code = 'ASAS'
on conflict (employee_code) do update set
  name_zh = excluded.name_zh,
  name_en = excluded.name_en,
  alias = excluded.alias,
  gender = excluded.gender,
  identity_type = excluded.identity_type,
  identity_number = excluded.identity_number,
  company_type = excluded.company_type,
  company_id = excluded.company_id,
  branch_id = excluded.branch_id,
  branch_code = excluded.branch_code,
  employment_type = excluded.employment_type,
  employment_status = excluded.employment_status,
  position_id = excluded.position_id,
  hire_date = excluded.hire_date,
  probation_months = excluded.probation_months,
  updated_at = timezone('utc', now());

insert into public.employees (
  employee_code,
  name_zh,
  name_en,
  alias,
  gender,
  identity_type,
  identity_number,
  company_type,
  company_id,
  branch_id,
  branch_code,
  employment_type,
  employment_status,
  position_id,
  hire_date,
  probation_months
)
select
  'SF249',
  '戴美美',
  'Tai Mei Mei',
  'Maymay',
  'other'::public.employee_gender,
  'hkid'::public.employee_identity_type,
  'K766222(A)',
  'ASA'::public.employee_company_type,
  company.id,
  branch.id,
  'MKTOP',
  'full_time'::public.employee_employment_type,
  'active'::public.employee_status,
  position.id,
  date '2023-08-11',
  1
from public.companies company
join public.branches branch
  on branch.company_id = company.id
 and branch.code = 'MKTOP'
join public.positions position
  on position.code = 'BEAUTICIAN'
where company.code = 'ASA'
on conflict (employee_code) do update set
  name_zh = excluded.name_zh,
  name_en = excluded.name_en,
  alias = excluded.alias,
  gender = excluded.gender,
  identity_type = excluded.identity_type,
  identity_number = excluded.identity_number,
  company_type = excluded.company_type,
  company_id = excluded.company_id,
  branch_id = excluded.branch_id,
  branch_code = excluded.branch_code,
  employment_type = excluded.employment_type,
  employment_status = excluded.employment_status,
  position_id = excluded.position_id,
  hire_date = excluded.hire_date,
  probation_months = excluded.probation_months,
  updated_at = timezone('utc', now());

insert into public.employees (
  employee_code,
  name_zh,
  name_en,
  alias,
  gender,
  identity_type,
  identity_number,
  company_type,
  company_id,
  branch_id,
  branch_code,
  employment_type,
  employment_status,
  position_id,
  hire_date,
  probation_months
)
select
  'SF344',
  '吳佩臻',
  'Ng Pui Chun',
  'Me',
  'other'::public.employee_gender,
  'hkid'::public.employee_identity_type,
  'C455131(A)',
  'ASAS'::public.employee_company_type,
  company.id,
  branch.id,
  'TMA',
  'full_time'::public.employee_employment_type,
  'active'::public.employee_status,
  position.id,
  date '2025-03-07',
  1
from public.companies company
join public.branches branch
  on branch.company_id = company.id
 and branch.code = 'TMA'
join public.positions position
  on position.code = 'BEAUTICIAN'
where company.code = 'ASAS'
on conflict (employee_code) do update set
  name_zh = excluded.name_zh,
  name_en = excluded.name_en,
  alias = excluded.alias,
  gender = excluded.gender,
  identity_type = excluded.identity_type,
  identity_number = excluded.identity_number,
  company_type = excluded.company_type,
  company_id = excluded.company_id,
  branch_id = excluded.branch_id,
  branch_code = excluded.branch_code,
  employment_type = excluded.employment_type,
  employment_status = excluded.employment_status,
  position_id = excluded.position_id,
  hire_date = excluded.hire_date,
  probation_months = excluded.probation_months,
  updated_at = timezone('utc', now());

insert into public.employees (
  employee_code,
  name_zh,
  name_en,
  alias,
  gender,
  identity_type,
  identity_number,
  company_type,
  company_id,
  branch_id,
  branch_code,
  employment_type,
  employment_status,
  position_id,
  hire_date,
  probation_months
)
select
  'SF331',
  '劉洁婷',
  'Liu Jieting',
  'Miki',
  'other'::public.employee_gender,
  'hkid'::public.employee_identity_type,
  'M910957(4)',
  'ASA'::public.employee_company_type,
  company.id,
  branch.id,
  'MKCY',
  'full_time'::public.employee_employment_type,
  'active'::public.employee_status,
  position.id,
  date '2024-10-10',
  1
from public.companies company
join public.branches branch
  on branch.company_id = company.id
 and branch.code = 'MKCY'
join public.positions position
  on position.code = 'CONSULTANT'
where company.code = 'ASA'
on conflict (employee_code) do update set
  name_zh = excluded.name_zh,
  name_en = excluded.name_en,
  alias = excluded.alias,
  gender = excluded.gender,
  identity_type = excluded.identity_type,
  identity_number = excluded.identity_number,
  company_type = excluded.company_type,
  company_id = excluded.company_id,
  branch_id = excluded.branch_id,
  branch_code = excluded.branch_code,
  employment_type = excluded.employment_type,
  employment_status = excluded.employment_status,
  position_id = excluded.position_id,
  hire_date = excluded.hire_date,
  probation_months = excluded.probation_months,
  updated_at = timezone('utc', now());

insert into public.employees (
  employee_code,
  name_zh,
  name_en,
  alias,
  gender,
  identity_type,
  identity_number,
  company_type,
  company_id,
  branch_id,
  branch_code,
  employment_type,
  employment_status,
  position_id,
  hire_date,
  probation_months
)
select
  'SF336',
  '夏澤嬌',
  'Xia Zejiao',
  'Mimi',
  'other'::public.employee_gender,
  'hkid'::public.employee_identity_type,
  'M715082(8)',
  'ASA'::public.employee_company_type,
  company.id,
  branch.id,
  'MOS',
  'full_time'::public.employee_employment_type,
  'active'::public.employee_status,
  position.id,
  date '2024-10-28',
  1
from public.companies company
join public.branches branch
  on branch.company_id = company.id
 and branch.code = 'MOS'
join public.positions position
  on position.code = 'BEAUTICIAN'
where company.code = 'ASA'
on conflict (employee_code) do update set
  name_zh = excluded.name_zh,
  name_en = excluded.name_en,
  alias = excluded.alias,
  gender = excluded.gender,
  identity_type = excluded.identity_type,
  identity_number = excluded.identity_number,
  company_type = excluded.company_type,
  company_id = excluded.company_id,
  branch_id = excluded.branch_id,
  branch_code = excluded.branch_code,
  employment_type = excluded.employment_type,
  employment_status = excluded.employment_status,
  position_id = excluded.position_id,
  hire_date = excluded.hire_date,
  probation_months = excluded.probation_months,
  updated_at = timezone('utc', now());

insert into public.employees (
  employee_code,
  name_zh,
  name_en,
  alias,
  gender,
  identity_type,
  identity_number,
  company_type,
  company_id,
  branch_id,
  branch_code,
  employment_type,
  employment_status,
  position_id,
  hire_date,
  probation_months
)
select
  'SF312',
  '林映明',
  'Lin Yingming',
  'MING',
  'other'::public.employee_gender,
  'hkid'::public.employee_identity_type,
  'F463321(7)',
  'ASA'::public.employee_company_type,
  company.id,
  branch.id,
  'MKCY',
  'full_time'::public.employee_employment_type,
  'active'::public.employee_status,
  position.id,
  date '2024-07-09',
  1
from public.companies company
join public.branches branch
  on branch.company_id = company.id
 and branch.code = 'MKCY'
join public.positions position
  on position.code = 'BEAUTICIAN'
where company.code = 'ASA'
on conflict (employee_code) do update set
  name_zh = excluded.name_zh,
  name_en = excluded.name_en,
  alias = excluded.alias,
  gender = excluded.gender,
  identity_type = excluded.identity_type,
  identity_number = excluded.identity_number,
  company_type = excluded.company_type,
  company_id = excluded.company_id,
  branch_id = excluded.branch_id,
  branch_code = excluded.branch_code,
  employment_type = excluded.employment_type,
  employment_status = excluded.employment_status,
  position_id = excluded.position_id,
  hire_date = excluded.hire_date,
  probation_months = excluded.probation_months,
  updated_at = timezone('utc', now());

insert into public.employees (
  employee_code,
  name_zh,
  name_en,
  alias,
  gender,
  identity_type,
  identity_number,
  company_type,
  company_id,
  branch_id,
  branch_code,
  employment_type,
  employment_status,
  position_id,
  hire_date,
  probation_months
)
select
  'SF292',
  '連嘉雯',
  'Lin Ka Man',
  'Mon',
  'other'::public.employee_gender,
  'hkid'::public.employee_identity_type,
  'Z871828(9)',
  'ASAS'::public.employee_company_type,
  company.id,
  branch.id,
  'TW',
  'full_time'::public.employee_employment_type,
  'active'::public.employee_status,
  position.id,
  date '2024-06-01',
  1
from public.companies company
join public.branches branch
  on branch.company_id = company.id
 and branch.code = 'TW'
join public.positions position
  on position.code = 'CONSULTANT'
where company.code = 'ASAS'
on conflict (employee_code) do update set
  name_zh = excluded.name_zh,
  name_en = excluded.name_en,
  alias = excluded.alias,
  gender = excluded.gender,
  identity_type = excluded.identity_type,
  identity_number = excluded.identity_number,
  company_type = excluded.company_type,
  company_id = excluded.company_id,
  branch_id = excluded.branch_id,
  branch_code = excluded.branch_code,
  employment_type = excluded.employment_type,
  employment_status = excluded.employment_status,
  position_id = excluded.position_id,
  hire_date = excluded.hire_date,
  probation_months = excluded.probation_months,
  updated_at = timezone('utc', now());

insert into public.employees (
  employee_code,
  name_zh,
  name_en,
  alias,
  gender,
  identity_type,
  identity_number,
  company_type,
  company_id,
  branch_id,
  branch_code,
  employment_type,
  employment_status,
  position_id,
  hire_date,
  probation_months
)
select
  'SF337',
  '黃婉君',
  'Wong Yuen Kwan',
  'Monica',
  'other'::public.employee_gender,
  'hkid'::public.employee_identity_type,
  'R804374(3)',
  'ASA'::public.employee_company_type,
  company.id,
  branch.id,
  'MKTOP',
  'full_time'::public.employee_employment_type,
  'active'::public.employee_status,
  position.id,
  date '2024-11-04',
  1
from public.companies company
join public.branches branch
  on branch.company_id = company.id
 and branch.code = 'MKTOP'
join public.positions position
  on position.code = 'CONSULTANT'
where company.code = 'ASA'
on conflict (employee_code) do update set
  name_zh = excluded.name_zh,
  name_en = excluded.name_en,
  alias = excluded.alias,
  gender = excluded.gender,
  identity_type = excluded.identity_type,
  identity_number = excluded.identity_number,
  company_type = excluded.company_type,
  company_id = excluded.company_id,
  branch_id = excluded.branch_id,
  branch_code = excluded.branch_code,
  employment_type = excluded.employment_type,
  employment_status = excluded.employment_status,
  position_id = excluded.position_id,
  hire_date = excluded.hire_date,
  probation_months = excluded.probation_months,
  updated_at = timezone('utc', now());

insert into public.employees (
  employee_code,
  name_zh,
  name_en,
  alias,
  gender,
  identity_type,
  identity_number,
  company_type,
  company_id,
  branch_id,
  branch_code,
  employment_type,
  employment_status,
  position_id,
  hire_date,
  probation_months
)
select
  'SF222',
  '區寶欣',
  'Au Po Yan',
  'Penny',
  'other'::public.employee_gender,
  'hkid'::public.employee_identity_type,
  'Z335626(5)',
  'ASAS'::public.employee_company_type,
  company.id,
  branch.id,
  'OFFICE',
  'full_time'::public.employee_employment_type,
  'active'::public.employee_status,
  position.id,
  date '2022-12-01',
  1
from public.companies company
join public.branches branch
  on branch.company_id = company.id
 and branch.code = 'OFFICE'
join public.positions position
  on position.code = 'CONSULTANT'
where company.code = 'ASAS'
on conflict (employee_code) do update set
  name_zh = excluded.name_zh,
  name_en = excluded.name_en,
  alias = excluded.alias,
  gender = excluded.gender,
  identity_type = excluded.identity_type,
  identity_number = excluded.identity_number,
  company_type = excluded.company_type,
  company_id = excluded.company_id,
  branch_id = excluded.branch_id,
  branch_code = excluded.branch_code,
  employment_type = excluded.employment_type,
  employment_status = excluded.employment_status,
  position_id = excluded.position_id,
  hire_date = excluded.hire_date,
  probation_months = excluded.probation_months,
  updated_at = timezone('utc', now());

insert into public.employees (
  employee_code,
  name_zh,
  name_en,
  alias,
  gender,
  identity_type,
  identity_number,
  company_type,
  company_id,
  branch_id,
  branch_code,
  employment_type,
  employment_status,
  position_id,
  hire_date,
  probation_months
)
select
  'SF241',
  '梁頌慈',
  'Leung Chung Chi',
  'Rachel',
  'other'::public.employee_gender,
  'hkid'::public.employee_identity_type,
  'Y616699(5)',
  'ASAS'::public.employee_company_type,
  company.id,
  branch.id,
  'MOS',
  'full_time'::public.employee_employment_type,
  'active'::public.employee_status,
  position.id,
  date '2023-06-07',
  1
from public.companies company
join public.branches branch
  on branch.company_id = company.id
 and branch.code = 'MOS'
join public.positions position
  on position.code = 'BEAUTICIAN'
where company.code = 'ASAS'
on conflict (employee_code) do update set
  name_zh = excluded.name_zh,
  name_en = excluded.name_en,
  alias = excluded.alias,
  gender = excluded.gender,
  identity_type = excluded.identity_type,
  identity_number = excluded.identity_number,
  company_type = excluded.company_type,
  company_id = excluded.company_id,
  branch_id = excluded.branch_id,
  branch_code = excluded.branch_code,
  employment_type = excluded.employment_type,
  employment_status = excluded.employment_status,
  position_id = excluded.position_id,
  hire_date = excluded.hire_date,
  probation_months = excluded.probation_months,
  updated_at = timezone('utc', now());

insert into public.employees (
  employee_code,
  name_zh,
  name_en,
  alias,
  gender,
  identity_type,
  identity_number,
  company_type,
  company_id,
  branch_id,
  branch_code,
  employment_type,
  employment_status,
  position_id,
  hire_date,
  probation_months
)
select
  'SF011',
  '李瑞斯',
  'Lee Sui Sze Sylvia',
  'Sylvia',
  'other'::public.employee_gender,
  'hkid'::public.employee_identity_type,
  'C672456(4)',
  'ASA'::public.employee_company_type,
  company.id,
  branch.id,
  'MKTOP',
  'full_time'::public.employee_employment_type,
  'active'::public.employee_status,
  position.id,
  date '2016-12-19',
  7
from public.companies company
join public.branches branch
  on branch.company_id = company.id
 and branch.code = 'MKTOP'
join public.positions position
  on position.code = 'CONSULTANT'
where company.code = 'ASA'
on conflict (employee_code) do update set
  name_zh = excluded.name_zh,
  name_en = excluded.name_en,
  alias = excluded.alias,
  gender = excluded.gender,
  identity_type = excluded.identity_type,
  identity_number = excluded.identity_number,
  company_type = excluded.company_type,
  company_id = excluded.company_id,
  branch_id = excluded.branch_id,
  branch_code = excluded.branch_code,
  employment_type = excluded.employment_type,
  employment_status = excluded.employment_status,
  position_id = excluded.position_id,
  hire_date = excluded.hire_date,
  probation_months = excluded.probation_months,
  updated_at = timezone('utc', now());

insert into public.employees (
  employee_code,
  name_zh,
  name_en,
  alias,
  gender,
  identity_type,
  identity_number,
  company_type,
  company_id,
  branch_id,
  branch_code,
  employment_type,
  employment_status,
  position_id,
  hire_date,
  probation_months
)
select
  'SF320',
  '陳禧旻',
  'Chan Hei Man',
  'Vanessa',
  'other'::public.employee_gender,
  'hkid'::public.employee_identity_type,
  'Y810406(7)',
  'ASA'::public.employee_company_type,
  company.id,
  branch.id,
  'MOS',
  'full_time'::public.employee_employment_type,
  'active'::public.employee_status,
  position.id,
  date '2024-08-01',
  1
from public.companies company
join public.branches branch
  on branch.company_id = company.id
 and branch.code = 'MOS'
join public.positions position
  on position.code = 'BEAUTICIAN'
where company.code = 'ASA'
on conflict (employee_code) do update set
  name_zh = excluded.name_zh,
  name_en = excluded.name_en,
  alias = excluded.alias,
  gender = excluded.gender,
  identity_type = excluded.identity_type,
  identity_number = excluded.identity_number,
  company_type = excluded.company_type,
  company_id = excluded.company_id,
  branch_id = excluded.branch_id,
  branch_code = excluded.branch_code,
  employment_type = excluded.employment_type,
  employment_status = excluded.employment_status,
  position_id = excluded.position_id,
  hire_date = excluded.hire_date,
  probation_months = excluded.probation_months,
  updated_at = timezone('utc', now());

insert into public.employees (
  employee_code,
  name_zh,
  name_en,
  alias,
  gender,
  identity_type,
  identity_number,
  company_type,
  company_id,
  branch_id,
  branch_code,
  employment_type,
  employment_status,
  position_id,
  hire_date,
  probation_months
)
select
  'SF117',
  '張穎詩',
  'Cheung Wendy',
  'Wendy',
  'other'::public.employee_gender,
  'hkid'::public.employee_identity_type,
  'K396005(6)',
  'ASA'::public.employee_company_type,
  company.id,
  branch.id,
  'MKTOP',
  'full_time'::public.employee_employment_type,
  'active'::public.employee_status,
  position.id,
  date '2021-02-27',
  1
from public.companies company
join public.branches branch
  on branch.company_id = company.id
 and branch.code = 'MKTOP'
join public.positions position
  on position.code = 'BEAUTICIAN'
where company.code = 'ASA'
on conflict (employee_code) do update set
  name_zh = excluded.name_zh,
  name_en = excluded.name_en,
  alias = excluded.alias,
  gender = excluded.gender,
  identity_type = excluded.identity_type,
  identity_number = excluded.identity_number,
  company_type = excluded.company_type,
  company_id = excluded.company_id,
  branch_id = excluded.branch_id,
  branch_code = excluded.branch_code,
  employment_type = excluded.employment_type,
  employment_status = excluded.employment_status,
  position_id = excluded.position_id,
  hire_date = excluded.hire_date,
  probation_months = excluded.probation_months,
  updated_at = timezone('utc', now());

insert into public.employees (
  employee_code,
  name_zh,
  name_en,
  alias,
  gender,
  identity_type,
  identity_number,
  company_type,
  company_id,
  branch_id,
  branch_code,
  employment_type,
  employment_status,
  position_id,
  hire_date,
  probation_months
)
select
  'SF144',
  '楊詠兒',
  'Yeung Wing Yi',
  'Wing',
  'other'::public.employee_gender,
  'hkid'::public.employee_identity_type,
  'Y511410(4)',
  'ASAS'::public.employee_company_type,
  company.id,
  branch.id,
  'TMA',
  'full_time'::public.employee_employment_type,
  'active'::public.employee_status,
  position.id,
  date '2021-09-01',
  1
from public.companies company
join public.branches branch
  on branch.company_id = company.id
 and branch.code = 'TMA'
join public.positions position
  on position.code = 'BEAUTICIAN'
where company.code = 'ASAS'
on conflict (employee_code) do update set
  name_zh = excluded.name_zh,
  name_en = excluded.name_en,
  alias = excluded.alias,
  gender = excluded.gender,
  identity_type = excluded.identity_type,
  identity_number = excluded.identity_number,
  company_type = excluded.company_type,
  company_id = excluded.company_id,
  branch_id = excluded.branch_id,
  branch_code = excluded.branch_code,
  employment_type = excluded.employment_type,
  employment_status = excluded.employment_status,
  position_id = excluded.position_id,
  hire_date = excluded.hire_date,
  probation_months = excluded.probation_months,
  updated_at = timezone('utc', now());

insert into public.employees (
  employee_code,
  name_zh,
  name_en,
  alias,
  gender,
  identity_type,
  identity_number,
  company_type,
  company_id,
  branch_id,
  branch_code,
  employment_type,
  employment_status,
  position_id,
  hire_date,
  probation_months
)
select
  'SF025',
  '黃芊銢',
  'Wong Chin Wing',
  'Winnie',
  'other'::public.employee_gender,
  'hkid'::public.employee_identity_type,
  'R441938(2)',
  'ASA'::public.employee_company_type,
  company.id,
  branch.id,
  'MKTOP',
  'full_time'::public.employee_employment_type,
  'active'::public.employee_status,
  position.id,
  date '2017-12-01',
  1
from public.companies company
join public.branches branch
  on branch.company_id = company.id
 and branch.code = 'MKTOP'
join public.positions position
  on position.code = 'BEAUTICIAN'
where company.code = 'ASA'
on conflict (employee_code) do update set
  name_zh = excluded.name_zh,
  name_en = excluded.name_en,
  alias = excluded.alias,
  gender = excluded.gender,
  identity_type = excluded.identity_type,
  identity_number = excluded.identity_number,
  company_type = excluded.company_type,
  company_id = excluded.company_id,
  branch_id = excluded.branch_id,
  branch_code = excluded.branch_code,
  employment_type = excluded.employment_type,
  employment_status = excluded.employment_status,
  position_id = excluded.position_id,
  hire_date = excluded.hire_date,
  probation_months = excluded.probation_months,
  updated_at = timezone('utc', now());

insert into public.employees (
  employee_code,
  name_zh,
  name_en,
  alias,
  gender,
  identity_type,
  identity_number,
  company_type,
  company_id,
  branch_id,
  branch_code,
  employment_type,
  employment_status,
  position_id,
  hire_date,
  probation_months
)
select
  'SF066',
  '溫樂心',
  'Wan Lok Sum',
  'Yan',
  'other'::public.employee_gender,
  'hkid'::public.employee_identity_type,
  'P514901(4)',
  'ASA'::public.employee_company_type,
  company.id,
  branch.id,
  'MKTOP',
  'full_time'::public.employee_employment_type,
  'active'::public.employee_status,
  position.id,
  date '2019-07-15',
  1
from public.companies company
join public.branches branch
  on branch.company_id = company.id
 and branch.code = 'MKTOP'
join public.positions position
  on position.code = 'BEAUTICIAN'
where company.code = 'ASA'
on conflict (employee_code) do update set
  name_zh = excluded.name_zh,
  name_en = excluded.name_en,
  alias = excluded.alias,
  gender = excluded.gender,
  identity_type = excluded.identity_type,
  identity_number = excluded.identity_number,
  company_type = excluded.company_type,
  company_id = excluded.company_id,
  branch_id = excluded.branch_id,
  branch_code = excluded.branch_code,
  employment_type = excluded.employment_type,
  employment_status = excluded.employment_status,
  position_id = excluded.position_id,
  hire_date = excluded.hire_date,
  probation_months = excluded.probation_months,
  updated_at = timezone('utc', now());

insert into public.employees (
  employee_code,
  name_zh,
  name_en,
  alias,
  gender,
  identity_type,
  identity_number,
  company_type,
  company_id,
  branch_id,
  branch_code,
  employment_type,
  employment_status,
  position_id,
  hire_date,
  probation_months
)
select
  'SF119',
  '王龍欣',
  'Wong Lung Yan',
  'Yan Wong',
  'other'::public.employee_gender,
  'hkid'::public.employee_identity_type,
  'R725739(1)',
  'ASAS'::public.employee_company_type,
  company.id,
  branch.id,
  'TW',
  'full_time'::public.employee_employment_type,
  'active'::public.employee_status,
  position.id,
  date '2021-03-01',
  1
from public.companies company
join public.branches branch
  on branch.company_id = company.id
 and branch.code = 'TW'
join public.positions position
  on position.code = 'BEAUTICIAN'
where company.code = 'ASAS'
on conflict (employee_code) do update set
  name_zh = excluded.name_zh,
  name_en = excluded.name_en,
  alias = excluded.alias,
  gender = excluded.gender,
  identity_type = excluded.identity_type,
  identity_number = excluded.identity_number,
  company_type = excluded.company_type,
  company_id = excluded.company_id,
  branch_id = excluded.branch_id,
  branch_code = excluded.branch_code,
  employment_type = excluded.employment_type,
  employment_status = excluded.employment_status,
  position_id = excluded.position_id,
  hire_date = excluded.hire_date,
  probation_months = excluded.probation_months,
  updated_at = timezone('utc', now());

insert into public.employees (
  employee_code,
  name_zh,
  name_en,
  alias,
  gender,
  identity_type,
  identity_number,
  company_type,
  company_id,
  branch_id,
  branch_code,
  employment_type,
  employment_status,
  position_id,
  hire_date,
  probation_months
)
select
  'SF346',
  '李嘉賢',
  'Lei Ka In',
  'Yvonne',
  'other'::public.employee_gender,
  'hkid'::public.employee_identity_type,
  'K471749(A)',
  'ASA'::public.employee_company_type,
  company.id,
  branch.id,
  'TW',
  'full_time'::public.employee_employment_type,
  'active'::public.employee_status,
  position.id,
  date '2025-03-10',
  7
from public.companies company
join public.branches branch
  on branch.company_id = company.id
 and branch.code = 'TW'
join public.positions position
  on position.code = 'CONSULTANT'
where company.code = 'ASA'
on conflict (employee_code) do update set
  name_zh = excluded.name_zh,
  name_en = excluded.name_en,
  alias = excluded.alias,
  gender = excluded.gender,
  identity_type = excluded.identity_type,
  identity_number = excluded.identity_number,
  company_type = excluded.company_type,
  company_id = excluded.company_id,
  branch_id = excluded.branch_id,
  branch_code = excluded.branch_code,
  employment_type = excluded.employment_type,
  employment_status = excluded.employment_status,
  position_id = excluded.position_id,
  hire_date = excluded.hire_date,
  probation_months = excluded.probation_months,
  updated_at = timezone('utc', now());

insert into public.employees (
  employee_code,
  name_zh,
  name_en,
  alias,
  gender,
  identity_type,
  identity_number,
  company_type,
  company_id,
  branch_id,
  branch_code,
  employment_type,
  employment_status,
  position_id,
  hire_date,
  probation_months
)
select
  'SF335',
  '丘沛然',
  'Yau Pui Yin',
  'ZOE',
  'other'::public.employee_gender,
  'hkid'::public.employee_identity_type,
  'Z378318(A)',
  'ASAS'::public.employee_company_type,
  company.id,
  branch.id,
  'TW',
  'full_time'::public.employee_employment_type,
  'active'::public.employee_status,
  position.id,
  date '2024-10-25',
  7
from public.companies company
join public.branches branch
  on branch.company_id = company.id
 and branch.code = 'TW'
join public.positions position
  on position.code = 'CONSULTANT'
where company.code = 'ASAS'
on conflict (employee_code) do update set
  name_zh = excluded.name_zh,
  name_en = excluded.name_en,
  alias = excluded.alias,
  gender = excluded.gender,
  identity_type = excluded.identity_type,
  identity_number = excluded.identity_number,
  company_type = excluded.company_type,
  company_id = excluded.company_id,
  branch_id = excluded.branch_id,
  branch_code = excluded.branch_code,
  employment_type = excluded.employment_type,
  employment_status = excluded.employment_status,
  position_id = excluded.position_id,
  hire_date = excluded.hire_date,
  probation_months = excluded.probation_months,
  updated_at = timezone('utc', now());

insert into public.employees (
  employee_code,
  name_zh,
  name_en,
  alias,
  gender,
  identity_type,
  identity_number,
  company_type,
  company_id,
  branch_id,
  branch_code,
  employment_type,
  employment_status,
  position_id,
  hire_date,
  probation_months
)
select
  'SF065',
  '班秀珍',
  'Ban Xiuzhen',
  '珍珍',
  'other'::public.employee_gender,
  'hkid'::public.employee_identity_type,
  'M649553(8)',
  'ASA'::public.employee_company_type,
  company.id,
  branch.id,
  'MKTOP',
  'full_time'::public.employee_employment_type,
  'active'::public.employee_status,
  position.id,
  date '2019-05-03',
  1
from public.companies company
join public.branches branch
  on branch.company_id = company.id
 and branch.code = 'MKTOP'
join public.positions position
  on position.code = 'BEAUTICIAN'
where company.code = 'ASA'
on conflict (employee_code) do update set
  name_zh = excluded.name_zh,
  name_en = excluded.name_en,
  alias = excluded.alias,
  gender = excluded.gender,
  identity_type = excluded.identity_type,
  identity_number = excluded.identity_number,
  company_type = excluded.company_type,
  company_id = excluded.company_id,
  branch_id = excluded.branch_id,
  branch_code = excluded.branch_code,
  employment_type = excluded.employment_type,
  employment_status = excluded.employment_status,
  position_id = excluded.position_id,
  hire_date = excluded.hire_date,
  probation_months = excluded.probation_months,
  updated_at = timezone('utc', now());

insert into public.employees (
  employee_code,
  name_zh,
  name_en,
  alias,
  gender,
  identity_type,
  identity_number,
  company_type,
  company_id,
  branch_id,
  branch_code,
  employment_type,
  employment_status,
  position_id,
  hire_date,
  probation_months
)
select
  'SF193',
  '林碧珠',
  'Lam Pik Chu',
  '雯雯',
  'other'::public.employee_gender,
  'hkid'::public.employee_identity_type,
  'P354517(6)',
  'ASA'::public.employee_company_type,
  company.id,
  branch.id,
  'MKCY',
  'full_time'::public.employee_employment_type,
  'active'::public.employee_status,
  position.id,
  date '2022-07-07',
  1
from public.companies company
join public.branches branch
  on branch.company_id = company.id
 and branch.code = 'MKCY'
join public.positions position
  on position.code = 'BEAUTICIAN'
where company.code = 'ASA'
on conflict (employee_code) do update set
  name_zh = excluded.name_zh,
  name_en = excluded.name_en,
  alias = excluded.alias,
  gender = excluded.gender,
  identity_type = excluded.identity_type,
  identity_number = excluded.identity_number,
  company_type = excluded.company_type,
  company_id = excluded.company_id,
  branch_id = excluded.branch_id,
  branch_code = excluded.branch_code,
  employment_type = excluded.employment_type,
  employment_status = excluded.employment_status,
  position_id = excluded.position_id,
  hire_date = excluded.hire_date,
  probation_months = excluded.probation_months,
  updated_at = timezone('utc', now());

insert into public.employee_salary_profiles (
  employee_id,
  salary_type,
  base_salary,
  effective_from,
  attendance_bonus_enabled,
  attendance_bonus_amount,
  transport_allowance,
  briefing_bonus,
  booking_bonus,
  mpf_enabled,
  commission_method,
  pay_day_primary,
  pay_day_secondary,
  remarks
)
select
  employee.id,
  'monthly',
  7200,
  date '2023-08-01',
  true,
  2000,
  0,
  250,
  250,
  true,
  'none',
  7,
  null,
  'Imported from Contract List on 2026-04-15; commission fields intentionally ignored at this stage.'
from public.employees employee
where employee.employee_code = 'SF247'
on conflict (employee_id) do update set
  salary_type = excluded.salary_type,
  base_salary = excluded.base_salary,
  effective_from = excluded.effective_from,
  attendance_bonus_enabled = excluded.attendance_bonus_enabled,
  attendance_bonus_amount = excluded.attendance_bonus_amount,
  transport_allowance = excluded.transport_allowance,
  briefing_bonus = excluded.briefing_bonus,
  booking_bonus = excluded.booking_bonus,
  mpf_enabled = excluded.mpf_enabled,
  commission_method = excluded.commission_method,
  pay_day_primary = excluded.pay_day_primary,
  pay_day_secondary = excluded.pay_day_secondary,
  remarks = excluded.remarks,
  updated_at = timezone('utc', now());

insert into public.employee_salary_profiles (
  employee_id,
  salary_type,
  base_salary,
  effective_from,
  attendance_bonus_enabled,
  attendance_bonus_amount,
  transport_allowance,
  briefing_bonus,
  booking_bonus,
  mpf_enabled,
  commission_method,
  pay_day_primary,
  pay_day_secondary,
  remarks
)
select
  employee.id,
  'monthly',
  42500,
  date '2024-07-23',
  true,
  1000,
  0,
  0,
  0,
  true,
  'none',
  10,
  null,
  'Imported from Contract List on 2026-04-15; commission fields intentionally ignored at this stage.'
from public.employees employee
where employee.employee_code = 'SF313'
on conflict (employee_id) do update set
  salary_type = excluded.salary_type,
  base_salary = excluded.base_salary,
  effective_from = excluded.effective_from,
  attendance_bonus_enabled = excluded.attendance_bonus_enabled,
  attendance_bonus_amount = excluded.attendance_bonus_amount,
  transport_allowance = excluded.transport_allowance,
  briefing_bonus = excluded.briefing_bonus,
  booking_bonus = excluded.booking_bonus,
  mpf_enabled = excluded.mpf_enabled,
  commission_method = excluded.commission_method,
  pay_day_primary = excluded.pay_day_primary,
  pay_day_secondary = excluded.pay_day_secondary,
  remarks = excluded.remarks,
  updated_at = timezone('utc', now());

insert into public.employee_salary_profiles (
  employee_id,
  salary_type,
  base_salary,
  effective_from,
  attendance_bonus_enabled,
  attendance_bonus_amount,
  transport_allowance,
  briefing_bonus,
  booking_bonus,
  mpf_enabled,
  commission_method,
  pay_day_primary,
  pay_day_secondary,
  remarks
)
select
  employee.id,
  'monthly',
  14500,
  date '2022-06-02',
  true,
  2000,
  0,
  500,
  500,
  true,
  'none',
  7,
  null,
  'Imported from Contract List on 2026-04-15; commission fields intentionally ignored at this stage.'
from public.employees employee
where employee.employee_code = 'SF182'
on conflict (employee_id) do update set
  salary_type = excluded.salary_type,
  base_salary = excluded.base_salary,
  effective_from = excluded.effective_from,
  attendance_bonus_enabled = excluded.attendance_bonus_enabled,
  attendance_bonus_amount = excluded.attendance_bonus_amount,
  transport_allowance = excluded.transport_allowance,
  briefing_bonus = excluded.briefing_bonus,
  booking_bonus = excluded.booking_bonus,
  mpf_enabled = excluded.mpf_enabled,
  commission_method = excluded.commission_method,
  pay_day_primary = excluded.pay_day_primary,
  pay_day_secondary = excluded.pay_day_secondary,
  remarks = excluded.remarks,
  updated_at = timezone('utc', now());

insert into public.employee_salary_profiles (
  employee_id,
  salary_type,
  base_salary,
  effective_from,
  attendance_bonus_enabled,
  attendance_bonus_amount,
  transport_allowance,
  briefing_bonus,
  booking_bonus,
  mpf_enabled,
  commission_method,
  pay_day_primary,
  pay_day_secondary,
  remarks
)
select
  employee.id,
  'monthly',
  9000,
  date '2024-09-03',
  true,
  2000,
  0,
  500,
  500,
  true,
  'none',
  7,
  null,
  'Imported from Contract List on 2026-04-15; commission fields intentionally ignored at this stage.'
from public.employees employee
where employee.employee_code = 'SF323'
on conflict (employee_id) do update set
  salary_type = excluded.salary_type,
  base_salary = excluded.base_salary,
  effective_from = excluded.effective_from,
  attendance_bonus_enabled = excluded.attendance_bonus_enabled,
  attendance_bonus_amount = excluded.attendance_bonus_amount,
  transport_allowance = excluded.transport_allowance,
  briefing_bonus = excluded.briefing_bonus,
  booking_bonus = excluded.booking_bonus,
  mpf_enabled = excluded.mpf_enabled,
  commission_method = excluded.commission_method,
  pay_day_primary = excluded.pay_day_primary,
  pay_day_secondary = excluded.pay_day_secondary,
  remarks = excluded.remarks,
  updated_at = timezone('utc', now());

insert into public.employee_salary_profiles (
  employee_id,
  salary_type,
  base_salary,
  effective_from,
  attendance_bonus_enabled,
  attendance_bonus_amount,
  transport_allowance,
  briefing_bonus,
  booking_bonus,
  mpf_enabled,
  commission_method,
  pay_day_primary,
  pay_day_secondary,
  remarks
)
select
  employee.id,
  'monthly',
  8300,
  date '2021-08-01',
  true,
  2000,
  0,
  250,
  250,
  true,
  'none',
  7,
  null,
  'Imported from Contract List on 2026-04-15; commission fields intentionally ignored at this stage.'
from public.employees employee
where employee.employee_code = 'SF139'
on conflict (employee_id) do update set
  salary_type = excluded.salary_type,
  base_salary = excluded.base_salary,
  effective_from = excluded.effective_from,
  attendance_bonus_enabled = excluded.attendance_bonus_enabled,
  attendance_bonus_amount = excluded.attendance_bonus_amount,
  transport_allowance = excluded.transport_allowance,
  briefing_bonus = excluded.briefing_bonus,
  booking_bonus = excluded.booking_bonus,
  mpf_enabled = excluded.mpf_enabled,
  commission_method = excluded.commission_method,
  pay_day_primary = excluded.pay_day_primary,
  pay_day_secondary = excluded.pay_day_secondary,
  remarks = excluded.remarks,
  updated_at = timezone('utc', now());

insert into public.employee_salary_profiles (
  employee_id,
  salary_type,
  base_salary,
  effective_from,
  attendance_bonus_enabled,
  attendance_bonus_amount,
  transport_allowance,
  briefing_bonus,
  booking_bonus,
  mpf_enabled,
  commission_method,
  pay_day_primary,
  pay_day_secondary,
  remarks
)
select
  employee.id,
  'monthly',
  17200,
  date '2020-07-13',
  true,
  1000,
  1000,
  1000,
  0,
  true,
  'none',
  7,
  null,
  'Imported from Contract List on 2026-04-15; commission fields intentionally ignored at this stage.'
from public.employees employee
where employee.employee_code = 'SF068'
on conflict (employee_id) do update set
  salary_type = excluded.salary_type,
  base_salary = excluded.base_salary,
  effective_from = excluded.effective_from,
  attendance_bonus_enabled = excluded.attendance_bonus_enabled,
  attendance_bonus_amount = excluded.attendance_bonus_amount,
  transport_allowance = excluded.transport_allowance,
  briefing_bonus = excluded.briefing_bonus,
  booking_bonus = excluded.booking_bonus,
  mpf_enabled = excluded.mpf_enabled,
  commission_method = excluded.commission_method,
  pay_day_primary = excluded.pay_day_primary,
  pay_day_secondary = excluded.pay_day_secondary,
  remarks = excluded.remarks,
  updated_at = timezone('utc', now());

insert into public.employee_salary_profiles (
  employee_id,
  salary_type,
  base_salary,
  effective_from,
  attendance_bonus_enabled,
  attendance_bonus_amount,
  transport_allowance,
  briefing_bonus,
  booking_bonus,
  mpf_enabled,
  commission_method,
  pay_day_primary,
  pay_day_secondary,
  remarks
)
select
  employee.id,
  'monthly',
  27000,
  date '2021-10-16',
  true,
  1000,
  1000,
  1000,
  0,
  true,
  'none',
  7,
  null,
  'Imported from Contract List on 2026-04-15; commission fields intentionally ignored at this stage.'
from public.employees employee
where employee.employee_code = 'SF155'
on conflict (employee_id) do update set
  salary_type = excluded.salary_type,
  base_salary = excluded.base_salary,
  effective_from = excluded.effective_from,
  attendance_bonus_enabled = excluded.attendance_bonus_enabled,
  attendance_bonus_amount = excluded.attendance_bonus_amount,
  transport_allowance = excluded.transport_allowance,
  briefing_bonus = excluded.briefing_bonus,
  booking_bonus = excluded.booking_bonus,
  mpf_enabled = excluded.mpf_enabled,
  commission_method = excluded.commission_method,
  pay_day_primary = excluded.pay_day_primary,
  pay_day_secondary = excluded.pay_day_secondary,
  remarks = excluded.remarks,
  updated_at = timezone('utc', now());

insert into public.employee_salary_profiles (
  employee_id,
  salary_type,
  base_salary,
  effective_from,
  attendance_bonus_enabled,
  attendance_bonus_amount,
  transport_allowance,
  briefing_bonus,
  booking_bonus,
  mpf_enabled,
  commission_method,
  pay_day_primary,
  pay_day_secondary,
  remarks
)
select
  employee.id,
  'monthly',
  7200,
  date '2020-09-07',
  true,
  2000,
  0,
  500,
  500,
  true,
  'none',
  7,
  null,
  'Imported from Contract List on 2026-04-15; commission fields intentionally ignored at this stage.'
from public.employees employee
where employee.employee_code = 'SF102'
on conflict (employee_id) do update set
  salary_type = excluded.salary_type,
  base_salary = excluded.base_salary,
  effective_from = excluded.effective_from,
  attendance_bonus_enabled = excluded.attendance_bonus_enabled,
  attendance_bonus_amount = excluded.attendance_bonus_amount,
  transport_allowance = excluded.transport_allowance,
  briefing_bonus = excluded.briefing_bonus,
  booking_bonus = excluded.booking_bonus,
  mpf_enabled = excluded.mpf_enabled,
  commission_method = excluded.commission_method,
  pay_day_primary = excluded.pay_day_primary,
  pay_day_secondary = excluded.pay_day_secondary,
  remarks = excluded.remarks,
  updated_at = timezone('utc', now());

insert into public.employee_salary_profiles (
  employee_id,
  salary_type,
  base_salary,
  effective_from,
  attendance_bonus_enabled,
  attendance_bonus_amount,
  transport_allowance,
  briefing_bonus,
  booking_bonus,
  mpf_enabled,
  commission_method,
  pay_day_primary,
  pay_day_secondary,
  remarks
)
select
  employee.id,
  'monthly',
  7500,
  date '2023-07-01',
  true,
  2000,
  0,
  1000,
  0,
  true,
  'none',
  9,
  null,
  'Imported from Contract List on 2026-04-15; commission fields intentionally ignored at this stage.'
from public.employees employee
where employee.employee_code = 'SF243'
on conflict (employee_id) do update set
  salary_type = excluded.salary_type,
  base_salary = excluded.base_salary,
  effective_from = excluded.effective_from,
  attendance_bonus_enabled = excluded.attendance_bonus_enabled,
  attendance_bonus_amount = excluded.attendance_bonus_amount,
  transport_allowance = excluded.transport_allowance,
  briefing_bonus = excluded.briefing_bonus,
  booking_bonus = excluded.booking_bonus,
  mpf_enabled = excluded.mpf_enabled,
  commission_method = excluded.commission_method,
  pay_day_primary = excluded.pay_day_primary,
  pay_day_secondary = excluded.pay_day_secondary,
  remarks = excluded.remarks,
  updated_at = timezone('utc', now());

insert into public.employee_salary_profiles (
  employee_id,
  salary_type,
  base_salary,
  effective_from,
  attendance_bonus_enabled,
  attendance_bonus_amount,
  transport_allowance,
  briefing_bonus,
  booking_bonus,
  mpf_enabled,
  commission_method,
  pay_day_primary,
  pay_day_secondary,
  remarks
)
select
  employee.id,
  'monthly',
  14500,
  date '2022-06-28',
  true,
  2000,
  0,
  500,
  500,
  true,
  'none',
  7,
  null,
  'Imported from Contract List on 2026-04-15; commission fields intentionally ignored at this stage.'
from public.employees employee
where employee.employee_code = 'SF190'
on conflict (employee_id) do update set
  salary_type = excluded.salary_type,
  base_salary = excluded.base_salary,
  effective_from = excluded.effective_from,
  attendance_bonus_enabled = excluded.attendance_bonus_enabled,
  attendance_bonus_amount = excluded.attendance_bonus_amount,
  transport_allowance = excluded.transport_allowance,
  briefing_bonus = excluded.briefing_bonus,
  booking_bonus = excluded.booking_bonus,
  mpf_enabled = excluded.mpf_enabled,
  commission_method = excluded.commission_method,
  pay_day_primary = excluded.pay_day_primary,
  pay_day_secondary = excluded.pay_day_secondary,
  remarks = excluded.remarks,
  updated_at = timezone('utc', now());

insert into public.employee_salary_profiles (
  employee_id,
  salary_type,
  base_salary,
  effective_from,
  attendance_bonus_enabled,
  attendance_bonus_amount,
  transport_allowance,
  briefing_bonus,
  booking_bonus,
  mpf_enabled,
  commission_method,
  pay_day_primary,
  pay_day_secondary,
  remarks
)
select
  employee.id,
  'monthly',
  7000,
  date '2025-01-06',
  true,
  2000,
  0,
  500,
  500,
  true,
  'none',
  7,
  null,
  'Imported from Contract List on 2026-04-15; commission fields intentionally ignored at this stage.'
from public.employees employee
where employee.employee_code = 'SF341'
on conflict (employee_id) do update set
  salary_type = excluded.salary_type,
  base_salary = excluded.base_salary,
  effective_from = excluded.effective_from,
  attendance_bonus_enabled = excluded.attendance_bonus_enabled,
  attendance_bonus_amount = excluded.attendance_bonus_amount,
  transport_allowance = excluded.transport_allowance,
  briefing_bonus = excluded.briefing_bonus,
  booking_bonus = excluded.booking_bonus,
  mpf_enabled = excluded.mpf_enabled,
  commission_method = excluded.commission_method,
  pay_day_primary = excluded.pay_day_primary,
  pay_day_secondary = excluded.pay_day_secondary,
  remarks = excluded.remarks,
  updated_at = timezone('utc', now());

insert into public.employee_salary_profiles (
  employee_id,
  salary_type,
  base_salary,
  effective_from,
  attendance_bonus_enabled,
  attendance_bonus_amount,
  transport_allowance,
  briefing_bonus,
  booking_bonus,
  mpf_enabled,
  commission_method,
  pay_day_primary,
  pay_day_secondary,
  remarks
)
select
  employee.id,
  'monthly',
  15500,
  date '2024-11-18',
  true,
  1000,
  0,
  0,
  0,
  true,
  'none',
  7,
  null,
  'Imported from Contract List on 2026-04-15; commission fields intentionally ignored at this stage.'
from public.employees employee
where employee.employee_code = 'SF339'
on conflict (employee_id) do update set
  salary_type = excluded.salary_type,
  base_salary = excluded.base_salary,
  effective_from = excluded.effective_from,
  attendance_bonus_enabled = excluded.attendance_bonus_enabled,
  attendance_bonus_amount = excluded.attendance_bonus_amount,
  transport_allowance = excluded.transport_allowance,
  briefing_bonus = excluded.briefing_bonus,
  booking_bonus = excluded.booking_bonus,
  mpf_enabled = excluded.mpf_enabled,
  commission_method = excluded.commission_method,
  pay_day_primary = excluded.pay_day_primary,
  pay_day_secondary = excluded.pay_day_secondary,
  remarks = excluded.remarks,
  updated_at = timezone('utc', now());

insert into public.employee_salary_profiles (
  employee_id,
  salary_type,
  base_salary,
  effective_from,
  attendance_bonus_enabled,
  attendance_bonus_amount,
  transport_allowance,
  briefing_bonus,
  booking_bonus,
  mpf_enabled,
  commission_method,
  pay_day_primary,
  pay_day_secondary,
  remarks
)
select
  employee.id,
  'monthly',
  15000,
  date '2023-08-14',
  true,
  1000,
  0,
  0,
  0,
  true,
  'none',
  7,
  null,
  'Imported from Contract List on 2026-04-15; commission fields intentionally ignored at this stage.'
from public.employees employee
where employee.employee_code = 'SF250'
on conflict (employee_id) do update set
  salary_type = excluded.salary_type,
  base_salary = excluded.base_salary,
  effective_from = excluded.effective_from,
  attendance_bonus_enabled = excluded.attendance_bonus_enabled,
  attendance_bonus_amount = excluded.attendance_bonus_amount,
  transport_allowance = excluded.transport_allowance,
  briefing_bonus = excluded.briefing_bonus,
  booking_bonus = excluded.booking_bonus,
  mpf_enabled = excluded.mpf_enabled,
  commission_method = excluded.commission_method,
  pay_day_primary = excluded.pay_day_primary,
  pay_day_secondary = excluded.pay_day_secondary,
  remarks = excluded.remarks,
  updated_at = timezone('utc', now());

insert into public.employee_salary_profiles (
  employee_id,
  salary_type,
  base_salary,
  effective_from,
  attendance_bonus_enabled,
  attendance_bonus_amount,
  transport_allowance,
  briefing_bonus,
  booking_bonus,
  mpf_enabled,
  commission_method,
  pay_day_primary,
  pay_day_secondary,
  remarks
)
select
  employee.id,
  'monthly',
  6000,
  date '2023-10-09',
  true,
  2000,
  0,
  1000,
  0,
  true,
  'none',
  7,
  null,
  'Imported from Contract List on 2026-04-15; commission fields intentionally ignored at this stage.'
from public.employees employee
where employee.employee_code = 'SF260'
on conflict (employee_id) do update set
  salary_type = excluded.salary_type,
  base_salary = excluded.base_salary,
  effective_from = excluded.effective_from,
  attendance_bonus_enabled = excluded.attendance_bonus_enabled,
  attendance_bonus_amount = excluded.attendance_bonus_amount,
  transport_allowance = excluded.transport_allowance,
  briefing_bonus = excluded.briefing_bonus,
  booking_bonus = excluded.booking_bonus,
  mpf_enabled = excluded.mpf_enabled,
  commission_method = excluded.commission_method,
  pay_day_primary = excluded.pay_day_primary,
  pay_day_secondary = excluded.pay_day_secondary,
  remarks = excluded.remarks,
  updated_at = timezone('utc', now());

insert into public.employee_salary_profiles (
  employee_id,
  salary_type,
  base_salary,
  effective_from,
  attendance_bonus_enabled,
  attendance_bonus_amount,
  transport_allowance,
  briefing_bonus,
  booking_bonus,
  mpf_enabled,
  commission_method,
  pay_day_primary,
  pay_day_secondary,
  remarks
)
select
  employee.id,
  'monthly',
  10200,
  date '2017-02-03',
  true,
  2000,
  null,
  250,
  250,
  true,
  'none',
  7,
  null,
  'Imported from Contract List on 2026-04-15; commission fields intentionally ignored at this stage.'
from public.employees employee
where employee.employee_code = 'SF014'
on conflict (employee_id) do update set
  salary_type = excluded.salary_type,
  base_salary = excluded.base_salary,
  effective_from = excluded.effective_from,
  attendance_bonus_enabled = excluded.attendance_bonus_enabled,
  attendance_bonus_amount = excluded.attendance_bonus_amount,
  transport_allowance = excluded.transport_allowance,
  briefing_bonus = excluded.briefing_bonus,
  booking_bonus = excluded.booking_bonus,
  mpf_enabled = excluded.mpf_enabled,
  commission_method = excluded.commission_method,
  pay_day_primary = excluded.pay_day_primary,
  pay_day_secondary = excluded.pay_day_secondary,
  remarks = excluded.remarks,
  updated_at = timezone('utc', now());

insert into public.employee_salary_profiles (
  employee_id,
  salary_type,
  base_salary,
  effective_from,
  attendance_bonus_enabled,
  attendance_bonus_amount,
  transport_allowance,
  briefing_bonus,
  booking_bonus,
  mpf_enabled,
  commission_method,
  pay_day_primary,
  pay_day_secondary,
  remarks
)
select
  employee.id,
  'monthly',
  14000,
  date '2022-04-22',
  true,
  2000,
  0,
  500,
  500,
  true,
  'none',
  7,
  null,
  'Imported from Contract List on 2026-04-15; commission fields intentionally ignored at this stage.'
from public.employees employee
where employee.employee_code = 'SF173'
on conflict (employee_id) do update set
  salary_type = excluded.salary_type,
  base_salary = excluded.base_salary,
  effective_from = excluded.effective_from,
  attendance_bonus_enabled = excluded.attendance_bonus_enabled,
  attendance_bonus_amount = excluded.attendance_bonus_amount,
  transport_allowance = excluded.transport_allowance,
  briefing_bonus = excluded.briefing_bonus,
  booking_bonus = excluded.booking_bonus,
  mpf_enabled = excluded.mpf_enabled,
  commission_method = excluded.commission_method,
  pay_day_primary = excluded.pay_day_primary,
  pay_day_secondary = excluded.pay_day_secondary,
  remarks = excluded.remarks,
  updated_at = timezone('utc', now());

insert into public.employee_salary_profiles (
  employee_id,
  salary_type,
  base_salary,
  effective_from,
  attendance_bonus_enabled,
  attendance_bonus_amount,
  transport_allowance,
  briefing_bonus,
  booking_bonus,
  mpf_enabled,
  commission_method,
  pay_day_primary,
  pay_day_secondary,
  remarks
)
select
  employee.id,
  'monthly',
  7200,
  date '2023-10-07',
  true,
  2000,
  0,
  250,
  250,
  true,
  'none',
  7,
  null,
  'Imported from Contract List on 2026-04-15; commission fields intentionally ignored at this stage.'
from public.employees employee
where employee.employee_code = 'SF259'
on conflict (employee_id) do update set
  salary_type = excluded.salary_type,
  base_salary = excluded.base_salary,
  effective_from = excluded.effective_from,
  attendance_bonus_enabled = excluded.attendance_bonus_enabled,
  attendance_bonus_amount = excluded.attendance_bonus_amount,
  transport_allowance = excluded.transport_allowance,
  briefing_bonus = excluded.briefing_bonus,
  booking_bonus = excluded.booking_bonus,
  mpf_enabled = excluded.mpf_enabled,
  commission_method = excluded.commission_method,
  pay_day_primary = excluded.pay_day_primary,
  pay_day_secondary = excluded.pay_day_secondary,
  remarks = excluded.remarks,
  updated_at = timezone('utc', now());

insert into public.employee_salary_profiles (
  employee_id,
  salary_type,
  base_salary,
  effective_from,
  attendance_bonus_enabled,
  attendance_bonus_amount,
  transport_allowance,
  briefing_bonus,
  booking_bonus,
  mpf_enabled,
  commission_method,
  pay_day_primary,
  pay_day_secondary,
  remarks
)
select
  employee.id,
  'monthly',
  4000,
  date '2016-12-12',
  true,
  1000,
  null,
  500,
  0,
  true,
  'none',
  7,
  null,
  'Imported from Contract List on 2026-04-15; commission fields intentionally ignored at this stage.'
from public.employees employee
where employee.employee_code = 'SF006'
on conflict (employee_id) do update set
  salary_type = excluded.salary_type,
  base_salary = excluded.base_salary,
  effective_from = excluded.effective_from,
  attendance_bonus_enabled = excluded.attendance_bonus_enabled,
  attendance_bonus_amount = excluded.attendance_bonus_amount,
  transport_allowance = excluded.transport_allowance,
  briefing_bonus = excluded.briefing_bonus,
  booking_bonus = excluded.booking_bonus,
  mpf_enabled = excluded.mpf_enabled,
  commission_method = excluded.commission_method,
  pay_day_primary = excluded.pay_day_primary,
  pay_day_secondary = excluded.pay_day_secondary,
  remarks = excluded.remarks,
  updated_at = timezone('utc', now());

insert into public.employee_salary_profiles (
  employee_id,
  salary_type,
  base_salary,
  effective_from,
  attendance_bonus_enabled,
  attendance_bonus_amount,
  transport_allowance,
  briefing_bonus,
  booking_bonus,
  mpf_enabled,
  commission_method,
  pay_day_primary,
  pay_day_secondary,
  remarks
)
select
  employee.id,
  'monthly',
  13500,
  date '2021-10-01',
  true,
  2000,
  0,
  1000,
  0,
  true,
  'none',
  7,
  null,
  'Imported from Contract List on 2026-04-15; commission fields intentionally ignored at this stage.'
from public.employees employee
where employee.employee_code = 'SF154'
on conflict (employee_id) do update set
  salary_type = excluded.salary_type,
  base_salary = excluded.base_salary,
  effective_from = excluded.effective_from,
  attendance_bonus_enabled = excluded.attendance_bonus_enabled,
  attendance_bonus_amount = excluded.attendance_bonus_amount,
  transport_allowance = excluded.transport_allowance,
  briefing_bonus = excluded.briefing_bonus,
  booking_bonus = excluded.booking_bonus,
  mpf_enabled = excluded.mpf_enabled,
  commission_method = excluded.commission_method,
  pay_day_primary = excluded.pay_day_primary,
  pay_day_secondary = excluded.pay_day_secondary,
  remarks = excluded.remarks,
  updated_at = timezone('utc', now());

insert into public.employee_salary_profiles (
  employee_id,
  salary_type,
  base_salary,
  effective_from,
  attendance_bonus_enabled,
  attendance_bonus_amount,
  transport_allowance,
  briefing_bonus,
  booking_bonus,
  mpf_enabled,
  commission_method,
  pay_day_primary,
  pay_day_secondary,
  remarks
)
select
  employee.id,
  'monthly',
  20500,
  date '2017-12-01',
  true,
  2000,
  null,
  500,
  500,
  true,
  'none',
  9,
  null,
  'Imported from Contract List on 2026-04-15; commission fields intentionally ignored at this stage.'
from public.employees employee
where employee.employee_code = 'SF164'
on conflict (employee_id) do update set
  salary_type = excluded.salary_type,
  base_salary = excluded.base_salary,
  effective_from = excluded.effective_from,
  attendance_bonus_enabled = excluded.attendance_bonus_enabled,
  attendance_bonus_amount = excluded.attendance_bonus_amount,
  transport_allowance = excluded.transport_allowance,
  briefing_bonus = excluded.briefing_bonus,
  booking_bonus = excluded.booking_bonus,
  mpf_enabled = excluded.mpf_enabled,
  commission_method = excluded.commission_method,
  pay_day_primary = excluded.pay_day_primary,
  pay_day_secondary = excluded.pay_day_secondary,
  remarks = excluded.remarks,
  updated_at = timezone('utc', now());

insert into public.employee_salary_profiles (
  employee_id,
  salary_type,
  base_salary,
  effective_from,
  attendance_bonus_enabled,
  attendance_bonus_amount,
  transport_allowance,
  briefing_bonus,
  booking_bonus,
  mpf_enabled,
  commission_method,
  pay_day_primary,
  pay_day_secondary,
  remarks
)
select
  employee.id,
  'monthly',
  8500,
  date '2023-08-11',
  true,
  2000,
  0,
  500,
  500,
  true,
  'none',
  7,
  null,
  'Imported from Contract List on 2026-04-15; commission fields intentionally ignored at this stage.'
from public.employees employee
where employee.employee_code = 'SF249'
on conflict (employee_id) do update set
  salary_type = excluded.salary_type,
  base_salary = excluded.base_salary,
  effective_from = excluded.effective_from,
  attendance_bonus_enabled = excluded.attendance_bonus_enabled,
  attendance_bonus_amount = excluded.attendance_bonus_amount,
  transport_allowance = excluded.transport_allowance,
  briefing_bonus = excluded.briefing_bonus,
  booking_bonus = excluded.booking_bonus,
  mpf_enabled = excluded.mpf_enabled,
  commission_method = excluded.commission_method,
  pay_day_primary = excluded.pay_day_primary,
  pay_day_secondary = excluded.pay_day_secondary,
  remarks = excluded.remarks,
  updated_at = timezone('utc', now());

insert into public.employee_salary_profiles (
  employee_id,
  salary_type,
  base_salary,
  effective_from,
  attendance_bonus_enabled,
  attendance_bonus_amount,
  transport_allowance,
  briefing_bonus,
  booking_bonus,
  mpf_enabled,
  commission_method,
  pay_day_primary,
  pay_day_secondary,
  remarks
)
select
  employee.id,
  'monthly',
  7000,
  date '2025-03-07',
  true,
  2000,
  0,
  500,
  500,
  true,
  'none',
  7,
  null,
  'Imported from Contract List on 2026-04-15; commission fields intentionally ignored at this stage.'
from public.employees employee
where employee.employee_code = 'SF344'
on conflict (employee_id) do update set
  salary_type = excluded.salary_type,
  base_salary = excluded.base_salary,
  effective_from = excluded.effective_from,
  attendance_bonus_enabled = excluded.attendance_bonus_enabled,
  attendance_bonus_amount = excluded.attendance_bonus_amount,
  transport_allowance = excluded.transport_allowance,
  briefing_bonus = excluded.briefing_bonus,
  booking_bonus = excluded.booking_bonus,
  mpf_enabled = excluded.mpf_enabled,
  commission_method = excluded.commission_method,
  pay_day_primary = excluded.pay_day_primary,
  pay_day_secondary = excluded.pay_day_secondary,
  remarks = excluded.remarks,
  updated_at = timezone('utc', now());

insert into public.employee_salary_profiles (
  employee_id,
  salary_type,
  base_salary,
  effective_from,
  attendance_bonus_enabled,
  attendance_bonus_amount,
  transport_allowance,
  briefing_bonus,
  booking_bonus,
  mpf_enabled,
  commission_method,
  pay_day_primary,
  pay_day_secondary,
  remarks
)
select
  employee.id,
  'monthly',
  13500,
  date '2024-10-10',
  true,
  2000,
  0,
  500,
  500,
  true,
  'none',
  7,
  null,
  'Imported from Contract List on 2026-04-15; commission fields intentionally ignored at this stage.'
from public.employees employee
where employee.employee_code = 'SF331'
on conflict (employee_id) do update set
  salary_type = excluded.salary_type,
  base_salary = excluded.base_salary,
  effective_from = excluded.effective_from,
  attendance_bonus_enabled = excluded.attendance_bonus_enabled,
  attendance_bonus_amount = excluded.attendance_bonus_amount,
  transport_allowance = excluded.transport_allowance,
  briefing_bonus = excluded.briefing_bonus,
  booking_bonus = excluded.booking_bonus,
  mpf_enabled = excluded.mpf_enabled,
  commission_method = excluded.commission_method,
  pay_day_primary = excluded.pay_day_primary,
  pay_day_secondary = excluded.pay_day_secondary,
  remarks = excluded.remarks,
  updated_at = timezone('utc', now());

insert into public.employee_salary_profiles (
  employee_id,
  salary_type,
  base_salary,
  effective_from,
  attendance_bonus_enabled,
  attendance_bonus_amount,
  transport_allowance,
  briefing_bonus,
  booking_bonus,
  mpf_enabled,
  commission_method,
  pay_day_primary,
  pay_day_secondary,
  remarks
)
select
  employee.id,
  'monthly',
  7000,
  date '2024-10-28',
  true,
  2000,
  0,
  500,
  500,
  true,
  'none',
  7,
  null,
  'Imported from Contract List on 2026-04-15; commission fields intentionally ignored at this stage.'
from public.employees employee
where employee.employee_code = 'SF336'
on conflict (employee_id) do update set
  salary_type = excluded.salary_type,
  base_salary = excluded.base_salary,
  effective_from = excluded.effective_from,
  attendance_bonus_enabled = excluded.attendance_bonus_enabled,
  attendance_bonus_amount = excluded.attendance_bonus_amount,
  transport_allowance = excluded.transport_allowance,
  briefing_bonus = excluded.briefing_bonus,
  booking_bonus = excluded.booking_bonus,
  mpf_enabled = excluded.mpf_enabled,
  commission_method = excluded.commission_method,
  pay_day_primary = excluded.pay_day_primary,
  pay_day_secondary = excluded.pay_day_secondary,
  remarks = excluded.remarks,
  updated_at = timezone('utc', now());

insert into public.employee_salary_profiles (
  employee_id,
  salary_type,
  base_salary,
  effective_from,
  attendance_bonus_enabled,
  attendance_bonus_amount,
  transport_allowance,
  briefing_bonus,
  booking_bonus,
  mpf_enabled,
  commission_method,
  pay_day_primary,
  pay_day_secondary,
  remarks
)
select
  employee.id,
  'monthly',
  7200,
  date '2024-07-09',
  true,
  2000,
  0,
  500,
  500,
  true,
  'none',
  7,
  null,
  'Imported from Contract List on 2026-04-15; commission fields intentionally ignored at this stage.'
from public.employees employee
where employee.employee_code = 'SF312'
on conflict (employee_id) do update set
  salary_type = excluded.salary_type,
  base_salary = excluded.base_salary,
  effective_from = excluded.effective_from,
  attendance_bonus_enabled = excluded.attendance_bonus_enabled,
  attendance_bonus_amount = excluded.attendance_bonus_amount,
  transport_allowance = excluded.transport_allowance,
  briefing_bonus = excluded.briefing_bonus,
  booking_bonus = excluded.booking_bonus,
  mpf_enabled = excluded.mpf_enabled,
  commission_method = excluded.commission_method,
  pay_day_primary = excluded.pay_day_primary,
  pay_day_secondary = excluded.pay_day_secondary,
  remarks = excluded.remarks,
  updated_at = timezone('utc', now());

insert into public.employee_salary_profiles (
  employee_id,
  salary_type,
  base_salary,
  effective_from,
  attendance_bonus_enabled,
  attendance_bonus_amount,
  transport_allowance,
  briefing_bonus,
  booking_bonus,
  mpf_enabled,
  commission_method,
  pay_day_primary,
  pay_day_secondary,
  remarks
)
select
  employee.id,
  'monthly',
  17000,
  date '2024-06-01',
  true,
  2000,
  0,
  500,
  500,
  true,
  'none',
  7,
  null,
  'Imported from Contract List on 2026-04-15; commission fields intentionally ignored at this stage.'
from public.employees employee
where employee.employee_code = 'SF292'
on conflict (employee_id) do update set
  salary_type = excluded.salary_type,
  base_salary = excluded.base_salary,
  effective_from = excluded.effective_from,
  attendance_bonus_enabled = excluded.attendance_bonus_enabled,
  attendance_bonus_amount = excluded.attendance_bonus_amount,
  transport_allowance = excluded.transport_allowance,
  briefing_bonus = excluded.briefing_bonus,
  booking_bonus = excluded.booking_bonus,
  mpf_enabled = excluded.mpf_enabled,
  commission_method = excluded.commission_method,
  pay_day_primary = excluded.pay_day_primary,
  pay_day_secondary = excluded.pay_day_secondary,
  remarks = excluded.remarks,
  updated_at = timezone('utc', now());

insert into public.employee_salary_profiles (
  employee_id,
  salary_type,
  base_salary,
  effective_from,
  attendance_bonus_enabled,
  attendance_bonus_amount,
  transport_allowance,
  briefing_bonus,
  booking_bonus,
  mpf_enabled,
  commission_method,
  pay_day_primary,
  pay_day_secondary,
  remarks
)
select
  employee.id,
  'monthly',
  12200,
  date '2024-11-04',
  true,
  2000,
  0,
  500,
  500,
  true,
  'none',
  7,
  null,
  'Imported from Contract List on 2026-04-15; commission fields intentionally ignored at this stage.'
from public.employees employee
where employee.employee_code = 'SF337'
on conflict (employee_id) do update set
  salary_type = excluded.salary_type,
  base_salary = excluded.base_salary,
  effective_from = excluded.effective_from,
  attendance_bonus_enabled = excluded.attendance_bonus_enabled,
  attendance_bonus_amount = excluded.attendance_bonus_amount,
  transport_allowance = excluded.transport_allowance,
  briefing_bonus = excluded.briefing_bonus,
  booking_bonus = excluded.booking_bonus,
  mpf_enabled = excluded.mpf_enabled,
  commission_method = excluded.commission_method,
  pay_day_primary = excluded.pay_day_primary,
  pay_day_secondary = excluded.pay_day_secondary,
  remarks = excluded.remarks,
  updated_at = timezone('utc', now());

insert into public.employee_salary_profiles (
  employee_id,
  salary_type,
  base_salary,
  effective_from,
  attendance_bonus_enabled,
  attendance_bonus_amount,
  transport_allowance,
  briefing_bonus,
  booking_bonus,
  mpf_enabled,
  commission_method,
  pay_day_primary,
  pay_day_secondary,
  remarks
)
select
  employee.id,
  'monthly',
  33000,
  date '2022-12-01',
  true,
  1000,
  1000,
  1000,
  0,
  true,
  'none',
  7,
  null,
  'Imported from Contract List on 2026-04-15; commission fields intentionally ignored at this stage.'
from public.employees employee
where employee.employee_code = 'SF222'
on conflict (employee_id) do update set
  salary_type = excluded.salary_type,
  base_salary = excluded.base_salary,
  effective_from = excluded.effective_from,
  attendance_bonus_enabled = excluded.attendance_bonus_enabled,
  attendance_bonus_amount = excluded.attendance_bonus_amount,
  transport_allowance = excluded.transport_allowance,
  briefing_bonus = excluded.briefing_bonus,
  booking_bonus = excluded.booking_bonus,
  mpf_enabled = excluded.mpf_enabled,
  commission_method = excluded.commission_method,
  pay_day_primary = excluded.pay_day_primary,
  pay_day_secondary = excluded.pay_day_secondary,
  remarks = excluded.remarks,
  updated_at = timezone('utc', now());

insert into public.employee_salary_profiles (
  employee_id,
  salary_type,
  base_salary,
  effective_from,
  attendance_bonus_enabled,
  attendance_bonus_amount,
  transport_allowance,
  briefing_bonus,
  booking_bonus,
  mpf_enabled,
  commission_method,
  pay_day_primary,
  pay_day_secondary,
  remarks
)
select
  employee.id,
  'monthly',
  6500,
  date '2023-06-07',
  true,
  2000,
  null,
  500,
  500,
  true,
  'none',
  7,
  null,
  'Imported from Contract List on 2026-04-15; commission fields intentionally ignored at this stage.'
from public.employees employee
where employee.employee_code = 'SF241'
on conflict (employee_id) do update set
  salary_type = excluded.salary_type,
  base_salary = excluded.base_salary,
  effective_from = excluded.effective_from,
  attendance_bonus_enabled = excluded.attendance_bonus_enabled,
  attendance_bonus_amount = excluded.attendance_bonus_amount,
  transport_allowance = excluded.transport_allowance,
  briefing_bonus = excluded.briefing_bonus,
  booking_bonus = excluded.booking_bonus,
  mpf_enabled = excluded.mpf_enabled,
  commission_method = excluded.commission_method,
  pay_day_primary = excluded.pay_day_primary,
  pay_day_secondary = excluded.pay_day_secondary,
  remarks = excluded.remarks,
  updated_at = timezone('utc', now());

insert into public.employee_salary_profiles (
  employee_id,
  salary_type,
  base_salary,
  effective_from,
  attendance_bonus_enabled,
  attendance_bonus_amount,
  transport_allowance,
  briefing_bonus,
  booking_bonus,
  mpf_enabled,
  commission_method,
  pay_day_primary,
  pay_day_secondary,
  remarks
)
select
  employee.id,
  'monthly',
  15300,
  date '2016-12-19',
  true,
  2000,
  0,
  500,
  500,
  true,
  'none',
  8,
  null,
  'Imported from Contract List on 2026-04-15; commission fields intentionally ignored at this stage.'
from public.employees employee
where employee.employee_code = 'SF011'
on conflict (employee_id) do update set
  salary_type = excluded.salary_type,
  base_salary = excluded.base_salary,
  effective_from = excluded.effective_from,
  attendance_bonus_enabled = excluded.attendance_bonus_enabled,
  attendance_bonus_amount = excluded.attendance_bonus_amount,
  transport_allowance = excluded.transport_allowance,
  briefing_bonus = excluded.briefing_bonus,
  booking_bonus = excluded.booking_bonus,
  mpf_enabled = excluded.mpf_enabled,
  commission_method = excluded.commission_method,
  pay_day_primary = excluded.pay_day_primary,
  pay_day_secondary = excluded.pay_day_secondary,
  remarks = excluded.remarks,
  updated_at = timezone('utc', now());

insert into public.employee_salary_profiles (
  employee_id,
  salary_type,
  base_salary,
  effective_from,
  attendance_bonus_enabled,
  attendance_bonus_amount,
  transport_allowance,
  briefing_bonus,
  booking_bonus,
  mpf_enabled,
  commission_method,
  pay_day_primary,
  pay_day_secondary,
  remarks
)
select
  employee.id,
  'monthly',
  6000,
  date '2024-08-01',
  true,
  2000,
  0,
  500,
  500,
  true,
  'none',
  7,
  null,
  'Imported from Contract List on 2026-04-15; commission fields intentionally ignored at this stage.'
from public.employees employee
where employee.employee_code = 'SF320'
on conflict (employee_id) do update set
  salary_type = excluded.salary_type,
  base_salary = excluded.base_salary,
  effective_from = excluded.effective_from,
  attendance_bonus_enabled = excluded.attendance_bonus_enabled,
  attendance_bonus_amount = excluded.attendance_bonus_amount,
  transport_allowance = excluded.transport_allowance,
  briefing_bonus = excluded.briefing_bonus,
  booking_bonus = excluded.booking_bonus,
  mpf_enabled = excluded.mpf_enabled,
  commission_method = excluded.commission_method,
  pay_day_primary = excluded.pay_day_primary,
  pay_day_secondary = excluded.pay_day_secondary,
  remarks = excluded.remarks,
  updated_at = timezone('utc', now());

insert into public.employee_salary_profiles (
  employee_id,
  salary_type,
  base_salary,
  effective_from,
  attendance_bonus_enabled,
  attendance_bonus_amount,
  transport_allowance,
  briefing_bonus,
  booking_bonus,
  mpf_enabled,
  commission_method,
  pay_day_primary,
  pay_day_secondary,
  remarks
)
select
  employee.id,
  'monthly',
  6300,
  date '2021-02-27',
  true,
  2000,
  0,
  500,
  500,
  true,
  'none',
  7,
  null,
  'Imported from Contract List on 2026-04-15; commission fields intentionally ignored at this stage.'
from public.employees employee
where employee.employee_code = 'SF117'
on conflict (employee_id) do update set
  salary_type = excluded.salary_type,
  base_salary = excluded.base_salary,
  effective_from = excluded.effective_from,
  attendance_bonus_enabled = excluded.attendance_bonus_enabled,
  attendance_bonus_amount = excluded.attendance_bonus_amount,
  transport_allowance = excluded.transport_allowance,
  briefing_bonus = excluded.briefing_bonus,
  booking_bonus = excluded.booking_bonus,
  mpf_enabled = excluded.mpf_enabled,
  commission_method = excluded.commission_method,
  pay_day_primary = excluded.pay_day_primary,
  pay_day_secondary = excluded.pay_day_secondary,
  remarks = excluded.remarks,
  updated_at = timezone('utc', now());

insert into public.employee_salary_profiles (
  employee_id,
  salary_type,
  base_salary,
  effective_from,
  attendance_bonus_enabled,
  attendance_bonus_amount,
  transport_allowance,
  briefing_bonus,
  booking_bonus,
  mpf_enabled,
  commission_method,
  pay_day_primary,
  pay_day_secondary,
  remarks
)
select
  employee.id,
  'monthly',
  8000,
  date '2021-09-01',
  true,
  2000,
  0,
  500,
  500,
  true,
  'none',
  7,
  null,
  'Imported from Contract List on 2026-04-15; commission fields intentionally ignored at this stage.'
from public.employees employee
where employee.employee_code = 'SF144'
on conflict (employee_id) do update set
  salary_type = excluded.salary_type,
  base_salary = excluded.base_salary,
  effective_from = excluded.effective_from,
  attendance_bonus_enabled = excluded.attendance_bonus_enabled,
  attendance_bonus_amount = excluded.attendance_bonus_amount,
  transport_allowance = excluded.transport_allowance,
  briefing_bonus = excluded.briefing_bonus,
  booking_bonus = excluded.booking_bonus,
  mpf_enabled = excluded.mpf_enabled,
  commission_method = excluded.commission_method,
  pay_day_primary = excluded.pay_day_primary,
  pay_day_secondary = excluded.pay_day_secondary,
  remarks = excluded.remarks,
  updated_at = timezone('utc', now());

insert into public.employee_salary_profiles (
  employee_id,
  salary_type,
  base_salary,
  effective_from,
  attendance_bonus_enabled,
  attendance_bonus_amount,
  transport_allowance,
  briefing_bonus,
  booking_bonus,
  mpf_enabled,
  commission_method,
  pay_day_primary,
  pay_day_secondary,
  remarks
)
select
  employee.id,
  'monthly',
  7800,
  date '2017-12-01',
  true,
  2000,
  0,
  500,
  500,
  true,
  'none',
  9,
  null,
  'Imported from Contract List on 2026-04-15; commission fields intentionally ignored at this stage.'
from public.employees employee
where employee.employee_code = 'SF025'
on conflict (employee_id) do update set
  salary_type = excluded.salary_type,
  base_salary = excluded.base_salary,
  effective_from = excluded.effective_from,
  attendance_bonus_enabled = excluded.attendance_bonus_enabled,
  attendance_bonus_amount = excluded.attendance_bonus_amount,
  transport_allowance = excluded.transport_allowance,
  briefing_bonus = excluded.briefing_bonus,
  booking_bonus = excluded.booking_bonus,
  mpf_enabled = excluded.mpf_enabled,
  commission_method = excluded.commission_method,
  pay_day_primary = excluded.pay_day_primary,
  pay_day_secondary = excluded.pay_day_secondary,
  remarks = excluded.remarks,
  updated_at = timezone('utc', now());

insert into public.employee_salary_profiles (
  employee_id,
  salary_type,
  base_salary,
  effective_from,
  attendance_bonus_enabled,
  attendance_bonus_amount,
  transport_allowance,
  briefing_bonus,
  booking_bonus,
  mpf_enabled,
  commission_method,
  pay_day_primary,
  pay_day_secondary,
  remarks
)
select
  employee.id,
  'monthly',
  21300,
  date '2019-07-15',
  true,
  2000,
  0,
  500,
  500,
  true,
  'none',
  7,
  null,
  'Imported from Contract List on 2026-04-15; commission fields intentionally ignored at this stage.'
from public.employees employee
where employee.employee_code = 'SF066'
on conflict (employee_id) do update set
  salary_type = excluded.salary_type,
  base_salary = excluded.base_salary,
  effective_from = excluded.effective_from,
  attendance_bonus_enabled = excluded.attendance_bonus_enabled,
  attendance_bonus_amount = excluded.attendance_bonus_amount,
  transport_allowance = excluded.transport_allowance,
  briefing_bonus = excluded.briefing_bonus,
  booking_bonus = excluded.booking_bonus,
  mpf_enabled = excluded.mpf_enabled,
  commission_method = excluded.commission_method,
  pay_day_primary = excluded.pay_day_primary,
  pay_day_secondary = excluded.pay_day_secondary,
  remarks = excluded.remarks,
  updated_at = timezone('utc', now());

insert into public.employee_salary_profiles (
  employee_id,
  salary_type,
  base_salary,
  effective_from,
  attendance_bonus_enabled,
  attendance_bonus_amount,
  transport_allowance,
  briefing_bonus,
  booking_bonus,
  mpf_enabled,
  commission_method,
  pay_day_primary,
  pay_day_secondary,
  remarks
)
select
  employee.id,
  'monthly',
  8300,
  date '2021-03-01',
  true,
  2000,
  0,
  500,
  500,
  true,
  'none',
  7,
  null,
  'Imported from Contract List on 2026-04-15; commission fields intentionally ignored at this stage.'
from public.employees employee
where employee.employee_code = 'SF119'
on conflict (employee_id) do update set
  salary_type = excluded.salary_type,
  base_salary = excluded.base_salary,
  effective_from = excluded.effective_from,
  attendance_bonus_enabled = excluded.attendance_bonus_enabled,
  attendance_bonus_amount = excluded.attendance_bonus_amount,
  transport_allowance = excluded.transport_allowance,
  briefing_bonus = excluded.briefing_bonus,
  booking_bonus = excluded.booking_bonus,
  mpf_enabled = excluded.mpf_enabled,
  commission_method = excluded.commission_method,
  pay_day_primary = excluded.pay_day_primary,
  pay_day_secondary = excluded.pay_day_secondary,
  remarks = excluded.remarks,
  updated_at = timezone('utc', now());

insert into public.employee_salary_profiles (
  employee_id,
  salary_type,
  base_salary,
  effective_from,
  attendance_bonus_enabled,
  attendance_bonus_amount,
  transport_allowance,
  briefing_bonus,
  booking_bonus,
  mpf_enabled,
  commission_method,
  pay_day_primary,
  pay_day_secondary,
  remarks
)
select
  employee.id,
  'monthly',
  13000,
  date '2025-03-10',
  true,
  2000,
  0,
  500,
  500,
  true,
  'none',
  7,
  null,
  'Imported from Contract List on 2026-04-15; commission fields intentionally ignored at this stage.'
from public.employees employee
where employee.employee_code = 'SF346'
on conflict (employee_id) do update set
  salary_type = excluded.salary_type,
  base_salary = excluded.base_salary,
  effective_from = excluded.effective_from,
  attendance_bonus_enabled = excluded.attendance_bonus_enabled,
  attendance_bonus_amount = excluded.attendance_bonus_amount,
  transport_allowance = excluded.transport_allowance,
  briefing_bonus = excluded.briefing_bonus,
  booking_bonus = excluded.booking_bonus,
  mpf_enabled = excluded.mpf_enabled,
  commission_method = excluded.commission_method,
  pay_day_primary = excluded.pay_day_primary,
  pay_day_secondary = excluded.pay_day_secondary,
  remarks = excluded.remarks,
  updated_at = timezone('utc', now());

insert into public.employee_salary_profiles (
  employee_id,
  salary_type,
  base_salary,
  effective_from,
  attendance_bonus_enabled,
  attendance_bonus_amount,
  transport_allowance,
  briefing_bonus,
  booking_bonus,
  mpf_enabled,
  commission_method,
  pay_day_primary,
  pay_day_secondary,
  remarks
)
select
  employee.id,
  'monthly',
  12200,
  date '2024-10-25',
  true,
  2000,
  0,
  500,
  500,
  true,
  'none',
  7,
  null,
  'Imported from Contract List on 2026-04-15; commission fields intentionally ignored at this stage.'
from public.employees employee
where employee.employee_code = 'SF335'
on conflict (employee_id) do update set
  salary_type = excluded.salary_type,
  base_salary = excluded.base_salary,
  effective_from = excluded.effective_from,
  attendance_bonus_enabled = excluded.attendance_bonus_enabled,
  attendance_bonus_amount = excluded.attendance_bonus_amount,
  transport_allowance = excluded.transport_allowance,
  briefing_bonus = excluded.briefing_bonus,
  booking_bonus = excluded.booking_bonus,
  mpf_enabled = excluded.mpf_enabled,
  commission_method = excluded.commission_method,
  pay_day_primary = excluded.pay_day_primary,
  pay_day_secondary = excluded.pay_day_secondary,
  remarks = excluded.remarks,
  updated_at = timezone('utc', now());

insert into public.employee_salary_profiles (
  employee_id,
  salary_type,
  base_salary,
  effective_from,
  attendance_bonus_enabled,
  attendance_bonus_amount,
  transport_allowance,
  briefing_bonus,
  booking_bonus,
  mpf_enabled,
  commission_method,
  pay_day_primary,
  pay_day_secondary,
  remarks
)
select
  employee.id,
  'monthly',
  7200,
  date '2019-05-03',
  true,
  2000,
  0,
  500,
  500,
  true,
  'none',
  7,
  null,
  'Imported from Contract List on 2026-04-15; commission fields intentionally ignored at this stage.'
from public.employees employee
where employee.employee_code = 'SF065'
on conflict (employee_id) do update set
  salary_type = excluded.salary_type,
  base_salary = excluded.base_salary,
  effective_from = excluded.effective_from,
  attendance_bonus_enabled = excluded.attendance_bonus_enabled,
  attendance_bonus_amount = excluded.attendance_bonus_amount,
  transport_allowance = excluded.transport_allowance,
  briefing_bonus = excluded.briefing_bonus,
  booking_bonus = excluded.booking_bonus,
  mpf_enabled = excluded.mpf_enabled,
  commission_method = excluded.commission_method,
  pay_day_primary = excluded.pay_day_primary,
  pay_day_secondary = excluded.pay_day_secondary,
  remarks = excluded.remarks,
  updated_at = timezone('utc', now());

insert into public.employee_salary_profiles (
  employee_id,
  salary_type,
  base_salary,
  effective_from,
  attendance_bonus_enabled,
  attendance_bonus_amount,
  transport_allowance,
  briefing_bonus,
  booking_bonus,
  mpf_enabled,
  commission_method,
  pay_day_primary,
  pay_day_secondary,
  remarks
)
select
  employee.id,
  'monthly',
  7000,
  date '2022-07-07',
  true,
  2000,
  0,
  500,
  500,
  true,
  'none',
  7,
  null,
  'Imported from Contract List on 2026-04-15; commission fields intentionally ignored at this stage.'
from public.employees employee
where employee.employee_code = 'SF193'
on conflict (employee_id) do update set
  salary_type = excluded.salary_type,
  base_salary = excluded.base_salary,
  effective_from = excluded.effective_from,
  attendance_bonus_enabled = excluded.attendance_bonus_enabled,
  attendance_bonus_amount = excluded.attendance_bonus_amount,
  transport_allowance = excluded.transport_allowance,
  briefing_bonus = excluded.briefing_bonus,
  booking_bonus = excluded.booking_bonus,
  mpf_enabled = excluded.mpf_enabled,
  commission_method = excluded.commission_method,
  pay_day_primary = excluded.pay_day_primary,
  pay_day_secondary = excluded.pay_day_secondary,
  remarks = excluded.remarks,
  updated_at = timezone('utc', now());

commit;