ALTER TABLE public.monthly_commission_records
  ADD COLUMN IF NOT EXISTS street_promoter_headcount integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS street_promoter_commission_amount numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS telesales_headcount integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS telesales_commission_amount numeric NOT NULL DEFAULT 0;

ALTER TABLE public.monthly_commission_records
  DROP CONSTRAINT IF EXISTS monthly_commission_records_street_promoter_headcount_check,
  DROP CONSTRAINT IF EXISTS monthly_commission_records_street_promoter_commission_amount_check,
  DROP CONSTRAINT IF EXISTS monthly_commission_records_telesales_headcount_check,
  DROP CONSTRAINT IF EXISTS monthly_commission_records_telesales_commission_amount_check;

ALTER TABLE public.monthly_commission_records
  ADD CONSTRAINT monthly_commission_records_street_promoter_headcount_check CHECK (street_promoter_headcount >= 0),
  ADD CONSTRAINT monthly_commission_records_street_promoter_commission_amount_check CHECK (street_promoter_commission_amount >= 0),
  ADD CONSTRAINT monthly_commission_records_telesales_headcount_check CHECK (telesales_headcount >= 0),
  ADD CONSTRAINT monthly_commission_records_telesales_commission_amount_check CHECK (telesales_commission_amount >= 0);

COMMENT ON COLUMN public.monthly_commission_records.street_promoter_headcount IS 'Monthly street promoter headcount input';
COMMENT ON COLUMN public.monthly_commission_records.street_promoter_commission_amount IS 'Calculated street promoter commission snapshot for the month';
COMMENT ON COLUMN public.monthly_commission_records.telesales_headcount IS 'Monthly telesales headcount input';
COMMENT ON COLUMN public.monthly_commission_records.telesales_commission_amount IS 'Calculated telesales commission snapshot for the month';