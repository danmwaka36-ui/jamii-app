import {
  FaBars,
  FaSearch,
  FaShieldAlt,
  FaTimes,
} from "react-icons/fa";
import { useState } from "react";

import AdminSearch from "./search/AdminSearch";
import NotificationBell from "./notifications/NotificationBell";

type AdminTopbarProps = {
  onMenuClick: () => void;
};

export default function AdminTopbar({
  onMenuClick,
}: AdminTopbarProps) {
  const [mobileSearchOpen, setMobileSearchOpen] =
    useState(false);

  return (
    <>
      <header className="fixed left-0 right-0 top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-md lg:left-72">
        <div className="flex h-20 items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          {/* Left section */}
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={onMenuClick}
              aria-label="Open admin navigation"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-slate-700 transition hover:bg-slate-100 lg:hidden"
            >
              <FaBars className="text-xl" />
            </button>

            <div className="min-w-0">
              <h1 className="truncate text-base font-extrabold text-slate-950 sm:text-xl">
                Admin Control Centre
              </h1>

              <p className="hidden truncate text-sm text-slate-500 sm:block">
                System management, users, roles and emergency operations
              </p>
            </div>
          </div>

          {/* Desktop global search */}
          <div className="hidden min-w-0 flex-1 justify-center px-5 xl:flex">
            <AdminSearch />
          </div>

          {/* Right section */}
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() =>
                setMobileSearchOpen((current) => !current)
              }
              aria-label={
                mobileSearchOpen
                  ? "Close admin search"
                  : "Open admin search"
              }
              className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition hover:bg-slate-200 xl:hidden"
            >
              {mobileSearchOpen ? (
                <FaTimes />
              ) : (
                <FaSearch />
              )}
            </button>

            <NotificationBell />

            <div className="hidden items-center gap-2 rounded-xl bg-emerald-100 px-4 py-2 md:flex">
              <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-500" />

              <span className="text-sm font-semibold text-emerald-700">
                System Online
              </span>
            </div>

            <div className="flex items-center gap-3 rounded-2xl bg-slate-100 px-2 py-2 sm:px-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-600 text-white shadow-sm">
                <FaShieldAlt />
              </div>

              <div className="hidden sm:block">
                <p className="font-bold text-slate-900">
                  Administrator
                </p>

                <p className="text-xs text-slate-500">
                  Platform Admin
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile and tablet search panel */}
      {mobileSearchOpen && (
        <>
          <button
            type="button"
            aria-label="Close search panel"
            onClick={() => setMobileSearchOpen(false)}
            className="fixed inset-0 top-20 z-30 bg-slate-950/30 backdrop-blur-sm xl:hidden"
          />

          <div className="fixed left-0 right-0 top-20 z-40 border-b border-slate-200 bg-white p-4 shadow-xl lg:left-72 xl:hidden">
            <AdminSearch />
          </div>
        </>
      )}
    </>
  );
}