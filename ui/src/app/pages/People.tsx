"use client";

import { useMemo, useState, useTransition, type FormEvent } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Download, Plus, Search, MoreHorizontal, Phone, Sparkles, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useLanguage, useTranslation } from '../i18n/LanguageContext';
import type { EmployeeDirectoryOption, EmployeeDirectoryRecord, EmployeeIr56bExportRecord } from '@/src/lib/employees/queries';
import { createEmployee } from '@/app/app/people/actions';
import { calculateProbationEndDate, EMPLOYEE_EMPLOYMENT_TYPES, type EmployeeEmploymentType } from '@/src/lib/employees/employment';

const translations = {
  'zh-TW': {
    title: '員工目錄',
    subtitle: '管理員工基本資料、公司架構歸屬及聘用狀態。',
    addBtn: '新增員工',
    searchPlaceholder: '搜尋員工編號、姓名、別名或職位...',
    allCompanies: '所有公司',
    allBranches: '所有分店',
    allTypes: '所有類型',
    allStatuses: '所有狀態',
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
    genders: {
      male: '男',
      female: '女',
      other: '其他',
    },
    paymentMethods: {
      autopay: '自動轉帳',
      cash: '現金',
      cheque: '支票',
      fps: 'FPS',
    },
    table: {
      employee: '員工',
      employeeCode: '員工編號',
      position: '職位',
      branch: '分店',
      company: '公司類型',
      employmentType: '聘用類型',
      phone: '電話',
      status: '狀態',
      leaveDays: '大假',
      actions: '操作',
    },
    empty: '未有符合條件的員工資料。',
    searchSuggestions: '搜尋建議',
    searchHint: '可直接按建議打開員工資料。',
    prev: '上一頁',
    next: '下一頁',
    rows: '名員工',
    modal: {
      title: '新增員工',
      subtitle: '員工號碼及 ASA / ASAS 係兩個獨立欄位，需分開輸入。',
      required: '必填欄位',
      employeeCode: '員工號碼',
      company: '所屬公司',
      branch: '分店',
      department: '部門',
      nameZh: '中文姓名',
      nameEn: '英文姓名',
      alias: '別名',
      gender: '性別',
      identityNumber: '身份證號碼',
      phone: '電話',
      position: '職位',
      hireDate: '入職日期',
      employmentType: '聘用類型',
      status: '員工狀態',
      annualLeaveDays: '大假天數',
      probationMonths: '試用期(月)',
      probationEndDate: '試用期完結日',
      employmentEndDate: '離職 / 合約完結日',
      notes: '備註',
      dateOfBirth: '出生日期',
      address: '地址',
      bank: '銀行',
      bankAccountNumber: '銀行戶口',
      paymentMethod: '出糧方法',
      save: '儲存員工',
      saving: '儲存中...',
      cancel: '取消',
      success: '員工資料已新增。',
      errors: {
        generic: '新增員工失敗，請稍後再試。',
      },
    },
    structure: {
      title: '員工資料結構',
      note: '員工號碼只係識別碼；ASA / ASAS 係獨立公司類型欄位，兩者冇任何對應規則。',
      groups: {
        identity: '識別資料',
        personal: '個人資料',
        employment: '聘用資料',
        payroll: '出糧資料',
      },
    },
  },
  'zh-CN': {
    title: '员工目录',
    subtitle: '管理员工基本资料、公司架构归属及雇佣状态。',
    addBtn: '新增员工',
    searchPlaceholder: '搜索员工编号、姓名、别名或职位...',
    allCompanies: '所有公司',
    allBranches: '所有分店',
    allTypes: '所有类型',
    allStatuses: '所有状态',
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
    genders: {
      male: '男',
      female: '女',
      other: '其他',
    },
    paymentMethods: {
      autopay: '自动转账',
      cash: '现金',
      cheque: '支票',
      fps: 'FPS',
    },
    table: {
      employee: '员工',
      employeeCode: '员工编号',
      position: '职位',
      branch: '分店',
      company: '公司类型',
      employmentType: '雇佣类型',
      phone: '电话',
      status: '状态',
      leaveDays: '年假',
      actions: '操作',
    },
    empty: '没有符合条件的员工资料。',
    searchSuggestions: '搜索建议',
    searchHint: '可直接按建议打开员工资料。',
    prev: '上一页',
    next: '下一页',
    rows: '名员工',
    modal: {
      title: '新增员工',
      subtitle: '员工编号及 ASA / ASAS 是两个独立字段，需要分开输入。',
      required: '必填字段',
      employeeCode: '员工编号',
      company: '所属公司',
      branch: '分店',
      department: '部门',
      nameZh: '中文姓名',
      nameEn: '英文姓名',
      alias: '别名',
      gender: '性别',
      identityNumber: '身份证号码',
      phone: '电话',
      position: '职位',
      hireDate: '入职日期',
      employmentType: '雇佣类型',
      status: '员工状态',
      annualLeaveDays: '年假天数',
      probationMonths: '试用期(月)',
      probationEndDate: '试用期结束日',
      employmentEndDate: '离职 / 合同结束日',
      notes: '备注',
      dateOfBirth: '出生日期',
      address: '地址',
      bank: '银行',
      bankAccountNumber: '银行账户',
      paymentMethod: '发薪方式',
      save: '保存员工',
      saving: '保存中...',
      cancel: '取消',
      success: '员工资料已新增。',
      errors: {
        generic: '新增员工失败，请稍后再试。',
      },
    },
    structure: {
      title: '员工资料结构',
      note: '员工编号只是识别码；ASA / ASAS 是独立公司类型字段，两者没有任何对应规则。',
      groups: {
        identity: '识别资料',
        personal: '个人资料',
        employment: '雇佣资料',
        payroll: '发薪资料',
      },
    },
  },
  en: {
    title: 'Employee Directory',
    subtitle: 'Manage employee records, organization assignments, and employment status.',
    addBtn: 'Add Employee',
    searchPlaceholder: 'Search by code, name, alias, or role...',
    allCompanies: 'All Companies',
    allBranches: 'All Branches',
    allTypes: 'All Types',
    allStatuses: 'All Statuses',
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
    genders: {
      male: 'Male',
      female: 'Female',
      other: 'Other',
    },
    paymentMethods: {
      autopay: 'Autopay',
      cash: 'Cash',
      cheque: 'Cheque',
      fps: 'FPS',
    },
    table: {
      employee: 'Employee',
      employeeCode: 'Employee Code',
      position: 'Position',
      branch: 'Branch',
      company: 'Company',
      employmentType: 'Employment Type',
      phone: 'Phone',
      status: 'Status',
      leaveDays: 'Annual Leave',
      actions: 'Actions',
    },
    empty: 'No employees match the current filters.',
    searchSuggestions: 'Search Suggestions',
    searchHint: 'Select a suggestion to open the employee profile directly.',
    prev: 'Prev',
    next: 'Next',
    rows: 'employees',
    modal: {
      title: 'Add Employee',
      subtitle: 'Employee code and ASA / ASAS are separate fields and must be entered independently.',
      required: 'Required fields',
      employeeCode: 'Employee Code',
      company: 'Company',
      branch: 'Branch',
      department: 'Department',
      nameZh: 'Chinese Name',
      nameEn: 'English Name',
      alias: 'Alias',
      gender: 'Gender',
      identityNumber: 'ID Number',
      phone: 'Phone',
      position: 'Position',
      hireDate: 'Hire Date',
      employmentType: 'Employment Type',
      status: 'Status',
      annualLeaveDays: 'Annual Leave Days',
      probationMonths: 'Probation (Months)',
      probationEndDate: 'Probation End Date',
      employmentEndDate: 'Employment End Date',
      notes: 'Notes',
      dateOfBirth: 'Date of Birth',
      address: 'Address',
      bank: 'Bank',
      bankAccountNumber: 'Bank Account',
      paymentMethod: 'Payment Method',
      save: 'Save Employee',
      saving: 'Saving...',
      cancel: 'Cancel',
      success: 'Employee record created.',
      errors: {
        generic: 'Failed to create employee. Please try again later.',
      },
    },
    structure: {
      title: 'Employee Data Structure',
      note: 'Employee code is only an identifier; ASA / ASAS is a separate company type field with no mapping rule.',
      groups: {
        identity: 'Identity',
        personal: 'Personal',
        employment: 'Employment',
        payroll: 'Payroll',
      },
    },
  },
};

