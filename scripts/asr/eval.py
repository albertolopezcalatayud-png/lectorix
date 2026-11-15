"""
Which free on-device recogniser can check a child's reading? Compares, on sentences from Lectorix read by
synthetic voices: Vosk restricted to the words of the text (+ unknown), Vosk free, and Whisper (base).
Cases: read correctly / made-up words instead of 3 words / 3 words skipped / one word changed slightly / all gibberish.
  python scripts/asr/eval.py <voices-dir> <vosk-models-dir>
"""
import json, os, re, sys, time, random, wave, io
import numpy as np
from piper import PiperVoice, SynthesisConfig
from vosk import Model, KaldiRecognizer, SetLogLevel
SetLogLevel(-1)
random.seed(7)
voices_dir, models_dir = sys.argv[1:3]
ROOT = os.path.join(os.path.dirname(__file__), '..', '..', 'src', 'data')
LANGS = {
    'es': dict(readings='lecturas.json', voice='es_ES-davefx-medium', vosk='vosk-model-small-es-0.42', fake=['tururú', 'pimpampum', 'zorfino', 'mertaco', 'lupendo', 'brinfa']),
    'ca': dict(readings='lectures.ca.json', voice='ca_ES-upc_ona-medium', vosk='vosk-model-small-ca-0.4', fake=['tururut', 'pimpam', 'zorfí', 'mertac', 'lupent', 'brinfa']),
    'en': dict(readings='readings.en.json', voice='en_GB-cori-high', vosk='vosk-model-small-en-us-0.15', fake=['blorp', 'zindle', 'framble', 'torkle', 'mubbin', 'glemp']),
}
norm = lambda w: re.sub(r"[^\w'·-]", '', w.lower(), flags=re.U).strip("'-")
def words(s): return [w for w in (norm(x) for x in s.split()) if w]

def lcs_matched(target, hyp):
    """Indexes of target words found, in order, in the hypothesis."""
    n, m = len(target), len(hyp); dp = [[0] * (m + 1) for _ in range(n + 1)]
    for i in range(n - 1, -1, -1):
        for j in range(m - 1, -1, -1):
            dp[i][j] = dp[i + 1][j + 1] + 1 if target[i] == hyp[j] else max(dp[i + 1][j], dp[i][j + 1])
    i = j = 0; out = set()
    while i < n and j < m:
        if target[i] == hyp[j]: out.add(i); i += 1; j += 1
        elif dp[i + 1][j] >= dp[i][j + 1]: i += 1
        else: j += 1
    return out

def near(w):
    """A slightly wrong version of a word (one consonant changed)."""
    swaps = {'p': 'b', 'b': 'p', 't': 'd', 'd': 't', 'c': 'g', 'g': 'c', 'm': 'n', 'n': 'm', 'r': 'l', 'l': 'r', 's': 'f', 'f': 's'}
    for i, ch in enumerate(w):
        if ch in swaps: return w[:i] + swaps[ch] + w[i + 1:]
    return w + 'a'

def synth(voice, text):
    chunks = list(voice.synthesize(text, syn_config=SynthesisConfig(length_scale=1.1)))
    audio = np.concatenate([c.audio_float_array for c in chunks]); rate = chunks[0].sample_rate
    # to 16 kHz mono int16
    idx = np.linspace(0, len(audio) - 1, int(len(audio) * 16000 / rate))
    return (np.interp(idx, np.arange(len(audio)), audio) * 32767).astype(np.int16)

def vosk_run(model, pcm, grammar=None):
    rec = KaldiRecognizer(model, 16000, json.dumps(grammar, ensure_ascii=False)) if grammar else KaldiRecognizer(model, 16000)
    rec.AcceptWaveform(pcm.tobytes()); return words(json.loads(rec.FinalResult()).get('text', '').replace('[unk]', ' '))

whisper = None
try:
    from faster_whisper import WhisperModel
    whisper = WhisperModel('base', device='cpu', compute_type='int8')
