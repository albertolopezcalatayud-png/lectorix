import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { AnswerResult, Exercise } from '@/types';
import { usePracticeLang } from '@/stores/useAppStore';
import { verbCards, splitTasks, COMPOUND, EXTRA_STEPS, stepEmoji, type VerbLang, type VerbCard, type StepId } from '@/data/examVerbs';
import { buildSessionResult } from '@/services/gamification';
import { recordSession } from '@/services/session';
import tts from '@/services/tts';
import { ExerciseCard } from '@/components/exercise/ExerciseCard';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { getTranslator, useI18n } from '@/i18n';

type Tab = 'learn' | 'split' | 'practice';
const VOICE: Record<VerbLang, string> = { es: 'es-ES', ca: 'ca-ES', en: 'en-GB' };
const shuffle = <T,>(a: T[]) => { const r = [...a]; for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; } return r; };

/** Ten questions: what does this verb ask for, which answer does it, how many tasks are there */
function buildPractice(cards: VerbCard[], lang: VerbLang, tt: ReturnType<typeof getTranslator>): Exercise[] {
  const pick = shuffle(cards);
  const out: Exercise[] = [];
  const base = { module: 'comprension_lectora' as const, level: 1, type: 'multiple_choice' as const };
  pick.slice(0, 4).forEach((c) => {
    const others = shuffle(cards.filter((o) => o.id !== c.id)).slice(0, 3).map((o) => o.meaning);
    const options = shuffle([c.meaning, ...others]);
    out.push({ ...base, id: `ev_${lang}_${c.id}_what`, prompt: tt('ev_q_what'), passage: c.q, options, correct: options.indexOf(c.meaning), explanation: `${c.word}: ${c.how}` });
  });
  pick.slice(4, 8).forEach((c) => {
    const options = shuffle([c.good, ...c.bad]);
    out.push({ ...base, id: `ev_${lang}_${c.id}_answer`, prompt: tt('ev_q_answer'), passage: c.q, options, correct: options.indexOf(c.good), explanation: `${c.word}: ${c.meaning}` });
  });
  shuffle(COMPOUND[lang]).slice(0, 2).forEach((c, i) => {
    const tasks = splitTasks(c.q, lang);
    const options = ['1', '2', '3', '4'];
    out.push({ ...base, id: `ev_${lang}_count_${i}`, prompt: tt('ev_q_count'), passage: c.q, options, correct: c.n - 1,
      explanation: tasks.map((t, k) => `${k + 1}) ${t.text}`).join('  ') });
  });
  return out;
}

