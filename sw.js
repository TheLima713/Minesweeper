const statCacheName = 'site-static'
const assets = [
    '/',
    '/index.html',
    '/js/script.js',
    '/css/styles.css',
    '/img/notedx48.png',
    '/img/notedx72.png',
    '/img/notedx96.png',
    '/img/notedx128.png',
    '/img/notedx192.png',
    '/img/notedx384.png',
    '/img/notedx512.png',
    'https://fonts.googleapis.com/css2?family=Poppins:wght@100;400;700&display=swap'
]

self.addEventListener('install',e=>{
    e.waitUntil(
        caches.open(statCacheName)
        .then(cache =>{
            console.log('caching shell assets...')
            cache.addAll(assets)
        })
    )
})

self.addEventListener('fetch',e=>{
    e.respondWith(
        caches.match(e.request).then(cacheRes=>{
            return cacheRes || fetch(e.request)
        })
    )
})