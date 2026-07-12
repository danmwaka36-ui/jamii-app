import { useState } from "react";
import { Outlet } from "react-router-dom";

import PoliceSidebar from "../../components/police/PoliceSidebar";
import PoliceTopbar from "../../components/police/PoliceTopbar";

export default function PoliceLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  function openSidebar() {
    setSidebarOpen(true);
  }

  function closeSidebar() {
    setSidebarOpen(false);
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <PoliceSidebar
        mobileOpen={sidebarOpen}
        onClose={closeSidebar}
      />

      <PoliceTopbar onMenuClick={openSidebar} />

      <main className="min-h-screen pt-20 transition-all duration-300 lg:ml-72">
        <div className="mx-auto w-full max-w-[1800px] p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}