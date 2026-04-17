begin;

-- ════════════════════════════════════════════
-- STEP 1: Seed all positions
-- ════════════════════════════════════════════
insert into public.positions (code, name_zh, name_en)
values
    ('BEAUTICIAN', '美容師', 'Beautician'),
    ('SENIOR_BEAUTICIAN', '高級美容師', 'Senior Beautician'),
    ('MASSAGIST', '養生師', 'Massagist'),
    ('CONSULTANT', '顧問', 'Consultant'),
    ('RECEPTIONIST', '接待員', 'Receptionist'),
    ('MANAGER', '經理', 'Manager'),
    ('SHOP_MANAGER', '店長', 'Shop Manager'),
    ('SALES_MANAGER', '銷售經理', 'Sales Manager'),
    ('SENIOR_SALES_MANAGER', '高級銷售經理', 'Senior Sales Manager'),
    ('SENIOR_SHOP_MANAGER', '高級店長', 'Senior Shop Manager'),
    ('ASSISTANT_SHOP_MANAGER', '副店長', 'Assistant Shop Manager'),
    ('ACCOUNT_MANAGER', '會計經理', 'Account Manager'),
    ('OPERATION_MANAGER', '營運經理', 'Operation Manager'),
    ('OPERATION_DIRECTOR', '營運總監', 'Operation Director'),
    ('ASSISTANT_OPERATION_MANAGER', '助理營運經理', 'Assistant Operation Manager'),
    ('CUSTOMER_SERVICE_MANAGER', '客戶服務主管', 'Customer Service Manager'),
    ('MARKETING_EXECUTIVE', '行銷主管', 'Marketing Executive'),
    ('TRAINER', '培訓老師', 'Trainer'),
    ('DESIGNER', '設計師', 'Designer'),
    ('OFFICE_CLERK', '文員', 'Office Clerk'),
    ('TELESALES', '電話銷售員', 'Telesales'),
    ('JANITOR', '清潔員', 'Janitor'),
    ('NURSE', '護士', 'Nurse'),
    ('DOCTOR', '醫師', 'Doctor'),
    ('BOSS', '老闆', 'Boss')
on conflict (code) do update set
  name_zh = excluded.name_zh,
  name_en = excluded.name_en;

-- ════════════════════════════════════════════
-- STEP 2: Seed CWB branch (both companies)
-- ════════════════════════════════════════════
insert into public.branches (company_id, code, name_zh, name_en, is_active)
select companies.id, 'CWB', 'CWB', 'CWB', true
from public.companies
where companies.code in ('ASA', 'ASAS')
on conflict (company_id, code) do update set
  is_active = true,
  updated_at = timezone('utc', now());

-- ════════════════════════════════════════════
-- STEP 3: Employee master upserts
-- ════════════════════════════════════════════
-- ═══ SF001 Alice 黃麗詩 ═══
insert into public.employees (
  employee_code, name_zh, name_en, alias, gender,
  identity_type, identity_number, company_type,
  company_id, branch_id, branch_code,
  employment_type, employment_status, position_id,
  hire_date, probation_months
)
select
  'SF001',
  '黃麗詩',
  'Wong Lai Sze',
  'Alice',
  'other'::public.employee_gender,
  'hkid'::public.employee_identity_type,
  null,
  'ASA'::public.employee_company_type,
  company.id, branch.id, 'OFFICE',
  '全職'::public.employee_employment_type,
  'active'::public.employee_status,
  position.id,
  date '2016-12-10',
  null
from public.companies company
join public.branches branch
  on branch.company_id = company.id and branch.code = 'OFFICE'
join public.positions position
  on position.code = 'BOSS'
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
-- ═══ SF002 Alice 何泳橋 ═══
insert into public.employees (
  employee_code, name_zh, name_en, alias, gender,
  identity_type, identity_number, company_type,
  company_id, branch_id, branch_code,
  employment_type, employment_status, position_id,
  hire_date, probation_months
)
select
  'SF002',
  '何泳橋',
  'Ho Wing Kiu Su',
  'Alice',
  'other'::public.employee_gender,
  'hkid'::public.employee_identity_type,
  null,
  'ASA'::public.employee_company_type,
  company.id, branch.id, 'OFFICE',
  '全職'::public.employee_employment_type,
  'active'::public.employee_status,
  position.id,
  date '2016-12-10',
  null
from public.companies company
join public.branches branch
  on branch.company_id = company.id and branch.code = 'OFFICE'
join public.positions position
  on position.code = 'BOSS'
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
-- ═══ SF006 KT 鄭家彤 ═══
insert into public.employees (
  employee_code, name_zh, name_en, alias, gender,
  identity_type, identity_number, company_type,
  company_id, branch_id, branch_code,
  employment_type, employment_status, position_id,
  hire_date, probation_months
)
select
  'SF006',
  '鄭家彤',
  'Cheng Ka Tung',
  'KT',
  'other'::public.employee_gender,
  'hkid'::public.employee_identity_type,
  'Y270111A',
  'ASA'::public.employee_company_type,
  company.id, branch.id, 'MKTOP',
  '全職'::public.employee_employment_type,
  'active'::public.employee_status,
  position.id,
  date '2016-12-12',
  1
from public.companies company
join public.branches branch
  on branch.company_id = company.id and branch.code = 'MKTOP'
