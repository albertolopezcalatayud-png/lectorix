/**
 * Paper worksheets: exercises of the student's level, ready to print or save as PDF.
 * Only exercises that work on paper are used (no listening ones, nothing that shows the answer).
 * The last page is for the adult: the dictation to read aloud and the answers.
 */
import type { Exercise } from '@/types';
import type { ModuleId } from '@/types';
import type { Reading } from '@/data/readings';

export interface SheetLabels {
  title: string; name: string; date: string; level: (n: number) => string;
  areas: Record<string, string>;
  circle: string; order: string; fill: string; writeIt: string;
  dictTitle: string; dictInstr: string;
  readTitle: string;
  answers: string; forAdult: string; dictForAdult: string; footer: string;
}

const LISTEN = /^(escucha|escolta|listen|¿qu[ée] (oyes|sonido)|qu[eè] (sents|sona)|oye|what (do you hear|sound))/i;

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const shuffle = <T,>(a: T[]) => { const r = [...a]; for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; } return r; };

/** Can this exercise be done on paper without giving away the answer? */
export function paperFriendly(e: Exercise): boolean {
  if (LISTEN.test(e.prompt.trim())) return false;
  if (e.dictation) return false; // dictations go in their own section
  if (e.type === 'multiple_choice') {
    if (!e.options || e.options.length < 2) return false;
    // the shown word is the answer (spelling items that are heard in the app)
    if (e.word && e.options.some((o) => o.toLocaleLowerCase() === e.word!.toLocaleLowerCase())) return false;
    return true;
  }
  if (e.type === 'drag_order') return !!e.pieces && e.pieces.length >= 3 && e.pieces.length <= 12;
  if (e.type === 'drag_fill') return !!e.sentence && !!e.blanks?.length;
  if (e.type === 'write') return !!e.answer && (!e.word || e.word.toLocaleLowerCase() !== e.answer.toLocaleLowerCase());
  return false;
}

export function pickForSheet(pool: Exercise[], count: number): Exercise[] {
  const ok = shuffle(pool.filter(paperFriendly));
  // a mix of types: choice first, then the rest
  const byType = (t: string) => ok.filter((e) => e.type === t);
  const order = [...byType('multiple_choice').slice(0, Math.ceil(count * 0.6)), ...byType('drag_order').slice(0, 2), ...byType('drag_fill').slice(0, 1), ...byType('write').slice(0, 2)];
  const rest = ok.filter((e) => !order.includes(e));
  return [...order, ...rest].slice(0, count);
}

function itemHtml(e: Exercise, n: number, L: SheetLabels): { q: string; a: string } {
  const letters = 'abcdefgh';
  if (e.type === 'multiple_choice') {
    const passage = e.passage ? `<div class="passage">${esc(e.passage)}</div>` : '';
    const word = e.word ? `<div class="word">${esc(e.word)}</div>` : '';
    const opts = e.options.map((o, i) => `<span class="opt"><span class="ring"></span>${letters[i]}) ${esc(o)}</span>`).join('');
    return { q: `<div class="item"><div class="q"><b>${n}.</b> ${esc(e.prompt)}</div>${passage}${word}<div class="opts">${opts}</div></div>`,
      a: `${n}. ${letters[e.correct]}) ${esc(e.options[e.correct])}` };
  }
  if (e.type === 'drag_order') {
    const pieces = shuffle(e.pieces!);
    return { q: `<div class="item"><div class="q"><b>${n}.</b> ${esc(e.prompt)}</div><div class="pieces">${pieces.map((p) => `<span class="piece">${esc(p)}</span>`).join('')}</div><div class="line"></div></div>`,
      // syllables or letters make one word; words make a sentence
      a: `${n}. ${esc((e.correctOrder ?? e.pieces!).join(/s[íi]l[·.]?[l]?ab|syllab|lletr|letra|letter/i.test(e.prompt) && !/alfab|alphab/i.test(e.prompt) ? '' : ' '))}` };
  }
  if (e.type === 'drag_fill') {
    const sentence = esc(e.sentence!).replace(/_{2,}/g, '<span class="gap"></span>');
    const bank = shuffle([...e.blanks!, ...(e.distractors ?? [])]);
    return { q: `<div class="item"><div class="q"><b>${n}.</b> ${esc(L.fill)}</div><div class="sentence">${sentence}</div><div class="pieces">${bank.map((p) => `<span class="piece">${esc(p)}</span>`).join('')}</div></div>`,
      a: `${n}. ${esc(e.blanks!.join(', '))}` };
  }
  // write
  const hint = e.hint ? `<div class="hint">💡 ${esc(e.hint)}</div>` : '';
  return { q: `<div class="item"><div class="q"><b>${n}.</b> ${esc(e.prompt)}</div>${hint}<div class="line"></div></div>`,
    a: `${n}. ${esc(e.answer!)}` };
}

