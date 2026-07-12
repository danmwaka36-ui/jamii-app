import { Link, useLocation } from "react-router-dom";
import {
  FaBuilding,
  FaChartLine,
  FaChartPie,
  FaClipboardList,
  FaCog,
  FaExclamationTriangle,
  FaMapMarkedAlt,
  FaShieldAlt,
  FaSignOutAlt,
  FaTimes,
  FaUsers,
  FaUserShield,
} from "react-icons/fa";

import { logoutUser } from "../../services/authService";

type AdminSidebarProps = {
  mobileOpen: boolean;
  onClose: () => void;
};

const menuItems = [
  { label: "Dashboard", path: "/admin", icon: <FaChartPie /> },
  { label: "User Management", path: "/admin/users", icon: <FaUsers /> },
  { label: "Role Management", path: "/admin/roles", icon: <FaUserShield /> },
  {
    label: "Emergency Management",
    path: "/admin/emergencies",
    icon: <FaExclamationTriangle />,
  },
  {
    label: "Agency Management",
    path: "/admin/agencies",
    icon: <FaBuilding />,
  },
  {
    label: "GIS Command Centre",
    path: "/admin/gis",
    icon: <FaMapMarkedAlt />,
  },
  {
    label: "System Analytics",
    path: "/admin/analytics",
    icon: <FaChartLine />,
  },
  {
    label: "Audit Logs",
    path: "/admin/audit-logs",
    icon: <FaClipboardList />,
  },
  {
    label: "Settings",
    path: "/admin/settings",
    icon: <FaCog />,
  },
];

export default function AdminSidebar({
  mobileOpen,
  onClose,
}: AdminSidebarProps) {
  const location = useLocation();

  async function handleLogout() {
    try {
      await logoutUser();
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close admin navigation"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-screen w-72 flex-col border-r border-slate-800 bg-slate-950 text-white shadow-2xl transition-transform duration-300 ease-in-out lg:translate-x-0 lg:shadow-none ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-slate-800 p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-purple-600 shadow-lg shadow-purple-950/40">
              <FaShieldAlt className="text-2xl" />
            </div>

            <div>
              <h1 className="text-2xl font-bold">Jamii Admin</h1>
              <p className="text-sm text-slate-400">Control Centre</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close sidebar"
            className="rounded-xl p-3 text-slate-300 transition hover:bg-slate-800 hover:text-white lg:hidden"
          >
            <FaTimes />
          </button>
        </div>

        <nav
          onClick={onClose}
          className="flex-1 space-y-2 overflow-y-auto px-4 py-5"
        >
          {menuItems.map((item) => {
            const active =
              location.pathname === item.path ||
              (item.path !== "/admin" &&
                location.pathname.startsWith(`${item.path}/`));

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                  active
                    ? "bg-purple-600 text-white shadow-lg shadow-purple-950/40"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-slate-800 p-4">
          <div className="rounded-2xl border border-purple-800 bg-purple-950/30 p-4">
            <p className="font-semibold">Admin Access</p>

            <p className="mt-2 text-sm leading-6 text-purple-200">
              Manage users, roles, agencies, incidents and system operations.
            </p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 py-3 font-bold text-white transition hover:bg-red-700"
          >
            <FaSignOutAlt />
            Logout
          </button>

          <p className="mt-5 text-center text-xs text-slate-500">
            © 2026 Jamii App Admin
          </p>
        </div>
      </aside>
    </>
  );
}