-- Sales commission (standard tiered)
INSERT INTO commission_rate_tiers (commission_type, staff_group, min_amount, max_amount, rate, bonus_threshold, bonus_amount, description, sort_order) VALUES
  ('sales', 'default', 0,      98000,  0.03,  NULL, 0, '$98,000 or below - 3%',      1),
  ('sales', 'default', 98001,  148000, 0.032, NULL, 0, '$98,001-$148,000 - 3.2%',    2),
  ('sales', 'default', 148001, 198000, 0.035, NULL, 0, '$148,001-$198,000 - 3.5%',   3),
  ('sales', 'default', 198001, 248000, 0.038, NULL, 0, '$198,001-$248,000 - 3.8%',   4),
  ('sales', 'default', 248001, NULL,   0.04,  NULL, 0, '$248,001 or above - 4%',      5);

-- Redeem commission (IFS formula: <98k=1%, 98k-148k=1.2%, 148k-248k=1.6%)
INSERT INTO commission_rate_tiers (commission_type, staff_group, min_amount, max_amount, rate, bonus_threshold, bonus_amount, description, sort_order) VALUES
  ('redeem', 'default', 0,      98000,  0.01,  NULL, 0, '$98,000 or below - 1%',      1),
  ('redeem', 'default', 98001,  148000, 0.012, NULL, 0, '$98,001-$148,000 - 1.2%',    2),
  ('redeem', 'default', 148001, 248000, 0.016, NULL, 0, '$148,001-$248,000 - 1.6%',   3);

-- SGM flat rate
INSERT INTO commission_rate_tiers (commission_type, staff_group, min_amount, max_amount, rate, bonus_threshold, bonus_amount, description, sort_order) VALUES
  ('sgm', 'default', 0, NULL, 0.05, NULL, 0, 'SGM flat rate - 5%', 1);

-- Job commission: no formula stored here, calculated from external system each month
