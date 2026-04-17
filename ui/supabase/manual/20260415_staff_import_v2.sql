-- =============================================================
-- Staff Import v2 from 員工資料.xlsx
-- Generated: 2026-04-15
-- Active: 75 employees, Resigned: 30 employees
-- Overlap: SF265, SF266 (active takes priority)
-- Total unique: 103 employees
-- =============================================================

BEGIN;

-- =============================================================
-- 1. Create new positions not yet in DB
-- =============================================================
INSERT INTO positions (code, name_zh, name_en) VALUES
  ('TRAINER', '培訓師', 'Trainer'),
  ('SHOP_MANAGER', '店長', 'Shop Manager'),
  ('TELESALES', '電話銷售', 'Telesales'),
  ('ACCOUNTING_CLERK', '會計文員', 'Accounting Clerk'),
  ('BODY_CONSULTANT', '身體顧問', 'Body Consultant')
ON CONFLICT (code) DO NOTHING;

-- =============================================================
-- 2. Insert active employees (75)
-- =============================================================
-- company_type defaults to 'ASA', will be updated when salary data is provided
-- gender defaults to 'female' (beauty industry), can be corrected later
-- employment_type defaults to '全職'

INSERT INTO employees (
  employee_code, name_zh, name_en, alias, gender, identity_number, date_of_birth,
  phone, address, company_type, employment_type, employment_status,
  hire_date, branch_id, branch_code, position_id
) VALUES
-- Row 2: SF006 鄭家彤 (KT) - MK/Senior Beautician
('SF006', '鄭家彤', 'Cheng Ka Tung', 'KT', 'female', 'Y270111A', '1992-09-24',
 NULL, '新界大埔大埔中心18座15樓H室', 'ASA', '全職', 'active',
 '2016-12-12',
 (SELECT id FROM branches WHERE code = 'MKTOP'), 'MKTOP',
 (SELECT id FROM positions WHERE code = 'SENIOR_BEAUTICIAN')),

-- Row 3: SF011 李瑞斯 (Sylvia) - MK/Sales Manager
('SF011', '李瑞斯', 'Lee Sui Sze Sylvia', 'Sylvia', 'female', 'C672456(4)', '1971-12-24',
 NULL, 'Flat C,31/F,Tower2, One East Coast, 1 Lei Yue Mun Path, Yau Tong, Kowloon,HK', 'ASA', '全職', 'active',
 '2016-12-19',
 (SELECT id FROM branches WHERE code = 'MKTOP'), 'MKTOP',
 (SELECT id FROM positions WHERE code = 'SALES_MANAGER')),

-- Row 4: SF014 沈雯美 (Jess) - MK/Massagist
('SF014', '沈雯美', 'Shum Man Mei', 'Jess', 'female', 'K564713(4)', '1957-02-15',
 NULL, NULL, 'ASA', '全職', 'active',
 '2017-02-03',
 (SELECT id FROM branches WHERE code = 'MKTOP'), 'MKTOP',
 (SELECT id FROM positions WHERE code = 'MASSAGIST')),

-- Row 5: SF025 黃芊銢 (Winnie) - MK/Senior Beautician
('SF025', '黃芊銢', 'Wong Chin Wing', 'Winnie', 'female', 'R441938(2)', '1989-03-20',
 '98645403', '沙田康林苑景林閣2307室', 'ASA', '全職', 'active',
 '2017-12-01',
 (SELECT id FROM branches WHERE code = 'MKTOP'), 'MKTOP',
 (SELECT id FROM positions WHERE code = 'SENIOR_BEAUTICIAN')),

-- Row 6: SF164 楊樂兒 (Lok Yi) - TM/Beautician
('SF164', '楊樂兒', 'Yeung Lok Yi', 'Lok Yi', 'female', 'Y289319(1)', '1992-06-23',
 '62712555', 'RM1801,YAT SANG HOUSE, SIU HIN COURT, TUEN MUN', 'ASA', '全職', 'active',
 '2017-12-01',
 (SELECT id FROM branches WHERE code = 'TM'), 'TM',
 (SELECT id FROM positions WHERE code = 'BEAUTICIAN')),

-- Row 7: SF065 班秀珍 (珍珍) - MK/Massagist
('SF065', '班秀珍', 'Ban Xiuzhen', '珍珍', 'female', 'M649553(8)', '1968-01-14',
 '55411189', '九龍城城南道68號2樓F室', 'ASA', '全職', 'active',
 '2019-05-03',
 (SELECT id FROM branches WHERE code = 'MKTOP'), 'MKTOP',
 (SELECT id FROM positions WHERE code = 'MASSAGIST')),

-- Row 8: SF066 溫樂心 (Yan) - MK/Beautician
('SF066', '溫樂心', 'Wan Lok Sum', 'Yan', 'female', 'P514901(4)', '1989-07-23',
 '64053998', '九龍石硤尾邨23座1302室', 'ASA', '全職', 'active',
 '2019-07-15',
 (SELECT id FROM branches WHERE code = 'MKTOP'), 'MKTOP',
 (SELECT id FROM positions WHERE code = 'BEAUTICIAN')),

-- Row 9: SF342 楊美美 (May 姐) - CWB (no position)
('SF342', '楊美美', 'Yeung May May', 'May 姐', 'female', 'C274465(A)', '1956-09-25',
 '98628843', '荃灣大窩口邨富德樓1樓13室', 'ASA', '全職', 'active',
 '2019-11-11',
 (SELECT id FROM branches WHERE code = 'CWB'), 'CWB',
 NULL),

-- Row 10: SF068 焦麗萍 (Canice) - Office/Receptionist
('SF068', '焦麗萍', 'Chiu Lai Ping', 'Canice', 'female', 'Y021950(7)', '1989-03-20',
 '67316009', '富亨邨亨榮樓1403室', 'ASA', '全職', 'active',
 '2020-07-13',
 (SELECT id FROM branches WHERE code = 'OFFICE'), 'OFFICE',
 (SELECT id FROM positions WHERE code = 'RECEPTIONIST')),

-- Row 11: SF102 溫婉華 (Carol) - MK/Beautician
('SF102', '溫婉華', 'Wan Yuen Wa', 'Carol', 'female', 'V112473(0)', '1989-08-22',
 '63901341', 'Flat D, 17/F, Tower One, Twin Peaks, TKO', 'ASA', '全職', 'active',
 '2020-09-07',
 (SELECT id FROM branches WHERE code = 'MKTOP'), 'MKTOP',
 (SELECT id FROM positions WHERE code = 'BEAUTICIAN')),

