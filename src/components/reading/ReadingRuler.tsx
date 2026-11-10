import { useEffect, useRef, useState } from 'react';
import { useI18n } from '@/i18n';

/**
 * Reading ruler: a clear horizontal band with the rest of the screen dimmed,
 * so the eyes stay on one line. The text scrolls underneath; the band is moved
 * with the handle on the right (drag) or with the ▲/▼ buttons / arrow keys.
 * It never captures taps on the text itself.
 */
export function ReadingRuler() {
  const { t } = useI18n();
  const [y, setY] = useState(() => Math.round(window.innerHeight * 0.42));
  const [h, setH] = useState(72);
  const dragging = useRef(false);

  useEffect(() => {
    const move = (e: PointerEvent) => {
      if (!dragging.current) return;
      e.preventDefault();
      setY(Math.max(40, Math.min(window.innerHeight - 120, e.clientY - h / 2)));
    };
    const up = () => { dragging.current = false; };
    const key = (e: KeyboardEvent) => {
      if (!e.altKey) return;
      if (e.key === 'ArrowDown') setY((v) => Math.min(window.innerHeight - 120, v + 24));
      if (e.key === 'ArrowUp') setY((v) => Math.max(40, v - 24));
    };
    window.addEventListener('pointermove', move, { passive: false });
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
    window.addEventListener('keydown', key);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
      window.removeEventListener('keydown', key);
    };
  }, [h]);

  const shade = 'fixed left-0 right-0 bg-black/35 pointer-events-none z-[45]';
  return (
    <>
      <div className={shade} style={{ top: 0, height: y }} aria-hidden />
      <div
        className="fixed left-0 right-0 z-[45] pointer-events-none border-y-2 border-yellow/80 bg-yellow/10"
        style={{ top: y, height: h }}
        aria-hidden
      />
      <div className={shade} style={{ top: y + h, bottom: 0 }} aria-hidden />
      {/* Handle */}
      <div className="fixed right-1 z-[46] flex flex-col items-center gap-1" style={{ top: y + h / 2 - 54 }}>
        <button
          onClick={() => setY((v) => Math.max(40, v - 28))}
          className="w-8 h-7 rounded-lg bg-bg-card/95 border border-border text-xs shadow"
          aria-label={t('ruler_up')}
        >▲</button>
        <div
          onPointerDown={(e) => { dragging.current = true; (e.target as HTMLElement).setPointerCapture?.(e.pointerId); }}
          className="w-8 h-10 rounded-lg bg-yellow text-[#2D2640] flex items-center justify-center text-sm shadow touch-none cursor-grab select-none"
          role="slider"
          aria-label={t('ruler_drag')}
          aria-valuenow={y}
        >☰</div>
        <button
          onClick={() => setY((v) => Math.min(window.innerHeight - 120, v + 28))}
          className="w-8 h-7 rounded-lg bg-bg-card/95 border border-border text-xs shadow"
          aria-label={t('ruler_down')}
        >▼</button>
        <button
          onClick={() => setH((v) => (v >= 120 ? 48 : v + 24))}
          className="w-8 h-7 rounded-lg bg-bg-card/95 border border-border text-[10px] font-bold shadow"
          aria-label={t('ruler_size')}
        >↕</button>
      </div>
    </>
  );
}
