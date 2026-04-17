-- =============================================================
-- Salary Import from 03-2026_MM(FY)_V6.xlsx SALARY sheet
-- 1. Create 15 new employees (in salary but not in 員工資料)
-- 2. Update company_type (ASA/ASAS) for all salary employees
-- 3. Insert salary profiles for 72 employees
-- =============================================================

BEGIN;

-- =============================================================
-- 1. Create new employees only found in SALARY sheet (15)
-- =============================================================
INSERT INTO employees (
  employee_code, name_zh, name_en, alias, gender,
  company_type, employment_type, employment_status,
  branch_id, branch_code
) VALUES
('SF186', 'N/A', 'N/A', 'Moon', 'female', 'ASA', '全職', 'active',
 (SELECT id FROM branches WHERE code = 'TAIWAI'), 'TAIWAI'),
('SF189', 'N/A', 'N/A', 'Jumbo', 'female', 'ASAS', '全職', 'active',
 (SELECT id FROM branches WHERE code = 'TW'), 'TW'),
('SF216', 'N/A', 'N/A', 'Lilly', 'female', 'ASA', '全職', 'active',
 (SELECT id FROM branches WHERE code = 'MOS'), 'MOS'),
('SF322', 'N/A', 'N/A', 'Icy', 'female', 'ASA', '全職', 'active',
 (SELECT id FROM branches WHERE code = 'CWB'), 'CWB'),
('SF355', 'N/A', 'N/A', 'Gigi', 'female', 'ASAS', '全職', 'active',
 (SELECT id FROM branches WHERE code = 'TW'), 'TW'),
('SF356', 'N/A', 'N/A', 'Yu', 'female', 'ASAS', '全職', 'active',
 (SELECT id FROM branches WHERE code = 'OFFICE'), 'OFFICE'),
('SF358', 'N/A', 'N/A', 'Maggie', 'female', 'ASA', '全職', 'active',
 (SELECT id FROM branches WHERE code = 'MOS'), 'MOS'),
('SF360', 'N/A', 'N/A', 'Joyce', 'female', 'ASAS', '全職', 'active',
 (SELECT id FROM branches WHERE code = 'TW'), 'TW'),
('SF368', 'N/A', 'N/A', 'Yana', 'female', 'ASA', '全職', 'active',
 (SELECT id FROM branches WHERE code = 'MKCY'), 'MKCY'),
('SF370', 'N/A', 'N/A', 'Yu', 'female', 'ASAS', '全職', 'active',
 (SELECT id FROM branches WHERE code = 'TW'), 'TW'),
('SF372', 'N/A', 'N/A', 'Costte', 'female', 'ASAS', '全職', 'active',
 (SELECT id FROM branches WHERE code = 'OFFICE'), 'OFFICE'),
('SF375', 'N/A', 'N/A', 'Alferd', 'female', 'ASAS', '全職', 'active',
 (SELECT id FROM branches WHERE code = 'TW'), 'TW'),
('SF376', 'N/A', 'N/A', 'Tiffany', 'female', 'ASA', '全職', 'active',
 (SELECT id FROM branches WHERE code = 'MKTOP'), 'MKTOP'),
('SF377', '玉', 'N/A', '玉', 'female', 'ASA', '全職', 'active',
 (SELECT id FROM branches WHERE code = 'MKCY'), 'MKCY'),
('SF378', '英', 'N/A', '英', 'female', 'ASAS', '全職', 'active',
 (SELECT id FROM branches WHERE code = 'TM'), 'TM');

-- =============================================================
-- 2. Update company_type for existing employees based on salary
-- =============================================================
-- ASA employees
UPDATE employees SET company_type = 'ASA' WHERE employee_code IN (
  'SF006','SF011','SF014','SF025','SF065','SF066','SF102','SF117',
  'SF134','SF137','SF145','SF167','SF170','SF172','SF173','SF185',
  'SF193','SF199','SF206','SF220','SF238','SF247','SF249','SF265',
  'SF272','SF277','SF280','SF282','SF312','SF323','SF334','SF337',
  'SF342'
);

-- ASAS employees
UPDATE employees SET company_type = 'ASAS' WHERE employee_code IN (
  'SF068','SF119','SF129','SF144','SF154','SF155','SF156','SF164',
  'SF182','SF188','SF190','SF196','SF222','SF233','SF241','SF243',
  'SF279','SF292','SF313','SF318','SF335','SF339'
);

