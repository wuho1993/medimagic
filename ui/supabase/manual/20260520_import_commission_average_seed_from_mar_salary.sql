-- Commission average mapping and seed import generated from commission_average_mapping_review.xlsx
-- Applies mappings for all review rows; imports seed rows only when Status = confirmed and Confirmed Employee Code is present.
-- SF363 Chrissy and SF373 Haley are treated as resigned/inactive and are intentionally excluded from active HRMS seed import.

begin;

insert into public.commission_average_employee_mappings (source_file, source_sheet, source_row, source_code, source_alias, source_name, matched_employee_code, match_status, match_confidence, remark) values
('Mar_SALARY統計2026.xlsx', 'YEAR2', 3, 'SF006', 'KT', 'Cheng Ka Tung', 'SF006', 'confirmed', 100.00, ''),
('Mar_SALARY統計2026.xlsx', 'YEAR2', 5, 'SF025', 'Winnie', 'Wong Chin Wing', 'SF025', 'confirmed', 100.00, ''),
('Mar_SALARY統計2026.xlsx', 'YEAR2', 7, 'SF066', 'Yan', 'WAN LOK SUM', 'SF066', 'confirmed', 100.00, ''),
('Mar_SALARY統計2026.xlsx', 'YEAR2', 9, 'SF102', 'Carol', 'CAROL', 'SF102', 'confirmed', 100.00, ''),
('Mar_SALARY統計2026.xlsx', 'YEAR2', 11, 'SF249', 'May', 'May', 'SF249', 'confirmed', 100.00, ''),
('Mar_SALARY統計2026.xlsx', 'YEAR2', 13, 'SF014', 'Jess', 'Shum  man mei', 'SF014', 'confirmed', 100.00, ''),
('Mar_SALARY統計2026.xlsx', 'YEAR2', 15, 'SF065', 'Chun Chun', 'Chun Chun', 'SF065', 'confirmed', 100.00, 'Eligible days set to 365 by total/daily average and long-service current sheet context.'),
('Mar_SALARY統計2026.xlsx', 'YEAR2', 17, 'SF238', 'Kei', 'Kei', 'SF238', 'confirmed', 100.00, ''),
('Mar_SALARY統計2026.xlsx', 'YEAR2', 19, 'SF247', 'Anna', 'Anna', 'SF247', 'confirmed', 100.00, ''),
('Mar_SALARY統計2026.xlsx', 'YEAR2', 21, 'SF117', 'Wendy', 'Wendy', 'SF117', 'confirmed', 100.00, ''),
('Mar_SALARY統計2026.xlsx', 'YEAR2', 23, 'SF312', 'Ming', 'Ming', 'SF312', 'confirmed', 100.00, 'Ambiguous: also NA-10 Xue Minglan'),
('Mar_SALARY統計2026.xlsx', 'YEAR2', 25, 'SF167', 'Ella', 'Ella', 'SF167', 'confirmed', 100.00, ''),
('Mar_SALARY統計2026.xlsx', 'YEAR2', 27, 'SF363', 'Chrissy', 'Chrissy', '', 'excluded', 0.00, 'Confirmed by user as resigned/inactive; keep historical evidence only and do not create active HRMS profile or import 365 average seed.'),
('Mar_SALARY統計2026.xlsx', 'YEAR2', 29, 'SF373', 'Haley', 'Haley', '', 'excluded', 0.00, 'Confirmed by user as resigned/inactive; keep historical evidence only and do not create active HRMS profile or import 365 average seed.'),
('Mar_SALARY統計2026.xlsx', 'YEAR2', 47, 'SF243', 'Chilly', 'Chilly', 'SF243', 'confirmed', 100.00, ''),
('Mar_SALARY統計2026.xlsx', 'YEAR2', 49, 'SF131', 'JUMBO', 'JUMBO', 'SF189', 'confirmed', 180.00, 'V8/V6 Contract List keeps old SF131 for Jumbo, but V8/V6 SALARY and COMMISSION use SF189; HRMS DB has SF189 JUMBO. Recommended mapping: SF189.'),
('Mar_SALARY統計2026.xlsx', 'YEAR2', 51, 'SF119', 'YAN WONG', 'YAN WONG', 'SF119', 'confirmed', 100.00, ''),
('Mar_SALARY統計2026.xlsx', 'YEAR2', 53, 'SF279', 'Kitty', 'Kitty', 'SF279', 'confirmed', 100.00, ''),
('Mar_SALARY統計2026.xlsx', 'YEAR2', 55, 'SF355', 'Gigi', 'Gigi', 'SF355', 'confirmed', 100.00, ''),
('Mar_SALARY統計2026.xlsx', 'YEAR2', 57, 'SF360', 'Joyce', 'Joyce', 'SF360', 'confirmed', 100.00, ''),
('Mar_SALARY統計2026.xlsx', 'YEAR2', 59, 'SF370', 'Yu', 'Yu', 'NA-05', 'confirmed', 95.00, 'Known duplicate/formal code conflict: HRMS SF370 is Ashley; V6/audit maps Yu to NA-05. Use NA-05 for commission average seed.'),
('Mar_SALARY統計2026.xlsx', 'YEAR2', 83, 'SF170', 'Moon(B)', 'Moon(B)', 'SF170', 'confirmed', 100.00, 'Ambiguous: also SF186 Moon'),
('Mar_SALARY統計2026.xlsx', 'YEAR2', 85, 'SF334', 'May May', 'May May', 'SF334', 'confirmed', 100.00, ''),
('Mar_SALARY統計2026.xlsx', 'YEAR2', 87, 'SF199', '晴', '晴', 'SF199', 'confirmed', 100.00, ''),
('Mar_SALARY統計2026.xlsx', 'YEAR2', 89, 'SF220', 'Pinky', 'Pinky', 'SF220', 'confirmed', 100.00, ''),
('Mar_SALARY統計2026.xlsx', 'YEAR2', 101, 'SF193', '雯雯', '雯雯', 'SF193', 'confirmed', 100.00, ''),
('Mar_SALARY統計2026.xlsx', 'YEAR2', 125, '街霸01', 'Dan Yu', 'Dan wu', 'NA-11', 'confirmed', 90.00, 'V8/V6 SALARY street-promoter Dan Wu row has no formal staff code. HRMS DB has NA-11 Dan Wu. Recommended mapping: NA-11 unless a formal code is later assigned.'),
('Mar_SALARY統計2026.xlsx', 'YEAR2', 127, '街霸02', 'Lily', 'Lily', 'NA-12', 'confirmed', 90.00, 'Confirmed by user direction: street promoter Lily should not collide with SF216; use HRMS NA-12 Lilly unless formal code is later assigned.'),
('Mar_SALARY統計2026.xlsx', 'YEAR2', 129, '街霸03', 'Wu Anru', 'Wu Anru', 'NA-13', 'confirmed', 180.00, 'V8/V6 SALARY street-promoter Wu Anru row has no formal staff code. HRMS DB has NA-13 Wu Anru. Recommended mapping: NA-13 unless a formal code is later assigned.')
on conflict (source_file, source_sheet, source_row) do update set
  source_code = excluded.source_code,
  source_alias = excluded.source_alias,
  source_name = excluded.source_name,
  matched_employee_code = excluded.matched_employee_code,
  match_status = excluded.match_status,
  match_confidence = excluded.match_confidence,
  remark = excluded.remark,
  updated_at = now();

