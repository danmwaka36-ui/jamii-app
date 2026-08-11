import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FaAmbulance,
  FaCheckCircle,
  FaClock,
  FaExclamationTriangle,
  FaEye,
  FaFilter,
  FaFire,
  FaMapMarkerAlt,
  FaMapMarkedAlt,
  FaSearch,
  FaTimes,
  FaUserFriends,
  FaWater,
} from "react-icons/fa";

import PageHeader from "../../../components/common/PageHeader";
import StatusBadge from "../../../components/common/StatusBadge";

type IncidentStatus =
  | "New"
  | "Acknowledged"
  | "Assigned"
  | "Dispatched"
  | "Responding"
  | "On Scene"
  | "Resolved";

type IncidentPriority =
  | "Critical"
  | "High"
  | "Medium"
  | "Low";

type IncidentType =
  | "Flood"
  | "Medical"
  | "Fire"
  | "Rescue"
  | "Displacement"
  | "Blood"
  | "Other";

type Incident = {
  id: string;
  reference: string;
  title: string;
  type: IncidentType;
  priority: IncidentPriority;
  status: IncidentStatus;
  county: string;
  ward: string;
  location: string;
  description: string;
  reporter: string;
  reporterPhone?: string;
  reportedAt: string;
  assignedTeam?: string;
  assignedVehicle?: string;
  acknowledgedAt?: string;
  dispatchedAt?: string;
  latitude?: number;
  longitude?: number;
};

const teams = [
  "Rescue Team Alpha",
  "Medical Unit 3",
  "Relief Team 2",
  "Volunteer Response Team",
  "Emergency Health Team",
  "Water & Sanitation Team",
];

const initialIncidents: Incident[] = [
  {
    id: "1",
    reference: "KRCS-2026-001",
    title: "Flood evacuation support",
    type: "Flood",
    priority: "Critical",
    status: "New",
    county: "Mombasa",
    ward: "Likoni",
    location: "Shelly Beach",
    description:
      "Several households are affected by flash flooding. Evacuation and temporary shelter support requested.",
    reporter: "County Disaster Desk",
    reporterPhone: "+254700000001",
    reportedAt: "08:42",
    latitude: -4.0901,
    longitude: 39.6514,
  },
  {
    id: "2",
    reference: "KRCS-2026-002",
    title: "Emergency medical assistance",
    type: "Medical",
    priority: "High",
    status: "Acknowledged",
    county: "Mombasa",
    ward: "Nyali",
    location: "Links Road",
    description:
      "Road traffic incident with multiple injuries. First aid and ambulance support requested.",
    reporter: "Citizen Emergency Report",
    reporterPhone: "+254700000002",
    reportedAt: "09:06",
    acknowledgedAt: "09:10",
    latitude: -4.0365,
    longitude: 39.7011,
  },
  {
    id: "3",
    reference: "KRCS-2026-003",
    title: "Relief distribution request",
    type: "Displacement",
    priority: "Medium",
    status: "Assigned",
    county: "Mombasa",
    ward: "Kisauni",
    location: "Bamburi",
    description:
      "Displaced households require blankets, hygiene kits and food assistance.",
    reporter: "Community Response Desk",
    reportedAt: "09:24",
    assignedTeam: "Relief Team 2",
  },
  {
    id: "4",
    reference: "KRCS-2026-004",
    title: "Building fire humanitarian support",
    type: "Fire",
    priority: "High",
    status: "Dispatched",
    county: "Mombasa",
    ward: "Mvita",
    location: "Old Town",
    description:
      "Fire response is underway. Humanitarian support required for displaced families and minor casualties.",
    reporter: "County Fire Service",
    reportedAt: "09:51",
    assignedTeam: "Emergency Health Team",
    assignedVehicle: "KRCS Ambulance 07",
    dispatchedAt: "09:58",
  },
  {
    id: "5",
    reference: "KRCS-2026-005",
    title: "Rescue support request",
    type: "Rescue",
    priority: "Medium",
    status: "Responding",
    county: "Mombasa",
    ward: "Changamwe",
    location: "Port Reitz",
    description:
      "Rescue team requested to assist with an injured person in difficult terrain.",
    reporter: "Emergency Coordination Centre",
    reportedAt: "10:12",
    assignedTeam: "Rescue Team Alpha",
    assignedVehicle: "Rescue Unit 02",
  },
];

function typeIcon(type: IncidentType) {
  switch (type) {
    case "Flood":
      return <FaWater />;
    case "Medical":
      return <FaAmbulance />;
    case "Fire":
      return <FaFire />;
    case "Rescue":
      return <FaUserFriends />;
    default:
      return <FaExclamationTriangle />;
  }
}

