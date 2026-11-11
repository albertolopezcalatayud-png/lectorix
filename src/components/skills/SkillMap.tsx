import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SKILL_BY_ID, skillNameKey, skillTipKey } from '@/data/skills';
import { useAppStore, usePracticeLang } from '@/stores/useAppStore';
import { useExerciseIndex, skillStats, MIN_ANSWERS, type SkillStat } from '@/services/skills';
import { Card } from '@/components/ui/Card';
import { useI18n } from '@/i18n';

/** Parent panel: accuracy per specific skill, strengths, what to work on, and a button to train it */
export function SkillMap() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const lang = usePracticeLang();
  const history = useAppStore((s) => s.sessionHistory);
  const index = useExerciseIndex(lang);
  if (!index) return null;
  const stats = skillStats(history, index);
  const weak = stats.filter((s) => s.status === 'weak').slice(0, 3);
  const strong = [...stats].reverse().filter((s) => s.status === 'strong').slice(0, 3);
  const mid = stats.filter((s) => !weak.includes(s) && !strong.includes(s));

  const Row = ({ s, train }: { s: SkillStat; train?: boolean }) => {
    const info = SKILL_BY_ID[s.id];
    const color = s.status === 'strong' ? 'var(--color-mint)' : s.status === 'ok' ? 'var(--color-yellow)' : 'var(--color-peach)';
    return (
      <div className="py-2">
        <div className="flex items-center gap-2">
          <span className="w-6 text-center">{info.emoji}</span>
          <span className="flex-1 text-sm font-bold">{t(skillNameKey(s.id))}</span>
          <span className="text-xs font-extrabold" style={{ color }}>{s.pct}%</span>
        </div>
        <div className="ml-8 mt-1 h-1.5 rounded-full bg-border overflow-hidden">
          <div className="h-full rounded-full" style={{ width: `${s.pct}%`, backgroundColor: color }} />
        </div>
        {train && (
          <div className="ml-8 mt-1.5">
            <p className="text-[11px] text-fg-muted">🏡 {t(skillTipKey(s.id))}</p>
            <button onClick={() => navigate(`/entrenar/${s.id}`)}
              className="mt-1.5 px-3 py-1.5 rounded-xl bg-accent text-white text-xs font-bold">
              {t('skill_train_btn')} →
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24 }}>
      <Card>
        <h3 className="font-heading font-extrabold text-sm">🗺️ {t('skill_map_title')}</h3>
        <p className="text-[11px] text-fg-muted mt-0.5 mb-2">{t('skill_map_desc')}</p>
        {stats.length === 0 ? (
          <p className="text-xs text-fg-muted py-2">{t('skill_map_empty', { n: MIN_ANSWERS })}</p>
        ) : (
          <>
            {weak.length > 0 && <>
              <p className="text-xs font-extrabold text-peach mt-2">{t('skill_map_weak')}</p>
              {weak.map((s) => <Row key={s.id} s={s} train />)}
            </>}
            {strong.length > 0 && <>
              <p className="text-xs font-extrabold text-mint mt-3">{t('skill_map_strong')}</p>
              {strong.map((s) => <Row key={s.id} s={s} />)}
            </>}
            {mid.length > 0 && (
              <details className="mt-3">
                <summary className="text-xs font-bold text-accent cursor-pointer">{t('skill_map_more', { n: mid.length })}</summary>
                {mid.map((s) => <Row key={s.id} s={s} />)}
              </details>
            )}
          </>
        )}
      </Card>
    </motion.div>
  );
}

/** Dashboard: today's personal training, when one skill is clearly weaker */
export function SkillOfTheDay() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const lang = usePracticeLang();
  const history = useAppStore((s) => s.sessionHistory);
  const index = useExerciseIndex(lang);
  if (!index) return null;
  const weak = skillStats(history, index).find((s) => s.status === 'weak');
  if (!weak) return null;
  const info = SKILL_BY_ID[weak.id];
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
      <Card hover onClick={() => navigate(`/entrenar/${weak.id}`)} className="border-peach/30 bg-peach-pale/40">
        <div className="flex items-center gap-3">
          <span className="text-3xl w-10 text-center">{info.emoji}</span>
          <div className="flex-1">
            <p className="text-[11px] font-extrabold text-peach uppercase tracking-wide">{t('skill_today')}</p>
            <h3 className="font-heading font-extrabold text-sm">{t(skillNameKey(weak.id))}</h3>
            <p className="text-xs text-fg-muted">{t('skill_today_desc')}</p>
          </div>
          <span className="text-accent font-extrabold">→</span>
        </div>
      </Card>
    </motion.div>
  );
}
