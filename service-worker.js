console.log('Hello from service-worker.js');

importScripts('https://storage.googleapis.com/workbox-cdn/releases/5.1.2/workbox-sw.js');

if (workbox) {
  console.log(`Yay! Workbox is loaded 🎉`);
} else {
  console.log(`Boo! Workbox didn't load 😬`);
}

//const registerRoute = workbox.routing.registerRoute;
//onst NetworkFirst = workbox.strategies.NetworkFirst;

workbox.routing.registerRoute(
  ({request}) => request.destination === 'text/html',
  new NetworkFirst()
);
new workbox.strategies.NetworkFirst()
