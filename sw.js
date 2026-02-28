const CACHE='tutor-v4';
const ASSETS=['./','./index.html'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{e.respondWith(caches.match(e.request).then(c=>{const f=fetch(e.request).then(r=>{if(r&&r.status===200){const cl=r.clone();caches.open(CACHE).then(ca=>ca.put(e.request,cl))}return r}).catch(()=>c);return c||f}))});
self.addEventListener('message',e=>{if(e.data?.type==='NOTIFY'){self.registration.showNotification(e.data.title,{body:e.data.body,tag:e.data.tag||'tutor',vibrate:[200,100,200],renotify:true})}});
self.addEventListener('notificationclick',e=>{e.notification.close();e.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(l=>{if(l.length)l[0].focus();else clients.openWindow('./')}))});
