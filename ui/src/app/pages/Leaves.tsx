"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Building2, ChevronDown, ChevronRight, Download, Search, ZoomIn, ZoomOut, SaveAll, X } from 'lucide-react';
import Link from 'next/link';
import { saveAttendanceManagementRecord } from '@/app/app/leaves/actions';
import YearMonthPicker from '../components/YearMonthPicker';
import { useLanguage } from '../i18n/LanguageContext';
import { saveRowsAsExcel } from '../utils/excelExport';
import type {
  AttendanceDeductionBasis,
  AttendanceManagementOverview,
  AttendanceManagementMonthlyRecord,
  EmployeeDirectoryRecord,
} from '@/src/lib/employees/queries';

type AttendanceManagementProps = {
  overview: AttendanceManagementOverview;
  focusMode?: boolean;
  initialMonth?: string | null;
  initialScale?: number | null;
};

type CombinedAttendanceRow = {
  employee: EmployeeDirectoryRecord;
  record: AttendanceManagementMonthlyRecord | null;
  salaryType: AttendanceDeductionBasis['salaryType'];
  groupLabel: string;
  displayName: string;
};

type GroupedAttendanceRows = {
  groupLabel: string;
  rows: CombinedAttendanceRow[];
};

type ColumnDefinition = {
  key: keyof AttendanceManagementMonthlyRecord | 'employeeCode' | 'displayName' | 'remarks' | 'updated_at';
  label: string;
  className: string;
  cellClassName: string;
  sticky?: 'code' | 'name';
};

type EditableAttendanceField =
  | 'workedDays'
  | 'workedHours'
  | 'offDays'
  | 'statutoryHolidayDays'
  | 'birthdayLeaveDays'
  | 'tb8Days'
  | 'sickLeaveDays'
  | 'maternityLeaveDays'
  | 'rewardLeaveDays'
  | 'annualLeaveDays'
  | 'compassionateLeaveDays'
  | 'sickNoPayDays'
  | 'noPayLeaveDays'
  | 'noPayStatutoryHolidayDays'
  | 'lateDays'
  | 'prevMonthRemainingHours'
  | 'makeupHours'
  | 'overtimeHours'
  | 'leaveToHoursConversion'
  | 'accumulatedOtHours';

type AttendanceDraftRow = Record<EditableAttendanceField, string> & {
  calendarDays: number;
  remarks: string;
};

const OT_TRACKING_START_MONTH = '2026-04';
const PREV_MONTH_AUTO_START_MONTH = '2026-05';

type RowFeedback = {
  tone: 'idle' | 'saved' | 'error';
  message: string | null;
};

const editableDayFields: EditableAttendanceField[] = [
  'workedDays',
  'offDays',
  'statutoryHolidayDays',
  'birthdayLeaveDays',
  'tb8Days',
  'sickLeaveDays',
  'maternityLeaveDays',
  'rewardLeaveDays',
  'annualLeaveDays',
  'compassionateLeaveDays',
  'sickNoPayDays',
  'noPayLeaveDays',
  'noPayStatutoryHolidayDays',
];

const editableHourFields: EditableAttendanceField[] = [
  'workedHours',
  'prevMonthRemainingHours',
  'makeupHours',
  'overtimeHours',
  'leaveToHoursConversion',
  'accumulatedOtHours',
];

const editableFields: EditableAttendanceField[] = [...editableDayFields, ...editableHourFields, 'lateDays'];

