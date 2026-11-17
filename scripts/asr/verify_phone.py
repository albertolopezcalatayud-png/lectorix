"""
Same question as verify_eval.py, with a model that hears sounds (phones), not words:
facebook/wav2vec2-lv-60-espeak-cv-ft (Apache 2.0, multilingual, IPA phones as written by eSpeak).
Recognisers trained on words learn which words exist and pull near misses towards them; a phone model has
no such prior, which is why research on children reading aloud uses phone recognisers.
Per word: (1) log-likelihood ratio of the forced phones against the best free phones; (2) competitor test:
is the sound better explained by the word with one phone changed or dropped?
  python scripts/asr/verify_phone.py <voices-dir>
"""
import gzip, json, os, re, sys, time, random
import numpy as np, torch, torchaudio
from piper import PiperVoice, SynthesisConfig
from transformers import Wav2Vec2ForCTC, Wav2Vec2Processor

torch.set_num_threads(int(os.environ.get('THREADS', '4')))
random.seed(5)
voices_dir = sys.argv[1]
HERE = os.path.dirname(__file__)
ROOT = os.path.join(HERE, '..', '..', 'src', 'data')
DICT = os.path.join(HERE, '..', '..', 'public', 'dict')
N_SENT = int(os.environ.get('N_SENT', '25'))
MODEL = os.environ.get('PHONE_MODEL', 'facebook/wav2vec2-lv-60-espeak-cv-ft')
ONLY = os.environ.get('LANGS', 'es,ca,en').split(',')
LANGS = {
    'es': dict(readings='lecturas.json', voices=['es_ES-davefx-medium', 'es_ES-sharvard-medium'], esp='es', abc='abcdefghijlmnñopqrstuvzáéíóú'),
    'ca': dict(readings='lectures.ca.json', voices=['ca_ES-upc_ona-medium', 'ca_ES-upc_pau-x_low'], esp='ca', abc='abcçdefghijlmnopqrstuvxzàèéíòóú'),
    'en': dict(readings='readings.en.json', voices=['en_GB-cori-high', 'en_GB-northern_english_male-medium'], esp='en-gb', abc='abcdefghijklmnopqrstuvwxyz'),
}
SWAP = {'t': 'd', 'd': 't', 'p': 'b', 'b': 'p', 'c': 'g', 'g': 'c', 'k': 'g', 'm': 'n', 'n': 'm', 'r': 'l', 'l': 'r', 's': 'z', 'z': 's', 'f': 'v', 'v': 'f', 'a': 'e', 'e': 'a', 'o': 'u', 'u': 'o', 'i': 'e'}
norm = lambda w: re.sub(r"[^\w'·-]", '', w.lower(), flags=re.U).strip("'-")
def words(s): return [w for w in (norm(x) for x in s.split()) if w]

proc = Wav2Vec2Processor.from_pretrained(MODEL)
model = Wav2Vec2ForCTC.from_pretrained(MODEL).eval()
tok = proc.tokenizer
BLANK = tok.pad_token_id
print('model', MODEL, f'{sum(p.numel() for p in model.parameters()) / 1e6:.0f}M params, blank', BLANK, flush=True)

_cache = {}
def phones(w, lang):
    k = (w, lang)
    if k not in _cache:
        _cache[k] = [i for i in tok(w, phonemizer_lang=LANGS[lang]['esp']).input_ids if i not in (tok.pad_token_id, tok.bos_token_id, tok.eos_token_id, tok.unk_token_id)]
    return _cache[k]

@torch.no_grad()
def logprobs(audio16):
    x = proc(audio16, sampling_rate=16000, return_tensors='pt').input_values
    return torch.log_softmax(model(x).logits[0], dim=-1)

def align_words(lp, per_word):
    ids = [i for p in per_word for i in p]; owner = [wi for wi, p in enumerate(per_word) for _ in p]
    if lp.shape[0] < len(ids) + 1 or not ids: return None, None
    ali, _ = torchaudio.functional.forced_align(lp[None], torch.tensor([ids], dtype=torch.int32), blank=BLANK)
    ali = ali[0].tolist()
    tok_frames = [[] for _ in ids]; k = -1; prev = BLANK
    for f, lab in enumerate(ali):
        if lab != BLANK and lab != prev: k += 1
        if lab != BLANK and 0 <= k < len(ids): tok_frames[k].append(f)
        prev = lab
    spans = {}
    for wi in range(len(per_word)):
        fr = sorted({f for i, o in enumerate(owner) if o == wi for f in tok_frames[i]})
        if fr: spans[wi] = (fr[0], fr[-1] + 1)
    return ali, spans

def llr(lp, ali, span):
    a, b = span; best = lp.max(dim=1).values
    return sum(float(lp[f, ali[f]] - best[f]) for f in range(a, b)) / max(1, b - a)

def competitor(lp, span, ph, inventory):
    a, b = span; a = max(0, a - 1); b = min(lp.shape[0], b + 1)
    seg = lp[a:b]
    cands = [ph]
    for i in range(len(ph)):
        if len(ph) > 1: cands.append(ph[:i] + ph[i + 1:])
        cands += [ph[:i] + [q] + ph[i + 1:] for q in inventory if q != ph[i]]
    cands = [c for c in cands if 0 < len(c) <= seg.shape[0]]
    if not cands or cands[0] != ph: return None
    n = len(cands)
    targets = torch.tensor([x for c in cands for x in c], dtype=torch.long)
    lens = torch.tensor([len(c) for c in cands])
    nll = torch.nn.functional.ctc_loss(seg[:, None, :].expand(-1, n, -1), targets, torch.full((n,), seg.shape[0], dtype=torch.long), lens, blank=BLANK, reduction='none', zero_infinity=True)
    ll = -nll
    return float(ll[0] - ll[1:].max()) if n > 1 else None

