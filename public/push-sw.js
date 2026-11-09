/* Lectorix — push reminder handler, imported by the generated service worker.
 * The server sends an empty push; the text is built here from a small piece of
 * state the app saves in Cache Storage (streak and language), so no personal
 * data ever travels through the push service. */

const META_CACHE = 'lectorix-meta';
const META_URL = 'meta.json';

const TEXTS = {
  es: {
    title: '📚 ¡Hora de practicar!',
    body: 'Solo 10 minutos al día marcan la diferencia.',
    streakTitle: '🔥 ¡No pierdas tu racha!',
    streakBody: (n) => `Llevas ${n} días seguidos. ¡No lo dejes hoy!`,
  },
  ca: {
    title: '📚 Hora de practicar!',
    body: 'Només 10 minuts al dia marquen la diferència.',
    streakTitle: '🔥 No perdis la ratxa!',
    streakBody: (n) => `Portes ${n} dies seguits. No ho deixis avui!`,
  },
  en: {
    title: '📚 Time to practice!',
    body: 'Just 10 minutes a day makes a difference.',
    streakTitle: "🔥 Don't lose your streak!",
    streakBody: (n) => `You're on a ${n}-day streak. Don't stop now!`,
  },
};

async function readMeta() {
  try {
    const cache = await caches.open(META_CACHE);
    const res = await cache.match(META_URL);
    return res ? await res.json() : {};
  } catch {
    return {};
  }
}

self.addEventListener('push', (event) => {
  event.waitUntil((async () => {
    const meta = await readMeta();
    const tx = TEXTS[meta.lang] || TEXTS.es;
    const streak = Number(meta.streak) || 0;
    const title = streak >= 2 ? tx.streakTitle : tx.title;
    const body = streak >= 2 ? tx.streakBody(streak) : tx.body;
    await self.registration.showNotification(title, {
      body,
      icon: 'icons/icon-192.png',
      badge: 'icons/maskable-192.png',
      tag: 'lectorix-reminder',
      renotify: true,
      data: { url: './' },
    });
  })());
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil((async () => {
    const all = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    const existing = all.find((c) => c.url.startsWith(self.registration.scope));
    if (existing) return existing.focus();
    return self.clients.openWindow(self.registration.scope);
  })());
});
