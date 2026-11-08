import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Exercise } from '@/types';
import { OptionButton } from './OptionButton';
import sounds from '@/services/sounds';
import tts from '@/services/tts';

interface ExerciseCardProps {
  exercise: Exercise;
  questionNumber: number;
  totalQuestions: number;
  onAnswer: (selectedIndex: number, isCorrect: boolean, timeMs: number) => void;
}

export function ExerciseCard({ exercise, questionNumber, totalQuestions, onAnswer }: ExerciseCardProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [startTime] = useState(Date.now());
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleSpeak = useCallback(async (text: string) => {
    if (isSpeaking) {
      tts.stop();
      setIsSpeaking(false);
      return;
    }
    setIsSpeaking(true);
    try {
      await tts.speak(text);
    } finally {
      setIsSpeaking(false);
    }
  }, [isSpeaking]);

  const handleSpeakWord = useCallback(async () => {
    if (!exercise.word) return;
    if (isSpeaking) {
      tts.stop();
      setIsSpeaking(false);
      return;
    }
    setIsSpeaking(true);
    try {
      if (exercise.syllables && Array.isArray(exercise.syllables)) {
        await tts.speakSyllables(exercise.syllables);
      } else {
        await tts.speak(exercise.word);
      }
    } finally {
      setIsSpeaking(false);
    }
  }, [exercise.word, exercise.syllables, isSpeaking]);

  const handleSelect = (index: number) => {
    if (showFeedback) return;
    setSelected(index);
    setShowFeedback(true);

    const isCorrect = index === exercise.correct;
    const timeMs = Date.now() - startTime;

    // Play sound effect
    if (isCorrect) {
      sounds.correct();
    } else {
      sounds.incorrect();
    }

    // Delay to show feedback before advancing
    setTimeout(() => {
      onAnswer(index, isCorrect, timeMs);
      setSelected(null);
      setShowFeedback(false);
    }, 1500);
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

        {/* Passage (for comprehension exercises) */}
        {exercise.passage && (
          <div className="bg-accent-pale/50 rounded-[14px] p-4 text-sm leading-relaxed border border-border relative">
            {exercise.passage}
            {tts.isAvailable() && (
              <button
                onClick={() => handleSpeak(exercise.passage!)}
                className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                  isSpeaking ? 'bg-accent text-white' : 'bg-white/80 text-accent hover:bg-accent/10'
                }`}
                aria-label={isSpeaking ? 'Detener lectura' : 'Escuchar pasaje'}
                title={isSpeaking ? 'Detener' : 'Escuchar'}
              >
                {isSpeaking ? '⏹' : '🔊'}
              </button>
            )}
          </div>
        )}

        {/* Word display */}
        {exercise.word && (
          <div className="text-center relative">
            <span className="text-3xl font-heading font-black text-accent">
              {exercise.word}
            </span>
            {exercise.syllables && (
              <p className="text-sm text-fg-muted mt-1">{Array.isArray(exercise.syllables) ? exercise.syllables.join(' - ') : exercise.syllables}</p>
            )}
            {tts.isAvailable() && (
              <button
                onClick={handleSpeakWord}
                className={`inline-flex items-center justify-center w-8 h-8 rounded-full ml-2 align-middle transition-colors ${
                  isSpeaking ? 'bg-accent text-white' : 'bg-accent/10 text-accent hover:bg-accent/20'
                }`}
                aria-label={isSpeaking ? 'Detener' : 'Escuchar palabra'}
                title={isSpeaking ? 'Detener' : 'Escuchar'}
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
              aria-label="Escuchar pregunta"
              title="Escuchar"
            >
              🔊
            </button>
          )}
        </div>

        {/* Options */}
        <div className="flex flex-col gap-2.5">
          {exercise.options.map((option, index) => (
            <OptionButton
              key={index}
              label={option}
              index={index}
              selected={selected === index}
              correct={exercise.correct === index}
              showFeedback={showFeedback}
              onClick={() => handleSelect(index)}
            />
          ))}
        </div>

        {/* Feedback */}
        <AnimatePresence>
          {showFeedback && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`p-3 rounded-[14px] text-sm font-semibold ${
                selected === exercise.correct
                  ? 'bg-mint-pale text-mint border border-mint/30'
                  : 'bg-red-pale text-red border border-red/30'
              }`}
            >
              {selected === exercise.correct ? '✅ ¡Correcto!' : '❌ Incorrecto'}{' '}
              <span className="font-normal text-fg-muted">{exercise.explanation}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
}
