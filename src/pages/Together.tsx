import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { usePracticeLang } from '@/stores/useAppStore';
import { loadModule } from '@/data/content';
import { useReadings, type Reading } from '@/data/readings';
import { useReviewStore, notebookWords, wordOf } from '@/services/review';
import type { Exercise } from '@/types';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SyllableText } from '@/components/reading/SyllableText';
import tts from '@/services/tts';
import { useI18n } from '@/i18n';

type Game = 'duet' | 'claps' | 'rhymes' | 'reverse';
const GAMES: { id: Game; icon: string }[] = [
  { id: 'duet', icon: '🎭' },
  { id: 'claps', icon: '👏' },
  { id: 'rhymes', icon: '🎵' },
  { id: 'reverse', icon: '🔄' },
];
const ROUNDS = 8;

const shuffle = <T,>(a: T[]) => [...a].sort(() => Math.random() - 0.5);

/** "Together" mode: short turn-based games for a child and an adult on one device */
export default function Together() {
  const { t } = useI18n();
  const lang = usePracticeLang();
  const readings = useReadings();
  const items = useReviewStore((s) => s.items);
  const [game, setGame] = useState<Game | null>(null);
  const [level, setLevel] = useState(1);
  const [fon, setFon] = useState<Exercise[] | null>(null);
  const [mem, setMem] = useState<Exercise[] | null>(null);

  useEffect(() => {
    let off = false;
    Promise.all([loadModule(lang, 'fonologia'), loadModule(lang, 'memoria_visual')]).then(([f, m]) => {
      if (!off) { setFon(f); setMem(m); }
    }).catch(() => {});
    return () => { off = true; };
  }, [lang]);

  return (
    <div className="min-h-screen pb-24">
      <Header title={t('tg_title')} showBack />
      <div className="px-4 py-5 max-w-lg mx-auto space-y-4">
        {!game ? (
          <>
            <p className="text-sm text-fg-muted">{t('tg_desc')}</p>
            <Card>
              <span className="text-xs text-fg-muted block mb-2">{t('flu_choose_level')}</span>
              <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5].map((l) => (
                  <button key={l} onClick={() => setLevel(l)}
                    className={`flex-1 py-2 rounded-xl font-bold text-sm ${level === l ? 'bg-accent text-white' : 'bg-bg border border-border'}`}>{l}</button>
                ))}
              </div>
            </Card>
            <div className="grid grid-cols-2 gap-2.5">
              {GAMES.map((g) => (
                <Card key={g.id} hover onClick={() => setGame(g.id)}>
                  <span className="text-3xl">{g.icon}</span>
                  <h3 className="font-heading font-extrabold text-sm mt-1">{t(`tg_${g.id}_title` as never)}</h3>
                  <p className="text-[11px] text-fg-muted leading-snug mt-0.5">{t(`tg_${g.id}_desc` as never)}</p>
                </Card>
              ))}
            </div>
            <Card className="text-xs text-fg-muted">💡 {t('tg_tip')}</Card>
          </>
        ) : game === 'duet' ? (
          <Duet readings={readings} level={level} onExit={() => setGame(null)} />
        ) : game === 'claps' ? (
          <Claps exercises={fon} level={level} onExit={() => setGame(null)} />
        ) : game === 'rhymes' ? (
          <Rhymes exercises={fon} level={level} onExit={() => setGame(null)} />
        ) : (
          <Reverse
            words={[
              ...notebookWords(items, lang).filter((w) => !w.mastered).map((w) => w.word!),
              ...(mem ?? []).filter((e) => e.level === level).map(wordOf).filter((w): w is string => !!w),
            ]}
            onExit={() => setGame(null)}
          />
        )}
      </div>
    </div>
  );
}

function Finish({ score, onExit, onAgain }: { score?: number; onExit: () => void; onAgain: () => void }) {
  const { t } = useI18n();
  return (
    <Card className="text-center space-y-3">
      <div className="text-5xl">🤝</div>
      <h3 className="font-heading font-extrabold">{t('tg_well_done')}</h3>
      {score !== undefined && <p className="text-sm">{t('tg_team_score', { n: score })}</p>}
      <Button fullWidth onClick={onAgain}>{t('tg_again')}</Button>
      <Button fullWidth variant="secondary" onClick={onExit}>{t('tg_other_game')}</Button>
    </Card>
  );
}

