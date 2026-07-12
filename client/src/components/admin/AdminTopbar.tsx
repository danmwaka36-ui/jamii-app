import {
  FaBars,
  FaBell,
  FaSearch,
  FaShieldAlt,
} from "react-icons/fa";

type AdminTopbarProps = {
  onMenuClick: () => void;
};

export default function AdminTopbar({
  onMenuClick,
}: AdminTopbarProps) {
  return (
    <header className="fixed left-0 right-0 top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-md lg:left-72">
      <div className="flex h-20 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-4">
          <button
            type="button"
            onClick={onMenuClick}
            aria-label="Open admin navigation"
            className="rounded-xl p-3 text-slate-700 transition hover:bg-slate-100 lg:hidden"
          >
            <FaBars className="text-xl" />
          </button>

          <div className="min-w-0">
            <h1 className="truncate text-lg font-bold text-slate-950 sm:text-xl">
              Admin Control Centre
            </h1>

            <p className="hidden text-sm text-slate-500 sm:block">
              System management, users, roles and emergency operations
            </p>
          </div>
        </div>

        <div className="hidden w-full max-w-md items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 xl:flex">
          <FaSearch className="text-slate-400" />

          <input
            type="search"
            placeholder="Search users, reports, agencies..."
            className="w-full bg-transparent text-sm outline-none"
          />
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <button
            type="button"
            aria-label="Admin notifications"
            className="relative rounded-xl bg-slate-100 p-3 transition hover:bg-slate-200"
          >
            <FaBell className="text-lg text-slate-700" />

            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
              9
            </span>
          </button>

          <div className="hidden items-center gap-2 rounded-xl bg-emerald-100 px-4 py-2 md:flex">
            <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-500" />

            <span className="text-sm font-semibold text-emerald-700">
              System Online
            </span>
          </div>

          <div className="flex items-center gap-3 rounded-2xl bg-slate-100 px-3 py-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-600 text-white">
              <FaShieldAlt />
            </div>

            <div className="hidden sm:block">
              <p className="font-bold text-slate-900">Administrator</p>
              <p className="text-xs text-slate-500">Admin</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}