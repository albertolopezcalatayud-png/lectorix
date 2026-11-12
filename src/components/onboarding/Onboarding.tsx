import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { useI18n, type TranslationKey } from '@/i18n';
import { useAppStore } from '@/stores/useAppStore';

interface OnboardingProps {
  onComplete: () => void;
}

const SLIDES = [
  { emoji: '📖', title: 'onb_s1_title', description: 'onb_s1_desc', bg: 'bg-accent-pale/50' },
  { emoji: '🧩', title: 'onb_s2_title', description: 'onb_s2_desc', bg: 'bg-sky-pale/50' },
  { emoji: '⭐', title: 'onb_s3_title', description: 'onb_s3_desc', bg: 'bg-yellow-pale/50' },
  { emoji: '🔊', title: 'onb_s4_title', description: 'onb_s4_desc', bg: 'bg-mint-pale/50' },
  { emoji: '♿', title: 'onb_s5_title', description: 'onb_s5_desc', bg: 'bg-peach-pale/50' },
] as const satisfies readonly { emoji: string; title: TranslationKey; description: TranslationKey; bg: string }[];

const LANGS = [
  { value: 'es' as const, label: 'Español', flag: '🇪🇸' },
  { value: 'ca' as const, label: 'Valencià', flag: '🟧' },
  { value: 'en' as const, label: 'English', flag: '🇬🇧' },
];

export function Onboarding({ onComplete }: OnboardingProps) {
  const [current, setCurrent] = useState(0);
  const { t } = useI18n();
  const language = useAppStore((st) => st.language);
  const setLanguage = useAppStore((st) => st.setLanguage);
  const slide = SLIDES[current];
  const isLast = current === SLIDES.length - 1;

  return (
    <div className="fixed inset-0 z-50 bg-bg flex flex-col items-center justify-center px-6">
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -60 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col items-center text-center max-w-sm"
        >
          {/* Emoji icon */}
          <div className={`w-28 h-28 rounded-full ${slide.bg} flex items-center justify-center mb-8`}>
            <span className="text-6xl">{slide.emoji}</span>
          </div>

          <h1 className="font-heading font-black text-2xl mb-3">{t(slide.title)}</h1>
          <p className="text-fg-muted text-sm leading-relaxed">{t(slide.description)}</p>
          {current === 0 && (
            <div className="mt-6 w-full">
              <p className="text-xs font-bold text-fg-muted mb-2">{t('onb_lang')}</p>
              <div className="flex gap-2 justify-center">
                {LANGS.map((l) => (
                  <button
                    key={l.value}
                    onClick={() => setLanguage(l.value)}
                    aria-pressed={language === l.value}
                    lang={l.value}
                    className={`px-3 py-2 rounded-xl text-sm font-bold border transition-colors ${
                      language === l.value ? 'bg-accent text-white border-accent' : 'bg-bg border-border'
                    }`}
                  >
                    {l.flag} {l.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Dots */}
      <div className="flex gap-2 mt-10 mb-8">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            aria-label={t('onb_slide', { n: i + 1, total: SLIDES.length })}
            aria-current={i === current ? 'step' : undefined}
            className={`w-2.5 h-2.5 rounded-full transition-colors ${
              i === current ? 'bg-accent scale-125' : 'bg-border'
            }`}
          />
        ))}
      </div>

      {/* Buttons */}
      <div className="w-full max-w-xs space-y-2.5">
        <Button
          fullWidth
          onClick={() => {
            if (isLast) {
              onComplete();
            } else {
              setCurrent((c) => c + 1);
            }
          }}
        >
          {isLast ? t('onb_start') : t('onb_next')}
        </Button>

        {!isLast && (
          <Button variant="ghost" fullWidth onClick={onComplete}>
            {t('onb_skip')}
          </Button>
        )}
      </div>
    </div>
  );
}
