const CACHE_NAME = 'moniteo-cache-v1';
const ASSETS_TO_CACHE = [
    'index.html',
    'dashboard.html',
    'sales.html',
    'inventory.html',
    'expenses.html',
    'staff.html',
    'reporting.html',
    'history.html',
    'setting.html',
    'UI/style.css
    'js/common.js',
    'js/auth-check',
    'js/offline-manager',
    'js/offline',
    'js/stats-manager',
    'js/supabase-config',
    'js/settings-manager',
    'js/exportPDF',
    'js/copilot-manager',
    'assets/icon-192.png',
    'assets/icon-512.png' 
];

// Installation du Service Worker et mise en cache des fichiers
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
});

// Stratégie : Network First (Priorité au réseau, sinon cache)
// Idéal pour une app de gestion qui synchronise des données (Supabase)
self.addEventListener('fetch', (event) => {
    event.respondWith(
        fetch(event.request).catch(() => {
            return caches.match(event.request);
        })
    );
});