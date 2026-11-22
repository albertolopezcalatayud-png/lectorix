import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { usePracticeLang } from '@/stores/useAppStore';
import { useI18n } from '@/i18n';
import { FAMILIES, makeRounds, ROUNDS, type Family, type Round } from '@/data/syllables';
import type { Lang } from '@/data/strokes';
import sounds from '@/services/sounds';
import tts from '@/services/tts';

/**
 * "Letters and syllables": each letter with its simple syllables (ma me mi mo mu) and a word with a picture,
 * and a listening game. Spanish and Valencian: hear a syllable, tap it. English: hear a word, tap its first letter.
 */

export default function Syllables() {
  const { t } = useI18n();
  const lang = usePracticeLang() as Lang;
  const navigate = useNavigate();
  const fams = FAMILIES[lang];
  const [tab, setTab] = useState<'explore' | 'game'>('explore');
  const [open, setOpen] = useState<Family | null>(null);
  useEffect(() => () => tts.stop(), []);
  useEffect(() => { setOpen(null); }, [lang]);

  const say = (text: string) => { tts.stop(); return tts.speak(text); };
  const playAll = async (f: Family) => { for (const s of f.syllables) { await say(s); await new Promise((r) => setTimeout(r, 250)); } };

  return (
    <div className="pb-28">
      <Header title={t('sy_title')} showBack />
      <div className="max-w-2xl mx-auto px-4 space-y-4">
        <div className="grid grid-cols-2 gap-1" role="tablist">
          {(['explore', 'game'] as const).map((id) => (
            <button key={id} role="tab" aria-selected={tab === id} onClick={() => { setTab(id); tts.stop(); }}
              className={`py-1.5 rounded-full text-sm font-bold ${tab === id ? 'bg-accent text-white' : 'bg-surface-alt text-fg'}`}>
              {t(id === 'explore' ? 'sy_tab_explore' : 'sy_tab_game')}
            </button>
          ))}
        </div>

        {tab === 'game' ? <Game key={lang} lang={lang} fams={fams} /> : open ? (
          <Card className="!p-4 space-y-4">
            <div className="flex items-center justify-between">
              <button onClick={() => setOpen(null)} className="text-sm font-bold text-accent">{t('tr_back_list')}</button>
              <Button size="sm" variant="secondary" onClick={() => navigate('/trazo', { state: { letter: open.letter } })}>{t('sy_trace')}</Button>
            </div>
            <p className="text-center font-heading font-extrabold text-7xl leading-none" aria-hidden>
              {open.letter.length > 1 ? open.letter : `${open.letter.toUpperCase()}${open.letter}`}
            </p>
            <button onClick={() => void say(open.word[0])} className="mx-auto flex items-center gap-2 rounded-2xl bg-surface-alt px-4 py-2 text-xl font-bold">
              <span className="text-4xl" aria-hidden>{open.word[1]}</span>
              <Highlight word={open.word[0]} part={open.letter} /> <span aria-hidden>🔊</span>
            </button>
            {open.syllables.length > 1 && (
              <>
                <div className="grid grid-cols-5 gap-2">
                  {open.syllables.map((s) => (
                    <button key={s} onClick={() => void say(s)} className="rounded-2xl border-2 border-border bg-bg-card py-3 font-heading font-extrabold text-2xl hover:border-accent">
                      <Highlight word={s} part={s.slice(0, s.length - 1)} />
                    </button>
                  ))}
                </div>
                <Button fullWidth variant="secondary" onClick={() => void playAll(open)}>{t('sy_play_all')}</Button>
              </>
            )}
          </Card>
        ) : (
          <>
            <p className="text-sm text-fg-muted">{t('sy_intro')}</p>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {fams.map((f) => (
                <button key={f.id} onClick={() => { setOpen(f); void say(f.syllables.length > 1 ? f.syllables.join(', ') : f.word[0]); }}
                  aria-label={`${f.letter}: ${f.word[0]}`}
                  className="rounded-2xl bg-bg-card border border-border py-2 flex flex-col items-center hover:border-accent">
                  <span className="font-heading font-extrabold text-3xl leading-none">{f.letter}</span>
                  <span className="text-lg" aria-hidden>{f.word[1]}</span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/** The letters of the family in colour */
function Highlight({ word, part }: { word: string; part: string }) {
  const i = part ? word.toLowerCase().indexOf(part.toLowerCase()) : -1;
  if (i < 0) return <span>{word}</span>;
  return <span>{word.slice(0, i)}<span className="text-accent underline decoration-2 underline-offset-4">{word.slice(i, i + part.length)}</span>{word.slice(i + part.length)}</span>;
}

function Game({ lang, fams }: { lang: Lang; fams: Family[] }) {
  const { t } = useI18n();
  const [rounds, setRounds] = useState<Round[] | null>(null);
  const [n, setN] = useState(0);
  const [right, setRight] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const r = rounds?.[n];
  const say = (text: string) => { tts.stop(); void tts.speak(text); };
  useEffect(() => { if (r && !picked) say(r.say); }, [r, picked]); // eslint-disable-line react-hooks/exhaustive-deps

  const start = () => { setRounds(makeRounds(lang, fams)); setN(0); setRight(0); setPicked(null); };
  const choose = (o: string) => {
    if (!r || picked) return;
    setPicked(o);
    if (o === r.answer) { setRight((x) => x + 1); sounds.correct(); } else sounds.incorrect();
    window.setTimeout(() => { setPicked(null); setN((x) => x + 1); }, o === r.answer ? 900 : 1800);
  };
  const total = rounds?.length ?? ROUNDS;
  const finished = rounds && n >= rounds.length;
  const msg = useMemo(() => (!r || !picked ? '' : picked === r.answer ? t('sy_right') : t('sy_wrong', { x: r.answer })), [r, picked, t]);

  if (!rounds || finished) {
    return (
      <Card className="!p-5 text-center space-y-3">
        <p>{t(lang === 'en' ? 'sy_game_intro_en' : 'sy_game_intro')}</p>
        {finished && <p className="font-heading font-extrabold text-2xl" aria-live="polite">{t('sy_score', { n: right, total })} {right >= total - 1 ? '🌟' : ''}</p>}
        <Button fullWidth onClick={start}>{finished ? t('sy_again') : t('sy_start')}</Button>
      </Card>
    );
  }
  return (
    <Card className="!p-5 space-y-4">
      <div className="flex items-center justify-between text-sm font-bold">
        <span>{t('sy_round', { n: n + 1, total })}</span>
        <span aria-label={t('sy_score', { n: right, total })}>⭐ {right}</span>
      </div>
      <Button fullWidth variant="secondary" onClick={() => r && say(r.say)}>{t('sy_replay')}</Button>
      <div className="grid grid-cols-2 gap-3" data-testid="sy-options">
        {r!.options.map((o) => {
          const state = picked ? (o === r!.answer ? 'bg-mint-pale border-mint' : o === picked ? 'bg-red-pale border-red' : 'opacity-50') : 'hover:border-accent';
          return (
            <button key={o} onClick={() => choose(o)} disabled={!!picked}
              className={`rounded-2xl border-2 border-border bg-bg-card py-6 font-heading font-extrabold text-4xl ${state}`}>{o}</button>
          );
        })}
      </div>
      <p className="text-center font-bold min-h-[1.5rem]" aria-live="polite">{msg}</p>
    </Card>
  );
}
