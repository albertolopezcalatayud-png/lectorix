const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const errors = [];
  for (const [lang, typed, want] of [['es', 'Mañana iré al cumple', 'cumpleaños'], ['es', 'El pinguin', 'pingüino'], ['ca', 'Demà anirem a la plat', 'platja'], ['en', 'I like my beaut', 'beautiful']]) {
    const p = await b.newPage({ viewport: { width: 390, height: 844 } });
    p.on('pageerror', (e) => errors.push(e.message));
    await p.goto('http://localhost:4173/lectorix/');
    await p.evaluate((lang) => { localStorage.clear(); localStorage.setItem('lectorix-store', JSON.stringify({ state: { onboardingDone: true, language: lang, practiceLanguage: 'auto', progress: [], sessionHistory: [] }, version: 0 })); }, lang);
    await p.goto('http://localhost:4173/lectorix/#/escribe'); await p.reload(); await p.waitForTimeout(1500);
    await p.click('textarea'); await p.keyboard.type(typed, { delay: 20 }); await p.waitForTimeout(600);
    const chips = await p.locator('[role=group] button:not([aria-label])').allInnerTexts();
    const ok = chips.some((c) => c.toLowerCase() === want);
    console.log(ok ? 'PASS' : 'FAIL', lang, JSON.stringify(typed), '→', chips.join(' | '));
    if (ok) {
      await p.locator('[role=group] button', { hasText: new RegExp('^' + want + '$', 'i') }).first().click();
      await p.keyboard.type('genial', { delay: 10 });
      console.log('   text:', await p.inputValue('textarea'));
    }
    if (lang === 'es' && typed.startsWith('Mañana')) await p.screenshot({ path: __dirname + '/pred.png' });
    await p.close();
  }
  await b.close(); console.log('ERRORS', errors);
})();
