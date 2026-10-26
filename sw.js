'use strict';

const CACHE_PREFIX = 'honor-e-link-';
const CACHE_NAME = CACHE_PREFIX + 'v2';
const APP_ROOT = new URL('./', self.location.href);
const FILES = [
  './', './index.html', './styles.css?v=2', './app.js?v=2', './manifest.webmanifest',
  './assets/apple-touch-icon.png', './assets/favicon-32.png',
  './assets/icon-192.png', './assets/icon-512.png',
  './assets/icon-maskable-512.png', './assets/icon.svg'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME)
    .then(cache => cache.addAll(FILES.map(file => new Request(new URL(file, APP_ROOT), { cache: 'reload' }))))
    .then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(key => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME).map(key => caches.delete(key))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== APP_ROOT.origin || !url.pathname.startsWith(APP_ROOT.pathname)) return;

  if (request.mode === 'navigate') {
    // Fresh HTML online, a complete cached app when disconnected.
    event.respondWith(fetch(request).then(response => {
      if (response.ok) {
        const copy = response.clone();
        event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.put(new URL('./', APP_ROOT).href, copy)));
      }
      return response;
    }).catch(() => caches.match(APP_ROOT.href)));
    return;
  }
  event.respondWith(caches.match(request).then(cached => cached || fetch(request)));
});
