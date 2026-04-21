"use client";

import { useMemo, useState, useTransition, type FormEvent } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Plus, Search, MoreHorizontal, Phone, Sparkles, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useLanguage, useTranslation } from '../i18n/LanguageContext';
import type { EmployeeDirectoryOption, EmployeeDirectoryRecord } from '@/src/lib/employees/queries';
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
  positions: EmployeeDirectoryOption[];
  banks: EmployeeDirectoryOption[];
  companies: EmployeeDirectoryOption[];
  branches: EmployeeDirectoryOption[];
};

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

export default function People({ employees, positions, banks, companies, branches }: PeopleProps) {
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
    router.push(`/app/people?id=${employeeCode}`);
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

  return (
    <>
      <div className="flex h-full flex-col space-y-6">
        <div className="flex shrink-0 flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">{t.title}</h2>
            <p className="mt-1 text-slate-500">{t.subtitle}</p>
          </div>
          <div className="flex gap-3">
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
                      onClick={() => router.push(`/app/people?id=${employee.employeeCode}`)}
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