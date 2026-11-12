import { useEffect, useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import tts from '@/services/tts';
import { isNative, nativeRecheck, nativeOpenInstall } from '@/services/nativeTts';
import { useI18n } from '@/i18n';

const LANGS = [
  { id: 'ca', tag: 'ca-ES', flag: '🟨', key: 'wl_lang_ca', sample: { es: 'Hola, sóc la veu en valencià.', ca: 'Hola, sóc la veu en valencià.', en: 'Hola, sóc la veu en valencià.' } },
  { id: 'es', tag: 'es-ES', flag: '🟥', key: 'wl_lang_es', sample: { es: 'Hola, soy la voz en castellano.', ca: 'Hola, soy la voz en castellano.', en: 'Hola, soy la voz en castellano.' } },
  { id: 'en', tag: 'en-GB', flag: '🟦', key: 'wl_lang_en', sample: { es: 'Hello, I am the English voice.', ca: 'Hello, I am the English voice.', en: 'Hello, I am the English voice.' } },
] as const;

type Platform = 'android' | 'ios' | 'windows' | 'mac' | 'other';
function platform(): Platform {
  const ua = navigator.userAgent;
  if (isNative || /Android/i.test(ua)) return 'android';
  if (/iPhone|iPad|iPod/i.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)) return 'ios';
  if (/Windows/i.test(ua)) return 'windows';
  if (/Macintosh/i.test(ua)) return 'mac';
  return 'other';
}

/** Which reading voices this device has, and how to install the missing ones (Valencian is often missing) */
export default function Voices() {
  const { t, language } = useI18n();
  const [state, setState] = useState<Record<string, boolean | null>>({ ca: null, es: null, en: null });
  const [checking, setChecking] = useState(false);
  const pf = platform();

  const check = async () => {
    setChecking(true);
    const res = await Promise.all(LANGS.map((l) => (isNative ? nativeRecheck(l.tag) : tts.canSpeak(l.tag))));
    setState(Object.fromEntries(LANGS.map((l, i) => [l.id, res[i]])));
    setChecking(false);
  };
  useEffect(() => { void check(); }, []);
  // Coming back from the phone's settings: check again
  useEffect(() => {
    const onVis = () => { if (document.visibilityState === 'visible') void check(); };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  const missing = LANGS.filter((l) => state[l.id] === false);
  const steps: string[] = (t(`voice_steps_${pf}`) as string).split('|');

  return (
    <div className="min-h-screen pb-28">
      <Header title={t('voice_title')} showBack />
      <div className="px-4 py-4 max-w-lg mx-auto space-y-3">
        <p className="text-sm text-fg-muted">{t('voice_intro')}</p>
        <Card>
          <ul className="space-y-2">
            {LANGS.map((l) => (
              <li key={l.id} className="flex items-center gap-3">
                <span className="text-lg">{state[l.id] === null ? '⏳' : state[l.id] ? '✅' : '⚠️'}</span>
                <span className="flex-1 text-sm font-bold">{t(l.key)}</span>
                {state[l.id] ? (
                  <button onClick={() => void tts.speakIn(l.sample[language as 'es'], l.tag, 0.9)} className="px-3 py-1.5 rounded-xl bg-accent-pale text-xs font-bold">🔊 {t('voice_test')}</button>
                ) : state[l.id] === false ? <span className="text-xs text-fg-muted">{t('voice_missing')}</span> : null}
              </li>
            ))}
          </ul>
          <Button variant="secondary" size="sm" fullWidth className="mt-3" disabled={checking} onClick={() => void check()}>🔄 {t('voice_recheck')}</Button>
        </Card>

        {missing.length > 0 && (
          <Card className="bg-yellow-pale/40">
            <h3 className="font-heading font-extrabold text-sm mb-1">🛠️ {t('voice_how_title')}</h3>
            <p className="text-xs text-fg-muted mb-2">{t(`voice_device_${pf}`)}</p>
            <ol className="list-decimal pl-5 space-y-1.5">
              {steps.map((s) => <li key={s} className="text-sm leading-snug">{s.replace('{lang}', missing.map((m) => t(`voice_engine_name_${m.id}`)).join(', '))}</li>)}
            </ol>
            {isNative && (
              <Button fullWidth className="mt-3" onClick={() => void nativeOpenInstall()}>⚙️ {t('voice_open_android')}</Button>
            )}
            <p className="text-[11px] text-fg-muted mt-3">{t('voice_names_vary')}</p>
          </Card>
        )}

        {state.ca === true && <p className="text-[11px] text-fg-muted">ℹ️ {t('voice_ca_note')}</p>}
        {missing.length === 0 && !checking && state.ca !== null && <p className="text-sm text-center font-bold">🌟 {t('voice_all_ok')}</p>}
      </div>
    </div>
  );
}
