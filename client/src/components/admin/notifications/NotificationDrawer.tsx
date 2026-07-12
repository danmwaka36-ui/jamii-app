import { FaBell, FaCheckDouble, FaTimes, FaTrash } from "react-icons/fa";
import NotificationItem, {
  type AdminNotificationRecord,
} from "./NotificationItem";

type NotificationDrawerProps = {
  open: boolean;
  notifications: AdminNotificationRecord[];
  onClose: () => void;
  onOpenNotification: (notification: AdminNotificationRecord) => void;
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
};

export default function NotificationDrawer({
  open,
  notifications,
  onClose,
  onOpenNotification,
  onMarkRead,
  onMarkAllRead,
  onDelete,
  onClearAll,
}: NotificationDrawerProps) {
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity ${
          open
            ? "opacity-100 visible"
            : "opacity-0 invisible"
        }`}
      />

      {/* Drawer */}
      <aside
        className={`fixed right-0 top-0 z-50 flex h-screen w-full max-w-md flex-col bg-white shadow-2xl transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}

        <div className="flex items-center justify-between border-b border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
              <FaBell />
            </div>

            <div>
              <h2 className="text-xl font-bold">
                Notifications
              </h2>

              <p className="text-sm text-slate-500">
                {unread} unread notification
                {unread !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 hover:bg-slate-100"
            type="button"
          >
            <FaTimes />
          </button>
        </div>

        {/* Toolbar */}

        <div className="flex items-center justify-between border-b border-slate-100 p-4">
          <button
            onClick={onMarkAllRead}
            className="flex items-center gap-2 rounded-lg bg-blue-100 px-4 py-2 text-sm font-bold text-blue-700 hover:bg-blue-200"
            type="button"
          >
            <FaCheckDouble />
            Mark all read
          </button>

          <button
            onClick={onClearAll}
            className="flex items-center gap-2 rounded-lg bg-red-100 px-4 py-2 text-sm font-bold text-red-700 hover:bg-red-200"
            type="button"
          >
            <FaTrash />
            Clear
          </button>
        </div>

        {/* Notifications */}

        <div className="flex-1 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center p-10 text-center">
              <div className="mb-4 rounded-full bg-slate-100 p-6 text-4xl text-slate-400">
                <FaBell />
              </div>

              <h3 className="text-lg font-bold text-slate-700">
                No notifications
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                New emergency alerts, approvals and
                system messages will appear here.
              </p>
            </div>
          ) : (
            notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onOpen={onOpenNotification}
                onMarkRead={onMarkRead}
                onDelete={onDelete}
              />
            ))
          )}
        </div>

        {/* Footer */}

        <div className="border-t border-slate-200 bg-slate-50 p-4 text-center text-xs text-slate-500">
          Live Firebase notifications will appear here in
          real time.
        </div>
      </aside>
    </>
  );
}