-- Row 12: SF117 張穎詩 (Wendy) - MK/Beautician
('SF117', '張穎詩', 'Cheung Wendy', 'Wendy', 'female', 'K396005(6)', '1975-03-30',
 NULL, NULL, 'ASA', '全職', 'active',
 '2021-02-27',
 (SELECT id FROM branches WHERE code = 'MKTOP'), 'MKTOP',
 (SELECT id FROM positions WHERE code = 'BEAUTICIAN')),

-- Row 13: SF119 王龍欣 (Yan Wong) - TW/Beautician
('SF119', '王龍欣', 'Wong Lung Yan', 'Yan Wong', 'female', 'R725739(1)', '1992-01-02',
 '91625959', '青衣清心街鹽田角村34號3樓', 'ASA', '全職', 'active',
 '2021-03-01',
 (SELECT id FROM branches WHERE code = 'TW'), 'TW',
 (SELECT id FROM positions WHERE code = 'BEAUTICIAN')),

-- Row 14: SF129 劉麗霞 (Jackie) - Office/Operation Manager
('SF129', '劉麗霞', 'LAU LAI HAR', 'Jackie', 'female', 'Z545263(6)', '1980-11-20',
 '92012353', '屯門富健花園10座21樓H室', 'ASA', '全職', 'active',
 '2021-04-12',
 (SELECT id FROM branches WHERE code = 'OFFICE'), 'OFFICE',
 (SELECT id FROM positions WHERE code = 'OPERATION_MANAGER')),

-- Row 15: SF185 陳凱螢 (Iris) - TaiWai/Manager
('SF185', '陳凱螢', 'Chan Hoi Ying', 'Iris', 'female', 'z241337(0)', '1982-02-16',
 '97254926', 'Rm C8, 31/F, BLK E, Garden Rivera, Shatin, NT', 'ASA', '全職', 'active',
 '2021-04-21',
 (SELECT id FROM branches WHERE code = 'TAIWAI'), 'TAIWAI',
 (SELECT id FROM positions WHERE code = 'MANAGER')),

-- Row 16: SF134 朱詠賢 (Jacqueline) - MK/Manager
('SF134', '朱詠賢', 'Chu Wing Yin', 'Jacqueline', 'female', 'K964736(8)', '1979-05-12',
 '65022002', '將軍澳蔚藍灣畔五座43樓F室', 'ASA', '全職', 'active',
 '2021-05-01',
 (SELECT id FROM branches WHERE code = 'MKTOP'), 'MKTOP',
 (SELECT id FROM positions WHERE code = 'MANAGER')),

-- Row 17: SF131 鄭寶珠 (Jumbo) - TW/Consultant
('SF131', '鄭寶珠', 'Cheng Po Chu', 'Jumbo', 'female', 'P978292(7)', '1989-04-27',
 '64892564', '新界天水圍俊宏軒3座32樓F室', 'ASA', '全職', 'active',
 '2021-05-01',
 (SELECT id FROM branches WHERE code = 'TW'), 'TW',
 (SELECT id FROM positions WHERE code = 'CONSULTANT')),

-- Row 18: SF137 陳泳芝 (Yena) - CWB/Consultant
('SF137', '陳泳芝', 'Chan Wing Chi', 'Yena', 'female', 'Y346086(8)', '1993-08-14',
 NULL, '坑口厚德邨德志樓2118室', 'ASA', '全職', 'active',
 '2021-07-01',
 (SELECT id FROM branches WHERE code = 'CWB'), 'CWB',
 (SELECT id FROM positions WHERE code = 'CONSULTANT')),

-- Row 19: SF145 梁捷瑩 (Alice) - CWB/Beautician
('SF145', '梁捷瑩', '', 'Alice', 'female', 'Z239447(3)', '1982-02-16',
 '97816132', '香港西灣河筲箕灣道92-102號業寧大廈10樓H室', 'ASA', '全職', 'active',
 '2021-07-07',
 (SELECT id FROM branches WHERE code = 'CWB'), 'CWB',
 (SELECT id FROM positions WHERE code = 'BEAUTICIAN')),

-- Row 20: SF139 金琴娣 (Candy) - TW/Massagist
('SF139', '金琴娣', 'Kam Kam Tai', 'Candy', 'female', 'P476594(3)', '1964-11-13',
 '92336226', '葵涌梨木樹邨樂榭樓2403室', 'ASA', '全職', 'active',
 '2021-08-01',
 (SELECT id FROM branches WHERE code = 'TW'), 'TW',
 (SELECT id FROM positions WHERE code = 'MASSAGIST')),

-- Row 21: SF153 李賴潔貞 (貞姐) - MK/Janitor
('SF153', '李賴潔貞', 'Lee Lai Kit Ching', '貞姐', 'female', 'E226104(2)', '1948-11-12',
 '27142718', '九龍何文田愛民邨新民樓412室', 'ASA', '全職', 'active',
 '2021-09-01',
 (SELECT id FROM branches WHERE code = 'MKTOP'), 'MKTOP',
 (SELECT id FROM positions WHERE code = 'JANITOR')),

-- Row 22: SF144 楊詠兒 (Wing) - TM/Beautician
('SF144', '楊詠兒', 'Yeung Wing Yi', 'Wing', 'female', 'Y511410(4)', '1994-12-14',
 '67684188', 'Room 1723 Oi Fai House, Yau Oi Estate, Tuen Mum', 'ASA', '全職', 'active',
 '2021-09-01',
 (SELECT id FROM branches WHERE code = 'TM'), 'TM',
 (SELECT id FROM positions WHERE code = 'BEAUTICIAN')),

-- Row 23: SF146 陳潔湘 (Emily) - CWB/Beautician
('SF146', '陳潔湘', 'Chan Kit Sheung', 'Emily', 'female', 'Z194767(3)', '1984-01-19',
 '60481158', 'Rm 3208, Lung Tat Hse Lower, Wong Tai Sin', 'ASA', '全職', 'active',
 '2021-09-03',
 (SELECT id FROM branches WHERE code = 'CWB'), 'CWB',
 (SELECT id FROM positions WHERE code = 'BEAUTICIAN')),

-- Row 24: SF149 梁家欣 (Mika) - CWB/Beautician
('SF149', '梁家欣', 'Leung Ka Yan', 'Mika', 'female', 'Z421420(0)', '1984-01-07',
 '53987815', '西貢西貢道89號地下', 'ASA', '全職', 'active',
 '2021-09-03',
 (SELECT id FROM branches WHERE code = 'CWB'), 'CWB',
 (SELECT id FROM positions WHERE code = 'BEAUTICIAN')),

-- Row 25: SF154 毛曉春 (Lanke) - TM/店長
('SF154', '毛曉春', 'Mo Hiu Chun', 'Lanke', 'female', 'V062304(0)', '1985-04-14',
 '91727370', '屯門福亨村215號地下', 'ASA', '全職', 'active',
 '2021-10-01',
 (SELECT id FROM branches WHERE code = 'TM'), 'TM',
 (SELECT id FROM positions WHERE code = 'SHOP_MANAGER')),

