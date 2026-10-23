// Service worker Frais KM : l'appli s'ouvre et fonctionne hors connexion.
// - Fichiers de l'appli : réseau d'abord (toujours la dernière version), cache en secours.
// - Bibliothèques externes (versions figées) : cache d'abord, préchargées à l'installation.
// - Base de données, itinéraires, adresses, cartes : jamais mis en cache (réseau seulement).
const CACHE = "frais-km-v29";
const APP = ["./", "./index.html", "./manifest.webmanifest", "./logo.png", "./icon-192.png", "./icon-512.png"];
const LIBS = [
  "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css",
  "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js",
  "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.js",
  "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js",
  "https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600&family=Barlow+Condensed:wght@500;600;700&display=swap"
];
const LIB_HOSTS = ["unpkg.com", "cdn.jsdelivr.net", "cdnjs.cloudflare.com", "fonts.googleapis.com", "fonts.gstatic.com"];

self.addEventListener("install", e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(async c => {
    await c.addAll(APP.map(f => new Request(f, { cache: "reload" })));
    // Une bibliothèque injoignable ne bloque pas l'installation
    await Promise.all(LIBS.map(u => fetch(u, { mode: "no-cors" }).then(r => c.put(u, r)).catch(() => {})));
  }));
});
self.addEventListener("activate", e => e.waitUntil(
  caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())
));
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  const url = new URL(e.request.url);
  if (url.origin === self.location.origin){
    e.respondWith(fetch(e.request.url, { cache: "no-cache" })
      .then(r => { if (r.ok){ const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); } return r; })
      .catch(() => caches.match(e.request, { ignoreSearch: true }).then(r => r || caches.match("./index.html"))));
    return;
  }
  if (LIB_HOSTS.includes(url.hostname)){
    e.respondWith(caches.match(e.request).then(hit => hit || fetch(e.request).then(r => {
      if (r.ok || r.type === "opaque"){ const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); }
      return r;
    })));
  }
  // Tout le reste (Supabase, OSRM, géocodage, tuiles de carte) : réseau seulement
});
