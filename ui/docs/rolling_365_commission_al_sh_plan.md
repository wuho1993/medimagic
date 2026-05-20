# Rolling 365 Average Commission and AL/SH Compensation Plan

## 目標

將現時 Excel / V8 手動計算的 365 日平均佣金，自動整合到 HRMS Payroll 及出勤管理，用於計算 AL / SH 補償，並加入勞工處 12 個月平均工資合規檢查。

## 已確認業務規則

- AL/SH 補償只計 `AL + SH`。
- Package 佣金屬於佣金，計入 365 日平均佣金。
- 2025-04 至 2026-03 歷史數據以 `Mar_SALARY統計2026.xlsx` 作 seed，不用 HRMS 重算。
- 2026-04 起由 HRMS Payroll + Attendance 自動累積。
- 計當月 Payroll 時使用截至上一個已完成月份的 rolling average，避免當月 commission 和 AL/SH 補償互相循環。
- 員工入職不足 365 日，分母用實際可計算日數，上限 365。
- 實際出糧先沿用 V8 / Excel 做法：`平均每日 commission × AL/SH 日數`。
- 同時計算完整 12 個月平均工資合規檢查。如現有補償低於法例最低補差額，提示或補至較高者。
- 出勤管理的遲到欄位改以每月累積遲到時間/分鐘理解；每月累積超過 30 分鐘才扣勤工獎。
- 如每月累積遲到時間不超過 30 分鐘，Payroll 不扣勤工，糧單不顯示遲到扣勤工提示。
- 遲到時間只計當月累積，不會 carry forward 到下個月；每個月重新由 0 開始。
- 糧單需要在酌情佣金/佣金明細位置顯示實際銷售大數，方便員工核對佣金來源。

## 現有 Excel / V8 理解

### `Mar_SALARY統計2026.xlsx`

- `YEAR2` 每個員工佔兩行。
- 每個月份佔三欄。
- 月份 commission = `總出糧 - MPF - 固定工資基數`。
- `AN` = 最近 12 個月 total commission。
- `AP` = 每日平均 commission。
- `AP = AN / 現職同事!K`。
- `現職同事!K` = 可計算日數，上限 365；入職不足 365 日用較短期間。

### V8 SALARY

- `SH/AL` 有兩欄：日數及金額。
- 金額公式例子：`每日平均 commission × SH/AL 日數`。
- 即 HRMS 第一版 payroll 實際補償應跟此邏輯，方便核對。

## 勞工法例合規理解

勞工處的完整概念是 `12 個月平均工資`，而工資包括底薪、佣金、津貼等工資組成部分。

完整法例檢查公式：

```text
法例每日平均工資 = 12 個月全部工資 / 可計算日數
當月固定每日工資 = 當月固定工資 / 計薪日數
法例最低補差額 = max(法例每日平均工資 - 當月固定每日工資, 0) × AL/SH 日數
```

實際出糧用：

```text
現有補償 = 平均每日 commission × AL/SH 日數
最終補償 = max(現有補償, 法例最低補差額)
```

如果 `現有補償 < 法例最低補差額`，Payroll 需要提示：

```text
AL/SH 補償可能低於 12 個月平均工資要求，請確認或自動補至較高者。
```

## 資料模型建議

### `commission_average_employee_mappings`

用途：確認 Excel row 對應 HRMS employee code，避免 seed 入錯人。

欄位：

```text
id
source_file
source_sheet
source_row
source_code
source_alias
source_name
matched_employee_code
match_status: confirmed / needs_review / excluded
match_confidence
remark
created_at
updated_at
```

已知 mapping 決定：

```text
SF363 Chrissy -> excluded；已離職/非 active HRMS，不匯入 seed
SF373 Haley -> excluded；已離職/非 active HRMS，不匯入 seed
SF131 JUMBO -> SF189
SF370 Yu -> NA-05，不是 Ashley
街霸01 Dan Wu -> NA-11
街霸02 Lily -> NA-12
街霸03 Wu Anru -> NA-13
```

### `employee_commission_average_seed`

用途：保存 `2025-04` 至 `2026-03` Excel baseline。

欄位：

```text
id
employee_code
period_start
period_end
total_commission
eligible_days
daily_average_commission
source_file
source_row
created_at
```

來源：

```text
total_commission = YEAR2!AN
daily_average_commission = YEAR2!AP
eligible_days = 現職同事!K
```

### `employee_commission_average_monthly`

用途：2026-04 起由 HRMS payroll final 後自動生成 monthly source。

欄位：

```text
id
employee_code
year_month
average_commission_amount
eligible_days
source: payroll
payroll_record_id nullable
created_at
updated_at
```

