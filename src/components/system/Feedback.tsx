import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { readErrors, APP_VERSION } from '@/services/errorLog';
import { isNativeApp } from '@/native/app';
import { useAppStore, usePracticeLang } from '@/stores/useAppStore';
import { useI18n } from '@/i18n';

const TO = 'inorderwords@gmail.com';

/** "Send a suggestion": opens an e-mail with a short technical summary. No student data is included. */
export function Feedback() {
  const { t, language } = useI18n();
  const practice = usePracticeLang();
  const theme = useAppStore((s) => s.theme);
  const [kind, setKind] = useState<'bug' | 'idea' | 'content'>('bug');

  const send = () => {
    const errs = readErrors().slice(0, 3).map((e) => `- ${e.at.slice(0, 16)} ${e.route}: ${e.message.slice(0, 160)}`);
    const tech = [
      `Lectorix ${APP_VERSION} · ${isNativeApp ? 'Android app' : 'web'}`,
      navigator.userAgent.slice(0, 180),
      `${t('fb_screen')}: ${window.screen.width}×${window.screen.height} · ${t('fb_langs')}: ${language}/${practice} · ${theme}`,
      errs.length ? `${t('fb_errors')}:\n${errs.join('\n')}` : `${t('fb_errors')}: 0`,
    ].join('\n');
    const subject = `Lectorix ${APP_VERSION} · ${t(`fb_kind_${kind}`)}`;
    const body = `${t(`fb_prompt_${kind}`)}\n\n\n\n---\n${t('fb_tech')}\n${tech}`;
    window.location.href = `mailto:${TO}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body.slice(0, 1800))}`;
  };

  return (
    <Card>
      <h3 className="font-heading font-extrabold text-sm">💬 {t('fb_title')}</h3>
      <p className="text-[11px] text-fg-muted mt-0.5 mb-3">{t('fb_desc')}</p>
      <div className="flex flex-wrap gap-1.5 mb-3" role="group" aria-label={t('fb_title')}>
        {(['bug', 'idea', 'content'] as const).map((k) => (
          <button key={k} onClick={() => setKind(k)} aria-pressed={kind === k}
            className={`px-3 py-1.5 rounded-full text-xs font-bold border ${kind === k ? 'bg-accent text-white border-accent' : 'bg-bg border-border'}`}>
            {t(`fb_kind_${k}`)}
          </button>
        ))}
      </div>
      <button onClick={send} className="w-full py-2.5 rounded-xl bg-accent text-white font-bold text-sm">✉️ {t('fb_send')}</button>
    </Card>
  );
}
