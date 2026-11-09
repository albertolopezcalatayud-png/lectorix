import { motion } from 'framer-motion';
import { useAppStore } from '@/stores/useAppStore';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useI18n } from '@/i18n';
import type { TranslationKey } from '@/i18n';

const FEATURES: { icon: string; titleKey: TranslationKey; descKey: TranslationKey }[] = [
  { icon: '📚', titleKey: 'prem_feat_modules', descKey: 'prem_feat_modules_desc' },
  { icon: '🎯', titleKey: 'prem_feat_exercises', descKey: 'prem_feat_exercises_desc' },
  { icon: '📊', titleKey: 'prem_feat_stats', descKey: 'prem_feat_stats_desc' },
  { icon: '👨‍👩‍👧', titleKey: 'prem_feat_parents', descKey: 'prem_feat_parents_desc' },
  { icon: '🔊', titleKey: 'prem_feat_tts', descKey: 'prem_feat_tts_desc' },
  { icon: '🚫', titleKey: 'prem_feat_noads', descKey: 'prem_feat_noads_desc' },
];

export default function Premium() {
  const isPremium = useAppStore((s) => s.isPremium);
  const { t } = useI18n();

  if (isPremium()) {
    return (
      <div className="min-h-screen pb-24">
        <Header title={t('prem_title')} showBack />
        <div className="px-4 py-10 max-w-lg mx-auto text-center">
          <span className="text-6xl block mb-4">🎉</span>
          <h2 className="font-heading font-black text-2xl mb-2">{t('prem_already')}</h2>
          <p className="text-sm text-fg-muted">{t('prem_already_desc')}</p>
        </div>
      </div>
    );
  }

  // Subscriptions need Google Play Billing (not integrated yet): show them as coming soon.
  // Until then every feature is free for everyone.
  return (
    <div className="min-h-screen pb-24">
      <Header title={t('prem_title')} showBack />

      <div className="px-4 py-5 max-w-lg mx-auto">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <span className="text-5xl block mb-3">⭐</span>
          <h2 className="font-heading font-black text-2xl mb-1">{t('prem_hero')}</h2>
          <p className="text-sm text-fg-muted">{t('prem_hero_desc')}</p>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <Card>
            <div className="space-y-3">
              {FEATURES.map((f) => (
                <div key={f.titleKey} className="flex items-center gap-3">
                  <span className="text-xl">{f.icon}</span>
                  <div>
                    <p className="text-sm font-bold">{t(f.titleKey)}</p>
                    <p className="text-[11px] text-fg-muted">{t(f.descKey)}</p>
                  </div>
                  <span className="ml-auto text-mint text-sm">✓</span>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Plans */}
        <div className="space-y-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-accent/30 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-accent text-white text-[9px] font-bold px-3 py-0.5 rounded-bl-lg">
                {t('prem_popular')}
              </div>
              <h3 className="font-heading font-black text-lg">{t('prem_individual')}</h3>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="font-heading font-black text-3xl text-accent">{t('prem_individual_price')}</span>
                <span className="text-sm text-fg-muted">{t('prem_month')}</span>
              </div>
              <p className="text-xs text-fg-muted mt-1 mb-3">{t('prem_individual_desc')}</p>
              <Button fullWidth disabled>
                {t('prem_soon')}
              </Button>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <Card>
              <h3 className="font-heading font-black text-lg">{t('prem_family')}</h3>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="font-heading font-black text-3xl">{t('prem_family_price')}</span>
                <span className="text-sm text-fg-muted">{t('prem_month')}</span>
              </div>
              <p className="text-xs text-fg-muted mt-1 mb-3">{t('prem_family_desc')}</p>
              <Button variant="secondary" fullWidth disabled>
                {t('prem_soon')}
              </Button>
            </Card>
          </motion.div>
        </div>

        <p className="text-[10px] text-fg-muted text-center mt-4">
          {t('prem_soon_desc')}
        </p>
      </div>
    </div>
  );
}
