import { useMemo, useState } from "react";
import {
  FaAmbulance,
  FaArrowRight,
  FaBell,
  FaCar,
  FaCheckCircle,
  FaClock,
  FaDownload,
  FaExclamationTriangle,
  FaFilter,
  FaMapMarkerAlt,
  FaMedkit,
  FaPhone,
  FaRedo,
  FaSearch,
  FaShieldAlt,
  FaTimes,
  FaTruck,
  FaUserFriends,
  FaUserTie,
  FaUsers,
} from "react-icons/fa";

type Priority = "Critical" | "High" | "Medium" | "Low";

type IncidentStatus =
  | "Incoming"
  | "Acknowledged"
  | "Assessing"
  | "Assigned"
  | "Dispatched"
  | "En Route"
  | "On Scene"
  | "Completed"
  | "Cancelled";

type IncidentType =
  | "Fire"
  | "Flood"
  | "Road Accident"
  | "Medical Emergency"
  | "Crime"
  | "Missing Person"
  | "Building Collapse"
  | "Water Rescue"
  | "Search & Rescue"
  | "Humanitarian Assistance"
  | "Relief Request"
  | "Blood Emergency"
  | "Other";

interface TimelineEvent {
  id: string;
  status: string;
  message: string;
  timestamp: string;
  actor: string;
}

interface Incident {
  id: string;
  type: IncidentType;
  title: string;
  description: string;
  location: string;
  latitude: number;
  longitude: number;
  priority: Priority;
  status: IncidentStatus;
  reportedAt: string;
  acknowledgedAt?: string;
  dispatchedAt?: string;
  departureAt?: string;
  arrivalAt?: string;
  completedAt?: string;
  assignedTeamId?: string;
  assignedVehicleId?: string;
  assignedDriverId?: string;
  assignedMedicalTeamId?: string;
  contactName: string;
  contactPhone: string;
  affectedPeople: number;
  timeline: TimelineEvent[];
}

interface ResourceOption {
  id: string;
  name: string;
  status: string;
}

const teams: ResourceOption[] = [
  { id: "team-alpha", name: "Rescue Team Alpha", status: "Available" },
  { id: "team-bravo", name: "Medical Response Team Bravo", status: "Available" },
  { id: "team-charlie", name: "Rapid Response Team Charlie", status: "Available" },
  { id: "team-delta", name: "Relief Team Delta", status: "Available" },
];

const vehicles: ResourceOption[] = [
  { id: "AMB-001", name: "AMB-001 • Toyota Hiace", status: "Available" },
  { id: "AMB-002", name: "AMB-002 • Mercedes Sprinter", status: "Available" },
  { id: "RES-001", name: "RES-001 • Rescue Truck", status: "Available" },
  { id: "LOG-001", name: "LOG-001 • Logistics Vehicle", status: "Available" },
];

const drivers: ResourceOption[] = [
  { id: "DRV-001", name: "Mohamed Ali", status: "Available" },
  { id: "DRV-002", name: "Peter Mwangi", status: "Available" },
  { id: "DRV-003", name: "Abdullahi Hassan", status: "Available" },
  { id: "DRV-004", name: "Joseph Otieno", status: "Available" },
];

const medicalTeams: ResourceOption[] = [
  { id: "MED-001", name: "Medical Unit 1", status: "Available" },
  { id: "MED-002", name: "Medical Unit 2", status: "Available" },
  { id: "MED-003", name: "Medical Unit 3", status: "Available" },
];

