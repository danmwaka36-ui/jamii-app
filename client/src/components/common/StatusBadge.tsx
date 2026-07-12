type StatusType =
  | "active"
  | "inactive"
  | "online"
  | "offline"
  | "busy"
  | "available"
  | "pending"
  | "approved"
  | "rejected"
  | "critical"
  | "high"
  | "medium"
  | "low"
  | "open"
  | "closed"
  | "resolved"
  | "assigned"
  | "dispatched"
  | "completed";

type StatusBadgeProps = {
  status: StatusType | string;
  className?: string;
};

const styles: Record<
  string,
  {
    bg: string;
    dot: string;
    text: string;
  }
> = {
  active: {
    bg: "bg-green-100",
    dot: "bg-green-500",
    text: "text-green-700",
  },

  online: {
    bg: "bg-green-100",
    dot: "bg-green-500",
    text: "text-green-700",
  },

  available: {
    bg: "bg-green-100",
    dot: "bg-green-500",
    text: "text-green-700",
  },

  approved: {
    bg: "bg-green-100",
    dot: "bg-green-500",
    text: "text-green-700",
  },

  completed: {
    bg: "bg-green-100",
    dot: "bg-green-500",
    text: "text-green-700",
  },

  inactive: {
    bg: "bg-slate-100",
    dot: "bg-slate-500",
    text: "text-slate-700",
  },

  offline: {
    bg: "bg-slate-100",
    dot: "bg-slate-500",
    text: "text-slate-700",
  },

  pending: {
    bg: "bg-yellow-100",
    dot: "bg-yellow-500",
    text: "text-yellow-700",
  },

  medium: {
    bg: "bg-yellow-100",
    dot: "bg-yellow-500",
    text: "text-yellow-700",
  },

  busy: {
    bg: "bg-orange-100",
    dot: "bg-orange-500",
    text: "text-orange-700",
  },

  high: {
    bg: "bg-orange-100",
    dot: "bg-orange-500",
    text: "text-orange-700",
  },

  assigned: {
    bg: "bg-blue-100",
    dot: "bg-blue-500",
    text: "text-blue-700",
  },

  dispatched: {
    bg: "bg-blue-100",
    dot: "bg-blue-500",
    text: "text-blue-700",
  },

  open: {
    bg: "bg-blue-100",
    dot: "bg-blue-500",
    text: "text-blue-700",
  },

  resolved: {
    bg: "bg-indigo-100",
    dot: "bg-indigo-500",
    text: "text-indigo-700",
  },

  closed: {
    bg: "bg-indigo-100",
    dot: "bg-indigo-500",
    text: "text-indigo-700",
  },

  rejected: {
    bg: "bg-red-100",
    dot: "bg-red-500",
    text: "text-red-700",
  },

  critical: {
    bg: "bg-red-100",
    dot: "bg-red-500 animate-pulse",
    text: "text-red-700",
  },

  low: {
    bg: "bg-cyan-100",
    dot: "bg-cyan-500",
    text: "text-cyan-700",
  },
};

export default function StatusBadge({
  status,
  className = "",
}: StatusBadgeProps) {
  const key = status.toLowerCase();

  const style = styles[key] || {
    bg: "bg-slate-100",
    dot: "bg-slate-500",
    text: "text-slate-700",
  };

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold capitalize ${style.bg} ${style.text} ${className}`}
    >
      <span
        className={`h-2.5 w-2.5 rounded-full ${style.dot}`}
      />

      {status}
    </span>
  );
}