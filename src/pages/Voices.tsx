import { useEffect, useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import tts from '@/services/tts';
import { isNative, nativeRecheck, nativeOpenInstall } from '@/services/nativeTts';
import { naturalVoiceEnabled, setNaturalVoiceEnabled } from '@/services/clips';
import { voicesFor, bestVoice, getPreferredVoice, setPreferredVoice, loadNativeVoices, voiceLabel, type VoiceInfo } from '@/services/voices';
import { useI18n } from '@/i18n';

const LANGS = [
  { id: 'ca', tag: 'ca-ES', flag: '🟨', key: 'wl_lang_ca', sample: { es: 'Hola, sóc la veu en valencià.', ca: 'Hola, sóc la veu en valencià.', en: 'Hola, sóc la veu en valencià.' } },
  { id: 'es', tag: 'es-ES', flag: '🟥', key: 'wl_lang_es', sample: { es: 'Hola, soy la voz en castellano.', ca: 'Hola, soy la voz en castellano.', en: 'Hola, soy la voz en castellano.' } },
  { id: 'en', tag: 'en-GB', flag: '🟦', key: 'wl_lang_en', sample: { es: 'Hello, I am the English voice.', ca: 'Hello, I am the English voice.', en: 'Hello, I am the English voice.' } },
] as const;

const SAMPLES = {
  es: 'Había una vez una niña que quería aprender a leer cuentos de dragones. Cada día leía un poquito más.',
  ca: 'Hi havia una vegada una xiqueta que volia aprendre a llegir contes de dracs. Cada dia llegia un poquet més.',
  en: 'Once upon a time, a girl wanted to learn to read stories about dragons. Every day, she read a little more.',
} as const;

/** The voices this device has for one language, most natural first; the family can choose one */
function VoicePicker({ tag, title, sample, refresh }: { tag: string; title: string; sample: string; refresh: boolean }) {
  const { t } = useI18n();
  const [list, setList] = useState<VoiceInfo[]>([]);
  const [chosen, setChosen] = useState<string | null>(null);
  useEffect(() => {
    const load = () => { setList(voicesFor(tag).slice(0, 6)); setChosen(bestVoice(tag)?.id ?? null); };
    load();
    if (!isNative && 'speechSynthesis' in window) { window.speechSynthesis.addEventListener?.('voiceschanged', load); return () => window.speechSynthesis.removeEventListener?.('voiceschanged', load); }
  }, [tag, refresh]);
  if (list.length < 2) return null;
  const recommended = list[0].id;
  const use = (v: VoiceInfo | null) => { setPreferredVoice(tag, v ? v.id : null); setChosen(v ? v.id : recommended); };
  const test = (v: VoiceInfo) => { const keep = getPreferredVoice(tag); setPreferredVoice(tag, v.id); void tts.speakIn(sample, tag, 0.92).finally(() => setPreferredVoice(tag, keep)); };
  return (
    <Card>
      <h3 className="font-heading font-extrabold text-sm">🎙️ {t('voice_choose_title', { lang: title })}</h3>
      <p className="text-xs text-fg-muted mb-2">{t('voice_choose_desc')}</p>
      <ul className="space-y-1.5">
        {list.map((v) => (
          <li key={v.id} className={`flex items-center gap-2 rounded-xl border px-2.5 py-2 ${chosen === v.id ? 'border-accent bg-accent-pale/50' : 'border-border'}`}>
            <span className="flex-1 min-w-0">
              <span className="block text-sm font-bold truncate">{voiceLabel(v)}</span>
              <span className="block text-[10px] text-fg-muted">
                {v.id === recommended ? `⭐ ${t('voice_recommended')}` : ''}{v.id === recommended && v.online ? ' · ' : ''}{v.online ? `🌐 ${t('voice_online')}` : ''}
              </span>
            </span>
            <button onClick={() => test(v)} className="px-2.5 py-1.5 rounded-lg bg-surface-alt text-xs font-bold" aria-label={`${t('voice_test')}: ${voiceLabel(v)}`}>🔊</button>
            <button onClick={() => use(v)} aria-pressed={chosen === v.id} className={`px-2.5 py-1.5 rounded-lg text-xs font-extrabold ${chosen === v.id ? 'bg-accent text-white' : 'bg-accent-pale text-accent'}`}>
              {chosen === v.id ? `✓ ${t('voice_in_use')}` : t('voice_use')}
            </button>
          </li>
        ))}
      </ul>
      {getPreferredVoice(tag) && <button onClick={() => use(null)} className="mt-2 text-xs font-bold text-accent">↺ {t('voice_auto')}</button>}
    </Card>
  );
}

/** Natural voices recorded for Lectorix (neural voices generated in advance for readings, dictations and exercises) */
function NaturalVoiceCard() {
  const { t } = useI18n();
  const [on, setOn] = useState(naturalVoiceEnabled());
  return (
    <Card className="flex items-start gap-3">
      <span className="text-2xl" aria-hidden>🎙️</span>
      <div className="flex-1">
        <h3 className="font-heading font-extrabold text-sm">{t('nv_title')}</h3>
        <p className="text-xs text-fg-muted">{t('nv_desc')}</p>
      </div>
      <button role="switch" aria-checked={on} aria-label={t('nv_title')} onClick={() => { setNaturalVoiceEnabled(!on); setOn(!on); }}
        className={`shrink-0 w-12 h-7 rounded-full relative transition-colors ${on ? 'bg-accent' : 'bg-border'}`}>
        <span className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all ${on ? 'left-6' : 'left-1'}`} />
      </button>
    </Card>
  );
}

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
    await loadNativeVoices(true);
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

        <NaturalVoiceCard />
        {LANGS.filter((l) => state[l.id]).map((l) => <VoicePicker key={l.id} tag={l.tag} title={t(l.key)} sample={SAMPLES[l.id]} refresh={checking} />)}

        {state.ca === true && <p className="text-[11px] text-fg-muted">ℹ️ {t('voice_ca_note')}</p>}
        {missing.length === 0 && !checking && state.ca !== null && <p className="text-sm text-center font-bold">🌟 {t('voice_all_ok')}</p>}
      </div>
    </div>
  );
}
