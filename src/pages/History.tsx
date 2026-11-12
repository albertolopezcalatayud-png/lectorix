import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/stores/useAppStore';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';
import {MODULE_TEXT, getModule, levelNameKey } from '@/data/modules';
import { useI18n } from '@/i18n';
import type { TranslationKey } from '@/i18n';

function formatDate(iso: string, t: (key: TranslationKey, params?: Record<string, string | number>) => string): string {
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (mins < 1) return t('hist_now');
  if (mins < 60) return t('hist_min_ago', { n: mins });
  if (hours < 24) return t('hist_hours_ago', { n: hours });
  if (days === 1) return t('hist_yesterday');
  if (days < 7) return t('hist_days_ago', { n: days });
  return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
}

function formatTime(ms: number): string {
  const secs = Math.floor(ms / 1000);
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

const starsDisplay = (stars: number) => {
  return '⭐'.repeat(stars) + '☆'.repeat(3 - stars);
};

export default function History() {
  const sessionHistory = useAppStore((s) => s.sessionHistory);
  const user = useAppStore((s) => s.user);
  const navigate = useNavigate();
  const { t } = useI18n();

  // Group sessions by date
  const grouped: Record<string, typeof sessionHistory> = {};
  for (const session of sessionHistory) {
    const d = new Date(session.completed_at);
    const key = d.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' });
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(session);
  }

  return (
    <div className="min-h-screen pb-24">
      <Header title={t('hist_title')} />

      <div className="px-4 py-5 max-w-lg mx-auto">
        {sessionHistory.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <span className="text-5xl block mb-4">📋</span>
            <h2 className="font-heading font-extrabold text-lg mb-2">{t('hist_empty')}</h2>
            <p className="text-sm text-fg-muted mb-4">
              {t('hist_empty_desc')}
            </p>
            <button
              onClick={() => navigate('/modulos')}
              className="text-accent font-bold text-sm"
            >
              {t('hist_go_modules')}
            </button>
          </motion.div>
        ) : (
          <>
            {/* Summary stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="mb-5">
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <p className="font-heading font-black text-xl text-accent">
                      {sessionHistory.length}
                    </p>
                    <p className="text-[10px] text-fg-muted">{t('hist_sessions')}</p>
                  </div>
                  <div>
                    <p className="font-heading font-black text-xl text-mint">
                      {Math.round(
                        sessionHistory.reduce((s, r) => s + r.score_percent, 0) / sessionHistory.length
                      )}%
                    </p>
                    <p className="text-[10px] text-fg-muted">{t('hist_avg')}</p>
                  </div>
                  <div>
                    <p className="font-heading font-black text-xl text-peach">
                      {user?.total_xp ?? sessionHistory.reduce((s, r) => s + r.xp_earned, 0)}
                    </p>
                    <p className="text-[10px] text-fg-muted">{t('hist_xp_total')}</p>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Session list grouped by date */}
            {Object.entries(grouped).map(([dateLabel, sessions], gi) => (
              <div key={dateLabel} className="mb-5">
                <motion.h3
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: gi * 0.05 }}
                  className="font-heading font-extrabold text-xs uppercase text-fg-muted mb-2 px-1 capitalize"
                >
                  {dateLabel}
                </motion.h3>
                <div className="space-y-2">
                  {sessions.map((session, i) => {
                    const mod = getModule(session.module);
                    return (
                      <motion.div
                        key={session.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: gi * 0.05 + i * 0.03 }}
                      >
                        <Card className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg bg-accent-pale">
                            {session.mode === 'story' ? '🐉' : session.mode === 'study' ? '📄' : session.mode === 'exam_words' ? '🧩' : mod?.icon || '📝'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-heading font-extrabold text-sm truncate">
                                {session.mode === 'story' ? t('sto_title') : session.mode === 'study' ? t('st_title') : session.mode === 'exam_words' ? t('ev_title') : (mod ? t(MODULE_TEXT[mod.id].name) : '') || session.module}
                              </p>
                              <span className="text-[10px] text-fg-muted flex-shrink-0">
                                {formatDate(session.completed_at, t)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[10px] text-fg-muted">
                                {t('parent_level_label', { level: session.level })} · {t(levelNameKey(session.level))}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-xs">{starsDisplay(session.stars)}</span>
                              <span className={`text-[10px] font-bold ${
                                session.score_percent >= 70 ? 'text-mint' : 'text-red'
                              }`}>
                                {session.score_percent}%
                              </span>
                              <span className="text-[10px] text-fg-muted">
                                {session.correct_answers}/{session.total_questions}
                              </span>
                              <span className="text-[10px] text-fg-muted">
                                ⏱ {formatTime(session.time_ms)}
                              </span>
                              <span className="text-[10px] text-accent font-bold">
                                +{session.xp_earned} XP
                              </span>
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
