/* ==========================================================================
   PsiAgenda — Service Worker (sw.js)
   Garantiza instalabilidad PWA y disponibilidad offline de próximas citas
   ========================================================================== */

const CACHE_NAME = 'psiagenda-cache-v1';
const OFFLINE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.svg'
];

// Instalación
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(OFFLINE_URLS);
    })
  );
  self.skipWaiting();
});

// Activación y limpieza de caches antiguos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch con estrategia Network-First para datos clínicos/citas, Cache-First para estáticos
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Para navegación y vistas
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match('/index.html');
      })
    );
    return;
  }

  // Network First para APIs de citas / sincronización
  if (url.pathname.includes('/appointments') || url.pathname.includes('/portal')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const cloned = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, cloned));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Stale-while-revalidate para recursos estáticos
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const networked = fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const cloned = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, cloned));
          }
          return response;
        })
        .catch(() => cached);

      return cached || networked;
    })
  );
});
