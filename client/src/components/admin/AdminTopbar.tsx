import { FaBell, FaSearch, FaUserShield } from "react-icons/fa";
import { useAuth } from "../../auth/AuthContext";

export default function AdminTopbar() {
  const { userProfile } = useAuth();

  const displayName = userProfile?.fullName || "Admin User";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <header className="fixed left-72 right-0 top-0 z-40 h-20 border-b border-slate-200 bg-white px-8 flex items-center justify-between">
      <div>
        <h1 className="text-xl font-bold text-slate-950">
          Admin Control Centre
        </h1>
        <p className="text-sm text-slate-500">
          System management, users, roles and emergency operations
        </p>
      </div>

      <div className="hidden md:flex items-center gap-3 w-96 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
        <FaSearch className="text-slate-400" />
        <input
          type="text"
          placeholder="Search users, reports, agencies..."
          className="bg-transparent outline-none w-full text-sm"
        />
      </div>

      <div className="flex items-center gap-6">
        <div className="relative text-slate-600 text-xl">
          <FaBell />
          <span className="absolute -top-3 -right-3 bg-red-600 text-white text-xs h-5 w-5 rounded-full flex items-center justify-center">
            9
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-full bg-purple-700 text-white flex items-center justify-center font-bold">
            {initial}
          </div>

          <div className="hidden md:block">
            <p className="font-bold text-slate-900">{displayName}</p>
            <p className="flex items-center gap-2 text-sm text-purple-700 font-semibold">
              <FaUserShield />
              Admin
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}