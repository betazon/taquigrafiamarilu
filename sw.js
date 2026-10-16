self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open('taquigrafia-pwa').then((cache) => {
      return cache.addAll(['./index.html', './manifest.json', './mi_foto.jpg']);
    })
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => {
      return response || fetch(e.request);
    })
  );
});