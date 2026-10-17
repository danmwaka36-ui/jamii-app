import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  collection,
  doc,
  limit,
  onSnapshot,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import type { MessagePayload } from "firebase/messaging";

import { db } from "../firebase/firebase";
import { useAuth } from "../auth/AuthContext";
import { subscribeToForegroundMessages } from "../services/notifications/notificationService";

export type JamiiNotification = {
  id: string;
  remoteId?: string;
  title: string;
  message: string;
  type: string;
  reportId?: string;
  location?: string;
  priority: string;
  read: boolean;
  createdAt: number;
};

type NotificationsContextValue = {
  notifications: JamiiNotification[];
  unreadCount: number;
  panelOpen: boolean;
  setPanelOpen: (open: boolean) => void;
  latestToast: JamiiNotification | null;
  dismissToast: () => void;
  markAsRead: (notification: JamiiNotification) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  clearToast: (id: string) => void;
};

const NotificationsContext =
  createContext<NotificationsContextValue | undefined>(undefined);

function timestampOf(value: unknown): number {
  if (
    value &&
    typeof value === "object" &&
    "toMillis" in value &&
    typeof value.toMillis === "function"
  ) {
    return value.toMillis();
  }

  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Date.parse(value);
    if (Number.isFinite(parsed)) return parsed;
  }

  return Date.now();
}

function recordFromData(
  id: string,
  data: Record<string, unknown>,
): JamiiNotification {
  return {
    id: `remote:${id}`,
    remoteId: id,
    title:
      typeof data.title === "string"
        ? data.title
        : "Jamii notification",
    message:
      typeof data.message === "string"
        ? data.message
        : typeof data.body === "string"
          ? data.body
          : "You have a new notification.",
    type: typeof data.type === "string" ? data.type : "general",
    reportId:
      typeof data.reportId === "string" ? data.reportId : undefined,
    location:
      typeof data.location === "string" ? data.location : undefined,
    priority:
      typeof data.priority === "string" ? data.priority : "normal",
    read: data.read === true || data.isRead === true,
    createdAt: timestampOf(data.createdAt),
  };
}

function recordFromMessage(payload: MessagePayload): JamiiNotification {
  const data = payload.data ?? {};
  const reportId = data.reportId;
  const id =
    reportId ||
    payload.messageId ||
    `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  return {
    id: `fcm:${id}`,
    title:
      payload.notification?.title ||
      data.title ||
      "New Jamii emergency",
    message:
      payload.notification?.body ||
      data.body ||
      "A new emergency report requires attention.",
    type: data.type || "emergency",
    reportId,
    location: data.location,
    priority: data.priority || "high",
    read: false,
    createdAt: Date.now(),
  };
}

export function NotificationsProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState<JamiiNotification[]>([]);
  const [panelOpen, setPanelOpen] = useState(false);
  const [latestToast, setLatestToast] =
    useState<JamiiNotification | null>(null);

  const seenRef = useRef(new Set<string>());
  const mountedRef = useRef(false);

  const upsertNotification = useCallback(
    (incoming: JamiiNotification, showToast = false) => {
      if (!mountedRef.current) return;

      setNotifications((previous) => {
        const existing = previous.find(
          (item) =>
            item.id === incoming.id ||
            (incoming.reportId &&
              item.reportId === incoming.reportId),
        );

        if (existing) {
          return previous.map((item) =>
            item.id === existing.id
              ? {
                  ...item,
                  ...incoming,
                  id: existing.id,
                  read: existing.read || incoming.read,
                  remoteId: incoming.remoteId || existing.remoteId,
                }
              : item,
          );
        }

        if (showToast) setLatestToast(incoming);

        return [incoming, ...previous]
          .sort((a, b) => b.createdAt - a.createdAt)
          .slice(0, 100);
      });
    },
    [],
  );

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    setNotifications([]);
    setLatestToast(null);
    seenRef.current.clear();

    if (!currentUser) return;

    let active = true;

    // Scope this query to the signed-in user. Broader role/agency
    // subscriptions require matching Firestore security rules.
    const userNotificationsQuery = query(
      collection(db, "notifications"),
      where("recipientUserId", "==", currentUser.uid),
      limit(100),
    );

    const unsubscribeFirestore = onSnapshot(
      userNotificationsQuery,
      (snapshot) => {
        if (!active) return;

        snapshot.docChanges().forEach((change) => {
          const record = recordFromData(
            change.doc.id,
            change.doc.data() as Record<string, unknown>,
          );

          if (change.type === "removed") {
            setNotifications((previous) =>
              previous.filter((item) => item.remoteId !== change.doc.id),
            );
            return;
          }

          upsertNotification(record, false);
        });
      },
      (error) => {
        console.error("Jamii notification listener failed:", error);
      },
    );

    let unsubscribeForeground: () => void = () => {};

    void subscribeToForegroundMessages((payload) => {
      if (!active) return;

      const record = recordFromMessage(payload);
      const dedupeKey = record.reportId || record.id;

      if (seenRef.current.has(dedupeKey)) return;
      seenRef.current.add(dedupeKey);

      // The existing service already manages the emergency sound
      // and browser notification. Do not play them a second time here.
      upsertNotification(record, true);
    })
      .then((unsubscribe) => {
        if (active) {
          unsubscribeForeground = unsubscribe;
        } else {
          unsubscribe();
        }
      })
      .catch((error: unknown) => {
        console.error("Could not subscribe to foreground messages:", error);
      });

    return () => {
      active = false;
      unsubscribeFirestore();
      unsubscribeForeground();
    };
  }, [currentUser, upsertNotification]);

  const markAsRead = useCallback(
    async (notification: JamiiNotification) => {
      setNotifications((previous) =>
        previous.map((item) =>
          item.id === notification.id ? { ...item, read: true } : item,
        ),
      );

      if (!notification.remoteId) return;

      try {
        await updateDoc(
          doc(db, "notifications", notification.remoteId),
          { read: true },
        );
      } catch (error) {
        console.error("Could not save notification read status:", error);
      }
    },
    [],
  );

  const markAllAsRead = useCallback(async () => {
    const unread = notifications.filter((item) => !item.read);

    setNotifications((previous) =>
      previous.map((item) => ({ ...item, read: true })),
    );

    // Process independently so one permission/rules failure does not
    // prevent the other updates from being attempted.
    await Promise.all(
      unread
        .filter((item) => item.remoteId)
        .map(async (item) => {
          try {
            await updateDoc(doc(db, "notifications", item.remoteId!), {
              read: true,
            });
          } catch (error) {
            console.error(
              `Could not mark notification ${item.remoteId} as read:`,
              error,
            );
          }
        }),
    );
  }, [notifications]);

  const clearToast = useCallback((id: string) => {
    setLatestToast((current) => (current?.id === id ? null : current));
  }, []);

  const value = useMemo<NotificationsContextValue>(
    () => ({
      notifications,
      unreadCount: notifications.filter((item) => !item.read).length,
      panelOpen,
      setPanelOpen,
      latestToast,
      dismissToast: () => setLatestToast(null),
      markAsRead,
      markAllAsRead,
      clearToast,
    }),
    [
      notifications,
      panelOpen,
      latestToast,
      markAsRead,
      markAllAsRead,
      clearToast,
    ],
  );

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationsContext);

  if (!context) {
    throw new Error(
      "useNotifications must be used inside NotificationsProvider.",
    );
  }

  return context;
}
