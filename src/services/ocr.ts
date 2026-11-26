/**
 * Reading the text of a photo of a page, on the device (Tesseract). A textbook page is not a clean text: it has
 * margins from the next page, pictures with labels, titles in other fonts and shadows. So:
 *  1. only the part the pupil marks is read (the crop),
 *  2. the photo is prepared as a scanner would: enlarged, in grey and turned into black-on-white, with a threshold
 *     that adapts to each zone so a shadow does not erase the letters,
 *  3. the text model is the language of the TEXT (a book in Valencian is read with the Valencian model, even if the
 *     app is in Spanish),
 *  4. what Tesseract is not sure about is left out: very narrow pieces (labels of a drawing, the margin of the other
 *     page), paragraphs with low confidence and lines that are mostly symbols.
 */
export interface Crop { x: number; y: number; w: number; h: number } // fractions of the image, 0..1
export type OcrLang = 'es' | 'ca' | 'en';
const MODEL: Record<OcrLang, string> = { es: 'spa', ca: 'cat', en: 'eng' };

/** Crop, enlarge, grey and black-on-white (Bradley adaptive threshold). */
export async function preparePhoto(file: Blob, crop?: Crop): Promise<HTMLCanvasElement> {
  const bmp = await createImageBitmap(file, { imageOrientation: 'from-image' } as ImageBitmapOptions).catch(() => createImageBitmap(file));
  const c = crop ?? { x: 0, y: 0, w: 1, h: 1 };
  const sx = Math.round(c.x * bmp.width), sy = Math.round(c.y * bmp.height);
  const sw = Math.max(1, Math.round(c.w * bmp.width)), sh = Math.max(1, Math.round(c.h * bmp.height));
  // text about 30-40 px high reads best: aim at ~2200 px wide for a full-width column, never shrink small crops
  const scale = Math.min(3, Math.max(1, 2200 / sw));
  const W = Math.round(sw * scale), H = Math.round(sh * scale);
  const cv = document.createElement('canvas');
  cv.width = W; cv.height = H;
  const g = cv.getContext('2d', { willReadFrequently: true })!;
  g.imageSmoothingQuality = 'high';
  g.drawImage(bmp, sx, sy, sw, sh, 0, 0, W, H);
  bmp.close?.();
  const img = g.getImageData(0, 0, W, H);
  const d = img.data;
  const grey = new Uint8ClampedArray(W * H);
  for (let i = 0, p = 0; p < grey.length; i += 4, p++) grey[p] = (d[i] * 299 + d[i + 1] * 587 + d[i + 2] * 114) / 1000;
  // integral image for the local mean
  const integ = new Float64Array((W + 1) * (H + 1));
  for (let y = 1; y <= H; y++) {
    let row = 0;
    for (let x = 1; x <= W; x++) { row += grey[(y - 1) * W + x - 1]; integ[y * (W + 1) + x] = integ[(y - 1) * (W + 1) + x] + row; }
  }
  const s = Math.max(16, Math.round(Math.max(W, H) / 24)) >> 1;
  for (let y = 0; y < H; y++) {
    const y0 = Math.max(0, y - s), y1 = Math.min(H, y + s + 1);
    for (let x = 0; x < W; x++) {
      const x0 = Math.max(0, x - s), x1 = Math.min(W, x + s + 1);
      const sum = integ[y1 * (W + 1) + x1] - integ[y0 * (W + 1) + x1] - integ[y1 * (W + 1) + x0] + integ[y0 * (W + 1) + x0];
      const mean = sum / ((x1 - x0) * (y1 - y0));
      const v = grey[y * W + x] < mean * 0.85 ? 0 : 255;
      const i = (y * W + x) * 4;
      d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = 255;
    }
  }
  g.putImageData(img, 0, 0);
  return cv;
}

interface TWord { text: string; confidence: number }
interface TLine { words: TWord[]; text: string }
interface TPara { lines: TLine[]; confidence: number; bbox: { x0: number; x1: number; y0: number; y1: number } }
interface TBlock { paragraphs: TPara[] }

