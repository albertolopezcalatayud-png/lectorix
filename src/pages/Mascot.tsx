import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/stores/useAppStore';
import { Header } from '@/components/layout/Header';
import {
  MascotAvatar,
  REWARD_CATALOG,
  COLOR_MAP,
  ITEM_VALUE_MAP,
  type RewardItem,
} from '@/components/mascot/MascotAvatar';
import { sounds } from '@/services/sounds';
import { useI18n } from '@/i18n';
import type { TranslationKey } from '@/i18n';

type TabId = 'color' | 'hat' | 'accessory' | 'background';

const TABS: { id: TabId; labelKey: TranslationKey; icon: string }[] = [
  { id: 'color', labelKey: 'mascot_color', icon: '🎨' },
  { id: 'hat', labelKey: 'mascot_hats', icon: '🧢' },
  { id: 'accessory', labelKey: 'mascot_accessories', icon: '⭐' },
  { id: 'background', labelKey: 'mascot_backgrounds', icon: '🌈' },
];

export default function Mascot() {
  const [activeTab, setActiveTab] = useState<TabId>('color');
  const { t } = useI18n();
  const mascot = useAppStore((s) => s.mascot);
  const setMascotColor = useAppStore((s) => s.setMascotColor);
  const setMascotHat = useAppStore((s) => s.setMascotHat);
  const setMascotAccessory = useAppStore((s) => s.setMascotAccessory);
  const setMascotBackground = useAppStore((s) => s.setMascotBackground);
  const user = useAppStore((s) => s.user);
  const progress = useAppStore((s) => s.progress);
  const sessionHistory = useAppStore((s) => s.sessionHistory);

  // Calculate stats for unlock checks
  const stats = useMemo(() => {
    const totalStars = progress.reduce((sum, p) => sum + p.stars, 0);
    const completedLevels = progress.filter((p) => p.stars > 0).length;
    return {
      xp: user?.total_xp || 0,
      stars: totalStars,
      levels: completedLevels,
      streak: user?.streak_days || 0,
      sessions: sessionHistory.length,
    };
  }, [user, progress, sessionHistory]);

  const tabItems = REWARD_CATALOG.filter((r) => r.category === activeTab);

  const isEquipped = (item: RewardItem): boolean => {
    if (item.category === 'color') {
      return mascot.color === (COLOR_MAP[item.id] || 'purple');
    }
    if (item.category === 'hat') {
      return mascot.hat === (ITEM_VALUE_MAP[item.id] || null);
    }
    if (item.category === 'accessory') {
      return mascot.accessory === (ITEM_VALUE_MAP[item.id] || null);
    }
    if (item.category === 'background') {
      return mascot.background === (ITEM_VALUE_MAP[item.id] || null);
    }
    return false;
  };

  const equip = (item: RewardItem) => {
    if (!item.check(stats)) return;
    sounds.click();

    if (item.category === 'color') {
      const color = COLOR_MAP[item.id] || 'purple';
      setMascotColor(mascot.color === color ? 'purple' : color);
    } else if (item.category === 'hat') {
      const val = ITEM_VALUE_MAP[item.id] || null;
      setMascotHat(mascot.hat === val ? null : val);
    } else if (item.category === 'accessory') {
      const val = ITEM_VALUE_MAP[item.id] || null;
      setMascotAccessory(mascot.accessory === val ? null : val);
    } else if (item.category === 'background') {
      const val = ITEM_VALUE_MAP[item.id] || null;
      setMascotBackground(mascot.background === val ? null : val);
    }
  };

  const unlockedCount = REWARD_CATALOG.filter((r) => r.check(stats)).length;
  const totalCount = REWARD_CATALOG.length;

  return (
    <div className="min-h-screen pb-24">
      <Header title={t('mascot_title')} />

      <div className="px-4 py-5 max-w-lg mx-auto space-y-4">
        {/* Mascot Preview */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center"
        >
          <div className="relative">
            <MascotAvatar customization={mascot} size={160} />
          </div>
          <h2 className="font-heading font-black text-lg mt-3">
            {user?.display_name ? t('mascot_owl', { name: user.display_name }) : t('mascot_your_owl')}
          </h2>
          <p className="text-xs text-fg-muted mt-1">
            {t('mascot_unlocked', { n: unlockedCount, total: totalCount })}
          </p>
        </motion.div>

        {/* Category Tabs */}
        <div className="flex gap-1 bg-bg-card rounded-xl p-1 border border-border">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                sounds.click();
              }}
              className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-accent text-white shadow-sm'
                  : 'text-fg-muted hover:text-fg'
              }`}
            >
              <span>{tab.icon}</span>
              <span className="hidden min-[360px]:inline">{t(tab.labelKey)}</span>
            </button>
          ))}
        </div>

        {/* Items Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-2 gap-3"
          >
            {/* Default / Remove option */}
            {activeTab !== 'color' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0 }}
              >
                <button
                  onClick={() => {
                    sounds.click();
                    if (activeTab === 'hat') setMascotHat(null);
                    if (activeTab === 'accessory') setMascotAccessory(null);
                    if (activeTab === 'background') setMascotBackground(null);
                  }}
                  className={`w-full p-3 rounded-xl border-2 transition-all text-left ${
                    (activeTab === 'hat' && !mascot.hat) ||
                    (activeTab === 'accessory' && !mascot.accessory) ||
                    (activeTab === 'background' && !mascot.background)
                      ? 'border-accent bg-accent/10'
                      : 'border-border bg-bg-card hover:border-accent/50'
                  }`}
                >
                  <span className="text-2xl block mb-1">🚫</span>
                  <p className="text-xs font-bold">{t('mascot_none')}</p>
                  <p className="text-[10px] text-fg-muted">{t('mascot_remove')}</p>
                </button>
              </motion.div>
            )}

            {tabItems.map((item, i) => {
              const unlocked = item.check(stats);
              const equipped = isEquipped(item);

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: (i + 1) * 0.03 }}
                >
                  <button
                    onClick={() => equip(item)}
                    disabled={!unlocked}
                    className={`w-full p-3 rounded-xl border-2 transition-all text-left ${
                      equipped
                        ? 'border-accent bg-accent/10 shadow-sm'
                        : unlocked
                          ? 'border-border bg-bg-card hover:border-accent/50'
                          : 'border-border/50 bg-bg-card/50 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-2xl">{item.emoji}</span>
                      {equipped && (
                        <span className="text-[10px] bg-accent text-white px-1.5 py-0.5 rounded-full font-bold">
                          {t('mascot_equipped')}
                        </span>
                      )}
                      {!unlocked && (
                        <span className="text-[10px]">🔒</span>
                      )}
                    </div>
                    <p className="text-xs font-bold truncate">{t(item.nameKey as TranslationKey)}</p>
                    <p className={`text-[10px] ${unlocked ? 'text-mint' : 'text-fg-muted'}`}>
                      {unlocked ? t('mascot_unlocked_item') : t(item.requirementKey as TranslationKey, item.requirementParams)}
                    </p>
                  </button>
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
