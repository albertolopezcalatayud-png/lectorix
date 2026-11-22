/**
 * Classroom booklet: several weeks of practice on paper, built from the app's own content for a school stage.
 * Each week: letter tracing (Primary 1-4), syllables to read (1.º-2.º, Spanish and Valencian), exercises of the
 * stage's level, a dictation and a reading. The dictation, the reading and the syllables carry a QR code that opens
 * the web app and reads them aloud with the natural voices. The last page is for the teacher: solutions.
 */
import { MODULES, MODULE_TEXT, STAGE_START, levelNameKey, type SchoolStage } from '@/data/modules';
import { loadModule, loadReadings, isDictationExercise } from '@/data/content';
import { traceSet } from '@/data/strokes';
import { cursiveWord } from '@/data/cursive';
import { FAMILIES } from '@/data/syllables';
import { getTranslator } from '@/i18n';
import { esc, itemHtml, pickForSheet, sheetCss, type SheetLabels } from './worksheet';
import { traceRow } from './traceRows';
import { qrSvg } from './qr';
import { listenUrl, type Lang } from './classroom';
import type { Exercise } from '@/types';

export interface BookletOptions { lang: Lang; stage: SchoolStage; weeks: number; hand: 'print' | 'cursive' }

const shuffle = <T,>(a: T[]) => { const r = [...a]; for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; } return r; };

