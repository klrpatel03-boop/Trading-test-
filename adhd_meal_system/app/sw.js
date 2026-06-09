/* ============================================================================
 * Anchor — sw.js (service worker)
 * Offline-first cache so the app works with no connection once installed.
 * Cache-first for app shell, network-fallback. Bump CACHE_VERSION on each
 * release so the activate step purges old caches and serves fresh assets.
 * ==========================================================================*/
var CACHE_VERSION = "5";
var CACHE = "anchor-v" + CACHE_VERSION;
var ASSETS = [
  "index.html",
  "cheatsheet.html",
  "manifest.json",
  "css/base.css",
  "css/components.css",
  "css/views.css",
  "css/print.css",
  "js/data.js",
  "js/library.js",
  "js/cookbooks.js",
  "js/library2.js",
  "js/library3.js",
  "js/foods.js",
  "js/library4.js",
  "js/library5.js",
  "js/library6.js",
  "js/library7.js",
  "js/library8.js",
  "js/library9.js",
  "js/library10.js",
  "js/library_garden.js",
  "js/garden.js",
  "js/util.js",
  "js/store.js",
  "js/calc.js",
  "js/charts.js",
  "js/ui.js",
  "js/notify.js",
  "js/views/today.js",
  "js/views/decide.js",
  "js/views/plan.js",
  "js/views/prep.js",
  "js/views/menu.js",
  "js/views/plate.js",
  "js/views/cookday.js",
  "js/views/garden.js",
  "js/views/pan.js",
  "js/views/cookbooks.js",
  "js/views/flavor.js",
  "js/views/groceries.js",
  "js/views/budget.js",
  "js/views/calculator.js",
  "js/views/wellness.js",
  "js/views/track.js",
  "js/views/insights.js",
  "js/views/pantry.js",
  "js/views/learn.js",
  "js/views/help.js",
  "js/views/settings.js",
  "js/app.js",
  "assets/icon.svg",
];

self.addEventListener("install", function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (cache) {
      // addAll fails the whole install if one asset 404s; add individually so
      // a single missing file (e.g. a png icon) doesn't break offline support.
      return Promise.all(ASSETS.map(function (url) {
        return cache.add(url).catch(function (err) {
          // log instead of silently swallowing so a typo'd/missing asset in the
          // ASSETS list is visible in DevTools rather than mysteriously offline-broken.
          if (self.console) console.warn("[sw] failed to cache:", url, err && err.message);
          return null;
        });
      }));
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (k) {
        if (k !== CACHE) return caches.delete(k);
      }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener("fetch", function (e) {
  if (e.request.method !== "GET") return;
  e.respondWith(
    caches.match(e.request).then(function (cached) {
      if (cached) return cached;
      return fetch(e.request).then(function (resp) {
        // runtime cache same-origin GETs
        if (resp && resp.status === 200 && e.request.url.indexOf(self.location.origin) === 0) {
          var copy = resp.clone();
          caches.open(CACHE).then(function (c) { c.put(e.request, copy); });
        }
        return resp;
      }).catch(function () {
        // offline + uncached: fall back to the shell for navigations
        if (e.request.mode === "navigate") return caches.match("index.html");
      });
    })
  );
});
