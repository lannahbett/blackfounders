import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { en, type Dict } from "./locales/en";
import { ptBR } from "./locales/pt-BR";
import { es } from "./locales/es";

export type Lang = "en" | "pt-BR" | "es";

export const LANGS: { code: Lang; label: string }[] = [
  { code: "en", label: "EN" },
  { code: "pt-BR", label: "PT" },
  { code: "es", label: "ES" },
];

const DICTS: Record<Lang, Dict> = { en, "pt-BR": ptBR, es };

const STORAGE_KEY = "bfh.lang";

function detectBrowserLang(): Lang {
  if (typeof navigator === "undefined") return "en";
  const raw = (navigator.language || "en").toLowerCase();
  if (raw.startsWith("pt")) return "pt-BR";
  if (raw.startsWith("es")) return "es";
  return "en";
}

function readStoredLang(): Lang | null {
  if (typeof window === "undefined") return null;
  try {
    const v = window.localStorage.getItem(STORAGE_KEY);
    if (v === "en" || v === "pt-BR" || v === "es") return v;
  } catch {
    /* ignore */
  }
  return null;
}

type Ctx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: Dict;
};

const I18nContext = createContext<Ctx | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  // Start at "en" on both server and first client render to avoid hydration mismatch.
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const chosen = readStoredLang() ?? detectBrowserLang();
    if (chosen !== "en") setLangState(chosen);
  }, []);

  useEffect(() => {
    if (typeof document !== "undefined") document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      window.localStorage.setItem(STORAGE_KEY, l);
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo<Ctx>(() => ({ lang, setLang, t: DICTS[lang] }), [lang, setLang]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useLocale(): Ctx {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    // Safe fallback — allows components used outside the provider (e.g. root error boundary) to still render.
    return { lang: "en", setLang: () => {}, t: en };
  }
  return ctx;
}

export function tFormat(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ""));
}