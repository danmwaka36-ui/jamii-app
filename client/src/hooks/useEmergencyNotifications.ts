import { useEffect, useRef, useState } from "react";
import type { MessagePayload } from "firebase/messaging";

import {
  getNotificationPermission,
  subscribeToForegroundMessages,
} from "../services/notifications/notificationService";

export type EmergencyNotification = {
  id: string;
  title: string;
  body: string;
  reportId?: string;
  emergencyType?: string;
  severity?: string;
  location?: string;
  assignedRole?: string;
  receivedAt: Date;
  payload: MessagePayload;
};

type UseEmergencyNotificationsOptions = {
  enabled?: boolean;
  onNotification?: (notification: EmergencyNotification) => void;
};

function createNotification(payload: MessagePayload): EmergencyNotification {
  const data = payload.data || {};

  return {
    id:
      payload.messageId ||
      data.reportId ||
      `notification-${Date.now()}`,

    title:
      payload.notification?.title ||
      data.title ||
      "New Jamii Emergency",

    body:
      payload.notification?.body ||
      data.body ||
      "A new emergency report requires attention.",

    reportId: data.reportId,
    emergencyType: data.emergencyType || data.type,
    severity: data.severity,
    location: data.location,
    assignedRole: data.assignedRole,
    receivedAt: new Date(),
    payload,
  };
}

export default function useEmergencyNotifications(
  options: UseEmergencyNotificationsOptions = {}
) {
  const { enabled = true, onNotification } = options;

  const [notifications, setNotifications] = useState<
    EmergencyNotification[]
  >([]);

  const [latestNotification, setLatestNotification] =
    useState<EmergencyNotification | null>(null);

  const [permission, setPermission] = useState(
    getNotificationPermission()
  );

  const [listening, setListening] = useState(false);
  const [error, setError] = useState("");

  const callbackRef = useRef(onNotification);

  useEffect(() => {
    callbackRef.current = onNotification;
  }, [onNotification]);

  useEffect(() => {
    if (!enabled) {
      setListening(false);
      return;
    }

    let mounted = true;
    let unsubscribe: (() => void) | undefined;

    async function startListening() {
      try {
        setError("");

        const currentPermission = getNotificationPermission();

        if (!mounted) return;

        setPermission(currentPermission);

        if (
          currentPermission === "unsupported" ||
          currentPermission !== "granted"
        ) {
          setListening(false);
          return;
        }

        unsubscribe = await subscribeToForegroundMessages(
          (payload) => {
            if (!mounted) return;

            const notification = createNotification(payload);

            setLatestNotification(notification);

            setNotifications((current) => {
              const withoutDuplicate = current.filter(
                (item) => item.id !== notification.id
              );

              return [notification, ...withoutDuplicate].slice(0, 50);
            });

            callbackRef.current?.(notification);
          }
        );

        if (mounted) {
          setListening(true);
        }
      } catch (listenerError) {
        console.error(
          "Failed to start emergency notification listener:",
          listenerError
        );

        if (!mounted) return;

        setListening(false);

        setError(
          listenerError instanceof Error
            ? listenerError.message
            : "Failed to listen for emergency notifications."
        );
      }
    }

    void startListening();

    function refreshPermission() {
      if (!mounted) return;

      setPermission(getNotificationPermission());
    }

    window.addEventListener("focus", refreshPermission);

    return () => {
      mounted = false;
      setListening(false);
      window.removeEventListener("focus", refreshPermission);
      unsubscribe?.();
    };
  }, [enabled]);

  function markAsRead(notificationId: string) {
    setNotifications((current) =>
      current.filter((notification) => notification.id !== notificationId)
    );

    setLatestNotification((current) =>
      current?.id === notificationId ? null : current
    );
  }

  function clearNotifications() {
    setNotifications([]);
    setLatestNotification(null);
  }

  return {
    notifications,
    latestNotification,
    unreadCount: notifications.length,
    permission,
    listening,
    error,
    markAsRead,
    clearNotifications,
  };
}