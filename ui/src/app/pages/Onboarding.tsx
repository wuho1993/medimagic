"use client";

import { UserPlus } from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';
import { ModuleEmptyState } from '../components/ui/ModuleEmptyState';

const translations = {
  'zh-TW': {
    title: '員工入職',
    subtitle: '保留入職模組入口，但而家唔再顯示假表單流程。',
    empty: {
      title: '未建立入職流程',
      desc: '呢一頁已移除假入職 step 同假表單內容。之後你定好真實入職欄位、流程同資料表後，再接返正式流程。',
    },
    action: '前往系統管理',
  },
  'zh-CN': {
    title: '员工入职',
    subtitle: '保留入职模块入口，但现在不再显示假表单流程。',
    empty: {
      title: '尚未建立入职流程',
      desc: '这一页已移除假入职 step 和假表单内容。之后你确定真实入职字段、流程和数据表后，再接回正式流程。',
    },
    action: '前往系统管理',
  },
  en: {
    title: 'Employee Onboarding',
    subtitle: 'The onboarding route is kept, but mock workflow content has been removed.',
    empty: {
      title: 'Onboarding flow not configured yet',
      desc: 'This page no longer shows mock onboarding steps or form content. Connect the real onboarding fields, workflow, and tables when you are ready.',
    },
    action: 'Open Administration',
  },
};

export default function Onboarding() {
  const t = useTranslation(translations);

  return <ModuleEmptyState title={t.title} subtitle={t.subtitle} icon={UserPlus} emptyTitle={t.empty.title} emptyDescription={t.empty.desc} actionLabel={t.action} actionHref="/app/admin" />;
}