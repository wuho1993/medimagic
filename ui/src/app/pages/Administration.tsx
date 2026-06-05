"use client";

import { useEffect, useState, type ReactNode } from 'react';
import { Columns3, Database, Plus, Save, Settings2, ShieldCheck, Trash2, Users } from 'lucide-react';
import { motion } from 'motion/react';
import { useTranslation } from '../i18n/LanguageContext';
import type { EmployeeDirectoryOption } from '@/src/lib/employees/queries';
import type { PayrollSystemSettings, SystemFieldConfig } from '@/src/lib/system-management/queries';
import {
  createLookupItem,
  createSystemFieldConfig,
  deleteLookupItem,
  deleteSystemFieldConfig,
  updatePayrollSystemSettings,
  updateSystemFieldConfig,
} from '@/app/app/admin/actions';

const translations = {
  'zh-TW': {
    title: '系統管理',
    subtitle: '集中管理可編輯欄位、主資料同帳號權限，之後新增模組都可以延續同一套做法。',
    noteTitle: '管理方向',
    noteBody: '所有會喺前台出現嘅設定資料，盡量都應該由呢度新增、編輯、刪除，避免再寫死喺頁面。',
    tabs: ['帳號與權限', '員工欄位', '主資料'],
    usersLocked: 'HR 經理可管理系統設定，但帳號角色維護只限老闆或系統管理員。',
    payrollSettings: {
      title: 'Payroll 系統設定',
      description: '包佣員工遇到 No Pay，而按比率計算佣金未超過包佣時，系統會自動採用這個預設方式，不再逐位員工再揀。',
      packageNoPayDefaultHandling: '包佣 No Pay 預設處理',
      noPackage: '本月冇包佣',
      proRate: '包佣按上班日數統計',
      save: '儲存 Payroll 設定',
    },
    testMode: {
      title: 'Intranet Test Mode',
      description: '用同一個 Supabase database 做 demo 測試。開始時會 snapshot 現有資料；按完成或關閉視窗時會還原 snapshot，清走測試資料。',
      warning: '請勿喺其他人同時輸入正式資料時使用，因為完成測試會還原整個 public app tables。',
      inactive: '未開啟',
      active: '測試中',
      start: '開始 Test Mode',
      finish: '完成並清除測試資料',
      finishConfirm: '確認要完成並清除測試資料？',
      finished: '已完成並清除測試資料。',
      restoring: '還原中…',
      starting: '建立 snapshot…',
      tables: 'Tables',
      rows: 'Rows',
      startedAt: '開始時間',
      sqlMissing: '如顯示 SQL function/table missing，請先執行 supabase/migrations/20260521010000_add_test_mode_snapshot.sql。',
    },
    fields: {
      title: '員工欄位管理',
      description: '控制員工資料表單同資料結構使用邊啲欄位。',
      empty: '未有欄位設定，請先新增。',
      fieldKey: '欄位 key',
      labelZh: '中文名稱',
      labelEn: '英文名稱',
      groupKey: '分組',
      inputType: '輸入類型',
      sortOrder: '排序',
      active: '啟用',
      required: '必填',
      add: '新增欄位',
      save: '儲存',
      delete: '刪除',
      inactive: '停用',
      optional: '非必填',
    },
    masterData: {
      title: '主資料管理',
      description: '公司、分店、職位、銀行，以後其他模組選項都建議用同樣方式管理。',
      code: '代碼',
      nameZh: '中文名稱',
      nameEn: '英文名稱',
      company: '所屬公司',
      add: '新增項目',
      empty: '未有資料。',
      companies: '公司',
      branches: '分店',
      positions: '職位',
      banks: '銀行',
      delete: '刪除',
    },
  },
  'zh-CN': {
    title: '系统管理',
    subtitle: '集中管理可编辑字段、主资料和账号权限，之后新增模块都可以沿用同一套方式。',
    noteTitle: '管理方向',
    noteBody: '所有会在前台出现的设定资料，尽量都应该由这里新增、编辑、删除，避免再写死在页面。',
    tabs: ['账号与权限', '员工字段', '主资料'],
    usersLocked: 'HR 经理可管理系统设定，但账号角色维护只限老板或系统管理员。',
    payrollSettings: {
      title: 'Payroll 系统设定',
      description: '包佣员工遇到 No Pay，而按比率计算佣金未超过包佣时，系统会自动采用这个默认方式，不再逐位员工再选。',
      packageNoPayDefaultHandling: '包佣 No Pay 默认处理',
      noPackage: '本月无包佣',
      proRate: '包佣按上班日数统计',
      save: '保存 Payroll 设定',
    },
    testMode: {
      title: 'Intranet Test Mode',
      description: '使用同一个 Supabase database 做 demo 测试。开始时会 snapshot 现有资料；完成或关闭窗口时会恢复 snapshot，清走测试资料。',
      warning: '请勿在其他人同时输入正式资料时使用，因为完成测试会恢复整个 public app tables。',
      inactive: '未开启',
      active: '测试中',
      start: '开始 Test Mode',
      finish: '完成并清除测试资料',
      finishConfirm: '确认要完成并清除测试资料？',
      finished: '已完成并清除测试资料。',
      restoring: '恢复中…',
      starting: '建立 snapshot…',
      tables: 'Tables',
      rows: 'Rows',
      startedAt: '开始时间',
      sqlMissing: '如显示 SQL function/table missing，请先执行 supabase/migrations/20260521010000_add_test_mode_snapshot.sql。',
    },
    fields: {
      title: '员工字段管理',
      description: '控制员工资料表单和资料结构使用哪些字段。',
      empty: '还没有字段设定，请先新增。',
      fieldKey: '字段 key',
      labelZh: '中文名称',
      labelEn: '英文名称',
      groupKey: '分组',
      inputType: '输入类型',
      sortOrder: '排序',
      active: '启用',
      required: '必填',
      add: '新增字段',
      save: '保存',
      delete: '删除',
      inactive: '停用',
      optional: '非必填',
    },
    masterData: {
      title: '主资料管理',
      description: '公司、分店、职位、银行，以后其他模块选项也建议用同样方式管理。',
      code: '代码',
      nameZh: '中文名称',
      nameEn: '英文名称',
      company: '所属公司',
      add: '新增项目',
      empty: '暂无资料。',
      companies: '公司',
      branches: '分店',
      positions: '职位',
      banks: '银行',
      delete: '删除',
    },
  },
  en: {
    title: 'Administration',
    subtitle: 'Manage editable fields, master data, and account permissions from one place.',
    noteTitle: 'Management Direction',
    noteBody: 'Any configuration shown in the product should be added, edited, and removed here instead of being hardcoded into pages.',
    tabs: ['Accounts & Access', 'Employee Fields', 'Master Data'],
    usersLocked: 'HR managers can maintain system settings, but account role maintenance is limited to bosses and system admins.',
    payrollSettings: {
      title: 'Payroll Settings',
      description: 'When a package-commission employee has no-pay attendance and calculated commission does not exceed the package amount, payroll now applies this system default automatically instead of asking row by row.',
      packageNoPayDefaultHandling: 'Default Package No-Pay Handling',
      noPackage: 'No package commission this month',
      proRate: 'Pro-rate package by worked days',
      save: 'Save Payroll Settings',
    },
    testMode: {
      title: 'Intranet Test Mode',
      description: 'Use the same Supabase database for demos. Starting test mode snapshots current data; finishing or closing the window restores the snapshot and wipes test changes.',
      warning: 'Do not use this while other users are entering real data. Finish restores all public app tables.',
      inactive: 'Inactive',
      active: 'Active',
      start: 'Start Test Mode',
      finish: 'Finish and wipe test data',
      finishConfirm: 'Are you sure you want to finish and wipe the test data?',
      finished: 'Test data has been finished and wiped.',
      restoring: 'Restoring…',
      starting: 'Creating snapshot…',
      tables: 'Tables',
      rows: 'Rows',
      startedAt: 'Started at',
      sqlMissing: 'If SQL function/table missing appears, run supabase/migrations/20260521010000_add_test_mode_snapshot.sql first.',
    },
    fields: {
      title: 'Employee Field Management',
      description: 'Control which fields are used in employee forms and employee data structure.',
      empty: 'No field configuration yet.',
      fieldKey: 'Field key',
      labelZh: 'Chinese label',
      labelEn: 'English label',
      groupKey: 'Group',
      inputType: 'Input type',
      sortOrder: 'Sort order',
      active: 'Active',
      required: 'Required',
      add: 'Add Field',
      save: 'Save',
      delete: 'Delete',
      inactive: 'Inactive',
      optional: 'Optional',
    },
    masterData: {
      title: 'Master Data Management',
      description: 'Companies, branches, positions, banks, and future module options should follow the same pattern.',
      code: 'Code',
      nameZh: 'Chinese name',
      nameEn: 'English name',
      company: 'Company',
      add: 'Add Item',
      empty: 'No records yet.',
      companies: 'Companies',
      branches: 'Branches',
      positions: 'Positions',
      banks: 'Banks',
      delete: 'Delete',
    },
  },
};

