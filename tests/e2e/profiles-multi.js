// A school counsellor asked for several students on one device, each with their own space.
// Checks: profiles do not mix or lose data, the picker, the adult PIN, copies (export / import / replace), delete.
const { chromium } = require('playwright');
const fs = require('fs');
const BASE = 'http://localhost:4173/lectorix/';
(async () => {
  const b = await chromium.launch(); let fails = 0; const errors = [];
  const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, acceptDownloads: true });
  const p = await ctx.newPage(); p.on('pageerror', (e) => errors.push(e.message));
  await p.goto(BASE);
  await p.evaluate(() => {
    localStorage.clear(); sessionStorage.clear(); indexedDB.deleteDatabase('lectorix-profiles');
    localStorage.setItem('lectorix-store', JSON.stringify({ state: { onboardingDone: true, language: 'es', practiceLanguage: 'auto', progress: [{ module: 'fonologia', level: 3, best_score: 80, stars: 2 }], sessionHistory: [], placementDone: { es: true },
      user: { id: 'u', display_name: 'Leo', total_xp: 640, streak_days: 6, last_session: new Date().toISOString(), avatar: '🦊' } }, version: 0 }));
    localStorage.setItem('lectorix-review', JSON.stringify({ state: { items: { a: { id: 'a', lang: 'es', word: 'hormiga', box: 1, due: 0, misses: 2, added: 0 } } }, version: 0 }));
    localStorage.setItem('lectorix-readaloud', JSON.stringify({ state: { enabled: true }, version: 0 })); // a device setting
  });
  const store = () => p.evaluate(() => JSON.parse(localStorage.getItem('lectorix-store') || '{}').state || {});
  const go = async (path) => { await p.goto(BASE + '#' + path); await p.reload(); await p.waitForTimeout(1200); };

  // 1. One profile: nothing changes, no picker
  await go('/');
  ok(await p.getByText('¡Hola, Leo!').count() > 0 && await p.getByText('¿Quién va a practicar?').count() === 0, 'one student: the app opens as always, no picker');
  await go('/perfil');
  await p.getByRole('button', { name: /Perfiles de este dispositivo/ }).click(); await p.waitForTimeout(800);
  ok(await p.getByRole('heading', { name: 'Leo' }).count() === 1, 'the current student is listed');

  // 2. Add a second profile
  await p.getByRole('button', { name: /Añadir un perfil/ }).click();
  await p.getByLabel('Nombre o alias').fill('Ana');
  await p.getByRole('group', { name: 'Dibujo del perfil' }).getByRole('button', { name: '🐼' }).click();
  await p.getByRole('button', { name: 'Guardar' }).click(); await p.waitForTimeout(800);
  ok(await p.getByRole('heading', { name: /Ana/ }).count() === 1 && await p.getByRole('heading', { name: /Leo/ }).count() === 1, 'two profiles listed');
  ok(await p.getByText(/Puntos: 640/).count() === 1 && await p.getByText('● en uso').count() === 1, 'Leo is the one in use and keeps his 640 points');
  ok((await store()).user.total_xp === 640, 'adding a profile did not touch the current data');

  // 3. Opening the app now asks who is practising
  await p.evaluate(() => sessionStorage.clear()); await go('/');
  ok(await p.getByText('¿Quién va a practicar?').count() === 1, 'picker shown with two profiles');
  ok(await p.getByRole('button', { name: /Ana/ }).count() === 1 && await p.getByRole('button', { name: /Leo/ }).count() === 1, 'both students on the picker');
  await p.getByRole('button', { name: /Ana/ }).click(); await p.waitForLoadState('load'); await p.waitForTimeout(1800);
  let st = await store();
  ok(!st.user && !st.onboardingDone, 'Ana starts empty: none of Leo\'s data is there');
  ok(await p.evaluate(() => localStorage.getItem('lectorix-review')) === null, 'Leo\'s difficult words are not in Ana\'s space');
  ok(await p.evaluate(() => JSON.parse(localStorage.getItem('lectorix-readaloud')).state.enabled) === true, 'device settings are shared');
  ok(await p.getByText(/Lectorix/).count() > 0 && await p.getByText('¿Quién va a practicar?').count() === 0, 'Ana gets the welcome screens, and the picker does not come back');
  // Ana finishes the welcome and earns something
  await p.evaluate(() => { localStorage.setItem('lectorix-store', JSON.stringify({ state: { onboardingDone: true, language: 'es', practiceLanguage: 'auto', progress: [], sessionHistory: [], placementDone: { es: true }, user: { id: 'u2', display_name: '', total_xp: 15, streak_days: 1, last_session: new Date().toISOString() } }, version: 0 })); });
  await go('/');
  ok(await p.getByText('¡Hola, Ana!').count() > 0, 'the profile name is the name the app greets with');

  // 4. Back to Leo: everything as he left it
  await go('/perfiles');
  ok(await p.getByText(/Puntos: 640/).count() === 1 && await p.getByText(/Puntos: 15/).count() === 1, 'summary of every student');
  await p.getByRole('button', { name: /Entrar/ }).click(); await p.waitForLoadState('load'); await p.waitForTimeout(1800);
  st = await store();
  ok(st.user.display_name === 'Leo' && st.user.total_xp === 640 && st.progress.length === 1, 'Leo is back with his points and progress');
  ok(await p.evaluate(() => JSON.parse(localStorage.getItem('lectorix-review')).state.items.a.word) === 'hormiga', 'and his difficult words');
  ok(await p.getByText('¡Hola, Leo!').count() > 0, 'home greets Leo');

  // 5. Report of another student from the list
  await go('/perfiles');
  await p.locator('li', { hasText: 'Ana' }).getByRole('button', { name: /Informe/ }).click(); await p.waitForLoadState('load'); await p.waitForTimeout(1800);
  ok((await p.evaluate(() => location.hash)) === '#/panel-padres' && (await store()).user.total_xp === 15, 'report opens the family panel of that student');

  // 6. Copy of a profile, delete, import as new, replace
  await go('/perfiles');
  const [dl] = await Promise.all([p.waitForEvent('download'), p.locator('li', { hasText: 'Leo' }).getByRole('button', { name: /Copia/ }).click()]);
  const file = '/tmp/leo-copy.json'; await dl.saveAs(file);
  const copy = JSON.parse(fs.readFileSync(file, 'utf8'));
  ok(copy.app === 'lectorix' && copy.name === 'Leo' && JSON.parse(copy.data['lectorix-store']).state.user.total_xp === 640 && !('lectorix-readaloud' in copy.data) && !('lectorix-profiles' in copy.data), 'the copy has Leo\'s data and no device settings');
  ok(/^lectorix-leo-\d{4}-\d\d-\d\d\.json$/.test(dl.suggestedFilename()), 'copy file name: ' + dl.suggestedFilename());
  await p.locator('li', { hasText: 'Leo' }).getByRole('button', { name: /Borrar: Leo/ }).click();
  ok(await p.getByText(/no se puede deshacer/).count() === 1, 'deleting warns that it cannot be undone');
  await p.getByRole('alertdialog').getByRole('button', { name: 'Borrar' }).click(); await p.waitForTimeout(1200);
  ok(await p.getByRole('heading', { name: /Leo/ }).count() === 0 && await p.getByRole('heading', { name: /Ana/ }).count() === 1, 'Leo deleted, Ana untouched');
  await p.setInputFiles('input[type=file]', file); await p.waitForTimeout(600);
  ok(await p.getByText('Perfiles en la copia: 1').count() === 1, 'the copy is recognised');
  await p.getByRole('button', { name: /Añadir como perfil nuevo/ }).click(); await p.waitForTimeout(1000);
  ok(await p.getByRole('heading', { name: /Leo/ }).count() === 1 && await p.getByText(/Puntos: 640/).count() === 1, 'Leo is back from the copy with 640 points');
  fs.writeFileSync('/tmp/not-lectorix.json', '{"hello":1}');
  await p.setInputFiles('input[type=file]', '/tmp/not-lectorix.json'); await p.waitForTimeout(500);
  ok(await p.getByText('Ese archivo no es una copia de Lectorix.').count() === 1, 'a foreign file is refused');
  // replace Ana (in use) with Leo's copy, after a warning
  await p.setInputFiles('input[type=file]', file); await p.waitForTimeout(600);
  await p.getByRole('dialog').getByRole('button', { name: /Ana/ }).click();
  ok(await p.getByText(/se perderá/).count() === 1, 'replacing warns that the current progress is lost');
  await p.getByRole('alertdialog').getByRole('button', { name: 'Sustituir' }).click(); await p.waitForLoadState('load'); await p.waitForTimeout(1800);
  st = await store();
  ok(st.user.total_xp === 640 && st.user.display_name === 'Ana', 'Ana now has the progress of the copy and keeps her name');

  // 7. Adult PIN
  await go('/perfiles');
  await p.getByRole('button', { name: 'Poner PIN' }).click();
  await p.getByLabel(/PIN nuevo/).fill('2468'); await p.getByRole('button', { name: 'Guardar' }).click(); await p.waitForTimeout(600);
  ok(await p.getByText(/PIN guardado/).count() === 1, 'PIN saved');
  ok(!(await p.evaluate(() => localStorage.getItem('lectorix-profiles'))).includes('2468'), 'the PIN is not stored in clear');
  await p.evaluate(() => sessionStorage.clear()); await go('/');
  await p.getByRole('button', { name: /Leo/ }).click();
  ok(await p.getByRole('dialog').getByText('PIN de adulto').count() === 1, 'choosing a profile asks for the PIN');
  await p.getByLabel('Escribe el PIN').fill('1111'); await p.getByRole('button', { name: 'Entrar' }).click(); await p.waitForTimeout(400);
  ok(await p.getByText('PIN incorrecto.').count() === 1 && (await store()).user.display_name === 'Ana', 'wrong PIN: nothing changes');
  await p.getByLabel('Escribe el PIN').fill('2468'); await p.getByRole('button', { name: 'Entrar' }).click(); await p.waitForLoadState('load'); await p.waitForTimeout(1800);
  ok((await store()).user.display_name === 'Leo', 'right PIN: Leo opens');
  await go('/perfiles');
  ok(await p.getByRole('dialog').getByText('PIN de adulto').count() === 1 && await p.getByRole('button', { name: /Añadir un perfil/ }).count() === 0, 'the management screen is behind the PIN');

  // 8. The profiles that are not in use are kept aside, not in the app's working storage
  const idbKeys = await p.evaluate(() => new Promise((res) => { const rq = indexedDB.open('lectorix-profiles', 1); rq.onsuccess = () => { const r = rq.result.transaction('data').objectStore('data').getAllKeys(); r.onsuccess = () => res(r.result.length); }; }));
  ok(idbKeys >= 1, 'inactive profiles are stored aside (' + idbKeys + ')');
  ok(errors.length === 0, 'no page errors ' + errors.join(' | '));
  await b.close(); process.exit(fails ? 1 : 0);
})();
