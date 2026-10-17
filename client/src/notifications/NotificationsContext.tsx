// client/src/notifications/NotificationsContext.tsx
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  where,
  limit,
  type DocumentData,
} from "firebase/firestore";
import { db } from "../firebase/firebase";
import { useAuth } from "../auth/AuthContext";
import {
  subscribeToForegroundMessages,
  playEmergencySound,
  showLocalNotification,
  enableEmergencyNotifications,
  refreshDeviceRegistration,
  isEmergencySoundEnabled,
  setEmergencySoundEnabled,
} from "../services/notifications/notificationService";

export type NotificationRecord = {
  id: string; // canonical list id: report:<id> | remote:<id> | fcm:<id>
  remoteId?: string | null; // firestore doc id if present
  title: string;
  message: string;
  read: boolean;
  type?: string;
  reportId?: string | null;
  createdAt?: { seconds?: number } | null;
  priority?: string;
  source?: "firestore" | "fcm" | "incident" | "local";
  data?: Record<string, unknown>;
};

type MarkResult = { success: boolean; id: string; error?: string };

type NotificationsContextType = {
  notifications: NotificationRecord[];
  unreadCount: number;
  addLocalNotification: (n: NotificationRecord, opts?: { playSound?: boolean; showToast?: boolean; isInitial?: boolean; fcmMessageId?: string }) => void;
  markAsRead: (id: string) => Promise<MarkResult>;
  markAllRead: () => Promise<{ success: boolean; failures: MarkResult[] }>;
  soundEnabled: boolean;
  toggleSound: (next?: boolean) => void;
  enableBrowserNotifications: () => Promise<any>;
  panelOpen: boolean;
  setPanelOpen: (open: boolean) => void;
  latestToast: NotificationRecord | null;
  dismissToast: () => void;
};

const NotificationsContext = createContext<NotificationsContextType | null>(null);

