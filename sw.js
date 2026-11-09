// Greenpad service worker. Subí VERSION en cada release para renovar la caché.
const VERSION = 'greenpad-v1.16.3';
const ASSETS = ['./', './index.html', './mini.html', './manifest.webmanifest', './banda.webmanifest', './lame.min.js', './icon.svg', './icon-180.png', './icon-192.png', './icon-512.png', './caveat-bold.woff2', './frases.txt', './acerca.txt'];
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
  if (req.method !== 'GET') return;
  // la firma (imagen de jeanphillippe.com): se guarda para que se vea también sin conexión
  if (req.url === 'https://jeanphillippe.com/madeby-light.png') {
    e.respondWith(caches.open(SOUNDS).then((c) => c.match(req).then((hit) => {
      const net = fetch(req).then((res) => { if (res.ok || res.type === 'opaque') c.put(req, res.clone()); return res; });
      if (hit) { net.catch(() => {}); return hit; }
      return net;
    })));
    return;
  }
  if (new URL(req.url).origin !== location.origin) return;
  // páginas: red primero (para recibir versiones nuevas), caché si no hay conexión.
  // Cada página se guarda con su propia dirección (index.html y mini.html no se pisan).
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req)
        .then((res) => { const copy = res.clone(); caches.open(VERSION).then((c) => c.put(req, copy)); return res; })
        .catch(() => caches.match(req).then((hit) => hit || caches.match('./index.html')))
    );
    return;
  }
  // textos editables del repo (así se ven los nuevos apenas se suben)
  const txt = /\/(frases|acerca)\.txt$/.exec(new URL(req.url).pathname);
  if (txt) { // frases del logo y "Acerca de": red primero, caché si no hay conexión
    const key = './' + txt[1] + '.txt';
    e.respondWith(fetch(req).then((res) => { if (res.ok) { const copy = res.clone(); caches.open(VERSION).then((c) => c.put(key, copy)); } return res; }).catch(() => caches.match(key)));
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
