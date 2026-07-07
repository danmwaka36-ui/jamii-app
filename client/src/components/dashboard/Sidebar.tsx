import {
  FaHome,
  FaPlusSquare,
  FaListAlt,
  FaBell,
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaUsers,
  FaUserCog,
  FaQuestionCircle,
  FaShieldAlt,
} from "react-icons/fa";

import SidebarItem from "./SidebarItem";

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 h-screen w-72 bg-slate-950 text-white flex flex-col border-r border-slate-800">
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-blue-600 flex items-center justify-center">
            <FaShieldAlt className="text-2xl" />
          </div>

          <div>
            <h1 className="text-2xl font-bold">Jamii App</h1>
            <p className="text-sm text-slate-400">Citizen Dashboard</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        <SidebarItem to="/dashboard" icon={<FaHome />} label="Dashboard" />
        <SidebarItem to="/dashboard/report" icon={<FaPlusSquare />} label="Report Emergency" />
        <SidebarItem to="/dashboard/reports" icon={<FaListAlt />} label="My Reports" />
        <SidebarItem to="/dashboard/alerts" icon={<FaBell />} label="Alerts & Notices" badge="7" />
        <SidebarItem to="/dashboard/contacts" icon={<FaPhoneAlt />} label="Emergency Contacts" />
        <SidebarItem to="/dashboard/safe-zones" icon={<FaMapMarkerAlt />} label="Safe Zones" />
        <SidebarItem to="/dashboard/community" icon={<FaUsers />} label="Community" />
        <SidebarItem to="/dashboard/profile" icon={<FaUserCog />} label="Profile Settings" />
        <SidebarItem to="/dashboard/help" icon={<FaQuestionCircle />} label="Help & Support" />
      </nav>

      <div className="p-5">
        <div className="rounded-2xl border border-slate-700 bg-slate-900 p-5">
          <p className="font-semibold">In an emergency?</p>
          <p className="text-sm text-slate-400 mt-1">Get help immediately</p>

          <button className="mt-4 w-full rounded-xl bg-red-600 py-3 font-bold hover:bg-red-700">
            📞 Quick SOS
          </button>
        </div>

        <p className="text-xs text-slate-500 mt-8">
          © 2026 Jamii App
        </p>
      </div>
    </aside>
  );
}