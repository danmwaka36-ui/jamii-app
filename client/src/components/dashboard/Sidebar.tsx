import {
  FaBell,
  FaHome,
  FaListAlt,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaPlusSquare,
  FaQuestionCircle,
  FaShieldAlt,
  FaSignOutAlt,
  FaTimes,
  FaUserCog,
  FaUsers,
} from "react-icons/fa";

import SidebarItem from "./SidebarItem";
import { logoutUser } from "../../services/authService";

type SidebarProps = {
  mobileOpen: boolean;
  onClose: () => void;
};

export default function Sidebar({
  mobileOpen,
  onClose,
}: SidebarProps) {
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
      {/* Mobile dark overlay */}
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close navigation menu"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-screen w-72 flex-col border-r border-slate-800 bg-slate-950 text-white shadow-2xl transition-transform duration-300 ease-in-out lg:translate-x-0 lg:shadow-none ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand */}
        <div className="flex items-center justify-between border-b border-slate-800 p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-950/40">
              <FaShieldAlt className="text-2xl" />
            </div>

            <div>
              <h1 className="text-2xl font-bold">Jamii App</h1>
              <p className="text-sm text-slate-400">
                Citizen Dashboard
              </p>
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

        {/* Navigation */}
        <nav
          onClick={onClose}
          className="flex-1 space-y-2 overflow-y-auto px-4 py-5"
        >
          <SidebarItem
            to="/dashboard"
            icon={<FaHome />}
            label="Dashboard"
          />

          <SidebarItem
            to="/dashboard/report"
            icon={<FaPlusSquare />}
            label="Report Emergency"
          />

          <SidebarItem
            to="/dashboard/reports"
            icon={<FaListAlt />}
            label="My Reports"
          />

          <SidebarItem
            to="/dashboard/alerts"
            icon={<FaBell />}
            label="Alerts & Notices"
            badge="7"
          />

          <SidebarItem
            to="/dashboard/contacts"
            icon={<FaPhoneAlt />}
            label="Emergency Contacts"
          />

          <SidebarItem
            to="/dashboard/safe-zones"
            icon={<FaMapMarkerAlt />}
            label="Safe Zones"
          />

          <SidebarItem
            to="/dashboard/community"
            icon={<FaUsers />}
            label="Community"
          />

          <SidebarItem
            to="/dashboard/profile"
            icon={<FaUserCog />}
            label="Profile Settings"
          />

          <SidebarItem
            to="/dashboard/help"
            icon={<FaQuestionCircle />}
            label="Help & Support"
          />
        </nav>

        {/* Sidebar footer */}
        <div className="border-t border-slate-800 p-4">
          <div className="rounded-2xl border border-red-900/60 bg-red-950/30 p-4">
            <p className="font-semibold text-white">
              In an emergency?
            </p>

            <p className="mt-1 text-sm text-slate-400">
              Call emergency services immediately.
            </p>

            <a
              href="tel:999"
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 py-3 font-bold text-white transition hover:bg-red-700"
            >
              <FaPhoneAlt />
              Quick SOS
            </a>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 py-3 font-bold text-slate-200 transition hover:border-red-700 hover:bg-red-600 hover:text-white"
          >
            <FaSignOutAlt />
            Logout
          </button>

          <p className="mt-5 text-center text-xs text-slate-500">
            © 2026 Jamii App
          </p>
        </div>
      </aside>
    </>
  );
}