const translations = {
  'zh-TW': {
    title: '出勤管理',
    month: '月份',
    total: '員工數',
    groups: '分店數',
    totalWorkedDays: '合計出勤日數',
    allStaff: '全部員工',
    search: '搜尋員工 / 編號 / 分店',
    searchPlaceholder: '輸入 Staff Code、姓名、Alias 或分店...',
    branchFilter: '分店',
    salaryFilter: '計薪方式',
    allBranches: '全部分店',
    allSalaryTypes: '全部計薪方式',
    clearSearch: '清除搜尋',
    showing: '顯示',
    closeTab: '關閉分頁',
    openFocusView: '開新分頁',
    prev: '上一月',
    next: '下一月',
    collapseBranch: '收合分店',
    expandBranch: '展開分店',
    zoomOut: '縮小',
    zoomReset: '重設',
    zoomIn: '放大',
    viewScale: '顯示比例',
    empty: '未有出勤資料時，先顯示員工主檔與空白格式。',
    save: '儲存',
    saving: '儲存中...',
    saved: '已儲存',
    exportingPdf: '匯出中...',
    exportExcel: '匯出 Excel',
    exportExcelFail: 'Excel 匯出失敗',
    totalMismatch: '提醒：總日數與計薪日數不一致',
    totalMismatchConfirm: '總日數與計薪日數不一致。系統不會阻止儲存；如 AL / SH 等有多出日數，Payroll 會照按平均日數工資另外加上。是否確認儲存？',
    totalMismatchBulkConfirm: '有 {count} 位員工總日數與計薪日數不一致。系統不會阻止儲存；如 AL / SH 等有多出日數，Payroll 會照按平均日數工資另外加上。是否確認全部儲存？',
    salaryTypeLabel: '計薪方式',
    salaryTypeNames: {
      monthly: '月薪',
      daily: '日薪',
      hourly: '時薪',
      package: 'Package / 包薪',
      street_promoter: '街霸',
      unset: '未設定',
    },
    attendanceModeHints: {
      monthly: '計薪日數預設為當月日數；如曾手動修改，新月份會沿用最近一次手動值。',
      daily: '日薪員工仍使用同一個計薪日數欄位，可手動修改並沿用最近一次手動值。',
      hourly: '時薪員工只需輸入計薪鐘數；計薪日數及其他日數欄位會隱藏，避免混淆。',
      package: 'Package 保留 package 規則；計薪日數可手動修改，不因兼職身份改成日薪/時薪。',
      street_promoter: '街霸按特殊佣金規則處理；計薪日數可作出勤核對。',
      unset: '未設定計薪方式：計薪日數仍可儲存，請再到員工 Profile 確認。',
    },
    deduction: '無薪扣減',
    deductionBase: '扣減基礎',
    noPayDays: '無薪日數',
    remarksPlaceholder: '輸入備註',
    saveError: '儲存失敗',
    cols: {
      code: 'Staff Code',
      name: 'Items',
      calendarDays: '計薪日數',
      workedDays: '上班',
      workedHours: '計薪鐘數',
      offDays: '例假 (OFF)',
      statutoryHolidayDays: '計算勞工假 (SH)',
      birthdayLeaveDays: '生日假 (BL)',
      tb8Days: 'TB8',
      sickLeaveDays: '病假 (SL)',
      maternityLeaveDays: '產假',
      rewardLeaveDays: '獎勵假 (SB)',
      annualLeaveDays: '年假 (AL)',
      compassionateLeaveDays: '恩恤假',
      sickNoPayDays: '病假 (SL)(No Pay)',
      noPayLeaveDays: '事假 (NPL)',
      noPayStatutoryHolidayDays: 'No Pay 勞工假 (NPSH)',
      lateDays: '遲到時間(分鐘)',
      prevMonthRemainingHours: '上月剩餘鐘數 (HOUR)',
      makeupHours: '補鐘',
      overtimeHours: 'OT',
      leaveToHoursConversion: '假期轉鐘 (1天=8HOUR)',
      accumulatedOtHours: '累積OT時數 (Hours)',
      totalDays: '總日數',
      remarks: '備註',
      updatedAt: '上次修改',
    },
  },
  'zh-CN': {
    title: '出勤管理',
    month: '月份',
    total: '员工数',
    groups: '分店数',
    totalWorkedDays: '合计出勤日数',
    allStaff: '全部员工',
    search: '搜索员工 / 编号 / 分店',
    searchPlaceholder: '输入 Staff Code、姓名、Alias 或分店...',
    branchFilter: '分店',
    salaryFilter: '计薪方式',
    allBranches: '全部分店',
    allSalaryTypes: '全部计薪方式',
    clearSearch: '清除搜索',
    showing: '显示',
    closeTab: '关闭分页',
    openFocusView: '开新分页',
    prev: '上一月',
    next: '下一月',
    collapseBranch: '收合分店',
    expandBranch: '展开分店',
    zoomOut: '缩小',
    zoomReset: '重设',
    zoomIn: '放大',
    viewScale: '显示比例',
    empty: '未有出勤资料时，先显示员工主档与空白格式。',
    save: '保存',
    saving: '保存中...',
    saved: '已保存',
    exportingPdf: '导出中...',
    exportExcel: '导出 Excel',
    exportExcelFail: 'Excel 导出失败',
    totalMismatch: '提醒：总日数与计薪日数不一致',
    totalMismatchConfirm: '总日数与计薪日数不一致。系统不会阻止保存；如 AL / SH 等有多出日数，Payroll 会照按平均日数工资另外加上。是否确认保存？',
    totalMismatchBulkConfirm: '有 {count} 位员工总日数与计薪日数不一致。系统不会阻止保存；如 AL / SH 等有多出日数，Payroll 会照按平均日数工资另外加上。是否确认全部保存？',
    salaryTypeLabel: '计薪方式',
    salaryTypeNames: {
      monthly: '月薪',
      daily: '日薪',
      hourly: '时薪',
      package: 'Package / 包薪',
      street_promoter: '街霸',
      unset: '未设置',
    },
    attendanceModeHints: {
      monthly: '计薪日数预设为当月日数；如曾手动修改，新月份会沿用最近一次手动值。',
      daily: '日薪员工仍使用同一个计薪日数栏位，可手动修改并沿用最近一次手动值。',
      hourly: '时薪员工只需输入计薪钟数；计薪日数及其他日数栏位会隐藏，避免混淆。',
      package: 'Package 保留 package 规则；计薪日数可手动修改，不因兼职身份改成日薪/时薪。',
      street_promoter: '街霸按特殊佣金规则处理；计薪日数可作出勤核对。',
      unset: '未设置计薪方式：计薪日数仍可储存，请再到员工 Profile 确认。',
    },
    deduction: '无薪扣减',
    deductionBase: '扣减基础',
    noPayDays: '无薪日数',
    remarksPlaceholder: '输入备注',
    saveError: '保存失败',
    cols: {
      code: 'Staff Code',
      name: 'Items',
      calendarDays: '计薪日数',
      workedDays: '上班',
      workedHours: '计薪钟数',
      offDays: '例假 (OFF)',
      statutoryHolidayDays: '计算劳工假 (SH)',
      birthdayLeaveDays: '生日假 (BL)',
      tb8Days: 'TB8',
      sickLeaveDays: '病假 (SL)',
      maternityLeaveDays: '产假',
      rewardLeaveDays: '奖励假 (SB)',
      annualLeaveDays: '年假 (AL)',
      compassionateLeaveDays: '恩恤假',
      sickNoPayDays: '病假 (SL)(No Pay)',
      noPayLeaveDays: '事假 (NPL)',
      noPayStatutoryHolidayDays: 'No Pay 劳工假 (NPSH)',
      lateDays: '迟到时间(分钟)',
      prevMonthRemainingHours: '上月剩余钟数 (HOUR)',
      makeupHours: '补钟',
      overtimeHours: 'OT',
      leaveToHoursConversion: '假期转钟 (1天=8HOUR)',
      accumulatedOtHours: '累计OT时数 (Hours)',
      totalDays: '总日数',
      remarks: '备注',
      updatedAt: '上次修改',
    },
  },
  en: {
    title: 'Attendance Management',
    month: 'Month',
    total: 'Employees',
    groups: 'Branches',
    totalWorkedDays: 'Total Worked Days',
    allStaff: 'All Staff',
    search: 'Search Staff / Code / Branch',
    searchPlaceholder: 'Search staff code, name, alias, or branch...',
    branchFilter: 'Branch',
    salaryFilter: 'Salary Type',
    allBranches: 'All Branches',
    allSalaryTypes: 'All Salary Types',
    clearSearch: 'Clear Search',
    showing: 'Showing',
    closeTab: 'Close Tab',
    openFocusView: 'Open New Tab',
    prev: 'Previous Month',
    next: 'Next Month',
    collapseBranch: 'Collapse Branch',
    expandBranch: 'Expand Branch',
    zoomOut: 'Zoom Out',
    zoomReset: 'Reset',
    zoomIn: 'Zoom In',
    viewScale: 'View Scale',
    empty: 'When attendance is not imported yet, employee profiles still appear with empty monthly cells.',
    save: 'Save',
    saving: 'Saving...',
    saved: 'Saved',
    exportingPdf: 'Exporting...',
    exportExcel: 'Export Excel',
    exportExcelFail: 'Excel Export Failed',
    totalMismatch: 'Warning: total days do not match calendar days',
    totalMismatchConfirm: 'Total days do not match calendar days. Saving is still allowed; extra AL / SH days will still be added in Payroll using average daily wages. Confirm save?',
    totalMismatchBulkConfirm: '{count} employees have total days that do not match calendar days. Saving is still allowed; extra AL / SH days will still be added in Payroll using average daily wages. Confirm saving all?',
    salaryTypeLabel: 'Salary Type',
    salaryTypeNames: {
      monthly: 'Monthly',
      daily: 'Daily',
      hourly: 'Hourly',
      package: 'Package',
      street_promoter: 'Street Promoter',
      unset: 'Unset',
    },
    attendanceModeHints: {
      monthly: 'Payroll days default to the month length; manual changes carry forward to new months.',
      daily: 'Daily staff use the same payroll-days field; manual changes carry forward.',
      hourly: 'Hourly staff only need paid hours; payroll-day and day-count fields are hidden to avoid confusion.',
      package: 'Package rules remain unchanged; payroll days can be edited without forcing daily/hourly payroll.',
      street_promoter: 'Street promoters use special commission rules; payroll days can be kept for attendance checks.',
      unset: 'Salary type is unset. Payroll days can still be saved; confirm the profile separately.',
    },
    deduction: 'No-Pay Deduction',
    deductionBase: 'Deduction Base',
    noPayDays: 'No-Pay Days',
    remarksPlaceholder: 'Enter remarks',
    saveError: 'Save failed',
    cols: {
      code: 'Staff Code',
      name: 'Items',
      calendarDays: 'Calendar Days',
      workedDays: 'Worked',
      workedHours: 'Paid Hours',
      offDays: 'OFF',
      statutoryHolidayDays: 'SH',
      birthdayLeaveDays: 'BL',
      tb8Days: 'TB8',
      sickLeaveDays: 'SL',
      maternityLeaveDays: 'Maternity',
      rewardLeaveDays: 'SB',
      annualLeaveDays: 'AL',
      compassionateLeaveDays: 'Compassionate',
      sickNoPayDays: 'SL No Pay',
      noPayLeaveDays: 'NPL',
      noPayStatutoryHolidayDays: 'NPSH',
      lateDays: 'Late Minutes',
      prevMonthRemainingHours: 'Prev Hours',
      makeupHours: 'Makeup',
      overtimeHours: 'OT',
      leaveToHoursConversion: 'Leave to Hours',
      accumulatedOtHours: 'Accumulated OT',
      totalDays: 'Total Days',
      remarks: 'Remarks',
      updatedAt: 'Last Modified',
    },
  },
} as const;

function displayName(employee: EmployeeDirectoryRecord) {
  return employee.alias || employee.nameZh || employee.nameEn;
}

function groupLabelFor(employee: EmployeeDirectoryRecord) {
  return employee.branchNameZh || employee.branchCode || employee.branchNameEn || 'UNASSIGNED';
}

type AttendanceSalaryTypeKey = NonNullable<AttendanceDeductionBasis['salaryType']> | 'unset';

function getSalaryTypeKey(salaryType: AttendanceDeductionBasis['salaryType']): AttendanceSalaryTypeKey {
  return salaryType ?? 'unset';
}

function getManualCalendarDaysFromHistory(
  historyMap: Map<string, AttendanceManagementMonthlyRecord[]>,
  employeeId: string,
  selectedMonth: string,
) {
  const employeeRecords = historyMap.get(employeeId) ?? [];

  for (let index = employeeRecords.length - 1; index >= 0; index -= 1) {
    const record = employeeRecords[index];
    const calendarDays = record.calendarDays ?? 0;
    const monthDays = getDaysInMonth(record.yearMonth);

    if (record.yearMonth < selectedMonth && calendarDays > 0 && monthDays !== null && calendarDays !== monthDays) {
      return calendarDays;
    }
  }

  return null;
}

function getCalendarDaysDefault(
  row: CombinedAttendanceRow,
  selectedMonthDays: number | null,
  selectedMonth: string,
  historyMap: Map<string, AttendanceManagementMonthlyRecord[]>,
) {
  if (row.record?.calendarDays && row.record.calendarDays > 0) {
    return row.record.calendarDays;
  }

  const rememberedCalendarDays = getManualCalendarDaysFromHistory(historyMap, row.employee.id, selectedMonth);
  if (rememberedCalendarDays !== null) return rememberedCalendarDays;

  return selectedMonthDays ?? 0;
}

function formatValue(value: number | string | null) {
  if (value === null || value === '') return '—';

  const numericValue = typeof value === 'string' ? Number(value) : value;
  if (!Number.isFinite(numericValue) || numericValue === 0) return '—';

  return Number.isInteger(numericValue) ? String(numericValue) : numericValue.toFixed(1).replace(/\.0$/, '');
}

function getDaysInMonth(yearMonth: string) {
  const [year, month] = yearMonth.split('-').map(Number);
  if (!year || !month) return null;
  return new Date(year, month, 0).getDate();
}

function toDraftNumber(value: number | null | undefined) {
  if (value === null || value === undefined || value === 0) return '';
  return Number.isInteger(value) ? String(value) : String(value);
}

