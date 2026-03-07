const CACHE_NAME = 'moniteo-cache-v2'; // On change le nom pour forcer la mise à jour
const ASSETS_TO_CACHE = [
    './', // Cache la racine (index.html par défaut)
    'index.html',
    'dashboard.html',
    'sales.html',
    'inventory.html',
    'expenses.html',
    'staff.html',
    'reporting.html',
    'history.html',
    'setting.html',
    'UI/style.css', // Vérifie bien que le dossier est 'UI' (majuscules incluses)
    'js/common.js',
    'js/auth-check.js',
    'js/offline-manager.js',
    'js/offline.js',
    'js/stats-manager.js',
    'js/supabase-config.js',
    'js/settings-manager.js',
    'js/exportPDF.js',
    'js/copilot-manager.js',
    'assets/icon-192.png',
    'assets/icon-512.png' 
];

// Installation
self.addEventListener('install', (event) => {
    // skipWaiting permet au SW de s'activer immédiatement sans attendre la fermeture des onglets
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('📦 Mise en cache des ressources...');
            // On utilise une boucle pour voir quel fichier bloque si ça échoue encore
            return Promise.all(
                ASSETS_TO_CACHE.map(url => {
                    return cache.add(url).catch(err => console.error(`❌ Erreur sur le fichier: ${url}`, err));
                })
            );
        })
    );
});

// Activation : Nettoyage des anciens caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
});

// Stratégie : Network First
self.addEventListener('fetch', (event) => {
    event.respondWith(
        fetch(event.request).catch(() => {
            return caches.match(event.request);
        })
    );
});
