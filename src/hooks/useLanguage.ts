import { useState, useEffect, createContext, useContext } from 'react';

export type Lang = 'es' | 'en';

export interface LanguageContextType {
  lang: Lang;
  toggleLang: () => void;
}

export const LanguageContext = createContext<LanguageContextType | null>(null);

export function useLanguage(): LanguageContextType {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}

export function useLanguageState(): LanguageContextType {
  const [lang, setLang] = useState<Lang>(() => {
    if (typeof window === 'undefined') return 'es';
    const saved = localStorage.getItem('adros-lang') as Lang | null;
    if (saved === 'es' || saved === 'en') return saved;
    return navigator.language.startsWith('es') ? 'es' : 'en';
  });

  const toggleLang = () => {
    const next = lang === 'es' ? 'en' : 'es';
    setLang(next);
    if (typeof window !== 'undefined') {
      localStorage.setItem('adros-lang', next);
    }
  };

  return { lang, toggleLang };
}

export function useTranslation(lang: Lang) {
  const [translations, setTranslations] = useState<Record<string, string>>({});

  useEffect(() => {
    const load = async () => {
      const mod = lang === 'es'
        ? await import('@/i18n/es')
        : await import('@/i18n/en');
      setTranslations(mod.translations);
    };
    load();
  }, [lang]);

  const t = (key: string): string => translations[key] ?? key;
  return { t };
}
