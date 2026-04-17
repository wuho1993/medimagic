"use client";

import { UserMinus } from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';
import { ModuleEmptyState } from '../components/ui/ModuleEmptyState';

const translations = {
  'zh-TW': {
    title: '員工離職',
    subtitle: '保留離職模組入口，但而家唔再顯示假結算流程。',
    empty: {
      title: '未建立離職流程',
      desc: '呢一頁已移除假離職步驟、假年假結算同假最終薪資資料。之後接上真流程先會顯示正式內容。',
    },
    action: '前往系統管理',
  },
  'zh-CN': {
    title: '员工离职',
    subtitle: '保留离职模块入口，但现在不再显示假结算流程。',
    empty: {
      title: '尚未建立离职流程',
      desc: '这一页已移除假离职步骤、假年假结算和假最终薪资资料。之后接上真实流程后才会显示正式内容。',
    },
    action: '前往系统管理',
  },
  en: {
    title: 'Employee Offboarding',
    subtitle: 'The offboarding route is preserved, but mock settlement content has been removed.',
    empty: {
      title: 'Offboarding flow not configured yet',
      desc: 'This page no longer shows mock offboarding steps, leave settlement, or final payroll values. It will display real flow data once configured.',
    },
    action: 'Open Administration',
  },
};

export default function Offboarding() {
  const t = useTranslation(translations);

  return <ModuleEmptyState title={t.title} subtitle={t.subtitle} icon={UserMinus} emptyTitle={t.empty.title} emptyDescription={t.empty.desc} actionLabel={t.action} actionHref="/app/admin" />;
}