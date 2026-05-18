-- Import confirmed April 2026 V6 commission records.
-- Source: /Users/joecheung/Desktop/Medi Magic 2026/04-2026_MM(FY)_V6.xlsx, sheet COMMISSION.
-- Only rows with clear standard rates are included:
-- Redeem 1%, Sales 3%, SGM 5%, and Total equals Job + Redeem commission + Sales commission + SGM commission.
-- Rows with zero commission despite source volume, or mismatched totals, are intentionally excluded for manual confirmation.

with source_rows (
  employee_code,
  redeem_volume,
  sales_volume,
  job_amount,
  sgm_volume,
  redeem_commission,
  sales_commission,
  sgm_commission,
  total_commission
) as (
  values
    ('SF006', 46391.1, 23218, 2089, 0, 463.91, 696.54, 0, 3249.45),
    ('SF249', 131555.6, 126057.4, 4772, 0, 1315.56, 3781.72, 0, 9869.28),
    ('SF025', 69748.2, 36186, 2589, 0, 697.48, 1085.58, 0, 4372.06),
    ('SF066', 125962.7, 93417.9, 6816, 0, 1259.63, 2802.54, 0, 10878.16),
    ('SF102', 114683.8, 47437.4, 4240, 0, 1146.84, 1423.12, 0, 6809.96),
    ('SF014', 45241.7, 5583, 9590, 0, 452.42, 167.49, 0, 10209.91),
    ('SF065', 69381.7, 83509, 10145, 0, 693.82, 2505.27, 0, 13344.09),
    ('SF247', 86080.3, 38141, 8056, 0, 860.8, 1144.23, 0, 10061.03),
    ('SF117', 118236.2, 83867.8, 6452, 0, 1182.36, 2516.03, 0, 10150.4),
    ('SF189', 66113.5, 95646.4, 3907, 0, 661.14, 2869.39, 0, 7437.53),
    ('SF119', 96766.5, 121853.1, 5593, 0, 967.67, 3655.59, 0, 10216.26),
    ('SF279', 68817, 27068.1, 10535, 0, 688.17, 812.04, 0, 12035.21),
    ('SF360', 71297.6, 17646.4, 4375, 0, 712.98, 529.39, 0, 5617.37),
    ('SF355', 37071.7, 21728.4, 4714, 0, 370.72, 651.85, 0, 5736.57),
    ('SF356', 72081, 18540, 4602, 0, 720.81, 556.2, 0, 5879.01),
    ('SF243', 105769.9, 109830, 5957, 0, 1057.7, 3294.9, 0, 10309.6),
    ('SF164', 154202.9, 328265.2, 8256, 0, 1542.03, 9847.96, 0, 19645.99),
    ('SF144', 133567.8, 146775, 8938, 0, 1335.68, 4403.25, 0, 14676.93),
    ('SF378', 13973.2, 7907.4, 4260, 0, 139.73, 237.22, 0, 4636.95),
    ('SF272', 18581.5, 38335.2, 3900, 0, 185.82, 1150.06, 0, 5235.87),
    ('SF265', 115604.5, 202321, 5310, 0, 1156.05, 6069.63, 0, 12535.68),
    ('SF145', 173383.2, 321554.6, 7602, 0, 1733.83, 9646.64, 0, 18982.47),
    ('SF146', 99988.1, 158228, 5890, 0, 999.88, 4746.84, 0, 11636.72),
    ('SF259', 5078.2, 0, 950, 0, 50.78, 0, 0, 1000.78),
    ('SF206', 0, 750, 0, 0, 0, 22.5, 0, 22.5),
    ('SF277', 87820, 94742.3, 4552, 0, 878.2, 2842.27, 0, 8272.47),
    ('SF322', 170419, 141433.6, 9847, 0, 1704.19, 4243.01, 0, 15794.2),
    ('SF193', 77841.4, 95785.2, 6129, 0, 778.41, 2873.56, 0, 9780.97),
    ('SF312', 68746.7, 60141.4, 3072, 0, 687.47, 1804.24, 0, 5563.71),
    ('SF238', 39695.4, 26778, 11205, 0, 396.95, 803.34, 0, 12405.29),
    ('SF377', 30521.2, 12983.2, 9545, 0, 305.21, 389.5, 0, 10239.71),
    ('SF382', 1697, 569.6, 95, 0, 16.97, 17.09, 0, 129.06),
    ('SF220', 64006.5, 11171.2, 5199, 0, 640.07, 335.14, 0, 6174.2),
    ('SF167', 0, 132071.6, 0, 0, 0, 3962.15, 0, 3962.15),
    ('SF335', 0, 249801.2, 0, 0, 0, 7494.04, 0, 7494.04)
), resolved as (
  select
    e.id as employee_id,
    s.*
  from source_rows s
  join public.employees e on e.employee_code = s.employee_code
)
insert into public.monthly_commission_records (
  employee_id,
  year_month,
  redeem_volume,
  sales_volume,
  job_amount,
  sgm_volume,
  redeem_commission,
  sales_commission,
  sgm_commission,
  total_commission,
  updated_at
)
select
  employee_id,
  '2026-04',
  redeem_volume,
  sales_volume,
  job_amount,
  sgm_volume,
  redeem_commission,
  sales_commission,
  sgm_commission,
  total_commission,
  timezone('utc', now())
from resolved
on conflict (employee_id, year_month) do update set
  redeem_volume = excluded.redeem_volume,
  sales_volume = excluded.sales_volume,
  job_amount = excluded.job_amount,
  sgm_volume = excluded.sgm_volume,
  redeem_commission = excluded.redeem_commission,
  sales_commission = excluded.sales_commission,
  sgm_commission = excluded.sgm_commission,
  total_commission = excluded.total_commission,
  updated_at = excluded.updated_at;

-- Check source employee codes that were not found in HRMS.
with source_codes(employee_code) as (
  values
    ('SF006'), ('SF249'), ('SF025'), ('SF066'), ('SF102'), ('SF014'), ('SF065'), ('SF247'), ('SF117'), ('SF189'),
    ('SF119'), ('SF279'), ('SF360'), ('SF355'), ('SF356'), ('SF243'), ('SF164'), ('SF144'), ('SF378'), ('SF272'),
    ('SF265'), ('SF145'), ('SF146'), ('SF259'), ('SF206'), ('SF277'), ('SF322'), ('SF193'), ('SF312'), ('SF238'),
    ('SF377'), ('SF382'), ('SF220'), ('SF167'), ('SF335')
)
select source_codes.employee_code as missing_employee_code
from source_codes
left join public.employees e on e.employee_code = source_codes.employee_code
where e.id is null
order by source_codes.employee_code;
