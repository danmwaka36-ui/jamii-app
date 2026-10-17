// client/src/components/NotificationsHost.tsx
import React from "react";
import { useNotifications } from "../notifications/NotificationsContext";
import NotificationToast from "./NotificationToast";
import NotificationsPanel from "./NotificationsPanel";
import { useAuth } from "../auth/AuthContext";
import { useNavigate } from "react-router-dom";

/**
 * NotificationsHost
 * - Renders NotificationToast (driven by provider.latestToast).
 * - Renders NotificationsPanel when panelOpen.
 * - Does NOT inject a global bell — dashboards should render NotificationBell in their own topbars.
 */
export default function NotificationsHost() {
  const { latestToast, dismissToast, panelOpen } = useNotifications();
  const { userProfile } = useAuth();
  const navigate = useNavigate();

  function resolveSafeRoute(n: any) {
    // explicit allowlist of patterns / base routes from AppRouter
    const allowedBasePaths = [
      "/redcross/incidents",
      "/admin/emergencies",
      "/police/incidents",
      "/dashboard",
      "/police/dispatch",
      "/fire",
      "/ambulance",
      "/county",
      "/nyumbakumi",
    ];

    // if notification includes a data.path, validate it against allowed base paths
    const candidate = n?.data?.path as string | undefined;
    if (candidate) {
      const match = allowedBasePaths.find((base) => candidate.startsWith(base));
      if (match) {
        return candidate;
      }
    }

    // else route by role and reportId if present
    const reportId = n?.reportId;
    const role = userProfile?.role;

    if (reportId && role === "redcross") {
      return `/redcross/incidents?incident=${reportId}`;
    }
    if (reportId && role === "police") {
      return `/police/incidents?incident=${reportId}`;
    }
    if (reportId && role === "admin") {
      return `/admin/emergencies?incident=${reportId}`;
    }

    // fallback: if reportId exists but we don't know role, route to redcross incidents as a safe default (still internal)
    if (reportId) {
      return `/redcross/incidents?incident=${reportId}`;
    }

    // ultimate fallback: dashboard
    return "/dashboard";
  }

  function handleView(n: any) {
    const route = resolveSafeRoute(n);
    navigate(route);
    dismissToast();
  }

  return (
    <>
      {/* Panel position handled by each dashboard when it renders NotificationBell; we still render a floating panel for testing */}
      {panelOpen && <div style={{ position: "fixed", right: 16, top: 80, zIndex: 900 }}><NotificationsPanel /></div>}

      {latestToast && (
        <NotificationToast
          title={latestToast.title}
          message={latestToast.message}
          severity={(latestToast.priority?.toLowerCase() as any) || "critical"}
          onView={() => handleView(latestToast)}
          onDismiss={() => dismissToast()}
        />
      )}
    </>
  );
}
