"use client";

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import BrandLogo from './BrandLogo';
import {
  Users,
  CreditCard,
  FileText,
  Settings,
  LogOut,
  Menu,
  Globe,
  ChevronDown,
  LayoutDashboard,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage, useTranslation, type Language } from '../i18n/LanguageContext';
import type { AppShellUser } from '@/src/lib/auth/session';
import { createBrowserSupabaseClient } from '@/src/lib/supabase/client';
import { canAccessRoute, type NavRouteKey } from '@/src/lib/auth/roles';

const layoutTranslations = {
  'zh-TW': {
    nav: {
      dashboard: '儀表板',
      inbox: '審批收件匣',
      people: '員工目錄',
      payroll: '薪酬管理',
      attendance: '考勤與排班',
      leaves: '出勤管理',
      admin: '系統管理',
    },
    profile: {
      role: '人力資源總監',
      signOut: '登出',
    },
    language: '繁體中文',
  },
  'zh-CN': {
    nav: {
      dashboard: '仪表板',
      inbox: '审批收件箱',
      people: '员工目录',
      payroll: '薪酬管理',
      attendance: '考勤与排班',
      leaves: '出勤管理',
      admin: '系统管理',
    },
    profile: {
      role: '人力资源总监',
      signOut: '退出登录',
    },
    language: '简体中文',
  },
  en: {
    nav: {
      dashboard: 'Dashboard',
      inbox: 'Inbox',
      people: 'People',
      payroll: 'Payroll',
      attendance: 'Time & Scheduling',
      leaves: 'Attendance Management',
      admin: 'Administration',
    },
    profile: {
      role: 'HR Director',
      signOut: 'Sign Out',
    },
    language: 'English',
  },
};

const navigationMap: Array<{ key: NavRouteKey; href: string; icon: typeof Users }> = [
  { key: 'dashboard', href: '/app/dashboard', icon: LayoutDashboard },
  { key: 'people', href: '/app/people', icon: Users },
  { key: 'payroll', href: '/app/payroll', icon: CreditCard },
  { key: 'leaves', href: '/app/leaves', icon: FileText },
  { key: 'admin', href: '/app/admin', icon: Settings },
] as const;

const hiddenRouteTitles = [
  { key: 'attendance' as const, href: '/app/attendance' },
] as const;