join public.positions position
  on position.code = 'SENIOR_BEAUTICIAN'
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
-- ═══ SF011 Sylvia 李瑞斯 ═══
insert into public.employees (
  employee_code, name_zh, name_en, alias, gender,
  identity_type, identity_number, company_type,
  company_id, branch_id, branch_code,
  employment_type, employment_status, position_id,
  hire_date, probation_months
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
  company.id, branch.id, 'MKTOP',
  '全職'::public.employee_employment_type,
  'active'::public.employee_status,
  position.id,
  date '2016-12-19',
  0
from public.companies company
join public.branches branch
  on branch.company_id = company.id and branch.code = 'MKTOP'
join public.positions position
  on position.code = 'SALES_MANAGER'
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
-- ═══ SF014 Jess 沈雯美 ═══
insert into public.employees (
  employee_code, name_zh, name_en, alias, gender,
  identity_type, identity_number, company_type,
  company_id, branch_id, branch_code,
  employment_type, employment_status, position_id,
  hire_date, probation_months
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
  company.id, branch.id, 'MKTOP',
  '全職'::public.employee_employment_type,
  'active'::public.employee_status,
  position.id,
  date '2017-02-03',
  1
from public.companies company
join public.branches branch
  on branch.company_id = company.id and branch.code = 'MKTOP'
join public.positions position
  on position.code = 'MASSAGIST'
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
-- ═══ SF025 Winnie 黃芊銢 ═══
insert into public.employees (
  employee_code, name_zh, name_en, alias, gender,
  identity_type, identity_number, company_type,
  company_id, branch_id, branch_code,
  employment_type, employment_status, position_id,
  hire_date, probation_months
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
  company.id, branch.id, 'MKTOP',
  '全職'::public.employee_employment_type,
  'active'::public.employee_status,
  position.id,
  date '2017-12-01',
  1
from public.companies company
join public.branches branch
  on branch.company_id = company.id and branch.code = 'MKTOP'
join public.positions position
  on position.code = 'SENIOR_BEAUTICIAN'
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
-- ═══ SF065 珍珍 班秀珍 ═══
insert into public.employees (
  employee_code, name_zh, name_en, alias, gender,
  identity_type, identity_number, company_type,
  company_id, branch_id, branch_code,
  employment_type, employment_status, position_id,
  hire_date, probation_months
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
  company.id, branch.id, 'MKTOP',
  '全職'::public.employee_employment_type,
  'active'::public.employee_status,
  position.id,
  date '2019-05-03',
  1
from public.companies company
join public.branches branch
  on branch.company_id = company.id and branch.code = 'MKTOP'
join public.positions position
  on position.code = 'MASSAGIST'
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
-- ═══ SF066 Yan 溫樂心 ═══
insert into public.employees (
  employee_code, name_zh, name_en, alias, gender,
  identity_type, identity_number, company_type,
  company_id, branch_id, branch_code,
  employment_type, employment_status, position_id,
  hire_date, probation_months
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
  company.id, branch.id, 'MKTOP',
  '全職'::public.employee_employment_type,
  'active'::public.employee_status,
  position.id,
  date '2019-07-15',
  1
from public.companies company
join public.branches branch
  on branch.company_id = company.id and branch.code = 'MKTOP'
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
-- ═══ SF068 Canice 焦麗萍 ═══
insert into public.employees (
  employee_code, name_zh, name_en, alias, gender,
  identity_type, identity_number, company_type,
  company_id, branch_id, branch_code,
  employment_type, employment_status, position_id,
  hire_date, probation_months
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
  company.id, branch.id, 'OFFICE',
  '全職'::public.employee_employment_type,
  'active'::public.employee_status,
  position.id,
  date '2020-07-13',
  1
from public.companies company
join public.branches branch
  on branch.company_id = company.id and branch.code = 'OFFICE'
join public.positions position
  on position.code = 'RECEPTIONIST'
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
-- ═══ SF102 Carol 溫婉華 ═══
insert into public.employees (
  employee_code, name_zh, name_en, alias, gender,
  identity_type, identity_number, company_type,
  company_id, branch_id, branch_code,
  employment_type, employment_status, position_id,
  hire_date, probation_months
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
  company.id, branch.id, 'MKTOP',
  '全職'::public.employee_employment_type,
  'active'::public.employee_status,
  position.id,
  date '2020-09-07',
  1
from public.companies company
join public.branches branch
  on branch.company_id = company.id and branch.code = 'MKTOP'
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
-- ═══ SF117 Wendy 張穎詩 ═══
insert into public.employees (
  employee_code, name_zh, name_en, alias, gender,
  identity_type, identity_number, company_type,
  company_id, branch_id, branch_code,
  employment_type, employment_status, position_id,
  hire_date, probation_months
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
  company.id, branch.id, 'MKTOP',
  '全職'::public.employee_employment_type,
  'active'::public.employee_status,
  position.id,
  date '2021-02-27',
  1
from public.companies company
join public.branches branch
  on branch.company_id = company.id and branch.code = 'MKTOP'
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
-- ═══ SF119 Yan Wong 王龍欣 ═══
insert into public.employees (
  employee_code, name_zh, name_en, alias, gender,
  identity_type, identity_number, company_type,
  company_id, branch_id, branch_code,
  employment_type, employment_status, position_id,
  hire_date, probation_months
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
  company.id, branch.id, 'TW',
  '全職'::public.employee_employment_type,
  'active'::public.employee_status,
  position.id,
  date '2021-03-01',
  1
from public.companies company
join public.branches branch
  on branch.company_id = company.id and branch.code = 'TW'
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
-- ═══ SF129 Jackie 劉麗霞 ═══
insert into public.employees (
  employee_code, name_zh, name_en, alias, gender,
  identity_type, identity_number, company_type,
  company_id, branch_id, branch_code,
  employment_type, employment_status, position_id,
  hire_date, probation_months
)
select
  'SF129',
  '劉麗霞',
  'LAU LAI HAR',
  'Jackie',
  'other'::public.employee_gender,
  'hkid'::public.employee_identity_type,
  'Z545263(6)',
  'ASAS'::public.employee_company_type,
  company.id, branch.id, 'OFFICE',
  '全職'::public.employee_employment_type,
  'active'::public.employee_status,
  position.id,
  date '2021-04-12',
  1
from public.companies company
join public.branches branch
  on branch.company_id = company.id and branch.code = 'OFFICE'
join public.positions position
  on position.code = 'OPERATION_MANAGER'
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
-- ═══ SF131 Jumbo 鄭寶珠 ═══
insert into public.employees (
  employee_code, name_zh, name_en, alias, gender,
  identity_type, identity_number, company_type,
  company_id, branch_id, branch_code,
  employment_type, employment_status, position_id,
  hire_date, probation_months
)
select
  'SF131',
  '鄭寶珠',
  'Cheng Po Chu',
  'Jumbo',
  'other'::public.employee_gender,
  'hkid'::public.employee_identity_type,
  'P978292(7)',
  'ASAS'::public.employee_company_type,
  company.id, branch.id, 'TW',
  '全職'::public.employee_employment_type,
  'active'::public.employee_status,
  position.id,
  date '2021-05-01',
  1
from public.companies company
join public.branches branch
  on branch.company_id = company.id and branch.code = 'TW'
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
-- ═══ SF134 Jacqueline 朱詠賢 ═══
insert into public.employees (
  employee_code, name_zh, name_en, alias, gender,
  identity_type, identity_number, company_type,
  company_id, branch_id, branch_code,
  employment_type, employment_status, position_id,
  hire_date, probation_months
)
select
  'SF134',
  '朱詠賢',
  'Chu Wing Yin',
  'Jacqueline',
  'other'::public.employee_gender,
  'hkid'::public.employee_identity_type,
  'K964736(8)',
  'ASA'::public.employee_company_type,
  company.id, branch.id, 'CWB',
  '全職'::public.employee_employment_type,
  'active'::public.employee_status,
  position.id,
  date '2021-05-01',
  0
from public.companies company
join public.branches branch
  on branch.company_id = company.id and branch.code = 'CWB'
join public.positions position
  on position.code = 'MANAGER'
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
-- ═══ SF137 Yena 陳泳芝 ═══
insert into public.employees (
  employee_code, name_zh, name_en, alias, gender,
  identity_type, identity_number, company_type,
  company_id, branch_id, branch_code,
  employment_type, employment_status, position_id,
  hire_date, probation_months
)
select
  'SF137',
  '陳泳芝',
  'Chan Wing Chi',
  'Yena',
  'other'::public.employee_gender,
  'hkid'::public.employee_identity_type,
  'Y346086(8)',
  'ASA'::public.employee_company_type,
  company.id, branch.id, 'CWB',
  '全職'::public.employee_employment_type,
  'active'::public.employee_status,
  position.id,
  date '2021-07-01',
  0
from public.companies company
join public.branches branch
  on branch.company_id = company.id and branch.code = 'CWB'
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
-- ═══ SF139 Candy 金琴娣 ═══
insert into public.employees (
  employee_code, name_zh, name_en, alias, gender,
  identity_type, identity_number, company_type,
  company_id, branch_id, branch_code,
  employment_type, employment_status, position_id,
  hire_date, probation_months
)
select
  'SF139',
  '金琴娣',
  'Kam Kam Tai',
  'Candy',
  'other'::public.employee_gender,
  'hkid'::public.employee_identity_type,
  'P476594(3)',
  'ASAS'::public.employee_company_type,
  company.id, branch.id, 'TW',
  '全職'::public.employee_employment_type,
  'active'::public.employee_status,
  position.id,
  date '2021-08-01',
  1
from public.companies company
join public.branches branch
  on branch.company_id = company.id and branch.code = 'TW'
join public.positions position
  on position.code = 'MASSAGIST'
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
-- ═══ SF143 Money 陳潔汶 ═══
insert into public.employees (
  employee_code, name_zh, name_en, alias, gender,
  identity_type, identity_number, company_type,
  company_id, branch_id, branch_code,
  employment_type, employment_status, position_id,
  hire_date, probation_months
)
select
  'SF143',
  '陳潔汶',
  'Chan Kit Man',
  'Money',
  'other'::public.employee_gender,
  'hkid'::public.employee_identity_type,
  'Y192730(0)',
  'ASA'::public.employee_company_type,
  company.id, branch.id, 'MKTOP',
  '全職'::public.employee_employment_type,
  'resigned'::public.employee_status,
  position.id,
  date '2021-08-09',
  null
from public.companies company
join public.branches branch
  on branch.company_id = company.id and branch.code = 'MKTOP'
join public.positions position
  on position.code = 'RECEPTIONIST'
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
-- ═══ SF144 Wing 楊詠兒 ═══
insert into public.employees (
  employee_code, name_zh, name_en, alias, gender,
  identity_type, identity_number, company_type,
  company_id, branch_id, branch_code,
  employment_type, employment_status, position_id,
  hire_date, probation_months
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
  company.id, branch.id, 'TMA',
  '全職'::public.employee_employment_type,
  'active'::public.employee_status,
  position.id,
  date '2021-09-01',
  1
from public.companies company
join public.branches branch
  on branch.company_id = company.id and branch.code = 'TMA'
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
-- ═══ SF145 Alice 梁捷瑩 ═══
insert into public.employees (
  employee_code, name_zh, name_en, alias, gender,
  identity_type, identity_number, company_type,
  company_id, branch_id, branch_code,
  employment_type, employment_status, position_id,
  hire_date, probation_months
)
select
  'SF145',
  '梁捷瑩',
  'Leung Chit Ying',
  'Alice',
  'other'::public.employee_gender,
  'hkid'::public.employee_identity_type,
  'Z239447(3)',
  'ASA'::public.employee_company_type,
  company.id, branch.id, 'CWB',
  '全職'::public.employee_employment_type,
  'active'::public.employee_status,
  position.id,
  date '2021-07-07',
  1
from public.companies company
join public.branches branch
  on branch.company_id = company.id and branch.code = 'CWB'
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
-- ═══ SF146 Emily 陳潔湘 ═══
insert into public.employees (
  employee_code, name_zh, name_en, alias, gender,
  identity_type, identity_number, company_type,
  company_id, branch_id, branch_code,
  employment_type, employment_status, position_id,
  hire_date, probation_months
)
select
  'SF146',
  '陳潔湘',
  'Chan Kit Sheung',
  'Emily',
  'other'::public.employee_gender,
  'hkid'::public.employee_identity_type,
  'Z194767(3)',
  'ASA'::public.employee_company_type,
  company.id, branch.id, 'CWB',
  '全職'::public.employee_employment_type,
  'active'::public.employee_status,
  position.id,
  date '2021-09-03',
  1
from public.companies company
join public.branches branch
  on branch.company_id = company.id and branch.code = 'CWB'
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
-- ═══ SF149 Mika 梁家欣 ═══
insert into public.employees (
  employee_code, name_zh, name_en, alias, gender,
  identity_type, identity_number, company_type,
  company_id, branch_id, branch_code,
  employment_type, employment_status, position_id,
  hire_date, probation_months
)
select
  'SF149',
  '梁家欣',
  'Leung Ka Yan',
  'Mika',
  'other'::public.employee_gender,
  'hkid'::public.employee_identity_type,
  'Z421420(0)',
  'ASA'::public.employee_company_type,
  company.id, branch.id, 'CWB',
  '全職'::public.employee_employment_type,
  'active'::public.employee_status,
  position.id,
  date '2021-09-03',
  1
from public.companies company
join public.branches branch
  on branch.company_id = company.id and branch.code = 'CWB'
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
-- ═══ SF153 貞姐 李賴潔貞 ═══
insert into public.employees (
  employee_code, name_zh, name_en, alias, gender,
  identity_type, identity_number, company_type,
  company_id, branch_id, branch_code,
  employment_type, employment_status, position_id,
  hire_date, probation_months
)
select
  'SF153',
  '李賴潔貞',
  'Lee Lai Kit Ching',
  '貞姐',
  'other'::public.employee_gender,
  'hkid'::public.employee_identity_type,
  'E226104(2)',
  'ASA'::public.employee_company_type,
  company.id, branch.id, 'MKTOP',
  '全職'::public.employee_employment_type,
  'active'::public.employee_status,
  position.id,
  date '2021-09-01',
  1
from public.companies company
join public.branches branch
  on branch.company_id = company.id and branch.code = 'MKTOP'
join public.positions position
  on position.code = 'JANITOR'
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
-- ═══ SF154 Lanke 毛曉春 ═══
insert into public.employees (
  employee_code, name_zh, name_en, alias, gender,
  identity_type, identity_number, company_type,
  company_id, branch_id, branch_code,
  employment_type, employment_status, position_id,
  hire_date, probation_months
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
  company.id, branch.id, 'TMA',
  '全職'::public.employee_employment_type,
  'active'::public.employee_status,
  position.id,
  date '2021-10-01',
  0
from public.companies company
join public.branches branch
  on branch.company_id = company.id and branch.code = 'TMA'
join public.positions position
  on position.code = 'SHOP_MANAGER'
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
-- ═══ SF155 Carman 吳嘉敏 ═══
insert into public.employees (
  employee_code, name_zh, name_en, alias, gender,
  identity_type, identity_number, company_type,
  company_id, branch_id, branch_code,
  employment_type, employment_status, position_id,
  hire_date, probation_months
)
select
  'SF155',
  '吳嘉敏',
  'NG KA MAN CARMAN',
  'Carman',
  'other'::public.employee_gender,
  'hkid'::public.employee_identity_type,
  'Z539776(7)',
  'ASA'::public.employee_company_type,
  company.id, branch.id, 'OFFICE',
  '全職'::public.employee_employment_type,
  'active'::public.employee_status,
  position.id,
  date '2021-10-16',
  1
from public.companies company
join public.branches branch
  on branch.company_id = company.id and branch.code = 'OFFICE'
join public.positions position
  on position.code = 'TRAINER'
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
-- ═══ SF156 Sunny 馬玉雯 ═══
insert into public.employees (
  employee_code, name_zh, name_en, alias, gender,
  identity_type, identity_number, company_type,
  company_id, branch_id, branch_code,
  employment_type, employment_status, position_id,
  hire_date, probation_months
)
select
  'SF156',
  '馬玉雯',
  'Ma Yuk Man',
  'Sunny',
  'other'::public.employee_gender,
  'hkid'::public.employee_identity_type,
  'R179085(3)',
  'ASAS'::public.employee_company_type,
  company.id, branch.id, 'OFFICE',
  '全職'::public.employee_employment_type,
  'active'::public.employee_status,
  position.id,
  date '2021-10-01',
  1
from public.companies company
join public.branches branch
  on branch.company_id = company.id and branch.code = 'OFFICE'
join public.positions position
  on position.code = 'MARKETING_EXECUTIVE'
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
-- ═══ SF164 Lok Yi 楊樂兒 ═══
insert into public.employees (
  employee_code, name_zh, name_en, alias, gender,
  identity_type, identity_number, company_type,
  company_id, branch_id, branch_code,
  employment_type, employment_status, position_id,
  hire_date, probation_months
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
  company.id, branch.id, 'TMA',
  '全職'::public.employee_employment_type,
  'active'::public.employee_status,
  position.id,
  date '2017-12-01',
  1
from public.companies company
join public.branches branch
  on branch.company_id = company.id and branch.code = 'TMA'
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
-- ═══ SF167 Ella 曾瑞卿 ═══
insert into public.employees (
  employee_code, name_zh, name_en, alias, gender,
  identity_type, identity_number, company_type,
  company_id, branch_id, branch_code,
  employment_type, employment_status, position_id,
  hire_date, probation_months
)
select
  'SF167',
  '曾瑞卿',
  'Tsang Sui Hing',
  'Ella',
  'other'::public.employee_gender,
  'hkid'::public.employee_identity_type,
  'G816457(5)',
  'ASA'::public.employee_company_type,
  company.id, branch.id, 'MKTOP',
  '全職'::public.employee_employment_type,
  'active'::public.employee_status,
  position.id,
  date '2024-11-01',
  0
from public.companies company
join public.branches branch
  on branch.company_id = company.id and branch.code = 'MKTOP'
join public.positions position
  on position.code = 'SALES_MANAGER'
where company.code = 'Asa'
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
-- ═══ SF168 Moon 陳凱婷 ═══
insert into public.employees (
  employee_code, name_zh, name_en, alias, gender,
  identity_type, identity_number, company_type,
  company_id, branch_id, branch_code,
  employment_type, employment_status, position_id,
  hire_date, probation_months
)
select
  'SF168',
  '陳凱婷',
  'Chan Hoi Ting',
  'Moon',
  'other'::public.employee_gender,
  'hkid'::public.employee_identity_type,
  'Z4724926',
  'ASA'::public.employee_company_type,
  company.id, branch.id, 'TAIWAI',
  '全職'::public.employee_employment_type,
  'active'::public.employee_status,
  position.id,
  date '2022-04-21',
  0
from public.companies company
join public.branches branch
  on branch.company_id = company.id and branch.code = 'TAIWAI'
join public.positions position
  on position.code = 'MANAGER'
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
-- ═══ SF170 Moon(B) 李佩英 ═══
insert into public.employees (
  employee_code, name_zh, name_en, alias, gender,
  identity_type, identity_number, company_type,
  company_id, branch_id, branch_code,
  employment_type, employment_status, position_id,
  hire_date, probation_months
)
select
  'SF170',
  '李佩英',
  'Lee Pui Ying',
  'Moon(B)',
  'other'::public.employee_gender,
  'hkid'::public.employee_identity_type,
  'D469961(1)',
  'ASA'::public.employee_company_type,
  company.id, branch.id, 'TAIWAI',
  '全職'::public.employee_employment_type,
  'active'::public.employee_status,
  position.id,
  date '2022-04-21',
  1
from public.companies company
join public.branches branch
  on branch.company_id = company.id and branch.code = 'TAIWAI'
join public.positions position
  on position.code = 'MASSAGIST'
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
-- ═══ SF171 Ying  ═══
insert into public.employees (
  employee_code, name_zh, name_en, alias, gender,
  identity_type, identity_number, company_type,
  company_id, branch_id, branch_code,
  employment_type, employment_status, position_id,
  hire_date, probation_months
)
select
  'SF171',
  'N/A',
  'Ha Mung Ying',
  'Ying',
  'other'::public.employee_gender,
  'hkid'::public.employee_identity_type,
  null,
  'ASA'::public.employee_company_type,
  company.id, branch.id, 'TAIWAI',
  '全職'::public.employee_employment_type,
  'resigned'::public.employee_status,
  position.id,
  date '2022-04-21',
  null
from public.companies company
join public.branches branch
  on branch.company_id = company.id and branch.code = 'TAIWAI'
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
-- ═══ SF172 YY 陳欣欣 ═══
insert into public.employees (
  employee_code, name_zh, name_en, alias, gender,
  identity_type, identity_number, company_type,
  company_id, branch_id, branch_code,
  employment_type, employment_status, position_id,
  hire_date, probation_months
)
select
  'SF172',
  '陳欣欣',
  'Chan Yan Yan',
  'YY',
  'other'::public.employee_gender,
  'hkid'::public.employee_identity_type,
  'P841845(8)',
  'ASA'::public.employee_company_type,
  company.id, branch.id, 'TAIWAI',
  '全職'::public.employee_employment_type,
  'active'::public.employee_status,
  position.id,
  date '2022-04-21',
  0
from public.companies company
join public.branches branch
  on branch.company_id = company.id and branch.code = 'TAIWAI'
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
-- ═══ SF173 Karrie 何嘉慧 ═══
insert into public.employees (
  employee_code, name_zh, name_en, alias, gender,
  identity_type, identity_number, company_type,
  company_id, branch_id, branch_code,
  employment_type, employment_status, position_id,
  hire_date, probation_months
)
select
  'SF173',
  '何嘉慧',
  'Ho Ka Wai',
  'Karrie',
  'other'::public.employee_gender,
  'hkid'::public.employee_identity_type,
  'Z819778(5)',
  'ASA'::public.employee_company_type,
  company.id, branch.id, 'MKCY',
  '全職'::public.employee_employment_type,
  'active'::public.employee_status,
  position.id,
  date '2022-04-22',
  0
from public.companies company
join public.branches branch
  on branch.company_id = company.id and branch.code = 'MKCY'
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
-- ═══ SF182 BoYi 陳家寶 ═══
insert into public.employees (
  employee_code, name_zh, name_en, alias, gender,
  identity_type, identity_number, company_type,
  company_id, branch_id, branch_code,
  employment_type, employment_status, position_id,
  hire_date, probation_months
)
select
  'SF182',
  '陳家寶',
  'Chan Ka Po',
  'BoYi',
  'other'::public.employee_gender,
  'hkid'::public.employee_identity_type,
  'Y117412(4)',
  'ASAS'::public.employee_company_type,
  company.id, branch.id, 'TMA',
  '全職'::public.employee_employment_type,
  'active'::public.employee_status,
  position.id,
  date '2022-06-02',
  1
from public.companies company
join public.branches branch
  on branch.company_id = company.id and branch.code = 'TMA'
join public.positions position
  on position.code = 'RECEPTIONIST'
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
-- ═══ SF185 Iris 陳凱螢 ═══
insert into public.employees (
  employee_code, name_zh, name_en, alias, gender,
  identity_type, identity_number, company_type,
  company_id, branch_id, branch_code,
  employment_type, employment_status, position_id,
  hire_date, probation_months
)
select
  'SF185',
  '陳凱螢',
  'Chan Hoi Ying',
  'Iris',
  'other'::public.employee_gender,
  'hkid'::public.employee_identity_type,
  'z241337(0)',
  'ASA'::public.employee_company_type,
  company.id, branch.id, 'TAIWAI',
  '全職'::public.employee_employment_type,
  'active'::public.employee_status,
  position.id,
  date '2021-04-21',
  0
from public.companies company
join public.branches branch
  on branch.company_id = company.id and branch.code = 'TAIWAI'
join public.positions position
  on position.code = 'MANAGER'
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
-- ═══ SF188 Helen 廖詩盈 ═══
insert into public.employees (
  employee_code, name_zh, name_en, alias, gender,
  identity_type, identity_number, company_type,
  company_id, branch_id, branch_code,
  employment_type, employment_status, position_id,
  hire_date, probation_months
)
select
  'SF188',
  '廖詩盈',
  'LIU SZE YING',
  'Helen',
  'other'::public.employee_gender,
  'hkid'::public.employee_identity_type,
  'V127902(5)',
  'ASAS'::public.employee_company_type,
  company.id, branch.id, 'OFFICE',
  '全職'::public.employee_employment_type,
  'active'::public.employee_status,
  position.id,
  date '2022-06-27',
  1
from public.companies company
join public.branches branch
  on branch.company_id = company.id and branch.code = 'OFFICE'
join public.positions position
  on position.code = 'DESIGNER'
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
-- ═══ SF190 Dorcas 鄒善盈 ═══
insert into public.employees (
  employee_code, name_zh, name_en, alias, gender,
  identity_type, identity_number, company_type,
  company_id, branch_id, branch_code,
  employment_type, employment_status, position_id,
  hire_date, probation_months
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
  company.id, branch.id, 'TMA',
  '全職'::public.employee_employment_type,
  'active'::public.employee_status,
  position.id,
  date '2022-06-28',
  0
from public.companies company
join public.branches branch
  on branch.company_id = company.id and branch.code = 'TMA'
join public.positions position
  on position.code = 'ASSISTANT_SHOP_MANAGER'
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
-- ═══ SF193 雯雯 林碧珠 ═══
insert into public.employees (
  employee_code, name_zh, name_en, alias, gender,
  identity_type, identity_number, company_type,
  company_id, branch_id, branch_code,
  employment_type, employment_status, position_id,
  hire_date, probation_months
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
  company.id, branch.id, 'MKCY',
  '全職'::public.employee_employment_type,
  'active'::public.employee_status,
  position.id,
  date '2022-07-07',
  1
from public.companies company
join public.branches branch
  on branch.company_id = company.id and branch.code = 'MKCY'
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
-- ═══ SF196 (B)婷婷 李迎迎 ═══
insert into public.employees (
  employee_code, name_zh, name_en, alias, gender,
  identity_type, identity_number, company_type,
  company_id, branch_id, branch_code,
  employment_type, employment_status, position_id,
  hire_date, probation_months
)
select
  'SF196',
  '李迎迎',
  'Li Ying Ying',
  '(B)婷婷',
  'other'::public.employee_gender,
  'hkid'::public.employee_identity_type,
  'F024215(4)',
  'ASAS'::public.employee_company_type,
  company.id, branch.id, 'TMA',
  '全職'::public.employee_employment_type,
  'active'::public.employee_status,
  position.id,
  date '2022-07-19',
  null
from public.companies company
join public.branches branch
  on branch.company_id = company.id and branch.code = 'TMA'
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
-- ═══ SF199 呀晴 梁玉嬋 ═══
insert into public.employees (
  employee_code, name_zh, name_en, alias, gender,
  identity_type, identity_number, company_type,
  company_id, branch_id, branch_code,
  employment_type, employment_status, position_id,
  hire_date, probation_months
)
select
  'SF199',
  '梁玉嬋',
  'Leung Yuk Sim',
  '呀晴',
  'other'::public.employee_gender,
  'hkid'::public.employee_identity_type,
  'K362389(0)',
  'ASA'::public.employee_company_type,
  company.id, branch.id, 'TAIWAI',
  '全職'::public.employee_employment_type,
  'active'::public.employee_status,
  position.id,
  date '2022-08-01',
  1
from public.companies company
join public.branches branch
  on branch.company_id = company.id and branch.code = 'TAIWAI'
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
-- ═══ SF202 Cora 黃文慧 ═══
insert into public.employees (
  employee_code, name_zh, name_en, alias, gender,
  identity_type, identity_number, company_type,
  company_id, branch_id, branch_code,
  employment_type, employment_status, position_id,
  hire_date, probation_months
)
select
  'SF202',
  '黃文慧',
  'Wong Man Wai',
  'Cora',
  'other'::public.employee_gender,
  'hkid'::public.employee_identity_type,
  'Z666996(5)',
  'ASA'::public.employee_company_type,
  company.id, branch.id, 'MKTOP',
  '全職'::public.employee_employment_type,
  'active'::public.employee_status,
  position.id,
  date '2022-08-11',
  null
from public.companies company
join public.branches branch
  on branch.company_id = company.id and branch.code = 'MKTOP'
join public.positions position
  on position.code = 'RECEPTIONIST'
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
-- ═══ SF206 Water(PT) 江儉 ═══
insert into public.employees (
  employee_code, name_zh, name_en, alias, gender,
  identity_type, identity_number, company_type,
  company_id, branch_id, branch_code,
  employment_type, employment_status, position_id,
  hire_date, probation_months
)
select
  'SF206',
  '江儉',
  'Kong Kim',
  'Water(PT)',
  'other'::public.employee_gender,
  'hkid'::public.employee_identity_type,
  'H462407(8)',
  'ASA'::public.employee_company_type,
  company.id, branch.id, 'CWB',
  '全職'::public.employee_employment_type,
  'active'::public.employee_status,
  position.id,
  date '2022-08-16',
  1
from public.companies company
join public.branches branch
  on branch.company_id = company.id and branch.code = 'CWB'
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
-- ═══ SF208 Jessie 梁美英 ═══
insert into public.employees (
  employee_code, name_zh, name_en, alias, gender,
  identity_type, identity_number, company_type,
  company_id, branch_id, branch_code,
  employment_type, employment_status, position_id,
  hire_date, probation_months
)
select
  'SF208',
  '梁美英',
  'Leung Mei Ying',
  'Jessie',
  'other'::public.employee_gender,
  'hkid'::public.employee_identity_type,
  'Z302198(0',
  'ASA'::public.employee_company_type,
  company.id, branch.id, 'TAIWAI',
  '全職'::public.employee_employment_type,
  'resigned'::public.employee_status,
  position.id,
  date '2022-09-01',
  null
from public.companies company
join public.branches branch
  on branch.company_id = company.id and branch.code = 'TAIWAI'
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
-- ═══ SF211 細Ling 徐慧玲 ═══
insert into public.employees (
  employee_code, name_zh, name_en, alias, gender,
  identity_type, identity_number, company_type,
  company_id, branch_id, branch_code,
  employment_type, employment_status, position_id,
  hire_date, probation_months
)
select
  'SF211',
  '徐慧玲',
  'Chui Wai Ling',
  '細Ling',
  'other'::public.employee_gender,
  'hkid'::public.employee_identity_type,
  'Y434812(3)',
  'ASA'::public.employee_company_type,
  company.id, branch.id, 'TMA',
  '全職'::public.employee_employment_type,
  'active'::public.employee_status,
  position.id,
  date '2022-09-02',
  1
from public.companies company
join public.branches branch
  on branch.company_id = company.id and branch.code = 'TMA'
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
-- ═══ SF220 Pinky 郭麗萍 ═══
insert into public.employees (
  employee_code, name_zh, name_en, alias, gender,
  identity_type, identity_number, company_type,
  company_id, branch_id, branch_code,
  employment_type, employment_status, position_id,
  hire_date, probation_months
)
select
  'SF220',
  '郭麗萍',
  'Guo LiPing',
  'Pinky',
  'other'::public.employee_gender,
  'hkid'::public.employee_identity_type,
  'R709407(7)',
  'ASA'::public.employee_company_type,
  company.id, branch.id, 'TAIWAI',
  '全職'::public.employee_employment_type,
  'active'::public.employee_status,
  position.id,
  date '2022-11-01',
  1
from public.companies company
join public.branches branch
  on branch.company_id = company.id and branch.code = 'TAIWAI'
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
-- ═══ SF221 MAY(cs) 阮美儀 ═══
insert into public.employees (
  employee_code, name_zh, name_en, alias, gender,
  identity_type, identity_number, company_type,
  company_id, branch_id, branch_code,
  employment_type, employment_status, position_id,
  hire_date, probation_months
)
select
  'SF221',
  '阮美儀',
  'Yuen Mei Yee',
  'MAY(cs)',
  'other'::public.employee_gender,
  'hkid'::public.employee_identity_type,
  'K761150(1)',
  'ASA'::public.employee_company_type,
  company.id, branch.id, 'MOS',
  '全職'::public.employee_employment_type,
  'active'::public.employee_status,
  position.id,
  date '2023-06-22',
  1
from public.companies company
join public.branches branch
  on branch.company_id = company.id and branch.code = 'MOS'
join public.positions position
  on position.code = 'RECEPTIONIST'
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
-- ═══ SF222 Penny 區寶欣 ═══
insert into public.employees (
  employee_code, name_zh, name_en, alias, gender,
  identity_type, identity_number, company_type,
  company_id, branch_id, branch_code,
  employment_type, employment_status, position_id,
  hire_date, probation_months
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
  company.id, branch.id, 'OFFICE',
  '全職'::public.employee_employment_type,
  'active'::public.employee_status,
  position.id,
  date '2022-12-01',
  1
from public.companies company
join public.branches branch
  on branch.company_id = company.id and branch.code = 'OFFICE'
join public.positions position
  on position.code = 'TRAINER'
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
-- ═══ SF233 Tracy 黃碧儀 ═══
insert into public.employees (
  employee_code, name_zh, name_en, alias, gender,
  identity_type, identity_number, company_type,
  company_id, branch_id, branch_code,
  employment_type, employment_status, position_id,
  hire_date, probation_months
)
select
  'SF233',
  '黃碧儀',
  'Wong Pik Yee',
  'Tracy',
  'other'::public.employee_gender,
  'hkid'::public.employee_identity_type,
  'Y846228(1)',
  'ASAS'::public.employee_company_type,
  company.id, branch.id, 'TAIWAI',
  '全職'::public.employee_employment_type,
  'active'::public.employee_status,
  position.id,
  date '2023-04-27',
  1
from public.companies company
join public.branches branch
  on branch.company_id = company.id and branch.code = 'TAIWAI'
join public.positions position
  on position.code = 'RECEPTIONIST'
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
-- ═══ SF238 Kei 張月峙琦 ═══
insert into public.employees (
  employee_code, name_zh, name_en, alias, gender,
  identity_type, identity_number, company_type,
  company_id, branch_id, branch_code,
  employment_type, employment_status, position_id,
  hire_date, probation_months
)
select
  'SF238',
  '張月峙琦',
  'Cheung Yuet Si Kei',
  'Kei',
  'other'::public.employee_gender,
  'hkid'::public.employee_identity_type,
  'P623734(0)',
  'ASA'::public.employee_company_type,
  company.id, branch.id, 'MKCY',
  '全職'::public.employee_employment_type,
  'active'::public.employee_status,
  position.id,
  date '2023-05-08',
  1
from public.companies company
join public.branches branch
  on branch.company_id = company.id and branch.code = 'MKCY'
join public.positions position
  on position.code = 'MASSAGIST'
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
-- ═══ SF239 Ceci 羊思思 ═══
insert into public.employees (
  employee_code, name_zh, name_en, alias, gender,
  identity_type, identity_number, company_type,
  company_id, branch_id, branch_code,
  employment_type, employment_status, position_id,
  hire_date, probation_months
)
select
  'SF239',
  '羊思思',
  'Yeung Sze Sze',
  'Ceci',
  'other'::public.employee_gender,
  'hkid'::public.employee_identity_type,
  'R117602(4)',
  'ASA'::public.employee_company_type,
  company.id, branch.id, 'MOS',
  '全職'::public.employee_employment_type,
  'resigned'::public.employee_status,
  position.id,
  date '2023-05-15',
  null
from public.companies company
join public.branches branch
  on branch.company_id = company.id and branch.code = 'MOS'
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
-- ═══ SF240 Roy 郭偉傑 ═══
insert into public.employees (
  employee_code, name_zh, name_en, alias, gender,
  identity_type, identity_number, company_type,
  company_id, branch_id, branch_code,
  employment_type, employment_status, position_id,
  hire_date, probation_months
)
select
  'SF240',
  '郭偉傑',
  'Kwok Wai Kit',
  'Roy',
  'other'::public.employee_gender,
  'hkid'::public.employee_identity_type,
  'M323221(8)',
  'ASA'::public.employee_company_type,
  company.id, branch.id, 'OFFICE',
  '全職'::public.employee_employment_type,
  'resigned'::public.employee_status,
  position.id,
  date '2023-06-01',
  null
from public.companies company
join public.branches branch
  on branch.company_id = company.id and branch.code = 'OFFICE'
join public.positions position
  on position.code = 'DESIGNER'
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
-- ═══ SF241 Rachel 梁頌慈 ═══
insert into public.employees (
  employee_code, name_zh, name_en, alias, gender,
  identity_type, identity_number, company_type,
  company_id, branch_id, branch_code,
  employment_type, employment_status, position_id,
  hire_date, probation_months
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
  company.id, branch.id, 'MOS',
  '全職'::public.employee_employment_type,
  'active'::public.employee_status,
  position.id,
  date '2023-06-07',
  1
from public.companies company
join public.branches branch
  on branch.company_id = company.id and branch.code = 'MOS'
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
-- ═══ SF243 Chilly 廖舒欣 ═══
insert into public.employees (
  employee_code, name_zh, name_en, alias, gender,
  identity_type, identity_number, company_type,
  company_id, branch_id, branch_code,
  employment_type, employment_status, position_id,
  hire_date, probation_months
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
  company.id, branch.id, 'TW',
  '全職'::public.employee_employment_type,
  'active'::public.employee_status,
  position.id,
  date '2023-07-01',
  1
from public.companies company
join public.branches branch
  on branch.company_id = company.id and branch.code = 'TW'
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
-- ═══ SF247 Anna 賀蓉花 ═══
insert into public.employees (
  employee_code, name_zh, name_en, alias, gender,
  identity_type, identity_number, company_type,
  company_id, branch_id, branch_code,
  employment_type, employment_status, position_id,
  hire_date, probation_months
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
  company.id, branch.id, 'MKTOP',
  '全職'::public.employee_employment_type,
  'active'::public.employee_status,
  position.id,
  date '2023-08-01',
  1
from public.companies company
join public.branches branch
  on branch.company_id = company.id and branch.code = 'MKTOP'
join public.positions position
  on position.code = 'MASSAGIST'
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
-- ═══ SF249 Maymay 戴美美 ═══
insert into public.employees (
  employee_code, name_zh, name_en, alias, gender,
  identity_type, identity_number, company_type,
  company_id, branch_id, branch_code,
  employment_type, employment_status, position_id,
  hire_date, probation_months
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
  company.id, branch.id, 'MKTOP',
  '全職'::public.employee_employment_type,
  'active'::public.employee_status,
  position.id,
  date '2023-08-11',
  1
from public.companies company
join public.branches branch
  on branch.company_id = company.id and branch.code = 'MKTOP'
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
-- ═══ SF250 Gina 蔡文瑛 ═══
insert into public.employees (
  employee_code, name_zh, name_en, alias, gender,
  identity_type, identity_number, company_type,
  company_id, branch_id, branch_code,
  employment_type, employment_status, position_id,
  hire_date, probation_months
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
  company.id, branch.id, 'OFFICE',
  '全職'::public.employee_employment_type,
  'active'::public.employee_status,
  position.id,
  date '2023-08-14',
  1
from public.companies company
join public.branches branch
  on branch.company_id = company.id and branch.code = 'OFFICE'
join public.positions position
  on position.code = 'TELESALES'
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
-- ═══ SF258 珍珍(TW) 胡滿金 ═══
insert into public.employees (
  employee_code, name_zh, name_en, alias, gender,
  identity_type, identity_number, company_type,
  company_id, branch_id, branch_code,
  employment_type, employment_status, position_id,
  hire_date, probation_months
)
select
  'SF258',
  '胡滿金',
  'HU Manjin',
  '珍珍(TW)',
  'other'::public.employee_gender,
  'hkid'::public.employee_identity_type,
  'R687103(7)',
  'ASA'::public.employee_company_type,
  company.id, branch.id, 'TW',
  '全職'::public.employee_employment_type,
  'resigned'::public.employee_status,
  position.id,
  date '2023-09-26',
  null
from public.companies company
join public.branches branch
  on branch.company_id = company.id and branch.code = 'TW'
join public.positions position
  on position.code = 'MASSAGIST'
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
-- ═══ SF260 Jay 許靜婷 ═══
insert into public.employees (
  employee_code, name_zh, name_en, alias, gender,
  identity_type, identity_number, company_type,
  company_id, branch_id, branch_code,
  employment_type, employment_status, position_id,
  hire_date, probation_months
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
  company.id, branch.id, 'TW',
  '全職'::public.employee_employment_type,
  'active'::public.employee_status,
  position.id,
  date '2023-10-09',
  1
from public.companies company
join public.branches branch
  on branch.company_id = company.id and branch.code = 'TW'
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
-- ═══ SF261 Jc 黃麗齡 ═══
insert into public.employees (
  employee_code, name_zh, name_en, alias, gender,
  identity_type, identity_number, company_type,
  company_id, branch_id, branch_code,
  employment_type, employment_status, position_id,
  hire_date, probation_months
)
select
  'SF261',
  '黃麗齡',
  'Wong Lai Ling Anna',
  'Jc',
  'other'::public.employee_gender,
  'hkid'::public.employee_identity_type,
  null,
  'ASA'::public.employee_company_type,
  company.id, branch.id, 'TMA',
  '全職'::public.employee_employment_type,
  'resigned'::public.employee_status,
  position.id,
  date '2024-01-15',
  null
from public.companies company
join public.branches branch
  on branch.company_id = company.id and branch.code = 'TMA'
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
-- ═══ SF262 Gigi  ═══
insert into public.employees (
  employee_code, name_zh, name_en, alias, gender,
  identity_type, identity_number, company_type,
  company_id, branch_id, branch_code,
  employment_type, employment_status, position_id,
  hire_date, probation_months
)
select
  'SF262',
  'N/A',
  'N/A',
  'Gigi',
  'other'::public.employee_gender,
  'hkid'::public.employee_identity_type,
  null,
  'ASA'::public.employee_company_type,
  company.id, branch.id, 'CWB',
  '全職'::public.employee_employment_type,
  'resigned'::public.employee_status,
  position.id,
  date '2024-01-16',
  null
from public.companies company
join public.branches branch
  on branch.company_id = company.id and branch.code = 'CWB'
join public.positions position
  on position.code = 'MASSAGIST'
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
-- ═══ SF265 Sugar 王雪婷 ═══
insert into public.employees (
  employee_code, name_zh, name_en, alias, gender,
  identity_type, identity_number, company_type,
  company_id, branch_id, branch_code,
  employment_type, employment_status, position_id,
  hire_date, probation_months
)
select
  'SF265',
  '王雪婷',
  'Wong Suet Ting',
  'Sugar',
  'other'::public.employee_gender,
  'hkid'::public.employee_identity_type,
  'Y152326(9)',
  'ASA'::public.employee_company_type,
  company.id, branch.id, 'CWB',
  '全職'::public.employee_employment_type,
  'active'::public.employee_status,
  position.id,
  date '2023-11-09',
  1
from public.companies company
join public.branches branch
  on branch.company_id = company.id and branch.code = 'CWB'
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
-- ═══ SF266 Cat 黃美娜 ═══
insert into public.employees (
  employee_code, name_zh, name_en, alias, gender,
  identity_type, identity_number, company_type,
  company_id, branch_id, branch_code,
  employment_type, employment_status, position_id,
  hire_date, probation_months
)
select
  'SF266',
  '黃美娜',
  'Chiranan Thianhom',
  'Cat',
  'other'::public.employee_gender,
  'hkid'::public.employee_identity_type,
  'K716637(0)',
  'ASAS'::public.employee_company_type,
  company.id, branch.id, 'TMA',
  '全職'::public.employee_employment_type,
  'active'::public.employee_status,
  position.id,
  date '2023-11-25',
  1
from public.companies company
join public.branches branch
  on branch.company_id = company.id and branch.code = 'TMA'
join public.positions position
  on position.code = 'MASSAGIST'
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
-- ═══ SF267 Bell 文芊茹 ═══
insert into public.employees (
  employee_code, name_zh, name_en, alias, gender,
  identity_type, identity_number, company_type,
  company_id, branch_id, branch_code,
  employment_type, employment_status, position_id,
  hire_date, probation_months
)
select
  'SF267',
  '文芊茹',
  'Man Chin Yu',
  'Bell',
  'other'::public.employee_gender,
  'hkid'::public.employee_identity_type,
  'Y602809(6)',
  'ASA'::public.employee_company_type,
  company.id, branch.id, 'TW',
  '全職'::public.employee_employment_type,
  'resigned'::public.employee_status,
  position.id,
  date '2023-12-11',
  null
from public.companies company
join public.branches branch
  on branch.company_id = company.id and branch.code = 'TW'
join public.positions position
  on position.code = 'RECEPTIONIST'
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
-- ═══ SF271 Crystal 趙淑貞 ═══
insert into public.employees (
  employee_code, name_zh, name_en, alias, gender,
  identity_type, identity_number, company_type,
  company_id, branch_id, branch_code,
  employment_type, employment_status, position_id,
  hire_date, probation_months
)
select
  'SF271',
  '趙淑貞',
  'Chiu Shuk Ching',
  'Crystal',
  'other'::public.employee_gender,
  'hkid'::public.employee_identity_type,
  'R226581(7)',
  'ASA'::public.employee_company_type,
  company.id, branch.id, 'TMA',
  '全職'::public.employee_employment_type,
  'resigned'::public.employee_status,
  position.id,
  date '2024-01-15',
  null
from public.companies company
join public.branches branch
  on branch.company_id = company.id and branch.code = 'TMA'
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
-- ═══ SF272 Jojo 邱少碧 ═══
insert into public.employees (
  employee_code, name_zh, name_en, alias, gender,
  identity_type, identity_number, company_type,
  company_id, branch_id, branch_code,
  employment_type, employment_status, position_id,
  hire_date, probation_months
)
select
  'SF272',
  '邱少碧',
  'Qiu Shaobi',
  'Jojo',
  'other'::public.employee_gender,
  'hkid'::public.employee_identity_type,
  'R184303(5)',
  'ASA'::public.employee_company_type,
  company.id, branch.id, 'CWB',
  '全職'::public.employee_employment_type,
  'active'::public.employee_status,
  position.id,
  null,
  1
from public.companies company
join public.branches branch
  on branch.company_id = company.id and branch.code = 'CWB'
join public.positions position
  on position.code = 'MASSAGIST'
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
-- ═══ SF273 Grace 陳慧敏 ═══
insert into public.employees (
  employee_code, name_zh, name_en, alias, gender,
  identity_type, identity_number, company_type,
  company_id, branch_id, branch_code,
  employment_type, employment_status, position_id,
  hire_date, probation_months
)
select
  'SF273',
  '陳慧敏',
  'Chan Wai Man Grace',
  'Grace',
  'other'::public.employee_gender,
  'hkid'::public.employee_identity_type,
  'K921631(6)',
  'ASA'::public.employee_company_type,
  company.id, branch.id, 'TW',
  '全職'::public.employee_employment_type,
  'resigned'::public.employee_status,
  position.id,
  date '2024-02-19',
  null
from public.companies company
join public.branches branch
  on branch.company_id = company.id and branch.code = 'TW'
join public.positions position
  on position.code = 'ASSISTANT_SHOP_MANAGER'
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
-- ═══ SF275 Wingo 盧詠茵 ═══
insert into public.employees (
  employee_code, name_zh, name_en, alias, gender,
  identity_type, identity_number, company_type,
  company_id, branch_id, branch_code,
  employment_type, employment_status, position_id,
  hire_date, probation_months
)
select
  'SF275',
  '盧詠茵',
  'Lo Wing Yan',
  'Wingo',
  'other'::public.employee_gender,
  'hkid'::public.employee_identity_type,
  'K696639(A)',
  'ASA'::public.employee_company_type,
  company.id, branch.id, 'OFFICE',
  '全職'::public.employee_employment_type,
  'active'::public.employee_status,
  position.id,
  date '2024-02-26',
  null
from public.companies company
join public.branches branch
  on branch.company_id = company.id and branch.code = 'OFFICE'
join public.positions position
  on position.code = 'OFFICE_CLERK'
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
-- ═══ SF276 Helen  ═══
insert into public.employees (
  employee_code, name_zh, name_en, alias, gender,
  identity_type, identity_number, company_type,
  company_id, branch_id, branch_code,
  employment_type, employment_status, position_id,
  hire_date, probation_months
)
select
  'SF276',
  'N/A',
  'N/A',
  'Helen',
  'other'::public.employee_gender,
  'hkid'::public.employee_identity_type,
  null,
  'ASA'::public.employee_company_type,
  company.id, branch.id, 'MOS',
  '全職'::public.employee_employment_type,
  'resigned'::public.employee_status,
  position.id,
  date '2024-02-27',
  null
from public.companies company
join public.branches branch
  on branch.company_id = company.id and branch.code = 'MOS'
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
-- ═══ SF277 Joey 高鳳香 ═══
insert into public.employees (
  employee_code, name_zh, name_en, alias, gender,
  identity_type, identity_number, company_type,
  company_id, branch_id, branch_code,
  employment_type, employment_status, position_id,
  hire_date, probation_months
)
select
  'SF277',
  '高鳳香',
  'GAO Feng Xiang',
  'Joey',
  'other'::public.employee_gender,
  'hkid'::public.employee_identity_type,
  'R333773(0)',
  'ASA'::public.employee_company_type,
  company.id, branch.id, 'CWB',
  '全職'::public.employee_employment_type,
  'active'::public.employee_status,
  position.id,
  date '2024-03-14',
  1
from public.companies company
join public.branches branch
  on branch.company_id = company.id and branch.code = 'CWB'
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
-- ═══ SF279 KITTY 王嬌 ═══
insert into public.employees (
  employee_code, name_zh, name_en, alias, gender,
  identity_type, identity_number, company_type,
  company_id, branch_id, branch_code,
  employment_type, employment_status, position_id,
  hire_date, probation_months
)
select
  'SF279',
  '王嬌',
  'Wang Jiao',
  'KITTY',
  'other'::public.employee_gender,
  'hkid'::public.employee_identity_type,
  'M535934(7)',
  'ASAS'::public.employee_company_type,
  company.id, branch.id, 'TW',
  '全職'::public.employee_employment_type,
  'active'::public.employee_status,
  position.id,
  date '2024-04-04',
  1
from public.companies company
join public.branches branch
  on branch.company_id = company.id and branch.code = 'TW'
join public.positions position
  on position.code = 'MASSAGIST'
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
-- ═══ SF280 Amanda 何文頤 ═══
insert into public.employees (
  employee_code, name_zh, name_en, alias, gender,
  identity_type, identity_number, company_type,
  company_id, branch_id, branch_code,
  employment_type, employment_status, position_id,
  hire_date, probation_months
)
select
  'SF280',
  '何文頤',
  'Ho Man Yee',
  'Amanda',
  'other'::public.employee_gender,
  'hkid'::public.employee_identity_type,
  'Y382696(A)',
  'ASA'::public.employee_company_type,
  company.id, branch.id, 'CBA',
  '全職'::public.employee_employment_type,
  'active'::public.employee_status,
  position.id,
  date '2024-04-12',
  1
from public.companies company
join public.branches branch
  on branch.company_id = company.id and branch.code = 'CBA'
join public.positions position
  on position.code = 'RECEPTIONIST'
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
-- ═══ SF282 Vincci 黃惠燕 ═══
insert into public.employees (
  employee_code, name_zh, name_en, alias, gender,
  identity_type, identity_number, company_type,
  company_id, branch_id, branch_code,
  employment_type, employment_status, position_id,
  hire_date, probation_months
)
select
  'SF282',
  '黃惠燕',
  'Wong Wai Yin',
  'Vincci',
  'other'::public.employee_gender,
  'hkid'::public.employee_identity_type,
  'Z408146(4)',
  'ASA'::public.employee_company_type,
  company.id, branch.id, 'MKCY',
  '全職'::public.employee_employment_type,
  'active'::public.employee_status,
  position.id,
  date '2024-05-08',
  1
from public.companies company
join public.branches branch
  on branch.company_id = company.id and branch.code = 'MKCY'
join public.positions position
  on position.code = 'NURSE'
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
-- ═══ SF284 Yuri 林麗雅 ═══
insert into public.employees (
  employee_code, name_zh, name_en, alias, gender,
  identity_type, identity_number, company_type,
  company_id, branch_id, branch_code,
  employment_type, employment_status, position_id,
  hire_date, probation_months
)
select
  'SF284',
  '林麗雅',
  'LAM LAI NGA YURI',
  'Yuri',
  'other'::public.employee_gender,
  'hkid'::public.employee_identity_type,
  'M349281(3)',
  'ASA'::public.employee_company_type,
  company.id, branch.id, 'MKCY',
  '全職'::public.employee_employment_type,
  'resigned'::public.employee_status,
  position.id,
  date '2024-05-27',
  null
from public.companies company
join public.branches branch
  on branch.company_id = company.id and branch.code = 'MKCY'
join public.positions position
  on position.code = 'ASSISTANT_OPERATION_MANAGER'
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
-- ═══ SF287 Winnie  ═══
insert into public.employees (
  employee_code, name_zh, name_en, alias, gender,
  identity_type, identity_number, company_type,
  company_id, branch_id, branch_code,
  employment_type, employment_status, position_id,
  hire_date, probation_months
)
select
  'SF287',
  'N/A',
  'Cheung Wing Fong',
  'Winnie',
  'other'::public.employee_gender,
  'hkid'::public.employee_identity_type,
  'V140594(2)',
  'ASA'::public.employee_company_type,
  company.id, branch.id, 'MKCY',
  '全職'::public.employee_employment_type,
  'resigned'::public.employee_status,
  position.id,
  date '2024-05-27',
  null
from public.companies company
join public.branches branch
  on branch.company_id = company.id and branch.code = 'MKCY'
join public.positions position
  on position.code = 'SENIOR_SALES_MANAGER'
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
-- ═══ SF288 Summer 何寶瓊 ═══
insert into public.employees (
  employee_code, name_zh, name_en, alias, gender,
  identity_type, identity_number, company_type,
  company_id, branch_id, branch_code,
  employment_type, employment_status, position_id,
  hire_date, probation_months
)
select
  'SF288',
  '何寶瓊',
  'Ho Po King',
  'Summer',
  'other'::public.employee_gender,
  'hkid'::public.employee_identity_type,
  'Y297887(1)',
  'ASA'::public.employee_company_type,
  company.id, branch.id, 'TW',
  '全職'::public.employee_employment_type,
  'resigned'::public.employee_status,
  position.id,
  date '2024-06-01',
  null
from public.companies company
join public.branches branch
  on branch.company_id = company.id and branch.code = 'TW'
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
-- ═══ SF292 Mon 連嘉雯 ═══
insert into public.employees (
  employee_code, name_zh, name_en, alias, gender,
  identity_type, identity_number, company_type,
  company_id, branch_id, branch_code,
  employment_type, employment_status, position_id,
  hire_date, probation_months
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
  company.id, branch.id, 'TW',
  '全職'::public.employee_employment_type,
  'active'::public.employee_status,
  position.id,
  date '2024-06-01',
  1
from public.companies company
join public.branches branch
  on branch.company_id = company.id and branch.code = 'TW'
join public.positions position
  on position.code = 'RECEPTIONIST'
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
-- ═══ SF296 Monique 彭慧文 ═══
insert into public.employees (
  employee_code, name_zh, name_en, alias, gender,
  identity_type, identity_number, company_type,
  company_id, branch_id, branch_code,
  employment_type, employment_status, position_id,
  hire_date, probation_months
)
select
  'SF296',
  '彭慧文',
  'Pang Wai Man',
  'Monique',
  'other'::public.employee_gender,
  'hkid'::public.employee_identity_type,
  'Z795112(5)',
  'ASA'::public.employee_company_type,
  company.id, branch.id, 'MKCY',
  '全職'::public.employee_employment_type,
  'resigned'::public.employee_status,
  position.id,
  date '2024-06-03',
  null
from public.companies company
join public.branches branch
  on branch.company_id = company.id and branch.code = 'MKCY'
join public.positions position
  on position.code = 'SENIOR_SHOP_MANAGER'
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
-- ═══ SF299 小娟 薜娟 ═══
insert into public.employees (
  employee_code, name_zh, name_en, alias, gender,
  identity_type, identity_number, company_type,
  company_id, branch_id, branch_code,
  employment_type, employment_status, position_id,
  hire_date, probation_months
)
select
  'SF299',
  '薜娟',
  'Xue Juan',
  '小娟',
  'other'::public.employee_gender,
  'hkid'::public.employee_identity_type,
  'M912251(1)',
  'ASA'::public.employee_company_type,
  company.id, branch.id, 'MKCY',
  '全職'::public.employee_employment_type,
  'resigned'::public.employee_status,
  position.id,
  date '2024-06-17',
  null
from public.companies company
join public.branches branch
  on branch.company_id = company.id and branch.code = 'MKCY'
join public.positions position
  on position.code = 'MASSAGIST'
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
-- ═══ SF300 Jessica 袁巧玲 ═══
insert into public.employees (
  employee_code, name_zh, name_en, alias, gender,
  identity_type, identity_number, company_type,
  company_id, branch_id, branch_code,
  employment_type, employment_status, position_id,
  hire_date, probation_months
)
select
  'SF300',
  '袁巧玲',
  'Yuen Hau Ling',
  'Jessica',
  'other'::public.employee_gender,
  'hkid'::public.employee_identity_type,
  'P891388(2)',
  'ASA'::public.employee_company_type,
  company.id, branch.id, 'MKCY',
  '全職'::public.employee_employment_type,
  'resigned'::public.employee_status,
  position.id,
  date '2024-06-17',
  null
from public.companies company
join public.branches branch
  on branch.company_id = company.id and branch.code = 'MKCY'
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
-- ═══ SF301 Alice 曾志鵬 ═══
insert into public.employees (
  employee_code, name_zh, name_en, alias, gender,
  identity_type, identity_number, company_type,
  company_id, branch_id, branch_code,
  employment_type, employment_status, position_id,
  hire_date, probation_months
)
select
  'SF301',
  '曾志鵬',
  'Tsang Chi Pang',
  'Alice',
  'other'::public.employee_gender,
  'hkid'::public.employee_identity_type,
  null,
  'ASA'::public.employee_company_type,
  company.id, branch.id, 'MKCY',
  '全職'::public.employee_employment_type,
  'active'::public.employee_status,
  position.id,
  date '2024-06-18',
  1
from public.companies company
join public.branches branch
  on branch.company_id = company.id and branch.code = 'MKCY'
join public.positions position
  on position.code = 'DOCTOR'
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
-- ═══ SF302 Ling 周曉玲 ═══
insert into public.employees (
  employee_code, name_zh, name_en, alias, gender,
  identity_type, identity_number, company_type,
  company_id, branch_id, branch_code,
  employment_type, employment_status, position_id,
  hire_date, probation_months
)
select
  'SF302',
  '周曉玲',
  'Zhou Xiao Ling',
  'Ling',
  'other'::public.employee_gender,
  'hkid'::public.employee_identity_type,
  'R861468(6)',
  'ASA'::public.employee_company_type,
  company.id, branch.id, 'MOS',
  '全職'::public.employee_employment_type,
  'resigned'::public.employee_status,
  position.id,
  date '2024-06-20',
  null
from public.companies company
join public.branches branch
  on branch.company_id = company.id and branch.code = 'MOS'
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
-- ═══ SF303 YOYO 朱韋瑤 ═══
insert into public.employees (
  employee_code, name_zh, name_en, alias, gender,
  identity_type, identity_number, company_type,
  company_id, branch_id, branch_code,
  employment_type, employment_status, position_id,
  hire_date, probation_months
)
select
  'SF303',
  '朱韋瑤',
  'Chu Wai Yiu',
  'YOYO',
  'other'::public.employee_gender,
  'hkid'::public.employee_identity_type,
  'Y118284(4)',
  'ASA'::public.employee_company_type,
  company.id, branch.id, 'MOS',
  '全職'::public.employee_employment_type,
  'resigned'::public.employee_status,
  position.id,
  date '2024-06-24',
  null
from public.companies company
join public.branches branch
  on branch.company_id = company.id and branch.code = 'MOS'
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
-- ═══ SF304 May May 郭佩詩 ═══
insert into public.employees (
  employee_code, name_zh, name_en, alias, gender,
  identity_type, identity_number, company_type,
  company_id, branch_id, branch_code,
  employment_type, employment_status, position_id,
  hire_date, probation_months
)
select
  'SF304',
  '郭佩詩',
  'Kwok Pui Sze',
  'May May',
  'other'::public.employee_gender,
  'hkid'::public.employee_identity_type,
  'K678402(A)',
  'ASA'::public.employee_company_type,
  company.id, branch.id, 'TW',
  '全職'::public.employee_employment_type,
  'resigned'::public.employee_status,
  position.id,
  date '2024-06-25',
  null
from public.companies company
join public.branches branch
  on branch.company_id = company.id and branch.code = 'TW'
join public.positions position
  on position.code = 'MANAGER'
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
-- ═══ SF311 Polly 江配配 ═══
insert into public.employees (
  employee_code, name_zh, name_en, alias, gender,
  identity_type, identity_number, company_type,
  company_id, branch_id, branch_code,
  employment_type, employment_status, position_id,
  hire_date, probation_months
)
select
  'SF311',
  '江配配',
  'Jiang Peipei',
  'Polly',
  'other'::public.employee_gender,
  'hkid'::public.employee_identity_type,
  'F044031(7)',
  'ASA'::public.employee_company_type,
  company.id, branch.id, 'MKCY',
  '全職'::public.employee_employment_type,
  'resigned'::public.employee_status,
  position.id,
  date '2024-07-09',
  null
from public.companies company
join public.branches branch
  on branch.company_id = company.id and branch.code = 'MKCY'
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
-- ═══ SF312 MING 林映明 ═══
insert into public.employees (
  employee_code, name_zh, name_en, alias, gender,
  identity_type, identity_number, company_type,
  company_id, branch_id, branch_code,
  employment_type, employment_status, position_id,
  hire_date, probation_months
)
select
  'SF312',
  '林映明',
  'Lam  Ying Ming',
  'MING',
  'other'::public.employee_gender,
  'hkid'::public.employee_identity_type,
  'F463321(7)',
  'ASA'::public.employee_company_type,
  company.id, branch.id, 'MKCY',
  '全職'::public.employee_employment_type,
  'active'::public.employee_status,
  position.id,
  date '2024-07-09',
  1
from public.companies company
join public.branches branch
  on branch.company_id = company.id and branch.code = 'MKCY'
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
-- ═══ SF313 Barry 楊達偉 ═══
insert into public.employees (
  employee_code, name_zh, name_en, alias, gender,
  identity_type, identity_number, company_type,
  company_id, branch_id, branch_code,
  employment_type, employment_status, position_id,
  hire_date, probation_months
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
  company.id, branch.id, 'OFFICE',
  '全職'::public.employee_employment_type,
  'active'::public.employee_status,
  position.id,
  date '2024-07-23',
  1
from public.companies company
join public.branches branch
  on branch.company_id = company.id and branch.code = 'OFFICE'
join public.positions position
  on position.code = 'ACCOUNT_MANAGER'
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
-- ═══ SF315 Chloe 歐東林 ═══
insert into public.employees (
  employee_code, name_zh, name_en, alias, gender,
  identity_type, identity_number, company_type,
  company_id, branch_id, branch_code,
  employment_type, employment_status, position_id,
  hire_date, probation_months
)
select
  'SF315',
  '歐東林',
  'Au Tong Lam',
  'Chloe',
  'other'::public.employee_gender,
  'hkid'::public.employee_identity_type,
  'Y258158(0)',
  'ASA'::public.employee_company_type,
  company.id, branch.id, 'MKTOP',
  '全職'::public.employee_employment_type,
  'resigned'::public.employee_status,
  position.id,
  date '2024-07-24',
  null
from public.companies company
join public.branches branch
  on branch.company_id = company.id and branch.code = 'MKTOP'
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
-- ═══ SF318 Santo 陳熾燊 ═══
insert into public.employees (
  employee_code, name_zh, name_en, alias, gender,
  identity_type, identity_number, company_type,
  company_id, branch_id, branch_code,
  employment_type, employment_status, position_id,
  hire_date, probation_months
)
select
  'SF318',
  '陳熾燊',
  'Chan Chi San',
  'Santo',
  'other'::public.employee_gender,
  'hkid'::public.employee_identity_type,
  'Z068047(9)',
  'ASAS'::public.employee_company_type,
  company.id, branch.id, 'OFFICE',
  '全職'::public.employee_employment_type,
  'active'::public.employee_status,
  position.id,
  date '2024-08-01',
  1
from public.companies company
join public.branches branch
  on branch.company_id = company.id and branch.code = 'OFFICE'
join public.positions position
  on position.code = 'OPERATION_MANAGER'
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
-- ═══ SF320 Vanessa 陳禧旻 ═══
insert into public.employees (
  employee_code, name_zh, name_en, alias, gender,
  identity_type, identity_number, company_type,
  company_id, branch_id, branch_code,
  employment_type, employment_status, position_id,
  hire_date, probation_months
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
  company.id, branch.id, 'MOS',
  '全職'::public.employee_employment_type,
  'active'::public.employee_status,
  position.id,
  date '2024-08-01',
  1
from public.companies company
join public.branches branch
  on branch.company_id = company.id and branch.code = 'MOS'
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
-- ═══ SF322 Alice 黃敏珍 ═══
insert into public.employees (
  employee_code, name_zh, name_en, alias, gender,
  identity_type, identity_number, company_type,
  company_id, branch_id, branch_code,
  employment_type, employment_status, position_id,
  hire_date, probation_months
)
select
  'SF322',
  '黃敏珍',
  'Huang Minzhen',
  'Alice',
  'other'::public.employee_gender,
  'hkid'::public.employee_identity_type,
  'R827658(6)',
  'ASA'::public.employee_company_type,
  company.id, branch.id, 'CWB',
  '全職'::public.employee_employment_type,
  'active'::public.employee_status,
  position.id,
  date '2024-09-03',
  1
from public.companies company
join public.branches branch
  on branch.company_id = company.id and branch.code = 'CWB'
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
-- ═══ SF323 Candy 費曉蓮 ═══
insert into public.employees (
  employee_code, name_zh, name_en, alias, gender,
  identity_type, identity_number, company_type,
  company_id, branch_id, branch_code,
  employment_type, employment_status, position_id,
  hire_date, probation_months
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
  company.id, branch.id, 'MOS',
  '全職'::public.employee_employment_type,
  'active'::public.employee_status,
  position.id,
  date '2024-09-03',
  1
from public.companies company
join public.branches branch
  on branch.company_id = company.id and branch.code = 'MOS'
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
-- ═══ SF325 Faye 陳靜怡 ═══
insert into public.employees (
  employee_code, name_zh, name_en, alias, gender,
  identity_type, identity_number, company_type,
  company_id, branch_id, branch_code,
  employment_type, employment_status, position_id,
  hire_date, probation_months
)
select
  'SF325',
  '陳靜怡',
  'Chan Ching Yi',
  'Faye',
  'other'::public.employee_gender,
  'hkid'::public.employee_identity_type,
  'V116590(9)',
  'ASA'::public.employee_company_type,
  company.id, branch.id, 'OFFICE',
  '全職'::public.employee_employment_type,
  'resigned'::public.employee_status,
  position.id,
  date '2024-09-19',
  null
from public.companies company
join public.branches branch
  on branch.company_id = company.id and branch.code = 'OFFICE'
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
-- ═══ SF327 Jenny 吳芷瑜 ═══
insert into public.employees (
  employee_code, name_zh, name_en, alias, gender,
  identity_type, identity_number, company_type,
  company_id, branch_id, branch_code,
  employment_type, employment_status, position_id,
  hire_date, probation_months
)
select
  'SF327',
  '吳芷瑜',
  'Ng Chi Yu',
  'Jenny',
  'other'::public.employee_gender,
  'hkid'::public.employee_identity_type,
  'P877515(3)',
  'ASA'::public.employee_company_type,
  company.id, branch.id, 'TW',
  '全職'::public.employee_employment_type,
  'resigned'::public.employee_status,
  position.id,
  date '2024-09-23',
  null
from public.companies company
join public.branches branch
  on branch.company_id = company.id and branch.code = 'TW'
join public.positions position
  on position.code = 'MANAGER'
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
-- ═══ SF330 COCO 黃鈺淋 ═══
insert into public.employees (
  employee_code, name_zh, name_en, alias, gender,
  identity_type, identity_number, company_type,
  company_id, branch_id, branch_code,
  employment_type, employment_status, position_id,
  hire_date, probation_months
)
select
  'SF330',
  '黃鈺淋',
  'Wong Yuk Lam',
  'COCO',
  'other'::public.employee_gender,
  'hkid'::public.employee_identity_type,
  'R845614(2)',
  'ASA'::public.employee_company_type,
  company.id, branch.id, 'OFFICE',
  '全職'::public.employee_employment_type,
  'resigned'::public.employee_status,
  position.id,
  date '2024-10-02',
  null
from public.companies company
join public.branches branch
  on branch.company_id = company.id and branch.code = 'OFFICE'
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
-- ═══ SF331 Miki 劉洁婷 ═══
insert into public.employees (
  employee_code, name_zh, name_en, alias, gender,
  identity_type, identity_number, company_type,
  company_id, branch_id, branch_code,
  employment_type, employment_status, position_id,
  hire_date, probation_months
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
  company.id, branch.id, 'MKCY',
  '全職'::public.employee_employment_type,
  'active'::public.employee_status,
  position.id,
  date '2024-10-10',
  1
from public.companies company
join public.branches branch
  on branch.company_id = company.id and branch.code = 'MKCY'
join public.positions position
  on position.code = 'RECEPTIONIST'
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
-- ═══ SF333 Suki 葉柏芬 ═══
insert into public.employees (
  employee_code, name_zh, name_en, alias, gender,
  identity_type, identity_number, company_type,
  company_id, branch_id, branch_code,
  employment_type, employment_status, position_id,
  hire_date, probation_months
)
select
  'SF333',
  '葉柏芬',
  'Ye Baifen',
  'Suki',
  'other'::public.employee_gender,
  'hkid'::public.employee_identity_type,
  'M104719(7)',
  'ASA'::public.employee_company_type,
  company.id, branch.id, 'MKCY',
  '全職'::public.employee_employment_type,
  'resigned'::public.employee_status,
  position.id,
  date '2024-10-14',
  null
from public.companies company
join public.branches branch
  on branch.company_id = company.id and branch.code = 'MKCY'
join public.positions position
  on position.code = 'MASSAGIST'
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
-- ═══ SF334 Maymay 徐狄美 ═══
insert into public.employees (
  employee_code, name_zh, name_en, alias, gender,
  identity_type, identity_number, company_type,
  company_id, branch_id, branch_code,
  employment_type, employment_status, position_id,
  hire_date, probation_months
)
select
  'SF334',
  '徐狄美',
  'Tsui Tik Mei',
  'Maymay',
  'other'::public.employee_gender,
  'hkid'::public.employee_identity_type,
  'Y606363(0)',
  'ASA'::public.employee_company_type,
  company.id, branch.id, 'TAIWAI',
  '全職'::public.employee_employment_type,
  'active'::public.employee_status,
  position.id,
  date '2024-10-21',
  1
from public.companies company
join public.branches branch
  on branch.company_id = company.id and branch.code = 'TAIWAI'
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
-- ═══ SF335 ZOE 丘沛然 ═══
insert into public.employees (
  employee_code, name_zh, name_en, alias, gender,
  identity_type, identity_number, company_type,
  company_id, branch_id, branch_code,
  employment_type, employment_status, position_id,
  hire_date, probation_months
)
select
  'SF335',
  '丘沛然',
  'YAU PUI YIN',
  'ZOE',
  'other'::public.employee_gender,
  'hkid'::public.employee_identity_type,
  'Z378318(A)',
  'ASAS'::public.employee_company_type,
  company.id, branch.id, 'TW',
  '全職'::public.employee_employment_type,
  'active'::public.employee_status,
  position.id,
  date '2024-10-25',
  0
from public.companies company
join public.branches branch
  on branch.company_id = company.id and branch.code = 'TW'
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
-- ═══ SF336 Mimi 夏澤嬌 ═══
insert into public.employees (
  employee_code, name_zh, name_en, alias, gender,
  identity_type, identity_number, company_type,
  company_id, branch_id, branch_code,
  employment_type, employment_status, position_id,
  hire_date, probation_months
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
  company.id, branch.id, 'MOS',
  '全職'::public.employee_employment_type,
  'active'::public.employee_status,
  position.id,
  date '2024-10-28',
  1
from public.companies company
join public.branches branch
  on branch.company_id = company.id and branch.code = 'MOS'
join public.positions position
  on position.code = 'MASSAGIST'
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
-- ═══ SF337 Monica 黃婉君 ═══
insert into public.employees (
  employee_code, name_zh, name_en, alias, gender,
  identity_type, identity_number, company_type,
  company_id, branch_id, branch_code,
  employment_type, employment_status, position_id,
  hire_date, probation_months
)
select
  'SF337',
  '黃婉君',
  'Wong Yuen Kwan',
  'Monica',
  'other'::public.employee_gender,
  'hkid'::public.employee_identity_type,
  'R80474(3)',
  'ASA'::public.employee_company_type,
  company.id, branch.id, 'MKTOP',
  '全職'::public.employee_employment_type,
  'active'::public.employee_status,
  position.id,
  date '2024-11-04',
  1
from public.companies company
join public.branches branch
  on branch.company_id = company.id and branch.code = 'MKTOP'
join public.positions position
  on position.code = 'RECEPTIONIST'
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
-- ═══ SF338 Joyce 梁怡欣 ═══
insert into public.employees (
  employee_code, name_zh, name_en, alias, gender,
  identity_type, identity_number, company_type,
  company_id, branch_id, branch_code,
  employment_type, employment_status, position_id,
  hire_date, probation_months
)
select
  'SF338',
  '梁怡欣',
  'Leung Yee Yan',
  'Joyce',
  'other'::public.employee_gender,
  'hkid'::public.employee_identity_type,
  'Z689731(3)',
  'ASA'::public.employee_company_type,
  company.id, branch.id, 'OFFICE',
  '全職'::public.employee_employment_type,
  'resigned'::public.employee_status,
  position.id,
  date '2024-11-12',
  null
from public.companies company
join public.branches branch
  on branch.company_id = company.id and branch.code = 'OFFICE'
join public.positions position
  on position.code = 'OFFICE_CLERK'
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
-- ═══ SF339 Fanny 余敏慧 ═══
insert into public.employees (
  employee_code, name_zh, name_en, alias, gender,
  identity_type, identity_number, company_type,
  company_id, branch_id, branch_code,
  employment_type, employment_status, position_id,
  hire_date, probation_months
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
  company.id, branch.id, 'OFFICE',
  '全職'::public.employee_employment_type,
  'active'::public.employee_status,
  position.id,
  date '2024-11-18',
  1
from public.companies company
join public.branches branch
  on branch.company_id = company.id and branch.code = 'OFFICE'
join public.positions position
  on position.code = 'OFFICE_CLERK'
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
-- ═══ SF341 Esther 李紅妹 ═══
insert into public.employees (
  employee_code, name_zh, name_en, alias, gender,
  identity_type, identity_number, company_type,
  company_id, branch_id, branch_code,
  employment_type, employment_status, position_id,
  hire_date, probation_months
)
select
  'SF341',
  '李紅妹',
  'Lee Hong Mei',
  'Esther',
  'other'::public.employee_gender,
  'hkid'::public.employee_identity_type,
  'R753960(5)',
  'ASA'::public.employee_company_type,
  company.id, branch.id, 'MKCY',
  '全職'::public.employee_employment_type,
  'active'::public.employee_status,
  position.id,
  null,
  1
from public.companies company
join public.branches branch
  on branch.company_id = company.id and branch.code = 'MKCY'
join public.positions position
  on position.code = 'MASSAGIST'
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
-- ═══ SF342 May 姐 楊美美 ═══
insert into public.employees (
  employee_code, name_zh, name_en, alias, gender,
  identity_type, identity_number, company_type,
  company_id, branch_id, branch_code,
  employment_type, employment_status, position_id,
  hire_date, probation_months
)
select
  'SF342',
  '楊美美',
  'Yeung May May',
  'May 姐',
  'other'::public.employee_gender,
  'hkid'::public.employee_identity_type,
  'C274465(A)',
  'ASA'::public.employee_company_type,
  company.id, branch.id, 'CWB',
  '全職'::public.employee_employment_type,
  'active'::public.employee_status,
  position.id,
  date '2019-11-11',
  1
from public.companies company
join public.branches branch
  on branch.company_id = company.id and branch.code = 'CWB'
join public.positions position
  on position.code = 'JANITOR'
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
-- ═══ SF344 Me 吳佩臻 ═══
insert into public.employees (
  employee_code, name_zh, name_en, alias, gender,
  identity_type, identity_number, company_type,
  company_id, branch_id, branch_code,
  employment_type, employment_status, position_id,
  hire_date, probation_months
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
  company.id, branch.id, 'TMA',
  '全職'::public.employee_employment_type,
  'active'::public.employee_status,
  position.id,
  date '2025-03-07',
  1
from public.companies company
join public.branches branch
  on branch.company_id = company.id and branch.code = 'TMA'
join public.positions position
  on position.code = 'MASSAGIST'
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
-- ═══ SF345 Vanessa 鍾嫣嫣 ═══
insert into public.employees (
  employee_code, name_zh, name_en, alias, gender,
  identity_type, identity_number, company_type,
  company_id, branch_id, branch_code,
  employment_type, employment_status, position_id,
  hire_date, probation_months
)
select
  'SF345',
  '鍾嫣嫣',
  'Chung Yin Yin',
  'Vanessa',
  'other'::public.employee_gender,
  'hkid'::public.employee_identity_type,
  'R483737(0)',
  'ASAS'::public.employee_company_type,
  company.id, branch.id, 'MOS',
  '全職'::public.employee_employment_type,
  'active'::public.employee_status,
  position.id,
  null,
  1
from public.companies company
join public.branches branch
  on branch.company_id = company.id and branch.code = 'MOS'
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
-- ═══ SF346 Yvonne 李嘉賢 ═══
insert into public.employees (
  employee_code, name_zh, name_en, alias, gender,
  identity_type, identity_number, company_type,
  company_id, branch_id, branch_code,
  employment_type, employment_status, position_id,
  hire_date, probation_months
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
  company.id, branch.id, 'TW',
  '全職'::public.employee_employment_type,
  'active'::public.employee_status,
  position.id,
  date '2025-03-10',
  0
from public.companies company
join public.branches branch
  on branch.company_id = company.id and branch.code = 'TW'
join public.positions position
  on position.code = 'MANAGER'
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

-- ════════════════════════════════════════════
-- STEP 4: Salary profile upserts
-- ════════════════════════════════════════════
insert into public.employee_salary_profiles (
  employee_id, salary_type, base_salary, effective_from,
  attendance_bonus_enabled, attendance_bonus_amount,
  transport_allowance, briefing_bonus, booking_bonus,
  mpf_enabled, commission_method,
  pay_day_primary, pay_day_secondary,
  remarks
)
select
  employee.id, 'monthly', 4000, date '2016-12-12',
  true, 1000,
  null, 500, 0,
  true, 'none',
  6, 7,
  'Imported 2026-04-15 from V6 Contract List; commission deferred.'
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
  employee_id, salary_type, base_salary, effective_from,
  attendance_bonus_enabled, attendance_bonus_amount,
  transport_allowance, briefing_bonus, booking_bonus,
  mpf_enabled, commission_method,
  pay_day_primary, pay_day_secondary,
  remarks
)
select
  employee.id, 'monthly', 15300, date '2016-12-19',
  true, 2000,
  0, 500, 500,
  true, 'none',
  6, 8,
  'Imported 2026-04-15 from V6 Contract List; commission deferred.'
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
  employee_id, salary_type, base_salary, effective_from,
  attendance_bonus_enabled, attendance_bonus_amount,
  transport_allowance, briefing_bonus, booking_bonus,
  mpf_enabled, commission_method,
  pay_day_primary, pay_day_secondary,
  remarks
)
select
  employee.id, 'monthly', 10200, date '2017-02-03',
  true, 2000,
  null, 250, 250,
  true, 'none',
  6, 7,
  'Imported 2026-04-15 from V6 Contract List; commission deferred.'
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
  employee_id, salary_type, base_salary, effective_from,
  attendance_bonus_enabled, attendance_bonus_amount,
  transport_allowance, briefing_bonus, booking_bonus,
  mpf_enabled, commission_method,
  pay_day_primary, pay_day_secondary,
  remarks
)
select
  employee.id, 'monthly', 7800, date '2017-12-01',
  true, 2000,
  0, 500, 500,
  true, 'none',
  6, 9,
  'Imported 2026-04-15 from V6 Contract List; commission deferred.'
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
  employee_id, salary_type, base_salary, effective_from,
  attendance_bonus_enabled, attendance_bonus_amount,
  transport_allowance, briefing_bonus, booking_bonus,
  mpf_enabled, commission_method,
  pay_day_primary, pay_day_secondary,
  remarks
)
select
  employee.id, 'monthly', 7200, date '2019-05-03',
  true, 2000,
  0, 500, 500,
  true, 'none',
  6, 7,
  'Imported 2026-04-15 from V6 Contract List; commission deferred.'
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
  employee_id, salary_type, base_salary, effective_from,
  attendance_bonus_enabled, attendance_bonus_amount,
  transport_allowance, briefing_bonus, booking_bonus,
  mpf_enabled, commission_method,
  pay_day_primary, pay_day_secondary,
  remarks
)
select
  employee.id, 'monthly', 21300, date '2019-07-15',
  true, 2000,
  0, 500, 500,
  true, 'none',
  6, 7,
  'Imported 2026-04-15 from V6 Contract List; commission deferred.'
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
  employee_id, salary_type, base_salary, effective_from,
  attendance_bonus_enabled, attendance_bonus_amount,
  transport_allowance, briefing_bonus, booking_bonus,
  mpf_enabled, commission_method,
  pay_day_primary, pay_day_secondary,
  remarks
)
select
  employee.id, 'monthly', 17200, date '2020-07-13',
  true, 1000,
  1000, 1000, 0,
  true, 'none',
  6, 7,
  'Imported 2026-04-15 from V6 Contract List; commission deferred.'
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
  employee_id, salary_type, base_salary, effective_from,
  attendance_bonus_enabled, attendance_bonus_amount,
  transport_allowance, briefing_bonus, booking_bonus,
  mpf_enabled, commission_method,
  pay_day_primary, pay_day_secondary,
  remarks
)
select
  employee.id, 'monthly', 7200, date '2020-09-07',
  true, 2000,
  0, 500, 500,
  true, 'none',
  6, 7,
  'Imported 2026-04-15 from V6 Contract List; commission deferred.'
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
  employee_id, salary_type, base_salary, effective_from,
  attendance_bonus_enabled, attendance_bonus_amount,
  transport_allowance, briefing_bonus, booking_bonus,
  mpf_enabled, commission_method,
  pay_day_primary, pay_day_secondary,
  remarks
)
select
  employee.id, 'monthly', 6300, date '2021-02-27',
  true, 2000,
  0, 500, 500,
  true, 'none',
  6, 7,
  'Imported 2026-04-15 from V6 Contract List; commission deferred.'
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
  employee_id, salary_type, base_salary, effective_from,
  attendance_bonus_enabled, attendance_bonus_amount,
  transport_allowance, briefing_bonus, booking_bonus,
  mpf_enabled, commission_method,
  pay_day_primary, pay_day_secondary,
  remarks
)
select
  employee.id, 'monthly', 8300, date '2021-03-01',
  true, 2000,
  0, 500, 500,
  true, 'none',
  6, 7,
  'Imported 2026-04-15 from V6 Contract List; commission deferred.'
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
  employee_id, salary_type, base_salary, effective_from,
  attendance_bonus_enabled, attendance_bonus_amount,
  transport_allowance, briefing_bonus, booking_bonus,
  mpf_enabled, commission_method,
  pay_day_primary, pay_day_secondary,
  remarks
)
select
  employee.id, 'monthly', 52000, date '2021-04-12',
  true, 2000,
  0, 1000, 0,
  true, 'none',
  6, 12,
  'Imported 2026-04-15 from V6 Contract List; commission deferred.'
from public.employees employee
where employee.employee_code = 'SF129'
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
  employee_id, salary_type, base_salary, effective_from,
  attendance_bonus_enabled, attendance_bonus_amount,
  transport_allowance, briefing_bonus, booking_bonus,
  mpf_enabled, commission_method,
  pay_day_primary, pay_day_secondary,
  remarks
)
select
  employee.id, 'monthly', 5200, date '2021-05-01',
  true, 1000,
  0, 500, 500,
  true, 'none',
  6, 10,
  'Imported 2026-04-15 from V6 Contract List; commission deferred.'
from public.employees employee
where employee.employee_code = 'SF131'
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
  employee_id, salary_type, base_salary, effective_from,
  attendance_bonus_enabled, attendance_bonus_amount,
  transport_allowance, briefing_bonus, booking_bonus,
  mpf_enabled, commission_method,
  pay_day_primary, pay_day_secondary,
  remarks
)
select
  employee.id, 'monthly', 20500, date '2021-05-01',
  true, 2000,
  0, 500, 500,
  true, 'none',
  6, 10,
  'Imported 2026-04-15 from V6 Contract List; commission deferred.'
from public.employees employee
where employee.employee_code = 'SF134'
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
  employee_id, salary_type, base_salary, effective_from,
  attendance_bonus_enabled, attendance_bonus_amount,
  transport_allowance, briefing_bonus, booking_bonus,
  mpf_enabled, commission_method,
  pay_day_primary, pay_day_secondary,
  remarks
)
select
  employee.id, 'monthly', 13500, date '2021-07-01',
  true, 2000,
  0, 500, 500,
  true, 'none',
  6, 9,
  'Imported 2026-04-15 from V6 Contract List; commission deferred.'
from public.employees employee
where employee.employee_code = 'SF137'
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
  employee_id, salary_type, base_salary, effective_from,
  attendance_bonus_enabled, attendance_bonus_amount,
  transport_allowance, briefing_bonus, booking_bonus,
  mpf_enabled, commission_method,
  pay_day_primary, pay_day_secondary,
  remarks
)
select
  employee.id, 'monthly', 8300, date '2021-08-01',
  true, 2000,
  0, 250, 250,
  true, 'none',
  6, 7,
  'Imported 2026-04-15 from V6 Contract List; commission deferred.'
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
  employee_id, salary_type, base_salary, effective_from,
  attendance_bonus_enabled, attendance_bonus_amount,
  transport_allowance, briefing_bonus, booking_bonus,
  mpf_enabled, commission_method,
  pay_day_primary, pay_day_secondary,
  remarks
)
select
  employee.id, 'monthly', 8000, date '2021-09-01',
  true, 2000,
  0, 500, 500,
  true, 'none',
  6, 7,
  'Imported 2026-04-15 from V6 Contract List; commission deferred.'
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
  employee_id, salary_type, base_salary, effective_from,
  attendance_bonus_enabled, attendance_bonus_amount,
  transport_allowance, briefing_bonus, booking_bonus,
  mpf_enabled, commission_method,
  pay_day_primary, pay_day_secondary,
  remarks
)
select
  employee.id, 'monthly', 8000, date '2021-07-07',
  true, 2000,
  0, 500, 500,
  true, 'none',
  6, 7,
  'Imported 2026-04-15 from V6 Contract List; commission deferred.'
from public.employees employee
where employee.employee_code = 'SF145'
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
  employee_id, salary_type, base_salary, effective_from,
  attendance_bonus_enabled, attendance_bonus_amount,
  transport_allowance, briefing_bonus, booking_bonus,
  mpf_enabled, commission_method,
  pay_day_primary, pay_day_secondary,
  remarks
)
select
  employee.id, 'monthly', 6500, date '2021-09-03',
  true, 2000,
  0, 500, 500,
  true, 'none',
  6, 7,
  'Imported 2026-04-15 from V6 Contract List; commission deferred.'
from public.employees employee
where employee.employee_code = 'SF146'
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
  employee_id, salary_type, base_salary, effective_from,
  attendance_bonus_enabled, attendance_bonus_amount,
  transport_allowance, briefing_bonus, booking_bonus,
  mpf_enabled, commission_method,
  pay_day_primary, pay_day_secondary,
  remarks
)
select
  employee.id, 'monthly', 6300, date '2021-09-03',
  true, 2000,
  0, 500, 500,
  true, 'none',
  6, 7,
  'Imported 2026-04-15 from V6 Contract List; commission deferred.'
from public.employees employee
where employee.employee_code = 'SF149'
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
  employee_id, salary_type, base_salary, effective_from,
  attendance_bonus_enabled, attendance_bonus_amount,
  transport_allowance, briefing_bonus, booking_bonus,
  mpf_enabled, commission_method,
  pay_day_primary, pay_day_secondary,
  remarks
)
select
  employee.id, 'monthly', 12000, date '2021-09-01',
  true, 1000,
  0, 0, 0,
  true, 'none',
  6, 7,
  'Imported 2026-04-15 from V6 Contract List; commission deferred.'
from public.employees employee
where employee.employee_code = 'SF153'
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
  employee_id, salary_type, base_salary, effective_from,
  attendance_bonus_enabled, attendance_bonus_amount,
  transport_allowance, briefing_bonus, booking_bonus,
  mpf_enabled, commission_method,
  pay_day_primary, pay_day_secondary,
  remarks
)
select
  employee.id, 'monthly', 13500, date '2021-10-01',
  true, 2000,
  0, 1000, 0,
  true, 'none',
  6, 7,
  'Imported 2026-04-15 from V6 Contract List; commission deferred.'
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
  employee_id, salary_type, base_salary, effective_from,
  attendance_bonus_enabled, attendance_bonus_amount,
  transport_allowance, briefing_bonus, booking_bonus,
  mpf_enabled, commission_method,
  pay_day_primary, pay_day_secondary,
  remarks
)
select
  employee.id, 'monthly', 27000, date '2021-10-16',
  true, 1000,
  1000, 1000, 0,
  true, 'none',
  6, 7,
  'Imported 2026-04-15 from V6 Contract List; commission deferred.'
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
  employee_id, salary_type, base_salary, effective_from,
  attendance_bonus_enabled, attendance_bonus_amount,
  transport_allowance, briefing_bonus, booking_bonus,
  mpf_enabled, commission_method,
  pay_day_primary, pay_day_secondary,
  remarks
)
select
  employee.id, 'monthly', 24500, date '2021-10-01',
  true, 1000,
  0, 1000, 0,
  true, 'none',
  6, 7,
  'Imported 2026-04-15 from V6 Contract List; commission deferred.'
from public.employees employee
where employee.employee_code = 'SF156'
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
  employee_id, salary_type, base_salary, effective_from,
  attendance_bonus_enabled, attendance_bonus_amount,
  transport_allowance, briefing_bonus, booking_bonus,
  mpf_enabled, commission_method,
  pay_day_primary, pay_day_secondary,
  remarks
)
select
  employee.id, 'monthly', 20500, date '2017-12-01',
  true, 2000,
  null, 500, 500,
  true, 'none',
  6, 9,
  'Imported 2026-04-15 from V6 Contract List; commission deferred.'
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
  employee_id, salary_type, base_salary, effective_from,
  attendance_bonus_enabled, attendance_bonus_amount,
  transport_allowance, briefing_bonus, booking_bonus,
  mpf_enabled, commission_method,
  pay_day_primary, pay_day_secondary,
  remarks
)
select
  employee.id, 'monthly', 13300, date '2024-11-01',
  true, 2000,
  0, 500, 500,
  true, 'none',
  6, 7,
  'Imported 2026-04-15 from V6 Contract List; commission deferred.'
from public.employees employee
where employee.employee_code = 'SF167'
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
  employee_id, salary_type, base_salary, effective_from,
  attendance_bonus_enabled, attendance_bonus_amount,
  transport_allowance, briefing_bonus, booking_bonus,
  mpf_enabled, commission_method,
  pay_day_primary, pay_day_secondary,
  remarks
)
select
  employee.id, 'monthly', 15500, date '2022-04-21',
  true, 2000,
  0, 500, 500,
  true, 'none',
  6, 7,
  'Imported 2026-04-15 from V6 Contract List; commission deferred.'
from public.employees employee
where employee.employee_code = 'SF168'
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
  employee_id, salary_type, base_salary, effective_from,
  attendance_bonus_enabled, attendance_bonus_amount,
  transport_allowance, briefing_bonus, booking_bonus,
  mpf_enabled, commission_method,
  pay_day_primary, pay_day_secondary,
  remarks
)
select
  employee.id, 'monthly', 19300, date '2022-04-21',
  true, 1000,
  0, 0, 0,
  true, 'none',
  6, 7,
  'Imported 2026-04-15 from V6 Contract List; commission deferred.'
from public.employees employee
where employee.employee_code = 'SF170'
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
  employee_id, salary_type, base_salary, effective_from,
  attendance_bonus_enabled, attendance_bonus_amount,
  transport_allowance, briefing_bonus, booking_bonus,
  mpf_enabled, commission_method,
  pay_day_primary, pay_day_secondary,
  remarks
)
select
  employee.id, 'monthly', 15500, date '2022-04-21',
  true, 2000,
  0, 500, 500,
  true, 'none',
  6, 7,
  'Imported 2026-04-15 from V6 Contract List; commission deferred.'
from public.employees employee
where employee.employee_code = 'SF172'
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
  employee_id, salary_type, base_salary, effective_from,
  attendance_bonus_enabled, attendance_bonus_amount,
  transport_allowance, briefing_bonus, booking_bonus,
  mpf_enabled, commission_method,
  pay_day_primary, pay_day_secondary,
  remarks
)
select
  employee.id, 'monthly', 14000, date '2022-04-22',
  true, 2000,
  0, 500, 500,
  true, 'none',
  6, 7,
  'Imported 2026-04-15 from V6 Contract List; commission deferred.'
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
  employee_id, salary_type, base_salary, effective_from,
  attendance_bonus_enabled, attendance_bonus_amount,
  transport_allowance, briefing_bonus, booking_bonus,
  mpf_enabled, commission_method,
  pay_day_primary, pay_day_secondary,
  remarks
)
select
  employee.id, 'monthly', 14500, date '2022-06-02',
  true, 2000,
  0, 500, 500,
  true, 'none',
  6, 7,
  'Imported 2026-04-15 from V6 Contract List; commission deferred.'
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
  employee_id, salary_type, base_salary, effective_from,
  attendance_bonus_enabled, attendance_bonus_amount,
  transport_allowance, briefing_bonus, booking_bonus,
  mpf_enabled, commission_method,
  pay_day_primary, pay_day_secondary,
  remarks
)
select
  employee.id, 'monthly', 15500, date '2021-04-21',
  true, 2000,
  0, 500, 500,
  true, 'none',
  6, 7,
  'Imported 2026-04-15 from V6 Contract List; commission deferred.'
