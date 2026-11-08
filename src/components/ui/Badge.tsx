import type { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  color?: 'accent' | 'mint' | 'peach' | 'sky' | 'yellow' | 'red';
}

const colorMap = {
  accent: 'bg-accent-pale text-accent',
  mint: 'bg-mint-pale text-mint',
  peach: 'bg-peach-pale text-peach',
  sky: 'bg-sky-pale text-sky',
  yellow: 'bg-yellow-pale text-yellow',
  red: 'bg-red-pale text-red',
};

export function Badge({ children, color = 'accent' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-extrabold ${colorMap[color]}`}>
      {children}
    </span>
  );
}
