import { BrowserRouter, Route, Routes } from "react-router-dom";

import Home from "../pages/public/Home";
import About from "../pages/public/About";
import Services from "../pages/public/Services";
import NotFound from "../pages/public/NotFound";

import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";

import DashboardLayout from "../layouts/DashboardLayout";
import AdminLayout from "../layouts/AdminLayout";
import PoliceLayout from "../layouts/police/PoliceLayout";
import RedCrossLayout from "../layouts/redcross/RedCrossLayout";

import Dashboard from "../pages/citizen/Dashboard";
import ReportEmergency from "../pages/citizen/ReportEmergency";
import MyReports from "../pages/citizen/MyReports";
import Alerts from "../pages/citizen/Alerts";
import EmergencyContacts from "../pages/citizen/EmergencyContacts";
import SafeZones from "../pages/citizen/SafeZones";
import Community from "../pages/citizen/Community";
import ProfileSettings from "../pages/citizen/ProfileSettings";
import HelpSupport from "../pages/citizen/HelpSupport";

import PoliceDashboard from "../pages/police/PoliceDashboard";
import PoliceIncidents from "../pages/police/incidents/PoliceIncidents";
import PoliceDispatch from "../pages/police/dispatch/PoliceDispatch";
import PoliceOfficers from "../pages/police/officers/PoliceOfficers";
import PoliceVehicles from "../pages/police/vehicles/PoliceVehicles";
import CaseManagement from "../pages/police/cases/CaseManagement";
import EvidenceManagement from "../pages/police/evidence/EvidenceManagement";
import PoliceSettings from "../pages/police/settings/PoliceSettings";

import FireDashboard from "../pages/fire/FireDashboard";
import AmbulanceDashboard from "../pages/ambulance/AmbulanceDashboard";
import CountyDashboard from "../pages/county/CountyDashboard";
import NyumbaKumiDashboard from "../pages/nyumbakumi/NyumbaKumiDashboard";

import RedCrossDashboard from "../pages/redcross/RedCrossDashboard";
import RedCrossIncidents from "../pages/redcross/incidents/RedCrossIncidents";
import RedCrossDispatch from "../pages/redcross/dispatch/RedCrossDispatch";
import RedCrossResponders from "../pages/redcross/responders/RedCrossResponders";
import RedCrossVehicles from "../pages/redcross/vehicles/RedCrossVehicles";
import RedCrossDrivers from "../pages/redcross/drivers/RedCrossDrivers";
import MedicalSupport from "../pages/redcross/medical/MedicalSupport";
import ShelterManagement from "../pages/redcross/shelters/ShelterManagement";
import ReliefInventory from "../pages/redcross/inventory/ReliefInventory";
import BloodCoordination from "../pages/redcross/blood/BloodCoordination";
import RedCrossGIS from "../pages/redcross/gis/RedCrossGIS";
import RedCrossReports from "../pages/redcross/reports/RedCrossReports";
import RedCrossCommunication from "../pages/redcross/communication/RedCrossCommunication";
import RedCrossAnalytics from "../pages/redcross/analytics/RedCrossAnalytics";
import RedCrossSettings from "../pages/redcross/settings/RedCrossSettings";

import AdminDashboard from "../pages/admin/AdminDashboard";
import UserManagement from "../pages/admin/users/UserManagement";
import AuditLogs from "../pages/admin/audit/AuditLogs";
import EmergencyManagement from "../pages/admin/emergencymanagement/EmergencyManagement";
import RoleManagement from "../pages/admin/roles/RoleManagement";
import AgencyManagement from "../pages/admin/agencies/AgencyManagement";
import SystemAnalytics from "../pages/admin/analytics/SystemAnalytics";
import AdminSettings from "../pages/admin/settings/AdminSettings";
import GISCommandCentre from "../pages/admin/gis/GISCommandCentre";

