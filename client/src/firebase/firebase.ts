import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import {
  getMessaging,
  isSupported,
  type Messaging,
} from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyAN9a5q4VjR2DESIwaZwFJMHoq7cFo9O10",
  authDomain: "jamii-app-57160.firebaseapp.com",
  projectId: "jamii-app-57160",
  storageBucket: "jamii-app-57160.firebasestorage.app",
  messagingSenderId: "52121701205",
  appId: "1:52121701205:web:26268bec5786f46adafddc",
  measurementId: "G-ECJVT0KKGX",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

/**
 * Firebase Cloud Messaging is only initialized in supported browsers.
 *
 * This avoids errors during builds, unsupported browsers and environments
 * where service workers or notification APIs are unavailable.
 */
export const messagingPromise: Promise<Messaging | null> = isSupported()
  .then((supported) => {
    if (!supported) {
      console.warn(
        "Firebase Cloud Messaging is not supported in this browser."
      );

      return null;
    }

    return getMessaging(app);
  })
  .catch((error) => {
    console.error("Failed to initialize Firebase Messaging:", error);

    return null;
  });

export default app;