insert into public.employee_commission_average_seed (employee_code, period_start, period_end, total_commission, eligible_days, daily_average_commission, source_file, source_row) values
('SF006', '2025-04-01', '2026-03-31', 49220.45, 365.00, 134.8506, 'Mar_SALARY統計2026.xlsx', 3),
('SF025', '2025-04-01', '2026-03-31', 125843.40, 365.00, 344.7764, 'Mar_SALARY統計2026.xlsx', 5),
('SF066', '2025-04-01', '2026-03-31', 38782.24, 365.00, 106.2527, 'Mar_SALARY統計2026.xlsx', 7),
('SF102', '2025-04-01', '2026-03-31', 200610.81, 365.00, 549.6187, 'Mar_SALARY統計2026.xlsx', 9),
('SF249', '2025-04-01', '2026-03-31', 180259.35, 365.00, 493.8612, 'Mar_SALARY統計2026.xlsx', 11),
('SF014', '2025-04-01', '2026-03-31', 191281.01, 365.00, 524.0576, 'Mar_SALARY統計2026.xlsx', 13),
('SF065', '2025-04-01', '2026-03-31', 163195.30, 365.00, 447.1104, 'Mar_SALARY統計2026.xlsx', 15),
('SF238', '2025-04-01', '2026-03-31', 140225.77, 365.00, 384.1802, 'Mar_SALARY統計2026.xlsx', 17),
('SF247', '2025-04-01', '2026-03-31', 196200.00, 365.00, 537.5342, 'Mar_SALARY統計2026.xlsx', 19),
('SF117', '2025-04-01', '2026-03-31', 137147.58, 365.00, 375.7468, 'Mar_SALARY統計2026.xlsx', 21),
('SF312', '2025-04-01', '2026-03-31', 115970.09, 365.00, 317.7263, 'Mar_SALARY統計2026.xlsx', 23),
('SF167', '2025-04-01', '2026-03-31', 248708.99, 365.00, 681.3945, 'Mar_SALARY統計2026.xlsx', 25),
('SF243', '2025-04-01', '2026-03-31', 110017.79, 365.00, 301.4186, 'Mar_SALARY統計2026.xlsx', 47),
('SF189', '2025-04-01', '2026-03-31', 88080.91, 365.00, 241.3176, 'Mar_SALARY統計2026.xlsx', 49),
('SF119', '2025-04-01', '2026-03-31', 191396.88, 365.00, 524.3750, 'Mar_SALARY統計2026.xlsx', 51),
('SF279', '2025-04-01', '2026-03-31', 192866.48, 365.00, 528.4013, 'Mar_SALARY統計2026.xlsx', 53),
('SF355', '2025-04-01', '2026-03-31', 142319.39, 292.00, 487.3952, 'Mar_SALARY統計2026.xlsx', 55),
('SF360', '2025-04-01', '2026-03-31', 85516.53, 272.00, 314.3990, 'Mar_SALARY統計2026.xlsx', 57),
('NA-05', '2025-04-01', '2026-03-31', 10000.00, 365.00, 333.3333, 'Mar_SALARY統計2026.xlsx', 59),
('SF170', '2025-04-01', '2026-03-31', 13611.95, 365.00, 37.2930, 'Mar_SALARY統計2026.xlsx', 83),
('SF334', '2025-04-01', '2026-03-31', 171074.47, 365.00, 468.6972, 'Mar_SALARY統計2026.xlsx', 85),
('SF199', '2025-04-01', '2026-03-31', 206094.95, 365.00, 564.6437, 'Mar_SALARY統計2026.xlsx', 87),
('SF220', '2025-04-01', '2026-03-31', 168903.05, 365.00, 462.7481, 'Mar_SALARY統計2026.xlsx', 89),
('SF193', '2025-04-01', '2026-03-31', 216896.32, 365.00, 594.2365, 'Mar_SALARY統計2026.xlsx', 101),
('NA-11', '2025-04-01', '2026-03-31', 74790.72, 365.00, 204.9061, 'Mar_SALARY統計2026.xlsx', 125),
('NA-12', '2025-04-01', '2026-03-31', 51581.95, 365.00, 150.8244, 'Mar_SALARY統計2026.xlsx', 127),
('NA-13', '2025-04-01', '2026-03-31', 43350.00, 365.00, 159.3750, 'Mar_SALARY統計2026.xlsx', 129)
on conflict (employee_code, period_start, period_end, source_file, source_row) do update set
  total_commission = excluded.total_commission,
  eligible_days = excluded.eligible_days,
  daily_average_commission = excluded.daily_average_commission;

commit;
