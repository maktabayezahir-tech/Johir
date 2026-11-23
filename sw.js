// মাকতাবায়ে জহির — অফলাইনে চালানোর জন্য সার্ভিস ওয়ার্কার
// অ্যাপের ফাইল আপডেট করলে নিচের সংস্করণ নম্বর বাড়িয়ে দিন (v1 → v2)
const CACHE = 'maktabaye-zahir-v4';
const SHELL = ['./', 'index.html', 'manifest.json', 'favicon.ico',
  'icons/icon-192.png', 'icons/icon-512.png', 'icons/emblem.png', 'icons/apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// নেটওয়ার্ক আগে (নতুন সংস্করণ পেতে), না পেলে ক্যাশ থেকে
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then(res => {
        if (res && (res.ok || res.type === 'opaque')) {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, copy));
        }
        return res;
      })
      .catch(() => caches.match(e.request).then(r => r || caches.match('index.html')))
  );
});
