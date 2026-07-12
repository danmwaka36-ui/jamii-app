import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaBell } from "react-icons/fa";

import NotificationDrawer from "./NotificationDrawer";
import type { AdminNotificationRecord } from "./NotificationItem";

const initialNotifications: AdminNotificationRecord[] = [
  {
    id: "notification-1",
    title: "Critical fire emergency reported",
    message:
      "A new critical fire incident has been submitted from Nyali, Mombasa.",
    type: "emergency",
    createdAt: "2 minutes ago",
    read: false,
    path: "/admin/emergencies",
  },
  {
    id: "notification-2",
    title: "Police unit dispatched",
    message:
      "A Police response team has been assigned to a robbery incident in Bamburi.",
    type: "police",
    createdAt: "8 minutes ago",
    read: false,
    path: "/police/dispatch",
  },
  {
    id: "notification-3",
    title: "New agency user registered",
    message:
      "A new Ambulance responder account is waiting for administrator review.",
    type: "user",
    createdAt: "24 minutes ago",
    read: false,
    path: "/admin/users",
  },
  {
    id: "notification-4",
    title: "Fire response team available",
    message:
      "Mombasa Fire Brigade has updated its operational status to available.",
    type: "fire",
    createdAt: "41 minutes ago",
    read: true,
    path: "/admin/agencies",
  },
  {
    id: "notification-5",
    title: "Notification service active",
    message:
      "Firebase Cloud Messaging device registration is available for agency users.",
    type: "success",
    createdAt: "1 hour ago",
    read: true,
    path: "/admin/settings",
  },
  {
    id: "notification-6",
    title: "System configuration reminder",
    message:
      "Complete role permissions and agency routing before production launch.",
    type: "system",
    createdAt: "2 hours ago",
    read: false,
    path: "/admin/roles",
  },
];

export default function NotificationBell() {
  const navigate = useNavigate();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [notifications, setNotifications] =
    useState<AdminNotificationRecord[]>(initialNotifications);

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.read).length,
    [notifications]
  );

  function handleOpenNotification(
    notification: AdminNotificationRecord
  ) {
    setNotifications((current) =>
      current.map((item) =>
        item.id === notification.id
          ? {
              ...item,
              read: true,
            }
          : item
      )
    );

    setDrawerOpen(false);

    if (notification.path) {
      navigate(notification.path);
    }
  }

  function handleMarkRead(notificationId: string) {
    setNotifications((current) =>
      current.map((notification) =>
        notification.id === notificationId
          ? {
              ...notification,
              read: true,
            }
          : notification
      )
    );
  }

  function handleMarkAllRead() {
    setNotifications((current) =>
      current.map((notification) => ({
        ...notification,
        read: true,
      }))
    );
  }

  function handleDelete(notificationId: string) {
    setNotifications((current) =>
      current.filter(
        (notification) => notification.id !== notificationId
      )
    );
  }

  function handleClearAll() {
    setNotifications([]);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setDrawerOpen(true)}
        aria-label={`Open notifications. ${unreadCount} unread.`}
        className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition hover:bg-slate-200"
      >
        <FaBell className="text-lg" />

        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-extrabold text-white shadow-sm">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      <NotificationDrawer
        open={drawerOpen}
        notifications={notifications}
        onClose={() => setDrawerOpen(false)}
        onOpenNotification={handleOpenNotification}
        onMarkRead={handleMarkRead}
        onMarkAllRead={handleMarkAllRead}
        onDelete={handleDelete}
        onClearAll={handleClearAll}
      />
    </>
  );
}