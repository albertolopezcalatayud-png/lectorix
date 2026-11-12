// Daily sweep: every screen in the three languages, with a fresh profile and with a used one.
// Reports page errors, console errors, failed requests, broken images, horizontal scroll and suspicious text
// (undefined, NaN, raw i18n keys, {placeholders}, [object Object]).
const { chromium } = require('playwright');
const BASE = process.env.BASE || 'http://localhost:4173/lectorix/';
const ROUTES = ['/', '/modulos', '/modulos/fonologia', '/modulos/comprension_lectora', '/ejercicio/fonologia/1', '/ejercicio/escritura/3', '/reto-diario', '/logros', '/perfil', '/ajustes', '/premium', '/historial', '/mascota', '/panel-padres', '/dictado', '/lectura', '/repaso', '/mis-palabras', '/fluidez', '/adaptar', '/juntos', '/prueba-nivel', '/como-aprendo', '/guia-familias', '/reto-lectura', '/fichas', '/voces', '/estanteria', '/escribe', '/cuentos', '/enunciados', '/redaccion', '/entrenar/comp_vocab'];
const READ = { es: ['lectura_l1_gato', 'lectura_eso_newton'], ca: ['lectura_ca_l1_estel', 'lectura_ca_eso_adn'], en: ['reading_en_l1_kite', 'reading_en_eso_dna'] };
const BAD = /\bundefined\b|\bNaN\b|\[object Object\]|\{[a-z]+\}|\b(?:ev|es|st|sto|hw|rc|ws|wl|sh|flu|tg|subj|read|dash|set|voice|ach|prof|hist|res|ex|lvl|sk|hdr|onb)_[a-z_]{3,}\b/;

(async () => {
  const b = await chromium.launch();
  const issues = [];
  for (const lang of ['es', 'ca', 'en']) {
    for (const profile of ['new', 'used']) {
      const ctx = await b.newContext({ viewport: { width: 390, height: 844 } });
      const p = await ctx.newPage();
      let where = '';
      const tag = () => `${lang}/${profile} ${where}`;
      p.on('pageerror', (e) => issues.push(`${tag()} PAGEERROR ${e.message}`));
      p.on('console', (m) => { if (m.type() === 'error' && !/favicon|fonts\.g/.test(m.text())) issues.push(`${tag()} CONSOLE ${m.text().slice(0, 200)}`); });
      p.on('requestfailed', (r) => { if (!/fonts\.g/.test(r.url())) issues.push(`${tag()} REQFAIL ${r.url().slice(0, 120)} ${r.failure()?.errorText}`); });
      p.on('response', (r) => { if (r.status() >= 400 && r.url().startsWith(BASE)) issues.push(`${tag()} HTTP${r.status()} ${r.url()}`); });
      await p.goto(BASE);
      await p.evaluate(({ lang, profile }) => {
        localStorage.clear();
        const now = Date.now();
        const used = profile === 'used';
        const hist = used ? Array.from({ length: 12 }, (_, i) => ({ id: 's' + i, module: ['fonologia', 'escritura', 'comprension_lectora'][i % 3], level: 2, total_questions: 10, correct_answers: 7, score_percent: 70, stars: 2, xp_earned: 20, time_ms: 200000, answers: [], completed_at: new Date(now - i * 86400000).toISOString(), mode: i % 4 === 0 ? 'reading' : 'normal' })) : [];
        localStorage.setItem('lectorix-store', JSON.stringify({ state: {
          onboardingDone: true, placementDismissed: true, language: lang, practiceLanguage: 'auto',
          progress: used ? [{ module: 'fonologia', level: 1, best_score: 90, stars: 3, attempts: 3, completed: true }, { module: 'fonologia', level: 2, best_score: 70, stars: 2, attempts: 2, completed: true }] : [],
          sessionHistory: hist,
          user: { id: 'u', display_name: 'Ana', total_xp: used ? 540 : 0, streak_days: used ? 4 : 0, last_session: new Date(now).toISOString() },
        }, version: 0 }));
      }, { lang, profile });
      await p.reload(); await p.waitForTimeout(800);
      for (const r of [...ROUTES, ...READ[lang].map((x) => '/lectura/' + x)]) {
        where = r;
        await p.goto(BASE + '#' + r); await p.waitForTimeout(1300);
        const body = await p.innerText('body').catch(() => '');
        const m = body.match(BAD);
        if (m) issues.push(`${tag()} TEXT “${body.slice(Math.max(0, m.index - 40), m.index + 40).replace(/\n/g, ' ')}”`);
        if (body.trim().length < 40) issues.push(`${tag()} EMPTY page`);
        const broken = await p.evaluate(() => [...document.images].filter((i) => i.complete && i.naturalWidth === 0 && i.src).map((i) => i.src.slice(0, 80)));
        broken.forEach((x) => issues.push(`${tag()} BROKEN-IMG ${x}`));
        const overflow = await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
        if (overflow > 2) issues.push(`${tag()} HORIZONTAL-SCROLL ${overflow}px`);
      }
      await ctx.close();
    }
  }
  await b.close();
  const uniq = [...new Set(issues)];
  console.log(uniq.join('\n') || 'no issues');
  console.log('ISSUES', uniq.length);
})();