function getInitials(fullName: string) {
  return fullName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export default function Layout({ children, user }: { children: React.ReactNode; user: AppShellUser }) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = React.useState(false);
  const [isSigningOut, startSignOutTransition] = React.useTransition();
  const { lang, setLang } = useLanguage();
  const t = useTranslation(layoutTranslations);
  const router = useRouter();
  const pathname = usePathname();

  const langRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (langRef.current && !langRef.current.contains(event.target as Node)) {
        setLangDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const visibleNavigation = React.useMemo(
    () => navigationMap.filter((item) => canAccessRoute(user.role, item.key)),
    [user.role]
  );

  const currentNav = visibleNavigation.find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`));
  const currentHiddenRoute = hiddenRouteTitles.find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`));
  const pageTitle = currentNav
    ? t.nav[currentNav.key]
    : currentHiddenRoute
      ? t.nav[currentHiddenRoute.key]
      : t.nav.people;
  const profileRole = user.roleLabel || t.profile.role;
  const appBasePath = typeof window !== 'undefined' && window.location.hostname.endsWith('github.io') ? '/medimagic' : '';

  const handleSignOut = React.useCallback(() => {
    startSignOutTransition(async () => {
      const supabase = createBrowserSupabaseClient();
      await supabase.auth.signOut();
      router.replace('/');
      router.refresh();
    });
  }, [router]);

  return (
    <div className="flex min-h-screen bg-[#FAFAF9] font-['Plus_Jakarta_Sans',sans-serif] text-slate-800 selection:bg-amber-100 selection:text-amber-900">
      <aside className="z-20 hidden w-64 shrink-0 flex-col bg-slate-900 text-white shadow-xl md:flex">
        <div className="flex h-20 items-center border-b border-slate-800 px-6">
          <BrandLogo className="w-36" imageClassName="h-auto w-full object-contain" priority />
        </div>

        <nav className="flex-1 space-y-1.5 overflow-y-auto px-4 py-6">
          {visibleNavigation.map((item) => (
            <a
              key={item.key}
              href={`${appBasePath}${item.href}`}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                pathname === item.href || pathname.startsWith(`${item.href}/`)
                  ? 'bg-white/10 text-white shadow-sm ring-1 ring-white/5'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              <span className="truncate">{t.nav[item.key]}</span>
            </a>
          ))}
        </nav>

        <div className="border-t border-slate-800 p-4">
          <div className="mb-2 flex items-center gap-3 rounded-xl bg-slate-800/50 px-4 py-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-600 bg-slate-700 text-xs font-semibold text-white">
              {getInitials(user.fullName)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold text-white">{user.fullName}</div>
              <div className="truncate text-[10px] uppercase tracking-wider text-slate-400">{profileRole}</div>
            </div>
          </div>
          <button onClick={handleSignOut} disabled={isSigningOut} className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-slate-400 transition-all hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-60">
            <LogOut className="h-4 w-4 shrink-0" />
            <span className="truncate">{t.profile.signOut}</span>
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="z-30 flex h-20 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-4 md:hidden">
            <button onClick={() => setMobileMenuOpen(true)} className="-ml-2 rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-900">
              <Menu className="h-6 w-6" />
            </button>
            <BrandLogo className="w-28" imageClassName="h-auto w-full object-contain" />
          </div>

          <h1 className="hidden text-xl font-semibold tracking-tight text-slate-800 md:block">{pageTitle}</h1>

          <div className="flex items-center gap-3 md:gap-5">
            <div className="relative" ref={langRef}>
              <button onClick={() => setLangDropdownOpen(!langDropdownOpen)} className="flex items-center gap-2 rounded-full border border-transparent px-3 py-2 text-sm font-medium text-slate-500 transition-colors hover:border-slate-200 hover:bg-slate-50 hover:text-slate-900 focus:outline-none">
                <Globe className="h-4 w-4 text-slate-400" />
                <span className="hidden lg:inline">{t.language}</span>
                <ChevronDown className="hidden h-3 w-3 text-slate-400 lg:inline" />
              </button>

              <AnimatePresence>
                {langDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 z-50 mt-2 w-36 overflow-hidden rounded-xl border border-slate-100 bg-white py-1 shadow-lg"
                  >
                    {(Object.keys(layoutTranslations) as Language[]).map((value) => (
                      <button
                        key={value}
                        onClick={() => {
                          setLang(value);
                          setLangDropdownOpen(false);
                        }}
                        className={`w-full px-4 py-2.5 text-left text-sm transition-colors ${lang === value ? 'bg-amber-50 font-medium text-amber-900' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
                      >
                        {layoutTranslations[value].language}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        <main className="relative flex-1 overflow-y-auto bg-[#FAFAF9] p-4 sm:p-6 md:p-8">
          {children}
        </main>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMobileMenuOpen(false)} className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm md:hidden" />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-slate-900 text-white shadow-2xl md:hidden"
            >
              <div className="flex h-20 shrink-0 items-center border-b border-slate-800 px-6">
                <BrandLogo className="w-36" imageClassName="h-auto w-full object-contain" />
              </div>
              <nav className="flex-1 space-y-2 overflow-y-auto px-4 py-6">
                {visibleNavigation.map((item) => (
                  <a
                    key={item.key}
                    href={`${appBasePath}${item.href}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-medium transition-all ${
                      pathname === item.href || pathname.startsWith(`${item.href}/`)
                        ? 'bg-white/10 text-white ring-1 ring-white/5'
                        : 'text-slate-400 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <item.icon className="h-5 w-5 shrink-0" />
                    <span className="truncate">{t.nav[item.key]}</span>
                  </a>
                ))}
              </nav>
              <div className="shrink-0 border-t border-slate-800 p-4">
                <button onClick={() => { setMobileMenuOpen(false); handleSignOut(); }} disabled={isSigningOut} className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-400 transition-all hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-60">
                  <LogOut className="h-5 w-5 shrink-0" />
                  <span className="truncate">{t.profile.signOut}</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