type AdministrationProps = {
  children?: ReactNode;
  canManageUsers: boolean;
  fieldConfigs: SystemFieldConfig[];
  payrollSettings: PayrollSystemSettings;
  positions: EmployeeDirectoryOption[];
  banks: EmployeeDirectoryOption[];
  companies: EmployeeDirectoryOption[];
  branches: EmployeeDirectoryOption[];
  hidePayrollSettings?: boolean;
};

function LookupSection({
  title,
  table,
  items,
  companies,
  labels,
  saveLabel,
}: {
  title: string;
  table: 'positions' | 'banks' | 'companies' | 'branches';
  items: EmployeeDirectoryOption[];
  companies?: EmployeeDirectoryOption[];
  labels: typeof translations.en.masterData;
  saveLabel: string;
}) {
  const requiresCompany = table === 'branches';

  const fieldGridClassName = requiresCompany
    ? 'md:grid-cols-[180px_140px_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto]'
    : 'md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto]';

  const editGridClassName = requiresCompany
    ? 'md:grid-cols-[180px_140px_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto]'
    : 'md:grid-cols-[140px_minmax(0,1fr)_minmax(0,1fr)_auto]';

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <Database className="h-4 w-4 text-slate-500" />
        <h3 className="font-semibold text-slate-900">{title}</h3>
      </div>

      <form action={createLookupItem} className={`grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 ${fieldGridClassName}`}>
        <input type="hidden" name="table" value={table} />
        {requiresCompany ? (
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-500">{labels.company}</label>
            <select name="companyId" className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20">
              <option value="">{labels.company}</option>
              {(companies ?? []).map((company) => (
                <option key={company.id} value={company.id}>{company.labelZh}</option>
              ))}
            </select>
          </div>
        ) : null}
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-500">{labels.code}</label>
          <input name="code" required placeholder={labels.code} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20" />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-500">{labels.nameZh}</label>
          <input name="nameZh" required placeholder={labels.nameZh} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20" />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-500">{labels.nameEn}</label>
          <input name="nameEn" required placeholder={labels.nameEn} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20" />
        </div>
        <button type="submit" className="inline-flex items-center justify-center gap-2 self-end rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800">
          <Plus className="h-4 w-4" />
          {labels.add}
        </button>
      </form>

      <div className="mt-4 space-y-3">
        {items.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 px-4 py-6 text-sm text-slate-500">{labels.empty}</div>
        ) : (
          items.map((item) => (
            <form key={item.id} action={createLookupItem} className={`grid gap-3 rounded-xl border border-slate-200 p-4 ${editGridClassName}`}>
              <input type="hidden" name="table" value={table} />
              <input type="hidden" name="id" value={item.id} />
              {requiresCompany ? (
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-500">{labels.company}</label>
                  <select name="companyId" defaultValue={item.companyId ?? ''} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20">
                    <option value="">{labels.company}</option>
                    {(companies ?? []).map((company) => (
                      <option key={company.id} value={company.id}>{company.labelZh}</option>
                    ))}
                  </select>
                </div>
              ) : null}
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-500">{labels.code}</label>
                <input name="code" defaultValue={item.code} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-500">{labels.nameZh}</label>
                <input name="nameZh" defaultValue={item.labelZh} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-500">{labels.nameEn}</label>
                <input name="nameEn" defaultValue={item.labelEn} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20" />
              </div>
              <div className="flex items-center justify-end gap-2">
                <button type="submit" className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                  <Save className="h-4 w-4" />
                  {saveLabel}
                </button>
                <button formAction={deleteLookupItem} type="submit" className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm text-rose-600 hover:bg-rose-50">
                  <Trash2 className="h-4 w-4" />
                  {labels.delete}
                </button>
              </div>
            </form>
          ))
        )}
      </div>
    </section>
  );
}

