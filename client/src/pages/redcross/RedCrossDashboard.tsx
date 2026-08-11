import { useNavigate } from "react-router-dom";
import {
  FaAmbulance,
  FaBoxes,
  FaChartLine,
  FaExclamationTriangle,
  FaFirstAid,
  FaHeartbeat,
  FaMapMarkedAlt,
  FaTint,
  FaTruck,
  FaUserFriends,
  FaWarehouse,
} from "react-icons/fa";

import PageHeader from "../../components/common/PageHeader";
import StatCard from "../../components/common/StatCard";
import StatusBadge from "../../components/common/StatusBadge";

type ActiveOperation = {
  id: string;
  title: string;
  location: string;
  priority: string;
  status: string;
  team: string;
  time: string;
};

const activeOperations: ActiveOperation[] = [
  {
    id: "KRCS-001",
    title: "Flood evacuation support",
    location: "Likoni, Mombasa",
    priority: "Critical",
    status: "Dispatched",
    team: "Rescue Team Alpha",
    time: "8 mins ago",
  },
  {
    id: "KRCS-002",
    title: "Medical assistance request",
    location: "Nyali",
    priority: "High",
    status: "Responding",
    team: "Medical Unit 3",
    time: "16 mins ago",
  },
  {
    id: "KRCS-003",
    title: "Relief distribution coordination",
    location: "Kisauni",
    priority: "Medium",
    status: "Assigned",
    team: "Relief Team 2",
    time: "31 mins ago",
  },
  {
    id: "KRCS-004",
    title: "Blood donation emergency appeal",
    location: "Mvita",
    priority: "High",
    status: "Open",
    team: "Blood Services Desk",
    time: "47 mins ago",
  },
];

