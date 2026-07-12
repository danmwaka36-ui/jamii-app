import {
  FaBars,
  FaBell,
  FaCalendarAlt,
  FaSearch,
  FaUserCircle,
} from "react-icons/fa";

type TopbarProps = {
  onMenuClick: () => void;
};

export default function Topbar({
  onMenuClick,
}: TopbarProps) {
  const today = new Date().toLocaleDateString("en-KE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <header className="fixed top-0 left-0 right-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-md lg:left-72">
      <div className="flex h-20 items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* Left */}
        <div className="flex items-center gap-4">

          <button
            onClick={onMenuClick}
            className="rounded-xl p-3 text-slate-700 hover:bg-slate-100 lg:hidden"
          >
            <FaBars className="text-xl" />
          </button>

          <div>
            <h1 className="text-xl font-bold text-slate-900">
              Citizen Dashboard
            </h1>

            <p className="hidden text-sm text-slate-500 sm:block">
              Welcome back to Jamii Emergency Response
            </p>
          </div>

        </div>

        {/* Center Search */}
        <div className="hidden xl:flex xl:w-[420px]">
          <div className="flex w-full items-center rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">

            <FaSearch className="text-slate-400" />

            <input
              type="text"
              placeholder="Search reports, alerts, contacts..."
              className="ml-3 w-full bg-transparent outline-none"
            />

          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-3">

          {/* Date */}
          <div className="hidden rounded-xl bg-slate-100 px-4 py-2 lg:flex lg:items-center lg:gap-2">

            <FaCalendarAlt className="text-blue-600" />

            <span className="text-sm font-medium text-slate-700">
              {today}
            </span>

          </div>

          {/* Notification */}
          <button className="relative rounded-xl bg-slate-100 p-3 hover:bg-slate-200">

            <FaBell className="text-lg text-slate-700" />

            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white">
              7
            </span>

          </button>

          {/* System Status */}
          <div className="hidden items-center gap-2 rounded-xl bg-emerald-100 px-4 py-2 md:flex">

            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></span>

            <span className="text-sm font-semibold text-emerald-700">
              Online
            </span>

          </div>

          {/* User */}
          <div className="flex items-center gap-3 rounded-2xl bg-slate-100 px-3 py-2">

            <FaUserCircle className="text-4xl text-blue-600" />

            <div className="hidden sm:block">
              <h3 className="font-bold text-slate-900">
                Citizen
              </h3>

              <p className="text-xs text-slate-500">
                Emergency User
              </p>
            </div>

          </div>

        </div>

      </div>
    </header>
  );
}