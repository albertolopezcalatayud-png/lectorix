import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePracticeLang } from '@/stores/useAppStore';
import tts from '@/services/tts';
import { useI18n } from '@/i18n';

/** On the dashboard: when practising in Valencian and the device has no Catalan voice, point to the voices page */
export function MissingVoiceBanner() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const lang = usePracticeLang();
  const [missing, setMissing] = useState(false);
  useEffect(() => {
    let off = false;
    if (lang !== 'ca') { setMissing(false); return; }
    void tts.canSpeak('ca-ES').then((ok) => { if (!off) setMissing(!ok); });
    return () => { off = true; };
  }, [lang]);
  if (!missing) return null;
  return (
    <button onClick={() => navigate('/voces')} className="w-full text-left rounded-2xl bg-yellow-pale/70 border border-yellow/40 px-4 py-3 text-sm font-bold flex items-center gap-2">
      <span className="text-xl">🔇</span><span className="flex-1">{t('voice_banner')}</span><span className="text-accent">→</span>
    </button>
  );
}
