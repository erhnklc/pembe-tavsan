// Uygulama kabuğunu ve sesleri önbelleğe alır, böylece internetsiz de çalışır.
const CACHE = 'pembe-tavsan-v3';
const FILES = [
  './', 'index.html', 'style.css', 'app.js', 'manifest.webmanifest', 'icon.svg',
  'audio/hosgeldin.mp3', 'audio/aferin.mp3',
  'audio/cat.mp3', 'audio/dog.mp3', 'audio/apple.mp3', 'audio/banana.mp3',
  'audio/red.mp3', 'audio/blue.mp3', 'audio/one.mp3', 'audio/two.mp3',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then((hit) => hit || fetch(e.request).then((res) => {
      if (res.ok && new URL(e.request.url).origin === location.origin) {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copy));
      }
      return res;
    }).catch(() => caches.match('index.html'))),
  );
});
