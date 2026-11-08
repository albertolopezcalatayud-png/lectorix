import { motion } from 'framer-motion';

interface OptionButtonProps {
  label: string;
  index: number;
  selected: boolean;
  correct: boolean;
  showFeedback: boolean;
  onClick: () => void;
}

const LETTERS = ['A', 'B', 'C', 'D'];

export function OptionButton({ label, index, selected, correct, showFeedback, onClick }: OptionButtonProps) {
  let borderColor = 'border-border';
  let bgColor = 'bg-bg-card';
  let letterBg = 'bg-accent-pale text-accent';

  if (showFeedback) {
    if (correct) {
      borderColor = 'border-mint';
      bgColor = 'bg-mint-pale';
      letterBg = 'bg-mint text-white';
    } else if (selected) {
      borderColor = 'border-red';
      bgColor = 'bg-red-pale';
      letterBg = 'bg-red text-white';
    }
  } else if (selected) {
    borderColor = 'border-accent';
    bgColor = 'bg-accent-pale';
  }

  return (
    <motion.button
      whileTap={!showFeedback ? { scale: 0.97 } : undefined}
      animate={showFeedback && selected && !correct ? { x: [0, -4, 4, -4, 4, 0] } : {}}
      transition={{ duration: 0.4 }}
      onClick={onClick}
      disabled={showFeedback}
      className={`
        flex items-center gap-3 p-3.5 rounded-[14px] border-2 transition-colors text-left
        ${borderColor} ${bgColor}
        ${showFeedback ? 'cursor-default' : 'cursor-pointer hover:border-accent/50'}
      `}
    >
      <span className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg text-sm font-extrabold ${letterBg}`}>
        {LETTERS[index]}
      </span>
      <span className="font-semibold text-sm flex-1">{label}</span>
      {showFeedback && correct && <span className="text-lg">✅</span>}
      {showFeedback && selected && !correct && <span className="text-lg">❌</span>}
    </motion.button>
  );
}
