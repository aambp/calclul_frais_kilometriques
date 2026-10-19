// Service worker : réseau d'abord en revalidant toujours (jamais de version périmée), cache en secours hors connexion
const CACHE = "frais-km-v21";
const FILES = ["./", "./index.html", "./manifest.webmanifest", "./logo.png", "./icon-192.png", "./icon-512.png"];
self.addEventListener("install", e => { self.skipWaiting(); e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES.map(f => new Request(f, { cache: "reload" }))))); });
self.addEventListener("activate", e => e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== self.location.origin) return; // API d'itinéraire, base et cartes : jamais mises en cache
  e.respondWith(fetch(e.request.url, { cache: "no-cache" }) // revalide auprès du serveur au lieu du cache HTTP de 10 min
    .then(r => { if (r.ok){ const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); } return r; })
    .catch(() => caches.match(e.request)));
});