-- Row 26: SF156 馬玉雯 (Sunny) - Office/Marketing Executive
('SF156', '馬玉雯', 'Ma Yuk Man', 'Sunny', 'female', 'R179085(3)', '1996-09-06',
 '67081514', '東涌滿東邨滿康樓24樓2411室', 'ASA', '全職', 'active',
 '2021-10-01',
 (SELECT id FROM branches WHERE code = 'OFFICE'), 'OFFICE',
 (SELECT id FROM positions WHERE code = 'MARKETING_EXECUTIVE')),

-- Row 27: SF155 吳嘉敏 (Carman) - Office/Trainer
('SF155', '吳嘉敏', 'NG KA MAN CARMAN', 'Carman', 'female', 'Z539776(7)', '1980-10-01',
 '97102336', 'Flat A, 11/F, Blk 6, Piorhead Gdn, 168 Wu Chui Rd, Tuen Mun', 'ASA', '全職', 'active',
 '2021-10-16',
 (SELECT id FROM branches WHERE code = 'OFFICE'), 'OFFICE',
 (SELECT id FROM positions WHERE code = 'TRAINER')),

-- Row 28: SF168 陳凱婷 (Moon) - TaiWai/Manager
('SF168', '陳凱婷', 'Chan Hoi Ting', 'Moon', 'female', 'Z4724926', '1983-03-21',
 '98205136', 'Rm 407, Po On Hse, Kam On Court, Ma On Shan', 'ASA', '全職', 'active',
 '2022-04-21',
 (SELECT id FROM branches WHERE code = 'TAIWAI'), 'TAIWAI',
 (SELECT id FROM positions WHERE code = 'MANAGER')),

-- Row 29: SF170 李佩英 (Moon(B)) - TaiWai/Massagist
('SF170', '李佩英', 'Lee Pui Ying', 'Moon(B)', 'female', 'D469961(1)', '1959-06-26',
 '94689533', 'Flat B, 12/F, Blk 3, Grandway Gdn, Shatin', 'ASA', '全職', 'active',
 '2022-04-21',
 (SELECT id FROM branches WHERE code = 'TAIWAI'), 'TAIWAI',
 (SELECT id FROM positions WHERE code = 'MASSAGIST')),

-- Row 30: SF172 陳欣欣 (YY) - TaiWai/Beautician
('SF172', '陳欣欣', 'Chan Yan Yan', 'YY', 'female', 'P841845(8)', '1986-06-19',
 '65758276', 'G/F, No.55 Prosperous Villa, Tai Hang Village, Tai Po', 'ASA', '全職', 'active',
 '2022-04-21',
 (SELECT id FROM branches WHERE code = 'TAIWAI'), 'TAIWAI',
 (SELECT id FROM positions WHERE code = 'BEAUTICIAN')),

-- Row 31: SF173 何嘉慧 (Karrie) - MK/Consultant
('SF173', '何嘉慧', 'Ho Ka Wai', 'Karrie', 'female', 'Z819778(5)', '1981-01-27',
 '66288546', '深水埗海壇街218號愛海頌1座17/F B室', 'ASA', '全職', 'active',
 '2022-04-22',
 (SELECT id FROM branches WHERE code = 'MKTOP'), 'MKTOP',
 (SELECT id FROM positions WHERE code = 'CONSULTANT')),

-- Row 32: SF182 陳家寶 (BoYi) - TM/Receptionist
('SF182', '陳家寶', 'Chan Ka Po', 'BoYi', 'female', 'Y117412(4)', '1990-07-21',
 '60600219', '新界天水圍俊宏軒6座22室', 'ASA', '全職', 'active',
 '2022-06-02',
 (SELECT id FROM branches WHERE code = 'TM'), 'TM',
 (SELECT id FROM positions WHERE code = 'RECEPTIONIST')),

-- Row 33: SF188 廖詩盈 (Helen) - Office/Designer
('SF188', '廖詩盈', 'LIU SZE YING', 'Helen', 'female', 'V127902(5)', '1996-12-10',
 '51818948', '油麻地渡船街252號富景洋樓26F/C座', 'ASA', '全職', 'active',
 '2022-06-27',
 (SELECT id FROM branches WHERE code = 'OFFICE'), 'OFFICE',
 (SELECT id FROM positions WHERE code = 'DESIGNER')),

-- Row 34: SF190 鄒善盈 (Dorcas) - TW/Assistant Shop Manager
('SF190', '鄒善盈', 'Chow Sin Ying Dorcas', 'Dorcas', 'female', 'Y021740(7)', '1989-01-16',
 '65887466', '元朗坑屋村129號1樓', 'ASA', '全職', 'active',
 '2022-06-28',
 (SELECT id FROM branches WHERE code = 'TW'), 'TW',
 (SELECT id FROM positions WHERE code = 'ASSISTANT_SHOP_MANAGER')),

-- Row 35: SF193 林碧珠 (雯雯) - MKCY/Beautician
('SF193', '林碧珠', 'Lam Pik Chu', '雯雯', 'female', 'P354517(6)', '1967-02-14',
 '62711052', '黃大仙蒲崗村道75號富祐大廈3C', 'ASA', '全職', 'active',
 '2022-07-07',
 (SELECT id FROM branches WHERE code = 'MKCY'), 'MKCY',
 (SELECT id FROM positions WHERE code = 'BEAUTICIAN')),

-- Row 36: SF196 李迎迎 ((B)婷婷) - TM/Beautician
('SF196', '李迎迎', 'Li Ying Ying', '(B)婷婷', 'female', 'F024215(4)', '1989-08-15',
 '96258910', '天水圍天瑞邨瑞林樓709室', 'ASA', '全職', 'active',
 '2022-07-19',
 (SELECT id FROM branches WHERE code = 'TM'), 'TM',
 (SELECT id FROM positions WHERE code = 'BEAUTICIAN')),

-- Row 37: SF199 梁玉嬋 (呀晴) - TaiWai/Beautician
('SF199', '梁玉嬋', 'Leung Yuk Sim', '呀晴', 'female', 'K362389(0)', '1974-08-17',
 '91704116', 'FLAT 9 37/F, BLK D, LUNG POON COUR, LUNG KEI HOUSE, DIAMOND HILL, KOWLOON.', 'ASA', '全職', 'active',
 '2022-08-01',
 (SELECT id FROM branches WHERE code = 'TAIWAI'), 'TAIWAI',
 (SELECT id FROM positions WHERE code = 'BEAUTICIAN')),

