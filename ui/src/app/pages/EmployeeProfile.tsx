"use client";

import { useEffect, useRef, useState, useTransition, type ChangeEvent, type FormEvent, type ReactNode } from 'react';
import { ArrowLeft, Award, Building2, Calendar, Download, Edit2, FileText, Landmark, Phone, Save, Search, ShieldCheck, Trash2, Upload, Wallet, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '../i18n/LanguageContext';
import type {
  CommissionRateTier,
  EmployeeDetailRecord,
  EmployeeDirectoryOption,
  SavedCommissionPresetRecord,
  SavedPayrollBonusPresetRecord,
  SavedShopCommissionPresetRecord,
} from '@/src/lib/employees/queries';
import { CUSTOM_COMMISSION_TYPES, type CustomCommissionTier } from '@/src/lib/employees/custom-commission';
import type { EmployeeDocumentType } from '@/src/lib/employees/document-storage';
import { calculateAge, calculateProbationEndDate, EMPLOYEE_EMPLOYMENT_TYPES } from '@/src/lib/employees/employment';
import { createLegacyPayrollBonusConfigCatalog, normalizePayrollBonusCustomName, normalizePayrollBonusTiers, normalizeShopBonusTiers, type PayrollBonusConfigCatalog, type PayrollBonusTier, type ShopBonusTier } from '@/src/lib/employees/payroll-bonus';
import { createCommissionRulesFromLegacyCustomTiers, createMoonIrisTaiWaiShopCommissionRules, getCommissionRuleConflictMessages, normalizeCommissionRules, serializeCommissionRules, type CommissionRule, type CommissionRuleMetric, type CommissionRuleType } from '@/src/lib/employees/commission-rules';
import { updateEmployee } from '@/app/app/people/actions';
import { deleteEmployeeDocument, uploadEmployeeDocument } from '@/app/app/people/document-actions';
import { createBrowserSupabaseClient } from '@/src/lib/supabase/client';

type EmployeeProfileProps = {
  employee: EmployeeDetailRecord;
  commissionTiers: CommissionRateTier[];
  savedCommissionPresets: SavedCommissionPresetRecord[];
  savedPayrollBonusPresets: SavedPayrollBonusPresetRecord[];
  savedShopCommissionPresets: SavedShopCommissionPresetRecord[];
  payrollBonusConfig: PayrollBonusConfigCatalog;
  options: {
    positions: EmployeeDirectoryOption[];
    banks: EmployeeDirectoryOption[];
    companies: EmployeeDirectoryOption[];
    branches: EmployeeDirectoryOption[];
  };
};

type FormState = {
  employeeCode: string;
  nameZh: string;
  nameEn: string;
  alias: string;
  gender: EmployeeDetailRecord['gender'];
  identityType: EmployeeDetailRecord['identityType'];
  identityNumber: string;
  dateOfBirth: string;
  address: string;
  phone: string;
  companyId: string;
  branchId: string;
  companyType: EmployeeDetailRecord['companyType'];
  employmentType: EmployeeDetailRecord['employmentType'];
  employmentStatus: EmployeeDetailRecord['employmentStatus'];
  positionId: string;
  hireDate: string;
  probationEndDate: string;
  employmentEndDate: string;
  terminationReason: string;
  finalPayrollMonth: string;
  notes: string;
  paymentMethod: NonNullable<EmployeeDetailRecord['paymentMethod']> | '';
  bankId: string;
  bankAccountNumber: string;
  probationMonths: string;
  annualLeaveDays: string;
  salaryType: NonNullable<EmployeeDetailRecord['salaryType']> | '';
  baseSalary: string;
  packageCommissionAmount: string;
  allowanceAmount: string;
  salaryEffectiveFrom: string;
  salaryRemarks: string;
  attendanceBonusEnabled: string;
  attendanceBonusAmount: string;
  transportAllowance: string;
  briefingBonus: string;
  bookingBonus: string;
  officeJobAmount: string;
  mpfEnabled: string;
  commissionMethod: string;
  commissionCustomName: string;
  commissionCustomTiers: string;
  commissionRules: string;
  commissionRedeemRate: string;
  commissionSalesRate: string;
  commissionSgmRate: string;
  salesAmountRatePercent: string;
  salesBonusEnabled: string;
  salesBonusRate: string;
  salesBonusCustomName: string;
  salesBonusCustomTiers: string;
  payrollBonusEnabled: string;
  payrollBonusScheme: string;
  streetPromoterEnabled: string;
  telesalesEnabled: string;
  shopBonusEnabled: string;
  shopBonusCustomName: string;
  shopBonusCustomTiers: string;
  shopBonusScheme: string;
  payrollIgnoreCommissionReview: string;
  payDayPrimary: string;
  payDaySecondary: string;
  commissionNotes: string;
  ir56bMaritalStatus: string;
  ir56bResAddressLine1: string;
  ir56bResAddressLine2: string;
  ir56bResAddressLine3: string;
  ir56bResAddressArea: string;
  ir56bPostalAddressLine1: string;
  ir56bPostalAddressLine2: string;
  ir56bPostalAddressLine3: string;
  ir56bPostalAddressArea: string;
  ir56bSpouseName: string;
  ir56bSpouseHkid: string;
  ir56bSpousePassport: string;
  ir56bPlaceOfResidenceIndicator: string;
  ir56bOverseasCompanyIndicator: string;
  ir56bRemarks: string;
};

const PRESET_VALUE_PREFIX = 'preset:';

function getPresetSelectValue(presetId: string) {
  return `${PRESET_VALUE_PREFIX}${presetId}`;
}

function extractPresetIdFromSelectValue(value: string | null | undefined) {
  if (!value || !value.startsWith(PRESET_VALUE_PREFIX)) {
    return null;
  }

  const presetId = value.slice(PRESET_VALUE_PREFIX.length).trim();
  return presetId.length > 0 ? presetId : null;
}

function isCustomSchemeSelection(value: string | null | undefined) {
  return value === 'custom' || Boolean(extractPresetIdFromSelectValue(value));
}

const translations = {
  'zh-TW': {
    back: '返回員工目錄',
    export: '匯出',
    edit: '編輯',
    editing: '編輯中',
    save: '儲存',
    saving: '儲存中...',
    cancel: '取消',
    emptyValue: '未填寫',
    success: '員工資料已更新。',
    errors: {
      generic: '更新失敗，請稍後再試。',
    },
    tabs: ['基本資料', '聘用資料', '出糧資料', '薪金資料', '佣金資料', '證書及合約', 'Visa', '報稅資料'],
    sections: {
      identity: '身份資料',
      personal: '個人資料',
      employment: '聘用資料',
      company: '公司資料',
      payroll: '出糧資料',
      bank: '銀行資料',
      salary: '薪金資料',
      summary: '薪酬摘要',
      commission: '佣金資料',
      commissionRateTable: '佣金比率表',
      documents: '證書及合約',
      visas: 'Visa 資料',
      monthlyBonusNote: 'Briefing、出勤獎金及 Booking 獎金會於「薪酬」按月份選擇是否發放；以下只設定預設金額。',
      salesAmountRateNote: '此項為額外佣金項目，按 Payroll 輸入的銷售總金額乘以此百分比計算，與佣金比率表無關。',
      salaryInputHintMonthly: '以每月固定金額儲存，Payroll 會直接當作月薪計算。',
      salaryInputHintDaily: '目前先儲存為日薪 rate；Payroll 暫未按工作天數自動換算。',
      salaryInputHintHourly: '目前先儲存為時薪 rate；Payroll 暫未按工作時數自動換算。',
      salaryInputHintPackage: '包佣包薪會分開設定包薪底薪及包佣金額；Payroll 會按較高者輸出佣金。',
    },
    profileMeta: {
      age: '年齡：{age} 歲',
      birthdayToday: '今天生日',
      birthdayUpcoming: '距離生日還有 {days} 天',
    },
    fields: {
      employeeCode: '員工編號',
      nameZh: '中文姓名',
      nameEn: '英文姓名',
      alias: '別名',
      gender: '性別',
      identityType: '證件類型',
      identityNumber: '證件號碼',
      dateOfBirth: '出生日期',
      address: '地址',
      phone: '電話',
      companyType: '公司類型',
      company: '所屬公司',
      branch: '分店',
      employmentType: '聘用類型',
      status: '員工狀態',
      position: '職位',
      hireDate: '入職日期',
      probationMonths: '試用期(月)',
      probationEndDate: '試用期完結日',
      employmentEndDate: '離職 / 合約完結日',
      terminationReason: '離職原因',
      finalPayrollMonth: '最後出糧月份',
      notes: '備註',
      annualLeaveDays: '大假天數',
      paymentMethod: '出糧方法',
      bank: '銀行',
      bankAccountNumber: '銀行戶口',
      salaryType: '薪金類型',
      baseSalary: '底薪',
      monthlyRate: '月薪',
      dailyRate: '日薪',
      hourlyRate: '時薪',
      packageBaseSalary: '包薪底薪',
      packageCommissionAmount: '包佣金額',
      allowanceAmount: '津貼',
      salaryEffectiveFrom: '生效日期',
      salaryRemarks: '備註',
      totalFixedCash: '固定現金合計',
      attendanceBonusEnabled: '出勤獎金',
      attendanceBonusAmount: '出勤獎金預設金額',
      transportAllowance: '交通津貼',
      briefingBonus: 'Briefing 獎金預設金額',
      bookingBonus: 'Booking 獎金預設金額',
      officeJobAmount: 'Job (Office) 預設金額',
      mpfEnabled: 'MPF 供款',
      commissionMethod: '佣金計算方式',
      commissionCustomName: '自訂佣金名稱',
      commissionRateSource: '佣金率說明',
      commissionRedeemRate: 'Redeem 佣金率',
      commissionSalesRate: 'Sales 佣金率',
      commissionSgmRate: 'SGM 佣金率',
      salesAmountRatePercent: '銷售金額比例 (%)',
      salesBonusEnabled: 'Sales Bonus',
      salesBonusRate: '自訂 Bonus 比率',
      salesBonusCustomName: '自訂 Bonus 名稱',
      payrollBonusEnabled: 'Sales Bonus',
      payrollBonusScheme: 'Bonus 類型',
      streetPromoterEnabled: '街霸佣金',
      telesalesEnabled: '電話銷售員佣金',
      payrollIgnoreCommissionReview: 'Payroll 無業績檢查忽略',
      shopBonusEnabled: '鋪數',
      shopBonusCustomName: '自訂鋪數名稱',
      shopBonusScheme: '鋪數類型',
      payDayPrimary: '出糧日（底薪）',
      payDaySecondary: '出糧日（佣金）',
      commissionNotes: '佣金備註',
      documentType: '類別',
      fileName: '檔案名稱',
      folder: '分類資料夾',
      expiryDate: '到期日',
      actions: '操作',
      visaType: 'Visa 類型',
      visaNumber: 'Visa 號碼',
      visaStatus: 'Visa 狀態',
      reminderDays: '提醒日數',
      noDocuments: '未有證書或合約紀錄。',
      noVisas: '未有 Visa 紀錄。',
    },
    documentTypes: {
      certificate: '證書',
      contract: '合約',
    },
    documentManager: {
      title: '上傳證書或合約',
      upload: '上傳',
      uploading: '上傳中...',
      delete: '刪除',
      deleting: '刪除中...',
      remarks: '備註',
      file: '選擇檔案',
      help: '檔案會按 公司 / 分店 / 員工 / 類型 自動分類入 folder。',
      expiryHint: '只有證書需要設定到期日，系統會於到期前 1 個月提醒。',
      uploadSuccess: '文件已上傳。',
      deleteSuccess: '文件已刪除。',
      fileRequired: '請先選擇要上傳的檔案。',
    },
    genders: {
      male: '男',
      female: '女',
      other: '其他',
    },
    identityTypes: {
      hkid: '身份證',
      passport: '護照',
      other: '其他',
    },
    companies: {
      ASA: 'ASA',
      ASAS: 'ASAS',
    },
    employmentTypes: {
      '全職': '全職',
      '兼職': '兼職',
      '自僱人士': '自僱人士',
    },
    statuses: {
      active: '在職',
      on_leave: '休假中',
      resigned: '已辭職',
      terminated: '已終止',
    },
    paymentMethods: {
      autopay: '自動轉帳',
      cash: '現金',
      cheque: '支票',
      fps: 'FPS',
    },
    salaryTypes: {
      monthly: '月薪',
      daily: '日薪',
      hourly: '時薪',
      package: '包佣包薪',
      street_promoter: '街霸',
    },
    commissionMethods: {
      standard: '標準佣金',
      none: '無佣金',
      custom: '自訂佣金 / BAR / Rate',
    },
    bankSearch: {
      placeholder: '搜尋銀行名稱或編號',
      empty: '找不到符合的銀行。',
      clear: '清除銀行選擇',
    },
    customCommissionEditor: {
      name: '自訂佣金名稱',
      namePlaceholder: '例如：美容師自訂佣金',
      editHint: '編輯表格會保留你目前輸入的次序；下方預覽會顯示儲存後的整理結果。',
      previewTitle: '整理後佣金預覽',
      conflictTitle: '發現級距衝突，請先修正',
      conflictRange: '{type} 第 {index} 行上限不能小於下限。',
      conflictOverlap: '{type} 第 {from} 行與第 {to} 行營業額範圍重疊。',
      conflictUnlimited: '{type} 第 {index} 行設為無上限後，後面不能再有其他級距。',
      type: '類型',
      minAmount: '營業額下限',
      maxAmount: '營業額上限',
      rate: '佣金比率',
      copyStandard: '複製標準佣金表',
      addTier: '新增級距',
      removeTier: '刪除',
      empty: '請至少設定一個佣金級距。',
    },
    tierCard: {
      type: '類型',
      range: '營業額範圍',
      rate: '比率',
      redeem: 'Redeem',
      sales: 'Sales',
      sgm: 'SGM',
      noLimit: '無上限',
      jobNote: '* Job 佣金由外部系統按月計算，不設固定比率。',
    },
    specialCommissionRules: {
      title: '特別佣金公式',
      streetPromoterTitle: '街霸',
      streetPromoterRule1: '30-40 人頭：HKD 5,000',
      streetPromoterRule2: '41-50 人頭：HKD 7,000',
      streetPromoterRule3: '51 人頭或以上：HKD 9,000',
      telesalesTitle: '電話銷售員',
      telesalesRule1: '40 人或以下：HKD 40 / 人',
      telesalesRule2: '41-80 人：HKD 50 / 人',
      telesalesRule3: '80 人以上：HKD 60 / 人',
      note: '以上兩項會在薪酬月結總覽按每月輸入人頭自動計算。',
    },
    payrollBonusNote: '啟用 Sales Bonus 後，可選 Bonus 1、Bonus 2 或自訂 Bonus；自訂 Bonus 可像 Bonus 1 一樣設定多個級距。',
    shopBonusNote: '鋪數係獨立額外項目，按每月 target 達成百分比計算；標準鋪數會用預設級距，自訂鋪數可自行設定級距。實際 target % 會在薪酬月結總覽逐月輸入。',
    payrollBonusSchemeOptions: {
      bonus_1: 'Bonus 1',
      bonus_2: 'Bonus 2',
      custom: '自訂 Bonus',
    },
    shopBonusSchemeOptions: {
      standard: '標準鋪數',
      custom: '自訂鋪數',
    },
    customBonusEditor: {
      name: '自訂 Bonus 名稱',
      namePlaceholder: '例如：特別 Sales Bonus',
      editHint: '編輯表格會保留你目前輸入的次序；下方預覽會顯示儲存後的整理結果。',
      previewTitle: '整理後 Bonus 預覽',
      conflictTitle: '發現 Bonus 級距衝突，請先修正',
      conflictDuplicate: '第 {from} 行與第 {to} 行的 Sales 門檻不能相同。',
      conflictOrder: '第 {from} 行與第 {to} 行的 Sales 門檻順序錯誤。',
      minSales: 'Sales 門檻',
      amount: 'Bonus 金額',
      copyStandard: '複製 Bonus 1 級距',
      addTier: '新增級距',
      removeTier: '刪除',
      empty: '請至少設定一個 Bonus 級距。',
    },
    customShopBonusEditor: {
      name: '自訂鋪數名稱',
      namePlaceholder: '例如：門店達標 Bonus',
      editHint: '鋪數按每月 target 達成百分比計算；下方預覽會顯示整理後的級距。',
      previewTitle: '整理後鋪數預覽',
      conflictTitle: '發現鋪數級距衝突，請先修正',
      conflictDuplicate: '第 {from} 行與第 {to} 行的 target 百分比不能相同。',
      conflictOrder: '第 {from} 行與第 {to} 行的 target 百分比順序錯誤。',
      minPercent: 'Target 百分比',
      amount: 'Bonus 金額',
      copyStandard: '複製標準鋪數級距',
      addTier: '新增級距',
      removeTier: '刪除',
      empty: '請至少設定一個鋪數級距。',
    },
    booleanLabels: {
      yes: '是',
      no: '否',
    },
  },
  'zh-CN': {
    back: '返回员工目录',
    export: '导出',
    edit: '编辑',
    editing: '编辑中',
    save: '保存',
    saving: '保存中...',
    cancel: '取消',
    emptyValue: '未填写',
    success: '员工资料已更新。',
    errors: {
      generic: '更新失败，请稍后再试。',
    },
    tabs: ['基本资料', '雇佣资料', '发薪资料', '薪金资料', '佣金资料', '证书及合同', 'Visa', '报税资料'],
    sections: {
      identity: '身份资料',
      personal: '个人资料',
      employment: '雇佣资料',
      company: '公司资料',
      payroll: '发薪资料',
      bank: '银行资料',
      salary: '薪金资料',
      summary: '薪酬摘要',
      commission: '佣金资料',
      commissionRateTable: '佣金比率表',
      documents: '证书及合同',
      visas: 'Visa 资料',
      monthlyBonusNote: 'Briefing、出勤奖金及 Booking 奖金会于“薪资与合规”按月份选择是否发放；以下只设定预设金额。',
      salesAmountRateNote: '此项为额外佣金项目，按 Payroll 输入的销售总金额乘以此百分比计算，与佣金比率表无关。',
      salaryInputHintMonthly: '以每月固定金额储存，Payroll 会直接当作月薪计算。',
      salaryInputHintDaily: '目前先储存为日薪 rate；Payroll 暂未按工作天数自动换算。',
      salaryInputHintHourly: '目前先储存为时薪 rate；Payroll 暂未按工作时数自动换算。',
      salaryInputHintPackage: '包佣包薪会分开设定包薪底薪及包佣金额；Payroll 会按较高者输出佣金。',
    },
    profileMeta: {
      age: '年龄：{age} 岁',
      birthdayToday: '今天生日',
      birthdayUpcoming: '距离生日还有 {days} 天',
    },
    fields: {
      employeeCode: '员工编号',
      nameZh: '中文姓名',
      nameEn: '英文姓名',
      alias: '别名',
      gender: '性别',
      identityType: '证件类型',
      identityNumber: '证件号码',
      dateOfBirth: '出生日期',
      address: '地址',
      phone: '电话',
      companyType: '公司类型',
      company: '所属公司',
      branch: '分店',
      employmentType: '雇佣类型',
      status: '员工状态',
      position: '职位',
      hireDate: '入职日期',
      probationMonths: '试用期(月)',
      probationEndDate: '试用期结束日',
      employmentEndDate: '离职 / 合同结束日',
      terminationReason: '离职原因',
      finalPayrollMonth: '最后发薪月份',
      notes: '备注',
      annualLeaveDays: '年假天数',
      paymentMethod: '发薪方式',
      bank: '银行',
      bankAccountNumber: '银行账户',
      salaryType: '薪金类型',
      baseSalary: '底薪',
      monthlyRate: '月薪',
      dailyRate: '日薪',
      hourlyRate: '时薪',
      packageBaseSalary: '包薪底薪',
      packageCommissionAmount: '包佣金额',
      allowanceAmount: '津贴',
      salaryEffectiveFrom: '生效日期',
      salaryRemarks: '备注',
      totalFixedCash: '固定现金合计',
      attendanceBonusEnabled: '出勤奖金',
      attendanceBonusAmount: '出勤奖金预设金额',
      transportAllowance: '交通津贴',
      briefingBonus: 'Briefing 奖金预设金额',
      bookingBonus: 'Booking 奖金预设金额',
      officeJobAmount: 'Job (Office) 预设金额',
      mpfEnabled: 'MPF 供款',
      commissionMethod: '佣金计算方式',
      commissionCustomName: '自定义佣金名称',
      commissionRateSource: '佣金率说明',
      commissionRedeemRate: 'Redeem 佣金率',
      commissionSalesRate: 'Sales 佣金率',
      commissionSgmRate: 'SGM 佣金率',
      salesAmountRatePercent: '销售金额比例 (%)',
      salesBonusEnabled: 'Sales Bonus',
      salesBonusRate: '自定义 Bonus 比率',
      salesBonusCustomName: '自定义 Bonus 名称',
      payrollBonusEnabled: 'Sales Bonus',
      payrollBonusScheme: 'Bonus 类型',
      streetPromoterEnabled: '街霸佣金',
      telesalesEnabled: '电话销售员佣金',
      payrollIgnoreCommissionReview: 'Payroll 无业绩检查忽略',
      shopBonusEnabled: '铺数',
      shopBonusCustomName: '自定义铺数名称',
      shopBonusScheme: '铺数类型',
      payDayPrimary: '发薪日（底薪）',
      payDaySecondary: '发薪日（佣金）',
      commissionNotes: '佣金备注',
      documentType: '类别',
      fileName: '文件名称',
      folder: '分类文件夹',
      expiryDate: '到期日',
      actions: '操作',
      visaType: 'Visa 类型',
      visaNumber: 'Visa 号码',
      visaStatus: 'Visa 状态',
      reminderDays: '提醒天数',
      noDocuments: '还没有证书或合同记录。',
      noVisas: '还没有 Visa 记录。',
    },
    documentTypes: {
      certificate: '证书',
      contract: '合同',
    },
    documentManager: {
      title: '上传证书或合同',
      upload: '上传',
      uploading: '上传中...',
      delete: '删除',
      deleting: '删除中...',
      remarks: '备注',
      file: '选择文件',
      help: '文件会按 公司 / 分店 / 员工 / 类型 自动分类到 folder。',
      expiryHint: '只有证书需要设置到期日，系统会于到期前 1 个月提醒。',
      uploadSuccess: '文件已上传。',
      deleteSuccess: '文件已删除。',
      fileRequired: '请先选择要上传的文件。',
    },
    genders: {
      male: '男',
      female: '女',
      other: '其他',
    },
    identityTypes: {
      hkid: '身份证',
      passport: '护照',
      other: '其他',
    },
    companies: {
      ASA: 'ASA',
      ASAS: 'ASAS',
    },
    employmentTypes: {
      '全職': '全职',
      '兼職': '兼职',
      '自僱人士': '自雇人士',
    },
    statuses: {
      active: '在职',
      on_leave: '休假中',
      resigned: '已离职',
      terminated: '已终止',
    },
    paymentMethods: {
      autopay: '自动转账',
      cash: '现金',
      cheque: '支票',
      fps: 'FPS',
    },
    salaryTypes: {
      monthly: '月薪',
      daily: '日薪',
      hourly: '时薪',
      package: '包佣包薪',
      street_promoter: '街霸',
    },
    commissionMethods: {
      standard: '标准佣金',
      none: '无佣金',
      custom: '自定义佣金 / BAR / Rate',
    },
    bankSearch: {
      placeholder: '搜索银行名称或编号',
      empty: '找不到符合的银行。',
      clear: '清除银行选择',
    },
    customCommissionEditor: {
      name: '自定义佣金名称',
      namePlaceholder: '例如：美容师自定义佣金',
      editHint: '编辑表格会保留你目前输入的顺序；下方预览会显示保存后的整理结果。',
      previewTitle: '整理后佣金预览',
      conflictTitle: '发现级距冲突，请先修正',
      conflictRange: '{type} 第 {index} 行上限不能小于下限。',
      conflictOverlap: '{type} 第 {from} 行与第 {to} 行营业额范围重叠。',
      conflictUnlimited: '{type} 第 {index} 行设为无上限后，后面不能再有其他级距。',
      type: '类型',
      minAmount: '营业额下限',
      maxAmount: '营业额上限',
      rate: '佣金比率',
      copyStandard: '复制标准佣金表',
      addTier: '新增级距',
      removeTier: '删除',
      empty: '请至少设置一个佣金级距。',
    },
    tierCard: {
      type: '类型',
      range: '营业额范围',
      rate: '比率',
      redeem: 'Redeem',
      sales: 'Sales',
      sgm: 'SGM',
      noLimit: '无上限',
      jobNote: '* Job 佣金由外部系统按月计算，不设固定比率。',
    },
    specialCommissionRules: {
      title: '特别佣金公式',
      streetPromoterTitle: '街霸',
      streetPromoterRule1: '30-40 人头：HKD 5,000',
      streetPromoterRule2: '41-50 人头：HKD 7,000',
      streetPromoterRule3: '51 人头或以上：HKD 9,000',
      telesalesTitle: '电话销售员',
      telesalesRule1: '40 人或以下：HKD 40 / 人',
      telesalesRule2: '41-80 人：HKD 50 / 人',
      telesalesRule3: '80 人以上：HKD 60 / 人',
      note: '以上两项会在薪酬月结总览按每月输入人头自动计算。',
    },
    payrollBonusNote: '启用 Sales Bonus 后，可选 Bonus 1、Bonus 2 或自定义 Bonus；自定义 Bonus 可像 Bonus 1 一样设置多个级距。',
    shopBonusNote: '铺数是独立额外项目，按每月 target 达成百分比计算；标准铺数会用预设级距，自定义铺数可自行设置级距。实际 target % 会在薪酬月结总览逐月输入。',
    payrollBonusSchemeOptions: {
      bonus_1: 'Bonus 1',
      bonus_2: 'Bonus 2',
      custom: '自定义 Bonus',
    },
    shopBonusSchemeOptions: {
      standard: '标准铺数',
      custom: '自定义铺数',
    },
    customBonusEditor: {
      name: '自定义 Bonus 名称',
      namePlaceholder: '例如：特别 Sales Bonus',
      editHint: '编辑表格会保留你目前输入的顺序；下方预览会显示保存后的整理结果。',
      previewTitle: '整理后 Bonus 预览',
      conflictTitle: '发现 Bonus 级距冲突，请先修正',
      conflictDuplicate: '第 {from} 行与第 {to} 行的 Sales 门槛不能相同。',
      conflictOrder: '第 {from} 行与第 {to} 行的 Sales 门槛顺序错误。',
      minSales: 'Sales 门槛',
      amount: 'Bonus 金额',
      copyStandard: '复制 Bonus 1 级距',
      addTier: '新增级距',
      removeTier: '删除',
      empty: '请至少设置一个 Bonus 级距。',
    },
    customShopBonusEditor: {
      name: '自定义铺数名称',
      namePlaceholder: '例如：门店达标 Bonus',
      editHint: '铺数按每月 target 达成百分比计算；下方预览会显示整理后的级距。',
      previewTitle: '整理后铺数预览',
      conflictTitle: '发现铺数级距冲突，请先修正',
      conflictDuplicate: '第 {from} 行与第 {to} 行的 target 百分比不能相同。',
      conflictOrder: '第 {from} 行与第 {to} 行的 target 百分比顺序错误。',
      minPercent: 'Target 百分比',
      amount: 'Bonus 金额',
      copyStandard: '复制标准铺数级距',
      addTier: '新增级距',
      removeTier: '删除',
      empty: '请至少设置一个铺数级距。',
    },
    booleanLabels: {
      yes: '是',
      no: '否',
    },
  },
  en: {
    back: 'Back to Employee Directory',
    export: 'Export',
    edit: 'Edit',
    editing: 'Editing',
    save: 'Save',
    saving: 'Saving...',
    cancel: 'Cancel',
    emptyValue: 'Not provided',
    success: 'Employee profile updated.',
    errors: {
      generic: 'Failed to update employee profile. Please try again later.',
    },
    tabs: ['Basic Info', 'Employment', 'Payroll', 'Salary', 'Commission', 'Certificates & Contracts', 'Visa', 'Tax Info'],
    sections: {
      identity: 'Identity',
      personal: 'Personal',
      employment: 'Employment',
      company: 'Company',
      payroll: 'Payroll',
      bank: 'Bank',
      salary: 'Salary',
      summary: 'Compensation Summary',
      commission: 'Commission',
      commissionRateTable: 'Commission Rate Table',
      documents: 'Certificates & Contracts',
      visas: 'Visa',
      monthlyBonusNote: 'Briefing, Attendance, and Booking bonuses are now decided month by month in Payroll & Compliance; this section only stores the default amounts.',
      salesAmountRateNote: 'This is an extra commission item. Payroll multiplies the monthly sales amount by this percentage, and it does not depend on the commission rate table.',
      salaryInputHintMonthly: 'Stored as a fixed monthly amount. Payroll currently treats this as the monthly salary.',
      salaryInputHintDaily: 'Stored as a daily rate for now. Payroll does not yet auto-convert it by worked days.',
      salaryInputHintHourly: 'Stored as an hourly rate for now. Payroll does not yet auto-convert it by worked hours.',
      salaryInputHintPackage: 'Inclusive salary stores a package base salary and a guaranteed package commission floor. Payroll uses whichever commission amount is higher.',
    },
    profileMeta: {
      age: 'Age: {age}',
      birthdayToday: 'Birthday today',
      birthdayUpcoming: '{days} days until next birthday',
    },
    fields: {
      employeeCode: 'Employee Code',
      nameZh: 'Chinese Name',
      nameEn: 'English Name',
      alias: 'Alias',
      gender: 'Gender',
      identityType: 'Document Type',
      identityNumber: 'Document Number',
      dateOfBirth: 'Date of Birth',
      address: 'Address',
      phone: 'Phone',
      companyType: 'Company Type',
      company: 'Company',
      branch: 'Branch',
      employmentType: 'Employment Type',
      status: 'Status',
      position: 'Position',
      hireDate: 'Hire Date',
      probationMonths: 'Probation (Months)',
      probationEndDate: 'Probation End Date',
      employmentEndDate: 'Employment End Date',
      terminationReason: 'Termination Reason',
      finalPayrollMonth: 'Final Payroll Month',
      notes: 'Notes',
      annualLeaveDays: 'Annual Leave Days',
      paymentMethod: 'Payment Method',
      bank: 'Bank',
      bankAccountNumber: 'Bank Account Number',
      salaryType: 'Salary Type',
      baseSalary: 'Base Salary',
      monthlyRate: 'Monthly Salary',
      dailyRate: 'Daily Rate',
      hourlyRate: 'Hourly Rate',
      packageBaseSalary: 'Package Base Salary',
      packageCommissionAmount: 'Package Commission Amount',
      allowanceAmount: 'Allowance',
      salaryEffectiveFrom: 'Effective From',
      salaryRemarks: 'Remarks',
      totalFixedCash: 'Fixed Cash Total',
      attendanceBonusEnabled: 'Attendance Bonus',
      attendanceBonusAmount: 'Attendance Bonus Default Amount',
      transportAllowance: 'Transport Allowance',
      briefingBonus: 'Briefing Bonus Default Amount',
      bookingBonus: 'Booking Bonus Default Amount',
      officeJobAmount: 'Job (Office) Default Amount',
      mpfEnabled: 'MPF Contribution',
      commissionMethod: 'Commission Method',
      commissionCustomName: 'Custom Commission Name',
      commissionRateSource: 'Commission Rate Source',
      commissionRedeemRate: 'Redeem Commission Rate',
      commissionSalesRate: 'Sales Commission Rate',
      commissionSgmRate: 'SGM Commission Rate',
      salesAmountRatePercent: 'Sales Amount Rate (%)',
      salesBonusEnabled: 'Sales Bonus',
      salesBonusRate: 'Custom Bonus Rate',
      salesBonusCustomName: 'Custom Bonus Name',
      payrollBonusEnabled: 'Sales Bonus',
      payrollBonusScheme: 'Bonus Type',
      streetPromoterEnabled: 'Street Promoter Commission',
      telesalesEnabled: 'Telesales Commission',
      payrollIgnoreCommissionReview: 'Ignore Payroll No Performance Check',
      shopBonusEnabled: 'Shop Bonus',
      shopBonusCustomName: 'Custom Shop Bonus Name',
      shopBonusScheme: 'Shop Bonus Type',
      payDayPrimary: 'Pay Day (Salary)',
      payDaySecondary: 'Pay Day (Commission)',
      commissionNotes: 'Commission Notes',
      documentType: 'Type',
      fileName: 'File Name',
      folder: 'Folder',
      expiryDate: 'Expiry Date',
      actions: 'Actions',
      visaType: 'Visa Type',
      visaNumber: 'Visa Number',
      visaStatus: 'Visa Status',
      reminderDays: 'Reminder Days',
      noDocuments: 'No certificate or contract records yet.',
      noVisas: 'No visa records yet.',
    },
    documentTypes: {
      certificate: 'Certificate',
      contract: 'Contract',
    },
    documentManager: {
      title: 'Upload Certificate or Contract',
      upload: 'Upload',
      uploading: 'Uploading...',
      delete: 'Delete',
      deleting: 'Deleting...',
      remarks: 'Remarks',
      file: 'Select File',
      help: 'Files are automatically grouped by company / branch / employee / type folders.',
      expiryHint: 'Only certificates need an expiry date. The system alerts 1 month before expiry.',
      uploadSuccess: 'Document uploaded.',
      deleteSuccess: 'Document deleted.',
      fileRequired: 'Please select a file to upload.',
    },
    genders: {
      male: 'Male',
      female: 'Female',
      other: 'Other',
    },
    identityTypes: {
      hkid: 'HKID',
      passport: 'Passport',
      other: 'Other',
    },
    companies: {
      ASA: 'ASA',
      ASAS: 'ASAS',
    },
    employmentTypes: {
      '全職': 'Full Time',
      '兼職': 'Part Time',
      '自僱人士': 'Self-employed',
    },
    statuses: {
      active: 'Active',
      on_leave: 'On Leave',
      resigned: 'Resigned',
      terminated: 'Terminated',
    },
    paymentMethods: {
      autopay: 'Autopay',
      cash: 'Cash',
      cheque: 'Cheque',
      fps: 'FPS',
    },
    salaryTypes: {
      monthly: 'Monthly',
      daily: 'Daily',
      hourly: 'Hourly',
      package: 'Inclusive Salary + Commission',
      street_promoter: 'Street Promoter',
    },
    commissionMethods: {
      standard: 'Standard',
      none: 'None',
      custom: 'Custom Commission / BAR / Rate',
    },
    bankSearch: {
      placeholder: 'Search bank name or code',
      empty: 'No matching banks found.',
      clear: 'Clear bank selection',
    },
    customCommissionEditor: {
      name: 'Custom Commission Name',
      namePlaceholder: 'For example: Therapist Custom Commission',
      editHint: 'The table keeps your current row order while editing. The preview below shows how it will be organized after saving.',
      previewTitle: 'Organized Commission Preview',
      conflictTitle: 'Tier conflicts detected. Please fix them first.',
      conflictRange: '{type} row {index} has a maximum amount lower than its minimum.',
      conflictOverlap: '{type} rows {from} and {to} have overlapping volume ranges.',
      conflictUnlimited: '{type} row {index} is unlimited, so it must be the last tier.',
      type: 'Type',
      minAmount: 'Minimum Volume',
      maxAmount: 'Maximum Volume',
      rate: 'Rate',
      copyStandard: 'Copy Standard Commission Table',
      addTier: 'Add Tier',
      removeTier: 'Remove',
      empty: 'Add at least one commission tier.',
    },
    tierCard: {
      type: 'Type',
      range: 'Volume Range',
      rate: 'Rate',
      redeem: 'Redeem',
      sales: 'Sales',
      sgm: 'SGM',
      noLimit: 'No limit',
      jobNote: '* Job commission is calculated monthly from an external system (no fixed rate).',
    },
    specialCommissionRules: {
      title: 'Special Commission Formulas',
      streetPromoterTitle: 'Street Promoter',
      streetPromoterRule1: '30-40 heads: HKD 5,000',
      streetPromoterRule2: '41-50 heads: HKD 7,000',
      streetPromoterRule3: '51 heads or above: HKD 9,000',
      telesalesTitle: 'Telesales',
      telesalesRule1: '40 heads or below: HKD 40 / head',
      telesalesRule2: '41-80 heads: HKD 50 / head',
      telesalesRule3: 'Above 80 heads: HKD 60 / head',
      note: 'These two items are calculated automatically month by month in Payroll based on the entered headcount.',
    },
    payrollBonusNote: 'After enabling Sales Bonus, choose Bonus 1, Bonus 2, or Custom Bonus. Custom Bonus can be configured with tier rows like Bonus 1.',
    shopBonusNote: 'Shop Bonus is a separate extra item based on the monthly target achievement percentage. The standard option uses the default tiers, while the custom option lets you define your own. The actual target % is entered month by month in Payroll.',
    payrollBonusSchemeOptions: {
      bonus_1: 'Bonus 1',
      bonus_2: 'Bonus 2',
      custom: 'Custom Bonus',
    },
    shopBonusSchemeOptions: {
      standard: 'Standard Shop Bonus',
      custom: 'Custom Shop Bonus',
    },
    customBonusEditor: {
      name: 'Custom Bonus Name',
      namePlaceholder: 'For example: Special Sales Bonus',
      editHint: 'The table keeps your current row order while editing. The preview below shows how it will be organized after saving.',
      previewTitle: 'Organized Bonus Preview',
      conflictTitle: 'Bonus tier conflicts detected. Please fix them first.',
      conflictDuplicate: 'Rows {from} and {to} cannot use the same sales threshold.',
      conflictOrder: 'Rows {from} and {to} are out of order by sales threshold.',
      minSales: 'Sales Threshold',
      amount: 'Bonus Amount',
      copyStandard: 'Copy Bonus 1 Tiers',
      addTier: 'Add Tier',
      removeTier: 'Remove',
      empty: 'Add at least one custom bonus tier.',
    },
    customShopBonusEditor: {
      name: 'Custom Shop Bonus Name',
      namePlaceholder: 'For example: Target Achievement Bonus',
      editHint: 'Shop bonus is based on the monthly target achievement percentage. The preview below shows the normalized tier order.',
      previewTitle: 'Organized Shop Bonus Preview',
      conflictTitle: 'Shop bonus tier conflicts detected. Please fix them first.',
      conflictDuplicate: 'Rows {from} and {to} cannot use the same target percentage.',
      conflictOrder: 'Rows {from} and {to} are out of order by target percentage.',
      minPercent: 'Target %',
      amount: 'Bonus Amount',
      copyStandard: 'Copy Standard Shop Bonus Tiers',
      addTier: 'Add Tier',
      removeTier: 'Remove',
      empty: 'Add at least one shop bonus tier.',
    },
    booleanLabels: {
      yes: 'Yes',
      no: 'No',
    },
  },
} as const;

type EmployeeProfileLabels = (typeof translations)[keyof typeof translations];

function getStatusClasses(status: EmployeeDetailRecord['employmentStatus']) {
  switch (status) {
    case 'active':
      return 'bg-emerald-50 text-emerald-700';
    case 'on_leave':
      return 'bg-amber-50 text-amber-700';
    case 'resigned':
      return 'bg-slate-100 text-slate-600';
    case 'terminated':
      return 'bg-rose-50 text-rose-700';
    default:
      return 'bg-slate-100 text-slate-600';
  }
}

function formatDate(value: string | null, locale: string, fallback: string) {
  if (!value) {
    return fallback;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

function formatCurrency(value: number | null, locale: string, fallback: string) {
  if (value === null) {
    return fallback;
  }

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'HKD',
    maximumFractionDigits: 2,
  }).format(value);
}

function sanitizePayrollBonusDraftTiers(value: unknown): PayrollBonusTier[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((entry) => {
      if (!entry || typeof entry !== 'object') {
        return null;
      }

      const minSales = Number((entry as { minSales?: unknown }).minSales);
      const amount = Number((entry as { amount?: unknown }).amount);
      if (!Number.isFinite(minSales) || !Number.isFinite(amount)) {
        return null;
      }

      return {
        minSales: Math.max(0, minSales),
        amount: Math.max(0, amount),
      } satisfies PayrollBonusTier;
    })
    .filter((entry): entry is PayrollBonusTier => entry !== null);
}

function sanitizeShopBonusDraftTiers(value: unknown): ShopBonusTier[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((entry) => {
      if (!entry || typeof entry !== 'object') {
        return null;
      }

      const minPercent = Number((entry as { minPercent?: unknown }).minPercent);
      const amount = Number((entry as { amount?: unknown }).amount);
      if (!Number.isFinite(minPercent) || !Number.isFinite(amount)) {
        return null;
      }

      return {
        minPercent: roundEditableNumber(Math.max(0, minPercent), 4),
        amount: roundEditableNumber(Math.max(0, amount), 2),
      } satisfies ShopBonusTier;
    })
    .filter((entry): entry is ShopBonusTier => entry !== null);
}

function sanitizeCustomCommissionDraftTiers(value: unknown): CustomCommissionTier[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((entry) => {
      if (!entry || typeof entry !== 'object') {
        return null;
      }

      const commissionType = (entry as { commissionType?: unknown }).commissionType as CustomCommissionTier['commissionType'];
      if (!CUSTOM_COMMISSION_TYPES.includes(commissionType)) {
        return null;
      }

      const minAmount = Number((entry as { minAmount?: unknown }).minAmount);
      const rawMaxAmount = (entry as { maxAmount?: unknown }).maxAmount;
      const maxAmount = rawMaxAmount === null || rawMaxAmount === '' || typeof rawMaxAmount === 'undefined'
        ? null
        : Number(rawMaxAmount);
      const rate = Number((entry as { rate?: unknown }).rate);

      if (!Number.isFinite(minAmount) || !Number.isFinite(rate)) {
        return null;
      }

      if (maxAmount !== null && !Number.isFinite(maxAmount)) {
        return null;
      }

      return {
        commissionType,
        minAmount: roundEditableNumber(Math.max(0, minAmount), 2),
        maxAmount: maxAmount === null ? null : roundEditableNumber(Math.max(0, maxAmount), 2),
        rate: roundEditableNumber(Math.max(0, rate), 6),
      } satisfies CustomCommissionTier;
    })
    .filter((entry): entry is CustomCommissionTier => entry !== null);
}

function serializePayrollBonusTiers(tiers: PayrollBonusTier[]) {
  return JSON.stringify(sanitizePayrollBonusDraftTiers(tiers));
}

function serializeShopBonusTiers(tiers: ShopBonusTier[]) {
  return JSON.stringify(sanitizeShopBonusDraftTiers(tiers));
}

function serializeCustomCommissionTiers(tiers: CustomCommissionTier[]) {
  return JSON.stringify(sanitizeCustomCommissionDraftTiers(tiers));
}

function createStandardCommissionRulesFromRateTable(tiers: CommissionRateTier[]) {
  const legacyTypes = new Set<CustomCommissionTier['commissionType']>(['redeem', 'sales', 'sgm']);
  return createCommissionRulesFromLegacyCustomTiers('自訂佣金', tiers
    .filter((tier): tier is CommissionRateTier & { commissionType: CustomCommissionTier['commissionType'] } => tier.staffGroup === 'default' && legacyTypes.has(tier.commissionType as CustomCommissionTier['commissionType']))
    .map((tier) => ({
      commissionType: tier.commissionType,
      minAmount: tier.minAmount,
      maxAmount: tier.maxAmount,
      rate: tier.rate,
    })));
}

function applyCommissionPresetToState(current: FormState, preset: SavedCommissionPresetRecord): FormState {
  const legacyRules = createCommissionRulesFromLegacyCustomTiers(preset.name, preset.tiers);
  const presetRules = preset.rules.length > 0
    ? preset.rules
    : legacyRules.length > 0
      ? legacyRules
      : createYanLyBarCommissionRulesForEditor();
  return {
    ...current,
    commissionMethod: 'custom',
    commissionCustomName: preset.name,
    commissionCustomTiers: preset.rules.length > 0 || legacyRules.length === 0 ? '' : serializeCustomCommissionTiers(preset.tiers),
    commissionRules: serializeCommissionRules([
      ...presetRules,
      ...normalizeCommissionRules(parseJsonSafely(current.commissionRules)).filter((rule) => rule.metric === 'shop'),
    ]),
  };
}

function applyShopCommissionPresetToState(current: FormState, preset: SavedShopCommissionPresetRecord): FormState {
  return {
    ...current,
    shopBonusEnabled: 'true',
    shopBonusScheme: 'custom',
    shopBonusCustomName: preset.name,
    shopBonusCustomTiers: '',
    commissionRules: serializeCommissionRules([
      ...normalizeCommissionRules(parseJsonSafely(current.commissionRules)).filter((rule) => rule.metric !== 'shop'),
      ...preset.rules,
    ]),
  };
}

function createBlankShopCommissionRule(): CommissionRule {
  return {
    code: 'custom_shop_rate_commission',
    name: '自訂鋪數百分比方案',
    type: 'rate',
    metric: 'shop',
    enabled: true,
    stackable: false,
    tiers: [{ minAmount: 0, maxAmount: null, amount: null, rate: 0 }],
  };
}

function createBlankMainCommissionRule(): CommissionRule {
  return {
    code: `custom_commission_rule_${Date.now()}`,
    name: '新增佣金方案',
    type: 'rate',
    metric: 'sales',
    enabled: true,
    stackable: false,
    tiers: [{ minAmount: 0, maxAmount: null, amount: null, rate: 0 }],
  };
}

function createBlankCommissionPlanState(current: FormState): FormState {
  return {
    ...current,
    commissionMethod: 'custom',
    commissionCustomName: '新增佣金方案',
    commissionCustomTiers: '',
    commissionRules: serializeCommissionRules([
      createBlankMainCommissionRule(),
      ...normalizeCommissionRules(parseJsonSafely(current.commissionRules)).filter((rule) => rule.metric === 'shop'),
    ]),
  };
}

function createBlankShopCommissionPlanState(current: FormState): FormState {
  return {
    ...current,
    shopBonusEnabled: 'true',
    shopBonusScheme: 'custom',
    shopBonusCustomName: '自訂鋪數百分比方案',
    shopBonusCustomTiers: '',
    commissionRules: serializeCommissionRules([
      ...normalizeCommissionRules(parseJsonSafely(current.commissionRules)).filter((rule) => rule.metric !== 'shop'),
      createBlankShopCommissionRule(),
    ]),
  };
}

function getAppliedCommissionDisplayName(
  employee: EmployeeDetailRecord,
  mainRules: CommissionRule[],
  labels: EmployeeProfileLabels,
) {
  if (employee.streetPromoterEnabled && (!employee.commissionMethod || employee.commissionMethod === 'none') && mainRules.length === 0) {
    return labels.fields.streetPromoterEnabled;
  }

  if (employee.commissionMethod !== 'custom') {
    return employee.commissionMethod ? labels.commissionMethods[employee.commissionMethod] : labels.emptyValue;
  }

  const ruleNames = new Set(mainRules.map((rule) => rule.name));
  const hasYanLyBar = ruleNames.has('Sales BAR Commission') && ruleNames.has('Redeem BAR Commission');
  const customName = employee.commissionCustomName?.trim();
  const isGenericBarName = customName === 'BAR Commission';
  if (hasYanLyBar || isGenericBarName) return `${labels.commissionMethods.custom} - Yan/LY BAR`;
  if (customName) return `${labels.commissionMethods.custom} - ${customName}`;
  if (mainRules.length > 1) return `${labels.commissionMethods.custom} - 自訂佣金方案`;
  if (mainRules.length > 0) return `${labels.commissionMethods.custom} - ${mainRules.map((rule) => rule.name).join(' / ')}`;
  return labels.commissionMethods.custom;
}

function getAppliedShopDisplayName(employee: EmployeeDetailRecord, shopRules: CommissionRule[], labels: EmployeeProfileLabels) {
  const customName = employee.shopBonusCustomName?.trim();
  if (shopRules.length > 0) {
    return customName || shopRules.map((rule) => rule.name).join(' / ');
  }
  if (employee.shopBonusScheme === 'custom') return customName || labels.shopBonusSchemeOptions.custom;
  if (employee.shopBonusScheme === 'standard') return labels.shopBonusSchemeOptions.standard;
  return labels.emptyValue;
}

function parseJsonSafely(value: string) {
  if (!value.trim()) return [];
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function roundEditableNumber(value: number, decimalPlaces = 6) {
  const factor = 10 ** decimalPlaces;
  return Math.round(value * factor) / factor;
}

function rateToPercent(value: number | null | undefined) {
  if (value === null || typeof value === 'undefined' || !Number.isFinite(value)) return 0;
  return roundEditableNumber(value * 100, 4);
}

function percentToRate(value: number | null | undefined) {
  if (value === null || typeof value === 'undefined' || !Number.isFinite(value)) return 0;
  return roundEditableNumber(value / 100, 6);
}

function parseSerializedPayrollBonusTiers(value: string) {
  if (!value) {
    return [];
  }

  try {
    return sanitizePayrollBonusDraftTiers(JSON.parse(value));
  } catch {
    return [];
  }
}

function parseSerializedShopBonusTiers(value: string) {
  if (!value) {
    return [];
  }

  try {
    return sanitizeShopBonusDraftTiers(JSON.parse(value));
  } catch {
    return [];
  }
}

function createDefaultCustomBonusTiers(payrollBonusSchemes: PayrollBonusConfigCatalog['payrollBonusSchemes']): PayrollBonusTier[] {
  return (payrollBonusSchemes.bonus_1 ?? []).map((tier) => ({ ...tier }));
}

function createDefaultShopBonusTiers(shopBonusStandardTiers: ShopBonusTier[]): ShopBonusTier[] {
  return shopBonusStandardTiers.map((tier) => ({ ...tier }));
}

function getCustomBonusConflictMessages(
  tiers: PayrollBonusTier[],
  labels: {
    conflictDuplicate: string;
    conflictOrder: string;
  },
) {
  const draftTiers = sanitizePayrollBonusDraftTiers(tiers);
  const messages: string[] = [];

  draftTiers.forEach((tier, index) => {
    for (let nextIndex = index + 1; nextIndex < draftTiers.length; nextIndex += 1) {
      if (draftTiers[nextIndex].minSales === tier.minSales) {
        messages.push(labels.conflictDuplicate.replace('{from}', `${index + 1}`).replace('{to}', `${nextIndex + 1}`));
      }
    }

    if (index < draftTiers.length - 1 && draftTiers[index + 1].minSales < tier.minSales) {
      messages.push(labels.conflictOrder.replace('{from}', `${index + 1}`).replace('{to}', `${index + 2}`));
    }
  });

  return Array.from(new Set(messages));
}

function getCustomShopBonusConflictMessages(
  tiers: ShopBonusTier[],
  labels: {
    conflictDuplicate: string;
    conflictOrder: string;
  },
) {
  const draftTiers = sanitizeShopBonusDraftTiers(tiers);
  const messages: string[] = [];

  draftTiers.forEach((tier, index) => {
    for (let nextIndex = index + 1; nextIndex < draftTiers.length; nextIndex += 1) {
      if (draftTiers[nextIndex].minPercent === tier.minPercent) {
        messages.push(labels.conflictDuplicate.replace('{from}', `${index + 1}`).replace('{to}', `${nextIndex + 1}`));
      }
    }

    if (index < draftTiers.length - 1 && draftTiers[index + 1].minPercent < tier.minPercent) {
      messages.push(labels.conflictOrder.replace('{from}', `${index + 1}`).replace('{to}', `${index + 2}`));
    }
  });

  return Array.from(new Set(messages));
}

function parseIsoDateParts(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) {
    return null;
  }

  return {
    year: Number(match[1]),
    month: Number(match[2]),
    day: Number(match[3]),
  };
}

function getBirthdayReminder(dateOfBirth: string | null | undefined, referenceDate: Date = new Date()) {
  const birth = parseIsoDateParts(dateOfBirth);
  if (!birth) {
    return null;
  }

  const today = new Date(Date.UTC(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate()));
  let nextBirthday = new Date(Date.UTC(today.getUTCFullYear(), birth.month - 1, birth.day));
  if (nextBirthday.getTime() < today.getTime()) {
    nextBirthday = new Date(Date.UTC(today.getUTCFullYear() + 1, birth.month - 1, birth.day));
  }

  const daysUntil = Math.round((nextBirthday.getTime() - today.getTime()) / 86400000);
  if (daysUntil > 30) {
    return null;
  }

  return {
    daysUntil,
    isToday: daysUntil === 0,
  };
}

function splitAddressForIr56b(address: string | null | undefined) {
  const normalized = (address ?? '').replace(/\s+/g, ' ').trim();
  if (!normalized) {
    return { line1: '', line2: '', line3: '' };
  }

  const explicitLines = normalized
    .split(/\s*(?:\n|,|，)\s*/)
    .map((line) => line.trim())
    .filter(Boolean);
  const lines = explicitLines.length > 1 ? explicitLines : normalized.match(/.{1,35}(?:\s|$)/g)?.map((line) => line.trim()).filter(Boolean) ?? [normalized];

  return {
    line1: lines[0] ?? '',
    line2: lines[1] ?? '',
    line3: lines.slice(2).join(' ').slice(0, 80),
  };
}

function inferIr56bAddressArea(address: string | null | undefined): '' | 'H' | 'K' | 'N' | 'F' {
  const value = (address ?? '').toLowerCase();
  if (!value) return '';
  if (/hong kong|香港|central|wan chai|causeway|north point|quarry bay|chai wan|aberdeen|薄扶林|中環|灣仔|銅鑼灣|北角|鰂魚涌|柴灣|香港仔/.test(value)) return 'H';
  if (/kowloon|九龍|kwun tong|mong kok|tsim sha tsui|jordan|yau ma tei|sham shui po|觀塘|旺角|尖沙咀|佐敦|油麻地|深水埗/.test(value)) return 'K';
  if (/new territories|新界|sha tin|tai wai|tsuen wan|tuen mun|yuen long|fanling|sheung shui|沙田|大圍|荃灣|屯門|元朗|粉嶺|上水/.test(value)) return 'N';
  return 'F';
}

function getIr56bAddressLines(employee: EmployeeDetailRecord, profile: EmployeeDetailRecord['ir56bProfile']) {
  const fallback = splitAddressForIr56b(employee.address);
  return {
    line1: profile.resAddressLine1 ?? fallback.line1,
    line2: profile.resAddressLine2 ?? fallback.line2,
    line3: profile.resAddressLine3 ?? fallback.line3,
    area: profile.resAddressArea ?? inferIr56bAddressArea(employee.address),
  };
}

function escapeXml(value: unknown) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function createIr56bDraftXml(employee: EmployeeDetailRecord, bankName: string, exportedAt: string) {
  const address = getIr56bAddressLines(employee, employee.ir56bProfile);
  const taxableSalary = (employee.baseSalary ?? 0) + (employee.allowanceAmount ?? 0);

  return `<?xml version="1.0" encoding="UTF-8"?>
<IR56B_DRAFT exportedAt="${escapeXml(exportedAt)}">
  <Employee>
    <EmployeeCode>${escapeXml(employee.employeeCode)}</EmployeeCode>
    <NameZh>${escapeXml(employee.nameZh)}</NameZh>
    <NameEn>${escapeXml(employee.nameEn)}</NameEn>
    <Gender>${escapeXml(employee.gender)}</Gender>
    <IdentityType>${escapeXml(employee.identityType)}</IdentityType>
    <IdentityNumber>${escapeXml(employee.identityNumber)}</IdentityNumber>
    <DateOfBirth>${escapeXml(employee.dateOfBirth)}</DateOfBirth>
    <Phone>${escapeXml(employee.phone)}</Phone>
  </Employee>
  <Employment>
    <Company>${escapeXml(employee.companyNameZh || employee.companyNameEn || employee.companyType)}</Company>
    <Branch>${escapeXml(employee.branchNameZh || employee.branchNameEn || employee.branchCode)}</Branch>
    <Position>${escapeXml(employee.positionNameZh)}</Position>
    <EmploymentType>${escapeXml(employee.employmentType)}</EmploymentType>
    <Status>${escapeXml(employee.employmentStatus)}</Status>
    <HireDate>${escapeXml(employee.hireDate)}</HireDate>
    <EmploymentEndDate>${escapeXml(employee.employmentEndDate)}</EmploymentEndDate>
  </Employment>
  <IR56BProfile>
    <MaritalStatus>${escapeXml(employee.ir56bProfile.maritalStatus)}</MaritalStatus>
    <ResidentialAddress area="${escapeXml(address.area)}">
      <Line1>${escapeXml(address.line1)}</Line1>
      <Line2>${escapeXml(address.line2)}</Line2>
      <Line3>${escapeXml(address.line3)}</Line3>
    </ResidentialAddress>
    <PostalAddress area="${escapeXml(employee.ir56bProfile.postalAddressArea)}">
      <Line1>${escapeXml(employee.ir56bProfile.postalAddressLine1)}</Line1>
      <Line2>${escapeXml(employee.ir56bProfile.postalAddressLine2)}</Line2>
      <Line3>${escapeXml(employee.ir56bProfile.postalAddressLine3)}</Line3>
    </PostalAddress>
    <SpouseName>${escapeXml(employee.ir56bProfile.spouseName)}</SpouseName>
    <SpouseHkid>${escapeXml(employee.ir56bProfile.spouseHkid)}</SpouseHkid>
    <SpousePassport>${escapeXml(employee.ir56bProfile.spousePassport)}</SpousePassport>
    <PlaceOfResidenceIndicator>${escapeXml(employee.ir56bProfile.placeOfResidenceIndicator)}</PlaceOfResidenceIndicator>
    <OverseasCompanyIndicator>${escapeXml(employee.ir56bProfile.overseasCompanyIndicator)}</OverseasCompanyIndicator>
    <Remarks>${escapeXml(employee.ir56bProfile.remarks)}</Remarks>
  </IR56BProfile>
  <PayrollReference>
    <SalaryType>${escapeXml(employee.salaryType)}</SalaryType>
    <BaseSalary>${escapeXml(employee.baseSalary)}</BaseSalary>
    <AllowanceAmount>${escapeXml(employee.allowanceAmount)}</AllowanceAmount>
    <EstimatedFixedTaxableMonthlyAmount>${escapeXml(taxableSalary || '')}</EstimatedFixedTaxableMonthlyAmount>
    <PaymentMethod>${escapeXml(employee.paymentMethod)}</PaymentMethod>
    <BankName>${escapeXml(bankName)}</BankName>
    <MpfEnabled>${escapeXml(employee.mpfEnabled)}</MpfEnabled>
  </PayrollReference>
</IR56B_DRAFT>
`;
}

function createInitialState(employee: EmployeeDetailRecord): FormState {
  const probationEndDate = calculateProbationEndDate(employee.hireDate, employee.probationMonths) ?? employee.probationEndDate ?? '';
  const employeeMainCommissionRules = (employee.commissionRules ?? []).filter((rule) => rule.metric !== 'shop');
  const defaultIr56bAddress = splitAddressForIr56b(employee.address);

  return {
    employeeCode: employee.employeeCode,
    nameZh: employee.nameZh,
    nameEn: employee.nameEn,
    alias: employee.alias ?? '',
    gender: employee.gender,
    identityType: employee.identityType,
    identityNumber: employee.identityNumber,
    dateOfBirth: employee.dateOfBirth ?? '',
    address: employee.address ?? '',
    phone: employee.phone ?? '',
    companyId: employee.companyId ?? '',
    branchId: employee.branchId ?? '',
    companyType: employee.companyType,
    employmentType: employee.employmentType,
    employmentStatus: employee.employmentStatus,
    positionId: employee.positionId ?? '',
    hireDate: employee.hireDate ?? '',
    probationEndDate,
    employmentEndDate: employee.employmentEndDate ?? '',
    terminationReason: employee.terminationReason ?? '',
    finalPayrollMonth: employee.finalPayrollMonth ?? '',
    notes: employee.notes ?? '',
    paymentMethod: employee.paymentMethod ?? '',
    bankId: employee.bankId ?? '',
    bankAccountNumber: employee.bankAccountNumber ?? '',
    probationMonths: employee.probationMonths === null ? '' : String(employee.probationMonths),
    annualLeaveDays: employee.annualLeaveDays === null ? '' : String(employee.annualLeaveDays),
    salaryType: employee.salaryType ?? '',
    baseSalary: employee.baseSalary === null ? '' : String(employee.baseSalary),
    packageCommissionAmount: employee.packageCommissionAmount === null ? '' : String(employee.packageCommissionAmount),
    allowanceAmount: employee.allowanceAmount === null ? '' : String(employee.allowanceAmount),
    salaryEffectiveFrom: employee.salaryEffectiveFrom ?? '',
    salaryRemarks: employee.salaryRemarks ?? '',
    attendanceBonusEnabled: employee.attendanceBonusEnabled ? 'true' : 'false',
    attendanceBonusAmount: employee.attendanceBonusAmount === null ? '' : String(employee.attendanceBonusAmount),
    transportAllowance: employee.transportAllowance === null ? '' : String(employee.transportAllowance),
    briefingBonus: employee.briefingBonus === null ? '' : String(employee.briefingBonus),
    bookingBonus: employee.bookingBonus === null ? '' : String(employee.bookingBonus),
    officeJobAmount: employee.officeJobAmount === null ? '' : String(employee.officeJobAmount),
    mpfEnabled: employee.mpfEnabled ? 'true' : 'false',
    commissionMethod: employeeMainCommissionRules.length > 0 || employee.commissionPresetId
      ? 'custom'
      : (employee.commissionMethod === 'custom' ? '' : (employee.commissionMethod ?? '')),
    commissionCustomName: employee.commissionCustomName ?? '',
    commissionCustomTiers: serializeCustomCommissionTiers(employee.commissionCustomTiers ?? []),
    commissionRules: serializeCommissionRules(employee.commissionRules?.length ? employee.commissionRules : createCommissionRulesFromLegacyCustomTiers(employee.commissionCustomName, employee.commissionCustomTiers ?? [])),
    commissionRedeemRate: employee.commissionRedeemRate === null ? '' : String(employee.commissionRedeemRate),
    commissionSalesRate: employee.commissionSalesRate === null ? '' : String(employee.commissionSalesRate),
    commissionSgmRate: employee.commissionSgmRate === null ? '' : String(employee.commissionSgmRate),
    salesAmountRatePercent: employee.salesAmountRatePercent === null ? '' : String(employee.salesAmountRatePercent),
    salesBonusEnabled: employee.salesBonusEnabled || employee.payrollBonusEnabled ? 'true' : 'false',
    salesBonusRate: employee.salesBonusRate === null ? '' : String(employee.salesBonusRate),
    salesBonusCustomName: employee.salesBonusCustomName ?? '',
    salesBonusCustomTiers: serializePayrollBonusTiers(employee.salesBonusCustomTiers ?? []),
    payrollBonusEnabled: employee.salesBonusEnabled || employee.payrollBonusEnabled ? 'true' : 'false',
    payrollBonusScheme: employee.payrollBonusPresetId
      ? getPresetSelectValue(employee.payrollBonusPresetId)
      : (employee.payrollBonusScheme ?? (employee.salesBonusEnabled && employee.salesBonusRate !== null ? 'custom' : '')),
    streetPromoterEnabled: employee.streetPromoterEnabled ? 'true' : 'false',
    telesalesEnabled: employee.telesalesEnabled ? 'true' : 'false',
    payrollIgnoreCommissionReview: employee.payrollIgnoreCommissionReview ? 'true' : 'false',
    shopBonusEnabled: employee.shopBonusEnabled ? 'true' : 'false',
    shopBonusCustomName: employee.shopBonusCustomName ?? '',
    shopBonusCustomTiers: serializeShopBonusTiers(employee.shopBonusCustomTiers ?? []),
    shopBonusScheme: employee.shopBonusScheme ?? '',
    payDayPrimary: employee.payDayPrimary === null ? '' : String(employee.payDayPrimary),
    payDaySecondary: employee.payDaySecondary === null ? '' : String(employee.payDaySecondary),
    commissionNotes: employee.commissionNotes ?? '',
    ir56bMaritalStatus: employee.ir56bProfile.maritalStatus ?? '',
    ir56bResAddressLine1: employee.ir56bProfile.resAddressLine1 ?? defaultIr56bAddress.line1,
    ir56bResAddressLine2: employee.ir56bProfile.resAddressLine2 ?? defaultIr56bAddress.line2,
    ir56bResAddressLine3: employee.ir56bProfile.resAddressLine3 ?? defaultIr56bAddress.line3,
    ir56bResAddressArea: employee.ir56bProfile.resAddressArea ?? inferIr56bAddressArea(employee.address),
    ir56bPostalAddressLine1: employee.ir56bProfile.postalAddressLine1 ?? '',
    ir56bPostalAddressLine2: employee.ir56bProfile.postalAddressLine2 ?? '',
    ir56bPostalAddressLine3: employee.ir56bProfile.postalAddressLine3 ?? '',
    ir56bPostalAddressArea: employee.ir56bProfile.postalAddressArea ?? '',
    ir56bSpouseName: employee.ir56bProfile.spouseName ?? '',
    ir56bSpouseHkid: employee.ir56bProfile.spouseHkid ?? '',
    ir56bSpousePassport: employee.ir56bProfile.spousePassport ?? '',
    ir56bPlaceOfResidenceIndicator: employee.ir56bProfile.placeOfResidenceIndicator,
    ir56bOverseasCompanyIndicator: employee.ir56bProfile.overseasCompanyIndicator,
    ir56bRemarks: employee.ir56bProfile.remarks ?? '',
  };
}

function PayrollBonusSchemePreview({
  tiers,
  title,
}: {
  tiers: PayrollBonusTier[];
  title: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2 text-base font-bold text-slate-900">
        <Wallet className="h-5 w-5 text-[#D4AF37]" />
        <span>{title}</span>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
            <th className="pb-2 pr-3">Sales 門檻</th>
            <th className="pb-2 text-right">Bonus 金額</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {tiers.map((tier) => (
            <tr key={`${title}-${tier.minSales}-${tier.amount}`}>
              <td className="py-2.5 pr-3 tabular-nums text-slate-600">Sales &gt;= {new Intl.NumberFormat('en-HK', { style: 'currency', currency: 'HKD', maximumFractionDigits: 0 }).format(tier.minSales)}</td>
              <td className="py-2.5 text-right font-semibold tabular-nums text-slate-900">{new Intl.NumberFormat('en-HK', { style: 'currency', currency: 'HKD', maximumFractionDigits: 0 }).format(tier.amount)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CommissionRulesPreview({ rules, title = '自訂佣金規則' }: { rules: CommissionRule[]; title?: string }) {
  if (rules.length === 0) return null;

  const currency = new Intl.NumberFormat('en-HK', { style: 'currency', currency: 'HKD', maximumFractionDigits: 0 });
  const metricLabels: Record<string, string> = {
    sales: 'Sales',
    redeem: 'Redeem',
    salesAmountTotal: 'Sales Amount',
    shop: '鋪數',
    job: 'Job',
    sgm: 'SGM',
  };

  return (
    <div className="space-y-3 rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4">
      <div className="text-sm font-bold text-slate-900">{title}</div>
      {rules.map((rule) => (
        <div key={rule.code} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <div className="font-semibold text-slate-900">{rule.name}</div>
              <div className="mt-1 text-xs text-slate-500">{rule.type === 'bar' ? '達標固定佣金' : '百分比佣金'} · {rule.stackable ? '可疊加' : '不可疊加'}</div>
            </div>
            <div className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">{metricLabels[rule.metric] ?? rule.metric}</div>
          </div>
          <table className="w-full text-sm">
            <tbody className="divide-y divide-slate-100">
              {rule.tiers.map((tier) => (
                <tr key={`${rule.code}-${tier.minAmount}-${tier.maxAmount ?? 'up'}-${tier.amount ?? tier.rate ?? 0}`}>
                  <td className="py-2 pr-3 text-slate-600">{metricLabels[rule.metric] ?? rule.metric} &gt;= {currency.format(tier.minAmount)}</td>
                  <td className="py-2 text-right font-semibold tabular-nums text-slate-900">{rule.type === 'bar' ? currency.format(tier.amount ?? 0) : `${((tier.rate ?? 0) * 100).toFixed(2)}%`}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}

function formatEditableNumber(value: number | null): number | null {
  if (value === null || !Number.isFinite(value)) return value;
  return roundEditableNumber(value, 6);
}

function mergeCommissionRulesWithCurrentShop(current: string, mainRules: CommissionRule[]) {
  const currentShopRules = normalizeCommissionRules(parseJsonSafely(current)).filter((rule) => rule.metric === 'shop');
  return serializeCommissionRules([...mainRules, ...currentShopRules]);
}

function mergeCommissionRulesWithCurrentMain(current: string, shopRules: CommissionRule[]) {
  const currentMainRules = normalizeCommissionRules(parseJsonSafely(current)).filter((rule) => rule.metric !== 'shop');
  return serializeCommissionRules([...currentMainRules, ...shopRules]);
}

function ShopCommissionRulesEditor({
  rules,
  onChange,
  onClear,
  onSavePreset,
  isSavingPreset,
}: {
  rules: CommissionRule[];
  onChange: (rules: CommissionRule[]) => void;
  onClear: () => void;
  onSavePreset: () => void;
  isSavingPreset: boolean;
}) {
  const updateRule = (ruleIndex: number, patch: Partial<CommissionRule>) => onChange(rules.map((rule, index) => index === ruleIndex ? { ...rule, ...patch } : rule));
  const updateTier = (ruleIndex: number, tierIndex: number, patch: Partial<CommissionRule['tiers'][number]>) => {
    const rule = rules[ruleIndex];
    if (!rule) return;
    updateRule(ruleIndex, { tiers: rule.tiers.map((tier, index) => index === tierIndex ? { ...tier, ...patch } : tier) });
  };

  return (
    <div className="space-y-3 rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="text-sm font-bold text-slate-900">已套用鋪數方案</div>
          <div className="mt-1 text-xs text-slate-600">可直接修改門檻及百分比；儲存鋪數方案只會加入方案庫，Payroll 要生效請再按右上角「儲存」。</div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={onSavePreset} disabled={isSavingPreset || rules.length === 0} className="rounded-xl border border-emerald-200 bg-white px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50">{isSavingPreset ? '儲存中...' : '儲存鋪數方案'}</button>
          <button type="button" onClick={onClear} className="rounded-xl border border-rose-200 bg-white px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50">取消套用方案</button>
        </div>
      </div>
      {rules.map((rule, ruleIndex) => (
        <div key={`${rule.code}-${ruleIndex}`} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">方案名稱<input value={rule.name} onChange={(event) => updateRule(ruleIndex, { name: event.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm normal-case tracking-normal text-slate-800" /></label>
          <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <tr><th className="px-3 py-2 text-left">最低鋪數金額</th><th className="px-3 py-2 text-left">最高鋪數金額</th><th className="px-3 py-2 text-left">百分比 (%)</th><th className="px-3 py-2 text-right">操作</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rule.tiers.map((tier, tierIndex) => (
                  <tr key={`${rule.code}-shop-tier-${tierIndex}`}>
                    <td className="px-3 py-2"><InlineNumberInput value={formatEditableNumber(tier.minAmount)} allowDecimal onCommit={(value) => updateTier(ruleIndex, tierIndex, { minAmount: value ?? 0 })} /></td>
                    <td className="px-3 py-2"><InlineNumberInput value={formatEditableNumber(tier.maxAmount)} allowDecimal allowEmpty placeholder="無上限" onCommit={(value) => updateTier(ruleIndex, tierIndex, { maxAmount: value })} /></td>
                    <td className="px-3 py-2"><InlineNumberInput value={rateToPercent(tier.rate)} allowDecimal onCommit={(value) => updateTier(ruleIndex, tierIndex, { rate: percentToRate(value), amount: null })} /></td>
                    <td className="px-3 py-2 text-right"><button type="button" onClick={() => updateRule(ruleIndex, { tiers: rule.tiers.filter((_, index) => index !== tierIndex) })} className="rounded-lg border border-rose-200 px-2.5 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-50">刪除</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button type="button" onClick={() => updateRule(ruleIndex, { tiers: [...rule.tiers, { minAmount: rule.tiers.at(-1)?.minAmount ?? 0, maxAmount: null, amount: null, rate: rule.tiers.at(-1)?.rate ?? 0 }] })} className="mt-3 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">新增級距</button>
        </div>
      ))}
    </div>
  );
}

const COMMISSION_RULE_METRIC_LABELS: Record<CommissionRuleMetric, string> = {
  sales: 'Sales',
  redeem: 'Redeem',
  salesAmountTotal: 'Sales Amount',
  shop: '鋪數',
  job: 'Job',
  sgm: 'SGM',
};

const COMMISSION_RULE_TYPE_LABELS: Record<CommissionRuleType, string> = {
  bar: '達標固定佣金',
  rate: '百分比佣金',
};

function createYanLyBarCommissionRulesForEditor(): CommissionRule[] {
  return normalizeCommissionRules([
    { code: 'sales_bar_commission', name: 'Sales BAR Commission', type: 'bar', metric: 'sales', enabled: true, stackable: false, tiers: [{ minAmount: 150000, amount: 1500 }, { minAmount: 200000, amount: 2000 }, { minAmount: 250000, amount: 2500 }, { minAmount: 300000, amount: 3000 }, { minAmount: 350000, amount: 3500 }, { minAmount: 400000, amount: 4000 }] },
    { code: 'redeem_bar_commission', name: 'Redeem BAR Commission', type: 'bar', metric: 'redeem', enabled: true, stackable: false, tiers: [{ minAmount: 105000, amount: 1500 }, { minAmount: 140000, amount: 2000 }, { minAmount: 175000, amount: 2500 }, { minAmount: 210000, amount: 3000 }, { minAmount: 245000, amount: 3500 }, { minAmount: 280000, amount: 4000 }] },
  ]);
}

function CommissionRulesEditor({ rules, onChange, onSavePreset, isSavingPreset }: { rules: CommissionRule[]; onChange: (rules: CommissionRule[]) => void; onSavePreset: () => void; isSavingPreset: boolean }) {
  const conflicts = getCommissionRuleConflictMessages(rules);
  const updateRule = (ruleIndex: number, patch: Partial<CommissionRule>) => onChange(rules.map((rule, index) => index === ruleIndex ? { ...rule, ...patch } : rule));
  const updateTier = (ruleIndex: number, tierIndex: number, patch: Partial<CommissionRule['tiers'][number]>) => {
    const rule = rules[ruleIndex];
    if (!rule) return;
    updateRule(ruleIndex, { tiers: rule.tiers.map((tier, index) => index === tierIndex ? { ...tier, ...patch } : tier) });
  };
  const addRule = () => {
    const nextIndex = rules.length + 1;
    onChange([...rules, { code: `commission_rule_${Date.now()}`, name: `佣金規則 ${nextIndex}`, type: 'bar', metric: 'sales', enabled: true, stackable: false, tiers: [{ minAmount: 0, maxAmount: null, amount: 0, rate: null }] }]);
  };

  return (
    <div className="space-y-3 rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="text-sm font-bold text-slate-900">自訂佣金規則</div>
          <div className="mt-1 text-xs text-slate-600">佣金還佣金：BAR / rate 在這裡設定；儲存佣金方案只會加入方案庫，Payroll 要生效請再按右上角「儲存」。</div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={onSavePreset} disabled={isSavingPreset || rules.length === 0} className="rounded-xl border border-emerald-200 bg-white px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50">{isSavingPreset ? '儲存中...' : '儲存佣金方案'}</button>
          <button type="button" onClick={addRule} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">新增佣金規則</button>
        </div>
      </div>
      {conflicts.length > 0 ? <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"><div className="font-semibold">佣金規則可能有衝突</div>{conflicts.map((conflict) => <div key={conflict} className="mt-1">• {conflict}</div>)}</div> : rules.length > 0 ? <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">✅ 佣金規則暫時未見衝突</div> : null}
      {rules.length === 0 ? <div className="rounded-xl border border-dashed border-slate-300 bg-white px-4 py-5 text-sm text-slate-500">未設定自訂佣金規則。可繼續使用標準佣金 / 舊自訂佣金，或新增 BAR / rate 規則。</div> : null}
      {rules.map((rule, ruleIndex) => (
        <div key={`${rule.code}-${ruleIndex}`} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid gap-3 md:grid-cols-[1fr_150px_170px_100px_auto]">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">名稱<input value={rule.name} onChange={(event) => updateRule(ruleIndex, { name: event.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm normal-case tracking-normal text-slate-800" /></label>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">類型<select value={rule.type} onChange={(event) => updateRule(ruleIndex, { type: event.target.value as CommissionRuleType, tiers: rule.tiers.map((tier) => event.target.value === 'bar' ? { ...tier, amount: tier.amount ?? 0, rate: null } : { ...tier, amount: null, rate: tier.rate ?? 0 }) })} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm normal-case tracking-normal text-slate-800"><option value="bar">{COMMISSION_RULE_TYPE_LABELS.bar}</option><option value="rate">{COMMISSION_RULE_TYPE_LABELS.rate}</option></select></label>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">計算基準<select value={rule.metric} onChange={(event) => updateRule(ruleIndex, { metric: event.target.value as CommissionRuleMetric })} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm normal-case tracking-normal text-slate-800">{(Object.keys(COMMISSION_RULE_METRIC_LABELS) as CommissionRuleMetric[]).filter((metric) => metric !== 'shop').map((metric) => <option key={metric} value={metric}>{COMMISSION_RULE_METRIC_LABELS[metric]}</option>)}</select></label>
            <label className="flex items-end gap-2 pb-2 text-sm font-medium text-slate-700"><input type="checkbox" checked={rule.enabled} onChange={(event) => updateRule(ruleIndex, { enabled: event.target.checked })} className="h-4 w-4 rounded border-slate-300 text-[#D4AF37] focus:ring-[#D4AF37]" />啟用</label>
            <button type="button" onClick={() => onChange(rules.filter((_, index) => index !== ruleIndex))} className="self-end rounded-xl border border-rose-200 px-3 py-2 text-sm font-medium text-rose-700 hover:bg-rose-50">刪除</button>
          </div>
          <label className="mt-3 flex items-center gap-2 text-sm text-slate-600"><input type="checkbox" checked={rule.stackable} onChange={(event) => updateRule(ruleIndex, { stackable: event.target.checked })} className="h-4 w-4 rounded border-slate-300 text-[#D4AF37] focus:ring-[#D4AF37]" />允許與同一計算基準的其他佣金疊加</label>
          <div className="mt-4 overflow-hidden rounded-xl border border-slate-200"><table className="w-full text-sm"><thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500"><tr><th className="px-3 py-2 text-left">門檻</th><th className="px-3 py-2 text-left">{rule.type === 'bar' ? '佣金金額' : '佣金率 (%)'}</th><th className="px-3 py-2 text-right">操作</th></tr></thead><tbody className="divide-y divide-slate-100">{rule.tiers.map((tier, tierIndex) => (<tr key={`${rule.code}-tier-${tierIndex}`}><td className="px-3 py-2"><InlineNumberInput value={formatEditableNumber(tier.minAmount)} onCommit={(value) => updateTier(ruleIndex, tierIndex, { minAmount: value ?? 0 })} /></td><td className="px-3 py-2"><InlineNumberInput value={rule.type === 'bar' ? formatEditableNumber(tier.amount ?? 0) : rateToPercent(tier.rate)} allowDecimal onCommit={(value) => updateTier(ruleIndex, tierIndex, rule.type === 'bar' ? { amount: value ?? 0, rate: null } : { rate: percentToRate(value), amount: null })} /></td><td className="px-3 py-2 text-right"><button type="button" onClick={() => updateRule(ruleIndex, { tiers: rule.tiers.filter((_, index) => index !== tierIndex) })} className="rounded-lg border border-rose-200 px-2.5 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-50">刪除</button></td></tr>))}</tbody></table></div>
          <button type="button" onClick={() => updateRule(ruleIndex, { tiers: [...rule.tiers, { minAmount: rule.tiers.at(-1)?.minAmount ?? 0, maxAmount: null, amount: rule.type === 'bar' ? (rule.tiers.at(-1)?.amount ?? 0) : null, rate: rule.type === 'rate' ? (rule.tiers.at(-1)?.rate ?? 0) : null }] })} className="mt-3 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">新增門檻</button>
        </div>
      ))}
    </div>
  );
}

function ShopBonusSchemePreview({
  tiers,
  title,
}: {
  tiers: ShopBonusTier[];
  title: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2 text-base font-bold text-slate-900">
        <Wallet className="h-5 w-5 text-[#D4AF37]" />
        <span>{title}</span>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
            <th className="pb-2 pr-3">Target %</th>
            <th className="pb-2 text-right">Bonus 金額</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {tiers.map((tier) => (
            <tr key={`${title}-${tier.minPercent}-${tier.amount}`}>
              <td className="py-2.5 pr-3 tabular-nums text-slate-600">{tier.minPercent}%</td>
              <td className="py-2.5 text-right font-semibold tabular-nums text-slate-900">{new Intl.NumberFormat('en-HK', { style: 'currency', currency: 'HKD', maximumFractionDigits: 0 }).format(tier.amount)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CustomPayrollBonusTierEditor({
  tiers,
  onChange,
  onCopyStandard,
  customName,
  onCustomNameChange,
  title,
  labels,
}: {
  tiers: PayrollBonusTier[];
  onChange: (tiers: PayrollBonusTier[]) => void;
  onCopyStandard: () => void;
  customName: string;
  onCustomNameChange: (value: string) => void;
  title: string;
  labels: {
    name: string;
    namePlaceholder: string;
    editHint: string;
    previewTitle: string;
    conflictTitle: string;
    conflictDuplicate: string;
    conflictOrder: string;
    minSales: string;
    amount: string;
    copyStandard: string;
    addTier: string;
    removeTier: string;
    empty: string;
  };
}) {
  const editableTiers = sanitizePayrollBonusDraftTiers(tiers);
  const previewTiers = normalizePayrollBonusTiers(editableTiers);
  const conflicts = getCustomBonusConflictMessages(editableTiers, {
    conflictDuplicate: labels.conflictDuplicate,
    conflictOrder: labels.conflictOrder,
  });

  return (
    <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/60 p-4">
      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
        <span className="mb-1.5 block">{labels.name}</span>
        <input
          type="text"
          value={customName}
          onChange={(event) => onCustomNameChange(event.target.value)}
          placeholder={labels.namePlaceholder}
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/15"
        />
      </label>
      <div className="rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-600">
        {labels.editHint}
      </div>
      {conflicts.length > 0 ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <div className="font-semibold">{labels.conflictTitle}</div>
          <div className="mt-2 space-y-1">
            {conflicts.map((conflict) => (
              <div key={conflict}>• {conflict}</div>
            ))}
          </div>
        </div>
      ) : null}
      {editableTiers.length === 0 ? <div className="text-sm text-slate-600">{labels.empty}</div> : null}
      {editableTiers.length > 0 ? (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                <th className="w-14 px-4 py-3 text-center">#</th>
                <th className="px-4 py-3">{labels.minSales}</th>
                <th className="px-4 py-3">{labels.amount}</th>
                <th className="px-4 py-3 text-right">{labels.removeTier}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {editableTiers.map((tier, index) => (
                <tr key={`custom-tier-${index}`}>
                  <td className="px-4 py-3 text-center text-xs font-semibold text-slate-400">{index + 1}</td>
                  <td className="px-4 py-3">
                    <InlineNumberInput
                      value={tier.minSales}
                      onCommit={(value) => {
                        const next = editableTiers.map((entry, tierIndex) => tierIndex === index ? { ...entry, minSales: value ?? 0 } : entry);
                        onChange(next);
                      }}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <InlineNumberInput
                      value={tier.amount}
                      onCommit={(value) => {
                        const next = editableTiers.map((entry, tierIndex) => tierIndex === index ? { ...entry, amount: value ?? 0 } : entry);
                        onChange(next);
                      }}
                    />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => onChange(editableTiers.filter((_, tierIndex) => tierIndex !== index))}
                      className="rounded-xl border border-rose-200 px-3 py-2 text-sm font-medium text-rose-700 transition-colors hover:bg-rose-50"
                    >
                      {labels.removeTier}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onCopyStandard}
          className="rounded-xl border border-[#D4AF37]/30 bg-[#D4AF37]/10 px-4 py-2 text-sm font-medium text-[#8E6F12] transition-colors hover:bg-[#D4AF37]/15"
        >
          {labels.copyStandard}
        </button>
        <button
          type="button"
          onClick={() => onChange([...editableTiers, { minSales: editableTiers.at(-1)?.minSales ?? 0, amount: editableTiers.at(-1)?.amount ?? 0 }])}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
        >
          {labels.addTier}
        </button>
      </div>
      {previewTiers.length > 0 ? <PayrollBonusSchemePreview title={labels.previewTitle} tiers={previewTiers} /> : null}
    </div>
  );
}

function CustomShopBonusTierEditor({
  tiers,
  onChange,
  onCopyStandard,
  customName,
  onCustomNameChange,
  title,
  labels,
}: {
  tiers: ShopBonusTier[];
  onChange: (tiers: ShopBonusTier[]) => void;
  onCopyStandard: () => void;
  customName: string;
  onCustomNameChange: (value: string) => void;
  title: string;
  labels: {
    name: string;
    namePlaceholder: string;
    editHint: string;
    previewTitle: string;
    conflictTitle: string;
    conflictDuplicate: string;
    conflictOrder: string;
    minPercent: string;
    amount: string;
    copyStandard: string;
    addTier: string;
    removeTier: string;
    empty: string;
  };
}) {
  const editableTiers = sanitizeShopBonusDraftTiers(tiers);
  const previewTiers = normalizeShopBonusTiers(editableTiers);
  const conflicts = getCustomShopBonusConflictMessages(editableTiers, {
    conflictDuplicate: labels.conflictDuplicate,
    conflictOrder: labels.conflictOrder,
  });

  return (
    <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/60 p-4">
      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
        <span className="mb-1.5 block">{labels.name}</span>
        <input
          type="text"
          value={customName}
          onChange={(event) => onCustomNameChange(event.target.value)}
          placeholder={labels.namePlaceholder}
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/15"
        />
      </label>
      <div className="rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-600">
        {labels.editHint}
      </div>
      {conflicts.length > 0 ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <div className="font-semibold">{labels.conflictTitle}</div>
          <div className="mt-2 space-y-1">
            {conflicts.map((conflict) => (
              <div key={conflict}>• {conflict}</div>
            ))}
          </div>
        </div>
      ) : null}
      {editableTiers.length === 0 ? <div className="text-sm text-slate-600">{labels.empty}</div> : null}
      {editableTiers.length > 0 ? (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                <th className="w-14 px-4 py-3 text-center">#</th>
                <th className="px-4 py-3">{labels.minPercent}</th>
                <th className="px-4 py-3">{labels.amount}</th>
                <th className="px-4 py-3 text-right">{labels.removeTier}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {editableTiers.map((tier, index) => (
                <tr key={`custom-shop-tier-${index}`}>
                  <td className="px-4 py-3 text-center text-xs font-semibold text-slate-400">{index + 1}</td>
                  <td className="px-4 py-3">
                    <InlineNumberInput
                      value={tier.minPercent}
                      onCommit={(value) => {
                        const next = editableTiers.map((entry, tierIndex) => tierIndex === index ? { ...entry, minPercent: value ?? 0 } : entry);
                        onChange(next);
                      }}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <InlineNumberInput
                      value={tier.amount}
                      onCommit={(value) => {
                        const next = editableTiers.map((entry, tierIndex) => tierIndex === index ? { ...entry, amount: value ?? 0 } : entry);
                        onChange(next);
                      }}
                    />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => onChange(editableTiers.filter((_, tierIndex) => tierIndex !== index))}
                      className="rounded-xl border border-rose-200 px-3 py-2 text-sm font-medium text-rose-700 transition-colors hover:bg-rose-50"
                    >
                      {labels.removeTier}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onCopyStandard}
          className="rounded-xl border border-[#D4AF37]/30 bg-[#D4AF37]/10 px-4 py-2 text-sm font-medium text-[#8E6F12] transition-colors hover:bg-[#D4AF37]/15"
        >
          {labels.copyStandard}
        </button>
        <button
          type="button"
          onClick={() => onChange([...editableTiers, { minPercent: editableTiers.at(-1)?.minPercent ?? 0, amount: editableTiers.at(-1)?.amount ?? 0 }])}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
        >
          {labels.addTier}
        </button>
      </div>
      {previewTiers.length > 0 ? <ShopBonusSchemePreview title={title || labels.previewTitle} tiers={previewTiers} /> : null}
    </div>
  );
}

function CommissionRateTableCard({
  title,
  tiers,
  labels,
  locale,
  action,
}: {
  title: string;
  tiers: Array<Pick<CommissionRateTier, 'commissionType' | 'minAmount' | 'maxAmount' | 'rate'> & { staffGroup?: string }>;
  labels: {
    type: string;
    range: string;
    rate: string;
    redeem: string;
    sales: string;
    sgm: string;
    noLimit: string;
    jobNote: string;
  };
  locale: string;
  action?: ReactNode;
}) {
  const fmt = (value: number) => new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'HKD',
    maximumFractionDigits: 0,
  }).format(value);

  const typeLabel = (type: string) => {
    const map: Record<string, string> = {
      redeem: labels.redeem,
      sales: labels.sales,
      sgm: labels.sgm,
    };

    return map[type] ?? type;
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-base font-bold text-slate-900">
          <Wallet className="h-5 w-5 text-[#D4AF37]" />
          <span>{title}</span>
        </div>
        {action}
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
            <th className="pb-2 pr-3">{labels.type}</th>
            <th className="pb-2 pr-3">{labels.range}</th>
            <th className="pb-2 text-right">{labels.rate}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {tiers.map((tier, index) => (
            <tr key={`${tier.commissionType}-${tier.staffGroup ?? 'custom'}-${tier.minAmount}-${index}`}>
              <td className="py-2.5 pr-3">
                <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${
                  tier.commissionType === 'redeem' ? 'bg-blue-50 text-blue-700' :
                  tier.commissionType === 'sales' ? 'bg-emerald-50 text-emerald-700' :
                  'bg-amber-50 text-amber-700'
                }`}>{typeLabel(tier.commissionType)}</span>
              </td>
              <td className="py-2.5 pr-3 tabular-nums text-slate-600">
                {fmt(tier.minAmount)} — {tier.maxAmount !== null ? fmt(tier.maxAmount) : labels.noLimit}
              </td>
              <td className="py-2.5 text-right font-semibold tabular-nums text-slate-900">{(tier.rate * 100).toFixed(1)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-3 text-xs text-slate-400">{labels.jobNote}</p>
    </div>
  );
}

function InlineNumberInput({
  value,
  onCommit,
  placeholder,
  allowDecimal = false,
  allowEmpty = false,
  align = 'left',
  className,
}: {
  value: number | null;
  onCommit: (value: number | null) => void;
  placeholder?: string;
  allowDecimal?: boolean;
  allowEmpty?: boolean;
  align?: 'left' | 'right';
  className?: string;
}) {
  const [draft, setDraft] = useState(value === null ? '' : String(value));

  useEffect(() => {
    setDraft(value === null ? '' : String(value));
  }, [value]);

  const inputClassName = className ?? `w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/15 ${align === 'right' ? 'text-right' : ''}`;

  return (
    <input
      type="text"
      inputMode={allowDecimal ? 'decimal' : 'numeric'}
      value={draft}
      placeholder={placeholder}
      onFocus={(event) => event.currentTarget.select()}
      onChange={(event) => {
        const raw = event.target.value;
        if (allowDecimal) {
          const sanitized = raw.replace(/[^0-9.]/g, '');
          const firstDotIndex = sanitized.indexOf('.');
          const normalized = firstDotIndex === -1
            ? sanitized
            : `${sanitized.slice(0, firstDotIndex + 1)}${sanitized.slice(firstDotIndex + 1).replace(/\./g, '')}`;
          setDraft(normalized);
          return;
        }

        setDraft(raw.replace(/[^0-9]/g, ''));
      }}
      onBlur={() => {
        if (draft === '') {
          if (allowEmpty) {
            onCommit(null);
            return;
          }

          onCommit(0);
          setDraft('0');
          return;
        }

        const parsed = allowDecimal ? Number(draft) : Number.parseInt(draft, 10);
        if (Number.isFinite(parsed)) {
          onCommit(parsed);
          setDraft(String(parsed));
          return;
        }

        if (allowEmpty) {
          onCommit(null);
          setDraft('');
          return;
        }

        onCommit(0);
        setDraft('0');
      }}
      onKeyDown={(event) => {
        if (event.key === 'Enter') {
          event.currentTarget.blur();
        }
      }}
      className={inputClassName}
    />
  );
}

function SearchableBankSelect({
  selectedId,
  options,
  query,
  onQueryChange,
  onSelect,
  inputClassName,
  placeholder,
  searchPlaceholder,
  emptyText,
  clearLabel,
}: {
  selectedId: string;
  options: EmployeeDirectoryOption[];
  query: string;
  onQueryChange: (value: string) => void;
  onSelect: (value: string) => void;
  inputClassName: string;
  placeholder: string;
  searchPlaceholder: string;
  emptyText: string;
  clearLabel: string;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const normalizedQuery = query.trim().toLowerCase();
  const filteredOptions = options.filter((option) => {
    if (!normalizedQuery) {
      return true;
    }

    return [option.labelZh, option.labelEn, option.code]
      .filter(Boolean)
      .some((value) => value.toLowerCase().includes(normalizedQuery));
  });

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, []);

  return (
    <div ref={containerRef} className="space-y-2">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={(event) => {
            onQueryChange(event.target.value);
            setIsOpen(true);
          }}
          placeholder={searchPlaceholder}
          className={inputClassName.replace('px-3', 'pl-9 pr-9')}
        />
        {selectedId ? (
          <button
            type="button"
            onClick={() => {
              onSelect('');
              onQueryChange('');
              setIsOpen(false);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600"
            aria-label={clearLabel}
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>
      {isOpen ? (
      <div className="max-h-56 overflow-y-auto rounded-xl border border-slate-200 bg-white">
        <button
          type="button"
          onClick={() => {
            onSelect('');
            onQueryChange('');
            setIsOpen(false);
          }}
          className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-sm transition-colors hover:bg-slate-50 ${selectedId === '' ? 'bg-slate-50 font-medium text-slate-900' : 'text-slate-600'}`}
        >
          <span>{placeholder}</span>
        </button>
        {filteredOptions.length > 0 ? filteredOptions.map((bank) => (
          <button
            key={bank.id}
            type="button"
            onClick={() => {
              onSelect(bank.id);
              onQueryChange(bank.labelZh || bank.labelEn);
              setIsOpen(false);
            }}
            className={`flex w-full items-center justify-between gap-3 border-t border-slate-100 px-4 py-2.5 text-left text-sm transition-colors hover:bg-slate-50 ${selectedId === bank.id ? 'bg-slate-50 font-medium text-slate-900' : 'text-slate-600'}`}
          >
            <span>{bank.labelZh || bank.labelEn}</span>
            <span className="shrink-0 text-xs text-slate-400">{bank.code}</span>
          </button>
        )) : (
          <div className="border-t border-slate-100 px-4 py-3 text-sm text-slate-500">{emptyText}</div>
        )}
      </div>
      ) : null}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-6 border-b border-slate-100 pb-3 last:border-b-0 last:pb-0">
      <dt className="text-sm font-medium text-slate-500">{label}</dt>
      <dd className="text-right text-sm font-semibold text-slate-900">{value}</dd>
    </div>
  );
}

function FieldShell({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-slate-600">{label}</span>
      {children}
    </label>
  );
}

function inputClasses(extraClasses?: string) {
  return ['w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200', extraClasses].filter(Boolean).join(' ');
}

function EmployeeDocumentManager({
  employee,
  documents,
  locale,
  t,
}: {
  employee: EmployeeDetailRecord;
  documents: EmployeeDetailRecord['documents'];
  locale: string;
  t: (typeof translations)[keyof typeof translations];
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [documentType, setDocumentType] = useState<EmployeeDocumentType>('certificate');
  const [expiryDate, setExpiryDate] = useState('');
  const [remarks, setRemarks] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, startUploadTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    setDocumentType('certificate');
    setExpiryDate('');
    setRemarks('');
    setSelectedFile(null);
    setMessage(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [employee.id]);

  const handleUpload = () => {
    setError(null);
    setMessage(null);

    if (!selectedFile) {
      setError(t.documentManager.fileRequired);
      return;
    }

    const formData = new FormData();
    formData.set('employeeId', employee.id);
    formData.set('documentType', documentType);
    formData.set('remarks', remarks);
    if (documentType === 'certificate' && expiryDate) {
      formData.set('expiryDate', expiryDate);
    }
    formData.set('file', selectedFile);

    startUploadTransition(async () => {
      try {
        await uploadEmployeeDocument(formData);
        setMessage(t.documentManager.uploadSuccess);
        setExpiryDate('');
        setRemarks('');
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        router.refresh();
      } catch (uploadError) {
        setError(uploadError instanceof Error ? uploadError.message : t.errors.generic);
      }
    });
  };

  const handleDelete = (documentId: string) => {
    setError(null);
    setMessage(null);
    setDeletingId(documentId);

    const formData = new FormData();
    formData.set('employeeId', employee.id);
    formData.set('documentId', documentId);

    startUploadTransition(async () => {
      try {
        await deleteEmployeeDocument(formData);
        setMessage(t.documentManager.deleteSuccess);
        router.refresh();
      } catch (deleteError) {
        setError(deleteError instanceof Error ? deleteError.message : t.errors.generic);
      } finally {
        setDeletingId(null);
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="mb-2 flex items-center gap-2 text-base font-bold text-slate-900">
        <div className="h-4 w-1 rounded-full bg-[#D4AF37]"></div>
        {t.sections.documents}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5">
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-slate-500">
          <Upload className="h-4 w-4" />
          {t.documentManager.title}
        </div>
        <div className="mb-3 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-sm text-blue-700">{t.documentManager.help}</div>
        <div className="mb-4 rounded-lg border border-amber-100 bg-amber-50 px-3 py-2 text-sm text-amber-700">{t.documentManager.expiryHint}</div>
        {(message || error) ? (
          <div className={`mb-4 rounded-lg border px-3 py-2 text-sm ${error ? 'border-rose-200 bg-rose-50 text-rose-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'}`}>
            {message || error}
          </div>
        ) : null}
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <FieldShell label={t.fields.documentType}>
            <select value={documentType} onChange={(event) => setDocumentType(event.target.value as EmployeeDocumentType)} className={inputClasses()}>
              <option value="certificate">{t.documentTypes.certificate}</option>
              <option value="contract">{t.documentTypes.contract}</option>
            </select>
          </FieldShell>
          <FieldShell label={t.documentManager.file}>
            <input ref={fileInputRef} type="file" onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)} className={`${inputClasses()} file:mr-3 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-sm file:font-medium`} />
          </FieldShell>
          <FieldShell label={t.fields.expiryDate}>
            <input type="date" value={expiryDate} onChange={(event) => setExpiryDate(event.target.value)} disabled={documentType !== 'certificate'} className={`${inputClasses()} ${documentType !== 'certificate' ? 'bg-slate-50 text-slate-400' : ''}`} />
          </FieldShell>
          <FieldShell label={t.documentManager.remarks}>
            <input value={remarks} onChange={(event) => setRemarks(event.target.value)} className={inputClasses()} />
          </FieldShell>
        </div>
        <div className="mt-4 flex justify-end">
          <button type="button" onClick={handleUpload} disabled={isUploading} className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-slate-800 disabled:bg-slate-400">
            <Upload className="h-4 w-4" />
            {isUploading ? t.documentManager.uploading : t.documentManager.upload}
          </button>
        </div>
      </div>

      {documents.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-8 text-sm text-slate-500">{t.fields.noDocuments}</div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200">
          <div className="grid grid-cols-[120px_minmax(0,1fr)_180px_140px_minmax(0,1fr)_100px] gap-4 border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
            <div>{t.fields.documentType}</div>
            <div>{t.fields.fileName}</div>
            <div>{t.fields.folder}</div>
            <div>{t.fields.expiryDate}</div>
            <div>{t.fields.notes}</div>
            <div className="text-right">{t.fields.actions}</div>
          </div>
          <div className="divide-y divide-slate-100 bg-white">
            {documents.map((document) => (
              <div key={document.id} className="grid grid-cols-[120px_minmax(0,1fr)_180px_140px_minmax(0,1fr)_100px] gap-4 px-4 py-4 text-sm text-slate-700">
                <div className="flex items-center gap-2">
                  {document.documentType === 'certificate' ? <Award className="h-4 w-4 text-amber-500" /> : <FileText className="h-4 w-4 text-slate-500" />}
                  <span>{t.documentTypes[document.documentType]}</span>
                </div>
                <div className="truncate font-medium">
                  {document.downloadUrl ? (
                    <a href={document.downloadUrl} target="_blank" rel="noreferrer" className="text-[#D4AF37] hover:underline">
                      {document.fileName}
                    </a>
                  ) : document.fileName}
                </div>
                <div className="truncate text-xs text-slate-500">{document.storageFolder || '—'}</div>
                <div>{formatDate(document.expiryDate, locale, t.emptyValue)}</div>
                <div>{document.remarks || t.emptyValue}</div>
                <div className="flex justify-end">
                  <button type="button" onClick={() => handleDelete(document.id)} disabled={isUploading || deletingId === document.id} className="inline-flex items-center gap-1 rounded-md border border-rose-200 px-2.5 py-1.5 text-xs font-medium text-rose-600 transition-colors hover:bg-rose-50 disabled:opacity-50">
                    <Trash2 className="h-3.5 w-3.5" />
                    {deletingId === document.id ? t.documentManager.deleting : t.documentManager.delete}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function EmployeeProfile({
  employee,
  options,
  commissionTiers = [],
  savedCommissionPresets = [],
  savedPayrollBonusPresets = [],
  savedShopCommissionPresets = [],
  payrollBonusConfig = createLegacyPayrollBonusConfigCatalog(),
}: EmployeeProfileProps) {
  const router = useRouter();
  const { lang } = useLanguage();
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [formState, setFormState] = useState<FormState>(() => createInitialState(employee));
  const [commissionPresetOptions, setCommissionPresetOptions] = useState<SavedCommissionPresetRecord[]>(savedCommissionPresets);
  const [shopCommissionPresetOptionsState, setShopCommissionPresetOptionsState] = useState<SavedShopCommissionPresetRecord[]>(savedShopCommissionPresets);
  const [bankSearchQuery, setBankSearchQuery] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [savingPreset, setSavingPreset] = useState<'commission' | 'shop' | null>(null);
  const previousEmployeeIdRef = useRef(employee.id);

  const t = translations[lang] ?? translations.en;
  const locale = lang === 'en' ? 'en-HK' : lang === 'zh-CN' ? 'zh-CN' : 'zh-HK';
  const savedPresetsLabel = lang === 'en' ? 'Saved Presets' : lang === 'zh-CN' ? '已保存方案' : '已儲存方案';
  const standardPayrollBonusSchemes = payrollBonusConfig?.payrollBonusSchemes ?? createLegacyPayrollBonusConfigCatalog().payrollBonusSchemes;
  const standardShopBonusTiers = payrollBonusConfig?.shopBonusStandardTiers ?? createLegacyPayrollBonusConfigCatalog().shopBonusStandardTiers;
  const shopCommissionPresetOptions = Array.isArray(shopCommissionPresetOptionsState) && shopCommissionPresetOptionsState.length > 0
    ? shopCommissionPresetOptionsState
    : [{ id: 'tai_wai_shop', name: 'Moon and Iris 大圍鋪數方案', rules: createMoonIrisTaiWaiShopCommissionRules() }];
  const hasYanLySavedPreset = commissionPresetOptions.some((preset) => /yan\s*\/\s*ly/i.test(preset.name));
  const isCustomCommissionSelected = isCustomSchemeSelection(formState.commissionMethod);
  const isCustomBonusSelected = isCustomSchemeSelection(formState.payrollBonusScheme);
  const isCustomShopBonusSelected = formState.shopBonusScheme === 'custom';

  useEffect(() => {
    if (previousEmployeeIdRef.current !== employee.id) {
      previousEmployeeIdRef.current = employee.id;
      setFormState(createInitialState(employee));
      setBankSearchQuery(employee.bankNameZh || employee.bankNameEn || '');
      setIsEditing(false);
      setErrorMessage(null);
      setSuccessMessage(null);
      return;
    }

    if (!isEditing) {
      setFormState(createInitialState(employee));
      setBankSearchQuery(employee.bankNameZh || employee.bankNameEn || '');
    }
  }, [employee, isEditing]);

  useEffect(() => {
    setCommissionPresetOptions(savedCommissionPresets);
    setShopCommissionPresetOptionsState(savedShopCommissionPresets);
  }, [savedCommissionPresets, savedShopCommissionPresets]);

  const displayName = employee.alias || employee.nameZh || employee.nameEn;
  const formattedHireDate = formatDate(employee.hireDate, locale, t.emptyValue);
  const annualLeaveValue = employee.annualLeaveDays === null ? t.emptyValue : `${employee.annualLeaveDays}`;
  const bankName = employee.bankNameZh || employee.bankNameEn || t.emptyValue;
  const ir56bAddress = getIr56bAddressLines(employee, employee.ir56bProfile);
  const formIr56bAddress = {
    line1: formState.ir56bResAddressLine1,
    line2: formState.ir56bResAddressLine2,
    line3: formState.ir56bResAddressLine3,
    area: formState.ir56bResAddressArea,
  };
  const displayedProbationEndDate = calculateProbationEndDate(employee.hireDate, employee.probationMonths) ?? employee.probationEndDate;
  const availableBranches = options.branches;
  const selectedBank = options.banks.find((bank) => bank.id === formState.bankId) ?? null;
  const commissionRules = normalizeCommissionRules(parseJsonSafely(formState.commissionRules));
  const commissionRulesForEditor = commissionRules.filter((rule) => rule.metric !== 'shop');
  const shopCommissionRules = commissionRules.filter((rule) => rule.metric === 'shop');
  const commissionRuleConflicts = getCommissionRuleConflictMessages(commissionRulesForEditor);
  const employeeCommissionRules = employee.commissionRules?.length
    ? employee.commissionRules
    : createCommissionRulesFromLegacyCustomTiers(employee.commissionCustomName, employee.commissionCustomTiers ?? []);
  const employeeMainCommissionRules = employeeCommissionRules.filter((rule) => rule.metric !== 'shop');
  const employeeShopCommissionRules = employeeCommissionRules.filter((rule) => rule.metric === 'shop');
  const employeeHasShopSetup = employee.shopBonusEnabled || employeeShopCommissionRules.length > 0;
  const appliedCommissionDisplayName = getAppliedCommissionDisplayName(employee, employeeMainCommissionRules, t);
  const appliedShopDisplayName = getAppliedShopDisplayName(employee, employeeShopCommissionRules, t);
  const customBonusTiers = parseSerializedPayrollBonusTiers(formState.salesBonusCustomTiers);
  const customBonusConflicts = getCustomBonusConflictMessages(customBonusTiers, {
    conflictDuplicate: t.customBonusEditor.conflictDuplicate,
    conflictOrder: t.customBonusEditor.conflictOrder,
  });
  const employeeCustomBonusTiers = employee.salesBonusCustomTiers ?? [];
  const customBonusTitle = normalizePayrollBonusCustomName(formState.salesBonusCustomName) ?? t.payrollBonusSchemeOptions.custom;
  const employeeCustomBonusTitle = employee.salesBonusCustomName ?? t.payrollBonusSchemeOptions.custom;
  const customShopBonusTiers = parseSerializedShopBonusTiers(formState.shopBonusCustomTiers);
  const customShopBonusConflicts = getCustomShopBonusConflictMessages(customShopBonusTiers, {
    conflictDuplicate: t.customShopBonusEditor.conflictDuplicate,
    conflictOrder: t.customShopBonusEditor.conflictOrder,
  });
  const employeeCustomShopBonusTiers = employee.shopBonusCustomTiers ?? [];
  const customShopBonusTitle = normalizePayrollBonusCustomName(formState.shopBonusCustomName) ?? t.shopBonusSchemeOptions.custom;
  const employeeCustomShopBonusTitle = employee.shopBonusCustomName ?? t.shopBonusSchemeOptions.custom;
  const getSalaryAmountLabel = (salaryType: FormState['salaryType'] | EmployeeDetailRecord['salaryType']) => {
    switch (salaryType) {
      case 'monthly':
        return t.fields.monthlyRate;
      case 'daily':
        return t.fields.dailyRate;
      case 'hourly':
        return t.fields.hourlyRate;
      case 'package':
        return t.fields.packageBaseSalary;
      default:
        return t.fields.baseSalary;
    }
  };
  const getSalaryAmountHint = (salaryType: FormState['salaryType'] | EmployeeDetailRecord['salaryType']) => {
    switch (salaryType) {
      case 'monthly':
        return t.sections.salaryInputHintMonthly;
      case 'daily':
        return t.sections.salaryInputHintDaily;
      case 'hourly':
        return t.sections.salaryInputHintHourly;
      case 'package':
        return t.sections.salaryInputHintPackage;
      default:
        return null;
    }
  };
  const editingSalaryAmountLabel = getSalaryAmountLabel(formState.salaryType);
  const editingSalaryAmountHint = getSalaryAmountHint(formState.salaryType);
  const viewingSalaryAmountLabel = getSalaryAmountLabel(employee.salaryType);
  const viewingSalaryAmountHint = getSalaryAmountHint(employee.salaryType);
  const specialCommissionRulesCard = (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div className="text-sm font-semibold text-slate-800">{t.specialCommissionRules.title}</div>
      <div className="mt-3 grid gap-3 lg:grid-cols-2">
        {(isEditing ? formState.streetPromoterEnabled === 'true' : employee.streetPromoterEnabled) ? (
          <div className="rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700">
            <div className="font-semibold text-slate-900">{t.specialCommissionRules.streetPromoterTitle}</div>
            <div className="mt-2 space-y-1 text-sm text-slate-600">
              <div>{t.specialCommissionRules.streetPromoterRule1}</div>
              <div>{t.specialCommissionRules.streetPromoterRule2}</div>
              <div>{t.specialCommissionRules.streetPromoterRule3}</div>
            </div>
          </div>
        ) : null}
        {(isEditing ? formState.telesalesEnabled === 'true' : employee.telesalesEnabled) ? (
          <div className="rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700">
            <div className="font-semibold text-slate-900">{t.specialCommissionRules.telesalesTitle}</div>
            <div className="mt-2 space-y-1 text-sm text-slate-600">
              <div>{t.specialCommissionRules.telesalesRule1}</div>
              <div>{t.specialCommissionRules.telesalesRule2}</div>
              <div>{t.specialCommissionRules.telesalesRule3}</div>
            </div>
          </div>
        ) : null}
      </div>
      <div className="mt-3 text-sm text-slate-600">{t.specialCommissionRules.note}</div>
    </div>
  );
  const viewingDateOfBirth = isEditing ? formState.dateOfBirth : employee.dateOfBirth;
  const ageLabel = (() => {
    const age = calculateAge(viewingDateOfBirth);
    return age === null ? null : t.profileMeta.age.replace('{age}', `${age}`);
  })();
  const birthdayReminder = (() => {
    const reminder = getBirthdayReminder(viewingDateOfBirth);
    if (!reminder) {
      return null;
    }

    return reminder.isToday
      ? t.profileMeta.birthdayToday
      : t.profileMeta.birthdayUpcoming.replace('{days}', `${reminder.daysUntil}`);
  })();

  useEffect(() => {
    if (!isEditing) {
      return;
    }

    setBankSearchQuery(selectedBank?.labelZh || selectedBank?.labelEn || '');
  }, [isEditing, selectedBank?.id, selectedBank?.labelEn, selectedBank?.labelZh]);

  function handleInputChange(event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = event.target;
    setFormState((current) => {
      if (name === 'companyId') {
        return {
          ...current,
          companyId: value,
          branchId: '',
        };
      }

      if (name === 'employmentType' || name === 'hireDate' || name === 'probationMonths') {
        const nextState = { ...current, [name]: value };
        return {
          ...nextState,
          mpfEnabled: name === 'employmentType' && value === '自僱人士' ? 'false' : nextState.mpfEnabled,
          probationEndDate: calculateProbationEndDate(nextState.hireDate, nextState.probationMonths) ?? '',
        };
      }

      if (name === 'salaryType') {
        return {
          ...current,
          salaryType: value as FormState['salaryType'],
        };
      }

      if (name === 'commissionMethod') {
        const selectedPresetId = extractPresetIdFromSelectValue(value);
        if (selectedPresetId) {
          const selectedPreset = commissionPresetOptions.find((preset) => preset.id === selectedPresetId);
          return selectedPreset ? applyCommissionPresetToState({ ...current, commissionMethod: value }, selectedPreset) : current;
        }
        return {
          ...current,
          commissionMethod: value,
          commissionCustomName: value === 'custom' ? (current.commissionCustomName || '自訂佣金') : '',
          commissionCustomTiers: value === 'custom' ? current.commissionCustomTiers : current.commissionCustomTiers,
          commissionRules: value === 'custom'
            ? (normalizeCommissionRules(parseJsonSafely(current.commissionRules)).length > 0 ? current.commissionRules : serializeCommissionRules(createStandardCommissionRulesFromRateTable(commissionTiers)))
            : serializeCommissionRules(normalizeCommissionRules(parseJsonSafely(current.commissionRules)).filter((rule) => rule.metric === 'shop')),
        };
      }

      if (name === 'payrollBonusScheme') {
                const selectedPresetId = extractPresetIdFromSelectValue(value);
                if (selectedPresetId) {
                  const selectedPreset = savedPayrollBonusPresets.find((preset) => preset.id === selectedPresetId);
                  return {
                    ...current,
                    payrollBonusScheme: value,
                    salesBonusCustomName: selectedPreset?.name ?? current.salesBonusCustomName,
                    salesBonusCustomTiers: selectedPreset ? serializePayrollBonusTiers(selectedPreset.tiers) : current.salesBonusCustomTiers,
                  };
                }
        return {
          ...current,
          payrollBonusScheme: value,
          salesBonusCustomName: value === 'custom' ? current.salesBonusCustomName : '',
          salesBonusCustomTiers: value === 'custom'
            ? current.salesBonusCustomTiers || serializePayrollBonusTiers(createDefaultCustomBonusTiers(standardPayrollBonusSchemes))
            : current.salesBonusCustomTiers,
        };
      }

      if (name === 'shopBonusScheme') {
        return {
          ...current,
          shopBonusScheme: value,
          shopBonusCustomName: value === 'custom' ? current.shopBonusCustomName : '',
          shopBonusCustomTiers: value === 'custom'
            ? current.shopBonusCustomTiers || serializeShopBonusTiers(createDefaultShopBonusTiers(standardShopBonusTiers))
            : current.shopBonusCustomTiers,
        };
      }

      return { ...current, [name]: value };
    });
  }

  function handleCancelEdit() {
    setFormState(createInitialState(employee));
    setIsEditing(false);
    setErrorMessage(null);
    setSuccessMessage(null);
  }

  async function savePresetToSupabase(type: 'commission' | 'shop', name: string, rules: CommissionRule[]) {
    const supabase = createBrowserSupabaseClient();
    const table = 'saved_commission_presets';
    const payload = { name, tiers: rules };
    const { data: existing, error: lookupError } = await supabase
      .from(table)
      .select('id')
      .eq('name', name)
      .maybeSingle();

    if (lookupError) {
      throw new Error(lookupError.message);
    }

    if (existing?.id) {
      const { data, error } = await supabase
        .from(table)
        .update(payload)
        .eq('id', existing.id)
        .select('id')
        .maybeSingle();
      if (error || !data?.id) {
        throw new Error(error?.message ?? '儲存方案失敗。');
      }
      return { id: data.id as string, name, rules: normalizeCommissionRules(rules) };
    }

    const { data, error } = await supabase
      .from(table)
      .insert(payload)
      .select('id')
      .maybeSingle();
    if (error || !data?.id) {
      throw new Error(error?.message ?? '儲存方案失敗。');
    }
    return { id: data.id as string, name, rules: normalizeCommissionRules(rules) };
  }

  async function renameSavedPreset(type: 'commission' | 'shop', presetId: string, currentName: string) {
    const nextName = window.prompt('輸入新的方案名稱', currentName)?.trim();
    if (!nextName || nextName === currentName) return;

    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const supabase = createBrowserSupabaseClient();
      const isSharedShopPreset = type === 'shop' && presetId.startsWith('shared:');
      const table = isSharedShopPreset || type === 'commission' ? 'saved_commission_presets' : 'saved_shop_commission_presets';
      const id = presetId.replace(/^shared:/, '');
      const { data, error } = await supabase
        .from(table)
        .update({ name: nextName })
        .eq('id', id)
        .select('id, name')
        .maybeSingle();
      if (error) throw new Error(error.message);
      if (!data?.id) throw new Error('Supabase 無更新到方案，請檢查權限或重新登入。');

      if (type === 'commission') {
        setCommissionPresetOptions((current) => current.map((preset) => preset.id === presetId ? { ...preset, name: nextName } : preset).sort((left, right) => left.name.localeCompare(right.name)));
      } else {
        setShopCommissionPresetOptionsState((current) => current.map((preset) => preset.id === presetId ? { ...preset, name: nextName } : preset).sort((left, right) => left.name.localeCompare(right.name)));
      }

      setSuccessMessage(`已重新命名方案：${nextName}`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : '重新命名方案失敗。');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  async function handleSaveCommissionPreset() {
    const mainRules = normalizeCommissionRules(parseJsonSafely(formState.commissionRules)).filter((rule) => rule.metric !== 'shop');
    const presetName = normalizePayrollBonusCustomName(formState.commissionCustomName) ?? (mainRules.length === 1 ? mainRules[0]?.name : null) ?? '自訂佣金方案';

    if (mainRules.length === 0) {
      setErrorMessage('請先新增佣金規則。');
      return;
    }

    setSavingPreset('commission');
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const result = await savePresetToSupabase('commission', presetName, mainRules);
      setCommissionPresetOptions((current) => {
        const nextPreset: SavedCommissionPresetRecord = { id: result.id, name: result.name, tiers: [], rules: result.rules };
        const rest = current.filter((preset) => preset.id !== result.id && preset.name !== result.name);
        return [...rest, nextPreset].sort((left, right) => left.name.localeCompare(right.name));
      });
      setFormState((current) => ({ ...current, commissionCustomName: result.name }));
      setSuccessMessage(`已儲存佣金方案：${result.name}。如要 Payroll 使用此設定，請再按右上角「儲存」保存員工資料。`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : t.errors.generic);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSavingPreset(null);
    }
  }

  async function handleSaveShopCommissionPreset() {
    const shopRules = normalizeCommissionRules(parseJsonSafely(formState.commissionRules)).filter((rule) => rule.metric === 'shop');
    const presetName = normalizePayrollBonusCustomName(formState.shopBonusCustomName) ?? (shopRules.length === 1 ? shopRules[0]?.name : null) ?? '自訂鋪數方案';

    if (shopRules.length === 0) {
      setErrorMessage('請先新增或套用鋪數百分比方案。');
      return;
    }

    setSavingPreset('shop');
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const result = await savePresetToSupabase('shop', presetName, shopRules);
      setShopCommissionPresetOptionsState((current) => {
        const nextPreset: SavedShopCommissionPresetRecord = { id: result.id, name: result.name, rules: result.rules };
        const rest = current.filter((preset) => preset.id !== result.id && preset.name !== result.name);
        return [...rest, nextPreset].sort((left, right) => left.name.localeCompare(right.name));
      });
      setFormState((current) => ({ ...current, shopBonusCustomName: result.name }));
      setSuccessMessage(`已儲存鋪數方案：${result.name}。如要 Payroll 使用此設定，請再按右上角「儲存」保存員工資料。`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : t.errors.generic);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSavingPreset(null);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (isCustomCommissionSelected && commissionRuleConflicts.length > 0) {
      setErrorMessage(`佣金規則可能有衝突：${commissionRuleConflicts[0]}`);
      return;
    }

    if (formState.salesBonusEnabled === 'true' && isCustomBonusSelected && customBonusConflicts.length > 0) {
      setErrorMessage(`${t.customBonusEditor.conflictTitle} ${customBonusConflicts[0]}`);
      return;
    }

    if (formState.shopBonusEnabled === 'true' && isCustomShopBonusSelected && customShopBonusConflicts.length > 0) {
      setErrorMessage(`${t.customShopBonusEditor.conflictTitle} ${customShopBonusConflicts[0]}`);
      return;
    }

    const submissionCommissionRules = serializeCommissionRules(commissionRules.filter((rule) => {
      if (rule.metric === 'shop') {
        return formState.shopBonusEnabled === 'true';
      }

      return isCustomCommissionSelected;
    }));

    const payload = new FormData();
    payload.set('employeeId', employee.id);
    payload.set('originalEmployeeCode', employee.employeeCode);

    Object.entries(formState).forEach(([key, value]) => {
      if (key === 'commissionRules') {
        payload.set(key, submissionCommissionRules);
        return;
      }

      payload.set(key, value == null || value === 'null' || value === 'undefined' ? '' : value);
    });

    setIsSavingProfile(true);
    try {
      const result = await updateEmployee(payload);
      setSuccessMessage(t.success);
      setIsEditing(false);

      const params = new URLSearchParams();
      params.set('id', result.employeeCode);
      params.set('updated', String(Date.now()));
      window.location.replace(`/medimagic/app/people?${params.toString()}`);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : t.errors.generic);
    } finally {
      setIsSavingProfile(false);
    }
  }

  function handleExportProfile() {
    const fileSafeName = (displayName || employee.employeeCode || 'employee')
      .replace(/[\\/:*?"<>|]+/g, '-')
      .replace(/\s+/g, '_')
      .slice(0, 80);
    const exportData = {
      exportedAt: new Date().toISOString(),
      employee: {
        employeeCode: employee.employeeCode,
        nameZh: employee.nameZh,
        nameEn: employee.nameEn,
        alias: employee.alias,
        gender: employee.gender,
        identityType: employee.identityType,
        identityNumber: employee.identityNumber,
        phone: employee.phone,
        address: employee.address,
        companyNameZh: employee.companyNameZh,
        companyNameEn: employee.companyNameEn,
        branchNameZh: employee.branchNameZh,
        branchNameEn: employee.branchNameEn,
        positionNameZh: employee.positionNameZh,
        employmentType: employee.employmentType,
        employmentStatus: employee.employmentStatus,
        hireDate: employee.hireDate,
        probationMonths: employee.probationMonths,
        probationEndDate: displayedProbationEndDate,
        employmentEndDate: employee.employmentEndDate,
        terminationReason: employee.terminationReason,
        finalPayrollMonth: employee.finalPayrollMonth,
      },
      payment: {
        paymentMethod: employee.paymentMethod,
        bankName,
        bankAccountNumber: employee.bankAccountNumber,
        mpfEnabled: employee.mpfEnabled,
        payDayPrimary: employee.payDayPrimary,
        payDaySecondary: employee.payDaySecondary,
      },
      salary: {
        salaryType: employee.salaryType,
        baseSalary: employee.baseSalary,
        packageCommissionAmount: employee.packageCommissionAmount,
        allowanceAmount: employee.allowanceAmount,
        attendanceBonusAmount: employee.attendanceBonusAmount,
        transportAllowance: employee.transportAllowance,
        briefingBonus: employee.briefingBonus,
        bookingBonus: employee.bookingBonus,
        officeJobAmount: employee.officeJobAmount,
        effectiveFrom: employee.salaryEffectiveFrom,
        remarks: employee.salaryRemarks,
      },
      commission: {
        commissionMethod: employee.commissionMethod,
        commissionCustomName: employee.commissionCustomName,
        commissionCustomTiers: employee.commissionCustomTiers,
        commissionRules: employee.commissionRules,
        salesAmountRatePercent: employee.salesAmountRatePercent,
        salesBonusEnabled: employee.salesBonusEnabled,
        payrollBonusEnabled: employee.payrollBonusEnabled,
        payrollBonusScheme: employee.payrollBonusScheme,
        salesBonusCustomName: employee.salesBonusCustomName,
        salesBonusCustomTiers: employee.salesBonusCustomTiers,
        shopBonusEnabled: employee.shopBonusEnabled,
        shopBonusScheme: employee.shopBonusScheme,
        shopBonusCustomName: employee.shopBonusCustomName,
        shopBonusCustomTiers: employee.shopBonusCustomTiers,
        streetPromoterEnabled: employee.streetPromoterEnabled,
        telesalesEnabled: employee.telesalesEnabled,
        payrollIgnoreCommissionReview: employee.payrollIgnoreCommissionReview,
        commissionNotes: employee.commissionNotes,
      },
      leave: {
        annualLeaveDays: employee.annualLeaveDays,
      },
      notes: employee.notes,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${employee.employeeCode || fileSafeName}_${fileSafeName}_profile.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function handleExportIr56bXml() {
    const exportedAt = new Date().toISOString();
    const xml = createIr56bDraftXml(employee, bankName, exportedAt);
    const blob = new Blob([xml], { type: 'application/xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${employee.employeeCode || 'employee'}_IR56B_draft.xml`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function renderTextValue(value: string | null) {
    return value && value.trim().length > 0 ? value : t.emptyValue;
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <button onClick={() => window.location.assign('/medimagic/app/people')} type="button" className="flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900">
          <ArrowLeft className="h-4 w-4" />
          {t.back}
        </button>
        <div className="flex gap-2">
          {!isEditing ? (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-900"
            >
              <Edit2 className="h-4 w-4" />
              {t.edit}
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={handleCancelEdit}
                className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-900"
              >
                <X className="h-4 w-4" />
                {t.cancel}
              </button>
              <button
                type="submit"
                disabled={isSavingProfile}
                className="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                <Save className="h-4 w-4" />
                {isSavingProfile ? t.saving : t.save}
              </button>
            </>
          )}
          <button type="button" onClick={handleExportProfile} className="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-slate-800">
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">{t.export}</span>
          </button>
        </div>
      </div>

      {(errorMessage || successMessage) ? (
        <div className={`rounded-2xl border px-4 py-3 text-sm ${errorMessage ? 'border-rose-200 bg-rose-50 text-rose-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'}`}>
          {errorMessage || successMessage}
        </div>
      ) : null}

      <div className="relative flex flex-col gap-6 overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:flex-row md:items-center md:p-8">
        <div className="pointer-events-none absolute right-0 top-0 h-64 w-64 rounded-bl-full bg-linear-to-br from-[#D4AF37]/5 to-transparent"></div>
        <div className="relative z-10 flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl border-2 border-white bg-slate-100 text-3xl font-bold text-slate-500 shadow-md md:h-32 md:w-32">
          {(displayName || employee.employeeCode).replace(/\s+/g, '').slice(0, 2).toUpperCase()}
        </div>
        <div className="relative z-10 flex-1">
          <div className="mb-4 flex flex-col justify-between gap-4 md:flex-row md:items-start">
            <div>
              <div className="mb-1 flex items-center gap-3">
                <h1 className="text-2xl font-bold text-slate-900">{displayName}</h1>
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusClasses(employee.employmentStatus)}`}>
                  <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current"></span>
                  {t.statuses[employee.employmentStatus]}
                </span>
                {isEditing ? <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">{t.editing}</span> : null}
              </div>
              <p className="font-medium text-slate-500">{employee.employeeCode} • {employee.positionNameZh || t.emptyValue}</p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Building2 className="h-4 w-4 text-slate-400" />
              {employee.companyNameZh || employee.companyNameEn || t.companies[employee.companyType]}
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <ShieldCheck className="h-4 w-4 text-slate-400" />
              {renderTextValue(employee.identityNumber)}
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Phone className="h-4 w-4 text-slate-400" />
              {renderTextValue(employee.phone)}
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Calendar className="h-4 w-4 text-slate-400" />
              {formattedHireDate}
            </div>
          </div>
        </div>
      </div>

      <div className="flex min-h-128 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex overflow-x-auto border-b border-slate-100 bg-slate-50/50 px-2 no-scrollbar">
          {t.tabs.map((tab, index) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTabIndex(index)}
              className={`whitespace-nowrap border-b-2 px-6 py-4 text-sm font-semibold transition-all ${activeTabIndex === index ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex-1 bg-white p-6 md:p-8">
          {activeTabIndex === 0 ? (
            <div className="grid gap-x-12 gap-y-8 md:grid-cols-2">
              <div>
                <h3 className="mb-5 flex items-center gap-2 text-base font-bold text-slate-900">
                  <div className="h-4 w-1 rounded-full bg-[#D4AF37]"></div>
                  {t.sections.identity}
                </h3>
                {isEditing ? (
                  <div className="grid gap-4">
                    <FieldShell label={t.fields.employeeCode}><input name="employeeCode" value={formState.employeeCode} onChange={handleInputChange} className={inputClasses()} /></FieldShell>
                    <FieldShell label={t.fields.identityType}>
                      <select name="identityType" value={formState.identityType} onChange={handleInputChange} className={inputClasses()}>
                        <option value="hkid">{t.identityTypes.hkid}</option>
                        <option value="passport">{t.identityTypes.passport}</option>
                        <option value="other">{t.identityTypes.other}</option>
                      </select>
                    </FieldShell>
                    <FieldShell label={t.fields.identityNumber}><input name="identityNumber" value={formState.identityNumber} onChange={handleInputChange} className={inputClasses()} /></FieldShell>
                    <FieldShell label={t.fields.gender}>
                      <select name="gender" value={formState.gender} onChange={handleInputChange} className={inputClasses()}>
                        <option value="male">{t.genders.male}</option>
                        <option value="female">{t.genders.female}</option>
                        <option value="other">{t.genders.other}</option>
                      </select>
                    </FieldShell>
                    <FieldShell label={t.fields.dateOfBirth}>
                      <div className="space-y-2">
                        <input type="date" name="dateOfBirth" value={formState.dateOfBirth} onChange={handleInputChange} className={inputClasses()} />
                        {(ageLabel || birthdayReminder) ? (
                          <div className="space-y-1 text-xs text-slate-500">
                            {ageLabel ? <div>{ageLabel}</div> : null}
                            {birthdayReminder ? <div className="font-medium text-amber-700">{birthdayReminder}</div> : null}
                          </div>
                        ) : null}
                      </div>
                    </FieldShell>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <InfoRow label={t.fields.employeeCode} value={employee.employeeCode} />
                    <InfoRow label={t.fields.identityType} value={t.identityTypes[employee.identityType]} />
                    <InfoRow label={t.fields.identityNumber} value={renderTextValue(employee.identityNumber)} />
                    <InfoRow label={t.fields.gender} value={t.genders[employee.gender]} />
                    <div className="grid gap-1 border-b border-slate-100 pb-3 last:border-b-0">
                      <div className="text-sm font-medium text-slate-500">{t.fields.dateOfBirth}</div>
                      <div className="text-sm text-slate-900">{formatDate(employee.dateOfBirth, locale, t.emptyValue)}</div>
                      {(ageLabel || birthdayReminder) ? (
                        <div className="space-y-1 pt-1 text-xs text-slate-500">
                          {ageLabel ? <div>{ageLabel}</div> : null}
                          {birthdayReminder ? <div className="font-medium text-amber-700">{birthdayReminder}</div> : null}
                        </div>
                      ) : null}
                    </div>
                  </div>
                )}
              </div>
              <div>
                <h3 className="mb-5 flex items-center gap-2 text-base font-bold text-slate-900">
                  <div className="h-4 w-1 rounded-full bg-slate-900"></div>
                  {t.sections.personal}
                </h3>
                {isEditing ? (
                  <div className="grid gap-4">
                    <FieldShell label={t.fields.nameZh}><input name="nameZh" value={formState.nameZh} onChange={handleInputChange} className={inputClasses()} required /></FieldShell>
                    <FieldShell label={t.fields.nameEn}><input name="nameEn" value={formState.nameEn} onChange={handleInputChange} className={inputClasses()} required /></FieldShell>
                    <FieldShell label={t.fields.alias}><input name="alias" value={formState.alias} onChange={handleInputChange} className={inputClasses()} /></FieldShell>
                    <FieldShell label={t.fields.phone}><input name="phone" value={formState.phone} onChange={handleInputChange} className={inputClasses()} /></FieldShell>
                    <FieldShell label={t.fields.address}><textarea name="address" value={formState.address} onChange={handleInputChange} rows={4} className={inputClasses()} /></FieldShell>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <InfoRow label={t.fields.nameZh} value={renderTextValue(employee.nameZh)} />
                    <InfoRow label={t.fields.nameEn} value={renderTextValue(employee.nameEn)} />
                    <InfoRow label={t.fields.alias} value={renderTextValue(employee.alias)} />
                    <InfoRow label={t.fields.phone} value={renderTextValue(employee.phone)} />
                    <InfoRow label={t.fields.address} value={renderTextValue(employee.address)} />
                  </div>
                )}
              </div>
            </div>
          ) : null}

          {activeTabIndex === 1 ? (
            <div>
              <div>
                <h3 className="mb-5 flex items-center gap-2 text-base font-bold text-slate-900">
                  <div className="h-4 w-1 rounded-full bg-slate-900"></div>
                  {t.sections.employment}
                </h3>
                {isEditing ? (
                  <div className="grid gap-4">
                    <FieldShell label={t.fields.company}>
                      <select name="companyId" value={formState.companyId} onChange={handleInputChange} className={inputClasses()}>
                        <option value="">{t.emptyValue}</option>
                        {options.companies.map((company) => (
                          <option key={company.id} value={company.id}>{company.labelZh}</option>
                        ))}
                      </select>
                    </FieldShell>
                    <FieldShell label={t.fields.branch}>
                      <select name="branchId" value={formState.branchId} onChange={handleInputChange} className={inputClasses()}>
                        <option value="">{t.emptyValue}</option>
                        {availableBranches.map((branch) => (
                          <option key={branch.id} value={branch.id}>{branch.labelZh}</option>
                        ))}
                      </select>
                    </FieldShell>
                    <FieldShell label={t.fields.employmentType}>
                      <select name="employmentType" value={formState.employmentType} onChange={handleInputChange} className={inputClasses()}>
                        {EMPLOYEE_EMPLOYMENT_TYPES.map((employmentType) => (
                          <option key={employmentType} value={employmentType}>{t.employmentTypes[employmentType]}</option>
                        ))}
                      </select>
                    </FieldShell>
                    <FieldShell label={t.fields.status}>
                      <select name="employmentStatus" value={formState.employmentStatus} onChange={handleInputChange} className={inputClasses()}>
                        <option value="active">{t.statuses.active}</option>
                        <option value="on_leave">{t.statuses.on_leave}</option>
                        <option value="resigned">{t.statuses.resigned}</option>
                        <option value="terminated">{t.statuses.terminated}</option>
                      </select>
                    </FieldShell>
                    <FieldShell label={t.fields.position}>
                      <select name="positionId" value={formState.positionId} onChange={handleInputChange} className={inputClasses()}>
                        <option value="">{t.emptyValue}</option>
                        {options.positions.map((position) => (
                          <option key={position.id} value={position.id}>{position.labelZh}</option>
                        ))}
                      </select>
                    </FieldShell>
                    <FieldShell label={t.fields.hireDate}><input type="date" name="hireDate" value={formState.hireDate} onChange={handleInputChange} className={inputClasses()} /></FieldShell>
                    <FieldShell label={t.fields.probationMonths}><input type="number" min="0" step="1" name="probationMonths" value={formState.probationMonths} onChange={handleInputChange} className={inputClasses()} /></FieldShell>
                    <FieldShell label={t.fields.probationEndDate}><input type="date" name="probationEndDate" value={formState.probationEndDate} readOnly className={inputClasses('bg-slate-100 text-slate-700')} /></FieldShell>
                    <FieldShell label={t.fields.employmentEndDate}><input type="date" name="employmentEndDate" value={formState.employmentEndDate} onChange={handleInputChange} className={inputClasses()} /></FieldShell>
                    <FieldShell label={t.fields.terminationReason}><input type="text" name="terminationReason" value={formState.terminationReason} onChange={handleInputChange} placeholder="RESIGN / RETIRE / DISMIS" className={inputClasses()} /></FieldShell>
                    <FieldShell label={t.fields.finalPayrollMonth}><input type="month" name="finalPayrollMonth" value={formState.finalPayrollMonth} onChange={handleInputChange} className={inputClasses()} /></FieldShell>
                    <FieldShell label={t.fields.annualLeaveDays}><input type="number" min="0" step="1" name="annualLeaveDays" value={formState.annualLeaveDays} onChange={handleInputChange} className={inputClasses()} /></FieldShell>
                    <FieldShell label={t.fields.notes}><textarea name="notes" value={formState.notes} onChange={handleInputChange} rows={4} className={inputClasses()} /></FieldShell>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <InfoRow label={t.fields.company} value={employee.companyNameZh || employee.companyNameEn || t.companies[employee.companyType]} />
                    <InfoRow label={t.fields.branch} value={employee.branchNameZh || employee.branchNameEn || t.emptyValue} />
                    <InfoRow label={t.fields.employmentType} value={t.employmentTypes[employee.employmentType]} />
                    <InfoRow label={t.fields.status} value={t.statuses[employee.employmentStatus]} />
                    <InfoRow label={t.fields.position} value={renderTextValue(employee.positionNameZh)} />
                    <InfoRow label={t.fields.hireDate} value={formattedHireDate} />
                    <InfoRow label={t.fields.probationMonths} value={employee.probationMonths === null ? t.emptyValue : `${employee.probationMonths}`} />
                    <InfoRow label={t.fields.probationEndDate} value={formatDate(displayedProbationEndDate, locale, t.emptyValue)} />
                    <InfoRow label={t.fields.employmentEndDate} value={formatDate(employee.employmentEndDate, locale, t.emptyValue)} />
                    <InfoRow label={t.fields.terminationReason} value={renderTextValue(employee.terminationReason)} />
                    <InfoRow label={t.fields.finalPayrollMonth} value={renderTextValue(employee.finalPayrollMonth)} />
                    <InfoRow label={t.fields.annualLeaveDays} value={annualLeaveValue} />
                    <InfoRow label={t.fields.notes} value={renderTextValue(employee.notes)} />
                  </div>
                )}
              </div>
            </div>
          ) : null}

          {activeTabIndex === 2 ? (
            <div>
              <div>
                <h3 className="mb-5 flex items-center gap-2 text-base font-bold text-slate-900">
                  <div className="h-4 w-1 rounded-full bg-[#D4AF37]"></div>
                  {t.sections.payroll}
                </h3>
                {isEditing ? (
                  <div className="grid gap-4">
                    <FieldShell label={t.fields.paymentMethod}>
                      <select name="paymentMethod" value={formState.paymentMethod} onChange={handleInputChange} className={inputClasses()}>
                        <option value="">{t.emptyValue}</option>
                        <option value="autopay">{t.paymentMethods.autopay}</option>
                        <option value="cash">{t.paymentMethods.cash}</option>
                        <option value="cheque">{t.paymentMethods.cheque}</option>
                        <option value="fps">{t.paymentMethods.fps}</option>
                      </select>
                    </FieldShell>
                    <FieldShell label={t.fields.bank}>
                      <SearchableBankSelect
                        selectedId={formState.bankId}
                        options={options.banks}
                        query={bankSearchQuery}
                        onQueryChange={setBankSearchQuery}
                        onSelect={(value) => setFormState((prev) => ({ ...prev, bankId: value }))}
                        inputClassName={inputClasses()}
                        placeholder={t.emptyValue}
                        searchPlaceholder={t.bankSearch.placeholder}
                        emptyText={t.bankSearch.empty}
                        clearLabel={t.bankSearch.clear}
                      />
                    </FieldShell>
                    <FieldShell label={t.fields.bankAccountNumber}><input name="bankAccountNumber" value={formState.bankAccountNumber} onChange={handleInputChange} className={inputClasses()} /></FieldShell>
                    <FieldShell label={t.fields.mpfEnabled}>
                      <select name="mpfEnabled" value={formState.mpfEnabled} onChange={handleInputChange} className={inputClasses()}>
                        <option value="true">{t.booleanLabels.yes}</option>
                        <option value="false">{t.booleanLabels.no}</option>
                      </select>
                    </FieldShell>
                    <FieldShell label={t.fields.payDayPrimary}><input type="number" min="1" max="31" step="1" name="payDayPrimary" value={formState.payDayPrimary} onChange={handleInputChange} className={inputClasses()} /></FieldShell>
                    <FieldShell label={t.fields.payDaySecondary}><input type="number" min="1" max="31" step="1" name="payDaySecondary" value={formState.payDaySecondary} onChange={handleInputChange} className={inputClasses()} /></FieldShell>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <InfoRow label={t.fields.paymentMethod} value={employee.paymentMethod ? t.paymentMethods[employee.paymentMethod] : t.emptyValue} />
                    <InfoRow label={t.fields.bank} value={bankName} />
                    <InfoRow label={t.fields.bankAccountNumber} value={renderTextValue(employee.bankAccountNumber)} />
                    <InfoRow label={t.fields.mpfEnabled} value={employee.mpfEnabled ? t.booleanLabels.yes : t.booleanLabels.no} />
                    <InfoRow label={t.fields.payDayPrimary} value={employee.payDayPrimary !== null ? `${employee.payDayPrimary}` : t.emptyValue} />
                    <InfoRow label={t.fields.payDaySecondary} value={employee.payDaySecondary !== null ? `${employee.payDaySecondary}` : t.emptyValue} />
                  </div>
                )}
              </div>
            </div>
          ) : null}

          {activeTabIndex === 3 ? (
            <div>
              <div>
                <h3 className="mb-5 flex items-center gap-2 text-base font-bold text-slate-900">
                  <div className="h-4 w-1 rounded-full bg-[#D4AF37]"></div>
                  {t.sections.salary}
                </h3>
                {isEditing ? (
                  <div className="grid gap-4">
                    <FieldShell label={t.fields.salaryType}>
                      <select name="salaryType" value={formState.salaryType} onChange={handleInputChange} className={inputClasses()}>
                        <option value="">{t.emptyValue}</option>
                        <option value="monthly">{t.salaryTypes.monthly}</option>
                        <option value="daily">{t.salaryTypes.daily}</option>
                        <option value="hourly">{t.salaryTypes.hourly}</option>
                        <option value="package">{t.salaryTypes.package}</option>
                        {formState.salaryType === 'street_promoter' ? <option value="street_promoter" hidden>{t.salaryTypes.street_promoter}</option> : null}
                      </select>
                    </FieldShell>
                    <FieldShell label={editingSalaryAmountLabel}>
                      <div className="space-y-2">
                        <input type="number" min="0" step="0.01" name="baseSalary" value={formState.baseSalary} onChange={handleInputChange} className={inputClasses()} />
                        {editingSalaryAmountHint ? <p className="text-xs text-slate-500">{editingSalaryAmountHint}</p> : null}
                      </div>
                    </FieldShell>
                    {formState.salaryType === 'package' ? (
                      <FieldShell label={t.fields.packageCommissionAmount}>
                        <input type="number" min="0" step="0.01" name="packageCommissionAmount" value={formState.packageCommissionAmount} onChange={handleInputChange} className={inputClasses()} />
                      </FieldShell>
                    ) : null}
                    <FieldShell label={t.fields.allowanceAmount}><input type="number" min="0" step="0.01" name="allowanceAmount" value={formState.allowanceAmount} onChange={handleInputChange} className={inputClasses()} /></FieldShell>
                    <FieldShell label={t.fields.attendanceBonusAmount}><input type="number" min="0" step="0.01" name="attendanceBonusAmount" value={formState.attendanceBonusAmount} onChange={handleInputChange} className={inputClasses()} /></FieldShell>
                    <FieldShell label={t.fields.transportAllowance}><input type="number" min="0" step="0.01" name="transportAllowance" value={formState.transportAllowance} onChange={handleInputChange} className={inputClasses()} /></FieldShell>
                    <FieldShell label={t.fields.briefingBonus}><input type="number" min="0" step="0.01" name="briefingBonus" value={formState.briefingBonus} onChange={handleInputChange} className={inputClasses()} /></FieldShell>
                    <FieldShell label={t.fields.bookingBonus}><input type="number" min="0" step="0.01" name="bookingBonus" value={formState.bookingBonus} onChange={handleInputChange} className={inputClasses()} /></FieldShell>
                    <FieldShell label={t.fields.officeJobAmount}><input type="number" min="0" step="0.01" name="officeJobAmount" value={formState.officeJobAmount} onChange={handleInputChange} className={inputClasses()} /></FieldShell>
                    <FieldShell label={t.fields.salaryEffectiveFrom}><input type="date" name="salaryEffectiveFrom" value={formState.salaryEffectiveFrom} onChange={handleInputChange} className={inputClasses()} /></FieldShell>
                    <FieldShell label={t.fields.salaryRemarks}><textarea name="salaryRemarks" value={formState.salaryRemarks} onChange={handleInputChange} rows={4} className={inputClasses()} /></FieldShell>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <InfoRow label={t.fields.salaryType} value={employee.salaryType ? t.salaryTypes[employee.salaryType] : t.emptyValue} />
                    <InfoRow label={viewingSalaryAmountLabel} value={formatCurrency(employee.baseSalary, locale, t.emptyValue)} />
                    {employee.salaryType === 'package' ? (
                      <InfoRow label={t.fields.packageCommissionAmount} value={formatCurrency(employee.packageCommissionAmount, locale, t.emptyValue)} />
                    ) : null}
                    <InfoRow label={t.fields.allowanceAmount} value={formatCurrency(employee.allowanceAmount, locale, t.emptyValue)} />
                    <InfoRow label={t.fields.attendanceBonusAmount} value={formatCurrency(employee.attendanceBonusAmount, locale, t.emptyValue)} />
                    <InfoRow label={t.fields.transportAllowance} value={formatCurrency(employee.transportAllowance, locale, t.emptyValue)} />
                    <InfoRow label={t.fields.briefingBonus} value={formatCurrency(employee.briefingBonus, locale, t.emptyValue)} />
                    <InfoRow label={t.fields.bookingBonus} value={formatCurrency(employee.bookingBonus, locale, t.emptyValue)} />
                    <InfoRow label={t.fields.officeJobAmount} value={formatCurrency(employee.officeJobAmount, locale, t.emptyValue)} />
                    <InfoRow label={t.fields.salaryEffectiveFrom} value={formatDate(employee.salaryEffectiveFrom, locale, t.emptyValue)} />
                    <InfoRow label={t.fields.salaryRemarks} value={renderTextValue(employee.salaryRemarks)} />
                    {viewingSalaryAmountHint ? <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">{viewingSalaryAmountHint}</div> : null}
                  </div>
                )}
              </div>
            </div>
          ) : null}

          {activeTabIndex === 4 ? (
            <div>
              <div>
                <h3 className="mb-5 flex items-center gap-2 text-base font-bold text-slate-900">
                  <div className="h-4 w-1 rounded-full bg-[#D4AF37]"></div>
                  {t.sections.commission}
                </h3>
                {isEditing ? (
                  <div className="grid gap-4">
                    <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                      <div>
                        <div className="text-base font-bold text-slate-900">{t.fields.commissionMethod}</div>
                        <div className="mt-1 text-sm text-slate-600">主佣金、BAR / Rate、街霸及電話銷售員都歸入佣金計算方式；Bonus 另外分開。</div>
                      </div>
                      <FieldShell label={t.fields.commissionMethod}>
                        <select name="commissionMethod" value={formState.commissionMethod} onChange={handleInputChange} className={inputClasses()}>
                          <option value="">{t.emptyValue}</option>
                          <option value="standard">{t.commissionMethods.standard}</option>
                          <option value="none">{t.commissionMethods.none}</option>
                          <option value="custom">{t.commissionMethods.custom}</option>
                        </select>
                      </FieldShell>
                      <div className="rounded-xl border border-[#D4AF37]/20 bg-white px-4 py-3">
                        <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">{savedPresetsLabel}</div>
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => setFormState((prev) => createBlankCommissionPlanState(prev))}
                            className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
                          >
                            新增佣金方案
                          </button>
                          {commissionPresetOptions.map((preset) => (
                            <div key={preset.id} className="flex overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                              <button
                                type="button"
                                onClick={() => setFormState((prev) => applyCommissionPresetToState(prev, preset))}
                                className="px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                              >
                                套用 {preset.name}
                              </button>
                              <button
                                type="button"
                                onClick={() => renameSavedPreset('commission', preset.id, preset.name)}
                                className="border-l border-slate-200 px-2.5 py-2 text-xs font-semibold text-slate-500 hover:bg-white hover:text-slate-800"
                              >
                                改名
                              </button>
                            </div>
                          ))}
                          {!hasYanLySavedPreset ? (
                            <button
                              type="button"
                              onClick={() => setFormState((prev) => ({
                                ...prev,
                                commissionMethod: 'custom',
                                commissionCustomName: 'Yan/LY BAR',
                                commissionCustomTiers: '',
                                commissionRules: serializeCommissionRules([...createYanLyBarCommissionRulesForEditor(), ...normalizeCommissionRules(parseJsonSafely(prev.commissionRules)).filter((rule) => rule.metric === 'shop')]),
                              }))}
                              className="rounded-xl border border-[#D4AF37]/30 bg-[#D4AF37]/10 px-3 py-2 text-xs font-semibold text-[#8E6F12] hover:bg-[#D4AF37]/15"
                            >
                              套用 Yan/LY BAR
                            </button>
                          ) : null}
                        </div>
                      </div>
                      <div>
                        <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">可疊加佣金項目</div>
                        <div className="grid gap-3 lg:grid-cols-2">
                          <label className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-3 cursor-pointer">
                            <input type="checkbox" name="streetPromoterEnabled" checked={formState.streetPromoterEnabled === 'true'} onChange={(e) => setFormState((prev) => ({ ...prev, streetPromoterEnabled: e.target.checked ? 'true' : 'false' }))} className="h-4 w-4 rounded border-slate-300 text-[#D4AF37] focus:ring-[#D4AF37]" />
                            <span className="text-sm font-medium text-slate-700">{t.fields.streetPromoterEnabled}</span>
                          </label>
                          <label className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-3 cursor-pointer">
                            <input type="checkbox" name="telesalesEnabled" checked={formState.telesalesEnabled === 'true'} onChange={(e) => setFormState((prev) => ({ ...prev, telesalesEnabled: e.target.checked ? 'true' : 'false' }))} className="h-4 w-4 rounded border-slate-300 text-[#D4AF37] focus:ring-[#D4AF37]" />
                            <span className="text-sm font-medium text-slate-700">{t.fields.telesalesEnabled}</span>
                          </label>
                        </div>
                      </div>
                      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                        <label className="flex items-start gap-3 cursor-pointer">
                          <input type="checkbox" name="payrollIgnoreCommissionReview" checked={formState.payrollIgnoreCommissionReview === 'true'} onChange={(e) => setFormState((prev) => ({ ...prev, payrollIgnoreCommissionReview: e.target.checked ? 'true' : 'false' }))} className="mt-1 h-4 w-4 rounded border-amber-300 text-[#D4AF37] focus:ring-[#D4AF37]" />
                          <span>
                            <span className="block text-sm font-semibold text-slate-800">{t.fields.payrollIgnoreCommissionReview}</span>
                            <span className="mt-1 block text-xs leading-5 text-slate-600">此員工暫不屬於佣金同事，Payroll 匯出檢查不再提示「有佣金設定但今月無業績」。如轉返佣金同事，取消勾選即可恢復提示。</span>
                          </span>
                        </label>
                      </div>
                      {(formState.streetPromoterEnabled === 'true' || formState.telesalesEnabled === 'true') ? specialCommissionRulesCard : null}
                      <div className="rounded-xl border border-slate-200 bg-white p-4">
                        <FieldShell label={t.fields.salesAmountRatePercent}>
                          <div className="space-y-2">
                            <input type="number" min="0" step="0.01" name="salesAmountRatePercent" value={formState.salesAmountRatePercent} onChange={handleInputChange} className={inputClasses()} />
                            <p className="text-xs text-slate-500">按銷售總金額乘返百分比，唔屬於鋪數 target 計法。</p>
                          </div>
                        </FieldShell>
                      </div>
                    </div>
                    {formState.commissionMethod === 'standard' ? (
                      <CommissionRateTableCard
                        title={t.sections.commissionRateTable}
                        tiers={commissionTiers}
                        labels={t.tierCard}
                        locale={locale}
                      />
                    ) : null}
                    {isCustomCommissionSelected && (
                        <CommissionRulesEditor
                          rules={commissionRulesForEditor}
                          onChange={(rules) => setFormState((prev) => ({ ...prev, commissionRules: mergeCommissionRulesWithCurrentShop(prev.commissionRules, rules), commissionCustomTiers: '' }))}
                          onSavePreset={handleSaveCommissionPreset}
                          isSavingPreset={savingPreset === 'commission'}
                        />
                    )}
                    <div className="mt-2 border-t border-slate-100 pt-4">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" name="salesBonusEnabled" checked={formState.salesBonusEnabled === 'true'} onChange={(e) => setFormState((prev) => ({ ...prev, salesBonusEnabled: e.target.checked ? 'true' : 'false', payrollBonusEnabled: e.target.checked ? 'true' : 'false', payrollBonusScheme: e.target.checked ? prev.payrollBonusScheme : '', salesBonusRate: '', salesBonusCustomName: e.target.checked ? prev.salesBonusCustomName : '', salesBonusCustomTiers: e.target.checked ? prev.salesBonusCustomTiers : '' }))} className="h-4 w-4 rounded border-slate-300 text-[#D4AF37] focus:ring-[#D4AF37]" />
                        <span className="text-sm font-medium text-slate-700">{t.fields.salesBonusEnabled}</span>
                      </label>
                    </div>
                    {formState.salesBonusEnabled === 'true' && (
                      <>
                        <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
                          {t.payrollBonusNote}
                        </div>
                        <FieldShell label={t.fields.payrollBonusScheme}>
                          <select name="payrollBonusScheme" value={formState.payrollBonusScheme} onChange={handleInputChange} className={inputClasses()}>
                            <option value="">{t.emptyValue}</option>
                            <option value="bonus_1">{t.payrollBonusSchemeOptions.bonus_1}</option>
                            <option value="bonus_2">{t.payrollBonusSchemeOptions.bonus_2}</option>
                            <option value="custom">{t.payrollBonusSchemeOptions.custom}</option>
                            {savedPayrollBonusPresets.length > 0 ? (
                              <optgroup label={savedPresetsLabel}>
                                {savedPayrollBonusPresets.map((preset) => (
                                  <option key={preset.id} value={getPresetSelectValue(preset.id)}>{preset.name}</option>
                                ))}
                              </optgroup>
                            ) : null}
                          </select>
                        </FieldShell>
                        {isCustomBonusSelected ? (
                          <CustomPayrollBonusTierEditor
                            tiers={customBonusTiers}
                            onChange={(tiers) => setFormState((prev) => ({ ...prev, salesBonusCustomTiers: serializePayrollBonusTiers(tiers) }))}
                            onCopyStandard={() => setFormState((prev) => ({ ...prev, salesBonusCustomTiers: serializePayrollBonusTiers(createDefaultCustomBonusTiers(standardPayrollBonusSchemes)) }))}
                            customName={formState.salesBonusCustomName}
                            onCustomNameChange={(value) => setFormState((prev) => ({ ...prev, salesBonusCustomName: value }))}
                            title={customBonusTitle}
                            labels={t.customBonusEditor}
                          />
                        ) : null}
                        {formState.payrollBonusScheme === 'bonus_1' || formState.payrollBonusScheme === 'bonus_2' ? (
                          <PayrollBonusSchemePreview tiers={standardPayrollBonusSchemes[formState.payrollBonusScheme] ?? []} title={t.payrollBonusSchemeOptions[formState.payrollBonusScheme]} />
                        ) : null}
                      </>
                    )}
                    <div className="mt-2 border-t border-slate-100 pt-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input type="checkbox" name="shopBonusEnabled" checked={formState.shopBonusEnabled === 'true'} onChange={(e) => setFormState((prev) => {
                            const nextEnabled = e.target.checked;
                            return {
                              ...prev,
                              shopBonusEnabled: nextEnabled ? 'true' : 'false',
                              shopBonusScheme: nextEnabled ? prev.shopBonusScheme : '',
                              shopBonusCustomName: nextEnabled ? prev.shopBonusCustomName : '',
                              shopBonusCustomTiers: nextEnabled ? prev.shopBonusCustomTiers : '',
                              commissionRules: nextEnabled
                                ? prev.commissionRules
                                : serializeCommissionRules(normalizeCommissionRules(parseJsonSafely(prev.commissionRules)).filter((rule) => rule.metric !== 'shop')),
                            };
                          })} className="h-4 w-4 rounded border-slate-300 text-[#D4AF37] focus:ring-[#D4AF37]" />
                          <span className="text-sm font-medium text-slate-700">{t.fields.shopBonusEnabled}</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => setFormState((prev) => createBlankShopCommissionPlanState(prev))}
                          className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
                        >
                          新增鋪數方案
                        </button>
                      </div>
                    </div>
                    {formState.shopBonusEnabled === 'true' && (
                      <>
                        <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
                          {t.shopBonusNote}
                        </div>
                        <FieldShell label={t.fields.shopBonusScheme}>
                          <select name="shopBonusScheme" value={formState.shopBonusScheme} onChange={handleInputChange} className={inputClasses()}>
                            <option value="">{t.emptyValue}</option>
                            <option value="standard">{t.shopBonusSchemeOptions.standard}</option>
                            <option value="custom">{t.shopBonusSchemeOptions.custom}</option>
                          </select>
                        </FieldShell>
                        {isCustomShopBonusSelected ? (
                          <>
                            {shopCommissionPresetOptions.length > 0 ? (
                              <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 px-4 py-3">
                                <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-emerald-700">{savedPresetsLabel}</div>
                                <div className="flex flex-wrap gap-2">
                                  {shopCommissionPresetOptions.map((preset) => (
                                    <div key={preset.id} className="flex overflow-hidden rounded-xl border border-emerald-200 bg-white">
                                      <button
                                        type="button"
                                        onClick={() => setFormState((prev) => applyShopCommissionPresetToState(prev, preset))}
                                        className="px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
                                      >
                                        套用 {preset.name}
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => renameSavedPreset('shop', preset.id, preset.name)}
                                        className="border-l border-emerald-200 px-2.5 py-2 text-xs font-semibold text-emerald-600 hover:bg-emerald-50 hover:text-emerald-800"
                                      >
                                        改名
                                      </button>
                                    </div>
                                  ))}
                                  <button
                                    type="button"
                                    onClick={() => setFormState((prev) => createBlankShopCommissionPlanState(prev))}
                                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                                  >
                                    新增鋪數百分比方案
                                  </button>
                                </div>
                              </div>
                            ) : null}
                            {shopCommissionRules.length > 0 ? (
                              <ShopCommissionRulesEditor
                                rules={shopCommissionRules}
                                onChange={(rules) => setFormState((prev) => ({ ...prev, commissionRules: mergeCommissionRulesWithCurrentMain(prev.commissionRules, rules), commissionCustomTiers: '' }))}
                                onSavePreset={handleSaveShopCommissionPreset}
                                isSavingPreset={savingPreset === 'shop'}
                                onClear={() => setFormState((prev) => ({
                                  ...prev,
                                  shopBonusCustomName: '',
                                  shopBonusCustomTiers: serializeShopBonusTiers(createDefaultShopBonusTiers(standardShopBonusTiers)),
                                  commissionRules: mergeCommissionRulesWithCurrentMain(prev.commissionRules, []),
                                  commissionCustomTiers: '',
                                }))}
                              />
                            ) : (
                              <CustomShopBonusTierEditor
                                tiers={customShopBonusTiers}
                                onChange={(tiers) => setFormState((prev) => ({ ...prev, shopBonusCustomTiers: serializeShopBonusTiers(tiers) }))}
                                onCopyStandard={() => setFormState((prev) => ({ ...prev, shopBonusCustomTiers: serializeShopBonusTiers(createDefaultShopBonusTiers(standardShopBonusTiers)) }))}
                                customName={formState.shopBonusCustomName}
                                onCustomNameChange={(value) => setFormState((prev) => ({ ...prev, shopBonusCustomName: value }))}
                                title={customShopBonusTitle}
                                labels={t.customShopBonusEditor}
                              />
                            )}
                          </>
                        ) : null}
                        {formState.shopBonusScheme === 'standard' ? (
                          <ShopBonusSchemePreview tiers={standardShopBonusTiers} title={t.shopBonusSchemeOptions.standard} />
                        ) : null}
                      </>
                    )}
                    <FieldShell label={t.fields.commissionNotes}><textarea name="commissionNotes" value={formState.commissionNotes} onChange={handleInputChange} rows={4} className={inputClasses()} /></FieldShell>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <InfoRow label={t.fields.commissionMethod} value={appliedCommissionDisplayName} />
                    <InfoRow label={t.fields.streetPromoterEnabled} value={employee.streetPromoterEnabled ? t.booleanLabels.yes : t.booleanLabels.no} />
                    <InfoRow label={t.fields.telesalesEnabled} value={employee.telesalesEnabled ? t.booleanLabels.yes : t.booleanLabels.no} />
                    <InfoRow label={t.fields.payrollIgnoreCommissionReview} value={employee.payrollIgnoreCommissionReview ? t.booleanLabels.yes : t.booleanLabels.no} />
                    {(employee.streetPromoterEnabled || employee.telesalesEnabled) ? specialCommissionRulesCard : null}
                    {employee.salesAmountRatePercent !== null && Number.isFinite(employee.salesAmountRatePercent) ? <InfoRow label={t.fields.salesAmountRatePercent} value={`${employee.salesAmountRatePercent}%`} /> : null}
                    {employee.commissionMethod === 'standard' ? (
                      <CommissionRateTableCard
                        title={t.sections.commissionRateTable}
                        tiers={commissionTiers}
                        labels={t.tierCard}
                        locale={locale}
                      />
                    ) : null}
                    <CommissionRulesPreview rules={employeeMainCommissionRules} />
                    <InfoRow label={t.fields.salesBonusEnabled} value={employee.salesBonusEnabled || employee.payrollBonusEnabled ? t.booleanLabels.yes : t.booleanLabels.no} />
                    {(employee.salesBonusEnabled || employee.payrollBonusEnabled) && (employee.payrollBonusScheme || employee.salesBonusRate !== null) && (
                      <>
                        <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
                          {t.payrollBonusNote}
                        </div>
                        <InfoRow label={t.fields.payrollBonusScheme} value={employee.payrollBonusScheme === 'custom' ? employeeCustomBonusTitle : employee.payrollBonusScheme ? t.payrollBonusSchemeOptions[employee.payrollBonusScheme] : t.payrollBonusSchemeOptions.custom} />
                        {employee.payrollBonusScheme === 'bonus_1' || employee.payrollBonusScheme === 'bonus_2' ? (
                          <>
                            <PayrollBonusSchemePreview tiers={standardPayrollBonusSchemes[employee.payrollBonusScheme] ?? []} title={t.payrollBonusSchemeOptions[employee.payrollBonusScheme]} />
                          </>
                        ) : (
                          <PayrollBonusSchemePreview tiers={employeeCustomBonusTiers} title={employeeCustomBonusTitle} />
                        )}
                      </>
                    )}
                    <InfoRow label={t.fields.shopBonusEnabled} value={employeeHasShopSetup ? `${t.booleanLabels.yes} - ${appliedShopDisplayName}` : t.booleanLabels.no} />
                    {employeeHasShopSetup ? (
                      <>
                        <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
                          {t.shopBonusNote}
                        </div>
                        <InfoRow label={t.fields.shopBonusScheme} value={appliedShopDisplayName} />
                        {employeeShopCommissionRules.length > 0 ? (
                          <CommissionRulesPreview rules={employeeShopCommissionRules} title="已套用鋪數方案" />
                        ) : employee.shopBonusScheme === 'custom' ? (
                          <>
                            <ShopBonusSchemePreview tiers={employeeCustomShopBonusTiers} title={employeeCustomShopBonusTitle} />
                          </>
                        ) : (
                          <ShopBonusSchemePreview tiers={standardShopBonusTiers} title={t.shopBonusSchemeOptions.standard} />
                        )}
                      </>
                    ) : null}
                    <InfoRow label={t.fields.commissionNotes} value={renderTextValue(employee.commissionNotes)} />
                  </div>
                )}
              </div>
            </div>
          ) : null}

          {activeTabIndex === 5 ? <EmployeeDocumentManager employee={employee} documents={employee.documents} locale={locale} t={t} /> : null}

          {activeTabIndex === 6 ? (
            <div className="space-y-4">
              <div className="mb-2 flex items-center gap-2 text-base font-bold text-slate-900">
                <div className="h-4 w-1 rounded-full bg-slate-900"></div>
                {t.sections.visas}
              </div>
              {employee.visas.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-8 text-sm text-slate-500">{t.fields.noVisas}</div>
              ) : (
                <div className="overflow-hidden rounded-2xl border border-slate-200">
                  <div className="grid grid-cols-[160px_160px_140px_120px_minmax(0,1fr)] gap-4 border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    <div>{t.fields.visaType}</div>
                    <div>{t.fields.visaNumber}</div>
                    <div>{t.fields.expiryDate}</div>
                    <div>{t.fields.visaStatus}</div>
                    <div>{t.fields.reminderDays}</div>
                  </div>
                  <div className="divide-y divide-slate-100 bg-white">
                    {employee.visas.map((visa) => (
                      <div key={visa.id} className="grid grid-cols-[160px_160px_140px_120px_minmax(0,1fr)] gap-4 px-4 py-4 text-sm text-slate-700">
                        <div>{visa.visaType}</div>
                        <div>{visa.visaNumber || t.emptyValue}</div>
                        <div>{formatDate(visa.expiryDate, locale, t.emptyValue)}</div>
                        <div>{visa.status}</div>
                        <div>{visa.reminderDays.length > 0 ? visa.reminderDays.join(', ') : t.emptyValue}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : null}

          {activeTabIndex === 7 ? (
            <div className="space-y-8">
              <div>
                <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="mb-2 flex items-center gap-2 text-base font-bold text-slate-900">
                      <div className="h-4 w-1 rounded-full bg-[#D4AF37]"></div>
                      IR56B 報稅資料
                    </h3>
                    <p className="text-sm leading-6 text-slate-500">已自動整合員工基本資料、身份證明、入職/離職日期、公司/分店及薪金設定；以下只需補充 IR56B 額外資料。</p>
                  </div>
                  <button type="button" onClick={handleExportIr56bXml} className="flex items-center gap-2 rounded-lg bg-[#D4AF37] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#B8871A]">
                    <Download className="h-4 w-4" />
                    匯出 IR56B XML
                  </button>
                </div>
                <div className="mb-6 rounded-2xl border border-amber-100 bg-amber-50/60 p-4 text-sm text-slate-700">
                  <div className="mb-3 font-bold text-slate-900">已整合資料</div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <InfoRow label="姓名 / 員工編號" value={`${displayName} / ${employee.employeeCode}`} />
                    <InfoRow label="證件資料" value={`${t.identityTypes[employee.identityType]} ${employee.identityNumber}`} />
                    <InfoRow label="出生日期" value={formatDate(employee.dateOfBirth, locale, t.emptyValue)} />
                    <InfoRow label="公司 / 分店" value={`${employee.companyNameZh || employee.companyNameEn || employee.companyType} / ${employee.branchNameZh || employee.branchNameEn || employee.branchCode || t.emptyValue}`} />
                    <InfoRow label="入職 / 離職" value={`${formatDate(employee.hireDate, locale, t.emptyValue)} / ${formatDate(employee.employmentEndDate, locale, t.emptyValue)}`} />
                    <InfoRow label="薪金設定" value={`${employee.salaryType ?? t.emptyValue} / ${employee.baseSalary === null ? t.emptyValue : employee.baseSalary}`} />
                  </div>
                </div>
                {isEditing ? (
                  <div className="grid gap-4 md:grid-cols-2">
                    <FieldShell label="婚姻狀況">
                      <select name="ir56bMaritalStatus" value={formState.ir56bMaritalStatus} onChange={handleInputChange} className={inputClasses()}>
                        <option value="">{t.emptyValue}</option>
                        <option value="1">1 - 未婚 / 喪偶 / 離婚 / 分開居住</option>
                        <option value="2">2 - 已婚</option>
                      </select>
                    </FieldShell>
                    <FieldShell label="住址來源">
                      <button type="button" onClick={() => {
                        const nextAddress = splitAddressForIr56b(formState.address || employee.address);
                        setFormState((current) => ({
                          ...current,
                          ir56bResAddressLine1: nextAddress.line1,
                          ir56bResAddressLine2: nextAddress.line2,
                          ir56bResAddressLine3: nextAddress.line3,
                          ir56bResAddressArea: inferIr56bAddressArea(current.address || employee.address),
                        }));
                      }} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50">
                        使用基本資料地址：{formState.address || employee.address || t.emptyValue}
                      </button>
                    </FieldShell>
                    <FieldShell label="住址地區">
                      <select name="ir56bResAddressArea" value={formState.ir56bResAddressArea} onChange={handleInputChange} className={inputClasses()}>
                        <option value="">{t.emptyValue}</option>
                        <option value="H">H - 香港</option>
                        <option value="K">K - 九龍</option>
                        <option value="N">N - 新界</option>
                        <option value="F">F - 其他</option>
                      </select>
                    </FieldShell>
                    <FieldShell label="住址第 1 行"><input name="ir56bResAddressLine1" value={formState.ir56bResAddressLine1} onChange={handleInputChange} className={inputClasses()} /></FieldShell>
                    <FieldShell label="住址第 2 行"><input name="ir56bResAddressLine2" value={formState.ir56bResAddressLine2} onChange={handleInputChange} className={inputClasses()} /></FieldShell>
                    <FieldShell label="住址第 3 行"><input name="ir56bResAddressLine3" value={formState.ir56bResAddressLine3} onChange={handleInputChange} className={inputClasses()} /></FieldShell>
                    {formState.ir56bMaritalStatus === '2' ? (
                      <>
                        <FieldShell label="配偶姓名"><input name="ir56bSpouseName" value={formState.ir56bSpouseName} onChange={handleInputChange} className={inputClasses()} /></FieldShell>
                        <FieldShell label="配偶 HKID / Passport"><input name="ir56bSpouseHkid" value={formState.ir56bSpouseHkid || formState.ir56bSpousePassport} onChange={(event) => setFormState((current) => ({ ...current, ir56bSpouseHkid: event.target.value, ir56bSpousePassport: '' }))} className={inputClasses()} /></FieldShell>
                      </>
                    ) : null}
                    <FieldShell label="僱主有否提供居所">
                      <select name="ir56bPlaceOfResidenceIndicator" value={formState.ir56bPlaceOfResidenceIndicator} onChange={handleInputChange} className={inputClasses()}>
                        <option value="0">0 - 沒有</option>
                        <option value="1">1 - 有</option>
                      </select>
                    </FieldShell>
                    <FieldShell label="有否非香港公司支付薪酬">
                      <select name="ir56bOverseasCompanyIndicator" value={formState.ir56bOverseasCompanyIndicator} onChange={handleInputChange} className={inputClasses()}>
                        <option value="0">0 - 沒有</option>
                        <option value="1">1 - 有</option>
                      </select>
                    </FieldShell>
                    <div className="md:col-span-2">
                      <FieldShell label="報稅備註"><textarea name="ir56bRemarks" value={formState.ir56bRemarks} onChange={handleInputChange} rows={3} className={inputClasses()} /></FieldShell>
                    </div>
                  </div>
                ) : (
                  <div className="grid gap-x-12 gap-y-8 md:grid-cols-2">
                    <div className="space-y-4">
                      <InfoRow label="婚姻狀況" value={employee.ir56bProfile.maritalStatus === '1' ? '1 - 未婚 / 喪偶 / 離婚 / 分開居住' : employee.ir56bProfile.maritalStatus === '2' ? '2 - 已婚' : t.emptyValue} />
                      <InfoRow label="住址第 1 行" value={renderTextValue(ir56bAddress.line1)} />
                      <InfoRow label="住址第 2 行" value={renderTextValue(ir56bAddress.line2)} />
                      <InfoRow label="住址第 3 行" value={renderTextValue(ir56bAddress.line3)} />
                      <InfoRow label="住址地區" value={renderTextValue(ir56bAddress.area)} />
                      <InfoRow label="僱主提供居所" value={employee.ir56bProfile.placeOfResidenceIndicator === '1' ? t.booleanLabels.yes : t.booleanLabels.no} />
                    </div>
                    <div className="space-y-4">
                      <InfoRow label="配偶姓名" value={renderTextValue(employee.ir56bProfile.spouseName)} />
                      <InfoRow label="配偶 HKID / Passport" value={renderTextValue(employee.ir56bProfile.spouseHkid || employee.ir56bProfile.spousePassport)} />
                      <InfoRow label="非香港公司支付薪酬" value={employee.ir56bProfile.overseasCompanyIndicator === '1' ? t.booleanLabels.yes : t.booleanLabels.no} />
                      <InfoRow label="報稅備註" value={renderTextValue(employee.ir56bProfile.remarks)} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </form>
  );
}
