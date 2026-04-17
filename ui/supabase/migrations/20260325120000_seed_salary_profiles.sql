-- Seed salary profiles for existing employees based on V8 Excel data

-- SF102 Carol: MKTOP, 美容師, ASA company
-- COMMISSION data: 工錢=6144, Redeem=152180.5×1%=1521.81, SALES=132820×3%=3984.60, Total=11650.41
-- 出勤: 28天計, 20天上班, 5OFF, 3SH
INSERT INTO employee_salary_profiles (
  id, employee_id, salary_type, base_salary, allowance_amount, effective_from,
  pay_schedule, attendance_bonus_enabled, attendance_bonus_amount,
  transport_allowance, briefing_bonus, booking_bonus,
  meal_deduction_enabled, meal_deduction_amount,
  mpf_enabled, standard_daily_hours, ot_multiplier,
  commission_method, commission_redeem_rate, commission_sales_rate, commission_sgm_rate,
  package_salary_amount, pay_day_primary, pay_day_secondary,
  remarks
) SELECT
  gen_random_uuid(),
  e.id,
  'monthly', 17000, 0, '2021-04-12',
  'day_7', true, 2000,
  0, 500, 500,
  false, 0,
  true, 8, 1.5,
  'standard', 0.01, 0.03, 0.05,
  0, 7, 20,
  'MKTOP 分店美容師，標準佣金計算'
FROM public.employees e
WHERE e.employee_code = 'SF102'
ON CONFLICT (employee_id) DO UPDATE SET
  salary_type = EXCLUDED.salary_type,
  base_salary = EXCLUDED.base_salary,
  attendance_bonus_enabled = EXCLUDED.attendance_bonus_enabled,
  attendance_bonus_amount = EXCLUDED.attendance_bonus_amount,
  transport_allowance = EXCLUDED.transport_allowance,
  briefing_bonus = EXCLUDED.briefing_bonus,
  booking_bonus = EXCLUDED.booking_bonus,
  mpf_enabled = EXCLUDED.mpf_enabled,
  commission_method = EXCLUDED.commission_method,
  commission_redeem_rate = EXCLUDED.commission_redeem_rate,
  commission_sales_rate = EXCLUDED.commission_sales_rate,
  commission_sgm_rate = EXCLUDED.commission_sgm_rate,
  pay_day_primary = EXCLUDED.pay_day_primary,
  pay_day_secondary = EXCLUDED.pay_day_secondary,
  standard_daily_hours = EXCLUDED.standard_daily_hours,
  ot_multiplier = EXCLUDED.ot_multiplier,
  effective_from = EXCLUDED.effective_from,
  remarks = EXCLUDED.remarks,
  updated_at = now();

-- SF011 Sylvia: MKTOP, 顧問, ASAS company
-- From 出勤: 28天, 21天上班, 5OFF, 2SH, 累積OT=108.5小時
-- From SALARY sheet pattern: consultant-level salary
INSERT INTO employee_salary_profiles (
  id, employee_id, salary_type, base_salary, allowance_amount, effective_from,
  pay_schedule, attendance_bonus_enabled, attendance_bonus_amount,
  transport_allowance, briefing_bonus, booking_bonus,
  meal_deduction_enabled, meal_deduction_amount,
  mpf_enabled, standard_daily_hours, ot_multiplier,
  commission_method, commission_redeem_rate, commission_sales_rate, commission_sgm_rate,
  package_salary_amount, pay_day_primary, pay_day_secondary,
  remarks
) SELECT
  gen_random_uuid(),
  e.id,
  'monthly', 22000, 0, '2016-12-19',
  'day_7', true, 2000,
  1000, 500, 500,
  false, 0,
  true, 8, 1.5,
  'standard', 0.01, 0.03, 0.05,
  0, 7, 20,
  'MKTOP 分店顧問，標準佣金計算，累積OT較高'
FROM public.employees e
WHERE e.employee_code = 'SF011'
ON CONFLICT (employee_id) DO UPDATE SET
  salary_type = EXCLUDED.salary_type,
  base_salary = EXCLUDED.base_salary,
  attendance_bonus_enabled = EXCLUDED.attendance_bonus_enabled,
  attendance_bonus_amount = EXCLUDED.attendance_bonus_amount,
  transport_allowance = EXCLUDED.transport_allowance,
  briefing_bonus = EXCLUDED.briefing_bonus,
  booking_bonus = EXCLUDED.booking_bonus,
  mpf_enabled = EXCLUDED.mpf_enabled,
  commission_method = EXCLUDED.commission_method,
  commission_redeem_rate = EXCLUDED.commission_redeem_rate,
  commission_sales_rate = EXCLUDED.commission_sales_rate,
  commission_sgm_rate = EXCLUDED.commission_sgm_rate,
  pay_day_primary = EXCLUDED.pay_day_primary,
  pay_day_secondary = EXCLUDED.pay_day_secondary,
  standard_daily_hours = EXCLUDED.standard_daily_hours,
  ot_multiplier = EXCLUDED.ot_multiplier,
  effective_from = EXCLUDED.effective_from,
  remarks = EXCLUDED.remarks,
  updated_at = now();
