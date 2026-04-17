CREATE TABLE IF NOT EXISTS public.monthly_commission_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  year_month text NOT NULL,
  redeem_volume numeric NOT NULL DEFAULT 0,
  sales_volume numeric NOT NULL DEFAULT 0,
  job_amount numeric NOT NULL DEFAULT 0,
  sgm_volume numeric NOT NULL DEFAULT 0,
  redeem_commission numeric NOT NULL DEFAULT 0,
  sales_commission numeric NOT NULL DEFAULT 0,
  sgm_commission numeric NOT NULL DEFAULT 0,
  sales_bonus numeric NOT NULL DEFAULT 0,
  total_commission numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  UNIQUE(employee_id, year_month)
);

ALTER TABLE public.monthly_commission_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read commission records"
  ON public.monthly_commission_records FOR SELECT TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert commission records"
  ON public.monthly_commission_records FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update commission records"
  ON public.monthly_commission_records FOR UPDATE TO authenticated
  USING (auth.uid() IS NOT NULL);
