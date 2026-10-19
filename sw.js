// Keeps the app working offline. Workout data never passes through here:
// it lives in the browser's local storage on the phone.
const CACHE = 'upper-lower-v3';
const FILES = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png',
  './icon-maskable-512.png',
  './apple-touch-icon.png',
  './fonts/barlow-latin-400-normal.woff2',
  './fonts/barlow-latin-500-normal.woff2',
  './fonts/barlow-latin-600-normal.woff2',
  './fonts/barlow-condensed-latin-500-normal.woff2',
  './fonts/barlow-condensed-latin-600-normal.woff2',
  './fonts/barlow-condensed-latin-700-normal.woff2',
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(FILES)).then(() => self.skipWaiting()));
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
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  if (req.mode === 'navigate') {
    // Open instantly from the cache, and refresh the cached copy for next launch.
    const fresh = fetch(req).then(async (res) => {
      if (res.ok) {
        const cache = await caches.open(CACHE);
        await cache.put('./index.html', res.clone());
      }
      return res;
    });
    event.waitUntil(fresh.catch(() => {}));
    event.respondWith(
      caches.match('./index.html')
        .then((cached) => cached || caches.match('./'))
        .then((cached) => cached || fresh)
    );
    return;
  }
  event.respondWith(caches.match(req).then((hit) => hit || fetch(req)));
});