const initialIncidents: Incident[] = [
  {
    id: "KRCS-2026-00041",
    type: "Flood",
    title: "Flood evacuation support",
    description:
      "Residents require evacuation assistance following rising water levels.",
    location: "Likoni, Mombasa",
    latitude: -4.0917,
    longitude: 39.6636,
    priority: "Critical",
    status: "Incoming",
    reportedAt: "08:42",
    contactName: "Community Emergency Desk",
    contactPhone: "+254 700 000 101",
    affectedPeople: 35,
    timeline: [
      {
        id: "t1",
        status: "Incoming",
        message: "Incident routed to Kenya Red Cross.",
        timestamp: "08:42",
        actor: "System",
      },
    ],
  },
  {
    id: "KRCS-2026-00042",
    type: "Medical Emergency",
    title: "Medical assistance request",
    description: "Multiple patients require urgent medical assistance.",
    location: "Nyali, Mombasa",
    latitude: -4.0347,
    longitude: 39.6942,
    priority: "High",
    status: "Acknowledged",
    reportedAt: "08:34",
    acknowledgedAt: "08:37",
    contactName: "Emergency Caller",
    contactPhone: "+254 711 000 202",
    affectedPeople: 4,
    timeline: [
      {
        id: "t2",
        status: "Incoming",
        message: "Medical incident received.",
        timestamp: "08:34",
        actor: "System",
      },
      {
        id: "t3",
        status: "Acknowledged",
        message: "Dispatcher acknowledged the incident.",
        timestamp: "08:37",
        actor: "Dispatcher",
      },
    ],
  },
  {
    id: "KRCS-2026-00043",
    type: "Road Accident",
    title: "Road traffic accident",
    description:
      "Traffic accident requiring medical and rescue support.",
    location: "Mtwapa Road",
    latitude: -3.9445,
    longitude: 39.7447,
    priority: "High",
    status: "Dispatched",
    reportedAt: "08:21",
    acknowledgedAt: "08:23",
    dispatchedAt: "08:29",
    assignedTeamId: "team-bravo",
    assignedVehicleId: "AMB-001",
    assignedDriverId: "DRV-001",
    assignedMedicalTeamId: "MED-001",
    contactName: "Traffic Control",
    contactPhone: "+254 722 000 303",
    affectedPeople: 6,
    timeline: [
      {
        id: "t4",
        status: "Incoming",
        message: "Road accident reported.",
        timestamp: "08:21",
        actor: "System",
      },
      {
        id: "t5",
        status: "Assigned",
        message: "Medical team and ambulance assigned.",
        timestamp: "08:27",
        actor: "Dispatcher",
      },
      {
        id: "t6",
        status: "Dispatched",
        message: "Resources dispatched.",
        timestamp: "08:29",
        actor: "Dispatcher",
      },
    ],
  },
  {
    id: "KRCS-2026-00044",
    type: "Relief Request",
    title: "Emergency relief distribution",
    description:
      "Affected households require emergency food and hygiene supplies.",
    location: "Kisauni, Mombasa",
    latitude: -4.0107,
    longitude: 39.675,
    priority: "Medium",
    status: "Assigned",
    reportedAt: "07:55",
    acknowledgedAt: "08:01",
    assignedTeamId: "team-delta",
    assignedVehicleId: "LOG-001",
    contactName: "Relief Centre",
    contactPhone: "+254 733 000 404",
    affectedPeople: 120,
    timeline: [
      {
        id: "t7",
        status: "Incoming",
        message: "Relief request received.",
        timestamp: "07:55",
        actor: "System",
      },
      {
        id: "t8",
        status: "Assigned",
        message: "Relief Team Delta assigned.",
        timestamp: "08:05",
        actor: "Dispatcher",
      },
    ],
  },
  {
    id: "KRCS-2026-00045",
    type: "Blood Emergency",
    title: "Urgent blood request",
    description:
      "Hospital has submitted an urgent blood coordination request.",
    location: "Mombasa County Referral Hospital",
    latitude: -4.0565,
    longitude: 39.6678,
    priority: "Critical",
    status: "Incoming",
    reportedAt: "08:51",
    contactName: "Hospital Blood Bank",
    contactPhone: "+254 744 000 505",
    affectedPeople: 2,
    timeline: [
      {
        id: "t9",
        status: "Incoming",
        message: "Urgent blood request received.",
        timestamp: "08:51",
        actor: "System",
      },
    ],
  },
];

const priorityClasses: Record<Priority, string> = {
  Critical: "bg-red-100 text-red-700",
  High: "bg-orange-100 text-orange-700",
  Medium: "bg-yellow-100 text-yellow-700",
  Low: "bg-green-100 text-green-700",
};

const statusClasses: Record<IncidentStatus, string> = {
  Incoming: "bg-red-50 text-red-700 border-red-200",
  Acknowledged: "bg-blue-50 text-blue-700 border-blue-200",
  Assessing: "bg-purple-50 text-purple-700 border-purple-200",
  Assigned: "bg-indigo-50 text-indigo-700 border-indigo-200",
  Dispatched: "bg-cyan-50 text-cyan-700 border-cyan-200",
  "En Route": "bg-orange-50 text-orange-700 border-orange-200",
  "On Scene": "bg-emerald-50 text-emerald-700 border-emerald-200",
  Completed: "bg-green-50 text-green-700 border-green-200",
  Cancelled: "bg-slate-100 text-slate-600 border-slate-200",
};

