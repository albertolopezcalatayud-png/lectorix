import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import tts, { speakTracked, estimateSyllables } from '@/services/tts';
import { useI18n } from '@/i18n';
import { usePracticeLang } from '@/stores/useAppStore';
import { SyllableWord, useSyllableColoring } from './SyllableText';

// ── Text model ───────────────────────────────────────────
export interface Token { text: string; start: number; index: number }
export interface Sentence { text: string; tokens: Token[]; index: number }
export interface Paragraph { sentences: Sentence[] }

/** Splits a text into paragraphs → sentences → words (with char offsets per sentence) */
export function parseText(text: string): { paragraphs: Paragraph[]; sentences: Sentence[]; wordCount: number } {
  const sentences: Sentence[] = [];
  let wordIndex = 0;
  const paragraphs = text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => {
      const parts = p.match(/[^.!?…]+(?:[.!?…]+[»"”]?|$)/g) || [p];
      const ps: Sentence[] = parts
        .map((s) => s.trim())
        .filter(Boolean)
        .map((s) => {
          const tokens: Token[] = [];
          const re = /\S+/g;
          let m: RegExpExecArray | null;
          while ((m = re.exec(s))) tokens.push({ text: m[0], start: m.index, index: wordIndex++ });
          const sentence = { text: s, tokens, index: sentences.length };
          sentences.push(sentence);
          return sentence;
        });
      return { sentences: ps };
    });
  return { paragraphs, sentences, wordCount: wordIndex };
}

/** Estimated ms offsets (from the start of the sentence) at which each word begins */
function estimateOffsets(sentence: Sentence, rate: number): number[] {
  const sylMs = 1000 / (6 * rate); // ≈6 syllables/second at rate 1
  const offsets: number[] = [];
  let t = 0;
  for (const tok of sentence.tokens) {
    offsets.push(t);
    t += estimateSyllables(tok.text) * sylMs;
    if (/[,;:]$/.test(tok.text)) t += 250 / rate;
  }
  return offsets;
}

export const SPEEDS = [
  { key: 'read_slow', rate: 0.75 },
  { key: 'read_normal', rate: 0.92 },
  { key: 'read_fast', rate: 1.08 },
] as const;

interface Props {
  text: string;
  onFinishedListening?: () => void;
}

export function GuidedReader({ text, onFinishedListening }: Props) {
  const { t } = useI18n();
  const { paragraphs, sentences } = useMemo(() => parseText(text), [text]);
  const practiceLang = usePracticeLang();
  const sylLang = useSyllableColoring();

  const [playing, setPlaying] = useState(false);
  const [sentenceIdx, setSentenceIdx] = useState(0);
  const [wordIdx, setWordIdx] = useState<number | null>(null);
  const [rate, setRate] = useState(0.8);
  const [focus, setFocus] = useState(false);
  const [noVoice, setNoVoice] = useState(!tts.isAvailable());

  const playToken = useRef(0); // invalidates callbacks from stopped playback
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const wordRefs = useRef<Map<number, HTMLSpanElement>>(new Map());

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  const stop = useCallback(() => {
    playToken.current++;
    clearTimers();
    tts.stop();
    setPlaying(false);
  }, []);

  useEffect(() => () => stop(), [stop]);

  // Keep the current word in view
  useEffect(() => {
    if (wordIdx == null) return;
    const el = wordRefs.current.get(wordIdx);
    if (!el) return;
    const r = el.getBoundingClientRect();
    if (r.top < 120 || r.bottom > window.innerHeight - 160) {
      el.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
  }, [wordIdx]);

  const playFrom = useCallback(
    async (startSentence: number, speed: number) => {
      const token = ++playToken.current;
      clearTimers();
      setPlaying(true);

      for (let i = startSentence; i < sentences.length; i++) {
        if (token !== playToken.current) return;
        const s = sentences[i];
        setSentenceIdx(i);
        setWordIdx(s.tokens[0]?.index ?? null);

        let gotBoundary = false;
        const offsets = estimateOffsets(s, speed);
        const startEstimates = () => {
          clearTimers();
          s.tokens.forEach((tok, k) => {
            timers.current.push(
              setTimeout(() => {
                if (token === playToken.current && !gotBoundary) setWordIdx(tok.index);
              }, offsets[k]),
            );
          });
        };

        const res = await speakTracked(s.text, {
          rate: speed,
          onStart: startEstimates,
          onWord: (charIndex) => {
            if (token !== playToken.current) return;
            if (!gotBoundary) {
              gotBoundary = true;
              clearTimers(); // the engine reports real word positions: stop estimating
            }
            let current = s.tokens[0];
            for (const tok of s.tokens) if (tok.start <= charIndex) current = tok;
            setWordIdx(current.index);
          },
        });

        clearTimers();
        if (token !== playToken.current) return;
        if (!res.ok) {
          setNoVoice(true);
          setPlaying(false);
          return;
        }
        // short breath between sentences
        await new Promise((r) => setTimeout(r, 180));
      }

      if (token !== playToken.current) return;
      setPlaying(false);
      setWordIdx(null);
      setSentenceIdx(0);
      onFinishedListening?.();
    },
    [sentences, onFinishedListening],
  );

  const togglePlay = () => {
    if (playing) stop();
    else void playFrom(sentenceIdx, rate);
  };

  const restart = () => {
    stop();
    setSentenceIdx(0);
    setWordIdx(null);
    void playFrom(0, rate);
  };

  const changeSpeed = (r: number) => {
    setRate(r);
    if (playing) void playFrom(sentenceIdx, r); // restart the current sentence at the new speed
  };

  const tapWord = (tok: Token, sentence: Sentence) => {
    stop();
    setSentenceIdx(sentence.index);
    setWordIdx(tok.index);
    const clean = tok.text.replace(/^[«"“(¿¡—-]+|[»"”).,;:!?…—-]+$/g, '');
    if (clean && !noVoice) void tts.speak(clean, { rate: 0.7 });
  };

  const active = playing || wordIdx != null;

  return (
    <div>
      {/* Controls — sticky so they stay reachable while scrolling */}
      <div className="sticky top-0 z-10 -mx-4 px-4 py-3 bg-bg/95 backdrop-blur border-b border-border mb-5">
        {noVoice ? (
          <p className="text-xs text-fg-muted text-center">⚠️ {t('read_no_voice')} <a href="#/voces" className="font-bold text-accent">{t('voice_fix_link')} →</a></p>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <button
                onClick={togglePlay}
                className={`flex-1 h-12 rounded-[14px] font-heading font-extrabold text-sm transition-colors ${
                  playing ? 'bg-accent-pale text-accent' : 'bg-accent text-white'
                }`}
              >
                {playing ? `⏸ ${t('read_pause')}` : `▶ ${t('read_play')}`}
              </button>
              <button
                onClick={restart}
                className="h-12 w-12 rounded-[14px] bg-bg-card border border-border text-lg"
                aria-label={t('read_restart')}
                title={t('read_restart')}
              >
                ⏮
              </button>
              <button
                onClick={() => setFocus((f) => !f)}
                aria-pressed={focus}
                className={`h-12 px-3 rounded-[14px] text-xs font-bold border transition-colors ${
                  focus ? 'bg-yellow-pale border-yellow/50 text-fg' : 'bg-bg-card border-border text-fg-muted'
                }`}
              >
                {t('read_focus')}
              </button>
            </div>
            <div className="flex gap-1.5 mt-2" role="radiogroup">
              {SPEEDS.map((s) => (
                <button
                  key={s.key}
                  role="radio"
                  aria-checked={rate === s.rate}
                  onClick={() => changeSpeed(s.rate)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    rate === s.rate ? 'bg-mint-pale text-mint' : 'bg-bg-card text-fg-muted border border-border'
                  }`}
                >
                  {t(s.key)}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-fg-muted text-center mt-2">👆 {t('read_tap_hint')}</p>
          </>
        )}
      </div>

      {/* Text */}
      <div
        className="text-xl reading-text space-y-5"
        style={{
          lineHeight: 'calc(var(--reading-leading) + 0.5)',
          letterSpacing: 'max(0.025em, var(--reading-tracking))',
          wordSpacing: 'max(0.18em, var(--reading-word-spacing))',
        }}
        lang={practiceLang === 'ca' ? 'ca-ES-valencia' : practiceLang === 'en' ? 'en-GB' : 'es'}
      >
        {paragraphs.map((p, pi) => (
          <p key={pi}>
            {p.sentences.map((s) => {
              const current = active && s.index === sentenceIdx;
              const dim = focus && active && !current;
              return (
                <span
                  key={s.index}
                  className={`rounded-lg transition-[background-color,opacity] duration-300 [box-decoration-break:clone] [-webkit-box-decoration-break:clone] ${
                    current ? 'bg-accent/15' : ''
                  } ${dim ? 'opacity-25' : ''}`}
                >
                  {s.tokens.map((tok) => (
                    <span key={tok.index}>
                      <span
                        ref={(el) => {
                          if (el) wordRefs.current.set(tok.index, el);
                          else wordRefs.current.delete(tok.index);
                        }}
                        onClick={() => tapWord(tok, s)}
                        className={`cursor-pointer rounded-md px-0.5 -mx-0.5 transition-colors duration-150 ${
                          tok.index === wordIdx ? 'bg-yellow text-[#2D2640]' : 'hover:bg-yellow-pale'
                        }`}
                      >
                        {sylLang ? <SyllableWord word={tok.text} lang={sylLang} /> : tok.text}
                      </span>{' '}
                    </span>
                  ))}
                </span>
              );
            })}
          </p>
        ))}
      </div>
    </div>
  );
}
