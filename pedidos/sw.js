// Service worker de la página de pedidos del móvil (se publica como pedidos/sw.js; lo registra web/pedidos.html).
// Con él, el navegador deja instalarla como una app. Siempre pide la página a internet (así se ve lo último que se
// publicó) y solo si no hay conexión enseña la última que bajó. Los pedidos no pasan por aquí: van a Google.
const CACHE = 'pedidos-v1';

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then((c) => c.add('./')).catch(() => {}));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys()
    .then((claves) => Promise.all(claves.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', (e) => {
  const peticion = e.request;
  if (peticion.method !== 'GET' || new URL(peticion.url).origin !== self.location.origin) return;
  e.respondWith(fetch(peticion).then((respuesta) => {
    if (respuesta.ok) {
      const copia = respuesta.clone();
      caches.open(CACHE).then((c) => c.put(peticion, copia));
    }
    return respuesta;
  }).catch(() => caches.match(peticion, { ignoreSearch: true }).then((r) => r || caches.match('./'))));
});
