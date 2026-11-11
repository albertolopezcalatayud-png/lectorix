import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { usePracticeLang } from '@/stores/useAppStore';
import { availability, installLanguage, useReadAloud, type Availability } from '@/services/readAloud';
import { useI18n } from '@/i18n';

/** Family switch for the optional read-aloud check (off by default) */
export function ReadAloudSetting() {
  const { t } = useI18n();
  const lang = usePracticeLang();
  const { enabled, setEnabled } = useReadAloud();
  const [avail, setAvail] = useState<Availability | 'unchecked' | null>(null);
  useEffect(() => { let off = false; void availability(lang).then((a) => { if (!off) setAvail(a); }); return () => { off = true; }; }, [lang]);

  return (
    <Card>
      <div className="flex items-start gap-3">
        <span className="text-2xl">🎤</span>
        <div className="flex-1">
          <h3 className="font-heading font-extrabold text-sm">{t('ra_family_title')}</h3>
          <p className="text-xs text-fg-muted mt-1 leading-snug">{t('ra_family_desc')}</p>
        </div>
        <button role="switch" aria-checked={enabled} aria-label={t('ra_family_title')} disabled={avail !== 'available' && !enabled}
          onClick={() => setEnabled(!enabled)}
          className={`w-12 h-7 rounded-full relative shrink-0 transition-colors disabled:opacity-40 ${enabled ? 'bg-accent' : 'bg-border'}`}>
          <span className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all ${enabled ? 'left-6' : 'left-1'}`} />
        </button>
      </div>
      <p className="text-[11px] mt-2 font-bold">
        {avail === null ? '…' : avail === 'unchecked' ? `🔍 ${t('ra_unchecked')}` : avail === 'available' ? `✅ ${t('ra_status_ok')}` : avail === 'unavailable' ? `ℹ️ ${t('ra_unavailable')}` : avail === 'downloading' ? `⏳ ${t('ra_downloading')}` : `⬇️ ${t('ra_downloadable')}`}
      </p>
      {avail === 'unchecked' && (
        <button onClick={() => { setAvail(null); void availability(lang, true).then(setAvail); }} className="mt-2 px-3 py-1.5 rounded-xl bg-accent text-white text-xs font-bold">{t('ra_check')}</button>
      )}
      {avail === 'downloadable' && (
        <button onClick={() => void installLanguage(lang).then(() => availability(lang, true)).then(setAvail)} className="mt-2 text-xs font-bold text-accent">{t('ra_download')}</button>
      )}
      {enabled && <p className="text-[11px] text-fg-muted mt-2">{t('ra_family_where')}</p>}
    </Card>
  );
}
