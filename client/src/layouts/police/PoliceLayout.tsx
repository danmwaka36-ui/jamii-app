import { useState } from "react";
import { Outlet } from "react-router-dom";

import PoliceSidebar from "../../components/police/PoliceSidebar";
import PoliceTopbar from "../../components/police/PoliceTopbar";

import useEmergencyNotifications from "../../hooks/useEmergencyNotifications";

export default function PoliceLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const {
    latestNotification,
    unreadCount,
    listening,
    markAsRead,
  } = useEmergencyNotifications({
    onNotification: (notification) => {
      console.log("🚨 Police Emergency:", notification);
    },
  });

  function openSidebar() {
    setSidebarOpen(true);
  }

  function closeSidebar() {
    setSidebarOpen(false);
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <PoliceSidebar
        mobileOpen={sidebarOpen}
        onClose={closeSidebar}
      />

      <PoliceTopbar onMenuClick={openSidebar} />

      {/* Live Emergency Notification */}
      {latestNotification && (
        <div className="fixed right-4 top-24 z-[60] w-[calc(100%-2rem)] max-w-md rounded-2xl border border-red-200 bg-white p-5 shadow-2xl animate-pulse">

          <div className="flex items-start justify-between gap-4">

            <div>

              <p className="text-xs font-bold uppercase tracking-wide text-red-600">
                🚨 New Emergency Alert
              </p>

              <h2 className="mt-2 text-lg font-extrabold text-slate-900">
                {latestNotification.title}
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                {latestNotification.body}
              </p>

              {latestNotification.location && (
                <p className="mt-3 text-sm font-semibold text-slate-700">
                  📍 {latestNotification.location}
                </p>
              )}

              <p className="mt-4 text-xs text-slate-500">
                {listening
                  ? `🟢 Live • ${unreadCount} unread`
                  : "Listener Offline"}
              </p>

            </div>

            <button
              onClick={() =>
                markAsRead(latestNotification.id)
              }
              className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold hover:bg-slate-200"
            >
              Dismiss
            </button>

          </div>

        </div>
      )}

      <main className="min-h-screen pt-20 transition-all duration-300 lg:ml-72">
        <div className="mx-auto w-full max-w-[1800px] p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}