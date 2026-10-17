// client/src/components/NotificationToast.tsx
import React from "react";

export default function NotificationToast({
  title,
  message,
  onView,
  onDismiss,
  severity = "critical",
}: {
  title: string;
  message: string;
  onView?: () => void;
  onDismiss?: () => void;
  severity?: "critical" | "high" | "medium" | "info";
}) {
  const color = severity === "critical" ? "bg-red-600 text-white" : severity === "high" ? "bg-orange-600 text-white" : severity === "medium" ? "bg-amber-500 text-slate-950" : "bg-slate-800 text-white";
  return (
    <div className={`${color} fixed right-4 top-24 z-[999] w-[calc(100vw-2rem)] max-w-md overflow-hidden rounded-2xl shadow-2xl`} role="status" aria-live="polite">
      <div className="p-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="font-extrabold">{title}</p>
            <p className="mt-1 text-sm opacity-90">{message}</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {onView && <button onClick={onView} className="rounded-xl bg-white/20 px-3 py-2 text-xs font-black">View</button>}
            <button onClick={onDismiss} className="rounded-xl bg-white/10 px-3 py-2 text-xs">Dismiss</button>
          </div>
        </div>
      </div>
      <style>{`@media (prefers-reduced-motion: reduce) { .animate-toast { animation: none !important; } }`}</style>
    </div>
  );
}
