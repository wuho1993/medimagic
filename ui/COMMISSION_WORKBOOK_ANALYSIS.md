# 佣金工作簿分析紀錄

來源工作簿: `/Users/joecheung/Kojin Ai Solution/02-2026_MM(FY)_V8.xlsx`

分析方式:
- 用 `openpyxl` 以唯讀模式抽出 sheet 結構、預覽列、header 線索、關鍵 formula
- 中間抽取結果存放於 `/tmp/commission_workbook_analysis.json`
- 本文件只記錄目前已由 workbook 直接確認到的資訊，避免把推測當成規則

## 已確認的工作表

- `SALARY`
- `街霸`
- `Cash同事`
- `Contract List`
- `New Record Update1.4.2023`
- `COMMISSION`
- `Booking-Redeem`
- `出勤`
- `ASAS BANK`
- `ASA BANK`
- `Payment 1`
- `Payment 2`

## 目前可直接確認的薪酬 / 佣金結構

### 1. `SALARY` 係主薪金計算表

`SALARY` 內已見到以下欄位組合:

- `Staff Number`
- `底薪`
- `勤工`
- `大會`
- `預約`
- `車津`
- `特別備註`
- `計糧天數`
- `當月天數`
- `Staff Name`
- `Basic`
- `Atten`
- `Briefing`
- `Booking`
- `車津貼`
- `Job`
- `REDEM`
- `Sales`
- `Sales TL`
- `SGM`
- `SGM TL`
- `Bonus`
- `包佣`

代表現有 Excel 並唔係只計固定底薪，而係將固定薪項、表現佣金、team lead 類佣金、bonus、包佣一起結算。

### 2. `Sales TL` / `SGM TL` / `Bonus` 已有獨立欄位

呢個點好重要，因為即係話系統設計唔可以只得一個「commission_amount」欄位，而係要分 item / rule type。

`SALARY` 抽到的公式證據:

- `AN2 = SUM(P2:T2,Y2)`
- `AR2 = ROUND(IF(AN2>30000,1500,IF(AN2<7200,0,AN2*5%)),2)`
- 同類 `AR3` 至 `AR28` 都重覆呢個邏輯

由目前抽取結果可推斷:

- `AN` 係某種佣金基礎總和，包含 `P:T` 同 `Y`
- `AR` 係一條 threshold rule:
  - 大於 `30000` 時固定出 `1500`
  - 小於 `7200` 時出 `0`
  - 中間區間出 `5%`

呢條規則明顯唔係單純固定百分比，而係跳級 / 封頂式 bonus rule。

### 3. `SGM TL = SGM * 5%` 由 workbook 直接支持

`COMMISSION` sheet 抽到:

- header 有 `Redeem`, `SALES`, `SGM`, `Total`
- 明確公式如 `K2 = SUM(J2*5%)`

即係 `SGM TL` 或對應 SGM bonus 類項目，確實有直接按 `SGM * 5%` 計法，呢點同你之前口述規則一致。

### 4. `Redeem` 同 `Sales` 係分開計，唔係同一條佣

`COMMISSION` sheet 顯示:

- `Redeem` 旁邊見到 `0.01`
- `SALES` 旁邊見到 `0.03`
- row 2-12 例子大量使用:
  - `Redeem = E*1%`
  - `Sales = G*3%`

即係至少喺其中一批員工 / 其中一張表，存在:

- Redeem commission = 1%
- Sales commission = 3%
- SGM commission = 5%

但呢個唔代表全公司所有人都係同一百分比，因為其他 sheet 已清楚顯示有個別包佣、跳 bar、特殊備註。

補充確認:

- `SALARY!W27` 已成功抽出 array formula 原文:
   - `=_xlfn.IFS(V27<98000,V27*1%,AND(V27>98001, V27<148000),V27*1.2%,AND(V27>148001, V27<248000),+V27*1.6%)`

即係 `V` 欄 redeem base，再經 `W` 欄套用 tiered redeem commission：