/** "Understand exam questions": the verb tells you what to do */
export default function ExamWords() {
  const { t } = useI18n();
  const location = useLocation();
  const practice = usePracticeLang();
  const pl: string = location.state?.lang ?? practice;
  const lang: VerbLang = pl === 'ca' || pl === 'en' ? pl : 'es';
  const tt = useMemo(() => getTranslator(lang), [lang]);
  const cards = useMemo(() => verbCards(lang), [lang]);
  const incoming: string = location.state?.text ?? '';
  const [tab, setTab] = useState<Tab>(incoming ? 'split' : 'learn');
  const [open, setOpen] = useState<string | null>(null);
  const [text, setText] = useState(incoming.slice(0, 2000));
  const [done, setDone] = useState<Set<number>>(new Set());

  // practice
  const [round, setRound] = useState(0);
  const quiz = useMemo(() => buildPractice(cards, lang, tt), [cards, lang, tt, round]);
  const [qi, setQi] = useState(0);
  const [answers, setAnswers] = useState<AnswerResult[]>([]);
  const [finished, setFinished] = useState(false);
  const [xp, setXp] = useState(0);
  const startRef = useRef(Date.now());

  useEffect(() => () => tts.stop(), []);
  const say = (s: string) => { tts.stop(); void tts.speakIn(s, VOICE[lang], 0.9); };

  const tasks = useMemo(() => splitTasks(text, lang), [text, lang]);
  useEffect(() => setDone(new Set()), [text]);
  const info = (id: StepId) => {
    if (id === 'read' || id === 'do') return EXTRA_STEPS[lang][id];
    const c = cards.find((x) => x.id === id)!;
    return { word: c.word, how: c.how };
  };

  const onAnswer = useCallback((selected: number, ok: boolean, timeMs: number) => {
    const ex = quiz[qi];
    const next = [...answers, { exercise_id: ex.id, selected, correct: ex.correct, is_correct: ok, time_ms: timeMs }];
    setAnswers(next);
    if (qi + 1 < quiz.length) { setQi(qi + 1); return; }
    const result = buildSessionResult({ module: 'comprension_lectora', level: 2, answers: next, startTime: startRef.current });
    result.mode = 'exam_words';
    recordSession(result);
    setXp(result.xp_earned);
    setFinished(true);
  }, [quiz, qi, answers]);

  const restart = () => { setRound(round + 1); setQi(0); setAnswers([]); setFinished(false); setXp(0); startRef.current = Date.now(); };

  const TabBtn = ({ id, label }: { id: Tab; label: string }) => (
    <button onClick={() => { tts.stop(); setTab(id); if (id === 'practice' && finished) restart(); }} aria-pressed={tab === id}
      className={`flex-1 py-2 rounded-xl text-xs font-extrabold transition-colors ${tab === id ? 'bg-accent text-white' : 'bg-surface text-fg-muted'}`}>{label}</button>
  );

  return (
    <div className="min-h-screen pb-28">
      <Header title={t('ev_title')} showBack />
      <div className="px-4 py-4 max-w-lg mx-auto space-y-4">
        <p className="text-sm text-fg-muted">{t('ev_intro')}</p>
        <div className="flex gap-2 bg-surface-alt p-1 rounded-2xl" role="group">
          <TabBtn id="learn" label={`📚 ${t('ev_tab_learn')}`} />
          <TabBtn id="split" label={`🧩 ${t('ev_tab_split')}`} />
          <TabBtn id="practice" label={`🎯 ${t('ev_tab_practice')}`} />
        </div>

        {tab === 'learn' && (
          <div className="space-y-2.5">
            {cards.map((c) => (
              <Card key={c.id} className="!p-3">
                <button className="w-full text-left flex items-center gap-3" onClick={() => setOpen(open === c.id ? null : c.id)} aria-expanded={open === c.id}>
                  <span className="text-2xl">{c.emoji}</span>
                  <span className="flex-1">
                    <span className="block font-heading font-black">{c.word}</span>
                    <span className="block text-sm text-fg-muted leading-snug">{c.meaning}</span>
                  </span>
                  <span className="text-fg-muted text-sm">{open === c.id ? '▲' : '▼'}</span>
                </button>
                {open === c.id && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-3 space-y-2 text-sm">
                    <p><b>{t('ev_how')}</b> {c.how}</p>
                    <div className="rounded-xl bg-accent-pale p-2.5"><b>{t('ev_example')}</b> {c.q}</div>
                    <div className="rounded-xl bg-mint-pale p-2.5">✅ {c.good}</div>
                    <div className="rounded-xl bg-peach-pale p-2.5 space-y-1">
                      <p className="font-bold">❌ {t('ev_not_this')}</p>
                      {c.bad.map((b) => <p key={b}>· {b}</p>)}
                    </div>
                    {tts.isAvailable() && <button onClick={() => say(`${c.word}. ${c.meaning} ${c.how}`)} className="text-accent font-bold text-sm">🔊 {t('ev_listen')}</button>}
                  </motion.div>
                )}
              </Card>
            ))}
          </div>
        )}

        {tab === 'split' && (
          <div className="space-y-3">
            <p className="text-sm">{t('ev_split_desc')}</p>
            <textarea value={text} onChange={(e) => setText(e.target.value.slice(0, 2000))} rows={4} lang={lang}
              placeholder={tt('ev_split_ph')} aria-label={t('ev_split_ph')}
              className="w-full rounded-2xl border border-border bg-surface p-3 text-base leading-relaxed" />
            <div className="flex gap-2 flex-wrap">
              {COMPOUND[lang].slice(0, 3).map((c, i) => (
                <button key={i} onClick={() => setText(c.q)} className="px-3 py-1.5 rounded-xl bg-surface-alt text-xs font-bold">{t('ev_try_example', { n: i + 1 })}</button>
              ))}
            </div>
            {text.trim().length > 3 && (tasks.length === 0 ? (
              <Card><p className="text-sm">🤔 {t('ev_none')}</p></Card>
            ) : (
              <Card className="space-y-3">
                <p className="font-heading font-black">{t('ev_found', { n: tasks.length })}</p>
                {tasks.map((k, i) => {
                  const inf = info(k.verb);
                  const isDone = done.has(i);
                  return (
                    <div key={i} className={`rounded-2xl border p-3 ${isDone ? 'border-mint bg-mint-pale/50' : 'border-border'}`}>
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input type="checkbox" checked={isDone} className="mt-1 w-5 h-5 accent-[var(--color-mint)]"
                          onChange={() => { const n = new Set(done); if (n.has(i)) n.delete(i); else n.add(i); setDone(n); }} />
                        <span className="flex-1">
                          <span className="block text-xs font-extrabold text-accent">{i + 1}. {stepEmoji(k.verb)} {inf.word}</span>
                          <span className={`block font-bold ${isDone ? 'line-through text-fg-muted' : ''}`}>{k.text}</span>
                          <span className="block text-sm text-fg-muted mt-1">💡 {inf.how}</span>
                        </span>
                      </label>
                    </div>
                  );
                })}
                {done.size === tasks.length && <p className="text-center font-bold text-mint">🎉 {t('ev_all_done')}</p>}
                <p className="text-xs text-fg-muted">{t('ev_split_note')}</p>
              </Card>
            ))}
          </div>
        )}

        {tab === 'practice' && !finished && quiz[qi] && (
          <ExerciseCard key={`${round}_${quiz[qi].id}`} exercise={quiz[qi]} questionNumber={qi + 1} totalQuestions={quiz.length} onAnswer={onAnswer} />
        )}
        {tab === 'practice' && finished && (
          <Card className="text-center space-y-3">
            <div className="text-5xl">{answers.filter((a) => a.is_correct).length >= 8 ? '🏆' : '💪'}</div>
            <h2 className="font-heading font-black text-xl">{t('st_done', { right: answers.filter((a) => a.is_correct).length, total: answers.length })}</h2>
            {xp > 0 && <p className="font-heading font-black text-2xl text-mint">+{xp} XP</p>}
            <p className="text-sm text-fg-muted">{t('ev_done_tip')}</p>
            <Button fullWidth onClick={restart}>{t('ev_again')}</Button>
            <Button fullWidth variant="secondary" onClick={() => setTab('learn')}>{t('ev_tab_learn')}</Button>
          </Card>
        )}
      </div>
    </div>
  );
}
