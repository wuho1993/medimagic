"use client";

import { Fragment, useEffect, useMemo, useRef, useState, useTransition, type FormEvent, type KeyboardEvent, type WheelEvent } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { Calculator, ChevronDown, ChevronUp, CreditCard, Download, Save, TrendingUp, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useLanguage } from '../i18n/LanguageContext';
import type { PayrollEmployeeSummary, CommissionRateTier, MonthlyCommissionRecord, PackageNoPayHandling, PayrollAttendanceRecord } from '@/src/lib/employees/queries';
import { calculateStreetPromoterCommission, calculateTelesalesCommission, calculateTotalCommission } from '@/src/lib/employees/commission';
import { calculateCustomCommission, normalizeCustomCommissionName } from '@/src/lib/employees/custom-commission';
import { calculatePayrollBonus, calculateRedeemBonusFromTiers, calculateShopBonus, calculateShopTargetPercent, type PayrollBonusConfigCatalog } from '@/src/lib/employees/payroll-bonus';
import { calculateCommissionRules } from '@/src/lib/employees/commission-rules';
import { getMonthEndDate, isMpfContributionEligible } from '@/src/lib/employees/employment';
import { fetchLatestPayrollEmployeeDefaults, saveMonthlyCommission } from '@/app/app/payroll/actions';

type PayrollProps = {
  employees: PayrollEmployeeSummary[];
  commissionTiers: CommissionRateTier[];
  savedRecords: MonthlyCommissionRecord[];
  attendanceRecords: Record<string, PayrollAttendanceRecord>;
  defaultPackageNoPayHandling: PackageNoPayHandling;
  commissionAvg: Record<string, number>;
  selectedMonth: string;
  payrollBonusConfig: PayrollBonusConfigCatalog;
};

type PayrollImportRow = {
  employeeCode: string;
  sourceName?: string;
  targetEmployeeCode?: string;
  excluded?: boolean;
  redeem?: number;
  sales?: number;
  salesAmountTotal?: number;
  job?: number;
  sgm?: number;
};

type PendingPayrollImport = {
  fileName: string;
  importType: 'all' | 'redeem' | 'sales' | 'job' | 'sgm';
  targetMonth?: string;
  totalRows: number;
  header: string;
  tablePreview: string;
  parsedRows: PayrollImportRow[];
  warnings: string[];
};

type PayrollImportRollback = {
  fileName: string;
  targetMonth: string;
  importedAt: string;
  beforeValues: Record<string, EmployeeVolumes>;
};

const MPF_RATE = 0.05;
const MPF_CAP = 1500; // Both employee and employer cap at HK$1,500

function calcMpf(relevantIncome: number) {
  const contribution = Math.min(relevantIncome * MPF_RATE, MPF_CAP);
  return Math.round(contribution * 100) / 100;
}

function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}

function formatEnglishPayslipMonth(yearMonth: string) {
  const [year, month] = yearMonth.split('-').map(Number);
  if (!year || !month) {
    return yearMonth;
  }

  return new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' }).format(new Date(year, month - 1, 1));
}

function isMpfStatutorilyEligible(
  dateOfBirth: string | null | undefined,
  hireDate: string | null | undefined,
  referenceDate: Date,
) {
  return isMpfContributionEligible(true, dateOfBirth, hireDate, referenceDate);
}

function splitManualAmount(primaryAmount: number, secondaryAmount: number, totalAmount: number, primaryGross: number, secondaryGross: number) {
  if (totalAmount <= 0) {
    return { primaryMpf: 0, secondaryMpf: 0 };
  }

  if (secondaryGross <= 0) {
    return { primaryMpf: roundMoney(totalAmount), secondaryMpf: 0 };
  }

  if (primaryGross <= 0) {
    return { primaryMpf: 0, secondaryMpf: roundMoney(totalAmount) };
  }

  const totalAuto = primaryAmount + secondaryAmount;
  if (totalAuto > 0) {
    const primaryMpf = roundMoney(totalAmount * (primaryAmount / totalAuto));
    return { primaryMpf, secondaryMpf: roundMoney(totalAmount - primaryMpf) };
  }

  const totalGross = primaryGross + secondaryGross;
  if (totalGross <= 0) {
    return { primaryMpf: roundMoney(totalAmount), secondaryMpf: 0 };
  }

  const primaryMpf = roundMoney(totalAmount * (primaryGross / totalGross));
  const secondaryMpf = roundMoney(totalAmount - primaryMpf);
  return { primaryMpf, secondaryMpf };
}

function splitAutoCappedAmount(primaryAmount: number, secondaryAmount: number, totalAmount: number) {
  if (totalAmount <= 0) {
    return { primaryMpf: 0, secondaryMpf: 0 };
  }

  const primaryMpf = roundMoney(Math.min(Math.max(primaryAmount, 0), totalAmount));
  const remaining = roundMoney(totalAmount - primaryMpf);
  if (remaining <= 0) {
    return { primaryMpf, secondaryMpf: 0 };
  }

  if (secondaryAmount > 0) {
    return {
      primaryMpf,
      secondaryMpf: roundMoney(Math.min(Math.max(secondaryAmount, 0), remaining)),
    };
  }

  return { primaryMpf, secondaryMpf: remaining };
}

type EmployeeVolumes = {
  redeem: string;
  sales: string;
  salesAmountTotal: string;
  job: string;
  sgm: string;
  streetPromoterHeadcount: string;
  telesalesHeadcount: string;
};
type EmployeeWorkUnits = {
  workedDays: string;
  workedHours: string;
};
type EmployeeMonthlyMpfState = {
  mpfEeApplied: boolean;
  mpfEeDeductionMode: 'split' | 'month_end';
  mpfEeManualOverride: boolean;
  mpfEeAmount: string;
  mpfErApplied: boolean;
  mpfErManualOverride: boolean;
  mpfErAmount: string;
};
type EmployeeMonthlyBonusState = {
  briefingApplied: boolean;
  briefingAmount: string;
  attendanceApplied: boolean;
  attendanceAmount: string;
  bookingApplied: boolean;
  bookingAmount: string;
  manualBonusApplied: boolean;
  manualBonusAmount: string;
  manualBonusMpfIncluded: boolean;
  manualDeductionApplied: boolean;
  manualDeductionAmount: string;
  manualDeductionMpfIncluded: boolean;
  shopTargetAmount: string;
  shopActualSalesAmount: string;
};
type EmployeePackageNoPayHandlingState = '' | PackageNoPayHandling;

type PayslipPdfEntry = {
  employeeCode: string;
  employeeName: string;
  employeeTitle: string | null;
  hkid: string | null;
  lateDays: number;
  noPayDays: number;
  branchName: string | null;
  selectedMonth: string;
  rawBaseSalary: number;
  rawAllowanceAmount: number;
  rawTransportAllowance: number;
  calculatedBaseSalary: number;
  allowanceAmount: number;
  transportAllowance: number;
  rawBriefingBonus: number;
  briefingBonus: number;
  displayAttendanceBonus: number;
  rawAttendanceBonus: number;
  attendanceBonus: number;
  rawBookingBonus: number;
  bookingBonus: number;
  manualBonus: number;
  manualDeduction: number;
  shopBonus: number;
  redeemCommission: number;
  salesCommission: number;
  sgmCommission: number;
  salesAmountTotal: number;
  salesAmountRatePercent: number;
  salesAmountCommission: number;
  jobCommission: number;
  streetPromoterCommission: number;
  telesalesCommission: number;
  salesBonus: number;
  payrollBonus: number;
  redeemBonus: number;
  packageCommissionAmount: number;
  packageCommission: number;
  isPackageEmployee: boolean;
  actualCommissionExceedsPackage: boolean;
  grossAmount: number;
  mpfEe: number;
  mpfEr: number;
  netAmount: number;
  payDayPrimary: number | null;
  payDaySecondary: number | null;
  primaryPayoutGross: number;
  primaryMpf: number;
  primaryPayoutNet: number;
  secondaryPayoutGross: number;
  secondaryMpf: number;
  secondaryPayoutNet: number;
  monthEndMpf: number;
  noPayLeaveDeduction: number;
  adjustmentAmount: number;
};

const translations = {
  'zh-TW': {
    title: '薪資月結總覽',
    subtitle: '以現有員工薪金設定計算每月出糧概覽。',
    cols: { code: '編號', name: '姓名', branch: '分店', base: '底薪', allowance: '津貼', bonus: '獎金', commission: '佣金', mpfEe: 'MPF(僱員)', mpfEr: 'MPF(僱主)', net: '實發', payDay: '出糧日' },
    totals: '合計',
    noData: '暫無薪資資料。',
    save: '儲存佣金',
    saving: '儲存中...',
    saved: '已儲存',
    saveFail: '儲存失敗',
    exportPayslip: '匯出出糧單明細',
    exportingPayslip: '匯出中...',
    exportPayslipFail: '匯出失敗',
    exportPayslipSelectTitle: '選擇要匯出的員工',
    exportPayslipSelectDescription: '可剔選一位或多位員工；如選擇多位，系統會分開下載 PDF。',
    exportPayslipCancel: '取消',
    exportPayslipConfirm: '下載已選 PDF',
    exportPayslipSelectAll: '全選',
    exportPayslipClearAll: '清除',
    exportPayslipEmpty: '請先選擇至少一位員工。',
    resyncMonthlySettings: '從員工預設重新同步本月設定',
    aiImportTitle: 'AI 匯入',
    aiImportTypeLabel: '匯入類別',
    aiImportTypeAll: '全部類別',
    aiImportUploading: '分析中...',
    aiImportSuccess: '匯入完成',
    aiImportFail: '匯入失敗',
    aiImportHint: '上載含員工編號的檔案，以 AI 方式導入 Redeem、Sales、Job 或 SGM。',
    month: '月份',
    avg365: '365天平均佣金',
    avgLabel: '月均佣金',
    mpfSectionTitle: 'MPF 設定',
    tierCard: {
      title: '佣金比率表',
      type: '類型',
      range: '營業額範圍',
      rate: '比率',
      redeem: 'Redeem',
      sales: 'Sales',
      sgm: 'SGM',
      noLimit: '無上限',
      jobNote: '* Job 佣金由外部系統按月計算，不設固定比率。',
    },
    commInput: {
      title: '佣金輸入',
      redeemVol: 'Redeem 營業額',
      salesVol: 'Sales 營業額',
      salesAmountTotal: '銷售總金額',
      salesAmountRatePercent: '銷售金額比例',
      salesAmountCommission: '銷售金額佣金',
      jobAmt: 'Job 佣金（直接輸入金額）',
      sgmVol: 'SGM 營業額',
      streetPromoterHeadcount: '街霸人頭',
      streetPromoterCommission: '街霸佣金',
      telesalesHeadcount: '電話銷售員人頭',
      telesalesCommission: '電話銷售員佣金',
      salaryInputTitle: '薪金計算輸入',
      workedDays: '本月工作天數',
      workedHours: '本月工作時數',
      dailyRate: '日薪 rate',
      hourlyRate: '時薪 rate',
      calculatedBaseSalary: '計算後底薪',
      salaryInputRequired: '日薪及時薪員工需要在此輸入本月天數或時數先會計算底薪。',
      attendanceSourceWorkedDays: '工作天數已跟隨出勤管理',
      attendanceNoPayDeduction: '出勤管理無薪扣減',
      attendanceNoPayRemainder: '出勤管理無薪剩餘扣減',
      attendanceNoPayRemainderDescription: 'No Pay 已先按比例扣減底薪、津貼及獎金，以下是仍需另外扣減的餘額。',
      attendanceNoPayDays: '無薪日數',
      attendanceRecordSourceNote: '以上出勤扣減資料來自 Attendance Record。',
      packageNoPayTitle: '包佣 No Pay 處理',
      packageNoPayDescription: '此包佣員工本月有 No Pay，而按比率計算佣金未超過包佣，請選擇今月包佣處理方式。',
      packageNoPayNeedsSelection: '請選擇本月包佣處理方式',
      packageNoPayNoPackage: '本月冇包佣',
      packageNoPayProRate: '包佣按上班日數統計',
      packageNoPaySystemDefault: '系統預設',
      packageNoPayAutoApplied: '今月已按系統設定自動套用處理方式。',
      packageNoPayOverrideLabel: '如要改今月做法，可即時覆寫：',
      packageNoPayResetToDefault: '跟系統設定',
      packageNoPayProratedAmount: '按上班日數折算包佣',
      packageNoPayAutoActual: '實際佣金已超過包佣，今月按實際佣金計，No Pay 只扣底薪 + 津貼 + 獎金。',
      packageNoPayBlockedSave: '仍有包佣 No Pay 員工未選擇本月處理方式，暫時不能儲存或匯出。',
      monthlyBonusTitle: '當月獎金選擇',
      applyThisMonth: '當月發放',
      defaultAmount: '預設金額',
      attendanceLateDisabledNote: '因為出勤記錄有遲到',
      briefingBonus: 'Briefing 獎金',
      attendanceBonus: '出勤獎金',
      bookingBonus: 'Booking 獎金',
      manualBonus: '手動增加金額',
      manualDeduction: '手動扣減金額',
      countForMpf: '需扣減 MPF',
      shopBonus: '鋪數',
      shopTargetAmount: '本月 Target',
      shopActualSalesAmount: '實際銷售數',
      shopTargetPercent: '達標 %',
      salesBonus: 'Sales Bonus',
      payrollBonus: 'Bonus',
      breakdown: '佣金明細',
      method: '計算方式',
      custom: '自訂佣金',
      standard: '跟佣金比率表',
      bonus1: 'Bonus 1',
      bonus2: 'Bonus 2',
      customBonus: '自訂 Bonus',
      packageEmployee: '包佣包薪',
      packageCommissionAmount: '包佣金額',
      packageGuaranteedCommission: '保底包佣',
      packageCalculatedCommission: '按比率計算佣金',
      packageAppliedCommission: '實際出糧佣金',
      mpfRelevantIncome: '扣除 MPF 前相關收入',
      variableSettlement: '本月佣金總額',
      payoutScheduleTitle: '分拆出糧預覽',
      mpfDeductionMode: 'MPF 扣款方式',
      mpfDeductionSplit: '隨出糧分拆扣',
      mpfDeductionMonthEnd: '月尾一次過扣',
      monthEndMpfDeduction: '月尾補扣 MPF(僱員)',
      primaryPayout: '第一筆出糧',
      secondaryPayout: '第二筆出糧',
      payoutGross: '應發金額',
      payoutMpfDeduction: '扣 MPF(僱員)',
      payoutNet: '實際出糧',
      payoutBaseItems: '底薪 + 津貼 + 獎金',
      payoutCommissionItems: '佣金',
      payoutCombinedItems: '底薪 + 津貼 + 獎金 + 佣金',
    },
    mpf: {
      employee: 'MPF(僱員)',
      employer: 'MPF(僱主)',
      applyThisMonth: '當月需要供款',
      manualAmount: '手動更改金額',
      amount: '金額',
      autoAmount: '系統計算',
      notApplicable: '本月原本毋須供款，可手動開啟。',
    },
    booleanLabels: {
      yes: '是',
      no: '否',
    },
  },
  'zh-CN': {
    title: '薪资月结总览',
    subtitle: '以现有员工薪金设定计算每月发薪概览。',
    cols: { code: '编号', name: '姓名', branch: '分店', base: '底薪', allowance: '津贴', bonus: '奖金', commission: '佣金', mpfEe: 'MPF(雇员)', mpfEr: 'MPF(雇主)', net: '实发', payDay: '发薪日' },
    totals: '合计',
    noData: '暂无薪资资料。',
    save: '保存佣金',
    saving: '保存中...',
    saved: '已保存',
    saveFail: '保存失败',
    exportPayslip: '导出出粮单明细',
    exportingPayslip: '导出中...',
    exportPayslipFail: '导出失败',
    exportPayslipSelectTitle: '选择要导出的员工',
    exportPayslipSelectDescription: '可勾选一位或多位员工；如果选择多位，系统会分别下载 PDF。',
    exportPayslipCancel: '取消',
    exportPayslipConfirm: '下载所选 PDF',
    exportPayslipSelectAll: '全选',
    exportPayslipClearAll: '清除',
    exportPayslipEmpty: '请先选择至少一位员工。',
    resyncMonthlySettings: '从员工预设重新同步本月设定',
    aiImportTitle: 'AI 导入',
    aiImportTypeLabel: '导入类型',
    aiImportTypeAll: '全部类型',
    aiImportUploading: '分析中...',
    aiImportSuccess: '导入完成',
    aiImportFail: '导入失败',
    aiImportHint: '上传含员工编号的文件，以 AI 方式导入 Redeem、Sales、Job 或 SGM。',
    month: '月份',
    avg365: '365天平均佣金',
    avgLabel: '月均佣金',
    mpfSectionTitle: 'MPF 设定',
    tierCard: {
      title: '佣金比率表',
      type: '类型',
      range: '营业额范围',
      rate: '比率',
      redeem: 'Redeem',
      sales: 'Sales',
      sgm: 'SGM',
      noLimit: '无上限',
      jobNote: '* Job 佣金由外部系统按月计算，不设固定比率。',
    },
    commInput: {
      title: '佣金输入',
      redeemVol: 'Redeem 营业额',
      salesVol: 'Sales 营业额',
      salesAmountTotal: '销售总金额',
      salesAmountRatePercent: '销售金额比例',
      salesAmountCommission: '销售金额佣金',
      jobAmt: 'Job 佣金（直接输入金额）',
      sgmVol: 'SGM 营业额',
      streetPromoterHeadcount: '街霸人头',
      streetPromoterCommission: '街霸佣金',
      telesalesHeadcount: '电话销售员人头',
      telesalesCommission: '电话销售员佣金',
      salaryInputTitle: '薪金计算输入',
      workedDays: '本月工作天数',
      workedHours: '本月工作时数',
      dailyRate: '日薪 rate',
      hourlyRate: '时薪 rate',
      calculatedBaseSalary: '计算后底薪',
      salaryInputRequired: '日薪及时薪员工需要在此输入本月天数或时数后才会计算底薪。',
      attendanceSourceWorkedDays: '工作天数已跟随出勤管理',
      attendanceNoPayDeduction: '出勤管理无薪扣减',
      attendanceNoPayRemainder: '出勤管理无薪剩余扣减',
      attendanceNoPayRemainderDescription: 'No Pay 已先按比例扣减底薪、津贴及奖金，以下是仍需另外扣减的余额。',
      attendanceNoPayDays: '无薪日数',
      attendanceRecordSourceNote: '以上出勤扣减资料来自 Attendance Record。',
      packageNoPayTitle: '包佣 No Pay 处理',
      packageNoPayDescription: '此包佣员工本月有 No Pay，而按比率计算佣金未超过包佣，请选择今月包佣处理方式。',
      packageNoPayNeedsSelection: '请选择本月包佣处理方式',
      packageNoPayNoPackage: '本月无包佣',
      packageNoPayProRate: '包佣按上班日数统计',
      packageNoPaySystemDefault: '系统默认',
      packageNoPayAutoApplied: '本月已按系统设定自动套用处理方式。',
      packageNoPayOverrideLabel: '如要改本月做法，可即时覆写：',
      packageNoPayResetToDefault: '跟系统设定',
      packageNoPayProratedAmount: '按上班日数折算包佣',
      packageNoPayAutoActual: '实际佣金已超过包佣，本月按实际佣金计，No Pay 只扣底薪 + 津贴 + 奖金。',
      packageNoPayBlockedSave: '仍有包佣 No Pay 员工未选择本月处理方式，暂时不能保存或导出。',
      monthlyBonusTitle: '当月奖金选择',
      applyThisMonth: '当月发放',
      defaultAmount: '预设金额',
      attendanceLateDisabledNote: '因为出勤记录有迟到',
      briefingBonus: 'Briefing 奖金',
      attendanceBonus: '出勤奖金',
      bookingBonus: 'Booking 奖金',
      manualBonus: '手动增加金额',
      manualDeduction: '手动扣减金额',
      countForMpf: '需扣减 MPF',
      shopBonus: '铺数',
      shopTargetAmount: '本月 Target',
      shopActualSalesAmount: '实际销售数',
      shopTargetPercent: '达标 %',
      salesBonus: 'Sales Bonus',
      payrollBonus: 'Bonus',
      breakdown: '佣金明细',
      method: '计算方式',
      custom: '自定义佣金',
      standard: '跟佣金比率表',
      bonus1: 'Bonus 1',
      bonus2: 'Bonus 2',
      customBonus: '自定义 Bonus',
      packageEmployee: '包佣包薪',
      packageCommissionAmount: '包佣金额',
      packageGuaranteedCommission: '保底包佣',
      packageCalculatedCommission: '按比例计算佣金',
      packageAppliedCommission: '实际出粮佣金',
      mpfRelevantIncome: '扣除 MPF 前相关收入',
      variableSettlement: '本月佣金总额',
      payoutScheduleTitle: '分拆发薪预览',
      mpfDeductionMode: 'MPF 扣款方式',
      mpfDeductionSplit: '随发薪分拆扣',
      mpfDeductionMonthEnd: '月尾一次过扣',
      monthEndMpfDeduction: '月尾补扣 MPF(雇员)',
      primaryPayout: '第一笔发薪',
      secondaryPayout: '第二笔发薪',
      payoutGross: '应发金额',
      payoutMpfDeduction: '扣 MPF(雇员)',
      payoutNet: '实际发薪',
      payoutBaseItems: '底薪 + 津贴 + 奖金',
      payoutCommissionItems: '佣金',
      payoutCombinedItems: '底薪 + 津贴 + 奖金 + 佣金',
    },
    mpf: {
      employee: 'MPF(雇员)',
      employer: 'MPF(雇主)',
      applyThisMonth: '当月需要供款',
      manualAmount: '手动更改金额',
      amount: '金额',
      autoAmount: '系统计算',
      notApplicable: '本月原本毋须供款，可手动开启。',
    },
    booleanLabels: {
      yes: '是',
      no: '否',
    },
  },
  en: {
    title: 'Monthly Payroll Overview',
    subtitle: 'Projected payroll based on current salary settings.',
    cols: { code: 'Code', name: 'Name', branch: 'Branch', base: 'Base', allowance: 'Allowance', bonus: 'Bonus', commission: 'Commission', mpfEe: 'MPF (EE)', mpfEr: 'MPF (ER)', net: 'Net Pay', payDay: 'Pay Day' },
    totals: 'Totals',
    noData: 'No payroll data yet.',
    save: 'Save Commission',
    saving: 'Saving...',
    saved: 'Saved',
    saveFail: 'Save failed',
    exportPayslip: 'Export Payslip Details',
    exportingPayslip: 'Exporting...',
    exportPayslipFail: 'Export Failed',
    exportPayslipSelectTitle: 'Choose Employees To Export',
    exportPayslipSelectDescription: 'Tick one or more employees. If you choose multiple employees, separate PDF files will be downloaded.',
    exportPayslipCancel: 'Cancel',
    exportPayslipConfirm: 'Download Selected PDFs',
    exportPayslipSelectAll: 'Select All',
    exportPayslipClearAll: 'Clear',
    exportPayslipEmpty: 'Select at least one employee first.',
    resyncMonthlySettings: 'Resync This Month From Employee Defaults',
    month: 'Month',
    aiImportTitle: 'AI Payroll Import',
    aiImportTypeLabel: 'Import Type',
    aiImportTypeAll: 'All categories',
    aiImportUploading: 'Analyzing file...',
    aiImportSuccess: 'Import complete',
    aiImportFail: 'Import failed',
    aiImportHint: 'Upload a file with employee codes to import Redeem, Sales, Job or SGM with AI-assisted parsing.',
    avg365: '365-Day Avg Commission',
    avgLabel: 'Monthly Avg',
    mpfSectionTitle: 'MPF Settings',
    tierCard: {
      title: 'Commission Rate Table',
      type: 'Type',
      range: 'Volume Range',
      rate: 'Rate',
      redeem: 'Redeem',
      sales: 'Sales',
      sgm: 'SGM',
      noLimit: 'No limit',
      jobNote: '* Job commission is calculated monthly from an external system (no fixed rate).',
    },
    commInput: {
      title: 'Commission Input',
      redeemVol: 'Redeem Volume',
      salesVol: 'Sales Volume',
      salesAmountTotal: 'Sales Amount Total',
      salesAmountRatePercent: 'Sales Amount Rate',
      salesAmountCommission: 'Sales Amount Commission',
      jobAmt: 'Job Commission (enter amount directly)',
      sgmVol: 'SGM Volume',
      streetPromoterHeadcount: 'Street Promoter Headcount',
      streetPromoterCommission: 'Street Promoter Commission',
      telesalesHeadcount: 'Telesales Headcount',
      telesalesCommission: 'Telesales Commission',
      salaryInputTitle: 'Salary Input',
      workedDays: 'Worked Days This Month',
      workedHours: 'Worked Hours This Month',
      dailyRate: 'Daily Rate',
      hourlyRate: 'Hourly Rate',
      calculatedBaseSalary: 'Calculated Base Salary',
      salaryInputRequired: 'For daily and hourly employees, enter this month\'s days or hours here before Payroll can calculate the base salary.',
      attendanceSourceWorkedDays: 'Worked days are sourced from Attendance Management',
      attendanceNoPayDeduction: 'Attendance No-Pay Deduction',
      attendanceNoPayRemainder: 'Remaining Attendance No-Pay Deduction',
      attendanceNoPayRemainderDescription: 'No-pay has already been applied proportionally across base salary, allowances, and bonuses. This is only the remaining amount that still needs an extra deduction line.',
      attendanceNoPayDays: 'No-Pay Days',
      attendanceRecordSourceNote: 'The attendance-related deductions above are sourced from the attendance record.',
      packageNoPayTitle: 'Package No-Pay Handling',
      packageNoPayDescription: 'This package-commission employee has no-pay attendance this month, and the calculated commission does not exceed the package amount. Choose how the package should be handled this month.',
      packageNoPayNeedsSelection: 'Select this month\'s package handling',
      packageNoPayNoPackage: 'No package commission this month',
      packageNoPayProRate: 'Pro-rate package by worked days',
      packageNoPaySystemDefault: 'System default',
      packageNoPayAutoApplied: 'This month now applies the system default automatically.',
      packageNoPayOverrideLabel: 'Override this month if needed:',
      packageNoPayResetToDefault: 'Use system default',
      packageNoPayProratedAmount: 'Pro-rated package commission',
      packageNoPayAutoActual: 'Actual commission already exceeds the package amount, so this month uses actual commission and no-pay only reduces base salary, allowances, and bonuses.',
      packageNoPayBlockedSave: 'Some package employees with no-pay attendance still need a package handling choice before save or export.',
      monthlyBonusTitle: 'Monthly Bonus Selection',
      applyThisMonth: 'Apply This Month',
      defaultAmount: 'Default Amount',
      attendanceLateDisabledNote: 'Disabled because the attendance record has late days',
      briefingBonus: 'Briefing Bonus',
      attendanceBonus: 'Attendance Bonus',
      bookingBonus: 'Booking Bonus',
      manualBonus: 'Manual Addition',
      manualDeduction: 'Manual Deduction',
      countForMpf: 'Count For MPF',
      shopBonus: 'Shop Bonus',
      shopTargetAmount: 'Monthly Target',
      shopActualSalesAmount: 'Actual Sales',
      shopTargetPercent: 'Achievement %',
      salesBonus: 'Sales Bonus',
      payrollBonus: 'Bonus',
      breakdown: 'Commission Breakdown',
      method: 'Method',
      custom: 'Custom Commission',
      standard: 'Rate table',
      bonus1: 'Bonus 1',
      bonus2: 'Bonus 2',
      customBonus: 'Custom Bonus',
      packageEmployee: 'Inclusive Salary + Commission',
      packageCommissionAmount: 'Package Commission Amount',
      packageGuaranteedCommission: 'Guaranteed Package Commission',
      packageCalculatedCommission: 'Calculated Commission',
      packageAppliedCommission: 'Applied Commission',
      mpfRelevantIncome: 'MPF Relevant Income Before Deduction',
      variableSettlement: 'Commission Total This Month',
      payoutScheduleTitle: 'Split Payroll Preview',
      mpfDeductionMode: 'MPF Deduction Mode',
      mpfDeductionSplit: 'Deduct on each payout',
      mpfDeductionMonthEnd: 'Deduct once at month end',
      monthEndMpfDeduction: 'Month-end MPF deduction (EE)',
      primaryPayout: 'Primary Payroll',
      secondaryPayout: 'Secondary Payroll',
      payoutGross: 'Gross Payout',
      payoutMpfDeduction: 'MPF (EE) Deduction',
      payoutNet: 'Net Payout',
      payoutBaseItems: 'Base + Allowances + Bonus',
      payoutCommissionItems: 'Commission',
      payoutCombinedItems: 'Base + Allowances + Bonus + Commission',
    },
    mpf: {
      employee: 'MPF (Employee)',
      employer: 'MPF (Employer)',
      applyThisMonth: 'Apply this month',
      manualAmount: 'Manual amount',
      amount: 'Amount',
      autoAmount: 'System calculated',
      notApplicable: 'MPF is not required by default this month, but you can enable it manually.',
    },
    booleanLabels: {
      yes: 'Yes',
      no: 'No',
    },
  },
} as const;

