
const cacheName = 'tydlig_tid_cache';

self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(caches.open(cacheName).then(cache => {
      return fetch(event.request.url).then(fetchedResponse => {
        cache.put(event.request, fetchedResponse.clone());

        return fetchedResponse;
      }).catch(() => {
        return cache.match(event.request.url);
      });
    }));
  }
});
