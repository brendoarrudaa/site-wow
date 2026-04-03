import * as React from "react";
import {
  type Locale,
  DEFAULT_LOCALE,
  LOCALE_STORAGE_KEY,
  detectLocale,
  saveLocale,
  getTranslation,
} from "@/lib/i18n";

const listeners: Array<(locale: Locale) => void> = [];
let currentLocale: Locale = DEFAULT_LOCALE;

function dispatch(locale: Locale) {
  currentLocale = locale;
  listeners.forEach((l) => l(locale));
}

export function setLocale(locale: Locale) {
  currentLocale = locale;
  saveLocale(locale);
  document.documentElement.setAttribute("lang", locale);
  dispatch(locale);
}

export function useTranslation() {
  const [locale, setLocaleState] = React.useState<Locale>(DEFAULT_LOCALE);

  React.useEffect(() => {
    const detected = detectLocale();
    if (detected !== currentLocale) {
      currentLocale = detected;
      document.documentElement.setAttribute("lang", detected);
    }
    setLocaleState(currentLocale);

    listeners.push(setLocaleState);
    return () => {
      const idx = listeners.indexOf(setLocaleState);
      if (idx > -1) listeners.splice(idx, 1);
    };
  }, []);

  const t = React.useCallback(
    (key: string, vars?: Record<string, string>) => getTranslation(locale, key, vars),
    [locale]
  );

  return { t, locale, setLocale };
}
