import type { ReactNode } from "react";

import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  FaAmbulance,
  FaBell,
  FaBoxes,
  FaChartLine,
  FaCog,
  FaComments,
  FaFileMedicalAlt,
  FaFirstAid,
  FaHome,
  FaMapMarkedAlt,
  FaSignOutAlt,
  FaTimes,
  FaTint,
  FaTruck,
  FaUserFriends,
  FaWarehouse,
} from "react-icons/fa";

import { logoutUser } from "../../services/authService";
import { useAuth } from "../../auth/AuthContext";

type RedCrossSidebarProps = {
  mobileOpen: boolean;
  onClose: () => void;
};

type MenuItem = {
  label: string;
  path: string;
  icon: ReactNode;
};

const menuItems: MenuItem[] = [
  {
    label: "Dashboard",
    path: "/redcross",
    icon: <FaHome />,
  },
  {
    label: "Emergency Incidents",
    path: "/redcross/incidents",
    icon: <FaBell />,
  },
  {
    label: "Dispatch Centre",
    path: "/redcross/dispatch",
    icon: <FaAmbulance />,
  },
  {
    label: "Volunteers & Responders",
    path: "/redcross/responders",
    icon: <FaUserFriends />,
  },
  {
    label: "Ambulances & Rescue Vehicles",
    path: "/redcross/vehicles",
    icon: <FaTruck />,
  },
  {
    label: "Medical Support",
    path: "/redcross/medical",
    icon: <FaFirstAid />,
  },
  {
    label: "Shelters & Relief Centres",
    path: "/redcross/shelters",
    icon: <FaWarehouse />,
  },
  {
    label: "Relief Inventory",
    path: "/redcross/inventory",
    icon: <FaBoxes />,
  },
  {
    label: "Blood Coordination",
    path: "/redcross/blood",
    icon: <FaTint />,
  },
  {
    label: "Live GIS Map",
    path: "/redcross/gis",
    icon: <FaMapMarkedAlt />,
  },
  {
    label: "Assessments & Reports",
    path: "/redcross/reports",
    icon: <FaFileMedicalAlt />,
  },
  {
    label: "Team Communication",
    path: "/redcross/communication",
    icon: <FaComments />,
  },
  {
    label: "Humanitarian Analytics",
    path: "/redcross/analytics",
    icon: <FaChartLine />,
  },
];

export default function RedCrossSidebar({
  mobileOpen,
  onClose,
}: RedCrossSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const { currentUser, userProfile } = useAuth();

  const displayName =
    userProfile?.fullName ||
    currentUser?.displayName ||
    currentUser?.email ||
    "Red Cross User";

  const roleLabel =
    userProfile?.role === "redcross"
      ? "Response Coordinator"
      : userProfile?.role || "Humanitarian User";

  function isActive(path: string) {
    if (path === "/redcross") {
      return location.pathname === "/redcross";
    }

    return location.pathname.startsWith(path);
  }

  async function handleLogout() {
    try {
      await logoutUser();

      onClose();

      navigate("/login", {
        replace: true,
      });
    } catch (error) {
      console.error(
        "Red Cross logout failed:",
        error
      );
    }
  }

  return (
    <>
      {/* MOBILE BACKDROP */}
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close Red Cross navigation"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* SIDEBAR */}
      <aside
        aria-label="Kenya Red Cross navigation"
        className={`fixed left-0 top-0 z-50 flex h-screen w-72 flex-col overflow-hidden border-r border-slate-800 bg-slate-950 text-white shadow-2xl transition-transform duration-300 ${
          mobileOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* BRANDING */}
        <div className="shrink-0 border-b border-slate-800 bg-white px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <Link
              to="/redcross"
              onClick={onClose}
              className="flex min-w-0 flex-1 items-center gap-3"
            >
              <div className="flex h-14 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white">
                <img
                  src="/branding/kenya-red-cross-logo.png"
                  alt="Kenya Red Cross Society"
                  className="h-full w-full object-contain"
                />
              </div>

              <div className="min-w-0">
                <h1 className="truncate text-base font-extrabold text-slate-950">
                  Kenya Red Cross
                </h1>

                <p className="mt-1 text-[11px] font-semibold leading-4 text-red-700">
                  Emergency Operations Centre
                </p>
              </div>
            </Link>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close menu"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 lg:hidden"
            >
              <FaTimes />
            </button>
          </div>
        </div>

        {/* RESPONSE NETWORK */}
        <div className="shrink-0 border-b border-slate-800 px-3 py-2.5">
          <div className="rounded-xl border border-red-900/50 bg-red-950/40 px-3 py-2.5">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-red-300">
                  Response Network
                </p>

                <p className="mt-1 truncate text-xs font-extrabold text-white">
                  Active & Connected
                </p>
              </div>

              <span className="relative flex h-3 w-3 shrink-0">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />

                <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500" />
              </span>
            </div>
          </div>
        </div>

        {/* SCROLLABLE MENU */}
        <nav className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-3">
          <p className="mb-2 px-3 text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500">
            Humanitarian Operations
          </p>

          <div className="space-y-1">
            {menuItems.map((item) => {
              const active = isActive(item.path);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  aria-current={
                    active ? "page" : undefined
                  }
                  className={`group flex min-h-[44px] items-center gap-3 rounded-xl px-3 py-2 text-[13px] font-semibold transition ${
                    active
                      ? "bg-red-600 text-white shadow-md shadow-red-950/30"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm ${
                      active
                        ? "bg-white/15 text-white"
                        : "bg-slate-900 text-slate-400 group-hover:bg-slate-700 group-hover:text-white"
                    }`}
                  >
                    {item.icon}
                  </span>

                  <span className="min-w-0 flex-1 leading-4">
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* FIXED FOOTER */}
        <div className="shrink-0 border-t border-slate-800 bg-slate-950 p-3">
          <Link
            to="/redcross/settings"
            onClick={onClose}
            className={`flex items-center gap-3 rounded-xl px-3 py-2 text-[13px] font-semibold transition ${
              location.pathname ===
              "/redcross/settings"
                ? "bg-red-600 text-white"
                : "text-slate-300 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-900">
              <FaCog />
            </span>

            <span>Settings</span>
          </Link>

          {/* LOGGED-IN USER */}
          <div className="mt-2 rounded-xl border border-slate-800 bg-slate-900 p-2.5">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-600 text-white">
                <FaUserFriends />
              </div>

              <div className="min-w-0 flex-1">
                <p
                  title={displayName}
                  className="truncate text-xs font-bold text-white"
                >
                  {displayName}
                </p>

                <p className="mt-0.5 truncate text-[10px] text-slate-400">
                  {roleLabel}
                </p>
              </div>
            </div>
          </div>

          {/* LOGOUT */}
          <button
            type="button"
            onClick={handleLogout}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-red-900 bg-red-950/50 px-4 py-2 text-xs font-bold text-red-200 transition hover:bg-red-600 hover:text-white"
          >
            <FaSignOutAlt />
            Logout
          </button>

          <p className="mt-2 text-center text-[9px] text-slate-600">
            Powered by Jamii Platform
          </p>
        </div>
      </aside>
    </>
  );
}