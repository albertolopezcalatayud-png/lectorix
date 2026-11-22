import { useAppStore } from '@/stores/useAppStore';
import { setMode, type Mode } from '@/services/profiles';
import { useI18n } from '@/i18n';

const LANGS = [
  { value: 'es' as const, label: 'Español', flag: '🇪🇸' },
  { value: 'ca' as const, label: 'Valencià', flag: '🟧' },
  { value: 'en' as const, label: 'English', flag: '🇬🇧' },
];

/**
 * First screen, shown once to everyone (also after updating): is this device for one student,
 * or will an adult use it with several students? It can be changed later in Settings.
 */
export function ModeChoice({ onChosen }: { onChosen: (m: Mode, teacher?: boolean) => void }) {
  const { t } = useI18n();
  const language = useAppStore((s) => s.language);
  const setLanguage = useAppStore((s) => s.setLanguage);
  const choose = (m: Mode, teacher = false) => { setMode(m); onChosen(m, teacher); };
  return (
    <div className="min-h-screen bg-bg text-fg px-5 py-8 flex flex-col items-center justify-center">
      <div className="w-full max-w-sm space-y-5">
        <div className="flex gap-2 justify-center" role="group" aria-label={t('onb_lang')}>
          {LANGS.map((l) => (
            <button key={l.value} onClick={() => setLanguage(l.value)} aria-pressed={language === l.value} lang={l.value}
              className={`px-3 py-2 rounded-xl text-sm font-bold border ${language === l.value ? 'bg-accent text-white border-accent' : 'bg-bg-card border-border'}`}>{l.flag} {l.label}</button>
          ))}
        </div>
        <h1 className="font-heading font-black text-2xl text-center">{t('mode_title')}</h1>
        <button onClick={() => choose('solo')} className="w-full text-left rounded-3xl border-2 border-accent bg-accent-pale px-5 py-5 flex items-center gap-4 focus-visible:ring-2 focus-visible:ring-accent">
          <span className="text-5xl" aria-hidden>🧒</span>
          <span>
            <span className="block font-heading font-black text-xl">{t('mode_solo')}</span>
            <span className="block text-sm">{t('mode_solo_desc')}</span>
          </span>
        </button>
        <button onClick={() => choose('group')} className="w-full text-left rounded-3xl border border-border bg-bg-card px-5 py-4 flex items-center gap-4 focus-visible:ring-2 focus-visible:ring-accent">
          <span className="text-4xl" aria-hidden>🧑‍🏫</span>
          <span>
            <span className="block font-heading font-extrabold text-lg">{t('mode_group')}</span>
            <span className="block text-sm text-fg-muted">{t('mode_group_desc')}</span>
          </span>
        </button>
        <button onClick={() => choose('group', true)} className="w-full text-left rounded-3xl border border-border bg-bg-card px-5 py-4 flex items-center gap-4 focus-visible:ring-2 focus-visible:ring-accent">
          <span className="text-4xl" aria-hidden>📒</span>
          <span>
            <span className="block font-heading font-extrabold text-lg">{t('mode_teacher')}</span>
            <span className="block text-sm text-fg-muted">{t('mode_teacher_desc')}</span>
          </span>
        </button>
        <p className="text-xs text-fg-muted text-center">{t('mode_change_later')}</p>
      </div>
    </div>
  );
}
