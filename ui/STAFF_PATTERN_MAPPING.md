# Staff Pattern Mapping

來源:
- `Contract List`
- `SALARY`
- `COMMISSION`

註記:
- 依份文件先做你要求的 `1` 同 `3`
- `街霸` sheet 內 `10-20 +1% / 21-30 +2% / >31 +3%`，按你最新指示，現階段先 `ignore`
- Pattern 係按 payroll / commission 行為分類，唔係純職位分類

## Pattern 定義

- `P1 固定薪項 / 支援職系`
  - 主要以底薪、勤工、固定津貼為主
  - 無主要 commission engine 依賴

- `P2 治療師 / 養生師標準佣金`
  - `COMMISSION` 提供 `Job / Redeem / Sales`
  - `SALARY.W` 套 redeem tier
  - `SALARY.Y` 套 sales TL %

- `P3 包佣 / 包薪 floor`
  - 有 `包佣`、`包薪(佣)`、`Target`、`開始CUT包薪` 等條款
  - 需要比較 floor 同 variable income

- `P4 個人 override`
  - 有特殊文字規則
  - 唔可以單靠 role template 計

- `P5 店長 / 經理 / 顧問 / 管理層 team formula`
  - `SALARY` row 80+ 模型
  - 以 team sales、百分比、bonus、SGM TL 為主

- `P6 電話銷售員`
  - 包佣 + 人頭分段單價

- `P7 街霸`
  - 暫保留分類，但你指定忽略舊分段百分比規則

- `P8 PT / hourly / 清潔 / 鐘點`
  - 主要按小時或 PT 模式出糧

## 全 staff pattern 名單