function typeColor(type: IncidentType) {
  switch (type) {
    case "Flood":
      return "bg-cyan-100 text-cyan-700";
    case "Medical":
      return "bg-emerald-100 text-emerald-700";
    case "Fire":
      return "bg-red-100 text-red-700";
    case "Rescue":
      return "bg-orange-100 text-orange-700";
    case "Displacement":
      return "bg-purple-100 text-purple-700";
    case "Blood":
      return "bg-rose-100 text-rose-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
}

export default function RedCrossIncidents() {
  const navigate = useNavigate();

  const [incidents, setIncidents] =
    useState<Incident[]>(initialIncidents);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState("all");
  const [priorityFilter, setPriorityFilter] =
    useState("all");
  const [typeFilter, setTypeFilter] =
    useState("all");

  const [selectedIncident, setSelectedIncident] =
    useState<Incident | null>(null);

  const [assignmentTeam, setAssignmentTeam] =
    useState("");

  const filteredIncidents = useMemo(() => {
    const query = search.trim().toLowerCase();

    return incidents.filter((incident) => {
      const matchesSearch =
        !query ||
        incident.reference
          .toLowerCase()
          .includes(query) ||
        incident.title.toLowerCase().includes(query) ||
        incident.location.toLowerCase().includes(query) ||
        incident.ward.toLowerCase().includes(query) ||
        incident.county.toLowerCase().includes(query) ||
        incident.reporter.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "all" ||
        incident.status === statusFilter;

      const matchesPriority =
        priorityFilter === "all" ||
        incident.priority === priorityFilter;

      const matchesType =
        typeFilter === "all" ||
        incident.type === typeFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPriority &&
        matchesType
      );
    });
  }, [
    incidents,
    priorityFilter,
    search,
    statusFilter,
    typeFilter,
  ]);

  const stats = useMemo(() => {
    return {
      total: incidents.length,
      new: incidents.filter(
        (incident) => incident.status === "New"
      ).length,
      critical: incidents.filter(
        (incident) => incident.priority === "Critical"
      ).length,
      active: incidents.filter(
        (incident) =>
          incident.status !== "Resolved"
      ).length,
    };
  }, [incidents]);

  function updateIncident(
    incidentId: string,
    changes: Partial<Incident>
  ) {
    setIncidents((current) =>
      current.map((incident) =>
        incident.id === incidentId
          ? {
              ...incident,
              ...changes,
            }
          : incident
      )
    );

    setSelectedIncident((current) =>
      current?.id === incidentId
        ? {
            ...current,
            ...changes,
          }
        : current
    );
  }

  function acknowledgeIncident(
    incident: Incident
  ) {
    updateIncident(incident.id, {
      status: "Acknowledged",
      acknowledgedAt: new Date().toLocaleTimeString(
        [],
        {
          hour: "2-digit",
          minute: "2-digit",
        }
      ),
    });
  }

  function assignTeam(incident: Incident) {
    if (!assignmentTeam) return;

    updateIncident(incident.id, {
      assignedTeam: assignmentTeam,
      status: "Assigned",
    });

    setAssignmentTeam("");
  }

  function dispatchIncident(
    incident: Incident
  ) {
    updateIncident(incident.id, {
      status: "Dispatched",
      dispatchedAt: new Date().toLocaleTimeString(
        [],
        {
          hour: "2-digit",
          minute: "2-digit",
        }
      ),
    });
  }

  function resolveIncident(
    incident: Incident
  ) {
    updateIncident(incident.id, {
      status: "Resolved",
    });
  }

  function clearFilters() {
    setSearch("");
    setStatusFilter("all");
    setPriorityFilter("all");
    setTypeFilter("all");
  }

  return (
    <div className="space-y-7">
      <PageHeader
        title="Emergency Incidents"
        subtitle="Monitor incoming humanitarian incidents, acknowledge alerts, assign response teams and coordinate field action."
        icon={<FaExclamationTriangle />}
        badge="Incident Command"
        badgeColor="red"
        actions={
          <button
            type="button"
            onClick={() => navigate("/redcross/gis")}
            className="flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 font-bold text-white transition hover:bg-slate-800"
          >
            <FaMapMarkedAlt />
            Open GIS
          </button>
        }
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">
            Total Incidents
          </p>
          <p className="mt-2 text-3xl font-extrabold text-slate-950">
            {stats.total}
          </p>
        </div>

        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 shadow-sm">
          <p className="text-sm font-semibold text-red-600">
            New Alerts
          </p>
          <p className="mt-2 text-3xl font-extrabold text-red-700">
            {stats.new}
          </p>
        </div>

        <div className="rounded-2xl border border-orange-200 bg-orange-50 p-5 shadow-sm">
          <p className="text-sm font-semibold text-orange-600">
            Critical
          </p>
          <p className="mt-2 text-3xl font-extrabold text-orange-700">
            {stats.critical}
          </p>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
          <p className="text-sm font-semibold text-emerald-600">
            Active Operations
          </p>
          <p className="mt-2 text-3xl font-extrabold text-emerald-700">
            {stats.active}
          </p>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-3 xl:grid-cols-[1fr_190px_190px_190px_auto]">
          <div className="relative">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

            <input
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search incident, location, ward or reporter..."
              className="w-full rounded-xl border border-slate-200 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-100"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value)
            }
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="New">New</option>
            <option value="Acknowledged">
              Acknowledged
            </option>
            <option value="Assigned">
              Assigned
            </option>
            <option value="Dispatched">
              Dispatched
            </option>
            <option value="Responding">
              Responding
            </option>
            <option value="On Scene">
              On Scene
            </option>
            <option value="Resolved">
              Resolved
            </option>
          </select>

          <select
            value={priorityFilter}
            onChange={(event) =>
              setPriorityFilter(event.target.value)
            }
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
          >
            <option value="all">All Priorities</option>
            <option value="Critical">
              Critical
            </option>
            <option value="High">High</option>
            <option value="Medium">
              Medium
            </option>
            <option value="Low">Low</option>
          </select>

          <select
            value={typeFilter}
            onChange={(event) =>
              setTypeFilter(event.target.value)
            }
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
          >
            <option value="all">All Types</option>
            <option value="Flood">Flood</option>
            <option value="Medical">
              Medical
            </option>
            <option value="Fire">Fire</option>
            <option value="Rescue">
              Rescue
            </option>
            <option value="Displacement">
              Displacement
            </option>
            <option value="Blood">
              Blood
            </option>
            <option value="Other">
              Other
            </option>
          </select>

          <button
            type="button"
            onClick={clearFilters}
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100"
          >
            <FaFilter />
            Reset
          </button>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4">
          <p className="text-sm font-semibold text-slate-600">
            Showing {filteredIncidents.length} of{" "}
            {incidents.length} incidents
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px] text-left text-sm">
            <thead className="bg-slate-50">
              <tr className="border-b border-slate-200">
                <th className="px-5 py-4">
                  Incident
                </th>
                <th className="px-5 py-4">
                  Location
                </th>
                <th className="px-5 py-4">
                  Priority
                </th>
                <th className="px-5 py-4">
                  Status
                </th>
                <th className="px-5 py-4">
                  Team
                </th>
                <th className="px-5 py-4">
                  Reported
                </th>
                <th className="px-5 py-4">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredIncidents.map(
                (incident) => (
                  <tr
                    key={incident.id}
                    className="transition hover:bg-slate-50"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-11 w-11 items-center justify-center rounded-xl text-lg ${typeColor(
                            incident.type
                          )}`}
                        >
                          {typeIcon(incident.type)}
                        </div>

                        <div>
                          <p className="font-bold text-slate-950">
                            {incident.reference}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {incident.title}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-800">
                        {incident.location}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {incident.ward},{" "}
                        {incident.county}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <StatusBadge
                        status={incident.priority}
                      />
                    </td>

                    <td className="px-5 py-4">
                      <StatusBadge
                        status={incident.status}
                      />
                    </td>

                    <td className="px-5 py-4 text-slate-700">
                      {incident.assignedTeam ||
                        "Unassigned"}
                    </td>

                    <td className="px-5 py-4 text-slate-500">
                      {incident.reportedAt}
                    </td>

                    <td className="px-5 py-4">
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedIncident(
                            incident
                          )
                        }
                        className="flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2 font-bold text-white transition hover:bg-slate-800"
                      >
                        <FaEye />
                        Manage
                      </button>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      </section>

      {selectedIncident && (
        <>
          <button
            type="button"
            aria-label="Close incident details"
            onClick={() =>
              setSelectedIncident(null)
            }
            className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm"
          />

          <aside className="fixed bottom-0 right-0 top-0 z-50 flex w-full max-w-xl flex-col bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-200 bg-slate-950 p-6 text-white">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-red-300">
                  Incident Command
                </p>

                <h2 className="mt-2 text-2xl font-extrabold">
                  {selectedIncident.reference}
                </h2>

                <p className="mt-2 text-sm text-slate-300">
                  {selectedIncident.title}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedIncident(null)
                }
                className="rounded-xl p-3 text-slate-300 transition hover:bg-slate-800"
              >
                <FaTimes />
              </button>
            </div>

            <div className="flex-1 space-y-6 overflow-y-auto p-6">
              <div className="flex flex-wrap gap-2">
                <StatusBadge
                  status={selectedIncident.priority}
                />
                <StatusBadge
                  status={selectedIncident.status}
                />

                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                  {selectedIncident.type}
                </span>
              </div>

              <div>
                <h3 className="font-bold text-slate-950">
                  Situation Description
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {selectedIncident.description}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs font-bold uppercase text-slate-500">
                    Location
                  </p>

                  <p className="mt-2 font-bold text-slate-900">
                    {selectedIncident.location}
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    {selectedIncident.ward},{" "}
                    {selectedIncident.county}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs font-bold uppercase text-slate-500">
                    Reporter
                  </p>

                  <p className="mt-2 font-bold text-slate-900">
                    {selectedIncident.reporter}
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    {selectedIncident.reporterPhone ||
                      "No phone supplied"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  navigate(
                    `/redcross/gis?incident=${selectedIncident.id}`
                  )
                }
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 font-bold text-slate-700 transition hover:bg-slate-50"
              >
                <FaMapMarkerAlt />
                View Incident on GIS
              </button>

              {!selectedIncident.assignedTeam && (
                <div>
                  <label className="text-sm font-bold text-slate-700">
                    Assign Response Team
                  </label>

                  <div className="mt-2 flex gap-2">
                    <select
                      value={assignmentTeam}
                      onChange={(event) =>
                        setAssignmentTeam(
                          event.target.value
                        )
                      }
                      className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none"
                    >
                      <option value="">
                        Select team
                      </option>

                      {teams.map((team) => (
                        <option
                          key={team}
                          value={team}
                        >
                          {team}
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      onClick={() =>
                        assignTeam(
                          selectedIncident
                        )
                      }
                      disabled={!assignmentTeam}
                      className="rounded-xl bg-purple-600 px-5 py-3 font-bold text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Assign
                    </button>
                  </div>
                </div>
              )}

              {selectedIncident.assignedTeam && (
                <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
                  <p className="text-xs font-bold uppercase text-blue-600">
                    Assigned Team
                  </p>

                  <p className="mt-2 font-extrabold text-blue-950">
                    {
                      selectedIncident.assignedTeam
                    }
                  </p>

                  {selectedIncident.assignedVehicle && (
                    <p className="mt-1 text-sm text-blue-700">
                      Vehicle:{" "}
                      {
                        selectedIncident.assignedVehicle
                      }
                    </p>
                  )}
                </div>
              )}

              <div className="space-y-3 rounded-2xl border border-slate-200 p-4">
                <h3 className="font-bold text-slate-950">
                  Response Timeline
                </h3>

                <div className="flex gap-3">
                  <FaClock className="mt-1 text-slate-400" />
                  <div>
                    <p className="font-semibold text-slate-800">
                      Report received
                    </p>
                    <p className="text-xs text-slate-500">
                      {selectedIncident.reportedAt}
                    </p>
                  </div>
                </div>

                {selectedIncident.acknowledgedAt && (
                  <div className="flex gap-3">
                    <FaCheckCircle className="mt-1 text-blue-600" />
                    <div>
                      <p className="font-semibold text-slate-800">
                        Acknowledged
                      </p>
                      <p className="text-xs text-slate-500">
                        {
                          selectedIncident.acknowledgedAt
                        }
                      </p>
                    </div>
                  </div>
                )}

                {selectedIncident.dispatchedAt && (
                  <div className="flex gap-3">
                    <FaAmbulance className="mt-1 text-red-600" />
                    <div>
                      <p className="font-semibold text-slate-800">
                        Response dispatched
                      </p>
                      <p className="text-xs text-slate-500">
                        {
                          selectedIncident.dispatchedAt
                        }
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="grid gap-2 border-t border-slate-200 bg-slate-50 p-5 sm:grid-cols-2">
              {selectedIncident.status ===
                "New" && (
                <button
                  type="button"
                  onClick={() =>
                    acknowledgeIncident(
                      selectedIncident
                    )
                  }
                  className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 font-bold text-white transition hover:bg-blue-700"
                >
                  <FaCheckCircle />
                  Acknowledge
                </button>
              )}

              {selectedIncident.assignedTeam &&
                ![
                  "Dispatched",
                  "Responding",
                  "On Scene",
                  "Resolved",
                ].includes(
                  selectedIncident.status
                ) && (
                  <button
                    type="button"
                    onClick={() =>
                      dispatchIncident(
                        selectedIncident
                      )
                    }
                    className="flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 font-bold text-white transition hover:bg-red-700"
                  >
                    <FaAmbulance />
                    Dispatch
                  </button>
                )}

              {selectedIncident.status !==
                "Resolved" && (
                <button
                  type="button"
                  onClick={() =>
                    resolveIncident(
                      selectedIncident
                    )
                  }
                  className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 font-bold text-white transition hover:bg-emerald-700"
                >
                  <FaCheckCircle />
                  Resolve
                </button>
              )}
            </div>
          </aside>
        </>
      )}
    </div>
  );
}