import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { checkPin } from '@/services/profiles';
import { useI18n } from '@/i18n';

/** Asks for the adult PIN. onOk runs when it is right; onCancel closes it. */
export function PinPrompt({ onOk, onCancel }: { onOk: () => void; onCancel: () => void }) {
  const { t } = useI18n();
  const [pin, setPin] = useState('');
  const [wrong, setWrong] = useState(false);
  const go = async () => { if (await checkPin(pin)) onOk(); else { setWrong(true); setPin(''); } };
  return (
    <div className="fixed inset-0 z-[70] bg-black/40 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="pin-title">
      <form className="bg-bg-card rounded-2xl p-5 w-full max-w-xs space-y-3 border border-border" onSubmit={(e) => { e.preventDefault(); void go(); }}>
        <h2 id="pin-title" className="font-heading font-black text-lg">🔒 {t('pf_pin_ask')}</h2>
        <input autoFocus type="password" inputMode="numeric" autoComplete="off" maxLength={8} value={pin} onChange={(e) => { setPin(e.target.value.replace(/\D/g, '')); setWrong(false); }}
          aria-label={t('pf_pin_label')} className="w-full rounded-xl border border-border bg-bg px-3 py-3 text-center text-2xl tracking-[0.4em]" />
        {wrong && <p className="text-sm font-bold text-red" role="alert">{t('pf_pin_wrong')}</p>}
        <div className="flex gap-2">
          <Button type="button" variant="secondary" fullWidth onClick={onCancel}>{t('pf_cancel')}</Button>
          <Button type="submit" fullWidth disabled={pin.length < 4}>{t('pf_enter')}</Button>
        </div>
      </form>
    </div>
  );
}
