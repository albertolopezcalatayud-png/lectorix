import { useState } from 'react';
import { useAppStore, usePracticeLang } from '@/stores/useAppStore';
import { useReviewStore, notebookWords } from '@/services/review';
import { weekStats, weeklySummaryLines, type Area } from '@/services/weekly';
import { MODULE_TEXT } from '@/data/modules';
import { HOME_TIPS } from '@/data/homeTips';
import { Card } from '@/components/ui/Card';
import { useI18n } from '@/i18n';

export function useWeeklyLines() {
  const { t } = useI18n();
  const history = useAppStore((s) => s.sessionHistory);
  const user = useAppStore((s) => s.user);
  const lang = usePracticeLang();
  const items = useReviewStore((s) => s.items);
  const words = notebookWords(items, lang)
    .filter((w) => !w.mastered)
    .sort((a, b) => b.misses - a.misses)
    .slice(0, 5)
    .map((w) => w.word!);
  const name = user?.display_name || t('parent_student');
  const areaName = (a: Area) => t(MODULE_TEXT[a].name);
  return weeklySummaryLines(t, name, history, words, areaName);
}

export function WeeklySummary() {
  const { t } = useI18n();
  const lines = useWeeklyLines();
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    const text = `📚 Lectorix · ${t('wk_title')}\n\n` + lines.map((l) => `• ${l}`).join('\n');
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
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-heading font-extrabold text-sm">🗓️ {t('wk_title')}</h3>
        <button onClick={copy} className="text-xs font-bold text-accent px-2 py-1 rounded-lg bg-accent-pale">
          {copied ? `✓ ${t('wk_copied')}` : `📋 ${t('wk_copy')}`}
        </button>
      </div>
      <ul className="space-y-1.5 text-sm leading-relaxed">
        {lines.map((l, i) => <li key={i}>• {l}</li>)}
      </ul>
      <p className="text-[10px] text-fg-muted mt-3">{t('wk_local')}</p>
    </Card>
  );
}

export function HomeTips() {
  const { t, language } = useI18n();
  const history = useAppStore((s) => s.sessionHistory);
  const [showOther, setShowOther] = useState(false);
  const lang = (language === 'ca' || language === 'en' ? language : 'es') as 'es' | 'ca' | 'en';
  const w = weekStats(history, 0);
  const focus: Area | null = w.weakest?.area ?? null;
  const others = (Object.keys(MODULE_TEXT) as Area[]).filter((a) => a !== focus);

  const Tip = ({ icon, title, text }: { icon: string; title: string; text: string }) => (
    <div className="flex gap-3 py-2">
      <span className="text-2xl flex-shrink-0">{icon}</span>
      <div>
        <p className="font-bold text-sm">{title}</p>
        <p className="text-xs text-fg-muted leading-relaxed">{text}</p>
      </div>
    </div>
  );

  return (
    <Card className="border-mint/30 bg-mint-pale/10">
      <h3 className="font-heading font-extrabold text-sm mb-1">🏡 {t('tips_title')}</h3>
      {focus && (
        <div className="mt-2">
          <p className="text-xs font-bold text-accent">{t('tips_for', { area: t(MODULE_TEXT[focus].name) })}</p>
          {HOME_TIPS[focus].map((tip, i) => <Tip key={i} icon={tip.icon} title={tip.title[lang]} text={tip.text[lang]} />)}
        </div>
      )}
      <div className="mt-2">
        <p className="text-xs font-bold text-accent">{t('tips_general')}</p>
        {HOME_TIPS.general.map((tip, i) => <Tip key={i} icon={tip.icon} title={tip.title[lang]} text={tip.text[lang]} />)}
      </div>
      <button onClick={() => setShowOther(!showOther)} className="mt-2 text-xs font-bold text-accent">
        {showOther ? '▾' : '▸'} {t('tips_other')}
      </button>
      {showOther && others.map((a) => (
        <div key={a} className="mt-2">
          <p className="text-xs font-bold">{t(MODULE_TEXT[a].name)}</p>
          {HOME_TIPS[a].map((tip, i) => <Tip key={i} icon={tip.icon} title={tip.title[lang]} text={tip.text[lang]} />)}
        </div>
      ))}
    </Card>
  );
}
