import { Link, useLocation } from "react-router-dom";
import {
  FaChartPie,
  FaUsers,
  FaUserShield,
  FaExclamationTriangle,
  FaBuilding,
  FaChartLine,
  FaClipboardList,
  FaCog,
  FaSignOutAlt,
  FaShieldAlt,
} from "react-icons/fa";

import { logoutUser } from "../../services/authService";

const menuItems = [
  { label: "Dashboard", path: "/admin", icon: <FaChartPie /> },
  { label: "User Management", path: "/admin/users", icon: <FaUsers /> },
  { label: "Role Management", path: "/admin/roles", icon: <FaUserShield /> },
  { label: "Emergency Management", path: "/admin/emergencies", icon: <FaExclamationTriangle /> },
  { label: "Agency Management", path: "/admin/agencies", icon: <FaBuilding /> },
  { label: "System Analytics", path: "/admin/analytics", icon: <FaChartLine /> },
  { label: "Audit Logs", path: "/admin/audit-logs", icon: <FaClipboardList /> },
  { label: "Settings", path: "/admin/settings", icon: <FaCog /> },
];

export default function AdminSidebar() {
  const location = useLocation();

  async function handleLogout() {
    await logoutUser();
    window.location.href = "/login";
  }

  return (
    <aside className="fixed left-0 top-0 h-screen w-72 bg-slate-950 text-white flex flex-col border-r border-slate-800">
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-purple-600 flex items-center justify-center">
            <FaShieldAlt className="text-2xl" />
          </div>

          <div>
            <h1 className="text-2xl font-bold">Jamii Admin</h1>
            <p className="text-sm text-slate-400">Control Centre</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        {menuItems.map((item) => {
          const active = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                active
                  ? "bg-purple-600 text-white shadow-lg shadow-purple-900/30"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-5">
        <div className="rounded-2xl border border-purple-800 bg-purple-950/40 p-5">
          <p className="font-semibold">Admin Access</p>
          <p className="mt-1 text-sm text-purple-200">
            Manage users, roles and emergency operations.
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 py-3 font-bold text-white hover:bg-red-700"
        >
          <FaSignOutAlt />
          Logout
        </button>

        <p className="text-xs text-slate-500 mt-8">
          © 2026 Jamii App Admin
        </p>
      </div>
    </aside>
  );
}