-- SF211 - daily rate, keep ASA default (not specified in salary)
-- SF146 - daily rate at CWB, ASA

-- =============================================================
-- 3. Insert salary profiles for all 72 employees
-- =============================================================

-- Monthly salary employees (70 records)
INSERT INTO employee_salary_profiles (
  employee_id, salary_type, base_salary,
  attendance_bonus_enabled, attendance_bonus_amount,
  briefing_bonus, booking_bonus,
  transport_allowance, mpf_enabled,
  effective_from
)
-- SF006 KT - MKTOP/ASA - basic 3750
SELECT e.id, 'monthly'::employee_salary_type, 3750,
  true, 1000, 250, 250, NULL::numeric, true, '2026-03-01'::date
FROM employees e WHERE e.employee_code = 'SF006'
UNION ALL
-- SF011 Sylvia - MKTOP/ASA - basic 15300
SELECT e.id, 'monthly'::employee_salary_type, 15300,
  true, 2000, 500, 500, NULL::numeric, true, '2026-03-01'::date
FROM employees e WHERE e.employee_code = 'SF011'
UNION ALL
-- SF014 Jess - MKTOP/ASA - basic 10200
SELECT e.id, 'monthly'::employee_salary_type, 10200,
  true, 2000, 250, 250, NULL::numeric, true, '2026-03-01'::date
FROM employees e WHERE e.employee_code = 'SF014'
UNION ALL
-- SF025 Winnie - MKTOP/ASA - basic 3900
SELECT e.id, 'monthly'::employee_salary_type, 3900,
  true, 1000, 250, 250, NULL::numeric, true, '2026-03-01'::date
FROM employees e WHERE e.employee_code = 'SF025'
UNION ALL
-- SF065 ChunChun - MKTOP/ASA - basic 7200
SELECT e.id, 'monthly'::employee_salary_type, 7200,
  true, 2000, 500, 500, NULL::numeric, true, '2026-03-01'::date
FROM employees e WHERE e.employee_code = 'SF065'
UNION ALL
-- SF066 Yan - MKTOP/ASA - basic 21300
SELECT e.id, 'monthly'::employee_salary_type, 21300,
  true, 2000, 500, 500, NULL::numeric, true, '2026-03-01'::date
FROM employees e WHERE e.employee_code = 'SF066'
UNION ALL
-- SF068 Canice - ASAS - basic 17200
SELECT e.id, 'monthly'::employee_salary_type, 17200,
  true, 1000, 1000, 0, 1000, true, '2026-03-01'::date
FROM employees e WHERE e.employee_code = 'SF068'
UNION ALL
-- SF102 Carol - MKTOP/ASA - basic 7200
SELECT e.id, 'monthly'::employee_salary_type, 7200,
  true, 2000, 500, 500, NULL::numeric, true, '2026-03-01'::date
FROM employees e WHERE e.employee_code = 'SF102'
UNION ALL
-- SF117 Wendy - MKTOP/ASA - basic 6300
SELECT e.id, 'monthly'::employee_salary_type, 6300,
  true, 2000, 500, 500, NULL::numeric, true, '2026-03-01'::date
FROM employees e WHERE e.employee_code = 'SF117'
UNION ALL
-- SF119 Yan Wong - TW/ASAS - basic 8300
SELECT e.id, 'monthly'::employee_salary_type, 8300,
  true, 2000, 500, 500, NULL::numeric, true, '2026-03-01'::date
FROM employees e WHERE e.employee_code = 'SF119'
UNION ALL
-- SF129 Jackie - OFFICE/ASAS - basic 55000
SELECT e.id, 'monthly'::employee_salary_type, 55000,
  true, 2000, 1000, 0, 0, true, '2026-03-01'::date
FROM employees e WHERE e.employee_code = 'SF129'
UNION ALL
-- SF134 Jacqueline - CWB/ASA - basic 20500
SELECT e.id, 'monthly'::employee_salary_type, 20500,
  true, 2000, 500, 500, NULL::numeric, true, '2026-03-01'::date
FROM employees e WHERE e.employee_code = 'SF134'
UNION ALL
-- SF137 Yena - CWB/ASA - basic 13500
SELECT e.id, 'monthly'::employee_salary_type, 13500,
  true, 2000, 500, 500, NULL::numeric, true, '2026-03-01'::date
FROM employees e WHERE e.employee_code = 'SF137'
UNION ALL
-- SF144 Wing - TM/ASAS - basic 8000
SELECT e.id, 'monthly'::employee_salary_type, 8000,
  true, 2000, 500, 500, NULL::numeric, true, '2026-03-01'::date
