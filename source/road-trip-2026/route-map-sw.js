const CACHE_NAME = 'road-trip-2026-map-v26';
const CORE_PATHS = [
  './',
  './index.html',
  './route-map-offline.html',
  './route-map-amap.html',
  './route-roadbook.html',
  './assets/route_segments_amap.js',
  './assets/route_map_pois.js',
  './assets/road_trip_days.js',
  './assets/road_trip_meals.js',
  './assets/road_trip_costs.js',
  './assets/amap-config.public.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(CORE_PATHS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key.startsWith('road-trip-2026-map-') && key !== CACHE_NAME).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || !url.pathname.includes('/road-trip-2026/')) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          if (response && response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => caches.match(request, { ignoreSearch: true }).then(cached => cached || caches.match('./route-map-offline.html')))
    );
    return;
  }

  // 数据脚本与页面样式：网络优先（network-first）。
  // 有网时永远拿最新的 .js / .html，避免“改了数据但缓存没升级”导致的空壳/旧内容；
  // 断网时回退到缓存，保证离线可用。图片等静态资源走下方 stale-while-revalidate。
  if (/\.(js|html|css)$/i.test(url.pathname)) {
    event.respondWith(
      fetch(request)
        .then(response => {
          if (response && response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => caches.match(request, { ignoreSearch: true }))
    );
    return;
  }

  event.respondWith(
    caches.match(request, { ignoreSearch: true }).then(cached => {
      const network = fetch(request).then(response => {
        if (response && response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
        }
        return response;
      }).catch(() => cached);
      // stale-while-revalidate：命中缓存先返回，同时后台拉取最新资源写回缓存，
      // 避免改了数据文件但缓存版本忘记升级时长期返回旧内容。
      return cached || network;
    })
  );
});
