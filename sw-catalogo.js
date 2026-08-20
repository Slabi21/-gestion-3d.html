/* =========================================================
   Service Worker — Catálogo Taller 3D
   ---------------------------------------------------------
   Mismo criterio que sw.js (el de gestion-3d.html), pero para
   catalogo-3d.html: guarda una copia local del "cascarón" de la
   página para que abra rápido y no se quede en blanco con mala
   señal. Los DATOS de los productos (nombre, precio, fotos) no
   los cachea este archivo — de eso se encarga la caché offline
   propia de Firestore, habilitada en el código de catalogo-3d.html.

   IMPORTANTE — subir este archivo a GitHub Pages junto con
   catalogo-3d.html, en la MISMA carpeta.

   IMPORTANTE — cada vez que subas una versión nueva de
   catalogo-3d.html, cambiá el número de CACHE_NAME de abajo
   (ej. de 'v1' a 'v2'), igual que ya hacés con sw.js.
   ========================================================= */
const CACHE_NAME = 'taller3d-catalogo-shell-v21';
const APP_SHELL = ['./catalogo-3d.html'];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Misma estrategia que sw.js: con internet siempre trae la versión más
// nueva y la guarda; sin internet, usa la última copia guardada.
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Las fotos de producto viven en GitHub (raw.githubusercontent.com) y
  // las consultas a Firebase son de otro origen: no se tocan, tienen que
  // fallar solas si no hay internet, cachearlas acá no tiene sentido.
  if (url.origin !== self.location.origin) return;
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request, { cache: 'no-store' })
      .then((resp) => {
        const copia = resp.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copia));
        return resp;
      })
      .catch(() =>
        caches.match(event.request).then((r) => r || caches.match('./catalogo-3d.html'))
      )
  );
});
