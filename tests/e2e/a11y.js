// Accessibility audit (axe-core, WCAG 2 A/AA) of every screen in light and dark mode. Needs axe-core: AXE=/path/axe.min.js node a11y.js
const { chromium } = require('playwright');
const fs = require('fs');
const AXE = fs.readFileSync(process.env.AXE || require.resolve('axe-core/axe.min.js'), 'utf8');
const BASE = 'http://localhost:4173/lectorix/';
const ROUTES = ['/onb', '/', '/modulos', '/modulos/fonologia', '/ejercicio/fonologia/1', '/reto-diario', '/logros', '/perfil', '/ajustes', '/premium', '/historial', '/mascota', '/panel-padres', '/dictado', '/lectura', '/lectura/lectura_eso_materia', '/repaso', '/mis-palabras', '/fluidez', '/adaptar', '/juntos', '/prueba-nivel', '/como-aprendo', '/guia-familias', '/reto-lectura', '/fichas', '/voces', '/estanteria', '/escribe', '/cuentos', '/enunciados', '/redaccion'];
(async () => {
  const b = await chromium.launch();
  const out = {};
  for (const scheme of ['light', 'dark']) {
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, colorScheme: scheme });
    const p = await ctx.newPage();
    await p.goto(BASE);
    await p.evaluate(() => { localStorage.clear(); localStorage.setItem('lectorix-store', JSON.stringify({ state: { onboardingDone: true, placementDismissed: true, language: 'es', practiceLanguage: 'auto', progress: [], sessionHistory: [], user: { id: 'u', display_name: 'Ana', total_xp: 50, streak_days: 2, last_session: new Date().toISOString() } }, version: 0 })); });
    await p.reload(); await p.waitForTimeout(800);
    for (const r of ROUTES) {
      await p.goto(BASE + '#' + r); await p.waitForTimeout(2200);
      await p.addScriptTag({ content: AXE });
      const res = await p.evaluate(async () => { const r = await window.axe.run(document, { runOnly: ['wcag2a', 'wcag2aa'], resultTypes: ['violations'] }); return r.violations.map((v) => ({ id: v.id, impact: v.impact, n: v.nodes.length, ex: v.nodes.slice(0, 40).map((x) => x.target.join(' ') + ' :: ' + (x.failureSummary || '').split('\n').slice(1, 2).join('')) })); });
      for (const v of res) { const k = v.id; (out[k] ??= { impact: v.impact, routes: [] }).routes.push(`${scheme} ${r} (${v.n}) ${v.ex.join(' || ')}`); }
    }
    await ctx.close();
  }
  for (const [k, v] of Object.entries(out)) { console.log(`\n### ${k} [${v.impact}] in ${v.routes.length} pages`); v.routes.slice(0, 40).forEach((x) => console.log('  ', x)); }
  await b.close();
})();
