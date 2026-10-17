// client/src/components/NotificationBell.tsx
import React from "react";
import { FaBell } from "react-icons/fa";
import { useNotifications } from "../notifications/NotificationsContext";

export default function NotificationBell() {
  const { unreadCount, panelOpen, setPanelOpen } = useNotifications();

  return (
    <button
      type="button"
      aria-label={`Open notifications. ${unreadCount} unread.`}
      onClick={() => setPanelOpen(!panelOpen)}
      className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
    >
      <FaBell />
      {unreadCount > 0 && (
        <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-extrabold text-white">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </button>
  );
}
