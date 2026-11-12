// Essay planner: pick a kind, notes, write with linking words, checklist with spelling, finish with XP, saved draft
const { chromium } = require('playwright');
const BASE = 'http://localhost:4173/lectorix/';
const TEXT = {
  es: ['Hoy en día muchos alumnos llevan el móvil a clase. En mi opinión, debería estar guardado durante las clases.',
       'En primer lugar, el móvil distrae mucho. Por ejemplo, cuando suena una notificación todo el mundo mira la pantalla y se pierde la explicación.',
       'En segundo lugar, sin móviles hablamos más con los compañeros en el recreo y jugamos juntos. Eso nos ayuda a hacer amigos.',
       '',
       'En conclusión, creo que los móviles deben estar guardados en clase, salvo cuando el profesor los pida para una actividad consreta.'],
  ca: ['Hui dia molts alumnes porten el mòbil a classe. Al meu parer, hauria d’estar guardat durant les classes.',
       'En primer lloc, el mòbil distrau molt. Per exemple, quan sona una notificació tothom mira la pantalla i es perd l’explicació.',
       'En segon lloc, sense mòbils parlem més amb els companys al pati i juguem junts. Això ens ajuda a fer amics.',
       '',
       'En conclusió, crec que els mòbils han d’estar guardats a classe, excepte quan el professor els demane per a una activitat concreta.'],
  en: ['Nowadays many students bring their phones to class. In my opinion, phones should be put away during lessons.',
       'Firstly, phones are very distracting. For example, when a notification arrives everyone looks at the screen and misses the explanation.',
       'Secondly, without phones we talk more to our classmates at break time and play together. That helps us to make friends.',
       '',
       'In conclusion, I think phones should be put away in class, except when the teacher asks for them for a specfic activity.'],
};
(async () => {
  const b = await chromium.launch(); const errors = [];
  const check = (c, m) => { console.log(c ? 'PASS' : 'FAIL', m); if (!c) errors.push(m); };
  for (const lang of ['es', 'ca', 'en']) {
    const p = await b.newPage({ viewport: { width: 390, height: 844 } });
    p.on('pageerror', (e) => errors.push(lang + ' ' + e.message));
    await p.goto(BASE);
    await p.evaluate((lang) => { localStorage.clear(); localStorage.setItem('lectorix-store', JSON.stringify({ state: { onboardingDone: true, placementDismissed: true, language: lang, practiceLanguage: 'auto', progress: [], sessionHistory: [], user: { id: 'u', display_name: 'Ana', total_xp: 0, streak_days: 0, last_session: '2020-01-01T00:00:00Z' } }, version: 0 })); }, lang);
    await p.reload(); await p.waitForTimeout(600);
    await p.goto(BASE + '#/redaccion'); await p.waitForTimeout(900);
    await p.screenshot({ path: __dirname + `/essay-${lang}-pick.png`, fullPage: true });
    await p.locator('h3').first().click(); await p.waitForTimeout(500); // opinion
    const plan = await p.innerText('body');
    check(/Introducción|Introducció|Introduction/.test(plan) && /Conclusión|Conclusió|Conclusion/.test(plan), `${lang}: opinion parts shown`);
    await p.locator('button.text-left.bg-accent-pale').first().click(); // topic idea
    await p.locator('textarea').first().fill('móviles / distraen');
    await p.getByRole('button', { name: /(Ahora, a escribir|Ara, a escriure|Now, write it)/ }).click(); await p.waitForTimeout(500);
    const tas = p.locator('textarea');
    for (let i = 0; i < 5; i++) if (TEXT[lang][i]) await tas.nth(i).fill(TEXT[lang][i]);
    // linking word chip into the empty counter paragraph
    await tas.nth(3).click(); await p.locator('button', { hasText: /^\+ (Sin embargo|No obstant això|However)$/ }).click(); await p.waitForTimeout(200);
    const v = await tas.nth(3).inputValue();
    check(/^(Sin embargo|No obstant això|However) $/.test(v), `${lang}: linking word inserted with a capital (“${v}”)`);
    await tas.nth(3).fill('');
    await p.screenshot({ path: __dirname + `/essay-${lang}-write.png`, fullPage: true });
    await p.getByRole('button', { name: /(Revisar mi texto|Revisar el meu text|Check my text)/ }).click(); await p.waitForTimeout(2500);
    let body = await p.innerText('body');
    console.log('   ', (await p.locator('p.flex.gap-2').allInnerTexts()).map((x) => x.replace(/\n/g, ' ')).join(' | ').slice(0, 900));
    const typo = { es: 'consreta', ca: null, en: 'specfic' }[lang];
    if (typo) check(body.includes(typo), `${lang}: spelling flags “${typo}”`);
    const fixBtn = p.locator('div.pl-7 button').first();
    if (typo && await fixBtn.count()) { const to = await fixBtn.innerText(); await fixBtn.click(); await p.waitForTimeout(400); check(!(await p.innerText('body')).includes(typo + ' ') && (await p.innerText('body')).includes(to), `${lang}: typo fixed to “${to}”`); }
    await p.screenshot({ path: __dirname + `/essay-${lang}-check.png`, fullPage: true });
    await p.getByRole('button', { name: /(He terminado|He acabat|I have finished)/ }).click(); await p.waitForTimeout(500);
    body = await p.innerText('body');
    const xp = await p.evaluate(() => JSON.parse(localStorage.getItem('lectorix-store')).state.user.total_xp);
    check(/\+20 XP/.test(body) && xp === 20, `${lang}: finished, +20 XP (total ${xp})`);
    await p.getByRole('button', { name: /(Volver a mis|Tornar a les meues|Back to my)/ }).click(); await p.waitForTimeout(400);
    check(/(Mis redacciones|Les meues redaccions|My writing)/.test(await p.innerText('body')) && /✅/.test(await p.innerText('body')), `${lang}: saved in the list`);
    await p.close();
  }
  await b.close(); console.log('ERRORS', errors.length, errors.slice(0, 5));
})();
