# Payroll / Commission Direction

呢份文件係將目前所有 workbook 分析整合成可落地的系統方向，方便由 agent mode 轉返 plan mode。

相關分析來源:
- [COMMISSION_WORKBOOK_ANALYSIS.md](./COMMISSION_WORKBOOK_ANALYSIS.md)
- [STAFF_PATTERN_MAPPING.md](./STAFF_PATTERN_MAPPING.md)
- 原始 workbook: `/Users/joecheung/Kojin Ai Solution/02-2026_MM(FY)_V8.xlsx`

## 核心結論

你最新建議的方向係正確，亦同 Excel 實際結構最吻合：

1. 有一批 staff 其實係共用同一類公式
2. 有一批 manager / 特殊員工係例外計法
3. 所以系統應該用 `公式模板 + 員工 override`，而唔係每個人硬寫一條獨立公式

換句話講，未來系統唔應該設計成：

- 每位員工一套獨立 hard-code 公式

而應該設計成：

- 大部分員工套用同一個 `commission formula template`
- 少數特殊員工再加 `override / adjustment`

## Excel 已確認到的 sales threshold / 比例結構

### A. 治療師 / 養生師類的共用 sales ratio

在 `SALARY` 第二段佣金 staff row 中，`Y = Sales TL` 已直接見到大量共用模式：

- `=X * 3%`
- `=X * 3.2%`
- `=X * 3.5%`
- `=X * 3.8%`

呢個意思唔係每個人都亂計，而係：

- 大部分 staff 屬於同一個公式 family
- 只係套用唔同 rate

即係系統上應抽成：

- `formula template = sales_tl_percentage`
- `employee parameter = 3% / 3.2% / 3.5% / 3.8%`

### B. Redeem 有統一 tier formula

`SALARY!W27` 已直接確認：

- `< 98000 -> 1%`
- `98001 - 148000 -> 1.2%`
- `148001 - 248000 -> 1.6%`

即係 redeem 呢條其實可以做成一個共用 tier template，而唔需要逐人 hard-code。

### C. 合約文字明確出現 sales threshold table 概念

在 `New Record Update1.4.2023` / `Contract List` 已見到以下類型：

- `Below250000 4% / 250001-500000 4.5% / over 500000 5%`
- `sales 15萬以下 3% / 15萬以上 3.5%`
- `12萬 / 11萬 / 10萬` 對應唔同 package / floor
- `25萬`、`40萬` 等 target thresholds

即係 workbook 入面唔止有固定百分比，仲有：

- sales bracket table
- threshold-to-rate table
- target threshold table
- package floor table

### D. Manager / 店長類係另一套公式 family

`SALARY` row 80+ 已確認：

- `T = team sales`
- `U = manager %`
- `V = T * U`
- `Y = SGM`
- `Z = Y * 5%`

常見 manager percentage：

- `8%`
- `7.5%`
- `7%`
- `6.5%`
- `5%`
- `4.5%`
- `4%`
- `3%`

所以 manager / 店長唔應該同 therapist 共用同一個 template。

## 最適合的系統方向

### 方向 1: 公式模板層

先定義有限數量的 `formula templates`。

目前最少需要：

1. `therapist_standard`
   - Job + Redeem tier + Sales TL % + SGM TL + MPF

2. `therapist_with_package_floor`
   - 標準佣金計法
   - 再同 package floor / target 比較

3. `manager_team_sales`
   - team sales * manager rate
   - bonus
   - SGM * 5%
   - SH/AL TL

4. `telesales_headcount`
   - 包佣 floor
   - 人頭 / 單量分段價錢

5. `hourly_or_pt`
   - 工時 * 單價
   - 可選少量 bonus / adjustment

6. `fixed_salary_support`
   - 固定薪項為主

### 方向 2: 模板參數層

每個模板有自己一組參數，唔使每個員工重新寫公式。

例如 `therapist_standard`：

- `redeem_bracket_table_id`
- `sales_tl_rate`
- `sgm_tl_rate`
- `mpf_mode`

例如 `manager_team_sales`：

- `manager_sales_rate`
- `bonus_lookup_table_id`
- `sgm_tl_rate`
- `shal_tl_unit_rate`

### 方向 3: 員工 assignment 層

每位員工只需要：

- 指向一個模板
- 指定該模板的主要參數值
- 有生效日期

例如：

- `KT -> therapist_standard -> sales_tl_rate=3%`
- `Maymay -> therapist_standard -> sales_tl_rate=3.5%`
- `Yan -> therapist_standard + special override`
- `Sylvia -> manager_team_sales -> manager_sales_rate=8%`
- `Gina -> telesales_headcount -> package_floor=3000`

### 方向 4: 個別 override 層

你講嘅「某一啲 manager 或者夥計可能唔同計法，就比佢自動更改或者修改調整」
呢個就應該做成正式 `override layer`，而唔係直接改模板。

override 應支援：

1. 覆蓋某個 rate
   - 例如 sales TL 由 `3%` 改做 `3.8%`

2. 加一條固定 bonus
   - 例如每 3 個月 1500

3. 設 package floor / target threshold

4. 設 hard override total
   - 例如 `Ella = 42000`

5. 設補發 / 扣回
   - 例如 hold release、追扣

6. 設生效日期 / 結束日期

## 建議的 UI 方向

唔應該讓 user 直接打 raw formula string 做主流程。

應該分 3 層 UI：

### 1. 模板管理

- 建立模板
- 選模板類型
- 設 bracket table / rate / bonus 規則

### 2. 員工 commission profile

- 選擇套用邊個模板
- 設主要參數
- 顯示生效日期

### 3. override / adjustment 區

- 個別 rate override
- 固定 bonus override
- target / package override
- hard-set total
- 扣回 / 補回
- 備註

呢樣就完全符合你講的做法：

- 統一 staff 用統一公式
- 特殊 staff 另外有個位改

## database 方向

之後進 plan mode 時，schema 最少應拆成：

1. `commission_formula_templates`
   - 模板主檔

2. `commission_bracket_tables`
   - bracket table 主檔

3. `commission_bracket_lines`
   - 例如 `<250000 = 4%`, `250001-500000 = 4.5%`

4. `employee_commission_profiles`
   - 員工目前套用邊個模板

5. `employee_commission_profile_values`
   - 員工模板參數值，例如 `sales_tl_rate=3.2%`

6. `employee_commission_overrides`
   - 個別 override / 特殊 bonus / hard-set total / package target

7. `payroll_input_metrics`
   - 每期輸入 base 數字，例如 sales、redeem、job、sgm、人頭

8. `payroll_result_items`
   - 最終計算 line items

## 方向總結

最合理、最穩陣、最接近你而家 Excel 真實世界運作的做法係：

1. 共用公式變模板
2. sales / redeem / package threshold 變 bracket tables
3. 員工只係 assign 去模板
4. 特殊 manager / 特殊 staff 用 override 層處理
5. payroll run 時才把 input metrics 套入模板，出最終結果

## 建議下一步

當你轉返 plan mode，最應該做的第一步唔係直接寫所有 UI，而係：

1. 先定義 template families
2. 再定義 bracket tables
3. 再定義 employee profile + override schema
4. 最後先做 payroll calculation engine

呢樣會比「每個人一條 Excel 公式搬入系統」穩定得多，亦易維護得多。
