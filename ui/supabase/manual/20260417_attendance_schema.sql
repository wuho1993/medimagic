begin;

-- ============================================================
-- Create monthly_attendance_records table
-- Stores per-employee, per-month attendance summary data
-- imported from the attendance Excel workbook (員工出勤資料).
--
-- Relationship: employee_id → employees.id (linked via employee_code)
-- Matching rule for future imports:
--   1. employee_code is the primary key for matching.
--   2. name_zh / name_en / alias from employees are used as profile context
--      and secondary verification only.
-- Each record is unique per (employee_id, year_month).
-- ============================================================

create table if not exists public.monthly_attendance_records (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.employees(id) on delete cascade,
  year_month text not null,
  branch_section text,

  -- 日數欄位 (Days)
  calendar_days numeric default 0,
  worked_days numeric default 0,
  off_days numeric default 0,
  statutory_holiday_days numeric default 0,
  total_days numeric default 0,

  -- 假期類型 (Leave types)
  birthday_leave_days numeric default 0,
  tb8_days numeric default 0,
  sick_leave_days numeric default 0,
  maternity_leave_days numeric default 0,
  reward_leave_days numeric default 0,
  annual_leave_days numeric default 0,
  compassionate_leave_days numeric default 0,
  sick_no_pay_days numeric default 0,
  no_pay_leave_days numeric default 0,
  no_pay_statutory_holiday_days numeric default 0,

  -- 出勤/鐘數 (Hours tracking)
  attendance_deduction boolean not null default false,
  prev_month_remaining_hours numeric default 0,
  makeup_hours numeric default 0,
  overtime_hours numeric default 0,
  leave_to_hours_conversion numeric default 0,
  accumulated_ot_hours numeric default 0,

  -- 備註
  remarks text,

  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (employee_id, year_month)
);

-- Column comments (Excel header mapping)
comment on table public.monthly_attendance_records is '每月出勤記錄 — 從員工出勤資料 Excel 匯入的月度考勤摘要';
comment on column public.monthly_attendance_records.year_month is 'YYYY-MM 格式的月份標識';
comment on column public.monthly_attendance_records.branch_section is '員工在原始資料中所屬的分店/部門（如 MKTOP, MKCY, TW 等）';
comment on column public.monthly_attendance_records.calendar_days is '計薪日數 — 該月計薪天數';
comment on column public.monthly_attendance_records.worked_days is '上班 — 實際工作天數';
comment on column public.monthly_attendance_records.off_days is '例假 (OFF) — 休息日天數';
comment on column public.monthly_attendance_records.statutory_holiday_days is '勞工假 (SH) — 法定假日天數';
comment on column public.monthly_attendance_records.total_days is '總日數 — 當月總計天數';
comment on column public.monthly_attendance_records.birthday_leave_days is '生日假 (BL)';
comment on column public.monthly_attendance_records.tb8_days is 'TB8 — 補休日';
comment on column public.monthly_attendance_records.sick_leave_days is '有薪病假 (SL)';
comment on column public.monthly_attendance_records.maternity_leave_days is '產假';
comment on column public.monthly_attendance_records.reward_leave_days is '獎勵假 (SB)';
comment on column public.monthly_attendance_records.annual_leave_days is '年假 (AL)';
comment on column public.monthly_attendance_records.compassionate_leave_days is '恩恤假';
comment on column public.monthly_attendance_records.sick_no_pay_days is '無薪病假 (SL No Pay)';
comment on column public.monthly_attendance_records.no_pay_leave_days is '事假 (NPL) — 無薪事假';
comment on column public.monthly_attendance_records.no_pay_statutory_holiday_days is 'No Pay 勞工假 (NPSH)';
comment on column public.monthly_attendance_records.attendance_deduction is '扣勤工 — 是否扣勤';
comment on column public.monthly_attendance_records.prev_month_remaining_hours is '上月剩餘鐘數 (HOUR)';
comment on column public.monthly_attendance_records.makeup_hours is '補鐘';
comment on column public.monthly_attendance_records.overtime_hours is 'OT — 加班時數';
comment on column public.monthly_attendance_records.leave_to_hours_conversion is '假期轉鐘 (1天=8HOUR)';
comment on column public.monthly_attendance_records.accumulated_ot_hours is '累積OT時數 (Hours) — 本月結餘';

create or replace function public.set_attendance_calendar_days()
returns trigger
language plpgsql
as $$
begin
  if new.year_month ~ '^\d{4}-\d{2}$' and coalesce(new.calendar_days, 0) <= 0 then
    new.calendar_days := extract(
      day from ((to_date(new.year_month || '-01', 'YYYY-MM-DD') + interval '1 month') - interval '1 day')
    );
  end if;

  return new;
end;
$$;

create or replace view public.attendance_management_records as
select
  mar.id,
  mar.employee_id,
  e.employee_code,
  e.name_zh,
  e.name_en,
  e.alias,
  mar.year_month,
  mar.branch_section,
  mar.calendar_days,
  mar.worked_days,
  mar.off_days,
  mar.statutory_holiday_days,
  mar.total_days,
  mar.birthday_leave_days,
  mar.tb8_days,
  mar.sick_leave_days,
  mar.maternity_leave_days,
  mar.reward_leave_days,
  mar.annual_leave_days,
  mar.compassionate_leave_days,
  mar.sick_no_pay_days,
  mar.no_pay_leave_days,
  mar.no_pay_statutory_holiday_days,
  mar.attendance_deduction,
  mar.prev_month_remaining_hours,
  mar.makeup_hours,
  mar.overtime_hours,
  mar.leave_to_hours_conversion,
  mar.accumulated_ot_hours,
  mar.remarks,
  mar.created_at,
  mar.updated_at
from public.monthly_attendance_records mar
join public.employees e on e.id = mar.employee_id;

comment on view public.attendance_management_records is '出勤管理檢視：每月出勤記錄連同員工 profile 資料（employee_code, name_zh, name_en, alias）';

-- RLS
alter table public.monthly_attendance_records enable row level security;

drop policy if exists "Authenticated users can read attendance records" on public.monthly_attendance_records;
create policy "Authenticated users can read attendance records"
on public.monthly_attendance_records
for select to authenticated using (true);

drop policy if exists "Authenticated users can manage attendance records" on public.monthly_attendance_records;
create policy "Authenticated users can manage attendance records"
on public.monthly_attendance_records
for all to authenticated using (true) with check (true);

-- Updated-at trigger
drop trigger if exists set_monthly_attendance_records_updated_at on public.monthly_attendance_records;
create trigger set_monthly_attendance_records_updated_at
before update on public.monthly_attendance_records
for each row execute function public.set_updated_at();

drop trigger if exists set_monthly_attendance_records_calendar_days on public.monthly_attendance_records;
create trigger set_monthly_attendance_records_calendar_days
before insert or update on public.monthly_attendance_records
for each row execute function public.set_attendance_calendar_days();

commit;
