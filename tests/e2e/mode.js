// First screen, asked once to everyone (new installs and people updating): "How will you use Lectorix?"
// "For me" = one student, as always. "With several students" = an adult lends the device: no profile for the adult,
// the app opens on "Who is going to practise?", and the adults' area manages the students.
const { chromium } = require('playwright');
const BASE = 'http://localhost:4173/lectorix/';
(async () => {
  const b = await chromium.launch(); let fails = 0; const errors = [];
  const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
  const fresh = async (seed) => {
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 } }); const p = await ctx.newPage(); p.on('pageerror', (e) => errors.push(e.message));
    await p.goto(BASE);
    await p.evaluate((s) => { localStorage.clear(); sessionStorage.clear(); indexedDB.deleteDatabase('lectorix-profiles'); localStorage.setItem('lectorix-store', s || JSON.stringify({ state: { language: 'es' }, version: 0 })); }, seed || null);
    await p.goto(BASE + '#/'); await p.reload(); await p.waitForTimeout(1200);
    return p;
  };
  const LEO = JSON.stringify({ state: { onboardingDone: true, language: 'es', practiceLanguage: 'auto', progress: [], sessionHistory: [], placementDone: { es: true }, user: { id: 'u', display_name: 'Leo', total_xp: 640, streak_days: 6, last_session: new Date().toISOString() } }, version: 0 });
  const reg = (p) => p.evaluate(() => JSON.parse(localStorage.getItem('lectorix-profiles') || 'null'));
  const mode = (p) => p.evaluate(() => localStorage.getItem('lectorix-mode'));

  // 1. New install, "For me"
  let p = await fresh();
  ok(await p.getByRole('heading', { name: '¿Cómo vas a usar Lectorix?' }).count() === 1, 'new install: the question is the first screen');
  ok(await p.getByRole('button', { name: /Para mí/ }).count() === 1 && await p.getByRole('button', { name: /Con varios alumnos/ }).count() === 1, 'two clear options');
  await p.getByRole('button', { name: 'Valencià' }).click();
  ok(await p.getByRole('heading', { name: 'Com usaràs Lectorix?' }).count() === 1, 'the language can be chosen on this screen');
  await p.getByRole('button', { name: 'Español' }).click();
  await p.getByRole('button', { name: /Para mí/ }).click(); await p.waitForTimeout(600);
  ok(await mode(p) === 'solo' && await p.getByText('¿Quién va a practicar?').count() === 0 && (await reg(p)) === null, '"For me": one student, no profiles, no picker');
  ok(await p.getByRole('button', { name: /Siguiente|Saltar/ }).count() > 0, '…and the student\'s welcome starts');
  await p.reload(); await p.waitForTimeout(1000);
  ok(await p.getByText('¿Cómo vas a usar Lectorix?').count() === 0, 'the question is not asked again');

  // 2. New install, "With several students"
  p = await fresh();
  await p.getByRole('button', { name: /Con varios alumnos/ }).click(); await p.waitForTimeout(1200);
  ok(await mode(p) === 'group' && await p.getByText('Zona docente').count() > 0, 'goes straight to the adults\' area');
  ok(await p.getByText(/Empieza añadiendo a tu primer alumno/).count() === 1 && (await reg(p)) === null && await p.locator('li h3').count() === 0, 'no students yet and no profile for the adult');
  for (const [name, av] of [['Ana', '🐼'], ['Marc', '🚀']]) {
    await p.getByRole('button', { name: /Añadir un perfil/ }).click();
    await p.getByLabel('Nombre o alias').fill(name);
    await p.getByRole('group', { name: 'Dibujo del perfil' }).getByRole('button', { name: av }).click();
    await p.getByRole('button', { name: 'Guardar' }).click(); await p.waitForTimeout(800);
  }
  let r = await reg(p);
  ok(r && r.list.length === 2 && r.list.map((x) => x.name).join() === 'Ana,Marc', 'exactly the two students created: no phantom profile (' + (r ? r.list.map((x) => x.name || '(blank)').join() : 'none') + ')');
  await p.getByRole('button', { name: /Ir a «¿Quién va a practicar\?»/ }).click(); await p.waitForTimeout(600);
  ok(await p.getByText('¿Quién va a practicar?').count() === 1 && await p.getByRole('button', { name: /Ana/ }).count() === 1 && await p.getByRole('button', { name: /Marc/ }).count() === 1, 'picker with the two students');
  ok(await p.getByRole('button', { name: /Zona docente/ }).count() === 1, 'the adults\' area is one tap away');
  await p.getByRole('button', { name: /Marc/ }).click(); await p.waitForLoadState('load'); await p.waitForTimeout(1800);
  ok(await p.getByRole('button', { name: /Siguiente|Saltar/ }).count() > 0 && await p.getByText('¿Cómo vas a usar Lectorix?').count() === 0, 'Marc gets his own welcome, not the question');
  await p.getByRole('button', { name: /Saltar/ }).click(); await p.waitForTimeout(1200);
  ok(await p.getByText('¡Hola, Marc!').count() > 0, 'the app greets Marc');
  // reopening the app asks who is practising, even to continue
  await p.evaluate(() => sessionStorage.clear()); await p.goto(BASE + '#/'); await p.reload(); await p.waitForTimeout(1200);
  ok(await p.getByText('¿Quién va a practicar?').count() === 1, 'the app always opens on the picker in this mode');
  await p.getByRole('button', { name: /Marc/ }).click(); await p.waitForTimeout(1000);
  await p.goto(BASE + '#/perfil'); await p.waitForTimeout(1000);
  ok(await p.getByRole('button', { name: /Zona docente/ }).count() === 1, 'the student\'s profile screen names the adults\' area');
  await p.getByRole('button', { name: /turno de otro alumno/ }).click(); await p.waitForLoadState('load'); await p.waitForTimeout(1500);
  ok(await p.getByText('¿Quién va a practicar?').count() === 1, '"another student\'s turn" goes back to the picker');
  // empty picker (all students deleted is not possible; a fresh group device with none shows a message)
  p = await fresh(); await p.evaluate(() => localStorage.setItem('lectorix-mode', 'group')); await p.reload(); await p.waitForTimeout(1000);
  ok(await p.getByText('Zona docente').count() > 0, 'a device for several students with none yet opens the adults\' area');

  // 3. Someone who already uses the app (updating): asked once, nothing lost
  p = await fresh(LEO);
  ok(await p.getByRole('heading', { name: '¿Cómo vas a usar Lectorix?' }).count() === 1, 'existing user: asked too');
  await p.getByRole('button', { name: /Para mí/ }).click(); await p.waitForTimeout(1000);
  ok(await p.getByText('¡Hola, Leo!').count() > 0 && (await p.evaluate(() => JSON.parse(localStorage.getItem('lectorix-store')).state.user.total_xp)) === 640, '"For me": straight back to his home with his 640 points');

  // 4. Existing user who chooses "several students": he becomes the first profile
  p = await fresh(LEO);
  await p.getByRole('button', { name: /Con varios alumnos/ }).click(); await p.waitForTimeout(1200);
  r = await reg(p);
  ok(r && r.list.length === 1 && r.list[0].name === 'Leo' && await p.getByText(/Puntos: 640/).count() === 1, 'his progress is kept as the first profile');

  // 5. Changing the mode later, in Settings
  await p.getByRole('button', { name: /Ir a «¿Quién va a practicar\?»/ }).click(); await p.waitForTimeout(500);
  await p.getByRole('button', { name: /Leo/ }).click(); await p.waitForTimeout(1000);
  await p.goto(BASE + '#/ajustes'); await p.waitForTimeout(1200);
  ok(await p.getByText(/Ahora: «Con varios alumnos»/).count() === 1, 'Settings says which mode is on');
  await p.getByRole('button', { name: 'Cambiar el modo de uso' }).click(); await p.waitForLoadState('load'); await p.waitForTimeout(1500);
  ok(await p.getByRole('heading', { name: '¿Cómo vas a usar Lectorix?' }).count() === 1, 'changing it shows the question again');
  await p.getByRole('button', { name: /Para mí/ }).click(); await p.waitForTimeout(1000);
  ok(await p.getByText('¡Hola, Leo!').count() > 0 && (await p.evaluate(() => JSON.parse(localStorage.getItem('lectorix-store')).state.user.total_xp)) === 640, 'back to "For me" with nothing lost');
  ok(errors.length === 0, 'no page errors ' + errors.join(' | '));
  await b.close(); process.exit(fails ? 1 : 0);
})();