type TestModeSession = {
  id: string;
  status: string;
  started_at: string;
  table_count: number;
  row_count: number;
  created_by_email?: string | null;
};

function TestModePanel({ labels }: { labels: typeof translations.en.testMode }) {
  const [session, setSession] = useState<TestModeSession | null>(null);
  const [busy, setBusy] = useState<'start' | 'finish' | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const requestJson = async (input: RequestInfo | URL, init?: RequestInit, timeoutMs = 15000) => {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(input, { ...init, signal: controller.signal });
      const text = await response.text();
      let data: any = null;
      try {
        data = text ? JSON.parse(text) : null;
      } catch {
        data = { raw: text };
      }
      return { response, data };
    } finally {
      window.clearTimeout(timeout);
    }
  };

  const loadStatus = async () => {
    const { response, data } = await requestJson('/medimagic/api/test-mode', { cache: 'no-store' });
    if (!response.ok || !data.ok) {
      throw new Error(data.error || 'Failed to load test mode status.');
    }

    setSession(data.activeSession ?? null);
    if (data.activeSession?.id) {
      window.localStorage.setItem('medi_magic_test_mode_session', data.activeSession.id);
    } else {
      window.localStorage.removeItem('medi_magic_test_mode_session');
    }
  };

  useEffect(() => {
    loadStatus().catch((error) => setMessage(error instanceof Error ? error.message : String(error)));
  }, []);

  useEffect(() => {
    const finishOnUnload = () => {
      const sessionId = window.localStorage.getItem('medi_magic_test_mode_session');
      if (!sessionId) return;
      const body = JSON.stringify({ action: 'finish', sessionId });
      navigator.sendBeacon('/medimagic/api/test-mode', new Blob([body], { type: 'application/json' }));
      window.localStorage.removeItem('medi_magic_test_mode_session');
    };

    window.addEventListener('beforeunload', finishOnUnload);
    return () => window.removeEventListener('beforeunload', finishOnUnload);
  }, []);

  const start = async () => {
    setBusy('start');
    setMessage(null);
    try {
      const { response, data } = await requestJson('/medimagic/api/test-mode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'start' }),
      });
      if (!response.ok || !data.ok) throw new Error(data.error || 'Failed to start test mode.');
      await loadStatus();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : String(error));
    } finally {
      setBusy(null);
    }
  };

  const finish = async () => {
    if (!session?.id) return;
    if (!window.confirm(labels.finishConfirm ?? '確認要完成並清除測試資料？')) return;
    setBusy('finish');
    setMessage(null);
    try {
      const { response, data } = await requestJson('/medimagic/api/test-mode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'finish', sessionId: session.id }),
      });
      if (!response.ok || !data.ok) throw new Error(data.error || 'Failed to finish test mode.');
      window.localStorage.removeItem('medi_magic_test_mode_session');
      await loadStatus();
      setMessage(labels.finished ?? '已完成並清除測試資料。');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : String(error));
    } finally {
      setBusy(null);
    }
  };

  return (
    <section className={`rounded-2xl border p-5 shadow-sm ${session ? 'border-amber-300 bg-amber-50' : 'border-slate-200 bg-white'}`}>
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-slate-500" />
            <h3 className="font-semibold text-slate-900">{labels.title}</h3>
            <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${session ? 'bg-amber-200 text-amber-900' : 'bg-slate-100 text-slate-600'}`}>{session ? labels.active : labels.inactive}</span>
          </div>
          <p className="mt-1 text-sm leading-6 text-slate-600">{labels.description}</p>
          <p className="mt-2 text-xs font-medium text-amber-800">{labels.warning}</p>
          <p className="mt-1 text-xs text-slate-500">{labels.sqlMissing}</p>
        </div>
        <div className="flex shrink-0 gap-2">
          {session ? (
            <button type="button" onClick={finish} disabled={busy !== null} className="rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60">
              {busy === 'finish' ? labels.restoring : labels.finish}
            </button>
          ) : (
            <button type="button" onClick={start} disabled={busy !== null} className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60">
              {busy === 'start' ? labels.starting : labels.start}
            </button>
          )}
        </div>
      </div>

      {session ? (
        <div className="grid gap-3 text-sm md:grid-cols-3">
          <div className="rounded-xl bg-white px-4 py-3"><div className="text-xs text-slate-500">{labels.startedAt}</div><div className="mt-1 font-semibold text-slate-900">{new Date(session.started_at).toLocaleString()}</div></div>
          <div className="rounded-xl bg-white px-4 py-3"><div className="text-xs text-slate-500">{labels.tables}</div><div className="mt-1 font-semibold text-slate-900">{session.table_count}</div></div>
          <div className="rounded-xl bg-white px-4 py-3"><div className="text-xs text-slate-500">{labels.rows}</div><div className="mt-1 font-semibold text-slate-900">{session.row_count}</div></div>
        </div>
      ) : null}

      {message ? <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{message}</div> : null}
    </section>
  );
}

export default function Administration({ children, canManageUsers, fieldConfigs, payrollSettings, positions, banks, companies, branches, hidePayrollSettings }: AdministrationProps) {
  const [activeTab, setActiveTab] = useState(0);
  const t = useTranslation(translations);

  return (
    <div className="flex h-full flex-col space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">{t.title}</h2>
          <p className="mt-1 text-slate-500">{t.subtitle}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-[#eadfbe] bg-[#fbf7ec] p-5 text-sm text-stone-700 shadow-sm">
        <div className="flex items-center gap-2 font-semibold text-stone-900">
          <Settings2 className="h-4 w-4 text-[#a37c18]" />
          {t.noteTitle}
        </div>
        <p className="mt-2 leading-6">{t.noteBody}</p>
      </div>

      <div className="flex gap-2 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
        {t.tabs.map((tab, index) => (
          <button
            key={tab}
            onClick={() => setActiveTab(index)}
            className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${activeTab === index ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="h-full overflow-y-auto p-6 md:p-8">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.18 }}>
            {activeTab === 0 ? (
              <div className="space-y-4">
                {canManageUsers ? <TestModePanel labels={t.testMode} /> : null}

                {!hidePayrollSettings && (
                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="mb-4 flex items-center gap-2">
                    <Settings2 className="h-4 w-4 text-slate-500" />
                    <div>
                      <h3 className="font-semibold text-slate-900">{t.payrollSettings.title}</h3>
                      <p className="mt-1 text-sm text-slate-500">{t.payrollSettings.description}</p>
                    </div>
                  </div>

                  <form action={updatePayrollSystemSettings} className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">{t.payrollSettings.packageNoPayDefaultHandling}</label>
                      <select
                        name="packageNoPayDefaultHandling"
                        defaultValue={payrollSettings.packageNoPayDefaultHandling}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20"
                      >
                        <option value="no_package">{t.payrollSettings.noPackage}</option>
                        <option value="pro_rate">{t.payrollSettings.proRate}</option>
                      </select>
                    </div>
                    <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800">
                      <Save className="h-4 w-4" />
                      {t.payrollSettings.save}
                    </button>
                  </form>
                </section>
                )}

                {canManageUsers && children ? (
                  children
                ) : (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
                    <div className="flex items-center gap-2 font-semibold text-slate-900">
                      <ShieldCheck className="h-4 w-4 text-slate-500" />
                      {t.usersLocked}
                    </div>
                  </div>
                )}
              </div>
            ) : null}

            {activeTab === 1 ? (
              <div className="space-y-6">
                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="mb-4 flex items-center gap-2">
                    <Columns3 className="h-4 w-4 text-slate-500" />
                    <div>
                      <h3 className="font-semibold text-slate-900">{t.fields.title}</h3>
                      <p className="mt-1 text-sm text-slate-500">{t.fields.description}</p>
                    </div>
                  </div>

                  <form action={createSystemFieldConfig} className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-4 xl:grid-cols-8">
                    <input name="fieldKey" required placeholder={t.fields.fieldKey} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20" />
                    <input name="labelZh" required placeholder={t.fields.labelZh} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20" />
                    <input name="labelEn" placeholder={t.fields.labelEn} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20" />
                    <input name="groupKey" placeholder={t.fields.groupKey} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20" />
                    <input name="inputType" defaultValue="text" placeholder={t.fields.inputType} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20" />
                    <input name="sortOrder" type="number" defaultValue="0" placeholder={t.fields.sortOrder} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20" />
                    <select name="isActive" defaultValue="true" className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20"><option value="true">{t.fields.active}</option><option value="false">{t.fields.inactive}</option></select>
                    <div className="flex gap-2">
                      <select name="isRequired" defaultValue="false" className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20"><option value="false">{t.fields.optional}</option><option value="true">{t.fields.required}</option></select>
                      <button type="submit" className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"><Plus className="h-4 w-4" />{t.fields.add}</button>
                    </div>
                  </form>

                  <div className="mt-4 space-y-3">
                    {fieldConfigs.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-slate-200 px-4 py-6 text-sm text-slate-500">{t.fields.empty}</div>
                    ) : (
                      fieldConfigs.map((field) => (
                        <form key={field.id} action={updateSystemFieldConfig} className="grid gap-3 rounded-2xl border border-slate-200 p-4 md:grid-cols-4 xl:grid-cols-8">
                          <input type="hidden" name="id" value={field.id} />
                          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-500">{field.fieldKey}</div>
                          <input name="labelZh" defaultValue={field.labelZh} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20" />
                          <input name="labelEn" defaultValue={field.labelEn} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20" />
                          <input name="groupKey" defaultValue={field.groupKey} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20" />
                          <input name="inputType" defaultValue={field.inputType} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20" />
                          <input name="sortOrder" type="number" defaultValue={field.sortOrder} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20" />
                          <select name="isActive" defaultValue={String(field.isActive)} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20"><option value="true">{t.fields.active}</option><option value="false">{t.fields.inactive}</option></select>
                          <div className="flex gap-2">
                            <select name="isRequired" defaultValue={String(field.isRequired)} className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20"><option value="false">{t.fields.optional}</option><option value="true">{t.fields.required}</option></select>
                            <button type="submit" className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"><Save className="h-4 w-4" />{t.fields.save}</button>
                          </div>
                          <div className="xl:col-span-8 flex justify-end">
                            <button formAction={deleteSystemFieldConfig} type="submit" className="inline-flex items-center gap-1 rounded-xl px-3 py-2 text-sm text-rose-600 hover:bg-rose-50">
                              <Trash2 className="h-4 w-4" />
                              {t.fields.delete}
                            </button>
                          </div>
                        </form>
                      ))
                    )}
                  </div>
                </section>
              </div>
            ) : null}

            {activeTab === 2 ? (
              <div className="space-y-6">
                <section className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
                  <div className="flex items-center gap-2 font-semibold text-slate-900">
                    <Users className="h-4 w-4 text-slate-500" />
                    {t.masterData.title}
                  </div>
                  <p className="mt-2 leading-6">{t.masterData.description}</p>
                </section>

                <LookupSection title={t.masterData.companies} table="companies" items={companies} labels={t.masterData} saveLabel={t.fields.save} />
                <LookupSection title={t.masterData.branches} table="branches" items={branches} companies={companies} labels={t.masterData} saveLabel={t.fields.save} />
                <LookupSection title={t.masterData.positions} table="positions" items={positions} labels={t.masterData} saveLabel={t.fields.save} />
                <LookupSection title={t.masterData.banks} table="banks" items={banks} labels={t.masterData} saveLabel={t.fields.save} />
              </div>
            ) : null}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
