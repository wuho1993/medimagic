Medi Magic HRMS Staff Import Preparation
Generated: 2026-04-15

1. Current live Supabase state

- Current remote employee count: 8
- Current remote employee codes:
  - SF001
  - SF002
  - SF003
  - SF004
  - SF005
  - SF006
  - SF007
  - SF008
- Current companies:
  - ASA
  - ASAS
- Current active branch codes in remote master:
  - OFFICE
  - TAIWAI
  - TW
  - MKTOP
  - TMA
  - MOS
  - CBA
  - MKCY
- Current positions in remote master:
  - BEAUTICIAN / 美容師
  - CONSULTANT / 顧問

2. Source files currently available

- Source workbook: `02-2026_MM(FY)_V8.xlsx`
  - Available outside the UI repo and successfully parsed.
  - Current non-commission staging is built from the `Contract List` sheet.
- Supporting sheets reviewed:
  - `SALARY`
  - `出勤`
  - `ASAS BANK`
  - `ASA BANK`
- Commission-related sheets exist in the workbook, but are intentionally excluded from this import batch.

3. Important conclusion before import

- SF011 and SF102 appear in the workbook source and should be treated as real import rows, not mock rows.
- They should not be deleted as part of the upcoming full staff import preparation.
- Earlier seed examples for SF011 / SF102 in old migrations are legacy examples only; the workbook confirms these staff codes belong to the real source dataset.

4. Staging results

- Total staged rows from `Contract List`: 76
- Clean rows ready for import SQL: 40
- Review rows excluded from SQL: 36
- Generated staging files:
  - `import/staff_import_staging_20260415.csv`
  - `import/staff_import_review_20260415.csv`
- Generated SQL file for clean rows only:
  - `supabase/manual/20260415_import_staff_non_commission.sql`

Review flag distribution:
- `unknown_branch`: 20
- `unknown_position`: 13
- `missing_identity_number`: 3
- `multi_branch_review`: 2
- `code_trimmed`: 2
- `missing_company`: 1
- `missing_branch`: 1

5. Required employee fields vs source coverage

Remote employees table currently requires these core fields:
- employee_code
- name_zh
- name_en
- gender
- identity_type
- identity_number
- company_type
- employment_type
- employment_status
- hire_date

Available from workbook with acceptable confidence:
- employee_code
- name_zh
- name_en
- alias
- identity_number for most rows
- company_type
- branch label
- hire_date
- base salary / attendance / briefing / booking / transport allowance
- probation months
- pay day fields on many rows

Still not reliable enough for direct blind import across all 76 rows:
- identity_number for every row
- normalized branch for legacy labels like `CWB`, `Tai wai`, `MK TOP`
- normalized position for special roles outside current remote master
- company mapping for rows with blank company cells
- composite staff codes such as `SF168/SF186` and `SF169/SF185`

Result:
- We can safely import the 40 clean rows now.
- We should not force-import the 36 flagged rows until normalization decisions are confirmed.

6. Branch normalization needed before import

Source branch labels seen in workbook need normalization into current remote branch master:
- Office -> OFFICE
- TaiWai -> TAIWAI
- TW -> TW
- MKTOP -> MKTOP
- TM -> TMA
- MOS -> MOS
- MKCY -> MKCY
- TOP -> MKTOP
- Tai wai -> TAIWAI

Branch conflicts / review items:
- CWB appears in workbook rows, but current remote branch master does not contain an active `CWB` branch.
- `CBA/MKCY` and `MOS/MKCY` appear as multi-branch values and cannot be imported directly.
- `MK TOP` and mixed-case `Tai wai` variants need deliberate normalization.
- Blank branch values cannot be imported directly.

7. Company normalization

Source company labels seen in workbook:
- A -> ASA
- ASAS -> ASAS
- 自 -> ASA

Review item:
- Blank company values remain blocked.

8. Non-commission fields being imported

Directly stageable:
- employee_code
- branch_raw
- branch_normalized
- company_type
- base_salary
- attendance_bonus_amount
- briefing_bonus
- booking_bonus
- transport_allowance
- pay_day_primary
- pay_day_secondary
- probation_months
- hire_date

SQL defaults used for this batch:
- `gender = 'other'`
- `identity_type = 'hkid'`
- `employment_type = 'full_time'`
- `commission_method = 'none'`
- remarks explicitly state commission is intentionally ignored at this stage

9. Source conflicts that must be resolved before final import

- Some rows use branch labels that do not exist as active branch master rows.
- Some rows use positions that do not exist in current remote master.
- Some rows have missing identity numbers.
- Some rows have blank company or branch values.
- Some staff codes appear merged or annotated and need manual confirmation before import.

10. Recommended import sequence

Phase 1
- Import the 40 clean staged rows using the generated non-commission SQL.

Phase 2
- Resolve review rows by confirming branch, company, and position normalization rules.

Phase 3
- Regenerate staging CSV and SQL after review decisions.
- Import remaining employees and salary profiles.
- Run duplicate / missing-branch / missing-position checks.

11. Immediate next action

- Review the 36 flagged rows instead of forcing them into the database.
- If approved, apply `supabase/manual/20260415_import_staff_non_commission.sql` for the 40 clean rows first.