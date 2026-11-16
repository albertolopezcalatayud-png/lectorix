const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true });
  const p = await ctx.newPage();
  await p.goto('http://localhost:4173/lectorix/');
  await p.evaluate(() => { localStorage.clear(); (localStorage.setItem('lectorix-mode', 'solo'), localStorage).setItem('lectorix-store', JSON.stringify({ state: { onboardingDone: true, language: 'es', practiceLanguage: 'auto', progress: [], sessionHistory: [] }, version: 0 })); });
  await p.goto('http://localhost:4173/lectorix/#/escribe'); await p.reload(); await p.waitForTimeout(1500);
  const cdp = await ctx.newCDPSession(p);
  const compose = async (t) => { await cdp.send('Input.imeSetComposition', { text: t, selectionStart: t.length, selectionEnd: t.length }); await p.waitForTimeout(80); };
  const val = () => p.inputValue('textarea');
  let fail = 0; const check = (name, got, want) => { const ok = got === want; if (!ok) fail++; console.log(ok ? 'PASS' : 'FAIL', name, JSON.stringify(got), ok ? '' : 'want ' + JSON.stringify(want)); };
  await p.click('textarea');
  // 1. Typing an accented word through the IME, as Gboard does (the word stays "composing" until the space)
  for (const t of ['j', 'ju', 'jug', 'juga', 'jugar', 'jugará']) await compose(t);
  check('composing accented', await val(), 'jugará');
  await cdp.send('Input.insertText', { text: 'jugará' }); await cdp.send('Input.insertText', { text: ' ' }); await p.waitForTimeout(100);
  check('committed accented', await val(), 'jugará ');
  // 2. Choosing an accented suggestion while the word is still composing, then typing on
  for (const t of ['c', 'ca', 'can', 'canc', 'canci']) await compose(t);
  await p.waitForTimeout(500);
  const chips = await p.locator('[role=group] button:not([aria-label])').allInnerTexts(); console.log('chips', chips);
  await p.locator('[role=group] button', { hasText: /^canción$/ }).first().tap();
  await p.waitForTimeout(200);
  check('after suggestion', await val(), 'jugará canción ');
  for (const t of ['b', 'bo', 'bon', 'boni', 'bonit', 'bonita']) await compose(t);
  check('typing on', await val(), 'jugará canción bonita');
  await cdp.send('Input.insertText', { text: 'bonita' }); await p.waitForTimeout(100);
  check('final', await val(), 'jugará canción bonita');
  await b.close(); process.exit(fail ? 1 : 0);
})();
