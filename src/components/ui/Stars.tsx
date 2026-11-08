import { motion } from 'framer-motion';

interface StarsProps {
  count: number; // 0-3
  size?: number;
  animated?: boolean;
}

export function Stars({ count, size = 24, animated = false }: StarsProps) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3].map((i) => (
        <motion.span
          key={i}
          initial={animated ? { scale: 0, rotate: -180 } : undefined}
          animate={animated ? { scale: 1, rotate: 0 } : undefined}
          transition={animated ? { delay: i * 0.15, type: 'spring', stiffness: 300 } : undefined}
          style={{ fontSize: size }}
          className={i <= count ? 'text-yellow' : 'text-border opacity-50'}
        >
          ★
        </motion.span>
      ))}
    </div>
  );
}
