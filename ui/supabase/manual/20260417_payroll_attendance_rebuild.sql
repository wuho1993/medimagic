begin;

create table if not exists public.system_settings (
  setting_key text primary key,
  value_text text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

insert into public.system_settings (setting_key, value_text)
values ('package_no_pay_default_handling', 'pro_rate')
on conflict (setting_key) do nothing;

alter table public.monthly_commission_records
  add column if not exists package_no_pay_handling text;

alter table public.monthly_commission_records
  drop constraint if exists monthly_commission_records_package_no_pay_handling_check;

alter table public.monthly_commission_records
  add constraint monthly_commission_records_package_no_pay_handling_check
  check (package_no_pay_handling in ('no_package', 'pro_rate') or package_no_pay_handling is null);

comment on column public.monthly_commission_records.package_no_pay_handling is
  'Handling mode for package-commission employees with no-pay attendance when actual commission does not exceed package commission';

drop view if exists public.payroll_attendance_records;
drop view if exists public.attendance_management_records;

create view public.attendance_management_records as
with recursive ordered_attendance as (
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
    coalesce(mar.prev_month_remaining_hours, 0)::numeric(12,2) as raw_prev_month_remaining_hours,
    (-abs(coalesce(mar.makeup_hours, 0)))::numeric(12,2) as normalized_makeup_hours,
    coalesce(mar.overtime_hours, 0)::numeric(12,2) as overtime_hours,
    coalesce(mar.leave_to_hours_conversion, 0)::numeric(12,2) as leave_to_hours_conversion,
    coalesce(mar.accumulated_ot_hours, 0)::numeric(12,2) as raw_accumulated_ot_hours,
    mar.remarks,
    coalesce(sp.salary_type::text, null) as salary_type,
    coalesce(sp.base_salary, 0)::numeric(12,2) as base_salary,
    coalesce(sp.allowance_amount, 0)::numeric(12,2) as allowance_amount,
    coalesce(sp.transport_allowance, 0)::numeric(12,2) as transport_allowance,
    coalesce(sp.briefing_bonus, 0)::numeric(12,2) as briefing_bonus,
    coalesce(sp.attendance_bonus_amount, 0)::numeric(12,2) as attendance_bonus_amount,
    coalesce(sp.booking_bonus, 0)::numeric(12,2) as booking_bonus,
    coalesce(sp.package_commission_amount, 0)::numeric(12,2) as package_commission_amount,
    mar.created_at,
    mar.updated_at,
    row_number() over (partition by mar.employee_id order by mar.year_month asc) as month_seq
  from public.monthly_attendance_records mar
  join public.employees e on e.id = mar.employee_id
  left join public.employee_salary_profiles sp on sp.employee_id = mar.employee_id
), attendance_rollup as (
  select
    oa.id,
    oa.employee_id,
    oa.employee_code,
    oa.name_zh,
    oa.name_en,
    oa.alias,
    oa.year_month,
    oa.branch_section,
    oa.calendar_days,
    oa.worked_days,
    oa.off_days,
    oa.statutory_holiday_days,
    oa.total_days,
    oa.birthday_leave_days,
    oa.tb8_days,
    oa.sick_leave_days,
    oa.maternity_leave_days,
    oa.reward_leave_days,
    oa.annual_leave_days,
    oa.compassionate_leave_days,
    oa.sick_no_pay_days,
    oa.no_pay_leave_days,
    oa.no_pay_statutory_holiday_days,
    oa.attendance_deduction,
    case
      when oa.year_month >= '2026-05' then oa.raw_prev_month_remaining_hours
      else oa.raw_prev_month_remaining_hours
    end::numeric(12,2) as prev_month_remaining_hours,
    oa.normalized_makeup_hours as makeup_hours,
    oa.overtime_hours,
    oa.leave_to_hours_conversion,
    case
      when oa.year_month >= '2026-04' then round(
        (
          case
            when oa.year_month >= '2026-05' then oa.raw_prev_month_remaining_hours
            else oa.raw_prev_month_remaining_hours
          end
        )
        + oa.normalized_makeup_hours
        + oa.overtime_hours
        + (oa.leave_to_hours_conversion * 8),
        2
      )
      else oa.raw_accumulated_ot_hours
    end::numeric(12,2) as accumulated_ot_hours,
    oa.remarks,
    oa.salary_type,
    oa.base_salary,
    oa.allowance_amount,
    oa.transport_allowance,
    oa.briefing_bonus,
    oa.attendance_bonus_amount,
    oa.booking_bonus,
    oa.package_commission_amount,
    oa.created_at,
    oa.updated_at,
    oa.month_seq
  from ordered_attendance oa
  where oa.month_seq = 1

  union all

  select
    oa.id,
    oa.employee_id,
    oa.employee_code,
    oa.name_zh,
    oa.name_en,
    oa.alias,
    oa.year_month,
    oa.branch_section,
    oa.calendar_days,
    oa.worked_days,
    oa.off_days,
    oa.statutory_holiday_days,
    oa.total_days,
    oa.birthday_leave_days,
    oa.tb8_days,
    oa.sick_leave_days,
    oa.maternity_leave_days,
    oa.reward_leave_days,
    oa.annual_leave_days,
    oa.compassionate_leave_days,
    oa.sick_no_pay_days,
    oa.no_pay_leave_days,
    oa.no_pay_statutory_holiday_days,
    oa.attendance_deduction,
    case
      when oa.year_month >= '2026-05' then ar.accumulated_ot_hours
      else oa.raw_prev_month_remaining_hours
    end::numeric(12,2) as prev_month_remaining_hours,
    oa.normalized_makeup_hours as makeup_hours,
    oa.overtime_hours,
    oa.leave_to_hours_conversion,
    case
      when oa.year_month >= '2026-04' then round(
        (
          case
            when oa.year_month >= '2026-05' then ar.accumulated_ot_hours
            else oa.raw_prev_month_remaining_hours
          end
        )
        + oa.normalized_makeup_hours
        + oa.overtime_hours
        + (oa.leave_to_hours_conversion * 8),
        2
      )
      else oa.raw_accumulated_ot_hours
    end::numeric(12,2) as accumulated_ot_hours,
    oa.remarks,
    oa.salary_type,
    oa.base_salary,
    oa.allowance_amount,
    oa.transport_allowance,
    oa.briefing_bonus,
    oa.attendance_bonus_amount,
    oa.booking_bonus,
    oa.package_commission_amount,
    oa.created_at,
    oa.updated_at,
    oa.month_seq
  from ordered_attendance oa
  join attendance_rollup ar
    on ar.employee_id = oa.employee_id
   and oa.month_seq = ar.month_seq + 1
)
select
  ar.id,
  ar.employee_id,
  ar.employee_code,
  ar.name_zh,
  ar.name_en,
  ar.alias,
  ar.year_month,
  ar.branch_section,
  ar.calendar_days,
  ar.worked_days,
  ar.off_days,
  ar.statutory_holiday_days,
  ar.total_days,
  ar.birthday_leave_days,
  ar.tb8_days,
  ar.sick_leave_days,
  ar.maternity_leave_days,
  ar.reward_leave_days,
  ar.annual_leave_days,
  ar.compassionate_leave_days,
  ar.sick_no_pay_days,
  ar.no_pay_leave_days,
  ar.no_pay_statutory_holiday_days,
  (
    coalesce(ar.sick_no_pay_days, 0)
    + coalesce(ar.no_pay_leave_days, 0)
    + coalesce(ar.no_pay_statutory_holiday_days, 0)
  )::numeric(12,2) as no_pay_days,
  ar.attendance_deduction,
  ar.prev_month_remaining_hours,
  ar.makeup_hours,
  ar.overtime_hours,
  ar.leave_to_hours_conversion,
  ar.accumulated_ot_hours,
  ar.remarks,
  ar.salary_type,
  ar.base_salary,
  ar.allowance_amount,
  ar.transport_allowance,
  ar.briefing_bonus,
  ar.attendance_bonus_amount,
  ar.booking_bonus,
  ar.package_commission_amount,
  (
    coalesce(ar.base_salary, 0)
    + coalesce(ar.allowance_amount, 0)
    + coalesce(ar.transport_allowance, 0)
    + coalesce(ar.briefing_bonus, 0)
    + coalesce(ar.attendance_bonus_amount, 0)
    + coalesce(ar.booking_bonus, 0)
  )::numeric(12,2) as deduction_base,
  case
    when coalesce(ar.calendar_days, 0) > 0 then
      round((
        (
          coalesce(ar.base_salary, 0)
          + coalesce(ar.allowance_amount, 0)
          + coalesce(ar.transport_allowance, 0)
          + coalesce(ar.briefing_bonus, 0)
          + coalesce(ar.attendance_bonus_amount, 0)
          + coalesce(ar.booking_bonus, 0)
        )
        / ar.calendar_days
      ) * (
        coalesce(ar.sick_no_pay_days, 0)
        + coalesce(ar.no_pay_leave_days, 0)
        + coalesce(ar.no_pay_statutory_holiday_days, 0)
      ), 2)
    else 0
  end::numeric(12,2) as deduction_amount,
  case
    when coalesce(ar.calendar_days, 0) > 0 then
      round(coalesce(ar.package_commission_amount, 0) * (coalesce(ar.worked_days, 0) / ar.calendar_days), 2)
    else coalesce(ar.package_commission_amount, 0)
  end::numeric(12,2) as prorated_package_commission,
  ar.created_at,
  ar.updated_at
from attendance_rollup ar;

comment on view public.attendance_management_records is
  'Attendance management view with employee profile payroll basis, no-pay days, deduction base, deduction amount, prorated package commission, and OT accumulation roll-forward rules from 2026-04/2026-05 onward.';

create view public.payroll_attendance_records as
with system_defaults as (
  select
    coalesce(
      (
        select value_text
        from public.system_settings
        where setting_key = 'package_no_pay_default_handling'
          and value_text in ('no_package', 'pro_rate')
        limit 1
      ),
      'pro_rate'
    )::text as package_no_pay_default_handling
), attendance_base as (
  select
    amr.employee_id,
    amr.employee_code,
    amr.name_zh,
    amr.name_en,
    amr.alias,
    amr.year_month,
    amr.salary_type,
    amr.calendar_days,
    amr.worked_days,
    amr.off_days,
    amr.statutory_holiday_days,
    amr.total_days,
    amr.birthday_leave_days,
    amr.tb8_days,
    amr.sick_leave_days,
    amr.maternity_leave_days,
    amr.reward_leave_days,
    amr.annual_leave_days,
    amr.compassionate_leave_days,
    amr.sick_no_pay_days,
    amr.no_pay_leave_days,
    amr.no_pay_statutory_holiday_days,
    amr.no_pay_days,
    amr.base_salary,
    amr.allowance_amount,
    amr.transport_allowance,
    amr.briefing_bonus,
    amr.attendance_bonus_amount,
    amr.booking_bonus,
    amr.package_commission_amount,
    amr.deduction_base,
    amr.deduction_amount,
    amr.prorated_package_commission,
    coalesce(mcr.package_no_pay_handling, system_defaults.package_no_pay_default_handling) as package_no_pay_handling,
    (
      coalesce(mcr.redeem_commission, 0)
      + coalesce(mcr.sales_commission, 0)
      + coalesce(mcr.sgm_commission, 0)
      + coalesce(mcr.sales_amount_commission, 0)
      + coalesce(mcr.job_amount, 0)
      + coalesce(mcr.street_promoter_commission_amount, 0)
      + coalesce(mcr.telesales_commission_amount, 0)
    )::numeric(12,2) as actual_commission_amount
  from public.attendance_management_records amr
  cross join system_defaults
  left join public.monthly_commission_records mcr
    on mcr.employee_id = amr.employee_id
   and mcr.year_month = amr.year_month
), scaled_basis_bonus as (
  select
    attendance_base.*,
    (
      coalesce(attendance_base.base_salary, 0)
      + coalesce(attendance_base.allowance_amount, 0)
      + coalesce(attendance_base.transport_allowance, 0)
      + coalesce(attendance_base.briefing_bonus, 0)
      + coalesce(attendance_base.attendance_bonus_amount, 0)
      + coalesce(attendance_base.booking_bonus, 0)
    )::numeric(12,2) as basis_total,
    least(
      coalesce(attendance_base.deduction_amount, 0),
      (
        coalesce(attendance_base.base_salary, 0)
        + coalesce(attendance_base.allowance_amount, 0)
        + coalesce(attendance_base.transport_allowance, 0)
        + coalesce(attendance_base.briefing_bonus, 0)
        + coalesce(attendance_base.attendance_bonus_amount, 0)
        + coalesce(attendance_base.booking_bonus, 0)
      )
    )::numeric(12,2) as basis_deduction_applied,
    greatest(
      coalesce(attendance_base.deduction_amount, 0)
      - least(
          coalesce(attendance_base.deduction_amount, 0),
          (
            coalesce(attendance_base.base_salary, 0)
            + coalesce(attendance_base.allowance_amount, 0)
            + coalesce(attendance_base.transport_allowance, 0)
            + coalesce(attendance_base.briefing_bonus, 0)
            + coalesce(attendance_base.attendance_bonus_amount, 0)
            + coalesce(attendance_base.booking_bonus, 0)
          )
        ),
      0
    )::numeric(12,2) as remaining_deduction_amount
  from attendance_base
), distributed_basis_bonus as (
  select
    scaled_basis_bonus.*,
    case
      when scaled_basis_bonus.basis_total > 0 then round(
        greatest(
          scaled_basis_bonus.basis_total - scaled_basis_bonus.basis_deduction_applied,
          0
        ) * (coalesce(scaled_basis_bonus.base_salary, 0) / scaled_basis_bonus.basis_total),
        2
      )
      else coalesce(scaled_basis_bonus.base_salary, 0)
    end::numeric(12,2) as scaled_base_salary,
    case
      when scaled_basis_bonus.basis_total > 0 then round(
        greatest(
          scaled_basis_bonus.basis_total - scaled_basis_bonus.basis_deduction_applied,
          0
        ) * (coalesce(scaled_basis_bonus.allowance_amount, 0) / scaled_basis_bonus.basis_total),
        2
      )
      else coalesce(scaled_basis_bonus.allowance_amount, 0)
    end::numeric(12,2) as scaled_allowance_amount,
    case
      when scaled_basis_bonus.basis_total > 0 then round(
        greatest(
          scaled_basis_bonus.basis_total - scaled_basis_bonus.basis_deduction_applied,
          0
        ) * (coalesce(scaled_basis_bonus.transport_allowance, 0) / scaled_basis_bonus.basis_total),
        2
      )
      else coalesce(scaled_basis_bonus.transport_allowance, 0)
    end::numeric(12,2) as scaled_transport_allowance,
    case
      when scaled_basis_bonus.basis_total > 0 then round(
        greatest(
          scaled_basis_bonus.basis_total - scaled_basis_bonus.basis_deduction_applied,
          0
        ) * (coalesce(scaled_basis_bonus.briefing_bonus, 0) / scaled_basis_bonus.basis_total),
        2
      )
      else coalesce(scaled_basis_bonus.briefing_bonus, 0)
    end::numeric(12,2) as scaled_briefing_bonus,
    case
      when scaled_basis_bonus.basis_total > 0 then round(
        greatest(
          scaled_basis_bonus.basis_total - scaled_basis_bonus.basis_deduction_applied,
          0
        ) * (coalesce(scaled_basis_bonus.attendance_bonus_amount, 0) / scaled_basis_bonus.basis_total),
        2
      )
      else coalesce(scaled_basis_bonus.attendance_bonus_amount, 0)
    end::numeric(12,2) as scaled_attendance_bonus,
    case
      when scaled_basis_bonus.basis_total > 0 then round(
        greatest(
          scaled_basis_bonus.basis_total - scaled_basis_bonus.basis_deduction_applied,
          0
        )
        - round(
            greatest(
              scaled_basis_bonus.basis_total - scaled_basis_bonus.basis_deduction_applied,
              0
            ) * (coalesce(scaled_basis_bonus.base_salary, 0) / scaled_basis_bonus.basis_total),
            2
          )
        - round(
            greatest(
              scaled_basis_bonus.basis_total - scaled_basis_bonus.basis_deduction_applied,
              0
            ) * (coalesce(scaled_basis_bonus.allowance_amount, 0) / scaled_basis_bonus.basis_total),
            2
          )
        - round(
            greatest(
              scaled_basis_bonus.basis_total - scaled_basis_bonus.basis_deduction_applied,
              0
            ) * (coalesce(scaled_basis_bonus.transport_allowance, 0) / scaled_basis_bonus.basis_total),
            2
          )
        - round(
            greatest(
              scaled_basis_bonus.basis_total - scaled_basis_bonus.basis_deduction_applied,
              0
            ) * (coalesce(scaled_basis_bonus.briefing_bonus, 0) / scaled_basis_bonus.basis_total),
            2
          )
        - round(
            greatest(
              scaled_basis_bonus.basis_total - scaled_basis_bonus.basis_deduction_applied,
              0
            ) * (coalesce(scaled_basis_bonus.attendance_bonus_amount, 0) / scaled_basis_bonus.basis_total),
            2
          ),
        2
      )
      else coalesce(scaled_basis_bonus.booking_bonus, 0)
    end::numeric(12,2) as scaled_booking_bonus
  from scaled_basis_bonus
)
select
  employee_id,
  employee_code,
  name_zh,
  name_en,
  alias,
  year_month,
  salary_type,
  calendar_days,
  worked_days,
  off_days,
  statutory_holiday_days,
  total_days,
  birthday_leave_days,
  tb8_days,
  sick_leave_days,
  maternity_leave_days,
  reward_leave_days,
  annual_leave_days,
  compassionate_leave_days,
  sick_no_pay_days,
  no_pay_leave_days,
  no_pay_statutory_holiday_days,
  no_pay_days,
  base_salary,
  allowance_amount,
  transport_allowance,
  scaled_base_salary,
  scaled_allowance_amount,
  scaled_transport_allowance,
  briefing_bonus,
  attendance_bonus_amount,
  booking_bonus,
  scaled_briefing_bonus,
  scaled_attendance_bonus,
  scaled_booking_bonus,
  basis_total,
  basis_deduction_applied,
  remaining_deduction_amount,
  deduction_base,
  deduction_amount as attendance_deduction_amount,
  package_commission_amount,
  prorated_package_commission,
  actual_commission_amount,
  package_no_pay_handling,
  false as package_no_pay_selection_required,
  case
    when salary_type <> 'package' then actual_commission_amount
    when no_pay_days <= 0 then greatest(actual_commission_amount, package_commission_amount)
    when actual_commission_amount > package_commission_amount then actual_commission_amount
    when package_no_pay_handling = 'no_package' then 0
    when package_no_pay_handling = 'pro_rate' then greatest(actual_commission_amount, prorated_package_commission)
    else greatest(actual_commission_amount, package_commission_amount)
  end::numeric(12,2) as effective_commission_amount
from distributed_basis_bonus;

comment on view public.payroll_attendance_records is
  'Payroll attendance calculation view: attendance-driven worked days, no-pay deduction base, scaled base salary/allowances/briefing/attendance/booking bonuses, residual deduction amount, package commission handling, and effective commission amount';

commit;