except Exception as e: print('whisper unavailable', e)
def whisper_run(pcm, lang):
    segs, _ = whisper.transcribe(pcm.astype(np.float32) / 32768, language=lang, beam_size=1, condition_on_previous_text=False)
    return words(' '.join(s.text for s in segs))

report = {}
for lang, c in LANGS.items():
    data = json.load(open(os.path.join(ROOT, c['readings']), encoding='utf-8'))['readings']
    sents = []
    for r in data:
        if r["level"] > 6: continue
        for s in re.split(r'(?<=[.!?])\s+', r['text']):
            if 7 <= len(words(s)) <= 16: sents.append(s)
    sents = random.sample(sents, min(25, len(sents)))
    voice = PiperVoice.load(os.path.join(voices_dir, c['voice'] + '.onnx'), os.path.join(voices_dir, c['voice'] + '.onnx.json'))
    model = Model(os.path.join(models_dir, c['vosk']))
    engines = {'vosk_text': None, 'vosk_free': None}
    if whisper: engines['whisper_base'] = None
    stats = {e: dict(ok_hit=0, ok_tot=0, fake_acc=0, fake_tot=0, skip_acc=0, skip_tot=0, near_acc=0, near_tot=0, gib_acc=0, gib_tot=0, secs=0.0, audio=0.0) for e in engines}
    for s in sents:
        raw = s.split(); tgt = words(s)
        cands = [i for i, w in enumerate(tgt) if len(w) >= 4]
        if len(cands) < 3: cands = list(range(len(tgt)))
        pos = sorted(random.sample(cands, 3))
        def spoken(kind):
            toks = list(tgt)
            if kind == 'fake':
                for k, i in enumerate(pos): toks[i] = c['fake'][k % len(c['fake'])]
            elif kind == 'skip': toks = [w for i, w in enumerate(toks) if i not in pos]
            elif kind == 'near': toks[pos[0]] = near(toks[pos[0]])
            elif kind == 'gib': toks = [c['fake'][i % len(c['fake'])] for i in range(len(toks))]
            return ' '.join(toks)
        grammar = sorted(set(tgt)) + ['[unk]']
        for kind in ['ok', 'fake', 'skip', 'near', 'gib']:
            pcm = synth(voice, s if kind == 'ok' else spoken(kind))
            for e in engines:
                t0 = time.time()
                hyp = vosk_run(model, pcm, grammar) if e == 'vosk_text' else vosk_run(model, pcm) if e == 'vosk_free' else whisper_run(pcm, lang)
                st = stats[e]; st['secs'] += time.time() - t0; st['audio'] += len(pcm) / 16000
                hit = lcs_matched(tgt, hyp)
                if kind == 'ok': st['ok_hit'] += len(hit); st['ok_tot'] += len(tgt)
                elif kind == 'fake': st['fake_acc'] += len(hit & set(pos)); st['fake_tot'] += len(pos)
                elif kind == 'skip': st['skip_acc'] += len(hit & set(pos)); st['skip_tot'] += len(pos)
                elif kind == 'near': st['near_acc'] += int(pos[0] in hit); st['near_tot'] += 1
                else: st['gib_acc'] += len(hit); st['gib_tot'] += len(tgt)
    report[lang] = {e: {
        'read_correctly_recognised_%': round(100 * st['ok_hit'] / st['ok_tot'], 1),
        'made_up_words_accepted_%': round(100 * st['fake_acc'] / st['fake_tot'], 1),
        'skipped_words_accepted_%': round(100 * st['skip_acc'] / st['skip_tot'], 1),
        'slightly_wrong_word_accepted_%': round(100 * st['near_acc'] / st['near_tot'], 1),
        'gibberish_words_accepted_%': round(100 * st['gib_acc'] / st['gib_tot'], 1),
        'speed_x_realtime': round(st['audio'] / st['secs'], 1),
    } for e, st in stats.items()}
    print('RESULT', lang, json.dumps(report[lang]), flush=True)
