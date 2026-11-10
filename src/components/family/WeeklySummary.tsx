import { useState, useEffect } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useAppStore, usePracticeLang } from '@/stores/useAppStore';
import { useReviewStore, notebookWords } from '@/services/review';
import { useFluencyStore } from '@/services/fluency';
import { weekStats, weeklySummaryLines, type Area } from '@/services/weekly';
import { MODULE_TEXT } from '@/data/modules';
import { HOME_TIPS } from '@/data/homeTips';
import { FAM_LANGS, FAM_STR, FAM_TIPS, famT, type FamLang } from '@/data/familyLangs';
import { Card } from '@/components/ui/Card';
import tts from '@/services/tts';
import { useI18n } from '@/i18n';

/** Language chosen for the family summary: 'ui' = same as the app */
export const useFamLang = create<{ lang: FamLang | 'ui'; set: (l: FamLang | 'ui') => void }>()(
  persist((set) => ({ lang: 'ui', set: (lang) => set({ lang }) }), { name: 'lectorix-famlang' }),
);

function useFamMeta() {
  const famLang = useFamLang((s) => s.lang);
  const { language } = useI18n();
  const meta = famLang === 'ui' ? null : FAM_LANGS.find((l) => l.id === famLang) ?? null;
  const bcp47 = meta ? meta.bcp47 : language === 'ca' ? 'ca-ES' : language === 'en' ? 'en-GB' : 'es-ES';
  return { famLang, meta, bcp47, dir: meta?.rtl ? 'rtl' as const : 'ltr' as const };
}

/** Speak a text in a given language with the device voice, if there is one */
function useSpeaker(bcp47: string) {
  const [hasVoice, setHasVoice] = useState(true);
  const [speaking, setSpeaking] = useState(false);
  useEffect(() => {
    let off = false;
    void tts.canSpeak(bcp47).then((ok) => { if (!off) setHasVoice(ok); });
    return () => { off = true; };
  }, [bcp47]);
  const speak = (text: string) => {
    setSpeaking(true);
    void tts.speakIn(text, bcp47).then(() => setSpeaking(false));
  };
  const stop = () => { tts.stop(); setSpeaking(false); };
  return { hasVoice, speaking, speak, stop };
}

export function useWeeklyLines(forceUi = false) {
  const { t } = useI18n();
  const famLang = useFamLang((s) => s.lang);
  const history = useAppStore((s) => s.sessionHistory);
  const user = useAppStore((s) => s.user);
  const lang = usePracticeLang();
  const items = useReviewStore((s) => s.items);
  const fluencyAll = useFluencyStore((s) => s.results);
  const words = notebookWords(items, lang)
    .filter((w) => !w.mastered)
    .sort((a, b) => b.misses - a.misses)
    .slice(0, 5)
    .map((w) => w.word!);
  const fluency = fluencyAll.filter((r) => r.lang === lang);
  if (famLang !== 'ui' && !forceUi) {
    const ft = famT(famLang);
    const name = user?.display_name || FAM_STR[famLang].student;
    return weeklySummaryLines(ft, name, history, words, (a: Area) => ft(`area_${a}`), fluency);
  }
  const name = user?.display_name || t('parent_student');
  return weeklySummaryLines(t, name, history, words, (a: Area) => t(MODULE_TEXT[a].name), fluency);
}

export function FamilyLanguagePicker() {
  const { t, language } = useI18n();
  const { lang, set } = useFamLang();
  return (
    <Card>
      <span className="text-xs font-bold block mb-2">🌍 {t('fam_lang_label')}</span>
      <div className="flex flex-wrap gap-1.5">
        <button onClick={() => set('ui')}
          className={`px-3 py-1.5 rounded-full text-xs font-bold border ${lang === 'ui' ? 'bg-accent text-white border-accent' : 'bg-bg border-border'}`}>
          {language === 'ca' ? 'Valencià' : language === 'en' ? 'English' : 'Español'}
        </button>
        {FAM_LANGS.map((l) => (
          <button key={l.id} onClick={() => set(l.id)} lang={l.bcp47}
            className={`px-3 py-1.5 rounded-full text-xs font-bold border ${lang === l.id ? 'bg-accent text-white border-accent' : 'bg-bg border-border'}`}>
            {l.label}
          </button>
        ))}
      </div>
      <p className="text-[10px] text-fg-muted mt-2">{t('fam_lang_note')}</p>
    </Card>
  );
}

