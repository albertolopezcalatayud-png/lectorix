"""
Can a second model, listening letter by letter, catch near misses the word recogniser lets through?
The word recogniser (Vosk, restricted to the text) maps "gado" to "gato". Here a CTC model with no
dictionary (it hears letters, not words) is forced along the text, and for each word we compare how well
the text explains the sound against the best the model can do freely (log-likelihood ratio, the best single
feature in the literature on children reading aloud). A low ratio = what was heard is not that word.

Cases per sentence: read correctly, one word swapped for a close real word, for a made-up word one letter
away, for a made-up word two letters away. Audio: synthetic voices, clean / higher "child-like" voice /
classroom noise. Prints, per language and audio, the detection rate at fixed false-alarm rates on
correctly read words.
  python scripts/asr/verify_eval.py <voices-dir>
"""
import gzip, json, os, re, sys, time, random
import numpy as np, torch, torchaudio
from piper import PiperVoice, SynthesisConfig
import nemo.collections.asr as nemo_asr
from huggingface_hub import hf_hub_download

torch.set_num_threads(int(os.environ.get('THREADS', '2')))
random.seed(5)
voices_dir = sys.argv[1]
HERE = os.path.dirname(__file__)
ROOT = os.path.join(HERE, '..', '..', 'src', 'data')
DICT = os.path.join(HERE, '..', '..', 'public', 'dict')
N_SENT = int(os.environ.get('N_SENT', '30'))
ONLY = os.environ.get('LANGS', 'es,ca,en').split(',')
LANGS = {
    'es': dict(readings='lecturas.json', voices=['es_ES-davefx-medium', 'es_ES-sharvard-medium'], models=os.environ.get('M_ES', 'stt_es_citrinet_512').split(','), abc='abcdefghijlmnñopqrstuvzáéíóú'),
    'ca': dict(readings='lectures.ca.json', voices=['ca_ES-upc_ona-medium', 'ca_ES-upc_pau-x_low'], models=os.environ.get('M_CA', 'stt_ca_conformer_ctc_large').split(','), abc='abcçdefghijlmnopqrstuvxzàèéíòóú'),
    'en': dict(readings='readings.en.json', voices=['en_GB-cori-high', 'en_GB-northern_english_male-medium'], models=os.environ.get('M_EN', 'stt_en_citrinet_512').split(','), abc='abcdefghijklmnopqrstuvwxyz'),
}
SWAP = {'t': 'd', 'd': 't', 'p': 'b', 'b': 'p', 'c': 'g', 'g': 'c', 'k': 'g', 'm': 'n', 'n': 'm', 'r': 'l', 'l': 'r', 's': 'z', 'z': 's', 'f': 'v', 'v': 'f', 'a': 'e', 'e': 'a', 'o': 'u', 'u': 'o', 'i': 'e'}
norm = lambda w: re.sub(r"[^\w'·-]", '', w.lower(), flags=re.U).strip("'-")
def words(s): return [w for w in (norm(x) for x in s.split()) if w]

def load_model(cands):
    for c in cands:
        try:
            if c.startswith('hf:'):
                repo, fn = c[3:].rsplit('/', 1)
                m = nemo_asr.models.ASRModel.restore_from(hf_hub_download(repo, fn), map_location='cpu')
            else:
                m = nemo_asr.models.ASRModel.from_pretrained(c, map_location='cpu')
            m.eval(); m.preprocessor.featurizer.dither = 0.0; m.preprocessor.featurizer.pad_to = 0
            return c, m
        except Exception as e:
            print('could not load', c, repr(e)[:200], flush=True)
    raise SystemExit('no model')

def vocab_of(m):
    if hasattr(m, 'tokenizer') and m.tokenizer is not None:
        return 'bpe', None
    return 'char', list(m.decoder.vocabulary)

