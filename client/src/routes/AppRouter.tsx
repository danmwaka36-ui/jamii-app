import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "../pages/public/Home";
import About from "../pages/public/About";
import Services from "../pages/public/Services";
import NotFound from "../pages/public/NotFound";

import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";

import DashboardLayout from "../layouts/DashboardLayout";

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
import FireDashboard from "../pages/fire/FireDashboard";
import AmbulanceDashboard from "../pages/ambulance/AmbulanceDashboard";
import CountyDashboard from "../pages/county/CountyDashboard";
import RedCrossDashboard from "../pages/redcross/RedCrossDashboard";
import NyumbaKumiDashboard from "../pages/nyumbakumi/NyumbaKumiDashboard";
import AdminDashboard from "../pages/admin/AdminDashboard";

import ProtectedRoute from "./ProtectedRoute";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/services" element={<Services />} />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
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

        <Route
          path="/police"
          element={
            <ProtectedRoute>
              <PoliceDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/fire"
          element={
            <ProtectedRoute>
              <FireDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/ambulance"
          element={
            <ProtectedRoute>
              <AmbulanceDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/county"
          element={
            <ProtectedRoute>
              <CountyDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/redcross"
          element={
            <ProtectedRoute>
              <RedCrossDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/nyumbakumi"
          element={
            <ProtectedRoute>
              <NyumbaKumiDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}