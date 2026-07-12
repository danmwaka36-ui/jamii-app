import { useNavigate } from "react-router-dom";
import {
  FaAmbulance,
  FaBuilding,
  FaCarSide,
  FaCity,
  FaExclamationTriangle,
  FaFileAlt,
  FaGlobeAfrica,
  FaHospital,
  FaMapMarkedAlt,
  FaShieldAlt,
  FaUserShield,
  FaUsers,
} from "react-icons/fa";

import PageHeader from "../../components/common/PageHeader";
import StatCard from "../../components/common/StatCard";

import AgencyStatus from "../../components/admin/dashboard/AgencyStatus";
import AnalyticsChart from "../../components/admin/dashboard/AnalyticsChart";
import EmergencyTable, {
  type EmergencyRecord,
} from "../../components/admin/dashboard/EmergencyTable";
import KenyaMiniMap, {
  type KenyaMapLocation,
} from "../../components/admin/dashboard/KenyaMiniMap";
import OnlineUsers from "../../components/admin/dashboard/OnlineUsers";
import RecentActivity from "../../components/admin/dashboard/RecentActivity";
import SystemHealth from "../../components/admin/dashboard/SystemHealth";

export default function AdminDashboard() {
  const navigate = useNavigate();

  function openEmergency(emergency: EmergencyRecord) {
    navigate(`/admin/emergencies?id=${emergency.id}`);
  }

  function openMapLocation(location: KenyaMapLocation) {
    navigate(`/admin/gis?location=${location.id}`);
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Master Administration"
        subtitle="Manage national emergency operations, agencies, users, counties, incidents, connected devices and platform performance."
        icon={<FaShieldAlt />}
        badge="Command Centre"
        badgeColor="purple"
        actions={
          <>
            <button
              type="button"
              onClick={() => navigate("/admin/emergencies")}
              className="flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 font-bold text-white transition hover:bg-red-700"
            >
              <FaExclamationTriangle />
              Emergency Command
            </button>

            <button
              type="button"
              onClick={() => navigate("/admin/gis")}
              className="flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 font-bold text-white transition hover:bg-slate-800"
            >
              <FaMapMarkedAlt />
              Open GIS
            </button>
          </>
        }
      />

      <section className="overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-indigo-950 to-purple-950 p-6 text-white shadow-xl sm:p-8">
        <div className="flex flex-col gap-8 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-indigo-300">
              Jamii Emergency Management Platform
            </p>

            <h2 className="mt-3 max-w-4xl text-3xl font-extrabold leading-tight sm:text-4xl">
              National emergency administration and multi-agency coordination
            </h2>

            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">
              Monitor emergency operations, connected agencies, responders,
              counties, incidents, system health and field resources from one
              command centre.
            </p>
          </div>

          <div className="grid shrink-0 grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
              <p className="text-xs uppercase tracking-wide text-slate-300">
                Platform
              </p>

              <p className="mt-2 font-extrabold text-emerald-300">
                Operational
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
              <p className="text-xs uppercase tracking-wide text-slate-300">
                Coverage
              </p>

              <p className="mt-2 font-extrabold">Kenya</p>
            </div>

            <div className="col-span-2 rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur sm:col-span-1">
              <p className="text-xs uppercase tracking-wide text-slate-300">
                Counties
              </p>

              <p className="mt-2 font-extrabold">47 planned</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Countries"
          value={1}
          icon={<FaGlobeAfrica />}
          color="indigo"
          description="National platform configuration."
        />

        <StatCard
          title="Counties"
          value={47}
          icon={<FaCity />}
          color="purple"
          description="County administration coverage target."
        />

        <StatCard
          title="Registered Users"
          value={9}
          icon={<FaUsers />}
          color="blue"
          trend="+9 registered"
          trendDirection="up"
        />

        <StatCard
          title="Emergency Agencies"
          value={5}
          icon={<FaBuilding />}
          color="green"
          description="Agencies configured in the current platform."
        />

        <StatCard
          title="Active Emergencies"
          value={5}
          icon={<FaExclamationTriangle />}
          color="red"
          trend="Requires monitoring"
          trendDirection="neutral"
          onClick={() => navigate("/admin/emergencies")}
        />

        <StatCard
          title="Police Operations"
          value={1}
          icon={<FaUserShield />}
          color="blue"
          description="Connected Police command module."
          onClick={() => navigate("/police")}
        />

        <StatCard
          title="Response Vehicles"
          value={0}
          icon={<FaCarSide />}
          color="orange"
          description="Live fleet totals will load from Firestore."
        />

        <StatCard
          title="Hospitals"
          value={1}
          icon={<FaHospital />}
          color="green"
          description="Emergency health facilities configured."
        />
      </section>

      <section className="grid gap-6 2xl:grid-cols-[1.15fr_0.85fr]">
        <AnalyticsChart
          title="Emergency Reports by Month"
          description="Operational emergency trend across the selected reporting period."
          chartType="line"
          data={[
            { label: "Jan", value: 12 },
            { label: "Feb", value: 18 },
            { label: "Mar", value: 16 },
            { label: "Apr", value: 25 },
            { label: "May", value: 21 },
            { label: "Jun", value: 31 },
          ]}
        />

        <SystemHealth />
      </section>

      <KenyaMiniMap
        onExpand={() => navigate("/admin/gis")}
        onLocationClick={openMapLocation}
      />

      <EmergencyTable
        onViewEmergency={openEmergency}
        onViewAll={() => navigate("/admin/emergencies")}
      />

      <section className="grid gap-6 2xl:grid-cols-2">
        <AgencyStatus />
        <OnlineUsers />
      </section>

      <RecentActivity
        maxItems={7}
        onViewAll={() => navigate("/admin/audit-logs")}
      />

      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <button
          type="button"
          onClick={() => navigate("/admin/users")}
          className="rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-md"
        >
          <FaUsers className="text-3xl text-blue-700" />

          <h3 className="mt-5 text-lg font-bold text-slate-950">
            User Management
          </h3>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Register users, verify accounts and manage access.
          </p>
        </button>

        <button
          type="button"
          onClick={() => navigate("/admin/agencies")}
          className="rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:border-purple-200 hover:shadow-md"
        >
          <FaBuilding className="text-3xl text-purple-700" />

          <h3 className="mt-5 text-lg font-bold text-slate-950">
            Agency Management
          </h3>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Manage agencies, stations, responders and coverage.
          </p>
        </button>

        <button
          type="button"
          onClick={() => navigate("/admin/roles")}
          className="rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:border-indigo-200 hover:shadow-md"
        >
          <FaUserShield className="text-3xl text-indigo-700" />

          <h3 className="mt-5 text-lg font-bold text-slate-950">
            Roles & Permissions
          </h3>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Configure enterprise roles and module access.
          </p>
        </button>

        <button
          type="button"
          onClick={() => navigate("/admin/analytics")}
          className="rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:border-emerald-200 hover:shadow-md"
        >
          <FaFileAlt className="text-3xl text-emerald-700" />

          <h3 className="mt-5 text-lg font-bold text-slate-950">
            Platform Analytics
          </h3>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Review performance, incidents and response statistics.
          </p>
        </button>
      </section>

      <section className="rounded-2xl border border-blue-100 bg-blue-50 p-5 text-sm leading-6 text-blue-800">
        <div className="flex items-start gap-3">
          <FaAmbulance className="mt-1 shrink-0 text-lg" />

          <p>
            The dashboard components currently include demonstration values.
            We will next connect the KPI cards, map, agency status, online
            users, activity feed and emergency table to live Firestore data.
          </p>
        </div>
      </section>
    </div>
  );
}