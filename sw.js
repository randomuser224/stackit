// Offline cache. Bump VERSION when files change so phones pick up the update.
const VERSION = 'stackit-v3';
const FILES = ['./', 'index.html', 'chart.umd.min.js', 'manifest.json', 'icons/apple-touch-icon.png', 'icons/icon-192.png', 'icons/icon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES))); self.skipWaiting(); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))));
  self.clients.claim();
});
// Network first so updates show up when online; cache when offline (fonts included once seen).
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(fetch(e.request).then(r => {
    const copy = r.clone();
    if (r.ok || r.type === 'opaque') caches.open(VERSION).then(c => c.put(e.request, copy));
    return r;
  }).catch(() => caches.match(e.request, {ignoreSearch: true}).then(m => m || caches.match('index.html'))));
});
