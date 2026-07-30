/* Entropy Sphere service worker — offline-first app shell */
const VERSION = "v1.0.1";
const SHELL_CACHE = "es-shell-" + VERSION;
const FONT_CACHE = "es-fonts-" + VERSION;

// App shell — cached on install. Relative paths keep this working under a
// GitHub Pages project subpath (e.g. /username.github.io/repo/).
const SHELL = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./image/favicon.svg",
  "./image/favicon-32.png",
  "./image/icon-192.png",
  "./image/icon-512.png",
  "./image/icon-maskable-192.png",
  "./image/icon-maskable-512.png",
  "./image/apple-touch-icon.png"
];

const FONT_ORIGINS = ["https://fonts.googleapis.com", "https://fonts.gstatic.com"];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== SHELL_CACHE && k !== FONT_CACHE).map(k => caches.delete(k))
    )).then(() => self.clients.claim())
  );
});

// Cache-first with background refresh; returns cached copy immediately when present.
function cacheFirst(request, cacheName) {
  return caches.open(cacheName).then(cache =>
    cache.match(request).then(hit => {
      const network = fetch(request).then(res => {
        if (res && (res.ok || res.type === "opaque")) cache.put(request, res.clone());
        return res;
      }).catch(() => hit);
      return hit || network;
    })
  );
}

self.addEventListener("fetch", event => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);

  // Google Fonts (stylesheet + font files) — runtime cache so type survives offline.
  if (FONT_ORIGINS.includes(url.origin)) {
    event.respondWith(cacheFirst(req, FONT_CACHE));
    return;
  }

  // Same-origin: serve the app shell from cache, fall back to network,
  // and for navigations fall back to index.html when offline.
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(req).then(hit => hit || fetch(req).then(res => {
        const copy = res.clone();
        caches.open(SHELL_CACHE).then(c => c.put(req, copy));
        return res;
      }).catch(() => (req.mode === "navigate" ? caches.match("./index.html") : Response.error())))
    );
  }
});
