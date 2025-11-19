"use client";

import { useState, useEffect } from "react";
import { getCurrentLocale, setLocale as setI18nLocale, t, type Locale } from "@/lib/i18n";

export const useLocale = () => {
  const [locale, setLocaleState] = useState<Locale>('zh');

  useEffect(() => {
    // Initialize from localStorage
    setLocaleState(getCurrentLocale());

    // Listen for locale changes
    const handleLocaleChange = () => {
      setLocaleState(getCurrentLocale());
    };

    window.addEventListener('localechange', handleLocaleChange);
    return () => window.removeEventListener('localechange', handleLocaleChange);
  }, []);

  const setLocale = (newLocale: Locale) => {
    setI18nLocale(newLocale);
    setLocaleState(newLocale);
  };

  const translate = (key: string) => t(key, locale);

  return { locale, setLocale, t: translate };
};