/** Build canonical list id */
function canonicalListId(remoteId?: string | null, reportId?: string | null, fcmMessageId?: string | null) {
  if (reportId) return `report:${reportId}`;
  if (remoteId) return `remote:${remoteId}`;
  if (fcmMessageId) return `fcm:${fcmMessageId}`;
  return `local:${Date.now().toString(36)}`;
}

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const { currentUser, userProfile } = useAuth();

  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [soundEnabled, setSoundEnabledState] = useState<boolean>(isEmergencySoundEnabled());
  const [panelOpen, setPanelOpenState] = useState<boolean>(false);
  const [latestToast, setLatestToast] = useState<NotificationRecord | null>(null);

  // dedupe / processed sets
  const processedListIdsRef = useRef(new Set<string>()); // prevents duplicate list entries (listId)
  const processedPlaybackKeysRef = useRef(new Set<string>()); // prevents duplicate playback and toast (playback key = report:... or remote:... or fcm:...)

  // remoteListenersMap: remoteId -> Set(listenerKey)
  const remoteListenersMapRef = useRef(new Map<string, Set<string>>());

  // unsubscribe storage
  const unsubscribersRef = useRef<Array<() => void>>([]);
  const fcmUnsubRef = useRef<() => void | undefined>();
  const isUnmountedRef = useRef(false);

  useEffect(() => {
    setSoundEnabledState(isEmergencySoundEnabled());
  }, []);

  useEffect(() => {
    isUnmountedRef.current = false;
    return () => {
      isUnmountedRef.current = true;
      // cleanup fcm
      try {
        const u = fcmUnsubRef.current;
        if (typeof u === "function") u();
      } catch (e) {}
      // cleanup listeners
      unsubscribersRef.current.forEach((u) => {
        try { u(); } catch (e) {}
      });
      unsubscribersRef.current = [];
      remoteListenersMapRef.current.clear();
      processedListIdsRef.current.clear();
      processedPlaybackKeysRef.current.clear();
    };
  }, [currentUser?.uid, userProfile?.role, userProfile?.agency]);

  // Merge helper (safe list upsert)
  const mergeIntoList = useCallback((items: NotificationRecord[]) => {
    setNotifications((current) => {
      const map = new Map(current.map((n) => [n.id, n]));
      for (const it of items) {
        const existing = map.get(it.id);
        if (existing) {
          map.set(it.id, { ...existing, ...it });
        } else {
          map.set(it.id, it);
        }
      }
      const merged = Array.from(map.values()).sort((a, b) => {
        const ta = a.createdAt?.seconds ?? 0;
        const tb = b.createdAt?.seconds ?? 0;
        return tb - ta;
      });
      return merged.slice(0, 300);
    });
  }, []);

  // Remove remote entry only when no active listeners reference it
  const removeRemoteEntryIfNoListeners = useCallback((remoteId: string) => {
    const map = remoteListenersMapRef.current;
    const set = map.get(remoteId);
    if (!set || set.size === 0) {
      setNotifications((current) => current.filter((n) => n.remoteId !== remoteId));
      processedListIdsRef.current.delete(`remote:${remoteId}`);
      processedPlaybackKeysRef.current.delete(`remote:${remoteId}`);
      map.delete(remoteId);
    }
  }, []);

  /**
   * addLocalNotification:
   * - canonical list id computed by canonicalListId
   * - if isInitial === true, suppress playback and toast
   * - dedupe list entries by listId (report: or remote: or fcm:)
   * - dedupe playback by playback key (same as listId)
   */
  const addLocalNotification = useCallback((notification: NotificationRecord, opts?: { playSound?: boolean; showToast?: boolean; isInitial?: boolean; fcmMessageId?: string }) => {
    const listId = canonicalListId(notification.remoteId ?? null, notification.reportId ?? null, opts?.fcmMessageId ?? null);
    // prepare merged record with canonical id
    const rec: NotificationRecord = {
      ...notification,
      id: listId,
      remoteId: notification.remoteId ?? null,
      reportId: notification.reportId ?? null,
    };

    if (processedListIdsRef.current.has(listId)) {
      // merge fields, but don't replay
      mergeIntoList([rec]);
      return;
    }

    // add to list
    processedListIdsRef.current.add(listId);
    mergeIntoList([rec]);

    // handle playback and toast only if not initial snapshot
    if (opts?.isInitial) {
      return;
    }

    const playbackKey = listId;
    if (!processedPlaybackKeysRef.current.has(playbackKey)) {
      processedPlaybackKeysRef.current.add(playbackKey);

      if (opts?.showToast) {
        setLatestToast(rec);
      }

      if (opts?.playSound && soundEnabled) {
        // play via helper
        void playEmergencySound().catch(() => {});
      }
    }
  }, [mergeIntoList, soundEnabled]);

  // Set up Firestore listeners: role, agency, user-scoped
  useEffect(() => {
    // cleanup previous
    unsubscribersRef.current.forEach((u) => {
      try { u(); } catch (e) {}
    });
    unsubscribersRef.current = [];

    if (!currentUser?.uid) {
      setNotifications([]);
      return;
    }

    const notificationsCol = collection(db, "notifications");

    const attachScopedListener = (field: string, value: string) => {
      const listenerKey = `${field}:${value}`;
      let isInitial = true;

      try {
        const q = query(notificationsCol, where(field as any, "==", value), orderBy("createdAt", "desc"), limit(200));
        const unsub = onSnapshot(q, (snapshot) => {
          snapshot.docChanges().forEach((change) => {
            const d = change.doc;
            const data = d.data() as DocumentData;
            const remoteId = d.id;
            const rec: NotificationRecord = {
              id: canonicalListId(remoteId, typeof data.reportId === "string" ? data.reportId : null, undefined),
              remoteId,
              title: typeof data.title === "string" ? data.title : "Notification",
              message: typeof data.message === "string" ? data.message : "",
              read: Boolean(data.read),
              type: typeof data.type === "string" ? data.type : undefined,
              reportId: typeof data.reportId === "string" ? data.reportId : null,
              createdAt: (data.createdAt as { seconds?: number } | undefined) ?? null,
              priority: typeof data.priority === "string" ? data.priority : undefined,
              source: "firestore",
              data,
            };

            // maintain remoteListenersMap
            const map = remoteListenersMapRef.current;
            if (change.type === "added") {
              const set = map.get(remoteId) ?? new Set<string>();
              set.add(listenerKey);
              map.set(remoteId, set);
              // isInitial additions should not cause playback/toast; we pass isInitial flag
              addLocalNotification(rec, { playSound: true, showToast: true, isInitial });
            } else if (change.type === "modified") {
              mergeIntoList([rec]);
            } else if (change.type === "removed") {
              const set = map.get(remoteId);
              if (set) {
                set.delete(listenerKey);
                if (set.size === 0) {
                  map.delete(remoteId);
                  removeRemoteEntryIfNoListeners(remoteId);
                } else {
                  map.set(remoteId, set);
                }
              } else {
                removeRemoteEntryIfNoListeners(remoteId);
              }
            }
          });

          if (isInitial) isInitial = false;
        }, (err) => console.error("notifications listener error:", err));
        unsubscribersRef.current.push(unsub);
      } catch (e) {
        console.error("Failed to attach listener:", e);
      }
    };

    if (userProfile?.role) attachScopedListener("recipientRole", userProfile.role);
    if ((userProfile as any)?.agency) attachScopedListener("recipientAgency", (userProfile as any).agency);
    if ((userProfile as any)?.countyCode) attachScopedListener("recipientCounty", (userProfile as any).countyCode);
    if ((userProfile as any)?.wardCode) attachScopedListener("recipientWard", (userProfile as any).wardCode);

    // per-user listener
    try {
      const qUser = query(notificationsCol, where("recipientUserId", "==", currentUser.uid), orderBy("createdAt", "desc"), limit(200));
      let isInitialUser = true;
      const unsubUser = onSnapshot(qUser, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          const d = change.doc;
          const data = d.data() as DocumentData;
          const remoteId = d.id;
          const rec: NotificationRecord = {
            id: canonicalListId(remoteId, typeof data.reportId === "string" ? data.reportId : null, undefined),
            remoteId,
            title: typeof data.title === "string" ? data.title : "Notification",
            message: typeof data.message === "string" ? data.message : "",
            read: Boolean(data.read),
            type: typeof data.type === "string" ? data.type : undefined,
            reportId: typeof data.reportId === "string" ? data.reportId : null,
            createdAt: (data.createdAt as { seconds?: number } | undefined) ?? null,
            priority: typeof data.priority === "string" ? data.priority : undefined,
            source: "firestore",
            data,
          };

          const listenerKey = `user:${currentUser.uid}`;
          const map = remoteListenersMapRef.current;

          if (change.type === "added") {
            const set = map.get(remoteId) ?? new Set<string>();
            set.add(listenerKey);
            map.set(remoteId, set);
            addLocalNotification(rec, { playSound: true, showToast: true, isInitial: isInitialUser });
          } else if (change.type === "modified") {
            mergeIntoList([rec]);
          } else if (change.type === "removed") {
            const set = map.get(remoteId);
            if (set) {
              set.delete(listenerKey);
              if (set.size === 0) {
                map.delete(remoteId);
                removeRemoteEntryIfNoListeners(remoteId);
              } else {
                map.set(remoteId, set);
              }
            } else {
              removeRemoteEntryIfNoListeners(remoteId);
            }
          }
        });

        if (isInitialUser) isInitialUser = false;
      }, (err) => console.error("user notifications error:", err));
      unsubscribersRef.current.push(unsubUser);
    } catch (e) {
      // ignore
    }

    // Subscribe to foreground FCM messages (provider controls playback & show)
    let cancelled = false;
    (async () => {
      try {
        const unsub = await subscribeToForegroundMessages((payload) => {
          if (cancelled || isUnmountedRef.current) return;
          try {
            const data = payload.data || {};
            const messageId = payload.messageId ?? (data.messageId as string | undefined);
            const reportId = typeof data.reportId === "string" ? data.reportId : undefined;
            const listId = canonicalListId(undefined, reportId ?? null, messageId ?? null);

            const rec: NotificationRecord = {
              id: listId,
              remoteId: null,
              title: payload.notification?.title || (data.title as string) || "Jamii Emergency",
              message: payload.notification?.body || (data.body as string) || "New emergency event",
              read: false,
              type: (data.type as string) || payload.notification?.title || "emergency",
              reportId: reportId ?? null,
              createdAt: { seconds: Math.floor(Date.now() / 1000) },
              source: "fcm",
              data: data as Record<string, unknown>,
            };

            // playback dedupe by canonical list id
            if (!processedPlaybackKeysRef.current.has(listId)) {
              addLocalNotification(rec, { playSound: true, showToast: true, isInitial: false, fcmMessageId: messageId });
            } else {
              mergeIntoList([rec]); // ensure it's present
            }
          } catch (e) {
            console.error("Error processing FCM payload:", e);
          }
        });

        if (cancelled) {
          try { unsub?.(); } catch (e) {}
        } else {
          fcmUnsubRef.current = unsub;
        }
      } catch (e) {
        console.warn("subscribeToForegroundMessages failed:", e);
      }
    })();

    return () => {
      cancelled = true;
      if (fcmUnsubRef.current) {
        try { fcmUnsubRef.current(); } catch (e) {}
      }
    };
  }, [currentUser?.uid, userProfile?.role, userProfile?.agency, addLocalNotification, mergeIntoList, removeRemoteEntryIfNoListeners]);

  // markAsRead with optimistic update and rollback on failure
  const markAsRead = useCallback(async (id: string): Promise<MarkResult> => {
    const prev = notifications;
    setNotifications((cur) => cur.map((n) => (n.id === id ? { ...n, read: true } : n)));

    const found = notifications.find((n) => n.id === id);
    if (!found) return { success: false, id, error: "notification not found" };

    if (found.source !== "firestore" || !found.remoteId) {
      // local-only; nothing to persist
      return { success: true, id };
    }

    try {
      const ref = doc(db, "notifications", found.remoteId);
      const snapshot = await getDoc(ref);
      if (!snapshot.exists()) {
        // revert
        setNotifications(prev);
        return { success: false, id, error: "remote notification not found" };
      }
      await updateDoc(ref, { read: true });
      return { success: true, id };
    } catch (e: any) {
      setNotifications(prev);
      return { success: false, id, error: e?.message ?? String(e) };
    }
  }, [notifications]);

  // markAllRead with per-item error handling and revert of failures
  const markAllRead = useCallback(async () => {
    const prev = notifications;
    setNotifications((cur) => cur.map((n) => ({ ...n, read: true })));
    const toMark = notifications.filter((n) => !n.read && n.source === "firestore" && n.remoteId);
    const failures: MarkResult[] = [];

    await Promise.all(toMark.map(async (n) => {
      try {
        const ref = doc(db, "notifications", n.remoteId!);
        const snapshot = await getDoc(ref);
        if (!snapshot.exists()) {
          failures.push({ success: false, id: n.id, error: "remote not found" });
          return;
        }
        await updateDoc(ref, { read: true });
      } catch (e: any) {
        failures.push({ success: false, id: n.id, error: e?.message ?? String(e) });
      }
    }));

    if (failures.length > 0) {
      const failedIds = new Set(failures.map((f) => f.id));
      setNotifications((cur) => cur.map((n) => (failedIds.has(n.id) ? { ...n, read: false } : n)));
      return { success: false, failures };
    }

    return { success: true, failures: [] };
  }, [notifications]);

  const toggleSound = useCallback((next?: boolean) => {
    const ns = typeof next === "boolean" ? next : !isEmergencySoundEnabled();
    setEmergencySoundEnabled(ns);
    setSoundEnabledState(ns);
    // do not clear processedPlaybackKeysRef — changing preference should not replay existing notifications
    if (currentUser && Notification.permission === "granted") {
      void refreshDeviceRegistration({
        role: userProfile?.role || "",
        agencyId: (userProfile as any)?.agency || undefined,
        agencyName: undefined,
        countyCode: undefined,
        countyName: undefined,
        wardCode: undefined,
        wardName: undefined,
      } as any).catch(() => {});
    }
  }, [currentUser, userProfile]);

  const enableBrowserNotifications = useCallback(async () => {
    return await enableEmergencyNotifications({
      role: userProfile?.role || "",
      agencyId: (userProfile as any)?.agency || undefined,
      agencyName: undefined,
      countyCode: undefined,
      countyName: undefined,
      wardCode: undefined,
      wardName: undefined,
    } as any);
  }, [userProfile]);

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);

  const setPanelOpen = useCallback((open: boolean) => setPanelOpenState(open), []);
  const dismissToast = useCallback(() => setLatestToast(null), []);

  const value = useMemo<NotificationsContextType>(() => ({
    notifications,
    unreadCount,
    addLocalNotification,
    markAsRead,
    markAllRead,
    soundEnabled,
    toggleSound,
    enableBrowserNotifications,
    panelOpen,
    setPanelOpen,
    latestToast,
    dismissToast,
  }), [notifications, unreadCount, addLocalNotification, markAsRead, markAllRead, soundEnabled, toggleSound, enableBrowserNotifications, panelOpen, setPanelOpen, latestToast, dismissToast]);

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error("useNotifications must be used within NotificationsProvider");
  return ctx;
}
