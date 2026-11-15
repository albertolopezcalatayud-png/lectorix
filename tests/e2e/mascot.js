// Testers: "the accessories float, they are not in the right place" and "the wizard puts a wizard emoji on top".
// Every hat must sit on Lapi's eraser, glasses on the eyes, badges on the body, held things by the hands,
// and nothing may be an emoji laid over the drawing.
const { chromium } = require('playwright');
const HATS = ['gorra', 'corona', 'sombrero', 'graduation', 'wizard'];
const ACCS = ['gafas', 'estrella', 'medalla', 'varita', 'libro'];
const BGS = ['bosque', 'playa', 'espacio', 'castillo', 'arcoiris'];
(async () => {
  const b = await chromium.launch(); let fails = 0; const errors = [];
  const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
  const p = await b.newPage({ viewport: { width: 390, height: 900 }, reducedMotion: 'reduce' }); p.on('pageerror', (e) => errors.push(e.message));
  await p.goto('http://localhost:4173/lectorix/');
  const show = async (m) => {
    await p.evaluate((m) => localStorage.setItem('lectorix-store', JSON.stringify({ state: { onboardingDone: true, language: 'es', progress: [], sessionHistory: [], mascot: m }, version: 0 })), m);
    await p.goto('http://localhost:4173/lectorix/#/mascota'); await p.reload(); await p.waitForTimeout(700);
    return p.evaluate(() => {
      const svg = document.querySelector('svg[viewBox="-4 -8 128 128"]');
      const box = (sel) => { const e = svg.querySelector(sel); if (!e) return null; const r = e.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height, b: r.y + r.height, cx: r.x + r.width / 2, cy: r.y + r.height / 2 }; };
      const wrap = svg.parentElement;
      const emoji = [...wrap.querySelectorAll('span')].map((s) => s.textContent).join('');
      return { eraser: box('[data-part=eraser]'), eye: box('[data-part=eye]'), body: box('[data-part=body]'), hat: box('[data-part=hat]'), acc: box('[data-part=accessory]'), scale: svg.getBoundingClientRect().width / 128, emoji };
    });
  };
  for (const hat of HATS) {
    const g = await show({ color: 'purple', hat, accessory: null, background: null });
    const gap = (g.hat.b - g.eraser.y) / g.scale; // hat bottom vs eraser top, in drawing units
    const onEraser = g.hat.b > g.eraser.y && g.hat.b < g.eraser.b + 4 * g.scale; // touches the eraser, does not float above it
    ok(onEraser && Math.abs(g.hat.cx - g.eraser.cx) / g.scale < 14 && !g.emoji, `hat ${hat} sits on the eraser (overlap ${gap.toFixed(1)}, no emoji)`);
  }
  for (const accessory of ACCS) {
    const g = await show({ color: 'purple', hat: null, accessory, background: null });
    const a = g.acc, near = (v, lo, hi) => v >= lo && v <= hi;
    let placed;
    if (accessory === 'gafas') placed = Math.abs(a.cy - g.eye.cy) / g.scale < 6;
    else if (accessory === 'varita') placed = a.x > g.body.x + g.body.w - 6 * g.scale;          // in the right hand, beside the body
    else if (accessory === 'libro') placed = a.cx < g.body.x;                                     // in the left hand
    else placed = near(a.cy, g.body.y, g.body.b) && near(a.cx, g.body.x, g.body.x + g.body.w);    // on the body
    ok(placed && !g.emoji.replace('1', ''), `accessory ${accessory} is in its place, drawn (not an emoji)`);
  }
  for (const background of BGS) {
    const g = await show({ color: 'purple', hat: null, accessory: null, background });
    ok(!g.emoji, `background ${background} is drawn behind Lapi`);
  }
  console.log('ERRORS', fails, errors); await b.close();
})();