function Turn({ who }: { who: 'adult' | 'child' | 'both' }) {
  const { t } = useI18n();
  const cls = who === 'adult' ? 'bg-sky/20 text-sky' : who === 'child' ? 'bg-peach/20 text-peach' : 'bg-mint/20 text-mint';
  return <span className={`inline-block px-3 py-1 rounded-full text-xs font-extrabold ${cls}`}>{t(`tg_turn_${who}` as never)}</span>;
}

/** Duet reading: sentences alternate between the adult and the child */
function Duet({ readings, level, onExit }: { readings: Reading[] | null; level: number; onExit: () => void }) {
  const { t } = useI18n();
  const [seed, setSeed] = useState(0);
  const reading = useMemo(() => {
    const pool = (readings ?? []).filter((r) => r.level === level);
    return pool.length ? pool[Math.floor(Math.random() * pool.length)] : null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [readings, level, seed]);
  const sentences = useMemo(() => (reading ? reading.text.match(/[^.!?…]+[.!?…]+[»"]?|[^.!?…]+$/g)?.map((s) => s.trim()).filter(Boolean) ?? [] : []), [reading]);
  const [i, setI] = useState(0);
  if (!reading) return null;
  if (i >= sentences.length) return <Finish onExit={onExit} onAgain={() => { setSeed(seed + 1); setI(0); }} />;
  const who = i % 2 === 0 ? 'adult' : 'child';
  return (
    <div className="space-y-3">
      <h2 className="font-heading font-extrabold">{reading.emoji} {reading.title}</h2>
      <p className="text-xs text-fg-muted">{t('tg_duet_how')}</p>
      <Card>
        <div className="space-y-2 text-lg reading-text">
          {sentences.map((s, k) => (
            <p key={k} className={`rounded-lg px-2 py-1 transition-all ${k === i ? (k % 2 === 0 ? 'bg-sky/15 ring-2 ring-sky' : 'bg-peach/15 ring-2 ring-peach') : k < i ? 'opacity-40' : 'opacity-25'}`}>
              {k === i ? <SyllableText text={s} /> : s}
            </p>
          ))}
        </div>
      </Card>
      <div className="flex items-center justify-between">
        <Turn who={who} />
        <span className="text-xs text-fg-muted">{i + 1}/{sentences.length}</span>
      </div>
      <Button fullWidth onClick={() => setI(i + 1)}>{t('tg_next_sentence')}</Button>
    </div>
  );
}

/** Syllable claps: the child claps the syllables, the adult checks */
function Claps({ exercises, level, onExit }: { exercises: Exercise[] | null; level: number; onExit: () => void }) {
  const { t } = useI18n();
  const [seed, setSeed] = useState(0);
  const words = useMemo(() => {
    const seen = new Set<string>();
    const list = (exercises ?? []).filter((e) => e.level === level && e.word && e.syllables && e.syllables.length > 0 && !seen.has(e.word) && seen.add(e.word));
    return shuffle(list).slice(0, ROUNDS);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exercises, level, seed]);
  const [i, setI] = useState(0);
  const [shown, setShown] = useState(false);
  const [score, setScore] = useState(0);
  if (!exercises) return null;
  if (i >= words.length) return <Finish score={score} onExit={onExit} onAgain={() => { setSeed(seed + 1); setI(0); setScore(0); setShown(false); }} />;
  const w = words[i];
  return (
    <div className="space-y-3">
      <p className="text-xs text-fg-muted">{t('tg_claps_how')}</p>
      <Card className="text-center py-8 space-y-3">
        <Turn who="child" />
        <div className="text-4xl font-heading font-black break-words">{w.word}</div>
        <button onClick={() => tts.speak(w.word!)} className="text-sm font-bold text-accent">🔊 {t('ex_listen_word')}</button>
        {shown && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-2xl font-heading font-extrabold text-mint">
            {w.syllables!.join(' · ')} = {w.syllables!.length} 👏
          </motion.div>
        )}
      </Card>
      {!shown ? (
        <Button fullWidth onClick={() => setShown(true)}>{t('tg_check')}</Button>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          <Button variant="secondary" onClick={() => { setI(i + 1); setShown(false); }}>{t('tg_try_again_next')}</Button>
          <Button onClick={() => { setScore(score + 1); setI(i + 1); setShown(false); }}>✓ {t('tg_got_it')}</Button>
        </div>
      )}
      <p className="text-center text-xs text-fg-muted">{i + 1}/{words.length} · {t('tg_team_score', { n: score })}</p>
    </div>
  );
}

/** Rhyme ping-pong: take turns saying rhymes for 30 seconds */
function Rhymes({ exercises, level, onExit }: { exercises: Exercise[] | null; level: number; onExit: () => void }) {
  const { t } = useI18n();
  const [seed, setSeed] = useState(0);
  const words = useMemo(() => {
    const seen = new Set<string>();
    const list = (exercises ?? []).filter((e) => e.level <= Math.max(2, level) && e.word && /^[\p{L}]+$/u.test(e.word) && e.word.length <= 8 && !seen.has(e.word) && seen.add(e.word));
    return shuffle(list).slice(0, 5).map((e) => e.word!);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exercises, level, seed]);
  const [i, setI] = useState(0);
  const [left, setLeft] = useState(30);
  const [running, setRunning] = useState(false);
  const [count, setCount] = useState(0);
  const [total, setTotal] = useState(0);
  useEffect(() => {
    if (!running) return;
    if (left <= 0) { setRunning(false); return; }
    const id = setTimeout(() => setLeft(left - 1), 1000);
    return () => clearTimeout(id);
  }, [running, left]);
  if (!exercises) return null;
  if (i >= words.length) return <Finish score={total} onExit={onExit} onAgain={() => { setSeed(seed + 1); setI(0); setTotal(0); setLeft(30); setCount(0); }} />;
  return (
    <div className="space-y-3">
      <p className="text-xs text-fg-muted">{t('tg_rhymes_how')}</p>
      <Card className="text-center py-6 space-y-3">
        <Turn who="both" />
        <div className="text-4xl font-heading font-black">{words[i]}</div>
        <div className={`text-3xl font-heading font-black tabular-nums ${left <= 5 ? 'text-red' : 'text-accent'}`}>0:{String(left).padStart(2, '0')}</div>
        <div className="text-lg font-bold">{t('tg_rhymes_found', { n: count })}</div>
      </Card>
      {left > 0 ? (
        running ? (
          <Button fullWidth onClick={() => setCount(count + 1)}>+1 {t('tg_rhyme_plus')}</Button>
        ) : (
          <Button fullWidth onClick={() => setRunning(true)}>▶ {t('flu_start')}</Button>
        )
      ) : (
        <Button fullWidth onClick={() => { setTotal(total + count); setCount(0); setLeft(30); setI(i + 1); }}>{t('tg_next_word')}</Button>
      )}
      <p className="text-center text-xs text-fg-muted">{i + 1}/{words.length} · {t('tg_team_score', { n: total + count })}</p>
    </div>
  );
}

/** Reverse dictation: the child dictates, the adult writes on paper, the child checks */
function Reverse({ words, onExit }: { words: string[]; onExit: () => void }) {
  const { t } = useI18n();
  const [seed, setSeed] = useState(0);
  const list = useMemo(() => shuffle([...new Set(words)]).slice(0, 6),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [words.length, seed]);
  const [i, setI] = useState(0);
  const [step, setStep] = useState<'dictate' | 'check'>('dictate');
  if (list.length === 0) return <Card className="text-sm">{t('tg_reverse_empty')}</Card>;
  if (i >= list.length) return <Finish onExit={onExit} onAgain={() => { setSeed(seed + 1); setI(0); setStep('dictate'); }} />;
  return (
    <div className="space-y-3">
      <p className="text-xs text-fg-muted">{t('tg_reverse_how')}</p>
      <Card className="text-center py-8 space-y-3">
        {step === 'dictate' ? (
          <>
            <Turn who="child" />
            <p className="text-sm">{t('tg_reverse_dictate')}</p>
            <div className="text-4xl font-heading font-black break-words">{list[i]}</div>
          </>
        ) : (
          <>
            <Turn who="child" />
            <p className="text-sm">{t('tg_reverse_check')}</p>
            <div className="text-4xl font-heading font-black break-words"><SyllableText text={list[i]} /></div>
            <button onClick={() => tts.speak(list[i])} className="text-sm font-bold text-accent">🔊 {t('ex_listen_word')}</button>
          </>
        )}
      </Card>
      {step === 'dictate' ? (
        <Button fullWidth onClick={() => setStep('check')}>{t('tg_reverse_written')}</Button>
      ) : (
        <Button fullWidth onClick={() => { setStep('dictate'); setI(i + 1); }}>{t('tg_next_word')}</Button>
      )}
      <p className="text-center text-xs text-fg-muted">{i + 1}/{list.length}</p>
    </div>
  );
}
