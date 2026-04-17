"""
Generate complete staff import SQL from the merged staging CSV.
Includes:
  1. New position seeds
  2. New branch seed (CWB)
  3. Employee upserts for all 107 staff
  4. Salary profile upserts for staff with salary data
  
Multi-branch handling:
  SF221 (MOS/MKCY) → MOS (primary)
  SF280 (CBA/MKCY) → CBA (primary)
"""
from __future__ import annotations
import csv, re
from pathlib import Path

UI_ROOT = Path(__file__).resolve().parents[1]
STAGING = UI_ROOT / 'import' / 'full_staff_staging_20260415.csv'
OUTPUT = UI_ROOT / 'supabase' / 'manual' / '20260415_full_staff_import.sql'


def sql_text(value: str | None) -> str:
    if value is None or value == '' or value == 'N/A':
        return 'null'
    escaped = value.replace("'", "''")
    return f"'{escaped}'"


def sql_numeric(value: str | None) -> str:
    if value is None or value == '' or value == 'N/A':
        return 'null'
    # Strip non-numeric
    cleaned = re.sub(r'[^\d.]', '', value)
    if not cleaned:
        return 'null'
    return cleaned


def sql_date(value: str | None) -> str:
    if value is None or value == '' or value == 'N/A':
        return 'null'
    # Must be YYYY-MM-DD format
    if re.match(r'^\d{4}-\d{2}-\d{2}', value):
        return f"date '{value[:10]}'"
    return 'null'


# Position seed data
NEW_POSITIONS = [
    ('BEAUTICIAN', '美容師', 'Beautician'),
    ('SENIOR_BEAUTICIAN', '高級美容師', 'Senior Beautician'),
    ('MASSAGIST', '養生師', 'Massagist'),
    ('CONSULTANT', '顧問', 'Consultant'),
    ('RECEPTIONIST', '接待員', 'Receptionist'),
    ('MANAGER', '經理', 'Manager'),
    ('SHOP_MANAGER', '店長', 'Shop Manager'),
    ('SALES_MANAGER', '銷售經理', 'Sales Manager'),
    ('SENIOR_SALES_MANAGER', '高級銷售經理', 'Senior Sales Manager'),
    ('SENIOR_SHOP_MANAGER', '高級店長', 'Senior Shop Manager'),
    ('ASSISTANT_SHOP_MANAGER', '副店長', 'Assistant Shop Manager'),
    ('ACCOUNT_MANAGER', '會計經理', 'Account Manager'),
    ('OPERATION_MANAGER', '營運經理', 'Operation Manager'),
    ('OPERATION_DIRECTOR', '營運總監', 'Operation Director'),
    ('ASSISTANT_OPERATION_MANAGER', '助理營運經理', 'Assistant Operation Manager'),
    ('CUSTOMER_SERVICE_MANAGER', '客戶服務主管', 'Customer Service Manager'),
    ('MARKETING_EXECUTIVE', '行銷主管', 'Marketing Executive'),
    ('TRAINER', '培訓老師', 'Trainer'),
    ('DESIGNER', '設計師', 'Designer'),
    ('OFFICE_CLERK', '文員', 'Office Clerk'),
    ('TELESALES', '電話銷售員', 'Telesales'),
    ('JANITOR', '清潔員', 'Janitor'),
    ('NURSE', '護士', 'Nurse'),
    ('DOCTOR', '醫師', 'Doctor'),
    ('BOSS', '老闆', 'Boss'),
]

# Multi-branch resolution
MULTI_BRANCH_FIX = {
    'MOS/MKCY': 'MOS',
    'CBA/MKCY': 'CBA',
}


def build_position_seed() -> str:
    values = ',\n    '.join(f"('{code}', '{zh}', '{en}')" for code, zh, en in NEW_POSITIONS)
    return f"""-- ════════════════════════════════════════════
-- STEP 1: Seed all positions
-- ════════════════════════════════════════════
insert into public.positions (code, name_zh, name_en)
values
    {values}
on conflict (code) do update set
  name_zh = excluded.name_zh,
  name_en = excluded.name_en,
  updated_at = timezone('utc', now());
"""


