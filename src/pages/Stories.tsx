import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AnswerResult, Exercise } from '@/types';
import { HEROES, PLACES, THINGS, writeStory, storyTitle, tierFor, heroName, cap, type StoryLang, type Tier, type Plot } from '@/data/storyKit';
import { LEVEL_COUNT } from '@/data/modules';
import { useAppStore, usePracticeLang, resolvePracticeLang } from '@/stores/useAppStore';
import { useReviewStore, notebookWords, recommendedLevel } from '@/services/review';
import { loadIndex } from '@/services/skills';
import tts from '@/services/tts';
import { SyllableText } from '@/components/reading/SyllableText';
import { ExerciseCard } from '@/components/exercise/ExerciseCard';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useI18n } from '@/i18n';
import { buildSessionResult } from '@/services/gamification';
import { recordSession } from '@/services/session';

interface SavedStory { id: string; lang: StoryLang; tier: Tier; hero: string; place: string; thing: string; words: string[]; date: string; plot?: Plot }

const useStoryStore = create<{ stories: SavedStory[]; add: (s: SavedStory) => void }>()(
  persist((set) => ({ stories: [], add: (s) => set((st) => ({ stories: [s, ...st.stories].slice(0, 10) })) }), { name: 'lectorix-stories' }),
);

const TAG: Record<StoryLang, string> = { es: 'es-ES', ca: 'ca-ES', en: 'en-GB' };
const shuffle = <T,>(a: T[]) => { const r = [...a]; for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; } return r; };

