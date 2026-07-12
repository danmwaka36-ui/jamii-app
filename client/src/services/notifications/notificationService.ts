import { getToken, onMessage, type MessagePayload } from "firebase/messaging";
import {
  doc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

import {
  auth,
  db,
  messagingPromise,
} from "../../firebase/firebase";

export type DeviceRegistrationContext = {
  role: string;
  agencyId?: string;
  agencyName?: string;
  countyCode?: string;
  countyName?: string;
  wardCode?: string;
  wardName?: string;
};

export type NotificationRegistrationResult = {
  success: boolean;
  token?: string;
  message: string;
};

const SOUND_STORAGE_KEY = "jamii-emergency-sound-enabled";
const TOKEN_STORAGE_KEY = "jamii-fcm-token";

function notificationsSupported() {
  return (
    typeof window !== "undefined" &&
    "Notification" in window &&
    "serviceWorker" in navigator
  );
}

function detectPlatform() {
  const userAgent = navigator.userAgent.toLowerCase();

  if (userAgent.includes("android")) return "Android";
  if (
    userAgent.includes("iphone") ||
    userAgent.includes("ipad") ||
    userAgent.includes("ipod")
  ) {
    return "iOS";
  }

  if (userAgent.includes("windows")) return "Windows";
  if (userAgent.includes("mac")) return "macOS";
  if (userAgent.includes("linux")) return "Linux";

  return "Unknown";
}

function detectDeviceType() {
  const userAgent = navigator.userAgent.toLowerCase();

  if (
    userAgent.includes("ipad") ||
    userAgent.includes("tablet")
  ) {
    return "tablet";
  }

  if (
    userAgent.includes("android") ||
    userAgent.includes("iphone") ||
    userAgent.includes("mobile")
  ) {
    return "phone";
  }

  return "desktop";
}

async function createTokenDocumentId(token: string) {
  const encodedToken = new TextEncoder().encode(token);

  if (crypto?.subtle) {
    const digest = await crypto.subtle.digest("SHA-256", encodedToken);

    return Array.from(new Uint8Array(digest))
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");
  }

  return token
    .replace(/[^a-zA-Z0-9_-]/g, "_")
    .slice(0, 1400);
}

export function getNotificationPermission(): NotificationPermission | "unsupported" {
  if (!notificationsSupported()) {
    return "unsupported";
  }

  return Notification.permission;
}

export function isEmergencySoundEnabled() {
  return localStorage.getItem(SOUND_STORAGE_KEY) === "true";
}

export function setEmergencySoundEnabled(enabled: boolean) {
  localStorage.setItem(SOUND_STORAGE_KEY, String(enabled));
}

export async function registerMessagingServiceWorker() {
  if (!notificationsSupported()) {
    throw new Error(
      "This browser does not support notifications or service workers."
    );
  }

  return navigator.serviceWorker.register(
    "/firebase-messaging-sw.js",
    {
      scope: "/",
    }
  );
}

export async function saveDeviceToken(
  token: string,
  context: DeviceRegistrationContext
) {
  const user = auth.currentUser;

  if (!user) {
    throw new Error(
      "You must be logged in before enabling emergency notifications."
    );
  }

  const tokenDocumentId = await createTokenDocumentId(token);

  await setDoc(
    doc(db, "deviceTokens", tokenDocumentId),
    {
      token,
      userId: user.uid,
      userEmail: user.email || "",
      role: context.role.toLowerCase(),

      agencyId: context.agencyId || null,
      agencyName: context.agencyName || null,

      countyCode: context.countyCode || null,
      countyName: context.countyName || null,

      wardCode: context.wardCode || null,
      wardName: context.wardName || null,

      platform: detectPlatform(),
      deviceType: detectDeviceType(),
      browserUserAgent: navigator.userAgent,

      notificationsEnabled: true,
      soundEnabled: isEmergencySoundEnabled(),
      active: true,

      lastSeenAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
    },
    {
      merge: true,
    }
  );

  localStorage.setItem(TOKEN_STORAGE_KEY, token);
}

export async function enableEmergencyNotifications(
  context: DeviceRegistrationContext
): Promise<NotificationRegistrationResult> {
  try {
    if (!notificationsSupported()) {
      return {
        success: false,
        message:
          "Emergency notifications are not supported in this browser.",
      };
    }

    const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;

    if (
      !vapidKey ||
      vapidKey === "PASTE_YOUR_PUBLIC_VAPID_KEY_HERE"
    ) {
      return {
        success: false,
        message:
          "The Firebase VAPID key has not been configured.",
      };
    }

    const permission =
      Notification.permission === "granted"
        ? "granted"
        : await Notification.requestPermission();

    if (permission !== "granted") {
      return {
        success: false,
        message:
          "Notification permission was not granted. Enable notifications in your browser settings.",
      };
    }

    const messaging = await messagingPromise;

    if (!messaging) {
      return {
        success: false,
        message:
          "Firebase Messaging is unavailable in this browser.",
      };
    }

    const serviceWorkerRegistration =
      await registerMessagingServiceWorker();

    const token = await getToken(messaging, {
      vapidKey,
      serviceWorkerRegistration,
    });

    if (!token) {
      return {
        success: false,
        message:
          "Firebase did not return a device notification token.",
      };
    }

    await saveDeviceToken(token, context);

    return {
      success: true,
      token,
      message:
        "Emergency notifications are now enabled on this device.",
    };
  } catch (error) {
    console.error("Notification registration failed:", error);

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to enable emergency notifications.",
    };
  }
}

export async function refreshDeviceRegistration(
  context: DeviceRegistrationContext
) {
  if (
    !notificationsSupported() ||
    Notification.permission !== "granted"
  ) {
    return null;
  }

  const messaging = await messagingPromise;

  if (!messaging) return null;

  const registration =
    await registerMessagingServiceWorker();

  const token = await getToken(messaging, {
    vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
    serviceWorkerRegistration: registration,
  });

  if (!token) return null;

  await saveDeviceToken(token, context);

  return token;
}

export async function showLocalNotification(
  title: string,
  options?: NotificationOptions
) {
  if (
    !notificationsSupported() ||
    Notification.permission !== "granted"
  ) {
    return;
  }

  const registration = await navigator.serviceWorker.ready;

  await registration.showNotification(title, {
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
    requireInteraction: true,
    ...options,
  });
}

export async function playEmergencySound() {
  if (!isEmergencySoundEnabled()) return false;

  try {
    const audio = new Audio("/sounds/emergency-alert.mp3");

    audio.volume = 1;
    audio.loop = false;

    await audio.play();

    return true;
  } catch (error) {
    console.warn(
      "Emergency sound could not be played. The user may need to interact with the page first.",
      error
    );

    return false;
  }
}

export async function subscribeToForegroundMessages(
  callback?: (payload: MessagePayload) => void
) {
  const messaging = await messagingPromise;

  if (!messaging) {
    return () => undefined;
  }

  return onMessage(messaging, async (payload) => {
    console.log("Foreground emergency notification:", payload);

    await playEmergencySound();

    const title =
      payload.notification?.title ||
      payload.data?.title ||
      "New Jamii Emergency";

    const body =
      payload.notification?.body ||
      payload.data?.body ||
      "A new emergency report requires attention.";

    await showLocalNotification(title, {
      body,
      data: payload.data,
      tag:
        payload.data?.reportId ||
        payload.messageId ||
        "jamii-emergency",
    });

    callback?.(payload);
  });
}

export function getStoredMessagingToken() {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}