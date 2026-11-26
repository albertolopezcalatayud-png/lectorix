import { useEffect, useRef, useState } from 'react';
import type { Crop } from '@/services/ocr';

/** The pupil marks only the text to read: a frame with four corners to drag over the photo. Pictures, labels of
 *  drawings and the margin of the other page stay outside, so they are not read. */
export function PhotoCrop({ file, title, help, readLabel, allLabel, cancelLabel, onRead, onCancel }: {
  file: Blob; title: string; help: string; readLabel: string; allLabel: string; cancelLabel: string;
  onRead: (crop: Crop | undefined) => void; onCancel: () => void;
}) {
  const [url, setUrl] = useState<string>();
  const [box, setBox] = useState<Crop>({ x: 0.06, y: 0.06, w: 0.88, h: 0.88 });
  const area = useRef<HTMLDivElement>(null);
  const drag = useRef<{ corner: 'tl' | 'tr' | 'bl' | 'br' | 'move'; x: number; y: number; start: Crop } | null>(null);
  useEffect(() => { const u = URL.createObjectURL(file); setUrl(u); return () => URL.revokeObjectURL(u); }, [file]);

  const down = (corner: 'tl' | 'tr' | 'bl' | 'br' | 'move') => (e: React.PointerEvent) => {
    e.preventDefault(); e.stopPropagation();
    (e.target as Element).setPointerCapture(e.pointerId);
    drag.current = { corner, x: e.clientX, y: e.clientY, start: box };
  };
  const move = (e: React.PointerEvent) => {
    const d = drag.current, r = area.current?.getBoundingClientRect();
    if (!d || !r) return;
    const dx = (e.clientX - d.x) / r.width, dy = (e.clientY - d.y) / r.height;
    const s = d.start, min = 0.08;
    let { x, y, w, h } = s;
    if (d.corner === 'move') { x = Math.min(1 - w, Math.max(0, s.x + dx)); y = Math.min(1 - h, Math.max(0, s.y + dy)); }
    if (d.corner === 'tl' || d.corner === 'bl') { x = Math.min(s.x + s.w - min, Math.max(0, s.x + dx)); w = s.x + s.w - x; }
    if (d.corner === 'tr' || d.corner === 'br') { w = Math.min(1 - s.x, Math.max(min, s.w + dx)); }
    if (d.corner === 'tl' || d.corner === 'tr') { y = Math.min(s.y + s.h - min, Math.max(0, s.y + dy)); h = s.y + s.h - y; }
    if (d.corner === 'bl' || d.corner === 'br') { h = Math.min(1 - s.y, Math.max(min, s.h + dy)); }
    setBox({ x, y, w, h });
  };
  const up = () => { drag.current = null; };
  const pct = (v: number) => `${v * 100}%`;
  const handle = (c: 'tl' | 'tr' | 'bl' | 'br', left: number, top: number) => (
    <button type="button" aria-label={c} onPointerDown={down(c)} data-testid={`crop-${c}`}
      className="absolute w-9 h-9 -ml-[18px] -mt-[18px] rounded-full bg-white border-4 border-accent shadow touch-none"
      style={{ left: pct(left), top: pct(top) }} />
  );

  return (
    <div className="space-y-3" data-testid="photo-crop">
      <p className="font-heading font-extrabold">{title}</p>
      <p className="text-sm text-fg-muted">{help}</p>
      <div ref={area} className="relative select-none touch-none rounded-xl overflow-hidden border border-border" onPointerMove={move} onPointerUp={up} onPointerCancel={up}>
        {url && <img src={url} alt="" className="block w-full h-auto pointer-events-none" draggable={false} />}
        {/* everything outside the frame is dimmed */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'rgba(30,30,50,.45)', clipPath: `polygon(0 0,100% 0,100% 100%,0 100%,0 0,${pct(box.x)} ${pct(box.y)},${pct(box.x)} ${pct(box.y + box.h)},${pct(box.x + box.w)} ${pct(box.y + box.h)},${pct(box.x + box.w)} ${pct(box.y)},${pct(box.x)} ${pct(box.y)})` }} />
        <div className="absolute border-[3px] border-accent rounded-md touch-none cursor-move" onPointerDown={down('move')} data-testid="crop-box"
          style={{ left: pct(box.x), top: pct(box.y), width: pct(box.w), height: pct(box.h) }} />
        {handle('tl', box.x, box.y)}{handle('tr', box.x + box.w, box.y)}
        {handle('bl', box.x, box.y + box.h)}{handle('br', box.x + box.w, box.y + box.h)}
      </div>
      <div className="grid gap-2">
        <button type="button" className="w-full rounded-xl bg-accent text-white font-bold py-3" onClick={() => onRead(box)} data-testid="crop-read">✅ {readLabel}</button>
        <div className="grid grid-cols-2 gap-2">
          <button type="button" className="rounded-xl border border-border bg-bg-card font-bold py-2.5 text-sm" onClick={() => onRead(undefined)} data-testid="crop-all">{allLabel}</button>
          <button type="button" className="rounded-xl border border-border bg-bg-card font-bold py-2.5 text-sm" onClick={onCancel}>{cancelLabel}</button>
        </div>
      </div>
    </div>
  );
}
