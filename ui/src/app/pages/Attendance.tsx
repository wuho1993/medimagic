"use client";

import { CalendarDays, CheckCircle2, Clock } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '../i18n/LanguageContext';
import type { EmployeeDirectoryRecord } from '@/src/lib/employees/queries';

type AttendanceProps = {
  employees: EmployeeDirectoryRecord[];
};

const translations = {
  'zh-TW': {
    title: '考勤與排班',
    subtitle: '在職員工出勤概覽。打卡資料接上後會顯示實際記錄。',
    cols: { code: '編號', name: '姓名', branch: '分店', status: '今日狀態' },
    present: '已報到',
    pending: '待確認',
    noData: '暫無在職員工。',
    total: '在職人數',
  },
  'zh-CN': {
    title: '考勤与排班',
    subtitle: '在职员工出勤概览。打卡资料接上后会显示实际记录。',
    cols: { code: '编号', name: '姓名', branch: '分店', status: '今日状态' },
    present: '已报到',
    pending: '待确认',
    noData: '暂无在职员工。',
    total: '在职人数',
  },
  en: {
    title: 'Time & Scheduling',
    subtitle: 'Active employee roster. Real clock-in data will appear once connected.',
    cols: { code: 'Code', name: 'Name', branch: 'Branch', status: 'Today' },
    present: 'Present',
    pending: 'Pending',
    noData: 'No active employees.',
    total: 'Active Staff',
  },
} as const;

export default function Attendance({ employees }: AttendanceProps) {
  const { lang } = useLanguage();
  const t = translations[lang] ?? translations.en;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t.title}</h1>
          <p className="mt-1 text-sm text-slate-500">{t.subtitle}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-center shadow-sm">
          <div className="text-xs font-medium text-slate-500">{t.total}</div>
          <div className="text-lg font-bold text-slate-900">{employees.length}</div>
        </div>
      </div>

      {employees.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-12 text-center">
          <CalendarDays className="mx-auto mb-3 h-10 w-10 text-slate-300" />
          <p className="text-sm text-slate-500">{t.noData}</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                <th className="px-4 py-3">{t.cols.code}</th>
                <th className="px-4 py-3">{t.cols.name}</th>
                <th className="px-4 py-3">{t.cols.branch}</th>
                <th className="px-4 py-3 text-center">{t.cols.status}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {employees.map((emp) => (
                <tr key={emp.id} className="transition-colors hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <Link href={`/app/people?id=${emp.employeeCode}`} className="font-medium text-[#D4AF37] hover:underline">{emp.employeeCode}</Link>
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-900">{emp.alias || emp.nameZh}</td>
                  <td className="px-4 py-3 text-slate-600">{emp.branchNameZh ?? '—'}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500">
                      <Clock className="h-3 w-3" />
                      {t.pending}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}