-- Row 38: SF202 黃文慧 (Cora) - MK/Receptionist
('SF202', '黃文慧', 'Wong Man Wai', 'Cora', 'female', 'Z666996(5)', '1985-01-31',
 '68939892', '1/F, No 18, Kwan Mun Hau Tsuen, Tsuen Wan, NT', 'ASA', '全職', 'active',
 '2022-08-11',
 (SELECT id FROM branches WHERE code = 'MKTOP'), 'MKTOP',
 (SELECT id FROM positions WHERE code = 'RECEPTIONIST')),

-- Row 39: SF206 江儉 (Water(PT)) - CWB/Beautician (Part-time)
('SF206', '江儉', 'Kong Kim', 'Water(PT)', 'female', 'H462407(8)', NULL,
 NULL, NULL, 'ASA', '兼職', 'active',
 '2022-08-16',
 (SELECT id FROM branches WHERE code = 'CWB'), 'CWB',
 (SELECT id FROM positions WHERE code = 'BEAUTICIAN')),

-- Row 40: SF211 徐慧玲 (細Ling) - TM/Beautician
('SF211', '徐慧玲', 'Chui Wai Ling', '細Ling', 'female', 'Y434812(3)', NULL,
 '55115746', NULL, 'ASA', '全職', 'active',
 '2022-09-02',
 (SELECT id FROM branches WHERE code = 'TM'), 'TM',
 (SELECT id FROM positions WHERE code = 'BEAUTICIAN')),

-- Row 41: SF220 郭麗萍 (Pinky) - TaiWai/Beautician
('SF220', '郭麗萍', 'Guo LiPing', 'Pinky', 'female', 'R709407(7)', '1979-03-28',
 '90907339', '石硤尾白田村太田樓1814室', 'ASA', '全職', 'active',
 '2022-11-01',
 (SELECT id FROM branches WHERE code = 'TAIWAI'), 'TAIWAI',
 (SELECT id FROM positions WHERE code = 'BEAUTICIAN')),

-- Row 42: SF222 區寶欣 (Penny) - Office/Trainer
('SF222', '區寶欣', 'Au Po Yan', 'Penny', 'female', 'Z335626(5)', '1983-10-23',
 '61069237', 'Flat B, 20/F, Block 20, City One Statin 1 Tak Wing Street, Shatin, N.T.', 'ASA', '全職', 'active',
 '2022-12-01',
 (SELECT id FROM branches WHERE code = 'OFFICE'), 'OFFICE',
 (SELECT id FROM positions WHERE code = 'TRAINER')),

-- Row 43: SF233 黃碧儀 (Tracy) - TaiWai/Receptionist
('SF233', '黃碧儀', 'Wong Pik Yee', 'Tracy', 'female', 'Y846228(1)', '2002-06-11',
 '55790622', '大埔翠屏花園A座一樓八室', 'ASA', '全職', 'active',
 '2023-04-27',
 (SELECT id FROM branches WHERE code = 'TAIWAI'), 'TAIWAI',
 (SELECT id FROM positions WHERE code = 'RECEPTIONIST')),

-- Row 44: SF238 張月峙琦 (Kei) - CWB/Massagist
('SF238', '張月峙琦', 'Cheung Yuet Si Kei', 'Kei', 'female', 'P623734(0)', '1967-01-18',
 '54148878', '沙田馬鞍山錦泰苑錦天閣1003室', 'ASA', '全職', 'active',
 '2023-05-08',
 (SELECT id FROM branches WHERE code = 'CWB'), 'CWB',
 (SELECT id FROM positions WHERE code = 'MASSAGIST')),

-- Row 45: SF241 梁頌慈 (Rachel) - MOS/Beautician
('SF241', '梁頌慈', 'Leung Chung Chi', 'Rachel', 'female', 'Y616699(5)', '1997-05-29',
 '66412541', '屯門富健花園9座18樓K室', 'ASA', '全職', 'active',
 '2023-06-07',
 (SELECT id FROM branches WHERE code = 'MOS'), 'MOS',
 (SELECT id FROM positions WHERE code = 'BEAUTICIAN')),

-- Row 46: SF221 阮美儀 (MAY(cs)) - MOS/Receptionist
('SF221', '阮美儀', 'Yuen Mei Yee', 'MAY(cs)', 'female', 'K761150(1)', NULL,
 '93566477', NULL, 'ASA', '全職', 'active',
 '2023-06-22',
 (SELECT id FROM branches WHERE code = 'MOS'), 'MOS',
 (SELECT id FROM positions WHERE code = 'RECEPTIONIST')),

-- Row 47: SF243 (Chilly) - TW/Beautician (no Chinese name)
('SF243', '', 'Liu Shu Yan', 'Chilly', 'female', NULL, NULL,
 NULL, NULL, 'ASA', '全職', 'active',
 '2023-07-01',
 (SELECT id FROM branches WHERE code = 'TW'), 'TW',
 (SELECT id FROM positions WHERE code = 'BEAUTICIAN')),

-- Row 48: SF247 賀蓉花 (Anna) - MK/Massagist
('SF247', '賀蓉花', 'He Ronghua', 'Anna', 'female', 'M454095(1)', '1979-03-17',
 '63064650', '馬鞍山利安邨利華樓2309室', 'ASA', '全職', 'active',
 '2023-08-01',
 (SELECT id FROM branches WHERE code = 'MKTOP'), 'MKTOP',
 (SELECT id FROM positions WHERE code = 'MASSAGIST')),

-- Row 49: SF249 (Maymay) - MK/Beautician (no Chinese name)
('SF249', '', 'Tai Mei Mei', 'Maymay', 'female', 'K766222(A)', NULL,
 NULL, '九龍城城南道68號2樓F室', 'ASA', '全職', 'active',
 '2023-08-11',
 (SELECT id FROM branches WHERE code = 'MKTOP'), 'MKTOP',
 (SELECT id FROM positions WHERE code = 'BEAUTICIAN')),

-- Row 50: SF250 蔡文瑛 (Gina) - Office/Telesales
('SF250', '蔡文瑛', 'Choi Man Ying', 'Gina', 'female', 'K040808(5)', '1972-07-20',
 '93865064', 'Rm 513 Man Tai House, Tze Man Estater, Tze Wan, Shan Kowloon', 'ASA', '全職', 'active',
 '2023-08-14',
 (SELECT id FROM branches WHERE code = 'OFFICE'), 'OFFICE',
 (SELECT id FROM positions WHERE code = 'TELESALES')),

-- Row 51: SF260 許靜婷 (Jay) - TW/Beautician
('SF260', '許靜婷', 'Hui Ching Ting', 'Jay', 'female', 'Y425013(1)', '1994-02-02',
 '61938884', 'Room 14, 17/F, Sun Man Hse, Oi Man Est, Ho Man Tin', 'ASA', '全職', 'active',
 '2023-10-09',
 (SELECT id FROM branches WHERE code = 'TW'), 'TW',
 (SELECT id FROM positions WHERE code = 'BEAUTICIAN')),

