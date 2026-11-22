/** A row of a tracing sheet: the model with numbered starts, or dotted copies to go over (SVG for paper) */
import { LINES, type Glyph } from '@/data/strokes';

const rowW = 600; // about 27 mm per 100 units on A4
export function traceRow(g: Glyph, first: boolean): string {
    const n = Math.max(1, Math.floor(rowW / (g.w + 12)));
    let body = '';
    for (let k = 0; k < n; k++) {
      const x = k * (g.w + 12);
      body += `<g transform="translate(${x} 0)">${g.strokes.map((d) => `<path d="${d}" fill="none" stroke="${first && k === 0 ? '#34437A' : '#6f7899'}" stroke-width="${first && k === 0 ? 3 : 2}" stroke-linecap="round" ${first && k === 0 ? '' : 'stroke-dasharray="0.1 2.6"'}/>`).join('')}`;
      if (first && k === 0) {
        g.strokes.forEach((d, i) => {
          const m = /^M([\d.-]+) ([\d.-]+)/.exec(d);
          if (m) body += `<circle cx="${m[1]}" cy="${m[2]}" r="4.2" fill="#3BB273"/><text x="${m[1]}" y="${+m[2] + 1.8}" font-size="5.2" text-anchor="middle" fill="#fff" font-weight="700">${i + 1}</text>`;
        });
      }
      body += '</g>';
    }
    const lines = [LINES.top, LINES.mid, LINES.base, LINES.desc].map((y) => `<line x1="-6" x2="${rowW}" y1="${y}" y2="${y}" stroke="#c9cfe0" stroke-width="${y === LINES.base ? 0.8 : 0.4}"/>`).join('');
    return `<svg viewBox="-8 -4 ${rowW + 12} 104" width="100%" style="display:block;margin:0 0 2mm">${lines}${body}</svg>`;
  }
