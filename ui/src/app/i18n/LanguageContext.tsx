"use client";

import { createContext, useContext, useState, type ReactNode } from 'react';

export type Language = 'zh-TW' | 'zh-CN' | 'en';

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'zh-TW',
  setLang: () => {},
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Language>('zh-TW');

  return <LanguageContext.Provider value={{ lang, setLang }}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  return useContext(LanguageContext);
}

export function useTranslation<T extends Record<string, unknown>>(translations: Record<Language, T>): T {
  const { lang } = useLanguage();
  return translations[lang];
}
