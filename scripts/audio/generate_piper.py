"""
Natural-voice audio for Lectorix's fixed texts, with free Piper voices (no accounts, runs in GitHub Actions).
  python scripts/audio/generate_piper.py <texts.json> <voices-dir> <out-dir>
Writes <out>/<lang>/<voice>/<key>.mp3 + <key>.json (word timings) + manifest.json, and <out>/voices.json.
Only missing clips are generated, so it can run again after content changes.
"""
import json, os, re, sys, time, wave, io
import numpy as np
import lameenc
from piper import PiperVoice, SynthesisConfig

texts_file, voices_dir, out_dir = sys.argv[1:4]
TEXTS = json.load(open(texts_file, encoding='utf-8'))
VOICES = json.load(open(os.path.join(os.path.dirname(__file__), 'voices.json'), encoding='utf-8'))
DEADLINE = time.time() + float(os.environ.get('MAX_MINUTES', '320')) * 60
LENGTH_SCALE = 1.06      # a touch slower than the model's default: clearer for children
GAP_S = 0.28             # pause between sentences
WORD = re.compile(r"\S*[^\W\d_]\S*")   # a word: any run of non-spaces that contains a letter

def encode_mp3(samples: np.ndarray, rate: int) -> bytes:
    enc = lameenc.Encoder(); enc.set_bit_rate(40); enc.set_in_sample_rate(rate); enc.set_channels(1); enc.set_quality(2)
    pcm = (np.clip(samples, -1, 1) * 32767).astype(np.int16).tobytes()
    return enc.encode(pcm) + enc.flush()

def word_starts_from_alignment(chunks):
    """Start time (s) of each spoken word, from the phoneme alignments (a space phoneme separates words)."""
    starts, t = [], 0.0
    for ch in chunks:
        al = ch.phoneme_alignments
        if not al: return None
        rate = ch.sample_rate; in_word = False; pos = 0
        for a in al:
            is_letter = bool(re.search(r"[^\s\^\$_.,;:!?¡¿\"'«»()—-]", a.phoneme))
            if is_letter and not in_word: starts.append(t + pos / rate); in_word = True
            elif a.phoneme == ' ': in_word = False
            pos += a.num_samples
        t += len(ch.audio_float_array) / rate + GAP_S
    return starts

def estimate_word_starts(text, total_s):
    """Fallback: spread the words over the clip by their length (with pauses after punctuation)."""
    words = list(WORD.finditer(text)); weights = []
    for m in words:
        w = len(re.sub(r"\W", "", m.group())) + 1.5
        if re.search(r"[.!?]$", m.group()): w += 4
        elif re.search(r"[,;:]$", m.group()): w += 2
        weights.append(w)
    tot = sum(weights) or 1; t = 0.05 * total_s; usable = 0.9 * total_s; out = []
    for w in weights: out.append(t); t += usable * w / tot
    return out

SAMPLE = {
    'es': 'Había una vez una niña que quería aprender a leer cuentos de dragones. Cada día leía un poquito más.',
    'ca': 'Hi havia una vegada una xiqueta que volia aprendre a llegir contes de dracs. Cada dia llegia un poquet més.',
    'en': 'Once upon a time, a girl wanted to learn to read stories about dragons. Every day she read a little more.',
}
made = failed = 0; stop = ''
index = {}
for lang, voices in VOICES.items():
    index[lang] = [{k: v[k] for k in ('id', 'name', 'license', 'credit')} for v in voices]
    for v in voices:
        if time.time() > DEADLINE: stop = 'time'; break
        base = os.path.join(voices_dir, os.path.basename(v['model']))
        voice = PiperVoice.load(base + '.onnx', base + '.onnx.json', include_alignments=True)
        cfg = SynthesisConfig(speaker_id=v['speaker'], length_scale=LENGTH_SCALE)
        d = os.path.join(out_dir, lang, v['id']); os.makedirs(d, exist_ok=True)
        # a sample to listen to before choosing the voice
        smp = os.path.join(d, 'sample.mp3')
        if not os.path.exists(smp):
            ch = list(voice.synthesize(SAMPLE[lang], syn_config=cfg))
            g = np.zeros(int(GAP_S * ch[0].sample_rate), dtype=np.float32)
            open(smp, 'wb').write(encode_mp3(np.concatenate([x for c in ch for x in (c.audio_float_array, g)][:-1]), ch[0].sample_rate))
        mf = os.path.join(d, 'manifest.json')
        manifest = json.load(open(mf)) if os.path.exists(mf) else {'voice': v['id'], 'items': {}}
        wanted = TEXTS.get(lang, {})
        manifest['items'] = {k: 1 for k in manifest['items'] if k in wanted}
        todo = [(k, t) for k, t in wanted.items() if k not in manifest['items'] or not os.path.exists(os.path.join(d, k + '.mp3'))]
        print(f'{lang}/{v["id"]}: {len(manifest["items"])} done, {len(todo)} to do', flush=True)
        exact = est = 0
        for n, (k, text) in enumerate(todo):
            if time.time() > DEADLINE: stop = 'time'; break
            try:
                chunks = list(voice.synthesize(text, syn_config=cfg, include_alignments=True))
                if not chunks: raise RuntimeError('no audio')
                rate = chunks[0].sample_rate
                gap = np.zeros(int(GAP_S * rate), dtype=np.float32)
                audio = np.concatenate([x for ch in chunks for x in (ch.audio_float_array, gap)][:-1])
                total = len(audio) / rate
                words = list(WORD.finditer(text))
                starts = word_starts_from_alignment(chunks)
                if starts is None or len(starts) != len(words): starts = estimate_word_starts(text, total); est += 1
                else: exact += 1
                open(os.path.join(d, k + '.mp3'), 'wb').write(encode_mp3(audio, rate))
                json.dump({'ms': round(total * 1000), 'w': [[m.start(), round(s * 1000)] for m, s in zip(words, starts)]}, open(os.path.join(d, k + '.json'), 'w'))
                manifest['items'][k] = 1; made += 1
            except Exception as e:
                failed += 1; print('  failed', repr(text[:40]), e, flush=True)
                if failed > 200: stop = 'too many errors'; break
            if n % 500 == 499:
                json.dump(manifest, open(mf, 'w')); print(f'  {n + 1} clips (timings exact {exact}, estimated {est})', flush=True)
        json.dump(manifest, open(mf, 'w'))
        print(f'  {lang}/{v["id"]} timings: exact {exact}, estimated {est}', flush=True)
        if stop: break
    if stop: break
json.dump(index, open(os.path.join(out_dir, 'voices.json'), 'w'), ensure_ascii=False)
print(f'made {made}, failed {failed}' + (f', stopped: {stop}' if stop else ''))
