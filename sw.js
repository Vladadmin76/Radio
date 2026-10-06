/* Service worker: app shell cache, and injection of radio-extras.js so the
   large index.html does not have to be rewritten for player improvements. */
const CACHE_NAME = 'retro-radio-v2';
const NETWORK_TIMEOUT_MS = 3000;

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(['./index.html', './radio-extras.js']).catch(() => {}))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)));
    await self.clients.claim();
    const windows = await self.clients.matchAll({ type: 'window' });
    for (const client of windows) client.navigate(client.url);
  })());
});

function withTimeout(promise, ms) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('timeout')), ms);
    promise.then(v => { clearTimeout(timer); resolve(v); }, e => { clearTimeout(timer); reject(e); });
  });
}

function inject(html) {
  if (html.includes('radio-extras.js')) return html;
  return html.replace('</body>', '<script src="radio-extras.js"></script></body>');
}

function handleShellRequest(request) {
  return withTimeout(fetch(request), NETWORK_TIMEOUT_MS)
    .then(response => response.text().then(html => {
      const headers = new Headers(response.headers);
      headers.set('Content-Type', 'text/html; charset=utf-8');
      headers.set('Cache-Control', 'no-cache');
      return new Response(inject(html), { status: response.status, headers });
    }))
    .catch(() => caches.match(request).then(cached => cached || fetch(request)));
}

function handleAssetRequest(request) {
  return caches.match(request).then(cached => {
    if (cached) return cached;
    return fetch(request).then(response => {
      if (response && response.ok) caches.open(CACHE_NAME).then(cache => cache.put(request, response.clone()));
      return response;
    });
  });
}

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== location.origin) return;
  if (event.request.mode === 'navigate' || url.pathname.endsWith('/index.html') || url.pathname.endsWith('/')) {
    event.respondWith(handleShellRequest(event.request));
  } else if (url.pathname.includes('/assets/') || url.pathname.endsWith('/radio-extras.js')) {
    event.respondWith(handleAssetRequest(event.request));
  }
});
