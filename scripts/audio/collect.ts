/**
 * Lists every fixed text Lectorix reads aloud, per language, with its clip key.
 * Run: npx tsx scripts/audio/collect.ts > audio-texts.json
 * The generator (generate.mjs) turns the list into audio files; the app plays a file when one exists
 * for exactly the text it is about to read, and otherwise uses the device's voice.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseText } from '../../src/services/textModel';
import { clipKey, clipText } from '../../src/services/clipKey';
import { verbCards } from '../../src/data/examVerbs';

type Lang = 'es' | 'ca' | 'en';
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'src', 'data');
const out: Record<Lang, Map<string, string>> = { es: new Map(), ca: new Map(), en: new Map() };
const add = (lang: Lang, text?: string | null) => {
  if (!text) return;
  const t = clipText(text);
  if (!t || !/\p{L}/u.test(t)) return;
  out[lang].set(clipKey(lang, t), t);
};
const cleanWord = (w: string) => w.replace(/^[«"“(¿¡—-]+|[»"”).,;:!?…—-]+$/g, '');

// Readings: read sentence by sentence (guided reading), a tapped word, glossary entries
const READINGS: [Lang, string][] = [['es', 'lecturas.json'], ['ca', 'lectures.ca.json'], ['en', 'readings.en.json']];
for (const [lang, file] of READINGS) {
  const data = JSON.parse(readFileSync(join(ROOT, file), 'utf8')) as { readings: { text: string; glossary?: [string, string][] }[] };
  for (const r of data.readings) {
    for (const s of parseText(r.text).sentences) {
      add(lang, s.text);
      for (const tok of s.tokens) add(lang, cleanWord(tok.text));
    }
    for (const [term, def] of r.glossary ?? []) add(lang, `${term}. ${def}`);
  }
}

// Exercises: the word (and its syllables), the instruction and the text
const EX: [Lang, string][] = [['es', 'exercises'], ['ca', join('exercises', 'ca')], ['en', join('exercises', 'en')]];
for (const [lang, dir] of EX) {
  for (const f of readdirSync(join(ROOT, dir)).filter((x) => x.endsWith('.json'))) {
    const data = JSON.parse(readFileSync(join(ROOT, dir, f), 'utf8')) as { exercises: { word?: string; syllables?: string[] | string; prompt?: string; passage?: string }[] };
    for (const e of data.exercises) {
      add(lang, e.word);
      if (Array.isArray(e.syllables)) e.syllables.forEach((s) => add(lang, s));
      add(lang, e.prompt);
      add(lang, e.passage);
    }
  }
}

// Exam question verbs
for (const lang of ['es', 'ca', 'en'] as Lang[]) for (const c of verbCards(lang)) add(lang, `${c.word}. ${c.meaning} ${c.how}`);

const result = Object.fromEntries((Object.keys(out) as Lang[]).map((l) => [l, Object.fromEntries(out[l])]));
const chars = Object.fromEntries((Object.keys(out) as Lang[]).map((l) => [l, [...out[l].values()].reduce((a, t) => a + t.length, 0)]));
process.stderr.write(`texts: ${JSON.stringify(Object.fromEntries((Object.keys(out) as Lang[]).map((l) => [l, out[l].size])))} chars: ${JSON.stringify(chars)}\n`);
process.stdout.write(JSON.stringify(result));
