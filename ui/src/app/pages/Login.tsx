"use client";

import { useState, useEffect, useRef, startTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Globe, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import BrandLogo from '../components/BrandLogo';
import { useLanguage, useTranslation } from '../i18n/LanguageContext';
import { createBrowserSupabaseClient } from '@/src/lib/supabase/client';
import { normalizeRole } from '@/src/lib/auth/roles';

const pageTranslations = {
  'zh-TW': {
    systemName: '人事管理系統',
    welcomeBack: '歡迎回來',
    loginPrompt: '請輸入您的帳號密碼登入系統。',
    emailLabel: '電子郵件',
    emailPlaceholder: '請輸入電子郵件',
    passwordLabel: '密碼',
    passwordPlaceholder: '請輸入密碼',
    rememberMe: '記住我',
    forgotPassword: '忘記密碼？',
    loginBtn: '登入',
    poweredBy: 'Powered by Kojin AI',
    language: '繁體中文',
    invalidCredentials: '登入失敗，請檢查電子郵件和密碼。',
    loginInProgress: '登入中...',
    tagline: 'Feel the difference. Feel The Magic.',
  },
  'zh-CN': {
    systemName: '人事管理系统',
    welcomeBack: '欢迎回来',
    loginPrompt: '请输入您的账号密码登录系统。',
    emailLabel: '电子邮件',
    emailPlaceholder: '请输入电子邮件',
    passwordLabel: '密码',
    passwordPlaceholder: '请输入密码',
    rememberMe: '记住我',
    forgotPassword: '忘记密码？',
    loginBtn: '登录',
    poweredBy: 'Powered by Kojin AI',
    language: '简体中文',
    invalidCredentials: '登录失败，请检查电子邮件和密码。',
    loginInProgress: '登录中...',
    tagline: 'Feel the difference. Feel The Magic.',
  },
  en: {
    systemName: 'HR Management System',
    welcomeBack: 'Welcome Back',
    loginPrompt: 'Please enter your details to sign in.',
    emailLabel: 'Email',
    emailPlaceholder: 'Enter your email',
    passwordLabel: 'Password',
    passwordPlaceholder: 'Enter your password',
    rememberMe: 'Remember me',
    forgotPassword: 'Forgot password?',
    loginBtn: 'Sign In',
    poweredBy: 'Powered by Kojin AI',
    language: 'English',
    invalidCredentials: 'Sign in failed. Check your email and password.',
    loginInProgress: 'Signing in...',
    tagline: 'Feel the difference. Feel The Magic.',
  }
};

function getDefaultRoute(role: string) {
  const normalizedRole = normalizeRole(role);

  if (normalizedRole === 'employee') {
    return '/app/dashboard';
  }

  return '/app/people';
}

export default function Login() {
  const { lang, setLang } = useLanguage();
  const t = useTranslation(pageTranslations);
  const [showPassword, setShowPassword] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setLangDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const signInLabel = isSubmitting ? t.loginInProgress : t.loginBtn;

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-linear-to-br from-[#f8f4ec] via-[#f3eee3] to-[#ebe5d8] font-['Plus_Jakarta_Sans',sans-serif] text-slate-800 selection:bg-amber-100 selection:text-amber-900">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-150 w-225 -translate-x-1/2 -translate-y-1/3 rounded-full bg-[#d4af37]/10 blur-[120px]" />
        <div className="absolute bottom-0 left-0 h-100 w-150 -translate-x-1/4 translate-y-1/4 rounded-full bg-[#b8c8bb]/20 blur-[100px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.6),transparent_40%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(120,106,78,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(120,106,78,0.06)_1px,transparent_1px)] bg-size-[36px_36px] opacity-30" />
      </div>

      {/* Language selector */}
      <div className="absolute right-5 top-5 z-20" ref={dropdownRef}>
        <div className="relative">
          <button
            onClick={() => setLangDropdownOpen(!langDropdownOpen)}
            className="flex items-center gap-1.5 rounded-full border border-white/70 bg-white/55 px-3 py-1.5 text-xs font-medium text-stone-500 shadow-[0_8px_30px_rgba(120,106,78,0.08)] backdrop-blur-md transition hover:bg-white/75 hover:text-slate-800 focus:outline-none"
          >
            <Globe className="h-3.5 w-3.5" />
            <span>{t.language}</span>
            <ChevronDown className="h-3 w-3" />
          </button>

          <AnimatePresence>
            {langDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.96 }}
                transition={{ duration: 0.12 }}
                className="absolute right-0 mt-1.5 w-36 overflow-hidden rounded-xl border border-white/80 bg-white/92 py-1 shadow-[0_18px_45px_rgba(99,78,34,0.12)] backdrop-blur-md"
              >
                {(Object.keys(pageTranslations) as Array<keyof typeof pageTranslations>).map((value) => (
                  <button
                    key={value}
                    onClick={() => {
                      setLang(value);
                      setLangDropdownOpen(false);
                    }}
                    className={`w-full px-3.5 py-2 text-left text-sm transition-colors ${lang === value ? 'bg-amber-50 font-medium text-[#9f7b18]' : 'text-stone-500 hover:bg-stone-50 hover:text-slate-800'}`}
                  >
                    {pageTranslations[value].language}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Main content */}
      <motion.div
        className="relative z-10 mx-4 w-full max-w-sm"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
      >
        <div className="rounded-[28px] border border-white/70 bg-white/58 px-6 py-7 shadow-[0_24px_70px_rgba(110,89,49,0.12)] backdrop-blur-xl sm:px-7">
          {/* Logo */}
          <div className="mb-4 flex justify-center">
            <div className="rounded-2xl border border-white/80 bg-white/80 px-4 py-3 shadow-[0_12px_30px_rgba(110,89,49,0.08)]">
              <BrandLogo className="w-24" imageClassName="h-auto w-full object-contain" priority />
            </div>
          </div>

          <div className="mb-5 text-center">
            <h1 className="text-[28px] font-semibold tracking-[0.08em] text-slate-800">
              {t.systemName}
            </h1>
            <p className="mt-2 text-sm text-stone-500">
              {t.loginPrompt}
            </p>
          </div>

          {/* Tagline */}
          <p className="mb-6 text-center font-['Cormorant_Garamond',serif] text-lg italic text-stone-500">
            {t.tagline}
          </p>

          <div className="mb-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-linear-to-r from-transparent via-stone-200 to-stone-300" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.28em] text-stone-400">{t.loginBtn}</span>
            <div className="h-px flex-1 bg-linear-to-l from-transparent via-stone-200 to-stone-300" />
          </div>

          {/* Form */}
          <form
            className="space-y-4"
          onSubmit={async (event) => {
            event.preventDefault();
            setAuthError(null);
            setIsSubmitting(true);

            const supabase = createBrowserSupabaseClient();
            const { data, error } = await supabase.auth.signInWithPassword({
              email,
              password,
            });

            if (error) {
              setAuthError(error.message || t.invalidCredentials);
              setIsSubmitting(false);
              return;
            }

            startTransition(() => {
              const role = String(data.user.user_metadata?.role ?? data.user.app_metadata?.role ?? '');
              router.replace(getDefaultRoute(role));
              router.refresh();
            });
          }}
          >
            <div>
              <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-stone-500" htmlFor="email">
                {t.emailLabel}
              </label>
              <input
                id="email"
                type="email"
                placeholder={t.emailPlaceholder}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-xl border border-[#e9e1d2] bg-[#fffdf9]/90 px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-stone-350 focus:border-[#d4af37]/50 focus:bg-white focus:ring-2 focus:ring-[#d4af37]/10"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-stone-500" htmlFor="password">
                {t.passwordLabel}
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder={t.passwordPlaceholder}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full rounded-xl border border-[#e9e1d2] bg-[#fffdf9]/90 px-4 py-3 pr-10 text-sm text-slate-800 outline-none transition placeholder:text-stone-350 focus:border-[#d4af37]/50 focus:bg-white focus:ring-2 focus:ring-[#d4af37]/10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 transition-colors hover:text-slate-700"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-0.5">
              <label className="flex cursor-pointer items-center gap-2 select-none group">
                <input
                  type="checkbox"
                  className="h-3.5 w-3.5 cursor-pointer appearance-none rounded border border-stone-300 bg-white transition-colors checked:border-[#d4af37] checked:bg-[#d4af37] focus:ring-1 focus:ring-[#d4af37]/30 outline-none"
                />
                <span className="text-[11px] text-stone-500 transition-colors group-hover:text-slate-700">{t.rememberMe}</span>
              </label>
              <button type="button" className="text-[11px] font-medium text-[#b28b1e] transition-colors hover:text-[#8f6e12]">
                {t.forgotPassword}
              </button>
            </div>

            {authError ? <p className="text-xs font-medium text-rose-600">{authError}</p> : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-1 w-full rounded-xl bg-linear-to-r from-[#b89224] via-[#d4af37] to-[#dfbf58] px-4 py-3 text-sm font-semibold text-[#2d2414] shadow-[0_10px_30px_rgba(212,175,55,0.24)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_36px_rgba(212,175,55,0.28)] active:translate-y-0 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {signInLabel}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="mt-6 flex items-center justify-center gap-2">
          <div className="h-px w-8 bg-stone-300/70" />
          <p className="text-[10px] font-medium tracking-widest text-stone-400">{t.poweredBy}</p>
          <div className="h-px w-8 bg-stone-300/70" />
        </div>
      </motion.div>
    </div>
  );
}
