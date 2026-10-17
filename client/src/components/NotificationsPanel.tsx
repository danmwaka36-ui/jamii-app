import type { CSSProperties } from "react";
import { useNotifications, type JamiiNotification } from "../notifications/NotificationsContext";
import { useAuth } from "../auth/AuthContext";

const panelStyle: CSSProperties = {
  position: "fixed",
  top: 76,
  right: 16,
  zIndex: 10000,
  width: "min(410px, calc(100vw - 24px))",
  maxHeight: "min(70vh, 620px)",
  overflowY: "auto",
  background: "#fff",
  color: "#17231c",
  border: "1px solid #dbe5dd",
  borderRadius: 16,
  boxShadow: "0 18px 50px rgba(13, 45, 27, .22)",
};

function destinationFor(role: string, notification: JamiiNotification) {
  if (!notification.reportId) return "/";

  const normalized = role.toLowerCase().replace(/[\s_-]/g, "");
  const routeByRole: Record<string, string> = {
    redcross: "/redcross/incidents",
    police: "/police/incidents",
    fire: "/fire",
    ambulance: "/ambulance",
    county: "/county",
    admin: "/admin/emergencies",
    administrator: "/admin/emergencies",
    citizen: "/dashboard/alerts",
  };

  const base = routeByRole[normalized] || "/";
  return `${base}?incident=${encodeURIComponent(notification.reportId)}`;
}

export default function NotificationsPanel() {
  const {
    notifications,
    unreadCount,
    panelOpen,
    setPanelOpen,
    markAsRead,
    markAllAsRead,
  } = useNotifications();
  const { userProfile } = useAuth();

  if (!panelOpen) return null;

  const role = userProfile?.role || "citizen";

  return (
    <>
      <button
        type="button"
        aria-label="Close notifications"
        onClick={() => setPanelOpen(false)}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9998,
          border: 0,
          background: "rgba(12, 24, 16, .12)",
        }}
      />
      <section
        aria-label="Notifications"
        aria-live="polite"
        style={panelStyle}
      >
        <header style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          padding: "16px 18px",
          borderBottom: "1px solid #e6ece7",
          position: "sticky",
          top: 0,
          background: "#fff",
        }}>
          <div>
            <strong style={{ fontSize: 17 }}>Notifications</strong>
            <div style={{ fontSize: 12, color: "#647568", marginTop: 4 }}>
              {unreadCount} unread
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              type="button"
              onClick={() => void markAllAsRead()}
              disabled={unreadCount === 0}
              style={smallButton}
            >
              Mark all read
            </button>
            <button
              type="button"
              aria-label="Close panel"
              onClick={() => setPanelOpen(false)}
              style={smallButton}
            >
              ✕
            </button>
          </div>
        </header>

        {notifications.length === 0 ? (
          <div style={{ padding: 28, textAlign: "center", color: "#647568" }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>♧</div>
            <strong>You're all caught up</strong>
            <p style={{ fontSize: 13 }}>New alerts will appear here.</p>
          </div>
        ) : (
          <div>
            {notifications.map((item) => (
              <article
                key={item.id}
                style={{
                  padding: "14px 18px",
                  borderBottom: "1px solid #edf1ed",
                  background: item.read ? "#fff" : "#f1f8f2",
                }}
              >
                <div style={{ display: "flex", gap: 10 }}>
                  <span
                    aria-hidden="true"
                    style={{
                      width: 9,
                      height: 9,
                      flex: "0 0 9px",
                      marginTop: 6,
                      borderRadius: "50%",
                      background: item.read ? "#b8c5bb" : "#16803d",
                    }}
                  />
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <strong style={{ fontSize: 14 }}>{item.title}</strong>
                    <p style={{
                      margin: "5px 0 8px",
                      fontSize: 13,
                      lineHeight: 1.5,
                      color: "#526257",
                      overflowWrap: "anywhere",
                    }}>
                      {item.message}
                    </p>
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 8,
                      flexWrap: "wrap",
                    }}>
                      <span style={{ fontSize: 11, color: "#738176" }}>
                        {new Date(item.createdAt).toLocaleString()}
                      </span>
                      <div style={{ display: "flex", gap: 10 }}>
                        {!item.read && (
                          <button
                            type="button"
                            onClick={() => void markAsRead(item)}
                            style={textButton}
                          >
                            Mark read
                          </button>
                        )}
                        {item.reportId && (
                          <button
                            type="button"
                            onClick={() => {
                              void markAsRead(item);
                              window.location.assign(destinationFor(role, item));
                            }}
                            style={textButton}
                          >
                            View incident →
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </>
  );
}

const smallButton: CSSProperties = {
  padding: "7px 9px",
  borderRadius: 8,
  border: "1px solid #dbe5dd",
  background: "#fff",
  color: "#31533c",
  fontSize: 11,
  cursor: "pointer",
};

const textButton: CSSProperties = {
  padding: 0,
  border: 0,
  background: "transparent",
  color: "#176b36",
  fontSize: 12,
  fontWeight: 600,
  cursor: "pointer",
};