from public.employees employee
where employee.employee_code = 'SF185'
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
  employee_id, salary_type, base_salary, effective_from,
  attendance_bonus_enabled, attendance_bonus_amount,
  transport_allowance, briefing_bonus, booking_bonus,
  mpf_enabled, commission_method,
  pay_day_primary, pay_day_secondary,
  remarks
)
select
  employee.id, 'monthly', 20500, date '2022-06-27',
  true, 1000,
  0, 1000, 0,
  true, 'none',
  6, 7,
  'Imported 2026-04-15 from V6 Contract List; commission deferred.'
from public.employees employee
where employee.employee_code = 'SF188'
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
  employee_id, salary_type, base_salary, effective_from,
  attendance_bonus_enabled, attendance_bonus_amount,
  transport_allowance, briefing_bonus, booking_bonus,
  mpf_enabled, commission_method,
  pay_day_primary, pay_day_secondary,
  remarks
)
select
  employee.id, 'monthly', 14500, date '2022-06-28',
  true, 2000,
  0, 500, 500,
  true, 'none',
  6, 7,
  'Imported 2026-04-15 from V6 Contract List; commission deferred.'
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
  employee_id, salary_type, base_salary, effective_from,
  attendance_bonus_enabled, attendance_bonus_amount,
  transport_allowance, briefing_bonus, booking_bonus,
  mpf_enabled, commission_method,
  pay_day_primary, pay_day_secondary,
  remarks
)
select
  employee.id, 'monthly', 7000, date '2022-07-07',
  true, 2000,
  0, 500, 500,
  true, 'none',
  6, 7,
  'Imported 2026-04-15 from V6 Contract List; commission deferred.'
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
insert into public.employee_salary_profiles (
  employee_id, salary_type, base_salary, effective_from,
  attendance_bonus_enabled, attendance_bonus_amount,
  transport_allowance, briefing_bonus, booking_bonus,
  mpf_enabled, commission_method,
  pay_day_primary, pay_day_secondary,
  remarks
)
select
  employee.id, 'monthly', 7000, date '2022-07-19',
  true, 2000,
  null, 250, 250,
  true, 'none',
  null, null,
  'Imported 2026-04-15 from V6 Contract List; commission deferred.'