export function WeeklySummary() {
  const { t } = useI18n();
  const lines = useWeeklyLines();
  const { famLang, meta, bcp47, dir } = useFamMeta();
  const { hasVoice, speaking, speak, stop } = useSpeaker(bcp47);
  const [copied, setCopied] = useState(false);
  const F = famLang !== 'ui' ? FAM_STR[famLang] : null;
  const title = F ? F.wk_title : t('wk_title');

  const copy = async () => {
    const text = `📚 Lectorix · ${title}\n\n` + lines.map((l) => `• ${l}`).join('\n') + (F ? `\n\n(${F.ai_note})` : '');
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard not available */
    }
  };

  return (
    <Card className="border-accent/30">
      <div className="flex items-center justify-between mb-2 gap-2">
        <h3 className="font-heading font-extrabold text-sm" dir={dir} lang={meta?.bcp47}>🗓️ {title}</h3>
        <button onClick={copy} className="text-xs font-bold text-accent px-2 py-1 rounded-lg bg-accent-pale flex-shrink-0">
          {copied ? `✓ ${t('wk_copied')}` : `📋 ${t('wk_copy')}`}
        </button>
      </div>
      <ul className="space-y-1.5 text-sm leading-relaxed" dir={dir} lang={meta?.bcp47}>
        {lines.map((l, i) => <li key={i}>• {l}</li>)}
      </ul>
      <div className="mt-3 flex items-center gap-2">
        {hasVoice ? (
          <button onClick={() => (speaking ? stop() : speak(lines.join(' ')))}
            className="text-xs font-bold px-3 py-1.5 rounded-full bg-accent text-white">
            {speaking ? `⏹ ${F ? F.stop : t('fam_stop')}` : `🔊 ${F ? F.listen : t('fam_listen')}`}
          </button>
        ) : (
          <span className="text-[10px] text-fg-muted">🔇 {t('fam_no_voice')}</span>
        )}
      </div>
      {F && <p className="text-[10px] text-fg-muted mt-2" dir={dir} lang={meta?.bcp47}>ℹ️ {F.ai_note}</p>}
      <p className="text-[10px] text-fg-muted mt-1">{t('wk_local')}</p>
    </Card>
  );
}

export function HomeTips() {
  const { t, language } = useI18n();
  const history = useAppStore((s) => s.sessionHistory);
  const { famLang, meta, bcp47, dir } = useFamMeta();
  const { hasVoice, speak } = useSpeaker(bcp47);
  const [showOther, setShowOther] = useState(false);
  const uiLang = (language === 'ca' || language === 'en' ? language : 'es') as 'es' | 'ca' | 'en';
  const F = famLang !== 'ui' ? FAM_STR[famLang] : null;
  const w = weekStats(history, 0);
  const focus: Area | null = w.weakest?.area ?? null;
  const areas = Object.keys(MODULE_TEXT) as Area[];
  const others = areas.filter((a) => a !== focus);

  const tipsOf = (a: Area | 'general') => {
    if (famLang !== 'ui') {
      return FAM_TIPS[famLang][a].map(([title, text], i) => ({ icon: HOME_TIPS[a][i]?.icon ?? '🌍', title, text }));
    }
    return HOME_TIPS[a].map((tip) => ({ icon: tip.icon, title: tip.title[uiLang], text: tip.text[uiLang] }));
  };
  const areaName = (a: Area) => (F ? F[`area_${a}`] : t(MODULE_TEXT[a].name));
  const L = (k: 'tips_title' | 'tips_general' | 'tips_other') => (F ? F[k] : t(k));

  const Tip = ({ icon, title, text }: { icon: string; title: string; text: string }) => (
    <div className="flex gap-3 py-2">
      <span className="text-2xl flex-shrink-0">{icon}</span>
      <div className="flex-1">
        <p className="font-bold text-sm">{title}</p>
        <p className="text-xs text-fg-muted leading-relaxed">{text}</p>
      </div>
      {hasVoice && (
        <button onClick={() => speak(`${title}. ${text}`)} className="w-8 h-8 flex-shrink-0 rounded-lg bg-accent-pale text-accent text-sm" aria-label={t('fam_listen')}>🔊</button>
      )}
    </div>
  );

  return (
    <Card className="border-mint/30 bg-mint-pale/10">
      <div dir={dir} lang={meta?.bcp47}>
        <h3 className="font-heading font-extrabold text-sm mb-1">🏡 {L('tips_title')}</h3>
        {focus && (
          <div className="mt-2">
            <p className="text-xs font-bold text-accent">{F ? F.tips_for.replace('{area}', areaName(focus)) : t('tips_for', { area: areaName(focus) })}</p>
            {tipsOf(focus).map((tip, i) => <Tip key={i} {...tip} />)}
          </div>
        )}
        <div className="mt-2">
          <p className="text-xs font-bold text-accent">{L('tips_general')}</p>
          {tipsOf('general').map((tip, i) => <Tip key={i} {...tip} />)}
        </div>
        <button onClick={() => setShowOther(!showOther)} className="mt-2 text-xs font-bold text-accent">
          {showOther ? '▾' : '▸'} {L('tips_other')}
        </button>
        {showOther && others.map((a) => (
          <div key={a} className="mt-2">
            <p className="text-xs font-bold">{areaName(a)}</p>
            {tipsOf(a).map((tip, i) => <Tip key={i} {...tip} />)}
          </div>
        ))}
        {F && <p className="text-[10px] text-fg-muted mt-2">ℹ️ {F.ai_note}</p>}
      </div>
    </Card>
  );
}
