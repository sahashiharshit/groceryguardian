const CACHE_NAME = "grocery-cache-v1";
const urlsToCache = [
  "/",
  "/dist/index.html",
  "/dist/js/app.js",
  "/dist/assets/icons/icon-192.png",
  "/dist/assets/icons/icon-512.png"
];

// Install SW
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

// Fetch requests
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) return response;
      return fetch(event.request).then((res) => {
        if (
            res &&
            res.status === 200 &&
            event.request.method === "GET" &&
            event.request.url.startsWith(self.location.origin)
          ) {
            if (
              event.request.url.match(/\.(css|js|png|jpg|jpeg|gif|svg|webp)$/)
            ) {
              const resClone = res.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, resClone);
              });
            }
          }
          return res;
        })
        .catch(() => {
          if (event.request.mode === "navigate") {
            return caches.match("/"); // fallback to home
          }
      });
    })
  );
});

// Activate
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) return caches.delete(cache);
        })
      );
    })
  );
});
