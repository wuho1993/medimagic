# Medi Magic HRMS Project Context

Last updated: 2026-05-20

This is the shared handoff file for OpenCode runs, especially tasks started through the Telegram bot. Read this file before coding.

## Current Goal

Continue building and verifying the local Medi Magic HRMS Next.js app, with current focus on Payroll, Attendance, MPF, payslips, rolling 365 average commission, and AL/SH compensation.

## Core Constraints

- Communicate with Joe in Cantonese / Traditional Chinese when reporting to the user.
- Main app path: `/Users/joecheung/Kojin Ai Solution/Medi Magic HRMS/ui`.
- Main app is a Next.js app with server-side/Supabase features; GitHub Pages is only a static entry site.
- Local app base path is `/medimagic`.
- Local Payroll URL: `http://localhost:3000/medimagic/app/payroll/`.
- Average wages URL: `http://localhost:3000/medimagic/app/payroll/average-wages`.
- Do not work on GitHub/static export unless explicitly requested.
- Do not commit unless explicitly requested.
- Keep changes minimal, preserve existing design/system patterns, and inspect files before coding.
- Verify meaningful code changes with `npm run typecheck` and `npm run build` when feasible.
- Secrets must stay in `.env.local` or `supabase-credentials.txt`; never commit secrets.
- The repository currently has many existing modified/untracked files, including generated `ui/out` files. Do not revert unrelated changes.

## Current Decisions

### Payroll Identity And Salary Logic

- `employmentType = 兼職` is identity/category only. Payroll formula is driven by `salaryType`.
- `salaryType = package` must remain package even if employee is part-time.
- V6 `SALARY` sheet is authoritative for salary/commission import; `COMMISSION` sheet may contain stale formulas.
- New/no-code employees use `NA-xx`, not `TMP` or `V6TMP`.
- Staff audit green only when personal info, salary, and commission are all clearly confirmed; otherwise yellow.
- Commission unclear remark should say `佣金計算方法需人工確認`.

### AL/SH Rolling 365 Average Commission

- AL/SH compensation counts `AL + SH` only.
- Package commission is commission and must be included in rolling average.
- 2025-04 to 2026-03 seed source: `Mar_SALARY統計2026.xlsx`.
- 2026-04 onward comes from HRMS payroll saves into `employee_commission_average_monthly`.
- Payroll selected month uses rolling average up to the previous completed month to avoid circular calculation.
- Current payout formula: `daily average commission x (AL + SH)`.
- Legal compliance/top-up check is connected: final AL/SH pay uses the higher of commission compensation and legal minimum top-up.
- If AL/SH days exist but no rolling source exists, payroll review blocks export until manually confirmed.
- Employee with less than 365 days uses the available eligible days, capped at 365.
- First version uses Excel seed/actual active days for excluded days; unpaid leave or half-pay excluded periods can be refined later.

### Attendance And Lateness

- Attendance provides AL/SH day counts to Payroll.
- Lateness fields should be understood as monthly accumulated late minutes/time, not carried forward month to month.
- Attendance bonus is deducted only when monthly accumulated late minutes exceed 30.
- If monthly late minutes are 30 or below, Payroll should not deduct attendance bonus and payslip should not show a late deduction warning.

### Mapping Decisions

- `SF363 Chrissy` and `SF373 Haley` are resigned/inactive.
- They are excluded from active HRMS profile creation and 365 average seed import.
- Supabase mapping rows have `match_status = excluded`.
- Known mappings from the rolling commission plan include `SF131 JUMBO -> SF189`, `SF370 Yu -> NA-05`, `街霸01 Dan Wu -> NA-11`, `街霸02 Lily -> NA-12`, and `街霸03 Wu Anru -> NA-13`.

## Completed Work

- Added rolling 365 average query/helper in `src/lib/employees/queries.ts`.
- Payroll route loads rolling average data for the selected month.
- Payroll calculates AL/SH average commission compensation.
- Payroll includes final AL/SH compensation in gross pay and MPF relevant income.
- Payslip displays SH/AL Commission line with rate, days, and top-up.
- Added `/app/payroll/average-wages` page.
- Average wages page shows source, cutoff, total commission, eligible days, daily average, legal daily wage, top-up, final compensation, and mapping status.
- Telegram bridge exists at `scripts/telegram-bot.mjs` with whitelist support and safe commands.
- Telegram `/code` tasks pass `PROJECT_CONTEXT.md` and recent `TELEGRAM_SYNC_CONTEXT.md` history into OpenCode.
- DB migration/manual files exist for commission rules, saved shop commission presets, payroll submission reviews, employee termination workflow fields, and commission average tables/import seed.

## Pending Tasks

- Verify rolling 365 average outputs against V8 and `Mar_SALARY統計2026.xlsx` sample employees.
- Complete or review Excel-to-DB mapping review flow if any mappings remain uncertain.
- Confirm all seed rows are imported only for confirmed mappings and excluded employees are not imported.
- Confirm 2026-04 onward payroll saves write monthly commission source correctly to `employee_commission_average_monthly`.
- Finish Attendance lateness semantics/UI if any screens still show `late_days` as days instead of monthly minutes.
- Ensure payslips show actual sales amount total in commission details where required.
- Review whether AL/SH compensation is always correctly treated as MPF relevant income.
- Perform a wider intranet consistency check across People, Attendance, Payroll, MPF, Audit, Import, and Permissions.
- Decide whether generated `ui/out` static export files should be regenerated, ignored, or excluded from future local-app work.

## Telegram Bot Commands

- `/status`: quick project status.
- `/urls`: local app URLs.
- `/typecheck`: run `npm run typecheck`.
- `/build`: run `npm run build`.
- `/code <task>`: run OpenCode in this project folder after reading `PROJECT_CONTEXT.md` and recent Telegram sync history.
- `/cancel`: stop current OpenCode task.
- `/history`: show recent Telegram/OpenCode sync context.

## Verification Commands

```bash
npm run typecheck
npm run build
```

Useful runtime commands:

```bash
npm run dev
npm run telegram:bot
```

## Files To Know

- `src/app/pages/Payroll.tsx`: main payroll calculation, payslip, MPF export, payroll review.
- `app/app/payroll/page.tsx`: Payroll route/data loader.
- `app/app/payroll/average-wages/page.tsx`: average wages query page.
- `src/lib/employees/queries.ts`: employee/payroll queries, rolling average helpers, average wages audit records.
- `app/app/payroll/actions.ts`: payroll save, review answers, monthly commission source writes.
- `docs/rolling_365_commission_al_sh_plan.md`: detailed rolling 365 average commission and AL/SH plan.
- `scripts/telegram-bot.mjs`: Telegram bridge and OpenCode runner.
