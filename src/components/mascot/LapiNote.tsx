import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '@/stores/useAppStore';
import { MascotAvatar } from './MascotAvatar';

/** Empty states and little messages: Lapi, the student's pencil, with a sticky note */
export function LapiNote({ title, children, size = 84 }: { title: string; children?: ReactNode; size?: number }) {
  const mascot = useAppStore((s) => s.mascot);
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex items-end gap-2 py-4">
      <div className="shrink-0" aria-hidden><MascotAvatar customization={mascot} size={size} /></div>
      <div className="sticky-note relative flex-1 p-4 text-left -rotate-1">
        <p className="font-heading font-extrabold">{title}</p>
        {children && <div className="text-sm text-fg-muted mt-1 leading-snug">{children}</div>}
      </div>
    </motion.div>
  );
}
