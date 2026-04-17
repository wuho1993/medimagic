ALTER TABLE public.monthly_commission_records
  ADD COLUMN IF NOT EXISTS shop_target_amount numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS shop_actual_sales_amount numeric NOT NULL DEFAULT 0;

ALTER TABLE public.monthly_commission_records
  DROP CONSTRAINT IF EXISTS monthly_commission_records_shop_target_amount_check,
  DROP CONSTRAINT IF EXISTS monthly_commission_records_shop_actual_sales_amount_check;

ALTER TABLE public.monthly_commission_records
  ADD CONSTRAINT monthly_commission_records_shop_target_amount_check CHECK (shop_target_amount >= 0),
  ADD CONSTRAINT monthly_commission_records_shop_actual_sales_amount_check CHECK (shop_actual_sales_amount >= 0);

COMMENT ON COLUMN public.monthly_commission_records.shop_target_amount IS 'Monthly sales target amount entered for employees with shop bonus enabled';
COMMENT ON COLUMN public.monthly_commission_records.shop_actual_sales_amount IS 'Actual monthly sales amount entered for employees with shop bonus enabled';