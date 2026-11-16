"""
How strict can the in-app reading recogniser (Vosk restricted to the words of the text) be made with words
that are *almost* right? Compares, on sentences from Lectorix read by synthetic voices:
  text        the recogniser as it is in the app: only the words of the text (+ unknown)
  text+nb     the words of the text plus, for each one, real words that sound close to it ("rivals"),
              so a near miss has somewhere else to go
  text+nb@T   the same, and a word only counts if the recogniser's confidence is at least T
  two-pass    "text" and, in parallel, free recognition: a word counts only if both heard it
Cases: read correctly / one word changed for a made-up near miss / one word changed for a close real word /
3 made-up words / 3 words skipped / all gibberish.
  python scripts/asr/eval2.py <voices-dir> <vosk-models-dir>
"""
import gzip, json, os, re, sys, time, random
import numpy as np
from piper import PiperVoice, SynthesisConfig
from vosk import Model, KaldiRecognizer, SetLogLevel
SetLogLevel(-1)
random.seed(11)
voices_dir, models_dir = sys.argv[1:3]
HERE = os.path.dirname(__file__)
ROOT = os.path.join(HERE, '..', '..', 'src', 'data')
DICT = os.path.join(HERE, '..', '..', 'public', 'dict')
LANGS = {
    'es': dict(readings='lecturas.json', voices=['es_ES-davefx-medium', 'es_ES-sharvard-medium'], vosk='vosk-model-small-es-0.42', fake=['tururú', 'pimpampum', 'zorfino', 'mertaco', 'lupendo', 'brinfa'], abc='abcdefghijlmnñopqrstuvzáéíóú'),
    'ca': dict(readings='lectures.ca.json', voices=['ca_ES-upc_ona-medium'], vosk='vosk-model-small-ca-0.4', fake=['tururut', 'pimpam', 'zorfí', 'mertac', 'lupent', 'brinfa'], abc='abcçdefghijlmnopqrstuvxzàèéíòóú'),
    'en': dict(readings='readings.en.json', voices=['en_GB-cori-high', 'en_GB-northern_english_male-medium'], vosk='vosk-model-small-en-us-0.15', fake=['blorp', 'zindle', 'framble', 'torkle', 'mubbin', 'glemp'], abc='abcdefghijklmnopqrstuvwxyz'),
}
NB_PER_WORD = int(os.environ.get('NB_PER_WORD', '6'))
TOP = int(os.environ.get('NB_TOP', '40000'))
norm = lambda w: re.sub(r"[^\w'·-]", '', w.lower(), flags=re.U).strip("'-")
def words(s): return [w for w in (norm(x) for x in s.split()) if w]

def lcs_matched(target, hyp):
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
    swaps = {'p': 'b', 'b': 'p', 't': 'd', 'd': 't', 'c': 'g', 'g': 'c', 'm': 'n', 'n': 'm', 'r': 'l', 'l': 'r', 's': 'f', 'f': 's'}
    for i, ch in enumerate(w):
        if ch in swaps: return w[:i] + swaps[ch] + w[i + 1:]
    return w + 'a'

def rivals(w, rank, abc, limit):
    """Real words one letter away from w (changed, added or removed), most frequent first. Same rule as the app."""
    if len(w) < 3: return []
    out = set()
    for i in range(len(w) + 1):
        if i < len(w):
            out.add(w[:i] + w[i + 1:])
            for ch in abc: out.add(w[:i] + ch + w[i + 1:])
        for ch in abc: out.add(w[:i] + ch + w[i:])
    out.discard(w)
    return sorted((x for x in out if x in rank), key=lambda x: rank[x])[:limit]

def synth(voice, text):
    cfg = SynthesisConfig(length_scale=1.1, speaker_id=0) if voice.config.num_speakers > 1 else SynthesisConfig(length_scale=1.1)
    chunks = list(voice.synthesize(text, syn_config=cfg))
    audio = np.concatenate([c.audio_float_array for c in chunks]); rate = chunks[0].sample_rate
    idx = np.linspace(0, len(audio) - 1, int(len(audio) * 16000 / rate))
    return (np.interp(idx, np.arange(len(audio)), audio) * 32767).astype(np.int16)

def vosk_run(model, pcm, grammar=None):
    """[(word, confidence)]"""
    rec = KaldiRecognizer(model, 16000, json.dumps(grammar, ensure_ascii=False)) if grammar else KaldiRecognizer(model, 16000)
    rec.SetWords(True)
    out = []
    step = 8000
    for i in range(0, len(pcm), step):
        if rec.AcceptWaveform(pcm[i:i + step].tobytes()):
            out += json.loads(rec.Result()).get('result', [])
    out += json.loads(rec.FinalResult()).get('result', [])
    return [(norm(r['word']), r.get('conf', 1.0)) for r in out if r['word'] != '[unk]' and norm(r['word'])]

