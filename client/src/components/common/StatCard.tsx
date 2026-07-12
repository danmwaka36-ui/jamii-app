import type { ReactNode } from "react";
import {
  FaArrowDown,
  FaArrowRight,
  FaArrowUp,
  FaChartBar,
} from "react-icons/fa";

type StatCardColor =
  | "blue"
  | "red"
  | "green"
  | "purple"
  | "orange"
  | "amber"
  | "cyan"
  | "indigo"
  | "slate";

type TrendDirection = "up" | "down" | "neutral";

type StatCardProps = {
  title?: string;
  label?: string;
  value: string | number;
  icon?: ReactNode;
  color?: StatCardColor;
  description?: string;
  trend?: string;
  trendDirection?: TrendDirection;
  loading?: boolean;
  onClick?: () => void;
};

const colorClasses: Record<
  StatCardColor,
  {
    icon: string;
    border: string;
    value: string;
  }
> = {
  blue: {
    icon: "bg-blue-100 text-blue-700",
    border: "hover:border-blue-200",
    value: "text-blue-700",
  },
  red: {
    icon: "bg-red-100 text-red-700",
    border: "hover:border-red-200",
    value: "text-red-700",
  },
  green: {
    icon: "bg-emerald-100 text-emerald-700",
    border: "hover:border-emerald-200",
    value: "text-emerald-700",
  },
  purple: {
    icon: "bg-purple-100 text-purple-700",
    border: "hover:border-purple-200",
    value: "text-purple-700",
  },
  orange: {
    icon: "bg-orange-100 text-orange-700",
    border: "hover:border-orange-200",
    value: "text-orange-700",
  },
  amber: {
    icon: "bg-amber-100 text-amber-700",
    border: "hover:border-amber-200",
    value: "text-amber-700",
  },
  cyan: {
    icon: "bg-cyan-100 text-cyan-700",
    border: "hover:border-cyan-200",
    value: "text-cyan-700",
  },
  indigo: {
    icon: "bg-indigo-100 text-indigo-700",
    border: "hover:border-indigo-200",
    value: "text-indigo-700",
  },
  slate: {
    icon: "bg-slate-100 text-slate-700",
    border: "hover:border-slate-300",
    value: "text-slate-900",
  },
};

const trendClasses: Record<
  TrendDirection,
  {
    text: string;
    icon: ReactNode;
  }
> = {
  up: {
    text: "text-emerald-700",
    icon: <FaArrowUp />,
  },
  down: {
    text: "text-red-700",
    icon: <FaArrowDown />,
  },
  neutral: {
    text: "text-slate-500",
    icon: <FaArrowRight />,
  },
};

export default function StatCard({
  title,
  label,
  value,
  icon,
  color = "blue",
  description,
  trend,
  trendDirection = "neutral",
  loading = false,
  onClick,
}: StatCardProps) {
  const displayTitle = title || label || "Statistic";
  const displayIcon = icon || <FaChartBar />;

  const colors = colorClasses[color];
  const trendStyle = trendClasses[trendDirection];

  const content = (
    <>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-slate-500">
            {displayTitle}
          </p>

          {loading ? (
            <div className="mt-3 h-10 w-24 animate-pulse rounded-lg bg-slate-200" />
          ) : (
            <h2
              className={`mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl ${colors.value}`}
            >
              {value}
            </h2>
          )}
        </div>

        <div
          className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-2xl ${colors.icon}`}
        >
          {displayIcon}
        </div>
      </div>

      {(trend || description) && (
        <div className="mt-5 border-t border-slate-100 pt-4">
          {trend && (
            <div
              className={`flex items-center gap-2 text-sm font-bold ${trendStyle.text}`}
            >
              <span className="text-xs">{trendStyle.icon}</span>
              <span>{trend}</span>
            </div>
          )}

          {description && (
            <p className="mt-2 text-sm leading-6 text-slate-500">
              {description}
            </p>
          )}
        </div>
      )}
    </>
  );

  const className = `
    w-full
    rounded-2xl
    border
    border-slate-200
    bg-white
    p-5
    shadow-sm
    transition-all
    duration-300
    ${colors.border}
    ${
      onClick
        ? "cursor-pointer hover:-translate-y-1 hover:shadow-lg"
        : ""
    }
  `;

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={className}
      >
        {content}
      </button>
    );
  }

  return <article className={className}>{content}</article>;
}