import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MODULES, MODULE_TEXT, SCHOOL_STAGES, levelNameKey, levelTag, type SchoolStage } from '@/data/modules';
import { useAppStore, usePracticeLang, useLevelCount } from '@/stores/useAppStore';
import { Card } from '@/components/ui/Card';
import { useI18n, type TranslationKey } from '@/i18n';

/** Parent panel: school year and starting level per area, adjustable by an adult */
export function StartingPoint() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const lang = usePracticeLang();
  const max = useLevelCount();
  const stage = useAppStore((s) => s.schoolStage);
  const setStage = useAppStore((s) => s.setSchoolStage);
  const startLevel = useAppStore((s) => s.startLevel);
  const setStartLevels = useAppStore((s) => s.setStartLevels);
  // Re-render when the starting levels change
  useAppStore((s) => s.startLevels);

  const change = (id: (typeof MODULES)[number]['id'], delta: number) => {
    const next = Math.max(1, Math.min(max, startLevel(id) + delta));
    setStartLevels(lang, { [id]: next });
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}>
      <Card>
        <h3 className="font-heading font-extrabold text-sm">🧭 {t('plc_parent_title')}</h3>
        <p className="text-[11px] text-fg-muted mt-0.5 mb-3">{t('plc_parent_desc')}</p>

        <label className="block text-xs font-bold text-fg-muted mb-1" htmlFor="school-stage">{t('plc_parent_stage')}</label>
        <select id="school-stage" value={stage ?? ''}
          onChange={(e) => {
            // A new school year resets the starting levels to the ones suggested for it
            setStage((e.target.value || null) as SchoolStage | null);
            useAppStore.setState((st) => ({ startLevels: { ...st.startLevels, [lang]: {} } }));
          }}
          className="w-full mb-3 px-3 py-2 rounded-xl bg-bg border border-border text-sm font-bold">
          <option value="">{t('plc_stage_none')}</option>
          {SCHOOL_STAGES.map((s) => <option key={s} value={s}>{t(`plc_stage_${s}` as TranslationKey)}</option>)}
        </select>

        <div className="space-y-2">
          {MODULES.map((m) => {
            const lvl = startLevel(m.id);
            return (
              <div key={m.id} className="flex items-center gap-2">
                <span className="text-lg w-7 text-center">{m.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate">{t(MODULE_TEXT[m.id].name)}</p>
                  <p className="text-[11px] text-fg-muted">{t('dash_level', { level: lvl })} · {t(levelNameKey(lvl))}{levelTag(lang, lvl)}</p>
                </div>
                <button onClick={() => change(m.id, -1)} disabled={lvl <= 1} aria-label={`${t('plc_parent_down')}: ${t(MODULE_TEXT[m.id].name)}`}
                  className="w-9 h-9 rounded-xl bg-bg border border-border font-black disabled:opacity-30">−</button>
                <button onClick={() => change(m.id, 1)} disabled={lvl >= max} aria-label={`${t('plc_parent_up')}: ${t(MODULE_TEXT[m.id].name)}`}
                  className="w-9 h-9 rounded-xl bg-bg border border-border font-black disabled:opacity-30">+</button>
              </div>
            );
          })}
        </div>

        <button onClick={() => navigate('/prueba-nivel')}
          className="w-full mt-3 py-2.5 rounded-xl bg-accent-pale text-accent font-bold text-sm">
          {t('plc_parent_redo')} →
        </button>
      </Card>
    </motion.div>
  );
}
