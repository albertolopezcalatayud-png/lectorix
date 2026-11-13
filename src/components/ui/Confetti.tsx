import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ConfettiPiece {
  id: number;
  x: number;
  color: string;
  delay: number;
  rotation: number;
  size: number;
  shape: 'rect' | 'circle';
}

const COLORS = ['#F2A28B', '#7CC4B1', '#F2C75C', '#8FB7E0', '#B9B3E8', '#34437A', '#F4C7B8', '#BFE3D9'];

function generatePieces(count: number): ConfettiPiece[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    delay: Math.random() * 0.5,
    rotation: Math.random() * 360,
    size: 6 + Math.random() * 6,
    shape: Math.random() > 0.5 ? 'rect' : 'circle',
  }));
}

interface ConfettiProps {
  active: boolean;
  duration?: number;
  count?: number;
}

export function Confetti({ active, duration = 3000, count = 50 }: ConfettiProps) {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (active) {
      setPieces(generatePieces(count));
      setShow(true);
      const timer = setTimeout(() => setShow(false), duration);
      return () => clearTimeout(timer);
    }
  }, [active, count, duration]);

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {pieces.map((p) => (
            <motion.div
              key={p.id}
              initial={{
                x: `${p.x}vw`,
                y: -20,
                rotate: 0,
                opacity: 1,
              }}
              animate={{
                y: '110vh',
                rotate: p.rotation + 720,
                opacity: [1, 1, 1, 0],
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 2 + Math.random() * 1.5,
                delay: p.delay,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
              style={{
                position: 'absolute',
                width: p.size,
                height: p.shape === 'rect' ? p.size * 0.6 : p.size,
                backgroundColor: p.color,
                borderRadius: p.shape === 'circle' ? '50%' : '2px',
              }}
            />
          ))}
        </div>
      )}
    </AnimatePresence>
  );
}