function buildInitialVolumes(savedRecords: MonthlyCommissionRecord[]): Record<string, EmployeeVolumes> {
  const init: Record<string, EmployeeVolumes> = {};
  for (const r of savedRecords) {
    const legacySalesReportImport = r.salesVolume > 0
      && r.salesAmountTotal > r.salesVolume * 10
      && r.salesAmountCommission <= 0;
    const salesValue = legacySalesReportImport ? r.salesAmountTotal : r.salesVolume;
    const salesAmountValue = legacySalesReportImport ? 0 : r.salesAmountTotal;

    init[r.employeeCode] = {
      redeem: r.redeemVolume > 0 ? String(r.redeemVolume) : '',
      sales: salesValue > 0 ? String(salesValue) : '',
      salesAmountTotal: salesAmountValue > 0 ? String(salesAmountValue) : '',
      job: r.jobAmount > 0 ? String(r.jobAmount) : '',
      sgm: r.sgmVolume > 0 ? String(r.sgmVolume) : '',
      streetPromoterHeadcount: r.streetPromoterHeadcount > 0 ? String(r.streetPromoterHeadcount) : '',
      telesalesHeadcount: r.telesalesHeadcount > 0 ? String(r.telesalesHeadcount) : '',
    };
  }

  return init;
}

function buildInitialMonthlyBonuses(
  employees: PayrollEmployeeSummary[],
  savedRecords: MonthlyCommissionRecord[],
  attendanceRecords: Record<string, PayrollAttendanceRecord>,
): Record<string, EmployeeMonthlyBonusState> {
  const savedByCode = new Map(savedRecords.map((record) => [record.employeeCode, record]));

  return Object.fromEntries(employees.map((employee) => {
    const saved = savedByCode.get(employee.employeeCode);
    const attendanceRecord = attendanceRecords[employee.employeeCode];
    const hasLateDays = (attendanceRecord?.lateDays ?? 0) > 0;
    const legacyAutoAttendanceRemainder = Boolean(
      saved?.manualDeductionApplied
      && attendanceRecord
      && attendanceRecord.remainingDeductionAmount > 0
      && roundMoney(saved.manualDeductionAmount) === roundMoney(attendanceRecord.remainingDeductionAmount)
      && !saved.manualDeductionMpfIncluded,
    );
    return [employee.employeeCode, {
      briefingApplied: saved?.briefingBonusApplied ?? employee.briefingBonus > 0,
      briefingAmount: saved?.briefingBonusApplied
        ? String(saved.briefingBonusAmount)
        : employee.briefingBonus > 0
          ? String(employee.briefingBonus)
          : '',
      attendanceApplied: hasLateDays ? false : (saved?.attendanceBonusApplied ?? employee.attendanceBonusAmount > 0),
      attendanceAmount: saved?.attendanceBonusApplied
        ? String(saved.attendanceBonusAmount)
        : employee.attendanceBonusAmount > 0
          ? String(employee.attendanceBonusAmount)
          : '',
      bookingApplied: saved?.bookingBonusApplied ?? employee.bookingBonus > 0,
      bookingAmount: saved?.bookingBonusApplied
        ? String(saved.bookingBonusAmount)
        : employee.bookingBonus > 0
          ? String(employee.bookingBonus)
          : '',
      manualBonusApplied: saved?.manualBonusApplied ?? false,
      manualBonusAmount: saved?.manualBonusApplied ? String(saved.manualBonusAmount) : '',
      manualBonusMpfIncluded: saved?.manualBonusMpfIncluded ?? false,
      manualDeductionApplied: legacyAutoAttendanceRemainder ? false : (saved?.manualDeductionApplied ?? false),
      manualDeductionAmount: legacyAutoAttendanceRemainder ? '' : (saved?.manualDeductionApplied ? String(saved.manualDeductionAmount) : ''),
      manualDeductionMpfIncluded: legacyAutoAttendanceRemainder ? false : (saved?.manualDeductionMpfIncluded ?? false),
      shopTargetAmount: saved?.shopTargetAmount ? String(saved.shopTargetAmount) : '',
      shopActualSalesAmount: saved?.shopActualSalesAmount ? String(saved.shopActualSalesAmount) : '',
    }];
  }));
}

function createDefaultVolumes(): EmployeeVolumes {
  return {
    redeem: '',
    sales: '',
    salesAmountTotal: '',
    job: '',
    sgm: '',
    streetPromoterHeadcount: '',
    telesalesHeadcount: '',
  };
}

function createDefaultWorkUnits(): EmployeeWorkUnits {
  return {
    workedDays: '',
    workedHours: '',
  };
}

function getAttendanceNoPayDays(record?: PayrollAttendanceRecord) {
  if (!record) return 0;
  return record.noPayDays;
}

function calculateProratedPackageCommission(packageCommissionAmount: number, record?: PayrollAttendanceRecord) {
  if (!record || record.calendarDays <= 0 || packageCommissionAmount <= 0) {
    return packageCommissionAmount;
  }

  return roundMoney(packageCommissionAmount * (record.workedDays / record.calendarDays));
}

function scaleBasisCompensationForNoPay(input: {
  baseSalary: number;
  allowanceAmount: number;
  transportAllowance: number;
  briefingBonus: number;
  attendanceBonus: number;
  bookingBonus: number;
  deductionAmount: number;
}) {
  const items = [
    { key: 'baseSalary' as const, amount: Math.max(input.baseSalary, 0) },
    { key: 'allowanceAmount' as const, amount: Math.max(input.allowanceAmount, 0) },
    { key: 'transportAllowance' as const, amount: Math.max(input.transportAllowance, 0) },
    { key: 'briefingBonus' as const, amount: Math.max(input.briefingBonus, 0) },
    { key: 'attendanceBonus' as const, amount: Math.max(input.attendanceBonus, 0) },
    { key: 'bookingBonus' as const, amount: Math.max(input.bookingBonus, 0) },
  ];
  const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);

  if (input.deductionAmount <= 0 || totalAmount <= 0) {
    return {
      baseSalary: roundMoney(input.baseSalary),
      allowanceAmount: roundMoney(input.allowanceAmount),
      transportAllowance: roundMoney(input.transportAllowance),
      briefingBonus: roundMoney(input.briefingBonus),
      attendanceBonus: roundMoney(input.attendanceBonus),
      bookingBonus: roundMoney(input.bookingBonus),
      appliedDeduction: 0,
      remainingDeduction: roundMoney(Math.max(input.deductionAmount, 0)),
    };
  }

  const appliedDeduction = roundMoney(Math.min(input.deductionAmount, totalAmount));
  const targetTotal = roundMoney(totalAmount - appliedDeduction);
  const activeItems = items.filter((item) => item.amount > 0);
  const scaled: Record<'baseSalary' | 'allowanceAmount' | 'transportAllowance' | 'briefingBonus' | 'attendanceBonus' | 'bookingBonus', number> = {
    baseSalary: 0,
    allowanceAmount: 0,
    transportAllowance: 0,
    briefingBonus: 0,
    attendanceBonus: 0,
    bookingBonus: 0,
  };

  let assignedTotal = 0;
  activeItems.forEach((item, index) => {
    if (index === activeItems.length - 1) {
      scaled[item.key] = roundMoney(targetTotal - assignedTotal);
      return;
    }

    const scaledAmount = roundMoney(targetTotal * (item.amount / totalAmount));
    scaled[item.key] = scaledAmount;
    assignedTotal += scaledAmount;
  });

  return {
    ...scaled,
    appliedDeduction,
    remainingDeduction: roundMoney(input.deductionAmount - appliedDeduction),
  };
}

function calculateAttendanceNoPayDeduction(employee: PayrollEmployeeSummary, record?: PayrollAttendanceRecord) {
  if (!record) {
    return 0;
  }

  if (record.attendanceDeductionAmount > 0) {
    return roundMoney(record.attendanceDeductionAmount);
  }

  if (record.noPayDays <= 0) {
    return 0;
  }

  return 0;
}

function createDefaultMonthlyBonusState(employee: PayrollEmployeeSummary, lateDays = 0): EmployeeMonthlyBonusState {
  return {
    briefingApplied: employee.briefingBonus > 0,
    briefingAmount: employee.briefingBonus > 0 ? String(employee.briefingBonus) : '',
    attendanceApplied: lateDays > 0 ? false : employee.attendanceBonusAmount > 0,
    attendanceAmount: employee.attendanceBonusAmount > 0 ? String(employee.attendanceBonusAmount) : '',
    bookingApplied: employee.bookingBonus > 0,
    bookingAmount: employee.bookingBonus > 0 ? String(employee.bookingBonus) : '',
    manualBonusApplied: false,
    manualBonusAmount: '',
    manualBonusMpfIncluded: false,
    manualDeductionApplied: false,
    manualDeductionAmount: '',
    manualDeductionMpfIncluded: false,
    shopTargetAmount: '',
    shopActualSalesAmount: '',
  };
}

function createDefaultMonthlyMpfState(
  employee: PayrollEmployeeSummary,
  payrollReferenceDate: Date,
): EmployeeMonthlyMpfState {
  const defaultApplicable = employee.mpfEnabled && isMpfStatutorilyEligible(employee.dateOfBirth, employee.hireDate, payrollReferenceDate);

  return {
    mpfEeApplied: defaultApplicable,
    mpfEeDeductionMode: 'split',
    mpfEeManualOverride: false,
    mpfEeAmount: '',
    mpfErApplied: defaultApplicable,
    mpfErManualOverride: false,
    mpfErAmount: '',
  };
}

function buildInitialWorkUnits(
  savedRecords: MonthlyCommissionRecord[],
  attendanceRecords: Record<string, PayrollAttendanceRecord>,
): Record<string, EmployeeWorkUnits> {
  const init: Record<string, EmployeeWorkUnits> = {};
  for (const record of savedRecords) {
    init[record.employeeCode] = {
      workedDays: attendanceRecords[record.employeeCode]?.workedDays > 0
        ? String(attendanceRecords[record.employeeCode].workedDays)
        : record.workedDays > 0
          ? String(record.workedDays)
          : '',
      workedHours: record.workedHours > 0 ? String(record.workedHours) : '',
    };
  }

  for (const [employeeCode, attendanceRecord] of Object.entries(attendanceRecords)) {
    init[employeeCode] = {
      workedDays: attendanceRecord.workedDays > 0 ? String(attendanceRecord.workedDays) : (init[employeeCode]?.workedDays ?? ''),
      workedHours: init[employeeCode]?.workedHours ?? '',
    };
  }

  return init;
}

function buildInitialMonthlyMpfStates(
  employees: PayrollEmployeeSummary[],
  savedRecords: MonthlyCommissionRecord[],
  payrollReferenceDate: Date,
): Record<string, EmployeeMonthlyMpfState> {
  const savedByCode = new Map(savedRecords.map((record) => [record.employeeCode, record]));

  return Object.fromEntries(employees.map((employee) => {
    const saved = savedByCode.get(employee.employeeCode);
    const defaultApplicable = employee.mpfEnabled && isMpfStatutorilyEligible(employee.dateOfBirth, employee.hireDate, payrollReferenceDate);

    return [employee.employeeCode, {
      mpfEeApplied: saved?.mpfEeApplied ?? defaultApplicable,
      mpfEeDeductionMode: saved?.mpfEeDeductionMode ?? 'split',
      mpfEeManualOverride: saved?.mpfEeManualOverride ?? false,
      mpfEeAmount: saved?.mpfEeManualOverride ? String(saved.mpfEeAmount) : '',
      mpfErApplied: saved?.mpfErApplied ?? defaultApplicable,
      mpfErManualOverride: saved?.mpfErManualOverride ?? false,
      mpfErAmount: saved?.mpfErManualOverride ? String(saved.mpfErAmount) : '',
    }];
  }));
}

function buildInitialPackageNoPayHandling(
  employees: PayrollEmployeeSummary[],
  savedRecords: MonthlyCommissionRecord[],
  defaultPackageNoPayHandling: PackageNoPayHandling,
): Record<string, EmployeePackageNoPayHandlingState> {
  const savedByCode = new Map(savedRecords.map((record) => [record.employeeCode, record.packageNoPayHandling ?? defaultPackageNoPayHandling]));
  return Object.fromEntries(employees.map((employee) => [employee.employeeCode, savedByCode.get(employee.employeeCode) ?? defaultPackageNoPayHandling]));
}

function createEmptyCommissionResult() {
  return {
    redeem: { amount: 0, rate: 0 },
    sales: { amount: 0, rate: 0 },
    sgm: { amount: 0, rate: 0 },
    commissionRuleItems: [],
    salesAmount: { total: 0, amount: 0, ratePercent: 0 },
    job: 0,
    salesBonus: 0,
    payrollBonus: 0,
    redeemBonus: 0,
    commissionTotal: 0,
    totalBonus: 0,
    total: 0,
  };
}

/** Calculate commission for a single employee, respecting custom vs standard rates */
function calcEmployeeCommission(
  volumes: { redeem: number; sales: number; salesAmountTotal: number; job: number; sgm: number },
  emp: PayrollEmployeeSummary,
  tiers: CommissionRateTier[],
  payrollBonusSchemes: PayrollBonusConfigCatalog['payrollBonusSchemes'],
) {
  const isCustom = emp.commissionMethod === 'custom';

  let redeemAmt = 0, redeemRate = 0;
  let salesAmt = 0, salesRate = 0;
  let sgmAmt = 0, sgmRate = 0;
  const salesAmountRatePercent = emp.salesAmountRatePercent ?? 0;
  const salesAmountCommission = roundMoney(volumes.salesAmountTotal * (salesAmountRatePercent / 100));

  const commissionRuleResult = emp.commissionRules.length > 0
    ? calculateCommissionRules({
      redeem: volumes.redeem,
      sales: volumes.sales,
      salesAmountTotal: volumes.salesAmountTotal,
      job: volumes.job,
      sgm: volumes.sgm,
    }, emp.commissionRules)
    : { items: [], total: 0 };

  let commissionRuleMappedAmount = 0;
  if (commissionRuleResult.items.length > 0) {
    for (const item of commissionRuleResult.items) {
      if (item.metric === 'redeem') {
        redeemAmt += item.amount;
        redeemRate = item.rate;
        commissionRuleMappedAmount += item.amount;
      } else if (item.metric === 'sales') {
        salesAmt += item.amount;
        salesRate = item.rate;
        commissionRuleMappedAmount += item.amount;
      } else if (item.metric === 'sgm') {
        sgmAmt += item.amount;
        sgmRate = item.rate;
        commissionRuleMappedAmount += item.amount;
      }
    }
  } else if (isCustom) {
    const result = calculateCustomCommission({ redeem: volumes.redeem, sales: volumes.sales, sgm: volumes.sgm }, emp.commissionCustomTiers);
    redeemRate = result.redeem.rate;
    redeemAmt = result.redeem.amount;
    salesRate = result.sales.rate;
    salesAmt = result.sales.amount;
    sgmRate = result.sgm.rate;
    sgmAmt = result.sgm.amount;
  } else if (emp.commissionMethod === 'standard') {
    const result = calculateTotalCommission(volumes, tiers);
    redeemAmt = result.redeem.amount; redeemRate = result.redeem.rate;
    salesAmt = result.sales.amount; salesRate = result.sales.rate;
    sgmAmt = result.sgm.amount; sgmRate = result.sgm.rate;
  }

  let salesBonusAmt = 0;
  if (emp.salesBonusEnabled && emp.payrollBonusScheme === 'custom' && emp.salesBonusRate && volumes.sales > 0) {
    salesBonusAmt = Math.round(volumes.sales * emp.salesBonusRate * 100) / 100;
  }

  const payrollBonusAmt = calculatePayrollBonus(volumes.sales, emp.salesBonusEnabled, emp.payrollBonusScheme, emp.salesBonusCustomTiers, payrollBonusSchemes);
  const redeemBonusAmt = emp.redeemBonusEnabled
    ? calculateRedeemBonusFromTiers(volumes.redeem, emp.redeemBonusCustomTiers)
    : 0;
  const jobAmt = volumes.job;
  const commissionRuleExtraAmount = Math.max(0, roundMoney(commissionRuleResult.total - commissionRuleMappedAmount));
  const commissionTotal = Math.round((redeemAmt + salesAmt + sgmAmt + salesAmountCommission + jobAmt + commissionRuleExtraAmount) * 100) / 100;
  const totalBonus = Math.round((salesBonusAmt + payrollBonusAmt + redeemBonusAmt) * 100) / 100;
  const total = Math.round((commissionTotal + totalBonus) * 100) / 100;

  return {
    redeem: { amount: redeemAmt, rate: redeemRate },
    sales: { amount: salesAmt, rate: salesRate },
    sgm: { amount: sgmAmt, rate: sgmRate },
    commissionRuleItems: commissionRuleResult.items,
    commissionRuleExtra: commissionRuleExtraAmount,
    salesAmount: { total: volumes.salesAmountTotal, amount: salesAmountCommission, ratePercent: salesAmountRatePercent },
    job: jobAmt,
    salesBonus: salesBonusAmt,
    payrollBonus: payrollBonusAmt,
    redeemBonus: redeemBonusAmt,
    commissionTotal,
    totalBonus,
    total,
  };
}

function getPayrollBonusDisplayName(
  employee: Pick<PayrollEmployeeSummary, 'payrollBonusScheme' | 'salesBonusCustomName'>,
  labels: { bonus1: string; bonus2: string; customBonus: string },
) {
  if (employee.payrollBonusScheme === 'bonus_2') {
    return labels.bonus2;
  }

  if (employee.payrollBonusScheme === 'custom') {
    return employee.salesBonusCustomName?.trim() || labels.customBonus;
  }

  return labels.bonus1;
}

