// Greenpad service worker. Subí VERSION en cada release para renovar la caché.
const VERSION = 'greenpad-v1.7.0';
const ASSETS = ['./', './index.html', './banda.html', './manifest.webmanifest', './banda.webmanifest', './icon.svg', './icon-180.png', './icon-192.png', './icon-512.png'];
const SOUNDS = 'greenpad-sonidos-v1'; // las grabaciones de Banda (no cambian entre versiones)

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION && k !== SOUNDS).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  // páginas: red primero (para recibir versiones nuevas), caché si no hay conexión.
  // Cada página se guarda con su propia dirección (index.html y banda.html no se pisan).
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req)
        .then((res) => { const copy = res.clone(); caches.open(VERSION).then((c) => c.put(req, copy)); return res; })
        .catch(() => caches.match(req).then((hit) => hit || caches.match('./index.html')))
    );
    return;
  }
  // grabaciones: se guardan la primera vez que se usan, así después suenan sin conexión
  if (new URL(req.url).pathname.includes('/sonidos/')) {
    e.respondWith(
      caches.open(SOUNDS).then((c) => c.match(req).then((hit) => hit || fetch(req).then((res) => { if (res.ok) c.put(req, res.clone()); return res; })))
    );
    return;
  }
  // resto: caché primero
  e.respondWith(caches.match(req).then((hit) => hit || fetch(req)));
});