def tokens_for(m, kind, vocab, ws):
    """Token ids for the text, and the word index of each token"""
    ids, owner = [], []
    for wi, w in enumerate(ws):
        if kind == 'bpe':
            t = m.tokenizer.text_to_ids(w)
        else:
            w2 = w.replace('ñ', 'ny') if 'ñ' not in vocab else w
            t = [vocab.index(ch) for ch in w2 if ch in vocab]
            if wi < len(ws) - 1 and ' ' in vocab: t = t + [vocab.index(' ')]
        ids += t; owner += [wi] * len(t)
    return ids, owner

@torch.no_grad()
def logprobs(m, audio16):
    x = torch.tensor(audio16, dtype=torch.float32)[None]
    lp, _, _ = m.forward(input_signal=x, input_signal_length=torch.tensor([x.shape[1]]))
    return lp[0]

def word_scores(lp, ids, owner, nwords, blank, spans=None):
    """Per word: mean over its frames of (log p of the forced label) - (log p of the best label)"""
    T = lp.shape[0]
    if T < len(ids) + 1: return None
    ali, _ = torchaudio.functional.forced_align(lp[None], torch.tensor([ids], dtype=torch.int32), blank=blank)
    ali = ali[0].tolist()
    best = lp.max(dim=1).values
    # token occurrences along the path: a new token starts when a non-blank label differs from the previous frame's
    tok_frames = [[] for _ in ids]; k = -1; prev = blank
    for f, lab in enumerate(ali):
        if lab != blank and (lab != prev or prev == blank and False):
            if lab != prev: k += 1
        if lab != blank and k >= 0: tok_frames[k].append(f)
        prev = lab
    out = []
    for wi in range(nwords):
        toks = [i for i, o in enumerate(owner) if o == wi]
        fr = sorted({f for i in toks for f in tok_frames[i]})
        if not fr: out.append(None); continue
        a, b = fr[0], fr[-1] + 1
        if spans is not None: spans[wi] = (a, b)
        span = range(a, b)
        tgt = sum(float(lp[f, ali[f]]) for f in span)
        free = sum(float(best[f]) for f in span)
        out.append((tgt - free) / max(1, b - a))
    return out

def edits1(w, abc):
    out = set()
    for i in range(len(w) + 1):
        if i < len(w):
            out.add(w[:i] + w[i + 1:]); out.update(w[:i] + ch + w[i + 1:] for ch in abc)
        out.update(w[:i] + ch + w[i:] for ch in abc)
    out.discard(w)
    return [x for x in out if x]

def word_ids(m, kind, vocab, w):
    if kind == 'bpe': return m.tokenizer.text_to_ids(w)
    w2 = w.replace('ñ', 'ny') if 'ñ' not in vocab else w
    return [vocab.index(ch) for ch in w2 if ch in vocab]

def competitor(lp, span, w, m, kind, vocab, abc, blank):
    """log P(word) - max log P(any word one letter away), over the word's frames (CTC forward, all paths)"""
    a, b = span; a = max(0, a - 2); b = min(lp.shape[0], b + 2)
    seg = lp[a:b]
    cands = [w] + edits1(w, abc)
    tok = [word_ids(m, kind, vocab, x) for x in cands]
    keep = [i for i, t in enumerate(tok) if 0 < len(t) <= seg.shape[0]]
    if 0 not in keep: return None
    tok = [tok[i] for i in keep]
    n = len(tok)
    targets = torch.tensor([x for t in tok for x in t], dtype=torch.long)
    lens = torch.tensor([len(t) for t in tok])
    lpb = seg[:, None, :].expand(-1, n, -1)
    nll = torch.nn.functional.ctc_loss(lpb, targets, torch.full((n,), seg.shape[0], dtype=torch.long), lens, blank=blank, reduction='none', zero_infinity=True)
    ll = -nll
    if (nll[0] == 0) and seg.shape[0] < len(tok[0]): return None
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
    """A made-up word n sound-alike letter changes away from w (not a real word)"""
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
    if kind == 'child':  # higher voice (pitch and formants up ~4 semitones), a common stand-in for children's speech
        return torchaudio.functional.pitch_shift(torch.tensor(a)[None], 16000, 4)[0].numpy()
    if kind == 'noise':
        p = np.mean(a ** 2); n = np.random.default_rng(1).normal(0, np.sqrt(p / (10 ** (15 / 10))), a.shape)
        return (a + n).astype(np.float32)

