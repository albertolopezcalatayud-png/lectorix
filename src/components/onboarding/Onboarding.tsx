import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';

interface OnboardingProps {
  onComplete: () => void;
}

const SLIDES = [
  {
    emoji: '📖',
    title: '¡Bienvenido a Lectorix!',
    description: 'Tu compañero de lectura y escritura. Practica a tu ritmo con ejercicios divertidos diseñados para ti.',
    bg: 'bg-accent-pale/50',
  },
  {
    emoji: '🧩',
    title: '5 módulos de práctica',
    description: 'Fonología, Memoria Visual, Comprensión Lectora, Escritura y Retos Rápidos. Cada uno con 5 niveles de dificultad.',
    bg: 'bg-sky-pale/50',
  },
  {
    emoji: '⭐',
    title: 'Gana estrellas y XP',
    description: 'Cada ejercicio te da puntos de experiencia. Consigue 3 estrellas para desbloquear el siguiente nivel.',
    bg: 'bg-yellow-pale/50',
  },
  {
    emoji: '🔊',
    title: 'Lee y escucha',
    description: 'Pulsa el botón 🔊 para escuchar cualquier texto en voz alta. Ajusta la velocidad en Ajustes.',
    bg: 'bg-mint-pale/50',
  },
  {
    emoji: '♿',
    title: 'Hecho para ti',
    description: 'Fuente OpenDyslexic, tamaño de texto ajustable y modo de alto contraste. Todo en Ajustes > Accesibilidad.',
    bg: 'bg-peach-pale/50',
  },
];

export function Onboarding({ onComplete }: OnboardingProps) {
  const [current, setCurrent] = useState(0);
  const slide = SLIDES[current];
  const isLast = current === SLIDES.length - 1;

  return (
    <div className="fixed inset-0 z-50 bg-bg flex flex-col items-center justify-center px-6">
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -60 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col items-center text-center max-w-sm"
        >
          {/* Emoji icon */}
          <div className={`w-28 h-28 rounded-full ${slide.bg} flex items-center justify-center mb-8`}>
            <span className="text-6xl">{slide.emoji}</span>
          </div>

          <h1 className="font-heading font-black text-2xl mb-3">{slide.title}</h1>
          <p className="text-fg-muted text-sm leading-relaxed">{slide.description}</p>
        </motion.div>
      </AnimatePresence>

      {/* Dots */}
      <div className="flex gap-2 mt-10 mb-8">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-2.5 h-2.5 rounded-full transition-colors ${
              i === current ? 'bg-accent scale-125' : 'bg-border'
            }`}
          />
        ))}
      </div>

      {/* Buttons */}
      <div className="w-full max-w-xs space-y-2.5">
        <Button
          fullWidth
          onClick={() => {
            if (isLast) {
              onComplete();
            } else {
              setCurrent((c) => c + 1);
            }
          }}
        >
          {isLast ? '¡Empezar! 🚀' : 'Siguiente →'}
        </Button>

        {!isLast && (
          <Button variant="ghost" fullWidth onClick={onComplete}>
            Saltar tutorial
          </Button>
        )}
      </div>
    </div>
  );
}