- `< 98000 -> 1%`
- `98001 - 148000 -> 1.2%`
- `148001 - 248000 -> 1.6%`

呢條同你之前口述的 redeem jump-tier 規則一致。

### 5. `街霸` 係按人頭 / 開單區間計，而唔係普通百分比

`街霸` sheet 直接見到:

- `30-40 -> 5000`
- `41-50 -> 7000`
- `51-60 -> 9000`
- `計開單`
- `10-20 +1%`
- `21-30 +2%`
- `>31 +3%`

呢度可直接確認兩層規則存在:

- 以人頭 / 數量分段出固定金額
- 另有開單表現的分段百分比

即係街霸唔可以套一般 therapist / sales 的 redeem-sales-sgm 百分比模型。

### 6. `Booking-Redeem` 係目標 vs 實際 tracking 表

`Booking-Redeem` 內多個分店區塊都重覆以下欄位:

- `目標人頭`
- `實際人頭`
- `目標REDEEM`
- `實際REDEEM`
- `REMARKS`

而且 workbook 內有備註例如:

- `需扣$500`
- `需扣繳500`

即係除咗計佣金外，仲有基於 booking / redeem 達標情況的扣減或調整。呢類資料未必直接係最終 payroll item，但一定係 rule input。

### 7. `Contract List` / `New Record Update1.4.2023` 有員工級特殊合約規則

兩個 sheet 都見到大量非標準化文字規則，例如:

- `包佣3000`
- `包佣`
- `包薪(佣)`
- `包薪(佣)期限`
- `35000(佣24000)/30000(佣19000)?`
- `1/7/2023(包7000工+REDEEM)`
- `Below2500004%    250001-500000 4.5%  over 500000 5%`
- `1/4/2023開始加JOB,SALES,REDEEM`
- `3000佣`
- `包佣30000.要達到個人數450,000，如不足全數八折出糧,8折後36000`
- `包佣35000.要達到個人數250,000，如不足30000`

由呢批資料可直接確認:

- 有員工級別的包佣 / 包薪規則
- 有開始生效日期
- 有以個人業績門檻決定是否 full package 或打折出糧
- 有某啲包佣方案將 `工 + REDEEM` 綁埋
- 有些員工於特定日期起新增 `JOB / SALES / REDEEM` 項目

所以未來 database 唔可以只存一個 `commission_type`，而係要支援:

- 規則版本
- 生效日期
- 員工個別 override
- 最低保底 / 包佣 floor
- 達標不足時的折扣或 fallback 金額

### 8. `Cash同事` 係支付拆帳 / 發薪分拆，不係純計佣

`Cash同事` sheet 直接引用 `SALARY` cell，例如:

- `=SALARY!AP30`
- `=SALARY!AT30`
- `=SALARY!AP62+1500`

另有備註:

- `12K by bank, other by cheque, fro Jun to Nov`

即係 payroll engine 之後除咗要算總數，仲要支援 payment allocation / payment breakdown。

## `SALARY` 同 `COMMISSION` 的關係

而家已直接核對到，`COMMISSION` sheet 係 `SALARY` 第二段佣金 staff 的上游輸入表，而唔係另一份無關報表。

已確認對應例子:

- `COMMISSION!B2/C2/D2/E2/G2` 對應 `SALARY` row 27 的 `SF006 / KT / Job / Redeem / Sales`
- `COMMISSION!B5/C5/D5/E5/G5` 對應 `SALARY` row 30 的 `SF066 / Yan / Job / Redeem / Sales`
- `COMMISSION!B6/C6/D6/E6/G6` 對應 `SALARY` row 31 的 `SF102 / Carol / Job / Redeem / Sales`
- `COMMISSION!B7/C7/D7/E7/G7` 對應 `SALARY` row 32 的 `SF014 / Jess / Job / Redeem / Sales`
- `COMMISSION!B8/C8/D8/E8/G8` 對應 `SALARY` row 33 的 `SF065 / Chun Chun / Job / Redeem / Sales`

關係模式:

