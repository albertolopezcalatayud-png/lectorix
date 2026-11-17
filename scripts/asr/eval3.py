"""
Near misses: does giving the recogniser more "places to go" catch them?
The in-app recogniser (Vosk) only listens for the words of the text plus some rivals; a made-up word one
letter away ("geto" for "gato") is then usually written down as the word of the text. Here the rivals are
chosen by *sound* from the recogniser's own vocabulary (espeak pronunciations, one sound away), instead of
by spelling from a frequency list, and in larger numbers. The app rule is applied: only a word heard
exactly counts as read.
Cases per sentence: read correctly; one word changed one letter (made-up word); two letters (made-up);
changed for a close real word.
  python scripts/asr/eval3.py <voices-dir> <vosk-models-dir>
Prints, per language and grammar: % of correctly read words counted as read (higher is better) and % of
changed words wrongly counted as read (lower is better).
"""
import gzip, json, os, re, struct, sys, random, subprocess
import numpy as np
from piper import PiperVoice, SynthesisConfig
from vosk import Model, KaldiRecognizer, SetLogLevel
from rapidfuzz.distance import Levenshtein
from rapidfuzz import process
SetLogLevel(-1)
random.seed(21)
voices_dir, models_dir = sys.argv[1:3]
HERE = os.path.dirname(__file__)
ROOT = os.path.join(HERE, '..', '..', 'src', 'data')
DICT = os.path.join(HERE, '..', '..', 'public', 'dict')
N_SENT = int(os.environ.get('N_SENT', '40'))
LANGS = {
    'es': dict(readings='lecturas.json', voices=['es_ES-davefx-medium', 'es_ES-sharvard-medium'], vosk='vosk-model-small-es-0.42', espeak='es', abc='abcdefghijlmnñopqrstuvzáéíóú'),
    'ca': dict(readings='lectures.ca.json', voices=['ca_ES-upc_ona-medium', 'ca_ES-upc_pau-x_low'], vosk='vosk-model-small-ca-0.4', espeak='ca', abc='abcçdefghijlmnopqrstuvxzàèéíòóú'),
    'en': dict(readings='readings.en.json', voices=['en_GB-cori-high', 'en_GB-northern_english_male-medium'], vosk='vosk-model-small-en-us-0.15', espeak='en-gb', abc='abcdefghijklmnopqrstuvwxyz'),
}
ONLY = os.environ.get('LANGS', 'es,ca,en').split(',')
SWAP = {'t': 'd', 'd': 't', 'p': 'b', 'b': 'p', 'c': 'g', 'g': 'c', 'k': 'g', 'm': 'n', 'n': 'm', 'r': 'l', 'l': 'r', 's': 'z', 'z': 's', 'f': 'v', 'v': 'f', 'a': 'e', 'e': 'a', 'o': 'u', 'u': 'o', 'i': 'e'}
norm = lambda w: re.sub(r"[^\w'·-]", '', w.lower(), flags=re.U).strip("'-")
def words(s): return [w for w in (norm(x) for x in s.split()) if w]

def vocab(model_dir):
    wt = os.path.join(model_dir, 'graph', 'words.txt')
    if os.path.exists(wt): return [l.split()[0] for l in open(wt, encoding='utf-8') if l.strip()]
    d = open(os.path.join(model_dir, 'graph', 'Gr.fst'), 'rb').read()
    p = d.find(struct.pack('<i', 2125658996)) + 4
    n = struct.unpack('<i', d[p:p + 4])[0]; p += 4 + n
    _, size = struct.unpack('<qq', d[p:p + 16]); p += 16
    out = []
    for _ in range(size):
        l = struct.unpack('<i', d[p:p + 4])[0]; p += 4; out.append(d[p:p + l].decode('utf-8', 'replace')); p += l + 8
    return out

def ipa(voice, ws):
    """espeak pronunciations, one per word (stress and length marks removed)"""
    out = subprocess.run(['espeak-ng', '-v', voice, '-q', '--ipa', '--sep=', '-b', '1'], input='\n'.join(ws) + '\n',
                         capture_output=True, text=True).stdout.split('\n')
    out = [re.sub(r"[ˈˌːˑ\s_-]", '', x) for x in out]
    return out[:len(ws)] if len(out) >= len(ws) else out + [''] * (len(ws) - len(out))

def synth(voice, text):
    cfg = SynthesisConfig(length_scale=1.1, speaker_id=0) if voice.config.num_speakers > 1 else SynthesisConfig(length_scale=1.1)
    chunks = list(voice.synthesize(text, syn_config=cfg))
    audio = np.concatenate([c.audio_float_array for c in chunks]); rate = chunks[0].sample_rate
    idx = np.linspace(0, len(audio) - 1, int(len(audio) * 16000 / rate))
    return (np.interp(idx, np.arange(len(audio)), audio) * 32767).astype(np.int16)

def vosk_run(model, pcm, grammar):
    rec = KaldiRecognizer(model, 16000, json.dumps(grammar, ensure_ascii=False))
    out = []
    for i in range(0, len(pcm), 8000):
        if rec.AcceptWaveform(pcm[i:i + 8000].tobytes()): out.append(json.loads(rec.Result()).get('text', ''))
    out.append(json.loads(rec.FinalResult()).get('text', ''))
    return [norm(w) for w in ' '.join(out).split() if w != '[unk]' and norm(w)]

def matched(target, hyp):
    """indices of the text read exactly, in order (longest common subsequence)"""
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

