// public/serviceWorker.js

// Nama cache yang akan digunakan
const CACHE_NAME = "studyprojectbot-v1";

// Daftar aset yang akan di-cache untuk penggunaan offline
const urlsToCache = [
  "/",
  "/index.html",
  "/static/js/main.chunk.js",
  "/static/js/bundle.js",
  "/static/js/vendors~main.chunk.js",
  "/manifest.json",
  "/logo192.png",
  "/logo512.png",
  "/static/css/main.chunk.css",
  "/offline.html",
];

// Install service worker
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Cache opened");
      return cache.addAll(urlsToCache);
    })
  );
  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
});

// Activate service worker and clean up old caches
self.addEventListener("activate", (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
          return null;
        })
      );
    })
  );
  // Tells our new service worker to take over
  self.clients.claim();
});

// Fetch event: serve cached content when offline
self.addEventListener("fetch", (event) => {
  // Skip non-GET requests
  if (event.request.method !== "GET") return;

  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) return;

  // Handle API requests (network-first strategy)
  if (event.request.url.includes("/api/")) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Clone response and store in cache
          if (response.ok) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return response;
        })
        .catch(() => {
          // If network fails, try to serve from cache
          return caches.match(event.request);
        })
    );
    return;
  }

  // For regular assets, use cache-first strategy
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Cache hit - return response
      if (response) {
        return response;
      }

      return fetch(event.request)
        .then((response) => {
          // Check if we received a valid response
          if (
            !response ||
            response.status !== 200 ||
            response.type !== "basic"
          ) {
            return response;
          }

          // Clone the response for caching
          const responseToCache = response.clone();

          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });

          return response;
        })
        .catch(() => {
          // If both network and cache fail, show offline page
          if (event.request.destination === "document") {
            return caches.match("/offline.html");
          }
          return null;
        });
    })
  );
});

// Handle push notifications
self.addEventListener("push", (event) => {
  let data;
  try {
    data = event.data.json();
  } catch (e) {
    data = {
      title: "Notifikasi Baru",
      body: event.data ? event.data.text() : "Tidak ada detail tersedia",
      url: "/",
    };
  }

  const options = {
    body: data.body,
    icon: "/logo192.png",
    badge: "/logo192.png",
    vibrate: [100, 50, 100],
    data: {
      url: data.url || "/",
    },
    actions: [
      {
        action: "open",
        title: "Buka",
      },
      {
        action: "close",
        title: "Tutup",
      },
    ],
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

// Handle notification click
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "close") {
    return;
  }

  event.waitUntil(
    clients.matchAll({ type: "window" }).then((clientList) => {
      // If application is open, focus it
      for (const client of clientList) {
        if (client.url === event.notification.data.url && "focus" in client) {
          return client.focus();
        }
      }
      // Otherwise, open a new window
      if (clients.openWindow) {
        return clients.openWindow(event.notification.data.url);
      }
    })
  );
});

// Handle messages from the main thread
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "CHECK_SCHEDULED_NOTIFICATIONS") {
    checkScheduledNotifications();
  }
});

// Function to check scheduled notifications
async function checkScheduledNotifications() {
  try {
    // Open a cache to use for persistent storage
    const cache = await caches.open("notifications-store");
    const response = await cache.match("scheduled-notifications");

    if (!response) return;

    const { notifications } = await response.json();
    const now = Date.now();
    const notificationsToShow = [];
    const remainingNotifications = [];

    // Check which notifications should be shown
    notifications.forEach((notification) => {
      if (notification.scheduledTime <= now) {
        notificationsToShow.push(notification);
      } else {
        remainingNotifications.push(notification);
      }
    });

    // Save remaining notifications
    await cache.put(
      "scheduled-notifications",
      new Response(JSON.stringify({ notifications: remainingNotifications }))
    );

    // Show notifications
    notificationsToShow.forEach((notification) => {
      self.registration.showNotification(notification.title, {
        body: notification.body,
        icon: "/logo192.png",
        badge: "/logo192.png",
        data: { url: notification.url },
      });
    });
  } catch (error) {
    console.error("Error checking scheduled notifications:", error);
  }
}

// Set up a periodic check for scheduled notifications
setInterval(checkScheduledNotifications, 60000); // Check every minute
