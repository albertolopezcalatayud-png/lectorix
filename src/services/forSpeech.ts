/**
 * The text as a person would read it aloud. The screen keeps the written text; the voice (the recorded clips and
 * the device's voice) gets this version, so it never spells out a word in capitals, never says «barra» for a
 * slash and reads «1.º» as «primero». Pure code: the app and the clip generator (scripts/audio) use the same rules.
 */
type Lang = 'es' | 'ca' | 'en' | string;

/** Initials that are read letter by letter or as a word on purpose: they stay as written */
const INITIALS = new Set(['ADN', 'ARN', 'IA', 'AI', 'UNESCO', 'ESO', 'IES', 'DNA', 'UK', 'EU', 'UE', 'ONU', 'UN', 'USA', 'EEUU', 'TV', 'CD', 'DVD', 'PC', 'OK', 'NASA', 'IVA', 'DNI', 'ONG', 'NGO', 'BBC', 'FP', 'EBAU', 'PAU']);
const ROMAN = /^[IVXLCDM]+$/;

const ORDINAL: Record<string, Record<string, string>> = {
  es: { '1.º': 'primero', '2.º': 'segundo', '3.º': 'tercero', '4.º': 'cuarto', '5.º': 'quinto', '6.º': 'sexto', '1.ª': 'primera', '2.ª': 'segunda', '3.ª': 'tercera', '4.ª': 'cuarta', '5.ª': 'quinta', '6.ª': 'sexta' },
  ca: { '1r': 'primer', '2n': 'segon', '3r': 'tercer', '4t': 'quart', '5è': 'cinqué', '6è': 'sisé', '1a': 'primera', '2a': 'segona', '3a': 'tercera', '4a': 'quarta', '1.º': 'primer', '2.º': 'segon' },
};
const OR: Record<string, string> = { es: 'o', ca: 'o', en: 'or' };

export function forSpeech(lang: Lang, text: string): string {
  let t = text;
  // words in capitals for emphasis or as a word to build («NO», «NOT», «SOL»): said as words, not letter by letter
  t = t.replace(/\p{Lu}{2,}/gu, (w, at: number) => {
    const before = t[at - 1] ?? '', after = t[at + w.length] ?? '';
    if (/\p{L}/u.test(before) || /\p{L}/u.test(after)) return w; // part of a longer word (McDONALD)
    if (INITIALS.has(w) || ROMAN.test(w) || !/[AEIOUÁÉÍÓÚÀÈÒÏÜY]/.test(w)) return w;
    return w.toLocaleLowerCase();
  });
  // ordinals: «1.º de ESO» → «primero de ESO», «2n curs» → «segon curs»
  const ord = ORDINAL[lang];
  if (ord) t = t.replace(/(?<![\p{L}\p{N}])(\d)(\.[ºª]|[ºª]|r|n|t|è|a)(?![\p{L}\p{N}])/gu, (m, d: string, s: string) => ord[d + (s.length === 1 && /[ºª]/.test(s) ? '.' + s : s)] ?? m);
  // a sound between slashes (/ny/) is said as the sound
  t = t.replace(/(^|\s)\/(\p{L}{1,4})\/(?=$|[\s.,;:?!)])/gu, '$1$2');
  // alternatives with a slash: «un/una», «(a / ha)» → «un o una», «(a o ha)»
  t = t.replace(/(\p{L})\s*\/\s*(?=\p{L})/gu, `$1 ${OR[lang] ?? 'o'} `);
  // syllables joined by hyphens with spaces («pe - lo - ta»): a short pause between them, not one word
  t = t.replace(/(\p{L})\s+[-–]\s+(?=\p{L})/gu, '$1, ');
  return t;
}