-- Row 53: SF265 王雪婷 (Sugar) - CWB/Beautician (also in resigned from MOS, active takes priority)
('SF265', '王雪婷', 'Wong Suet Ting', 'Sugar', 'female', 'Y152326(9)', '1990-10-29',
 '95530022', '沙田大圍豐盛苑華盛閣2715室', 'ASA', '全職', 'active',
 '2023-11-09',
 (SELECT id FROM branches WHERE code = 'CWB'), 'CWB',
 (SELECT id FROM positions WHERE code = 'BEAUTICIAN')),

-- Row 54: SF266 黃美娜 (Cat) - TW/Massagist (also in resigned as diff person, active takes priority)
('SF266', '黃美娜', 'Chiranan Thianhom', 'Cat', 'female', 'K716637(0)', '1974-10-06',
 '62922876', '屯門寶田邨第8座2610室', 'ASA', '全職', 'active',
 '2023-11-25',
 (SELECT id FROM branches WHERE code = 'TW'), 'TW',
 (SELECT id FROM positions WHERE code = 'MASSAGIST')),

-- Row 55: SF275 盧詠茵 (Wingo) - Office/會計文員
('SF275', '盧詠茵', 'Lo Wing Yan', 'Wingo', 'female', 'K696639(A)', '1977-07-01',
 '60380861', '九龍紅磡大環道28號紅磡邨紅日樓9樓911室', 'ASA', '全職', 'active',
 '2024-02-26',
 (SELECT id FROM branches WHERE code = 'OFFICE'), 'OFFICE',
 (SELECT id FROM positions WHERE code = 'ACCOUNTING_CLERK')),

-- Row 56: SF277 高鳳香 (Joey) - CWB (no position)
('SF277', '高鳳香', 'GAO Feng Xiang', 'Joey', 'female', 'R333773(0)', NULL,
 NULL, NULL, 'ASA', '全職', 'active',
 '2024-03-14',
 (SELECT id FROM branches WHERE code = 'CWB'), 'CWB',
 NULL),

-- Row 57: SF279 王嬌 (KITTY) - TW/Massagist
('SF279', '王嬌', 'Wang Jiao', 'KITTY', 'female', 'M535934(7)', '1985-08-14',
 '68712298', '葵涌葵盛東邨盛安樓1912室', 'ASA', '全職', 'active',
 '2024-04-04',
 (SELECT id FROM branches WHERE code = 'TW'), 'TW',
 (SELECT id FROM positions WHERE code = 'MASSAGIST')),

-- Row 58: SF280 何文頤 (Amanda) - CWB/Receptionist
('SF280', '何文頤', 'Ho Man Yee', 'Amanda', 'female', 'Y382696(A)', '1994-12-27',
 '60644515', 'Flat A,16/F,Harkfield Building, 8Smithfield Road,Kenndy Town', 'ASA', '全職', 'active',
 '2024-04-12',
 (SELECT id FROM branches WHERE code = 'CWB'), 'CWB',
 (SELECT id FROM positions WHERE code = 'RECEPTIONIST')),

-- Row 59: SF282 黃惠燕 (Vincci) - 醫療/跟針姑娘 → OFFICE/NURSE
('SF282', '黃惠燕', 'Wong Wai Yin', 'Vincci', 'female', 'Z408146(4)', '1981-04-16',
 '63808403', '青衣青康路10號青盛苑1510室', 'ASA', '全職', 'active',
 '2024-05-08',
 (SELECT id FROM branches WHERE code = 'OFFICE'), 'OFFICE',
 (SELECT id FROM positions WHERE code = 'NURSE')),

-- Row 60: SF292 連嘉雯 (Mon) - TW (no position)
('SF292', '連嘉雯', 'Lin Ka Man', 'Mon', 'female', 'Z871828(9)', '1987-09-20',
 '90527088', '沙田大圍隆亨邨學心樓2樓209室', 'ASA', '全職', 'active',
 '2024-06-01',
 (SELECT id FROM branches WHERE code = 'TW'), 'TW',
 NULL),

-- Row 61: SF312 林映明 (MING) - no branch/Beautician
('SF312', '林映明', 'Lam Ying Ming', 'MING', 'female', 'F463321(7)', '1992-11-24',
 '60509821', '葵芳邨葵明樓15樓13室', 'ASA', '全職', 'active',
 '2024-07-09',
 NULL, NULL,
 (SELECT id FROM positions WHERE code = 'BEAUTICIAN')),

-- Row 62: SF313 楊達偉 (Barry) - Office/Account Manager
('SF313', '楊達偉', 'Yeung Tat Wai', 'Barry', 'male', 'Z472686(4)', '1983-05-09',
 '96262425', 'Flat H, 5/F, Blk 2, Fu Ning Garden, 25 Po Ning Road, TKO', 'ASA', '全職', 'active',
 '2024-07-23',
 (SELECT id FROM branches WHERE code = 'OFFICE'), 'OFFICE',
 (SELECT id FROM positions WHERE code = 'ACCOUNT_MANAGER')),

-- Row 63: SF320 陳禧旻 (Vanessa) - MOS/Beautician
('SF320', '陳禧旻', 'Chan Hei Man', 'Vanessa', 'female', 'Y810406(7)', '2001-03-03',
 '62290067', 'Rm1617, Chun Tung House, Tung Tau Estate, Kowloon', 'ASA', '全職', 'active',
 '2024-08-01',
 (SELECT id FROM branches WHERE code = 'MOS'), 'MOS',
 (SELECT id FROM positions WHERE code = 'BEAUTICIAN')),

-- Row 64: SF318 陳熾燊 (Santo) - no branch/Operation Manager
('SF318', '陳熾燊', 'Chan Chi San', 'Santo', 'male', 'Z068047(9)', '1980-12-13',
 '93745571', NULL, 'ASA', '全職', 'active',
 '2024-08-01',
 NULL, NULL,
 (SELECT id FROM positions WHERE code = 'OPERATION_MANAGER')),

-- Row 65: SF323 費曉蓮 (Candy) - MOS/Consultant
('SF323', '費曉蓮', 'Fei Xiao Lian', 'Candy', 'female', 'R808067(3)', '1982-02-08',
 NULL, '沙田馬鞍山150號錦駿苑E座3604室', 'ASA', '全職', 'active',
 '2024-09-03',
 (SELECT id FROM branches WHERE code = 'MOS'), 'MOS',
 (SELECT id FROM positions WHERE code = 'CONSULTANT')),