THRESH = [0.5, 0.7, 0.85, 0.95, 1.0]
ENGINES = ['text', 'text+nb'] + [f'text+nb@{t}' for t in THRESH] + [f'text@{t}' for t in (0.7, 0.95)] + ['two-pass']
report = {}
for lang, c in LANGS.items():
    freq = gzip.open(os.path.join(DICT, lang + '.frz')).read().decode('utf-8').split('\n')
    rank = {w: i for i, w in enumerate(freq[:TOP]) if w}
    data = json.load(open(os.path.join(ROOT, c['readings']), encoding='utf-8'))['readings']
    sents = []
    for r in data:
        if r['level'] > 6: continue
        for s in re.split(r'(?<=[.!?])\s+', r['text']):
            if 7 <= len(words(s)) <= 16: sents.append(s)
    sents = random.sample(sents, min(int(os.environ.get('N_SENT', '30')), len(sents)))
    model = Model(os.path.join(models_dir, c['vosk']))
    stats = {e: dict(ok_hit=0, ok_tot=0, near_acc=0, near_tot=0, real_acc=0, real_tot=0, fake_acc=0, fake_tot=0, skip_acc=0, skip_tot=0, gib_acc=0, gib_tot=0) for e in ENGINES}
    secs = {'text': 0.0, 'text+nb': 0.0, 'free': 0.0}; audio = 0.0; nb_sizes = []
    for vname in c['voices']:
        vp = os.path.join(voices_dir, vname + '.onnx')
        if not os.path.exists(vp): print('missing voice', vname); continue
        voice = PiperVoice.load(vp, vp + '.json')
        for s in sents:
            tgt = words(s)
            cands = [i for i, w in enumerate(tgt) if len(w) >= 4] or list(range(len(tgt)))
            if len(cands) < 3: cands = list(range(len(tgt)))
            pos = sorted(random.sample(cands, 3))
            base = sorted(set(tgt))
            nb = sorted({x for w in base for x in rivals(w, rank, c['abc'], NB_PER_WORD)} - set(base))
            nb_sizes.append(len(nb))
            # a close real word for one of the words, if there is one that is not already in the sentence
            real_i, real_w = None, None
            for i in pos:
                r = [x for x in rivals(tgt[i], rank, c['abc'], 3) if x not in base]
                if r: real_i, real_w = i, r[0]; break
            def spoken(kind):
                toks = list(tgt)
                if kind == 'fake':
                    for k, i in enumerate(pos): toks[i] = c['fake'][k % len(c['fake'])]
                elif kind == 'skip': toks = [w for i, w in enumerate(toks) if i not in pos]
                elif kind == 'near': toks[pos[0]] = near(toks[pos[0]])
                elif kind == 'real': toks[real_i] = real_w
                elif kind == 'gib': toks = [c['fake'][i % len(c['fake'])] for i in range(len(toks))]
                return ' '.join(toks)
            for kind in ['ok', 'near', 'real', 'fake', 'skip', 'gib']:
                if kind == 'real' and real_w is None: continue
                pcm = synth(voice, s if kind == 'ok' else spoken(kind)); audio += len(pcm) / 16000
                t0 = time.time(); h_text = vosk_run(model, pcm, base + ['[unk]']); secs['text'] += time.time() - t0
                t0 = time.time(); h_nb = vosk_run(model, pcm, base + nb + ['[unk]']); secs['text+nb'] += time.time() - t0
                t0 = time.time(); h_free = vosk_run(model, pcm); secs['free'] += time.time() - t0
                hyps = {'text': [w for w, _ in h_text], 'text+nb': [w for w, _ in h_nb]}
                for t in THRESH: hyps[f'text+nb@{t}'] = [w for w, cf in h_nb if cf >= t]
                for t in (0.7, 0.95): hyps[f'text@{t}'] = [w for w, cf in h_text if cf >= t]
                for e in ENGINES:
                    if e == 'two-pass': hit = lcs_matched(tgt, hyps['text']) & lcs_matched(tgt, [w for w, _ in h_free])
                    else: hit = lcs_matched(tgt, hyps[e])
                    st = stats[e]
                    if kind == 'ok': st['ok_hit'] += len(hit); st['ok_tot'] += len(tgt)
                    elif kind == 'near': st['near_acc'] += int(pos[0] in hit); st['near_tot'] += 1
                    elif kind == 'real': st['real_acc'] += int(real_i in hit); st['real_tot'] += 1
                    elif kind == 'fake': st['fake_acc'] += len(hit & set(pos)); st['fake_tot'] += len(pos)
                    elif kind == 'skip': st['skip_acc'] += len(hit & set(pos)); st['skip_tot'] += len(pos)
                    else: st['gib_acc'] += len(hit); st['gib_tot'] += len(tgt)
    pct = lambda a, b: round(100 * a / b, 1) if b else None
    report[lang] = {e: [pct(st['ok_hit'], st['ok_tot']), pct(st['near_acc'], st['near_tot']), pct(st['real_acc'], st['real_tot']), pct(st['fake_acc'], st['fake_tot']), pct(st['skip_acc'], st['skip_tot']), pct(st['gib_acc'], st['gib_tot'])] for e, st in stats.items()}
    print(f"\n{lang}: {stats['text']['near_tot']} sentences x voices, rivals per sentence avg {sum(nb_sizes) / max(1, len(nb_sizes)):.0f}; speed x realtime: " + ', '.join(f"{k} {audio / v:.0f}" for k, v in secs.items() if v))
    print(f"{'engine':14} {'ok%':>6} {'near%':>6} {'real%':>6} {'fake%':>6} {'skip%':>6} {'gib%':>6}   (ok = right words recognised; the rest = wrong words accepted)")
    for e in ENGINES: print(f"{e:14} " + ' '.join(f"{'' if v is None else v:>6}" for v in report[lang][e]), flush=True)
print('\nJSON', json.dumps(report))
