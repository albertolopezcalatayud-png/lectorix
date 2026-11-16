import { useState } from 'react';
import { profiles, activeProfile, switchTo, pickerAnswered, hasPin, mode, type Profile } from '@/services/profiles';
import { PinPrompt } from './PinPrompt';
import { useI18n } from '@/i18n';

/**
 * "Who is going to practise?" Shown when the app opens on a device with several students.
 * With an adult PIN, an adult chooses (so a student cannot open someone else's space).
 */
export function ProfilePicker({ onDone, onZone }: { onDone: () => void; onZone: () => void }) {
  const { t } = useI18n();
  const list = profiles();
  const active = activeProfile();
  const [pending, setPending] = useState<Profile | 'manage' | null>(null);
  const [busy, setBusy] = useState(false);
  const enter = async (p: Profile | 'manage') => {
    if (p === 'manage') { onZone(); return; }
    if (p.id === active?.id) { pickerAnswered(); onDone(); return; }
    setBusy(true);
    try { await switchTo(p.id); } catch { setBusy(false); }
  };
  const choose = (p: Profile | 'manage') => { if (hasPin()) setPending(p); else void enter(p); };
  return (
    <div className="min-h-screen bg-bg text-fg px-4 py-8">
      <div className="max-w-lg wmd:max-w-3xl wlg:max-w-5xl mx-auto space-y-5">
        <h1 className="font-heading font-black text-2xl text-center">👋 {t('pf_who')}</h1>
        {hasPin() && list.length > 0 && <p className="text-sm text-fg-muted text-center">🔒 {t('pf_who_pin')}</p>}
        {list.length === 0 && <p className="text-sm text-center">{t('pf_none_yet')}</p>}
        <ul className="grid grid-cols-2 sm:grid-cols-3 wlg:grid-cols-4 wxl:grid-cols-5 gap-3">
          {list.map((p) => (
            <li key={p.id}>
              <button disabled={busy} onClick={() => choose(p)}
                className="w-full rounded-2xl border border-border bg-bg-card px-3 py-4 flex flex-col items-center gap-2 disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-accent">
                <span className="text-5xl" aria-hidden>{p.avatar}</span>
                <span className="font-heading font-extrabold text-base text-center break-words">{p.name || t('student_default')}</span>
              </button>
            </li>
          ))}
        </ul>
        <button disabled={busy} onClick={() => choose('manage')} className="block mx-auto rounded-xl border border-border bg-bg-card px-4 py-2.5 text-sm font-bold">🧑‍🏫 {t(mode() === 'group' ? 'pf_zone' : 'pf_manage')}</button>
      </div>
      {pending && <PinPrompt onCancel={() => setPending(null)} onOk={() => { const p = pending; setPending(null); void enter(p); }} />}
    </div>
  );
}