/** Tricky words for the story: the student's notebook first, then hard spellings of their level */
async function pickWords(lang: StoryLang, level: number): Promise<{ words: string[]; spare: string[] }> {
  const mine = shuffle(notebookWords(useReviewStore.getState().items, lang).filter((i) => !i.mastered).map((i) => i.word!).filter((w) => /^[\p{L}·'’-]{3,16}$/u.test(w)));
  const index = await loadIndex(lang);
  const bankWords = shuffle([...index.values()]
    .filter((e) => e.skill === 'mem_spelling' && e.type === 'multiple_choice' && Math.abs(e.level - level) <= 1)
    .map((e) => e.options[e.correct])
    .filter((w) => /^[\p{L}·'’-]{4,14}$/u.test(w)));
  const count = level <= 2 ? 3 : 4;
  const words = [...new Set([...mine, ...bankWords])].slice(0, count);
  const spare = bankWords.filter((w) => !words.includes(w)).slice(0, 6);
  return { words, spare };
}

function questions(lang: StoryLang, s: SavedStory, t: ReturnType<typeof useI18n>['t']): Exercise[] {
  const hero = HEROES.find((h) => h.id === s.hero)!, place = PLACES.find((p) => p.id === s.place)!, thing = THINGS.find((o) => o.id === s.thing)!;
  const N = heroName(hero, lang);
  const mc = (id: string, prompt: string, correct: string, wrong: string[], explanation: string): Exercise => {
    const options = shuffle([correct, ...wrong.slice(0, 3)]);
    return { id: `story_${s.id}_${id}`, module: 'comprension_lectora', level: 1, type: 'multiple_choice', prompt, options, correct: options.indexOf(correct), explanation };
  };
  const qs = [
    mc('who', t('sto_q_who'), N, HEROES.filter((h) => h.id !== hero.id).map((h) => heroName(h, lang)), N),
    mc('where', t('sto_q_where', { name: N }), cap(place.t[lang].the), PLACES.filter((p) => p.id !== place.id).map((p) => cap(p.t[lang].the)), cap(place.t[lang].the)),
    mc('what', t('sto_q_what', { name: N }), cap(thing.t[lang].a), THINGS.filter((o) => o.id !== thing.id).map((o) => cap(o.t[lang].a)), cap(thing.t[lang].a)),
  ];
  return qs;
}

export default function Stories() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const lang = usePracticeLang() as StoryLang;
  const stories = useStoryStore((s) => s.stories);
  const add = useStoryStore((s) => s.add);
  const [hero, setHero] = useState(HEROES[0].id);
  const [place, setPlace] = useState(PLACES[0].id);
  const [thing, setThing] = useState(THINGS[0].id);
  const [story, setStory] = useState<SavedStory | null>(null);
  const [spare, setSpare] = useState<string[]>([]);
  const [phase, setPhase] = useState<'pick' | 'read' | 'quiz' | 'done'>('pick');
  const [qi, setQi] = useState(0);
  const [answers, setAnswers] = useState<AnswerResult[]>([]);
  const [busy, setBusy] = useState(false);
  const [level, setLevel] = useState(1);
  const [xp, setXp] = useState(0);
  const startRef = useRef(Date.now());
  const scored = useRef(new Set<string>()); // each story's quiz gives XP once

  useEffect(() => () => tts.stop(), []);

  const makeStory = async () => {
    setBusy(true);
    const st = useAppStore.getState();
    const max = LEVEL_COUNT[resolvePracticeLang(st)];
    const level = recommendedLevel(st.progress, 'comprension_lectora', max, st.isLevelUnlocked, st.startLevel('comprension_lectora'));
    const { words, spare: sp } = await pickWords(lang, level);
    const s: SavedStory = { id: String(Date.now()), lang, tier: tierFor(level), hero, place, thing, words, date: new Date().toISOString(), plot: (Math.random() < 0.5 ? 0 : 1) as Plot };
    add(s);
    setLevel(level);
    setSpare(sp);
    setStory(s);
    setPhase('read');
    setBusy(false);
  };

  const text = useMemo(() => {
    if (!story) return '';
    const h = HEROES.find((x) => x.id === story.hero)!, p = PLACES.find((x) => x.id === story.place)!, o = THINGS.find((x) => x.id === story.thing)!;
    return writeStory(story.lang, story.tier, h, p, o, story.words, story.plot ?? 0);
  }, [story]);
  const title = story ? storyTitle(story.lang, HEROES.find((x) => x.id === story.hero)!, THINGS.find((x) => x.id === story.thing)!) : '';

  const quiz = useMemo(() => {
    if (!story) return [];
    const qs = questions(story.lang, story, t);
    if (story.words.length && spare.length >= 3) {
      const correct = story.words[0];
      const options = shuffle([correct, ...spare.slice(0, 3)]);
      qs.push({ id: `story_${story.id}_word`, module: 'comprension_lectora', level: 1, type: 'multiple_choice', prompt: t('sto_q_word'), options, correct: options.indexOf(correct), explanation: story.words.join(', ') });
    }
    return qs;
  }, [story, spare, t]);

  const onAnswer = useCallback((selected: number, ok: boolean, timeMs: number) => {
    const ex = quiz[qi];
    const next = [...answers, { exercise_id: ex.id, selected, correct: ex.correct, is_correct: ok, time_ms: timeMs }];
    setAnswers(next);
    if (qi + 1 < quiz.length) { setQi(qi + 1); return; }
    // the story quiz counts like any other practice: XP, streak and history
    if (story && !scored.current.has(story.id)) {
      scored.current.add(story.id);
      const result = buildSessionResult({ module: 'comprension_lectora', level, answers: next, startTime: startRef.current });
      result.mode = 'story';
      recordSession(result);
      setXp(result.xp_earned);
    } else setXp(0);
    setPhase('done');
  }, [quiz, qi, answers, level, story]);

  if (phase === 'read' && story) {
    return (
      <div className="min-h-screen pb-28">
        <Header title={t('sto_title')} showBack />
        <div className="px-4 py-4 max-w-lg mx-auto space-y-3">
          <h2 className="font-heading font-black text-xl text-center">{HEROES.find((h) => h.id === story.hero)!.emoji} {title}</h2>
          <div className="flex gap-1.5 justify-center">
            <button onClick={() => void tts.speakIn(text.replace(/\n+/g, ' '), TAG[story.lang], 0.85)} className="px-3 py-1.5 rounded-full bg-accent text-white text-xs font-bold">🔊 {t('hw_listen_all')}</button>
            <button onClick={() => tts.stop()} className="px-3 py-1.5 rounded-full bg-bg-card border border-border text-xs font-bold">⏹</button>
          </div>
          {story.words.length > 0 && (
            <Card className="bg-yellow-pale/50">
              <p className="text-xs font-bold mb-2">✨ {t('sto_magic')}</p>
              <div className="flex flex-wrap gap-2">
                {story.words.map((w) => <button key={w} onClick={() => void tts.speakIn(w, TAG[story.lang], 0.7)} className="px-3 py-1.5 rounded-xl bg-bg-card border border-border font-bold text-sm">🔊 {w}</button>)}
              </div>
            </Card>
          )}
          <Card>
            <div className="text-lg reading-text space-y-4" style={{ lineHeight: 'calc(var(--reading-leading) + 0.4)' }}
              lang={story.lang === 'ca' ? 'ca-ES-valencia' : story.lang === 'en' ? 'en-GB' : 'es'}>
              {text.split('\n\n').map((para, i) => <p key={i}><SyllableText text={para} /></p>)}
            </div>
          </Card>
          <Button fullWidth onClick={() => { tts.stop(); setQi(0); setAnswers([]); startRef.current = Date.now(); setPhase('quiz'); }}>{t('sto_questions', { n: quiz.length })}</Button>
          <Button variant="secondary" fullWidth onClick={() => { tts.stop(); setPhase('pick'); }}>{t('sto_another')}</Button>
        </div>
      </div>
    );
  }

  if (phase === 'quiz' && quiz[qi]) {
    return (
      <div className="min-h-screen">
        <Header title={title} showBack />
        <div className="px-4 py-6 max-w-lg mx-auto">
          <ExerciseCard key={quiz[qi].id} exercise={quiz[qi]} questionNumber={qi + 1} totalQuestions={quiz.length} onAnswer={onAnswer} />
        </div>
      </div>
    );
  }

  if (phase === 'done') {
    const right = answers.filter((a) => a.is_correct).length;
    return (
      <div className="min-h-screen pb-24">
        <Header title={t('sto_title')} />
        <div className="px-4 py-8 max-w-lg mx-auto space-y-4 text-center">
          <motion.div initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-6xl">📖</motion.div>
          <h2 className="font-heading font-black text-xl">{t('st_done', { right, total: answers.length })}</h2>
          {xp > 0 && <p className="font-heading font-black text-2xl text-mint">+{xp} XP</p>}
          <p className="text-sm text-fg-muted">{t('sto_done_desc')}</p>
          <Button fullWidth onClick={() => setPhase('read')}>{t('sto_reread')}</Button>
          <Button variant="secondary" fullWidth onClick={() => setPhase('pick')}>{t('sto_another')}</Button>
        </div>
      </div>
    );
  }

  const Row = ({ label, items, value, set }: { label: string; items: { id: string; emoji: string; label: string }[]; value: string; set: (v: string) => void }) => (
    <div>
      <p className="text-sm font-extrabold mb-2">{label}</p>
      <div className="grid grid-cols-3 gap-2">
        {items.map((x) => (
          <button key={x.id} onClick={() => set(x.id)} aria-pressed={value === x.id}
            className={`py-2.5 px-1 rounded-2xl border text-center transition-colors ${value === x.id ? 'bg-accent-pale border-accent' : 'bg-bg-card border-border'}`}>
            <span className="text-2xl block">{x.emoji}</span>
            <span className="text-[11px] font-bold leading-tight block mt-1">{x.label}</span>
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen pb-24">
      <Header title={t('sto_title')} showBack />
      <div className="px-4 py-5 max-w-lg mx-auto space-y-5">
        <p className="text-sm text-fg-muted text-center">{t('sto_desc')}</p>
        <Row label={t('sto_pick_hero')} value={hero} set={setHero} items={HEROES.map((h) => ({ id: h.id, emoji: h.emoji, label: heroName(h, lang) }))} />
        <Row label={t('sto_pick_place')} value={place} set={setPlace} items={PLACES.map((p) => ({ id: p.id, emoji: p.emoji, label: cap(p.t[lang].the) }))} />
        <Row label={t('sto_pick_thing')} value={thing} set={setThing} items={THINGS.map((o) => ({ id: o.id, emoji: o.emoji, label: cap(o.t[lang].the) }))} />
        <Button fullWidth disabled={busy} onClick={() => void makeStory()}>✨ {t('sto_create')}</Button>
        {stories.filter((s) => s.lang === lang).length > 0 && (
          <div>
            <h3 className="font-heading font-extrabold text-sm mb-2">{t('sto_mine')}</h3>
            <div className="space-y-2">
              {stories.filter((s) => s.lang === lang).map((s) => (
                <Card key={s.id} hover onClick={() => { setStory(s); setSpare([]); setPhase('read'); }}>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{HEROES.find((h) => h.id === s.hero)?.emoji}</span>
                    <span className="flex-1 text-sm font-bold">{storyTitle(s.lang, HEROES.find((h) => h.id === s.hero)!, THINGS.find((o) => o.id === s.thing)!)}</span>
                    <span className="text-accent font-extrabold">→</span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
        <button onClick={() => navigate('/mis-palabras')} className="w-full text-xs text-accent font-bold">📒 {t('sto_tip_words')}</button>
      </div>
    </div>
  );
}
