"use client";

import { Users, Calendar, CreditCard, TrendingUp } from 'lucide-react';
import Link from 'next/link';
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
    recentHires: '最近入職',
    payDayReminders: '出糧日提醒',
    people: '人',
    viewAll: '查看全部',
    noData: '暫無資料',
    upcoming: '即將出糧',
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
    recentHires: '最近入职',
    payDayReminders: '发薪日提醒',
    people: '人',
    viewAll: '查看全部',
    noData: '暂无资料',
    upcoming: '即将发薪',
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
    recentHires: 'Recent Hires',
    payDayReminders: 'Pay Day Reminders',
    people: '',
    viewAll: 'View All',
    noData: 'No data yet',
    upcoming: 'Upcoming Pay Day',
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

  function formatDate(value: string) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'short', day: 'numeric' }).format(date);
  }

  const today = new Date().getDate();

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{t.greeting}，{userName}</h1>
        <p className="mt-1 text-sm text-slate-500">{t.overview}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-500">
            <Users className="h-4 w-4" />
            {t.totalEmployees}
          </div>
          <div className="text-3xl font-bold text-slate-900">{data.totalEmployees}</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-500">
            <TrendingUp className="h-4 w-4" />
            {t.activeEmployees}
          </div>
          <div className="text-3xl font-bold text-emerald-600">{data.activeEmployees}</div>
        </div>
        {data.payDayReminders.map((pd) => (
          <div key={pd.day} className={`rounded-2xl border p-5 shadow-sm ${pd.day === today ? 'border-amber-300 bg-amber-50' : 'border-slate-200 bg-white'}`}>
            <div className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-500">
              <CreditCard className="h-4 w-4" />
              {t.upcoming} — {pd.label}
            </div>
            <div className="text-3xl font-bold text-slate-900">{pd.count}<span className="ml-1 text-base font-normal text-slate-500">{t.people}</span></div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
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

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <h2 className="text-base font-bold text-slate-900">{t.recentHires}</h2>
            <Link href="/app/people" className="text-sm font-medium text-[#D4AF37] hover:underline">{t.viewAll}</Link>
          </div>
          <div className="divide-y divide-slate-100">
            {data.recentHires.length === 0 ? (
              <div className="px-6 py-6 text-center text-sm text-slate-400">{t.noData}</div>
            ) : (
              data.recentHires.map((hire) => (
                <Link key={hire.employeeCode} href={`/app/people/${hire.employeeCode}`} className="flex items-center justify-between px-6 py-3 transition-colors hover:bg-slate-50">
                  <div>
                    <div className="text-sm font-semibold text-slate-900">{hire.alias || hire.nameZh}</div>
                    <div className="text-xs text-slate-500">{hire.employeeCode} • {hire.branchName ?? '—'}</div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Calendar className="h-3.5 w-3.5" />
                    {formatDate(hire.hireDate)}
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
