import type { ModuleInfo, ModuleId } from '@/types';
import type { TranslationKey } from '@/i18n/es';

/** Translated name and description of each module */
export const MODULE_TEXT: Record<ModuleId, { name: TranslationKey; desc: TranslationKey }> = {
  fonologia: { name: 'mod_fonologia', desc: 'mod_desc_fonologia' },
  memoria_visual: { name: 'mod_memoria', desc: 'mod_desc_memoria_visual' },
  comprension_lectora: { name: 'mod_comprension', desc: 'mod_desc_comprension_lectora' },
  escritura: { name: 'mod_escritura', desc: 'mod_desc_escritura' },
  retos_rapidos: { name: 'mod_retos', desc: 'mod_desc_retos_rapidos' },
};

export const levelNameKey = (level: number) => `lvl_name_${level}` as TranslationKey;

export const MODULES: ModuleInfo[] = [
  {
    id: 'fonologia',
    name: 'Fonología',
    description: 'Reconocimiento de sonidos, sílabas y conciencia fonológica',
    icon: '🔊',
    color: 'var(--color-accent)',
    colorPale: 'var(--color-accent-pale)',
    levels: 5,
  },
  {
    id: 'memoria_visual',
    name: 'Memoria Visual',
    description: 'Reconocimiento visual de palabras y patrones ortográficos',
    icon: '👁️',
    color: 'var(--color-sky)',
    colorPale: 'var(--color-sky-pale)',
    levels: 5,
  },
  {
    id: 'comprension_lectora',
    name: 'Comprensión Lectora',
    description: 'Comprensión de textos, inferencias y vocabulario',
    icon: '📖',
    color: 'var(--color-mint)',
    colorPale: 'var(--color-mint-pale)',
    levels: 5,
  },
  {
    id: 'escritura',
    name: 'Escritura',
    description: 'Ortografía, acentuación y expresión escrita',
    icon: '✏️',
    color: 'var(--color-peach)',
    colorPale: 'var(--color-peach-pale)',
    levels: 5,
  },
  {
    id: 'retos_rapidos',
    name: 'Retos Rápidos',
    description: 'Ejercicios cronometrados multimódulo para agilidad',
    icon: '⚡',
    color: 'var(--color-yellow)',
    colorPale: 'var(--color-yellow-pale)',
    levels: 5,
  },
];

/**
 * How many levels each practice language has.
 * Spanish and Valencian go from early Primary to the end of ESO (levels 6-9 = ESO).
 * English is a foreign language for the students, so it keeps its own scale.
 */
export const LEVEL_COUNT: Record<'es' | 'ca' | 'en', number> = { es: 9, ca: 9, en: 7 };

/**
 * English levels follow the Common European Framework (CEFR), not the school year:
 * for these students English is a foreign language.
 */
export const CEFR: Record<number, string> = { 1: 'Pre\u2011A1', 2: 'A1', 3: 'A1+', 4: 'A2', 5: 'A2+', 6: 'B1', 7: 'B1+' };

/** Extra tag shown next to a level name (the CEFR band in English, nothing otherwise) */
export const levelTag = (lang: string, level: number) => (lang === 'en' && CEFR[level] ? `\u00a0·\u00a0${CEFR[level]}` : '');

/** School stage the family or teacher can tell the app (only used to pick a starting level) */
export type SchoolStage = 'p12' | 'p34' | 'p56' | 'eso12' | 'eso34';
export const SCHOOL_STAGES: SchoolStage[] = ['p12', 'p34', 'p56', 'eso12', 'eso34'];

/**
 * Suggested starting level for each stage. It is set a little below the course on purpose:
 * the app is for students who find reading and writing hard, and they can always move up.
 */
export const STAGE_START: Record<'es' | 'ca' | 'en', Record<SchoolStage, number>> = {
  es: { p12: 1, p34: 2, p56: 4, eso12: 5, eso34: 7 },
  ca: { p12: 1, p34: 2, p56: 4, eso12: 5, eso34: 7 },
  en: { p12: 1, p34: 2, p56: 3, eso12: 4, eso34: 5 },
};

export function getModule(id: string): ModuleInfo | undefined {
  return MODULES.find((m) => m.id === id);
}
