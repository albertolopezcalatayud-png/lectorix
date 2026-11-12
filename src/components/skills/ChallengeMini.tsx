import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/stores/useAppStore';
import { useShelfStore } from '@/services/shelf';
import { useChallenge, weekOf, myReading, progressOf } from '@/services/challenge';
import { useI18n } from '@/i18n';

/** Dashboard: progress of this week's reading challenge, if there is one */
export function ChallengeMini() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const current = useChallenge((s) => s.current);
  const history = useAppStore((s) => s.sessionHistory);
  const books = useShelfStore((s) => s.books);
  const logs = useShelfStore((s) => s.logs);
  if (!current || current.week !== weekOf()) return null;
  const p = progressOf(current, myReading(current.week, history, books, logs));
  const unit = (n: number) => t(`rc_unit_${current.kind}`, { n });
  return (
    <button onClick={() => navigate('/reto-lectura')} className="w-full text-left rounded-2xl bg-bg-card border border-border px-4 py-3">
      <div className="flex items-center gap-2 text-sm font-bold">
        <span>{current.done ? '🏅' : '🏆'}</span>
        <span className="flex-1">{t('rc_dash', { value: unit(p.value), goal: unit(p.goal) })}</span>
        <span className="text-accent">→</span>
      </div>
      <div className="h-2 rounded-full bg-accent-pale overflow-hidden mt-2"><div className="h-full bg-accent" style={{ width: `${p.pct}%` }} /></div>
    </button>
  );
}
