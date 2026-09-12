const CACHE = "bills-app-v1";

const ASSETS = [
  "/",
  "/index.html",
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  const url = e.request.url;

  // ✅ Never cache API calls — always go to network
  if (url.includes("/api/") || url.includes("onrender.com")) {
    e.respondWith(fetch(e.request));
    return;
  }

  // ✅ Never cache POST/DELETE/PUT requests
  if (e.request.method !== "GET") {
    e.respondWith(fetch(e.request));
    return;
  }

  // ✅ For everything else — network first, cache as fallback
  e.respondWith(
    fetch(e.request)
      .then((response) => {
        // Save a copy in cache
        const copy = response.clone();
        caches.open(CACHE).then((cache) => cache.put(e.request, copy));
        return response;
      })
      .catch(() => caches.match(e.request))
  );
});