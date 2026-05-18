# 2026年4月 V6 Payroll 匯入暫存分析及日薪/兼職處理方案

來源檔案: `/Users/joecheung/Desktop/Medi Magic 2026/04-2026_MM(FY)_V6.xlsx`

分析日期: 2026-05-17

狀態: 未寫入資料庫。已產生可審核 SQL 草案，但因 Supabase Postgres 連線失敗而未 apply。

SQL 草案: `supabase/manual/20260517_import_apr2026_v6_confirmed_commission.sql`

## 1. 今次匯入原則

- 只先匯入 `COMMISSION` sheet 內可以明確驗證的月度 commission records。
- 不直接更新員工 profile rate，避免改動未來月份計算邏輯。
- 不確定 row 先暫停，等人工確認後再補入。
- 日薪、時薪、兼職員工不能只靠 commission sheet 決定底薪，要由 `出勤管理` 或 `薪資月結總覽` 的工作日/工時計算。

## 2. COMMISSION Sheet Summary

- 員工 commission rows: 59
- 可安全匯入 rows: 35
- 需要人工確認 rows: 20

安全匯入的判斷條件:

- Redeem commission = Redeem amount x 1%
- Sales commission = Sales amount x 3%
- SGM commission = SGM amount x 5%
- Total = Job + Redeem commission + Sales commission + SGM commission

## 3. 可安全匯入員工

以下 35 位符合標準 rate 及 total 驗證，可以寫入 `monthly_commission_records` 的 2026-04 月度紀錄。

| 工號 | 備註 |
| --- | --- |
| SF006 | 標準 rate / total 正確 |
| SF249 | 標準 rate / total 正確 |
| SF025 | 標準 rate / total 正確 |
| SF066 | 標準 rate / total 正確 |
| SF102 | 標準 rate / total 正確 |
| SF014 | 標準 rate / total 正確 |
| SF065 | 標準 rate / total 正確 |
| SF247 | 標準 rate / total 正確 |
| SF117 | 標準 rate / total 正確 |
| SF189 | 標準 rate / total 正確 |
| SF119 | 標準 rate / total 正確 |
| SF279 | 標準 rate / total 正確 |
| SF360 | 標準 rate / total 正確 |
| SF355 | 標準 rate / total 正確 |
| SF356 | 標準 rate / total 正確 |
| SF243 | 標準 rate / total 正確 |
| SF164 | 標準 rate / total 正確 |
| SF144 | 標準 rate / total 正確 |
| SF378 | 標準 rate / total 正確 |
| SF272 | 標準 rate / total 正確 |
| SF265 | 標準 rate / total 正確 |
| SF145 | 標準 rate / total 正確 |
| SF146 | 標準 rate / total 正確 |
| SF259 | 標準 rate / total 正確 |
| SF206 | 標準 rate / total 正確 |
| SF277 | 標準 rate / total 正確 |
| SF322 | 標準 rate / total 正確 |
| SF193 | 標準 rate / total 正確 |
| SF312 | 標準 rate / total 正確 |
| SF238 | 標準 rate / total 正確 |
| SF377 | 標準 rate / total 正確 |
| SF382 | 標準 rate / total 正確 |
| SF220 | 標準 rate / total 正確 |
| SF167 | 標準 rate / total 正確 |
| SF335 | 標準 rate / total 正確 |

## 4. 需要人工確認員工

以下 row 不應自動入 DB。原因是有 volume 但 commission 為 0，或 Excel total 不等於計算加總。

| 工號 | 名稱 | 問題 |
| --- | --- | --- |
| SF211 | Ling | Redeem 有金額但佣金為 0 |
| SF196 | 婷婷 | Redeem 有金額但佣金為 0 |
| SF170 | Moon(B) | Total 不一致，Excel total 0，但加總應為 6598.67 |
| SF199 | 呀晴 | Total 不一致，Excel total 1936.6，但加總應為 14270.92 |
| SF334 | May Tsui | Total 不一致，Excel total 0，但加總應為 8373.42 |
| SF241 | Rachel | Sales 有金額但佣金為 0 |
| SF358 | Maggie | Sales 有金額但佣金為 0 |
| SF216 | Lilly | Sales 有金額但佣金為 0 |
| SF323 | Candy Fei | Sales 有金額但佣金為 0 |
| SF011 | Sylvia | Sales 有金額但佣金為 0 |
| SF190 | Dorcas | Total 不一致，Excel total 2500，但加總應為 21595.95 |
| SF134 | Jacqueline | Total 不一致，Excel total 0，但加總應為 12216.22 |
| SF173 | Karrie | Total 不一致，Excel total 0，但加總應為 6097.48 |
| SF137 | Yena | Sales 有金額但佣金為 0 |
| SF154 | Lanke | Total 不一致，Excel total 0，但加總應為 6401.29 |
| SF186 | Moon | Redeem/Sales 有金額但佣金為 0，Total 不一致 |
| SF185 | Iris | Redeem/Sales 有金額但佣金為 0，Total 不一致 |
| SF172 | YY | Redeem/Sales 有金額但佣金為 0，Total 不一致 |
| SF375 | Alfred | Sales 有金額但佣金為 0 |
| SF129 | Jackie | Sales 有金額但佣金為 0 |

## 5. 日薪、時薪、兼職員工觀察

系統已經有兩個概念，需要分清楚，否則會衝突。

