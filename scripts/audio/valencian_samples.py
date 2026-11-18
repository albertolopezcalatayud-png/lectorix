"""
Listening page to choose the Valencian voice. Only voices whose licence allows an app with paid plans:
- Piper UPC Ona and UPC Pau (the ones in the app now, CC BY-SA, data: FestCat), as they sound today
  (Central Catalan pronunciation) and with Valencian pronunciation (espeak-ng 'ca-va' phonemes: open
  unstressed vowels, «xiquet» with tx, final r...).
- Matxa multispeaker (Projecte AINA / BSC, GPL-3.0; data: FestCat and OpenSLR69, CC BY-SA), several of
  its 47 voices, with Valencian pronunciation. (Not the Matxa multi-accent model with the Valencian voices
  Lluc and Gina: that one is non-commercial without the voice artists' licence.)
  python scripts/audio/valencian_samples.py <voices-dir> <matxa.onnx or ''> <out.html>
"""
import base64, json, os, sys, traceback
import numpy as np, lameenc
from piper import PiperVoice, SynthesisConfig
from piper.phonemize_espeak import EspeakPhonemizer

voices_dir, matxa_path, out = sys.argv[1:4]
SENTS = ['Les cases del poble tenen finestres verdes i portes blanques.',
         'Anem a jugar al carrer amb els xiquets després de dinar.',
         'Hui fa molt de sol i la xiqueta beu aigua fresca.']
WORDS = ['taronja', 'xiquet', 'finestra']
PAD = 0.12

def fold_va(ph):
    """Valencian phonemes a Central-trained voice can say: the voices never heard /v/ (Central has none)"""
    out = []
    for i, p in enumerate(ph):
        if p == 'v': out.append('b' if (i == 0 or ph[i - 1] in (' ', 'm', 'n')) else 'β')
        else: out.append(p)
    return out

def enc(a, rate):
    pad = np.zeros(int(PAD * rate), dtype=np.float32)
    a = np.concatenate([pad, a.astype(np.float32), pad])
    e = lameenc.Encoder(); e.set_bit_rate(64); e.set_in_sample_rate(rate); e.set_channels(1); e.set_quality(2)
    return 'data:audio/mpeg;base64,' + base64.b64encode(e.encode((np.clip(a, -1, 1) * 32767).astype(np.int16).tobytes()) + e.flush()).decode()

def piper_voice(f, espeak, fold):
    p = os.path.join(voices_dir, f + '.onnx')
    v = PiperVoice.load(p, p + '.json')
    v.config.espeak_voice = espeak
    if fold:
        orig = v.phonemize
        v.phonemize = lambda text: [fold_va(s) for s in orig(text)]
    return v

def piper_say(v, text, scale):
    ch = list(v.synthesize(text, syn_config=SynthesisConfig(length_scale=scale)))
    gap = np.zeros(int(0.25 * ch[0].sample_rate), dtype=np.float32)
    return enc(np.concatenate([x for c in ch for x in (c.audio_float_array, gap)][:-1]), ch[0].sample_rate)

cards = []
def card(name, desc, lic, say):
    rows = []
    try:
        for t in SENTS: rows.append(dict(text=t, src=say(t, False)))
        for t in WORDS: rows.append(dict(text=t + ' (dictat, a poc a poc)', src=say(t, True)))
        cards.append(dict(name=name, desc=desc, lic=lic, rows=rows)); print('ok', name, flush=True)
    except Exception:
        print('FAILED', name); traceback.print_exc()

for f, nm in (('ca_ES-upc_ona-medium', 'Ona'), ('ca_ES-upc_pau-x_low', 'Pau')):
    if not os.path.exists(os.path.join(voices_dir, f + '.onnx')): print('missing', f); continue
    now = piper_voice(f, 'ca', False); va = piper_voice(f, 'ca-va', True)
    q = 'calidad media' if 'medium' in f else 'calidad baja'
    card(f'{nm} · como suena hoy', f'Piper, {q} · pronunciación de Barcelona', 'CC BY-SA (citando la fuente)', lambda t, slow, v=now: piper_say(v, t, 1.32 if slow else 1.06))
    card(f'{nm} · pronunciación valenciana', f'Piper, {q} · la misma voz leyendo con fonética valenciana', 'CC BY-SA (citando la fuente)', lambda t, slow, v=va: piper_say(v, t, 1.32 if slow else 1.06))

