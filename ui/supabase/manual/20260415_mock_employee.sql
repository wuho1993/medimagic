-- ============================================================
-- Mock Employee: SF006 (KT / 鄭家彤 / Cheng Ka Tung)
-- Branch: MKTOP (MK), Company: ASA, Position: SENIOR_BEAUTICIAN
-- Salary: monthly, base 3750, attendance 1000, briefing 250, booking 250
-- ============================================================

BEGIN;

-- 1. Insert employee
INSERT INTO employees (
  employee_code,
  name_zh,
  name_en,
  alias,
  gender,
  identity_type,
  identity_number,
  date_of_birth,
  phone,
  address,
  company_type,
  company_id,
  employment_type,
  employment_status,
  branch_id,
  branch_code,
  position_id,
  hire_date,
  payment_method
) VALUES (
  'SF006',
  '鄭家彤',
  'Cheng Ka Tung',
  'KT',
  'female',
  'hkid',
  '',
  NULL,
  '',
  '',
  'ASA',
  'a58821e5-aeb4-477e-9719-88722234fed5',  -- ASA
  '全職',
  'active',
  '68717732-746d-4de9-b0bf-16f64f056cf8',  -- MKTOP
  'MKTOP',
  'abb2362a-73b0-41b8-b973-0dbaf641dc39',  -- SENIOR_BEAUTICIAN
  NULL,
  'autopay'
);

-- 2. Insert salary profile
INSERT INTO employee_salary_profiles (
  employee_id,
  salary_type,
  base_salary,
  attendance_bonus_enabled,
  attendance_bonus_amount,
  briefing_bonus,
  booking_bonus,
  transport_allowance,
  mpf_enabled
) VALUES (
  (SELECT id FROM employees WHERE employee_code = 'SF006'),
  'monthly',
  3750,
  true,
  1000,
  250,
  250,
  0,
  true
);

COMMIT;

-- Verify
SELECT e.employee_code, e.alias, e.name_zh, e.name_en, e.company_type, e.employment_status,
       b.code as branch, p.code as position,
       sp.salary_type, sp.base_salary, sp.attendance_bonus_amount, sp.briefing_bonus, sp.booking_bonus
FROM employees e
LEFT JOIN branches b ON b.id = e.branch_id
LEFT JOIN positions p ON p.id = e.position_id
LEFT JOIN employee_salary_profiles sp ON sp.employee_id = e.id
WHERE e.employee_code = 'SF006';