from public.employees employee
where employee.employee_code = 'SF196'
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
  employee_id, salary_type, base_salary, effective_from,
  attendance_bonus_enabled, attendance_bonus_amount,
  transport_allowance, briefing_bonus, booking_bonus,
  mpf_enabled, commission_method,
  pay_day_primary, pay_day_secondary,
  remarks
)
select
  employee.id, 'monthly', 6800, date '2022-08-01',
  true, 2000,
  0, 500, 500,
  true, 'none',
  6, 7,
  'Imported 2026-04-15 from V6 Contract List; commission deferred.'
from public.employees employee
where employee.employee_code = 'SF199'
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
  employee_id, salary_type, base_salary, effective_from,
  attendance_bonus_enabled, attendance_bonus_amount,
  transport_allowance, briefing_bonus, booking_bonus,
  mpf_enabled, commission_method,
  pay_day_primary, pay_day_secondary,
  remarks
)
select
  employee.id, 'monthly', 3700, date '2022-08-16',
  true, 1000,
  0, 250, 250,
  true, 'none',
  6, 7,
  'Imported 2026-04-15 from V6 Contract List; commission deferred.'
from public.employees employee
where employee.employee_code = 'SF206'
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
  employee_id, salary_type, base_salary, effective_from,
  attendance_bonus_enabled, attendance_bonus_amount,
  transport_allowance, briefing_bonus, booking_bonus,
  mpf_enabled, commission_method,
  pay_day_primary, pay_day_secondary,
  remarks
)
select
  employee.id, 'monthly', 7200, date '2022-11-01',
  true, 2000,
  0, 500, 500,
  true, 'none',
  6, 7,
  'Imported 2026-04-15 from V6 Contract List; commission deferred.'