export default function RedCrossDashboard() {
  const navigate = useNavigate();

  return (
    <div className="space-y-8">
      <PageHeader
        title="Kenya Red Cross Emergency Operations Centre"
        subtitle="Coordinate humanitarian emergencies, medical response, volunteers, shelters, relief supplies and rescue deployments."
        icon={
          <img
            src="/branding/kenya-red-cross-logo.png"
            alt="Kenya Red Cross Society"
            className="h-12 w-12 object-contain"
          />
        }
        badge="Live Operations"
        badgeColor="red"
        actions={
          <>
            <button
              type="button"
              onClick={() => navigate("/redcross/incidents")}
              className="flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 font-bold text-white transition hover:bg-red-700"
            >
              <FaExclamationTriangle />
              View Incidents
            </button>

            <button
              type="button"
              onClick={() => navigate("/redcross/gis")}
              className="flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 font-bold text-white transition hover:bg-slate-800"
            >
              <FaMapMarkedAlt />
              Open GIS
            </button>
          </>
        }
      />

      <section className="overflow-hidden rounded-3xl bg-gradient-to-r from-red-700 via-red-600 to-red-800 p-6 text-white shadow-xl sm:p-8">
        <div className="flex flex-col gap-8 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-start gap-5">
            <div className="hidden h-24 w-32 shrink-0 items-center justify-center rounded-2xl bg-white p-3 shadow-lg sm:flex">
              <img
                src="/branding/kenya-red-cross-logo.png"
                alt="Kenya Red Cross Society"
                className="h-full w-full object-contain"
              />
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-red-100">
                Kenya Red Cross Society
              </p>

              <h2 className="mt-3 max-w-4xl text-3xl font-extrabold leading-tight sm:text-4xl">
                Humanitarian response, emergency medical support and disaster coordination
              </h2>

              <p className="mt-4 max-w-3xl text-sm leading-7 text-red-50 sm:text-base">
                Monitor emergencies, deploy responders, coordinate ambulances,
                track relief supplies and support affected communities from one
                operational command centre.
              </p>
            </div>
          </div>

          <div className="grid shrink-0 grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur">
              <p className="text-xs uppercase tracking-wide text-red-100">
                Network
              </p>
              <p className="mt-2 font-extrabold text-emerald-200">
                Online
              </p>
            </div>

            <div className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur">
              <p className="text-xs uppercase tracking-wide text-red-100">
                Region
              </p>
              <p className="mt-2 font-extrabold">
                Mombasa
              </p>
            </div>

            <div className="col-span-2 rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur sm:col-span-1">
              <p className="text-xs uppercase tracking-wide text-red-100">
                Duty Status
              </p>
              <p className="mt-2 font-extrabold text-white">
                Active Response
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Active Incidents"
          value={12}
          icon={<FaExclamationTriangle />}
          color="red"
          trend="+3 today"
          trendDirection="up"
          onClick={() => navigate("/redcross/incidents")}
        />

        <StatCard
          title="Responders on Duty"
          value={48}
          icon={<FaUserFriends />}
          color="blue"
          description="Volunteers and humanitarian responders currently available."
          onClick={() => navigate("/redcross/responders")}
        />

        <StatCard
          title="Ambulances Available"
          value={7}
          icon={<FaAmbulance />}
          color="green"
          description="Emergency medical and rescue vehicles ready for deployment."
          onClick={() => navigate("/redcross/vehicles")}
        />

        <StatCard
          title="Open Shelters"
          value={5}
          icon={<FaWarehouse />}
          color="purple"
          description="Temporary shelters and relief centres currently active."
          onClick={() => navigate("/redcross/shelters")}
        />

        <StatCard
          title="Relief Stock Items"
          value="2,480"
          icon={<FaBoxes />}
          color="orange"
          description="Food, blankets, hygiene kits and emergency supplies."
          onClick={() => navigate("/redcross/inventory")}
        />

        <StatCard
          title="Medical Cases Assisted"
          value={36}
          icon={<FaHeartbeat />}
          color="green"
          trend="+8 this week"
          trendDirection="up"
          onClick={() => navigate("/redcross/medical")}
        />

        <StatCard
          title="Blood Requests"
          value={9}
          icon={<FaTint />}
          color="red"
          description="Urgent blood donation and hospital coordination requests."
          onClick={() => navigate("/redcross/blood")}
        />

        <StatCard
          title="Rescue Vehicles"
          value={14}
          icon={<FaTruck />}
          color="indigo"
          description="Ambulances, rescue trucks and logistics vehicles."
          onClick={() => navigate("/redcross/vehicles")}
        />
      </section>

      <section className="grid gap-6 2xl:grid-cols-[1.2fr_0.8fr]">
        <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div>
              <h2 className="text-xl font-bold text-slate-950">
                Active Humanitarian Operations
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Current incidents requiring humanitarian support or monitoring.
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate("/redcross/incidents")}
              className="w-fit rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
            >
              View All
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-slate-50">
                <tr className="border-b border-slate-200">
                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                    Operation
                  </th>
                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                    Location
                  </th>
                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                    Priority
                  </th>
                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                    Status
                  </th>
                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                    Assigned Team
                  </th>
                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                    Time
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {activeOperations.map((operation) => (
                  <tr
                    key={operation.id}
                    className="transition hover:bg-slate-50"
                  >
                    <td className="px-5 py-4">
                      <p className="font-bold text-slate-950">
                        {operation.id}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {operation.title}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-slate-700">
                      {operation.location}
                    </td>

                    <td className="px-5 py-4">
                      <StatusBadge status={operation.priority} />
                    </td>

                    <td className="px-5 py-4">
                      <StatusBadge status={operation.status} />
                    </td>

                    <td className="px-5 py-4 text-slate-700">
                      {operation.team}
                    </td>

                    <td className="px-5 py-4 text-slate-500">
                      {operation.time}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-950">
                Response Capacity
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Current humanitarian operational readiness.
              </p>
            </div>

            <FaChartLine className="text-2xl text-red-600" />
          </div>

          <div className="mt-6 space-y-5">
            {[
              { label: "Medical Teams", value: 82 },
              { label: "Volunteer Availability", value: 74 },
              { label: "Shelter Capacity", value: 61 },
              { label: "Relief Inventory", value: 88 },
              { label: "Vehicle Readiness", value: 76 },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-slate-700">
                    {item.label}
                  </span>

                  <span className="font-bold text-slate-950">
                    {item.value}%
                  </span>
                </div>

                <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-red-600"
                    style={{ width: `${item.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <button
          type="button"
          onClick={() => navigate("/redcross/dispatch")}
          className="rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:border-red-200 hover:shadow-md"
        >
          <FaAmbulance className="text-3xl text-red-600" />

          <h3 className="mt-5 text-lg font-bold text-slate-950">
            Dispatch Centre
          </h3>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Assign medical, rescue and relief response teams.
          </p>
        </button>

        <button
          type="button"
          onClick={() => navigate("/redcross/inventory")}
          className="rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:border-orange-200 hover:shadow-md"
        >
          <FaBoxes className="text-3xl text-orange-600" />

          <h3 className="mt-5 text-lg font-bold text-slate-950">
            Relief Inventory
          </h3>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Monitor supplies, stock levels and distribution activity.
          </p>
        </button>

        <button
          type="button"
          onClick={() => navigate("/redcross/shelters")}
          className="rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:border-purple-200 hover:shadow-md"
        >
          <FaWarehouse className="text-3xl text-purple-600" />

          <h3 className="mt-5 text-lg font-bold text-slate-950">
            Shelter Management
          </h3>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Coordinate temporary shelters and affected households.
          </p>
        </button>

        <button
          type="button"
          onClick={() => navigate("/redcross/reports")}
          className="rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-md"
        >
          <FaChartLine className="text-3xl text-blue-600" />

          <h3 className="mt-5 text-lg font-bold text-slate-950">
            Humanitarian Reports
          </h3>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Review assessments, response outcomes and operational reports.
          </p>
        </button>
      </section>

      <section className="rounded-2xl border border-red-100 bg-red-50 p-5">
        <div className="flex items-start gap-3">
          <FaFirstAid className="mt-1 shrink-0 text-lg text-red-700" />

          <div>
            <h2 className="font-bold text-red-950">
              Kenya Red Cross operations integration
            </h2>

            <p className="mt-2 text-sm leading-6 text-red-800">
              The dashboard currently uses demonstration information. Live
              incidents, responders, vehicles, shelters, medical requests,
              blood requests and relief inventory will later load from
              Firestore and update in real time.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}