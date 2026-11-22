import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { usePracticeLang } from '@/stores/useAppStore';
import { useI18n } from '@/i18n';
import { FAMILIES, MIRROR, MIRROR_WORDS, BUILD_WORDS, buildTiles, makeRounds, ROUNDS, type Family, type Round } from '@/data/syllables';
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
  const [tab, setTab] = useState<'explore' | 'game' | 'mirror' | 'build'>('explore');
  const [open, setOpen] = useState<Family | null>(null);
  useEffect(() => () => tts.stop(), []);
  useEffect(() => { setOpen(null); }, [lang]);

  const say = (text: string) => { tts.stop(); return tts.speak(text); };
  const playAll = async (f: Family) => { for (const s of f.syllables) { await say(s); await new Promise((r) => setTimeout(r, 250)); } };

  return (
    <div className="pb-28">
      <Header title={t('sy_title')} showBack />
      <div className="max-w-2xl mx-auto px-4 space-y-4">
        <div className="grid grid-cols-4 gap-1" role="tablist">
          {(['explore', 'game', 'mirror', 'build'] as const).map((id) => (
            <button key={id} role="tab" aria-selected={tab === id} onClick={() => { setTab(id); tts.stop(); }}
              className={`py-1.5 px-1 rounded-full text-[13px] font-bold whitespace-nowrap ${tab === id ? 'bg-accent text-white' : 'bg-surface-alt text-fg'}`}>
              {id === 'mirror' ? 'b d p q' : t(id === 'explore' ? 'sy_tab_explore' : id === 'game' ? 'sy_tab_game' : 'bw_tab')}
            </button>
          ))}
        </div>

        {tab === 'build' ? <Build key={lang} lang={lang} /> : tab === 'mirror' ? <Mirror key={lang} lang={lang} /> : tab === 'game' ? <Game key={lang} lang={lang} fams={fams} /> : open ? (
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

const shuffleArr = <T,>(a: T[]) => { const r = [...a]; for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; } return r; };
type Mirror = (typeof MIRROR)[number];

/**
 * Mirror letters b d p q: find every b among the four (seeing), and fill the first letter of a word with a
 * picture (seeing and hearing). The tip uses the stroke order of letter tracing: b, the stick first; d, the tummy first.
 */
function Mirror({ lang }: { lang: Lang }) {
  const { t } = useI18n();
  const [mode, setMode] = useState<'find' | 'missing'>('find');
  const [mistakes, setMistakes] = useState(0);
  const [round, setRound] = useState(0);
  const [done, setDone] = useState(false);
  const restart = (m = mode) => { setMode(m); setMistakes(0); setRound(0); setDone(false); };
  return (
    <div className="space-y-3">
      <div className="flex justify-center">
        <div className="flex rounded-full bg-surface-alt p-0.5" role="radiogroup">
          {(['find', 'missing'] as const).map((m) => (
            <button key={m} role="radio" aria-checked={mode === m} onClick={() => restart(m)}
              className={`px-4 py-1 rounded-full text-sm font-bold ${mode === m ? 'bg-accent text-white' : 'text-fg'}`}>{t(m === 'find' ? 'mi_mode_find' : 'mi_mode_missing')}</button>
          ))}
        </div>
      </div>
      <p className="text-xs text-fg-muted text-center">{t('mi_tip')}</p>
      {done ? (
        <Card className="!p-5 text-center space-y-3">
          <p className="font-heading font-extrabold text-xl" aria-live="polite">{mistakes === 1 ? t('mi_result_one') : mistakes ? t('mi_result', { n: mistakes }) : t('mi_perfect')} {mistakes ? '' : '🌟'}</p>
          <Button fullWidth onClick={() => restart()}>{t('sy_again')}</Button>
        </Card>
      ) : mode === 'find' ? (
        <FindRound key={`f${round}`} round={round} onMistake={() => setMistakes((x) => x + 1)} onDone={() => (round >= 4 ? setDone(true) : setRound(round + 1))} />
      ) : (
        <MissingRound key={`m${round}`} lang={lang} round={round} onMistake={() => setMistakes((x) => x + 1)} onDone={() => (round >= 7 ? setDone(true) : setRound(round + 1))} />
      )}
    </div>
  );
}

function FindRound({ round, onMistake, onDone }: { round: number; onMistake: () => void; onDone: () => void }) {
  const { t } = useI18n();
  const [target] = useState<Mirror>(() => MIRROR[(round + Math.floor(Math.random() * 4)) % 4]);
  const [cells] = useState<Mirror[]>(() => {
    const n = 4 + Math.floor(Math.random() * 3);
    const others = MIRROR.filter((x) => x !== target);
    return shuffleArr([...Array(n).fill(target), ...Array.from({ length: 16 - n }, () => others[Math.floor(Math.random() * 3)])]);
  });
  const [found, setFound] = useState<Set<number>>(new Set());
  const [wrong, setWrong] = useState<number | null>(null);
  const left = cells.filter((c) => c === target).length - found.size;
  const tap = (i: number) => {
    if (found.has(i)) return;
    if (cells[i] !== target) { setWrong(i); onMistake(); sounds.incorrect(); window.setTimeout(() => setWrong(null), 600); return; }
    const next = new Set(found); next.add(i); setFound(next); sounds.click();
    if (next.size === cells.filter((c) => c === target).length) { sounds.correct(); window.setTimeout(onDone, 700); }
  };
  return (
    <Card className="!p-4 space-y-3">
      <div>
        <h2 className="font-heading font-extrabold text-xl">{t('mi_find_title', { x: target })}</h2>
        <p className="text-xs font-bold text-fg-muted">{round + 1} / 5 · {t('mi_left', { n: left })}</p>
      </div>
      <div className="grid grid-cols-4 gap-2" data-testid="mi-grid">
        {cells.map((c, i) => (
          <button key={i} onClick={() => tap(i)} aria-pressed={found.has(i)}
            data-letter={c}
            className={`aspect-square rounded-2xl border-2 font-heading font-extrabold text-4xl ${found.has(i) ? 'bg-mint-pale border-mint' : wrong === i ? 'bg-red-pale border-red' : 'bg-bg-card border-border'}`}>{c}</button>
        ))}
      </div>
    </Card>
  );
}

function MissingRound({ lang, round, onMistake, onDone }: { lang: Lang; round: number; onMistake: () => void; onDone: () => void }) {
  const { t } = useI18n();
  const [word] = useState(() => { const list = MIRROR_WORDS[lang]; return list[(round * 5 + Math.floor(Math.random() * list.length)) % list.length]; });
  const [picked, setPicked] = useState<string | null>(null);
  const first = word[0][0];
  useEffect(() => { tts.stop(); void tts.speak(word[0]); }, [word]);
  const choose = (o: string) => {
    if (picked === first) return;
    setPicked(o);
    if (o === first) { sounds.correct(); window.setTimeout(onDone, 1100); } else { sounds.incorrect(); onMistake(); }
  };
  return (
    <Card className="!p-4 space-y-4 text-center">
      <span className="text-sm font-bold block text-right">{round + 1} / 8</span>
      <p className="text-6xl" aria-hidden>{word[1]}</p>
      <button onClick={() => { tts.stop(); void tts.speak(word[0]); }} className="font-heading font-extrabold text-4xl tracking-wide" aria-label={`${t('mi_missing_intro')} 🔊`}>
        <span className={`inline-block min-w-[1.2em] border-b-4 ${picked === first ? 'border-mint text-accent' : 'border-accent'}`}>{picked === first ? first : '\u00a0'}</span>{word[0].slice(1)} <span aria-hidden className="text-2xl">🔊</span>
      </button>
      <p className="text-sm">{t('mi_missing_intro')}</p>
      <div className="grid grid-cols-4 gap-2" data-testid="mi-options">
        {MIRROR.map((o) => (
          <button key={o} onClick={() => choose(o)} disabled={picked === first}
            className={`aspect-square rounded-2xl border-2 font-heading font-extrabold text-4xl ${picked === o ? (o === first ? 'bg-mint-pale border-mint' : 'bg-red-pale border-red') : 'bg-bg-card border-border'}`}>{o}</button>
        ))}
      </div>
    </Card>
  );
}

const BUILD_ROUNDS = 8;
/** Eight words. English: four short ones (s-a-t) and four with digraphs (sh-i-p), in that order. */
function pickBuild(lang: Lang) {
  const all = BUILD_WORDS[lang];
  if (lang !== 'en') return shuffleArr(all).slice(0, BUILD_ROUNDS);
  const simple = all.filter(([p]) => p.every((x) => x.length === 1));
  const rest = all.filter(([p]) => p.some((x) => x.length > 1));
  return [...shuffleArr(simple).slice(0, 4), ...shuffleArr(rest).slice(0, 4)];
}

function Build({ lang }: { lang: Lang }) {
  const { t } = useI18n();
  const [words, setWords] = useState(() => pickBuild(lang));
  const [n, setN] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  if (n >= words.length) {
    return (
      <Card className="!p-5 text-center space-y-3">
        <p className="font-heading font-extrabold text-xl" aria-live="polite">{mistakes === 1 ? t('mi_result_one') : mistakes ? t('mi_result', { n: mistakes }) : t('mi_perfect')} {mistakes ? '' : '🌟'}</p>
        <Button fullWidth onClick={() => { setWords(pickBuild(lang)); setN(0); setMistakes(0); }}>{t('sy_again')}</Button>
      </Card>
    );
  }
  return <BuildRound key={n} lang={lang} n={n} word={words[n]} others={words.filter((_, i) => i !== n).map(([p]) => p)}
    onMistake={() => setMistakes((x) => x + 1)} onDone={() => setN(n + 1)} />;
}

function BuildRound({ lang, n, word, others, onMistake, onDone }: { lang: Lang; n: number; word: [string[], string]; others: string[][]; onMistake: () => void; onDone: () => void }) {
  const { t } = useI18n();
  const [pieces, emoji] = word;
  const text = pieces.join('');
  const [tiles] = useState(() => buildTiles(lang, pieces, others).map((p, i) => ({ p, i })));
  const [used, setUsed] = useState<number[]>([]);
  const [wrong, setWrong] = useState<number | null>(null);
  const done = used.length === pieces.length;
  useEffect(() => { tts.stop(); void tts.speak(text); }, [text]);
  const tap = (k: number) => {
    if (done || used.includes(k)) return;
    // the next piece; two tiles may be the same piece (pa-ta-ta): any of them is right
    if (tiles[k].p !== pieces[used.length]) { setWrong(k); onMistake(); sounds.incorrect(); window.setTimeout(() => setWrong(null), 600); return; }
    const next = [...used, k]; setUsed(next); sounds.click();
    if (next.length === pieces.length) { sounds.correct(); window.setTimeout(() => { tts.stop(); void tts.speak(text); }, 300); window.setTimeout(onDone, 1600); }
  };
  return (
    <Card className="!p-4 space-y-4 text-center">
      <div className="flex justify-between text-sm font-bold"><span>{t('bw_intro')}</span><span>{n + 1} / {BUILD_ROUNDS}</span></div>
      <button onClick={() => { tts.stop(); void tts.speak(text); }} className="text-6xl" aria-label={`${t('sy_replay')}`}>{emoji}</button>
      <div className="flex justify-center gap-1.5" data-testid="bw-slots">
        {pieces.map((p, i) => (
          <span key={i} className={`min-w-[3rem] h-14 px-2 rounded-xl border-2 flex items-center justify-center font-heading font-extrabold text-3xl ${i < used.length ? 'border-mint bg-mint-pale' : 'border-dashed border-border'}`}>
            {i < used.length ? p : ''}
          </span>
        ))}
      </div>
      <div className="flex flex-wrap justify-center gap-2" data-testid="bw-tiles">
        {tiles.map(({ p }, k) => (
          <button key={k} onClick={() => tap(k)} disabled={used.includes(k) || done}
            className={`min-w-[3.2rem] h-14 px-3 rounded-xl border-2 font-heading font-extrabold text-3xl ${used.includes(k) ? 'opacity-25' : wrong === k ? 'bg-red-pale border-red' : 'bg-bg-card border-border hover:border-accent'}`}>{p}</button>
        ))}
      </div>
      <Button size="sm" variant="secondary" onClick={() => { tts.stop(); void tts.speak(text); }}>{t('sy_replay')}</Button>
    </Card>
  );
}
