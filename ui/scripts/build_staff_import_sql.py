from __future__ import annotations

import csv
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
UI_ROOT = ROOT / 'Medi Magic HRMS' / 'ui'
STAGING_PATH = UI_ROOT / 'import' / 'staff_import_staging_20260415.csv'
OUTPUT_PATH = UI_ROOT / 'supabase' / 'manual' / '20260415_import_staff_non_commission.sql'


def sql_text(value: str | None) -> str:
    if value is None or value == '':
        return 'null'
    escaped = value.replace("'", "''")
    return f"'{escaped}'"


def sql_numeric(value: str | None) -> str:
    if value is None or value == '' or value == 'N/A':
        return 'null'
    return value


def sql_date(value: str | None) -> str:
    if value is None or value == '':
        return 'null'
    return f"date {sql_text(value)}"


def build_employee_sql(row: dict[str, str]) -> str:
    return f"""
insert into public.employees (
  employee_code,
  name_zh,
  name_en,
  alias,
  gender,
  identity_type,
  identity_number,
  company_type,
  company_id,
  branch_id,
  branch_code,
  employment_type,
  employment_status,
  position_id,
  hire_date,
  probation_months
)
select
  {sql_text(row['employee_code'])},
  {sql_text(row['name_zh'])},
  {sql_text(row['name_en'])},
  {sql_text(row['alias'])},
  'other'::public.employee_gender,
  'hkid'::public.employee_identity_type,
  {sql_text(row['identity_number'])},
  {sql_text(row['company_normalized'])}::public.employee_company_type,
  company.id,
  branch.id,
  {sql_text(row['branch_normalized'])},
  'full_time'::public.employee_employment_type,
  {sql_text(row['employment_status'])}::public.employee_status,
  position.id,
  {sql_date(row['hire_date'])},
  {sql_numeric(row['probation_months'])}
from public.companies company
join public.branches branch
  on branch.company_id = company.id
 and branch.code = {sql_text(row['branch_normalized'])}
join public.positions position
  on position.code = {sql_text(row['position_normalized'])}
where company.code = {sql_text(row['company_normalized'])}
on conflict (employee_code) do update set
  name_zh = excluded.name_zh,
  name_en = excluded.name_en,
  alias = excluded.alias,
  gender = excluded.gender,
  identity_type = excluded.identity_type,
  identity_number = excluded.identity_number,
  company_type = excluded.company_type,
  company_id = excluded.company_id,
  branch_id = excluded.branch_id,
  branch_code = excluded.branch_code,
  employment_type = excluded.employment_type,
  employment_status = excluded.employment_status,
  position_id = excluded.position_id,
  hire_date = excluded.hire_date,
  probation_months = excluded.probation_months,
  updated_at = timezone('utc', now());
""".strip()


def build_salary_sql(row: dict[str, str]) -> str:
    attendance_enabled = 'true' if row['attendance_bonus_amount'] not in ('', '0', '0.0', '0.00', 'N/A') else 'false'
    return f"""
insert into public.employee_salary_profiles (
  employee_id,
  salary_type,
  base_salary,
  effective_from,
  attendance_bonus_enabled,
  attendance_bonus_amount,
  transport_allowance,
  briefing_bonus,
  booking_bonus,
  mpf_enabled,
  commission_method,
  pay_day_primary,
  pay_day_secondary,
  remarks
)
select
  employee.id,
  'monthly',
  {sql_numeric(row['base_salary'])},
  {sql_date(row['hire_date'])},
  {attendance_enabled},
  {sql_numeric(row['attendance_bonus_amount'])},
  {sql_numeric(row['transport_allowance'])},
  {sql_numeric(row['briefing_bonus'])},
  {sql_numeric(row['booking_bonus'])},
  true,
  'none',
  {sql_numeric(row['pay_day_primary'])},
  {sql_numeric(row['pay_day_secondary'])},
  'Imported from Contract List on 2026-04-15; commission fields intentionally ignored at this stage.'
from public.employees employee
where employee.employee_code = {sql_text(row['employee_code'])}
on conflict (employee_id) do update set
  salary_type = excluded.salary_type,
  base_salary = excluded.base_salary,
  effective_from = excluded.effective_from,
  attendance_bonus_enabled = excluded.attendance_bonus_enabled,
  attendance_bonus_amount = excluded.attendance_bonus_amount,
  transport_allowance = excluded.transport_allowance,
  briefing_bonus = excluded.briefing_bonus,
  booking_bonus = excluded.booking_bonus,
  mpf_enabled = excluded.mpf_enabled,
  commission_method = excluded.commission_method,
  pay_day_primary = excluded.pay_day_primary,
  pay_day_secondary = excluded.pay_day_secondary,
  remarks = excluded.remarks,
  updated_at = timezone('utc', now());
""".strip()


def main() -> int:
    rows = list(csv.DictReader(STAGING_PATH.open(encoding='utf-8')))
    clean_rows = [row for row in rows if not row['review_flags']]

    statements = ['begin;', '', '-- Clean staged staff import only. Review rows are intentionally excluded.', '']
    for row in clean_rows:
        statements.append(build_employee_sql(row))
        statements.append('')
    for row in clean_rows:
        statements.append(build_salary_sql(row))
        statements.append('')
    statements.append('commit;')

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_PATH.write_text('\n'.join(statements), encoding='utf-8')

    print(f'Wrote SQL for {len(clean_rows)} clean staff rows to {OUTPUT_PATH}')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())