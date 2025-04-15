// CryptoPulse Service Worker for Progressive Web App functionality

const CACHE_NAME = 'cryptopulse-cache-v1';
const OFFLINE_URL = '/offline.html';

// URLs to cache for offline functionality
const urlsToCache = [
  '/',
  '/index.html',
  '/offline.html',
  '/src/main.tsx',
  '/src/assets/crypto-bot-avatar.svg',
  '/src/assets/icons/icon-192x192.png',
  '/src/assets/icons/icon-512x512.png',
];

// Install event - cache key assets
self.addEventListener('install', (event: ExtendableEvent) => {
  // @ts-ignore
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache opened');
        return cache.addAll(urlsToCache);
      })
      .catch(error => {
        console.error('Service worker install error:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event: ExtendableEvent) => {
  const cacheWhitelist = [CACHE_NAME];
  
  // @ts-ignore
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            // Delete old caches
            return caches.delete(cacheName);
          }
          return null;
        })
      );
    })
  );
});

// Fetch event - serve from cache, then network
self.addEventListener('fetch', (event: FetchEvent) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // For API requests, use network-first strategy
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          return caches.match(event.request);
        })
    );
    return;
  }

  // For other requests, use cache-first strategy
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        
        return fetch(event.request)
          .then(response => {
            // Don't cache if not a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Clone the response to be used by browser and cache
            const responseToCache = response.clone();
            
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
            
            return response;
          })
          .catch(() => {
            // If both cache and network fail, show offline page
            if (event.request.mode === 'navigate') {
              return caches.match(OFFLINE_URL);
            }
            return null;
          });
      })
  );
});

// Simple interface for TypeScript types
interface ExtendableEvent extends Event {
  waitUntil(fn: Promise<any>): void;
}

interface FetchEvent extends Event {
  request: Request;
  respondWith(response: Promise<Response> | Response): void;
}

// Send message to clients when service worker is updated
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    // @ts-ignore
    self.skipWaiting();
  }
});