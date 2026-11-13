import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { usePracticeLang } from '@/stores/useAppStore';
import { useReviewStore, notebookWords, startOfDay } from '@/services/review';
import { MODULE_TEXT } from '@/data/modules';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import tts from '@/services/tts';
import { LapiNote } from '@/components/mascot/LapiNote';
import { useI18n } from '@/i18n';

/** Personal notebook of the words the student finds hard */
export default function Notebook() {
  const navigate = useNavigate();
  const lang = usePracticeLang();
  const { t } = useI18n();
  const items = useReviewStore((s) => s.items);
  const markMastered = useReviewStore((s) => s.markMastered);
  const [showMastered, setShowMastered] = useState(false);

  const words = notebookWords(items, lang);
  const pending = words.filter((w) => !w.mastered).sort((a, b) => b.misses - a.misses || a.due - b.due);
  const mastered = words.filter((w) => w.mastered).sort((a, b) => (b.masteredAt ?? 0) - (a.masteredAt ?? 0));
  const today = startOfDay();

  const whenText = (due: number) => {
    const days = Math.round((startOfDay(due) - today) / 86400000);
    return days <= 0 ? t('nb_due_today') : days === 1 ? t('nb_due_tomorrow') : t('nb_due_in', { n: days });
  };

  return (
    <div className="min-h-screen pb-24">
      <Header title={t('nb_title')} showBack />
      <div className="px-4 py-5 max-w-lg mx-auto space-y-4">
        <p className="text-sm text-fg-muted">{t('nb_desc')}</p>

        {pending.length === 0 ? (
          <LapiNote title={t('nb_empty_title')}>{t('nb_empty_desc')}</LapiNote>
        ) : (
          <>
            <Button fullWidth onClick={() => navigate('/repaso', { state: { all: true, keys: pending.map((w) => w.key) } })}>
              {t('nb_practise', { n: Math.min(pending.length, 12) })}
            </Button>
            <div className="space-y-2">
              {pending.map((w, i) => (
                <motion.div key={w.key} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i, 10) * 0.03 }}>
                  <Card>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => void tts.speak(w.word!)}
                        className="w-10 h-10 flex-shrink-0 rounded-xl bg-accent-pale text-accent text-lg"
                        aria-label={t('ex_listen_word')}
                      >
                        🔊
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="font-heading font-extrabold text-lg leading-tight break-words">{w.word}</div>
                        <div className="text-[11px] text-fg-muted">
                          {t(MODULE_TEXT[w.module].name)} · {t('nb_misses', { n: w.misses })} · {whenText(w.due)}
                        </div>
                        <div className="flex gap-1 mt-1.5" aria-label={t('nb_progress', { n: w.box - 1 })}>
                          {[1, 2, 3].map((b) => (
                            <span key={b} className={`h-1.5 w-6 rounded-full ${b < w.box ? 'bg-mint' : 'bg-border'}`} />
                          ))}
                        </div>
                      </div>
                      <button onClick={() => markMastered(w.key)} className="text-xs font-bold text-mint px-2 py-1 rounded-lg bg-mint-pale">
                        {t('nb_know_it')}
                      </button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </>
        )}

        {mastered.length > 0 && (
          <div>
            <button onClick={() => setShowMastered(!showMastered)} className="text-sm font-bold text-accent">
              {showMastered ? '▾' : '▸'} {t('nb_mastered', { n: mastered.length })}
            </button>
            {showMastered && (
              <div className="flex flex-wrap gap-2 mt-2">
                {mastered.map((w) => (
                  <span key={w.key} className="px-2.5 py-1 rounded-full bg-mint-pale text-mint text-sm font-bold">✓ {w.word}</span>
                ))}
              </div>
            )}
          </div>
        )}

        <Card className="text-xs text-fg-muted">💡 {t('srs_how')}</Card>
      </div>
    </div>
  );
}