FROM employees e WHERE e.employee_code = 'SF144'
UNION ALL
-- SF145 Alice - CWB/ASA - basic 8000
SELECT e.id, 'monthly'::employee_salary_type, 8000,
  true, 2000, 500, 500, NULL::numeric, true, '2026-03-01'::date
FROM employees e WHERE e.employee_code = 'SF145'
UNION ALL
-- SF154 Lanke - TM/ASAS - basic 13500
SELECT e.id, 'monthly'::employee_salary_type, 13500,
  true, 2000, 500, 500, NULL::numeric, true, '2026-03-01'::date
FROM employees e WHERE e.employee_code = 'SF154'
UNION ALL
-- SF155 Carman - Office/ASAS - basic 27000
SELECT e.id, 'monthly'::employee_salary_type, 27000,
  true, 1000, 1000, 0, 1000, true, '2026-03-01'::date
FROM employees e WHERE e.employee_code = 'SF155'
UNION ALL
-- SF156 Sunny - Office/ASAS - basic 24500
SELECT e.id, 'monthly'::employee_salary_type, 24500,
  true, 1000, 1000, 0, NULL::numeric, true, '2026-03-01'::date
FROM employees e WHERE e.employee_code = 'SF156'
UNION ALL
-- SF164 LY - TM/ASAS - basic 20500
SELECT e.id, 'monthly'::employee_salary_type, 20500,
  true, 2000, 500, 500, NULL::numeric, true, '2026-03-01'::date
FROM employees e WHERE e.employee_code = 'SF164'
UNION ALL
-- SF167 Ella - MK/ASA - basic 13300
SELECT e.id, 'monthly'::employee_salary_type, 13300,
  true, 2000, 500, 500, NULL::numeric, true, '2026-03-01'::date
FROM employees e WHERE e.employee_code = 'SF167'
UNION ALL
-- SF170 Body Moon - TaiWai/ASA - basic 19300
SELECT e.id, 'monthly'::employee_salary_type, 19300,
  true, 1000, 0, 0, NULL::numeric, true, '2026-03-01'::date
FROM employees e WHERE e.employee_code = 'SF170'
UNION ALL
-- SF172 YY - TAIWAI/ASA - basic 15500
SELECT e.id, 'monthly'::employee_salary_type, 15500,
  true, 2000, 500, 500, NULL::numeric, true, '2026-03-01'::date
FROM employees e WHERE e.employee_code = 'SF172'
UNION ALL
-- SF173 Karrie - MKCY/ASA - basic 14000
SELECT e.id, 'monthly'::employee_salary_type, 14000,
  true, 2000, 500, 500, NULL::numeric, true, '2026-03-01'::date
FROM employees e WHERE e.employee_code = 'SF173'
UNION ALL
-- SF182 PoYi - TM/ASAS - basic 14500
SELECT e.id, 'monthly'::employee_salary_type, 14500,
  true, 2000, 500, 500, NULL::numeric, true, '2026-03-01'::date
FROM employees e WHERE e.employee_code = 'SF182'
UNION ALL
-- SF185 Iris - TAIWAI/ASA - basic 15500
SELECT e.id, 'monthly'::employee_salary_type, 15500,
  true, 2000, 500, 500, NULL::numeric, true, '2026-03-01'::date
FROM employees e WHERE e.employee_code = 'SF185'
UNION ALL
-- SF186 Moon - TAIWAI/ASA - basic 15500
SELECT e.id, 'monthly'::employee_salary_type, 15500,
  true, 2000, 500, 500, NULL::numeric, true, '2026-03-01'::date
FROM employees e WHERE e.employee_code = 'SF186'
UNION ALL
-- SF188 Helen - Office/ASAS - basic 20500
SELECT e.id, 'monthly'::employee_salary_type, 20500,
  true, 1000, 1000, 0, NULL::numeric, true, '2026-03-01'::date
FROM employees e WHERE e.employee_code = 'SF188'
UNION ALL
-- SF189 Jumbo - TW/ASAS - basic 5200
SELECT e.id, 'monthly'::employee_salary_type, 5200,
  true, 1000, 250, 250, NULL::numeric, true, '2026-03-01'::date
FROM employees e WHERE e.employee_code = 'SF189'
UNION ALL
-- SF190 Dorcas - TM/ASAS - basic 17000
SELECT e.id, 'monthly'::employee_salary_type, 17000,
  true, 2000, 500, 500, NULL::numeric, true, '2026-03-01'::date
