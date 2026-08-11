import { useState } from "react";
import { Outlet } from "react-router-dom";

import RedCrossSidebar from "../../components/redcross/RedCrossSidebar";
import RedCrossTopbar from "../../components/redcross/RedCrossTopbar";

export default function RedCrossLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  function openSidebar() {
    setSidebarOpen(true);
  }

  function closeSidebar() {
    setSidebarOpen(false);
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <RedCrossSidebar
        mobileOpen={sidebarOpen}
        onClose={closeSidebar}
      />

      <RedCrossTopbar
        onMenuClick={openSidebar}
      />

      <main className="min-h-screen pt-20 transition-all duration-300 lg:ml-72">
        <div className="mx-auto w-full max-w-[1800px] p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}