import RoleRoute from "./RoleRoute";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ================= PUBLIC ================= */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/services" element={<Services />} />

        {/* ================= AUTH ================= */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ================= CITIZEN ================= */}
        <Route
          path="/dashboard"
          element={
            <RoleRoute allowedRoles={["citizen", "admin"]}>
              <DashboardLayout />
            </RoleRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="report" element={<ReportEmergency />} />
          <Route path="reports" element={<MyReports />} />
          <Route path="alerts" element={<Alerts />} />
          <Route path="contacts" element={<EmergencyContacts />} />
          <Route path="safe-zones" element={<SafeZones />} />
          <Route path="community" element={<Community />} />
          <Route path="profile" element={<ProfileSettings />} />
          <Route path="help" element={<HelpSupport />} />
        </Route>

        {/* ================= ADMIN ================= */}
        <Route
          path="/admin"
          element={
            <RoleRoute allowedRoles={["admin"]}>
              <AdminLayout />
            </RoleRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="roles" element={<RoleManagement />} />
          <Route path="emergencies" element={<EmergencyManagement />} />
          <Route path="agencies" element={<AgencyManagement />} />
          <Route path="analytics" element={<SystemAnalytics />} />
          <Route path="audit-logs" element={<AuditLogs />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="gis" element={<GISCommandCentre />} />
        </Route>

        {/* ================= POLICE ================= */}
        <Route
          path="/police"
          element={
            <RoleRoute allowedRoles={["police", "admin"]}>
              <PoliceLayout />
            </RoleRoute>
          }
        >
          <Route index element={<PoliceDashboard />} />
          <Route path="incidents" element={<PoliceIncidents />} />
          <Route path="dispatch" element={<PoliceDispatch />} />
          <Route path="officers" element={<PoliceOfficers />} />
          <Route path="vehicles" element={<PoliceVehicles />} />
          <Route path="cases" element={<CaseManagement />} />
          <Route path="evidence" element={<EvidenceManagement />} />
          <Route path="settings" element={<PoliceSettings />} />
        </Route>

        {/* ================= RED CROSS ================= */}
        <Route
          path="/redcross"
          element={
            <RoleRoute allowedRoles={["redcross", "admin"]}>
              <RedCrossLayout />
            </RoleRoute>
          }
        >
          <Route index element={<RedCrossDashboard />} />

          <Route
            path="incidents"
            element={<RedCrossIncidents />}
          />

          <Route
            path="dispatch"
            element={<RedCrossDispatch />}
          />

          <Route
            path="responders"
            element={<RedCrossResponders />}
          />

          <Route
            path="vehicles"
            element={<RedCrossVehicles />}
          />

          <Route
            path="drivers"
            element={<RedCrossDrivers />}
          />

          <Route
            path="medical"
            element={<MedicalSupport />}
          />

          <Route
            path="shelters"
            element={<ShelterManagement />}
          />

          <Route
            path="inventory"
            element={<ReliefInventory />}
          />

          <Route
            path="blood"
            element={<BloodCoordination />}
          />

          <Route
            path="gis"
            element={<RedCrossGIS />}
          />

          <Route
            path="reports"
            element={<RedCrossReports />}
          />

          <Route
            path="communication"
            element={<RedCrossCommunication />}
          />

          <Route
            path="analytics"
            element={<RedCrossAnalytics />}
          />

          <Route
            path="settings"
            element={<RedCrossSettings />}
          />
        </Route>

        {/* ================= FIRE ================= */}
        <Route
          path="/fire"
          element={
            <RoleRoute allowedRoles={["fire", "admin"]}>
              <FireDashboard />
            </RoleRoute>
          }
        />

        {/* ================= AMBULANCE ================= */}
        <Route
          path="/ambulance"
          element={
            <RoleRoute allowedRoles={["ambulance", "admin"]}>
              <AmbulanceDashboard />
            </RoleRoute>
          }
        />

        {/* ================= COUNTY ================= */}
        <Route
          path="/county"
          element={
            <RoleRoute allowedRoles={["county", "admin"]}>
              <CountyDashboard />
            </RoleRoute>
          }
        />

        {/* ================= NYUMBA KUMI ================= */}
        <Route
          path="/nyumbakumi"
          element={
            <RoleRoute allowedRoles={["nyumbakumi", "admin"]}>
              <NyumbaKumiDashboard />
            </RoleRoute>
          }
        />

        {/* ================= 404 ================= */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}