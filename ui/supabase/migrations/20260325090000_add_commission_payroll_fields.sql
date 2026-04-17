-- Migration: Expand salary profiles with commission and payroll fields
-- Based on V8 Excel workbook analysis

-- Add commission method enum
DO $$ BEGIN
  CREATE TYPE employee_commission_method AS ENUM ('standard', 'street_promoter', 'package', 'none');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Add missing payroll and commission fields to employee_salary_profiles
ALTER TABLE employee_salary_profiles
  ADD COLUMN IF NOT EXISTS briefing_bonus numeric DEFAULT 0 CHECK (briefing_bonus >= 0),
  ADD COLUMN IF NOT EXISTS booking_bonus numeric DEFAULT 0 CHECK (booking_bonus >= 0),
  ADD COLUMN IF NOT EXISTS commission_method employee_commission_method DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS commission_redeem_rate numeric DEFAULT 0.01,
  ADD COLUMN IF NOT EXISTS commission_sales_rate numeric DEFAULT 0.03,
  ADD COLUMN IF NOT EXISTS commission_sgm_rate numeric DEFAULT 0.05,
  ADD COLUMN IF NOT EXISTS package_salary_amount numeric DEFAULT 0 CHECK (package_salary_amount >= 0),
  ADD COLUMN IF NOT EXISTS pay_day_primary integer DEFAULT 7 CHECK (pay_day_primary BETWEEN 1 AND 28),
  ADD COLUMN IF NOT EXISTS pay_day_secondary integer DEFAULT 20 CHECK (pay_day_secondary BETWEEN 1 AND 28),
  ADD COLUMN IF NOT EXISTS commission_notes text;

-- Add comments for clarity
COMMENT ON COLUMN employee_salary_profiles.briefing_bonus IS '大會獎金';
COMMENT ON COLUMN employee_salary_profiles.booking_bonus IS '預約獎金';
COMMENT ON COLUMN employee_salary_profiles.commission_method IS '佣金計算方法: standard=標準佣金, street_promoter=街霸, package=包佣, none=無佣金';
COMMENT ON COLUMN employee_salary_profiles.commission_redeem_rate IS 'Redeem 佣金百分比 (default 1%)';
COMMENT ON COLUMN employee_salary_profiles.commission_sales_rate IS 'SALES 佣金百分比 (default 3%)';
COMMENT ON COLUMN employee_salary_profiles.commission_sgm_rate IS 'SGM 佣金百分比 (default 5%)';
COMMENT ON COLUMN employee_salary_profiles.package_salary_amount IS '包佣金額';
COMMENT ON COLUMN employee_salary_profiles.pay_day_primary IS '主要出糧日 (default 7號)';
COMMENT ON COLUMN employee_salary_profiles.pay_day_secondary IS '次要出糧日/佣金出糧日 (default 20號)';
