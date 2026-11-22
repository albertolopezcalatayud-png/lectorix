/**
 * "For the classroom": links printed as QR codes on paper. They always point to the web app, so any phone can
 * open them without installing anything, and they carry only what to open (never data about a child).
 *  - Listen:   #/escucha/<lang>/d/<id.id…> (dictation)  ·  /r/<reading id>  ·  /s/<letter.letter> (syllables)
 *  - Homework: #/deber/<code>  where code = <lang>.<kind>[.<param>]  (kinds below)
 * The stamp a child copies into the booklet is computed from the code: the same for everyone who finishes
 * that homework, so the teacher only has to compare it with her sheet.
 */
export const WEB_APP = 'https://albertolopezcalatayud-png.github.io/lectorix/';

export type Lang = 'es' | 'ca' | 'en';
export const listenUrl = (lang: Lang, kind: 'd' | 'r' | 's', ids: string[]) => `${WEB_APP}#/escucha/${lang}/${kind}/${ids.map(encodeURIComponent).join('.')}`;

export type DeberKind = 'syl' | 'mir-find' | 'mir-miss' | 'bld' | 'trc';
export interface Deber { lang: Lang; kind: DeberKind; param?: string }
export const deberCode = (d: Deber) => [d.lang, d.kind, d.param].filter(Boolean).join('.');
export function parseDeber(code: string): Deber | null {
  const [lang, kind, ...rest] = code.split('.');
  if (!['es', 'ca', 'en'].includes(lang)) return null;
  if (!['syl', 'mir-find', 'mir-miss', 'bld', 'trc'].includes(kind)) return null;
  if (kind === 'trc' && !rest.length) return null;
  return { lang: lang as Lang, kind: kind as DeberKind, param: rest.join('.') || undefined };
}
export const deberUrl = (d: Deber) => `${WEB_APP}#/deber/${encodeURIComponent(deberCode(d))}`;

/** Three characters without look-alikes (no O/0, I/1, S/5, B/8…) */
const ABC = 'ACDEFHJKMNPRTUVWXY34679';
export function stampOf(code: string): string {
  let h = 2166136261;
  for (const ch of `lectorix:${code}`) { h ^= ch.codePointAt(0)!; h = Math.imul(h, 16777619) >>> 0; }
  let s = '';
  for (let i = 0; i < 3; i++) { s += ABC[h % ABC.length]; h = Math.floor(h / ABC.length) + (i + 1) * 7919; }
  return s;
}