def spell_rivals(w, rank, abc, limit, minlen=4, skip=150):
    """the app's current rule: real words one letter away, most frequent first"""
    if len(w) < minlen or rank.get(w, 10**9) < skip: return []
    out = set()
    for i in range(len(w) + 1):
        if i < len(w):
            out.add(w[:i] + w[i + 1:])
            for ch in abc: out.add(w[:i] + ch + w[i + 1:])
        for ch in abc: out.add(w[:i] + ch + w[i:])
    out.discard(w)
    return sorted((x for x in out if x in rank), key=lambda x: rank[x])[:limit]

def mutate(w, n, vset):
    """a made-up word n letters away from w (not a real word)"""
    for _ in range(50):
        cs = list(w); idx = [i for i, ch in enumerate(cs) if ch in SWAP]
        if len(idx) < n: return None
        for i in random.sample(idx, n): cs[i] = SWAP[cs[i]]
        x = ''.join(cs)
        if x != w and x not in vset: return x
    return None

GRAMMARS = ['text', 'spell4', 'sound6', 'sound12', 'sound24', 'sound12+spell4']
for lang in ONLY:
    c = LANGS[lang]
    mdir = os.path.join(models_dir, c['vosk'])
    voc = [w for w in vocab(mdir) if w and not w.startswith('<') and not w.startswith('#') and w != '[unk]']
    vset = set(voc)
    freq = gzip.open(os.path.join(DICT, lang + '.frz')).read().decode('utf-8').split('\n')
    rank = {w: i for i, w in enumerate(freq[:200000]) if w}
    vprons = ipa(c['espeak'], voc)
    byp = {}
    for w, p in zip(voc, vprons):
        if p: byp.setdefault(p, []).append(w)
    plist = list(byp.keys())
    print(f'\n== {lang}: vocabulary {len(voc)} words, {len(plist)} pronunciations', flush=True)
    data = json.load(open(os.path.join(ROOT, c['readings']), encoding='utf-8'))['readings']
    sents = []
    for r in data:
        if r['level'] > 6: continue
        for s in re.split(r'(?<=[.!?])\s+', r['text']):
            if 6 <= len(words(s)) <= 16: sents.append(s)
    sents = random.sample(sents, min(N_SENT, len(sents)))
    allw = sorted({w for s in sents for w in words(s)})
    myp = dict(zip(allw, ipa(c['espeak'], allw)))
    def sound_rivals(w, limit):
        p = myp.get(w)
        if not p or len(w) < 3: return []
        hits = process.extract(p, plist, scorer=Levenshtein.distance, score_cutoff=1, limit=None)
        cands = {}
        for q, d, _ in hits:
            if d != 1: continue
            for x in byp[q]:
                # a sound changed (same length) first: the usual reading slip ("geto" for "gato")
                if x != w and x not in cands: cands[x] = (0 if len(q) == len(p) else 1, rank.get(x, 10**8))
        return sorted(cands, key=lambda x: cands[x])[:limit]
    model = Model(mdir)
    st = {g: dict(ok=0, okn=0, p1=0, p1n=0, p2=0, p2n=0, real=0, realn=0, size=0, sizen=0) for g in GRAMMARS}
    for vname in c['voices']:
        vp = os.path.join(voices_dir, vname + '.onnx')
        if not os.path.exists(vp): print('missing voice', vname); continue
        voice = PiperVoice.load(vp, vp + '.json')
        for s in sents:
            tgt = words(s); base = sorted(set(tgt))
            gr = {'text': base}
            sp = {w: spell_rivals(w, rank, c['abc'], 4) for w in base}
            so = {w: sound_rivals(w, 24) for w in base}
            gr['spell4'] = base + [x for w in base for x in sp[w]]
            for k in (6, 12, 24): gr[f'sound{k}'] = base + [x for w in base for x in so[w][:k]]
            gr['sound12+spell4'] = base + [x for w in base for x in so[w][:12] + sp[w]]
            gr = {g: sorted(set(v) - {''}) + ['[unk]'] for g, v in gr.items()}
            cands = [i for i, w in enumerate(tgt) if len(w) >= 4]
            if not cands: continue
            i = random.choice(cands)
            cases = [('ok', tgt, None)]
            for n, key in ((1, 'p1'), (2, 'p2')):
                m = mutate(tgt[i], n, vset)
                if m: cases.append((key, tgt[:i] + [m] + tgt[i + 1:], i))
            rl = [x for x in spell_rivals(tgt[i], rank, c['abc'], 3, 4, 0) + so[tgt[i]][:3] if x not in base]
            if rl: cases.append(('real', tgt[:i] + [rl[0]] + tgt[i + 1:], i))
            for key, toks, at in cases:
                pcm = synth(voice, ' '.join(toks))
                for g in GRAMMARS:
                    hit = matched(tgt, vosk_run(model, pcm, gr[g]))
                    S = st[g]
                    if key == 'ok': S['ok'] += len(hit); S['okn'] += len(tgt); S['size'] += len(gr[g]); S['sizen'] += 1
                    else: S[key] += int(at in hit); S[key + 'n'] += 1
            if lang == ONLY[0] and vname == c['voices'][0] and sents.index(s) < 3:
                print('  e.g.', tgt[i], 'sound rivals:', so[tgt[i]][:12], 'spell:', sp[tgt[i]], flush=True)
    pct = lambda a, b: f'{100 * a / b:5.1f}' if b else '  -  '
    print(f"{'grammar':16} {'words':>6} {'ok read':>8} | wrongly read: {'1 letter':>9} {'2 letters':>9} {'real word':>9}")
    for g in GRAMMARS:
        S = st[g]
        print(f"{g:16} {S['size'] / max(1, S['sizen']):6.0f} {pct(S['ok'], S['okn']):>8} | {'':14}{pct(S['p1'], S['p1n']):>9} {pct(S['p2'], S['p2n']):>9} {pct(S['real'], S['realn']):>9}", flush=True)