function currentTime(): string {
  return new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function RedCrossDispatch() {
  const [incidents, setIncidents] = useState<Incident[]>(initialIncidents);
  const [selectedId, setSelectedId] = useState(initialIncidents[0].id);
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "overview" | "assignment" | "timeline"
  >("overview");

  const selectedIncident =
    incidents.find((incident) => incident.id === selectedId) ?? incidents[0];

  const filteredIncidents = useMemo(() => {
    const query = search.toLowerCase().trim();

    return incidents.filter((incident) => {
      const matchesSearch =
        !query ||
        incident.id.toLowerCase().includes(query) ||
        incident.title.toLowerCase().includes(query) ||
        incident.location.toLowerCase().includes(query) ||
        incident.type.toLowerCase().includes(query);

      const matchesPriority =
        priorityFilter === "All" || incident.priority === priorityFilter;

      const matchesStatus =
        statusFilter === "All" || incident.status === statusFilter;

      const matchesType = typeFilter === "All" || incident.type === typeFilter;

      return (
        matchesSearch &&
        matchesPriority &&
        matchesStatus &&
        matchesType
      );
    });
  }, [incidents, search, priorityFilter, statusFilter, typeFilter]);

  const activeCount = incidents.filter(
    (incident) =>
      !["Completed", "Cancelled"].includes(incident.status),
  ).length;

  const criticalCount = incidents.filter(
    (incident) =>
      incident.priority === "Critical" &&
      !["Completed", "Cancelled"].includes(incident.status),
  ).length;

  const unassignedCount = incidents.filter(
    (incident) =>
      !incident.assignedTeamId &&
      !["Completed", "Cancelled"].includes(incident.status),
  ).length;

  const dispatchedCount = incidents.filter((incident) =>
    ["Dispatched", "En Route", "On Scene"].includes(incident.status),
  ).length;

  const addTimeline = (
    incident: Incident,
    status: IncidentStatus,
    message: string,
  ): Incident => ({
    ...incident,
    status,
    timeline: [
      ...incident.timeline,
      {
        id: `${Date.now()}-${Math.random()}`,
        status,
        message,
        timestamp: currentTime(),
        actor: "Dispatcher",
      },
    ],
  });

  const updateIncident = (
    id: string,
    updates: Partial<Incident>,
    timeline?: {
      status: IncidentStatus;
      message: string;
    },
  ) => {
    setIncidents((current) =>
      current.map((incident) => {
        if (incident.id !== id) return incident;

        let updated: Incident = {
          ...incident,
          ...updates,
        };

        if (timeline) {
          updated = addTimeline(
            updated,
            timeline.status,
            timeline.message,
          );
        }

        return updated;
      }),
    );
  };

  const acknowledgeIncident = () => {
    if (!selectedIncident) return;

    updateIncident(
      selectedIncident.id,
      {
        acknowledgedAt: currentTime(),
      },
      {
        status: "Acknowledged",
        message: "Dispatcher acknowledged incoming incident.",
      },
    );
  };

  const dispatchIncident = () => {
    if (!selectedIncident) return;

    if (
      !selectedIncident.assignedTeamId &&
      !selectedIncident.assignedVehicleId
    ) {
      window.alert(
        "Assign at least a response team or vehicle before dispatching.",
      );
      return;
    }

    updateIncident(
      selectedIncident.id,
      {
        dispatchedAt: currentTime(),
      },
      {
        status: "Dispatched",
        message: "Response resources dispatched.",
      },
    );
  };

  const updateStatus = (status: IncidentStatus, message: string) => {
    if (!selectedIncident) return;

    const updates: Partial<Incident> = {};

    if (status === "En Route") {
      updates.departureAt = currentTime();
    }

    if (status === "On Scene") {
      updates.arrivalAt = currentTime();
    }

    if (status === "Completed") {
      updates.completedAt = currentTime();
    }

    updateIncident(selectedIncident.id, updates, {
      status,
      message,
    });
  };

  const assignResource = (
    field:
      | "assignedTeamId"
      | "assignedVehicleId"
      | "assignedDriverId"
      | "assignedMedicalTeamId",
    value: string,
    label: string,
  ) => {
    if (!selectedIncident) return;

    updateIncident(
      selectedIncident.id,
      {
        [field]: value || undefined,
      },
      value
        ? {
            status:
              selectedIncident.status === "Incoming"
                ? "Assigned"
                : selectedIncident.status,
            message: `${label} assigned to incident.`,
          }
        : undefined,
    );
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    if (!selectedIncident) return;

    const report = `
KENYA RED CROSS SOCIETY
EMERGENCY OPERATIONS CENTRE
DISPATCH INCIDENT REPORT

Incident ID: ${selectedIncident.id}
Incident Type: ${selectedIncident.type}
Title: ${selectedIncident.title}
Priority: ${selectedIncident.priority}
Status: ${selectedIncident.status}
Location: ${selectedIncident.location}
Coordinates: ${selectedIncident.latitude}, ${selectedIncident.longitude}

Reported: ${selectedIncident.reportedAt}
Acknowledged: ${selectedIncident.acknowledgedAt ?? "N/A"}
Dispatched: ${selectedIncident.dispatchedAt ?? "N/A"}
Departure: ${selectedIncident.departureAt ?? "N/A"}
Arrival: ${selectedIncident.arrivalAt ?? "N/A"}
Completed: ${selectedIncident.completedAt ?? "N/A"}

Contact: ${selectedIncident.contactName}
Phone: ${selectedIncident.contactPhone}
Affected People: ${selectedIncident.affectedPeople}

Response Team:
${
  teams.find((item) => item.id === selectedIncident.assignedTeamId)
    ?.name ?? "Not assigned"
}

Vehicle:
${
  vehicles.find((item) => item.id === selectedIncident.assignedVehicleId)
    ?.name ?? "Not assigned"
}

Driver:
${
  drivers.find((item) => item.id === selectedIncident.assignedDriverId)
    ?.name ?? "Not assigned"
}

Medical Team:
${
  medicalTeams.find(
    (item) => item.id === selectedIncident.assignedMedicalTeamId,
  )?.name ?? "Not assigned"
}

RESPONSE TIMELINE
${selectedIncident.timeline
  .map(
    (event) =>
      `${event.timestamp} | ${event.status} | ${event.actor} | ${event.message}`,
  )
  .join("\n")}
`;

    const blob = new Blob([report], {
      type: "text/plain;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = `${selectedIncident.id}-dispatch-report.txt`;
    anchor.click();

    URL.revokeObjectURL(url);
  };

  const openGIS = () => {
    if (!selectedIncident) return;

    const params = new URLSearchParams({
      incidentId: selectedIncident.id,
      lat: String(selectedIncident.latitude),
      lng: String(selectedIncident.longitude),
    });

    window.location.href = `/redcross/gis?${params.toString()}`;
  };

  const renderAssignmentSelect = (
    label: string,
    icon: React.ReactNode,
    value: string | undefined,
    options: ResourceOption[],
    field:
      | "assignedTeamId"
      | "assignedVehicleId"
      | "assignedDriverId"
      | "assignedMedicalTeamId",
  ) => (
    <div>
      <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
        {icon}
        {label}
      </label>

      <select
        value={value ?? ""}
        onChange={(event) =>
          assignResource(
            field,
            event.target.value,
            label,
          )
        }
        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
      >
        <option value="">Not assigned</option>

        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.name} — {option.status}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 print:bg-white">
      <div className="mx-auto max-w-[1800px] p-3 sm:p-5 lg:p-6">
        {/* HEADER */}
        <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-600">
              <FaShieldAlt />
              Kenya Red Cross Society
            </div>

            <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
              Emergency Dispatch Centre
            </h1>

            <p className="mt-1 max-w-3xl text-sm text-slate-500">
              Coordinate incoming humanitarian incidents, medical response,
              rescue resources and field deployments from one operational
              command workspace.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 print:hidden">
            <button
              onClick={openGIS}
              className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
            >
              <FaMapMarkerAlt />
              Open GIS
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
            >
              <FaDownload />
              Print
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-red-700"
            >
              <FaDownload />
              Download Report
            </button>
          </div>
        </div>

        {/* REAL-TIME STATUS */}
        <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-green-500" />
            </span>

            <div>
              <p className="text-sm font-bold text-slate-800">
                Live Operations
              </p>
              <p className="text-xs text-slate-500">
                Incident feed is ready for Firestore real-time listeners and
                Firebase Cloud Messaging.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <FaBell className="text-red-500" />
            Alert engine ready
          </div>
        </div>

        {/* KPI CARDS */}
        <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase text-slate-500">
                Active Incidents
              </p>
              <FaBell className="text-blue-500" />
            </div>
            <p className="mt-2 text-3xl font-black">{activeCount}</p>
          </div>

          <div className="rounded-2xl border border-red-100 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase text-slate-500">
                Critical
              </p>
              <FaExclamationTriangle className="text-red-500" />
            </div>
            <p className="mt-2 text-3xl font-black text-red-600">
              {criticalCount}
            </p>
          </div>

          <div className="rounded-2xl border border-orange-100 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase text-slate-500">
                Unassigned
              </p>
              <FaUsers className="text-orange-500" />
            </div>
            <p className="mt-2 text-3xl font-black text-orange-600">
              {unassignedCount}
            </p>
          </div>

          <div className="rounded-2xl border border-cyan-100 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase text-slate-500">
                Dispatched
              </p>
              <FaAmbulance className="text-cyan-600" />
            </div>
            <p className="mt-2 text-3xl font-black text-cyan-700">
              {dispatchedCount}
            </p>
          </div>
        </div>

        {/* SEARCH + FILTER */}
        <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm print:hidden">
          <div className="flex flex-col gap-3 lg:flex-row">
            <div className="relative flex-1">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search incident ID, type, location or title..."
                className="w-full rounded-xl border border-slate-200 py-3 pl-11 pr-4 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
              />
            </div>

            <button
              onClick={() => setShowFilters((value) => !value)}
              className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700"
            >
              <FaFilter />
              Filters
            </button>
          </div>

          {showFilters && (
            <div className="mt-3 grid grid-cols-1 gap-3 border-t border-slate-100 pt-3 sm:grid-cols-3">
              <select
                value={priorityFilter}
                onChange={(event) => setPriorityFilter(event.target.value)}
                className="rounded-xl border border-slate-200 px-3 py-3 text-sm"
              >
                <option>All</option>
                <option>Critical</option>
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>

              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="rounded-xl border border-slate-200 px-3 py-3 text-sm"
              >
                <option>All</option>
                <option>Incoming</option>
                <option>Acknowledged</option>
                <option>Assessing</option>
                <option>Assigned</option>
                <option>Dispatched</option>
                <option>En Route</option>
                <option>On Scene</option>
                <option>Completed</option>
                <option>Cancelled</option>
              </select>

              <select
                value={typeFilter}
                onChange={(event) => setTypeFilter(event.target.value)}
                className="rounded-xl border border-slate-200 px-3 py-3 text-sm"
              >
                <option>All</option>
                <option>Fire</option>
                <option>Flood</option>
                <option>Road Accident</option>
                <option>Medical Emergency</option>
                <option>Crime</option>
                <option>Missing Person</option>
                <option>Building Collapse</option>
                <option>Water Rescue</option>
                <option>Search & Rescue</option>
                <option>Humanitarian Assistance</option>
                <option>Relief Request</option>
                <option>Blood Emergency</option>
                <option>Other</option>
              </select>
            </div>
          )}
        </div>

        {/* MAIN WORKSPACE */}
        <div className="grid min-h-[700px] grid-cols-1 gap-5 xl:grid-cols-[390px_minmax(0,1fr)]">
          {/* INCOMING QUEUE */}
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-black">Incoming Incidents</h2>
                  <p className="mt-1 text-xs text-slate-500">
                    {filteredIncidents.length} operational records
                  </p>
                </div>

                <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-black text-red-700">
                  LIVE
                </span>
              </div>
            </div>

            <div className="max-h-[650px] overflow-y-auto">
              {filteredIncidents.map((incident) => (
                <button
                  key={incident.id}
                  onClick={() => {
                    setSelectedId(incident.id);
                    setActiveTab("overview");
                  }}
                  className={`w-full border-b border-slate-100 p-4 text-left transition hover:bg-slate-50 ${
                    selectedIncident?.id === incident.id
                      ? "bg-red-50/60"
                      : ""
                  }`}
                >
                  <div className="mb-2 flex items-start justify-between gap-3">
                    <span className="font-black text-slate-900">
                      {incident.id}
                    </span>

                    <span
                      className={`rounded-full px-2 py-1 text-[10px] font-black ${priorityClasses[incident.priority]}`}
                    >
                      {incident.priority}
                    </span>
                  </div>

                  <p className="font-bold text-slate-800">
                    {incident.title}
                  </p>

                  <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                    <FaMapMarkerAlt className="text-red-500" />
                    {incident.location}
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <span
                      className={`rounded-lg border px-2 py-1 text-[10px] font-bold ${statusClasses[incident.status]}`}
                    >
                      {incident.status}
                    </span>

                    <span className="text-xs text-slate-400">
                      {incident.reportedAt}
                    </span>
                  </div>
                </button>
              ))}

              {filteredIncidents.length === 0 && (
                <div className="p-8 text-center text-sm text-slate-500">
                  No incidents match the current filters.
                </div>
              )}
            </div>
          </section>

          {/* INCIDENT WORKSPACE */}
          {selectedIncident && (
            <section className="min-w-0 rounded-2xl border border-slate-200 bg-white shadow-sm">
              {/* INCIDENT HEADER */}
              <div className="border-b border-slate-100 p-4 sm:p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-black text-slate-700">
                        {selectedIncident.id}
                      </span>

                      <span
                        className={`rounded-full px-2 py-1 text-xs font-black ${priorityClasses[selectedIncident.priority]}`}
                      >
                        {selectedIncident.priority}
                      </span>

                      <span
                        className={`rounded-lg border px-2 py-1 text-xs font-bold ${statusClasses[selectedIncident.status]}`}
                      >
                        {selectedIncident.status}
                      </span>
                    </div>

                    <h2 className="text-xl font-black sm:text-2xl">
                      {selectedIncident.title}
                    </h2>

                    <p className="mt-2 max-w-3xl text-sm text-slate-500">
                      {selectedIncident.description}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 print:hidden">
                    <button
                      onClick={openGIS}
                      className="flex items-center gap-2 rounded-xl bg-slate-900 px-3 py-2 text-xs font-bold text-white"
                    >
                      <FaMapMarkerAlt />
                      View Location
                    </button>

                    <button
                      onClick={handleDownload}
                      className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold"
                    >
                      <FaDownload />
                      Report
                    </button>
                  </div>
                </div>

                {/* TABS */}
                <div className="mt-5 flex gap-1 overflow-x-auto border-b border-slate-100">
                  {[
                    ["overview", "Overview"],
                    ["assignment", "Resource Assignment"],
                    ["timeline", "Response Timeline"],
                  ].map(([value, label]) => (
                    <button
                      key={value}
                      onClick={() =>
                        setActiveTab(
                          value as
                            | "overview"
                            | "assignment"
                            | "timeline",
                        )
                      }
                      className={`whitespace-nowrap border-b-2 px-4 py-3 text-sm font-bold ${
                        activeTab === value
                          ? "border-red-600 text-red-600"
                          : "border-transparent text-slate-500"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* OVERVIEW */}
              {activeTab === "overview" && (
                <div className="p-4 sm:p-5">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-xs font-bold uppercase text-slate-400">
                        Incident Type
                      </p>
                      <p className="mt-1 font-black">
                        {selectedIncident.type}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-xs font-bold uppercase text-slate-400">
                        Location
                      </p>
                      <p className="mt-1 flex items-center gap-2 font-black">
                        <FaMapMarkerAlt className="text-red-500" />
                        {selectedIncident.location}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-xs font-bold uppercase text-slate-400">
                        Coordinates
                      </p>
                      <p className="mt-1 font-mono text-sm font-bold">
                        {selectedIncident.latitude},{" "}
                        {selectedIncident.longitude}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-xs font-bold uppercase text-slate-400">
                        Affected People
                      </p>
                      <p className="mt-1 font-black">
                        {selectedIncident.affectedPeople}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 rounded-2xl border border-slate-200 p-4">
                    <h3 className="font-black">Caller / Reporting Source</h3>

                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <div>
                        <p className="text-xs text-slate-400">Contact</p>
                        <p className="font-bold">
                          {selectedIncident.contactName}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-400">Telephone</p>
                        <p className="flex items-center gap-2 font-bold">
                          <FaPhone className="text-green-600" />
                          {selectedIncident.contactPhone}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <button
                      onClick={acknowledgeIncident}
                      disabled={
                        selectedIncident.status !== "Incoming"
                      }
                      className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Acknowledge
                    </button>

                    <button
                      onClick={dispatchIncident}
                      className="rounded-xl bg-red-600 px-4 py-3 text-sm font-black text-white"
                    >
                      Dispatch
                    </button>

                    <button
                      onClick={() =>
                        updateStatus(
                          "En Route",
                          "Response unit marked as en route.",
                        )
                      }
                      className="rounded-xl bg-orange-500 px-4 py-3 text-sm font-black text-white"
                    >
                      En Route
                    </button>

                    <button
                      onClick={() =>
                        updateStatus(
                          "On Scene",
                          "Response unit arrived on scene.",
                        )
                      }
                      className="rounded-xl bg-emerald-600 px-4 py-3 text-sm font-black text-white"
                    >
                      On Scene
                    </button>
                  </div>

                  <div className="mt-3 grid gap-3 sm:grid-cols-3">
                    <button
                      onClick={() =>
                        updateStatus(
                          "Completed",
                          "Incident response completed.",
                        )
                      }
                      className="flex items-center justify-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-black text-green-700"
                    >
                      <FaCheckCircle />
                      Complete
                    </button>

                    <button
                      onClick={() =>
                        updateStatus(
                          "Dispatched",
                          "Incident resources re-dispatched.",
                        )
                      }
                      className="flex items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-black text-blue-700"
                    >
                      <FaRedo />
                      Re-dispatch
                    </button>

                    <button
                      onClick={() =>
                        updateStatus(
                          "Cancelled",
                          "Dispatch cancelled by dispatcher.",
                        )
                      }
                      className="flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-black text-red-700"
                    >
                      <FaTimes />
                      Cancel Dispatch
                    </button>
                  </div>
                </div>
              )}

              {/* ASSIGNMENT */}
              {activeTab === "assignment" && (
                <div className="p-4 sm:p-5">
                  <div className="mb-5 rounded-2xl border border-blue-100 bg-blue-50 p-4">
                    <div className="flex items-start gap-3">
                      <FaUsers className="mt-1 text-blue-600" />

                      <div>
                        <h3 className="font-black text-blue-900">
                          Response Resource Allocation
                        </h3>
                        <p className="mt-1 text-sm text-blue-700">
                          Assign the appropriate humanitarian resources before
                          dispatching the operation.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-5 md:grid-cols-2">
                    {renderAssignmentSelect(
                      "Response Team",
                      <FaUserFriends className="text-blue-600" />,
                      selectedIncident.assignedTeamId,
                      teams,
                      "assignedTeamId",
                    )}

                    {renderAssignmentSelect(
                      "Vehicle",
                      <FaTruck className="text-red-600" />,
                      selectedIncident.assignedVehicleId,
                      vehicles,
                      "assignedVehicleId",
                    )}

                    {renderAssignmentSelect(
                      "Driver",
                      <FaUserTie className="text-purple-600" />,
                      selectedIncident.assignedDriverId,
                      drivers,
                      "assignedDriverId",
                    )}

                    {renderAssignmentSelect(
                      "Medical Team",
                      <FaMedkit className="text-green-600" />,
                      selectedIncident.assignedMedicalTeamId,
                      medicalTeams,
                      "assignedMedicalTeamId",
                    )}
                  </div>

                  <div className="mt-6 rounded-2xl border border-slate-200 p-4">
                    <h3 className="font-black">Current Assignment</h3>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-xl bg-slate-50 p-3">
                        <p className="text-xs text-slate-400">
                          Response Team
                        </p>
                        <p className="font-bold">
                          {teams.find(
                            (item) =>
                              item.id === selectedIncident.assignedTeamId,
                          )?.name ?? "Not assigned"}
                        </p>
                      </div>

                      <div className="rounded-xl bg-slate-50 p-3">
                        <p className="text-xs text-slate-400">Vehicle</p>
                        <p className="font-bold">
                          {vehicles.find(
                            (item) =>
                              item.id ===
                              selectedIncident.assignedVehicleId,
                          )?.name ?? "Not assigned"}
                        </p>
                      </div>

                      <div className="rounded-xl bg-slate-50 p-3">
                        <p className="text-xs text-slate-400">Driver</p>
                        <p className="font-bold">
                          {drivers.find(
                            (item) =>
                              item.id ===
                              selectedIncident.assignedDriverId,
                          )?.name ?? "Not assigned"}
                        </p>
                      </div>

                      <div className="rounded-xl bg-slate-50 p-3">
                        <p className="text-xs text-slate-400">
                          Medical Team
                        </p>
                        <p className="font-bold">
                          {medicalTeams.find(
                            (item) =>
                              item.id ===
                              selectedIncident.assignedMedicalTeamId,
                          )?.name ?? "Not assigned"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={dispatchIncident}
                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 font-black text-white hover:bg-red-700"
                  >
                    Dispatch Assigned Resources
                    <FaArrowRight />
                  </button>
                </div>
              )}

              {/* TIMELINE */}
              {activeTab === "timeline" && (
                <div className="p-4 sm:p-5">
                  <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                    <div className="rounded-xl bg-slate-50 p-3">
                      <p className="text-xs text-slate-400">Reported</p>
                      <p className="mt-1 font-black">
                        {selectedIncident.reportedAt}
                      </p>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-3">
                      <p className="text-xs text-slate-400">
                        Acknowledged
                      </p>
                      <p className="mt-1 font-black">
                        {selectedIncident.acknowledgedAt ?? "—"}
                      </p>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-3">
                      <p className="text-xs text-slate-400">Dispatched</p>
                      <p className="mt-1 font-black">
                        {selectedIncident.dispatchedAt ?? "—"}
                      </p>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-3">
                      <p className="text-xs text-slate-400">Arrival</p>
                      <p className="mt-1 font-black">
                        {selectedIncident.arrivalAt ?? "—"}
                      </p>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-3">
                      <p className="text-xs text-slate-400">Completed</p>
                      <p className="mt-1 font-black">
                        {selectedIncident.completedAt ?? "—"}
                      </p>
                    </div>
                  </div>

                  <div className="relative ml-2 border-l-2 border-slate-200 pl-6">
                    {selectedIncident.timeline.map((event) => (
                      <div
                        key={event.id}
                        className="relative mb-7 last:mb-0"
                      >
                        <span className="absolute -left-[33px] top-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-white bg-red-600 shadow" />

                        <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <p className="font-black">{event.status}</p>
                            <p className="mt-1 text-sm text-slate-500">
                              {event.message}
                            </p>
                            <p className="mt-1 text-xs text-slate-400">
                              By {event.actor}
                            </p>
                          </div>

                          <span className="flex items-center gap-1 text-xs font-bold text-slate-400">
                            <FaClock />
                            {event.timestamp}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* FOOTER ACTION BAR */}
              <div className="border-t border-slate-100 bg-slate-50 p-4 print:hidden">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="text-xs text-slate-500">
                    <span className="font-bold text-slate-700">
                      Operational status:
                    </span>{" "}
                    {selectedIncident.status}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setActiveTab("assignment")}
                      className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold"
                    >
                      <FaUsers />
                      Manage Resources
                    </button>

                    <button
                      onClick={openGIS}
                      className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold"
                    >
                      <FaMapMarkerAlt />
                      Locate on GIS
                    </button>

                    <button
                      onClick={handleDownload}
                      className="flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-xs font-bold text-white"
                    >
                      <FaDownload />
                      Export
                    </button>
                  </div>
                </div>
              </div>
            </section>
          )}
        </div>

        {/* MOBILE OPERATIONAL SUMMARY */}
        <div className="mt-5 grid gap-3 sm:grid-cols-3 print:hidden">
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="flex items-center gap-3">
              <FaClock className="text-blue-500" />
              <div>
                <p className="text-xs text-slate-400">
                  Response Monitoring
                </p>
                <p className="font-black">Active</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="flex items-center gap-3">
              <FaCar className="text-orange-500" />
              <div>
                <p className="text-xs text-slate-400">
                  Resource Tracking
                </p>
                <p className="font-black">Enabled</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="flex items-center gap-3">
              <FaAmbulance className="text-red-500" />
              <div>
                <p className="text-xs text-slate-400">
                  Emergency Dispatch
                </p>
                <p className="font-black">Operational</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}