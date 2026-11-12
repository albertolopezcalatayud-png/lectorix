import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { MODULES, MODULE_TEXT, LEVEL_COUNT, levelNameKey } from '@/data/modules';
import { loadModule, loadReadings, isDictationExercise } from '@/data/content';
import { useAppStore, usePracticeLang, resolvePracticeLang } from '@/stores/useAppStore';
import { recommendedLevel } from '@/services/review';
import { buildWorksheet, pickForSheet, type SheetLabels } from '@/services/worksheet';
import { printHtml } from '@/services/printDoc';
import { isNativeApp } from '@/native/app';
import { getTranslator, useI18n } from '@/i18n';
import type { ModuleId } from '@/types';

const shuffle = <T,>(a: T[]) => { const r = [...a]; for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; } return r; };

/** "Practice on paper": printable worksheets with exercises of the student's level, plus a page for the adult */
export default function Printables() {
  const { t } = useI18n();
  const lang = usePracticeLang();
  const [areas, setAreas] = useState<ModuleId[]>(MODULES.map((m) => m.id));
  const [perArea, setPerArea] = useState(4);
  const [withDict, setWithDict] = useState(true);
  const [withReading, setWithReading] = useState(true);
  const [bigText, setBigText] = useState(true);
  const [busy, setBusy] = useState(false);

  const make = async () => {
    setBusy(true);
    try {
      const st = useAppStore.getState();
      const max = LEVEL_COUNT[resolvePracticeLang(st)];
      const levelOf = (m: ModuleId) => recommendedLevel(st.progress, m, max, st.isLevelUnlocked, st.startLevel(m));
      const tl = getTranslator(lang); // the sheet is in the practice language
      const L: SheetLabels = {
        title: tl('ws_sheet_title'), name: tl('ws_name'), date: tl('ws_date'),
        level: (n) => `${tl('parent_level_label', { level: n })} · ${tl(levelNameKey(n))}`,
        areas: Object.fromEntries(MODULES.map((m) => [m.id, tl(MODULE_TEXT[m.id].name)])),
        circle: tl('ws_circle'), order: tl('ws_order'), fill: tl('ws_fill'), writeIt: tl('ws_write'),
        dictTitle: tl('ws_dict_title'), dictInstr: tl('ws_dict_instr'), readTitle: tl('ws_read_title'),
        answers: tl('ws_answers'), forAdult: tl('ws_for_adult'), dictForAdult: tl('ws_dict_adult'), footer: tl('ws_footer'),
      };
      const sheetAreas = [];
      let dictation: { level: number; items: never[] } | { level: number; items: Awaited<ReturnType<typeof loadModule>> } | null = null;
      for (const m of MODULES.filter((x) => areas.includes(x.id))) {
        const lvl = levelOf(m.id);
        const pool = (await loadModule(lang, m.id)).filter((e) => e.level === lvl);
        sheetAreas.push({ module: m.id, level: lvl, items: pickForSheet(pool, perArea) });
      }
      if (withDict) {
        const lvl = levelOf('escritura');
        const all = (await Promise.all(MODULES.map((m) => loadModule(lang, m.id)))).flat();
        const pool = all.filter((e) => isDictationExercise(e) && e.level === lvl);
        dictation = { level: lvl, items: shuffle(pool).slice(0, 5) };
      }
      let reading = null;
      if (withReading) {
        const lvl = levelOf('comprension_lectora');
        const rs = (await loadReadings(lang)).filter((r) => r.level === lvl);
        reading = rs.length ? shuffle(rs)[0] : null;
      }
      const html = buildWorksheet({ lang, L, areas: sheetAreas, dictation, reading, bigText });
      await printHtml(html, `Lectorix - ${L.title}`);
    } finally {
      setBusy(false);
    }
  };

  const toggle = (m: ModuleId) => setAreas(areas.includes(m) ? areas.filter((x) => x !== m) : [...areas, m]);
  const Check = ({ on, set, label }: { on: boolean; set: (v: boolean) => void; label: string }) => (
    <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={on} onChange={(e) => set(e.target.checked)} /> {label}</label>
  );

  return (
    <div className="min-h-screen pb-28">
      <Header title={t('ws_title')} showBack />
      <div className="px-4 py-4 max-w-lg mx-auto space-y-3">
        <p className="text-sm text-fg-muted">{t('ws_desc')}</p>
        <Card>
          <h3 className="font-heading font-extrabold text-sm mb-2">{t('ws_areas')}</h3>
          <div className="flex flex-wrap gap-1.5">
            {MODULES.map((m) => (
              <button key={m.id} onClick={() => toggle(m.id)} aria-pressed={areas.includes(m.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold border ${areas.includes(m.id) ? 'bg-accent text-white border-accent' : 'bg-bg border-border'}`}>
                {m.icon} {t(MODULE_TEXT[m.id].name)}
              </button>
            ))}
          </div>
          <h3 className="font-heading font-extrabold text-sm mt-4 mb-2">{t('ws_per_area')}</h3>
          <div className="flex gap-1.5">
            {[3, 4, 6].map((n) => (
              <button key={n} onClick={() => setPerArea(n)} aria-pressed={perArea === n}
                className={`flex-1 py-2 rounded-xl text-sm font-bold border ${perArea === n ? 'bg-accent text-white border-accent' : 'bg-bg border-border'}`}>{n}</button>
            ))}
          </div>
          <div className="mt-4 space-y-2">
            <Check on={withDict} set={setWithDict} label={t('ws_with_dict')} />
            <Check on={withReading} set={setWithReading} label={t('ws_with_reading')} />
            <Check on={bigText} set={setBigText} label={t('ws_big_text')} />
          </div>
        </Card>
        <Button fullWidth disabled={busy || (areas.length === 0 && !withDict && !withReading)} onClick={() => void make()}>
          🖨️ {isNativeApp ? t('print_pdf_native') : t('ws_make')}
        </Button>
        <p className="text-[11px] text-fg-muted leading-snug">{t('ws_note')}</p>
      </div>
    </div>
  );
}
