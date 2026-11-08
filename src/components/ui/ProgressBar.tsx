import { motion } from 'framer-motion';

interface ProgressBarProps {
  value: number; // 0-100
  color?: string;
  height?: number;
  showLabel?: boolean;
}

export function ProgressBar({ value, color = 'var(--color-accent)', height = 8, showLabel = false }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value));

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between mb-1">
          <span className="text-xs font-semibold text-fg-muted">{clamped}%</span>
        </div>
      )}
      <div
        className="w-full bg-border rounded-full overflow-hidden"
        style={{ height }}
      >
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${clamped}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}
