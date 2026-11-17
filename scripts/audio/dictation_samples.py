"""
Listening page to choose the Spanish dictation voice. For each free voice whose licence allows an app with
paid plans: dictation words and sentences (1) as the app plays them today (clip at normal pace, slowed
down by the browser) and (2) generated slow by the voice itself (no browser slowing).
  python scripts/audio/dictation_samples.py <voices-dir> <out.html>
"""
import base64, io, json, os, sys
import numpy as np, lameenc
from piper import PiperVoice, SynthesisConfig

voices_dir, out = sys.argv[1:3]
VOICES = [  # (file, speaker, name, description, licence)
    ('es_ES-davefx-medium', None, 'Davefx', 'Hombre · castellano peninsular · la que se usa ahora', 'CC0 (dominio público)'),
    ('es_ES-sharvard-medium', 0, 'Sharvard (voz 1)', 'Castellano peninsular', 'CC BY 3.0 (citando la fuente)'),
    ('es_ES-sharvard-medium', 1, 'Sharvard (voz 2)', 'Castellano peninsular', 'CC BY 3.0 (citando la fuente)'),
    ('es_ES-carlfm-x_low', None, 'Carlfm', 'Hombre · castellano peninsular · calidad baja', 'Dominio público'),
    ('es_ES-mls_9972-low', None, 'MLS 9972', 'Castellano peninsular · calidad baja', 'CC BY 4.0 (citando la fuente)'),
    ('es_ES-mls_10246-low', None, 'MLS 10246', 'Castellano peninsular · calidad baja', 'CC BY 4.0 (citando la fuente)'),
    ('es_MX-claude-high', None, 'Claude (México)', 'Acento mexicano: no distingue «s» de «z/c» (seseo)', 'Apache 2.0'),
    ('es_MX-ald-medium', None, 'Ald (México)', 'Hombre · acento mexicano: seseo', 'Unlicense (dominio público)'),
]
WORDS = ['bota', 'tren', 'zanahoria', 'bombilla', 'invierno', 'pipa']
SENTS = ['Hay un yate en el mar.', 'La hierba estaba húmeda después de la tormenta.', 'El espectáculo fue una auténtica excepción.']
NOW_SCALE = 1.06                      # how the app's clips are made today
SLOW = {'word': 1.32, 'sent': 1.25}   # the same slowness the app asks for (rate 0.7 / 0.75), made by the voice
PLAY_NOW = {'word': 0.7 / 0.92, 'sent': 0.75 / 0.92}  # what the browser does today with the normal clip

def mp3(voice, text, scale, speaker):
    cfg = SynthesisConfig(speaker_id=speaker, length_scale=scale) if speaker is not None else SynthesisConfig(length_scale=scale)
    ch = list(voice.synthesize(text, syn_config=cfg))
    rate = ch[0].sample_rate
    pad = np.zeros(int(0.15 * rate), dtype=np.float32)
    a = np.concatenate([pad] + [c.audio_float_array for c in ch] + [pad])
    enc = lameenc.Encoder(); enc.set_bit_rate(64); enc.set_in_sample_rate(rate); enc.set_channels(1); enc.set_quality(2)
    return 'data:audio/mpeg;base64,' + base64.b64encode(enc.encode((np.clip(a, -1, 1) * 32767).astype(np.int16).tobytes()) + enc.flush()).decode()

cards = []
for f, spk, name, desc, lic in VOICES:
    p = os.path.join(voices_dir, f + '.onnx')
    if not os.path.exists(p): print('missing', f); continue
    try: v = PiperVoice.load(p, p + '.json')
    except Exception as e: print('cannot load', f, e); continue
    rows = []
    for kind, items in (('word', WORDS), ('sent', SENTS)):
        for t in items:
            rows.append(dict(text=t, now=mp3(v, t, NOW_SCALE, spk), nowRate=round(PLAY_NOW[kind], 3), slow=mp3(v, t, SLOW[kind], spk)))
    cards.append(dict(name=name, desc=desc, lic=lic, rows=rows))
    print('ok', name, flush=True)

html = """<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Voces para el dictado</title><style>
:root{--bg:#fbf8f4;--card:#fff;--ink:#2b2a33;--mute:#6b6873;--a:#7c6cf0;--a2:#e9e5ff;--g:#2f9e6f;--g2:#dff5ea;--line:#ece8f3}
@media (prefers-color-scheme:dark){:root{--bg:#1c1b22;--card:#26252e;--ink:#f1eff6;--mute:#aaa6b6;--a:#a99cff;--a2:#34305a;--g:#5fd3a0;--g2:#1f3b30;--line:#37353f}}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:16px/1.5 system-ui,-apple-system,Segoe UI,Roboto,sans-serif}
main{max-width:860px;margin:0 auto;padding:24px 16px 60px}h1{font-size:1.6rem;margin:0 0 6px}p.lead{color:var(--mute);margin:0 0 20px}
.card{background:var(--card);border:1px solid var(--line);border-radius:20px;padding:18px;margin:0 0 16px}
.card h2{margin:0;font-size:1.2rem}.meta{color:var(--mute);font-size:.9rem}.lic{display:inline-block;background:var(--g2);color:var(--g);border-radius:999px;padding:2px 10px;font-size:.8rem;font-weight:600;margin-top:6px}
.row{display:flex;flex-wrap:wrap;align-items:center;gap:8px;padding:10px 0;border-top:1px solid var(--line)}.row:first-of-type{margin-top:10px}
.t{flex:1 1 220px;font-weight:600}button{border:0;border-radius:999px;padding:8px 14px;font:inherit;font-size:.9rem;cursor:pointer;min-height:40px}
.now{background:var(--a2);color:var(--a)}.slow{background:var(--g2);color:var(--g)}
.key{display:flex;gap:10px;flex-wrap:wrap;margin:0 0 18px;font-size:.9rem}.key span{border-radius:999px;padding:4px 12px}
</style></head><body><main>
<h1>Voces para el dictado (castellano)</h1>
<p class="lead">Todas son gratuitas y su licencia permite usarlas en una app con planes de pago. Cada palabra o frase se puede oír de dos maneras:</p>
<div class="key"><span class="now">🔈 Como suena hoy: grabada a ritmo normal y ralentizada por el móvil</span><span class="slow">🐢 Lenta de verdad: la voz la dice despacio, sin ralentizar</span></div>
<div id="list"></div></main><script>
const DATA = __DATA__;
const list = document.getElementById('list'); const audio = new Audio();
function play(src, rate){ audio.pause(); audio.src = src; audio.preservesPitch = true; audio.playbackRate = rate; audio.play(); }
for (const c of DATA) {
  const el = document.createElement('section'); el.className = 'card';
  el.innerHTML = `<h2>${c.name}</h2><div class="meta">${c.desc}</div><span class="lic">${c.lic}</span>`;
  for (const r of c.rows) {
    const row = document.createElement('div'); row.className = 'row';
    row.innerHTML = `<span class="t">${r.text}</span>`;
    const a = document.createElement('button'); a.className = 'now'; a.textContent = '🔈 Como hoy'; a.onclick = () => play(r.now, r.nowRate);
    const b = document.createElement('button'); b.className = 'slow'; b.textContent = '🐢 Lenta de verdad'; b.onclick = () => play(r.slow, 1);
    row.append(a, b); el.append(row);
  }
  list.append(el);
}
</script></body></html>"""
open(out, 'w', encoding='utf-8').write(html.replace('__DATA__', json.dumps(cards, ensure_ascii=False)))
print('written', out, os.path.getsize(out))
