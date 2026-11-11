import { useState, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore, usePracticeLang } from '@/stores/useAppStore';
import { useReviewStore } from '@/services/review';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SyllableWord, useSyllableColoring } from '@/components/reading/SyllableText';
import tts from '@/services/tts';
import { isNativeApp } from '@/native/app';
import { useI18n } from '@/i18n';

interface SavedText { id: string; title: string; text: string; lang: string; date: string }

const useHomeworkStore = create<{ texts: SavedText[]; save: (t: SavedText) => void; remove: (id: string) => void }>()(
  persist(
    (set) => ({
      texts: [],
      save: (t) => set((s) => ({ texts: [t, ...s.texts.filter((x) => x.id !== t.id)].slice(0, 12) })),
      remove: (id) => set((s) => ({ texts: s.texts.filter((x) => x.id !== id) })),
    }),
    { name: 'lectorix-homework' }
  )
);

const OCR_LANG = { es: 'spa', ca: 'cat', en: 'eng' } as const;

/** Adapt any text — typed, pasted or from a photo of a page — with the reading aids */
export default function Homework() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const lang = usePracticeLang();
  const sylLang = useSyllableColoring();
  const { texts, save, remove } = useHomeworkStore();
  const addWord = useReviewStore((s) => s.addWord);
  const syllableColors = useAppStore((s) => s.syllableColors);
  const setSyllableColors = useAppStore((s) => s.setSyllableColors);
  const letterSpacing = useAppStore((s) => s.letterSpacing);
  const setLetterSpacing = useAppStore((s) => s.setLetterSpacing);
  const readingRuler = useAppStore((s) => s.readingRuler);
  const setReadingRuler = useAppStore((s) => s.setReadingRuler);

  const [draft, setDraft] = useState('');
  const [view, setView] = useState<SavedText | null>(null);
  const [ocr, setOcr] = useState<{ progress: number; status: string } | null>(null);
  const [ocrError, setOcrError] = useState(false);
  const [picked, setPicked] = useState<{ p: number; w: number; word: string } | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const showToast = (m: string) => {
    setToast(m);
    setTimeout(() => setToast(null), 1800);
  };

  const readPhoto = async (file: File) => {
    setOcrError(false);
    setOcr({ progress: 0, status: t('hw_ocr_loading') });
    try {
      const { createWorker } = await import('tesseract.js');
      const base = `${import.meta.env.BASE_URL}tesseract/`;
      const worker = await createWorker(OCR_LANG[lang], 1, {
        workerPath: `${base}worker.min.js`,
        corePath: base,
        langPath: `${base}lang`,
        workerBlobURL: false,
        // Android packaging renames .gz assets, so the app ships the language data uncompressed
        gzip: !isNativeApp,
        logger: (m: { status: string; progress: number }) => {
          if (m.status === 'recognizing text') setOcr({ progress: m.progress, status: t('hw_ocr_reading') });
        },
      });
      const { data } = await worker.recognize(file);
      await worker.terminate();
      // join lines broken mid-paragraph, keep paragraph breaks, undo end-of-line hyphenation
      const text = data.text
        .replace(/-\n(\p{Ll})/gu, '$1')
        .replace(/([^\n])\n(?!\n)/g, '$1 ')
        .replace(/[ \t]+/g, ' ')
        .trim();
      setDraft((d) => (d ? d + '\n\n' : '') + text);
      setOcr(null);
    } catch {
      setOcr(null);
      setOcrError(true);
    }
  };

  const adapt = () => {
    const text = draft.trim();
    if (!text) return;
    const first = text.split(/\s+/).slice(0, 6).join(' ');
    const item: SavedText = { id: `${Date.now()}`, title: first.length > 40 ? first.slice(0, 40) + '…' : first, text, lang, date: new Date().toISOString() };
    save(item);
    setView(item);
    setDraft('');
  };

  const paragraphs = useMemo(
    () => (view ? view.text.split(/\n{2,}|\n/).map((p) => p.split(/\s+/).filter(Boolean)).filter((p) => p.length) : []),
    [view],
  );

  if (view) {
    return (
      <div className="min-h-screen pb-28">
        <Header title={t('hw_title')} showBack />
        <div className="px-4 py-4 max-w-lg mx-auto space-y-3">
          {/* quick aids */}
          <div className="flex gap-1.5 flex-wrap">
            <button onClick={() => tts.speak(view.text)} className="px-3 py-1.5 rounded-full bg-accent text-white text-xs font-bold">🔊 {t('hw_listen_all')}</button>
            <button onClick={() => tts.stop()} className="px-3 py-1.5 rounded-full bg-bg-card border border-border text-xs font-bold">⏹</button>
            {lang !== 'en' && (
              <button onClick={() => setSyllableColors(!syllableColors)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold border ${syllableColors ? 'bg-accent-pale border-accent text-accent' : 'bg-bg-card border-border'}`}>
                🌈 {t('aid_syllables')}
              </button>
            )}
            <button onClick={() => setLetterSpacing(letterSpacing === 'normal' ? 'wide' : letterSpacing === 'wide' ? 'wider' : 'normal')}
              className="px-3 py-1.5 rounded-full text-xs font-bold border bg-bg-card border-border">
              ↔ {t('aid_letter_spacing')}
            </button>
            <button onClick={() => setReadingRuler(!readingRuler)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold border ${readingRuler ? 'bg-accent-pale border-accent text-accent' : 'bg-bg-card border-border'}`}>
              📏 {t('aid_ruler')}
            </button>
          </div>
          <p className="text-[11px] text-fg-muted">{t('hw_tap_word')}</p>

          <Card>
            <div className="text-xl reading-text space-y-4" style={{ lineHeight: 'calc(var(--reading-leading) + 0.5)' }}
              lang={lang === 'ca' ? 'ca-ES-valencia' : lang === 'en' ? 'en-GB' : 'es'}>
              {paragraphs.map((words, p) => (
                <p key={p}>
                  {words.map((w, i) => (
                    <span key={i}>
                      <span
                        onClick={() => { setPicked({ p, w: i, word: w }); void tts.speak(w.replace(/[^\p{L}\p{N}'’·-]/gu, '')); }}
                        className={`cursor-pointer rounded px-0.5 ${picked && picked.p === p && picked.w === i ? 'bg-yellow/60' : ''}`}
                      >
                        {sylLang ? <SyllableWord word={w} lang={sylLang} /> : w}
                      </span>{' '}
                    </span>
                  ))}
                </p>
              ))}
            </div>
          </Card>
          <Button fullWidth onClick={() => { tts.stop(); navigate('/estudiar', { state: { text: view.text, lang: view.lang, title: view.title } }); }}>🎓 {t('st_cta')}</Button>
          <Button variant="secondary" fullWidth onClick={() => { tts.stop(); setView(null); setPicked(null); }}>{t('hw_new')}</Button>
        </div>

        <AnimatePresence>
          {picked && (
            <motion.div initial={{ y: 80 }} animate={{ y: 0 }} exit={{ y: 80 }}
              className="fixed bottom-20 left-0 right-0 z-40 px-4">
              <div className="max-w-lg mx-auto bg-bg-card border border-border rounded-2xl shadow-lg p-3 flex items-center gap-2">
                <span className="font-heading font-extrabold text-lg flex-1 truncate">{picked.word.replace(/[^\p{L}\p{N}'’·-]/gu, '')}</span>
                <button onClick={() => tts.speak(picked.word.replace(/[^\p{L}\p{N}'’·-]/gu, ''))} className="w-9 h-9 rounded-xl bg-accent-pale text-accent">🔊</button>
                <button
                  onClick={() => {
                    const ok = addWord(picked.word.replace(/[^\p{L}\p{N}'’·-]/gu, ''), lang);
                    showToast(ok ? t('hw_word_added') : t('hw_word_already'));
                    setPicked(null);
                  }}
                  className="px-3 h-9 rounded-xl bg-accent text-white text-xs font-bold"
                >
                  📒 {t('hw_add_word')}
                </button>
                <button onClick={() => setPicked(null)} className="w-9 h-9 rounded-xl bg-bg border border-border text-sm" aria-label={t('back')}>✕</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        {toast && <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-fg text-bg text-xs font-bold px-3 py-2 rounded-full">{toast}</div>}
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24">
      <Header title={t('hw_title')} showBack />
      <div className="px-4 py-5 max-w-lg mx-auto space-y-4">
        <p className="text-sm text-fg-muted">{t('hw_desc')}</p>

        <Card className="space-y-3">
          <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) void readPhoto(f); e.target.value = ''; }} />
          <Button fullWidth variant="secondary" onClick={() => fileRef.current?.click()} disabled={!!ocr}>
            📷 {t('hw_photo')}
          </Button>
          {ocr && (
            <div>
              <p className="text-xs text-fg-muted mb-1">{ocr.status}</p>
              <div className="h-2 rounded-full bg-border overflow-hidden">
                <div className="h-full bg-accent transition-all" style={{ width: `${Math.round(ocr.progress * 100)}%` }} />
              </div>
            </div>
          )}
          {ocrError && <p className="text-xs text-red">{t('hw_ocr_error')}</p>}
          <p className="text-[10px] text-fg-muted">🔒 {t('hw_photo_privacy')}</p>
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={8}
            placeholder={t('hw_placeholder')}
            className="w-full rounded-xl border border-border bg-bg p-3 text-sm"
            lang={lang === 'ca' ? 'ca' : lang}
          />
          {draft && <p className="text-[11px] text-fg-muted">✏️ {t('hw_check_text')}</p>}
          <Button fullWidth onClick={adapt} disabled={!draft.trim()}>✨ {t('hw_adapt')}</Button>
        </Card>

        {texts.length > 0 && (
          <div>
            <h3 className="font-heading font-extrabold text-sm mb-2">{t('hw_saved')}</h3>
            <div className="space-y-2">
              {texts.map((x) => (
                <Card key={x.id} hover onClick={() => setView(x)}>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">📄</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate">{x.title}</p>
                      <p className="text-[10px] text-fg-muted">{new Date(x.date).toLocaleDateString()}</p>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); remove(x.id); }} className="text-xs text-fg-muted px-2" aria-label={t('hw_delete')}>🗑</button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
