import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { getTranslator } from '@/i18n';
import { FAMILIES } from '@/data/syllables';
import { traceSet, type Glyph } from '@/data/strokes';
import { parseDeber, deberCode, stampOf, type Deber as DeberT } from '@/services/classroom';
import { setSpeechLang } from '@/services/tts';
import sounds from '@/services/sounds';
import { Game, Mirror, Build } from '@/pages/Syllables';
import { Practice } from '@/pages/Trace';

/** The glyph of a tracing homework: a lowercase letter, a capital, a number or a pattern, by its id (l-m, u-M, d-3, g-waves) */
export function deberGlyph(lang: DeberT['lang'], id: string): Glyph | null {
  for (const set of ['lower', 'upper', 'digits', 'patterns'] as const) {
    const g = traceSet(set, lang).find((x) => x.id === id);
    if (g) return g;
  }
  return null;
}

/**
 * Homework from a printed strip (#/deber/<code>): one activity chosen by the teacher. When it is done, a stamp
 * appears for the child to copy into the booklet; it is the same for everyone, so the teacher only compares it.
 */
export default function Deber() {
  const { code = '' } = useParams();
  const d = useMemo(() => parseDeber(decodeURIComponent(code)), [code]);
  const lang = d?.lang ?? 'es';
  const t = getTranslator(lang);
  const [done, setDone] = useState<string | null>(null);
  const [round, setRound] = useState(0);
  useEffect(() => { setSpeechLang(lang); }, [lang]);
  const glyph = d?.kind === 'trc' && d.param ? deberGlyph(lang, d.param) : null;
  const finish = (result: string) => { setDone(result); sounds.star(); };

  if (!d || (d.kind === 'trc' && !glyph)) {
    return <Shell lang={lang} title={t('db_title')}><Card className="!p-4 text-center">{t('db_bad')}</Card></Shell>;
  }
  const name = deberName(d, t, glyph);
  return (
    <Shell lang={lang} title={t('db_title')}>
      <p className="text-center font-heading font-extrabold text-lg">{name}</p>
      {done !== null ? (
        <Card className="!p-5 text-center space-y-3" aria-live="polite">
          <p className="text-lg font-bold">{t('db_done')}</p>
          {done && <p className="text-sm">{done}</p>}
          <p className="text-sm">{t('db_copy_stamp')}</p>
          <p className="font-heading font-black text-5xl tracking-widest border-4 border-dashed border-accent rounded-3xl py-4" data-testid="stamp">✓ {stampOf(deberCode(d))}</p>
          <Button variant="secondary" fullWidth onClick={() => { setDone(null); setRound((r) => r + 1); }}>{t('db_again')}</Button>
        </Card>
      ) : d.kind === 'syl' ? (
        <Game key={round} lang={lang} fams={FAMILIES[lang]} onFinish={(r, n) => finish(t('db_score', { n: r, total: n }))} />
      ) : d.kind === 'bld' ? (
        <Build key={round} lang={lang} onFinish={(m) => finish(t('db_mistakes', { n: m }))} />
      ) : d.kind === 'mir-find' || d.kind === 'mir-miss' ? (
        <Mirror key={round} lang={lang} only={d.kind === 'mir-find' ? 'find' : 'missing'} onFinish={(m) => finish(t('db_mistakes', { n: m }))} />
      ) : (
        <Practice key={round} glyph={glyph!} lang={lang} label={glyph!.char || name} stars={0} isWord={false}
          onStars={(n) => { if (n >= 3) window.setTimeout(() => finish(''), 1200); }} />
      )}
    </Shell>
  );
}

export function deberName(d: DeberT, t: ReturnType<typeof getTranslator>, glyph?: Glyph | null): string {
  switch (d.kind) {
    case 'syl': return t(d.lang === 'en' ? 'db_k_syl_en' : 'db_k_syl');
    case 'mir-find': return t('db_k_mir_find');
    case 'mir-miss': return t('db_k_mir_miss');
    case 'bld': return t('db_k_bld');
    default: return t('db_k_trc', { x: glyph?.char || (glyph ? t(`tr_p_${glyph.id.slice(2)}` as Parameters<typeof t>[0]) : '') });
  }
}

function Shell({ lang, title, children }: { lang: string; title: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-bg text-fg px-4 py-6" lang={lang === 'ca' ? 'ca-ES-valencia' : lang === 'en' ? 'en-GB' : 'es'}>
      <div className="max-w-md mx-auto space-y-4">
        <h1 className="font-heading font-black text-2xl text-center">🏠 {title}</h1>
        {children}
        <p className="text-[11px] text-fg-muted text-center pt-4">Lectorix</p>
      </div>
    </div>
  );
}
