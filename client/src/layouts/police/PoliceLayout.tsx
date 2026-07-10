import { Outlet } from "react-router-dom";

import PoliceSidebar from "../../components/police/PoliceSidebar";
import PoliceTopbar from "../../components/police/PoliceTopbar";

export default function PoliceLayout() {
  return (
    <div className="min-h-screen bg-slate-50">
      <PoliceSidebar />
      <PoliceTopbar />

      <main className="ml-72 pt-24">
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}