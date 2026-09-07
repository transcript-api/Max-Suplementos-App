// MAXFORM Performance System - Service Worker (Offline Cache & Sync)
const CACHE_NAME = 'maxform-cache-v2';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/maxmind-symbol.svg',
  '/maxmind-logo.svg',
  '/maxmind-logo-dark.svg'
];

// Instalación: Cachear shell de la aplicación
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('Algunos recursos estáticos no pudieron ser cacheados inicialmente:', err);
      });
    }).then(() => {
      return self.skipWaiting();
    })
  );
});

// Activación: Limpiar caches obsoletos
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
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// Intercepción de Fetch: Estrategia Network-First con Fallback a Cache para navegación y Stale-While-Revalidate para estáticos
self.addEventListener('fetch', (event) => {
  // Omitir peticiones de chrome-extension o métodos que no sean GET
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);

  // Evitar interceptar llamadas a la API de Firestore o Google APIs externas
  if (url.hostname.includes('firestore.googleapis.com') || 
      url.hostname.includes('identitytoolkit.googleapis.com')) {
    return;
  }

  // Para rutas de la API de backend (/api/*), intentar red primero
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request).catch(() => {
        return new Response(JSON.stringify({ 
          offline: true, 
          message: 'Sin conexión a internet. Los datos se guardan en la cola local de MAXFORM.' 
        }), {
          headers: { 'Content-Type': 'application/json' }
        });
      })
    );
    return;
  }

  // Para assets estáticos y shell: Cache First / Stale While Revalidate
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch((err) => {
        // Si no hay red y no hay en caché, devolver fallback
        if (cachedResponse) return cachedResponse;
        if (event.request.headers.get('accept')?.includes('text/html')) {
          return caches.match('/index.html');
        }
        throw err;
      });

      return cachedResponse || fetchPromise;
    })
  );
});

// Manejo de eventos de Background Sync
self.addEventListener('sync', (event) => {
  if (event.tag === 'maxform-sync-queue') {
    event.waitUntil(
      self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage({ type: 'TRIGGER_OFFLINE_SYNC' });
        });
      })
    );
  }
});
