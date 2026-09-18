const CACHE = "bao-pruefung-v2";
const DATEIEN = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(DATEIEN)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ).then(() => self.clients.claim()));
});

// Netz zuerst, damit Aktualisierungen sofort ankommen; offline aus dem Cache
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    fetch(e.request).then(res => {
      const kopie = res.clone();
      caches.open(CACHE).then(c => c.put(e.request, kopie));
      return res;
    }).catch(() => caches.match(e.request).then(r => r || caches.match("./index.html")))
  );
});
