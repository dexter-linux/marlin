const CACHE_NAME = 'marlin-tutors-cache-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './welcome-to-marlin-tutors.pdf',
  './r-language-tutorial.pdf',
  './marlin-tutors-logo.png'
];

// Perform install steps and cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened Marlin Tutors Cache Workspace');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => self.skipWaiting())
  );
});

// Cache clean-up on activation
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Clearing old cache instance:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Intercept fetch requests to serve cached content offline
self.addEventListener('fetch', (event) => {
  // Pass dynamic Jitsi Meet conferencing directly to the live network
  if (event.request.url.includes('meet.jit.si') || event.request.url.includes('external_api.js')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response; // Return cached asset
      }
      return fetch(event.request).then((networkResponse) => {
        // Cache newly requested local documents on the fly
        if (event.request.url.startsWith(self.location.origin)) {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        }
        return networkResponse;
      });
    })
  );
});
