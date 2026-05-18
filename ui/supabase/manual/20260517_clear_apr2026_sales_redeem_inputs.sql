-- Clear unconfirmed April 2026 sales/redeem/commission inputs.
-- This keeps employee profiles, salary rates, package settings, MPF settings, worked days/hours,
-- allowances, manual bonuses/deductions, shop bonus inputs, street promoter and telesales inputs intact.
-- Scope is only year_month = '2026-04' because the current review/import work is April 2026 V6.

update public.monthly_commission_records
set
  redeem_volume = 0,
  sales_volume = 0,
  sales_amount_total = 0,
  sales_amount_commission = 0,
  job_amount = 0,
  sgm_volume = 0,
  redeem_commission = 0,
  sales_commission = 0,
  sgm_commission = 0,
  sales_bonus = 0,
  payroll_bonus = 0,
  total_commission = 0,
  updated_at = timezone('utc', now())
where year_month = '2026-04';

select count(*) as remaining_apr2026_rows_with_sales_redeem_inputs
from public.monthly_commission_records
where year_month = '2026-04'
  and (
    coalesce(redeem_volume, 0) <> 0
    or coalesce(sales_volume, 0) <> 0
    or coalesce(sales_amount_total, 0) <> 0
    or coalesce(sales_amount_commission, 0) <> 0
    or coalesce(job_amount, 0) <> 0
    or coalesce(sgm_volume, 0) <> 0
    or coalesce(redeem_commission, 0) <> 0
    or coalesce(sales_commission, 0) <> 0
    or coalesce(sgm_commission, 0) <> 0
    or coalesce(sales_bonus, 0) <> 0
    or coalesce(payroll_bonus, 0) <> 0
    or coalesce(total_commission, 0) <> 0
  );
