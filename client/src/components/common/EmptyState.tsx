import type { ReactNode } from "react";
import { FaInbox } from "react-icons/fa";

type EmptyStateProps = {
  title?: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
};

export default function EmptyState({
  title = "Nothing to display",
  description = "No records were found.",
  icon,
  action,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-8 py-16 text-center shadow-sm ${className}`}
    >
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 text-4xl text-slate-500">
        {icon ?? <FaInbox />}
      </div>

      <h2 className="mt-6 text-2xl font-bold text-slate-900">
        {title}
      </h2>

      <p className="mt-3 max-w-md text-sm leading-6 text-slate-500">
        {description}
      </p>

      {action && (
        <div className="mt-8">
          {action}
        </div>
      )}
    </div>
  );
}