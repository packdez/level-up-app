const CACHE = 'levelup-v6';
const ASSETS = [
  './', './index.html', './index.html?v=2', './styles.css',
  './schedule-data.js', './state.js', './actions.js', './render.js', './render-finance.js', './render-modals.js', './app.js',
  './manifest.json', './icons/icon-192.png', './icons/icon-512.png', './icons/icon-192-maskable.png', './icons/icon-512-maskable.png'
];

self.addEventListener('install', e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e=>{
  e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener('fetch', e=>{
  e.respondWith(caches.match(e.request).then(cached=>cached || fetch(e.request).catch(()=>cached)));
});

self.addEventListener('notificationclick', (event)=>{
  const data = event.notification.data || {};
  event.notification.close();

  if(event.action === 'dismiss'){
    event.waitUntil(
      self.clients.matchAll({type:'window', includeUncontrolled:true}).then(list=>{
        list.forEach(c=>c.postMessage({type:'ALARM_DISMISS', id:data.id}));
      })
    );
    return;
  }

  event.waitUntil(
    self.clients.matchAll({type:'window', includeUncontrolled:true}).then(list=>{
      for(const client of list){
        if('focus' in client){
          client.postMessage({type:'ALARM_SHOW', block:data.block, id:data.id});
          return client.focus();
        }
      }
      if(self.clients.openWindow) return self.clients.openWindow('./index.html');
    })
  );
});
