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

# ── Matxa multispeaker (Projecte AINA / BSC, GPL-3.0; data FestCat + OpenSLR69, CC BY-SA) ──
# Valencian voices: the model reads espeak-ng 'ca-va' (Valencian) phonemes. Only the generated audio goes
# into the app, never the model. One ONNX file (Matcha-TTS + HiFi-GAN): matcha_hifigan_simply.onnx.
MATXA_ONNX = os.environ.get('MATXA_ONNX', os.path.join(voices_dir, 'matxa_hifigan_simply.onnx'))
SENT_SPLIT = re.compile(r'(?<=[.!?…:;])\s+')

class MatxaVoice:
    _sess = None; _esp = None
    SYM = ['_'] + list(';:,.!?¡¿—…"«»“” ') + list('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz') + list("ɑɐɒæɓʙβɔɕçɗɖðʤəɘɚɛɜɝɞɟʄɡɠɢʛɦɧħɥʜɨɪʝɭɬɫɮʟɱɯɰŋɳɲɴøɵɸθœɶʘɹɺɾɻʀʁɽʂʃʈʧʉʊʋⱱʌɣɤʍχʎʏʑʐʒʔʡʕʢǀǁǂǃˈˌːˑʼʴʰʱʲʷˠˤ˞↓↑→↗↘'̩'ᵻ")
    RATE = 22050
    def __init__(self, spk, espeak='ca-va'):
        import onnxruntime as ort
        from piper.phonemize_espeak import EspeakPhonemizer
        if MatxaVoice._sess is None:
            MatxaVoice._sess = ort.InferenceSession(MATXA_ONNX)
            MatxaVoice._esp = EspeakPhonemizer()
        self.spk = spk; self.espeak = espeak; self.sid = {c: i for i, c in enumerate(self.SYM)}
    @staticmethod
    def fold(ph):
        # the voices never heard /v/ (their recordings are Central Catalan, which has none)
        return [('b' if (i == 0 or ph[i - 1] in (' ', 'm', 'n')) else 'β') if c == 'v' else c for i, c in enumerate(ph)]
    def phonemes(self, text):
        return ' '.join(''.join(self.fold(s)) for s in MatxaVoice._esp.phonemize(self.espeak, text)).strip()
    def audio(self, text, scale):
        seq = [self.sid[c] for c in self.phonemes(text) if c in self.sid]
        if not seq: return np.zeros(0, dtype=np.float32)
        x = [0] * (len(seq) * 2 + 1); x[1::2] = seq
        feed = {'x': np.array([x], dtype=np.int64), 'x_lengths': np.array([len(x)], dtype=np.int64),
                'scales': np.array([0.667, scale], dtype=np.float32), 'spks': np.array([self.spk], dtype=np.int64)}
        outs = [o.name for o in MatxaVoice._sess.get_outputs()]
        a = np.asarray(dict(zip(outs, MatxaVoice._sess.run(None, feed)))['hfaudio']).squeeze().astype(np.float32)
        return a / max(1e-4, float(np.abs(a).max())) * 0.9
    def sentences(self, text, scale):
        """[(char offset, sentence, audio)], one sentence at a time, as Piper does"""
        out, pos = [], 0
        for part in SENT_SPLIT.split(text.strip()):
            if not part.strip(): continue
            off = text.find(part, pos); pos = off + len(part)
            out.append((off, part, self.audio(part, scale)))
        return out

_vosk = {}
def vosk_word_times(lang, audio, rate, words):
    """Start (s) of the words of a sentence, found by the recogniser listening for exactly those words; None where not found"""
    path = os.environ.get('VOSK_' + lang.upper())
    if not path or not os.path.exists(path) or not words: return [None] * len(words)
    from vosk import Model, KaldiRecognizer, SetLogLevel
    SetLogLevel(-1)
    if lang not in _vosk: _vosk[lang] = Model(path)
    norm = lambda w: re.sub(r"[^\w'·-]", '', w.lower()).strip("'-")
    target = [norm(w) for w in words]
    rec = KaldiRecognizer(_vosk[lang], 16000, json.dumps(sorted({t for t in target if t}) + ['[unk]'], ensure_ascii=False)); rec.SetWords(True)
    idx = np.linspace(0, len(audio) - 1, int(len(audio) * 16000 / rate))
    pcm = (np.interp(idx, np.arange(len(audio)), audio) * 32767).astype(np.int16).tobytes()
    heard = []
    for i in range(0, len(pcm), 16000):
        if rec.AcceptWaveform(pcm[i:i + 16000]): heard += json.loads(rec.Result()).get('result', [])
    heard += json.loads(rec.FinalResult()).get('result', [])
    out = [None] * len(words); j = 0
    for h in heard:  # in order: each heard word to the next text word that is the same
        for k in range(j, min(len(target), j + 4)):
            if target[k] == h['word']: out[k] = h['start']; j = k + 1; break
    return out

