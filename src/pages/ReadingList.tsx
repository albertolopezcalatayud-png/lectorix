import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useAppStore, useLevelCount } from '@/stores/useAppStore';
import { useReadings, wordCount, readingMinutes, SUBJECTS, type Reading } from '@/data/readings';
import { levelNameKey, levelTag } from '@/data/modules';
import { TOPICS, TOPIC_EMOJI, topicKey, useInterests } from '@/data/topics';
import { recommendedLevel } from '@/services/review';
import { usePracticeLang } from '@/stores/useAppStore';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';
import { useI18n } from '@/i18n';

export default function ReadingList() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useI18n();
  const [subject, setSubject] = useState<string>('all');
  const subjectsRef = useRef<HTMLElement>(null);
  const wantSubjects = !!location.state?.subjects;
  const sessionHistory = useAppStore((s) => s.sessionHistory);
  const readings = useReadings() ?? [];
  const lang = usePracticeLang();
  const done = new Set(sessionHistory.filter((s) => s.mode === 'reading').map((s) => s.reading_id));
  const { interests, toggle } = useInterests();
  const levels = useLevelCount();
  const progress = useAppStore((s) => s.progress);
  const isLevelUnlocked = useAppStore((s) => s.isLevelUnlocked);
  const startLevel = useAppStore((s) => s.startLevel);
  const rec = recommendedLevel(progress, 'comprension_lectora', levels, isLevelUnlocked, startLevel('comprension_lectora'));
  // "For you": readings about what the student likes, around their reading level, unread first
  const forYou = interests.length === 0 ? [] : readings
    .filter((r) => r.topics?.some((x) => (interests as string[]).includes(x)) && Math.abs(r.level - rec) <= 1)
    .sort((a, b) => Number(done.has(a.id)) - Number(done.has(b.id)) || Math.abs(a.level - rec) - Math.abs(b.level - rec) || a.level - b.level)
    .slice(0, 4);

  const subjectReadings = readings.filter((r) => r.subject);
  const general = readings.filter((r) => !r.subject);
  useEffect(() => {
    if (wantSubjects && subjectReadings.length) subjectsRef.current?.scrollIntoView({ block: 'start' });
  }, [wantSubjects, subjectReadings.length]);

  const Item = ({ r, i }: { r: Reading; i: number }) => (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
      <Card hover onClick={() => navigate(`/lectura/${r.id}`)}>
        <div className="flex items-center gap-3">
          <span className="text-2xl w-11 h-11 rounded-[12px] bg-accent-pale flex items-center justify-center">{r.emoji}</span>
          <div className="flex-1 min-w-0">
            <h4 className="font-heading font-extrabold text-sm truncate">{r.title}</h4>
            <p className="text-xs text-fg-muted">
              {t('read_meta', { n: wordCount(r), m: readingMinutes(r) })}
              {r.subject ? <span> · {t(`subj_${r.subject}` as never)} · {t('dash_level', { level: r.level })}</span>
                : r.topics?.length ? <span aria-hidden="true"> · {r.topics.map((x) => TOPIC_EMOJI[x]).join(' ')}</span> : null}
            </p>
          </div>
          {done.has(r.id) ? (
            <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-mint-pale text-mint">✓ {t('read_completed')}</span>
          ) : (
            <span className="text-accent font-extrabold text-sm">→</span>
          )}
        </div>
      </Card>
    </motion.div>
  );

  return (
    <div className="min-h-screen pb-24">
      <Header title={t('read_title')} showBack />
      <div className="px-4 py-5 max-w-lg mx-auto space-y-6">
        <p className="text-sm text-fg-muted">{t('read_desc')}</p>
        <Card>
          <h3 className="font-heading font-extrabold text-sm mb-1">💭 {t('int_title')}</h3>
          <p className="text-xs text-fg-muted mb-2">{t('int_desc')}</p>
          <div className="flex flex-wrap gap-1.5">
            {TOPICS.map((x) => (
              <button key={x.id} onClick={() => toggle(x.id)} aria-pressed={interests.includes(x.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold border ${interests.includes(x.id) ? 'bg-accent text-white border-accent' : 'bg-bg border-border'}`}>
                {x.emoji} {t(topicKey(x.id))}
              </button>
            ))}
          </div>
        </Card>
        {interests.length > 0 && (
          <section>
            <h3 className="font-heading font-extrabold text-sm mb-2.5">✨ {t('int_for_you')}</h3>
            {forYou.length > 0
              ? <div className="space-y-2.5">{forYou.map((r, i) => <Item key={r.id} r={r} i={i} />)}</div>
              : <p className="text-xs text-fg-muted">{t('int_none')}</p>}
          </section>
        )}
        {subjectReadings.length > 0 && (
          <section ref={subjectsRef} className="scroll-mt-20">
            <h3 className="font-heading font-extrabold text-sm">🎓 {t('subj_title')}</h3>
            <p className="text-xs text-fg-muted mb-2">{t('subj_desc')}</p>
            <div className="flex flex-wrap gap-1.5 mb-2.5">
              {[{ id: 'all', emoji: '📚' }, ...SUBJECTS].map((x) => (
                <button key={x.id} onClick={() => setSubject(x.id)} aria-pressed={subject === x.id}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold border ${subject === x.id ? 'bg-accent text-white border-accent' : 'bg-bg border-border'}`}>
                  {x.emoji} {t(`subj_${x.id}` as never)}
                </button>
              ))}
            </div>
            <div className="space-y-2.5">
              {subjectReadings.filter((r) => subject === 'all' || r.subject === subject).sort((a, b) => a.level - b.level).map((r, i) => <Item key={r.id} r={r} i={i} />)}
            </div>
          </section>
        )}
        {[...new Set(general.map((r) => r.level))].sort((a, b) => a - b).map((level) => (
          <section key={level}>
            <h3 className="font-heading font-extrabold text-sm mb-2.5">
              {t('dash_level', { level })} · {t(levelNameKey(level))}{levelTag(lang, level)}
            </h3>
            <div className="space-y-2.5">
              {general.filter((r) => r.level === level).map((r, i) => <Item key={r.id} r={r} i={i} />)}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