-- Row 66: SF331 劉洁婷 (Miki) - MKCY/Receptionist
('SF331', '劉洁婷', 'Liu Jieting', 'Miki', 'female', 'M910957(4)', '2001-02-01',
 '55249795', '深水埗福榮街12號嘉榮大廈6F B室', 'ASA', '全職', 'active',
 '2024-10-10',
 (SELECT id FROM branches WHERE code = 'MKCY'), 'MKCY',
 (SELECT id FROM positions WHERE code = 'RECEPTIONIST')),

-- Row 67: SF334 徐狄美 (Maymay) - TaiWai/Beautician
('SF334', '徐狄美', 'Tsui Tik Mei', 'Maymay', 'female', 'Y606363(0)', '1997-07-23',
 '94243161', 'Rm10,11/F, Blk5,Mei Lok Hse,Mei Tin Est, Tai Wai NT, HK', 'ASA', '全職', 'active',
 '2024-10-21',
 (SELECT id FROM branches WHERE code = 'TAIWAI'), 'TAIWAI',
 (SELECT id FROM positions WHERE code = 'BEAUTICIAN')),

-- Row 68: SF335 丘沛然 (ZOE) - TW/Consultant
('SF335', '丘沛然', 'YAU PUI YIN', 'ZOE', 'female', 'Z378318(A)', '1981-08-15',
 '97078121', '大圍顯徑邨顯貴樓2613室/大圍嘉田苑嘉詠閣1208室', 'ASA', '全職', 'active',
 '2024-10-25',
 (SELECT id FROM branches WHERE code = 'TW'), 'TW',
 (SELECT id FROM positions WHERE code = 'CONSULTANT')),

-- Row 69: SF336 夏澤嬌 (Mimi) - MOS/Massagist
('SF336', '夏澤嬌', 'Xia Zejiao', 'Mimi', 'female', 'M715082(8)', '1974-03-15',
 '67638908', '香港九龍深水埗汝州街236號1FA', 'ASA', '全職', 'active',
 '2024-10-28',
 (SELECT id FROM branches WHERE code = 'MOS'), 'MOS',
 (SELECT id FROM positions WHERE code = 'MASSAGIST')),

-- Row 70: SF167 曾瑞卿 (Ella) - no branch/Sales Manager
('SF167', '曾瑞卿', 'Tsang Sui Hing', 'Ella', 'female', 'G816457(5)', '1971-04-06',
 '61931944', NULL, 'ASA', '全職', 'active',
 '2024-11-01',
 NULL, NULL,
 (SELECT id FROM positions WHERE code = 'SALES_MANAGER')),

-- Row 71: SF337 黃婉君 (Monica) - MK TOP/Receptionist
('SF337', '黃婉君', 'Wong Yuen Kwan', 'Monica', 'female', 'R80474(3)', '1998-11-17',
 '55135963', '粉嶺華心邨華冠樓3014室', 'ASA', '全職', 'active',
 '2024-11-04',
 (SELECT id FROM branches WHERE code = 'MKTOP'), 'MKTOP',
 (SELECT id FROM positions WHERE code = 'RECEPTIONIST')),

-- Row 72: SF339 余敏慧 (Fanny) - Office/Office Clerk
('SF339', '余敏慧', 'Yu Man Wai', 'Fanny', 'female', 'Y048581(9)', '1988-12-16',
 '65303020', 'Falt E, 5/F,Blk 2 , Broadview Gdn,Tsing Yi', 'ASA', '全職', 'active',
 '2024-11-18',
 (SELECT id FROM branches WHERE code = 'OFFICE'), 'OFFICE',
 (SELECT id FROM positions WHERE code = 'OFFICE_CLERK')),