const letters = (s: string) => (s.match(/\p{L}/gu) ?? []).length;

/** Keeps the real paragraphs of the page, in reading order, as plain text (paragraphs separated by a blank line). */
export function cleanBlocks(blocks: TBlock[], width: number): string {
  const out: string[] = [];
  for (const b of blocks ?? []) for (const p of b.paragraphs ?? []) {
    const words = p.lines.flatMap((l) => l.words);
    const raw = p.lines.map((l) => l.text).join(' ');
    const wide = (p.bbox.x1 - p.bbox.x0) / width;
    const meanConf = words.reduce((a, w) => a + w.confidence, 0) / Math.max(1, words.length);
    const letterRatio = letters(raw) / Math.max(1, raw.replace(/\s/g, '').length);
    if (words.length < 3 && wide < 0.35) continue; // a label of a drawing, a word from the margin
    if (wide < 0.18) continue; // a narrow strip: the edge of the other page
    if (meanConf < 55 || letterRatio < 0.7) continue; // noise from pictures or shadows
    const lines = p.lines.map((l) => l.words
      .filter((w) => !(w.confidence < 45 && letters(w.text) < Math.max(1, w.text.length / 2))) // stray symbols
      .filter((w) => !(letters(w.text) <= 1 && w.confidence < 75 && !/^[aeiouyàèéíòóú][.,;:]?$/i.test(w.text))) // a stroke of a box border read as «l» or «I.»
      .map((w) => w.text).join(' '));
    let text = lines.join('\n')
      .replace(/-\n(\p{Ll})/gu, '$1') // word split at the end of a line
      .replace(/\n/g, ' ');
    text = tidy(text).replace(/^\p{L}[.,:;]?\s+(?=\p{Lu})/u, ''); // «I. L’aigua…»: a border stroke before the first word
    if (letters(text) < 3) continue;
    // a paragraph cut by a border or a picture: it continues the previous one if that did not end a sentence
    const prev = out[out.length - 1];
    if (prev && /^\p{Ll}/u.test(text) && !/[.!?:»”)]$/.test(prev)) out[out.length - 1] = `${prev} ${text}`;
    else out.push(text);
  }
  return out.join('\n\n');
}

/** Small, safe corrections of typical photo-reading mistakes. */
export function tidy(t: string): string {
  return t
    .replace(/[’‘`´]/g, '’').replace(/(\p{L})'(\p{L})/gu, '$1’$2')
    .replace(/[|¦_]+/g, ' ')
    .replace(/\s(?:[—–]|-{2,})+(?=\s)/g, ' ')
    .replace(/(\d)\s?[º°"“”]\s?C\b/g, '$1 °C')
    .replace(/\s+([.,;:!?)])/g, '$1')
    .replace(/([¿¡(])\s+/g, '$1')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

/** Reads the marked part of the photo with the model of the text's language. */
export async function readPhoto(file: Blob, lang: OcrLang, opts: { crop?: Crop; workerPath: string; corePath: string; langPath: string; progress?: (p: number) => void }): Promise<string> {
  const canvas = await preparePhoto(file, opts.crop);
  const { createWorker, PSM } = await import('tesseract.js');
  const worker = await createWorker(MODEL[lang], 1, {
    workerPath: opts.workerPath, corePath: opts.corePath, langPath: opts.langPath, workerBlobURL: false, gzip: true,
    logger: (m: { status: string; progress: number }) => { if (m.status === 'recognizing text') opts.progress?.(m.progress); },
  });
  try {
    await worker.setParameters({ tessedit_pageseg_mode: PSM.AUTO, preserve_interword_spaces: '1' });
    const { data } = await worker.recognize(canvas, {}, { blocks: true, text: true });
    const blocks = (data as unknown as { blocks: TBlock[] }).blocks;
    const text = blocks ? cleanBlocks(blocks, canvas.width) : tidy(data.text.replace(/-\n(\p{Ll})/gu, '$1').replace(/([^\n])\n(?!\n)/g, '$1 '));
    return text;
  } finally {
    await worker.terminate();
  }
}