from public.employees employee
where employee.employee_code = 'SF220'
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
  employee_id, salary_type, base_salary, effective_from,
  attendance_bonus_enabled, attendance_bonus_amount,
  transport_allowance, briefing_bonus, booking_bonus,
  mpf_enabled, commission_method,
  pay_day_primary, pay_day_secondary,
  remarks
)
select
  employee.id, 'monthly', 13000, date '2023-06-22',
  true, 2000,
  0, 500, 500,
  true, 'none',
  6, 7,
  'Imported 2026-04-15 from V6 Contract List; commission deferred.'
from public.employees employee
where employee.employee_code = 'SF221'
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
  employee_id, salary_type, base_salary, effective_from,
  attendance_bonus_enabled, attendance_bonus_amount,
  transport_allowance, briefing_bonus, booking_bonus,
  mpf_enabled, commission_method,
  pay_day_primary, pay_day_secondary,
  remarks
)
select
  employee.id, 'monthly', 33000, date '2022-12-01',
  true, 1000,
  1000, 1000, 0,
  true, 'none',
  6, 7,
  'Imported 2026-04-15 from V6 Contract List; commission deferred.'
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
  employee_id, salary_type, base_salary, effective_from,
  attendance_bonus_enabled, attendance_bonus_amount,
  transport_allowance, briefing_bonus, booking_bonus,
  mpf_enabled, commission_method,
  pay_day_primary, pay_day_secondary,
  remarks
)
select
  employee.id, 'monthly', 13000, date '2023-04-27',
  true, 2000,
  0, 500, 500,
  true, 'none',
  6, 7,
  'Imported 2026-04-15 from V6 Contract List; commission deferred.'