| Staff | Role | Pattern | Evidence |
| --- | --- | --- | --- |
| Alice | 治療師 | P3 | `15000 / 26000` |
| Amanda | 接待員 | P1 | 無 commission 條款 |
| Anna | 養生師 | P3 | `16300 / 26000` |
| April | 老闆 | P1 | 固定高層，無 commission 條款 |
| Barry | 會計經理 | P1 | 無 commission 條款 |
| Bo Yi | 接待員 | P1 | 無 commission 條款 |
| Candy | 顧問 | P5 | 顧問類，`21000 / 33000` |
| Candy Kam | 養生師 | P3 | `19200 / 30000` |
| Canice | 客戶服務主管 | P1 | 無 commission 條款 |
| Carman | 培訓老師 | P1 | 無 commission 條款 |
| Carol | 治療師 | P3 | `14800 / 25000` |
| Cat | 養生師 | P3 | `16500 / 26000`，已離職 |
| Chilly | 治療師 | P3 | `<17500/16500/15500` + `12萬/11萬/10萬` |
| Dan | 街霸 | P7 | 街霸分類；舊 `%` 規則暫 ignore |
| Dorcas | 店長 | P5 | `SALARY` row 81 manager formula |
| Ella | 經理 | P5 | `25700 / 42000` + manager formula |
| Emily | 治療師 | P3 | `12500 / 22000` |
| Esther | 養生師 | P3 | `15000 / 25000` |
| Fanny | 文員 | P1 | 無 commission 條款 |
| Gify | 行政助理 | P1 | 無 commission 條款 |
| Gina | 電話銷售員 | P6 | `包佣3000` + `$18,000, 1-40 $40 40-80 $50 >80 $60` |
| Helen | 美容動畫設計師 | P1 | 無 commission 條款 |
| ICY | 治療師 | P3 | `17700 / 28000` |
| Iris | 店長 | P5 | `SALARY` row 87 manager formula |
| Jackie | 營運總監 | P5 / P4 | `0.01%+個人5%` 特例 |
| Jacqueline | 店長 | P5 | `21500 / 45000` + manager formula |
| Jay | 治療師 | P3 | `22000/25000` + `1/4/2025開始CUT包薪` |
| Jess | 養生師 | P3 / P4 | `26000,包工13500`，另有 `Sales+SH另計,不計包內` |
| Joey | 治療師 | P3 | `7000 / 16500` |
| Jojo | 養生師 | P3 | `13200 / 23000` |
| Jumbo | 治療師 (PT) | P8 | `6300 / 13500`，PT |
| Karrie | 經理 | P5 | `20000 / 36000` + manager formula |
| Ki Ki | 養生師 | P3 | `11300 / 21000` |
| Kitty | 治療師 (自) | P3 | `16300 / 26000` |
| KT | 治療師 | P2 | `COMMISSION -> SALARY` 標準映射 |
| Lanke | 店長 | P5 | `SALARY` row 85 manager formula |
| Ling | 治療師(PT) | P4 / P8 | `每3個月1500`、`每年8月尾有$10000獎金` |
| Lok Yi | 治療師 | P3 / P4 | `TBC` + `Lok Yi/Yan` 特殊備註 |
| MAY(CS) | 接待員 | P1 | 無 commission 條款 |
| Maymay (SF249) | 治療師 | P2 / P3 | `16500 / 28000`，同時在 `COMMISSION` 有標準映射 |
| Maymay (SF334) | 治療師 | P3 | `15800 / 25000` |
| May姐 | 清潔員 | P8 | 清潔員 |
| Me | 養生師 | P3 | `13000 / 23000` |
| Mika | 治療師 | P3 | `25000` + `1/4/2025開始CUT包薪` |
| Miki | 接待員 | P1 | 無 commission 條款 |
| MING | 治療師 | P3 | `9800 / 19000` |
| Mon | 接待員 | P1 | 無 commission 條款 |
| Mona | 清潔員 | P8 | 清潔員 |
| Monica | 接待員 | P1 | 無 commission 條款 |
| Moon | 經理 | P5 | `SALARY` row 86 manager formula |
| Moon(B) | 養生師 | P3 | `22000(包工2000?)` |
| Penny | 培訓老師 | P1 | 無 commission 條款 |
| Pinky | 治療師 | P3 | `15800 / 26000` |
| Rachel | 治療師 | P3 | `<18,500/12,900` + `12萬` + `28000/22400` |
| Santo | 營運經理 | P1 | 合約表未見佣金條款 |
| Su | 老闆 | P1 | 固定高層 |
| Sugar | 治療師 | P3 | `17500 / 27000` |
| Sunny | 行銷主管 | P1 | 合約表未見佣金條款 |
| Sylvia | 店長 | P5 | `SALARY` row 80 manager formula |
| Tracy | 接待員 | P1 | 無 commission 條款 |
| Vanessa | 治療師 | P3 | `24000` + `1/3/2025開始CUT包薪` |
| Vanessa Chung | 治療師(PS) | P3 | `<24000/19000` + `25萬` + `35000/30000` |
| Vincci | 醫生護士 | P1 | 無 commission 條款 |
| Water | 養生師 (PT) | P8 / P3 | `PT14,000/FT28,000` |
| Wendy | 治療師 | P3 | `12700 / 22000` |
| Wing | 治療師 | P3 | `13000 / 23000` |
| Winnie | 治療師 | P3 | `16200 / 27000` |
| Yan | 治療師 | P3 / P4 | `24000` + `Lok Yi/Yan` 特殊備註 |
| Yan Wong | 治療師 | P3 | `18700 / 30000` |
| Yena | 店長 | P5 | `43500 / 60000` + manager formula |
| Yvonne | 經理 | P5 | `24000 / 40萬 / 40000` |
| ZOE | 顧問 | P5 | `$45,000/$36,000包$15,000` |
| 呀晴 | 治療師 | P3 | `15200 / 25000` |
| 珍珍 | 治療師 | P3 | `9800 / 20000` |
| 貞姐 | 清潔員 | P8 | 清潔員 |
| 曾醫 | 曾醫師 | P1 | 無 commission 條款 |
| 雯雯 | 治療師 | P3 | `20000 / 29000` |

## Row 80+ Manager / 店長公式拆解

`SALARY` row 79 已直接定義後段表頭：

- `T = Sales`
- `U = %`
- `V = Sales TL`
- `W = 鋪數`
- `X = BONUS`
- `Y = SGM`
- `Z = SGM TL`
- `AA = Bonus`
- `AB = SH/AL`
- `AC = 之前比多,需扣回`
- `AD = SHTL`
- `AE = Sick L`
- `AF = SL`
- `AK = 包佣`
- `AN = Total all`
- `AP = 7th`
- `AR = MPF`
- `AT = 20th`

