import { useEffect } from "react";
import type { CSSProperties } from "react";
import { useNotifications } from "../notifications/NotificationsContext";

export default function NotificationToast() {
  const { latestToast, dismissToast, setPanelOpen } = useNotifications();

  useEffect(() => {
    if (!latestToast) return;

    const timer = window.setTimeout(dismissToast, 7000);
    return () => window.clearTimeout(timer);
  }, [latestToast, dismissToast]);

  if (!latestToast) return null;

  return (
    <aside role="status" aria-live="polite" style={toastStyle}>
      <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
        <span aria-hidden="true" style={{ fontSize: 22 }}>🔔</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <strong style={{ display: "block", fontSize: 14 }}>
            {latestToast.title}
          </strong>
          <p style={{
            margin: "5px 0 10px",
            fontSize: 13,
            lineHeight: 1.45,
            overflowWrap: "anywhere",
          }}>
            {latestToast.message}
          </p>
          <button
            type="button"
            onClick={() => {
              setPanelOpen(true);
              dismissToast();
            }}
            style={actionStyle}
          >
            Open notifications
          </button>
        </div>
        <button
          type="button"
          aria-label="Dismiss notification"
          onClick={dismissToast}
          style={closeStyle}
        >
          ✕
        </button>
      </div>
    </aside>
  );
}

const toastStyle: CSSProperties = {
  position: "fixed",
  right: 16,
  bottom: 18,
  zIndex: 10002,
  width: "min(390px, calc(100vw - 24px))",
  boxSizing: "border-box",
  padding: 16,
  borderRadius: 15,
  border: "1px solid #dbe5dd",
  background: "#fff",
  color: "#17231c",
  boxShadow: "0 15px 45px rgba(13, 45, 27, .22)",
};

const actionStyle: CSSProperties = {
  border: 0,
  borderRadius: 8,
  padding: "8px 11px",
  background: "#176b36",
  color: "#fff",
  fontWeight: 600,
  cursor: "pointer",
};

const closeStyle: CSSProperties = {
  border: 0,
  background: "transparent",
  color: "#647568",
  cursor: "pointer",
};
