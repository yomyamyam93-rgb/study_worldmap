/* 한 번 받은 파일은 저장해 두고 다음부터 바로 씁니다 (인터넷 없이도 실행).
   새 버전이 올라오면 index.html 이 'clear' 신호를 보내 저장분을 비웁니다. */
const CACHE = 'worldmap-v1';

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));

self.addEventListener('fetch', e => {
  const req = e.request;
  if(req.method !== 'GET') return;
  if(new URL(req.url).origin !== location.origin) return;
  if(req.url.indexOf('version.json') >= 0) return;      // 버전 확인은 항상 새로

  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const hit = await cache.match(req);
    if(hit) return hit;
    try{
      const res = await fetch(req);
      if(res && res.ok) cache.put(req, res.clone());
      return res;
    }catch(err){
      return hit || Response.error();                   // 인터넷이 끊겨도 저장분으로
    }
  })());
});

self.addEventListener('message', async e => {
  if(e.data === 'clear'){
    await caches.delete(CACHE);
    if(e.source) e.source.postMessage('cleared');
  }
});
