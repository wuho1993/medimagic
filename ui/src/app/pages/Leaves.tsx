"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Building2, ChevronDown, ChevronRight, ExternalLink, ZoomIn, ZoomOut, SaveAll, X } from 'lucide-react';
import Link from 'next/link';
import { saveAttendanceManagementRecord } from '@/app/app/leaves/actions';
import { useLanguage } from '../i18n/LanguageContext';
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
    subtitle: '以員工 Profile 分店資料分類，同一頁顯示每月出勤總表。',
    month: '月份',
    total: '員工數',
    groups: '分店數',
    matching: '關聯規則',
    matchingValue: '員工編號為主，譯名 / 英文名 / 別名只作核對；分店分類以員工 Profile 為準。',
    closeTab: '關閉分頁',
    openFocusView: '開新分頁',
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
    totalMismatch: '總日數必須等於計薪日數',
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
      lateDays: '遲到日數',
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
    subtitle: '以员工 Profile 分店资料分类，同一页显示每月出勤总表。',
    month: '月份',
    total: '员工数',
    groups: '分店数',
    matching: '关联规则',
    matchingValue: '员工编号为主，译名 / 英文名 / 别名只作核对；分店分类以员工 Profile 为准。',
    closeTab: '关闭分页',
    openFocusView: '开新分页',
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
    totalMismatch: '总日数必须等于计薪日数',
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
      lateDays: '迟到日数',
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
    subtitle: 'Show the monthly attendance sheet on one page, grouped by branch from the employee profile.',
    month: 'Month',
    total: 'Employees',
    groups: 'Branches',
    matching: 'Matching Rule',
    matchingValue: 'Primary: employee code. Secondary: translated names / alias. Branch grouping comes from the employee profile.',
    closeTab: 'Close Tab',
    openFocusView: 'Open New Tab',
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
    totalMismatch: 'Total days must match calendar days',
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
      lateDays: 'Late Days',
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

function formatMonthLabel(value: string, lang: keyof typeof translations) {
  const [year, month] = value.split('-');
  if (!year || !month) return value;
  if (lang === 'en') return `${year}-${month}`;
  return `${year}年${month}月`;
}

function displayName(employee: EmployeeDirectoryRecord) {
  return employee.alias || employee.nameZh || employee.nameEn;
}

