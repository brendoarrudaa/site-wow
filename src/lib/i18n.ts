import ptBR from "@/locales/pt-BR.json";
import en from "@/locales/en.json";
import es from "@/locales/es.json";

export type Locale = "pt-BR" | "en" | "es";

export const SUPPORTED_LOCALES: Locale[] = ["pt-BR", "en", "es"];
export const DEFAULT_LOCALE: Locale = "pt-BR";
export const LOCALE_STORAGE_KEY = "locale";

export const LOCALE_LABELS: Record<Locale, string> = {
  "pt-BR": "Português",
  en: "English",
  es: "Español",
};

const translations: Record<Locale, typeof ptBR> = { "pt-BR": ptBR, en, es };

export function resolveLocale(raw: string | null | undefined): Locale {
  if (!raw) return DEFAULT_LOCALE;
  if (SUPPORTED_LOCALES.includes(raw as Locale)) return raw as Locale;
  const base = raw.split("-")[0];
  if (base === "pt") return "pt-BR";
  if (base === "en") return "en";
  if (base === "es") return "es";
  return DEFAULT_LOCALE;
}

export function detectLocale(): Locale {
  if (typeof window === "undefined") return DEFAULT_LOCALE;
  try {
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
    if (stored) return resolveLocale(stored);
  } catch {}
  const browser = navigator.language || (navigator as any).userLanguage;
  return resolveLocale(browser);
}

export function saveLocale(locale: Locale) {
  try {
    localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  } catch {}
}

type PathInto<T, Prefix extends string = ""> = T extends string | number | boolean | Array<any>
  ? Prefix
  : {
      [K in keyof T]: PathInto<T[K], Prefix extends "" ? string & K : `${Prefix}.${string & K}`>;
    }[keyof T];

export type TranslationKey = PathInto<typeof ptBR>;

export function getTranslation(locale: Locale, key: string, vars?: Record<string, string>): string {
  const dict = translations[locale] ?? translations[DEFAULT_LOCALE];
  const parts = key.split(".");
  let value: any = dict;
  for (const part of parts) {
    value = value?.[part];
    if (value === undefined) break;
  }
  if (typeof value !== "string") {
    // fallback to default locale
    let fallback: any = translations[DEFAULT_LOCALE];
    for (const part of parts) {
      fallback = fallback?.[part];
      if (fallback === undefined) break;
    }
    value = typeof fallback === "string" ? fallback : key;
  }
  if (vars) {
    return (value as string).replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? `{${k}}`);
  }
  return value as string;
}
