"use client";

import { Users, CreditCard, TrendingUp } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import type { DashboardData } from '@/src/lib/employees/queries';

type DashboardProps = {
  data: DashboardData;
  userName: string;
};

const translations = {
  'zh-TW': {
    greeting: '歡迎回來',
    overview: '系統概覽',
    totalEmployees: '全部員工',
    activeEmployees: '在職員工',
    branchBreakdown: '分店分佈',
    payDayReminders: '出糧日提醒',
    people: '人',
    noData: '暫無資料',
    currentMonthPayout: '本月出糧',
    pay7th: '7th 應出金額',
    pay20th: '20th 應出金額',
    employeeCode: '員工編號',
    name: '姓名',
    hireDate: '入職日期',
    branch: '分店',
    day: '日期',
    count: '人數',
  },
  'zh-CN': {
    greeting: '欢迎回来',
    overview: '系统概览',
    totalEmployees: '全部员工',
    activeEmployees: '在职员工',
    branchBreakdown: '分店分布',
    payDayReminders: '发薪日提醒',
    people: '人',
    noData: '暂无资料',
    currentMonthPayout: '本月发薪',
    pay7th: '7th 应发金额',
    pay20th: '20th 应发金额',
    employeeCode: '员工编号',
    name: '姓名',
    hireDate: '入职日期',
    branch: '分店',
    day: '日期',
    count: '人数',
  },
  en: {
    greeting: 'Welcome back',
    overview: 'System Overview',
    totalEmployees: 'Total Employees',
    activeEmployees: 'Active Employees',
    branchBreakdown: 'Branch Distribution',
    payDayReminders: 'Pay Day Reminders',
    people: '',
    noData: 'No data yet',
    currentMonthPayout: 'Current Month Payroll',
    pay7th: '7th Payout',
    pay20th: '20th Payout',
    employeeCode: 'Code',
    name: 'Name',
    hireDate: 'Hire Date',
    branch: 'Branch',
    day: 'Day',
    count: 'Employees',
  },
} as const;

export default function Dashboard({ data, userName }: DashboardProps) {
  const { lang } = useLanguage();
  const t = translations[lang] ?? translations.en;
  const locale = lang === 'en' ? 'en-HK' : lang === 'zh-CN' ? 'zh-CN' : 'zh-HK';

  const formatCurrency = (value: number) => new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'HKD',
    maximumFractionDigits: 0,
  }).format(value);

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{t.greeting}，{userName}</h1>
        <p className="mt-1 text-sm text-slate-500">{t.overview}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-500">
            <TrendingUp className="h-4 w-4" />
            {t.activeEmployees}
          </div>
          <div className="text-3xl font-bold text-emerald-600">{data.activeEmployees}<span className="ml-1 text-base font-normal text-slate-500">{t.people}</span></div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-500">
            <Users className="h-4 w-4" />
            {t.totalEmployees}
          </div>
          <div className="text-3xl font-bold text-slate-900">{data.totalEmployees}<span className="ml-1 text-base font-normal text-slate-500">{t.people}</span></div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-500">
            <CreditCard className="h-4 w-4" />
            {t.pay7th}
          </div>
          <div className="text-3xl font-bold text-slate-900">{formatCurrency(data.payrollPayoutSummary.primaryAmount)}</div>
          <div className="mt-1 text-xs font-medium text-slate-400">{data.payrollPayoutSummary.yearMonth}</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-500">
            <CreditCard className="h-4 w-4" />
            {t.pay20th}
          </div>
          <div className="text-3xl font-bold text-slate-900">{formatCurrency(data.payrollPayoutSummary.secondaryAmount)}</div>
          <div className="mt-1 text-xs font-medium text-slate-400">{data.payrollPayoutSummary.yearMonth}</div>
        </div>
      </div>

      <div className="grid gap-6">
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <h2 className="text-base font-bold text-slate-900">{t.branchBreakdown}</h2>
          </div>
          <div className="divide-y divide-slate-100 px-6">
            {data.branchBreakdown.length === 0 ? (
              <div className="py-6 text-center text-sm text-slate-400">{t.noData}</div>
            ) : (
              data.branchBreakdown.map((item) => (
                <div key={item.branch} className="flex items-center justify-between py-3">
                  <span className="text-sm font-medium text-slate-700">{item.branch}</span>
                  <div className="flex items-center gap-3">
                    <div className="h-2 rounded-full bg-slate-200" style={{ width: 120 }}>
                      <div className="h-2 rounded-full bg-[#D4AF37]" style={{ width: Math.max(8, (item.count / data.activeEmployees) * 120) }}></div>
                    </div>
                    <span className="w-8 text-right text-sm font-semibold text-slate-900">{item.count}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