FROM employees e WHERE e.employee_code = 'SF190'
UNION ALL
-- SF193 雯雯 - MKCY/ASA - basic 7000
SELECT e.id, 'monthly'::employee_salary_type, 7000,
  true, 2000, 500, 500, NULL::numeric, true, '2026-03-01'::date
FROM employees e WHERE e.employee_code = 'SF193'
UNION ALL
-- SF196 Ting - TM/ASAS - basic 7000
SELECT e.id, 'monthly'::employee_salary_type, 7000,
  true, 2000, 250, 250, NULL::numeric, true, '2026-03-01'::date
FROM employees e WHERE e.employee_code = 'SF196'
UNION ALL
-- SF199 晴 - TaiWai/ASA - basic 6800
SELECT e.id, 'monthly'::employee_salary_type, 6800,
  true, 2000, 500, 500, NULL::numeric, true, '2026-03-01'::date
FROM employees e WHERE e.employee_code = 'SF199'
UNION ALL
-- SF206 Water - CWB/ASA - basic 3700
SELECT e.id, 'monthly'::employee_salary_type, 3700,
  true, 1000, 250, 250, NULL::numeric, true, '2026-03-01'::date
FROM employees e WHERE e.employee_code = 'SF206'
UNION ALL
-- SF216 Lilly - MOS/ASA - basic 7000
SELECT e.id, 'monthly'::employee_salary_type, 7000,
  true, 2000, 500, 500, NULL::numeric, true, '2026-03-01'::date
FROM employees e WHERE e.employee_code = 'SF216'
UNION ALL
-- SF220 Pinky - TaiWai/ASA - basic 7200
SELECT e.id, 'monthly'::employee_salary_type, 7200,
  true, 2000, 500, 500, NULL::numeric, true, '2026-03-01'::date
FROM employees e WHERE e.employee_code = 'SF220'
UNION ALL
-- SF222 Penny - Office/ASAS - basic 33000
SELECT e.id, 'monthly'::employee_salary_type, 33000,
  true, 1000, 1000, 0, 1000, true, '2026-03-01'::date
FROM employees e WHERE e.employee_code = 'SF222'
UNION ALL
-- SF233 Tracy - ASAS - basic 13000
SELECT e.id, 'monthly'::employee_salary_type, 13000,
  true, 2000, 500, 500, NULL::numeric, true, '2026-03-01'::date
FROM employees e WHERE e.employee_code = 'SF233'
UNION ALL
-- SF238 Kei - MKCY/ASA - basic 7200
SELECT e.id, 'monthly'::employee_salary_type, 7200,
  true, 2000, 250, 250, NULL::numeric, true, '2026-03-01'::date
FROM employees e WHERE e.employee_code = 'SF238'
UNION ALL
-- SF241 Rachel - MOS/ASAS - basic 7000
SELECT e.id, 'monthly'::employee_salary_type, 7000,
  true, 2000, 500, 500, NULL::numeric, true, '2026-03-01'::date
FROM employees e WHERE e.employee_code = 'SF241'
UNION ALL
-- SF243 Chilly - TW/ASAS - basic 9000
SELECT e.id, 'monthly'::employee_salary_type, 9000,
  true, 2000, 500, 500, NULL::numeric, true, '2026-03-01'::date
FROM employees e WHERE e.employee_code = 'SF243'
UNION ALL
-- SF247 Anna - MKTOP/ASA - basic 7200
SELECT e.id, 'monthly'::employee_salary_type, 7200,
  true, 2000, 250, 250, NULL::numeric, true, '2026-03-01'::date
FROM employees e WHERE e.employee_code = 'SF247'
UNION ALL
-- SF249 May - MKTOP/ASA - basic 8500
SELECT e.id, 'monthly'::employee_salary_type, 8500,
  true, 2000, 500, 500, NULL::numeric, true, '2026-03-01'::date
FROM employees e WHERE e.employee_code = 'SF249'
UNION ALL
-- SF265 Sugar - CWB/ASA - basic 6500
SELECT e.id, 'monthly'::employee_salary_type, 6500,
  true, 2000, 500, 500, NULL::numeric, true, '2026-03-01'::date
FROM employees e WHERE e.employee_code = 'SF265'
UNION ALL
-- SF272 JoJo - CWB/ASA - basic 7300
SELECT e.id, 'monthly'::employee_salary_type, 7300,
  true, 2000, 250, 250, NULL::numeric, true, '2026-03-01'::date