from public.employees employee
where employee.employee_code = 'SF233'
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
  employee_id, salary_type, base_salary, effective_from,
  attendance_bonus_enabled, attendance_bonus_amount,
  transport_allowance, briefing_bonus, booking_bonus,
  mpf_enabled, commission_method,
  pay_day_primary, pay_day_secondary,
  remarks
)
select
  employee.id, 'monthly', 7200, date '2023-05-08',
  true, 2000,
  0, 250, 250,
  true, 'none',
  6, 7,
  'Imported 2026-04-15 from V6 Contract List; commission deferred.'
from public.employees employee
where employee.employee_code = 'SF238'
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
  employee_id, salary_type, base_salary, effective_from,
  attendance_bonus_enabled, attendance_bonus_amount,
  transport_allowance, briefing_bonus, booking_bonus,
  mpf_enabled, commission_method,
  pay_day_primary, pay_day_secondary,
  remarks
)
select
  employee.id, 'monthly', 6500, date '2023-06-07',
  true, 2000,
  null, 500, 500,
  true, 'none',
  6, 7,
  'Imported 2026-04-15 from V6 Contract List; commission deferred.'
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
  employee_id, salary_type, base_salary, effective_from,
  attendance_bonus_enabled, attendance_bonus_amount,
  transport_allowance, briefing_bonus, booking_bonus,
  mpf_enabled, commission_method,
  pay_day_primary, pay_day_secondary,
  remarks
)
select
  employee.id, 'monthly', 7500, date '2023-07-01',
  true, 2000,
  0, 1000, 0,
  true, 'none',
  6, 9,
  'Imported 2026-04-15 from V6 Contract List; commission deferred.'
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
  employee_id, salary_type, base_salary, effective_from,
  attendance_bonus_enabled, attendance_bonus_amount,
  transport_allowance, briefing_bonus, booking_bonus,
  mpf_enabled, commission_method,
  pay_day_primary, pay_day_secondary,
  remarks
)
select
  employee.id, 'monthly', 7200, date '2023-08-01',
  true, 2000,
  0, 250, 250,
  true, 'none',
  6, 7,
  'Imported 2026-04-15 from V6 Contract List; commission deferred.'
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
  employee_id, salary_type, base_salary, effective_from,
  attendance_bonus_enabled, attendance_bonus_amount,
  transport_allowance, briefing_bonus, booking_bonus,
  mpf_enabled, commission_method,
  pay_day_primary, pay_day_secondary,
  remarks
)
select
  employee.id, 'monthly', 8500, date '2023-08-11',
  true, 2000,
  0, 500, 500,
  true, 'none',
  6, 7,
  'Imported 2026-04-15 from V6 Contract List; commission deferred.'
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
  employee_id, salary_type, base_salary, effective_from,
  attendance_bonus_enabled, attendance_bonus_amount,
  transport_allowance, briefing_bonus, booking_bonus,
  mpf_enabled, commission_method,
  pay_day_primary, pay_day_secondary,
  remarks
)
select
  employee.id, 'monthly', 15000, date '2023-08-14',
  true, 1000,
  0, 0, 0,
  true, 'none',
  6, 7,
  'Imported 2026-04-15 from V6 Contract List; commission deferred.'
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
  employee_id, salary_type, base_salary, effective_from,
  attendance_bonus_enabled, attendance_bonus_amount,
  transport_allowance, briefing_bonus, booking_bonus,
  mpf_enabled, commission_method,
  pay_day_primary, pay_day_secondary,
  remarks
)
select
  employee.id, 'monthly', 6000, date '2023-10-09',
  true, 2000,
  0, 1000, 0,
  true, 'none',
  6, 7,
  'Imported 2026-04-15 from V6 Contract List; commission deferred.'
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
  employee_id, salary_type, base_salary, effective_from,
  attendance_bonus_enabled, attendance_bonus_amount,
  transport_allowance, briefing_bonus, booking_bonus,
  mpf_enabled, commission_method,
  pay_day_primary, pay_day_secondary,
  remarks
)
select
  employee.id, 'monthly', 6500, date '2023-11-09',
  true, 2000,
  0, 500, 500,
  true, 'none',
  6, 7,
  'Imported 2026-04-15 from V6 Contract List; commission deferred.'
