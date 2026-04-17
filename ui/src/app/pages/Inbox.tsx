"use client";

import { AlertTriangle, Award, Calendar, CreditCard, FileWarning, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '../i18n/LanguageContext';
import type { InboxReminder } from '@/src/lib/employees/queries';

type InboxProps = {
  reminders: InboxReminder[];
};

const translations = {
  'zh-TW': {
    title: '提醒收件匣',
    subtitle: '集中查看即將到期嘅事項同出糧提醒。',
    empty: '暫時冇任何提醒，一切正常！',
    types: {
      pay_day: '出糧日',
      probation_ending: '試用期即將完結',
      visa_expiring: 'Visa 即將到期',
      contract_ending: '合約即將完結',
      certificate_expiring: '證書即將到期',
    },
    daysLeft: '日後',
    today: '今日',
  },
  'zh-CN': {
    title: '提醒收件箱',
    subtitle: '集中查看即将到期的事项和发薪提醒。',
    empty: '暂时没有任何提醒，一切正常！',
    types: {
      pay_day: '发薪日',
      probation_ending: '试用期即将结束',
      visa_expiring: 'Visa 即将到期',
      contract_ending: '合同即将结束',
      certificate_expiring: '证书即将到期',
    },
    daysLeft: '天后',
    today: '今天',
  },
  en: {
    title: 'Reminder Inbox',
    subtitle: 'Upcoming deadlines, pay days, and expiring items.',
    empty: 'No reminders right now — all clear!',
    types: {
      pay_day: 'Pay Day',
      probation_ending: 'Probation Ending',
      visa_expiring: 'Visa Expiring',
      contract_ending: 'Contract Ending',
      certificate_expiring: 'Certificate Expiring',
    },
    daysLeft: 'days left',
    today: 'Today',
  },
} as const;

const typeIcons = {
  pay_day: CreditCard,
  probation_ending: AlertTriangle,
  visa_expiring: ShieldAlert,
  contract_ending: FileWarning,
  certificate_expiring: Award,
};

const typeColors = {
  pay_day: 'bg-blue-50 text-blue-700 border-blue-200',
  probation_ending: 'bg-amber-50 text-amber-700 border-amber-200',
  visa_expiring: 'bg-rose-50 text-rose-700 border-rose-200',
  contract_ending: 'bg-orange-50 text-orange-700 border-orange-200',
  certificate_expiring: 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200',
};

export default function Inbox({ reminders }: InboxProps) {
  const { lang } = useLanguage();
  const t = translations[lang] ?? translations.en;
  const locale = lang === 'en' ? 'en-HK' : lang === 'zh-CN' ? 'zh-CN' : 'zh-HK';

  function formatDate(value: string) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'short', day: 'numeric' }).format(date);
  }

  function getDaysLeft(dateStr: string) {
    const diff = Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (diff <= 0) return t.today;
    return `${diff} ${t.daysLeft}`;
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{t.title}</h1>
        <p className="mt-1 text-sm text-slate-500">{t.subtitle}</p>
      </div>

      {reminders.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-12 text-center">
          <Calendar className="mx-auto mb-3 h-10 w-10 text-slate-300" />
          <p className="text-sm text-slate-500">{t.empty}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reminders.map((reminder, idx) => {
            const Icon = typeIcons[reminder.type];
            const color = typeColors[reminder.type];
            return (
              <Link key={`${reminder.employeeCode}-${reminder.type}-${idx}`} href={`/app/people/${reminder.employeeCode}`} className={`flex items-center gap-4 rounded-2xl border p-4 transition-shadow hover:shadow-md ${color}`}>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/60">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold">{t.types[reminder.type]}</div>
                  <div className="text-xs opacity-80">{reminder.employeeName} ({reminder.employeeCode}) — {reminder.detail}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-medium">{formatDate(reminder.date)}</div>
                  <div className="text-xs opacity-70">{getDaysLeft(reminder.date)}</div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
