// Tolu Agb PWA service worker — minimal offline shell.
// Network-first for navigations (always try fresh, fall back to cache),
// cache-first for static assets. Keeps the app installable + resilient.

const CACHE = 'toluagb-v1';
const SHELL = ['/', '/portal/dashboard', '/portal/login'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL).catch(() => {})));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  // Never cache API calls or LiveKit — always go to network.
  const url = new URL(request.url);
  if (url.pathname.startsWith('/api/') || url.hostname.includes('livekit') || url.hostname.includes('railway')) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((res) => { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(request, copy)); return res; })
        .catch(() => caches.match(request).then((r) => r || caches.match('/')))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request).then((res) => {
      if (res.ok && url.origin === location.origin) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(request, copy)); }
      return res;
    }).catch(() => cached))
  );
});