function groupLabelFor(employee: EmployeeDirectoryRecord) {
  return employee.branchNameZh || employee.branchCode || employee.branchNameEn || 'UNASSIGNED';
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
  const calendarDays = row.record?.calendarDays && row.record.calendarDays > 0
    ? row.record.calendarDays
    : (selectedMonthDays ?? 0);
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
    workedDays: toDraftNumber(row.record?.workedDays),
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

function formatCurrency(value: number, locale: string) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'HKD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function buildCombinedRows(
  employees: EmployeeDirectoryRecord[],
  records: AttendanceManagementMonthlyRecord[],
  selectedMonth: string,
) {
  const monthRecordMap = new Map(
    records.filter((record) => record.yearMonth === selectedMonth).map((record) => [record.employeeId, record]),
  );

  const rows: CombinedAttendanceRow[] = employees.map((employee) => ({
    employee,
    record: monthRecordMap.get(employee.id) ?? null,
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
  const monthFromUrl = initialMonth && overview.months.includes(initialMonth) ? initialMonth : overview.defaultMonth;
  const [selectedMonth, setSelectedMonth] = useState(monthFromUrl);
  const [tableScale, setTableScale] = useState(() => clampScale(initialScale ?? 0.65));
  const [records, setRecords] = useState(overview.records);
  const selectedMonthDays = getDaysInMonth(selectedMonth);
  const recordMap = useMemo(() => buildMonthlyRecordMap(records), [records]);
  const historyMap = useMemo(() => buildEmployeeHistoryMap(records), [records]);

  const rows = useMemo(
    () => buildCombinedRows(overview.employees, records, selectedMonth),
    [overview.employees, records, selectedMonth],
  );
  const groupedRows = useMemo(() => groupRows(rows), [rows]);
  const [drafts, setDrafts] = useState<Record<string, AttendanceDraftRow>>({});
  const [savingRows, setSavingRows] = useState<Record<string, boolean>>({});
  const [rowFeedback, setRowFeedback] = useState<Record<string, RowFeedback>>({});
  const [dirtyRows, setDirtyRows] = useState<Set<string>>(new Set());
  const scaledTableRefs = useRef<Record<string, HTMLDivElement>>({});
  const [tableHeights, setTableHeights] = useState<Record<string, number>>({});
  const [supportsCssZoom, setSupportsCssZoom] = useState(true);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

  useEffect(() => {
    setRecords(overview.records);
  }, [overview.records]);

  useEffect(() => {
    setSupportsCssZoom(typeof CSS !== 'undefined' && typeof CSS.supports === 'function' && CSS.supports('zoom', '1'));
  }, []);

  useEffect(() => {
    setDrafts(Object.fromEntries(rows.map((row) => [row.employee.id, createDraftRow(row, selectedMonthDays, selectedMonth, historyMap)])));
    setSavingRows({});
    setRowFeedback({});
    setDirtyRows(new Set());
  }, [historyMap, overview.employees, recordMap, rows, selectedMonth, selectedMonthDays]);

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
      const sourceRow = rows.find((row) => row.employee.id === employeeId)!;
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

  const openFocusView = () => {
    const params = new URLSearchParams({
      month: selectedMonth,
      scale: tableScale.toFixed(2),
    });
    window.open(`/app/attendance/focus?${params.toString()}`, '_blank', 'noopener,noreferrer');
  };

  const handleSaveRow = async (row: CombinedAttendanceRow) => {
    const draft = drafts[row.employee.id] ?? createDraftRow(row, selectedMonthDays, selectedMonth, historyMap);
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
      calendarDays: draft.calendarDays,
      workedDays: parseDraftNumber(draft.workedDays),
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
        updated_at: serverRecord.updated_at ?? row.record?.updated_at ?? null,
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
    } else {
      setRowFeedback((current) => ({
        ...current,
        [row.employee.id]: {
          tone: result.success ? 'saved' : 'error',
          message: result.success ? t.saved : (result.error ?? t.saveError),
        },
      }));
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
    const rowsToSave = rows.filter(row => dirtyRows.has(row.employee.id));
    if (rowsToSave.length === 0) return;

    await Promise.all(rowsToSave.map(row => handleSaveRow(row)));
  };

  return (
    <>
      <div className={panelClassName}>
      <div className="rounded-4xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div className="max-w-3xl">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">{t.title}</h1>
            <p className="mt-2 text-sm leading-6 text-slate-500">{t.subtitle}</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
            <label className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <div className="text-xs font-semibold text-slate-500">{t.month}</div>
              <select
                value={selectedMonth}
                onChange={(event) => setSelectedMonth(event.target.value)}
                className="mt-1 min-w-40 bg-transparent text-sm font-semibold text-slate-900 outline-none"
              >
                {overview.months.map((month) => (
                  <option key={month} value={month}>
                    {formatMonthLabel(month, lang)}
                  </option>
                ))}
              </select>
            </label>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <div className="text-xs font-semibold text-slate-500">{t.total}</div>
              <div className="mt-1 text-2xl font-bold text-slate-900">{rows.length}</div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <div className="text-xs font-semibold text-slate-500">{t.groups}</div>
              <div className="mt-1 text-2xl font-bold text-slate-900">{groupedRows.length}</div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <div className="text-xs font-semibold text-slate-500">{t.viewScale}</div>
              <div className="mt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setTableScale((current) => clampScale(current - 0.05))}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-100"
                  aria-label={t.zoomOut}
                >
                  <ZoomOut className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setTableScale(1)}
                  className="inline-flex min-w-16 items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  {Math.round(tableScale * 100)}%
                </button>
                <button
                  type="button"
                  onClick={() => setTableScale((current) => clampScale(current + 0.05))}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-100"
                  aria-label={t.zoomIn}
                >
                  <ZoomIn className="h-4 w-4" />
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={() => void handleSaveAll()}
              disabled={dirtyRows.size === 0}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-[#B8871A] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#9f7312] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <SaveAll className="h-4 w-4" />
              {t.save} {dirtyRows.size > 0 ? `(${dirtyRows.size})` : ''}
            </button>

            {!focusMode ? (
              <button
                type="button"
                onClick={openFocusView}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-[#D4AF37] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#bf9a24]"
              >
                <ExternalLink className="h-4 w-4" />
                {t.openFocusView}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => window.close()}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-rose-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-700"
              >
                <X className="h-4 w-4" />
                {t.closeTab}
              </button>
            )}
          </div>
        </div>

        <div className="mt-5 grid gap-3 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <div className="text-sm font-semibold text-slate-700">{t.matching}</div>
            <p className="mt-1 text-sm text-slate-500">{t.matchingValue}</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <div className="text-sm font-semibold text-slate-700">{t.empty}</div>
            <p className="mt-1 text-sm text-slate-500">{formatMonthLabel(selectedMonth, lang)}</p>
          </div>
        </div>
      </div>

      {groupedRows.length === 0 ? (
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
                          className={`border-b border-r border-slate-300 px-2 py-3 align-middle whitespace-normal wrap-break-word leading-4 ${column.className}`}
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
                        const hasMismatch = Math.abs(totalDays - draft.calendarDays) > 0.001;
                        const deductionBasis: AttendanceDeductionBasis | undefined = overview.deductionBasisByEmployeeCode[row.employee.employeeCode];
                        const noPayDays = parseDraftNumber(draft.sickNoPayDays) + parseDraftNumber(draft.noPayLeaveDays) + parseDraftNumber(draft.noPayStatutoryHolidayDays);
                        const deductionBase = row.record?.deductionBase ?? deductionBasis?.deductionBase ?? 0;
                        const deductionAmount = draft.calendarDays > 0 ? (deductionBase / draft.calendarDays) * noPayDays : 0;
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
                                className="min-h-14 w-full rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] text-slate-700 outline-none transition focus:border-[#B8871A]"
                              />
                              <div className="mt-2 flex items-center justify-between gap-2">
                                <button
                                  type="button"
                                  onClick={() => void handleSaveRow(row)}
                                  disabled={Boolean(savingRows[row.employee.id])}
                                  className="inline-flex items-center rounded-lg bg-[#B8871A] px-2.5 py-1 text-[11px] font-semibold text-white transition hover:bg-[#9f7312] disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                  {savingRows[row.employee.id] ? t.saving : t.save}
                                </button>
                                {rowFeedback[row.employee.id]?.message ? (
                                  <span className={`text-[10px] ${rowFeedback[row.employee.id]?.tone === 'error' ? 'text-rose-600' : 'text-emerald-600'}`}>
                                    {rowFeedback[row.employee.id]?.message}
                                  </span>
                                ) : null}
                              </div>
                            </td>
                          );
                        } else if (column.key === 'calendarDays') {
                          content = formatValue(draft.calendarDays);
                        } else if (editableFields.includes(column.key as EditableAttendanceField)) {
                          const fieldKey = column.key as EditableAttendanceField;
                          const isReadOnlyAutoField = fieldKey === 'accumulatedOtHours'
                            || (fieldKey === 'prevMonthRemainingHours' && isPrevMonthRemainingHoursAuto);
                          const displayValue = fieldKey === 'accumulatedOtHours'
                            ? (accumulatedOtHours === 0 ? '' : String(accumulatedOtHours))
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
              <div style={{ height: `${tableHeights[group.groupLabel] ?? estimatedScaledTableHeight(group.rows.length)}px` }}>
              <div ref={(node) => setScaledTableRef(group.groupLabel, node)} style={transformTableScaleStyle}>
                <table className="border-separate border-spacing-0 text-[13px] text-slate-800">
                  <thead>
                    <tr className="text-center text-[11px] font-semibold text-slate-900">
                      {columns.map((column) => (
                        <th
                          key={column.key}
                          className={`border-b border-r border-slate-300 px-2 py-3 align-middle whitespace-normal wrap-break-word leading-4 ${column.className}`}
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
                        const hasMismatch = Math.abs(totalDays - draft.calendarDays) > 0.001;
                        const deductionBasis: AttendanceDeductionBasis | undefined = overview.deductionBasisByEmployeeCode[row.employee.employeeCode];
                        const noPayDays = parseDraftNumber(draft.sickNoPayDays) + parseDraftNumber(draft.noPayLeaveDays) + parseDraftNumber(draft.noPayStatutoryHolidayDays);
                        const deductionBase = row.record?.deductionBase ?? deductionBasis?.deductionBase ?? 0;
                        const deductionAmount = draft.calendarDays > 0 ? (deductionBase / draft.calendarDays) * noPayDays : 0;
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
                                className="min-h-14 w-full rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] text-slate-700 outline-none transition focus:border-[#B8871A]"
                              />
                              <div className="mt-2 flex items-center justify-between gap-2">
                                <button
                                  type="button"
                                  onClick={() => void handleSaveRow(row)}
                                  disabled={Boolean(savingRows[row.employee.id])}
                                  className="inline-flex items-center rounded-lg bg-[#B8871A] px-2.5 py-1 text-[11px] font-semibold text-white transition hover:bg-[#9f7312] disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                  {savingRows[row.employee.id] ? t.saving : t.save}
                                </button>
                                {rowFeedback[row.employee.id]?.message ? (
                                  <span className={`text-[10px] ${rowFeedback[row.employee.id]?.tone === 'error' ? 'text-rose-600' : 'text-emerald-600'}`}>
                                    {rowFeedback[row.employee.id]?.message}
                                  </span>
                                ) : null}
                              </div>
                            </td>
                          );
                        } else if (column.key === 'calendarDays') {
                          content = formatValue(draft.calendarDays);
                        } else if (editableFields.includes(column.key as EditableAttendanceField)) {
                          const fieldKey = column.key as EditableAttendanceField;
                          const isReadOnlyAutoField = fieldKey === 'accumulatedOtHours'
                            || (fieldKey === 'prevMonthRemainingHours' && isPrevMonthRemainingHoursAuto);
                          const displayValue = fieldKey === 'accumulatedOtHours'
                            ? (accumulatedOtHours === 0 ? '' : String(accumulatedOtHours))
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
