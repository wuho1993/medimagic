-- Restructure commission_rate_tiers to support staff-group-based commission rates
-- Matches detailed commission rate table from Excel workbook

-- 1. Add new columns
ALTER TABLE commission_rate_tiers
  ADD COLUMN IF NOT EXISTS staff_group text NOT NULL DEFAULT 'default',
  ADD COLUMN IF NOT EXISTS bonus_amount numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS bonus_threshold numeric;

-- 2. Drop old CHECK constraint on commission_type and replace with expanded one
ALTER TABLE commission_rate_tiers DROP CONSTRAINT IF EXISTS commission_rate_tiers_commission_type_check;
ALTER TABLE commission_rate_tiers ADD CONSTRAINT commission_rate_tiers_commission_type_check
  CHECK (commission_type IN ('redeem', 'sales', 'sgm', 'job', 'achievement_bonus'));

-- 3. Clear old simplified data
TRUNCATE commission_rate_tiers;

-- ===========================================================================
-- JOB Commission (療程佣金) — Sylvia / Yena / Jackie
-- ===========================================================================
INSERT INTO commission_rate_tiers (commission_type, staff_group, min_amount, max_amount, rate, bonus_threshold, bonus_amount, description, sort_order) VALUES
  ('job', 'sylvia_yena_jackie', 0,      200000,  0.05,  NULL,   0,    'Below $200,000 → 5%',                1),
  ('job', 'sylvia_yena_jackie', 200001, 330000,  0.055, 280000, 1000, '$200,001–$330,000 → 5.5% + $1,000',  2),
  ('job', 'sylvia_yena_jackie', 330001, 430000,  0.065, 350000, 2000, '$330,001–$430,000 → 6.5% + $2,000',  3),
  ('job', 'sylvia_yena_jackie', 430001, 600000,  0.07,  430000, 3000, '$430,001–$600,000 → 7% + $3,000',    4),
  ('job', 'sylvia_yena_jackie', 600001, NULL,    0.08,  NULL,   0,    'Over $600,001 → 8%',                  5);

-- ===========================================================================
-- JOB Commission — Dorcas / Lanke / Ella / Jacquline / Kerrie
-- ===========================================================================
INSERT INTO commission_rate_tiers (commission_type, staff_group, min_amount, max_amount, rate, bonus_threshold, bonus_amount, description, sort_order) VALUES
  ('job', 'dorcas_lanke_ella_jacquline_kerrie', 0,       300000,  0.045, NULL,   0,    'Below $300,000 → 4.5%',                  1),
  ('job', 'dorcas_lanke_ella_jacquline_kerrie', 300001,  350000,  0.05,  280000, 500,  '$300,001–$350,000 → 5% + $500',          2),
  ('job', 'dorcas_lanke_ella_jacquline_kerrie', 350001,  400000,  0.055, 380000, 800,  '$350,001–$400,000 → 5.5% + $800',        3),
  ('job', 'dorcas_lanke_ella_jacquline_kerrie', 400001,  450000,  0.06,  480000, 1200, '$400,001–$450,000 → 6% + $1,200',        4),
  ('job', 'dorcas_lanke_ella_jacquline_kerrie', 450001,  500000,  0.065, 580000, 1500, '$450,001–$500,000 → 6.5% + $1,500',      5),
  ('job', 'dorcas_lanke_ella_jacquline_kerrie', 500001,  550000,  0.07,  680000, 2000, '$500,001–$550,000 → 7% + $2,000',        6),
  ('job', 'dorcas_lanke_ella_jacquline_kerrie', 550001,  600000,  0.075, 780000, 2500, '$550,001–$600,000 → 7.5% + $2,500',      7),
  ('job', 'dorcas_lanke_ella_jacquline_kerrie', 600001,  800000,  0.08,  NULL,   0,    '$600,001–$800,000 → 8%',                  8),
  ('job', 'dorcas_lanke_ella_jacquline_kerrie', 800001,  1000000, 0.085, NULL,   0,    '$800,001–$1,000,000 → 8.5%',              9),
  ('job', 'dorcas_lanke_ella_jacquline_kerrie', 1000001, NULL,    0.09,  NULL,   0,    'Over $1,000,001 → 9%',                   10);

