import { Link, useLocation } from "react-router-dom";
import {
  FaBroadcastTower,
  FaCarSide,
  FaChartLine,
  FaChartPie,
  FaClipboardList,
  FaComments,
  FaCog,
  FaExclamationTriangle,
  FaFileAlt,
  FaFingerprint,
  FaMapMarkedAlt,
  FaShieldAlt,
  FaSignOutAlt,
  FaUserShield,
} from "react-icons/fa";

import { logoutUser } from "../../services/authService";

const menuItems = [
  {
    label: "Dashboard",
    path: "/police",
    icon: <FaChartPie />,
  },
  {
    label: "Active Incidents",
    path: "/police/incidents",
    icon: <FaExclamationTriangle />,
  },
  {
    label: "Dispatch Centre",
    path: "/police/dispatch",
    icon: <FaBroadcastTower />,
  },
  {
    label: "Police Officers",
    path: "/police/officers",
    icon: <FaUserShield />,
  },
  {
    label: "Patrol Vehicles",
    path: "/police/vehicles",
    icon: <FaCarSide />,
  },
  {
    label: "Live GIS Map",
    path: "/police/gis",
    icon: <FaMapMarkedAlt />,
  },
  {
    label: "Case Management",
    path: "/police/cases",
    icon: <FaFileAlt />,
  },
  {
    label: "Evidence Management",
    path: "/police/evidence",
    icon: <FaFingerprint />,
  },
  {
    label: "Crime Analytics",
    path: "/police/crime-analytics",
    icon: <FaChartLine />,
  },
  {
    label: "Station Communication",
    path: "/police/communication",
    icon: <FaComments />,
  },
  {
    label: "Incident Reports",
    path: "/police/reports",
    icon: <FaClipboardList />,
  },
  {
    label: "Performance Analytics",
    path: "/police/analytics",
    icon: <FaChartLine />,
  },
  {
    label: "Settings",
    path: "/police/settings",
    icon: <FaCog />,
  },
];

export default function PoliceSidebar() {
  const location = useLocation();

  async function handleLogout() {
    await logoutUser();
    window.location.href = "/login";
  }

  return (
    <aside className="fixed left-0 top-0 z-50 flex h-screen w-72 flex-col border-r border-blue-900 bg-slate-950 text-white">
      <div className="border-b border-slate-800 p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600">
            <FaShieldAlt className="text-2xl" />
          </div>

          <div>
            <h1 className="text-2xl font-bold">Police Command</h1>
            <p className="text-sm text-slate-400">
              Operations Centre
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-2 overflow-y-auto px-4 py-6">
        {menuItems.map((item) => {
          const active =
            location.pathname === item.path ||
            (item.path !== "/police" &&
              location.pathname.startsWith(`${item.path}/`));

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                active
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-950/40"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-800 p-5">
        <div className="rounded-2xl border border-blue-800 bg-blue-950/30 p-5">
          <p className="font-semibold">Police Operations</p>

          <p className="mt-2 text-sm leading-6 text-blue-200">
            Coordinate incidents, patrols, investigations, evidence,
            communication and public safety response.
          </p>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 py-3 font-bold text-white transition hover:bg-red-700"
        >
          <FaSignOutAlt />
          Logout
        </button>

        <p className="mt-8 text-center text-xs text-slate-500">
          © 2026 Jamii Police Operations
        </p>
      </div>
    </aside>
  );
}