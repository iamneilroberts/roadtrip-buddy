// Service Worker for Roadtrip Buddy PWA

// Increment cache version to force refresh
const CACHE_NAME = 'roadtrip-buddy-v2';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/assets/index.js',
  '/assets/index.css',
  '/vite.svg',
];

// Install event - cache assets
self.addEventListener('install', (event) => {
  // Force activation without waiting
  self.skipWaiting();
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        // Delete all caches to ensure fresh content
        cacheNames.map((cacheName) => {
          console.log('Deleting cache:', cacheName);
          return caches.delete(cacheName);
        })
      );
    }).then(() => {
      return caches.open(CACHE_NAME)
        .then((cache) => {
          console.log('Cache opened');
          return cache.addAll(ASSETS_TO_CACHE);
        });
    })
  );
});

// Activate event - clean up old caches and take control immediately
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  
  // Take control of all clients immediately
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker activated');
      return self.clients.claim();
    })
  );
});

// Fetch event - network first strategy for HTML requests
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }
  
  // Skip API requests
  if (event.request.url.includes('/api/')) {
    return;
  }

  // For HTML requests, use network-first strategy
  if (event.request.headers.get('accept').includes('text/html')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Cache the latest version
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
          return response;
        })
        .catch(() => {
          // Fall back to cache if network fails
          return caches.match(event.request);
        })
    );
    return;
  }

  // For other requests, try cache first, then network
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached response if found
        if (response) {
          return response;
        }
        
        // Clone the request
        const fetchRequest = event.request.clone();
        
        // Make network request
        return fetch(fetchRequest).then((response) => {
          // Check if valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          
          // Clone the response
          const responseToCache = response.clone();
          
          // Cache the response
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });
            
          return response;
        });
      })
      .catch(() => {
        // Fallback for offline
        if (event.request.headers.get('accept').includes('text/html')) {
          return caches.match('/');
        }
      })
  );
});
