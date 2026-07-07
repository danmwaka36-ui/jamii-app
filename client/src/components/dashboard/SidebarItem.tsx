import { Link, useLocation } from "react-router-dom";
import type { ReactNode } from "react";

type SidebarItemProps = {
  to: string;
  icon: ReactNode;
  label: string;
  badge?: string;
};

export default function SidebarItem({
  to,
  icon,
  label,
  badge,
}: SidebarItemProps) {
  const location = useLocation();

  const active = location.pathname === to;

  return (
    <Link
      to={to}
      className={`flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition ${
        active
          ? "bg-blue-600 text-white shadow-lg shadow-blue-900/30"
          : "text-slate-300 hover:bg-slate-800 hover:text-white"
      }`}
    >
      <span className="flex items-center gap-3">
        <span className="text-lg">{icon}</span>
        {label}
      </span>

      {badge && (
        <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs text-white">
          {badge}
        </span>
      )}
    </Link>
  );
}