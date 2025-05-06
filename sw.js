const CACHE_NAME = 'illa-calavera-v2';
const ASSETS = [
  'index.html',
  'style.css',
  'img/platja-pirata2.webp',
  // ...i la resta d’assets que vulguis offline
];

self.addEventListener('install', evt => {
  evt.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('fetch', evt => {
  evt.respondWith(
    caches.match(evt.request)
      .then(cached => cached || fetch(evt.request))
  );
});
