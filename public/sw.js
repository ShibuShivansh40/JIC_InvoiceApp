// Minimal service worker: makes the app installable and lets it open offline.
// - Page loads: network first, falling back to the last cached copy.
// - Same-origin static files (hashed bundle, icons, fonts): cache first.
// - API calls (other origins) are never touched, so data is always live.
const CACHE = 'jic-invoices-v1';

self.addEventListener('install', (event) => {
  // Cache the page plus the (hashed) bundle it references, so the app opens offline
  event.waitUntil(
    caches.open(CACHE).then(async (c) => {
      const res = await fetch('/', { cache: 'no-store' });
      const html = await res.clone().text();
      await c.put('/', res);
      const scripts = [...html.matchAll(/src="?(\/[^"\s>]+\.js)/g)].map((m) => m[1]);
      await c.addAll(['/manifest.json', '/icon-192.png', ...scripts]);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put('/', copy));
          return res;
        })
        .catch(() => caches.match('/'))
    );
    return;
  }

  if (/\.(js|png|jpg|svg|ttf|woff2?)$/.test(url.pathname) && !url.pathname.endsWith('/sw.js')) {
    event.respondWith(
      caches.match(req).then((hit) => hit || fetch(req).then((res) => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
        }
        return res;
      }))
    );
  }
});