def matxa_clip(mv, lang, text, scale):
    """Audio of a text and the start of each word: recogniser anchors, the rest by sound length in between"""
    parts = mv.sentences(text, scale)
    gap = np.zeros(int(GAP_S * mv.RATE), dtype=np.float32)
    audio = np.concatenate([x for _, _, a in parts for x in (a, gap)][:-1]) if parts else np.zeros(0, dtype=np.float32)
    starts = []; t0 = 0.0; anchored = 0
    for off, sent, a in parts:
        dur = len(a) / mv.RATE
        ws = list(WORD.finditer(sent))
        weights = []
        for m in ws:
            w = len(mv.phonemes(m.group())) + 1
            if re.search(r"[,;:]$", m.group()): w += 3
            weights.append(w)
        tot = sum(weights) or 1; lead = 0.04 * dur; usable = 0.92 * dur
        est = []; t = lead
        for w in weights: est.append(t); t += usable * w / tot
        found = vosk_word_times(lang, a, mv.RATE, [m.group() for m in ws])
        # keep the recogniser's times; shift the estimates between two anchors to fit them
        final = list(est); idx = [i for i, f in enumerate(found) if f is not None]
        anchored += len(idx)
        for i in idx: final[i] = found[i]
        bounds = [(-1, 0.0, 0.0)] + [(i, found[i], est[i]) for i in idx] + [(len(ws), dur, dur)]
        for (a_i, a_t, a_e), (b_i, b_t, b_e) in zip(bounds, bounds[1:]):
            for i in range(a_i + 1, b_i):
                r = (est[i] - a_e) / max(1e-6, (b_e - a_e))
                final[i] = a_t + r * (b_t - a_t)
        starts += [t0 + x for x in final]
        t0 += dur + GAP_S
    return audio, starts, anchored

# Dictation, recorded slow by the voice itself: slowing a normal clip down in the phone smears the sounds.
# 'slow' for the normal dictation button (the app asks rate 0.7 / 0.75), 'slower' for the 🐢 button.
SLOW_SETS = {'slow': {'word': 1.32, 'sentence': 1.25}, 'slower': {'word': 1.6, 'sentence': 1.5}}
PAD_S = 0.15  # a little silence before and after: the first sound is not cut on any phone

def make_slow_sets(voice, v, lang, d):
    wanted = TEXTS.get('_dictation', {}).get(lang, {})
    for name, scales in SLOW_SETS.items():
        sd = os.path.join(d, name); os.makedirs(sd, exist_ok=True)
        mf = os.path.join(sd, 'manifest.json')
        man = json.load(open(mf)) if os.path.exists(mf) else {'voice': v['id'], 'pace': name, 'items': {}}
        man['items'] = {k: 1 for k in man['items'] if k in wanted and os.path.exists(os.path.join(sd, k + '.mp3'))}
        todo = [(k, t) for k, t in wanted.items() if k not in man['items']]
        for k, text in todo:
            try:
                scale = scales['sentence' if ' ' in text.strip() else 'word']
                if isinstance(voice, MatxaVoice):
                    rate = voice.RATE; gap = np.zeros(int(GAP_S * rate), dtype=np.float32)
                    parts = [a for _, _, a in voice.sentences(text, scale * v.get('scale', 1.0))]
                    body = [x for a in parts for x in (a, gap)][:-1]
                else:
                    ch = list(voice.synthesize(text, syn_config=SynthesisConfig(speaker_id=v['speaker'], length_scale=scale)))
                    rate = ch[0].sample_rate; gap = np.zeros(int(GAP_S * rate), dtype=np.float32)
                    body = [x for c in ch for x in (c.audio_float_array, gap)][:-1]
                pad = np.zeros(int(PAD_S * rate), dtype=np.float32)
                audio = np.concatenate([pad] + body + [pad])
                open(os.path.join(sd, k + '.mp3'), 'wb').write(encode_mp3(audio, rate))
                man['items'][k] = 1
            except Exception as e:
                print('  slow failed', repr(text[:40]), e, flush=True)
        json.dump(man, open(mf, 'w'))
        print(f'  {lang}/{v["id"]}/{name}: {len(man["items"])} dictation clips ({len(todo)} new)', flush=True)

