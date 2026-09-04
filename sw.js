/* Service worker for offline/instant-load caching of the app shell and static assets.
   Cross-origin requests (radio-browser API, audio streams) are never touched here —
   only same-origin files (index.html, assets/*) are cached. */

const CACHE_NAME = 'retro-radio-v1';
const NETWORK_TIMEOUT_MS = 3000;

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.add('./index.html')).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

function withTimeout(promise, ms) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('timeout')), ms);
    promise.then(
      value => { clearTimeout(timer); resolve(value); },
      err => { clearTimeout(timer); reject(err); }
    );
  });
}

// App shell (HTML/navigation): try network first with a short timeout, fall back to
// cache on failure or slow connections, so a weak/away-from-home network never hangs
// on a blank screen if the app has loaded successfully before.
function handleShellRequest(request) {
  const cachePut = caches.open(CACHE_NAME);
  return withTimeout(fetch(request), NETWORK_TIMEOUT_MS)
    .then(response => {
      if (response && response.ok) {
        cachePut.then(cache => cache.put(request, response.clone()));
      }
      return response;
    })
    .catch(() => caches.match(request).then(cached => cached || fetch(request)));
}

// Static assets (images/icons): cache-first, populate cache on first fetch.
function handleAssetRequest(request) {
  return caches.match(request).then(cached => {
    if (cached) return cached;
    return fetch(request).then(response => {
      if (response && response.ok) {
        caches.open(CACHE_NAME).then(cache => cache.put(request, response.clone()));
      }
      return response;
    });
  });
}

self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET' || url.origin !== location.origin) return;

  if (request.mode === 'navigate' || url.pathname.endsWith('/index.html') || url.pathname.endsWith('/')) {
    event.respondWith(handleShellRequest(request));
  } else if (url.pathname.includes('/assets/')) {
    event.respondWith(handleAssetRequest(request));
  }
});
