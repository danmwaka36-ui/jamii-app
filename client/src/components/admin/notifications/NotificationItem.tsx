import {
  FaBell,
  FaCheckCircle,
  FaExclamationTriangle,
  FaFire,
  FaInfoCircle,
  FaShieldAlt,
  FaUserPlus,
} from "react-icons/fa";

export type AdminNotificationType =
  | "emergency"
  | "police"
  | "fire"
  | "user"
  | "system"
  | "success"
  | "info";

export type AdminNotificationRecord = {
  id: string;
  title: string;
  message: string;
  type: AdminNotificationType;
  createdAt: string;
  read: boolean;
  path?: string;
};

type NotificationItemProps = {
  notification: AdminNotificationRecord;
  onOpen: (notification: AdminNotificationRecord) => void;
  onMarkRead: (notificationId: string) => void;
  onDelete: (notificationId: string) => void;
};

function notificationStyle(type: AdminNotificationType) {
  switch (type) {
    case "emergency":
      return {
        icon: <FaExclamationTriangle />,
        iconClass: "bg-red-100 text-red-700",
      };

    case "police":
      return {
        icon: <FaShieldAlt />,
        iconClass: "bg-blue-100 text-blue-700",
      };

    case "fire":
      return {
        icon: <FaFire />,
        iconClass: "bg-orange-100 text-orange-700",
      };

    case "user":
      return {
        icon: <FaUserPlus />,
        iconClass: "bg-purple-100 text-purple-700",
      };

    case "success":
      return {
        icon: <FaCheckCircle />,
        iconClass: "bg-emerald-100 text-emerald-700",
      };

    case "system":
      return {
        icon: <FaBell />,
        iconClass: "bg-slate-100 text-slate-700",
      };

    default:
      return {
        icon: <FaInfoCircle />,
        iconClass: "bg-cyan-100 text-cyan-700",
      };
  }
}

export default function NotificationItem({
  notification,
  onOpen,
  onMarkRead,
  onDelete,
}: NotificationItemProps) {
  const style = notificationStyle(notification.type);

  return (
    <article
      className={`border-b border-slate-100 p-4 transition hover:bg-slate-50 ${
        notification.read ? "bg-white" : "bg-blue-50/50"
      }`}
    >
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={() => onOpen(notification)}
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-lg ${style.iconClass}`}
          aria-label={`Open notification: ${notification.title}`}
        >
          {style.icon}
        </button>

        <div className="min-w-0 flex-1">
          <button
            type="button"
            onClick={() => onOpen(notification)}
            className="w-full text-left"
          >
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-bold text-slate-900">
                {notification.title}
              </h3>

              {!notification.read && (
                <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-blue-600" />
              )}
            </div>

            <p className="mt-1 text-sm leading-6 text-slate-500">
              {notification.message}
            </p>

            <p className="mt-2 text-xs font-semibold text-slate-400">
              {notification.createdAt}
            </p>
          </button>

          <div className="mt-3 flex flex-wrap gap-2">
            {!notification.read && (
              <button
                type="button"
                onClick={() => onMarkRead(notification.id)}
                className="rounded-lg bg-blue-100 px-3 py-2 text-xs font-bold text-blue-700 transition hover:bg-blue-200"
              >
                Mark as read
              </button>
            )}

            <button
              type="button"
              onClick={() => onDelete(notification.id)}
              className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-bold text-slate-600 transition hover:bg-red-100 hover:text-red-700"
            >
              Remove
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}