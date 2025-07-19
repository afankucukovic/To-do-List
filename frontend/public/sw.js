// Service Worker za Lakši Rad PWA
const CACHE_NAME = 'laksi-rad-v1.0.0';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json'
];

// Cache strategija - Cache First za statični sadržaj
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Lakši Rad: Cache otvoren');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch strategija - Network First za API pozive, Cache First za ostalo
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/api/')) {
    // Network First strategija za API pozive
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Kloniraj odgovor jer se može koristiti samo jednom
          const responseToCache = response.clone();
          
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });
          
          return response;
        })
        .catch(() => {
          // Ako nema internet konekcije, pokušaj dohvatiti iz cache-a
          return caches.match(event.request);
        })
    );
  } else {
    // Cache First strategija za statični sadržaj
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          // Vrati iz cache-a ako postoji, inače dohvati s mreže
          return response || fetch(event.request);
        })
        .catch(() => {
          // Offline fallback stranica
          if (event.request.destination === 'document') {
            return caches.match('/');
          }
        })
    );
  }
});

// Čišćenje starih cache-ova
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Lakši Rad: Brišem stari cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Push notifikacije (za buduće funkcionalnosti)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    
    const options = {
      body: data.body,
      icon: '/icon-192x192.png',
      badge: '/icon-192x192.png',
      vibrate: [100, 50, 100],
      data: data.data || {},
      actions: [
        {
          action: 'view',
          title: 'Otvori aplikaciju'
        },
        {
          action: 'close',
          title: 'Zatvori'
        }
      ]
    };

    event.waitUntil(
      self.registration.showNotification(data.title || 'Lakši Rad', options)
    );
  }
});

// Rukovanje klikom na notifikaciju
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Background sync (za offline funkcionalnosti)
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync-tasks') {
    console.log('Lakši Rad: Sync zadataka u pozadini');
    event.waitUntil(syncTasks());
  }
});

// Funkcija za sinhronizaciju zadataka kada se konekcija vrati
async function syncTasks() {
  try {
    // Ovdje bi se implementirala logika za sinhronizaciju
    // zadataka koji su kreirani offline
    console.log('Sinhronizacija zadataka završena');
  } catch (error) {
    console.error('Greška prilikom sinhronizacije:', error);
  }
}