def neighbours(w, rank, abc):
    out = set()
    for i in range(len(w) + 1):
        if i < len(w):
            out.add(w[:i] + w[i + 1:]); out.update(w[:i] + ch + w[i + 1:] for ch in abc)
        out.update(w[:i] + ch + w[i:] for ch in abc)
    out.discard(w)
    return sorted((x for x in out if x in rank), key=lambda x: rank[x])

def pseudo(w, rank, n):
    for _ in range(60):
        x = list(w); pos = [i for i, ch in enumerate(x) if ch in SWAP]
        if len(pos) < n: return None
        for i in random.sample(pos, n): x[i] = SWAP[x[i]]
        x = ''.join(x)
        if x not in rank and x != w: return x
    return None

def synth(voice, text):
    cfg = SynthesisConfig(length_scale=1.1, speaker_id=0) if voice.config.num_speakers > 1 else SynthesisConfig(length_scale=1.1)
    ch = list(voice.synthesize(text, syn_config=cfg))
    a = np.concatenate([c.audio_float_array for c in ch]); sr = ch[0].sample_rate
    return torchaudio.functional.resample(torch.tensor(a)[None], sr, 16000)[0].numpy()

def augment(a, kind):
    if kind == 'clean': return a
    if kind == 'child': return torchaudio.functional.pitch_shift(torch.tensor(a)[None], 16000, 4)[0].numpy()
    p = np.mean(a ** 2); n = np.random.default_rng(1).normal(0, np.sqrt(p / (10 ** 1.5)), a.shape)
    return (a + n).astype(np.float32)

AUGS = ['clean', 'child', 'noise']
report = {}
for lang, c in LANGS.items():
    if lang not in ONLY: continue
    freq = gzip.open(os.path.join(DICT, lang + '.frz')).read().decode('utf-8').split('\n')
    rank = {w: i for i, w in enumerate(freq[:40000]) if w}
    inventory = sorted({p for w in freq[:3000] if w for p in phones(w, lang)})
    print(f'\n== {lang}: {len(inventory)} phones in the language', flush=True)
    data = json.load(open(os.path.join(ROOT, c['readings']), encoding='utf-8'))['readings']
    sents = []
    for r in data:
        if r['level'] > 6: continue
        for s in re.split(r'(?<=[.!?])\s+', r['text']):
            if 7 <= len(words(s)) <= 16: sents.append(s)
    sents = random.sample(sents, min(N_SENT, len(sents)))
    L = {a: {k: [] for k in ('ok', 'real', 'pseudo1', 'pseudo2')} for a in AUGS}
    C = {a: {k: [] for k in ('ok', 'real', 'pseudo1', 'pseudo2')} for a in AUGS}
    secs_audio = secs_model = 0.0
    for vname in c['voices']:
        vp = os.path.join(voices_dir, vname + '.onnx')
        if not os.path.exists(vp): print('missing voice', vname); continue
        voice = PiperVoice.load(vp, vp + '.json')
        for s in sents:
            tgt = words(s)
            cands = [i for i, w in enumerate(tgt) if len(w) >= 4 and rank.get(w, 10**9) >= 150]
            if not cands: continue
            i = random.choice(cands); w = tgt[i]
            rv = [x for x in neighbours(w, rank, c['abc']) if x not in tgt and phones(x, lang) != phones(w, lang)]
            variants = {'ok': tgt, 'real': rv[0] if rv else None, 'pseudo1': pseudo(w, rank, 1), 'pseudo2': pseudo(w, rank, 2)}
            per_word = [phones(x, lang) for x in tgt]
            for kv, val in variants.items():
                if val is None: continue
                if kv != 'ok' and phones(val, lang) == per_word[i]: continue  # sounds the same: not an error
                spoken = ' '.join(tgt) if kv == 'ok' else ' '.join(val if j == i else x for j, x in enumerate(tgt))
                base = synth(voice, spoken)
                for a in AUGS:
                    au = augment(base, a); t0 = time.time(); lp = logprobs(au); secs_model += time.time() - t0; secs_audio += len(au) / 16000
                    ali, spans = align_words(lp, per_word)
                    if ali is None: continue
                    check = [j for j in range(len(tgt)) if len(tgt[j]) >= 3 and j in spans] if kv == 'ok' else ([i] if i in spans else [])
                    for j in check:
                        L[a]['ok' if kv == 'ok' else kv].append(llr(lp, ali, spans[j]))
                        cp = competitor(lp, spans[j], per_word[j], inventory)
                        if cp is not None: C[a]['ok' if kv == 'ok' else kv].append(cp)
    res = {}
    for a in AUGS:
        row = {}
        for name, D in (('LLR', L), ('COMPETITOR', C)):
            ok = np.array(D[a]['ok']); parts = []
            for fa in (0.02, 0.05, 0.10):
                th = float(np.quantile(ok, fa)) if len(ok) else 0
                vals = {kv: round(100 * float(np.mean(np.array(D[a][kv]) < th)), 1) if D[a][kv] else None for kv in ('real', 'pseudo1', 'pseudo2')}
                row[f'{name}@{fa}'] = vals
                parts.append(f"FA {int(fa * 100)}%: real {vals['real']}% pseudo1 {vals['pseudo1']}% pseudo2 {vals['pseudo2']}%")
            print(f"{lang} {a:6} {name:10} n_ok={len(ok)} n_err={[len(D[a][k]) for k in ('real', 'pseudo1', 'pseudo2')]} | " + ' | '.join(parts), flush=True)
        res[a] = row
    print(f'{lang} model speed on this CPU: x{secs_audio / max(1e-6, secs_model):.1f} real time', flush=True)
    report[lang] = res
print('\nJSON', json.dumps(report))