from public.employees employee
where employee.employee_code = 'SF265'
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
  employee_id, salary_type, base_salary, effective_from,
  attendance_bonus_enabled, attendance_bonus_amount,
  transport_allowance, briefing_bonus, booking_bonus,
  mpf_enabled, commission_method,
  pay_day_primary, pay_day_secondary,
  remarks
)
select
  employee.id, 'monthly', 7000, date '2023-11-25',
  true, 2000,
  0, 500, null,
  true, 'none',
  6, 7,
  'Imported 2026-04-15 from V6 Contract List; commission deferred.'
from public.employees employee
where employee.employee_code = 'SF266'
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
  employee_id, salary_type, base_salary, effective_from,
  attendance_bonus_enabled, attendance_bonus_amount,
  transport_allowance, briefing_bonus, booking_bonus,
  mpf_enabled, commission_method,
  pay_day_primary, pay_day_secondary,
  remarks
)
select
  employee.id, 'monthly', 7300, null,
  true, 2000,
  0, 250, 250,
  true, 'none',
  6, 7,
  'Imported 2026-04-15 from V6 Contract List; commission deferred.'
from public.employees employee
where employee.employee_code = 'SF272'
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
  employee_id, salary_type, base_salary, effective_from,
  attendance_bonus_enabled, attendance_bonus_amount,
  transport_allowance, briefing_bonus, booking_bonus,
  mpf_enabled, commission_method,
  pay_day_primary, pay_day_secondary,
  remarks
)
select
  employee.id, 'monthly', 6500, date '2024-03-14',
  true, 2000,
  0, 500, 500,
  true, 'none',
  6, 7,
  'Imported 2026-04-15 from V6 Contract List; commission deferred.'
