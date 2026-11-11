import type { ModuleId } from '@/types';
import type { TranslationKey } from '@/i18n';

/** Specific skills each exercise trains (assigned by scripts/content/tag_items.py) */
export interface SkillInfo {
  id: string;
  modules: ModuleId[];
  emoji: string;
}

export const SKILLS: SkillInfo[] = [
  { id: 'fon_syllables', modules: ['fonologia'], emoji: '👏' },
  { id: 'fon_rhyme', modules: ['fonologia'], emoji: '🎵' },
  { id: 'fon_sounds', modules: ['fonologia'], emoji: '👂' },
  { id: 'fon_stress', modules: ['fonologia'], emoji: '🔊' },
  { id: 'fon_vowels', modules: ['fonologia'], emoji: '🅰️' },
  { id: 'mem_visual', modules: ['memoria_visual'], emoji: '👀' },
  { id: 'mem_spelling', modules: ['memoria_visual'], emoji: '🧠' },
  { id: 'mem_alpha', modules: ['memoria_visual'], emoji: '🔤' },
  { id: 'comp_literal', modules: ['comprension_lectora'], emoji: '🔎' },
  { id: 'comp_inference', modules: ['comprension_lectora'], emoji: '🕵️' },
  { id: 'comp_vocab', modules: ['comprension_lectora'], emoji: '📚' },
  { id: 'comp_main', modules: ['comprension_lectora'], emoji: '🎯' },
  { id: 'comp_texttype', modules: ['comprension_lectora'], emoji: '🧩' },
  { id: 'esc_accents', modules: ['escritura'], emoji: '✒️' },
  { id: 'esc_letters', modules: ['escritura'], emoji: '✍️' },
  { id: 'esc_confusables', modules: ['escritura'], emoji: '🔀' },
  { id: 'esc_punct', modules: ['escritura'], emoji: '❗' },
  { id: 'esc_grammar', modules: ['escritura'], emoji: '⚙️' },
  { id: 'esc_sentences', modules: ['escritura'], emoji: '🧱' },
  { id: 'dictation', modules: ['fonologia', 'escritura'], emoji: '🎧' },
  { id: 'transfer', modules: ['escritura', 'retos_rapidos', 'fonologia'], emoji: '🪤' },
  { id: 'ret_vocab', modules: ['retos_rapidos'], emoji: '💬' },
  { id: 'ret_categories', modules: ['retos_rapidos'], emoji: '🗂️' },
  { id: 'ret_wordform', modules: ['retos_rapidos'], emoji: '🧬' },
  { id: 'ret_letters', modules: ['retos_rapidos'], emoji: '🔡' },
];

export const SKILL_BY_ID: Record<string, SkillInfo> = Object.fromEntries(SKILLS.map((s) => [s.id, s]));
export const skillNameKey = (id: string) => `sk_${id}` as TranslationKey;
export const skillTipKey = (id: string) => `sk_${id}_tip` as TranslationKey;