function parseDraftNumber(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return 0;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

function parseSignedDraftNumber(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return 0;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeMakeupHours(value: number) {
  return -Math.abs(value);
}

function buildMonthlyRecordMap(records: AttendanceManagementMonthlyRecord[]) {
  return new Map(records.map((record) => [`${record.employeeId}:${record.yearMonth}`, record]));
}

function buildEmployeeHistoryMap(records: AttendanceManagementMonthlyRecord[]) {
  const historyMap = new Map<string, AttendanceManagementMonthlyRecord[]>();

  for (const record of records) {
    const current = historyMap.get(record.employeeId) ?? [];
    current.push(record);
    historyMap.set(record.employeeId, current);
  }

  for (const employeeRecords of historyMap.values()) {
    employeeRecords.sort((left, right) => left.yearMonth.localeCompare(right.yearMonth));
  }

  return historyMap;
}

function isPrevMonthRemainingHoursAutoMonth(selectedMonth: string) {
  return selectedMonth >= PREV_MONTH_AUTO_START_MONTH;
}

function getLatestHistoricalAttendanceRecord(
  historyMap: Map<string, AttendanceManagementMonthlyRecord[]>,
  employeeId: string,
  selectedMonth: string,
) {
  const employeeRecords = historyMap.get(employeeId) ?? [];

  for (let index = employeeRecords.length - 1; index >= 0; index -= 1) {
    if (employeeRecords[index].yearMonth < selectedMonth) {
      return employeeRecords[index];
    }
  }

  return null;
}

function getCarryForwardPrevHours(
  historyMap: Map<string, AttendanceManagementMonthlyRecord[]>,
  employeeId: string,
  selectedMonth: string,
) {
  if (!isPrevMonthRemainingHoursAutoMonth(selectedMonth)) {
    return null;
  }

  return getLatestHistoricalAttendanceRecord(historyMap, employeeId, selectedMonth)?.accumulatedOtHours ?? null;
}

function calculateAccumulatedOtHours(prevMonthRemainingHours: number, makeupHours: number, overtimeHours: number, leaveToHoursConversionDays: number) {
  return Number((prevMonthRemainingHours + normalizeMakeupHours(makeupHours) + overtimeHours + (leaveToHoursConversionDays * 8)).toFixed(2));
}

function createDraftRow(
  row: CombinedAttendanceRow,
  selectedMonthDays: number | null,
  selectedMonth: string,
  historyMap: Map<string, AttendanceManagementMonthlyRecord[]>,
): AttendanceDraftRow {
  const calendarDays = getCalendarDaysDefault(row, selectedMonthDays, selectedMonth, historyMap);
  const carriedPrevMonthHours = getCarryForwardPrevHours(historyMap, row.employee.id, selectedMonth);
  const effectivePrevMonthRemainingHours = isPrevMonthRemainingHoursAutoMonth(selectedMonth)
    ? (carriedPrevMonthHours ?? row.record?.prevMonthRemainingHours ?? null)
    : (row.record?.prevMonthRemainingHours ?? null);
  const makeupHours = row.record?.makeupHours ?? null;
  const overtimeHours = row.record?.overtimeHours ?? null;
  const leaveToHoursConversion = row.record?.leaveToHoursConversion ?? null;
  const accumulatedOtHours = calculateAccumulatedOtHours(
    effectivePrevMonthRemainingHours ?? 0,
    makeupHours ?? 0,
    overtimeHours ?? 0,
    leaveToHoursConversion ?? 0,
  );

  return {
    calendarDays,
    workedDays: row.salaryType === 'hourly' ? '' : toDraftNumber(row.record?.workedDays),
    workedHours: toDraftNumber(row.record?.workedHours),
    offDays: toDraftNumber(row.record?.offDays),
    statutoryHolidayDays: toDraftNumber(row.record?.statutoryHolidayDays),
    birthdayLeaveDays: toDraftNumber(row.record?.birthdayLeaveDays),
    tb8Days: toDraftNumber(row.record?.tb8Days),
    sickLeaveDays: toDraftNumber(row.record?.sickLeaveDays),
    maternityLeaveDays: toDraftNumber(row.record?.maternityLeaveDays),
    rewardLeaveDays: toDraftNumber(row.record?.rewardLeaveDays),
    annualLeaveDays: toDraftNumber(row.record?.annualLeaveDays),
    compassionateLeaveDays: toDraftNumber(row.record?.compassionateLeaveDays),
    sickNoPayDays: toDraftNumber(row.record?.sickNoPayDays),
    noPayLeaveDays: toDraftNumber(row.record?.noPayLeaveDays),
    noPayStatutoryHolidayDays: toDraftNumber(row.record?.noPayStatutoryHolidayDays),
    lateDays: toDraftNumber(row.record?.lateDays),
    prevMonthRemainingHours: toDraftNumber(effectivePrevMonthRemainingHours),
    makeupHours: makeupHours === null || makeupHours === undefined || makeupHours === 0 ? '' : String(normalizeMakeupHours(makeupHours)),
    overtimeHours: toDraftNumber(overtimeHours),
    leaveToHoursConversion: toDraftNumber(leaveToHoursConversion),
    accumulatedOtHours: accumulatedOtHours === 0 ? '' : String(accumulatedOtHours),
    remarks: row.record?.remarks ?? '',
  };
}

function calculateDraftTotal(draft: AttendanceDraftRow) {
  return editableDayFields.reduce((sum, field) => sum + parseDraftNumber(draft[field]), 0);
}

function getEffectiveCalendarDays(row: CombinedAttendanceRow, draft: AttendanceDraftRow) {
  if (row.salaryType === 'hourly') return 0;
  return draft.calendarDays;
}

function hasAttendanceTotalMismatch(row: CombinedAttendanceRow, draft: AttendanceDraftRow) {
  if (row.salaryType === 'hourly') return false;
  const totalDays = Number(calculateDraftTotal(draft).toFixed(2));
  const effectiveCalendarDays = getEffectiveCalendarDays(row, draft);
  return Math.abs(totalDays - effectiveCalendarDays) > 0.001;
}

function formatCurrency(value: number, locale: string) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'HKD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function normalizeUpdatedAt(value: unknown) {
  if (typeof value === 'string' && value.length > 0) return value;
  if (value instanceof Date) return value.toISOString();
  return null;
}

function mapUpdatedAt(record: Record<string, unknown>, fallback: string | null | undefined) {
  return normalizeUpdatedAt(record.updated_at) ?? normalizeUpdatedAt(record.updatedAt) ?? fallback ?? null;
}

function buildCombinedRows(
  employees: EmployeeDirectoryRecord[],
  records: AttendanceManagementMonthlyRecord[],
  selectedMonth: string,
  deductionBasisByEmployeeCode: Record<string, AttendanceDeductionBasis>,
) {
  const monthRecordMap = new Map(
    records.filter((record) => record.yearMonth === selectedMonth).map((record) => [record.employeeId, record]),
  );

  const rows: CombinedAttendanceRow[] = employees.map((employee) => ({
    employee,
    record: monthRecordMap.get(employee.id) ?? null,
    salaryType: monthRecordMap.get(employee.id)?.salaryType as AttendanceDeductionBasis['salaryType'] ?? deductionBasisByEmployeeCode[employee.employeeCode]?.salaryType ?? null,
    groupLabel: groupLabelFor(employee),
    displayName: displayName(employee),
  }));

  rows.sort((left, right) => {
    const groupCompare = left.groupLabel.localeCompare(right.groupLabel);
    if (groupCompare !== 0) return groupCompare;
    return left.employee.employeeCode.localeCompare(right.employee.employeeCode);
  });

  return rows;
}

function groupRows(rows: CombinedAttendanceRow[]): GroupedAttendanceRows[] {
  const grouped = new Map<string, CombinedAttendanceRow[]>();
  for (const row of rows) {
    const current = grouped.get(row.groupLabel) ?? [];
    current.push(row);
    grouped.set(row.groupLabel, current);
  }

  return Array.from(grouped.entries()).map(([groupLabel, groupItems]) => ({
    groupLabel,
    rows: groupItems,
  }));
}

function clampScale(value: number) {
  return Math.min(1.15, Math.max(0.6, Number(value.toFixed(2))));
}

export default function AttendanceManagement({ overview, focusMode = false, initialMonth = null, initialScale = null }: AttendanceManagementProps) {
  const { lang } = useLanguage();
  const t = translations[lang] ?? translations.en;
  const locale = lang === 'en' ? 'en-HK' : lang === 'zh-CN' ? 'zh-CN' : 'zh-HK';
  const monthFromUrl = initialMonth && /^\d{4}-\d{2}$/.test(initialMonth) ? initialMonth : overview.defaultMonth;
  const [selectedMonth, setSelectedMonth] = useState(monthFromUrl);
  const [tableScale, setTableScale] = useState(() => clampScale(initialScale ?? 0.65));
  const [records, setRecords] = useState(overview.records);
  const [searchQuery, setSearchQuery] = useState('');
  const [branchFilter, setBranchFilter] = useState('all');
  const [salaryFilter, setSalaryFilter] = useState('all');
  const selectedMonthDays = getDaysInMonth(selectedMonth);
  const recordMap = useMemo(() => buildMonthlyRecordMap(records), [records]);
  const historyMap = useMemo(() => buildEmployeeHistoryMap(records), [records]);
  const allRows = useMemo(
    () => buildCombinedRows(overview.employees, records, selectedMonth, overview.deductionBasisByEmployeeCode),
    [overview.employees, overview.deductionBasisByEmployeeCode, records, selectedMonth],
  );
  const branchOptions = useMemo(() => Array.from(new Set(allRows.map((row) => row.groupLabel))).sort((left, right) => left.localeCompare(right)), [allRows]);
  const salaryOptions = useMemo(() => Array.from(new Set(allRows.map((row) => getSalaryTypeKey(row.salaryType)))).sort((left, right) => t.salaryTypeNames[left].localeCompare(t.salaryTypeNames[right])), [allRows, t]);
  const rows = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();
    return allRows.filter((row) => {
      const salaryKey = getSalaryTypeKey(row.salaryType);
      if (branchFilter !== 'all' && row.groupLabel !== branchFilter) return false;
      if (salaryFilter !== 'all' && salaryKey !== salaryFilter) return false;
      if (!normalizedSearch) return true;
      return [
        row.employee.employeeCode,
        row.displayName,
        row.employee.nameZh,
        row.employee.nameEn,
        row.employee.alias,
        row.employee.branchNameZh,
        row.employee.branchCode,
        row.groupLabel,
      ].some((value) => String(value ?? '').toLowerCase().includes(normalizedSearch));
    });
  }, [allRows, branchFilter, salaryFilter, searchQuery]);
  const groupedRows = useMemo<GroupedAttendanceRows[]>(() => [{ groupLabel: t.allStaff, rows }], [rows, t.allStaff]);
  const [drafts, setDrafts] = useState<Record<string, AttendanceDraftRow>>({});
  const [savingRows, setSavingRows] = useState<Record<string, boolean>>({});
  const [rowFeedback, setRowFeedback] = useState<Record<string, RowFeedback>>({});
  const [dirtyRows, setDirtyRows] = useState<Set<string>>(new Set());
  const [saveAllStatus, setSaveAllStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [exportExcelStatus, setExportExcelStatus] = useState<'idle' | 'exporting' | 'error'>('idle');
  const scaledTableRefs = useRef<Record<string, HTMLDivElement>>({});
  const [tableHeights, setTableHeights] = useState<Record<string, number>>({});
  const [supportsCssZoom, setSupportsCssZoom] = useState(true);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

  useEffect(() => {
    setRecords(overview.records);
  }, [overview.records]);

  useEffect(() => {
    setSelectedMonth(monthFromUrl);
  }, [monthFromUrl]);

  useEffect(() => {
    setSupportsCssZoom(typeof CSS !== 'undefined' && typeof CSS.supports === 'function' && CSS.supports('zoom', '1'));
  }, []);

  useEffect(() => {
    setDrafts(Object.fromEntries(allRows.map((row) => [row.employee.id, createDraftRow(row, selectedMonthDays, selectedMonth, historyMap)])));
    setSavingRows({});
    setRowFeedback({});
    setDirtyRows(new Set());
  }, [allRows, historyMap, overview.employees, recordMap, selectedMonth, selectedMonthDays]);

  useEffect(() => {
    setCollapsedGroups((current) => {
      const activeGroupLabels = new Set(groupedRows.map((group) => group.groupLabel));
      let changed = false;
      const next = new Set<string>();

      for (const groupLabel of current) {
        if (activeGroupLabels.has(groupLabel)) {
          next.add(groupLabel);
        } else {
          changed = true;
        }
      }

      return changed ? next : current;
    });
  }, [groupedRows]);

  useEffect(() => {
    const activeGroupLabels = new Set(groupedRows.map((group) => group.groupLabel));

    setTableHeights((current) => {
      let changed = false;
      const next: Record<string, number> = {};

      for (const [groupLabel, height] of Object.entries(current)) {
        if (activeGroupLabels.has(groupLabel)) {
          next[groupLabel] = height;
        } else {
          changed = true;
        }
      }

      return changed ? next : current;
    });
  }, [groupedRows]);

  const setScaledTableRef = useCallback((groupLabel: string, node: HTMLDivElement | null) => {
    if (node) {
      scaledTableRefs.current[groupLabel] = node;
      return;
    }

    delete scaledTableRefs.current[groupLabel];
  }, []);

  useEffect(() => {
    const tableNodes = groupedRows
      .map((group) => ({
        groupLabel: group.groupLabel,
        node: scaledTableRefs.current[group.groupLabel],
      }))
      .filter((entry): entry is { groupLabel: string; node: HTMLDivElement } => entry.node instanceof HTMLDivElement);

    if (tableNodes.length === 0) {
      return;
    }

    let frameId = 0;

    const measureHeights = () => {
      cancelAnimationFrame(frameId);
      frameId = window.requestAnimationFrame(() => {
        setTableHeights((current) => {
          let changed = false;
          const next = { ...current };

          for (const { groupLabel, node } of tableNodes) {
            const measuredHeight = Math.ceil(node.getBoundingClientRect().height);
            if (next[groupLabel] !== measuredHeight) {
              next[groupLabel] = measuredHeight;
              changed = true;
            }
          }

          return changed ? next : current;
        });
      });
    };

    measureHeights();

    const resizeObserver = new ResizeObserver(() => {
      measureHeights();
    });

    for (const { node } of tableNodes) {
      resizeObserver.observe(node);
    }

    window.addEventListener('resize', measureHeights);

    return () => {
      cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      window.removeEventListener('resize', measureHeights);
    };
  }, [groupedRows, tableScale]);

  const updateDraft = (employeeId: string, field: EditableAttendanceField | 'remarks', value: string) => {
    setDrafts((current) => {
      const sourceRow = allRows.find((row) => row.employee.id === employeeId)!;
      const base = current[employeeId] ?? createDraftRow(sourceRow, selectedMonthDays, selectedMonth, historyMap);
      const nextDraft = {
        ...base,
        [field]: value,
      };

      setDirtyRows((prev) => new Set(prev).add(employeeId));

      const prevMonthRemainingHours = parseSignedDraftNumber(nextDraft.prevMonthRemainingHours);
      const makeupHours = normalizeMakeupHours(parseSignedDraftNumber(nextDraft.makeupHours));
      const overtimeHours = parseSignedDraftNumber(nextDraft.overtimeHours);
      const leaveToHoursConversion = parseDraftNumber(nextDraft.leaveToHoursConversion);
      const accumulatedOtHours = calculateAccumulatedOtHours(
        prevMonthRemainingHours,
        makeupHours,
        overtimeHours,
        leaveToHoursConversion,
      );

      return {
        ...current,
        [employeeId]: {
          ...nextDraft,
          accumulatedOtHours: accumulatedOtHours === 0 ? '' : String(accumulatedOtHours),
        },
      };
    });
    setRowFeedback((current) => ({ ...current, [employeeId]: { tone: 'idle', message: null } }));
  };

  const updateCalendarDays = (employeeId: string, value: string) => {
    setDrafts((current) => {
      const sourceRow = allRows.find((row) => row.employee.id === employeeId)!;
      const base = current[employeeId] ?? createDraftRow(sourceRow, selectedMonthDays, selectedMonth, historyMap);
      const parsed = parseDraftNumber(value);

      setDirtyRows((prev) => new Set(prev).add(employeeId));

      return {
        ...current,
        [employeeId]: {
          ...base,
          calendarDays: parsed,
        },
      };
    });
    setRowFeedback((current) => ({ ...current, [employeeId]: { tone: 'idle', message: null } }));
  };

  const toggleGroup = (groupLabel: string) => {
    setCollapsedGroups((current) => {
      const next = new Set(current);
      if (next.has(groupLabel)) {
        next.delete(groupLabel);
      } else {
        next.add(groupLabel);
      }
      return next;
    });
  };

  const handleMonthChange = (month: string) => {
    setSelectedMonth(month);
    const params = new URLSearchParams();
    params.set('month', month);
    if (focusMode) {
      params.set('scale', tableScale.toFixed(2));
    }
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', `${window.location.pathname}?${params.toString()}`);
    }
  };

  const totalWorkedDays = useMemo(
    () => rows.reduce((sum, row) => sum + Number(row.record?.workedDays ?? 0), 0),
    [rows],
  );

  const openFocusView = () => {
    const params = new URLSearchParams({
      month: selectedMonth,
      scale: tableScale.toFixed(2),
    });
    window.open(`/medimagic/app/attendance/focus?${params.toString()}`, '_blank', 'noopener,noreferrer');
  };

  const handleSaveRow = async (row: CombinedAttendanceRow, options: { skipMismatchConfirm?: boolean } = {}) => {
    const draft = drafts[row.employee.id] ?? createDraftRow(row, selectedMonthDays, selectedMonth, historyMap);
    if (!options.skipMismatchConfirm && hasAttendanceTotalMismatch(row, draft) && !window.confirm(t.totalMismatchConfirm)) {
      return false;
    }
    const prevMonthRemainingHours = parseSignedDraftNumber(draft.prevMonthRemainingHours);
    const makeupHours = normalizeMakeupHours(parseSignedDraftNumber(draft.makeupHours));
    const overtimeHours = parseSignedDraftNumber(draft.overtimeHours);
    const leaveToHoursConversion = parseDraftNumber(draft.leaveToHoursConversion);
    const accumulatedOtHours = calculateAccumulatedOtHours(
      prevMonthRemainingHours,
      makeupHours,
      overtimeHours,
      leaveToHoursConversion,
    );

    setSavingRows((current) => ({ ...current, [row.employee.id]: true }));
    const result = await saveAttendanceManagementRecord({
      employeeId: row.employee.id,
      yearMonth: selectedMonth,
      branchSection: row.record?.branchSection ?? row.employee.branchCode ?? row.employee.branchNameZh,
      calendarDays: getEffectiveCalendarDays(row, draft),
      workedDays: row.salaryType === 'hourly' ? 0 : parseDraftNumber(draft.workedDays),
      workedHours: parseDraftNumber(draft.workedHours),
      offDays: parseDraftNumber(draft.offDays),
      statutoryHolidayDays: parseDraftNumber(draft.statutoryHolidayDays),
      birthdayLeaveDays: parseDraftNumber(draft.birthdayLeaveDays),
      tb8Days: parseDraftNumber(draft.tb8Days),
      sickLeaveDays: parseDraftNumber(draft.sickLeaveDays),
      maternityLeaveDays: parseDraftNumber(draft.maternityLeaveDays),
      rewardLeaveDays: parseDraftNumber(draft.rewardLeaveDays),
      annualLeaveDays: parseDraftNumber(draft.annualLeaveDays),
      compassionateLeaveDays: parseDraftNumber(draft.compassionateLeaveDays),
      sickNoPayDays: parseDraftNumber(draft.sickNoPayDays),
      noPayLeaveDays: parseDraftNumber(draft.noPayLeaveDays),
      noPayStatutoryHolidayDays: parseDraftNumber(draft.noPayStatutoryHolidayDays),
      lateDays: parseDraftNumber(draft.lateDays),
      prevMonthRemainingHours,
      makeupHours,
      overtimeHours,
      leaveToHoursConversion,
      accumulatedOtHours,
      remarks: draft.remarks,
    });
    setSavingRows((current) => ({ ...current, [row.employee.id]: false }));

    if (result.success && result.record) {
      const serverRecord = result.record;
      const mappedRecord: AttendanceManagementMonthlyRecord = {
        employeeId: serverRecord.employee_id,
        employeeCode: serverRecord.employee_code,
        yearMonth: serverRecord.year_month,
        salaryType: serverRecord.salary_type,
        branchSection: serverRecord.branch_section,
        calendarDays: serverRecord.calendar_days,
        workedDays: serverRecord.worked_days,
        workedHours: serverRecord.worked_hours,
        offDays: serverRecord.off_days,
        statutoryHolidayDays: serverRecord.statutory_holiday_days,
        totalDays: serverRecord.total_days,
        birthdayLeaveDays: serverRecord.birthday_leave_days,
        tb8Days: serverRecord.tb8_days,
        sickLeaveDays: serverRecord.sick_leave_days,
        maternityLeaveDays: serverRecord.maternity_leave_days,
        rewardLeaveDays: serverRecord.reward_leave_days,
        annualLeaveDays: serverRecord.annual_leave_days,
        compassionateLeaveDays: serverRecord.compassionate_leave_days,
        sickNoPayDays: serverRecord.sick_no_pay_days,
        noPayLeaveDays: serverRecord.no_pay_leave_days,
        noPayStatutoryHolidayDays: serverRecord.no_pay_statutory_holiday_days,
        noPayDays: serverRecord.no_pay_days,
        lateDays: serverRecord.late_days,
        deductionBase: serverRecord.deduction_base,
        deductionAmount: serverRecord.deduction_amount,
        packageCommissionAmount: serverRecord.package_commission_amount,
        proratedPackageCommission: serverRecord.prorated_package_commission,
        prevMonthRemainingHours: serverRecord.prev_month_remaining_hours,
        makeupHours: serverRecord.makeup_hours,
        overtimeHours: serverRecord.overtime_hours,
        leaveToHoursConversion: serverRecord.leave_to_hours_conversion,
        accumulatedOtHours: serverRecord.accumulated_ot_hours,
        remarks: serverRecord.remarks,
        updated_at: mapUpdatedAt(serverRecord, row.record?.updated_at),
      };

      setRecords((current) => {
        const index = current.findIndex(r => r.employeeId === mappedRecord.employeeId && r.yearMonth === mappedRecord.yearMonth);
        if (index >= 0) {
          const next = [...current];
          next[index] = mappedRecord;
          return next;
        }
        return [mappedRecord, ...current];
      });

      setRowFeedback((current) => ({ ...current, [row.employee.id]: { tone: 'saved', message: t.saved } }));
      setDirtyRows((prev) => {
        const next = new Set(prev);
        next.delete(row.employee.id);
        return next;
      });
      setTimeout(() => {
        setRowFeedback((current) => ({ ...current, [row.employee.id]: { tone: 'idle', message: null } }));
      }, 3000);
      return true;
    } else {
      setRowFeedback((current) => ({
        ...current,
        [row.employee.id]: {
          tone: result.success ? 'saved' : 'error',
          message: result.success ? t.saved : (result.error ?? t.saveError),
        },
      }));
      return false;
    }
  };

  const columns: ColumnDefinition[] = useMemo(() => [
    {
      key: 'employeeCode',
      label: t.cols.code,
      className: 'w-26 min-w-26 sticky left-0 z-30 bg-white text-left',
      cellClassName: 'w-26 min-w-26 sticky left-0 z-20 bg-white text-left font-semibold text-slate-900',
      sticky: 'code',
    },
    {
      key: 'displayName',
      label: t.cols.name,
      className: 'w-28 min-w-28 sticky left-26 z-30 bg-white text-left',
      cellClassName: 'w-28 min-w-28 sticky left-26 z-20 bg-white text-left font-semibold text-slate-900',
      sticky: 'name',
    },
    {
      key: 'calendarDays',
      label: t.cols.calendarDays,
      className: 'w-18 min-w-18 bg-rose-200',
      cellClassName: 'w-18 min-w-18 bg-rose-50 font-semibold',
    },
    { key: 'workedDays', label: t.cols.workedDays, className: 'w-16 min-w-16 bg-amber-200', cellClassName: 'w-16 min-w-16' },
    { key: 'workedHours', label: t.cols.workedHours, className: 'w-18 min-w-18 bg-sky-200', cellClassName: 'w-18 min-w-18' },
    { key: 'offDays', label: t.cols.offDays, className: 'w-22 min-w-22 bg-amber-200', cellClassName: 'w-22 min-w-22' },
    { key: 'statutoryHolidayDays', label: t.cols.statutoryHolidayDays, className: 'w-30 min-w-30 bg-amber-200', cellClassName: 'w-30 min-w-30' },
    { key: 'birthdayLeaveDays', label: t.cols.birthdayLeaveDays, className: 'w-24 min-w-24 bg-amber-200', cellClassName: 'w-24 min-w-24' },
    { key: 'tb8Days', label: t.cols.tb8Days, className: 'w-14 min-w-14 bg-amber-200', cellClassName: 'w-14 min-w-14' },
    { key: 'sickLeaveDays', label: t.cols.sickLeaveDays, className: 'w-22 min-w-22 bg-amber-200', cellClassName: 'w-22 min-w-22' },
    { key: 'maternityLeaveDays', label: t.cols.maternityLeaveDays, className: 'w-14 min-w-14 bg-amber-200', cellClassName: 'w-14 min-w-14' },
    { key: 'rewardLeaveDays', label: t.cols.rewardLeaveDays, className: 'w-24 min-w-24 bg-amber-200', cellClassName: 'w-24 min-w-24' },
    { key: 'annualLeaveDays', label: t.cols.annualLeaveDays, className: 'w-22 min-w-22 bg-amber-200', cellClassName: 'w-22 min-w-22' },
    { key: 'compassionateLeaveDays', label: t.cols.compassionateLeaveDays, className: 'w-18 min-w-18 bg-amber-200', cellClassName: 'w-18 min-w-18' },
    { key: 'sickNoPayDays', label: t.cols.sickNoPayDays, className: 'w-30 min-w-30 bg-white', cellClassName: 'w-30 min-w-30' },
    { key: 'noPayLeaveDays', label: t.cols.noPayLeaveDays, className: 'w-22 min-w-22 bg-white', cellClassName: 'w-22 min-w-22' },
    { key: 'noPayStatutoryHolidayDays', label: t.cols.noPayStatutoryHolidayDays, className: 'w-34 min-w-34 bg-white', cellClassName: 'w-34 min-w-34' },
    { key: 'lateDays', label: t.cols.lateDays, className: 'w-22 min-w-22 bg-rose-200', cellClassName: 'w-22 min-w-22' },
    { key: 'prevMonthRemainingHours', label: t.cols.prevMonthRemainingHours, className: 'w-34 min-w-34 bg-white', cellClassName: 'w-34 min-w-34' },
    { key: 'makeupHours', label: t.cols.makeupHours, className: 'w-14 min-w-14 bg-white', cellClassName: 'w-14 min-w-14' },
    { key: 'overtimeHours', label: t.cols.overtimeHours, className: 'w-14 min-w-14 bg-white', cellClassName: 'w-14 min-w-14' },
    { key: 'leaveToHoursConversion', label: t.cols.leaveToHoursConversion, className: 'w-30 min-w-30 bg-white', cellClassName: 'w-30 min-w-30' },
    { key: 'accumulatedOtHours', label: t.cols.accumulatedOtHours, className: 'w-30 min-w-30 bg-white', cellClassName: 'w-30 min-w-30' },
    { key: 'totalDays', label: t.cols.totalDays, className: 'w-18 min-w-18 bg-white', cellClassName: 'w-18 min-w-18 font-semibold' },
    { key: 'remarks', label: t.cols.remarks, className: 'w-44 min-w-44 bg-white', cellClassName: 'w-44 min-w-44 text-left text-slate-600' },
    { key: 'updated_at', label: t.cols.updatedAt, className: 'w-36 min-w-36 bg-slate-50', cellClassName: 'w-36 min-w-36 text-left text-[10px] text-slate-500' },
  ], [t]);

  const panelClassName = focusMode
    ? 'min-h-screen space-y-4 bg-[#f8f6f1] p-4'
    : 'mx-auto space-y-6 max-w-[1900px] bg-[#f8f6f1]';

  const transformTableScaleStyle = {
    transform: `scale(${tableScale})`,
    transformOrigin: 'top left',
    width: `${100 / tableScale}%`,
  };
  const zoomTableScaleStyle = {
    zoom: tableScale,
    width: `${100 / tableScale}%`,
  } as React.CSSProperties;
  const estimatedScaledTableHeight = (rowCount: number) => {
    const headerHeight = 52;
    const rowHeight = 88;
    const verticalPadding = 16;
    return Math.ceil((headerHeight + rowCount * rowHeight + verticalPadding) * tableScale);
  };

  const visibleTableHeight = (rowCount: number) => {
    const maxVisibleRows = focusMode ? 20 : 10;
    return estimatedScaledTableHeight(Math.min(rowCount, maxVisibleRows));
  };

  const handleSaveAll = async () => {
    const rowsToSave = allRows.filter(row => dirtyRows.has(row.employee.id));
    if (rowsToSave.length === 0) return;
    const mismatchCount = rowsToSave.filter((row) => {
      const draft = drafts[row.employee.id] ?? createDraftRow(row, selectedMonthDays, selectedMonth, historyMap);
      return hasAttendanceTotalMismatch(row, draft);
    }).length;
    if (mismatchCount > 0 && !window.confirm(t.totalMismatchBulkConfirm.replace('{count}', String(mismatchCount)))) {
      return;
    }

    setSaveAllStatus('saving');
    const results = await Promise.all(rowsToSave.map(row => handleSaveRow(row, { skipMismatchConfirm: true })));
    setSaveAllStatus(results.every(Boolean) ? 'saved' : 'error');
    setTimeout(() => setSaveAllStatus('idle'), 3000);
  };

  const formatUpdatedAt = (value: string | null | undefined) => {
    return value ? new Date(value).toLocaleString(lang === 'en' ? 'en-US' : 'zh-HK', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-';
  };

  const getExportCellValue = (row: CombinedAttendanceRow, column: ColumnDefinition) => {
    const draft = drafts[row.employee.id] ?? createDraftRow(row, selectedMonthDays, selectedMonth, historyMap);
    if (column.key === 'employeeCode') return row.employee.employeeCode;
    if (column.key === 'displayName') return row.displayName;
    if (column.key === 'remarks') return draft.remarks || '-';
    if (column.key === 'updated_at') return formatUpdatedAt(row.record?.updated_at);
    if (column.key === 'calendarDays') return row.salaryType === 'hourly' ? '-' : formatValue(draft.calendarDays);
    if (column.key === 'totalDays') return formatValue(Number(calculateDraftTotal(draft).toFixed(2)));
    if (editableFields.includes(column.key as EditableAttendanceField)) {
      const fieldKey = column.key as EditableAttendanceField;
      if (row.salaryType === 'hourly' && fieldKey !== 'workedHours' && fieldKey !== 'accumulatedOtHours') return '-';
      if (row.salaryType !== 'hourly' && fieldKey === 'workedHours') return '-';
      return formatValue(fieldKey === 'accumulatedOtHours'
        ? calculateAccumulatedOtHours(
          parseSignedDraftNumber(draft.prevMonthRemainingHours),
          normalizeMakeupHours(parseSignedDraftNumber(draft.makeupHours)),
          parseSignedDraftNumber(draft.overtimeHours),
          parseDraftNumber(draft.leaveToHoursConversion),
        )
        : parseDraftNumber(draft[fieldKey]));
    }
    return formatValue(row.record?.[column.key] ?? null);
  };

  const handleExportExcel = async () => {
    if (rows.length === 0) return;

    setExportExcelStatus('exporting');
    try {
      await saveRowsAsExcel(
        `attendance-records-${selectedMonth}.xlsx`,
        selectedMonth,
        columns.map((column) => ({ key: String(column.key), header: column.label, width: column.key === 'displayName' ? 28 : column.key === 'remarks' ? 24 : 14 })),
        rows.map((row) => Object.fromEntries(columns.map((column) => [String(column.key), getExportCellValue(row, column)]))),
      );
      setExportExcelStatus('idle');
    } catch (error) {
      console.error('[attendance excel export] unhandled:', error);
      setExportExcelStatus('error');
      window.setTimeout(() => setExportExcelStatus('idle'), 3000);
    }
  };

  return (
    <>
      <div className={panelClassName}>
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">{t.title}</h1>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-3">
              <button type="button" onClick={() => void handleSaveAll()} disabled={dirtyRows.size === 0 || saveAllStatus === 'saving'} className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#B8871A] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[#9f7312] disabled:cursor-not-allowed disabled:opacity-50 whitespace-nowrap">
                <SaveAll className="h-4 w-4" />
                {saveAllStatus === 'saving' ? t.saving : saveAllStatus === 'saved' ? t.saved : saveAllStatus === 'error' ? t.saveError : t.save} {dirtyRows.size > 0 && saveAllStatus !== 'saved' ? `(${dirtyRows.size})` : ''}
              </button>

              <button type="button" onClick={() => void handleExportExcel()} disabled={rows.length === 0 || exportExcelStatus === 'exporting'} className={`inline-flex h-12 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-semibold shadow-sm transition disabled:cursor-not-allowed disabled:opacity-50 whitespace-nowrap ${exportExcelStatus === 'error' ? 'border-rose-200 bg-rose-50 text-rose-700' : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'}`}>
                <Download className="h-4 w-4" />
                {exportExcelStatus === 'exporting' ? t.exportingPdf : exportExcelStatus === 'error' ? t.exportExcelFail : t.exportExcel}
              </button>

              {focusMode ? (
                <button type="button" onClick={() => window.close()} className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-700 whitespace-nowrap">
                  <X className="h-4 w-4" />
                  {t.closeTab}
                </button>
              ) : null}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 auto-rows-fr md:grid-cols-4">
            <div className="h-full rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <YearMonthPicker
                value={selectedMonth}
                onChange={handleMonthChange}
                label={t.month}
                lang={lang}
                className="h-full"
              />
            </div>

            <div className="h-full rounded-xl border border-slate-200 bg-slate-50 p-5 shadow-sm">
              <div className="flex h-full flex-col justify-center gap-1">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{t.total}</div>
                <div className="text-3xl font-bold tracking-tight text-slate-900">{rows.length}</div>
                <div className="text-xs text-slate-500">/ {allRows.length}</div>
              </div>
            </div>

            <div className="h-full rounded-xl border border-slate-200 bg-slate-50 p-5 shadow-sm">
              <div className="flex h-full flex-col justify-center gap-1">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{t.groups}</div>
                <div className="text-3xl font-bold tracking-tight text-slate-900">{branchOptions.length}</div>
              </div>
            </div>

            <div className="h-full rounded-xl border border-slate-200 bg-slate-50 p-5 shadow-sm">
              <div className="flex h-full flex-col justify-center gap-1">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{t.totalWorkedDays}</div>
                <div className="text-3xl font-bold tracking-tight text-slate-900">{totalWorkedDays}</div>
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
            <div className="grid gap-3 lg:grid-cols-[minmax(260px,1fr)_220px_220px_auto] lg:items-end">
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">{t.search}</span>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder={t.searchPlaceholder}
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-800 outline-none transition focus:border-[#B8871A] focus:ring-2 focus:ring-[#B8871A]/15"
                  />
                </div>
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">{t.branchFilter}</span>
                <select value={branchFilter} onChange={(event) => setBranchFilter(event.target.value)} className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-[#B8871A] focus:ring-2 focus:ring-[#B8871A]/15">
                  <option value="all">{t.allBranches}</option>
                  {branchOptions.map((branch) => <option key={branch} value={branch}>{branch}</option>)}
                </select>
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">{t.salaryFilter}</span>
                <select value={salaryFilter} onChange={(event) => setSalaryFilter(event.target.value)} className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-[#B8871A] focus:ring-2 focus:ring-[#B8871A]/15">
                  <option value="all">{t.allSalaryTypes}</option>
                  {salaryOptions.map((salaryType) => <option key={salaryType} value={salaryType}>{t.salaryTypeNames[salaryType]}</option>)}
                </select>
              </label>
              <button
                type="button"
                onClick={() => { setSearchQuery(''); setBranchFilter('all'); setSalaryFilter('all'); }}
                disabled={!searchQuery && branchFilter === 'all' && salaryFilter === 'all'}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <X className="h-4 w-4" />
                {t.clearSearch}
              </button>
            </div>
            <div className="mt-3 text-xs font-medium text-slate-500">{t.showing} {rows.length} / {allRows.length}</div>
          </div>
        </section>

      {rows.length === 0 ? (
        <div className="rounded-4xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
          <p className="text-sm text-slate-500">{t.empty}</p>
        </div>
      ) : (
        groupedRows.map((group) => {
          const isGroupCollapsed = collapsedGroups.has(group.groupLabel);

          return (
          <section
            key={group.groupLabel}
            className="relative isolate rounded-4xl border border-slate-200 bg-white shadow-sm"
          >
            <button
              type="button"
              onClick={() => toggleGroup(group.groupLabel)}
              className="flex w-full items-center justify-between border-b border-slate-200 bg-linear-to-r from-[#fff5d6] via-[#fff8e8] to-[#fff1c2] px-5 py-3 text-left transition hover:brightness-[0.99]"
              aria-expanded={!isGroupCollapsed}
              aria-label={isGroupCollapsed ? t.expandBranch : t.collapseBranch}
            >
              <div className="flex items-center gap-2 text-lg font-bold text-slate-900">
                <Building2 className="h-5 w-5 text-[#B8871A]" />
                {group.groupLabel}
              </div>
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-white/80 px-3 py-1 text-sm font-medium text-slate-600 shadow-sm">{group.rows.length}</div>
                {isGroupCollapsed ? (
                  <ChevronRight className="h-5 w-5 text-slate-600" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-slate-600" />
                )}
              </div>
            </button>

            {!isGroupCollapsed ? (
            <div className="overflow-x-auto p-2">
              {supportsCssZoom ? (
                <div style={zoomTableScaleStyle}>
                <table className="border-separate border-spacing-0 text-[13px] text-slate-800">
                  <thead>
                    <tr className="text-center text-[11px] font-semibold text-slate-900">
                      {columns.map((column) => (
                        <th
                          key={column.key}
                          className={`sticky top-0 border-b border-r border-slate-300 px-2 py-3 align-middle whitespace-normal wrap-break-word leading-4 ${column.sticky ? 'z-50' : 'z-40'} ${column.className}`}
                        >
                          {column.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                  {group.rows.map((row) => (
                    <tr key={row.employee.id} className="hover:bg-amber-50/40">
                      {columns.map((column) => {
                        const draft = drafts[row.employee.id] ?? createDraftRow(row, selectedMonthDays, selectedMonth, historyMap);
                        const totalDays = Number(calculateDraftTotal(draft).toFixed(2));
                        const effectiveCalendarDays = getEffectiveCalendarDays(row, draft);
                        const hasMismatch = Math.abs(totalDays - effectiveCalendarDays) > 0.001;
                        const deductionBasis: AttendanceDeductionBasis | undefined = overview.deductionBasisByEmployeeCode[row.employee.employeeCode];
                        const noPayDays = parseDraftNumber(draft.sickNoPayDays) + parseDraftNumber(draft.noPayLeaveDays) + parseDraftNumber(draft.noPayStatutoryHolidayDays);
                        const deductionBase = row.record?.deductionBase ?? deductionBasis?.deductionBase ?? 0;
                        const deductionAmount = effectiveCalendarDays > 0 ? (deductionBase / effectiveCalendarDays) * noPayDays : 0;
                        const historicalAttendanceRecord = getLatestHistoricalAttendanceRecord(historyMap, row.employee.id, selectedMonth);
                        const isPrevMonthRemainingHoursAuto = isPrevMonthRemainingHoursAutoMonth(selectedMonth)
                          && historicalAttendanceRecord !== null;
                        const accumulatedOtHours = calculateAccumulatedOtHours(
                          parseSignedDraftNumber(draft.prevMonthRemainingHours),
                          normalizeMakeupHours(parseSignedDraftNumber(draft.makeupHours)),
                          parseSignedDraftNumber(draft.overtimeHours),
                          parseDraftNumber(draft.leaveToHoursConversion),
                        );
                        let content: string | number = '—';

                        if (column.key === 'employeeCode') {
                          return (
                            <td key={column.key} className={`border-b border-r border-slate-200 px-2.5 py-2.5 ${column.cellClassName}`}>
                              <Link href={`/app/people?id=${row.employee.employeeCode}`} className="text-[#B8871A] hover:underline">
                                {row.employee.employeeCode}
                              </Link>
                            </td>
                          );
                        }

                        if (column.key === 'displayName') {
                          return (
                            <td
                              key={column.key}
                              className={`border-b border-r border-slate-200 px-2.5 py-2.5 text-left align-middle ${column.cellClassName}`}
                            >
                              <div>{row.displayName}</div>
                              <div className="mt-1 text-[10px] leading-4 text-slate-500">
                                {t.deductionBase}: {formatCurrency(deductionBase, locale)}
                              </div>
                              <div className="text-[10px] leading-4 text-slate-500">
                                {t.salaryTypeLabel}: {t.salaryTypeNames[getSalaryTypeKey(row.salaryType)]}
                              </div>
                              <div className="text-[10px] leading-4 text-slate-400">
                                {t.attendanceModeHints[getSalaryTypeKey(row.salaryType)]}
                              </div>
                              {noPayDays > 0 ? (
                                <div className="text-[10px] leading-4 text-rose-600">
                                  {t.deduction}: {formatCurrency(deductionAmount, locale)} ({t.noPayDays}: {formatValue(noPayDays)})
                                </div>
                              ) : null}
                            </td>
                          );
                        } else if (column.key === 'remarks') {
                          return (
                            <td
                              key={column.key}
                              className={`border-b border-r border-slate-200 px-2.5 py-2.5 align-top ${column.cellClassName}`}
                            >
                              <textarea
                                value={draft.remarks}
                                onChange={(event) => updateDraft(row.employee.id, 'remarks', event.target.value)}
                                placeholder={t.remarksPlaceholder}
                                rows={2}
                                className="h-14 w-full resize-none rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] text-slate-700 outline-none transition focus:border-[#B8871A]"
                              />
                              {rowFeedback[row.employee.id]?.message ? (
                                <div className={`mt-2 text-[10px] ${rowFeedback[row.employee.id]?.tone === 'error' ? 'text-rose-600' : 'text-emerald-600'}`}>
                                  {rowFeedback[row.employee.id]?.message}
                                </div>
                              ) : null}
                            </td>
                          );
                        } else if (column.key === 'calendarDays') {
                          const isHourlyEmployee = row.salaryType === 'hourly';
                          return (
                            <td
                              key={column.key}
                              className={`border-b border-r border-slate-200 px-1.5 py-1.5 text-center align-middle ${column.cellClassName}`}
                            >
                              <input
                                inputMode="decimal"
                                value={isHourlyEmployee || draft.calendarDays === 0 ? '' : String(draft.calendarDays)}
                                onChange={(event) => updateCalendarDays(row.employee.id, event.target.value)}
                                className={`w-full rounded-md border border-slate-200 px-1 py-1 text-center text-[11px] font-medium outline-none transition focus:border-[#B8871A] ${isHourlyEmployee ? 'cursor-not-allowed bg-slate-100 text-slate-400' : 'bg-white text-slate-800'}`}
                                disabled={isHourlyEmployee}
                                readOnly={isHourlyEmployee}
                              />
                            </td>
                          );
                        } else if (editableFields.includes(column.key as EditableAttendanceField)) {
                          const fieldKey = column.key as EditableAttendanceField;
                          const isHourlyWorkedDays = row.salaryType === 'hourly' && fieldKey === 'workedDays';
                          const isHourlyLockedField = row.salaryType === 'hourly' && fieldKey !== 'workedHours' && fieldKey !== 'accumulatedOtHours';
                          const isNonHourlyWorkedHours = row.salaryType !== 'hourly' && fieldKey === 'workedHours';
                          const isReadOnlyAutoField = fieldKey === 'accumulatedOtHours'
                            || isHourlyWorkedDays
                            || isHourlyLockedField
                            || isNonHourlyWorkedHours
                            || (fieldKey === 'prevMonthRemainingHours' && isPrevMonthRemainingHoursAuto);
                          const displayValue = fieldKey === 'accumulatedOtHours'
                            ? (accumulatedOtHours === 0 ? '' : String(accumulatedOtHours))
                            : isHourlyWorkedDays || isHourlyLockedField || isNonHourlyWorkedHours
                              ? ''
                            : draft[fieldKey];
                          return (
                            <td
                              key={column.key}
                              className={`border-b border-r border-slate-200 px-1.5 py-1.5 text-center align-middle ${column.cellClassName}`}
                            >
                              <input
                                inputMode="decimal"
                                value={displayValue}
                                onChange={(event) => updateDraft(row.employee.id, fieldKey, event.target.value)}
                                className={`w-full rounded-md border border-slate-200 px-1 py-1 text-center text-[11px] font-medium text-slate-800 outline-none transition focus:border-[#B8871A] ${isReadOnlyAutoField ? 'cursor-not-allowed bg-slate-100 text-slate-500' : 'bg-white'}`}
                                disabled={isReadOnlyAutoField}
                                readOnly={isReadOnlyAutoField}
                              />
                            </td>
                          );
                        } else if (column.key === 'totalDays') {
                          return (
                            <td
                              key={column.key}
                              className={`border-b border-r border-slate-200 px-2.5 py-2.5 text-center align-middle ${column.cellClassName} ${hasMismatch ? 'bg-rose-50 text-rose-600' : ''}`}
                            >
                              <div>{formatValue(totalDays)}</div>
                              {hasMismatch ? <div className="mt-1 text-[10px] leading-4">{t.totalMismatch}</div> : null}</td>
                          );
                        } else if (column.key === 'updated_at') {
                          const updatedAtStr = row.record?.updated_at;
                          content = updatedAtStr ? new Date(updatedAtStr).toLocaleString(lang === 'en' ? 'en-US' : 'zh-HK', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';
                        } else {
                          content = formatValue(row.record?.[column.key] ?? null);
                        }

                        return (
                          <td
                            key={column.key}
                            className={`border-b border-r border-slate-200 px-2.5 py-2.5 text-center align-middle ${column.cellClassName}`}
                          >
                            {content}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                  </tbody>
                </table>
                </div>
              ) : (
              <div style={{ height: `${estimatedScaledTableHeight(group.rows.length)}px` }}>
              <div ref={(node) => setScaledTableRef(group.groupLabel, node)} style={transformTableScaleStyle}>
                <table className="border-separate border-spacing-0 text-[13px] text-slate-800">
                  <thead>
                    <tr className="text-center text-[11px] font-semibold text-slate-900">
                      {columns.map((column) => (
                        <th
                          key={column.key}
                          className={`sticky top-0 border-b border-r border-slate-300 px-2 py-3 align-middle whitespace-normal wrap-break-word leading-4 ${column.sticky ? 'z-50' : 'z-40'} ${column.className}`}
                        >
                          {column.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                  {group.rows.map((row) => (
                    <tr key={row.employee.id} className="hover:bg-amber-50/40">
                      {columns.map((column) => {
                        const draft = drafts[row.employee.id] ?? createDraftRow(row, selectedMonthDays, selectedMonth, historyMap);
                        const totalDays = Number(calculateDraftTotal(draft).toFixed(2));
                        const effectiveCalendarDays = getEffectiveCalendarDays(row, draft);
                        const hasMismatch = Math.abs(totalDays - effectiveCalendarDays) > 0.001;
                        const deductionBasis: AttendanceDeductionBasis | undefined = overview.deductionBasisByEmployeeCode[row.employee.employeeCode];
                        const noPayDays = parseDraftNumber(draft.sickNoPayDays) + parseDraftNumber(draft.noPayLeaveDays) + parseDraftNumber(draft.noPayStatutoryHolidayDays);
                        const deductionBase = row.record?.deductionBase ?? deductionBasis?.deductionBase ?? 0;
                        const deductionAmount = effectiveCalendarDays > 0 ? (deductionBase / effectiveCalendarDays) * noPayDays : 0;
                        const historicalAttendanceRecord = getLatestHistoricalAttendanceRecord(historyMap, row.employee.id, selectedMonth);
                        const carriedPrevMonthHours = historicalAttendanceRecord?.accumulatedOtHours ?? null;
                        const isPrevMonthRemainingHoursAuto = isPrevMonthRemainingHoursAutoMonth(selectedMonth)
                          && historicalAttendanceRecord !== null;
                        const accumulatedOtHours = calculateAccumulatedOtHours(
                          parseSignedDraftNumber(draft.prevMonthRemainingHours),
                          normalizeMakeupHours(parseSignedDraftNumber(draft.makeupHours)),
                          parseSignedDraftNumber(draft.overtimeHours),
                          parseDraftNumber(draft.leaveToHoursConversion),
                        );
                        let content: string | number = '—';

                        if (column.key === 'employeeCode') {
                          return (
                            <td key={column.key} className={`border-b border-r border-slate-200 px-2.5 py-2.5 ${column.cellClassName}`}>
                              <Link href={`/app/people?id=${row.employee.employeeCode}`} className="text-[#B8871A] hover:underline">
                                {row.employee.employeeCode}
                              </Link>
                            </td>
                          );
                        }

                        if (column.key === 'displayName') {
                          return (
                            <td
                              key={column.key}
                              className={`border-b border-r border-slate-200 px-2.5 py-2.5 text-left align-middle ${column.cellClassName}`}
                            >
                              <div>{row.displayName}</div>
                              <div className="mt-1 text-[10px] leading-4 text-slate-500">
                                {t.deductionBase}: {formatCurrency(deductionBase, locale)}
                              </div>
                              <div className="text-[10px] leading-4 text-slate-500">
                                {t.salaryTypeLabel}: {t.salaryTypeNames[getSalaryTypeKey(row.salaryType)]}
                              </div>
                              <div className="text-[10px] leading-4 text-slate-400">
                                {t.attendanceModeHints[getSalaryTypeKey(row.salaryType)]}
                              </div>
                              {noPayDays > 0 ? (
                                <div className="text-[10px] leading-4 text-rose-600">
                                  {t.deduction}: {formatCurrency(deductionAmount, locale)} ({t.noPayDays}: {formatValue(noPayDays)})
                                </div>
                              ) : null}
                            </td>
                          );
                        } else if (column.key === 'remarks') {
                          return (
                            <td
                              key={column.key}
                              className={`border-b border-r border-slate-200 px-2.5 py-2.5 align-top ${column.cellClassName}`}
                            >
                              <textarea
                                value={draft.remarks}
                                onChange={(event) => updateDraft(row.employee.id, 'remarks', event.target.value)}
                                placeholder={t.remarksPlaceholder}
                                rows={2}
                                className="h-14 w-full resize-none rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] text-slate-700 outline-none transition focus:border-[#B8871A]"
                              />
                              {rowFeedback[row.employee.id]?.message ? (
                                <div className={`mt-2 text-[10px] ${rowFeedback[row.employee.id]?.tone === 'error' ? 'text-rose-600' : 'text-emerald-600'}`}>
                                  {rowFeedback[row.employee.id]?.message}
                                </div>
                              ) : null}
                            </td>
                          );
                        } else if (column.key === 'calendarDays') {
                          const isHourlyEmployee = row.salaryType === 'hourly';
                          return (
                            <td
                              key={column.key}
                              className={`border-b border-r border-slate-200 px-1.5 py-1.5 text-center align-middle ${column.cellClassName}`}
                            >
                              <input
                                inputMode="decimal"
                                value={isHourlyEmployee || draft.calendarDays === 0 ? '' : String(draft.calendarDays)}
                                onChange={(event) => updateCalendarDays(row.employee.id, event.target.value)}
                                className={`w-full rounded-md border border-slate-200 px-1 py-1 text-center text-[11px] font-medium outline-none transition focus:border-[#B8871A] ${isHourlyEmployee ? 'cursor-not-allowed bg-slate-100 text-slate-400' : 'bg-white text-slate-800'}`}
                                disabled={isHourlyEmployee}
                                readOnly={isHourlyEmployee}
                              />
                            </td>
                          );
                        } else if (editableFields.includes(column.key as EditableAttendanceField)) {
                          const fieldKey = column.key as EditableAttendanceField;
                          const isHourlyWorkedDays = row.salaryType === 'hourly' && fieldKey === 'workedDays';
                          const isHourlyLockedField = row.salaryType === 'hourly' && fieldKey !== 'workedHours' && fieldKey !== 'accumulatedOtHours';
                          const isNonHourlyWorkedHours = row.salaryType !== 'hourly' && fieldKey === 'workedHours';
                          const isReadOnlyAutoField = fieldKey === 'accumulatedOtHours'
                            || isHourlyWorkedDays
                            || isHourlyLockedField
                            || isNonHourlyWorkedHours
                            || (fieldKey === 'prevMonthRemainingHours' && isPrevMonthRemainingHoursAuto);
                          const displayValue = fieldKey === 'accumulatedOtHours'
                            ? (accumulatedOtHours === 0 ? '' : String(accumulatedOtHours))
                            : isHourlyWorkedDays || isHourlyLockedField || isNonHourlyWorkedHours
                              ? ''
                            : draft[fieldKey];
                          return (
                            <td
                              key={column.key}
                              className={`border-b border-r border-slate-200 px-1.5 py-1.5 text-center align-middle ${column.cellClassName}`}
                            >
                              <input
                                inputMode="decimal"
                                value={displayValue}
                                onChange={(event) => updateDraft(row.employee.id, fieldKey, event.target.value)}
                                className={`w-full rounded-md border border-slate-200 px-1 py-1 text-center text-[11px] font-medium text-slate-800 outline-none transition focus:border-[#B8871A] ${isReadOnlyAutoField ? 'cursor-not-allowed bg-slate-100 text-slate-500' : 'bg-white'}`}
                                disabled={isReadOnlyAutoField}
                                readOnly={isReadOnlyAutoField}
                              />
                            </td>
                          );
                        } else if (column.key === 'totalDays') {
                          return (
                            <td
                              key={column.key}
                              className={`border-b border-r border-slate-200 px-2.5 py-2.5 text-center align-middle ${column.cellClassName} ${hasMismatch ? 'bg-rose-50 text-rose-600' : ''}`}
                            >
                              <div>{formatValue(totalDays)}</div>
                              {hasMismatch ? <div className="mt-1 text-[10px] leading-4">{t.totalMismatch}</div> : null}</td>
                          );
                        } else if (column.key === 'updated_at') {
                          const updatedAtStr = row.record?.updated_at;
                          content = updatedAtStr ? new Date(updatedAtStr).toLocaleString(lang === 'en' ? 'en-US' : 'zh-HK', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';
                        } else {
                          content = formatValue(row.record?.[column.key] ?? null);
                        }

                        return (
                          <td
                            key={column.key}
                            className={`border-b border-r border-slate-200 px-2.5 py-2.5 text-center align-middle ${column.cellClassName}`}
                          >
                            {content}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                  </tbody>
                </table>
              </div>
              </div>
              )}
            </div>
            ) : null}
          </section>
        );
        })
      )}
      </div>
    </>
  );
}
