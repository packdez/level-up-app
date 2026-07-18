const CACHE = "levelup-v2";
const ASSETS = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./schedule-data.js",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-192-maskable.png",
  "./icons/icon-512-maskable.png"
];

self.addEventListener("install", e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", e=>{
  e.waitUntil(
    caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener("fetch", e=>{
  e.respondWith(
    caches.match(e.request).then(cached=>cached || fetch(e.request).catch(()=>cached))
  );
});

self.addEventListener("notificationclick", (event)=>{
  const data = event.notification.data || {};
  event.notification.close();

  if(event.action === "dismiss"){
    event.waitUntil(
      self.clients.matchAll({ type:"window", includeUncontrolled:true }).then(clientList=>{
        clientList.forEach(c=>c.postMessage({ type:"ALARM_DISMISS", id:data.id }));
      })
    );
    return;
  }

  event.waitUntil(
    self.clients.matchAll({ type:"window", includeUncontrolled:true }).then(clientList=>{
      for(const client of clientList){
        if("focus" in client){
          client.postMessage({ type:"ALARM_SHOW", block:data.blockName, id:data.id });
          return client.focus();
        }
      }
      if(self.clients.openWindow){
        return self.clients.openWindow("./index.html");
      }
    })
  );
});
