/**
 * Generates natural-voice audio for Lectorix's fixed texts with Azure AI Speech (neural voices).
 * node scripts/audio/generate.mjs <texts.json> <outDir>
 *   env AZURE_SPEECH_KEY (secret), AZURE_SPEECH_REGION (default westeurope)
 *   env MAX_MINUTES (default 330), MAX_CHARS (default 450000), ONLY_LANG, SAMPLES=1
 * Output per language: <outDir>/<lang>/<key>.mp3, <key>.json (word timings) and manifest.json.
 * Only texts without audio are generated, so it can run again and again; it stops before the time or
 * character budget runs out. The free tier (F0) allows about 20 requests a minute: the pace respects that.
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import sdk from 'microsoft-cognitiveservices-speech-sdk';

// Voices chosen for children: clear, warm, standard pronunciation. Changing a voice regenerates that language.
export const VOICES = {
  es: process.env.VOICE_ES || 'es-ES-ElviraNeural',
  ca: process.env.VOICE_CA || 'ca-ES-JoanaNeural',
  en: process.env.VOICE_EN || 'en-GB-SoniaNeural',
};
const LOCALE = { es: 'es-ES', ca: 'ca-ES', en: 'en-GB' };
const RATE = '-6%';           // a touch slower than conversational speech, still natural
const PACE_MS = Number(process.env.PACE_MS || 3200); // F0: ~20 requests per minute

const [textsFile, outDir] = process.argv.slice(2);
const key = process.env.AZURE_SPEECH_KEY;
const region = process.env.AZURE_SPEECH_REGION || 'westeurope';
if (!key) { console.error('AZURE_SPEECH_KEY is missing'); process.exit(1); }
const texts = JSON.parse(readFileSync(textsFile, 'utf8'));
const deadline = Date.now() + Number(process.env.MAX_MINUTES || 330) * 60000;
let budget = Number(process.env.MAX_CHARS || 450000);

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const ssml = (lang, voice, text) =>
  `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="${LOCALE[lang]}"><voice name="${voice}"><prosody rate="${RATE}">${esc(text)}</prosody></voice></speak>`;

/** One clip: mp3 bytes + [charIndex in the plain text, ms] for each word */
function synth(lang, voice, text) {
  return new Promise((resolve, reject) => {
    const cfg = sdk.SpeechConfig.fromSubscription(key, region);
    cfg.speechSynthesisOutputFormat = sdk.SpeechSynthesisOutputFormat.Audio24Khz48KBitRateMonoMp3;
    const synth = new sdk.SpeechSynthesizer(cfg, null);
    const words = []; let cursor = 0;
    synth.wordBoundary = (_s, e) => {
      if (e.boundaryType !== undefined && e.boundaryType !== sdk.SpeechSynthesisBoundaryType.Word) return;
      const w = e.text || '';
      const at = w ? text.indexOf(w, cursor) : -1;
      if (at >= 0) { words.push([at, Math.round(e.audioOffset / 10000)]); cursor = at + w.length; }
    };
    synth.speakSsmlAsync(ssml(lang, voice, text), (r) => {
      synth.close();
      if (r.reason === sdk.ResultReason.SynthesizingAudioCompleted) resolve({ audio: Buffer.from(r.audioData), words, ms: Math.round(r.audioDuration / 10000) });
      else reject(new Error(`${r.reason} ${r.errorDetails || ''}`));
    }, (err) => { synth.close(); reject(new Error(String(err))); });
  });
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Samples for choosing the voices: one passage per language with several voices
if (process.env.SAMPLES === '1') {
  const SAMPLE = {
    es: { text: 'Había una vez una niña que quería aprender a leer cuentos de dragones. Cada día leía un poquito más, y un día se dio cuenta de que ya no le costaba.', voices: ['es-ES-ElviraNeural', 'es-ES-XimenaNeural', 'es-ES-AbrilNeural', 'es-ES-AlvaroNeural', 'es-ES-TrianaNeural'] },
    ca: { text: 'Hi havia una vegada una xiqueta que volia aprendre a llegir contes de dracs. Cada dia llegia un poquet més, i un dia es va adonar que ja no li costava.', voices: ['ca-ES-JoanaNeural', 'ca-ES-AlbaNeural', 'ca-ES-EnricNeural'] },
    en: { text: 'Once upon a time, a girl wanted to learn to read stories about dragons. Every day she read a little more, and one day she realised it was not hard any more.', voices: ['en-GB-SoniaNeural', 'en-GB-LibbyNeural', 'en-GB-MaisieNeural', 'en-GB-RyanNeural', 'en-GB-AbbiNeural'] },
  };
  const dir = join(outDir, 'samples'); mkdirSync(dir, { recursive: true });
  const list = [];
  for (const [lang, s] of Object.entries(SAMPLE)) {
    for (const v of s.voices) {
      try {
        const r = await synth(lang, v, s.text);
        writeFileSync(join(dir, `${v}.mp3`), r.audio); list.push({ lang, voice: v, file: `${v}.mp3` });
        console.log('sample', v, r.ms, 'ms');
      } catch (e) { console.log('sample failed', v, e.message); }
      await sleep(PACE_MS);
    }
  }
  writeFileSync(join(dir, 'samples.json'), JSON.stringify({ texts: Object.fromEntries(Object.entries(SAMPLE).map(([l, s]) => [l, s.text])), list }, null, 1));
  process.exit(0);
}

let made = 0, failed = 0, stop = '';
for (const lang of Object.keys(VOICES)) {
  if (process.env.ONLY_LANG && process.env.ONLY_LANG !== lang) continue;
  const dir = join(outDir, lang); mkdirSync(dir, { recursive: true });
  const mf = join(dir, 'manifest.json');
  let manifest = existsSync(mf) ? JSON.parse(readFileSync(mf, 'utf8')) : { voice: VOICES[lang], items: {} };
  if (manifest.voice !== VOICES[lang]) manifest = { voice: VOICES[lang], items: {} }; // new voice: start again
  const wanted = texts[lang] || {};
  // forget clips of texts that no longer exist (the files stay until the branch is cleaned)
  for (const k of Object.keys(manifest.items)) if (!wanted[k]) delete manifest.items[k];
  const todo = Object.entries(wanted).filter(([k]) => !manifest.items[k] || !existsSync(join(dir, `${k}.mp3`)));
  console.log(`${lang}: ${Object.keys(manifest.items).length} done, ${todo.length} to do`);
  for (const [k, text] of todo) {
    if (Date.now() > deadline) { stop = 'time'; break; }
    if (budget - text.length < 0) { stop = 'characters'; break; }
    try {
      const r = await synth(lang, VOICES[lang], text);
      writeFileSync(join(dir, `${k}.mp3`), r.audio);
      writeFileSync(join(dir, `${k}.json`), JSON.stringify({ ms: r.ms, w: r.words }));
      manifest.items[k] = 1; budget -= text.length; made++;
      if (made % 50 === 0) { writeFileSync(mf, JSON.stringify(manifest)); console.log(`  ${made} clips, ${budget} chars left`); }
    } catch (e) {
      failed++;
      console.log('  failed:', JSON.stringify(text.slice(0, 40)), e.message);
      if (/quota|429|403|Forbidden|Unauthorized/i.test(e.message)) { stop = 'quota or key: ' + e.message.slice(0, 80); break; }
      if (failed > 30) { stop = 'too many errors'; break; }
    }
    await sleep(PACE_MS);
  }
  writeFileSync(mf, JSON.stringify(manifest));
  if (stop) break;
}
console.log(`made ${made}, failed ${failed}${stop ? `, stopped: ${stop}` : ''}`);