| 概念 | 用途 | 例子 | 不應混用 |
| --- | --- | --- | --- |
| employment type | 員工身份分類 | 全職、兼職、自僱人士 | 不應直接決定底薪公式 |
| salary type | 計薪公式 | monthly、daily、hourly、package、street_promoter | 應由它決定底薪點計 |

在四月出勤 audit 已見到部分 PT / part-time / hourly 類員工或臨時員工，例如:

- `K.T (PT)`，對應 `SF006`
- `Tammy(PT)`，對應 `V6TMP202603R017`
- `Jumbo(PT)`，出勤表舊工號 `SF131`，資料庫對應 `SF189`
- `Kiki(PT)`，出勤表 `SF259`，資料庫對應 `V6TMP202603R060`
- `清潔蓉 (PT)`，出勤表為 `54.5hrs`，未對到資料庫
- `塋姐(PT)`，出勤表為 `57HRS`，未能唯一對上
- `Hebe`，出勤表工號寫 `PT`，資料庫對應 `V6TMP202603R018`
- `Dan` / `Lilly`，出勤表工號寫 `街霸`，偏向臨時/特殊計薪類別

## 6. 建議的處理規則

### 6.1 出勤管理

出勤管理應該作為工作日/工時的 single source of truth。

建議規則:

- 月薪員工: 出勤管理記錄工作日、假期、無薪假、遲到等，用來計算扣薪及全勤相關項目。
- 日薪員工: 出勤管理的 `workedDays` 是底薪計算來源，薪資月結不應要求再手動輸入另一個工作日數。
- 時薪員工: 出勤管理需要支援 `workedHours` 作為底薪計算來源；如果暫時未有 hourly attendance field，就在薪資月結手動輸入，但要清楚標示為暫存輸入。
- 兼職員工: 不應只因 employment type 是 `兼職` 就自動用日薪或時薪；要看 salary type 是 `daily`、`hourly` 或其他。
- 街霸、清潔、臨時員工: 應明確建立 employee profile 及 salary type，避免在出勤表用 `PT`、`街霸`、舊工號代替正式工號。

### 6.2 薪資月結總覽

薪資月結總覽應只負責計算及確認，不應成為另一套出勤主檔。

建議規則:

- `salaryType = daily`: 底薪 = 日薪 rate x 出勤管理 `workedDays`。
- `salaryType = hourly`: 底薪 = 時薪 rate x `workedHours`。
- `salaryType = monthly`: 底薪 = 月薪，按出勤管理的 no-pay / late / leave 規則扣減。
- `salaryType = package`: 底薪及 package commission 按現有 package no-pay handling 處理。
- commission volume、commission amount、job amount 保持在 `monthly_commission_records`，不要用來推算日薪/時薪底薪。
- 如果 salary type 是 daily/hourly，但沒有 workedDays/workedHours，月結應顯示 warning，不應默默當 0 或當月薪。
- 如果 attendance 已有 workedDays，月結的 workedDays input 應只讀或顯示「由出勤管理帶入」，避免兩邊數字不同。

### 6.3 避免衝突的資料優先次序

| 項目 | 優先來源 | 次要來源 | 衝突處理 |
| --- | --- | --- | --- |
| workedDays | 出勤管理 | 月結手動輸入 | 有出勤記錄時，以出勤管理為準 |
| workedHours | 出勤管理 hourly 欄位 | 月結手動輸入 | 未有 hourly 欄位前，月結可暫時輸入 |
| base salary rate | 員工薪酬 profile | 不應由 Excel import 改寫 | rate 有變更要人工改 profile |
| commission volume | 月度 commission import | 月結手動輸入 | import 後由月結確認 |
| commission rate | 員工薪酬 profile / commission config | Excel 僅作核對 | 不自動改 profile |
| final payroll total | 薪資月結總覽 | 不應直接用 Excel total 覆蓋 | Excel total 只作 audit reference |

## 7. 現有系統狀態

目前 Payroll 已有部分邏輯符合以上方向:

- `daily` 員工會以 `baseSalary x workedDays` 計底薪。
- `hourly` 員工會以 `baseSalary x workedHours` 計底薪。
- daily 員工如已有 attendance record，Payroll 會用 attendance 的 `workedDays`。
- daily/hourly 員工不會再用 monthly no-pay scaling 去扣底薪，避免雙重扣減。

但仍有需要補強的位置:

- 出勤管理目前主要保存 `workedDays`，需要確認是否已正式支援 `workedHours`。
- 員工 profile 的日薪提示仍可能寫住 Payroll 暫未自動換算，應更新成現況。
- 月結畫面要更清楚顯示 daily workedDays 是由出勤管理帶入，避免人手再改造成衝突。
- PT/街霸/清潔類員工需要正式 mapping 到 employee profile，不應長期靠 Excel 名稱。

## 8. 建議下一步

1. 先不要 apply April V6 SQL，等確認 20 筆不確定 row。
2. 確認每位 PT/兼職/清潔/街霸員工的 employee profile 是否存在，以及 salary type 是 daily、hourly、street_promoter 還是其他。
3. 在出勤管理補充或確認 hourly workedHours 流程。
4. 在薪資月結總覽增加 daily/hourly warning 及來源標籤。
5. 更新員工 profile 文案，避免仍顯示「Payroll 暫未按工作天數自動換算」。

## 9. 目前不應做的事

- 不應直接用 Excel `COMMISSION` total 覆蓋 Payroll final total。
- 不應因為員工名稱有 `(PT)` 就直接改 salary type。
- 不應自動把 commission sheet 的 rate 寫入員工 profile。
- 不應同時在出勤管理和薪資月結各自輸入不同 workedDays。
