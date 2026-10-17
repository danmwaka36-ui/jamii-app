import type { CSSProperties } from "react";
import { useNotifications } from "../notifications/NotificationsContext";

export default function NotificationBell() {
  const { unreadCount, panelOpen, setPanelOpen } = useNotifications();

  return (
    <button
      type="button"
      aria-label={`Notifications, ${unreadCount} unread`}
      aria-expanded={panelOpen}
      onClick={() => setPanelOpen(!panelOpen)}
      style={bellStyle}
      title="Notifications"
    >
      <svg
        width="21"
        height="21"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
        <path d="M10 21h4" />
      </svg>
      {unreadCount > 0 && (
        <span style={badgeStyle}>
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </button>
  );
}

const bellStyle: CSSProperties = {
  position: "relative",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: 44,
  height: 44,
  border: "1px solid #dbe5dd",
  borderRadius: 13,
  color: "#17492b",
  background: "#fff",
  cursor: "pointer",
  boxShadow: "0 3px 12px rgba(16, 50, 28, .08)",
};

const badgeStyle: CSSProperties = {
  position: "absolute",
  top: -5,
  right: -5,
  minWidth: 19,
  height: 19,
  padding: "0 4px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  border: "2px solid #fff",
  borderRadius: 20,
  background: "#c62828",
  color: "#fff",
  fontSize: 10,
  fontWeight: 700,
};
