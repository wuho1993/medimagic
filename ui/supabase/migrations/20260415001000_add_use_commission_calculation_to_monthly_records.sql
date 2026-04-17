ALTER TABLE public.monthly_commission_records
  ADD COLUMN IF NOT EXISTS use_commission_calculation boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN public.monthly_commission_records.use_commission_calculation IS 'For 包佣包薪 employees, whether this month uses commission calculation instead of the default salary setting';