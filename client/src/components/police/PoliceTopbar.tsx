import { useEffect, useState } from "react";
import {
  FaBell,
  FaClock,
  FaMapMarkerAlt,
  FaSearch,
  FaUserShield,
} from "react-icons/fa";

export default function PoliceTopbar() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <header className="fixed left-72 right-0 top-0 z-40 flex h-20 items-center justify-between border-b border-slate-200 bg-white px-8 shadow-sm">

      {/* Left */}

      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          🚔 Police Operations Centre
        </h1>

        <p className="text-sm text-slate-500">
          Command • Dispatch • Investigation • Patrol
        </p>
      </div>

      {/* Search */}

      <div className="hidden w-[420px] items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 xl:flex">
        <FaSearch className="text-slate-400" />

        <input
          type="text"
          placeholder="Search incidents, officers, vehicles..."
          className="w-full bg-transparent outline-none"
        />
      </div>

      {/* Right */}

      <div className="flex items-center gap-6">

        <div className="hidden items-center gap-2 rounded-xl bg-slate-100 px-4 py-2 lg:flex">
          <FaClock className="text-blue-600" />

          <span className="font-semibold text-slate-700">
            {currentTime.toLocaleTimeString()}
          </span>
        </div>

        <div className="hidden items-center gap-2 lg:flex">
          <FaMapMarkerAlt className="text-red-600" />

          <span className="text-sm font-semibold text-slate-700">
            Mombasa County
          </span>
        </div>

        <button className="relative rounded-xl p-3 hover:bg-slate-100">
          <FaBell className="text-xl text-slate-700" />

          <span className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white">
            4
          </span>
        </button>

        <div className="flex items-center gap-3 border-l border-slate-200 pl-5">

          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-700 text-white">
            <FaUserShield />
          </div>

          <div className="hidden md:block">
            <p className="font-bold text-slate-900">
              Police Commander
            </p>

            <p className="text-sm text-slate-500">
              Online
            </p>
          </div>

        </div>

      </div>

    </header>
  );
}