from public.employees employee
where employee.employee_code = 'SF277'
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
  employee_id, salary_type, base_salary, effective_from,
  attendance_bonus_enabled, attendance_bonus_amount,
  transport_allowance, briefing_bonus, booking_bonus,
  mpf_enabled, commission_method,
  pay_day_primary, pay_day_secondary,
  remarks
)
select
  employee.id, 'monthly', 7200, date '2024-04-04',
  true, 2000,
  0, 250, 250,
  true, 'none',
  6, 7,
  'Imported 2026-04-15 from V6 Contract List; commission deferred.'
from public.employees employee
where employee.employee_code = 'SF279'
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
  employee_id, salary_type, base_salary, effective_from,
  attendance_bonus_enabled, attendance_bonus_amount,
  transport_allowance, briefing_bonus, booking_bonus,
  mpf_enabled, commission_method,
  pay_day_primary, pay_day_secondary,
  remarks
)
select
  employee.id, 'monthly', 15000, date '2024-04-12',
  true, 2000,
  0, 500, 500,
  true, 'none',
  6, 7,
  'Imported 2026-04-15 from V6 Contract List; commission deferred.'
from public.employees employee
where employee.employee_code = 'SF280'
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
  employee_id, salary_type, base_salary, effective_from,
  attendance_bonus_enabled, attendance_bonus_amount,
  transport_allowance, briefing_bonus, booking_bonus,
  mpf_enabled, commission_method,
  pay_day_primary, pay_day_secondary,
  remarks
)
select
  employee.id, 'monthly', 22000, date '2024-05-08',
  true, 2000,
  null, 1000, 0,
  true, 'none',
  6, 7,
  'Imported 2026-04-15 from V6 Contract List; commission deferred.'
from public.employees employee
where employee.employee_code = 'SF282'
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
  employee_id, salary_type, base_salary, effective_from,
  attendance_bonus_enabled, attendance_bonus_amount,
  transport_allowance, briefing_bonus, booking_bonus,
  mpf_enabled, commission_method,
  pay_day_primary, pay_day_secondary,
  remarks
)
select
  employee.id, 'monthly', 17000, date '2024-06-01',
  true, 2000,
  0, 500, 500,
  true, 'none',
  6, 7,
  'Imported 2026-04-15 from V6 Contract List; commission deferred.'
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
  employee_id, salary_type, base_salary, effective_from,
  attendance_bonus_enabled, attendance_bonus_amount,
  transport_allowance, briefing_bonus, booking_bonus,
  mpf_enabled, commission_method,
  pay_day_primary, pay_day_secondary,
  remarks
)
select
  employee.id, 'monthly', 7200, date '2024-07-09',
  true, 2000,
  0, 500, 500,
  true, 'none',
  6, 7,
  'Imported 2026-04-15 from V6 Contract List; commission deferred.'
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
  employee_id, salary_type, base_salary, effective_from,
  attendance_bonus_enabled, attendance_bonus_amount,
  transport_allowance, briefing_bonus, booking_bonus,
  mpf_enabled, commission_method,
  pay_day_primary, pay_day_secondary,
  remarks
)
select
  employee.id, 'monthly', 42500, date '2024-07-23',
  true, 1000,
  0, 0, 0,
  true, 'none',
  6, 10,
  'Imported 2026-04-15 from V6 Contract List; commission deferred.'
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
  employee_id, salary_type, base_salary, effective_from,
  attendance_bonus_enabled, attendance_bonus_amount,
  transport_allowance, briefing_bonus, booking_bonus,
  mpf_enabled, commission_method,
  pay_day_primary, pay_day_secondary,
  remarks
)
select
  employee.id, 'monthly', 33500, date '2024-08-01',
  true, 2000,
  0, 500, 500,
  true, 'none',
  7, 10,
  'Imported 2026-04-15 from V6 Contract List; commission deferred.'
from public.employees employee
where employee.employee_code = 'SF318'
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
  employee_id, salary_type, base_salary, effective_from,
  attendance_bonus_enabled, attendance_bonus_amount,
  transport_allowance, briefing_bonus, booking_bonus,
  mpf_enabled, commission_method,
  pay_day_primary, pay_day_secondary,
  remarks
)
select
  employee.id, 'monthly', 6000, date '2024-08-01',
  true, 2000,
  0, 500, 500,
  true, 'none',
  6, 7,
  'Imported 2026-04-15 from V6 Contract List; commission deferred.'
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
  employee_id, salary_type, base_salary, effective_from,
  attendance_bonus_enabled, attendance_bonus_amount,
  transport_allowance, briefing_bonus, booking_bonus,
  mpf_enabled, commission_method,
  pay_day_primary, pay_day_secondary,
  remarks
)
select
  employee.id, 'monthly', 7300, date '2024-09-03',
  true, 2000,
  0, 500, 500,
  true, 'none',
  6, 7,
  'Imported 2026-04-15 from V6 Contract List; commission deferred.'
from public.employees employee
where employee.employee_code = 'SF322'
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
  employee_id, salary_type, base_salary, effective_from,
  attendance_bonus_enabled, attendance_bonus_amount,
  transport_allowance, briefing_bonus, booking_bonus,
  mpf_enabled, commission_method,
  pay_day_primary, pay_day_secondary,
  remarks
)
select
  employee.id, 'monthly', 9000, date '2024-09-03',
  true, 2000,
  0, 500, 500,
  true, 'none',
  6, 7,
  'Imported 2026-04-15 from V6 Contract List; commission deferred.'
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
  employee_id, salary_type, base_salary, effective_from,
  attendance_bonus_enabled, attendance_bonus_amount,
  transport_allowance, briefing_bonus, booking_bonus,
  mpf_enabled, commission_method,
  pay_day_primary, pay_day_secondary,
  remarks
)
select
  employee.id, 'monthly', 13500, date '2024-10-10',
  true, 2000,
  0, 500, 500,
  true, 'none',
  6, 7,
  'Imported 2026-04-15 from V6 Contract List; commission deferred.'
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
  employee_id, salary_type, base_salary, effective_from,
  attendance_bonus_enabled, attendance_bonus_amount,
  transport_allowance, briefing_bonus, booking_bonus,
  mpf_enabled, commission_method,
  pay_day_primary, pay_day_secondary,
  remarks
)
select
  employee.id, 'monthly', 6200, date '2024-10-21',
  true, 2000,
  0, 500, 500,
  true, 'none',
  6, 7,
  'Imported 2026-04-15 from V6 Contract List; commission deferred.'
from public.employees employee
where employee.employee_code = 'SF334'
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
  employee_id, salary_type, base_salary, effective_from,
  attendance_bonus_enabled, attendance_bonus_amount,
  transport_allowance, briefing_bonus, booking_bonus,
  mpf_enabled, commission_method,
  pay_day_primary, pay_day_secondary,
  remarks
)
select
  employee.id, 'monthly', 12200, date '2024-10-25',
  true, 2000,
  0, 500, 500,
  true, 'none',
  6, 7,
  'Imported 2026-04-15 from V6 Contract List; commission deferred.'
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
  employee_id, salary_type, base_salary, effective_from,
  attendance_bonus_enabled, attendance_bonus_amount,
  transport_allowance, briefing_bonus, booking_bonus,
  mpf_enabled, commission_method,
  pay_day_primary, pay_day_secondary,
  remarks
)
select
  employee.id, 'monthly', 7000, date '2024-10-28',
  true, 2000,
  0, 500, 500,
  true, 'none',
  6, 7,
  'Imported 2026-04-15 from V6 Contract List; commission deferred.'
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
  employee_id, salary_type, base_salary, effective_from,
  attendance_bonus_enabled, attendance_bonus_amount,
  transport_allowance, briefing_bonus, booking_bonus,
  mpf_enabled, commission_method,
  pay_day_primary, pay_day_secondary,
  remarks
)
select
  employee.id, 'monthly', 12200, date '2024-11-04',
  true, 2000,
  0, 500, 500,
  true, 'none',
  6, 7,
  'Imported 2026-04-15 from V6 Contract List; commission deferred.'
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
  employee_id, salary_type, base_salary, effective_from,
  attendance_bonus_enabled, attendance_bonus_amount,
  transport_allowance, briefing_bonus, booking_bonus,
  mpf_enabled, commission_method,
  pay_day_primary, pay_day_secondary,
  remarks
)
select
  employee.id, 'monthly', 15500, date '2024-11-18',
  true, 1000,
  0, 0, 0,
  true, 'none',
  6, 7,
  'Imported 2026-04-15 from V6 Contract List; commission deferred.'
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
  employee_id, salary_type, base_salary, effective_from,
  attendance_bonus_enabled, attendance_bonus_amount,
  transport_allowance, briefing_bonus, booking_bonus,
  mpf_enabled, commission_method,
  pay_day_primary, pay_day_secondary,
  remarks
)
select
  employee.id, 'monthly', 7000, null,
  true, 2000,
  0, 500, 500,
  true, 'none',
  6, 7,
  'Imported 2026-04-15 from V6 Contract List; commission deferred.'
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
  employee_id, salary_type, base_salary, effective_from,
  attendance_bonus_enabled, attendance_bonus_amount,
  transport_allowance, briefing_bonus, booking_bonus,
  mpf_enabled, commission_method,
  pay_day_primary, pay_day_secondary,
  remarks
)
select
  employee.id, 'monthly', 10427, date '2019-11-11',
  false, 0,
  null, 0, 0,
  true, 'none',
  6, 7,
  'Imported 2026-04-15 from V6 Contract List; commission deferred.'
from public.employees employee
where employee.employee_code = 'SF342'
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
  employee_id, salary_type, base_salary, effective_from,
  attendance_bonus_enabled, attendance_bonus_amount,
  transport_allowance, briefing_bonus, booking_bonus,
  mpf_enabled, commission_method,
  pay_day_primary, pay_day_secondary,
  remarks
)
select
  employee.id, 'monthly', 7000, date '2025-03-07',
  true, 2000,
  0, 500, 500,
  true, 'none',
  6, 7,
  'Imported 2026-04-15 from V6 Contract List; commission deferred.'
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
  employee_id, salary_type, base_salary, effective_from,
  attendance_bonus_enabled, attendance_bonus_amount,
  transport_allowance, briefing_bonus, booking_bonus,
  mpf_enabled, commission_method,
  pay_day_primary, pay_day_secondary,
  remarks
)
select
  employee.id, 'monthly', 8000, null,
  true, 2000,
  0, 500, 500,
  true, 'none',
  6, 7,
  'Imported 2026-04-15 from V6 Contract List; commission deferred.'
from public.employees employee
where employee.employee_code = 'SF345'
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
  employee_id, salary_type, base_salary, effective_from,
  attendance_bonus_enabled, attendance_bonus_amount,
  transport_allowance, briefing_bonus, booking_bonus,
  mpf_enabled, commission_method,
  pay_day_primary, pay_day_secondary,
  remarks
)
select
  employee.id, 'monthly', 13000, date '2025-03-10',
  true, 2000,
  0, 500, 500,
  true, 'none',
  6, 7,
  'Imported 2026-04-15 from V6 Contract List; commission deferred.'
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

commit;