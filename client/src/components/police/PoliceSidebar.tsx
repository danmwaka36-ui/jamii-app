import { Link, useLocation } from "react-router-dom";
import {
  FaCar,
  FaChartBar,
  FaChartLine,
  FaComments,
  FaCog,
  FaExclamationTriangle,
  FaFileAlt,
  FaFolderOpen,
  FaMapMarkedAlt,
  FaShieldAlt,
  FaSignOutAlt,
  FaTimes,
  FaUserShield,
  FaUsers,
} from "react-icons/fa";

import { logoutUser } from "../../services/authService";

type PoliceSidebarProps = {
  mobileOpen: boolean;
  onClose: () => void;
};

const menuItems = [
  {
    label: "Dashboard",
    path: "/police",
    icon: <FaChartBar />,
  },
  {
    label: "Active Incidents",
    path: "/police/incidents",
    icon: <FaExclamationTriangle />,
  },
  {
    label: "Dispatch Centre",
    path: "/police/dispatch",
    icon: <FaShieldAlt />,
  },
  {
    label: "Officers",
    path: "/police/officers",
    icon: <FaUsers />,
  },
  {
    label: "Patrol Vehicles",
    path: "/police/vehicles",
    icon: <FaCar />,
  },
  {
    label: "Live GIS Map",
    path: "/police/gis",
    icon: <FaMapMarkedAlt />,
  },
  {
    label: "Case Management",
    path: "/police/cases",
    icon: <FaFolderOpen />,
  },
  {
    label: "Evidence Management",
    path: "/police/evidence",
    icon: <FaFileAlt />,
  },
  {
    label: "Crime Analytics",
    path: "/police/crimeanalytics",
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
    icon: <FaFileAlt />,
  },
  {
    label: "Analytics",
    path: "/police/analytics",
    icon: <FaChartBar />,
  },
  {
    label: "Settings",
    path: "/police/settings",
    icon: <FaCog />,
  },
];

export default function PoliceSidebar({
  mobileOpen,
  onClose,
}: PoliceSidebarProps) {
  const location = useLocation();

  async function handleLogout() {
    await logoutUser();
    window.location.href = "/login";
  }

  return (
    <>
      {mobileOpen && (
        <button
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-screen w-72 flex-col border-r border-slate-800 bg-slate-950 text-white shadow-2xl transition-transform duration-300 lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}

        <div className="flex items-center justify-between border-b border-slate-800 p-6">

          <div className="flex items-center gap-3">

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600">
              <FaShieldAlt className="text-2xl" />
            </div>

            <div>
              <h1 className="text-xl font-bold">
                Police
              </h1>

              <p className="text-sm text-slate-400">
                Command Centre
              </p>
            </div>

          </div>

          <button
            onClick={onClose}
            className="rounded-xl p-2 hover:bg-slate-800 lg:hidden"
          >
            <FaTimes />
          </button>

        </div>

        {/* Menu */}

        <nav
          onClick={onClose}
          className="flex-1 overflow-y-auto px-4 py-5 space-y-2"
        >
          {menuItems.map((item) => {
            const active =
              location.pathname === item.path ||
              location.pathname.startsWith(item.path + "/");

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 transition ${
                  active
                    ? "bg-blue-600 text-white shadow-lg"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <span className="text-lg">
                  {item.icon}
                </span>

                <span className="font-medium">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}

        <div className="border-t border-slate-800 p-5">

          <div className="rounded-2xl bg-blue-950/30 border border-blue-900 p-4">

            <div className="flex items-center gap-2">

              <FaUserShield className="text-blue-400" />

              <h3 className="font-bold">
                Police Access
              </h3>

            </div>

            <p className="mt-3 text-sm leading-6 text-slate-300">
              Police Command Centre for incident response,
              investigations and patrol management.
            </p>

          </div>

          <button
            onClick={handleLogout}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 py-3 font-bold hover:bg-red-700"
          >
            <FaSignOutAlt />

            Logout
          </button>

          <p className="mt-5 text-center text-xs text-slate-500">
            © 2026 Jamii Police
          </p>

        </div>
      </aside>
    </>
  );
}