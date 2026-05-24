

import { createServerSupabaseClient } from '@/src/lib/supabase/server';

type SaveAttendanceInput = {
  employeeId: string;
  yearMonth: string;
  branchSection?: string | null;
  calendarDays: number;
  workedDays: number;
  workedHours: number;
  offDays: number;
  statutoryHolidayDays: number;
  birthdayLeaveDays: number;
  tb8Days: number;
  sickLeaveDays: number;
  maternityLeaveDays: number;
  rewardLeaveDays: number;
  annualLeaveDays: number;
  compassionateLeaveDays: number;
  sickNoPayDays: number;
  noPayLeaveDays: number;
  noPayStatutoryHolidayDays: number;
  lateDays: number;
  prevMonthRemainingHours: number;
  makeupHours: number;
  overtimeHours: number;
  leaveToHoursConversion: number;
  accumulatedOtHours: number;
  remarks?: string | null;
};

function sanitizeNumber(value: number) {
  if (!Number.isFinite(value) || value < 0) return 0;
  return Number(value.toFixed(2));
}

function sanitizeSignedNumber(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Number(value.toFixed(2));
}

function sanitizeNegativeNumber(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Number((-Math.abs(value)).toFixed(2));
}

export async function saveAttendanceManagementRecord(input: SaveAttendanceInput) {
  const supabase = await createServerSupabaseClient();

  const totalDays = [
    input.workedDays,
    input.offDays,
    input.statutoryHolidayDays,
    input.birthdayLeaveDays,
    input.tb8Days,
    input.sickLeaveDays,
    input.maternityLeaveDays,
    input.rewardLeaveDays,
    input.annualLeaveDays,
    input.compassionateLeaveDays,
    input.sickNoPayDays,
    input.noPayLeaveDays,
    input.noPayStatutoryHolidayDays,
  ].reduce((sum, value) => sum + sanitizeNumber(value), 0);

  const payload = {
    employee_id: input.employeeId,
    year_month: input.yearMonth,
    branch_section: input.branchSection ?? null,
    calendar_days: sanitizeNumber(input.calendarDays),
    worked_days: sanitizeNumber(input.workedDays),
    worked_hours: sanitizeNumber(input.workedHours),
    off_days: sanitizeNumber(input.offDays),
    statutory_holiday_days: sanitizeNumber(input.statutoryHolidayDays),
    birthday_leave_days: sanitizeNumber(input.birthdayLeaveDays),
    tb8_days: sanitizeNumber(input.tb8Days),
    sick_leave_days: sanitizeNumber(input.sickLeaveDays),
    maternity_leave_days: sanitizeNumber(input.maternityLeaveDays),
    reward_leave_days: sanitizeNumber(input.rewardLeaveDays),
    annual_leave_days: sanitizeNumber(input.annualLeaveDays),
    compassionate_leave_days: sanitizeNumber(input.compassionateLeaveDays),
    sick_no_pay_days: sanitizeNumber(input.sickNoPayDays),
    no_pay_leave_days: sanitizeNumber(input.noPayLeaveDays),
    no_pay_statutory_holiday_days: sanitizeNumber(input.noPayStatutoryHolidayDays),
    late_days: sanitizeNumber(input.lateDays),
    prev_month_remaining_hours: sanitizeSignedNumber(input.prevMonthRemainingHours),
    makeup_hours: sanitizeNegativeNumber(input.makeupHours),
    overtime_hours: sanitizeSignedNumber(input.overtimeHours),
    leave_to_hours_conversion: sanitizeNumber(input.leaveToHoursConversion),
    accumulated_ot_hours: sanitizeSignedNumber(input.accumulatedOtHours),
    total_days: Number(totalDays.toFixed(2)),
    remarks: input.remarks?.trim() || null,
  };

  const { data, error } = await supabase
    .from('monthly_attendance_records')
    .upsert(payload, { onConflict: 'employee_id,year_month' })
    .select('*')
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  const { data: viewRecord } = await supabase
    .from('attendance_management_records')
    .select('*')
    .eq('employee_id', input.employeeId)
    .eq('year_month', input.yearMonth)
    .maybeSingle();

  return { success: true, record: { ...(viewRecord ?? data), worked_hours: data.worked_hours } };
}

export async function approveLeaveRequest(requestId: string, reviewNotes?: string) {
  const supabase = await createServerSupabaseClient();

  // Get the request details first
  const { data: request } = await supabase
    .from('leave_requests')
    .select('id, employee_id, leave_type, days, status')
    .eq('id', requestId)
    .single();

  if (!request || request.status !== 'pending') {
    return { success: false, error: 'Request not found or not pending' };
  }

  // Update request status
  const { error: updateError } = await supabase
    .from('leave_requests')
    .update({
      status: 'approved',
      reviewed_at: new Date().toISOString(),
      review_notes: reviewNotes ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', requestId);

  if (updateError) return { success: false, error: updateError.message };

  // Move days from pending to used in leave_balances
  const year = new Date().getFullYear();
  const { data: balance } = await supabase
    .from('leave_balances')
    .select('id, used_days, pending_days')
    .eq('employee_id', request.employee_id)
    .eq('leave_type', request.leave_type)
    .eq('year', year)
    .single();

  if (balance) {
    await supabase
      .from('leave_balances')
      .update({
        used_days: Number(balance.used_days) + Number(request.days),
        pending_days: Math.max(0, Number(balance.pending_days) - Number(request.days)),
        updated_at: new Date().toISOString(),
      })
      .eq('id', balance.id);
  }

  void 0;
  return { success: true };
}

export async function rejectLeaveRequest(requestId: string, reviewNotes?: string) {
  const supabase = await createServerSupabaseClient();

  const { data: request } = await supabase
    .from('leave_requests')
    .select('id, employee_id, leave_type, days, status')
    .eq('id', requestId)
    .single();

  if (!request || request.status !== 'pending') {
    return { success: false, error: 'Request not found or not pending' };
  }

  const { error: updateError } = await supabase
    .from('leave_requests')
    .update({
      status: 'rejected',
      reviewed_at: new Date().toISOString(),
      review_notes: reviewNotes ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', requestId);

  if (updateError) return { success: false, error: updateError.message };

  // Remove from pending_days
  const year = new Date().getFullYear();
  const { data: balance } = await supabase
    .from('leave_balances')
    .select('id, pending_days')
    .eq('employee_id', request.employee_id)
    .eq('leave_type', request.leave_type)
    .eq('year', year)
    .single();

  if (balance) {
    await supabase
      .from('leave_balances')
      .update({
        pending_days: Math.max(0, Number(balance.pending_days) - Number(request.days)),
        updated_at: new Date().toISOString(),
      })
      .eq('id', balance.id);
  }

  void 0;
  return { success: true };
}