def build_cwb_branch() -> str:
    return """-- ════════════════════════════════════════════
-- STEP 2: Seed CWB branch (both companies)
-- ════════════════════════════════════════════
insert into public.branches (company_id, code, name_zh, name_en, is_active)
select companies.id, 'CWB', 'CWB', 'CWB', true
from public.companies
where companies.code in ('ASA', 'ASAS')
on conflict (company_id, code) do update set
  is_active = true,
  updated_at = timezone('utc', now());
"""


def build_employee_upsert(r: dict) -> str:
    code = r['code']
    branch = r['branch_norm']
    # Fix multi-branch
    if branch in MULTI_BRANCH_FIX:
        branch = MULTI_BRANCH_FIX[branch]
    # Fix empty branch
    if not branch:
        branch = 'OFFICE'  # fallback

    company = r['company_norm'] or 'ASA'
    position = r['position_norm'] or 'BEAUTICIAN'
    status = r['status']
    probation = sql_numeric(r.get('probation_months', ''))

    return f"""
-- ═══ {code} {r['alias']} {r['name_zh']} ═══
insert into public.employees (
  employee_code, name_zh, name_en, alias, gender,
  identity_type, identity_number, company_type,
  company_id, branch_id, branch_code,
  employment_type, employment_status, position_id,
  hire_date, probation_months
)
select
  {sql_text(code)},
  {sql_text(r['name_zh'])},
  {sql_text(r['name_en'])},
  {sql_text(r['alias'])},
  'other'::public.employee_gender,
  'hkid'::public.employee_identity_type,
  {sql_text(r['identity'])},
  {sql_text(company)}::public.employee_company_type,
  company.id, branch.id, {sql_text(branch)},
  'full_time'::public.employee_employment_type,
  {sql_text(status)}::public.employee_status,
  position.id,
  {sql_date(r['hire_date'])},
  {probation}
from public.companies company
join public.branches branch
  on branch.company_id = company.id and branch.code = {sql_text(branch)}
join public.positions position
  on position.code = {sql_text(position)}
where company.code = {sql_text(company)}
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


def build_salary_upsert(r: dict) -> str:
    code = r['code']
    base = sql_numeric(r['base_salary'])
    if base == 'null':
        return ''  # skip no salary

    attendance_val = sql_numeric(r['attendance'])
    attendance_enabled = 'true' if attendance_val != 'null' and attendance_val != '0' else 'false'

    return f"""
insert into public.employee_salary_profiles (
  employee_id, salary_type, base_salary, effective_from,
  attendance_bonus_enabled, attendance_bonus_amount,
  transport_allowance, briefing_bonus, booking_bonus,
  mpf_enabled, commission_method,
  pay_day_primary, pay_day_secondary,
  remarks
)
select
  employee.id, 'monthly', {base}, {sql_date(r['hire_date'])},
  {attendance_enabled}, {attendance_val},
  {sql_numeric(r['transport'])}, {sql_numeric(r['briefing'])}, {sql_numeric(r['booking'])},
  true, 'none',
  {sql_numeric(r['pay_day_1'])}, {sql_numeric(r['pay_day_2'])},
  'Imported 2026-04-15 from V6 Contract List; commission deferred.'
from public.employees employee
where employee.employee_code = {sql_text(code)}
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


def main():
    rows = list(csv.DictReader(STAGING.open(encoding='utf-8')))

    parts = ['begin;', '']
    parts.append(build_position_seed())
    parts.append(build_cwb_branch())

    # Step 3: Employee upserts
    parts.append("""-- ════════════════════════════════════════════
-- STEP 3: Employee master upserts
-- ════════════════════════════════════════════""")
    emp_count = 0
    for r in rows:
        parts.append(build_employee_upsert(r))
        emp_count += 1

    # Step 4: Salary profile upserts
    parts.append("""
-- ════════════════════════════════════════════
-- STEP 4: Salary profile upserts
-- ════════════════════════════════════════════""")
    sal_count = 0
    for r in rows:
        sal_sql = build_salary_upsert(r)
        if sal_sql:
            parts.append(sal_sql)
            sal_count += 1

    parts.append('')
    parts.append('commit;')

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text('\n'.join(parts), encoding='utf-8')

    print(f'Wrote {emp_count} employee upserts + {sal_count} salary profile upserts')
    print(f'  → {OUTPUT}')


if __name__ == '__main__':
    main()
