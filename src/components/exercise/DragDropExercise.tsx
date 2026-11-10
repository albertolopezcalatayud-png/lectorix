import { useState, useCallback } from 'react';
import { useI18n } from '@/i18n';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import type { Exercise } from '@/types';
import sounds from '@/services/sounds';
import tts from '@/services/tts';

interface DragDropExerciseProps {
  exercise: Exercise;
  questionNumber: number;
  totalQuestions: number;
  onAnswer: (selectedIndex: number, isCorrect: boolean, timeMs: number) => void;
}

export function DragDropExercise({ exercise, questionNumber, totalQuestions, onAnswer }: DragDropExerciseProps) {
  const [startTime] = useState(Date.now());

  if (exercise.type === 'drag_order') {
    return (
      <DragOrderExercise
        exercise={exercise}
        questionNumber={questionNumber}
        totalQuestions={totalQuestions}
        onAnswer={onAnswer}
        startTime={startTime}
      />
    );
  }

  return (
    <DragFillExercise
      exercise={exercise}
      questionNumber={questionNumber}
      totalQuestions={totalQuestions}
      onAnswer={onAnswer}
      startTime={startTime}
    />
  );
}

// ─── Drag to Order (reorder syllables/words) ───
function DragOrderExercise({
  exercise,
  questionNumber,
  totalQuestions,
  onAnswer,
  startTime,
}: DragDropExerciseProps & { startTime: number }) {
  const { t } = useI18n();
  const correctOrder = exercise.correctOrder || [];
  const [items, setItems] = useState(() => {
    const shuffled = [...(exercise.pieces || correctOrder)];
    // Shuffle until different from correct order
    for (let i = 0; i < 10; i++) {
      shuffled.sort(() => Math.random() - 0.5);
      if (shuffled.join('') !== correctOrder.join('')) break;
    }
    return shuffled;
  });
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleCheck = () => {
    if (showFeedback) return;
    const correct = items.join('') === correctOrder.join('');
    setIsCorrect(correct);
    setShowFeedback(true);

    if (correct) {
      sounds.correct();
    } else {
      sounds.incorrect();
    }

    setTimeout(() => {
      onAnswer(correct ? 0 : 1, correct, Date.now() - startTime);
    }, 1800);
  };

  const handleSpeak = useCallback(async () => {
    if (isSpeaking) { tts.stop(); setIsSpeaking(false); return; }
    setIsSpeaking(true);
    try {
      // Whole word: reading the syllables one by one would dictate the answer
      await tts.speak(exercise.word || correctOrder.join(''), { rate: 0.7 });
    } finally {
      setIsSpeaking(false);
    }
  }, [correctOrder, isSpeaking]);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={exercise.id}
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -40 }}
        className="flex flex-col gap-4"
      >
        {/* Progress */}
        <div className="flex items-center gap-2 px-1">
          <span className="text-xs font-bold text-fg-muted">{questionNumber}/{totalQuestions}</span>
          <div className="flex-1 h-1.5 bg-border rounded-full overflow-hidden">
            <motion.div className="h-full bg-accent rounded-full" animate={{ width: `${(questionNumber / totalQuestions) * 100}%` }} />
          </div>
        </div>

        {/* The target word is heard, not shown: showing it would turn the task into copying */}
        {exercise.word && tts.isAvailable() && (
          <div className="flex justify-center">
            <button
              onClick={handleSpeak}
              aria-label={t('ex_listen_word')}
              className={`w-16 h-16 rounded-full text-2xl flex items-center justify-center transition-colors ${
                isSpeaking ? 'bg-accent text-white' : 'bg-accent-pale text-accent hover:bg-accent/20'
              }`}
            >
              {isSpeaking ? '⏹' : '🔊'}
            </button>
          </div>
        )}

        {/* Prompt */}
        <h2 className="font-heading font-extrabold text-lg text-center px-2">{exercise.prompt}</h2>

        {/* Drag area */}
        <div className="bg-accent-pale/30 rounded-[16px] p-4 border border-border">
          <p className="text-[10px] text-fg-muted text-center mb-3">{t('ex_drag_hint')}</p>
          <Reorder.Group
            axis="x"
            values={items}
            onReorder={setItems}
            className="flex flex-wrap gap-2 justify-center"
          >
            {items.map((item) => (
              <Reorder.Item
                key={item}
                value={item}
                className={`px-4 py-2.5 rounded-xl font-heading font-bold text-base cursor-grab active:cursor-grabbing select-none shadow-sm transition-colors ${
                  showFeedback
                    ? isCorrect
                      ? 'bg-mint text-white'
                      : 'bg-red text-white'
                    : 'bg-white dark:bg-bg-card text-fg border border-border'
                }`}
                whileDrag={{ scale: 1.1, zIndex: 10, boxShadow: '0 8px 20px rgba(0,0,0,0.15)' }}
                whileTap={{ scale: 0.95 }}
              >
                {item}
              </Reorder.Item>
            ))}
          </Reorder.Group>
        </div>

        {/* Preview of current order */}
        <div className="text-center">
          <span className="text-sm text-fg-muted">{t('ex_result')} </span>
          <span className="font-heading font-bold text-accent">{items.join(exercise.word ? '' : ' ')}</span>
        </div>

        {/* Check button */}
        {!showFeedback && (
          <motion.button
            onClick={handleCheck}
            className="w-full py-3 rounded-xl bg-accent text-white font-heading font-bold text-base shadow-md"
            whileTap={{ scale: 0.97 }}
          >
            {t('ex_check')} ✓
          </motion.button>
        )}

        {/* Feedback */}
        <AnimatePresence>
          {showFeedback && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={isCorrect ? { opacity: 1, scale: 1, y: 0 } : { opacity: 1, scale: 1, y: 0, x: [0, -6, 6, -4, 4, 0] }}
              exit={{ opacity: 0 }}
              className={`p-3 rounded-[14px] text-sm font-semibold flex items-start gap-2 ${
                isCorrect ? 'bg-mint-pale text-mint border border-mint/30' : 'bg-red-pale text-red border border-red/30'
              }`}
            >
              <span className="text-xl flex-shrink-0">{isCorrect ? '✅' : '❌'}</span>
              <div>
                <span className="font-bold">{isCorrect ? t('ex_correct') : t('ex_incorrect')}</span>
                <span className="block text-xs font-normal text-fg-muted mt-0.5">
                  {isCorrect ? exercise.explanation : `El orden correcto es: ${correctOrder.join(exercise.word ? '' : ' ')}`}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Drag to Fill Blanks ───
function DragFillExercise({
  exercise,
  questionNumber,
  totalQuestions,
  onAnswer,
  startTime,
}: DragDropExerciseProps & { startTime: number }) {
  const { t } = useI18n();
  const blanks = exercise.blanks || [];
  const sentence = exercise.sentence || '';
  const parts = sentence.split('___');

  // Available words = blanks + distractors, shuffled
  const [availableWords] = useState(() => {
    const all = [...blanks, ...(exercise.distractors || [])];
    return all.sort(() => Math.random() - 0.5);
  });

  const [filledBlanks, setFilledBlanks] = useState<(string | null)[]>(new Array(blanks.length).fill(null));
  const [usedWords, setUsedWords] = useState<Set<number>>(new Set());
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const handleWordTap = (word: string, wordIndex: number) => {
    if (showFeedback) return;

    // If word is already used, un-use it
    if (usedWords.has(wordIndex)) {
      const blankIdx = filledBlanks.indexOf(word);
      if (blankIdx !== -1) {
        const newFilled = [...filledBlanks];
        newFilled[blankIdx] = null;
        setFilledBlanks(newFilled);
        const newUsed = new Set(usedWords);
        newUsed.delete(wordIndex);
        setUsedWords(newUsed);
      }
      return;
    }

    // Find first empty blank
    const emptyIdx = filledBlanks.indexOf(null);
    if (emptyIdx === -1) return;

    const newFilled = [...filledBlanks];
    newFilled[emptyIdx] = word;
    setFilledBlanks(newFilled);
    const newUsed = new Set(usedWords);
    newUsed.add(wordIndex);
    setUsedWords(newUsed);
    sounds.click();
  };

  const handleBlankTap = (blankIdx: number) => {
    if (showFeedback) return;
    const word = filledBlanks[blankIdx];
    if (!word) return;

    // Remove word from blank
    const newFilled = [...filledBlanks];
    newFilled[blankIdx] = null;
    setFilledBlanks(newFilled);
    const newUsed = new Set(usedWords);
    // Find the exact used word index
    for (const i of usedWords) {
      if (availableWords[i] === word) {
        newUsed.delete(i);
        break;
      }
    }
    setUsedWords(newUsed);
  };

  const handleCheck = () => {
    if (showFeedback) return;
    if (filledBlanks.includes(null)) return;

    const correct = filledBlanks.every((w, i) => w === blanks[i]);
    setIsCorrect(correct);
    setShowFeedback(true);

    if (correct) {
      sounds.correct();
    } else {
      sounds.incorrect();
    }

    setTimeout(() => {
      onAnswer(correct ? 0 : 1, correct, Date.now() - startTime);
    }, 1800);
  };

  const allFilled = !filledBlanks.includes(null);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={exercise.id}
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -40 }}
        className="flex flex-col gap-4"
      >
        {/* Progress */}
        <div className="flex items-center gap-2 px-1">
          <span className="text-xs font-bold text-fg-muted">{questionNumber}/{totalQuestions}</span>
          <div className="flex-1 h-1.5 bg-border rounded-full overflow-hidden">
            <motion.div className="h-full bg-accent rounded-full" animate={{ width: `${(questionNumber / totalQuestions) * 100}%` }} />
          </div>
        </div>

        {/* Prompt */}
        <h2 className="font-heading font-extrabold text-lg text-center px-2">{exercise.prompt}</h2>

        {/* Sentence with blanks */}
        <div className="bg-accent-pale/30 rounded-[16px] p-4 border border-border">
          <div className="text-base leading-loose flex flex-wrap items-center gap-1">
            {parts.map((part, i) => (
              <span key={i} className="inline-flex items-center gap-1">
                <span>{part}</span>
                {i < parts.length - 1 && (
                  <motion.button
                    onClick={() => handleBlankTap(i)}
                    className={`inline-flex items-center justify-center min-w-[60px] h-9 px-3 rounded-lg border-2 border-dashed font-bold text-sm transition-colors ${
                      filledBlanks[i]
                        ? showFeedback
                          ? filledBlanks[i] === blanks[i]
                            ? 'bg-mint text-white border-mint'
                            : 'bg-red text-white border-red'
                          : 'bg-accent text-white border-accent border-solid'
                        : 'bg-white/50 dark:bg-bg-card/50 text-fg-muted border-accent/40'
                    }`}
                    whileTap={filledBlanks[i] && !showFeedback ? { scale: 0.9 } : undefined}
                    layout
                  >
                    {filledBlanks[i] || '___'}
                  </motion.button>
                )}
              </span>
            ))}
          </div>
        </div>

        {/* Available words */}
        <div>
          <p className="text-[10px] text-fg-muted text-center mb-2">{t('ex_tap_hint')}</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {availableWords.map((word, i) => (
              <motion.button
                key={`${word}-${i}`}
                onClick={() => handleWordTap(word, i)}
                className={`px-4 py-2 rounded-xl font-bold text-sm shadow-sm transition-all ${
                  usedWords.has(i)
                    ? 'opacity-30 bg-border text-fg-muted scale-90'
                    : 'bg-white dark:bg-bg-card text-fg border border-border active:scale-95'
                }`}
                whileTap={!usedWords.has(i) ? { scale: 0.9 } : undefined}
                layout
              >
                {word}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Check button */}
        {!showFeedback && (
          <motion.button
            onClick={handleCheck}
            className={`w-full py-3 rounded-xl font-heading font-bold text-base shadow-md transition-colors ${
              allFilled ? 'bg-accent text-white' : 'bg-border text-fg-muted cursor-not-allowed'
            }`}
            whileTap={allFilled ? { scale: 0.97 } : undefined}
            disabled={!allFilled}
          >
            {t('ex_check')} ✓
          </motion.button>
        )}

        {/* Feedback */}
        <AnimatePresence>
          {showFeedback && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={isCorrect ? { opacity: 1, scale: 1, y: 0 } : { opacity: 1, scale: 1, y: 0, x: [0, -6, 6, -4, 4, 0] }}
              exit={{ opacity: 0 }}
              className={`p-3 rounded-[14px] text-sm font-semibold flex items-start gap-2 ${
                isCorrect ? 'bg-mint-pale text-mint border border-mint/30' : 'bg-red-pale text-red border border-red/30'
              }`}
            >
              <span className="text-xl flex-shrink-0">{isCorrect ? '✅' : '❌'}</span>
              <div>
                <span className="font-bold">{isCorrect ? t('ex_correct') : t('ex_incorrect')}</span>
                <span className="block text-xs font-normal text-fg-muted mt-0.5">
                  {exercise.explanation}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
}
