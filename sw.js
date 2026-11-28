// Greenpad service worker.
// No hace falta tocar VERSION en cada cambio: las páginas van por red primero (cada visita con internet trae la
// última) y la app abierta se fija sola si el index.html publicado cambió. VERSION es el nombre de la caché:
// subilo solo cuando cambies este archivo, para que se renueve todo lo guardado.
const VERSION = 'greenpad-v1.29.0';
const CACHE = VERSION;
const SOUNDS = 'greenpad-sonidos-v1'; // las grabaciones de Banda (no cambian entre versiones)
// lo justo para abrir sin conexión. El resto (mini.html, plugins.html, el conversor a MP3) se guarda la primera vez que se usa.
// Los plugins que vienen prendidos (los <script src="plugins/..."> de index.html) también, para que estén sin conexión.
const SHELL = ['./', './banda.webmanifest', './manifest.webmanifest', './icon.svg', './icon-180.png', './icon-192.png', './icon-512.png', './caveat-bold.woff2', './frases.txt', './acerca.txt',
  './plugins/guitarra.js', './plugins/tuchacha.js', './plugins/boombap.js', './plugins/trap.js'];
const NET_WAIT = 4000; // páginas: si la red tarda más que esto, se abre la copia guardada y la nueva queda lista para la próxima

// Cloudflare Pages redirige /index.html a / y /mini.html a /mini: se guarda una copia sin la redirección,
// porque una respuesta redirigida no sirve para abrir la página sin conexión
const clean = (res) => (res.redirected ? res.blob().then((b) => new Response(b, { status: res.status, statusText: res.statusText, headers: res.headers })) : Promise.resolve(res));
const put = (c, key, res) => clean(res).then((r) => c.put(key, r)).catch(() => {});
// cada página se guarda por su dirección limpia: / , /mini , /plugins (sin .html, sin ?intro ni #b=...)
const pageKey = (u) => { const url = new URL(u); return url.origin + url.pathname.replace(/index\.html$/, '').replace(/\.html$/, ''); };

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => Promise.all(SHELL.map((u) =>
    fetch(u, { cache: 'no-cache' }).then((res) => {
      if (res.ok) return put(c, u === './' ? pageKey(new URL(u, location.href).href) : u, res);
      if (u === './') throw new Error('sin página');
    })
  ))).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE && k !== SOUNDS).map((k) => caches.delete(k))))
      .then(() => self.registration.navigationPreload && self.registration.navigationPreload.enable().catch(() => {}))
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
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;

  // páginas: red primero, así cada visita con internet trae la última versión. Sin conexión (o con una red que
  // no responde en NET_WAIT) se abre la copia guardada, y lo que llegue después queda guardado para la próxima.
  if (req.mode === 'navigate') {
    const key = pageKey(req.url);
    e.respondWith((async () => {
      const c = await caches.open(CACHE);
      const net = Promise.resolve(e.preloadResponse).then((pre) => pre || fetch(req)).then((res) => {
        if (res && res.ok && res.type === 'basic') e.waitUntil(put(c, key, res.clone()));
        return res;
      });
      e.waitUntil(net.catch(() => {}));
      const hit = await caches.match(key);
      if (!hit) return net.catch(() => caches.match(pageKey(new URL('./', location.href).href)).then((r) => r || Response.error()));
      const late = new Promise((res) => setTimeout(() => res(null), NET_WAIT));
      const first = await Promise.race([net.catch(() => null), late]);
      return first || hit;
    })());
    return;
  }
  // plugins (plugins/*.js): red primero, así la lista de plugins.html siempre instala la versión nueva; caché si no hay conexión.
  // Los que vienen prendidos los pide la página al abrir: si la red tarda más de NET_WAIT, sale la copia guardada.
  if (url.pathname.includes('/plugins/')) {
    const key = url.origin + url.pathname;
    e.respondWith((async () => {
      const net = fetch(req).then((res) => { if (res.ok) { const copy = res.clone(); e.waitUntil(caches.open(CACHE).then((c) => c.put(key, copy))); } return res; });
      e.waitUntil(net.catch(() => {}));
      const hit = await caches.match(key);
      if (!hit) return net;
      const late = new Promise((res) => setTimeout(() => res(null), NET_WAIT));
      return (await Promise.race([net.catch(() => null), late])) || hit;
    })());
    return;
  }
  // textos editables del repo (así se ven los nuevos apenas se suben)
  const txt = /\/(frases|acerca)\.txt$/.exec(url.pathname);
  if (txt) { // frases del logo y "Acerca de": red primero, caché si no hay conexión
    const key = './' + txt[1] + '.txt';
    e.respondWith(fetch(req).then((res) => { if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(key, copy)); } return res; }).catch(() => caches.match(key)));
    return;
  }
  // grabaciones: se guardan la primera vez que se usan, así después suenan sin conexión
  if (url.pathname.includes('/sonidos/')) {
    e.respondWith(
      caches.open(SOUNDS).then((c) => c.match(req).then((hit) => hit || fetch(req).then((res) => { if (res.ok) c.put(req, res.clone()); return res; })))
    );
    return;
  }
  // resto (íconos, fuente, manifest, conversor a MP3): sale de la copia guardada al instante y se renueva por detrás
  e.respondWith(caches.open(CACHE).then(async (c) => {
    const hit = await caches.match(req);
    const net = fetch(req).then((res) => { if (res.ok && res.type === 'basic') e.waitUntil(put(c, req, res.clone())); return res; });
    if (hit) { e.waitUntil(net.catch(() => {})); return hit; }
    return net;
  }));
});