- `COMMISSION.D = SALARY.U` (`Job`)
- `COMMISSION.E = SALARY.V` (`Redeem base`)
- `COMMISSION.G = SALARY.X` (`Sales base`)
- `SALARY.W` 會對 `V` 再套 redeem tier formula
- `SALARY.Y` 會對 `X` 再套 staff-specific `Sales TL %`
- `SALARY.AA` / `SGM TL` 會對 `SGM` 再套 `5%`
- `SALARY.AN` 先彙總各 line items，再出 `AP/AT` 付款分拆

即係實際計糧流程唔係直接喺 `COMMISSION` 完結，而係：

1. `COMMISSION` 提供 `Job / Redeem / Sales / SGM` base
2. `SALARY` 套員工級公式
3. `SALARY` 匯總 total、MPF、7th / 20th payment split

## 全體 staff pattern

根據 `Contract List`，現時工作簿內 staff role pattern 至少有以下大類:

- `治療師` 26 人
- `養生師` 10 人
- `接待員` 7 人
- `店長` 6 人
- `經理` 4 人
- `清潔員` 3 人
- `老闆` 2 人
- `顧問` 2 人
- `培訓老師` 2 人
- 其餘單一角色:
   - `會計經理`
   - `客戶服務主管`
   - `街霸`
   - `文員`
   - `行政助理`
   - `電話銷售員`
   - `美容動畫設計師`
   - `營運總監`
   - `營運經理`
   - `行銷主管`
   - `醫生護士`
   - `曾醫師`

如果從 commission/payroll 行為去分，唔係只睇職位，而係應該拆成以下 pattern：

### Pattern A: 固定薪項 / 非佣金主導

例子:

- 行政
- 文員
- 會計經理
- 美容動畫設計師
- 醫生護士
- 部分接待 / 後勤

特徵:

- 主要係 `Basic + Atten + Briefing + Booking + 車津`
- 少或無 `Job / Redeem / Sales / SGM`
- 仍可能有 MPF / payment split

### Pattern B: 治療師 / 養生師個人佣金型

例子:

- `KT`
- `Maymay`
- `Winnie`
- `Carol`
- `Jess`
- `Chun Chun`
- `Anna`
- `Wendy`

特徵:

- `COMMISSION` 先提供 `Job / Redeem / Sales`
- `SALARY.W` 套 redeem tier
- `SALARY.Y` 套個人 `Sales TL %`
- 常見 `Sales TL %`：`3%`、`3.2%`、`3.5%`、`3.8%`

### Pattern C: 包佣 / 包薪 floor 型治療師 / 養生師

例子:

- `Chilly`
- `Emily`
- `Esther`
- `ICY`
- `Pinky`
- `Vanessa Chung`
- `雯雯`
- `Rachel`
- `Yan`
- `Lok Yi`

特徵:

- `Contract List` 有 `包佣` / `包薪(佣)` / `Target` / 特定文字條款
- 會出現 `12萬 / 25萬 / 40萬` 等門檻
- package 未必永久，有 `開始CUT包薪` 或限期

### Pattern D: 特殊個人 override 型

例子:

- `Ling`: 無 redeem，sales 低於 15 萬用 `3%`，15 萬以上 `3.5%`，另有每 3 個月 1500、每年 8 月 10000 bonus
- `Jess`: `Sales + SH另計, 不計包內`
- `Yan` / `Lok Yi`: 備註與 jump bar 特別處理有關
- `Jackie`: `0.01% + 個人5%`

特徵:

- 唔可以靠 role template 完全覆蓋
- 必須有 employee override layer

### Pattern E: 店長 / 經理 / 主管 / 顧問 team-lead 型

例子:

- `Dorcas`
- `Jacqueline`
- `Karrie`
- `Yena`
- `Ella`
- `Candy`
- `Jackie`

特徵:

- `SALARY` 後段 row 80 之後見到另一種結構
- `Job` 欄可能直接放 `%`，例如 `0.08`, `0.075`, `0.05`, `0.07`
- `Redeem` 可能係 `=T*U`
- `SGM` / `Sales TL` 可能直接係固定 bonus 或另一路 team metric
- 呢組唔係 therapist 個人 sales formula，而係 team / manager formula

