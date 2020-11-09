console.log('Hello from service-worker.js');
//
// importScripts('https://storage.googleapis.com/workbox-cdn/releases/5.1.2/workbox-sw.js');
//
// if (workbox) {
//   console.log(`Yay! Workbox is loaded 🎉`);
// } else {
//   console.log(`Boo! Workbox didn't load 😬`);
// }
//
// workbox.routing.registerRoute(
//   ({request}) => request.destination === 'document',
//   new workbox.strategies.NetworkFirst()
// );

// self.addEventListener("install", (event) => {
//   event.waitUntil(
//     (async () => {
//       const cache = await caches.open("offline");
//       // Setting {cache: 'reload'} in the new request will ensure that the
//       // response isn't fulfilled from the HTTP cache; i.e., it will be from
//       // the network.
//       await cache.add(new Request("offline.html", { cache: "reload" }));
//     })()
//   );
// });

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      let data = caches.open("data")
      console.log(data, caches)
      // Enable navigation preload if it's supported.
      // See https://developers.google.com/web/updates/2017/02/navigation-preload
      if ("navigationPreload" in self.registration) {
        await self.registration.navigationPreload.enable();
      }
      data.add("offline.html")
    })()
  );

  // Tell the active service worker to take control of the page immediately.
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  // the data cache
  let data = caches.open("data")
  console.log(data, caches)
  // the url
  const url = new URL(event.request.url);
  // We only want to call event.respondWith() if this is a navigation request
  // for an HTML page.
  if (event.request.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          // First, try to use the navigation preload response if it's supported.
          const preloadResponse = await event.preloadResponse;
          if (preloadResponse) {
            return preloadResponse;
          }

          // Always try the network first.
          const networkResponse = await fetch(event.request);
          // save data for later use
          data.put(url, networkResponse);
          return networkResponse;
        } catch (error) {
          // catch is only triggered if an exception is thrown, which is likely
          // due to a network error.
          // If fetch() returns a valid HTTP response with a response code in
          // the 4xx or 5xx range, the catch() will NOT be called.
          console.log("Fetch failed; returning cache instead.", error);
          const cachedResponse = await data.match(url);
          if (!cachedResponse)
          {
            const offline = await data.match("offline.html");
            return offline;
          }
          return cachedResponse;
        }
      })()
    );
  }

  // If our if() condition is false, then this fetch handler won't intercept the
  // request. If there are any other fetch handlers registered, they will get a
  // chance to call event.respondWith(). If no fetch handlers call
  // event.respondWith(), the request will be handled by the browser as if there
  // were no service worker involvement.
});
