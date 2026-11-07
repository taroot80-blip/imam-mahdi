const V='mastoor-5';
self.addEventListener('install',e=>{self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
// الشبكة أولًا ليصل التحديث، والمخزون عند انقطاع الإنترنت
self.addEventListener('fetch',e=>{if(e.request.method!=='GET'||!e.request.url.startsWith(self.location.origin)||e.request.url.includes('/corpus/'))return;
 e.respondWith(fetch(e.request).then(r=>{if(r.ok&&r.status===200){const c=r.clone();caches.open(V).then(x=>x.put(e.request,c))}return r}).catch(()=>caches.match(e.request).then(r=>r||caches.match('index.html'))))});
