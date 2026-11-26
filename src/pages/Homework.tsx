import { useState, useRef, useMemo, useEffect } from 'react';
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
import { useShareInbox } from '@/native/share';
import { useI18n, dateLocale } from '@/i18n';
import { readPhoto as readPhotoText, type Crop, type OcrLang } from '@/services/ocr';
import { PhotoCrop } from '@/components/reading/PhotoCrop';

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


/** Adapt any text — typed, pasted or from a photo of a page — with the reading aids */
const OCR_REMOTE = 'https://albertolopezcalatayud-png.github.io/lectorix/tesseract/lang';

export default function Homework() {
  const navigate = useNavigate();
  const { t, language } = useI18n();
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
  const [ocrError, setOcrError] = useState<boolean | 'net'>(false);
  const [picked, setPicked] = useState<{ p: number; w: number; word: string } | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const [cropping, setCropping] = useState(false);
  const [ocrLang, setOcrLangState] = useState<OcrLang>(() => {
    try { const v = localStorage.getItem('lectorix-ocr-lang'); if (v === 'es' || v === 'ca' || v === 'en') return v; } catch { /* private mode */ }
    return lang as OcrLang;
  });
  const setOcrLang = (l: OcrLang) => { setOcrLangState(l); try { localStorage.setItem('lectorix-ocr-lang', l); } catch { /* private mode */ } };
  const pickPhoto = (f: File) => { setOcrError(false); setPhoto(f); setCropping(true); };

  const showToast = (m: string) => {
    setToast(m);
    setTimeout(() => setToast(null), 1800);
  };

  const readPhoto = async (file: File, crop?: Crop) => {
    setCropping(false);
    setOcrError(false);
    setOcr({ progress: 0, status: t('hw_ocr_loading') });
    try {
      const base = `${import.meta.env.BASE_URL}tesseract/`;
      // The Android app does not carry the reading data of the three languages (about 6 MB):
      // the first photo in a language downloads it from the Lectorix website and it is kept
      // on the device for the next times. No photo or text leaves the device.
      const text = await readPhotoText(file, ocrLang, {
        crop, workerPath: `${base}worker.min.js`, corePath: base, langPath: isNativeApp ? OCR_REMOTE : `${base}lang`,
        progress: (p) => setOcr({ progress: p, status: t('hw_ocr_reading') }),
      });
      if (text) setDraft((d) => (d ? d + '\n\n' : '') + text);
      else setOcrError(true);
      setOcr(null);
    } catch {
      setOcr(null);
      setOcrError(isNativeApp && !navigator.onLine ? 'net' : true);
    }
  };

  // Content shared from another app ("Share with Lectorix")
  const sharedItem = useShareInbox((s) => s.item);
  useEffect(() => {
    if (!sharedItem) return;
    const item = useShareInbox.getState().take();
    if (!item) return;
    setView(null);
    if (item.kind === 'text') {
      const text = item.text.trim();
      const first = text.split(/\s+/).slice(0, 6).join(' ');
      const saved: SavedText = { id: `${Date.now()}`, title: first.length > 40 ? first.slice(0, 40) + '…' : first, text, lang, date: new Date().toISOString() };
      save(saved);
      setView(saved);
    } else if (item.kind === 'image') {
      void fetch(item.dataUrl).then((r) => r.blob()).then((b) => pickPhoto(new File([b], 'shared', { type: b.type })));
    } else {
      setOcrError(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sharedItem]);

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
        <div className="px-4 py-4 max-w-lg wmd:max-w-2xl mx-auto space-y-3">
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
          <Button fullWidth variant="secondary" onClick={() => { tts.stop(); navigate('/enunciados', { state: { text: view.text, lang: view.lang } }); }}>🧩 {t('ev_cta')}</Button>
          <Button variant="secondary" fullWidth onClick={() => { tts.stop(); setView(null); setPicked(null); }}>{t('hw_new')}</Button>
        </div>

        <AnimatePresence>
          {picked && (
            <motion.div initial={{ y: 80 }} animate={{ y: 0 }} exit={{ y: 80 }}
              className="fixed bottom-20 wlg:bottom-6 left-0 wlg:left-60 right-0 z-40 px-4">
              <div className="max-w-lg wmd:max-w-2xl mx-auto bg-bg-card border border-border rounded-2xl shadow-lg p-3 flex items-center gap-2">
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
      <div className="px-4 py-5 max-w-lg wmd:max-w-2xl mx-auto space-y-4">
        <p className="text-sm text-fg-muted">{t('hw_desc')}</p>
        {isNativeApp && <p className="text-xs text-fg-muted">📤 {t('hw_share_tip')}</p>}

        <Card className="space-y-3">
          <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) pickPhoto(f); e.target.value = ''; }} />
          <div className="flex items-center gap-2 flex-wrap" role="radiogroup" aria-label={t('hw_text_lang')}>
            <span className="text-sm font-bold">{t('hw_text_lang')}:</span>
            {(['es', 'ca', 'en'] as OcrLang[]).map((l) => (
              <button key={l} type="button" role="radio" aria-checked={ocrLang === l} onClick={() => setOcrLang(l)} data-testid={`ocr-lang-${l}`}
                className={`px-3 py-1.5 rounded-full text-xs font-bold border ${ocrLang === l ? 'bg-accent-pale border-accent text-accent' : 'bg-bg-card border-border'}`}>
                {l === 'es' ? 'Castellano' : l === 'ca' ? 'Valencià' : 'English'}
              </button>
            ))}
          </div>
          {cropping && photo ? (
            <PhotoCrop file={photo} title={t('hw_crop_title')} help={t('hw_crop_help')} readLabel={t('hw_crop_read')} allLabel={t('hw_crop_all')}
              cancelLabel={t('cancel')} onRead={(c) => void readPhoto(photo, c)} onCancel={() => { setCropping(false); setPhoto(null); }} />
          ) : (
            <>
              <Button fullWidth variant="secondary" onClick={() => fileRef.current?.click()} disabled={!!ocr}>
                📷 {t('hw_photo')}
              </Button>
              {photo && !ocr && (
                <Button fullWidth variant="secondary" onClick={() => setCropping(true)}>➕ {t('hw_crop_more')}</Button>
              )}
              <p className="text-[11px] text-fg-muted">💡 {t('hw_ocr_tip')}</p>
            </>
          )}
          {ocr && (
            <div>
              <p className="text-xs text-fg-muted mb-1">{ocr.status}</p>
              <div className="h-2 rounded-full bg-border overflow-hidden">
                <div className="h-full bg-accent transition-all" style={{ width: `${Math.round(ocr.progress * 100)}%` }} />
              </div>
            </div>
          )}
          {ocrError && <p className="text-xs text-red">{t(ocrError === 'net' ? 'hw_ocr_net' : 'hw_ocr_error')}</p>}
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
                      <p className="text-[10px] text-fg-muted">{new Date(x.date).toLocaleDateString(dateLocale(language))}</p>
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
