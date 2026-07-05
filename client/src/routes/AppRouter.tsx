import { BrowserRouter, Routes, Route } from "react-router-dom";

// Public Pages
import Home from "../pages/public/Home";
import About from "../pages/public/About";
import Services from "../pages/public/Services";
import NotFound from "../pages/public/NotFound";

// Authentication
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";

// Citizen
import Dashboard from "../pages/citizen/Dashboard";
import ReportEmergency from "../pages/citizen/ReportEmergency";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/services" element={<Services />} />

        {/* Authentication */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Citizen */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard/report" element={<ReportEmergency />} />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />

      </Routes>
    </BrowserRouter>
  );
}