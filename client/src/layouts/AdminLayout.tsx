import { Outlet } from "react-router-dom";
import Sidebar from "../components/dashboard/Sidebar";
import Topbar from "../components/dashboard/Topbar";

export default function AdminLayout() {
  return (
    <div style={{ display: "flex" }}>
      <Sidebar />

      <div style={{ flex: 1 }}>
        <Topbar />

        <div style={{ padding: "30px" }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}