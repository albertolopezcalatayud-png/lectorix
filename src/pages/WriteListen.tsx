import { useEffect, useMemo, useRef, useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { usePracticeLang } from '@/stores/useAppStore';
import { useReviewStore, notebookWords } from '@/services/review';
import { loadDict, unknownWords, suggest, tokenize, type SpellLang, type Token } from '@/services/spell';
import tts, { speakTracked, setSpeechLang, getSpeechLang } from '@/services/tts';
import { useI18n } from '@/i18n';

const DRAFT_KEY = 'lectorix-write-draft';
const IGNORE_KEY = 'lectorix-write-ignore';
const TAG: Record<SpellLang, string> = { es: 'es-ES', ca: 'ca-ES', en: 'en-GB' };
const HTML_LANG: Record<SpellLang, string> = { es: 'es', ca: 'ca-ES-valencia', en: 'en-GB' };

const read = <T,>(k: string, fallback: T): T => { try { const v = localStorage.getItem(k); return v ? (JSON.parse(v) as T) : fallback; } catch { return fallback; } };
const write = (k: string, v: unknown) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* storage unavailable */ } };

/** "Write and listen": the student writes, hears what they wrote, and checks the words the dictionary does not know */
export default function WriteListen() {
  const { t } = useI18n();
  const practice = usePracticeLang() as SpellLang;
  const [lang, setLang] = useState<SpellLang>(() => read<{ lang?: SpellLang }>(DRAFT_KEY, {}).lang ?? practice);
  const [text, setText] = useState<string>(() => read<{ text?: string }>(DRAFT_KEY, {}).text ?? '');
  const [mode, setMode] = useState<'write' | 'check'>('write');
  const [dict, setDict] = useState<Awaited<ReturnType<typeof loadDict>> | null>(null);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const [ignore, setIgnore] = useState<Record<string, string[]>>(() => read(IGNORE_KEY, {}));
  const [open, setOpen] = useState<number | null>(null); // start of the word whose suggestions are shown
  const [fixed, setFixed] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [spoken, setSpoken] = useState<number | null>(null);
  const items = useReviewStore((s) => s.items);
  const area = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { write(DRAFT_KEY, { text, lang }); }, [text, lang]);
  useEffect(() => () => tts.stop(), []);
  useEffect(() => { setDict(null); setFailed(false); }, [lang]);

  const ignored = useMemo(() => new Set(ignore[lang] ?? []), [ignore, lang]);
  const common = useMemo(() => new Set(notebookWords(items, lang).map((i) => i.word!.toLocaleLowerCase())), [items, lang]);
  const tokens = useMemo(() => tokenize(text), [text]);
  const bad = useMemo(() => (dict && mode === 'check' ? unknownWords(dict, lang, text, ignored) : []), [dict, mode, lang, text, ignored]);
  const badStarts = useMemo(() => new Set(bad.map((b) => b.start)), [bad]);
  const openToken = open !== null ? tokens.find((x) => x.start === open && x.word) : undefined;
  const suggestions = useMemo(() => (dict && openToken ? suggest(dict, lang, openToken.text, common) : []), [dict, openToken, lang, common]);

  const check = async () => {
    tts.stop(); setSpeaking(false); setSpoken(null);
    setMode('check'); setOpen(null); setFixed(null);
    if (dict) return;
    setLoading(true);
    try { setDict(await loadDict(lang)); } catch { setFailed(true); }
    setLoading(false);
  };

  const listen = async () => {
    if (speaking) { tts.stop(); setSpeaking(false); setSpoken(null); return; }
    if (!text.trim()) return;
    const before = getSpeechLang();
    setSpeechLang(lang);
    setSpeaking(true);
    await speakTracked(text, { rate: 0.9, onWord: (i) => setSpoken(i) });
    setSpeechLang(before);
    setSpeaking(false); setSpoken(null);
  };

  const replace = (tok: Token, by: string) => {
    setText(text.slice(0, tok.start) + by + text.slice(tok.start + tok.text.length));
    setOpen(null); setFixed(by); setSaved(false);
  };
  const keep = (tok: Token) => {
    const next = { ...ignore, [lang]: [...new Set([...(ignore[lang] ?? []), tok.text.toLocaleLowerCase()])] };
    setIgnore(next); write(IGNORE_KEY, next); setOpen(null);
  };

  const wordCount = tokens.filter((x) => x.word).length;
  const spokenStart = spoken !== null ? [...tokens].reverse().find((x) => x.word && x.start <= spoken)?.start : undefined;

  return (
    <div className="min-h-screen pb-28">
      <Header title={t('wl_title')} showBack />
      <div className="px-4 py-4 max-w-lg mx-auto space-y-3">
        <div className="flex gap-1.5 justify-center" role="group" aria-label={t('wl_lang')}>
          {(['es', 'ca', 'en'] as SpellLang[]).map((l) => (
            <button key={l} onClick={() => { setLang(l); setMode('write'); }} aria-pressed={lang === l}
              className={`px-3 py-1.5 rounded-full text-xs font-bold border ${lang === l ? 'bg-accent text-white border-accent' : 'bg-bg-card border-border'}`}>
              {t(`wl_lang_${l}`)}
            </button>
          ))}
        </div>

        {mode === 'write' ? (
          <textarea ref={area} value={text} onChange={(e) => setText(e.target.value)} lang={HTML_LANG[lang]} spellCheck={false}
            placeholder={t('wl_placeholder')} aria-label={t('wl_placeholder')}
            className="w-full min-h-[14rem] p-4 rounded-2xl bg-bg-card border border-border text-lg reading-text focus:outline-none focus:border-accent"
            style={{ lineHeight: 'calc(var(--reading-leading) + 0.3)' }} />
        ) : (
          <Card>
            <div className="text-lg reading-text whitespace-pre-wrap" lang={HTML_LANG[lang]} style={{ lineHeight: 'calc(var(--reading-leading) + 0.5)' }}>
              {tokens.map((tok) => tok.word && badStarts.has(tok.start) ? (
                <button key={tok.start} onClick={() => { setOpen(open === tok.start ? null : tok.start); setFixed(null); }}
                  className={`underline decoration-wavy decoration-peach underline-offset-4 rounded px-0.5 ${open === tok.start ? 'bg-peach-pale' : ''}`}>
                  {tok.text}
                </button>
              ) : (
                <span key={tok.start} className={spokenStart === tok.start ? 'bg-yellow-pale rounded' : ''}>{tok.text}</span>
              ))}
            </div>
          </Card>
        )}

        {mode === 'check' && openToken && (
          <Card className="bg-peach-pale/40">
            <p className="text-sm font-bold mb-2">{t('wl_unknown', { word: openToken.text })}</p>
            {suggestions.length > 0 ? (
              <>
                <p className="text-xs text-fg-muted mb-2">{t('wl_maybe')}</p>
                <div className="flex flex-wrap gap-2 mb-3">
                  {suggestions.map((s) => (
                    <span key={s} className="inline-flex rounded-xl overflow-hidden border border-border bg-bg-card">
                      <button onClick={() => replace(openToken, s)} className="px-3 py-1.5 font-bold text-sm">{s}</button>
                      <button onClick={() => void tts.speakIn(s, TAG[lang], 0.8)} aria-label={t('wl_hear', { word: s })} className="px-2 border-l border-border">🔊</button>
                    </span>
                  ))}
                </div>
              </>
            ) : <p className="text-xs text-fg-muted mb-3">{t('wl_no_ideas')}</p>}
            <div className="flex flex-wrap gap-2">
              <button onClick={() => void tts.speakIn(openToken.text, TAG[lang], 0.8)} className="px-3 py-1.5 rounded-xl bg-bg-card border border-border text-xs font-bold">🔊 {t('wl_hear_mine')}</button>
              <button onClick={() => keep(openToken)} className="px-3 py-1.5 rounded-xl bg-bg-card border border-border text-xs font-bold">✔ {t('wl_keep')}</button>
            </div>
          </Card>
        )}

        {mode === 'check' && fixed && (
          <Card className="bg-mint-pale/40">
            <p className="text-sm font-bold mb-2">✅ {t('wl_fixed', { word: fixed })}</p>
            {!fixed.includes(' ') && (
              <button disabled={saved} onClick={() => { useReviewStore.getState().addWord(fixed, lang); setSaved(true); }}
                className="w-full py-2 rounded-xl bg-accent text-white font-bold text-sm disabled:opacity-60">
                {saved ? t('st_saved') : `📒 ${t('wl_save', { word: fixed })}`}
              </button>
            )}
          </Card>
        )}

        {mode === 'check' && dict && !openToken && !fixed && (
          <p className="text-sm text-center font-bold">{bad.length === 0 ? `🌟 ${t('wl_all_known')}` : t('wl_found', { n: bad.length })}</p>
        )}
        {loading && <p className="text-sm text-center text-fg-muted">{t('wl_loading')}</p>}
        {failed && <p className="text-sm text-center text-peach font-bold">{t('wl_failed')}</p>}

        <div className="grid grid-cols-2 gap-2">
          <Button onClick={() => void listen()} disabled={!text.trim()}>{speaking ? `⏹ ${t('wl_stop')}` : `🔊 ${t('wl_listen')}`}</Button>
          {mode === 'write'
            ? <Button variant="secondary" onClick={() => void check()} disabled={!text.trim()}>🔍 {t('wl_check')}</Button>
            : <Button variant="secondary" onClick={() => { setMode('write'); setOpen(null); setFixed(null); setTimeout(() => area.current?.focus(), 50); }}>✏️ {t('wl_edit')}</Button>}
        </div>
        {mode === 'write' && text && (
          <div className="flex justify-between text-xs text-fg-muted px-1">
            <span>{t('wl_words', { n: wordCount })}</span>
            <button onClick={() => setText('')} className="font-bold text-accent">{t('wl_clear')}</button>
          </div>
        )}
        <p className="text-[11px] text-fg-muted leading-snug">💡 {t('wl_tip')}</p>
        <p className="text-[11px] text-fg-muted leading-snug">{t('wl_note')}</p>
      </div>
    </div>
  );
}
