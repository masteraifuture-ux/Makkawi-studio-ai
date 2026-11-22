/* Service worker: يخزّن ملفات التطبيق للفتح السريع، وكل طلبات الذكاء الاصطناعي والشبكة تمرّ مباشرة بلا تخزين */
const V = 'mx-v3-2';
const SHELL = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png'];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(V).then((c) => Promise.all(SHELL.map((u) => c.add(u).catch(() => {})))).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== V).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', (e) => {
  const r = e.request; if (r.method !== 'GET') return;
  const u = new URL(r.url); if (u.origin !== location.origin) return; // لا نتدخل في الطلبات الخارجية (Gemini, HF, CDN)
  // الشبكة أولاً (لتصلك التحديثات)، ثم النسخة المخزنة عند انقطاع الإنترنت
  e.respondWith(fetch(r).then((res) => { if (res.ok) { const cp = res.clone(); caches.open(V).then((c) => c.put(r, cp)); } return res; }).catch(() => caches.match(r).then((m) => m || caches.match('./index.html'))));
});