### Pattern F: 電話銷售員

目前已確認員工:

- `SF250 Gina`

條款:

- `包佣3000`
- `$18,000, 1-40 $40 40-80 $50 >80 $60`

即係電話銷售員至少同時有:

- 包佣 floor
- 以人頭 / 單量分段計算的 variable part

### Pattern G: 街霸

目前已確認員工:

- `Dan`
- 另一位 row 81 未見 nickname，但職位亦係 `街霸`

條款來源:

- `街霸` sheet
- `Contract List` 特殊列

特徵:

- 人頭區間固定金額
- 開單數量再加百分比

### Pattern H: PT / hourly / cleaner 型

例子:

- `Tammy`
- `Hebe`
- 清潔員
- 部分 `PT` 治療師 / 養生師

特徵:

- `SALARY` 見到 `/hr`、`小時`、`P = K * C`
- 主要按工時，不應套用一般美容師佣金模型

## 已確認的規則類型

根據 workbook，目前至少存在以下 rule archetypes:

1. 固定百分比
   - 例: `Redeem 1%`, `Sales 3%`, `SGM 5%`

2. 門檻跳級 bonus
   - 例: `<7200 = 0`, `7200-30000 = 5%`, `>30000 = 1500`

3. 人頭 / 數量分段固定金額
   - 例: `30-40 = 5000`, `41-50 = 7000`, `51-60 = 9000`

4. 開單數量分段百分比
   - 例: `10-20 +1%`, `21-30 +2%`, `>31 +3%`

5. 包佣 / 包薪 floor 對比實際佣金
   - 若達標不足，可能全數打折，或者改出另一個 fallback package

6. 生效日期版本化規則
   - 例: `1/4/2023開始...`, `1/7/2023...`

7. 項目增減型規則
   - 某員工某日期起先開始計 `JOB`, `SALES`, `REDEEM`

8. 支付方式分拆
   - 銀行 / cheque / cash 分段發放

## 對 database / intranet 的直接影響

### Database 需要新增的核心概念

- `payroll_periods`
- `payroll_runs`
- `payroll_line_items`
- `commission_rule_sets`
- `commission_rules`
- `employee_commission_assignments`
- `employee_commission_overrides`
- `performance_inputs`
  - redeem
  - sales
  - sgm
  - booking
  - headcount
  - attendance days
- `package_guarantees`
- `payroll_payment_splits`

### UI / Intranet 需要新增的核心畫面

- 員工層級 commission profile
- 規則模板管理
- 包佣 / 達標門檻管理
- 每期 payroll input 匯入 / 人手調整
- payroll calculation preview
- line item drill-down
- payment split 管理

## 目前未能 100% 確認的位

- 你之前講的 `Redeem commission = IFS(...)` 三段式百分比，現時在已抽出的 JSON 未見到完整同式公式原文
- `Sales TL` jump bar 的完整公式未直接在已抽取 JSON 見到，只確認 `Sales TL` 欄位存在，及 workbook 確實有 threshold / jump bar 類規則
- `電話銷售員` 的完整計法未完整抽出，只確認其分類存在，以及有 `包佣3000`、`3000佣` 類規則
- `包佣 vs 浮動收入` 的最終比較公式未直接見到 Excel 公式原文，但從多個文字備註可確認此類邏輯確實存在

## 現階段結論

可以肯定目前 payroll/commission 唔係單一百分比模型，而係一個混合式規則引擎，最少包含:

- 固定薪項
- 多種 commission base
- TL / bonus 類衍生規則
- 人頭 / 開單分段
- 包佣 floor
- 達標門檻
- 員工個別合約文字 override
- 生效日期版本
- 支付拆帳

所以下一步唔應該只係喺現有 `employee_salary_profiles` 加幾個欄位，而係要正式拆出 payroll/commission domain model。
