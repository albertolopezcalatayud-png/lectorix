import type { HTMLAttributes, ReactNode } from 'react';
import { motion } from 'framer-motion';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  hover?: boolean;
  padding?: 'sm' | 'md' | 'lg';
}

const paddings = {
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
};

export function Card({ children, hover = false, padding = 'md', className = '', ...props }: CardProps) {
  return (
    <motion.div
      whileHover={hover ? { scale: 1.02, y: -2 } : undefined}
      whileTap={hover ? { scale: 0.98 } : undefined}
      className={`
        bg-bg-card border-[1.5px] border-border rounded-[18px]
        shadow-[0_4px_24px_rgba(40,50,74,0.06)]
        ${paddings[padding]}
        ${hover ? 'cursor-pointer' : ''}
        ${className}
      `}
      {...(props as any)}
    >
      {children}
    </motion.div>
  );
}