export function buildWorksheet(args: {
  lang: string; L: SheetLabels;
  areas: { module: ModuleId; level: number; items: Exercise[] }[];
  dictation: { level: number; items: Exercise[] } | null;
  reading: Reading | null;
  bigText: boolean;
}): string {
  const { L } = args;
  let n = 0;
  const answers: string[] = [];
  const sections = args.areas.filter((a) => a.items.length).map((a) => {
    const items = a.items.map((e) => { const r = itemHtml(e, ++n, L); answers.push(r.a); return r.q; }).join('');
    return `<section><h2>${esc(L.areas[a.module])} <span class="lvl">${esc(L.level(a.level))}</span></h2>${items}</section>`;
  }).join('');

  let reading = '';
  if (args.reading) {
    const r = args.reading;
    const qs = r.questions.map((q) => {
      n++;
      answers.push(`${n}. ${'abcd'[q.correct]}) ${esc(q.options[q.correct])}`);
      return `<div class="item"><div class="q"><b>${n}.</b> ${esc(q.prompt)}</div><div class="opts">${q.options.map((o, i) => `<span class="opt"><span class="ring"></span>${'abcd'[i]}) ${esc(o)}</span>`).join('')}</div></div>`;
    }).join('');
    reading = `<section class="break-avoid"><h2>${esc(L.readTitle)}: ${esc(r.title)} <span class="lvl">${esc(L.level(r.level))}</span></h2><div class="reading">${r.text.split('\n\n').map((p) => `<p>${esc(p)}</p>`).join('')}</div>${qs}</section>`;
  }

  let dict = '';
  let dictAdult = '';
  if (args.dictation && args.dictation.items.length) {
    dict = `<section><h2>${esc(L.dictTitle)} <span class="lvl">${esc(L.level(args.dictation.level))}</span></h2><p class="instr">${esc(L.dictInstr)}</p>${args.dictation.items.map((_, i) => `<div class="dline"><b>${i + 1}.</b><div class="line"></div></div>`).join('')}</section>`;
    dictAdult = `<h3>${esc(L.dictForAdult)}</h3><ol>${args.dictation.items.map((e) => `<li>${esc(e.word ?? e.answer ?? '')}</li>`).join('')}</ol>`;
  }

  const size = args.bigText ? 17 : 14.5;
  return `<!doctype html><html lang="${args.lang === 'ca' ? 'ca' : args.lang}"><head><meta charset="utf-8"><title>${esc(L.title)}</title>
<style>
  @page { size: A4; margin: 16mm 14mm; }
  body { font-family: Verdana, Tahoma, Arial, sans-serif; font-size: ${size}pt; line-height: 1.65; letter-spacing: .02em; color: #222; margin: 0; }
  header { display: flex; justify-content: space-between; gap: 12px; border-bottom: 2px solid #34437a; padding-bottom: 6px; margin-bottom: 12px; }
  header h1 { font-size: 1.25em; margin: 0; color: #34437a; }
  .fields { font-size: .8em; color: #444; text-align: right; }
  h2 { font-size: 1.05em; margin: 18px 0 8px; color: #34437a; border-left: 6px solid #f2a28b; padding-left: 8px; }
  .lvl { font-size: .75em; color: #777; font-weight: normal; }
  .item { margin: 0 0 14px; break-inside: avoid; }
  .q { margin-bottom: 4px; }
  .opts { display: flex; flex-wrap: wrap; gap: 6px 22px; padding-left: 18px; }
  .opt { display: inline-flex; align-items: center; gap: 6px; }
  .ring { display: inline-block; width: .9em; height: .9em; border: 1.5px solid #555; border-radius: 50%; }
  .word { font-size: 1.3em; font-weight: bold; padding-left: 18px; margin: 2px 0 4px; }
  .passage, .sentence { background: #f5f3ff; border-radius: 10px; padding: 6px 10px; margin: 4px 0 6px 18px; }
  .pieces { display: flex; flex-wrap: wrap; gap: 6px; padding-left: 18px; margin: 4px 0; }
  .piece { border: 1.5px solid #8fa0d8; border-radius: 8px; padding: 1px 8px; }
  .gap { display: inline-block; min-width: 4.5em; border-bottom: 1.5px solid #333; }
  .line { border-bottom: 1.5px solid #999; height: 1.9em; margin: 4px 0 0 18px; }
  .hint { font-size: .85em; color: #555; padding-left: 18px; }
  .instr { font-size: .9em; color: #444; }
  .dline { display: flex; align-items: flex-end; gap: 6px; } .dline .line { flex: 1; margin-left: 0; }
  .reading p { margin: 0 0 8px; }
  .adult { break-before: page; font-size: .85em; }
  .adult h2 { border-color: #fdba74; color: #c2410c; }
  .adult ol { margin: 4px 0 12px; } .adult .ans { columns: 2; column-gap: 24px; }
  .adult .ans div { break-inside: avoid; }
  footer { margin-top: 18px; font-size: .7em; color: #888; text-align: center; }
  .break-avoid { break-inside: auto; }
</style></head><body>
<header><h1>📚 ${esc(L.title)}</h1><div class="fields">${esc(L.name)}: ______________________<br>${esc(L.date)}: ____________</div></header>
${sections}${reading}${dict}
<div class="adult"><h2>👨‍👩‍👧 ${esc(L.forAdult)}</h2>${dictAdult}<h3>${esc(L.answers)}</h3><div class="ans">${answers.map((a) => `<div>${a}</div>`).join('')}</div></div>
<footer>${esc(L.footer)}</footer>
</body></html>`;
}
