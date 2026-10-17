// client/src/components/NotificationsPanel.tsx
import React from "react";
import { useNotifications } from "../notifications/NotificationsContext";
import { FaCheckCircle, FaTimes } from "react-icons/fa";

export default function NotificationsPanel() {
  const { notifications, markAsRead, markAllRead, unreadCount, toggleSound, soundEnabled, panelOpen, setPanelOpen } = useNotifications();

  if (!panelOpen) return null;

  return (
    <div className="w-[min(96vw,420px)] rounded-2xl border border-slate-200 bg-white shadow-2xl">
      <div className="flex items-center justify-between border-b border-slate-100 p-4">
        <div>
          <h2 className="font-extrabold text-slate-950">Notifications</h2>
          <p className="mt-1 text-xs text-slate-500">{unreadCount} unread</p>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button onClick={() => void markAllRead()} className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100">
              <FaCheckCircle />
            </button>
          )}
          <button onClick={() => setPanelOpen(false)} aria-label="Close notifications" className="ml-2 inline-flex items-center justify-center rounded-md p-2 text-slate-600 hover:bg-slate-50">
            <FaTimes />
          </button>
        </div>
      </div>

      <div className="border-b border-slate-100 bg-slate-50 p-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${soundEnabled ? "bg-emerald-100 text-emerald-700" : "bg-orange-100 text-orange-700"}`}>
              <FaCheckCircle />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">Emergency sound</p>
              <p className="text-[10px] text-slate-500">{soundEnabled ? "Ready" : "Disabled"}</p>
            </div>
          </div>
          <button onClick={() => toggleSound()} className="rounded-lg bg-red-600 px-3 py-2 text-[10px] font-black text-white hover:bg-red-700">
            {soundEnabled ? "Disable sound" : "Enable sound"}
          </button>
        </div>
      </div>

      <div className="max-h-[56vh] overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-8 text-center">
            <p className="mt-4 font-bold text-slate-700">No notifications</p>
            <p className="mt-1 text-xs leading-5 text-slate-500">New emergency alerts will appear here automatically.</p>
          </div>
        ) : (
          notifications.map((n) => (
            <div key={n.id} className={`w-full border-b border-slate-100 p-4 text-left ${n.read ? "bg-white" : "bg-red-50/60"}`}>
              <div className="flex gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-red-700">!</div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-bold text-slate-900">{n.title}</p>
                    {!n.read && <span className="mt-1.5 h-2.5 w-2.5 rounded-full bg-red-600" />}
                  </div>
                  <p className="mt-1 text-sm leading-5 text-slate-500">{n.message}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <p className="text-xs text-slate-400">{n.priority ?? ""}</p>
                    <div className="flex gap-3">
                      {!n.read && (
                        <button onClick={() => void markAsRead(n.id)} className="text-xs font-bold text-emerald-700">Mark read</button>
                      )}
                      {n.reportId && (
                        <a href={`/redcross/incidents?incident=${n.reportId}`} className="text-xs font-bold text-slate-700">View</a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