`average_commission_amount` 包括：

```text
redeem commission
sales commission
sgm commission
job commission
street promoter commission
shop commission
package commission
other commission-classified variable pay
```

不包括：

```text
底薪
勤工
大會
預約
車津
MPF
非工資性 reimbursement
```

## Rolling 365 Calculator

Helper：

```text
calculateRollingAverageCommission(employeeCode, selectedMonth)
```

Cutoff：

```text
selectedMonth 上一個月月底
```

例子：

```text
2026-05 payroll 用到 2026-04
2026-06 payroll 用到 2026-05
```

計算：

```text
rolling_total_commission = seed + HRMS monthly records within window
eligible_days = min(365, hire_date 至 cutoff 日數) - excluded_days
daily_average_commission = rolling_total_commission / eligible_days
```

第一版 excluded days 先跟 Excel seed / 實際在職日數。第二版再加入無薪假、半薪假等法例剔除期。

## Attendance 整合

Attendance 只負責日數：

```text
AL days = annual_leave_days
SH days = statutory_holiday_days
AL/SH days = AL + SH
```

出勤頁提示：

```text
AL/SH 日數會在 Payroll 自動按 365 日平均佣金及 12 個月平均工資合規檢查計算補償。
```

遲到規則：

```text
late_minutes = 每月累積遲到分鐘
if late_minutes > 30:
  扣勤工獎
else:
  保留勤工獎，不在糧單顯示遲到扣減
```

遲到分鐘不會累計到下一個月。

第一階段可沿用現有 DB 欄位 `late_days` 存數值，但 UI 文案及 Payroll 邏輯改成「遲到分鐘」。第二階段再考慮正式 migration 改名或新增 `late_minutes` 欄位，避免歷史資料誤解。

## Payroll 整合

Payroll 每個員工 row 加：

```text
365 日平均佣金
AL 日數
SH 日數
AL/SH 平均佣金補償
法例最低補差額
最終 AL/SH 補償
合規狀態
```

實際計糧：

```text
alShCommissionPay = dailyAverageCommission × (annualLeaveDays + statutoryHolidayDays)
legalMinimumTopUp = max(legalDailyAverageWage - fixedDailyWage, 0) × (annualLeaveDays + statutoryHolidayDays)
finalAlShPay = max(alShCommissionPay, legalMinimumTopUp)
```

若 `finalAlShPay > alShCommissionPay`，顯示 warning 並列明差額。

## Payslip 顯示

Payslip 加 line item：

```text
AL/SH 平均佣金補償
```

糧單酌情佣金/佣金明細位置加：

```text
實際銷售額大數 / Sales Amount Total
```

可補充顯示：

```text
Average commission: $x.xx/day × y days
Legal top-up: $z.zz if applicable
```

## 查詢頁建議

新增頁面：

```text
/app/payroll/average-wages
```

或於 Payroll 加 tab：

```text
12個月平均工資 / AL-SH 補償
```

用途：

- 查詢 rolling average。
- 檢查 Excel seed / HRMS payroll source。
- 顯示員工 mapping 狀態。
- 顯示 AL/SH 補償與法例合規狀態。

## 實作 Todo

1. 建立 Excel-to-DB mapping review。
2. 建立 seed / monthly source DB schema。
3. 匯入 `Mar_SALARY統計2026.xlsx` seed，但只匯入 confirmed mapping。
4. 建 rolling 365 calculator。
5. Payroll 讀 attendance AL/SH 日數。
6. Payroll 加 AL/SH average commission pay。
7. Payroll 加 12 個月平均工資合規檢查。
8. Payslip 加 AL/SH 補償 line item。
9. 新增內聯網查詢頁。
10. 用 V8 及 `Mar_SALARY統計2026.xlsx` 核對樣本。
11. 出勤遲到欄位改成遲到分鐘語義，並更新勤工獎扣減規則。
12. 糧單顯示實際銷售大數。
13. 全內聯網檢查漏洞、矛盾及資料流一致性。

## 全內聯網一致性檢查範圍

- People Profile：佣金設定、package、入職日、離職日、身份資料。
- Attendance：AL/SH 日數、計薪日數、無薪假、病假。
- Payroll：commission source、AL/SH 補償、MPF relevant income、payslip。
- MPF：AL/SH 補償是否屬 MPF relevant income 需要確認。
- Audit：員工 mapping、無平均佣金但有 AL/SH、非佣金員工被誤計。
- Import：Excel seed 不應覆蓋 HRMS 新月份資料。
- Permissions：只有 payroll/admin 可修改 mapping / seed。