-- Row 73: SF272 邱少碧 (Jojo) - CWB/Massagist (date: 19/1//2024 → 2024-01-19)
('SF272', '邱少碧', 'Qiu Shaobi', 'Jojo', 'female', 'R184303(5)', '1962-10-15',
 '51721328', '荃灣梨木樹邨翠樹樓3013室', 'ASA', '全職', 'active',
 '2024-01-19',
 (SELECT id FROM branches WHERE code = 'CWB'), 'CWB',
 (SELECT id FROM positions WHERE code = 'MASSAGIST')),

-- Row 76: SF346 李嘉賢 (Yvonne) - no branch/no position
('SF346', '李嘉賢', 'Lei Ka In', 'Yvonne', 'female', 'K471749(A)', '1975-10-30',
 '64141149', 'Flat G,4/F,Blook 13,Kenswood Count,kingswood villas tin shui wai,NT', 'ASA', '全職', 'active',
 '2025-03-10',
 NULL, NULL,
 NULL),

-- Row 77: SF344 吳佩臻 (Me) - no branch/no position
('SF344', '吳佩臻', 'Ng Pui Chun', 'Me', 'female', 'C455131(A)', '1965-01-21',
 '66816511', '天水圍天慈邨慈心樓1202室', 'ASA', '全職', 'active',
 '2025-03-07',
 NULL, NULL,
 NULL),

-- Row 79: SF345 鍾嫣嫣 (Vanessa) - no branch/no position (date: 1995年7月2日, 2025年2月4日)
('SF345', '鍾嫣嫣', 'Chung Yin Yin', 'Vanessa', 'female', 'R483737(0)', '1995-07-02',
 '51091579', '青衣長安宏文樓1520室', 'ASA', '全職', 'active',
 '2025-02-04',
 NULL, NULL,
 NULL),

-- Row 80: SF341 李紅妹 (Esther) - no branch/no position (date: 2025年1月6日)
('SF341', '李紅妹', 'Lee Hong Mei', 'Esther', 'female', 'R753960(5)', NULL,
 NULL, NULL, 'ASA', '全職', 'active',
 '2025-01-06',
 NULL, NULL,
 NULL);

-- =============================================================
-- 3. Insert resigned employees (28 unique, excluding SF265/SF266 overlap)
-- =============================================================
INSERT INTO employees (
  employee_code, name_zh, name_en, alias, gender, identity_number, date_of_birth,
  phone, address, company_type, employment_type, employment_status,
  hire_date, employment_end_date, branch_id, branch_code, position_id
) VALUES
-- SF258 胡滿金 (珍珍(TW)) - TW/Massagist
('SF258', '胡滿金', 'HU Manjin', '珍珍(TW)', 'female', 'R687103(7)', '1968-11-06',
 '96823751', '荃灣同和街老圍村42A地下', 'ASA', '全職', 'resigned',
 '2023-09-26', '2024-03-31',
 (SELECT id FROM branches WHERE code = 'TW'), 'TW',
 (SELECT id FROM positions WHERE code = 'MASSAGIST')),

-- SF327 吳芷瑜 (Jenny) - TW/Manager
('SF327', '吳芷瑜', 'Ng Chi Yu', 'Jenny', 'female', 'P877515(3)', '1993-10-30',
 '91059389', '粉嶺祥華邨祥智樓B2402室', 'ASA', '全職', 'resigned',
 '2024-09-23', '2024-10-13',
 (SELECT id FROM branches WHERE code = 'TW'), 'TW',
 (SELECT id FROM positions WHERE code = 'MANAGER')),

-- SF261 黃麗齡 (Jc) - TM/Consultant
('SF261', '黃麗齡', 'Wong Lai Ling Anna', 'Jc', 'female', NULL, NULL,
 NULL, NULL, 'ASA', '全職', 'resigned',
 '2024-01-15', NULL,
 (SELECT id FROM branches WHERE code = 'TM'), 'TM',
 (SELECT id FROM positions WHERE code = 'CONSULTANT')),

-- SF271 趙淑貞 (Crystal) - TM/Consultant
('SF271', '趙淑貞', 'Chiu Shuk Ching', 'Crystal', 'female', 'R226581(7)', '1990-07-21',
 '67924092', '3718, 37/F, Ching Shum House, Ching Tin Estate, Tuen Mun', 'ASA', '全職', 'resigned',
 '2024-01-15', NULL,
 (SELECT id FROM branches WHERE code = 'TM'), 'TM',
 (SELECT id FROM positions WHERE code = 'CONSULTANT')),

-- SF239 羊思思 (Ceci) - MOS/Consultant
('SF239', '羊思思', 'Yeung Sze Sze', 'Ceci', 'female', 'R117602(4)', '1989-07-24',
 '91957812', '元朗橫洲楊屋邨143A 1/F', 'ASA', '全職', 'resigned',
 '2023-05-15', '2024-09-20',
 (SELECT id FROM branches WHERE code = 'MOS'), 'MOS',
 (SELECT id FROM positions WHERE code = 'CONSULTANT')),

-- SF266 (resigned version) SKIPPED - code reused by active employee 黃美娜

-- SF302 周曉玲 (Ling) - MOS/Body Consultant
('SF302', '周曉玲', 'Zhou Xiao Ling', 'Ling', 'female', 'R861468(6)', '1972-04-26',
 '92718333', '九龍觀塘安達邨正達樓11樓1113室', 'ASA', '全職', 'resigned',
 '2024-06-20', '2024-10-31',
 (SELECT id FROM branches WHERE code = 'MOS'), 'MOS',
 (SELECT id FROM positions WHERE code = 'BODY_CONSULTANT')),

-- SF303 朱韋瑤 (YOYO) - MOS/Beautician
('SF303', '朱韋瑤', 'Chu Wai Yiu', 'YOYO', 'female', 'Y118284(4)', '1990-03-27',
 '67910446', '粉嶺龍馬路68號皇后山邨皇頤樓2522室', 'ASA', '全職', 'resigned',
 '2024-06-24', '2024-10-16',
 (SELECT id FROM branches WHERE code = 'MOS'), 'MOS',
 (SELECT id FROM positions WHERE code = 'BEAUTICIAN')),

-- SF300 袁巧玲 (Jessica) - MKCY/Beautician
('SF300', '袁巧玲', 'Yuen Hau Ling', 'Jessica', 'female', 'P891388(2)', '1969-01-13',
 '91443313', '青衣長宏邨宏心樓3417室', 'ASA', '全職', 'resigned',
 '2024-06-17', '2024-07-15',
 (SELECT id FROM branches WHERE code = 'MKCY'), 'MKCY',
 (SELECT id FROM positions WHERE code = 'BEAUTICIAN')),

-- SF299 薜娟 (小娟) - MKCY/Massagist
('SF299', '薜娟', 'Xue Juan', '小娟', 'female', 'M912251(1)', '1989-01-05',
 '56779285', NULL, 'ASA', '全職', 'resigned',
 '2024-06-17', '2024-10-23',
 (SELECT id FROM branches WHERE code = 'MKCY'), 'MKCY',
 (SELECT id FROM positions WHERE code = 'MASSAGIST')),

-- SF311 江配配 (Polly) - MKCY/Beautician
('SF311', '江配配', 'Jiang Peipei', 'Polly', 'female', 'F044031(7)', '2024-01-12',
 '55706886', '九龍旺廷通菜街115號', 'ASA', '全職', 'resigned',
 '2024-07-09', NULL,
 (SELECT id FROM branches WHERE code = 'MKCY'), 'MKCY',
 (SELECT id FROM positions WHERE code = 'BEAUTICIAN')),

-- SF284 林麗雅 (Yuri) - MKCY/Assistant Operation Manager
('SF284', '林麗雅', 'LAM LAI NGA YURI', 'Yuri', 'female', 'M349281(3)', '1996-10-08',
 '52282181', 'Rm 2021, Blk 2, Choi Wah Hse, Choi Yuen Est, Choi Yuen Rd, Sheung Shui, NT, HK', 'ASA', '全職', 'resigned',
 '2024-05-27', '2024-09-07',
 (SELECT id FROM branches WHERE code = 'MKCY'), 'MKCY',
 (SELECT id FROM positions WHERE code = 'ASSISTANT_OPERATION_MANAGER')),

-- SF287 (Winnie) - MKCY/Senior Sales Manager (no Chinese name)
('SF287', 'N/A', 'Cheung Wing Fong', 'Winnie', 'female', 'V140594(2)', '1988-07-24',
 '55957933', 'Kwun Tong', 'ASA', '全職', 'resigned',
 '2024-05-27', '2024-09-07',
 (SELECT id FROM branches WHERE code = 'MKCY'), 'MKCY',
 (SELECT id FROM positions WHERE code = 'SENIOR_SALES_MANAGER')),

-- SF296 彭慧文 (Monique) - MKCY/Senior Shop Manager
('SF296', '彭慧文', 'Pang Wai Man', 'Monique', 'female', 'Z795112(5)', '1986-12-07',
 '90191595', 'Rm F,23/F, Blk 5, Sky Tower, To Kwa Wan, Kln', 'ASA', '全職', 'resigned',
 '2024-06-03', '2024-09-30',
 (SELECT id FROM branches WHERE code = 'MKCY'), 'MKCY',
 (SELECT id FROM positions WHERE code = 'SENIOR_SHOP_MANAGER')),

-- SF325 陳靜怡 (Faye) - no branch/Beautician
('SF325', '陳靜怡', 'Chan Ching Yi', 'Faye', 'female', 'V116590(9)', '1987-03-16',
 '52111281', '旺角西洋菜街新江大廈9B', 'ASA', '全職', 'resigned',
 '2024-09-19', '2024-10-11',
 NULL, NULL,
 (SELECT id FROM positions WHERE code = 'BEAUTICIAN')),

-- SF240 郭偉傑 (Roy) - Office/Designer
('SF240', '郭偉傑', 'Kwok Wai Kit', 'Roy', 'male', 'M323221(8)', '1996-09-05',
 '65296165', '九龍深水埗榮昌邨榮俊樓1011室', 'ASA', '全職', 'resigned',
 '2023-06-01', '2024-05-31',
 (SELECT id FROM branches WHERE code = 'OFFICE'), 'OFFICE',
 (SELECT id FROM positions WHERE code = 'DESIGNER')),

-- SF288 何寶瓊 (Summer) - TW (end_date: 10月31日LAST DAY → 2024-10-31)
('SF288', '何寶瓊', 'Ho Po King', 'Summer', 'female', 'Y297887(1)', '1993-01-20',
 '64090689', '沙田禾輋邨厚和樓6樓06室', 'ASA', '全職', 'resigned',
 '2024-06-01', '2024-10-31',
 (SELECT id FROM branches WHERE code = 'TW'), 'TW',
 NULL),

-- SF315 歐東林 (Chloe) - MK/Consultant (end_date: 20/11 LAST DAY → 2024-11-20)
('SF315', '歐東林', 'Au Tong Lam', 'Chloe', 'female', 'Y258158(0)', NULL,
 '96681570', NULL, 'ASA', '全職', 'resigned',
 '2024-07-24', '2024-11-20',
 (SELECT id FROM branches WHERE code = 'MKTOP'), 'MKTOP',
 (SELECT id FROM positions WHERE code = 'CONSULTANT')),

-- SF143 陳潔汶 (Money) - MK/Receptionist
('SF143', '陳潔汶', 'Chan Kit Man', 'Money', 'female', 'Y192730(0)', '1991-04-21',
 '64625267', '九龍旺角西洋菜南街西洋大樓3208室', 'ASA', '全職', 'resigned',
 '2021-08-09', NULL,
 (SELECT id FROM branches WHERE code = 'MKTOP'), 'MKTOP',
 (SELECT id FROM positions WHERE code = 'RECEPTIONIST')),

-- SF330 黃鈺淋 (COCO) - no branch/Beautician
('SF330', '黃鈺淋', 'Wong Yuk Lam', 'COCO', 'female', 'R845614(2)', '1999-04-28',
 '66428565', '沙田圍水泉澳河泉樓0804室', 'ASA', '全職', 'resigned',
 '2024-10-02', NULL,
 NULL, NULL,
 (SELECT id FROM positions WHERE code = 'BEAUTICIAN')),

-- SF262 (Gigi) - CWB/Massagist (no name)
('SF262', 'N/A', '', 'Gigi', 'female', NULL, NULL,
 NULL, NULL, 'ASA', '全職', 'resigned',
 '2024-01-16', NULL,
 (SELECT id FROM branches WHERE code = 'CWB'), 'CWB',
 (SELECT id FROM positions WHERE code = 'MASSAGIST')),

-- SF267 文芊茹 (Bell) - TW/Receptionist
('SF267', '文芊茹', 'Man Chin Yu', 'Bell', 'female', 'Y602809(6)', '1997-09-05',
 '54087715', '青衣青康路青盛苑12樓16室', 'ASA', '全職', 'resigned',
 '2023-12-11', NULL,
 (SELECT id FROM branches WHERE code = 'TW'), 'TW',
 (SELECT id FROM positions WHERE code = 'RECEPTIONIST')),

-- SF273 陳慧敏 (Grace) - TW/Assistant Shop Manager
('SF273', '陳慧敏', 'Chan Wai Man Grace', 'Grace', 'female', 'K921631(6)', '1979-01-02',
 NULL, NULL, 'ASA', '全職', 'resigned',
 '2024-02-19', NULL,
 (SELECT id FROM branches WHERE code = 'TW'), 'TW',
 (SELECT id FROM positions WHERE code = 'ASSISTANT_SHOP_MANAGER')),

-- SF304 郭佩詩 (May May) - TW/Manager
('SF304', '郭佩詩', 'Kwok Pui Sze', 'May May', 'female', 'K678402(A)', '1977-05-18',
 '68100007', 'Rm1405,', 'ASA', '全職', 'resigned',
 '2024-06-25', NULL,
 (SELECT id FROM branches WHERE code = 'TW'), 'TW',
 (SELECT id FROM positions WHERE code = 'MANAGER')),

-- SF171 (Ying) - TaiWai/Beautician(PT) (no Chinese name)
('SF171', 'N/A', 'Ha Mung Ying', 'Ying', 'female', NULL, NULL,
 NULL, NULL, 'ASA', '兼職', 'resigned',
 '2022-04-21', NULL,
 (SELECT id FROM branches WHERE code = 'TAIWAI'), 'TAIWAI',
 (SELECT id FROM positions WHERE code = 'BEAUTICIAN')),

-- SF208 梁美英 (Jessie) - TaiWai/Beautician
('SF208', '梁美英', 'Leung Mei Ying', 'Jessie', 'female', 'Z302198(0', '1981-01-24',
 '97553336', '沙田廣源邨廣棉樓3014室', 'ASA', '全職', 'resigned',
 '2022-09-01', NULL,
 (SELECT id FROM branches WHERE code = 'TAIWAI'), 'TAIWAI',
 (SELECT id FROM positions WHERE code = 'BEAUTICIAN')),

-- SF333 葉柏芬 (Suki) - MKCY/Massagist
('SF333', '葉柏芬', 'Ye Baifen', 'Suki', 'female', 'M104719(7)', '1980-11-16',
 '90803799', '上水彩園邨彩麗樓732窒', 'ASA', '全職', 'resigned',
 '2024-10-14', NULL,
 (SELECT id FROM branches WHERE code = 'MKCY'), 'MKCY',
 (SELECT id FROM positions WHERE code = 'MASSAGIST')),

-- SF338 梁怡欣 (Joyce) - Office/Office Clerk
('SF338', '梁怡欣', 'Leung Yee Yan', 'Joyce', 'female', 'Z689731(3)', '1984-12-06',
 '90576126', 'G/F, Block 1, Tsui Yin Garden, 146 Tai Tong Road, Yuen Long', 'ASA', '全職', 'resigned',
 '2024-11-12', NULL,
 (SELECT id FROM branches WHERE code = 'OFFICE'), 'OFFICE',
 (SELECT id FROM positions WHERE code = 'OFFICE_CLERK')),

-- SF276 (Helen) - MOS (no name, no position)
('SF276', 'N/A', '', 'Helen', 'female', NULL, NULL,
 NULL, NULL, 'ASA', '全職', 'resigned',
 '2024-02-27', '2024-07-09',
 (SELECT id FROM branches WHERE code = 'MOS'), 'MOS',
 NULL);

COMMIT;
