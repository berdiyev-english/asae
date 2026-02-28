const CACHE = 'tutor-v5';
const ASSETS = [
  './',
  './index.html'
];

// Install: cache core files
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate: clean old caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// Fetch: cache-first for same-origin, network-first otherwise
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // Only handle same-origin GET requests
  if (e.request.method !== 'GET') return;
  if (url.origin !== location.origin) return;

  e.respondWith(
    caches.match(e.request).then(cached => {
      // Try network, fall back to cache
      const networkFetch = fetch(e.request).then(response => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE).then(cache => {
            cache.put(e.request, clone);
          });
        }
        return response;
      }).catch(() => {
        // Network failed, return cached version
        return cached;
      });

      // Return cached immediately if available, but still update in background
      return cached || networkFetch;
    })
  );
});

// Push notifications from main thread
self.addEventListener('message', e => {
  if (e.data && e.data.type === 'NOTIFY') {
    self.registration.showNotification(e.data.title, {
      body: e.data.body,
      tag: e.data.tag || 'tutor',
      vibrate: [200, 100, 200],
      renotify: true,
      icon: 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect width="512" height="512" rx="100" fill="#7c5cfc"/><text x="256" y="340" text-anchor="middle" font-size="260" font-weight="bold" fill="white" font-family="Arial">T</text></svg>')
    });
  }
});

// Notification click: focus or open app
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(list => {
        if (list.length) {
          list[0].focus();
        } else {
          clients.openWindow('./');
        }
      })
  );
});
