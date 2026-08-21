/* =========================================================
   Service Worker — Taller 3D
   ---------------------------------------------------------
   Hace que la app abra siempre, tenga o no tenga internet,
   guardando una copia local ("caché") del archivo HTML la
   primera vez que se abre con conexión.

   IMPORTANTE — subir este archivo a GitHub Pages junto con
   gestion-3d.html, en la MISMA carpeta.

   IMPORTANTE — cada vez que subas una versión nueva del HTML,
   cambiá el número de CACHE_NAME de abajo (ej. de 'v1' a 'v2').
   Si no lo cambiás, los celulares que ya tenían la app guardada
   van a seguir viendo la versión vieja aunque subas la nueva.
   ========================================================= */
const CACHE_NAME = 'taller3d-shell-v21';
const APP_SHELL = ['./gestion-3d.html'];

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

// Estrategia: intenta traer la versión más nueva por internet y la
// guarda en caché; si no hay conexión, usa la última copia guardada.
// Así, con internet siempre ves la versión al día, y sin internet
// la app abre igual con lo último que se guardó.
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Las llamadas a Google (Drive/login) no se tocan: si no hay
  // internet, tienen que fallar solas, no tiene sentido cachearlas.
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
        caches.match(event.request).then((r) => r || caches.match('./gestion-3d.html'))
      )
  );
});