### Manager formula 主模型

適用 rows:

- 80 `Sylvia`
- 81 `Dorcas`
- 82 `Jacqueline`
- 83 `Karrie`
- 84 `Yena`
- 85 `Lanke`
- 86 `Moon`
- 87 `Iris`
- 88 `YY`
- 89 `Candy`
- 90 `Ella`
- 91 `Zoe`
- 93 `Jackie`

主公式結構:

1. `T = team sales base`
   - 例: `T80 = 896590`
   - 對應 `COMMISSION.G`

2. `U = manager rate`
   - 例:
   - `Sylvia = 8%`
   - `Dorcas = 7.5%`
   - `Jacqueline = 8%`
   - `Karrie = 5%`
   - `Yena = 7%`
   - `Lanke = 4.5%`
   - `Moon / Iris / YY / Candy = 4%`
   - `Ella = 4.5%`
   - `Zoe = 3%`
   - `Jackie = 6.5%`

3. `V = T * U`
   - 即 manager 的主要 sales TL / team commission

4. `X = fixed bonus`
   - 例如 `Sylvia = 3000`
   - `Dorcas = 2500`
   - `Karrie = 500`
   - `Yena = 3000`

5. `Y = SGM`
   - 例如 `Sylvia = 4440`
   - `Yena = 40600`
   - `Moon = 19500`
   - `Jackie = 5000`

6. `Z = Y * 5%`
   - 即 manager section 內，`SGM TL = SGM * 5%`

7. `AD = per-unit * AB`
   - `AB` 似係 `SH/AL` 數量
   - `AD` 係其對應 TL 金額

8. `AN = total`
   - 將 `V / X / Z / AD` 加返固定薪項等全部彙總

9. `AR = MPF`
   - manager section 用嘅係:
   - `IF(AN > 30000, 1500, AN * 5%)`
   - 呢段比 therapist section 少咗 `<7200 = 0` 嗰層

10. `AT = 20th payment`
   - `AT = AN - AP - AR`

### 同 `COMMISSION` 的對應

manager / 店長 section 同樣有上游關係，但 mapping 同 therapist 段唔完全一樣。

可確認:

- `COMMISSION.G -> SALARY.T` (`Sales`)
- `SALARY.U` 係 manager percentage，不係由 `COMMISSION` 直接抄值
- `COMMISSION.J -> SALARY.Y` (`SGM`)
- `SALARY.Z = Y * 5%`

部分 row 仲見到 `COMMISSION.H = VLOOKUP(...)`，而 `SALARY.X` 會出現對應 bonus 數，例如:

- `Sylvia -> 3000`
- `Dorcas -> 2500`
- `Yena -> 3000`

所以 `X` 大機會係來自另一張 lookup table 的 bonus 結果。

### 特例

- `Jackie`
  - `W93 = 4813939.4 * 0.1%`
  - `Y93 = 5000`
  - 呢條同合約備註 `0.01%+個人5%` 明顯屬於個人特例

- `Ella`
  - `AN90 = 42000`
  - 即 total 直接被 hard-set / floor override，唔係純用加總結果

- `Zoe`
  - `AP91 = 0`
  - `AR91 = 0`
  - `AU91 = 19800`，備註 `因為之前HOLD起左19800,今個月比返`
  - 屬於補發 / hold release case

- `Alferd`
  - row 92 結構比較簡化
  - `AN92 = P + Q + R + S + V`
  - 無 bonus / SGM / MPF

- `Dr Chung`
  - row 94 只見 `P = K * C`
  - 明顯唔屬於 manager TL 模型

## 現階段可作系統設計的結論

1. therapist / wellness 同 manager / 店長 係兩條不同 payroll formula family
2. `COMMISSION` 只係上游 base input，最終規則仍在 `SALARY`
3. manager family 最少需要支援:
   - team sales base
   - manager rate
   - lookup bonus
   - SGM
   - SGM TL
   - SH/AL TL
   - hard override total
   - hold / release adjustments
4. street promoter 舊 `%` 條款現階段可先不落系統規則
