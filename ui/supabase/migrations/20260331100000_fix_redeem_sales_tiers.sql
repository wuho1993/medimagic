-- Fix: Redeem/Sales tiers were swapped in previous migration
-- Corrected commission rate table:
--   Redeem: 1% / 1.2% / 1.6% / 2%
--   Sales:  3% / 3.2% / 3.5% / 3.8% / 4%
--   SGM:    5% flat
-- Also adds new tier: Redeem HK$248,001+ → 2%

-- 1. Remove incorrect redeem and sales default tiers
DELETE FROM commission_rate_tiers
WHERE commission_type IN ('redeem', 'sales') AND staff_group = 'default';

-- 2. Re-insert correct Redeem tiers (whole-volume rate)
INSERT INTO commission_rate_tiers (commission_type, staff_group, min_amount, max_amount, rate, bonus_threshold, bonus_amount, description, sort_order) VALUES
  ('redeem', 'default', 0,      98000,  0.01,  NULL, 0, 'Redeem $98,000 或以下 → 1%',         1),
  ('redeem', 'default', 98001,  148000, 0.012, NULL, 0, 'Redeem $98,001–$148,000 → 1.2%',     2),
  ('redeem', 'default', 148001, 248000, 0.016, NULL, 0, 'Redeem $148,001–$248,000 → 1.6%',    3),
  ('redeem', 'default', 248001, NULL,   0.02,  NULL, 0, 'Redeem $248,001 或以上 → 2%',         4);

-- 3. Re-insert correct Sales tiers (whole-volume rate)
INSERT INTO commission_rate_tiers (commission_type, staff_group, min_amount, max_amount, rate, bonus_threshold, bonus_amount, description, sort_order) VALUES
  ('sales', 'default', 0,      98000,  0.03,  NULL, 0, 'Sales $98,000 或以下 → 3%',           1),
  ('sales', 'default', 98001,  148000, 0.032, NULL, 0, 'Sales $98,001–$148,000 → 3.2%',      2),
  ('sales', 'default', 148001, 198000, 0.035, NULL, 0, 'Sales $148,001–$198,000 → 3.5%',     3),
  ('sales', 'default', 198001, 248000, 0.038, NULL, 0, 'Sales $198,001–$248,000 → 3.8%',     4),
  ('sales', 'default', 248001, NULL,   0.04,  NULL, 0, 'Sales $248,001 或以上 → 4%',          5);
