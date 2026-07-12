import type { ReactNode } from "react";
import {
  FaBell,
  FaCarSide,
  FaCheckCircle,
  FaExclamationTriangle,
  FaFileAlt,
  FaFire,
  FaShieldAlt,
  FaUserPlus,
} from "react-icons/fa";

type ActivityType =
  | "incident"
  | "dispatch"
  | "case"
  | "evidence"
  | "user"
  | "notification"
  | "vehicle"
  | "resolved";

export type RecentActivityItem = {
  id: string;
  title: string;
  description?: string;
  time: string;
  type: ActivityType;
  actor?: string;
  location?: string;
  icon?: ReactNode;
};

type RecentActivityProps = {
  activities?: RecentActivityItem[];
  loading?: boolean;
  title?: string;
  description?: string;
  maxItems?: number;
  onViewAll?: () => void;
};

const defaultActivities: RecentActivityItem[] = [
  {
    id: "activity-1",
    title: "New fire emergency reported",
    description: "Citizen submitted a critical fire incident.",
    time: "2 minutes ago",
    type: "incident",
    actor: "Citizen Reporter",
    location: "Nyali, Mombasa",
  },
  {
    id: "activity-2",
    title: "Police unit dispatched",
    description: "Alpha 12 assigned to an active robbery incident.",
    time: "8 minutes ago",
    type: "dispatch",
    actor: "Police Dispatch",
    location: "Bamburi",
  },
  {
    id: "activity-3",
    title: "New police case opened",
    description: "Case JAMII-POL-2026-1024 was created.",
    time: "18 minutes ago",
    type: "case",
    actor: "Investigation Unit",
    location: "Kisauni",
  },
  {
    id: "activity-4",
    title: "Evidence record uploaded",
    description: "CCTV footage was linked to an active case.",
    time: "26 minutes ago",
    type: "evidence",
    actor: "Evidence Officer",
  },
  {
    id: "activity-5",
    title: "New agency user registered",
    description: "A new ambulance responder account was approved.",
    time: "41 minutes ago",
    type: "user",
    actor: "System Administrator",
  },
  {
    id: "activity-6",
    title: "Emergency notification delivered",
    description: "Police and ambulance devices received a critical alert.",
    time: "54 minutes ago",
    type: "notification",
    actor: "Jamii Alert System",
  },
  {
    id: "activity-7",
    title: "Vehicle status updated",
    description: "Patrol vehicle GKB 123A marked available.",
    time: "1 hour ago",
    type: "vehicle",
    actor: "Fleet Officer",
  },
  {
    id: "activity-8",
    title: "Incident resolved",
    description: "Medical emergency closed successfully.",
    time: "2 hours ago",
    type: "resolved",
    actor: "Ambulance Unit",
    location: "Mombasa CBD",
  },
];

function activityStyle(type: ActivityType) {
  switch (type) {
    case "incident":
      return {
        icon: <FaExclamationTriangle />,
        container: "bg-red-100 text-red-700",
        line: "bg-red-200",
      };

    case "dispatch":
      return {
        icon: <FaShieldAlt />,
        container: "bg-blue-100 text-blue-700",
        line: "bg-blue-200",
      };

    case "case":
      return {
        icon: <FaFileAlt />,
        container: "bg-purple-100 text-purple-700",
        line: "bg-purple-200",
      };

    case "evidence":
      return {
        icon: <FaFileAlt />,
        container: "bg-cyan-100 text-cyan-700",
        line: "bg-cyan-200",
      };

    case "user":
      return {
        icon: <FaUserPlus />,
        container: "bg-emerald-100 text-emerald-700",
        line: "bg-emerald-200",
      };

    case "notification":
      return {
        icon: <FaBell />,
        container: "bg-orange-100 text-orange-700",
        line: "bg-orange-200",
      };

    case "vehicle":
      return {
        icon: <FaCarSide />,
        container: "bg-indigo-100 text-indigo-700",
        line: "bg-indigo-200",
      };

    case "resolved":
      return {
        icon: <FaCheckCircle />,
        container: "bg-emerald-100 text-emerald-700",
        line: "bg-emerald-200",
      };

    default:
      return {
        icon: <FaFire />,
        container: "bg-slate-100 text-slate-700",
        line: "bg-slate-200",
      };
  }
}

export default function RecentActivity({
  activities = defaultActivities,
  loading = false,
  title = "Recent Activity",
  description = "Latest system, agency and emergency operations activity.",
  maxItems = 8,
  onViewAll,
}: RecentActivityProps) {
  const visibleActivities = activities.slice(0, maxItems);

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div>
          <h2 className="text-xl font-bold text-slate-950">
            {title}
          </h2>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            {description}
          </p>
        </div>

        {onViewAll && (
          <button
            type="button"
            onClick={onViewAll}
            className="w-fit rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
          >
            View All
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-5 p-5 sm:p-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="flex items-start gap-4"
            >
              <div className="h-11 w-11 animate-pulse rounded-xl bg-slate-200" />

              <div className="flex-1">
                <div className="h-4 w-2/3 animate-pulse rounded bg-slate-200" />
                <div className="mt-3 h-3 w-full animate-pulse rounded bg-slate-100" />
                <div className="mt-2 h-3 w-1/3 animate-pulse rounded bg-slate-100" />
              </div>
            </div>
          ))}
        </div>
      ) : visibleActivities.length === 0 ? (
        <div className="p-10 text-center text-slate-500">
          No recent activity is available.
        </div>
      ) : (
        <div className="p-5 sm:p-6">
          <div className="space-y-0">
            {visibleActivities.map((activity, index) => {
              const style = activityStyle(activity.type);
              const isLast = index === visibleActivities.length - 1;

              return (
                <div
                  key={activity.id}
                  className="relative flex gap-4"
                >
                  <div className="relative flex shrink-0 flex-col items-center">
                    <div
                      className={`z-10 flex h-11 w-11 items-center justify-center rounded-xl text-lg ${style.container}`}
                    >
                      {activity.icon ?? style.icon}
                    </div>

                    {!isLast && (
                      <div
                        className={`absolute top-11 h-[calc(100%-20px)] w-0.5 ${style.line}`}
                      />
                    )}
                  </div>

                  <div
                    className={`min-w-0 flex-1 ${
                      isLast ? "pb-0" : "pb-7"
                    }`}
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h3 className="font-bold text-slate-950">
                          {activity.title}
                        </h3>

                        {activity.description && (
                          <p className="mt-1 text-sm leading-6 text-slate-500">
                            {activity.description}
                          </p>
                        )}
                      </div>

                      <span className="shrink-0 text-xs font-semibold text-slate-400">
                        {activity.time}
                      </span>
                    </div>

                    {(activity.actor || activity.location) && (
                      <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
                        {activity.actor && (
                          <span className="rounded-full bg-slate-100 px-3 py-1 font-semibold">
                            {activity.actor}
                          </span>
                        )}

                        {activity.location && (
                          <span className="rounded-full bg-slate-100 px-3 py-1 font-semibold">
                            📍 {activity.location}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="border-t border-slate-100 bg-slate-50 px-5 py-4 sm:px-6">
        <p className="text-xs leading-5 text-slate-500">
          Activity items currently use demonstration data. Firestore audit logs,
          emergency reports, dispatches and system events will provide the live
          feed later.
        </p>
      </div>
    </section>
  );
}