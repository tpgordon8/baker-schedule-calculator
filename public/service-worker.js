// Service Worker for background notifications and PWA support

self.addEventListener('install', () => {
  console.log('Service Worker installing...')
  self.skipWaiting()
})

self.addEventListener('activate', event => {
  console.log('Service Worker activating...')
  event.waitUntil(self.clients.claim())
})

// Handle push notifications from the server
self.addEventListener('push', event => {
  if (!event.data) {
    console.log('Push notification received but no data')
    return
  }

  const data = event.data.json()
  const options = {
    body: data.body || 'Baker Schedule Calendar notification',
    icon: '/favicon.svg',
    badge: '/favicon.svg',
    tag: data.tag || 'baker-notification',
    requireInteraction: data.requireInteraction || false,
    vibrate: data.vibrate || [100],
    sound: data.sound || undefined
  }

  event.waitUntil(
    self.registration.showNotification(data.title || 'Baker Schedule', options)
  )
})

// Handle notification clicks
self.addEventListener('notificationclick', event => {
  console.log('Notification clicked:', event.notification.tag)
  event.notification.close()

  // Focus the app window
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then(clientList => {
      // Check if app is already open
      for (const client of clientList) {
        if (client.url === '/' && 'focus' in client) {
          return client.focus()
        }
      }
      // If not open, open it
      if (self.clients.openWindow) {
        return self.clients.openWindow('/')
      }
    })
  )
})

// Handle notification close
self.addEventListener('notificationclose', event => {
  console.log('Notification closed:', event.notification.tag)
})

// Handle messages from app (for pause/resume)
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})

// Cache app shell for offline support
const CACHE_NAME = 'baker-scheduler-v1'
const urlsToCache = [
  '/',
  '/index.html',
  '/favicon.ico',
  '/manifest.json'
]

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache).catch(error => {
        console.log('Cache addAll error:', error)
      })
    })
  )
})

self.addEventListener('fetch', event => {
  // Only cache GET requests
  if (event.request.method !== 'GET') {
    return
  }

  event.respondWith(
    caches.match(event.request).then(response => {
      if (response) {
        return response
      }
      return fetch(event.request).catch(() => {
        // Network request failed, return offline page if needed
        return caches.match('/')
      })
    })
  )
})
