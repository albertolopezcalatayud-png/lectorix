import { useAppStore } from '@/stores/useAppStore';
import { es, type TranslationKey } from './es';
import { ca } from './ca';
import { en } from './en';

const translations: Record<string, Record<TranslationKey, string>> = { es, ca, en };

/**
 * Hook for internationalization.
 * Returns a `t` function that accepts a key and optional params for interpolation.
 *
 * Usage:
 *   const { t } = useI18n();
 *   t('dash_hello', { name: 'Alberto' }) // "¡Hola, Alberto! 👋"
 */
export function useI18n() {
  const language = useAppStore((s) => s.language);
  const dict = translations[language] || es;

  function t(key: TranslationKey, params?: Record<string, string | number>): string {
    let text = dict[key] || es[key] || key;
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        text = text.replace(`{${k}}`, String(v));
      }
    }
    return text;
  }

  return { t, language };
}

/**
 * Non-hook translator for use outside React components (e.g. PDF export).
 * Pass the language code directly.
 */
export function getTranslator(language: string) {
  const dict = translations[language] || es;

  function t(key: TranslationKey, params?: Record<string, string | number>): string {
    let text = dict[key] || es[key] || key;
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        text = text.replace(`{${k}}`, String(v));
      }
    }
    return text;
  }

  return t;
}

export type { TranslationKey };

/** Locale for dates and numbers in the interface language (never the device's own language) */
export function dateLocale(language: string): string {
  return language === 'ca' ? 'ca-ES' : language === 'en' ? 'en-GB' : 'es-ES';
}
