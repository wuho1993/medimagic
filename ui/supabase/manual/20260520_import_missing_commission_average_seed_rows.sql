-- Backfill missing Mar_SALARY統計2026.xlsx YEAR2 commission average mappings and seed rows.
-- Generated after finding active employees like SF011 Sylvia in the workbook but missing from the first seed import.

begin;

insert into public.commission_average_employee_mappings (source_file, source_sheet, source_row, source_code, source_alias, source_name, matched_employee_code, match_status, match_confidence, remark) values
('Mar_SALARY統計2026.xlsx', 'YEAR2', 27, 'SF363', 'Chrissy', 'Chrissy', '', 'excluded', 0.00, 'Confirmed resigned/inactive or no active HRMS profile; keep historical evidence only and do not import 365 average seed.'),
('Mar_SALARY統計2026.xlsx', 'YEAR2', 29, 'SF373', 'Haley', 'Haley', '', 'excluded', 0.00, 'Confirmed resigned/inactive or no active HRMS profile; keep historical evidence only and do not import 365 average seed.'),
('Mar_SALARY統計2026.xlsx', 'YEAR2', 32, 'SF164', 'LY', 'Yeung Lok Yi ', 'SF164', 'confirmed', 100.00, 'Confirmed active HRMS employee; imported from missing Mar Salary 365 average rows.'),
('Mar_SALARY統計2026.xlsx', 'YEAR2', 34, 'SF144', 'Wing', 'Wing', 'SF144', 'confirmed', 100.00, 'Confirmed active HRMS employee; imported from missing Mar Salary 365 average rows.'),
('Mar_SALARY統計2026.xlsx', 'YEAR2', 36, 'SF196', 'Ting', 'Ting', 'SF196', 'confirmed', 100.00, 'Confirmed active HRMS employee; imported from missing Mar Salary 365 average rows.'),
('Mar_SALARY統計2026.xlsx', 'YEAR2', 38, 'SF211', 'Ling', 'Ling', 'SF211', 'confirmed', 100.00, 'Confirmed active HRMS employee; imported from missing Mar Salary 365 average rows.'),
('Mar_SALARY統計2026.xlsx', 'YEAR2', 40, 'SF154', 'Lanke', 'Lanke', 'SF154', 'confirmed', 100.00, 'Confirmed active HRMS employee; imported from missing Mar Salary 365 average rows.'),
('Mar_SALARY統計2026.xlsx', 'YEAR2', 42, 'SF190', 'Dorcas', 'Dorcas', 'SF190', 'confirmed', 100.00, 'Confirmed active HRMS employee; imported from missing Mar Salary 365 average rows.'),
('Mar_SALARY統計2026.xlsx', 'YEAR2', 44, 'SF378', '英', '英', 'SF378', 'confirmed', 100.00, 'Confirmed active HRMS employee; imported from missing Mar Salary 365 average rows.'),
('Mar_SALARY統計2026.xlsx', 'YEAR2', 62, 'SF146', 'Emily', 'Emily', 'SF146', 'confirmed', 100.00, 'Confirmed active HRMS employee; imported from missing Mar Salary 365 average rows.'),
('Mar_SALARY統計2026.xlsx', 'YEAR2', 64, 'SF145', 'Alice Leung', 'Alice Leung', 'SF145', 'confirmed', 100.00, 'Confirmed active HRMS employee; imported from missing Mar Salary 365 average rows.'),
('Mar_SALARY統計2026.xlsx', 'YEAR2', 66, 'SF265', 'Sugar', 'Sugar', 'SF265', 'confirmed', 100.00, 'Confirmed active HRMS employee; imported from missing Mar Salary 365 average rows.'),
('Mar_SALARY統計2026.xlsx', 'YEAR2', 68, 'SF259', 'Kiki', 'Kiki(PT)', '', 'excluded', 0.00, 'Confirmed resigned/inactive or no active HRMS profile; keep historical evidence only and do not import 365 average seed.'),
('Mar_SALARY統計2026.xlsx', 'YEAR2', 72, 'SF206', 'Water', 'Water(PT)', 'SF206', 'confirmed', 100.00, 'Confirmed active HRMS employee; imported from missing Mar Salary 365 average rows.'),
('Mar_SALARY統計2026.xlsx', 'YEAR2', 74, 'SF272', 'Jojo', 'JO JO', 'SF272', 'confirmed', 100.00, 'Confirmed active HRMS employee; imported from missing Mar Salary 365 average rows.'),
('Mar_SALARY統計2026.xlsx', 'YEAR2', 76, 'SF277', 'Joey', 'Joey', 'SF277', 'confirmed', 100.00, 'Confirmed active HRMS employee; imported from missing Mar Salary 365 average rows.'),
('Mar_SALARY統計2026.xlsx', 'YEAR2', 78, 'SF322', 'Icy', 'Icy', 'SF322', 'confirmed', 100.00, 'Confirmed active HRMS employee; imported from missing Mar Salary 365 average rows.'),
('Mar_SALARY統計2026.xlsx', 'YEAR2', 80, 'SF134', 'Jacqueline', 'Jacqueline', 'SF134', 'confirmed', 100.00, 'Confirmed active HRMS employee; imported from missing Mar Salary 365 average rows.'),
('Mar_SALARY統計2026.xlsx', 'YEAR2', 92, 'SF241', 'Rachel', 'Rachel', 'SF241', 'confirmed', 100.00, 'Confirmed active HRMS employee; imported from missing Mar Salary 365 average rows.'),
('Mar_SALARY統計2026.xlsx', 'YEAR2', 94, 'SF358', 'Maggie', 'Maggie', 'SF358', 'confirmed', 100.00, 'Confirmed active HRMS employee; imported from missing Mar Salary 365 average rows.'),
('Mar_SALARY統計2026.xlsx', 'YEAR2', 98, 'SF216', 'Lilly', 'Lilly', 'SF216', 'confirmed', 100.00, 'Confirmed active HRMS employee; imported from missing Mar Salary 365 average rows.'),
('Mar_SALARY統計2026.xlsx', 'YEAR2', 104, 'SF173', 'Karrie', 'Karrie', 'SF173', 'confirmed', 100.00, 'Confirmed active HRMS employee; imported from missing Mar Salary 365 average rows.'),
('Mar_SALARY統計2026.xlsx', 'YEAR2', 106, 'SF137', 'Yena', 'Yena', 'SF137', 'confirmed', 100.00, 'Confirmed active HRMS employee; imported from missing Mar Salary 365 average rows.'),
('Mar_SALARY統計2026.xlsx', 'YEAR2', 108, 'SF186', 'Moon', 'Moon', 'SF186', 'confirmed', 100.00, 'Confirmed active HRMS employee; imported from missing Mar Salary 365 average rows.'),
('Mar_SALARY統計2026.xlsx', 'YEAR2', 110, 'SF185', 'Iris', 'Iris', 'SF185', 'confirmed', 100.00, 'Confirmed active HRMS employee; imported from missing Mar Salary 365 average rows.'),
('Mar_SALARY統計2026.xlsx', 'YEAR2', 112, 'SF172', 'YY', 'YY', 'SF172', 'confirmed', 100.00, 'Confirmed active HRMS employee; imported from missing Mar Salary 365 average rows.'),
('Mar_SALARY統計2026.xlsx', 'YEAR2', 114, 'SF335', 'Zoe', 'Zoe', 'SF335', 'confirmed', 100.00, 'Confirmed active HRMS employee; imported from missing Mar Salary 365 average rows.'),
('Mar_SALARY統計2026.xlsx', 'YEAR2', 116, 'SF129', 'Jackie', 'Jackie', 'SF129', 'confirmed', 100.00, 'Confirmed active HRMS employee; imported from missing Mar Salary 365 average rows.'),
('Mar_SALARY統計2026.xlsx', 'YEAR2', 118, 'SF323', 'Candy (Con)', 'Candy', 'SF323', 'confirmed', 100.00, 'Confirmed active HRMS employee; imported from missing Mar Salary 365 average rows.'),
('Mar_SALARY統計2026.xlsx', 'YEAR2', 120, 'SF011', 'Sylvia', 'Lee Sui Sze Sylvia', 'SF011', 'confirmed', 100.00, 'Confirmed active HRMS employee; imported from missing Mar Salary 365 average rows.'),
('Mar_SALARY統計2026.xlsx', 'YEAR2', 122, 'SF375', 'Alferd', 'Alferd', 'SF375', 'confirmed', 100.00, 'Confirmed active HRMS employee; imported from missing Mar Salary 365 average rows.')
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
('SF164', '2025-04-01', '2026-03-31', 69487.12, 365.00, 190.3757, 'Mar_SALARY統計2026.xlsx', 32),
('SF144', '2025-04-01', '2026-03-31', 201135.82, 365.00, 551.0570, 'Mar_SALARY統計2026.xlsx', 34),
('SF196', '2025-04-01', '2026-03-31', 177797.37, 365.00, 487.1161, 'Mar_SALARY統計2026.xlsx', 36),
('SF211', '2025-04-01', '2026-03-31', 69774.10, 365.00, 191.1619, 'Mar_SALARY統計2026.xlsx', 38),
('SF154', '2025-04-01', '2026-03-31', 137950.75, 365.00, 377.9472, 'Mar_SALARY統計2026.xlsx', 40),
('SF190', '2025-04-01', '2026-03-31', 631187.86, 365.00, 1729.2818, 'Mar_SALARY統計2026.xlsx', 42),
('SF378', '2025-04-01', '2026-03-31', 18496.76, 28.00, 660.5986, 'Mar_SALARY統計2026.xlsx', 44),
('SF146', '2025-04-01', '2026-03-31', 149323.02, 365.00, 409.1042, 'Mar_SALARY統計2026.xlsx', 62),
('SF145', '2025-04-01', '2026-03-31', 237008.59, 365.00, 649.3386, 'Mar_SALARY統計2026.xlsx', 64),
('SF265', '2025-04-01', '2026-03-31', 198037.93, 365.00, 542.5697, 'Mar_SALARY統計2026.xlsx', 66),
('SF206', '2025-04-01', '2026-03-31', 93275.76, 365.00, 255.5500, 'Mar_SALARY統計2026.xlsx', 72),
('SF272', '2025-04-01', '2026-03-31', 141033.13, 365.00, 386.3921, 'Mar_SALARY統計2026.xlsx', 74),
('SF277', '2025-04-01', '2026-03-31', 102327.80, 365.00, 280.3501, 'Mar_SALARY統計2026.xlsx', 76),
('SF322', '2025-04-01', '2026-03-31', 243679.16, 365.00, 667.6141, 'Mar_SALARY統計2026.xlsx', 78),
('SF134', '2025-04-01', '2026-03-31', 346698.94, 365.00, 949.8601, 'Mar_SALARY統計2026.xlsx', 80),
('SF241', '2025-04-01', '2026-03-31', 189911.58, 365.00, 520.3057, 'Mar_SALARY統計2026.xlsx', 92),
('SF358', '2025-04-01', '2026-03-31', 128075.88, 365.00, 350.8928, 'Mar_SALARY統計2026.xlsx', 94),
('SF216', '2025-04-01', '2026-03-31', 46004.75, 365.00, 126.0404, 'Mar_SALARY統計2026.xlsx', 98),
('SF173', '2025-04-01', '2026-03-31', 242201.46, 365.00, 663.5656, 'Mar_SALARY統計2026.xlsx', 104),
('SF137', '2025-04-01', '2026-03-31', 535095.12, 365.00, 1466.0140, 'Mar_SALARY統計2026.xlsx', 106),
('SF186', '2025-04-01', '2026-03-31', 259037.71, 365.00, 709.6924, 'Mar_SALARY統計2026.xlsx', 108),
('SF185', '2025-04-01', '2026-03-31', 263555.49, 365.00, 722.0698, 'Mar_SALARY統計2026.xlsx', 110),
('SF172', '2025-04-01', '2026-03-31', 149851.67, 365.00, 410.5525, 'Mar_SALARY統計2026.xlsx', 112),
('SF335', '2025-04-01', '2026-03-31', 217939.89, 365.00, 597.0956, 'Mar_SALARY統計2026.xlsx', 114),
('SF129', '2025-04-01', '2026-03-31', 358626.40, 365.00, 982.5381, 'Mar_SALARY統計2026.xlsx', 116),
('SF323', '2025-04-01', '2026-03-31', 227137.76, 365.00, 622.2952, 'Mar_SALARY統計2026.xlsx', 118),
('SF011', '2025-04-01', '2026-03-31', 615627.85, 365.00, 1686.6516, 'Mar_SALARY統計2026.xlsx', 120),
('SF375', '2025-04-01', '2026-03-31', 28676.73, 85.00, 337.3733, 'Mar_SALARY統計2026.xlsx', 122)
on conflict (employee_code, period_start, period_end, source_file, source_row) do update set
  total_commission = excluded.total_commission,
  eligible_days = excluded.eligible_days,
  daily_average_commission = excluded.daily_average_commission;

commit;