# ── Matxa multispeaker (Matcha-TTS + HiFi-GAN in one ONNX file) ──
if matxa_path and os.path.exists(matxa_path):
    import onnxruntime as ort
    sess = ort.InferenceSession(matxa_path)
    names = [i.name for i in sess.get_inputs()]
    print('matxa inputs', [(i.name, i.shape, i.type) for i in sess.get_inputs()], 'outputs', [o.name for o in sess.get_outputs()], flush=True)
    # Matcha-TTS symbols (matcha/text/symbols.py): 178 of them, as the model's n_vocab
    _pad = '_'; _punct = ';:,.!?¡¿—…"«»“” '; _letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
    _ipa = "ɑɐɒæɓʙβɔɕçɗɖðʤəɘɚɛɜɝɞɟʄɡɠɢʛɦɧħɥʜɨɪʝɭɬɫɮʟɱɯɰŋɳɲɴøɵɸθœɶʘɹɺɾɻʀʁɽʂʃʈʧʉʊʋⱱʌɣɤʍχʎʏʑʐʒʔʡʕʢǀǁǂǃˈˌːˑʼʴʰʱʲʷˠˤ˞↓↑→↗↘'̩'ᵻ"
    SYM = [_pad] + list(_punct) + list(_letters) + list(_ipa)
    print('matxa symbols', len(SYM), flush=True)
    sid = {s: i for i, s in enumerate(SYM)}
    ESP = EspeakPhonemizer()
    def ids_for(text):
        sents = ESP.phonemize('ca-va', text)
        ph = ''.join(''.join(fold_va(s)) + ' ' for s in sents).strip()
        seq = [sid[c] for c in ph if c in sid]
        out = [0] * (len(seq) * 2 + 1); out[1::2] = seq  # intersperse blanks, as Matcha was trained
        return np.array([out], dtype=np.int64)
    def matxa_say(spk, text, slow):
        x = ids_for(text)
        feed = {}
        for i in sess.get_inputs():
            if i.name == 'x': feed['x'] = x
            elif i.name == 'x_lengths': feed['x_lengths'] = np.array([x.shape[1]], dtype=np.int64)
            elif i.name == 'scales': feed['scales'] = np.array([0.667, 1.35 if slow else 1.05], dtype=np.float32)
            elif i.name == 'spks': feed['spks'] = np.array([spk], dtype=np.int64)
        outs = [o.name for o in sess.get_outputs()]
        res = dict(zip(outs, sess.run(None, feed)))
        wav = np.asarray(res.get('hfaudio', res.get('wav', list(res.values())[-1]))).squeeze()
        if wav.ndim > 1: wav = wav[0]
        return enc(wav / max(1e-4, float(np.abs(wav).max())) * 0.9, 22050)
    SPK = {"ona": 5, "pol": 6, "jan": 9, "eva": 20, "uri": 25, "mar": 26, "teo": 28, "bet": 30, "pau": 39, "pep": 41, "eli": 43,
           "caf_04247": 1, "caf_09901": 4, "cam_08935": 3, "cam_04910": 11}
    for nm, k in SPK.items():
        card(f'Matxa · {nm}', 'Matxa multilocutor (AINA) · pronunciación valenciana', 'GPL-3.0 (datos CC BY-SA, citando la fuente)', lambda t, slow, k=k: matxa_say(k, t, slow))

html = """<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Voces en valenciano</title><style>
:root{--bg:#fbf8f4;--card:#fff;--ink:#2b2a33;--mute:#6b6873;--a:#7c6cf0;--a2:#e9e5ff;--g:#2f9e6f;--g2:#dff5ea;--line:#ece8f3}
@media (prefers-color-scheme:dark){:root{--bg:#1c1b22;--card:#26252e;--ink:#f1eff6;--mute:#aaa6b6;--a:#a99cff;--a2:#34305a;--g:#5fd3a0;--g2:#1f3b30;--line:#37353f}}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:16px/1.5 system-ui,-apple-system,Segoe UI,Roboto,sans-serif}
main{max-width:860px;margin:0 auto;padding:24px 16px 60px}h1{font-size:1.6rem;margin:0 0 6px}p.lead{color:var(--mute);margin:0 0 20px}
.card{background:var(--card);border:1px solid var(--line);border-radius:20px;padding:18px;margin:0 0 16px}
.card h2{margin:0;font-size:1.15rem}.meta{color:var(--mute);font-size:.9rem}.lic{display:inline-block;background:var(--g2);color:var(--g);border-radius:999px;padding:2px 10px;font-size:.8rem;font-weight:600;margin-top:6px}
.row{display:flex;flex-wrap:wrap;align-items:center;gap:8px;padding:10px 0;border-top:1px solid var(--line)}.row:first-of-type{margin-top:10px}
.t{flex:1 1 220px}button{border:0;border-radius:999px;padding:8px 16px;font:inherit;font-size:.9rem;cursor:pointer;min-height:40px;background:var(--a2);color:var(--a);font-weight:600}
</style></head><body><main>
<h1>Voces en valenciano</h1>
<p class="lead">Todas son gratuitas y su licencia permite usarlas en una app con planes de pago. Las de «pronunciación valenciana» leen con la fonética del valenciano (vocales abiertas, «xiquet» con «tx», la «r» final…). Arriba están las dos que usa la app ahora, para comparar.</p>
<div id="list"></div></main><script>
const DATA = __DATA__; const list = document.getElementById('list'); const audio = new Audio();
for (const c of DATA) {
  const el = document.createElement('section'); el.className = 'card';
  el.innerHTML = `<h2>${c.name}</h2><div class="meta">${c.desc}</div><span class="lic">${c.lic}</span>`;
  for (const r of c.rows) {
    const row = document.createElement('div'); row.className = 'row'; row.innerHTML = `<span class="t">${r.text}</span>`;
    const b = document.createElement('button'); b.textContent = '🔈 Escuchar'; b.onclick = () => { audio.pause(); audio.src = r.src; audio.play(); };
    row.append(b); el.append(row);
  }
  list.append(el);
}
</script></body></html>"""
open(out, 'w', encoding='utf-8').write(html.replace('__DATA__', json.dumps(cards, ensure_ascii=False)))
print('written', out, os.path.getsize(out), len(cards), 'voices')