FROM employees e WHERE e.employee_code = 'SF272'
UNION ALL
-- SF277 Joey - CWB/ASA - basic 7000
SELECT e.id, 'monthly'::employee_salary_type, 7000,
  true, 2000, 500, 500, NULL::numeric, true, '2026-03-01'::date
FROM employees e WHERE e.employee_code = 'SF277'
UNION ALL
-- SF279 Kitty - TW/ASAS - basic 7200
SELECT e.id, 'monthly'::employee_salary_type, 7200,
  true, 2000, 250, 250, NULL::numeric, true, '2026-03-01'::date
FROM employees e WHERE e.employee_code = 'SF279'
UNION ALL
-- SF280 Amanda - CWB/ASA - basic 15000
SELECT e.id, 'monthly'::employee_salary_type, 15000,
  true, 2000, 500, 500, NULL::numeric, true, '2026-03-01'::date
FROM employees e WHERE e.employee_code = 'SF280'
UNION ALL
-- SF282 Wincci - MKCY/ASA - basic 22000
SELECT e.id, 'monthly'::employee_salary_type, 22000,
  true, 2000, 1000, 0, NULL::numeric, true, '2026-03-01'::date
FROM employees e WHERE e.employee_code = 'SF282'
UNION ALL
-- SF292 Mon - MOS/ASAS - basic 17000
SELECT e.id, 'monthly'::employee_salary_type, 17000,
  true, 2000, 500, 500, NULL::numeric, true, '2026-03-01'::date
FROM employees e WHERE e.employee_code = 'SF292'
UNION ALL
-- SF312 Ming - MKCY/ASA - basic 7200
SELECT e.id, 'monthly'::employee_salary_type, 7200,
  true, 2000, 500, 500, NULL::numeric, true, '2026-03-01'::date
FROM employees e WHERE e.employee_code = 'SF312'
UNION ALL
-- SF313 Barry - Office/ASAS - basic 42500
SELECT e.id, 'monthly'::employee_salary_type, 42500,
  true, 1000, 0, 0, 2000, true, '2026-03-01'::date
FROM employees e WHERE e.employee_code = 'SF313'
UNION ALL
-- SF318 Santo - Office/ASAS - basic 33500
SELECT e.id, 'monthly'::employee_salary_type, 33500,
  true, 2000, 500, 500, NULL::numeric, true, '2026-03-01'::date
FROM employees e WHERE e.employee_code = 'SF318'
UNION ALL
-- SF322 Icy - CWB/ASA - basic 7300
SELECT e.id, 'monthly'::employee_salary_type, 7300,
  true, 2000, 500, 500, NULL::numeric, true, '2026-03-01'::date
FROM employees e WHERE e.employee_code = 'SF322'
UNION ALL
-- SF323 Candy - MOS/ASA - basic 9000
SELECT e.id, 'monthly'::employee_salary_type, 9000,
  true, 2000, 500, 500, NULL::numeric, true, '2026-03-01'::date
FROM employees e WHERE e.employee_code = 'SF323'
UNION ALL
-- SF334 MayTsui - TaiWai/ASA - basic 6200
SELECT e.id, 'monthly'::employee_salary_type, 6200,
  true, 2000, 500, 500, NULL::numeric, true, '2026-03-01'::date
FROM employees e WHERE e.employee_code = 'SF334'
UNION ALL
-- SF335 Zoe - TW/ASAS - basic 12200
SELECT e.id, 'monthly'::employee_salary_type, 12200,
  true, 2000, 500, 500, NULL::numeric, true, '2026-03-01'::date
FROM employees e WHERE e.employee_code = 'SF335'
UNION ALL
-- SF337 Monica - MKTOP/ASA - basic 12200
SELECT e.id, 'monthly'::employee_salary_type, 12200,
  true, 2000, 500, 500, NULL::numeric, true, '2026-03-01'::date
FROM employees e WHERE e.employee_code = 'SF337'
UNION ALL
-- SF339 Fanny - Office/ASAS - basic 15500
SELECT e.id, 'monthly'::employee_salary_type, 15500,
  true, 1000, 0, 0, NULL::numeric, true, '2026-03-01'::date
FROM employees e WHERE e.employee_code = 'SF339'
UNION ALL
-- SF342 May姐 - CWB/ASA - basic 10427
SELECT e.id, 'monthly'::employee_salary_type, 10427,
  false, 0, 0, 0, NULL::numeric, true, '2026-03-01'::date
