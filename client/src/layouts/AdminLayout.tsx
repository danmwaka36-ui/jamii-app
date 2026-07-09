import { Outlet } from "react-router-dom";

import AdminSidebar from "../components/admin/AdminSidebar";
import AdminTopbar from "../components/admin/AdminTopbar";

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-slate-50">
      <AdminSidebar />
      <AdminTopbar />

      <main className="ml-72 pt-20 p-8">
        <Outlet />
      </main>
    </div>
  );
}