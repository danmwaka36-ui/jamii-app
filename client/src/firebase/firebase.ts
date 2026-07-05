import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

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

// Firebase Services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Analytics (only works in supported browser environments)
isSupported().then((supported) => {
  if (supported) {
    getAnalytics(app);
  }
});

export default app;