AUGS = ['clean', 'child', 'noise']
report = {}
for lang, c in LANGS.items():
    if lang not in ONLY: continue
    name, m = load_model(c['models']); kind, vocab = vocab_of(m)
    blank = m.decoder.num_classes_with_blank - 1 if hasattr(m.decoder, 'num_classes_with_blank') else len(m.decoder.vocabulary)
    params = sum(p.numel() for p in m.parameters()) / 1e6
    print(f'\n== {lang}: {name} ({kind}, {params:.0f}M params, blank {blank})', flush=True)
    freq = gzip.open(os.path.join(DICT, lang + '.frz')).read().decode('utf-8').split('\n')
    rank = {w: i for i, w in enumerate(freq[:40000]) if w}
    data = json.load(open(os.path.join(ROOT, c['readings']), encoding='utf-8'))['readings']
    sents = []
    for r in data:
        if r['level'] > 6: continue
        for s in re.split(r'(?<=[.!?])\s+', r['text']):
            if 7 <= len(words(s)) <= 16: sents.append(s)
    sents = random.sample(sents, min(N_SENT, len(sents)))
    S = {a: {'ok': [], 'real': [], 'pseudo1': [], 'pseudo2': []} for a in AUGS}
    C = {a: {'ok': [], 'real': [], 'pseudo1': [], 'pseudo2': []} for a in AUGS}  # competitor test
    G = {a: {'ok': [0, 0], 'real': [0, 0], 'pseudo1': [0, 0], 'pseudo2': [0, 0]} for a in AUGS}  # free decoding differs
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
            rv = [x for x in neighbours(w, rank, c['abc']) if x not in tgt]
            variants = {'ok': tgt, 'real': rv[0] if rv else None, 'pseudo1': pseudo(w, rank, 1), 'pseudo2': pseudo(w, rank, 2)}
            ids, owner = tokens_for(m, kind, vocab, tgt)
            for kv, val in variants.items():
                if val is None: continue
                spoken = ' '.join(tgt) if kv == 'ok' else ' '.join(val if j == i else x for j, x in enumerate(tgt))
                base = synth(voice, spoken)
                for a in AUGS:
                    au = augment(base, a); t0 = time.time(); lp = logprobs(m, au); secs_model += time.time() - t0; secs_audio += len(au) / 16000
                    spans = {}
                    sc = word_scores(lp, ids, owner, len(tgt), blank, spans)
                    if sc is None: continue
                    check = [j for j in range(len(tgt)) if len(tgt[j]) >= 4 and rank.get(tgt[j], 10**9) >= 150] if kv == 'ok' else [i]  # like with like: the same kind of words that are swapped
                    for j in check:
                        if sc[j] is None or j not in spans: continue
                        cp = competitor(lp, spans[j], tgt[j], m, kind, vocab, c['abc'], blank)
                        a0, b0 = spans[j]; a0 = max(0, a0 - 2); b0 = min(lp.shape[0], b0 + 2)
                        g = lp[a0:b0].argmax(1).tolist(); dec = []; pv = None
                        for x in g:
                            if x != blank and x != pv: dec.append(x)
                            pv = x
                        txt = m.tokenizer.ids_to_text(dec) if kind == 'bpe' else ''.join(vocab[x] for x in dec)
                        G[a][kv][0] += int(norm(txt.replace(' ', '')) != tgt[j].replace('ñ', 'ny' if kind == 'char' and 'ñ' not in vocab else 'ñ')); G[a][kv][1] += 1
                        if cp is None: continue
                        S[a]['ok' if kv == 'ok' else kv].append(sc[j]); C[a]['ok' if kv == 'ok' else kv].append(cp)
    res = {}
    for a in AUGS:
        ok = np.array(S[a]['ok'])
        row = {'n_ok_words': len(ok)}
        for fa in (0.02, 0.05, 0.10):
            th = float(np.quantile(ok, fa)) if len(ok) else 0
            row[f'th@{fa}'] = round(th, 3)
            for kv in ('real', 'pseudo1', 'pseudo2'):
                v = np.array(S[a][kv]); row[f'{kv}@{fa}'] = round(100 * float(np.mean(v < th)), 1) if len(v) else None
        okc = np.array(C[a]['ok'])
        for fa in (0.02, 0.05, 0.10):
            th = float(np.quantile(okc, fa)) if len(okc) else 0
            for kv in ('real', 'pseudo1', 'pseudo2'):
                v = np.array(C[a][kv]); row[f'C_{kv}@{fa}'] = round(100 * float(np.mean(v < th)), 1) if len(v) else None
        for kv in ('ok', 'real', 'pseudo1', 'pseudo2'):
            row[f'G_{kv}'] = round(100 * G[a][kv][0] / max(1, G[a][kv][1]), 1)
        # combined: an error if either test is clearly low (each scaled by its spread on correctly read words)
        if len(S[a]['ok']) == len(C[a]['ok']) and len(C[a]['ok']) > 10:
            ls, cs = np.array(S[a]['ok']), np.array(C[a]['ok'])
            z = lambda v, ref: (np.array(v) - np.median(ref)) / (np.quantile(ref, 0.75) - np.quantile(ref, 0.25) + 1e-6)
            comb_ok = np.minimum(z(ls, ls), z(cs, ls * 0 + cs))
            parts = []
            for fa in (0.02, 0.05, 0.10):
                th = float(np.quantile(comb_ok, fa)); vals = {}
                for kv in ('real', 'pseudo1', 'pseudo2'):
                    if len(S[a][kv]) == len(C[a][kv]) and len(S[a][kv]):
                        vals[kv] = round(100 * float(np.mean(np.minimum(z(S[a][kv], ls), z(C[a][kv], cs)) < th)), 1)
                parts.append(f"FA {int(fa * 100)}%: " + ' '.join(f'{k} {v}%' for k, v in vals.items()))
            print(f"{lang} {a:6} COMBINED   | " + ' | '.join(parts), flush=True)
        res[a] = row
        print(f"{lang} {a:6} COMPETITOR | FA 2%: real {row['C_real@0.02']}% pseudo1 {row['C_pseudo1@0.02']}% pseudo2 {row['C_pseudo2@0.02']}% | FA 5%: real {row['C_real@0.05']}% pseudo1 {row['C_pseudo1@0.05']}% pseudo2 {row['C_pseudo2@0.05']}% | FA 10%: real {row['C_real@0.1']}% pseudo1 {row['C_pseudo1@0.1']}% pseudo2 {row['C_pseudo2@0.1']}%", flush=True)
        print(f"{lang} {a:6} FREE-DECODE differs: ok {row['G_ok']}% real {row['G_real']}% pseudo1 {row['G_pseudo1']}% pseudo2 {row['G_pseudo2']}%", flush=True)
        print(f"{lang} {a:6} okwords={len(ok)} | FA 2%: real {row['real@0.02']}% pseudo1 {row['pseudo1@0.02']}% pseudo2 {row['pseudo2@0.02']}% | FA 5%: real {row['real@0.05']}% pseudo1 {row['pseudo1@0.05']}% pseudo2 {row['pseudo2@0.05']}% | FA 10%: real {row['real@0.1']}% pseudo1 {row['pseudo1@0.1']}% pseudo2 {row['pseudo2@0.1']}%", flush=True)
    print(f'{lang} model speed on this CPU: x{secs_audio / max(1e-6, secs_model):.0f} real time', flush=True)
    report[lang] = {'model': name, 'params_M': round(params), 'kind': kind, 'res': res}
    del m
print('\nJSON', json.dumps(report))