export async function buildBooklet(o: BookletOptions): Promise<string> {
  const tl = getTranslator(o.lang);
  const level = STAGE_START[o.lang][o.stage];
  const young = o.stage === 'p12' || o.stage === 'p34';
  const L: SheetLabels = {
    title: tl('bk_title'), name: tl('ws_name'), date: tl('ws_date'),
    level: (n) => `${tl('parent_level_label', { level: n })} · ${tl(levelNameKey(n))}`,
    areas: Object.fromEntries(MODULES.map((m) => [m.id, tl(MODULE_TEXT[m.id].name)])),
    circle: tl('ws_circle'), order: tl('ws_order'), fill: tl('ws_fill'), writeIt: tl('ws_write'),
    dictTitle: tl('ws_dict_title'), dictInstr: tl('bk_dict_instr'), readTitle: tl('ws_read_title'),
    answers: tl('ws_answers'), forAdult: tl('ws_for_adult'), dictForAdult: tl('ws_dict_adult'), footer: tl('ws_footer'),
  };

  // Content of the stage's level, shared out between the weeks without repeating
  const pools = await Promise.all(MODULES.map(async (m) => ({ m: m.id, items: shuffle((await loadModule(o.lang, m.id)).filter((e) => e.level === level)) })));
  const allDict = shuffle(pools.flatMap((p) => p.items.filter((e) => isDictationExercise(e))));
  const readings = shuffle((await loadReadings(o.lang)).filter((r) => r.level === level));
  const used = new Set<string>();
  const take = (pool: Exercise[], n: number) => { const r = pickForSheet(pool.filter((e) => !used.has(e.id)), n); r.forEach((e) => used.add(e.id)); return r; };
  const lower = traceSet('lower', o.lang);
  const patterns = traceSet('patterns', o.lang);
  const fams = FAMILIES[o.lang].filter((f) => f.syllables.length > 1);

  let n = 0;
  const weeks: string[] = [];
  const solutions: string[] = [];
  for (let w = 0; w < o.weeks; w++) {
    const answers: string[] = [];
    let html = `<div class="week"><header><h1>📒 ${esc(tl('bk_week', { n: w + 1 }))}</h1><div class="fields">${esc(L.name)}: ______________________<br>${esc(tl('bk_done_sign'))}: ____________</div></header>`;

    if (young) {
      const per = o.stage === 'p12' ? 3 : 4;
      const letters = lower.slice(w * per, w * per + per);
      const glyphs = [
        ...(o.stage === 'p12' ? [patterns[w % patterns.length]] : []),
        ...letters.map((g) => (o.hand === 'cursive' ? cursiveWord(g.char) ?? g : g)),
      ];
      if (glyphs.length) html += `<section class="trace"><h2>✏️ ${esc(tl('tr_sheet_title'))}</h2><p class="instr">${esc(tl('tr_sheet_hint'))}</p>${glyphs.map((g) => `<div class="g">${traceRow(g, true)}${traceRow(g, false)}</div>`).join('')}</section>`;
    }

    if (o.stage === 'p12' && o.lang !== 'en') {
      const two = fams.slice(w * 2, w * 2 + 2);
      if (two.length) {
        const qr = qrSvg(listenUrl(o.lang, 's', two.map((f) => f.id)), 24);
        html += `<section class="syl"><h2>🔤 ${esc(tl('sy_title'))}</h2><div class="withqr"><div>${two.map((f) => `<div class="sylrow">${f.syllables.map((s) => `<span class="sy">${esc(s)}</span>`).join('')}<span class="sw">${f.word[1]} ${esc(f.word[0])}</span></div>`).join('')}<p class="instr">${esc(tl('bk_syl_instr'))}</p></div><figure>${qr}<figcaption>${esc(tl('bk_scan'))}</figcaption></figure></div></section>`;
      }
    }

    const sections = pools.map((p) => {
      const items = take(p.items.filter((e) => !isDictationExercise(e)), young ? 2 : 3);
      if (!items.length) return '';
      return `<section><h2>${esc(L.areas[p.m])}</h2>${items.map((e) => { const r = itemHtml(e, ++n, L); answers.push(r.a); return r.q; }).join('')}</section>`;
    }).join('');
    html += sections;

    const dict = allDict.slice(w * 5, w * 5 + 5);
    if (dict.length) {
      const qr = qrSvg(listenUrl(o.lang, 'd', dict.map((e) => e.id)), 26);
      html += `<section class="break-avoid"><h2>🎧 ${esc(L.dictTitle)}</h2><div class="withqr"><div><p class="instr">${esc(L.dictInstr)}</p>${dict.map((_, i) => `<div class="dline"><b>${i + 1}.</b><div class="line"></div></div>`).join('')}</div><figure>${qr}<figcaption>${esc(tl('bk_scan'))}</figcaption></figure></div></section>`;
      solutions.push(`<h3>${esc(tl('bk_week', { n: w + 1 }))} · ${esc(L.dictForAdult)}</h3><ol>${dict.map((e) => `<li>${esc(e.word ?? e.answer ?? '')}</li>`).join('')}</ol>`);
    }

    const r = readings[w];
    if (r) {
      const qr = qrSvg(listenUrl(o.lang, 'r', [r.id]), 24);
      const qs = r.questions.map((q) => { n++; answers.push(`${n}. ${'abcd'[q.correct]}) ${esc(q.options[q.correct])}`); return `<div class="item"><div class="q"><b>${n}.</b> ${esc(q.prompt)}</div><div class="opts">${q.options.map((op, i) => `<span class="opt"><span class="ring"></span>${'abcd'[i]}) ${esc(op)}</span>`).join('')}</div></div>`; }).join('');
      html += `<section class="break-avoid"><h2>📖 ${esc(L.readTitle)}: ${esc(r.title)}</h2><div class="withqr"><div class="reading">${r.text.split('\n\n').map((p) => `<p>${esc(p)}</p>`).join('')}</div><figure>${qr}<figcaption>${esc(tl('bk_scan'))}</figcaption></figure></div>${qs}</section>`;
    }

    html += `</div>`;
    weeks.push(html);
    if (answers.length) solutions.push(`<h3>${esc(tl('bk_week', { n: w + 1 }))} · ${esc(L.answers)}</h3><div class="ans">${answers.map((a) => `<div>${a}</div>`).join('')}</div>`);
  }

  const stageName = tl(`plc_stage_${o.stage}` as Parameters<typeof tl>[0]);
  const cover = `<div class="cover"><p class="big">📒</p><h1>${esc(tl('bk_title'))}</h1><p class="sub">${esc(stageName)} · ${esc(tl('bk_weeks_n', { n: o.weeks }))}</p>
    <div class="howto"><h2>${esc(tl('bk_howto_title'))}</h2><ol><li>${esc(tl('bk_howto_1'))}</li><li>${esc(tl('bk_howto_2'))}</li><li>${esc(tl('bk_howto_3'))}</li></ol></div>
    <p class="name">${esc(L.name)}: ________________________________</p></div>`;
  const size = young ? 16 : 14;
  return `<!doctype html><html lang="${o.lang === 'ca' ? 'ca-ES-valencia' : o.lang === 'en' ? 'en-GB' : 'es'}"><head><meta charset="utf-8"><title>${esc(tl('bk_title'))}</title>
<style>${sheetCss(size)}
  .cover { text-align: center; padding-top: 30mm; break-after: page; }
  .cover .big { font-size: 60pt; margin: 0; } .cover h1 { font-size: 26pt; color: #34437a; margin: 4mm 0; }
  .cover .sub { font-size: 13pt; color: #555; } .cover .name { margin-top: 30mm; font-size: 13pt; }
  .howto { text-align: left; max-width: 140mm; margin: 14mm auto 0; background: #f3f5fd; border-radius: 6mm; padding: 4mm 8mm; font-size: 11.5pt; }
  .howto h2 { border: 0; padding: 0; margin: 2mm 0; }
  .week { break-before: page; } .week:first-of-type { break-before: auto; }
  .withqr { display: flex; gap: 6mm; align-items: flex-start; } .withqr > div { flex: 1; }
  figure { margin: 0; text-align: center; width: 30mm; } figcaption { font-size: 8pt; color: #555; line-height: 1.2; }
  .sylrow { display: flex; flex-wrap: wrap; gap: 3mm; align-items: center; margin: 0 0 3mm; }
  .sy { font-size: 1.5em; font-weight: bold; border: 1.5px solid #8fa0d8; border-radius: 3mm; padding: 0 3mm; }
  .sw { margin-left: 4mm; color: #444; }
  .g { break-inside: avoid; margin-bottom: 2mm; }
  .solutions { break-before: page; font-size: .85em; } .solutions h2 { border-color: #fdba74; color: #c2410c; }
  .solutions .ans { columns: 2; column-gap: 24px; } .solutions .ans div { break-inside: avoid; }
</style></head><body>
${cover}${weeks.join('')}
<div class="solutions"><h2>🧑‍🏫 ${esc(tl('bk_solutions'))}</h2>${solutions.join('')}</div>
<footer>${esc(L.footer)}</footer>
</body></html>`;
}
