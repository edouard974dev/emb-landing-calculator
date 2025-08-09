// EMB-135/145 Landing Distance Calculator Service Worker
// Version 1.0.0

const CACHE_NAME = 'emb-landing-calc-v1.0.0';
const STATIC_CACHE_NAME = 'emb-static-v1.0.0';
const DYNAMIC_CACHE_NAME = 'emb-dynamic-v1.0.0';

// Fichiers à mettre en cache lors de l'installation
const STATIC_FILES = [
    '/',
    '/index.html',
    '/style.css',
    '/app.js',
    '/data.json',
    '/manifest.json',
    '/icon.png'
];

// Installation du Service Worker
self.addEventListener('install', event => {
    console.log('Service Worker: Installation en cours...');
    event.waitUntil(
        caches.open(STATIC_CACHE_NAME)
            .then(cache => {
                console.log('Service Worker: Mise en cache des fichiers statiques');
                return cache.addAll(STATIC_FILES);
            })
            .then(() => {
                console.log('Service Worker: Installation terminée');
                return self.skipWaiting();
            })
            .catch(error => {
                console.error('Service Worker: Erreur lors de l\'installation', error);
            })
    );
});

// Activation du Service Worker
self.addEventListener('activate', event => {
    console.log('Service Worker: Activation en cours...');
    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        if (cacheName !== STATIC_CACHE_NAME && cacheName !== DYNAMIC_CACHE_NAME) {
                            console.log('Service Worker: Suppression du cache obsolète:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('Service Worker: Activation terminée');
                return self.clients.claim();
            })
    );
});

// Interception des requêtes
self.addEventListener('fetch', event => {
    // Stratégie Cache First pour les fichiers statiques
    if (STATIC_FILES.some(file => event.request.url.includes(file))) {
        event.respondWith(
            caches.match(event.request)
                .then(response => {
                    if (response) {
                        return response;
                    }
                    return fetch(event.request)
                        .then(fetchResponse => {
                            return caches.open(STATIC_CACHE_NAME)
                                .then(cache => {
                                    cache.put(event.request, fetchResponse.clone());
                                    return fetchResponse;
                                });
                        });
                })
                .catch(() => {
                    // Retourner une page offline si disponible
                    if (event.request.destination === 'document') {
                        return caches.match('/index.html');
                    }
                })
        );
    }
    // Stratégie Network First pour les autres requêtes
    else {
        event.respondWith(
            fetch(event.request)
                .then(response => {
                    // Si la requête réussit, mettre en cache dynamique
                    if (response.status === 200) {
                        const responseClone = response.clone();
                        caches.open(DYNAMIC_CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseClone);
                            });
                    }
                    return response;
                })
                .catch(() => {
                    // Si le réseau échoue, essayer de servir depuis le cache
                    return caches.match(event.request);
                })
        );
    }
});

// Gestion des messages depuis l'application principale
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'GET_VERSION') {
        event.ports[0].postMessage({
            version: CACHE_NAME
        });
    }
});

// Synchronisation en arrière-plan (si supportée)
self.addEventListener('sync', event => {
    console.log('Service Worker: Synchronisation en arrière-plan', event.tag);
    // Ici on pourrait synchroniser des données sauvegardées hors ligne
});

// Notification push (si supportée dans le futur)
self.addEventListener('push', event => {
    console.log('Service Worker: Notification push reçue', event);
    
    const options = {
        body: event.data ? event.data.text() : 'Nouvelle notification',
        icon: '/icon.png',
        badge: '/icon.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'explore',
                title: 'Ouvrir l\'application',
                icon: '/icon.png'
            },
            {
                action: 'close',
                title: 'Fermer',
                icon: '/icon.png'
            }
        ]
    };
    
    event.waitUntil(
        self.registration.showNotification('EMB Landing Calculator', options)
    );
});

// Gestion des clics sur les notifications
self.addEventListener('notificationclick', event => {
    console.log('Service Worker: Clic sur notification', event);
    
    event.notification.close();
    
    if (event.action === 'explore') {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

// Gestion des erreurs
self.addEventListener('error', event => {
    console.error('Service Worker: Erreur', event.error);
});

self.addEventListener('unhandledrejection', event => {
    console.error('Service Worker: Promise rejetée', event.reason);
});

// Utilitaires pour le cache
const cleanupCaches = async () => {
    const cacheNames = await caches.keys();
    const oldCaches = cacheNames.filter(name => 
        !name.includes(STATIC_CACHE_NAME) && !name.includes(DYNAMIC_CACHE_NAME)
    );
    
    return Promise.all(
        oldCaches.map(cacheName => caches.delete(cacheName))
    );
};

// Nettoyage périodique du cache dynamique (garder seulement les 50 derniers)
const limitCacheSize = async (cacheName, size) => {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    
    if (keys.length > size) {
        const keysToDelete = keys.slice(0, keys.length - size);
        return Promise.all(
            keysToDelete.map(key => cache.delete(key))
        );
    }
};

// Exécuter le nettoyage du cache toutes les heures
setInterval(() => {
    limitCacheSize(DYNAMIC_CACHE_NAME, 50);
}, 60 * 60 * 1000);
