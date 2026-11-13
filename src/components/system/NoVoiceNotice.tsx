import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useI18n } from '@/i18n';

const NAME = { ca: 'novoice_ca', es: 'novoice_es', en: 'novoice_en' } as const;

/**
 * When a button tries to read aloud in a language the device has no voice for,
 * Lectorix stays silent instead of letting another language's voice read it,
 * and explains here how to install the voice (once per language and session).
 */
export function NoVoiceNotice() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();
  const [tag, setTag] = useState<string | null>(null);

  useEffect(() => {
    const on = (e: Event) => setTag((e as CustomEvent<{ tag: string }>).detail?.tag ?? null);
    window.addEventListener('lectorix:novoice', on);
    return () => window.removeEventListener('lectorix:novoice', on);
  }, []);
  useEffect(() => {
    if (!tag) return;
    const id = setTimeout(() => setTag(null), 12000);
    return () => clearTimeout(id);
  }, [tag]);

  const base = tag?.split('-')[0] ?? '';
  const show = !!tag && location.pathname !== '/voces';
  return (
    <AnimatePresence>
      {show && (
        <motion.div role="status" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
          className="fixed left-3 right-3 bottom-24 z-50 max-w-lg mx-auto sticky-note p-3 flex items-center gap-3 shadow-lg">
          <span className="text-2xl" aria-hidden>🔇</span>
          <p className="flex-1 text-sm font-bold leading-snug">{t(NAME[base as keyof typeof NAME] ?? 'novoice_ca')}</p>
          <button onClick={() => { setTag(null); navigate('/voces'); }} className="px-3 py-2 rounded-xl bg-accent text-white text-xs font-extrabold">{t('novoice_how')}</button>
          <button onClick={() => setTag(null)} aria-label={t('novoice_close')} className="text-fg-muted text-lg px-1">✕</button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
