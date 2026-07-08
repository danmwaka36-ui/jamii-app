import {
  FaBell,
  FaChartLine,
  FaClock,
  FaMapMarkedAlt,
  FaTasks,
} from "react-icons/fa";

type Stat = {
  title: string;
  value: string;
};

type Props = {
  title: string;
  subtitle: string;
  roleColor: string;
  stats: Stat[];
  focusItems: string[];
};

export default function RoleDashboard({
  title,
  subtitle,
  roleColor,
  stats,
  focusItems,
}: Props) {
  return (
    <div className="min-h-screen bg-slate-50 p-8 space-y-6">

      {/* Header */}
      <div className="rounded-3xl bg-slate-950 p-8 text-white shadow-lg">
        <h1 className="text-4xl font-extrabold">{title}</h1>

        <p className="mt-3 text-slate-300">
          {subtitle}
        </p>
      </div>

      {/* Statistics */}
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => (
          <div
            key={item.title}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <p className="text-sm text-slate-500">
              {item.title}
            </p>

            <p className={`mt-3 text-3xl font-extrabold ${roleColor}`}>
              {item.value}
            </p>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">

        {/* Work Queue */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <h2 className="flex items-center gap-3 text-xl font-bold text-slate-950">
            <FaTasks />
            Live Work Queue
          </h2>

          <div className="mt-6 space-y-4">

            {focusItems.map((item) => (

              <div
                key={item}
                className="flex items-center justify-between rounded-xl border border-slate-100 p-4 hover:bg-slate-50"
              >
                <div>
                  <p className="font-bold text-slate-900">
                    {item}
                  </p>

                  <p className="text-sm text-slate-500">
                    Awaiting assignment and status update
                  </p>
                </div>

                <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-700">
                  Pending
                </span>
              </div>

            ))}

          </div>

        </div>

        {/* Sidebar */}
        <aside className="space-y-5">

          {/* GIS */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <h2 className="flex items-center gap-3 font-bold text-slate-950">
              <FaMapMarkedAlt />
              GIS Command Centre
            </h2>

            <div className="mt-5 flex h-56 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-100 via-slate-100 to-emerald-100 text-center font-bold text-slate-700">
              Live GIS Map will be connected here
            </div>

          </div>

          {/* Notifications */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <h2 className="flex items-center gap-3 font-bold text-slate-950">
              <FaBell />
              Notifications
            </h2>

            <p className="mt-4 text-sm leading-6 text-slate-600">
              Incoming incidents, dispatch updates and system alerts will
              appear here in real time.
            </p>

          </div>

          {/* Analytics */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <h2 className="flex items-center gap-3 font-bold text-slate-950">
              <FaChartLine />
              Performance Analytics
            </h2>

            <p className="mt-4 text-sm leading-6 text-slate-600">
              Firestore analytics, response trends, workload and performance
              charts will appear here.
            </p>

          </div>

          {/* Status */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <h2 className="flex items-center gap-3 font-bold text-slate-950">
              <FaClock />
              System Status
            </h2>

            <div className="mt-4 flex items-center gap-3">
              <span className="h-3 w-3 rounded-full bg-emerald-500"></span>

              <span className="font-semibold text-emerald-700">
                Operational
              </span>
            </div>

            <p className="mt-3 text-sm text-slate-600">
              This dashboard is connected to the Jamii App platform and is
              ready for live emergency operations.
            </p>

          </div>

        </aside>

      </div>

    </div>
  );
}