export default function Payroll({ employees, commissionTiers, savedRecords, attendanceRecords, defaultPackageNoPayHandling, commissionAvg, selectedMonth: initialMonth, payrollBonusConfig }: PayrollProps) {
  const { lang } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const t = translations[lang] ?? translations.en;
  const locale = lang === 'en' ? 'en-HK' : lang === 'zh-CN' ? 'zh-CN' : 'zh-HK';

  const fmt = (v: number) => new Intl.NumberFormat(locale, { style: 'currency', currency: 'HKD', maximumFractionDigits: 0 }).format(v);
  const fmtDec = (v: number) => new Intl.NumberFormat(locale, { style: 'currency', currency: 'HKD', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v);
  const fmtPayslipAmount = (v: number) => new Intl.NumberFormat('en-HK', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v);

  const [selectedMonth, setSelectedMonth] = useState(initialMonth);
  const [isPending, startTransition] = useTransition();
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [exportStatus, setExportStatus] = useState<'idle' | 'exporting' | 'error'>('idle');
  const [importType, setImportType] = useState<'all' | 'redeem' | 'sales' | 'job' | 'sgm'>('all');
  const [importStatus, setImportStatus] = useState<'idle' | 'importing' | 'success' | 'error'>('idle');
  const [importMessage, setImportMessage] = useState<string | null>(null);
  const [importKey, setImportKey] = useState(0);
  const [isAiChatbotOpen, setIsAiChatbotOpen] = useState(false);
  const [pendingPayrollImport, setPendingPayrollImport] = useState<PendingPayrollImport | null>(null);
  const [lastPayrollImportRollback, setLastPayrollImportRollback] = useState<PayrollImportRollback | null>(null);
  const [selectedPayrollImportFile, setSelectedPayrollImportFile] = useState<File | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [isChatSending, setIsChatSending] = useState(false);
  const delayAiFeedback = () => new Promise((resolve) => setTimeout(resolve, 800));
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'ai' | 'user'; text: string }>>([
    { role: 'ai', text: lang === 'zh-CN' ? '你好！我是 AI 薪资助手。请选择导入类型并上传文件，我会自动为您提取对应的数据。你也可以输入「记住：...」保存个人记忆。' : (lang === 'en' ? 'Hello! I am your AI Payroll Assistant. Select the import type and upload your file to begin. You can also type "Remember: ..." to save a private memory.' : '你好！我是 AI 薪資助手。請選擇匯入類別並上載檔案，我會為您自動分析及提取數據。你亦可以輸入「記住：...」保存個人記憶。') }
  ]);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const pendingImportStorageKey = 'medi-magic-payroll-pending-import';

  useEffect(() => {
    if (isAiChatbotOpen) {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isAiChatbotOpen]);
  const [isPayslipModalOpen, setIsPayslipModalOpen] = useState(false);
  const [selectedPayslipCodes, setSelectedPayslipCodes] = useState<string[]>([]);
  const [activePayslipPdfEntry, setActivePayslipPdfEntry] = useState<PayslipPdfEntry | null>(null);
  const [editVersion, setEditVersion] = useState(0);
  const payrollReferenceDate = useMemo(
    () => getMonthEndDate(selectedMonth) ?? new Date(),
    [selectedMonth],
  );
  const latestEditVersionRef = useRef(0);
  const saveStatusTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const exportStatusTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const payslipPdfCardRef = useRef<HTMLDivElement | null>(null);

  const [empVolumes, setEmpVolumes] = useState<Record<string, EmployeeVolumes>>(() => buildInitialVolumes(savedRecords));
  const [workUnits, setWorkUnits] = useState<Record<string, EmployeeWorkUnits>>(() => buildInitialWorkUnits(savedRecords, attendanceRecords));
  const [monthlyBonuses, setMonthlyBonuses] = useState<Record<string, EmployeeMonthlyBonusState>>(() => buildInitialMonthlyBonuses(employees, savedRecords, attendanceRecords));
  const [monthlyMpfStates, setMonthlyMpfStates] = useState<Record<string, EmployeeMonthlyMpfState>>(() => buildInitialMonthlyMpfStates(employees, savedRecords, payrollReferenceDate));
  const [packageNoPayHandlingByCode, setPackageNoPayHandlingByCode] = useState<Record<string, EmployeePackageNoPayHandlingState>>(() => buildInitialPackageNoPayHandling(employees, savedRecords, defaultPackageNoPayHandling));
  const [liveEmployeeDefaults, setLiveEmployeeDefaults] = useState<Record<string, PayrollEmployeeSummary>>(() => Object.fromEntries(employees.map((employee) => [employee.employeeCode, employee])));
  const [resyncingCodes, setResyncingCodes] = useState<Record<string, boolean>>({});
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const savedRecordByCode = useMemo(
    () => new Map(savedRecords.map((record) => [record.employeeCode, record])),
    [savedRecords],
  );

  useEffect(() => {
    setSelectedMonth(initialMonth);
  }, [initialMonth]);

  useEffect(() => {
    setEmpVolumes(buildInitialVolumes(savedRecords));
    setWorkUnits(buildInitialWorkUnits(savedRecords, attendanceRecords));
    setMonthlyBonuses(buildInitialMonthlyBonuses(employees, savedRecords, attendanceRecords));
    setMonthlyMpfStates(buildInitialMonthlyMpfStates(employees, savedRecords, payrollReferenceDate));
    setPackageNoPayHandlingByCode(buildInitialPackageNoPayHandling(employees, savedRecords, defaultPackageNoPayHandling));
    setLiveEmployeeDefaults(Object.fromEntries(employees.map((employee) => [employee.employeeCode, employee])));
    setResyncingCodes({});
    setExpandedRows(new Set());
    setEditVersion(0);
    latestEditVersionRef.current = 0;
    setSaveStatus('idle');
  }, [attendanceRecords, defaultPackageNoPayHandling, employees, payrollReferenceDate, savedRecords]);

  useEffect(() => {
    return () => {
      if (saveStatusTimeoutRef.current) {
        clearTimeout(saveStatusTimeoutRef.current);
      }
      if (exportStatusTimeoutRef.current) {
        clearTimeout(exportStatusTimeoutRef.current);
      }
    };
  }, []);

  const markDirty = () => {
    if (saveStatusTimeoutRef.current) {
      clearTimeout(saveStatusTimeoutRef.current);
      saveStatusTimeoutRef.current = null;
    }

    setSaveStatus('idle');
    setEditVersion((prev) => {
      const next = prev + 1;
      latestEditVersionRef.current = next;
      return next;
    });
  };

  const toggleRow = (code: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code); else next.add(code);
      return next;
    });
  };

  const parseImportedNumber = (value: unknown) => {
    if (typeof value === 'number') {
      return Number.isFinite(value) ? value : NaN;
    }

    const normalized = String(value ?? '')
      .replace(/[\s\$HKD,]/gi, '')
      .replace(/，/g, ',')
      .trim();

    if (normalized.length === 0) {
      return NaN;
    }

    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : NaN;
  };

  const updateImportedVolumes = (rows: PayrollImportRow[]) => {
    setEmpVolumes((prev) => {
      const next = { ...prev };

      for (const rawRow of rows) {
        if (rawRow.excluded) {
          continue;
        }

        const normalizedRow = { ...rawRow };
        if (
          normalizedRow.sourceName
          && typeof normalizedRow.sales === 'number'
          && typeof normalizedRow.salesAmountTotal === 'number'
          && normalizedRow.salesAmountTotal > normalizedRow.sales * 10
        ) {
          // Legacy in-memory imports from the sales performance report used total order count as Sales.
          // For this report, commission should be based on the performance subtotal instead.
          normalizedRow.sales = normalizedRow.salesAmountTotal;
          normalizedRow.salesAmountTotal = undefined;
        }

        const employeeCode = (normalizedRow.targetEmployeeCode || normalizedRow.employeeCode)?.trim();
        if (!employeeCode) {
          continue;
        }

        const current = next[employeeCode] ?? {
          redeem: '',
          sales: '',
          salesAmountTotal: '',
          job: '',
          sgm: '',
          streetPromoterHeadcount: '',
          telesalesHeadcount: '',
        };

        const applyMetric = (field: keyof EmployeeVolumes, value?: number) => {
          if (typeof value === 'number' && !Number.isNaN(value)) {
            current[field] = String(value);
          }
        };

        if (importType === 'all' || importType === 'redeem') {
          applyMetric('redeem', normalizedRow.redeem);
        }
        if (importType === 'all' || importType === 'sales') {
          applyMetric('sales', normalizedRow.sales);
          applyMetric('salesAmountTotal', normalizedRow.salesAmountTotal);
        }
        if (importType === 'all' || importType === 'job') {
          applyMetric('job', normalizedRow.job);
        }
        if (importType === 'all' || importType === 'sgm') {
          applyMetric('sgm', normalizedRow.sgm);
        }

        next[employeeCode] = current;
      }

      return next;
    });
  };

  const parsePayrollImportMonth = (input: string) => {
    const normalized = input.trim();
    const explicit = normalized.match(/(20\d{2})[-/年\s]*(0?[1-9]|1[0-2])\s*(?:月)?/);
    if (explicit) {
      return `${explicit[1]}-${explicit[2].padStart(2, '0')}`;
    }

    const monthOnly = normalized.match(/(?:^|\D)(0?[1-9]|1[0-2])\s*(?:月|月份|month)?(?:\D|$)/i);
    if (monthOnly) {
      const year = selectedMonth.split('-')[0] || String(new Date().getFullYear());
      return `${year}-${monthOnly[1].padStart(2, '0')}`;
    }

    return null;
  };

  const getHongKongYearMonth = () => {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Hong_Kong',
      year: 'numeric',
      month: '2-digit',
    }).formatToParts(new Date());
    const year = parts.find((part) => part.type === 'year')?.value;
    const month = parts.find((part) => part.type === 'month')?.value;
    return year && month ? `${year}-${month}` : selectedMonth;
  };

  const detectImportMonthFromRows = (rows: string[][]) => {
    const previewText = rows.slice(0, 8).map((row) => row.join(' ')).join('\n');
    return parsePayrollImportMonth(previewText) ?? getHongKongYearMonth();
  };

  const normalizeImportMatchText = (value: string | null | undefined) => String(value ?? '')
    .toLowerCase()
    .replace(/[\s()（）/\\._-]+/g, '')
    .trim();

  const getImportCandidates = (row: PayrollImportRow, limit = 3) => {
    const sourceName = normalizeImportMatchText(row.sourceName);
    if (!sourceName) {
      return [];
    }

    return employees
      .map((employee) => {
        const names = [employee.alias, employee.nameZh, employee.employeeCode].map(normalizeImportMatchText).filter(Boolean);
        const score = names.reduce((best, name) => {
          if (name === sourceName) return Math.max(best, 100);
          if (name.includes(sourceName) || sourceName.includes(name)) return Math.max(best, 80);
          let shared = 0;
          for (const char of sourceName) {
            if (name.includes(char)) shared += 1;
          }
          return Math.max(best, sourceName.length ? Math.round((shared / sourceName.length) * 60) : 0);
        }, 0);
        return { employee, score };
      })
      .filter(({ score }) => score >= 45)
      .sort((left, right) => right.score - left.score || left.employee.employeeCode.localeCompare(right.employee.employeeCode))
      .slice(0, limit)
      .map(({ employee }) => employee);
  };

  const resolveImportRowTarget = (row: PayrollImportRow) => {
    if (row.excluded) {
      return null;
    }
    const explicit = row.targetEmployeeCode ? employees.find((employee) => employee.employeeCode === row.targetEmployeeCode) : null;
    if (explicit) {
      return explicit;
    }
    return employees.find((employee) => employee.employeeCode === row.employeeCode) ?? null;
  };

  const refreshLatestEmployeeDefaults = async (employeeCodes: string[]) => {
    const uniqueCodes = Array.from(new Set(employeeCodes.filter(Boolean)));
    if (uniqueCodes.length === 0) {
      return;
    }

    const results = await Promise.all(uniqueCodes.map(async (employeeCode) => {
      const result = await fetchLatestPayrollEmployeeDefaults(employeeCode);
      return { employeeCode, result };
    }));

    setLiveEmployeeDefaults((prev) => {
      const next = { ...prev };
      for (const { employeeCode, result } of results) {
        if ('success' in result && result.success) {
          next[employeeCode] = {
            ...(next[employeeCode] ?? employees.find((employee) => employee.employeeCode === employeeCode)),
            ...result.employee,
          } as PayrollEmployeeSummary;
        }
      }
      return next;
    });
  };

  const getCommissionWarnings = (rowsToImport: PayrollImportRow[]) => {
    const employeeByCode = new Map(employees.map((employee) => [employee.employeeCode, employee]));
    const hasStandardSalesTiers = commissionTiers.some((tier) => tier.commissionType === 'sales');
    const hasStandardRedeemTiers = commissionTiers.some((tier) => tier.commissionType === 'redeem');
    const hasStandardSgmTiers = commissionTiers.some((tier) => tier.commissionType === 'sgm');
    const warnings: string[] = [];

    for (const row of rowsToImport) {
      if (row.excluded) {
        continue;
      }
      const targetCode = row.targetEmployeeCode || row.employeeCode;
      const employee = employeeByCode.get(targetCode);
      if (!employee) {
        warnings.push(`${row.employeeCode}${row.sourceName ? ` (${row.sourceName})` : ''}: 未能對應 HRMS 員工，確認匯入時會略過。`);
        continue;
      }

      const name = employee.alias || employee.nameZh;
      const label = `${targetCode}${name ? ` (${name})` : ''}`;
      const customSalesTiers = employee.commissionCustomTiers.filter((tier) => tier.commissionType === 'sales' && tier.rate > 0);
      const customRedeemTiers = employee.commissionCustomTiers.filter((tier) => tier.commissionType === 'redeem' && tier.rate > 0);
      const customSgmTiers = employee.commissionCustomTiers.filter((tier) => tier.commissionType === 'sgm' && tier.rate > 0);

      if (typeof row.sales === 'number' && row.sales > 0) {
        if (employee.commissionMethod === 'custom' && customSalesTiers.length === 0) {
          warnings.push(`${label}: 自訂佣金未設定銷售佣金級別/比例，銷售數量佣金可能係 0。`);
        } else if (employee.commissionMethod !== 'custom' && !hasStandardSalesTiers) {
          warnings.push(`${label}: 系統未設定標準銷售佣金級別。`);
        } else if (!employee.commissionMethod || employee.commissionMethod === 'none') {
          warnings.push(`${label}: 未啟用銷售佣金計算方式。`);
        }
      }

      if (typeof row.salesAmountTotal === 'number' && row.salesAmountTotal > 0) {
        const hasSalesCountCommission = employee.commissionMethod === 'custom'
          ? customSalesTiers.length > 0
          : hasStandardSalesTiers && Boolean(employee.commissionMethod && employee.commissionMethod !== 'none');
        if (!hasSalesCountCommission && !(employee.salesAmountRatePercent && employee.salesAmountRatePercent > 0)) {
          warnings.push(`${label}: 未設定銷售佣金比例/級別，銷售金額會匯入，但佣金可能係 0。`);
        }
      }

      if (typeof row.redeem === 'number' && row.redeem > 0) {
        if (employee.commissionMethod === 'custom' && customRedeemTiers.length === 0) {
          warnings.push(`${label}: 自訂佣金未設定 Redeem 佣金級別/比例。`);
        } else if (employee.commissionMethod !== 'custom' && !hasStandardRedeemTiers) {
          warnings.push(`${label}: 系統未設定標準 Redeem 佣金級別。`);
        }
      }

      if (typeof row.sgm === 'number' && row.sgm > 0) {
        if (employee.commissionMethod === 'custom' && customSgmTiers.length === 0) {
          warnings.push(`${label}: 自訂佣金未設定 SGM 佣金級別/比例。`);
        } else if (employee.commissionMethod !== 'custom' && !hasStandardSgmTiers) {
          warnings.push(`${label}: 系統未設定標準 SGM 佣金級別。`);
        }
      }
    }

    return warnings;
  };

  const applyPendingPayrollImport = (pending: PendingPayrollImport) => {
    const importableRows = pending.parsedRows.filter((row) => resolveImportRowTarget(row));
    const beforeValues = Object.fromEntries(
      importableRows.map((row) => {
        const targetCode = row.targetEmployeeCode || row.employeeCode;
        return [targetCode, { ...getVolumes(targetCode) }];
      }),
    );
    setLastPayrollImportRollback({
      fileName: pending.fileName,
      targetMonth: pending.targetMonth ?? selectedMonth,
      importedAt: new Date().toISOString(),
      beforeValues,
    });
    updateImportedVolumes(importableRows);
    markDirty();
    setImportStatus('success');
    const successMsg = lang === 'zh-CN'
      ? `已确认并导入 ${importableRows.length} 位员工的数据到 ${pending.targetMonth ?? selectedMonth}。`
      : lang === 'en'
        ? `Confirmed and imported data for ${importableRows.length} employees into ${pending.targetMonth ?? selectedMonth}.`
        : `已確認並匯入 ${importableRows.length} 位員工嘅數據到 ${pending.targetMonth ?? selectedMonth}。`;
    setImportMessage(successMsg);
    setChatMessages((prev) => [...prev, { role: 'ai', text: successMsg }]);
    setPendingPayrollImport(null);
    setImportKey((prev) => prev + 1);
  };

  const applyPendingPayrollImportWithLatestDefaults = async (pending: PendingPayrollImport) => {
    const importableCodes = pending.parsedRows
      .map((row) => row.targetEmployeeCode || row.employeeCode)
      .filter((code) => Boolean(code));
    setImportStatus('importing');
    await refreshLatestEmployeeDefaults(importableCodes);
    applyPendingPayrollImport(pending);
  };

  const restoreLastPayrollImport = () => {
    if (!lastPayrollImportRollback) {
      return;
    }

    setEmpVolumes((prev) => ({ ...prev, ...lastPayrollImportRollback.beforeValues }));
    markDirty();
    setChatMessages((prev) => [...prev, {
      role: 'ai',
      text: `已回復 ${lastPayrollImportRollback.fileName} 匯入前嘅狀態（月份：${lastPayrollImportRollback.targetMonth}）。如果你已經按過 Save Payroll，請再按一次 Save 將回復結果寫入 Supabase。`,
    }]);
    setLastPayrollImportRollback(null);
  };

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const raw = window.sessionStorage.getItem(pendingImportStorageKey);
    if (!raw) {
      return;
    }

    try {
      const pending = JSON.parse(raw) as PendingPayrollImport;
      if (pending.targetMonth === selectedMonth && selectedMonth === initialMonth && Array.isArray(pending.parsedRows)) {
        window.sessionStorage.removeItem(pendingImportStorageKey);
        void applyPendingPayrollImportWithLatestDefaults(pending);
      }
    } catch {
      window.sessionStorage.removeItem(pendingImportStorageKey);
    }
  }, [initialMonth, selectedMonth, savedRecords]);

  const parseSalesPerformanceReportRows = (rows: string[][]): PayrollImportRow[] => {
    const hasSalesReportHeader = rows.some((row) => (
      row.some((cell) => cell.includes('銷售員編號')) && row.some((cell) => cell.includes('業績'))
    ));

    if (!hasSalesReportHeader || (importType !== 'all' && importType !== 'sales')) {
      return [];
    }

    const parsed: PayrollImportRow[] = [];
    let current: { employeeCode: string; sourceName: string; salesCount: number; salesAmountTotal: number } | null = null;

    const flush = () => {
      if (!current) {
        return;
      }
      parsed.push({
        employeeCode: current.employeeCode,
        sourceName: current.sourceName,
        sales: roundMoney(current.salesAmountTotal),
      });
      current = null;
    };

    for (const row of rows) {
      const employeeCode = String(row[0] ?? '').trim();
      if (/^SF\d+/i.test(employeeCode)) {
        flush();
        current = { employeeCode, sourceName: String(row[1] ?? '').trim(), salesCount: 0, salesAmountTotal: 0 };
      }

      if (!current) {
        continue;
      }

      const totalOrderIndex = row.findIndex((cell) => cell.includes('總單數'));
      const subtotalIndex = row.findIndex((cell) => cell.includes('小計'));

      if (totalOrderIndex >= 0 || subtotalIndex >= 0) {
        const totalOrders = totalOrderIndex >= 0 ? parseImportedNumber(row[totalOrderIndex + 1]) : NaN;
        const subtotal = subtotalIndex >= 0 ? parseImportedNumber(row[subtotalIndex + 1]) : NaN;
        if (Number.isFinite(totalOrders)) {
          current.salesCount = totalOrders;
        }
        if (Number.isFinite(subtotal)) {
          current.salesAmountTotal = subtotal;
        }
        flush();
        continue;
      }

      const performance = parseImportedNumber(row[9]);
      if (Number.isFinite(performance)) {
        current.salesCount += 1;
        current.salesAmountTotal += performance;
      }
    }

    flush();
    return parsed;
  };

  const buildImportReviewMessage = (pending: PendingPayrollImport) => {
    const labelMap = {
      all: 'All',
      redeem: 'Redeem',
      sales: 'Sales',
      job: 'Job',
      sgm: 'SGM',
    };
    const employeeByCode = new Map(employees.map((employee) => [employee.employeeCode, employee]));
    const metricLabels: Array<[keyof PayrollImportRow, string]> = [
      ['redeem', 'Redeem'],
      ['sales', 'Sales'],
      ['salesAmountTotal', 'Sales Amount'],
      ['job', 'Job'],
      ['sgm', 'SGM'],
    ];
    const importableCount = pending.parsedRows.filter((row) => resolveImportRowTarget(row)).length;
    const unmatchedCount = pending.parsedRows.filter((row) => !row.excluded && !resolveImportRowTarget(row)).length;
    const excludedCount = pending.parsedRows.filter((row) => row.excluded).length;
    const lines = pending.parsedRows
      .filter((row) => row.excluded || !resolveImportRowTarget(row))
      .map((row) => {
      const employee = resolveImportRowTarget(row);
      const metrics = metricLabels
        .filter(([key]) => typeof row[key] === 'number')
        .map(([key, label]) => `${label}: ${row[key]}`)
        .join(', ');
      const employeeName = employee?.alias || employee?.nameZh;
      const status = row.excluded ? '已排除' : employee ? `匹配 ${employee.employeeCode}${employeeName ? ` ${employeeName}` : ''}` : '未匹配';
      return `• ${row.employeeCode}${row.sourceName ? ` (${row.sourceName})` : ''} -> ${status}: ${metrics || '未有數值'}`;
    });
    const totalSalesAmount = pending.parsedRows.reduce((sum, row) => sum + (typeof row.sales === 'number' ? row.sales : 0), 0);
    const warningLines = pending.warnings.slice(0, 8).map((warning) => `• ${warning}`);
    const warningMore = pending.warnings.length > warningLines.length ? `\n• 另外仲有 ${pending.warnings.length - warningLines.length} 個提醒未顯示。` : '';
    const warningBlock = pending.warnings.length > 0
      ? `\n\nCommission 設定提醒：\n${warningLines.join('\n')}${warningMore}`
      : '\n\nCommission 設定檢查：暫時未發現明顯缺漏。';

    const monthLine = pending.targetMonth
      ? `目標月份：${pending.targetMonth}`
      : '請先回覆呢份文件係邊個月份，例如「2026-02」或「2月」。未確認月份前唔會寫入 Payroll。';

    const exceptionBlock = lines.length > 0 ? `\n\n需要處理嘅員工：\n${lines.join('\n')}` : '\n\n所有員工已成功匹配。';
    return `我已分析檔案，但未匯入系統。\n\n檔案：${pending.fileName}\n匯入類別：${labelMap[pending.importType]}\n${monthLine}\n文件資料：共 ${pending.totalRows} 行，標題係「${pending.header || '未偵測到標題'}」。\nAI 提取到 ${pending.parsedRows.length} 位員工，成功匹配 ${importableCount} 位，未匹配 ${unmatchedCount} 位，已排除 ${excludedCount} 位，Sales 業績總額 HK$${totalSalesAmount.toLocaleString('en-HK')}.${exceptionBlock}${warningBlock}\n\n最後確認：是否將已匹配嘅 commission input 寫入 ${pending.targetMonth ?? '指定月份'}？未匹配/已排除員工唔會寫入。`;
  };

  const confirmPendingPayrollImport = async () => {
    if (!pendingPayrollImport) {
      return;
    }

    if (!pendingPayrollImport.targetMonth) {
      setChatMessages((prev) => [...prev, { role: 'ai', text: lang === 'zh-CN' ? '请先告诉我这份文件属于哪个月份，例如 2026-02。' : lang === 'en' ? 'Please tell me which month this file belongs to first, for example 2026-02.' : '請先話我知呢份文件屬於邊個月份，例如 2026-02。' }]);
      return;
    }

    if (pendingPayrollImport.targetMonth !== selectedMonth && typeof window !== 'undefined') {
      window.sessionStorage.setItem(pendingImportStorageKey, JSON.stringify(pendingPayrollImport));
      setChatMessages((prev) => [...prev, { role: 'ai', text: `我會先切換到 ${pendingPayrollImport.targetMonth}，再將資料寫入該月份。` }]);
      handleMonthChange(pendingPayrollImport.targetMonth);
      return;
    }

    await applyPendingPayrollImportWithLatestDefaults(pendingPayrollImport);
  };

  const updatePendingImportRow = (index: number, patch: Partial<PayrollImportRow>) => {
    setPendingPayrollImport((prev) => {
      if (!prev) {
        return prev;
      }
      const parsedRows = prev.parsedRows.map((row, rowIndex) => (
        rowIndex === index ? { ...row, ...patch } : row
      ));
      return { ...prev, parsedRows, warnings: getCommissionWarnings(parsedRows) };
    });
  };

  const cancelPendingPayrollImport = () => {
    setPendingPayrollImport(null);
    setImportStatus('idle');
    setImportMessage(null);
    setChatMessages((prev) => [...prev, { role: 'ai', text: lang === 'zh-CN' ? '已取消本次导入。请重新上传正确文件。' : lang === 'en' ? 'Import cancelled. Please upload the correct file again.' : '已取消今次匯入。請重新上載正確檔案。' }]);
    setImportKey((prev) => prev + 1);
  };

  const handleAiChatSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const question = chatInput.trim();
    if (!question && selectedPayrollImportFile && !isChatSending && importStatus !== 'importing') {
      const file = selectedPayrollImportFile;
      setSelectedPayrollImportFile(null);
      await handlePayrollImport(file);
      return;
    }

    if (!question || isChatSending) {
      return;
    }

    setChatInput('');
    setIsChatSending(true);
    setChatMessages((prev) => [...prev, { role: 'user', text: question }]);

    try {
      if (pendingPayrollImport && !pendingPayrollImport.targetMonth) {
        const parsedMonth = parsePayrollImportMonth(question);
        if (parsedMonth) {
          const nextPending = { ...pendingPayrollImport, targetMonth: parsedMonth, warnings: getCommissionWarnings(pendingPayrollImport.parsedRows) };
          setPendingPayrollImport(nextPending);
          setImportMessage(lang === 'zh-CN' ? `已设定目标月份：${parsedMonth}，等待确认导入。` : lang === 'en' ? `Target month set to ${parsedMonth}. Waiting for confirmation.` : `已設定目標月份：${parsedMonth}，等待確認匯入。`);
          setChatMessages((prev) => [...prev, { role: 'ai', text: `${buildImportReviewMessage(nextPending)}\n\n如果正確，請按「確認匯入」。` }]);
          return;
        }

        setChatMessages((prev) => [...prev, { role: 'ai', text: lang === 'zh-CN' ? '我未能识别月份，请用 YYYY-MM 格式，例如 2026-02。' : lang === 'en' ? 'I could not identify the month. Please use YYYY-MM, for example 2026-02.' : '我未能識別月份，請用 YYYY-MM 格式，例如 2026-02。' }]);
        return;
      }

      const memoryContent = question
        .replace(/^(記住|记住|remember)\s*[:：,-]?\s*/i, '')
        .trim();
      const shouldSaveMemory = memoryContent !== question && memoryContent.length > 0;

      if (shouldSaveMemory) {
        const response = await fetch('../../api/ai/memories/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            moduleKey: 'payroll',
            memoryType: memoryContent.includes('規則') || memoryContent.includes('规则') || memoryContent.toLowerCase().includes('rule') ? 'business_rule' : 'preference',
            content: memoryContent,
            metadata: { source: 'payroll_ai_chat' },
          }),
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data?.error || `Memory save failed (${response.status}).`);
        }
        setChatMessages((prev) => [...prev, { role: 'ai', text: lang === 'zh-CN' ? `已记住：${memoryContent}` : lang === 'en' ? `Saved to your private memory: ${memoryContent}` : `已記住：${memoryContent}` }]);
        return;
      }

      const pendingContext = pendingPayrollImport
        ? `\n\nCurrent pending import context:\n${buildImportReviewMessage(pendingPayrollImport)}`
        : '';
      const response = await fetch('../../api/ai/payroll-import/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ responseMode: 'chat', prompt: `${question}${pendingContext}` }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || `AI API request failed (${response.status}).`);
      }
      setChatMessages((prev) => [...prev, { role: 'ai', text: typeof data?.text === 'string' ? data.text : '我暫時未能回覆。' }]);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      setChatMessages((prev) => [...prev, { role: 'ai', text: `抱歉，AI chat 發生錯誤：${errorMsg}` }]);
    } finally {
      setIsChatSending(false);
    }
  };

  const handlePayrollImport = async (file: File | null) => {
    if (!file) {
      return;
    }

    setImportStatus('importing');
    setImportMessage(null);
    setPendingPayrollImport(null);
    setChatMessages((prev) => [
      ...prev,
      { role: 'user', text: lang === 'zh-CN' ? `已上传文件：${file.name} (类型: ${importType})` : (lang === 'en' ? `Uploaded file: ${file.name} (Type: ${importType})` : `已上載檔案：${file.name} (類別: ${importType})`) }
    ]);

    try {
      // 1. Read the file
      const normalizedName = file.name.toLowerCase();
      let rows: string[][] = [];

      if (normalizedName.endsWith('.csv') || normalizedName.endsWith('.txt')) {
        const text = await file.text();
        const lines = text.split(/\r?\n/).map((line) => line.trim()).filter((line) => line.length > 0);
        for (const line of lines) {
          const cells: string[] = [];
          let current = '';
          let inQuotes = false;
          for (let index = 0; index < line.length; index += 1) {
            const char = line[index];
            if (char === '"') {
              if (inQuotes && line[index + 1] === '"') {
                current += '"';
                index += 1;
              } else {
                inQuotes = !inQuotes;
              }
            } else if (char === ',' && !inQuotes) {
              cells.push(current.trim());
              current = '';
            } else {
              current += char;
            }
          }
          cells.push(current.trim());
          rows.push(cells);
        }
      } else if (normalizedName.endsWith('.xlsx')) {
        const ExcelJS = await import('exceljs');
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(await file.arrayBuffer() as any);
        const worksheet = workbook.worksheets[0];
        if (worksheet) {
          worksheet.eachRow({ includeEmpty: false }, (row) => {
            const values: string[] = [];
            for (let index = 1; index <= row.cellCount; index += 1) {
              const value = row.getCell(index).value;
              if (value === null || value === undefined) {
                values.push('');
              } else if (typeof value === 'object' && 'text' in value && typeof value.text === 'string') {
                values.push(value.text.trim());
              } else {
                values.push(String(value).trim());
              }
            }
            if (values.some((cell) => cell !== '')) {
              rows.push(values);
            }
          });
        }
      } else {
        throw new Error('Unsupported file type. Please upload XLSX or CSV.');
      }

      if (rows.length === 0) {
        throw new Error('Uploaded file contains no rows.');
      }

      await delayAiFeedback();

      // 2. Build prompt
      const fieldHint = importType === 'all'
        ? 'employee code plus any redeem, sales, salesAmountTotal, job, and sgm values available'
        : `employee code plus the ${importType} value`;
      const tablePreview = rows.slice(0, 20).map((row) => row.map((cell) => cell || '').join(' | ')).join('\n');
      const header = rows[0]?.map((cell) => cell || '').join(' | ') ?? '';
      const detectedMonth = detectImportMonthFromRows(rows);
      const structuredRows = parseSalesPerformanceReportRows(rows);

      if (structuredRows.length > 0) {
        const pending: PendingPayrollImport = {
          fileName: file.name,
          importType,
          targetMonth: detectedMonth,
          totalRows: rows.length,
          header,
          tablePreview,
          parsedRows: structuredRows,
          warnings: getCommissionWarnings(structuredRows),
        };

        setPendingPayrollImport(pending);
        setImportStatus('success');
        setImportMessage(lang === 'zh-CN' ? '已完成分析，等待确认导入。' : lang === 'en' ? 'Analysis completed. Waiting for confirmation.' : '已完成分析，等待確認匯入。');
        setChatMessages((prev) => [...prev, { role: 'ai', text: buildImportReviewMessage(pending) }]);
        return;
      }

      const prompt = `You are a payroll import assistant. Extract ${fieldHint} from the uploaded payroll table.
Return only valid JSON. The output must be a JSON array of objects. Each object must include a string field named "employeeCode" and numeric fields where applicable. Do not include any explanation or extra text.
Examples:
[
  {"employeeCode":"EMP001","redeem":10,"sales":5,"salesAmountTotal":1200,"job":0,"sgm":3}
]
If importType is not all, return objects with only employeeCode plus the requested field.
Table header:
${header}
Table rows:
${tablePreview}`;

      // 3. Call server-side AI proxy so API keys are not exposed in the browser.
      const aiResponse = await fetch('../../api/ai/payroll-import/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
        }),
      });

      const aiData = await aiResponse.json();
      if (!aiResponse.ok) {
        throw new Error(aiData?.error || `AI API request failed (${aiResponse.status}).`);
      }

      const aiText = typeof aiData?.text === 'string' ? aiData.text : '';

      const jsonMatch = aiText.match(/\[\s*[\s\S]*\]/m) || aiText.match(/\{[\s\S]*\}/m);
      if (!jsonMatch) {
        throw new Error('Unable to parse AI response as JSON.');
      }

      const aiParsed = JSON.parse(jsonMatch[0]);
      if (!Array.isArray(aiParsed)) {
        throw new Error('AI response did not return an array.');
      }

      const parsedRows: PayrollImportRow[] = [];
      for (const item of aiParsed) {
        if (!item || typeof item !== 'object') continue;
        const raw = item as Record<string, unknown>;
        const employeeCode = String(raw.employeeCode ?? raw.employee_code ?? '').trim();
        if (!employeeCode) continue;

        const parseNumber = (field: string) => {
          const rawValue = raw[field];
          if (rawValue === null || rawValue === undefined || rawValue === '') return undefined;
          const num = Number(String(rawValue).replace(/[\s,\$HKDhkdhkdhkd]/gi, '').trim());
          return Number.isFinite(num) ? num : undefined;
        };

        parsedRows.push({
          employeeCode,
          redeem: parseNumber('redeem'),
          sales: parseNumber('sales'),
          salesAmountTotal: parseNumber('salesAmountTotal'),
          job: parseNumber('job'),
          sgm: parseNumber('sgm'),
        });
      }

      const pending: PendingPayrollImport = {
        fileName: file.name,
        importType,
        targetMonth: detectedMonth,
        totalRows: rows.length,
        header,
        tablePreview,
        parsedRows,
        warnings: getCommissionWarnings(parsedRows),
      };

      setPendingPayrollImport(pending);
      setImportStatus('success');
      const reviewMsg = buildImportReviewMessage(pending);
      setImportMessage(lang === 'zh-CN' ? '已完成分析，等待确认导入。' : lang === 'en' ? 'Analysis completed. Waiting for confirmation.' : '已完成分析，等待確認匯入。');
      setChatMessages((prev) => [...prev, { role: 'ai', text: reviewMsg }]);
    } catch (error) {
      setImportStatus('error');
      const errorMsg = error instanceof Error ? error.message : String(error);
      setImportMessage(errorMsg);
      setChatMessages((prev) => [...prev, { role: 'ai', text: lang === 'zh-CN' ? `抱歉，导入过程中发生错误：${errorMsg}` : (lang === 'en' ? `Sorry, an error occurred during import: ${errorMsg}` : `抱歉，匯入過程中發生錯誤：${errorMsg}`) }]);
      setImportKey((prev) => prev + 1);
    }
  };

  const getImportStatusText = () => {
    if (importStatus === 'importing') {
      return t.aiImportUploading;
    }
    if (importStatus === 'success') {
      return importMessage || t.aiImportSuccess;
    }
    if (importStatus === 'error') {
      return importMessage || t.aiImportFail;
    }

    return '';
  };

  const getVolumes = (code: string): EmployeeVolumes => empVolumes[code] ?? {
    ...createDefaultVolumes(),
  };
  const setVolume = (code: string, field: keyof EmployeeVolumes, value: string) => {
    setEmpVolumes((prev) => ({ ...prev, [code]: { ...getVolumes(code), [field]: value } }));
    markDirty();
  };
  const getWorkUnits = (code: string): EmployeeWorkUnits => workUnits[code] ?? {
    ...createDefaultWorkUnits(),
  };
  const setWorkUnit = (code: string, field: keyof EmployeeWorkUnits, value: string) => {
    setWorkUnits((prev) => ({ ...prev, [code]: { ...getWorkUnits(code), [field]: value } }));
    markDirty();
  };
  const getMonthlyBonus = (code: string, employee: PayrollEmployeeSummary): EmployeeMonthlyBonusState => monthlyBonuses[code] ?? createDefaultMonthlyBonusState(employee, attendanceRecords[code]?.lateDays ?? 0);
  const setMonthlyBonus = (code: string, employee: PayrollEmployeeSummary, key: keyof EmployeeMonthlyBonusState, value: string | boolean) => {
    setMonthlyBonuses((prev) => ({
      ...prev,
      [code]: {
        ...getMonthlyBonus(code, employee),
        [key]: value,
      },
    }));
    markDirty();
  };
  const getMonthlyMpfState = (code: string, employee: PayrollEmployeeSummary): EmployeeMonthlyMpfState => {
    return monthlyMpfStates[code] ?? createDefaultMonthlyMpfState(employee, payrollReferenceDate);
  };
  const setMonthlyMpfState = (code: string, employee: PayrollEmployeeSummary, patch: Partial<EmployeeMonthlyMpfState>) => {
    setMonthlyMpfStates((prev) => ({
      ...prev,
      [code]: {
        ...getMonthlyMpfState(code, employee),
        ...patch,
      },
    }));
    markDirty();
  };
  const getPackageNoPayHandling = (code: string): EmployeePackageNoPayHandlingState => packageNoPayHandlingByCode[code] ?? '';
  const setPackageNoPayHandling = (code: string, value: EmployeePackageNoPayHandlingState) => {
    setPackageNoPayHandlingByCode((prev) => ({
      ...prev,
      [code]: value,
    }));
    markDirty();
  };

  const resetEmployeeMonthState = (employee: PayrollEmployeeSummary) => {
    setEmpVolumes((prev) => ({
      ...prev,
      [employee.employeeCode]: createDefaultVolumes(),
    }));
    setWorkUnits((prev) => ({
      ...prev,
      [employee.employeeCode]: createDefaultWorkUnits(),
    }));
    setMonthlyBonuses((prev) => ({
      ...prev,
      [employee.employeeCode]: createDefaultMonthlyBonusState(employee, attendanceRecords[employee.employeeCode]?.lateDays ?? 0),
    }));
    setMonthlyMpfStates((prev) => ({
      ...prev,
      [employee.employeeCode]: createDefaultMonthlyMpfState(employee, payrollReferenceDate),
    }));
    setPackageNoPayHandlingByCode((prev) => ({
      ...prev,
      [employee.employeeCode]: defaultPackageNoPayHandling,
    }));
    markDirty();
  };

  const resyncEmployeeMonthFromDefaults = async (employeeCode: string) => {
    setResyncingCodes((prev) => ({ ...prev, [employeeCode]: true }));
    const result = await fetchLatestPayrollEmployeeDefaults(employeeCode);
    setResyncingCodes((prev) => ({ ...prev, [employeeCode]: false }));

    if (!('success' in result) || !result.success) {
      setSaveStatus('error');
      queueSaveStatusReset();
      return;
    }

    const mergedEmployee = {
      ...(liveEmployeeDefaults[employeeCode] ?? employees.find((employee) => employee.employeeCode === employeeCode)),
      ...result.employee,
    } as PayrollEmployeeSummary;

    setLiveEmployeeDefaults((prev) => ({
      ...prev,
      [employeeCode]: mergedEmployee,
    }));
    resetEmployeeMonthState(mergedEmployee);
  };

  const handleMonthChange = (value: string) => {
    setSelectedMonth(value);
    startTransition(() => {
      const params = new URLSearchParams(searchParams?.toString() ?? '');
      if (value) {
        params.set('month', value);
      } else {
        params.delete('month');
      }

      const href = params.toString() ? `${pathname}?${params.toString()}` : pathname;
      router.replace(href, { scroll: false });
    });
  };

  const rows = employees.map((sourceEmployee) => {
    const emp = liveEmployeeDefaults[sourceEmployee.employeeCode] ?? sourceEmployee;
    const savedRecord = savedRecordByCode.get(emp.employeeCode);
    const attendanceRecord = attendanceRecords[emp.employeeCode];
    const hasLateDays = (attendanceRecord?.lateDays ?? 0) > 0;
    const vol = getVolumes(emp.employeeCode);
    const unitInput = getWorkUnits(emp.employeeCode);
    const monthlyBonus = getMonthlyBonus(emp.employeeCode, emp);
    const packageNoPayHandling = getPackageNoPayHandling(emp.employeeCode) || defaultPackageNoPayHandling;
    const isPackageEmployee = emp.salaryType === 'package';
    const isDailyEmployee = emp.salaryType === 'daily';
    const isHourlyEmployee = emp.salaryType === 'hourly';
    const attendanceDrivenWorkedDays = isDailyEmployee && Boolean(attendanceRecord);
    const workedDays = attendanceDrivenWorkedDays
      ? (attendanceRecord?.workedDays ?? 0)
      : Number(unitInput.workedDays) || 0;
    const workedHours = Number(unitInput.workedHours) || 0;
    const hasWorkedDays = attendanceDrivenWorkedDays || unitInput.workedDays !== '';
    const hasWorkedHours = unitInput.workedHours !== '';
    const attendanceNoPayDays = getAttendanceNoPayDays(attendanceRecord);
    const attendanceNoPayDeduction = calculateAttendanceNoPayDeduction(emp, attendanceRecord);
    const rawCalculatedBaseSalary = isDailyEmployee
      ? emp.baseSalary * workedDays
      : isHourlyEmployee
        ? emp.baseSalary * workedHours
        : emp.baseSalary;
    const isStreetPromoter = emp.streetPromoterEnabled;
    const isTelesales = emp.telesalesEnabled;
    const hasCommission = Boolean(emp.commissionMethod && emp.commissionMethod !== 'none');
    const hasSalesAmountCommission = (emp.salesAmountRatePercent ?? 0) > 0;
    const packageCommissionAmount = isPackageEmployee ? emp.packageCommissionAmount : 0;
    const rawBriefingBonus = monthlyBonus.briefingApplied ? Number(monthlyBonus.briefingAmount) || 0 : 0;
    const displayAttendanceBonus = Number(monthlyBonus.attendanceAmount) || 0;
    const attendanceBonusApplied = hasLateDays ? false : monthlyBonus.attendanceApplied;
    const rawAttendanceBonus = attendanceBonusApplied ? Number(monthlyBonus.attendanceAmount) || 0 : 0;
    const rawBookingBonus = monthlyBonus.bookingApplied ? Number(monthlyBonus.bookingAmount) || 0 : 0;
    const scaledBasisCompensation = scaleBasisCompensationForNoPay({
      baseSalary: isDailyEmployee || isHourlyEmployee ? 0 : rawCalculatedBaseSalary,
      allowanceAmount: emp.allowanceAmount,
      transportAllowance: emp.transportAllowance,
      briefingBonus: rawBriefingBonus,
      attendanceBonus: rawAttendanceBonus,
      bookingBonus: rawBookingBonus,
      deductionAmount: attendanceNoPayDeduction,
    });
    const calculatedBaseSalary = isDailyEmployee || isHourlyEmployee
      ? rawCalculatedBaseSalary
      : scaledBasisCompensation.baseSalary;
    const scaledAllowanceAmount = scaledBasisCompensation.allowanceAmount;
    const scaledTransportAllowance = scaledBasisCompensation.transportAllowance;
    const briefingBonus = scaledBasisCompensation.briefingBonus;
    const attendanceBonus = scaledBasisCompensation.attendanceBonus;
    const bookingBonus = scaledBasisCompensation.bookingBonus;
    const manualBonus = monthlyBonus.manualBonusApplied ? Number(monthlyBonus.manualBonusAmount) || 0 : 0;
    const attendanceDeductionRemainder = attendanceRecord?.remainingDeductionAmount > 0
      ? roundMoney(attendanceRecord.remainingDeductionAmount)
      : scaledBasisCompensation.remainingDeduction;
    const manualDeductionApplied = monthlyBonus.manualDeductionApplied;
    const manualDeduction = manualDeductionApplied ? Number(monthlyBonus.manualDeductionAmount) || 0 : 0;
    const totalDeduction = attendanceDeductionRemainder + manualDeduction;
    const manualBonusMpfRelevant = 0;
    const manualDeductionMpfRelevant = 0;
    const shopTargetAmount = Number(monthlyBonus.shopTargetAmount) || 0;
    const shopActualSalesAmount = Number(monthlyBonus.shopActualSalesAmount) || 0;
    const hasShopAmounts = monthlyBonus.shopTargetAmount !== '' || monthlyBonus.shopActualSalesAmount !== '';
    const shopTargetPercent = emp.shopBonusEnabled
      ? (hasShopAmounts
        ? calculateShopTargetPercent(shopTargetAmount, shopActualSalesAmount)
        : Number(savedRecord?.shopTargetPercent ?? 0))
      : 0;
    const shopBonus = emp.shopBonusEnabled
      ? (hasShopAmounts
        ? calculateShopBonus(
          shopTargetPercent,
          emp.shopBonusEnabled,
          emp.shopBonusScheme,
          emp.shopBonusCustomTiers,
          payrollBonusConfig.shopBonusStandardTiers,
        )
        : Number(savedRecord?.shopBonusAmount ?? 0))
      : 0;
    const streetPromoterHeadcount = Number(vol.streetPromoterHeadcount) || 0;
    const streetPromoterCommission = isStreetPromoter
      ? calculateStreetPromoterCommission(streetPromoterHeadcount)
      : 0;
    const telesalesHeadcount = Number(vol.telesalesHeadcount) || 0;
    const telesalesCommissionResult = isTelesales
      ? calculateTelesalesCommission(telesalesHeadcount)
      : { amount: 0, ratePerHead: 0 };
    const telesalesCommission = telesalesCommissionResult.amount;
    const fixedBonus = briefingBonus + attendanceBonus + bookingBonus + manualBonus + shopBonus - totalDeduction;
    const commissionCalculationEnabled = hasCommission || hasSalesAmountCommission;
    const monthlyMpf = getMonthlyMpfState(emp.employeeCode, emp);
    const commResult = commissionCalculationEnabled
      ? calcEmployeeCommission(
        { redeem: Number(vol.redeem) || 0, sales: Number(vol.sales) || 0, salesAmountTotal: Number(vol.salesAmountTotal) || 0, job: Number(vol.job) || 0, sgm: Number(vol.sgm) || 0 },
        emp,
        commissionTiers,
        payrollBonusConfig.payrollBonusSchemes,
      )
      : createEmptyCommissionResult();
    const specialCommission = streetPromoterCommission + telesalesCommission;
    const calculatedCommission = commissionCalculationEnabled ? commResult.commissionTotal : 0;
    const hasAttendanceNoPay = attendanceNoPayDays > 0;
    const actualCommissionExceedsPackage = isPackageEmployee && calculatedCommission > packageCommissionAmount;
    const proratedPackageCommission = isPackageEmployee
      ? calculateProratedPackageCommission(packageCommissionAmount, attendanceRecord)
      : 0;
    const packageCommission = isPackageEmployee
      ? (!hasAttendanceNoPay
        ? Math.max(calculatedCommission, packageCommissionAmount)
        : actualCommissionExceedsPackage
          ? calculatedCommission
          : packageNoPayHandling === 'no_package'
            ? 0
            : packageNoPayHandling === 'pro_rate'
              ? Math.max(calculatedCommission, proratedPackageCommission)
              : Math.max(calculatedCommission, packageCommissionAmount))
      : calculatedCommission;
    const displayedCommission = packageCommission + specialCommission;
    const displayedBonus = fixedBonus + (commissionCalculationEnabled ? commResult.totalBonus : 0);
    const bonus = Math.round(displayedBonus * 100) / 100;
    const grossBase = calculatedBaseSalary + scaledAllowanceAmount + scaledTransportAllowance + bonus;
    const mpfApplicable = isMpfStatutorilyEligible(emp.dateOfBirth, emp.hireDate, payrollReferenceDate);
    const hasSecondaryPayout = Boolean(emp.payDaySecondary);
    const primaryPayoutGross = hasSecondaryPayout ? grossBase : grossBase + displayedCommission;
    const secondaryPayoutGross = hasSecondaryPayout ? displayedCommission : 0;
    const mpfRelevantFixedBonus = briefingBonus + attendanceBonus + bookingBonus + manualBonusMpfRelevant + shopBonus - manualDeductionMpfRelevant;
    const mpfRelevantDisplayedBonus = mpfRelevantFixedBonus + (commissionCalculationEnabled ? commResult.totalBonus : 0);
    const mpfRelevantBonus = Math.round(mpfRelevantDisplayedBonus * 100) / 100;
    const mpfRelevantGrossBase = calculatedBaseSalary + scaledAllowanceAmount + scaledTransportAllowance + mpfRelevantBonus;
    const mpfRelevantPrimaryGross = hasSecondaryPayout ? mpfRelevantGrossBase : mpfRelevantGrossBase + displayedCommission;
    const mpfRelevantSecondaryGross = hasSecondaryPayout ? displayedCommission : 0;
    const autoPrimaryMpfBasis = mpfApplicable ? roundMoney(mpfRelevantPrimaryGross * MPF_RATE) : 0;
    const autoSecondaryMpfBasis = mpfApplicable && hasSecondaryPayout ? roundMoney(mpfRelevantSecondaryGross * MPF_RATE) : 0;
    const calculatedMpf = mpfApplicable ? calcMpf(mpfRelevantPrimaryGross + mpfRelevantSecondaryGross) : 0;
    const mpfEe = monthlyMpf.mpfEeApplied
      ? (monthlyMpf.mpfEeManualOverride ? Number(monthlyMpf.mpfEeAmount) || 0 : calculatedMpf)
      : 0;
    const mpfEr = monthlyMpf.mpfErApplied
      ? (monthlyMpf.mpfErManualOverride ? Number(monthlyMpf.mpfErAmount) || 0 : calculatedMpf)
      : 0;
    const { primaryMpf, secondaryMpf } = !monthlyMpf.mpfEeApplied
      ? { primaryMpf: 0, secondaryMpf: 0 }
      : monthlyMpf.mpfEeDeductionMode === 'month_end'
        ? { primaryMpf: 0, secondaryMpf: 0 }
        : monthlyMpf.mpfEeManualOverride
          ? splitManualAmount(autoPrimaryMpfBasis, autoSecondaryMpfBasis, mpfEe, primaryPayoutGross, secondaryPayoutGross)
          : splitAutoCappedAmount(autoPrimaryMpfBasis, autoSecondaryMpfBasis, calculatedMpf);
    const monthEndMpf = monthlyMpf.mpfEeApplied && monthlyMpf.mpfEeDeductionMode === 'month_end' ? mpfEe : 0;
    const primaryPayoutNet = roundMoney(primaryPayoutGross - primaryMpf);
    const secondaryPayoutNet = roundMoney(secondaryPayoutGross - secondaryMpf);
    const net = grossBase + displayedCommission - mpfEe;
    return {
      ...emp,
      rawCalculatedBaseSalary,
      rawAllowanceAmount: emp.allowanceAmount,
      rawTransportAllowance: emp.transportAllowance,
      workedDays,
      workedHours,
      hasWorkedDays,
      hasWorkedHours,
      attendanceDrivenWorkedDays,
      hasLateDays,
      lateDays: attendanceRecord?.lateDays ?? 0,
      attendanceNoPayDays,
      attendanceNoPayDeduction,
      attendanceDeductionRemainder,
      packageNoPayHandling,
      hasAttendanceNoPay,
      actualCommissionExceedsPackage,
      proratedPackageCommission,
      isDailyEmployee,
      isHourlyEmployee,
      calculatedBaseSalary,
      allowanceAmount: scaledAllowanceAmount,
      transportAllowance: scaledTransportAllowance,
      rawBriefingBonus: rawBriefingBonus,
      briefingBonus,
      displayAttendanceBonus,
      rawAttendanceBonus: rawAttendanceBonus,
      attendanceBonus,
      rawBookingBonus: rawBookingBonus,
      bookingBonus,
      manualBonus,
      manualDeduction,
      totalDeduction,
      shopTargetAmount,
      shopActualSalesAmount,
      shopTargetPercent,
      shopBonus,
      isStreetPromoter,
      streetPromoterHeadcount,
      streetPromoterCommission,
      isTelesales,
      telesalesHeadcount,
      telesalesRatePerHead: telesalesCommissionResult.ratePerHead,
      telesalesCommission,
      fixedBonus,
      bonus,
      grossBase,
      mpfApplicable,
      mpfEe,
      mpfEr,
      monthEndMpf,
      net,
      commResult,
      hasCommission,
      hasSalesAmountCommission,
      isPackageEmployee,
      commissionCalculationEnabled,
      packageCommissionAmount,
      calculatedCommission,
      packageCommission,
      mpfRelevantIncome: roundMoney(mpfRelevantPrimaryGross + mpfRelevantSecondaryGross),
      calculatedMpf,
      monthlyMpf,
      displayedCommission,
      hasSecondaryPayout,
      primaryPayoutGross,
      secondaryPayoutGross,
      primaryMpf,
      secondaryMpf,
      primaryPayoutNet,
      secondaryPayoutNet,
    };
  });

  const totals = rows.reduce((acc, r) => ({
    base: acc.base + r.calculatedBaseSalary,
    allowance: acc.allowance + r.allowanceAmount + r.transportAllowance,
    bonus: acc.bonus + r.bonus,
    commission: acc.commission + r.displayedCommission,
    mpfEe: acc.mpfEe + r.mpfEe,
    mpfEr: acc.mpfEr + r.mpfEr,
    net: acc.net + r.net,
  }), { base: 0, allowance: 0, bonus: 0, commission: 0, mpfEe: 0, mpfEr: 0, net: 0 });

  const buildEntries = () => rows.map((r) => {
    const vol = getVolumes(r.employeeCode);
    const monthlyBonus = getMonthlyBonus(r.employeeCode, r);
    const manualDeductionApplied = monthlyBonus.manualDeductionApplied;
    const manualDeductionAmount = manualDeductionApplied ? Number(monthlyBonus.manualDeductionAmount) || 0 : 0;
    return {
      employeeCode: r.employeeCode,
      mpfEeApplied: r.monthlyMpf.mpfEeApplied,
      mpfEeDeductionMode: r.monthlyMpf.mpfEeDeductionMode,
      mpfEeAmount: r.mpfEe,
      mpfEeManualOverride: r.monthlyMpf.mpfEeManualOverride,
      mpfErApplied: r.monthlyMpf.mpfErApplied,
      mpfErAmount: r.mpfEr,
      mpfErManualOverride: r.monthlyMpf.mpfErManualOverride,
      workedDays: r.workedDays,
      workedHours: r.workedHours,
      redeemVolume: Number(vol.redeem) || 0,
      salesVolume: Number(vol.sales) || 0,
      salesAmountTotal: Number(vol.salesAmountTotal) || 0,
      salesAmountCommission: r.commissionCalculationEnabled ? r.commResult.salesAmount.amount : 0,
      jobAmount: Number(vol.job) || 0,
      sgmVolume: Number(vol.sgm) || 0,
      streetPromoterHeadcount: r.streetPromoterHeadcount,
      streetPromoterCommissionAmount: r.streetPromoterCommission,
      telesalesHeadcount: r.telesalesHeadcount,
      telesalesCommissionAmount: r.telesalesCommission,
      briefingBonusApplied: monthlyBonus.briefingApplied,
      briefingBonusAmount: monthlyBonus.briefingApplied ? Number(monthlyBonus.briefingAmount) || 0 : 0,
      attendanceBonusApplied: monthlyBonus.attendanceApplied,
      attendanceBonusAmount: monthlyBonus.attendanceApplied ? Number(monthlyBonus.attendanceAmount) || 0 : 0,
      bookingBonusApplied: monthlyBonus.bookingApplied,
      bookingBonusAmount: monthlyBonus.bookingApplied ? Number(monthlyBonus.bookingAmount) || 0 : 0,
      manualBonusApplied: monthlyBonus.manualBonusApplied,
      manualBonusAmount: monthlyBonus.manualBonusApplied ? Number(monthlyBonus.manualBonusAmount) || 0 : 0,
      manualBonusMpfIncluded: monthlyBonus.manualBonusMpfIncluded,
      manualDeductionApplied,
      manualDeductionAmount,
      manualDeductionMpfIncluded: monthlyBonus.manualDeductionMpfIncluded,
      shopTargetAmount: Number(monthlyBonus.shopTargetAmount) || 0,
      shopActualSalesAmount: Number(monthlyBonus.shopActualSalesAmount) || 0,
      shopTargetPercent: r.shopTargetPercent,
      shopBonusAmount: r.shopBonus,
      redeemCommission: r.commissionCalculationEnabled ? r.commResult.redeem.amount : 0,
      salesCommission: r.commissionCalculationEnabled ? r.commResult.sales.amount : 0,
      sgmCommission: r.commissionCalculationEnabled ? r.commResult.sgm.amount : 0,
      salesBonus: r.commissionCalculationEnabled ? r.commResult.salesBonus : 0,
      payrollBonus: r.commissionCalculationEnabled ? r.commResult.payrollBonus : 0,
      redeemBonus: r.commissionCalculationEnabled ? r.commResult.redeemBonus : 0,
      totalCommission: r.displayedCommission,
      packageNoPayHandling: r.isPackageEmployee && r.hasAttendanceNoPay && r.packageCommissionAmount > 0 ? r.packageNoPayHandling : null,
    };
  });

  const payslipExportEntries = rows.map((row): PayslipPdfEntry => ({
    employeeCode: row.employeeCode,
    employeeName: row.alias || row.nameZh,
    employeeTitle: row.positionNameZh ?? null,
    hkid: row.identityNumber ?? null,
    lateDays: row.lateDays,
    noPayDays: row.attendanceNoPayDays,
    branchName: row.branchName ?? null,
    selectedMonth,
    rawBaseSalary: row.rawCalculatedBaseSalary,
    rawAllowanceAmount: row.rawAllowanceAmount,
    rawTransportAllowance: row.rawTransportAllowance,
    calculatedBaseSalary: row.calculatedBaseSalary,
    allowanceAmount: row.allowanceAmount,
    transportAllowance: row.transportAllowance,
    rawBriefingBonus: row.rawBriefingBonus,
    briefingBonus: row.briefingBonus,
    displayAttendanceBonus: row.displayAttendanceBonus,
    rawAttendanceBonus: row.rawAttendanceBonus,
    attendanceBonus: row.attendanceBonus,
    rawBookingBonus: row.rawBookingBonus,
    bookingBonus: row.bookingBonus,
    manualBonus: row.manualBonus,
    manualDeduction: row.totalDeduction,
    shopBonus: row.shopBonus,
    redeemCommission: row.commResult.redeem.amount,
    salesCommission: row.commResult.sales.amount,
    sgmCommission: row.commResult.sgm.amount,
    salesAmountTotal: row.commResult.salesAmount.total,
    salesAmountRatePercent: row.commResult.salesAmount.ratePercent,
    salesAmountCommission: row.commResult.salesAmount.amount,
    jobCommission: row.commResult.job,
    streetPromoterCommission: row.streetPromoterCommission,
    telesalesCommission: row.telesalesCommission,
    salesBonus: row.commResult.salesBonus,
    payrollBonus: row.commResult.payrollBonus,
    redeemBonus: row.commResult.redeemBonus,
    packageCommissionAmount: row.packageCommissionAmount,
    packageCommission: row.packageCommission,
    isPackageEmployee: row.isPackageEmployee,
    actualCommissionExceedsPackage: row.actualCommissionExceedsPackage,
    grossAmount: roundMoney(row.grossBase + row.displayedCommission),
    mpfEe: row.mpfEe,
    mpfEr: row.mpfEr,
    netAmount: row.net,
    payDayPrimary: row.payDayPrimary,
    payDaySecondary: row.payDaySecondary,
    primaryPayoutGross: row.primaryPayoutGross,
    primaryMpf: row.primaryMpf,
    primaryPayoutNet: row.primaryPayoutNet,
    secondaryPayoutGross: row.secondaryPayoutGross,
    secondaryMpf: row.secondaryMpf,
    secondaryPayoutNet: row.secondaryPayoutNet,
    monthEndMpf: row.monthEndMpf,
    noPayLeaveDeduction: row.attendanceDeductionRemainder,
    adjustmentAmount: roundMoney(row.manualBonus - row.manualDeduction),
  }));

  const hasMeaningfulEntries = (entries: ReturnType<typeof buildEntries>) => entries.some((entry) => (
    entry.mpfEeApplied ||
    entry.mpfErApplied ||
    entry.mpfEeDeductionMode !== 'split' ||
    entry.mpfEeAmount > 0 ||
    entry.mpfErAmount > 0 ||
    entry.mpfEeManualOverride ||
    entry.mpfErManualOverride ||
    entry.workedDays > 0 ||
    entry.workedHours > 0 ||
    entry.redeemVolume > 0 ||
    entry.salesVolume > 0 ||
    entry.salesAmountTotal > 0 ||
    entry.salesAmountCommission > 0 ||
    entry.jobAmount > 0 ||
    entry.sgmVolume > 0 ||
    entry.streetPromoterHeadcount > 0 ||
    entry.streetPromoterCommissionAmount > 0 ||
    entry.telesalesHeadcount > 0 ||
    entry.telesalesCommissionAmount > 0 ||
    entry.briefingBonusApplied ||
    entry.attendanceBonusApplied ||
    entry.bookingBonusApplied ||
    entry.manualBonusApplied ||
    entry.manualBonusAmount > 0 ||
    entry.manualBonusMpfIncluded ||
    entry.manualDeductionApplied ||
    entry.manualDeductionAmount > 0 ||
    entry.manualDeductionMpfIncluded ||
    entry.shopTargetAmount > 0 ||
    entry.shopActualSalesAmount > 0 ||
    entry.shopTargetPercent > 0 ||
    entry.shopBonusAmount > 0 ||
    entry.redeemCommission > 0 ||
    entry.salesCommission > 0 ||
    entry.sgmCommission > 0 ||
    entry.salesBonus > 0 ||
    entry.payrollBonus > 0 ||
    entry.redeemBonus > 0 ||
    entry.totalCommission > 0
  ));

  const queueSaveStatusReset = () => {
    if (saveStatusTimeoutRef.current) {
      clearTimeout(saveStatusTimeoutRef.current);
    }

    saveStatusTimeoutRef.current = setTimeout(() => {
      setSaveStatus('idle');
      saveStatusTimeoutRef.current = null;
    }, 3000);
  };

  const queueExportStatusReset = () => {
    if (exportStatusTimeoutRef.current) {
      clearTimeout(exportStatusTimeoutRef.current);
    }

    exportStatusTimeoutRef.current = setTimeout(() => {
      setExportStatus('idle');
      exportStatusTimeoutRef.current = null;
    }, 3000);
  };

  const togglePayslipEmployee = (employeeCode: string) => {
    setSelectedPayslipCodes((current) => (
      current.includes(employeeCode)
        ? current.filter((code) => code !== employeeCode)
        : [...current, employeeCode]
    ));
  };

  const openPayslipModal = () => {
    setSelectedPayslipCodes(payslipExportEntries.map((entry) => entry.employeeCode));
    setIsPayslipModalOpen(true);
  };

  const closePayslipModal = () => {
    if (exportStatus === 'exporting') {
      return;
    }
    setIsPayslipModalOpen(false);
    setActivePayslipPdfEntry(null);
  };

  const waitForNextPaint = async () => {
    await new Promise<void>((resolve) => {
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => resolve());
      });
    });
  };

  const sanitizePdfFilePart = (value: string) => value
    .trim()
    .replace(/[\\/:*?"<>|]+/g, '-')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  const savePayslipPdf = async (entry: PayslipPdfEntry) => {
    setActivePayslipPdfEntry(entry);
    await waitForNextPaint();

    const target = payslipPdfCardRef.current;
    if (!target) {
      throw new Error('Payslip preview is unavailable.');
    }

    const canvas = await html2canvas(target, {
      scale: 2,
      backgroundColor: '#ffffff',
      useCORS: true,
    });

    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 10;
    const renderWidth = pageWidth - (margin * 2);
    const renderHeight = (canvas.height * renderWidth) / canvas.width;
    const pageContentHeight = pageHeight - (margin * 2);
    const image = canvas.toDataURL('image/png');

    let remainingHeight = renderHeight;
    let offsetY = 0;

    pdf.addImage(image, 'PNG', margin, offsetY + margin, renderWidth, renderHeight, undefined, 'FAST');
    remainingHeight -= pageContentHeight;

    while (remainingHeight > 0) {
      offsetY -= pageContentHeight;
      pdf.addPage();
      pdf.addImage(image, 'PNG', margin, offsetY + margin, renderWidth, renderHeight, undefined, 'FAST');
      remainingHeight -= pageContentHeight;
    }

    const safeName = sanitizePdfFilePart(entry.employeeName || entry.employeeCode) || entry.employeeCode;
    pdf.save(`payslip-${entry.selectedMonth}-${entry.employeeCode}-${safeName}.pdf`);
  };

  const persistEntries = (version: number, trigger: 'manual' | 'auto') => {
    const entries = buildEntries();

    if (!hasMeaningfulEntries(entries) && savedRecords.length === 0) {
      if (trigger === 'manual') {
        setSaveStatus('error');
        queueSaveStatusReset();
      }
      return;
    }

    setSaveStatus('saving');
    startTransition(async () => {
      const result = await saveMonthlyCommission(selectedMonth, entries);
      if (result.success) {
        if (latestEditVersionRef.current === version) {
          setEditVersion(0);
          latestEditVersionRef.current = 0;
        }
        setSaveStatus('saved');
      } else {
        setSaveStatus('error');
      }
      queueSaveStatusReset();
    });
  };

  const handleSave = () => {
    persistEntries(latestEditVersionRef.current, 'manual');
  };

  const handleExportPayslip = async () => {
    if (selectedPayslipCodes.length === 0) {
      setExportStatus('error');
      queueExportStatusReset();
      return;
    }

    setExportStatus('exporting');
    try {
      const selectedEntries = payslipExportEntries.filter((entry) => selectedPayslipCodes.includes(entry.employeeCode));

      for (const entry of selectedEntries) {
        await savePayslipPdf(entry);
      }

      setActivePayslipPdfEntry(null);
      setIsPayslipModalOpen(false);
      setExportStatus('idle');
      return;
    } catch (error) {
      console.error('[payroll export] unhandled:', error);
      setExportStatus('error');
    }

    setActivePayslipPdfEntry(null);
    queueExportStatusReset();
  };

  useEffect(() => {
    if (editVersion === 0) {
      return;
    }

    const timeout = setTimeout(() => {
      persistEntries(editVersion, 'auto');
    }, 900);

    return () => clearTimeout(timeout);
  }, [editVersion, selectedMonth]);

  const typeLabel = (type: string) => {
    const map: Record<string, string> = { redeem: t.tierCard.redeem, sales: t.tierCard.sales, sgm: t.tierCard.sgm };
    return map[type] ?? type;
  };

  const preventAccidentalNumberStep = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      event.preventDefault();
    }
  };

  const preventAccidentalNumberScroll = (event: WheelEvent<HTMLInputElement>) => {
    event.currentTarget.blur();
  };

  const inputClasses = 'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-[#D4AF37] focus:outline-none focus:ring-1 focus:ring-[#D4AF37]';
  const sectionCardClasses = 'rounded-xl border border-slate-200 bg-white p-3';
  const compactItemClasses = 'space-y-2 px-1 py-1';
  const toggleRowClasses = 'flex cursor-pointer items-center gap-3 px-1 py-1 text-sm font-medium text-slate-700';
  const subtleStatClasses = 'space-y-0.5 rounded-md bg-slate-50 px-2.5 py-2';
  const simpleRowClasses = 'grid gap-2 border-t border-slate-100 py-3 md:grid-cols-[minmax(0,1fr)_180px_140px] md:items-center';

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t.title}</h1>
          <p className="mt-1 text-sm text-slate-500">{t.subtitle}</p>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4 w-full">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex flex-col">
              <label className="mb-1 block text-xs font-medium text-slate-500">{t.month}</label>
              <input type="month" value={selectedMonth} onChange={(e) => handleMonthChange(e.target.value)} className="h-10 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-900 focus:border-[#D4AF37] focus:outline-none focus:ring-1 focus:ring-[#D4AF37]" />
            </div>
            <div className="flex flex-col pt-5">
              <button
                type="button"
                onClick={() => setIsAiChatbotOpen(true)}
                className="group relative flex h-10 items-center gap-2 overflow-hidden rounded-lg bg-gradient-to-r from-[#D4AF37] to-[#C5A028] px-4 font-semibold text-white shadow-md transition-all hover:scale-105 hover:shadow-lg active:scale-95"
              >
                <div className="absolute inset-0 bg-white/20 opacity-0 transition-opacity group-hover:opacity-100" />
                <span className="relative flex h-5 w-5 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                  <span className="h-2 w-2 animate-ping rounded-full bg-white opacity-75" />
                  <span className="absolute h-2 w-2 rounded-full bg-white" />
                </span>
                ✨ {t.aiImportTitle}
              </button>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleSave}
            disabled={isPending}
            className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium shadow-sm transition-colors ${
              saveStatus === 'saving' ? 'bg-slate-500 text-white' :
              saveStatus === 'saved' ? 'bg-emerald-500 text-white' :
              saveStatus === 'error' ? 'bg-rose-500 text-white' :
              'bg-[#D4AF37] text-white hover:bg-[#C5A028]'
            } disabled:opacity-50`}
          >
            <Save className="h-4 w-4" />
            {(isPending || saveStatus === 'saving') ? t.saving : saveStatus === 'saved' ? t.saved : saveStatus === 'error' ? t.saveFail : t.save}
          </button>
          <button
            type="button"
            onClick={openPayslipModal}
            disabled={exportStatus === 'exporting'}
            className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium shadow-sm transition-colors ${
              exportStatus === 'exporting' ? 'bg-slate-500 text-white' :
              exportStatus === 'error' ? 'bg-rose-500 text-white' :
              'bg-white text-slate-800 border border-slate-200 hover:border-[#D4AF37] hover:text-[#B38E18]'
            } disabled:opacity-50`}
          >
            <Download className="h-4 w-4" />
            {exportStatus === 'exporting' ? t.exportingPayslip : exportStatus === 'error' ? t.exportPayslipFail : t.exportPayslip}
          </button>
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-center shadow-sm">
            <div className="text-xs font-medium text-slate-500">{t.totals}</div>
            <div className="text-lg font-bold text-slate-900">{fmt(totals.net)}</div>
          </div>
          </div>
        </div>
      </div>

      {/* Payroll Table */}
      {rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-12 text-center">
          <CreditCard className="mx-auto mb-3 h-10 w-10 text-slate-300" />
          <p className="text-sm text-slate-500">{t.noData}</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <th className="px-3 py-3 w-8"></th>
                  <th className="px-3 py-3">{t.cols.code}</th>
                  <th className="px-3 py-3">{t.cols.name}</th>
                  <th className="px-3 py-3">{t.cols.branch}</th>
                  <th className="px-3 py-3 text-right">{t.cols.base}</th>
                  <th className="px-3 py-3 text-right">{t.cols.allowance}</th>
                  <th className="px-3 py-3 text-right">{t.cols.bonus}</th>
                  <th className="px-3 py-3 text-right">{t.cols.commission}</th>
                  <th className="px-3 py-3 text-right">{t.cols.mpfEe}</th>
                  <th className="px-3 py-3 text-right">{t.cols.mpfEr}</th>
                  <th className="px-3 py-3 text-right font-bold">{t.cols.net}</th>
                  <th className="px-3 py-3 text-center">{t.cols.payDay}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((row) => {
                  const isExpanded = expandedRows.has(row.employeeCode);
                  const vol = getVolumes(row.employeeCode);
                  const monthlyBonus = getMonthlyBonus(row.employeeCode, row);
                  const monthlyMpf = getMonthlyMpfState(row.employeeCode, row);
                  return (
                    <Fragment key={row.employeeCode}><tr className="transition-colors hover:bg-slate-50">
                      <td className="px-3 py-3">
                        <button type="button" onClick={() => toggleRow(row.employeeCode)} className="rounded p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
                          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </button>
                      </td>
                      <td className="px-3 py-3">
                        <Link href={`/app/people?id=${row.employeeCode}`} className="font-medium text-[#D4AF37] hover:underline">{row.employeeCode}</Link>
                      </td>
                      <td className="px-3 py-3 font-medium text-slate-900">{row.alias || row.nameZh}</td>
                      <td className="px-3 py-3 text-slate-600">{row.branchName ?? '—'}</td>
                      <td className="px-3 py-3 text-right tabular-nums text-slate-700">{fmt(row.calculatedBaseSalary)}</td>
                      <td className="px-3 py-3 text-right tabular-nums text-slate-700">{fmt(row.allowanceAmount + row.transportAllowance)}</td>
                      <td className="px-3 py-3 text-right tabular-nums text-slate-700">{fmt(row.bonus)}</td>
                      <td className="px-3 py-3 text-right tabular-nums text-[#D4AF37] font-semibold">{row.displayedCommission > 0 ? fmtDec(row.displayedCommission) : '—'}</td>
                      <td className="px-3 py-3 text-right tabular-nums text-slate-600">{row.mpfApplicable ? fmt(row.mpfEe) : '—'}</td>
                      <td className="px-3 py-3 text-right tabular-nums text-slate-600">{row.mpfApplicable ? fmt(row.mpfEr) : '—'}</td>
                      <td className="px-3 py-3 text-right tabular-nums font-bold text-slate-900">{fmt(row.net)}</td>
                      <td className="px-3 py-3 text-right text-slate-600">
                        <div className="inline-flex min-w-30 flex-col items-end gap-1 text-xs">
                          <div className="flex w-full items-center justify-between gap-3 rounded-md bg-slate-50 px-2 py-1">
                            <span className="font-medium text-slate-500">{row.payDayPrimary ? `${row.payDayPrimary}號` : '—'}</span>
                            <span className="font-semibold tabular-nums text-slate-900">{fmt(row.primaryPayoutNet)}</span>
                          </div>
                          <div className="flex w-full items-center justify-between gap-3 rounded-md bg-slate-50 px-2 py-1">
                            <span className="font-medium text-slate-500">{row.payDaySecondary ? `${row.payDaySecondary}號` : '—'}</span>
                            <span className="font-semibold tabular-nums text-slate-900">{row.hasSecondaryPayout ? fmt(row.secondaryPayoutNet) : '—'}</span>
                          </div>
                        </div>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr key={`${row.employeeCode}-comm`} className="bg-slate-50/70">
                        <td colSpan={12} className="px-6 py-4">
                          <div className="mb-3 flex justify-end">
                            <button
                              type="button"
                              onClick={() => void resyncEmployeeMonthFromDefaults(row.employeeCode)}
                              disabled={Boolean(resyncingCodes[row.employeeCode])}
                              className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-[#D4AF37] hover:text-[#B38E18]"
                            >
                              {resyncingCodes[row.employeeCode] ? t.saving : t.resyncMonthlySettings}
                            </button>
                          </div>
                          {row.isDailyEmployee || row.isHourlyEmployee ? (
                            <div className="mb-3 rounded-xl border border-slate-200 bg-white p-3">
                              <div className="mb-3 flex items-center gap-2">
                                <CreditCard className="h-4 w-4 text-[#D4AF37]" />
                                <span className="text-sm font-semibold text-slate-700">{t.commInput.salaryInputTitle}</span>
                              </div>
                              <div className="grid gap-3 lg:grid-cols-3">
                                {row.isDailyEmployee ? (
                                  <div>
                                    <label className="mb-1 block text-xs font-medium text-slate-500">{t.commInput.workedDays}</label>
                                    <input
                                      type="number"
                                      min="0"
                                      step="0.5"
                                      className={`${inputClasses} ${row.attendanceDrivenWorkedDays ? 'cursor-not-allowed bg-slate-100 text-slate-500' : ''}`}
                                      value={getWorkUnits(row.employeeCode).workedDays}
                                      onChange={(e) => setWorkUnit(row.employeeCode, 'workedDays', e.target.value)}
                                      onKeyDown={preventAccidentalNumberStep}
                                      onWheel={preventAccidentalNumberScroll}
                                      placeholder="0"
                                      disabled={row.attendanceDrivenWorkedDays}
                                      readOnly={row.attendanceDrivenWorkedDays}
                                    />
                                  </div>
                                ) : null}
                                {row.isHourlyEmployee ? (
                                  <div>
                                    <label className="mb-1 block text-xs font-medium text-slate-500">{t.commInput.workedHours}</label>
                                    <input
                                      type="number"
                                      min="0"
                                      step="0.5"
                                      className={inputClasses}
                                      value={getWorkUnits(row.employeeCode).workedHours}
                                      onChange={(e) => setWorkUnit(row.employeeCode, 'workedHours', e.target.value)}
                                      onKeyDown={preventAccidentalNumberStep}
                                      onWheel={preventAccidentalNumberScroll}
                                      placeholder="0"
                                    />
                                  </div>
                                ) : null}
                                <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-700">
                                  <div className="text-xs font-medium text-slate-500">{row.isDailyEmployee ? t.commInput.dailyRate : t.commInput.hourlyRate}</div>
                                  <div className="mt-1 font-semibold text-slate-900">{fmtDec(row.baseSalary)}</div>
                                  <div className="mt-3 text-xs font-medium text-slate-500">{t.commInput.calculatedBaseSalary}</div>
                                  <div className="mt-1 font-semibold text-slate-900">{(row.isDailyEmployee && !row.hasWorkedDays) || (row.isHourlyEmployee && !row.hasWorkedHours) ? '—' : fmtDec(row.calculatedBaseSalary)}</div>
                                </div>
                              </div>
                              <div className="mt-3 text-xs text-slate-500">{row.attendanceDrivenWorkedDays ? t.commInput.attendanceSourceWorkedDays : t.commInput.salaryInputRequired}</div>
                            </div>
                          ) : null}
                          {row.isPackageEmployee ? (
                            <div className="mb-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-700">
                              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                                <div>
                                  <div className="font-semibold">{t.commInput.packageEmployee}</div>
                                  <div className="mt-1 text-xs font-medium">{t.commInput.packageAppliedCommission}</div>
                                </div>
                              </div>
                              <div className="mt-3 grid gap-2 md:grid-cols-3">
                                <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">
                                  <div className="text-xs font-medium text-slate-500">{t.commInput.packageGuaranteedCommission}</div>
                                  <div className="mt-1 font-semibold text-slate-900">{fmtDec(row.packageCommissionAmount)}</div>
                                </div>
                                <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">
                                  <div className="text-xs font-medium text-slate-500">{t.commInput.packageCalculatedCommission}</div>
                                  <div className="mt-1 font-semibold text-slate-900">{fmtDec(row.calculatedCommission)}</div>
                                </div>
                                <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">
                                  <div className="text-xs font-medium text-slate-500">{t.commInput.packageAppliedCommission}</div>
                                  <div className="mt-1 font-semibold text-slate-900">{fmtDec(row.packageCommission)}</div>
                                </div>
                              </div>
                              {row.hasAttendanceNoPay ? (
                                <div className="mt-3 rounded-lg border border-amber-200 bg-white px-3 py-3">
                                  <div className="text-sm font-semibold text-slate-800">{t.commInput.packageNoPayTitle}</div>
                                  <div className="mt-1 text-xs text-slate-500">{t.commInput.attendanceNoPayDays}: {row.attendanceNoPayDays}</div>
                                  {row.actualCommissionExceedsPackage ? (
                                    <div className="mt-2 text-sm text-emerald-700">{t.commInput.packageNoPayAutoActual}</div>
                                  ) : row.packageCommissionAmount > 0 ? (
                                    <div className="mt-3 space-y-2 text-xs text-slate-500">
                                      <div>{t.commInput.packageNoPayAutoApplied}</div>
                                      <div>{t.commInput.packageNoPaySystemDefault}: {row.packageNoPayHandling === 'no_package' ? t.commInput.packageNoPayNoPackage : t.commInput.packageNoPayProRate}</div>
                                      <div>{t.commInput.packageNoPayProratedAmount}: {fmtDec(row.proratedPackageCommission)}</div>
                                      <div className="pt-1">{t.commInput.packageNoPayOverrideLabel}</div>
                                      <div className="flex flex-wrap gap-2">
                                        <button
                                          type="button"
                                          onClick={() => setPackageNoPayHandling(row.employeeCode, defaultPackageNoPayHandling)}
                                          className={`inline-flex items-center rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${row.packageNoPayHandling === defaultPackageNoPayHandling ? 'border-[#D4AF37] bg-amber-50 text-[#9a7411]' : 'border-slate-200 bg-white text-slate-700 hover:border-[#D4AF37] hover:text-[#B38E18]'}`}
                                        >
                                          {t.commInput.packageNoPayResetToDefault}
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => setPackageNoPayHandling(row.employeeCode, 'no_package')}
                                          className={`inline-flex items-center rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${row.packageNoPayHandling === 'no_package' ? 'border-rose-300 bg-rose-50 text-rose-700' : 'border-slate-200 bg-white text-slate-700 hover:border-rose-300 hover:text-rose-700'}`}
                                        >
                                          {t.commInput.packageNoPayNoPackage}
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => setPackageNoPayHandling(row.employeeCode, 'pro_rate')}
                                          className={`inline-flex items-center rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${row.packageNoPayHandling === 'pro_rate' ? 'border-emerald-300 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-white text-slate-700 hover:border-emerald-300 hover:text-emerald-700'}`}
                                        >
                                          {t.commInput.packageNoPayProRate}
                                        </button>
                                      </div>
                                    </div>
                                  ) : null}
                                </div>
                              ) : null}
                            </div>
                          ) : null}
                          {(row.hasCommission && row.commissionCalculationEnabled) || row.hasSalesAmountCommission || row.isStreetPromoter || row.isTelesales ? (
                            <>
                              <div className="mb-3 flex items-center gap-2">
                                <Calculator className="h-4 w-4 text-[#D4AF37]" />
                                <span className="text-sm font-semibold text-slate-700">{t.commInput.title}</span>
                                {row.hasCommission && row.commissionCalculationEnabled ? (
                                  <span className="ml-1 text-xs text-slate-400">— {t.commInput.method}: {row.commissionMethod === 'custom' ? (normalizeCustomCommissionName(row.commissionCustomName) || t.commInput.custom) : t.commInput.standard}</span>
                                ) : null}
                              </div>
                              <div className="space-y-3">
                                {row.hasCommission && row.commissionCalculationEnabled ? (
                                  <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                                    <div>
                                      <label className="mb-1 block text-xs font-medium text-slate-500">{t.commInput.redeemVol}</label>
                                      <input type="number" min="0" className={inputClasses} value={vol.redeem} onChange={(e) => setVolume(row.employeeCode, 'redeem', e.target.value)} placeholder="0" />
                                    </div>
                                    <div>
                                      <label className="mb-1 block text-xs font-medium text-slate-500">{t.commInput.salesVol}</label>
                                      <input type="number" min="0" className={inputClasses} value={vol.sales} onChange={(e) => setVolume(row.employeeCode, 'sales', e.target.value)} placeholder="0" />
                                    </div>
                                    <div>
                                      <label className="mb-1 block text-xs font-medium text-slate-500">{t.commInput.jobAmt}</label>
                                      <input type="number" min="0" className={inputClasses} value={vol.job} onChange={(e) => setVolume(row.employeeCode, 'job', e.target.value)} placeholder="0" />
                                    </div>
                                    <div>
                                      <label className="mb-1 block text-xs font-medium text-slate-500">{t.commInput.sgmVol}</label>
                                      <input type="number" min="0" className={inputClasses} value={vol.sgm} onChange={(e) => setVolume(row.employeeCode, 'sgm', e.target.value)} placeholder="0" />
                                    </div>
                                  </div>
                                ) : null}
                                {row.hasSalesAmountCommission ? (
                                  <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-3">
                                    <label className="mb-1 block text-xs font-medium text-slate-500">{t.commInput.salesAmountTotal}</label>
                                    <input type="number" min="0" className={inputClasses} value={vol.salesAmountTotal} onChange={(e) => setVolume(row.employeeCode, 'salesAmountTotal', e.target.value)} placeholder="0" />
                                    <div className="mt-2 text-xs text-slate-500">{t.commInput.salesAmountRatePercent}: {row.salesAmountRatePercent?.toFixed(2) ?? '0.00'}%</div>
                                  </div>
                                ) : null}
                                {(row.isStreetPromoter || row.isTelesales) ? (
                                  <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                                    {row.isStreetPromoter ? (
                                      <div>
                                        <label className="mb-1 block text-xs font-medium text-slate-500">{t.commInput.streetPromoterHeadcount}</label>
                                        <input type="number" min="0" className={inputClasses} value={vol.streetPromoterHeadcount} onChange={(e) => setVolume(row.employeeCode, 'streetPromoterHeadcount', e.target.value)} placeholder="0" />
                                        <div className="mt-1 text-xs text-slate-500">{t.commInput.streetPromoterCommission}: {row.streetPromoterCommission > 0 ? fmtDec(row.streetPromoterCommission) : '—'}</div>
                                      </div>
                                    ) : null}
                                    {row.isTelesales ? (
                                      <div>
                                        <label className="mb-1 block text-xs font-medium text-slate-500">{t.commInput.telesalesHeadcount}</label>
                                        <input type="number" min="0" className={inputClasses} value={vol.telesalesHeadcount} onChange={(e) => setVolume(row.employeeCode, 'telesalesHeadcount', e.target.value)} placeholder="0" />
                                        <div className="mt-1 text-xs text-slate-500">{t.commInput.telesalesCommission}: {row.telesalesCommission > 0 ? fmtDec(row.telesalesCommission) : '—'}</div>
                                      </div>
                                    ) : null}
                                  </div>
                                ) : null}
                              </div>
                            </>
                          ) : null}

                          <div className={`${sectionCardClasses} ${((row.hasCommission && row.commissionCalculationEnabled) || row.hasSalesAmountCommission || row.isStreetPromoter || row.isTelesales) ? 'mt-3' : ''}`}>
                            <div className="mb-3 flex items-center gap-2">
                              <TrendingUp className="h-4 w-4 text-[#D4AF37]" />
                              <span className="text-sm font-semibold text-slate-700">{t.commInput.monthlyBonusTitle}</span>
                            </div>
                            <div className="space-y-0">
                              {(row.briefingBonus > 0 || monthlyBonus.briefingApplied || Number(monthlyBonus.briefingAmount) > 0) ? (
                              <div className="grid gap-2 py-3 first:pt-0 md:grid-cols-[minmax(0,1fr)_140px] md:items-center md:border-t md:border-slate-100 md:first:border-t-0">
                                <div>
                                  <div className="text-sm font-medium text-slate-700">{t.commInput.briefingBonus}</div>
                                  <div className="text-xs text-slate-500">{t.commInput.defaultAmount}: {fmt(row.briefingBonus)}</div>
                                </div>
                                <label className={`${toggleRowClasses} justify-start md:justify-end`}>
                                  <input
                                    type="checkbox"
                                    checked={monthlyBonus.briefingApplied}
                                    onChange={(e) => {
                                      const nextApplied = e.target.checked;
                                      setMonthlyBonus(row.employeeCode, row, 'briefingApplied', nextApplied);
                                      if (nextApplied && !monthlyBonus.briefingAmount) {
                                        setMonthlyBonus(row.employeeCode, row, 'briefingAmount', row.rawBriefingBonus > 0 ? String(row.rawBriefingBonus) : '0');
                                      }
                                    }}
                                    className="h-4 w-4 rounded border-slate-300 text-[#D4AF37] focus:ring-[#D4AF37]"
                                  />
                                  <span>{t.commInput.applyThisMonth}</span>
                                </label>
                              </div>
                              ) : null}
                              {(row.attendanceBonus > 0 || monthlyBonus.attendanceApplied || Number(monthlyBonus.attendanceAmount) > 0) ? (
                              <div className="grid gap-2 border-t border-slate-100 py-3 md:grid-cols-[minmax(0,1fr)_140px] md:items-center">
                                <div>
                                  <div className="text-sm font-medium text-slate-700">{t.commInput.attendanceBonus}</div>
                                  <div className="text-xs text-slate-500">
                                    {t.commInput.defaultAmount}: {fmt(row.attendanceBonus)}
                                    {row.hasLateDays ? <span className="ml-1 text-amber-600">{t.commInput.attendanceLateDisabledNote}</span> : null}
                                  </div>
                                </div>
                                <label className={`${toggleRowClasses} justify-start md:justify-end`}>
                                  <input
                                    type="checkbox"
                                    checked={row.hasLateDays ? false : monthlyBonus.attendanceApplied}
                                    onChange={(e) => {
                                      if (row.hasLateDays) {
                                        setMonthlyBonus(row.employeeCode, row, 'attendanceApplied', false);
                                        return;
                                      }
                                      const nextApplied = e.target.checked;
                                      setMonthlyBonus(row.employeeCode, row, 'attendanceApplied', nextApplied);
                                      if (nextApplied && !monthlyBonus.attendanceAmount) {
                                        setMonthlyBonus(row.employeeCode, row, 'attendanceAmount', row.rawAttendanceBonus > 0 ? String(row.rawAttendanceBonus) : '0');
                                      }
                                    }}
                                    disabled={row.hasLateDays}
                                    className="h-4 w-4 rounded border-slate-300 text-[#D4AF37] focus:ring-[#D4AF37]"
                                  />
                                  <span>{t.commInput.applyThisMonth}</span>
                                </label>
                              </div>
                              ) : null}
                              {(row.bookingBonus > 0 || monthlyBonus.bookingApplied || Number(monthlyBonus.bookingAmount) > 0) ? (
                              <div className="grid gap-2 border-t border-slate-100 py-3 md:grid-cols-[minmax(0,1fr)_140px] md:items-center">
                                <div>
                                  <div className="text-sm font-medium text-slate-700">{t.commInput.bookingBonus}</div>
                                  <div className="text-xs text-slate-500">{t.commInput.defaultAmount}: {fmt(row.bookingBonus)}</div>
                                </div>
                                <label className={`${toggleRowClasses} justify-start md:justify-end`}>
                                  <input
                                    type="checkbox"
                                    checked={monthlyBonus.bookingApplied}
                                    onChange={(e) => {
                                      const nextApplied = e.target.checked;
                                      setMonthlyBonus(row.employeeCode, row, 'bookingApplied', nextApplied);
                                      if (nextApplied && !monthlyBonus.bookingAmount) {
                                        setMonthlyBonus(row.employeeCode, row, 'bookingAmount', row.rawBookingBonus > 0 ? String(row.rawBookingBonus) : '0');
                                      }
                                    }}
                                    className="h-4 w-4 rounded border-slate-300 text-[#D4AF37] focus:ring-[#D4AF37]"
                                  />
                                  <span>{t.commInput.applyThisMonth}</span>
                                </label>
                              </div>
                              ) : null}
                              <div className={simpleRowClasses}>
                                <div>
                                  <div className="text-sm font-medium text-slate-700">{t.commInput.manualBonus}</div>
                                  <div className="text-xs text-slate-500">{t.commInput.defaultAmount}: {fmt(Number(monthlyBonus.manualBonusAmount) || 0)}</div>
                                </div>
                                <input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  className={inputClasses}
                                  value={monthlyBonus.manualBonusAmount}
                                  onChange={(e) => setMonthlyBonus(row.employeeCode, row, 'manualBonusAmount', e.target.value)}
                                  onKeyDown={preventAccidentalNumberStep}
                                  onWheel={preventAccidentalNumberScroll}
                                  placeholder="0"
                                />
                                <div className="flex flex-col items-start gap-2 md:items-end">
                                  <label className={toggleRowClasses}>
                                    <input
                                      type="checkbox"
                                      checked={monthlyBonus.manualBonusApplied}
                                      onChange={(e) => {
                                        const nextApplied = e.target.checked;
                                        setMonthlyBonus(row.employeeCode, row, 'manualBonusApplied', nextApplied);
                                        if (nextApplied && !monthlyBonus.manualBonusAmount) {
                                          setMonthlyBonus(row.employeeCode, row, 'manualBonusAmount', '0');
                                        }
                                      }}
                                      className="h-4 w-4 rounded border-slate-300 text-[#D4AF37] focus:ring-[#D4AF37]"
                                    />
                                    <span>{t.commInput.applyThisMonth}</span>
                                  </label>
                                </div>
                              </div>
                              {row.attendanceDeductionRemainder > 0 ? (
                              <div className={simpleRowClasses}>
                                <div>
                                  <div className="text-sm font-medium text-slate-700">{t.commInput.attendanceNoPayRemainder}</div>
                                  <div className="text-xs text-slate-500">{t.commInput.attendanceNoPayRemainderDescription}</div>
                                  <div className="mt-1 text-xs text-amber-700">{t.commInput.attendanceRecordSourceNote}</div>
                                </div>
                                <input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  className={`${inputClasses} cursor-not-allowed bg-slate-100 text-slate-500`}
                                  value={String(row.attendanceDeductionRemainder)}
                                  onChange={() => undefined}
                                  placeholder="0"
                                  disabled
                                  readOnly
                                />
                                <div className="flex flex-col items-start gap-2 md:items-end">
                                  <div className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-medium text-slate-600">{t.commInput.attendanceNoPayDeduction}</div>
                                </div>
                              </div>
                              ) : null}
                              <div className={simpleRowClasses}>
                                <div>
                                  <div className="text-sm font-medium text-slate-700">{t.commInput.manualDeduction}</div>
                                  <div className="text-xs text-slate-500">{t.commInput.defaultAmount}: {fmt(Number(monthlyBonus.manualDeductionAmount) || 0)}</div>
                                </div>
                                <input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  className={inputClasses}
                                  value={monthlyBonus.manualDeductionAmount}
                                  onChange={(e) => setMonthlyBonus(row.employeeCode, row, 'manualDeductionAmount', e.target.value)}
                                  onKeyDown={preventAccidentalNumberStep}
                                  onWheel={preventAccidentalNumberScroll}
                                  placeholder="0"
                                />
                                <div className="flex flex-col items-start gap-2 md:items-end">
                                  <label className={toggleRowClasses}>
                                    <input
                                      type="checkbox"
                                      checked={monthlyBonus.manualDeductionApplied}
                                      onChange={(e) => {
                                        const nextApplied = e.target.checked;
                                        setMonthlyBonus(row.employeeCode, row, 'manualDeductionApplied', nextApplied);
                                        if (nextApplied && !monthlyBonus.manualDeductionAmount) {
                                          setMonthlyBonus(row.employeeCode, row, 'manualDeductionAmount', '0');
                                        }
                                      }}
                                      className="h-4 w-4 rounded border-slate-300 text-[#D4AF37] focus:ring-[#D4AF37]"
                                    />
                                    <span>{t.commInput.applyThisMonth}</span>
                                  </label>
                                </div>
                              </div>
                              {row.shopBonusEnabled ? (
                                <div className="border-t border-slate-100 py-3">
                                  <div className="mb-2 flex items-center justify-between gap-3">
                                    <span className="text-sm font-medium text-slate-700">{t.commInput.shopBonus}</span>
                                    <span className="text-xs text-slate-500">{t.commInput.defaultAmount}: {row.shopBonus > 0 ? fmtDec(row.shopBonus) : '—'}</span>
                                  </div>
                                  <div className="grid gap-3 md:grid-cols-2">
                                    <div>
                                      <label className="mb-1 block text-xs font-medium text-slate-500">{t.commInput.shopTargetAmount}</label>
                                      <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        className={inputClasses}
                                        value={monthlyBonus.shopTargetAmount}
                                        onChange={(e) => setMonthlyBonus(row.employeeCode, row, 'shopTargetAmount', e.target.value)}
                                        onKeyDown={preventAccidentalNumberStep}
                                        onWheel={preventAccidentalNumberScroll}
                                        placeholder="0"
                                      />
                                    </div>
                                    <div>
                                      <label className="mb-1 block text-xs font-medium text-slate-500">{t.commInput.shopActualSalesAmount}</label>
                                      <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        className={inputClasses}
                                        value={monthlyBonus.shopActualSalesAmount}
                                        onChange={(e) => setMonthlyBonus(row.employeeCode, row, 'shopActualSalesAmount', e.target.value)}
                                        onKeyDown={preventAccidentalNumberStep}
                                        onWheel={preventAccidentalNumberScroll}
                                        placeholder="0"
                                      />
                                    </div>
                                  </div>
                                  <div className="mt-2 text-xs font-medium text-slate-600">
                                    {t.commInput.shopTargetPercent}: {row.shopTargetPercent > 0 ? `${row.shopTargetPercent.toFixed(2)}%` : '—'}
                                  </div>
                                </div>
                              ) : null}
                            </div>
                          </div>

                          <div className={`mt-3 ${sectionCardClasses}`}>
                            <div className="mb-3 text-sm font-semibold text-slate-700">{t.mpfSectionTitle}</div>
                            {!row.mpfApplicable ? (
                              <div className="mb-3 text-xs font-medium text-slate-500">{t.mpf.notApplicable}</div>
                            ) : null}
                            <div className="mb-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-3">
                              <div className="text-xs font-medium text-slate-500">{t.commInput.mpfRelevantIncome}</div>
                              <div className="mt-1 text-lg font-semibold text-slate-900">{fmtDec(row.mpfRelevantIncome)}</div>
                            </div>
                            <div className="grid gap-4 lg:grid-cols-2">
                              <div>
                                <div className="mb-2 flex items-center justify-between gap-3">
                                  <span className="text-sm font-medium text-slate-700">{t.mpf.employee}</span>
                                  <span className="text-xs text-slate-500">{t.mpf.autoAmount}: {fmtDec(row.calculatedMpf)}</span>
                                </div>
                                <div className="space-y-2">
                                  <label className={toggleRowClasses}>
                                    <input
                                      type="checkbox"
                                      checked={monthlyMpf.mpfEeApplied}
                                      onChange={(e) => setMonthlyMpfState(row.employeeCode, row, { mpfEeApplied: e.target.checked })}
                                      className="h-4 w-4 rounded border-slate-300 text-[#D4AF37] focus:ring-[#D4AF37]"
                                    />
                                    <span>{t.mpf.applyThisMonth}</span>
                                  </label>
                                  <label className={toggleRowClasses}>
                                    <input
                                      type="checkbox"
                                      checked={monthlyMpf.mpfEeManualOverride}
                                      onChange={(e) => setMonthlyMpfState(row.employeeCode, row, {
                                        mpfEeManualOverride: e.target.checked,
                                        mpfEeAmount: e.target.checked ? (monthlyMpf.mpfEeAmount || String(row.mpfEe)) : '',
                                      })}
                                      className="h-4 w-4 rounded border-slate-300 text-[#D4AF37] focus:ring-[#D4AF37]"
                                    />
                                    <span>{t.mpf.manualAmount}</span>
                                  </label>
                                  {monthlyMpf.mpfEeManualOverride ? (
                                    <div>
                                      <label className="mb-1 block text-xs font-medium text-slate-500">{t.mpf.amount}</label>
                                      <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        className={inputClasses}
                                        value={monthlyMpf.mpfEeAmount}
                                        onChange={(e) => setMonthlyMpfState(row.employeeCode, row, { mpfEeAmount: e.target.value })}
                                        onKeyDown={preventAccidentalNumberStep}
                                        onWheel={preventAccidentalNumberScroll}
                                        placeholder="0"
                                      />
                                    </div>
                                  ) : null}
                                </div>
                              </div>

                              <div className="border-t border-slate-100 pt-4 lg:border-t-0 lg:border-l lg:border-slate-100 lg:pl-4 lg:pt-0">
                                <div className="mb-2 flex items-center justify-between gap-3">
                                  <span className="text-sm font-medium text-slate-700">{t.mpf.employer}</span>
                                  <span className="text-xs text-slate-500">{t.mpf.autoAmount}: {fmtDec(row.calculatedMpf)}</span>
                                </div>
                                <div className="space-y-2">
                                  <label className={toggleRowClasses}>
                                    <input
                                      type="checkbox"
                                      checked={monthlyMpf.mpfErApplied}
                                      onChange={(e) => setMonthlyMpfState(row.employeeCode, row, { mpfErApplied: e.target.checked })}
                                      className="h-4 w-4 rounded border-slate-300 text-[#D4AF37] focus:ring-[#D4AF37]"
                                    />
                                    <span>{t.mpf.applyThisMonth}</span>
                                  </label>
                                  <label className={toggleRowClasses}>
                                    <input
                                      type="checkbox"
                                      checked={monthlyMpf.mpfErManualOverride}
                                      onChange={(e) => setMonthlyMpfState(row.employeeCode, row, {
                                        mpfErManualOverride: e.target.checked,
                                        mpfErAmount: e.target.checked ? (monthlyMpf.mpfErAmount || String(row.mpfEr)) : '',
                                      })}
                                      className="h-4 w-4 rounded border-slate-300 text-[#D4AF37] focus:ring-[#D4AF37]"
                                    />
                                    <span>{t.mpf.manualAmount}</span>
                                  </label>
                                  {monthlyMpf.mpfErManualOverride ? (
                                    <div>
                                      <label className="mb-1 block text-xs font-medium text-slate-500">{t.mpf.amount}</label>
                                      <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        className={inputClasses}
                                        value={monthlyMpf.mpfErAmount}
                                        onChange={(e) => setMonthlyMpfState(row.employeeCode, row, { mpfErAmount: e.target.value })}
                                        onKeyDown={preventAccidentalNumberStep}
                                        onWheel={preventAccidentalNumberScroll}
                                        placeholder="0"
                                      />
                                    </div>
                                  ) : null}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className={`mt-3 ${sectionCardClasses}`}>
                            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                              <div className="flex items-center gap-2">
                                <CreditCard className="h-4 w-4 text-[#D4AF37]" />
                                <span className="text-sm font-semibold text-slate-700">{t.commInput.payoutScheduleTitle}</span>
                              </div>
                              {row.mpfApplicable ? (
                                <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-2 py-1">
                                  <span className="text-xs font-medium text-slate-500">{t.commInput.mpfDeductionMode}</span>
                                  <div className="inline-flex rounded-md border border-slate-200 bg-white p-0.5">
                                    <button
                                      type="button"
                                      onClick={() => setMonthlyMpfState(row.employeeCode, row, { mpfEeDeductionMode: 'split' })}
                                      className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${monthlyMpf.mpfEeDeductionMode === 'split' ? 'bg-[#D4AF37] text-white' : 'text-slate-600 hover:bg-slate-50'}`}
                                    >
                                      {t.commInput.mpfDeductionSplit}
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setMonthlyMpfState(row.employeeCode, row, { mpfEeDeductionMode: 'month_end' })}
                                      className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${monthlyMpf.mpfEeDeductionMode === 'month_end' ? 'bg-[#D4AF37] text-white' : 'text-slate-600 hover:bg-slate-50'}`}
                                    >
                                      {t.commInput.mpfDeductionMonthEnd}
                                    </button>
                                  </div>
                                </div>
                              ) : null}
                            </div>
                            <div className="mb-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-3">
                              <div className="text-xs font-medium text-slate-500">{t.commInput.mpfRelevantIncome}</div>
                              <div className="mt-1 text-lg font-semibold text-slate-900">{fmtDec(row.mpfRelevantIncome)}</div>
                            </div>
                            <div className="space-y-3">
                              <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3 last:border-b-0 last:pb-0">
                                <div>
                                  <div className="text-sm font-semibold text-slate-900">{t.commInput.primaryPayout} ({row.payDayPrimary ?? '—'}號)</div>
                                  <div className="mt-1 text-xs text-slate-500">{row.hasSecondaryPayout ? t.commInput.payoutBaseItems : t.commInput.payoutCombinedItems}</div>
                                </div>
                                <div className="grid min-w-55 grid-cols-3 gap-2 text-sm">
                                  <div className={subtleStatClasses}>
                                    <div className="text-xs text-slate-500">{t.commInput.payoutGross}</div>
                                    <div className="mt-1 font-semibold text-slate-900">{fmtDec(row.primaryPayoutGross)}</div>
                                  </div>
                                  <div className={subtleStatClasses}>
                                    <div className="text-xs text-slate-500">{t.commInput.payoutMpfDeduction}</div>
                                    <div className="mt-1 font-semibold text-slate-900">-{fmtDec(row.primaryMpf)}</div>
                                  </div>
                                  <div className={subtleStatClasses}>
                                    <div className="text-xs text-slate-500">{t.commInput.payoutNet}</div>
                                    <div className="mt-1 font-semibold text-slate-900">{fmtDec(row.primaryPayoutNet)}</div>
                                  </div>
                                </div>
                              </div>

                              {row.hasSecondaryPayout ? (
                                <div className="flex items-start justify-between gap-3">
                                  <div>
                                    <div className="text-sm font-semibold text-slate-900">{t.commInput.secondaryPayout} ({row.payDaySecondary ?? '—'}號)</div>
                                    <div className="mt-1 text-xs text-slate-500">{t.commInput.payoutCommissionItems}</div>
                                  </div>
                                  <div className="grid min-w-55 grid-cols-3 gap-2 text-sm">
                                    <div className={subtleStatClasses}>
                                      <div className="text-xs text-slate-500">{t.commInput.payoutGross}</div>
                                      <div className="mt-1 font-semibold text-slate-900">{fmtDec(row.secondaryPayoutGross)}</div>
                                    </div>
                                    <div className={subtleStatClasses}>
                                      <div className="text-xs text-slate-500">{t.commInput.payoutMpfDeduction}</div>
                                      <div className="mt-1 font-semibold text-slate-900">-{fmtDec(row.secondaryMpf)}</div>
                                    </div>
                                    <div className={subtleStatClasses}>
                                      <div className="text-xs text-slate-500">{t.commInput.payoutNet}</div>
                                      <div className="mt-1 font-semibold text-slate-900">{fmtDec(row.secondaryPayoutNet)}</div>
                                    </div>
                                  </div>
                                </div>
                              ) : null}

                              {row.monthEndMpf > 0 ? (
                                <div className="flex items-start justify-between gap-3 border-t border-dashed border-slate-200 pt-3">
                                  <div>
                                    <div className="text-sm font-semibold text-slate-900">{t.commInput.monthEndMpfDeduction}</div>
                                    <div className="mt-1 text-xs text-slate-500">{t.commInput.mpfDeductionMonthEnd}</div>
                                  </div>
                                  <div className="grid min-w-55 grid-cols-3 gap-2 text-sm">
                                    <div className={subtleStatClasses}>
                                      <div className="text-xs text-slate-500">{t.commInput.payoutGross}</div>
                                      <div className="mt-1 font-semibold text-slate-400">—</div>
                                    </div>
                                    <div className={subtleStatClasses}>
                                      <div className="text-xs text-slate-500">{t.commInput.payoutMpfDeduction}</div>
                                      <div className="mt-1 font-semibold text-slate-900">-{fmtDec(row.monthEndMpf)}</div>
                                    </div>
                                    <div className={subtleStatClasses}>
                                      <div className="text-xs text-slate-500">{t.commInput.payoutNet}</div>
                                      <div className="mt-1 font-semibold text-slate-900">-{fmtDec(row.monthEndMpf)}</div>
                                    </div>
                                  </div>
                                </div>
                              ) : null}
                            </div>
                          </div>

                          {(row.displayedCommission > 0 || row.commResult.total > 0 || row.commResult.salesAmount.amount > 0 || row.streetPromoterCommission > 0 || row.telesalesCommission > 0 || row.briefingBonus > 0 || row.attendanceBonus > 0 || row.bookingBonus > 0 || row.manualBonus > 0 || row.manualDeduction > 0 || row.shopBonus > 0) && (
                            <details className="mt-3 rounded-xl border border-slate-200 bg-white p-3">
                              <summary className="cursor-pointer list-none text-sm font-semibold text-slate-700">
                                {t.commInput.breakdown}
                              </summary>
                              <div className="mt-3 space-y-2">
                                <div className="grid grid-cols-2 gap-2 text-sm lg:grid-cols-5">
                                  <div className={subtleStatClasses}>
                                    <div className="text-xs text-slate-500">{t.commInput.payoutNet}</div>
                                    <div className="mt-1 font-semibold text-slate-900">{fmtDec(row.net)}</div>
                                  </div>
                                  {row.isPackageEmployee ? (
                                    <>
                                      <div className={subtleStatClasses}>
                                        <div className="text-xs text-slate-500">{t.commInput.packageCommissionAmount}</div>
                                        <div className="mt-1 font-semibold text-slate-900">{fmtDec(row.packageCommissionAmount)}</div>
                                      </div>
                                      <div className={subtleStatClasses}>
                                        <div className="text-xs text-slate-500">{t.commInput.packageCalculatedCommission}</div>
                                        <div className="mt-1 font-semibold text-slate-900">{fmtDec(row.calculatedCommission)}</div>
                                      </div>
                                      <div className={subtleStatClasses}>
                                        <div className="text-xs text-slate-500">{t.commInput.packageAppliedCommission}</div>
                                        <div className="mt-1 font-semibold text-slate-900">{fmtDec(row.packageCommission)}</div>
                                      </div>
                                    </>
                                  ) : null}
                                </div>

                                <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                                  {row.briefingBonus > 0 && (
                                    <div className="flex items-center justify-between rounded-lg bg-violet-50 px-2.5 py-1.5">
                                      <span className="text-violet-600 text-xs">{t.commInput.briefingBonus}</span>
                                      <span className="font-semibold tabular-nums text-violet-800">{fmtDec(row.briefingBonus)}</span>
                                    </div>
                                  )}
                                  {row.attendanceBonus > 0 && (
                                    <div className="flex items-center justify-between rounded-lg bg-sky-50 px-2.5 py-1.5">
                                      <span className="text-sky-600 text-xs">{t.commInput.attendanceBonus}</span>
                                      <span className="font-semibold tabular-nums text-sky-800">{fmtDec(row.attendanceBonus)}</span>
                                    </div>
                                  )}
                                  {row.bookingBonus > 0 && (
                                    <div className="flex items-center justify-between rounded-lg bg-cyan-50 px-2.5 py-1.5">
                                      <span className="text-cyan-600 text-xs">{t.commInput.bookingBonus}</span>
                                      <span className="font-semibold tabular-nums text-cyan-800">{fmtDec(row.bookingBonus)}</span>
                                    </div>
                                  )}
                                  {row.manualBonus > 0 && (
                                    <div className="flex items-center justify-between rounded-lg bg-rose-50 px-2.5 py-1.5">
                                      <span className="text-rose-600 text-xs">{t.commInput.manualBonus}</span>
                                      <span className="font-semibold tabular-nums text-rose-800">{fmtDec(row.manualBonus)}</span>
                                    </div>
                                  )}
                                  {row.manualDeduction > 0 && (
                                    <div className="flex items-center justify-between rounded-lg bg-slate-100 px-2.5 py-1.5">
                                      <span className="text-slate-600 text-xs">{t.commInput.manualDeduction}</span>
                                      <span className="font-semibold tabular-nums text-slate-900">-{fmtDec(row.manualDeduction)}</span>
                                    </div>
                                  )}
                                  {row.shopBonus > 0 && (
                                    <div className="flex items-center justify-between rounded-lg bg-orange-50 px-2.5 py-1.5">
                                      <span className="text-orange-600 text-xs">{t.commInput.shopBonus} @ {row.shopTargetPercent.toFixed(1)}%</span>
                                      <span className="font-semibold tabular-nums text-orange-800">{fmtDec(row.shopBonus)}</span>
                                    </div>
                                  )}
                                  {row.commResult.redeem.amount > 0 && (
                                    <div className="flex items-center justify-between rounded-lg bg-blue-50 px-2.5 py-1.5">
                                      <span className="text-blue-600 text-xs">{t.tierCard.redeem} @ {(row.commResult.redeem.rate * 100).toFixed(1)}%</span>
                                      <span className="font-semibold tabular-nums text-blue-800">{fmtDec(row.commResult.redeem.amount)}</span>
                                    </div>
                                  )}
                                  {row.commResult.sales.amount > 0 && (
                                    <div className="flex items-center justify-between rounded-lg bg-emerald-50 px-2.5 py-1.5">
                                      <span className="text-emerald-600 text-xs">{t.tierCard.sales} @ {(row.commResult.sales.rate * 100).toFixed(1)}%</span>
                                      <span className="font-semibold tabular-nums text-emerald-800">{fmtDec(row.commResult.sales.amount)}</span>
                                    </div>
                                  )}
                                  {row.commResult.salesAmount.amount > 0 && (
                                    <div className="flex items-center justify-between rounded-lg bg-green-50 px-2.5 py-1.5">
                                      <span className="text-green-700 text-xs">{t.commInput.salesAmountCommission} ({fmtDec(row.commResult.salesAmount.total)} x {row.commResult.salesAmount.ratePercent.toFixed(2)}%)</span>
                                      <span className="font-semibold tabular-nums text-green-900">{fmtDec(row.commResult.salesAmount.amount)}</span>
                                    </div>
                                  )}
                                  {row.commResult.job > 0 && (
                                    <div className="flex items-center justify-between rounded-lg bg-purple-50 px-2.5 py-1.5">
                                      <span className="text-purple-600 text-xs">Job</span>
                                      <span className="font-semibold tabular-nums text-purple-800">{fmtDec(row.commResult.job)}</span>
                                    </div>
                                  )}
                                  {row.streetPromoterCommission > 0 && (
                                    <div className="flex items-center justify-between rounded-lg bg-indigo-50 px-2.5 py-1.5">
                                      <span className="text-indigo-600 text-xs">{t.commInput.streetPromoterCommission} ({row.streetPromoterHeadcount})</span>
                                      <span className="font-semibold tabular-nums text-indigo-800">{fmtDec(row.streetPromoterCommission)}</span>
                                    </div>
                                  )}
                                  {row.telesalesCommission > 0 && (
                                    <div className="flex items-center justify-between rounded-lg bg-lime-50 px-2.5 py-1.5">
                                      <span className="text-lime-700 text-xs">{t.commInput.telesalesCommission} ({row.telesalesHeadcount} x {fmtDec(row.telesalesRatePerHead)})</span>
                                      <span className="font-semibold tabular-nums text-lime-900">{fmtDec(row.telesalesCommission)}</span>
                                    </div>
                                  )}
                                  {row.commResult.sgm.amount > 0 && (
                                    <div className="flex items-center justify-between rounded-lg bg-amber-50 px-2.5 py-1.5">
                                      <span className="text-amber-600 text-xs">{t.tierCard.sgm} @ {(row.commResult.sgm.rate * 100).toFixed(1)}%</span>
                                      <span className="font-semibold tabular-nums text-amber-800">{fmtDec(row.commResult.sgm.amount)}</span>
                                    </div>
                                  )}
                                  {row.commResult.salesBonus > 0 && (
                                    <div className="flex items-center justify-between rounded-lg bg-teal-50 px-2.5 py-1.5">
                                      <span className="text-teal-600 text-xs">{t.commInput.salesBonus} @ {((row.salesBonusRate ?? 0) * 100).toFixed(1)}%</span>
                                      <span className="font-semibold tabular-nums text-teal-800">{fmtDec(row.commResult.salesBonus)}</span>
                                    </div>
                                  )}
                                  {row.commResult.payrollBonus > 0 && (
                                    <div className="flex items-center justify-between rounded-lg bg-fuchsia-50 px-2.5 py-1.5">
                                      <span className="text-fuchsia-600 text-xs">{getPayrollBonusDisplayName(row, t.commInput)}</span>
                                      <span className="font-semibold tabular-nums text-fuchsia-800">{fmtDec(row.commResult.payrollBonus)}</span>
                                    </div>
                                  )}
                                  {row.commResult.redeemBonus > 0 && (
                                    <div className="flex items-center justify-between rounded-lg bg-rose-50 px-2.5 py-1.5">
                                      <span className="text-rose-600 text-xs">Redeem Bonus</span>
                                      <span className="font-semibold tabular-nums text-rose-800">{fmtDec(row.commResult.redeemBonus)}</span>
                                    </div>
                                  )}
                                  {row.isPackageEmployee && row.packageCommission > 0 && (
                                    <div className="flex items-center justify-between rounded-lg bg-yellow-50 px-2.5 py-1.5">
                                      <span className="text-yellow-700 text-xs">{t.commInput.packageAppliedCommission}</span>
                                      <span className="font-semibold tabular-nums text-yellow-900">{fmtDec(row.packageCommission)}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </details>
                          )}
                        </td>
                      </tr>
                    )}</Fragment>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-slate-200 bg-slate-50 font-semibold text-slate-900">
                  <td className="px-3 py-3"></td>
                  <td colSpan={3} className="px-3 py-3">{t.totals}</td>
                  <td className="px-3 py-3 text-right tabular-nums">{fmt(totals.base)}</td>
                  <td className="px-3 py-3 text-right tabular-nums">{fmt(totals.allowance)}</td>
                  <td className="px-3 py-3 text-right tabular-nums">{fmt(totals.bonus)}</td>
                  <td className="px-3 py-3 text-right tabular-nums text-[#D4AF37]">{totals.commission > 0 ? fmtDec(totals.commission) : '—'}</td>
                  <td className="px-3 py-3 text-right tabular-nums">{fmt(totals.mpfEe)}</td>
                  <td className="px-3 py-3 text-right tabular-nums">{fmt(totals.mpfEr)}</td>
                  <td className="px-3 py-3 text-right tabular-nums font-bold">{fmt(totals.net)}</td>
                  <td className="px-3 py-3"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {isPayslipModalOpen ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/45 px-4 py-6">
          <div className="w-full max-w-2xl rounded-3xl bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">{t.exportPayslipSelectTitle}</h2>
                <p className="mt-1 text-sm text-slate-500">{t.exportPayslipSelectDescription}</p>
                {exportStatus === 'error' ? <p className="mt-2 text-sm font-medium text-rose-600">{t.exportPayslipEmpty}</p> : null}
              </div>
              <button
                type="button"
                onClick={closePayslipModal}
                disabled={exportStatus === 'exporting'}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:border-slate-300 hover:text-slate-800 disabled:opacity-50"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex items-center justify-between gap-3 px-6 py-4">
              <div className="text-sm font-medium text-slate-600">{selectedPayslipCodes.length} / {payslipExportEntries.length}</div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedPayslipCodes(payslipExportEntries.map((entry) => entry.employeeCode))}
                  className="rounded-full border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:border-[#D4AF37] hover:text-[#B38E18]"
                >
                  {t.exportPayslipSelectAll}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedPayslipCodes([])}
                  className="rounded-full border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:border-[#D4AF37] hover:text-[#B38E18]"
                >
                  {t.exportPayslipClearAll}
                </button>
              </div>
            </div>
            <div className="max-h-[55vh] space-y-2 overflow-y-auto px-6 pb-4">
              {payslipExportEntries.map((entry) => {
                const checked = selectedPayslipCodes.includes(entry.employeeCode);
                return (
                  <label
                    key={entry.employeeCode}
                    className={`flex cursor-pointer items-center justify-between gap-4 rounded-2xl border px-4 py-3 transition ${
                      checked ? 'border-[#D4AF37] bg-amber-50/60' : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => togglePayslipEmployee(entry.employeeCode)}
                        className="h-4 w-4 rounded border-slate-300 text-[#D4AF37] focus:ring-[#D4AF37]"
                      />
                      <div>
                        <div className="text-sm font-semibold text-slate-900">{entry.employeeName}</div>
                        <div className="text-xs text-slate-500">{entry.employeeCode} · {entry.branchName ?? '—'}</div>
                      </div>
                    </div>
                    <div className="text-right text-xs text-slate-500">
                      <div>{fmtDec(entry.netAmount)}</div>
                      <div>{selectedMonth}</div>
                    </div>
                  </label>
                );
              })}
            </div>
            <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-6 py-5">
              <button
                type="button"
                onClick={closePayslipModal}
                disabled={exportStatus === 'exporting'}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 disabled:opacity-50"
              >
                {t.exportPayslipCancel}
              </button>
              <button
                type="button"
                onClick={() => void handleExportPayslip()}
                disabled={exportStatus === 'exporting' || selectedPayslipCodes.length === 0}
                className="inline-flex items-center gap-2 rounded-xl bg-[#D4AF37] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#C5A028] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Download className="h-4 w-4" />
                {exportStatus === 'exporting' ? t.exportingPayslip : t.exportPayslipConfirm}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {isAiChatbotOpen ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm transition-all sm:p-6">
          <div className="flex h-full w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-slate-50 shadow-2xl ring-1 ring-slate-200/50 sm:h-[80vh]">
            <div className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#B38E18] text-white shadow-sm">
                  ✨
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">AI Payroll Assistant</h2>
                  <p className="text-xs text-slate-500">{t.aiImportHint}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAiChatbotOpen(false)}
                className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] whitespace-pre-line rounded-2xl px-4 py-3 text-sm shadow-sm ${msg.role === 'user' ? 'bg-[#D4AF37] text-white rounded-br-none' : 'bg-white text-slate-800 border border-slate-100 rounded-bl-none'}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {importStatus === 'importing' && (
                <div className="flex justify-start">
                  <div className="max-w-[85%] rounded-2xl rounded-bl-none border border-slate-100 bg-white px-4 py-3 text-sm text-slate-500 shadow-sm">
                    <span className="flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#D4AF37] [animation-delay:-0.3s]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#D4AF37] [animation-delay:-0.15s]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#D4AF37]" />
                      <span className="ml-1">{t.aiImportUploading}</span>
                    </span>
                  </div>
                </div>
              )}
              {pendingPayrollImport ? (
                <div className="flex justify-start">
                  <div className="max-w-[96%] rounded-2xl rounded-bl-none border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-slate-800 shadow-sm">
                    <div className="font-semibold text-slate-900">
                      {lang === 'zh-CN' ? '请确认是否写入 Payroll' : lang === 'en' ? 'Confirm Payroll Import' : '請確認是否寫入 Payroll'}
                    </div>
                    <div className="mt-1 text-xs text-slate-600">
                      {lang === 'zh-CN'
                        ? `已成功匹配 ${pendingPayrollImport.parsedRows.filter((row) => resolveImportRowTarget(row)).length} 位员工。只需处理未匹配项目。`
                        : lang === 'en'
                          ? `${pendingPayrollImport.parsedRows.filter((row) => resolveImportRowTarget(row)).length} employees matched. Only unmatched items are shown.`
                          : `已成功匹配 ${pendingPayrollImport.parsedRows.filter((row) => resolveImportRowTarget(row)).length} 位員工。只顯示未匹配項目。`}
                    </div>
                    <div className="mt-3 rounded-xl border border-amber-200 bg-white/70 p-3">
                      <label className="mb-1 block text-xs font-semibold text-slate-600">
                        {lang === 'zh-CN' ? '目标月份' : lang === 'en' ? 'Target Month' : '目標月份'}
                      </label>
                      <input
                        type="month"
                        value={pendingPayrollImport.targetMonth ?? ''}
                        onChange={(event) => setPendingPayrollImport((prev) => prev ? { ...prev, targetMonth: event.target.value || undefined } : prev)}
                        className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-800 focus:border-[#D4AF37] focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                      />
                      {pendingPayrollImport.warnings.length > 0 ? (
                        <p className="mt-2 text-xs font-medium text-amber-700">
                          {pendingPayrollImport.warnings.length} 個 commission setup 提醒：
                        </p>
                      ) : null}
                      {pendingPayrollImport.warnings.length > 0 ? (
                        <div className="mt-2 max-h-28 overflow-auto rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                          {pendingPayrollImport.warnings.map((warning, index) => (
                            <div key={`${warning}-${index}`}>• {warning}</div>
                          ))}
                        </div>
                      ) : null}
                    </div>
                    {pendingPayrollImport.parsedRows.some((row) => row.excluded || !resolveImportRowTarget(row)) ? (
                    <div className="mt-3 max-h-80 overflow-auto rounded-xl border border-amber-200 bg-white">
                      <table className="min-w-full text-left text-xs">
                        <thead className="sticky top-0 bg-amber-100 text-slate-700">
                          <tr>
                            <th className="px-3 py-2 font-semibold">文件員工</th>
                            <th className="px-3 py-2 font-semibold">HRMS 匹配</th>
                            <th className="px-3 py-2 font-semibold text-right">Sales</th>
                            <th className="px-3 py-2 font-semibold text-right">業績</th>
                            <th className="px-3 py-2 font-semibold">操作</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {pendingPayrollImport.parsedRows.map((row, index) => ({ row, index })).filter(({ row }) => row.excluded || !resolveImportRowTarget(row)).map(({ row, index }) => {
                            const matchedEmployee = resolveImportRowTarget(row);
                            const candidates = getImportCandidates(row);
                            const matchedName = matchedEmployee ? (matchedEmployee.alias || matchedEmployee.nameZh) : null;
                            return (
                              <tr key={`${row.employeeCode}-${index}`} className={row.excluded ? 'bg-slate-50 text-slate-400' : matchedEmployee ? 'bg-white' : 'bg-rose-50/60'}>
                                <td className="px-3 py-2 align-top">
                                  <div className="font-semibold text-slate-900">{row.employeeCode}</div>
                                  <div>{row.sourceName || '—'}</div>
                                </td>
                                <td className="px-3 py-2 align-top">
                                  {row.excluded ? '已排除' : matchedEmployee ? `${matchedEmployee.employeeCode} ${matchedName ?? ''}` : '未匹配'}
                                </td>
                                <td className="px-3 py-2 text-right align-top tabular-nums">{row.sales ?? '—'}</td>
                                <td className="px-3 py-2 text-right align-top tabular-nums">{typeof row.sales === 'number' ? row.sales.toLocaleString('en-HK') : '—'}</td>
                                <td className="px-3 py-2 align-top">
                                  <div className="flex flex-wrap gap-1.5">
                                    {candidates.map((candidate) => (
                                      <button
                                        key={candidate.employeeCode}
                                        type="button"
                                        onClick={() => updatePendingImportRow(index, { targetEmployeeCode: candidate.employeeCode, excluded: false })}
                                        className="rounded-full border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700 hover:border-[#D4AF37] hover:text-[#9A7815]"
                                      >
                                        用 {candidate.employeeCode} {candidate.alias || candidate.nameZh}
                                      </button>
                                    ))}
                                    <button
                                      type="button"
                                      onClick={() => updatePendingImportRow(index, { excluded: !row.excluded })}
                                      className="rounded-full border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700 hover:border-slate-300"
                                    >
                                      {row.excluded ? '取消排除' : '排除'}
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                    ) : (
                      <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
                        所有員工已成功匹配，無需手動處理。
                      </div>
                    )}
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={confirmPendingPayrollImport}
                        disabled={!pendingPayrollImport.targetMonth}
                        className="rounded-full bg-[#D4AF37] px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[#C5A028] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {pendingPayrollImport.targetMonth
                          ? (lang === 'zh-CN' ? '确认导入' : lang === 'en' ? 'Confirm Import' : '確認匯入')
                          : (lang === 'zh-CN' ? '请先输入月份' : lang === 'en' ? 'Enter Month First' : '請先輸入月份')}
                      </button>
                      <button
                        type="button"
                        onClick={cancelPendingPayrollImport}
                        className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-slate-300"
                      >
                        {lang === 'zh-CN' ? '取消' : lang === 'en' ? 'Cancel' : '取消'}
                      </button>
                    </div>
                  </div>
                </div>
              ) : null}
              {lastPayrollImportRollback ? (
                <div className="flex justify-start">
                  <div className="max-w-[85%] rounded-2xl rounded-bl-none border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 shadow-sm">
                    <div className="font-semibold text-slate-900">可回復上次匯入</div>
                    <div className="mt-1 text-xs text-slate-600">
                      {lastPayrollImportRollback.fileName} / {lastPayrollImportRollback.targetMonth}
                    </div>
                    <button
                      type="button"
                      onClick={restoreLastPayrollImport}
                      className="mt-3 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-slate-300"
                    >
                      回復匯入前狀態
                    </button>
                  </div>
                </div>
              ) : null}
              <div ref={chatBottomRef} />
            </div>

            <div className="border-t border-slate-200 bg-white p-3">
              <div className="mx-auto flex w-full max-w-xl flex-col gap-2">
                <div className="flex items-center gap-2">
                  <label className="sr-only">{t.aiImportTypeLabel}</label>
                  <select
                    value={importType}
                    onChange={(e) => setImportType(e.target.value as 'all' | 'redeem' | 'sales' | 'job' | 'sgm')}
                    disabled={importStatus === 'importing'}
                    className="h-10 w-32 shrink-0 rounded-full border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-700 shadow-sm focus:border-[#D4AF37] focus:outline-none focus:ring-1 focus:ring-[#D4AF37] disabled:opacity-60 sm:w-36"
                  >
                    <option value="all">{t.aiImportTypeAll}</option>
                    <option value="redeem">{t.tierCard.redeem}</option>
                    <option value="sales">{t.tierCard.sales}</option>
                    <option value="job">Job</option>
                    <option value="sgm">{t.tierCard.sgm}</option>
                  </select>
                  <label className={`relative inline-flex h-10 shrink-0 cursor-pointer items-center gap-2 rounded-full border px-3 text-sm font-semibold shadow-sm transition-colors ${importStatus === 'importing' ? 'cursor-not-allowed border-slate-200 bg-slate-50 text-slate-400 opacity-60' : 'border-[#D4AF37]/40 bg-amber-50 text-[#9A7815] hover:border-[#D4AF37] hover:bg-amber-100'}`}>
                    <input
                      key={importKey}
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      disabled={importStatus === 'importing'}
                      onChange={(event) => {
                        const file = event.target.files?.[0] ?? null;
                        setSelectedPayrollImportFile(file);
                        if (file) {
                          setChatMessages((prev) => [...prev, {
                            role: 'user',
                            text: `已選擇檔案：${file.name}（類別：${importType}）。請按「傳送」開始分析。`,
                          }]);
                        }
                      }}
                      className="absolute inset-0 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
                    />
                    <Download className="h-4 w-4" />
                    <span>{lang === 'zh-CN' ? '上传' : lang === 'en' ? 'Upload' : '上載'}</span>
                  </label>
                  <span className="hidden text-xs text-slate-400 sm:inline">.xlsx, .csv</span>
                  {selectedPayrollImportFile ? <span className="truncate text-xs font-medium text-slate-500">{selectedPayrollImportFile.name}</span> : null}
                </div>
                <form onSubmit={handleAiChatSubmit} className="flex gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(event) => setChatInput(event.target.value)}
                    disabled={isChatSending || importStatus === 'importing'}
                    placeholder={selectedPayrollImportFile ? '已選檔案，按傳送開始分析' : (lang === 'zh-CN' ? '向 AI 发问，例如：这些数据有问题吗？' : lang === 'en' ? 'Ask AI about this import...' : '問 AI，例如：呢啲資料有冇問題？')}
                    className="h-11 min-w-0 flex-1 rounded-full border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 shadow-sm focus:border-[#D4AF37] focus:outline-none focus:ring-1 focus:ring-[#D4AF37] disabled:opacity-60"
                  />
                  <button
                    type="submit"
                    disabled={(!chatInput.trim() && !selectedPayrollImportFile) || isChatSending || importStatus === 'importing'}
                    className="h-11 rounded-full bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isChatSending ? (lang === 'en' ? 'Sending' : '傳送中') : (lang === 'en' ? 'Send' : '傳送')}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <div className="pointer-events-none fixed top-0 -z-10" style={{ left: '-9999px' }}>
        {activePayslipPdfEntry ? (
          <div ref={payslipPdfCardRef} style={{ width: '794px', backgroundColor: '#ffffff', color: '#000000', padding: '8px 30px 14px', fontFamily: 'Arial Unicode MS, Microsoft JhengHei, PingFang TC, sans-serif', fontSize: '10.5pt' }}>
            {(() => {
              const showPackageOnlyCommission = activePayslipPdfEntry.isPackageEmployee && !activePayslipPdfEntry.actualCommissionExceedsPackage;
              const allowanceTotal = roundMoney(activePayslipPdfEntry.rawAllowanceAmount + activePayslipPdfEntry.rawTransportAllowance);
              const discretionaryCommission = roundMoney(
                activePayslipPdfEntry.redeemCommission
                + activePayslipPdfEntry.salesAmountCommission
                + activePayslipPdfEntry.streetPromoterCommission
                + activePayslipPdfEntry.telesalesCommission
              );
              const extraBonus = roundMoney(activePayslipPdfEntry.payrollBonus + activePayslipPdfEntry.redeemBonus + activePayslipPdfEntry.shopBonus);
              const baseSalaryDeduction = roundMoney(Math.max(activePayslipPdfEntry.rawBaseSalary - activePayslipPdfEntry.calculatedBaseSalary, 0));
              const allowanceDeduction = roundMoney(Math.max(allowanceTotal - (activePayslipPdfEntry.allowanceAmount + activePayslipPdfEntry.transportAllowance), 0));
              const briefingDeduction = roundMoney(Math.max(activePayslipPdfEntry.rawBriefingBonus - activePayslipPdfEntry.briefingBonus, 0));
              const attendanceDeduction = roundMoney(Math.max(activePayslipPdfEntry.displayAttendanceBonus - activePayslipPdfEntry.attendanceBonus, 0));
              const bookingDeduction = roundMoney(Math.max(activePayslipPdfEntry.rawBookingBonus - activePayslipPdfEntry.bookingBonus, 0));
              const packageCommissionDeduction = showPackageOnlyCommission
                ? roundMoney(Math.max(activePayslipPdfEntry.packageCommissionAmount - activePayslipPdfEntry.packageCommission, 0))
                : 0;
              const hasLateAttendanceDeduction = activePayslipPdfEntry.lateDays > 0 && attendanceDeduction > 0;
              const lateLabel = hasLateAttendanceDeduction
                ? `Late - Diligent  遲到扣勤工獎 (${activePayslipPdfEntry.lateDays}日)`
                : activePayslipPdfEntry.lateDays > 0
                  ? `Late  遲到 (${activePayslipPdfEntry.lateDays}日)`
                  : 'Late  遲到';
              const noPayLabel = activePayslipPdfEntry.noPayDays > 0
                ? `No Pay Leave  無薪假 (${activePayslipPdfEntry.noPayDays}日)`
                : 'No Pay Leave  無薪假';
              const noPayDeductionSuffix = activePayslipPdfEntry.noPayDays > 0
                ? ` (${activePayslipPdfEntry.noPayDays}日)`
                : '';
              const attendanceDeductionRows: Array<[string, number]> = [
                [`No Pay Leave - Basic Salary  無薪假扣底薪${noPayDeductionSuffix}`, baseSalaryDeduction] as [string, number],
                [`No Pay Leave - Allowance  無薪假扣津貼${noPayDeductionSuffix}`, allowanceDeduction] as [string, number],
                [`No Pay Leave - Briefing Bonus  無薪假扣早會獎金${noPayDeductionSuffix}`, briefingDeduction] as [string, number],
                [`No Pay Leave - Booking Bonus  無薪假扣預約獎金${noPayDeductionSuffix}`, bookingDeduction] as [string, number],
              ].filter(([, value]) => value > 0);
              if (attendanceDeduction > 0 && !hasLateAttendanceDeduction) {
                attendanceDeductionRows.push([
                  `No Pay Leave - Diligent  無薪假扣勤工獎${noPayDeductionSuffix}`,
                  attendanceDeduction,
                ]);
              }
              if (packageCommissionDeduction > 0) {
                attendanceDeductionRows.push([
                  `No Pay Leave - Package Commission  無薪假扣包佣金額${noPayDeductionSuffix}`,
                  packageCommissionDeduction,
                ]);
              }
              const baseIncomeRows: Array<[string, number]> = [
                ['Basic Salary  底薪', activePayslipPdfEntry.rawBaseSalary],
                ['Allowance  車津貼', allowanceTotal],
                ['Diligent  勤工獎', activePayslipPdfEntry.displayAttendanceBonus],
                ['Briefing Bonus 早會獎金', activePayslipPdfEntry.rawBriefingBonus],
                ['Booking Bonus 預約獎金', activePayslipPdfEntry.rawBookingBonus],
              ];
              const commissionIncomeRows: Array<[string, number]> = showPackageOnlyCommission
                ? [['Package Commission  包佣金額', activePayslipPdfEntry.packageCommissionAmount]]
                : [
                  ['Shop Commission  店鋪佣金', activePayslipPdfEntry.salesCommission],
                  ['MGM Bonus  介紹獎金', activePayslipPdfEntry.sgmCommission],
                  ['Discretionary Commissionn  酌情佣金', discretionaryCommission],
                  ['Job Done Commission  手工工錢', activePayslipPdfEntry.jobCommission],
                ];
              const specialBonusLabel = showPackageOnlyCommission
                ? 'Discretionary Special Bonus  酌情特佣'
                : 'Job Done Special Bonus  手工部酌情特佣';
              const extraBonusLabel = showPackageOnlyCommission
                ? 'Extra Bonus '
                : 'Discretionary Special Bonus  酌情特佣';
              const incomeRows: Array<[string, number]> = [
                ...baseIncomeRows,
                ...commissionIncomeRows,
                [specialBonusLabel, activePayslipPdfEntry.salesBonus],
                [extraBonusLabel, extraBonus],
                ['SH/AL Commission  勞工假/大假平均佣金', 0],
                ['Other 其他', 0],
              ];
              const incomeSubtotal = roundMoney(incomeRows.reduce((sum, [, value]) => sum + value, 0));
              const deductionRows: Array<[string, number]> = [
                [lateLabel, hasLateAttendanceDeduction ? attendanceDeduction : 0],
                ...attendanceDeductionRows,
              ];
              if (activePayslipPdfEntry.noPayLeaveDeduction > 0) {
                deductionRows.push([`No Pay Leave - Remaining Deduction  無薪假餘額扣減${noPayDeductionSuffix}`, activePayslipPdfEntry.noPayLeaveDeduction]);
              }
              if (attendanceDeductionRows.length === 0 && activePayslipPdfEntry.noPayLeaveDeduction <= 0) {
                deductionRows.push([noPayLabel, activePayslipPdfEntry.noPayLeaveDeduction]);
              }
              const deductionSubtotal = roundMoney(deductionRows.reduce((sum, [, value]) => sum + value, 0));
              const adjustmentAmount = activePayslipPdfEntry.adjustmentAmount;
              const grandTotal = roundMoney(incomeSubtotal - deductionSubtotal + adjustmentAmount);
              const staffSalaryAfterMpf = roundMoney(grandTotal - activePayslipPdfEntry.mpfEe);
              const primaryAmount = activePayslipPdfEntry.primaryPayoutNet;
              const secondaryAmount = activePayslipPdfEntry.secondaryPayoutNet;
              const thirdAmount = 0;
              const paymentTotal = roundMoney(primaryAmount + secondaryAmount + thirdAmount);
              const underlineGap = '8px';
              const valueCell: React.CSSProperties = { padding: '1px 0', verticalAlign: 'middle', lineHeight: '15px', fontWeight: 400 };
              const labelCell: React.CSSProperties = { ...valueCell, whiteSpace: 'nowrap' };
              const amountCell: React.CSSProperties = { ...valueCell, textAlign: 'right', fontFamily: 'Arial Unicode MS, Arial, sans-serif', whiteSpace: 'nowrap', paddingRight: '8px' };
              const sectionCell: React.CSSProperties = {
                ...labelCell,
                fontWeight: 700,
                borderBottom: '2px solid #000',
                paddingBottom: underlineGap,
              };
              const ruleAmountCell = (): React.CSSProperties => ({
                ...amountCell,
                paddingTop: '0',
                paddingBottom: '0',
              });
              const ruledAmountStyle = (weight: 'thin' | 'medium' = 'medium', topBorder = false): React.CSSProperties => ({
                display: 'block',
                width: '100%',
                borderBottom: weight === 'medium' ? '2px solid #000' : '1px solid #000',
                borderTop: topBorder ? '1px solid #000' : 'none',
                padding: topBorder ? `${underlineGap} 0 ${underlineGap}` : `0 0 ${underlineGap}`,
                lineHeight: '15px',
              });
              const spacerRow = (height: string): React.ReactNode => (
                <tr>
                  <td colSpan={9} style={{ height, fontSize: 0, lineHeight: 0 }}></td>
                </tr>
              );

              return (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0px' }}>
                    <img src="/medimagic/medi-magic-logo.png" alt="Medi Magic logo" style={{ width: '116px', height: '116px', objectFit: 'contain' }} />
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
                    <colgroup>
                      <col style={{ width: '11.8%' }} />
                      <col style={{ width: '11.8%' }} />
                      <col style={{ width: '11.8%' }} />
                      <col style={{ width: '11.8%' }} />
                      <col style={{ width: '11.8%' }} />
                      <col style={{ width: '11.8%' }} />
                      <col style={{ width: '12.4%' }} />
                      <col style={{ width: '11.8%' }} />
                      <col style={{ width: '12.4%' }} />
                    </colgroup>
                    <tbody>
                      <tr>
                        <td colSpan={9} style={{ ...labelCell, fontWeight: 700, fontSize: '11pt', padding: '0 0 1px', textAlign: 'left' }}>Monthly Payslip 每月薪金單</td>
                      </tr>
                      <tr>
                        <td colSpan={9} style={{ ...labelCell, padding: '0 0 2px', textAlign: 'left' }}>(HKD)</td>
                      </tr>
                      <tr>
                        <td colSpan={2} style={labelCell}>For the month 月份:</td>
                        <td colSpan={3} style={valueCell}>{formatEnglishPayslipMonth(activePayslipPdfEntry.selectedMonth)}</td>
                        <td colSpan={4}></td>
                      </tr>
                      <tr>
                        <td colSpan={2} style={labelCell}>Staff Code  職員編號:</td>
                        <td colSpan={3} style={valueCell}>{activePayslipPdfEntry.employeeCode}</td>
                        <td colSpan={4}></td>
                      </tr>
                      <tr>
                        <td colSpan={2} style={labelCell}>HKID  香港身分證號碼:</td>
                        <td colSpan={3} style={valueCell}>{activePayslipPdfEntry.hkid ?? ''}</td>
                        <td colSpan={4}></td>
                      </tr>
                      <tr>
                        <td colSpan={2} style={labelCell}>Name  姓名:</td>
                        <td colSpan={3} style={valueCell}>{activePayslipPdfEntry.employeeName}</td>
                        <td colSpan={4}></td>
                      </tr>
                      <tr>
                        <td colSpan={2} style={labelCell}>Title  職位:</td>
                        <td colSpan={3} style={valueCell}>{activePayslipPdfEntry.employeeTitle ?? ''}</td>
                        <td colSpan={4}></td>
                      </tr>
                      {spacerRow('8px')}
                      <tr>
                        <td colSpan={6} style={sectionCell}>Income  收入</td>
                        <td colSpan={3}></td>
                      </tr>
                      {incomeRows.map(([label, value]) => (
                        <tr key={label}>
                          <td colSpan={6} style={labelCell}>{label}</td>
                          <td style={amountCell}></td>
                          <td style={amountCell}>{fmtPayslipAmount(value)}</td>
                          <td></td>
                        </tr>
                      ))}
                      <tr>
                        <td colSpan={7}></td>
                        <td colSpan={2} style={ruleAmountCell()}><div style={ruledAmountStyle()}>{fmtPayslipAmount(incomeSubtotal)}</div></td>
                      </tr>
                      {spacerRow('6px')}
                      <tr>
                        <td colSpan={6} style={sectionCell}>Deduction 扣除</td>
                        <td colSpan={3}></td>
                      </tr>
                      {deductionRows.map(([label, value]) => (
                        <tr key={label}>
                          <td colSpan={6} style={labelCell}>{label}</td>
                          <td style={amountCell}></td>
                          <td style={amountCell}>{fmtPayslipAmount(value)}</td>
                          <td></td>
                        </tr>
                      ))}
                      <tr>
                        <td colSpan={8}></td>
                        <td style={ruleAmountCell()}><div style={ruledAmountStyle()}>{fmtPayslipAmount(deductionSubtotal)}</div></td>
                      </tr>
                      <tr>
                        <td colSpan={6} style={labelCell}>This Month Grand Total  總額</td>
                        <td colSpan={2}></td>
                        <td style={amountCell}>{fmtPayslipAmount(roundMoney(incomeSubtotal - deductionSubtotal))}</td>
                      </tr>
                      <tr>
                        <td colSpan={6} style={labelCell}>Adjustment</td>
                        <td colSpan={2}></td>
                        <td style={amountCell}>{fmtPayslipAmount(adjustmentAmount)}</td>
                      </tr>
                      <tr>
                        <td colSpan={6} style={labelCell}>Grand Total  總額</td>
                        <td colSpan={2}></td>
                        <td style={amountCell}>{fmtPayslipAmount(grandTotal)}</td>
                      </tr>
                      {spacerRow('8px')}
                      <tr>
                        <td colSpan={6} style={labelCell}>Salary Before Deduct MPF Contribution  本月供款前有關入息</td>
                        <td style={amountCell}>{fmtPayslipAmount(grandTotal)}</td>
                        <td></td>
                        <td></td>
                      </tr>
                      <tr>
                        <td colSpan={6} style={labelCell}> MPF Contribution  強積金供款(僱主)</td>
                        <td style={amountCell}>{fmtPayslipAmount(activePayslipPdfEntry.mpfEr)}</td>
                        <td></td>
                        <td></td>
                      </tr>
                      <tr>
                        <td colSpan={6} style={labelCell}>Less: MPF Contribution  強積金供款(僱員)</td>
                        <td style={amountCell}>{fmtPayslipAmount(activePayslipPdfEntry.mpfEe)}</td>
                        <td></td>
                        <td></td>
                      </tr>
                      {spacerRow('8px')}
                      <tr>
                        <td colSpan={7} style={labelCell}>Staff Salary After Deduct Staff MPF Contribution  強積金供款後薪金</td>
                        <td colSpan={2} style={ruleAmountCell()}><div style={ruledAmountStyle()}>{fmtPayslipAmount(staffSalaryAfterMpf)}</div></td>
                      </tr>
                      <tr>
                        <td colSpan={9} style={{ borderBottom: '2px solid #000', height: underlineGap }}></td>
                      </tr>
                      <tr>
                        <td colSpan={6} style={{ ...labelCell, fontFamily: 'Arial Unicode MS, Arial, sans-serif' }}>Salary Paid On /Before 7th</td>
                        <td colSpan={2} style={{ ...labelCell, fontFamily: 'Arial Unicode MS, Arial, sans-serif' }}>Amount:</td>
                        <td style={amountCell}>{fmtPayslipAmount(primaryAmount)}</td>
                      </tr>
                      <tr>
                        <td colSpan={6} style={{ ...labelCell, fontFamily: 'Arial Unicode MS, Arial, sans-serif' }}>Salary Paid On /Before 20th</td>
                        <td colSpan={2} style={{ ...labelCell, fontFamily: 'Arial Unicode MS, Arial, sans-serif' }}>Amount:</td>
                        <td style={amountCell}>{fmtPayslipAmount(secondaryAmount)}</td>
                      </tr>
                      <tr>
                        <td colSpan={6} style={{ ...labelCell, fontFamily: 'Arial Unicode MS, Arial, sans-serif' }}>Salary Paid On /After 20th</td>
                        <td colSpan={2} style={{ ...labelCell, fontFamily: 'Arial Unicode MS, Arial, sans-serif' }}>Amount:</td>
                        <td style={ruleAmountCell()}><div style={ruledAmountStyle('thin')}>{fmtPayslipAmount(thirdAmount)}</div></td>
                      </tr>
                      <tr>
                        <td colSpan={8}></td>
                        <td style={ruleAmountCell()}><div style={ruledAmountStyle('medium', true)}>{fmtPayslipAmount(paymentTotal)}</div></td>
                      </tr>
                      {spacerRow('8px')}
                      <tr>
                        <td colSpan={9} style={labelCell}>Remarks 備註 :  </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              );
            })()}
          </div>
        ) : null}
      </div>
    </div>
  );
}