FROM employees e WHERE e.employee_code = 'SF342'
UNION ALL
-- SF355 Gigi - TW/ASAS - basic 7000
SELECT e.id, 'monthly'::employee_salary_type, 7000,
  true, 2000, 250, 250, NULL::numeric, true, '2026-03-01'::date
FROM employees e WHERE e.employee_code = 'SF355'
UNION ALL
-- SF356 Yu - Office/ASAS - basic 13000
SELECT e.id, 'monthly'::employee_salary_type, 13000,
  true, 1000, 0, 0, NULL::numeric, true, '2026-03-01'::date
FROM employees e WHERE e.employee_code = 'SF356'
UNION ALL
-- SF358 Maggie - MOS/ASA - basic 7000
SELECT e.id, 'monthly'::employee_salary_type, 7000,
  true, 2000, 500, 500, NULL::numeric, true, '2026-03-01'::date
FROM employees e WHERE e.employee_code = 'SF358'
UNION ALL
-- SF360 Joyce - TW/ASAS - basic 6000
SELECT e.id, 'monthly'::employee_salary_type, 6000,
  true, 2000, 500, 500, NULL::numeric, true, '2026-03-01'::date
FROM employees e WHERE e.employee_code = 'SF360'
UNION ALL
-- SF368 Yana - MKCY/ASA - basic 12500
SELECT e.id, 'monthly'::employee_salary_type, 12500,
  true, 2000, 0, 0, NULL::numeric, true, '2026-03-01'::date
FROM employees e WHERE e.employee_code = 'SF368'
UNION ALL
-- SF370 Yu - TW/ASAS - basic 6000
SELECT e.id, 'monthly'::employee_salary_type, 6000,
  true, 2000, 500, 500, NULL::numeric, true, '2026-03-01'::date
FROM employees e WHERE e.employee_code = 'SF370'
UNION ALL
-- SF372 Costte - Office/ASAS - basic 14500
SELECT e.id, 'monthly'::employee_salary_type, 14500,
  true, 1000, 0, 0, NULL::numeric, true, '2026-03-01'::date
FROM employees e WHERE e.employee_code = 'SF372'
UNION ALL
-- SF375 Alferd - TW/ASAS - basic 12000
SELECT e.id, 'monthly'::employee_salary_type, 12000,
  true, 2000, 500, 500, NULL::numeric, true, '2026-03-01'::date
FROM employees e WHERE e.employee_code = 'SF375'
UNION ALL
-- SF376 Tiffany - MKTOP/ASA - basic 7000
SELECT e.id, 'monthly'::employee_salary_type, 7000,
  true, 2000, 500, 500, NULL::numeric, true, '2026-03-01'::date
FROM employees e WHERE e.employee_code = 'SF376'
UNION ALL
-- SF377 玉 - MKCY/ASA - basic 8000
SELECT e.id, 'monthly'::employee_salary_type, 8000,
  true, 2000, 500, 500, NULL::numeric, true, '2026-03-01'::date
FROM employees e WHERE e.employee_code = 'SF377'
UNION ALL
-- SF378 英 - TM/ASAS - basic 7000
SELECT e.id, 'monthly'::employee_salary_type, 7000,
  true, 2000, 500, 500, NULL::numeric, true, '2026-03-01'::date
FROM employees e WHERE e.employee_code = 'SF378';

-- Daily rate employees (2 records)
INSERT INTO employee_salary_profiles (
  employee_id, salary_type, base_salary,
  attendance_bonus_enabled, attendance_bonus_amount,
  briefing_bonus, booking_bonus,
  transport_allowance, mpf_enabled,
  effective_from, remarks
)
-- SF146 KIKI - CWB/ASA - daily rate 1000
SELECT e.id, 'daily'::employee_salary_type, 1000,
  false, NULL, NULL, NULL, NULL::numeric, true, '2026-03-01'::date,
  'Daily rate employee (1000/day)'
FROM employees e WHERE e.employee_code = 'SF146'
UNION ALL
-- SF211 Ling - TM/ASA - daily rate 1000
SELECT e.id, 'daily'::employee_salary_type, 1000,
  true, 1000, 0, 0, NULL::numeric, true, '2026-03-01'::date,
  'Daily rate employee (1000/day), attendance bonus 1000'
FROM employees e WHERE e.employee_code = 'SF211';

COMMIT;