-- ===========================================================================
-- JOB Commission — Summer
-- ===========================================================================
INSERT INTO commission_rate_tiers (commission_type, staff_group, min_amount, max_amount, rate, bonus_threshold, bonus_amount, description, sort_order) VALUES
  ('job', 'summer', 0,      400000,  0.065, NULL, 0, 'Below $400,000 → 6.5%',           1),
  ('job', 'summer', 400001, 500000,  0.07,  NULL, 0, '$400,001–$500,000 → 7%',          2),
  ('job', 'summer', 500001, 600000,  0.075, NULL, 0, '$500,001–$600,000 → 7.5%',        3),
  ('job', 'summer', 600001, 700000,  0.08,  NULL, 0, '$600,001–$700,000 → 8%',          4),
  ('job', 'summer', 700001, 800000,  0.085, NULL, 0, '$700,001–$800,000 → 8.5%',        5),
  ('job', 'summer', 800001, NULL,    0.09,  NULL, 0, 'Over $800,001 → 9%',              6);

-- ===========================================================================
-- Redeem Commission (default tiers)
-- ===========================================================================
INSERT INTO commission_rate_tiers (commission_type, staff_group, min_amount, max_amount, rate, bonus_threshold, bonus_amount, description, sort_order) VALUES
  ('redeem', 'default', 0,      98000,  0.03,  NULL, 0, '$98,000 或以下 → 3%',            1),
  ('redeem', 'default', 98001,  148000, 0.032, NULL, 0, '$98,001–$148,000 → 3.2%',       2),
  ('redeem', 'default', 148001, 198000, 0.035, NULL, 0, '$148,001–$198,000 → 3.5%',      3),
  ('redeem', 'default', 198001, 248000, 0.038, NULL, 0, '$198,001–$248,000 → 3.8%',      4),
  ('redeem', 'default', 248001, NULL,   0.04,  NULL, 0, '$248,001 或以上 → 4%',           5);

-- ===========================================================================
-- Redeem Commission — Jacqueline (special rates)
-- ===========================================================================
INSERT INTO commission_rate_tiers (commission_type, staff_group, min_amount, max_amount, rate, bonus_threshold, bonus_amount, description, sort_order) VALUES
  ('redeem', 'jacqueline', 0,      98000,  0.014,  NULL, 0, '$98,000 或以下 → 1.4%',       1),
  ('redeem', 'jacqueline', 98001,  148000, 0.0145, NULL, 0, '$98,001–$148,000 → 1.45%',   2),
  ('redeem', 'jacqueline', 148001, 198000, 0.015,  NULL, 0, '$148,001–$198,000 → 1.5%',   3),
  ('redeem', 'jacqueline', 198001, 248000, 0.0155, NULL, 0, '$198,001–$248,000 → 1.55%',  4),
  ('redeem', 'jacqueline', 248001, NULL,   0.016,  NULL, 0, '$248,001 或以上 → 1.6%',      5);

-- ===========================================================================
-- Achievement Bonus — Ella / Lanke (based on target achievement %)
-- min_amount/max_amount here represent achievement percentage (70 = 70%)
-- bonus_amount is the bonus dollar amount at each threshold
-- ===========================================================================
INSERT INTO commission_rate_tiers (commission_type, staff_group, min_amount, max_amount, rate, bonus_threshold, bonus_amount, description, sort_order) VALUES
  ('achievement_bonus', 'ella_lanke', 70,  79,  0, NULL, 500,  '達標 70% → $500',   1),
  ('achievement_bonus', 'ella_lanke', 80,  89,  0, NULL, 800,  '達標 80% → $800',   2),
  ('achievement_bonus', 'ella_lanke', 90,  99,  0, NULL, 1200, '達標 90% → $1,200', 3),
  ('achievement_bonus', 'ella_lanke', 100, 109, 0, NULL, 1500, '達標 100% → $1,500', 4),
  ('achievement_bonus', 'ella_lanke', 110, 119, 0, NULL, 2000, '達標 110% → $2,000', 5),
  ('achievement_bonus', 'ella_lanke', 120, NULL,0, NULL, 2500, '達標 120% → $2,500', 6);

-- SGM flat rate (retained)
INSERT INTO commission_rate_tiers (commission_type, staff_group, min_amount, max_amount, rate, bonus_threshold, bonus_amount, description, sort_order) VALUES
  ('sgm', 'default', 0, NULL, 0.05, NULL, 0, 'SGM flat rate → 5%', 1);

-- Sales flat rate (retained)
INSERT INTO commission_rate_tiers (commission_type, staff_group, min_amount, max_amount, rate, bonus_threshold, bonus_amount, description, sort_order) VALUES
  ('sales', 'default', 0, NULL, 0.03, NULL, 0, 'Sales flat rate → 3%', 1);
