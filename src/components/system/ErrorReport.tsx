import { useState } from 'react';
import { readErrors, errorReport, clearErrors } from '@/services/errorLog';
import { Card } from '@/components/ui/Card';
import { useI18n } from '@/i18n';

/** Settings: the errors saved on this device, to copy or share with the developer */
export function ErrorReport() {
  const { t } = useI18n();
  const [count, setCount] = useState(() => readErrors().length);
  const [msg, setMsg] = useState('');
  const share = async () => {
    const text = errorReport();
    try {
      if (navigator.share) { await navigator.share({ title: 'Lectorix', text }); return; }
    } catch { /* cancelled: fall back to copying */ }
    try { await navigator.clipboard.writeText(text); setMsg(t('err_copied')); } catch { setMsg(text.slice(0, 300)); }
  };
  return (
    <Card>
      <h3 className="font-heading font-extrabold text-sm">🛠️ {t('err_report_title')}</h3>
      <p className="text-[11px] text-fg-muted mt-0.5 mb-3">{count ? t('err_report_desc', { n: count }) : t('err_report_none')}</p>
      {count > 0 && (
        <div className="flex gap-2">
          <button onClick={share} className="flex-1 py-2.5 rounded-xl bg-accent text-white font-bold text-sm">{t('err_copy')}</button>
          <button onClick={() => { clearErrors(); setCount(0); setMsg(''); }} className="px-4 py-2.5 rounded-xl bg-accent-pale text-accent font-bold text-sm">{t('err_clear')}</button>
        </div>
      )}
      {msg && <p className="text-[11px] text-fg-muted mt-2 break-words">{msg}</p>}
    </Card>
  );
}