type PeopleProps = {
  employees: EmployeeDirectoryRecord[];
  ir56bExportRecords?: EmployeeIr56bExportRecord[];
  ir56bAssessmentYear?: number;
  onIr56bAssessmentYearChange?: (year: number) => void;
  positions: EmployeeDirectoryOption[];
  banks: EmployeeDirectoryOption[];
  companies: EmployeeDirectoryOption[];
  branches: EmployeeDirectoryOption[];
};

function escapeXml(value: unknown) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function splitAddressForIr56b(address: string | null | undefined) {
  const normalized = (address ?? '').replace(/\s+/g, ' ').trim();
  if (!normalized) return { line1: '', line2: '', line3: '' };
  const explicitLines = normalized.split(/\s*(?:\n|,|，)\s*/).map((line) => line.trim()).filter(Boolean);
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

function getIr56bAddress(record: EmployeeIr56bExportRecord) {
  const fallback = splitAddressForIr56b(record.address);
  return {
    line1: record.ir56bProfile.resAddressLine1 ?? fallback.line1,
    line2: record.ir56bProfile.resAddressLine2 ?? fallback.line2,
    line3: record.ir56bProfile.resAddressLine3 ?? fallback.line3,
    area: record.ir56bProfile.resAddressArea ?? inferIr56bAddressArea(record.address),
  };
}

function validateIr56bRecord(record: EmployeeIr56bExportRecord) {
  const address = getIr56bAddress(record);
  const missing: string[] = [];

  if (!record.nameEn && !record.nameZh) missing.push('姓名');
  if (!record.identityNumber) missing.push('HKID / Passport');
  if (!record.dateOfBirth) missing.push('出生日期');
  if (!record.hireDate) missing.push('入職日期');
  if (!address.line1) missing.push('IR56B 住址第 1 行 / 基本資料地址');
  if (!address.area) missing.push('IR56B 住址地區');
  if (!record.ir56bProfile.maritalStatus) missing.push('婚姻狀況');
  if (!record.salaryType) missing.push('薪金類型');
  if (record.ir56bIncome.payrollMonths.length === 0) missing.push(`Payroll records ${record.ir56bIncome.assessmentYear - 1}-04 至 ${record.ir56bIncome.assessmentYear}-03`);
  if (record.ir56bIncome.totalIncome <= 0) missing.push('IR56B 年度總入息');

  return missing;
}

type Ir56bEmployerHeader = {
  section: string;
  ern: string;
  assessmentYear: number;
  submissionDate: string;
  employerName: string;
  signerName: string;
  designation: string;
  typeOfForm: 'O' | 'A' | 'R' | 'S';
};

function formatIrdDate(value: string | null | undefined) {
  return (value ?? '').replace(/-/g, '');
}

function formatIrdAmount(value: number) {
  return String(Math.max(0, Math.round(Number.isFinite(value) ? value : 0)));
}

function formatIrdSheetNo(index: number) {
  return String(index + 1).padStart(6, '0');
}

function formatIrdRecordCount(count: number) {
  return String(count).padStart(5, '0');
}

function getAssessmentPeriod(assessmentYear: number) {
  const start = `${assessmentYear - 1}0401`;
  const end = `${assessmentYear}0331`;
  return { start, end, period: `${start} - ${end}` };
}

function normalizeIrdHkid(identityType: EmployeeIr56bExportRecord['identityType'], identityNumber: string | null | undefined) {
  if (identityType !== 'hkid') return '';
  const normalized = (identityNumber ?? '').toUpperCase().replace(/[()\s-]/g, '');
  if (!normalized) return '';
  return normalized.length === 8 ? ` ${normalized}` : normalized.slice(0, 9);
}

function getPassportValue(identityType: EmployeeIr56bExportRecord['identityType'], identityNumber: string | null | undefined) {
  return identityType === 'hkid' ? '' : (identityNumber ?? '').slice(0, 40);
}

function splitEnglishName(name: string | null | undefined) {
  const normalized = (name ?? '').trim().replace(/\s+/g, ' ');
  if (!normalized) return { surname: '', givenName: '' };
  if (normalized.includes(',')) {
    const [surname, ...givenParts] = normalized.split(',');
    return { surname: surname.trim().slice(0, 20).toUpperCase(), givenName: givenParts.join(',').trim().slice(0, 55).toUpperCase() };
  }
  const parts = normalized.split(' ');
  return { surname: (parts[0] ?? '').slice(0, 20).toUpperCase(), givenName: parts.slice(1).join(' ').slice(0, 55).toUpperCase() };
}

function getIrdSex(gender: EmployeeDirectoryRecord['gender']) {
  return gender === 'male' ? 'M' : gender === 'female' ? 'F' : '';
}

function truncateIrd(value: string | null | undefined, maxLength: number) {
  return (value ?? '').slice(0, maxLength);
}

function createBulkIr56bXml(records: EmployeeIr56bExportRecord[], header: Ir56bEmployerHeader) {
  const assessmentPeriod = getAssessmentPeriod(header.assessmentYear);
  const totalIncomeBatch = records.reduce((sum, record) => sum + record.ir56bIncome.totalIncome, 0);
  const entries = records.map((record, index) => {
    const address = getIr56bAddress(record);
    const englishName = splitEnglishName(record.nameEn || record.alias || record.nameZh);
    const salaryPeriod = record.ir56bIncome.salary > 0 ? assessmentPeriod.period : '';
    const commissionPeriod = record.ir56bIncome.commission > 0 ? assessmentPeriod.period : '';
    const bonusPeriod = record.ir56bIncome.bonus > 0 ? assessmentPeriod.period : '';
    const allowancePeriod = record.ir56bIncome.allowance > 0 ? assessmentPeriod.period : '';
    const employmentStart = formatIrdDate(record.hireDate) > assessmentPeriod.start ? formatIrdDate(record.hireDate) : assessmentPeriod.start;
    const employmentEnd = record.employmentEndDate && formatIrdDate(record.employmentEndDate) < assessmentPeriod.end ? formatIrdDate(record.employmentEndDate) : assessmentPeriod.end;

    return ` <Employee>
 <SheetNo>${formatIrdSheetNo(index)}</SheetNo>
 <HKID>${escapeXml(normalizeIrdHkid(record.identityType, record.identityNumber))}</HKID>
 <TypeOfForm>${header.typeOfForm}</TypeOfForm>
 <Surname>${escapeXml(englishName.surname)}</Surname>
 <GivenName>${escapeXml(englishName.givenName)}</GivenName>
 <NameInChinese>${escapeXml(truncateIrd(record.nameZh, 25))}</NameInChinese>
 <Sex>${getIrdSex(record.gender)}</Sex>
 <MaritalStatus>${escapeXml(record.ir56bProfile.maritalStatus ?? '')}</MaritalStatus>
 <PpNum>${escapeXml(getPassportValue(record.identityType, record.identityNumber))}</PpNum>
 <SpouseName>${escapeXml(truncateIrd(record.ir56bProfile.spouseName, 50))}</SpouseName>
 <SpouseHKID>${escapeXml(normalizeIrdHkid('hkid', record.ir56bProfile.spouseHkid))}</SpouseHKID>
 <SpousePpNum>${escapeXml(truncateIrd(record.ir56bProfile.spousePassport, 40))}</SpousePpNum>
 <RES_ADDR_LINE1>${escapeXml(truncateIrd(address.line1, 30))}</RES_ADDR_LINE1>
 <RES_ADDR_LINE2>${escapeXml(truncateIrd(address.line2, 30))}</RES_ADDR_LINE2>
 <RES_ADDR_LINE3>${escapeXml(truncateIrd(address.line3, 30))}</RES_ADDR_LINE3>
 <AreaCodeResAddr>${escapeXml(address.area)}</AreaCodeResAddr>
 <POS_ADDR_LINE1>${escapeXml(truncateIrd(record.ir56bProfile.postalAddressLine1, 30))}</POS_ADDR_LINE1>
 <POS_ADDR_LINE2>${escapeXml(truncateIrd(record.ir56bProfile.postalAddressLine2, 30))}</POS_ADDR_LINE2>
 <POS_ADDR_LINE3>${escapeXml(truncateIrd(record.ir56bProfile.postalAddressLine3, 30))}</POS_ADDR_LINE3>
 <POS_ADDR_AREA>${escapeXml(record.ir56bProfile.postalAddressArea ?? '')}</POS_ADDR_AREA>
 <Capacity>${escapeXml(truncateIrd(record.positionNameZh, 40))}</Capacity>
 <RTN_ASS_YR>${header.assessmentYear}</RTN_ASS_YR>
 <StartDateOfEmp>${employmentStart}</StartDateOfEmp>
 <EndDateOfEmp>${employmentEnd}</EndDateOfEmp>
 <PerOfSalary>${salaryPeriod}</PerOfSalary>
 <AmtOfSalary>${formatIrdAmount(record.ir56bIncome.salary)}</AmtOfSalary>
 <PerOfLeavePay></PerOfLeavePay>
 <AmtOfLeavePay>0</AmtOfLeavePay>
 <PerOfDirectorFee></PerOfDirectorFee>
 <AmtOfDirectorFee>0</AmtOfDirectorFee>
 <PerOfCommFee>${commissionPeriod}</PerOfCommFee>
 <AmtOfCommFee>${formatIrdAmount(record.ir56bIncome.commission)}</AmtOfCommFee>
 <PerOfBonus>${bonusPeriod}</PerOfBonus>
 <AmtOfBonus>${formatIrdAmount(record.ir56bIncome.bonus)}</AmtOfBonus>
 <PerOfBpEtc></PerOfBpEtc>
 <AmtOfBpEtc>0</AmtOfBpEtc>
 <PerOfPayRetire></PerOfPayRetire>
 <AmtOfPayRetire>0</AmtOfPayRetire>
 <PerOfSalTaxPaid></PerOfSalTaxPaid>
 <AmtOfSalTaxPaid>0</AmtOfSalTaxPaid>
 <PerOfEduBen></PerOfEduBen>
 <AmtOfEduBen>0</AmtOfEduBen>
 <PerOfGainShareOption></PerOfGainShareOption>
 <AmtOfGainShareOption>0</AmtOfGainShareOption>
 <NatureOtherRAP1>${record.ir56bIncome.allowance > 0 ? 'ALLOWANCE' : ''}</NatureOtherRAP1>
 <PerOfOtherRAP1>${allowancePeriod}</PerOfOtherRAP1>
 <AmtOfOtherRAP1>${formatIrdAmount(record.ir56bIncome.allowance)}</AmtOfOtherRAP1>
 <NatureOtherRAP2></NatureOtherRAP2>
 <PerOfOtherRAP2></PerOfOtherRAP2>
 <AmtOfOtherRAP2>0</AmtOfOtherRAP2>
 <NatureOtherRAP3></NatureOtherRAP3>
 <PerOfOtherRAP3></PerOfOtherRAP3>
 <AmtOfOtherRAP3>0</AmtOfOtherRAP3>
 <PerOfPension></PerOfPension>
 <AmtOfPension>0</AmtOfPension>
 <TotalIncome>${formatIrdAmount(record.ir56bIncome.totalIncome)}</TotalIncome>
 <PlaceOfResInd>${escapeXml(record.ir56bProfile.placeOfResidenceIndicator)}</PlaceOfResInd>
 <AddrOfPlace1></AddrOfPlace1>
 <NatureOfPlace1></NatureOfPlace1>
 <PerOfPlace1></PerOfPlace1>
 <RentPaidEr1>0</RentPaidEr1>
 <RentPaidEe1>0</RentPaidEe1>
 <RentRefund1>0</RentRefund1>
 <RentPaidErByEe1>0</RentPaidErByEe1>
 <AddrOfPlace2></AddrOfPlace2>
 <NatureOfPlace2></NatureOfPlace2>
 <PerOfPlace2></PerOfPlace2>
 <RentPaidEr2>0</RentPaidEr2>
 <RentPaidEe2>0</RentPaidEe2>
 <RentRefund2>0</RentRefund2>
 <RentPaidErByEe2>0</RentPaidErByEe2>
 <OverseaIncInd>${escapeXml(record.ir56bProfile.overseasCompanyIndicator)}</OverseaIncInd>
 <AmtPaidOverseaCo>0</AmtPaidOverseaCo>
 <NameOfOverseaCo></NameOfOverseaCo>
 <AddrOfOverseaCo></AddrOfOverseaCo>
 <Remarks>${escapeXml(truncateIrd(record.ir56bProfile.remarks, 60))}</Remarks>
 </Employee>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<IR56B xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="ir56b.xsd">
 <Section>${escapeXml(header.section)}</Section>
 <ERN>${escapeXml(header.ern)}</ERN>
 <YrErReturn>${header.typeOfForm === 'O' ? header.assessmentYear : ''}</YrErReturn>
 <SubDate>${escapeXml(header.submissionDate)}</SubDate>
 <ErName>${escapeXml(truncateIrd(header.employerName, 70))}</ErName>
 <NAME_OF_SIGNER>${escapeXml(truncateIrd(header.signerName, 27))}</NAME_OF_SIGNER>
 <Designation>${escapeXml(truncateIrd(header.designation, 25))}</Designation>
 <NoRecordBatch>${formatIrdRecordCount(records.length)}</NoRecordBatch>
 <TotIncomeBatch>${formatIrdAmount(totalIncomeBatch)}</TotIncomeBatch>
 <IR56VER>B0001</IR56VER>
${entries}
</IR56B>
`;
}

function createIr56bMissingDataCsv(records: EmployeeIr56bExportRecord[]) {
  const rows = records
    .map((record) => ({ record, missing: validateIr56bRecord(record) }))
    .filter((entry) => entry.missing.length > 0);

  const quote = (value: unknown) => `"${String(value ?? '').replace(/"/g, '""')}"`;
  return [
    ['Employee Code', 'Name', 'Missing Fields', 'Where To Fix'].map(quote).join(','),
    ...rows.map(({ record, missing }) => [
      record.employeeCode,
      record.alias || record.nameZh || record.nameEn,
      missing.join('; '),
      `/medimagic/app/people?id=${encodeURIComponent(record.employeeCode)} -> 報稅資料 / Tax Info`,
    ].map(quote).join(',')),
  ].join('\n');
}

function downloadTextFile(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

type Ir56bMissingEntry = {
  record: EmployeeIr56bExportRecord;
  missing: string[];
};

function getStoredIr56bHeader(defaultAssessmentYear: number): Ir56bEmployerHeader {
  const stored = typeof window !== 'undefined' ? window.localStorage.getItem('ir56bEmployerHeader') : null;
  const parsed = stored ? JSON.parse(stored) as Partial<Ir56bEmployerHeader> : {};
  const today = new Date();
  const submissionDate = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;

  return {
    section: parsed.section ?? '',
    ern: parsed.ern ?? '',
    assessmentYear: parsed.assessmentYear ?? defaultAssessmentYear,
    submissionDate: parsed.submissionDate ?? submissionDate,
    employerName: parsed.employerName ?? '',
    signerName: parsed.signerName ?? '',
    designation: parsed.designation ?? '',
    typeOfForm: parsed.typeOfForm ?? 'O',
  };
}

function promptIr56bHeader(defaultAssessmentYear: number): Ir56bEmployerHeader | null {
  const current = getStoredIr56bHeader(defaultAssessmentYear);
  const section = window.prompt('僱主檔案號碼首三個字元 Section，例如 6A1', current.section)?.trim().toUpperCase();
  if (!section) return null;
  const ern = window.prompt('僱主檔案號碼最後 8 個數字 ERN，例如 01234561', current.ern)?.trim();
  if (!ern) return null;
  const assessmentYearValue = window.prompt('受僱期間的年度 / 僱主報税表年份，例如 2025', String(current.assessmentYear))?.trim();
  const assessmentYear = Number(assessmentYearValue);
  if (!assessmentYear || !Number.isInteger(assessmentYear)) return null;
  const submissionDate = window.prompt('遞交日期 YYYYMMDD', current.submissionDate)?.trim();
  if (!submissionDate) return null;
  const employerName = window.prompt('僱主名稱', current.employerName)?.trim();
  if (!employerName) return null;
  const signerName = window.prompt('簽署人姓名', current.signerName)?.trim();
  if (!signerName) return null;
  const designation = window.prompt('簽署人職位，例如 DIRECTOR / MANAGER', current.designation)?.trim();
  if (!designation) return null;
  const typeInput = window.prompt('表格類別：O 正本 / A 附加 / R 修訂 / S 補充', current.typeOfForm)?.trim().toUpperCase();
  const typeOfForm = typeInput === 'A' || typeInput === 'R' || typeInput === 'S' ? typeInput : 'O';
  const header = { section, ern, assessmentYear, submissionDate, employerName, signerName, designation, typeOfForm } satisfies Ir56bEmployerHeader;
  window.localStorage.setItem('ir56bEmployerHeader', JSON.stringify(header));
  return header;
}

function getInitials(employee: EmployeeDirectoryRecord) {
  const source = employee.alias || employee.nameEn || employee.nameZh;

  if (!source) {
    return employee.employeeCode.slice(0, 2).toUpperCase();
  }

  const latinParts = source.split(' ').filter(Boolean);
  if (latinParts.length > 1) {
    return latinParts
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase();
  }

  return source.replace(/\s+/g, '').slice(0, 2).toUpperCase();
}

function getStatusClasses(status: EmployeeDirectoryRecord['employmentStatus']) {
  if (status === 'active') {
    return 'border-emerald-200/70 bg-emerald-50 text-emerald-700';
  }

  if (status === 'on_leave') {
    return 'border-amber-200/70 bg-amber-50 text-amber-700';
  }

  return 'border-slate-200 bg-slate-100 text-slate-600';
}

function getOptionLabel(option: EmployeeDirectoryOption, lang: 'zh-TW' | 'zh-CN' | 'en') {
  return lang === 'en' ? option.labelEn : option.labelZh;
}

function FieldLabel({ label, required = false }: { label: string; required?: boolean }) {
  return (
    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
      {label}
      {required ? <span className="ml-1 text-rose-500">*</span> : null}
    </label>
  );
}

export default function People({ employees, ir56bExportRecords = [], ir56bAssessmentYear, onIr56bAssessmentYearChange, positions, banks, companies, branches }: PeopleProps) {
  const router = useRouter();
  const { lang } = useLanguage();
  const t = useTranslation(translations);
  const [searchValue, setSearchValue] = useState('');
  const [companyFilter, setCompanyFilter] = useState<'all' | string>('all');
  const [branchFilter, setBranchFilter] = useState<'all' | string>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | EmployeeDirectoryRecord['employmentType']>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | EmployeeDirectoryRecord['employmentStatus']>('all');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createCompanyId, setCreateCompanyId] = useState(companies[0]?.id ?? '');
  const [createEmploymentType, setCreateEmploymentType] = useState<EmployeeEmploymentType>('全職');
  const [createHireDate, setCreateHireDate] = useState('');
  const [createProbationMonths, setCreateProbationMonths] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [ir56bMissingEntries, setIr56bMissingEntries] = useState<Ir56bMissingEntry[]>([]);
  const [pendingIr56bHeader, setPendingIr56bHeader] = useState<Ir56bEmployerHeader | null>(null);
  const [isSubmitting, startSubmitTransition] = useTransition();

  const filteredBranches = branches;

  const filteredEmployees = useMemo(
    () =>
      employees.filter((employee) => {
        const normalizedSearch = searchValue.trim().toLowerCase();
        const matchesSearch =
          normalizedSearch.length === 0 ||
          employee.employeeCode.toLowerCase().includes(normalizedSearch) ||
          employee.nameZh.toLowerCase().includes(normalizedSearch) ||
          employee.nameEn.toLowerCase().includes(normalizedSearch) ||
          (employee.alias ?? '').toLowerCase().includes(normalizedSearch) ||
          (employee.branchCode ?? '').toLowerCase().includes(normalizedSearch) ||
          (employee.branchNameZh ?? '').toLowerCase().includes(normalizedSearch) ||
          (employee.positionNameZh ?? '').toLowerCase().includes(normalizedSearch);

        const matchesCompany = companyFilter === 'all' || employee.companyId === companyFilter;
        const matchesBranch = branchFilter === 'all' || employee.branchId === branchFilter;
        const matchesType = typeFilter === 'all' || employee.employmentType === typeFilter;
        const matchesStatus = statusFilter === 'all' || employee.employmentStatus === statusFilter;

        return matchesSearch && matchesCompany && matchesBranch && matchesType && matchesStatus;
      }),
    [companyFilter, branchFilter, employees, searchValue, statusFilter, typeFilter]
  );

  const paginationLabel = `${filteredEmployees.length} ${t.rows}`;
  const createProbationEndDate = calculateProbationEndDate(createHireDate, createProbationMonths) ?? '';
  const today = new Date();
  const defaultAssessmentYear = today.getMonth() + 1 >= 4 ? today.getFullYear() + 1 : today.getFullYear();
  const selectedAssessmentYear = ir56bAssessmentYear ?? defaultAssessmentYear;
  const assessmentYearOptions = [defaultAssessmentYear + 1, defaultAssessmentYear, defaultAssessmentYear - 1, defaultAssessmentYear - 2, defaultAssessmentYear - 3]
    .filter((year, index, list) => list.indexOf(year) === index);
  const filteredEmployeeCodes = new Set(filteredEmployees.map((employee) => employee.employeeCode));
  const filteredIr56bExportRecords = ir56bExportRecords.filter((record) => filteredEmployeeCodes.has(record.employeeCode));
  const ir56bIssueCount = filteredIr56bExportRecords.filter((record) => validateIr56bRecord(record).length > 0).length;

  const searchSuggestions = useMemo(() => {
    const normalizedSearch = searchValue.trim().toLowerCase();

    if (!normalizedSearch) {
      return [];
    }

    return employees
      .filter((employee) => {
        const searchableValues = [employee.employeeCode, employee.nameZh, employee.nameEn, employee.alias ?? '', employee.positionNameZh ?? ''];
        return searchableValues.some((value) => value.toLowerCase().includes(normalizedSearch));
      })
      .slice(0, 6);
  }, [employees, searchValue]);

  function openEmployeeProfile(employeeCode: string) {
    setIsSearchFocused(false);
    setSearchValue('');
    const basePath = window.location.hostname.endsWith('github.io') ? '/medimagic' : '';
    window.location.assign(`${basePath}/app/people?id=${encodeURIComponent(employeeCode)}`);
  }

  function exportIr56bRecords(records: EmployeeIr56bExportRecord[], header: Ir56bEmployerHeader) {
    if (records.length === 0) {
      window.alert('未有已齊資料的員工可匯出。請先補齊資料，或調整篩選條件。');
      return;
    }

    downloadTextFile(`IR56B_${header.assessmentYear}_${header.typeOfForm}.xml`, `\uFEFF${createBulkIr56bXml(records, header)}`, 'application/xml;charset=utf-8');
  }

  async function handleCreateEmployee(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    const formElement = event.currentTarget;
    const formData = new FormData(formElement);

    startSubmitTransition(async () => {
      try {
        await createEmployee(formData);
        setFormSuccess(t.modal.success);
        formElement.reset();
        setCreateCompanyId(companies[0]?.id ?? '');
        setCreateEmploymentType('全職');
        setCreateHireDate('');
        setCreateProbationMonths('');
        router.refresh();
        setTimeout(() => {
          setIsCreateOpen(false);
          setFormSuccess(null);
        }, 600);
      } catch (error) {
        const message = error instanceof Error ? error.message : t.modal.errors.generic;
        setFormError(message || t.modal.errors.generic);
      }
    });
  }

  function handleExportBulkIr56b() {
    if (filteredIr56bExportRecords.length === 0) {
      window.alert('未有可匯出的員工資料。');
      return;
    }

    const header = promptIr56bHeader(selectedAssessmentYear);
    if (!header) {
      window.alert('已取消匯出。IR56B XML header 必須有僱主檔案號碼、僱主名稱、簽署人及職位。');
      return;
    }

    if (header.assessmentYear !== selectedAssessmentYear) {
      window.alert(`目前頁面選擇的 IR56B 年度是 ${selectedAssessmentYear}，但你輸入 ${header.assessmentYear}。請先喺頁面選返相同年度再匯出。`);
      return;
    }

    const issueEntries = filteredIr56bExportRecords
      .map((record) => ({ record, missing: validateIr56bRecord(record) }))
      .filter((entry) => entry.missing.length > 0);

    if (issueEntries.length > 0) {
      setPendingIr56bHeader(header);
      setIr56bMissingEntries(issueEntries);
      return;
    }

    exportIr56bRecords(filteredIr56bExportRecords, header);
  }

  return (
    <>
      <div className="flex h-full flex-col space-y-6">
        <div className="flex shrink-0 flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">{t.title}</h2>
            <p className="mt-1 text-slate-500">{t.subtitle}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <select
              value={selectedAssessmentYear}
              onChange={(event) => onIr56bAssessmentYearChange?.(Number(event.target.value))}
              className="whitespace-nowrap rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm font-semibold text-amber-800 shadow-sm outline-none transition-all focus:ring-2 focus:ring-[#D4AF37]/20"
              title="IR56B 年度，例如 2025 = 2024/04 至 2025/03"
            >
              {assessmentYearOptions.map((year) => (
                <option key={year} value={year}>IR56B {year} ({year - 1}/04-{year}/03)</option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleExportBulkIr56b}
              disabled={filteredEmployees.length === 0 || filteredIr56bExportRecords.length === 0}
              className="flex items-center gap-2 whitespace-nowrap rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-800 shadow-sm transition-colors hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-50"
              title={ir56bIssueCount > 0 ? `${ir56bIssueCount} 位員工 IR56B 資料未齊，匯出時會同時下載報告` : undefined}
            >
              <Download className="h-4 w-4" />
              匯出全部 IR56B XML{ir56bIssueCount > 0 ? ` (${ir56bIssueCount} 未齊)` : ''}
            </button>
            <button
              onClick={() => {
                setFormError(null);
                setFormSuccess(null);
                setCreateCompanyId(companies[0]?.id ?? '');
                setCreateEmploymentType('全職');
                setCreateHireDate('');
                setCreateProbationMonths('');
                setIsCreateOpen(true);
              }}
              className="flex items-center gap-2 whitespace-nowrap rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-slate-800"
            >
              <Plus className="h-4 w-4" />
              {t.addBtn}
            </button>
          </div>
        </div>

        <div className="flex shrink-0 flex-col gap-3 xl:flex-row">
            <div className="relative flex-1 xl:max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => {
                  window.setTimeout(() => setIsSearchFocused(false), 120);
                }}
                placeholder={t.searchPlaceholder}
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-sm shadow-sm transition-all focus:border-[#D4AF37] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20"
              />

              {isSearchFocused && searchSuggestions.length > 0 ? (
                <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-20 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_20px_50px_rgba(15,23,42,0.12)]">
                  <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                      <Sparkles className="h-4 w-4 text-amber-500" />
                      {t.searchSuggestions}
                    </div>
                    <span className="text-xs text-slate-400">{t.searchHint}</span>
                  </div>

                  <div className="max-h-80 overflow-y-auto p-2">
                    {searchSuggestions.map((employee) => (
                      <button
                        key={employee.id}
                        type="button"
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => openEmployeeProfile(employee.employeeCode)}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors hover:bg-slate-50"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-sm font-bold text-slate-600">
                          {getInitials(employee)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="truncate font-semibold text-slate-800">{employee.alias || employee.nameZh}</div>
                          <div className="truncate text-xs text-slate-500">
                            {employee.employeeCode}
                            {employee.nameZh ? ` • ${employee.nameZh}` : ''}
                            {employee.nameEn ? ` • ${employee.nameEn}` : ''}
                            {employee.positionNameZh ? ` • ${employee.positionNameZh}` : ''}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            <div className="flex gap-3 overflow-x-auto pb-1 xl:pb-0">
              <select
                value={companyFilter}
                onChange={(event) => setCompanyFilter(event.target.value)}
                className="whitespace-nowrap rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 shadow-sm outline-none transition-all focus:ring-2 focus:ring-[#D4AF37]/20"
              >
                <option value="all">{t.allCompanies}</option>
                {companies.map((company) => (
                  <option key={company.id} value={company.id}>{getOptionLabel(company, lang)}</option>
                ))}
              </select>

              <select
                value={branchFilter}
                onChange={(event) => setBranchFilter(event.target.value)}
                className="whitespace-nowrap rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 shadow-sm outline-none transition-all focus:ring-2 focus:ring-[#D4AF37]/20"
              >
                <option value="all">{t.allBranches}</option>
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>{getOptionLabel(branch, lang)}</option>
                ))}
              </select>

              <select
                value={typeFilter}
                onChange={(event) => setTypeFilter(event.target.value as 'all' | EmployeeDirectoryRecord['employmentType'])}
                className="whitespace-nowrap rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 shadow-sm outline-none transition-all focus:ring-2 focus:ring-[#D4AF37]/20"
              >
                <option value="all">{t.allTypes}</option>
                {EMPLOYEE_EMPLOYMENT_TYPES.map((employmentType) => (
                  <option key={employmentType} value={employmentType}>{t.employmentTypes[employmentType]}</option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as 'all' | EmployeeDirectoryRecord['employmentStatus'])}
                className="whitespace-nowrap rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 shadow-sm outline-none transition-all focus:ring-2 focus:ring-[#D4AF37]/20"
              >
                <option value="all">{t.allStatuses}</option>
                <option value="active">{t.statuses.active}</option>
                <option value="on_leave">{t.statuses.on_leave}</option>
                <option value="resigned">{t.statuses.resigned}</option>
                <option value="terminated">{t.statuses.terminated}</option>
              </select>
            </div>
        </div>

        <div className="flex min-h-100 flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex-1 overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/50">
                  <th className="whitespace-nowrap px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">{t.table.employee}</th>
                  <th className="whitespace-nowrap px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">{t.table.employeeCode}</th>
                  <th className="whitespace-nowrap px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">{t.table.position}</th>
                  <th className="whitespace-nowrap px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">{t.table.branch}</th>
                  <th className="whitespace-nowrap px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">{t.table.company}</th>
                  <th className="whitespace-nowrap px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">{t.table.employmentType}</th>
                  <th className="whitespace-nowrap px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">{t.table.phone}</th>
                  <th className="whitespace-nowrap px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">{t.table.leaveDays}</th>
                  <th className="whitespace-nowrap px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">{t.table.status}</th>
                  <th className="whitespace-nowrap px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">{t.table.actions}</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredEmployees.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-6 py-16 text-center text-sm text-slate-500">
                      {t.empty}
                    </td>
                  </tr>
                ) : (
                  filteredEmployees.map((employee, index) => (
                    <motion.tr
                      key={employee.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.04 }}
                      onClick={() => openEmployeeProfile(employee.employeeCode)}
                      className="group cursor-pointer transition-colors hover:bg-slate-50/80"
                    >
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-sm font-bold text-slate-600">
                            {getInitials(employee)}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-800 group-hover:text-slate-900">{employee.alias || employee.nameZh}</div>
                            <div className="text-xs text-slate-500">
                              {employee.nameZh}
                              {employee.nameEn ? ` • ${employee.nameEn}` : ''}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="font-medium text-slate-700">{employee.employeeCode}</div>
                        <div className="text-xs text-slate-500">{employee.hireDate}</div>
                      </td>

                      <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-700">{employee.positionNameZh ?? '-'}</td>

                      <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-700">{employee.branchCode ?? '-'}</td>

                      <td className="whitespace-nowrap px-6 py-4">
                        <span className="inline-flex items-center rounded-md bg-[#f5efe0] px-2.5 py-1 text-xs font-semibold text-[#8e6d13]">
                          {employee.companyNameZh || employee.companyNameEn || t.companies[employee.companyType]}
                        </span>
                      </td>

                      <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-700">{t.employmentTypes[employee.employmentType]}</td>

                      <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-700">{employee.phone ?? '-'}</td>

                      <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-700">{employee.annualLeaveDays === null ? '-' : employee.annualLeaveDays}</td>

                      <td className="whitespace-nowrap px-6 py-4">
                        <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${getStatusClasses(employee.employmentStatus)}`}>
                          <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current opacity-70"></span>
                          {t.statuses[employee.employmentStatus]}
                        </span>
                      </td>

                      <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                          <button
                            className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                            onClick={(event) => event.stopPropagation()}
                          >
                            <Phone className="h-4 w-4" />
                          </button>
                          <button
                            className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                            onClick={(event) => event.stopPropagation()}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex shrink-0 items-center border-t border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
            <span>{paginationLabel}</span>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {ir56bMissingEntries.length > 0 && pendingIr56bHeader ? (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-slate-900/35 backdrop-blur-sm"
              onClick={() => {
                setIr56bMissingEntries([]);
                setPendingIr56bHeader(null);
              }}
            />
            <div className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-8">
              <motion.div
                initial={{ opacity: 0, y: 24, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 24, scale: 0.98 }}
                className="mx-auto max-w-4xl overflow-hidden rounded-[28px] border border-amber-200 bg-white shadow-[0_30px_90px_rgba(15,23,42,0.18)]"
              >
                <div className="border-b border-amber-100 bg-amber-50 px-6 py-5 sm:px-8">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">IR56B 資料未齊</h3>
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        有 {ir56bMissingEntries.length} 位員工未符合 IR56B export 要求。請補齊後再輸出；或者略過未齊資料，只輸出已齊資料的員工。
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setIr56bMissingEntries([]);
                        setPendingIr56bHeader(null);
                      }}
                      className="rounded-xl p-2 text-slate-400 transition-colors hover:bg-white/70 hover:text-slate-700"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                <div className="max-h-[60vh] overflow-y-auto px-6 py-5 sm:px-8">
                  <div className="space-y-3">
                    {ir56bMissingEntries.map(({ record, missing }) => (
                      <div key={record.employeeCode} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <div className="font-bold text-slate-900">{record.employeeCode} · {record.alias || record.nameZh || record.nameEn}</div>
                            <div className="mt-2 text-sm text-rose-700">缺少：{missing.join('、')}</div>
                          </div>
                          <button
                            type="button"
                            onClick={() => openEmployeeProfile(record.employeeCode)}
                            className="rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                          >
                            去補資料
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4 sm:px-8">
                  <button
                    type="button"
                    onClick={() => downloadTextFile('IR56B_missing_data_report.csv', createIr56bMissingDataCsv(ir56bMissingEntries.map((entry) => entry.record)), 'text/csv;charset=utf-8')}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                  >
                    下載缺漏報告 CSV
                  </button>
                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setIr56bMissingEntries([]);
                        setPendingIr56bHeader(null);
                      }}
                      className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                    >
                      取消
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const blockedCodes = new Set(ir56bMissingEntries.map((entry) => entry.record.employeeCode));
                        const readyRecords = filteredIr56bExportRecords.filter((record) => !blockedCodes.has(record.employeeCode));
                        exportIr56bRecords(readyRecords, pendingIr56bHeader);
                        downloadTextFile('IR56B_missing_data_report.csv', createIr56bMissingDataCsv(ir56bMissingEntries.map((entry) => entry.record)), 'text/csv;charset=utf-8');
                        setIr56bMissingEntries([]);
                        setPendingIr56bHeader(null);
                      }}
                      className="rounded-xl bg-[#D4AF37] px-4 py-2 text-sm font-semibold text-white hover:bg-[#B8871A]"
                    >
                      略過未齊資料並輸出
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </>
        ) : null}

        {isCreateOpen ? (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-slate-900/35 backdrop-blur-sm"
              onClick={() => setIsCreateOpen(false)}
            />
            <div className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-8">
              <div className="mx-auto max-w-5xl">
                <motion.div
                  initial={{ opacity: 0, y: 24, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 24, scale: 0.98 }}
                  className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_30px_90px_rgba(15,23,42,0.18)]"
                >
                  <div className="border-b border-slate-100 bg-linear-to-r from-[#faf6ed] to-white px-6 py-5 sm:px-8">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-xl font-bold text-slate-900">{t.modal.title}</h3>
                        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">{t.modal.subtitle}</p>
                      </div>
                      <button
                        onClick={() => setIsCreateOpen(false)}
                        className="rounded-xl p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  </div>

                  <form onSubmit={handleCreateEmployee} className="px-6 py-6 sm:px-8 sm:py-7">
                    <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                      <span className="font-semibold">{t.modal.required}:</span> {t.modal.nameZh}, {t.modal.nameEn}
                    </div>

                    <div className="grid gap-6 lg:grid-cols-2">
                      <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50/50 p-5">
                        <h4 className="text-sm font-bold uppercase tracking-[0.18em] text-slate-700">{t.structure.groups.identity}</h4>

                        <div className="grid gap-4 sm:grid-cols-2">
                          <div>
                            <FieldLabel label={t.modal.employeeCode} />
                            <input name="employeeCode" className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/15" />
                          </div>
                          <div>
                            <FieldLabel label={t.modal.company} />
                            <select
                              name="companyId"
                              value={createCompanyId}
                              onChange={(event) => setCreateCompanyId(event.target.value)}
                              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/15"
                            >
                              <option value=""></option>
                              {companies.map((company) => (
                                <option key={company.id} value={company.id}>{getOptionLabel(company, lang)}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50/50 p-5">
                        <h4 className="text-sm font-bold uppercase tracking-[0.18em] text-slate-700">{t.structure.groups.personal}</h4>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div>
                            <FieldLabel label={t.modal.nameZh} required />
                            <input name="nameZh" required className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/15" />
                          </div>
                          <div>
                            <FieldLabel label={t.modal.nameEn} required />
                            <input name="nameEn" required className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/15" />
                          </div>
                          <div>
                            <FieldLabel label={t.modal.alias} />
                            <input name="alias" className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/15" />
                          </div>
                          <div>
                            <FieldLabel label={t.modal.gender} />
                            <select name="gender" defaultValue="female" className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/15">
                              <option value="male">{t.genders.male}</option>
                              <option value="female">{t.genders.female}</option>
                              <option value="other">{t.genders.other}</option>
                            </select>
                          </div>
                          <div>
                            <FieldLabel label={t.modal.identityNumber} />
                            <input name="identityNumber" className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/15" />
                          </div>
                          <div>
                            <FieldLabel label={t.modal.dateOfBirth} />
                            <input type="date" name="dateOfBirth" className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/15" />
                          </div>
                          <div>
                            <FieldLabel label={t.modal.phone} />
                            <input name="phone" className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/15" />
                          </div>
                          <div className="sm:col-span-2">
                            <FieldLabel label={t.modal.address} />
                            <textarea name="address" rows={3} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/15" />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50/50 p-5">
                        <h4 className="text-sm font-bold uppercase tracking-[0.18em] text-slate-700">{t.structure.groups.employment}</h4>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div>
                            <FieldLabel label={t.modal.position} />
                            <select name="positionId" defaultValue="" className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/15">
                              <option value=""></option>
                              {positions.map((position) => (
                                <option key={position.id} value={position.id}>{getOptionLabel(position, lang)}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <FieldLabel label={t.modal.branch} />
                            <select name="branchId" defaultValue="" className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/15">
                              <option value=""></option>
                              {filteredBranches.map((branch) => (
                                <option key={branch.id} value={branch.id}>{getOptionLabel(branch, lang)}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <FieldLabel label={t.modal.hireDate} />
                            <input type="date" name="hireDate" value={createHireDate} onChange={(event) => setCreateHireDate(event.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/15" />
                          </div>
                          <div>
                            <FieldLabel label={t.modal.employmentType} />
                            <select name="employmentType" value={createEmploymentType} onChange={(event) => setCreateEmploymentType(event.target.value as EmployeeEmploymentType)} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/15">
                              {EMPLOYEE_EMPLOYMENT_TYPES.map((employmentType) => (
                                <option key={employmentType} value={employmentType}>{t.employmentTypes[employmentType]}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <FieldLabel label={t.modal.status} />
                            <select name="employmentStatus" defaultValue="active" className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/15">
                              <option value="active">{t.statuses.active}</option>
                              <option value="on_leave">{t.statuses.on_leave}</option>
                              <option value="resigned">{t.statuses.resigned}</option>
                              <option value="terminated">{t.statuses.terminated}</option>
                            </select>
                          </div>
                          <div>
                            <FieldLabel label={t.modal.annualLeaveDays} />
                            <input type="number" min="0" step="0.5" name="annualLeaveDays" className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/15" />
                          </div>
                          <div>
                            <FieldLabel label={t.modal.probationMonths} />
                            <input type="number" min="0" step="1" name="probationMonths" value={createProbationMonths} onChange={(event) => setCreateProbationMonths(event.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/15" />
                          </div>
                          <div>
                            <FieldLabel label={t.modal.probationEndDate} />
                            <input type="date" name="probationEndDate" value={createProbationEndDate} readOnly className="w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-2.5 text-sm text-slate-700 outline-none" />
                          </div>
                          <div>
                            <FieldLabel label={t.modal.employmentEndDate} />
                            <input type="date" name="employmentEndDate" className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/15" />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50/50 p-5">
                        <h4 className="text-sm font-bold uppercase tracking-[0.18em] text-slate-700">{t.structure.groups.payroll}</h4>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div>
                            <FieldLabel label={t.modal.bank} />
                            <select name="bankId" defaultValue="" className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/15">
                              <option value=""></option>
                              {banks.map((bank) => (
                                <option key={bank.id} value={bank.id}>{getOptionLabel(bank, lang)}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <FieldLabel label={t.modal.paymentMethod} />
                            <select name="paymentMethod" defaultValue="autopay" className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/15">
                              <option value="autopay">{t.paymentMethods.autopay}</option>
                              <option value="cash">{t.paymentMethods.cash}</option>
                              <option value="cheque">{t.paymentMethods.cheque}</option>
                              <option value="fps">{t.paymentMethods.fps}</option>
                            </select>
                          </div>
                          <div className="sm:col-span-2">
                            <FieldLabel label={t.modal.bankAccountNumber} />
                            <input name="bankAccountNumber" className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/15" />
                          </div>
                          <div className="sm:col-span-2">
                            <FieldLabel label={t.modal.notes} />
                            <textarea name="notes" rows={3} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/15" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {formError ? <p className="mt-5 text-sm font-medium text-rose-600">{formError}</p> : null}
                    {formSuccess ? <p className="mt-5 text-sm font-medium text-emerald-600">{formSuccess}</p> : null}

                    <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-5">
                      <button
                        type="button"
                        onClick={() => setIsCreateOpen(false)}
                        className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
                      >
                        {t.modal.cancel}
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isSubmitting ? t.modal.saving : t.modal.save}
                      </button>
                    </div>
                  </form>
                </motion.div>
              </div>
            </div>
          </>
        ) : null}
      </AnimatePresence>
    </>
  );
}
