-- Commission Rate Tiers
-- Stores tiered/bracket commission rates for redeem, sales, SGM
-- Redeem uses tiered rates from workbook: IFS(V<98000,V*1%, AND(V>98001,V<148000),V*1.2%, AND(V>148001,V<248000),V*1.6%)
-- SGM = flat 5%, Sales = flat 3%

CREATE TABLE IF NOT EXISTS commission_rate_tiers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  commission_type text NOT NULL CHECK (commission_type IN ('redeem', 'sales', 'sgm')),
  min_amount numeric NOT NULL DEFAULT 0,
  max_amount numeric,  -- NULL = no upper limit
  rate numeric NOT NULL CHECK (rate >= 0 AND rate <= 1),
  description text,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_commission_rate_tiers_type ON commission_rate_tiers (commission_type, sort_order);

-- Redeem tiered rates (whole-volume rate, not marginal)
INSERT INTO commission_rate_tiers (commission_type, min_amount, max_amount, rate, description, sort_order) VALUES
  ('redeem', 0,      98000,  0.01,  'Redeem < $98,000 → 1%',              1),
  ('redeem', 98001,  148000, 0.012, 'Redeem $98,001–$148,000 → 1.2%',     2),
  ('redeem', 148001, 248000, 0.016, 'Redeem $148,001–$248,000 → 1.6%',    3);

-- SGM flat rate
INSERT INTO commission_rate_tiers (commission_type, min_amount, max_amount, rate, description, sort_order) VALUES
  ('sgm', 0, NULL, 0.05, 'SGM flat rate → 5%', 1);

-- Sales flat rate
INSERT INTO commission_rate_tiers (commission_type, min_amount, max_amount, rate, description, sort_order) VALUES
  ('sales', 0, NULL, 0.03, 'Sales flat rate → 3%', 1);
