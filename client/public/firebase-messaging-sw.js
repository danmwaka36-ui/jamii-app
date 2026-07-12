/* Firebase Messaging Service Worker */

importScripts(
  "https://www.gstatic.com/firebasejs/12.16.0/firebase-app-compat.js"
);

importScripts(
  "https://www.gstatic.com/firebasejs/12.16.0/firebase-messaging-compat.js"
);

firebase.initializeApp({
  apiKey: "AIzaSyAN9a5q4VjR2DESIwaZwFJMHoq7cFo9O10",
  authDomain: "jamii-app-57160.firebaseapp.com",
  projectId: "jamii-app-57160",
  storageBucket: "jamii-app-57160.firebasestorage.app",
  messagingSenderId: "52121701205",
  appId: "1:52121701205:web:26268bec5786f46adafddc",
});

const messaging = firebase.messaging();

/*
|--------------------------------------------------------------------------
| Background Notifications
|--------------------------------------------------------------------------
*/

messaging.onBackgroundMessage((payload) => {
  console.log(
    "[Jamii] Background notification:",
    payload
  );

  const title =
    payload.notification?.title ||
    "🚨 New Emergency";

  const options = {
    body:
      payload.notification?.body ||
      "A new emergency requires your attention.",

    icon: "/icons/icon-192.png",

    badge: "/icons/icon-192.png",

    image: payload.data?.image || undefined,

    requireInteraction: true,

    vibrate: [300, 150, 300, 150, 600],

    tag:
      payload.data?.reportId ||
      "jamii-emergency",

    data: payload.data,

    actions: [
      {
        action: "open",
        title: "Open Incident",
      },
      {
        action: "dismiss",
        title: "Dismiss",
      },
    ],
  };

  self.registration.showNotification(
    title,
    options
  );
});

/*
|--------------------------------------------------------------------------
| Notification Click
|--------------------------------------------------------------------------
*/

self.addEventListener(
  "notificationclick",
  (event) => {
    event.notification.close();

    if (event.action === "dismiss") {
      return;
    }

    const reportId =
      event.notification.data?.reportId;

    let url = "/";

    if (reportId) {
      url = `/admin/emergencies?id=${reportId}`;
    }

    event.waitUntil(
      clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      })
      .then((clientList) => {
        for (const client of clientList) {
          if ("focus" in client) {
            client.navigate(url);
            return client.focus();
          }
        }

        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
    );
  }
);