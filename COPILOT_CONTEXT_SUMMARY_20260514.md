# Copilot Context Summary - 2026-05-14

This file captures the useful HRMS project context before deleting the large Copilot chat export from Desktop.

## Project

- Project: Medi Magic HRMS under Kojin Ai Solution.
- Main app: `ui/`, a Next.js + TypeScript app using Supabase/PostgreSQL.
- Static GitHub Pages entry: `docs/`.
- Product scope: HRMS for Medi Magic, covering employee records, payroll, MPF/tax direction, leave, attendance, role permissions, BI/export, and later ESS mobile app.
- Commercial scope noted in plan: permanent license package, 2 companies, 6 users, 50 employees, Traditional Chinese / Simplified Chinese / English.

## Current Repo State

- `README.md` says GitHub Pages is only the static entry page; the full HRMS app is inside `ui/`.
- `開發計劃.md` contains the product/module plan and demo flow.
- `ui/IMPLEMENTATION_TODO.md` is the main execution checklist.
- There are many uncommitted edits in app/admin, app/payroll, app/people, middleware, employee queries, People/Payroll/Leaves/Inbox pages, and auth/session files. Treat these as existing user/project work and do not revert them.
- Existing generated build folders (`ui/out`, `ui/.next`) and dependencies are present.

## Current Implementation Todo Snapshot

Phase 1 foundation:
- Done: companies / branches / departments foundation tables.
- Done: employees extended with company / branch / department / manager / contract fields.
- Done: employee documents and visa tracking tables.
- Done: employee salary settings skeleton.
- Pending: backfill current production data into new foundation tables.
- Pending: apply Supabase migration to remote project.

Phase 2 intranet alignment:
- Pending: People filters by company / branch / department.
- Pending: Employee Profile sections for company / branch / department.
- Pending: documents tab, visa reminder section, expanded salary tab, commission settings tab.

Phase 3 system management:
- Done: companies / branches / departments in system management master data.
- Pending: leave policy, payroll item, commission rule, MPF/tax parameter, approval workflow, audit log.

Phase 4 transaction modules:
- Pending: leave types/balances/requests/approvals.
- Pending: attendance imports and records.
- Pending: roster/shift skeleton.
- Pending: payroll periods/inputs/runs/results.
- Pending: claims workflow.

Phase 5 compliance/output:
- Pending: MPF calculation, IR56 model/output, payslip PDF, BI report builder/export.

## Payroll / Commission Direction

Source workbook:
- `/Users/joecheung/Kojin Ai Solution/02-2026_MM(FY)_V8.xlsx`

Key documents:
- `ui/COMMISSION_WORKBOOK_ANALYSIS.md`
- `ui/PAYROLL_COMMISSION_DIRECTION.md`
- `ui/STAFF_PATTERN_MAPPING.md`

Main design decision:
- Use formula templates plus employee-level parameters/overrides.
- Do not hard-code one separate formula per employee.

Confirmed formula families:
- Therapist standard: job, redeem tier, sales TL percentage, SGM TL, MPF.
- Therapist with package floor / target fallback.
- Manager/team sales: team sales times manager rate, bonus, SGM at 5%, SH/AL TL.
- Telesales/headcount or street promoter style: fixed/headcount tiers and opening-order percentage tiers.
- Hourly/PT: hours times rate, optional bonus/adjustment.
- Fixed salary/support staff.

Confirmed workbook patterns:
- Redeem tier example: below 98,000 at 1%, 98,001-148,000 at 1.2%, 148,001-248,000 at 1.6%.
- Sales TL rates include 3%, 3.2%, 3.5%, 3.8%.
- SGM TL has evidence for SGM times 5%.
- Managers have team-sales percentage variants such as 8%, 7.5%, 7%, 6.5%, 5%, 4.5%, 4%, 3%.
- Payment allocation matters: some pay is split by bank/cheque/cash-like flows.

Suggested UI model:
- Template management.
- Employee commission profile assigning a template and parameters.
- Override/adjustment section for special rates, package floor, hard total, bonus/deduction, hold/release, effective dates, and notes.

## Staff / Data Import Context

Key files:
- `ui/scripts/build_full_staff_import.py`
- `ui/scripts/build_full_staff_sql.py`
- `ui/scripts/consolidate_employees.py`
- `ui/scripts/import_attendance_from_excel.py`
- `ui/scripts/import_v6_reconciliation_to_db.py`
- `ui/supabase/manual/20260504_import_v6_reconciliation.sql`

The V6 reconciliation SQL contains employee upserts and position setup. It includes sensitive personal data, so avoid copying it into docs or chat. Work with it locally only.

## Attendance Context

Key audit:
- `ui/docs/attendance_audit_2026_04.md`

April 2026 attendance import status:
- Attendance rows considered employee rows: 82.
- Matched by employee code: 62.
- Matched by name/alias despite missing or wrong code: 12.
- Still needs manual confirmation: 8.
- Active database employees not matched in the April sheet: 10.

Recommended attendance cleanup order:
- Fix the 12 easy code/name matches first.
- Manually confirm the 8 ambiguous records.
- Review the 10 active employees not found in the April sheet.
- Standardize new/temp/street-promoter naming to avoid future mixed codes and aliases.

## Likely Next Development Entry Points

Best next step if continuing implementation:
- Stabilize People and Employee Profile around company/branch/department, documents, visa reminders, salary, and commission settings.

Alternative next step if data correctness is priority:
- Finish and verify V6 reconciliation import, then address April 2026 attendance ambiguous matches before building payroll run logic.

Alternative next step if payroll is priority:
- Create commission template/profile/override schema and UI skeleton, based on `PAYROLL_COMMISSION_DIRECTION.md`.

## Deleted Source

Large source export reviewed:
- `/Users/joecheung/Desktop/Copilot_Chat_Export_20260514_125755`
- Size before deletion: about 4.6G.