SAMPLE = {
    'es': 'Había una vez una niña que quería aprender a leer cuentos de dragones. Cada día leía un poquito más.',
    'ca': 'Hi havia una vegada una xiqueta que volia aprendre a llegir contes de dracs. Cada dia llegia un poquet més.',
    'en': 'Once upon a time, a girl wanted to learn to read stories about dragons. Every day she read a little more.',
}
made = failed = 0; stop = ''
index = {}
for lang, voices in VOICES.items():
    index[lang] = []
    for v in voices:
        if time.time() > DEADLINE: stop = 'time'; break
        matxa = v.get('engine') == 'matxa'
        if matxa: voice = MatxaVoice(v['speaker'], v.get('espeak', 'ca-va'))
        else:
            base = os.path.join(voices_dir, os.path.basename(v['model']))
            voice = PiperVoice.load(base + '.onnx', base + '.onnx.json', include_alignments=True)
        cfg = SynthesisConfig(speaker_id=v['speaker'], length_scale=LENGTH_SCALE)
        mscale = LENGTH_SCALE * v.get('scale', 1.0)
        d = os.path.join(out_dir, lang, v['id']); os.makedirs(d, exist_ok=True)
        # a sample to listen to before choosing the voice
        smp = os.path.join(d, 'sample.mp3')
        if not os.path.exists(smp) and matxa:
            a, _, _ = matxa_clip(voice, lang, SAMPLE[lang], mscale); open(smp, 'wb').write(encode_mp3(a, voice.RATE))
        if not os.path.exists(smp):
            ch = list(voice.synthesize(SAMPLE[lang], syn_config=cfg))
            g = np.zeros(int(GAP_S * ch[0].sample_rate), dtype=np.float32)
            open(smp, 'wb').write(encode_mp3(np.concatenate([x for c in ch for x in (c.audio_float_array, g)][:-1]), ch[0].sample_rate))
        make_slow_sets(voice, v, lang, d)
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
                if matxa:
                    audio, starts, anch = matxa_clip(voice, lang, text, mscale)
                    if not len(audio): raise RuntimeError('no audio')
                    total = len(audio) / voice.RATE
                    words = list(WORD.finditer(text))
                    if len(starts) != len(words): starts = estimate_word_starts(text, total); est += 1
                    else: exact += 1 if anch else 0; est += 0 if anch else 1
                    open(os.path.join(d, k + '.mp3'), 'wb').write(encode_mp3(audio, voice.RATE))
                    json.dump({'ms': round(total * 1000), 'w': [[m.start(), round(s_ * 1000)] for m, s_ in zip(words, starts)]}, open(os.path.join(d, k + '.json'), 'w'))
                    manifest['items'][k] = 1; made += 1
                    continue
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
        if len(manifest['items']) >= 0.97 * len(wanted):
            index[lang].append({k: v[k] for k in ('id', 'name', 'license', 'credit')})
        if stop: break
    if stop: break
# a language whose new voices are not ready yet keeps the voices it had
old_index = os.path.join(out_dir, 'voices.json')
prev = json.load(open(old_index)) if os.path.exists(old_index) else {}
for lang in VOICES:
    if not index.get(lang): index[lang] = prev.get(lang, [])
json.dump(index, open(old_index, 'w'), ensure_ascii=False)
if stop: open(os.environ.get('STOP_FILE', '/tmp/audio-stop'), 'w').write(stop)
print(f'made {made}, failed {failed}' + (f', stopped: {stop}' if stop else ''))
