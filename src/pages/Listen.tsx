import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { MODULES } from '@/data/modules';
import { loadModule, loadReadings } from '@/data/content';
import { FAMILIES, type Family } from '@/data/syllables';
import { getTranslator } from '@/i18n';
import tts, { setSpeechLang } from '@/services/tts';
import type { Exercise } from '@/types';
import type { Reading } from '@/data/readings';
import type { Lang } from '@/services/classroom';

/**
 * Opened from the QR code of a paper booklet (#/escucha/<lang>/d/<ids> or /r/<id>): the dictation or the reading,
 * read aloud by the natural voices. Nothing else on screen, no welcome screens, no profile: a family scans and listens.
 */
export default function Listen() {
  const { lang: l = 'es', kind = 'd', ids = '' } = useParams();
  const lang: Lang = l === 'ca' || l === 'en' ? l : 'es';
  const t = getTranslator(lang);
  const [items, setItems] = useState<Exercise[] | null>(null);
  const [reading, setReading] = useState<Reading | null>(null);
  const [fams, setFams] = useState<Family[] | null>(null);
  const [missing, setMissing] = useState(false);
  const [playing, setPlaying] = useState<string | null>(null);

  useEffect(() => {
    setSpeechLang(lang);
    let alive = true;
    (async () => {
      const want = ids.split('.').filter(Boolean).map((x) => decodeURIComponent(x));
      if (kind === 's') {
        const f = want.map((id) => FAMILIES[lang].find((x) => x.id === id)).filter((x): x is Family => !!x);
        if (alive) { setFams(f); setMissing(f.length === 0); }
      } else if (kind === 'r') {
        const r = (await loadReadings(lang)).find((x) => x.id === want[0]) ?? null;
        if (alive) { setReading(r); setMissing(!r); }
      } else {
        const all = (await Promise.all(MODULES.map((m) => loadModule(lang, m.id)))).flat();
        const found = want.map((id) => all.find((e) => e.id === id)).filter((e): e is Exercise => !!e);
        if (alive) { setItems(found); setMissing(found.length === 0); }
      }
    })();
    return () => { alive = false; tts.stop(); };
  }, [lang, kind, ids]);

  const play = async (key: string, text: string, pace?: 'slow' | 'slower') => {
    tts.stop(); setPlaying(key);
    try { await tts.speak(text, pace ? { dictation: pace } : undefined); } finally { setPlaying((p) => (p === key ? null : p)); }
  };
  const playAll = async () => {
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      await play(`all-${i}`, items[i].word ?? items[i].answer ?? '', 'slow');
      await new Promise((r) => setTimeout(r, 4000)); // time to write
    }
  };

  return (
    <div className="min-h-screen bg-bg text-fg px-4 py-6" lang={lang === 'ca' ? 'ca-ES-valencia' : lang === 'en' ? 'en-GB' : 'es'}>
      <div className="max-w-md mx-auto space-y-4">
        <h1 className="font-heading font-black text-2xl text-center">🎧 {kind === 'r' ? t('ls_reading') : kind === 's' ? t('sy_title') : t('ls_dictation')}</h1>
        {missing && <Card className="!p-4 text-center">{t('ls_missing')}</Card>}
        {items && items.length > 0 && (
          <>
            <p className="text-sm text-center">{t('ls_dict_help')}</p>
            <div className="space-y-2">
              {items.map((e, i) => (
                <div key={e.id} className="flex gap-2">
                  <Button fullWidth onClick={() => void play(`d${i}`, e.word ?? e.answer ?? '', 'slow')} aria-label={t('ls_play_n', { n: i + 1 })}>
                    {playing === `d${i}` ? '🔊' : '▶'} {i + 1}
                  </Button>
                  <Button variant="secondary" onClick={() => void play(`s${i}`, e.word ?? e.answer ?? '', 'slower')} aria-label={t('ls_slower_n', { n: i + 1 })}>🐢</Button>
                </div>
              ))}
            </div>
            <Button variant="secondary" fullWidth onClick={() => void playAll()}>{t('ls_all')}</Button>
          </>
        )}
        {fams && fams.map((f) => (
          <Card key={f.id} className="!p-4 space-y-3">
            <div className="grid grid-cols-5 gap-2">
              {f.syllables.map((s) => (
                <button key={s} onClick={() => void play(`y${s}`, s)} className="rounded-2xl border-2 border-border bg-bg-card py-3 font-heading font-extrabold text-2xl">{s}</button>
              ))}
            </div>
            <Button variant="secondary" fullWidth onClick={async () => { for (const s of f.syllables) { await play(`y${s}`, s); await new Promise((r) => setTimeout(r, 250)); } }}>{t('sy_play_all')}</Button>
            <button onClick={() => void play(`w${f.id}`, f.word[0])} className="mx-auto flex items-center gap-2 rounded-2xl bg-surface-alt px-4 py-2 text-xl font-bold">
              <span className="text-3xl" aria-hidden>{f.word[1]}</span>{f.word[0]} <span aria-hidden>🔊</span>
            </button>
          </Card>
        ))}
        {reading && (
          <Card className="!p-4 space-y-3">
            <h2 className="font-heading font-extrabold text-lg">{reading.emoji} {reading.title}</h2>
            <Button fullWidth onClick={() => void play('r', reading.text.replace(/\n+/g, ' '))}>{playing === 'r' ? '🔊' : '▶'} {t('ls_play_reading')}</Button>
            <Button variant="secondary" fullWidth onClick={() => { tts.stop(); setPlaying(null); }}>⏹ {t('ls_stop')}</Button>
            <p className="text-xs text-fg-muted">{t('ls_reading_help')}</p>
          </Card>
        )}
        {!items && !reading && !fams && !missing && <p className="text-center" aria-live="polite">…</p>}
        <p className="text-[11px] text-fg-muted text-center pt-4">Lectorix</p>
      </div>
    </div>
  );
}
