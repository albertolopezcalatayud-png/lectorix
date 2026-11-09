import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Exercise } from '@/types';
import sounds from '@/services/sounds';
import tts from '@/services/tts';
import { useI18n } from '@/i18n';

interface WriteExerciseProps {
  exercise: Exercise;
  questionNumber: number;
  totalQuestions: number;
  onAnswer: (selectedIndex: number, isCorrect: boolean, timeMs: number) => void;
  examMode?: boolean;
}

// Keeps accents (they matter in a spelling app); ignores case, punctuation and extra spaces
function normalizeAnswer(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .normalize('NFC')
    .replace(/[.,;:!?¿¡"']/g, '')
    .replace(/\s+/g, ' ');
}

function stripAccents(str: string): string {
  // Keep ñ and ü distinctions out of scope: only strips acute accents
  return str.normalize('NFD').replace(/́/g, '').normalize('NFC');
}

type DiffWord = { text: string; ok: boolean };

/** Marks which typed words match the expected sentence (longest common subsequence) */
export function diffWords(typed: string, expected: string): { typed: DiffWord[]; missing: string[] } {
  const a = typed.trim().split(/\s+/).filter(Boolean);
  const b = expected.trim().split(/\s+/).filter(Boolean);
  const na = a.map(normalizeAnswer);
  const nb = b.map(normalizeAnswer);
  const dp: number[][] = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0));
  for (let i = a.length - 1; i >= 0; i--)
    for (let j = b.length - 1; j >= 0; j--)
      dp[i][j] = na[i] === nb[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
  const okA = new Set<number>();
  const okB = new Set<number>();
  for (let i = 0, j = 0; i < a.length && j < b.length; ) {
    if (na[i] === nb[j]) { okA.add(i); okB.add(j); i++; j++; }
    else if (dp[i + 1][j] >= dp[i][j + 1]) i++;
    else j++;
  }
  return {
    typed: a.map((text, i) => ({ text, ok: okA.has(i) })),
    missing: b.filter((_, j) => !okB.has(j)).map((w) => w.replace(/[.,;:!?¿¡"']/g, '')),
  };
}

export function WriteExercise({ exercise, questionNumber, totalQuestions, onAnswer, examMode }: WriteExerciseProps) {
  const [userInput, setUserInput] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isClose, setIsClose] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [startTime] = useState(Date.now());
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [diff, setDiff] = useState<{ typed: DiffWord[]; missing: string[] } | null>(null);
  const answerRef = useRef<{ correct: boolean; timeMs: number } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { t } = useI18n();

  // Dictation: the word is only heard, never shown
  const isDictation = !!exercise.word && /^escucha/i.test(exercise.prompt);
  const isSentence = (exercise.answer || '').trim().includes(' ');
  const dictationRate = isSentence ? 0.75 : 0.7;

  useEffect(() => {
    // Focus input on mount
    const focusTimer = setTimeout(() => inputRef.current?.focus(), 300);
    // Auto-play the word in dictation exercises
    let playTimer: ReturnType<typeof setTimeout> | undefined;
    if (isDictation && tts.isAvailable()) {
      playTimer = setTimeout(async () => {
        setIsSpeaking(true);
        try { await tts.speak(exercise.word!, { rate: dictationRate }); } finally { setIsSpeaking(false); }
      }, 500);
    }
    return () => { clearTimeout(focusTimer); if (playTimer) clearTimeout(playTimer); };
  }, [exercise.id]);

  const handleSpeak = useCallback(async (text: string, rate?: number) => {
    if (isSpeaking) {
      tts.stop();
      setIsSpeaking(false);
      return;
    }
    setIsSpeaking(true);
    try {
      await tts.speak(text, rate ? { rate } : undefined);
    } finally {
      setIsSpeaking(false);
    }
  }, [isSpeaking]);

  const checkAnswer = () => {
    if (showFeedback || !userInput.trim()) return;

    const correctAnswer = exercise.answer || '';
    const acceptableAnswers = exercise.acceptableAnswers || [];
    const allCorrect = [correctAnswer, ...acceptableAnswers];

    const normalizedInput = normalizeAnswer(userInput);
    const correct = allCorrect.some(ans => normalizeAnswer(ans) === normalizedInput);
    const close = !correct && allCorrect.some(ans => stripAccents(normalizeAnswer(ans)) === stripAccents(normalizedInput));

    setIsCorrect(correct);
    setIsClose(close);
    setShowFeedback(true);
    setDiff(!correct && isSentence ? diffWords(userInput, correctAnswer) : null);

    const timeMs = Date.now() - startTime;
    answerRef.current = { correct, timeMs };

    if (correct) {
      sounds.correct();
      setTimeout(goNext, 1500);
    } else {
      sounds.incorrect();
      // On a mistake the student moves on when ready: time to read the correction
    }
  };

  const goNext = () => {
    const a = answerRef.current;
    if (!a) return;
    answerRef.current = null;
    tts.stop();
    onAnswer(a.correct ? 0 : -1, a.correct, a.timeMs);
    setUserInput('');
    setShowFeedback(false);
    setShowHint(false);
    setIsCorrect(false);
    setIsClose(false);
    setDiff(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (showFeedback) goNext();
      else checkAnswer();
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={exercise.id}
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -40 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col gap-4"
      >
        {/* Progress indicator */}
        <div className="flex items-center gap-2 px-1">
          <span className="text-xs font-bold text-fg-muted">
            {questionNumber}/{totalQuestions}
          </span>
          <div className="flex-1 h-1.5 bg-border rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-accent rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
            />
          </div>
        </div>

        {/* Dictation: big listen button only */}
        {isDictation && (
          <div className="flex justify-center items-center gap-3">
            <button
              onClick={() => handleSpeak(exercise.word!, dictationRate)}
              className={`w-20 h-20 rounded-full text-3xl flex items-center justify-center transition-colors ${
                isSpeaking ? 'bg-accent text-white' : 'bg-accent-pale text-accent hover:bg-accent/20'
              }`}
              aria-label={isSpeaking ? t('audio_stop') : t('audio_listen_word')}
            >
              {isSpeaking ? '⏹' : '🔊'}
            </button>
            {tts.isAvailable() && (
              <button
                onClick={() => handleSpeak(exercise.word!, 0.5)}
                className="h-11 px-3 rounded-full bg-mint-pale text-mint text-sm font-bold hover:bg-mint/20 transition-colors"
                aria-label={t('dict_slow')}
              >
                🐢 {t('dict_slow')}
              </button>
            )}
          </div>
        )}

        {/* Word display (if present) */}
        {exercise.word && !isDictation && (
          <div className="text-center">
            <span className="text-3xl font-heading font-black text-accent">
              {exercise.word}
            </span>
            {tts.isAvailable() && (
              <button
                onClick={() => handleSpeak(exercise.word!)}
                className={`inline-flex items-center justify-center w-8 h-8 rounded-full ml-2 align-middle transition-colors ${
                  isSpeaking ? 'bg-accent text-white' : 'bg-accent/10 text-accent hover:bg-accent/20'
                }`}
                aria-label={isSpeaking ? t('audio_stop') : t('audio_listen_word')}
              >
                {isSpeaking ? '⏹' : '🔊'}
              </button>
            )}
          </div>
        )}

        {/* Prompt */}
        <div className="flex items-center justify-center gap-2 px-2">
          <h2 className="font-heading font-extrabold text-lg text-center">
            {exercise.prompt}
          </h2>
          {tts.isAvailable() && (
            <button
              onClick={() => handleSpeak(exercise.prompt)}
              className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs transition-colors ${
                isSpeaking ? 'bg-accent text-white' : 'bg-accent/10 text-accent hover:bg-accent/20'
              }`}
              aria-label={t('audio_listen')}
            >
              🔊
            </button>
          )}
        </div>

        {/* Input field */}
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={handleKeyDown}
            readOnly={showFeedback}
            placeholder={t('write_placeholder')}
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            className={`w-full px-4 py-3.5 rounded-[14px] border-2 text-lg font-semibold text-center transition-colors outline-none ${
              showFeedback
                ? isCorrect
                  ? 'border-mint bg-mint-pale/30'
                  : 'border-red bg-red-pale/30'
                : 'border-border bg-bg-card focus:border-accent'
            }`}
          />
        </div>

        {/* Check button */}
        {!showFeedback && (
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={checkAnswer}
            disabled={!userInput.trim()}
            className={`w-full py-3 rounded-[14px] font-heading font-extrabold text-sm transition-colors ${
              userInput.trim()
                ? 'bg-accent text-white hover:bg-accent/90'
                : 'bg-border text-fg-muted cursor-not-allowed'
            }`}
          >
            {t('write_check')}
          </motion.button>
        )}

        {/* Hint button (not in exam mode) */}
        {!examMode && exercise.hint && !showFeedback && !showHint && (
          <button
            onClick={() => setShowHint(true)}
            className="text-sm text-accent font-semibold hover:underline"
          >
            {t('write_hint')}
          </button>
        )}

        {/* Hint display */}
        <AnimatePresence>
          {showHint && !showFeedback && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="px-4 py-2.5 bg-yellow-pale/50 border border-yellow/30 rounded-[14px] text-sm text-center"
            >
              💡 {exercise.hint}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Feedback */}
        <AnimatePresence>
          {showFeedback && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={
                isCorrect
                  ? { opacity: 1, scale: 1, y: 0 }
                  : { opacity: 1, scale: 1, y: 0, x: [0, -6, 6, -4, 4, 0] }
              }
              exit={{ opacity: 0 }}
              transition={isCorrect ? { type: 'spring', stiffness: 300 } : { duration: 0.4 }}
              className={`p-3 rounded-[14px] text-sm font-semibold flex items-start gap-2 ${
                isCorrect
                  ? 'bg-mint-pale text-mint border border-mint/30'
                  : 'bg-red-pale text-red border border-red/30'
              }`}
            >
              <span className="text-xl flex-shrink-0">
                {isCorrect ? '✅' : '❌'}
              </span>
              <div>
                <span className="font-bold">
                  {isCorrect ? t('write_correct') : t('write_incorrect', { answer: exercise.answer || '' })}
                </span>
                {isClose && (
                  <span className="block text-xs font-semibold mt-0.5">{t('write_close')}</span>
                )}
                {diff && (
                  <span className="block mt-2 text-fg">
                    <span className="block text-[11px] font-bold text-fg-muted mb-1">{t('dict_your_sentence')}</span>
                    <span className="flex flex-wrap gap-1">
                      {diff.typed.map((w, i) => (
                        <span key={i} className={`px-1.5 py-0.5 rounded-md text-sm ${w.ok ? 'bg-mint-pale text-mint' : 'bg-red-pale text-red line-through decoration-2'}`}>
                          {w.text}
                        </span>
                      ))}
                    </span>
                    {diff.missing.length > 0 && (
                      <span className="block text-[11px] font-bold text-fg-muted mt-1.5">
                        {t('dict_missing')}: <span className="text-fg">{diff.missing.join(', ')}</span>
                      </span>
                    )}
                  </span>
                )}
                {!examMode && exercise.explanation && (
                  <span className="block text-xs font-normal text-fg-muted mt-0.5">
                    {exercise.explanation}
                  </span>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* After a mistake: listen again and continue when ready */}
        {showFeedback && !isCorrect && (
          <div className="flex gap-2">
            {isDictation && tts.isAvailable() && (
              <button
                onClick={() => handleSpeak(exercise.word!, 0.5)}
                className="flex-1 py-3 rounded-[14px] bg-accent-pale text-accent font-heading font-extrabold text-sm"
              >
                🔊 {t('dict_listen_again')}
              </button>
            )}
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={goNext}
              className="flex-1 py-3 rounded-[14px] bg-accent text-white font-heading font-extrabold text-sm"
            >
              {t('ex_next')} →
            </motion.button>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
