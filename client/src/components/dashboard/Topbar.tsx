import { FaBell, FaMoon, FaSearch, FaSignOutAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

import { logoutUser } from "../../services/authService";
import { useAuth } from "../../auth/AuthContext";

export default function Topbar() {
  const navigate = useNavigate();
  const { userProfile } = useAuth();

  async function handleLogout() {
    await logoutUser();
    navigate("/login");
  }

  const displayName = userProfile?.fullName || "Jamii User";
  const displayRole = userProfile?.role || "citizen";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <header className="fixed left-72 right-0 top-0 z-40 h-20 border-b border-slate-200 bg-white px-8 flex items-center justify-between">
      <div className="flex items-center gap-5">
        <button className="text-slate-600 text-xl">☰</button>

        <div className="hidden md:flex items-center gap-3 w-96 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
          <FaSearch className="text-slate-400" />

          <input
            type="text"
            placeholder="Search anything..."
            className="bg-transparent outline-none w-full text-sm"
          />

          <span className="text-xs border rounded-md px-2 py-1 text-slate-500">
            Ctrl K
          </span>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative text-slate-600 text-xl">
          <FaBell />

          <span className="absolute -top-3 -right-3 bg-red-600 text-white text-xs h-5 w-5 rounded-full flex items-center justify-center">
            5
          </span>
        </div>

        <FaMoon className="text-slate-600 text-xl" />

        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold">
            {initial}
          </div>

          <div className="hidden md:block">
            <p className="font-bold text-slate-900">
              {displayName}
            </p>

            <p className="text-sm text-slate-500 capitalize">
              {displayRole}
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 text-white px-5 py-3 rounded-xl font-semibold flex items-center gap-2"
        >
          <FaSignOutAlt />
          Logout
        </button>
      </div>
    </header>
  );
}