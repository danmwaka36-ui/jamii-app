import {
  FaBell,
  FaBuilding,
  FaCog,
  FaMapMarkerAlt,
  FaShieldAlt,
} from "react-icons/fa";

import NotificationPermissionCard from "../../../components/notifications/NotificationPermissionCard";

export default function PoliceSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-3 text-3xl font-extrabold text-slate-950">
          <FaCog className="text-blue-700" />
          Police Settings
        </h1>

        <p className="mt-2 text-slate-600">
          Configure station identity, jurisdiction, emergency notifications,
          device registration and operational preferences.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <FaShieldAlt className="text-2xl text-blue-700" />

          <p className="mt-4 text-sm text-slate-500">
            Agency Role
          </p>

          <h2 className="mt-1 text-lg font-extrabold text-slate-950">
            Police
          </h2>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <FaBuilding className="text-2xl text-purple-600" />

          <p className="mt-4 text-sm text-slate-500">
            Agency
          </p>

          <h2 className="mt-1 text-lg font-extrabold text-slate-950">
            Police Service
          </h2>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <FaMapMarkerAlt className="text-2xl text-red-600" />

          <p className="mt-4 text-sm text-slate-500">
            County
          </p>

          <h2 className="mt-1 text-lg font-extrabold text-slate-950">
            Mombasa
          </h2>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <FaBell className="text-2xl text-orange-600" />

          <p className="mt-4 text-sm text-slate-500">
            Alert System
          </p>

          <h2 className="mt-1 text-lg font-extrabold text-slate-950">
            Device Registration
          </h2>
        </div>
      </div>

      <NotificationPermissionCard
        role="police"
        agencyName="Police Service"
        countyName="Mombasa"
        wardName="Kazandani"
        title="Police Emergency Notifications"
        description="Register this phone, tablet or computer to receive police incidents, dispatch alerts and critical emergency notifications."
      />

      <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
        <h2 className="font-bold text-blue-900">
          Police Notification Routing
        </h2>

        <p className="mt-2 text-sm leading-6 text-blue-700">
          This device will receive incidents routed to the Police role. The
          agency, county and ward values are temporary and will later be loaded
          automatically from the logged-in officer’s Firestore profile.
        </p>
      </div>
    </div>
  );
}