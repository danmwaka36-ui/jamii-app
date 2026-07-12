import type { ReactNode } from "react";

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  badge?: string;
  badgeColor?:
    | "blue"
    | "green"
    | "red"
    | "orange"
    | "purple"
    | "slate";
  actions?: ReactNode;
};

const badgeClasses = {
  blue: "bg-blue-100 text-blue-700",
  green: "bg-emerald-100 text-emerald-700",
  red: "bg-red-100 text-red-700",
  orange: "bg-orange-100 text-orange-700",
  purple: "bg-purple-100 text-purple-700",
  slate: "bg-slate-100 text-slate-700",
};

export default function PageHeader({
  title,
  subtitle,
  icon,
  badge,
  badgeColor = "blue",
  actions,
}: PageHeaderProps) {
  return (
    <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

      <div className="flex items-start gap-4">

        {icon && (
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-900 text-3xl text-white shadow-lg">
            {icon}
          </div>
        )}

        <div>

          <div className="flex flex-wrap items-center gap-3">

            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              {title}
            </h1>

            {badge && (
              <span
                className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${badgeClasses[badgeColor]}`}
              >
                {badge}
              </span>
            )}

          </div>

          {subtitle && (
            <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
              {subtitle}
            </p>
          )}

        </div>

      </div>

      {actions && (
        <div className="flex flex-wrap items-center gap-3">
          {actions}
        </div>
      )}

    </div>
  );
}