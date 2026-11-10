import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAppStore } from '@/stores/useAppStore';
import { useReadings, wordCount, readingMinutes } from '@/data/readings';
import {levelNameKey } from '@/data/modules';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';
import { useI18n } from '@/i18n';

export default function ReadingList() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const sessionHistory = useAppStore((s) => s.sessionHistory);
  const readings = useReadings() ?? [];
  const done = new Set(sessionHistory.filter((s) => s.mode === 'reading').map((s) => s.reading_id));

  return (
    <div className="min-h-screen pb-24">
      <Header title={t('read_title')} showBack />
      <div className="px-4 py-5 max-w-lg mx-auto space-y-6">
        <p className="text-sm text-fg-muted">{t('read_desc')}</p>
        {[1, 2, 3, 4, 5].map((level) => (
          <section key={level}>
            <h3 className="font-heading font-extrabold text-sm mb-2.5">
              {t('dash_level', { level })} · {t(levelNameKey(level))}
            </h3>
            <div className="space-y-2.5">
              {readings.filter((r) => r.level === level).map((r, i) => (
                <motion.div key={r.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                  <Card hover onClick={() => navigate(`/lectura/${r.id}`)}>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl w-11 h-11 rounded-[12px] bg-accent-pale flex items-center justify-center">{r.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-heading font-extrabold text-sm truncate">{r.title}</h4>
                        <p className="text-xs text-fg-muted">{t('read_meta', { n: wordCount(r), m: readingMinutes(r) })}</p>
                      </div>
                      {done.has(r.id) ? (
                        <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-mint-pale text-mint">✓ {t('read_completed')}</span>
                      ) : (
                        <span className="text-accent font-extrabold text-sm">→</span>
                      )}
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
