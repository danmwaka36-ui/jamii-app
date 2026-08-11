import {
  useEffect,
  useMemo,
  useState,
} from "react";

import type { ReactNode } from "react";

import {
  FaAmbulance,
  FaCheckCircle,
  FaClock,
  FaExclamationTriangle,
  FaEye,
  FaFilter,
  FaFire,
  FaMapMarkedAlt,
  FaMapMarkerAlt,
  FaPlus,
  FaSearch,
  FaTimes,
  FaTint,
  FaUserFriends,
} from "react-icons/fa";

import { useNavigate } from "react-router-dom";

import PageHeader from "../../../components/common/PageHeader";
import StatusBadge from "../../../components/common/StatusBadge";

import ReportActions from "../../../components/reporting/ReportActions";

import type {
  ReportColumn,
} from "../../../components/reporting/ReportActions";

/* =========================================================
   TYPES
========================================================= */

type IncidentType =
  | "Medical Emergency"
  | "Flood"
  | "Fire Support"
  | "Road Accident"
  | "Rescue"
  | "Blood Emergency"
  | "Displacement"
  | "Relief Request"
  | "Other";

type IncidentPriority =
  | "Critical"
  | "High"
  | "Medium"
  | "Low";

type IncidentStatus =
  | "Open"
  | "Acknowledged"
  | "Assigned"
  | "Dispatched"
  | "Responding"
  | "On Scene"
  | "Resolved"
  | "Closed";

type IncidentSource =
  | "Citizen"
  | "Police"
  | "Fire"
  | "Ambulance"
  | "County"
  | "Red Cross"
  | "Nyumba Kumi"
  | "Emergency Hotline";

type Incident = {
  id: string;

  reference: string;

  type: IncidentType;

  title: string;

  description: string;

  priority: IncidentPriority;

  status: IncidentStatus;

  source: IncidentSource;

  location: string;

  county: string;

  latitude?: number;

  longitude?: number;

  reporterName: string;

  reporterPhone: string;

  assignedTeam?: string;

  assignedVehicle?: string;

  responseLead?: string;

  casualties?: number;

  affectedPeople?: number;

  acknowledgedAt?: string;

  dispatchedAt?: string;

  onSceneAt?: string;

  resolvedAt?: string;

  createdAt: string;

  updatedAt: string;
};

/* =========================================================
   INITIAL DATA
========================================================= */

const initialIncidents: Incident[] = [
  {
    id: "INC-001",

    reference: "KRCS-2026-001",

    type: "Flood",

    title: "Flood evacuation support",

    description:
      "Several households affected by heavy flooding. Evacuation and relief assistance requested.",

    priority: "Critical",

    status: "Dispatched",

    source: "County",

    location: "Likoni, Mombasa",

    county: "Mombasa",

    latitude: -4.0901,

    longitude: 39.6612,

    reporterName: "County Emergency Desk",

    reporterPhone: "+254 700 000 101",

    assignedTeam: "Rescue Team Alpha",

    assignedVehicle: "KRCS-RSC-002",

    responseLead: "Peter Mwangi",

    affectedPeople: 46,

    acknowledgedAt:
      "2026-08-11T08:05:00",

    dispatchedAt:
      "2026-08-11T08:12:00",

    createdAt:
      "2026-08-11T08:01:00",

    updatedAt:
      "2026-08-11T08:12:00",
  },

  {
    id: "INC-002",

    reference: "KRCS-2026-002",

    type: "Medical Emergency",

    title: "Emergency medical assistance",

    description:
      "Adult patient experiencing respiratory distress requiring urgent medical support.",

    priority: "High",

    status: "Responding",

    source: "Citizen",

    location: "Nyali, Mombasa",

    county: "Mombasa",

    latitude: -4.0435,

    longitude: 39.7011,

    reporterName: "Amina Hassan",

    reporterPhone: "+254 700 000 102",

    assignedTeam: "Medical Unit 3",

    assignedVehicle: "KRCS-AMB-007",

    responseLead: "Dr. Amina Hassan",

    casualties: 1,

    acknowledgedAt:
      "2026-08-11T09:14:00",

    dispatchedAt:
      "2026-08-11T09:18:00",

    createdAt:
      "2026-08-11T09:10:00",

    updatedAt:
      "2026-08-11T09:22:00",
  },

  {
    id: "INC-003",

    reference: "KRCS-2026-003",

    type: "Relief Request",

    title: "Relief distribution coordination",

    description:
      "Emergency supply delivery requested for displaced households.",

    priority: "Medium",

    status: "Assigned",

    source: "Nyumba Kumi",

    location: "Kisauni, Mombasa",

    county: "Mombasa",

    reporterName: "Community Coordinator",

    reporterPhone: "+254 700 000 103",

    assignedTeam: "Relief Team 2",

    assignedVehicle: "KRCS-LOG-004",

    affectedPeople: 92,

    createdAt:
      "2026-08-11T10:00:00",

    updatedAt:
      "2026-08-11T10:30:00",
  },

  {
    id: "INC-004",

    reference: "KRCS-2026-004",

    type: "Blood Emergency",

    title: "Urgent blood request",

    description:
      "Hospital requesting urgent blood donor coordination for emergency surgery.",

    priority: "High",

    status: "Open",

    source: "Emergency Hotline",

    location: "Mvita, Mombasa",

    county: "Mombasa",

    reporterName: "Hospital Emergency Desk",

    reporterPhone: "+254 700 000 104",

    casualties: 1,

    createdAt:
      "2026-08-11T10:40:00",

    updatedAt:
      "2026-08-11T10:40:00",
  },
];

/* =========================================================
   HELPERS
========================================================= */

function incidentIcon(
  type: IncidentType
) {
  switch (type) {
    case "Medical Emergency":
      return <FaAmbulance />;

    case "Flood":
      return <FaTint />;

    case "Fire Support":
      return <FaFire />;

    case "Blood Emergency":
      return <FaTint />;

    case "Rescue":
      return <FaUserFriends />;

    default:
      return <FaExclamationTriangle />;
  }
}

function priorityStyle(
  priority: IncidentPriority
) {
  switch (priority) {
    case "Critical":
      return "bg-red-100 text-red-700";

    case "High":
      return "bg-orange-100 text-orange-700";

    case "Medium":
      return "bg-amber-100 text-amber-700";

    default:
      return "bg-slate-100 text-slate-600";
  }
}

function formatDateTime(
  value?: string
) {
  if (!value) {
    return "Not recorded";
  }

  return new Date(
    value
  ).toLocaleString();
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function RedCrossIncidents() {
  const navigate = useNavigate();

  const [
    incidents,
    setIncidents,
  ] =
    useState<Incident[]>(() => {
      const saved =
        localStorage.getItem(
          "jamii-redcross-incidents"
        );

      return saved
        ? JSON.parse(saved)
        : initialIncidents;
    });

  const [search, setSearch] =
    useState("");

  const [
    statusFilter,
    setStatusFilter,
  ] =
    useState("all");

  const [
    priorityFilter,
    setPriorityFilter,
  ] =
    useState("all");

  const [
    typeFilter,
    setTypeFilter,
  ] =
    useState("all");

  const [
    selectedIncident,
    setSelectedIncident,
  ] =
    useState<Incident | null>(null);

  const [
    newIncidentOpen,
    setNewIncidentOpen,
  ] =
    useState(false);

  const [
    newIncident,
    setNewIncident,
  ] = useState({
    type:
      "Medical Emergency" as IncidentType,

    title: "",

    description: "",

    priority:
      "Medium" as IncidentPriority,

    source:
      "Red Cross" as IncidentSource,

    location: "",

    county: "Mombasa",

    reporterName: "",

    reporterPhone: "",

    casualties: "",

    affectedPeople: "",
  });

  useEffect(() => {
    localStorage.setItem(
      "jamii-redcross-incidents",
      JSON.stringify(
        incidents
      )
    );
  }, [incidents]);

  /* ======================================================
     FILTERS
  ====================================================== */

  const filteredIncidents =
    useMemo(() => {
      const value =
        search
          .trim()
          .toLowerCase();

      return incidents.filter(
        (incident) => {
          const matchesSearch =
            !value ||
            incident.reference
              .toLowerCase()
              .includes(value) ||
            incident.title
              .toLowerCase()
              .includes(value) ||
            incident.location
              .toLowerCase()
              .includes(value) ||
            incident.reporterName
              .toLowerCase()
              .includes(value) ||
            incident.type
              .toLowerCase()
              .includes(value);

          const matchesStatus =
            statusFilter ===
              "all" ||
            incident.status ===
              statusFilter;

          const matchesPriority =
            priorityFilter ===
              "all" ||
            incident.priority ===
              priorityFilter;

          const matchesType =
            typeFilter ===
              "all" ||
            incident.type ===
              typeFilter;

          return (
            matchesSearch &&
            matchesStatus &&
            matchesPriority &&
            matchesType
          );
        }
      );
    }, [
      incidents,
      search,
      statusFilter,
      priorityFilter,
      typeFilter,
    ]);

  /* ======================================================
     KPI
  ====================================================== */

  const stats =
    useMemo(
      () => ({
        total:
          incidents.length,

        critical:
          incidents.filter(
            (incident) =>
              incident.priority ===
              "Critical"
          ).length,

        active:
          incidents.filter(
            (incident) =>
              ![
                "Resolved",
                "Closed",
              ].includes(
                incident.status
              )
          ).length,

        dispatched:
          incidents.filter(
            (incident) =>
              [
                "Dispatched",
                "Responding",
                "On Scene",
              ].includes(
                incident.status
              )
          ).length,

        resolved:
          incidents.filter(
            (incident) =>
              incident.status ===
                "Resolved" ||
              incident.status ===
                "Closed"
          ).length,
      }),
      [incidents]
    );

  /* ======================================================
     CREATE INCIDENT
  ====================================================== */

  function createIncident() {
    if (
      !newIncident.title.trim() ||
      !newIncident.location.trim()
    ) {
      window.alert(
        "Incident title and location are required."
      );

      return;
    }

    const nextNumber =
      incidents.length + 1;

    const incident: Incident = {
      id: `INC-${String(
        nextNumber
      ).padStart(
        3,
        "0"
      )}`,

      reference: `KRCS-${new Date().getFullYear()}-${String(
        nextNumber
      ).padStart(
        3,
        "0"
      )}`,

      type:
        newIncident.type,

      title:
        newIncident.title.trim(),

      description:
        newIncident.description.trim(),

      priority:
        newIncident.priority,

      status:
        "Open",

      source:
        newIncident.source,

      location:
        newIncident.location.trim(),

      county:
        newIncident.county.trim() ||
        "Mombasa",

      reporterName:
        newIncident.reporterName.trim(),

      reporterPhone:
        newIncident.reporterPhone.trim(),

      casualties:
        newIncident.casualties
          ? Number(
              newIncident.casualties
            )
          : undefined,

      affectedPeople:
        newIncident.affectedPeople
          ? Number(
              newIncident.affectedPeople
            )
          : undefined,

      createdAt:
        new Date().toISOString(),

      updatedAt:
        new Date().toISOString(),
    };

    setIncidents(
      (current) => [
        incident,
        ...current,
      ]
    );

    setNewIncidentOpen(
      false
    );

    setNewIncident({
      type:
        "Medical Emergency",

      title: "",

      description: "",

      priority:
        "Medium",

      source:
        "Red Cross",

      location: "",

      county:
        "Mombasa",

      reporterName: "",

      reporterPhone: "",

      casualties: "",

      affectedPeople: "",
    });
  }

  /* ======================================================
     STATUS WORKFLOW
  ====================================================== */

  function updateIncidentStatus(
    incidentId: string,
    status: IncidentStatus
  ) {
    const now =
      new Date().toISOString();

    setIncidents(
      (current) =>
        current.map(
          (incident) => {
            if (
              incident.id !==
              incidentId
            ) {
              return incident;
            }

            const updates:
              Partial<Incident> = {
                status,
                updatedAt: now,
              };

            if (
              status ===
              "Acknowledged" &&
              !incident.acknowledgedAt
            ) {
              updates.acknowledgedAt =
                now;
            }

            if (
              status ===
              "Dispatched" &&
              !incident.dispatchedAt
            ) {
              updates.dispatchedAt =
                now;
            }

            if (
              status ===
              "On Scene" &&
              !incident.onSceneAt
            ) {
              updates.onSceneAt =
                now;
            }

            if (
              status ===
                "Resolved" &&
              !incident.resolvedAt
            ) {
              updates.resolvedAt =
                now;
            }

            return {
              ...incident,
              ...updates,
            };
          }
        )
    );

    setSelectedIncident(
      (current) =>
        current?.id ===
        incidentId
          ? {
              ...current,

              status,

              updatedAt:
                now,

              acknowledgedAt:
                status ===
                  "Acknowledged" &&
                !current.acknowledgedAt
                  ? now
                  : current.acknowledgedAt,

              dispatchedAt:
                status ===
                  "Dispatched" &&
                !current.dispatchedAt
                  ? now
                  : current.dispatchedAt,

              onSceneAt:
                status ===
                  "On Scene" &&
                !current.onSceneAt
                  ? now
                  : current.onSceneAt,

              resolvedAt:
                status ===
                  "Resolved" &&
                !current.resolvedAt
                  ? now
                  : current.resolvedAt,
            }
          : current
    );
  }

  /* ======================================================
     REPORTING
  ====================================================== */

  const incidentReportColumns:
    ReportColumn<Incident>[] = [
      {
        label:
          "Reference",

        value:
          (incident) =>
            incident.reference,
      },

      {
        label:
          "Incident Type",

        value:
          (incident) =>
            incident.type,
      },

      {
        label:
          "Title",

        value:
          (incident) =>
            incident.title,
      },

      {
        label:
          "Priority",

        value:
          (incident) =>
            incident.priority,
      },

      {
        label:
          "Status",

        value:
          (incident) =>
            incident.status,
      },

      {
        label:
          "Location",

        value:
          (incident) =>
            incident.location,
      },

      {
        label:
          "Source",

        value:
          (incident) =>
            incident.source,
      },

      {
        label:
          "Reporter",

        value:
          (incident) =>
            incident.reporterName,
      },

      {
        label:
          "Assigned Team",

        value:
          (incident) =>
            incident.assignedTeam ||
            "Unassigned",
      },

      {
        label:
          "Vehicle",

        value:
          (incident) =>
            incident.assignedVehicle ||
            "Unassigned",
      },

      {
        label:
          "Created",

        value:
          (incident) =>
            formatDateTime(
              incident.createdAt
            ),
      },
    ];

  const singleIncidentColumns:
    ReportColumn<Incident>[] = [
      ...incidentReportColumns,

      {
        label:
          "Response Lead",

        value:
          (incident) =>
            incident.responseLead ||
            "Not assigned",
      },

      {
        label:
          "Casualties",

        value:
          (incident) =>
            incident.casualties ??
            0,
      },

      {
        label:
          "Affected People",

        value:
          (incident) =>
            incident.affectedPeople ??
            0,
      },

      {
        label:
          "Description",

        value:
          (incident) =>
            incident.description,
      },
    ];

  return (
    <div className="space-y-7">
      <PageHeader
        title="Emergency Incidents"
        subtitle="Monitor, verify, coordinate and manage humanitarian incidents requiring Kenya Red Cross response."
        icon={
          <FaExclamationTriangle />
        }
        badge="Incident Command"
        badgeColor="red"
        actions={
          <ReportActions
            title="Kenya Red Cross Emergency Incident Report"
            subtitle="Emergency incidents currently visible under the selected filters."
            fileName="red-cross-emergency-incidents"
            data={
              filteredIncidents
            }
            columns={
              incidentReportColumns
            }
          />
        }
      />

      {/* ===================================================
          KPI
      =================================================== */}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <Metric
          title="Total Incidents"
          value={stats.total}
          icon={
            <FaExclamationTriangle />
          }
        />

        <Metric
          title="Critical"
          value={
            stats.critical
          }
          icon={<FaFire />}
          className="border-red-200 bg-red-50"
        />

        <Metric
          title="Active"
          value={stats.active}
          icon={<FaClock />}
          className="border-orange-200 bg-orange-50"
        />

        <Metric
          title="Deployed"
          value={
            stats.dispatched
          }
          icon={
            <FaAmbulance />
          }
          className="border-blue-200 bg-blue-50"
        />

        <Metric
          title="Resolved"
          value={
            stats.resolved
          }
          icon={
            <FaCheckCircle />
          }
          className="border-emerald-200 bg-emerald-50"
        />
      </section>

      {/* ===================================================
          SEARCH + FILTER
      =================================================== */}

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-3 xl:grid-cols-[1fr_180px_180px_220px_auto_auto]">
          <div className="relative">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

            <input
              type="search"
              value={search}
              onChange={(
                event
              ) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search incident, reference, location, reporter..."
              className="w-full rounded-xl border border-slate-200 py-3 pl-11 pr-4 outline-none focus:border-red-500 focus:ring-4 focus:ring-red-100"
            />
          </div>

          <select
            value={
              statusFilter
            }
            onChange={(
              event
            ) =>
              setStatusFilter(
                event.target.value
              )
            }
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm"
          >
            <option value="all">
              All Statuses
            </option>

            <option value="Open">
              Open
            </option>

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

            <option value="Closed">
              Closed
            </option>
          </select>

          <select
            value={
              priorityFilter
            }
            onChange={(
              event
            ) =>
              setPriorityFilter(
                event.target.value
              )
            }
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm"
          >
            <option value="all">
              All Priorities
            </option>

            <option value="Critical">
              Critical
            </option>

            <option value="High">
              High
            </option>

            <option value="Medium">
              Medium
            </option>

            <option value="Low">
              Low
            </option>
          </select>

          <select
            value={
              typeFilter
            }
            onChange={(
              event
            ) =>
              setTypeFilter(
                event.target.value
              )
            }
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm"
          >
            <option value="all">
              All Incident Types
            </option>

            <option value="Medical Emergency">
              Medical Emergency
            </option>

            <option value="Flood">
              Flood
            </option>

            <option value="Fire Support">
              Fire Support
            </option>

            <option value="Road Accident">
              Road Accident
            </option>

            <option value="Rescue">
              Rescue
            </option>

            <option value="Blood Emergency">
              Blood Emergency
            </option>

            <option value="Displacement">
              Displacement
            </option>

            <option value="Relief Request">
              Relief Request
            </option>

            <option value="Other">
              Other
            </option>
          </select>

          <button
            type="button"
            onClick={() => {
              setSearch("");

              setStatusFilter(
                "all"
              );

              setPriorityFilter(
                "all"
              );

              setTypeFilter(
                "all"
              );
            }}
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700"
          >
            <FaFilter />

            Reset
          </button>

          <button
            type="button"
            onClick={() =>
              setNewIncidentOpen(
                true
              )
            }
            className="flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white"
          >
            <FaPlus />

            New Incident
          </button>
        </div>
      </section>

      {/* ===================================================
          INCIDENT CARDS
      =================================================== */}

      <section className="grid gap-5 xl:grid-cols-2">
        {filteredIncidents.map(
          (incident) => (
            <article
              key={
                incident.id
              }
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="p-5">
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-red-100 text-2xl text-red-700">
                    {incidentIcon(
                      incident.type
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                          {
                            incident.reference
                          }
                        </p>

                        <h2 className="mt-1 text-lg font-extrabold text-slate-950">
                          {
                            incident.title
                          }
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                          {
                            incident.type
                          }
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${priorityStyle(
                            incident.priority
                          )}`}
                        >
                          {
                            incident.priority
                          }
                        </span>

                        <StatusBadge
                          status={
                            incident.status
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <p className="mt-5 text-sm leading-6 text-slate-600">
                  {
                    incident.description
                  }
                </p>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <Info
                    label="Location"
                    value={
                      incident.location
                    }
                    icon={
                      <FaMapMarkerAlt />
                    }
                  />

                  <Info
                    label="Source"
                    value={
                      incident.source
                    }
                    icon={
                      <FaUserFriends />
                    }
                  />

                  <Info
                    label="Assigned Team"
                    value={
                      incident.assignedTeam ||
                      "Unassigned"
                    }
                    icon={
                      <FaUserFriends />
                    }
                  />

                  <Info
                    label="Vehicle"
                    value={
                      incident.assignedVehicle ||
                      "Unassigned"
                    }
                    icon={
                      <FaAmbulance />
                    }
                  />
                </div>

                <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
                  <p className="text-xs text-slate-500">
                    Reported{" "}
                    {formatDateTime(
                      incident.createdAt
                    )}
                  </p>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          `/redcross/gis?incident=${incident.id}`
                        )
                      }
                      className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700"
                    >
                      <FaMapMarkedAlt />

                      GIS
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setSelectedIncident(
                          incident
                        )
                      }
                      className="flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2 text-sm font-bold text-white"
                    >
                      <FaEye />

                      Open
                    </button>
                  </div>
                </div>
              </div>
            </article>
          )
        )}
      </section>

      {filteredIncidents.length ===
        0 && (
        <section className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <FaExclamationTriangle className="mx-auto text-5xl text-slate-300" />

          <h2 className="mt-4 text-xl font-extrabold text-slate-900">
            No incidents found
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Adjust the search or incident filters.
          </p>
        </section>
      )}

      {/* ===================================================
          INCIDENT DRAWER
      =================================================== */}

      {selectedIncident && (
        <>
          <button
            type="button"
            aria-label="Close incident"
            onClick={() =>
              setSelectedIncident(
                null
              )
            }
            className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm"
          />

          <aside className="fixed bottom-0 right-0 top-0 z-50 flex w-full max-w-2xl flex-col bg-white shadow-2xl">
            <div className="flex items-start justify-between bg-slate-950 p-6 text-white">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-red-300">
                  {
                    selectedIncident.reference
                  }
                </p>

                <h2 className="mt-2 text-2xl font-extrabold">
                  {
                    selectedIncident.title
                  }
                </h2>

                <p className="mt-1 text-sm text-slate-300">
                  {
                    selectedIncident.type
                  }
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedIncident(
                    null
                  )
                }
                className="rounded-xl p-3 hover:bg-slate-800"
              >
                <FaTimes />
              </button>
            </div>

            <div className="flex-1 space-y-6 overflow-y-auto p-6">
              <div className="flex flex-wrap gap-2">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold ${priorityStyle(
                    selectedIncident.priority
                  )}`}
                >
                  {
                    selectedIncident.priority
                  }
                </span>

                <StatusBadge
                  status={
                    selectedIncident.status
                  }
                />
              </div>

              <ReportActions
                title={`${selectedIncident.reference} - Incident Report`}
                subtitle={
                  selectedIncident.title
                }
                fileName={
                  selectedIncident.reference
                }
                data={[
                  selectedIncident,
                ]}
                columns={
                  singleIncidentColumns
                }
              />

              <div className="rounded-2xl border border-slate-200 p-5">
                <h3 className="font-extrabold text-slate-950">
                  Incident Information
                </h3>

                <div className="mt-4 space-y-3 text-sm">
                  <Detail
                    label="Location"
                    value={
                      selectedIncident.location
                    }
                  />

                  <Detail
                    label="County"
                    value={
                      selectedIncident.county
                    }
                  />

                  <Detail
                    label="Reporter"
                    value={
                      selectedIncident.reporterName ||
                      "Not recorded"
                    }
                  />

                  <Detail
                    label="Reporter Phone"
                    value={
                      selectedIncident.reporterPhone ||
                      "Not recorded"
                    }
                  />

                  <Detail
                    label="Source"
                    value={
                      selectedIncident.source
                    }
                  />

                  <Detail
                    label="Casualties"
                    value={String(
                      selectedIncident.casualties ??
                        0
                    )}
                  />

                  <Detail
                    label="Affected People"
                    value={String(
                      selectedIncident.affectedPeople ??
                        0
                    )}
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 p-5">
                <h3 className="font-extrabold text-slate-950">
                  Response Assignment
                </h3>

                <div className="mt-4 space-y-3 text-sm">
                  <Detail
                    label="Team"
                    value={
                      selectedIncident.assignedTeam ||
                      "Unassigned"
                    }
                  />

                  <Detail
                    label="Vehicle"
                    value={
                      selectedIncident.assignedVehicle ||
                      "Unassigned"
                    }
                  />

                  <Detail
                    label="Response Lead"
                    value={
                      selectedIncident.responseLead ||
                      "Unassigned"
                    }
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 p-5">
                <h3 className="font-extrabold text-slate-950">
                  Response Timeline
                </h3>

                <div className="mt-4 space-y-4">
                  <Timeline
                    title="Incident Reported"
                    time={
                      selectedIncident.createdAt
                    }
                  />

                  <Timeline
                    title="Acknowledged"
                    time={
                      selectedIncident.acknowledgedAt
                    }
                  />

                  <Timeline
                    title="Dispatched"
                    time={
                      selectedIncident.dispatchedAt
                    }
                  />

                  <Timeline
                    title="On Scene"
                    time={
                      selectedIncident.onSceneAt
                    }
                  />

                  <Timeline
                    title="Resolved"
                    time={
                      selectedIncident.resolvedAt
                    }
                  />
                </div>
              </div>

              <label className="block text-sm font-bold text-slate-700">
                Incident Status

                <select
                  value={
                    selectedIncident.status
                  }
                  onChange={(
                    event
                  ) =>
                    updateIncidentStatus(
                      selectedIncident.id,
                      event.target
                        .value as IncidentStatus
                    )
                  }
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 font-normal outline-none focus:border-red-500"
                >
                  <option value="Open">
                    Open
                  </option>

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

                  <option value="Closed">
                    Closed
                  </option>
                </select>
              </label>

              <button
                type="button"
                onClick={() =>
                  navigate(
                    `/redcross/gis?incident=${selectedIncident.id}`
                  )
                }
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-bold text-white"
              >
                <FaMapMarkedAlt />

                Open Incident on GIS
              </button>
            </div>
          </aside>
        </>
      )}

      {/* ===================================================
          NEW INCIDENT MODAL
      =================================================== */}

      {newIncidentOpen && (
        <>
          <button
            type="button"
            aria-label="Close incident form"
            onClick={() =>
              setNewIncidentOpen(
                false
              )
            }
            className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm"
          />

          <div className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-3xl -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between bg-slate-950 p-6 text-white">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-red-300">
                  Incident Command
                </p>

                <h2 className="mt-2 text-2xl font-extrabold">
                  Create Incident
                </h2>
              </div>

              <button
                type="button"
                onClick={() =>
                  setNewIncidentOpen(
                    false
                  )
                }
                className="rounded-xl p-3 hover:bg-slate-800"
              >
                <FaTimes />
              </button>
            </div>

            <div className="max-h-[72vh] overflow-y-auto p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-bold text-slate-700">
                  Incident Type

                  <select
                    value={
                      newIncident.type
                    }
                    onChange={(
                      event
                    ) =>
                      setNewIncident(
                        (
                          current
                        ) => ({
                          ...current,

                          type:
                            event
                              .target
                              .value as IncidentType,
                        })
                      )
                    }
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 font-normal"
                  >
                    <option value="Medical Emergency">
                      Medical Emergency
                    </option>

                    <option value="Flood">
                      Flood
                    </option>

                    <option value="Fire Support">
                      Fire Support
                    </option>

                    <option value="Road Accident">
                      Road Accident
                    </option>

                    <option value="Rescue">
                      Rescue
                    </option>

                    <option value="Blood Emergency">
                      Blood Emergency
                    </option>

                    <option value="Displacement">
                      Displacement
                    </option>

                    <option value="Relief Request">
                      Relief Request
                    </option>

                    <option value="Other">
                      Other
                    </option>
                  </select>
                </label>

                <label className="text-sm font-bold text-slate-700">
                  Priority

                  <select
                    value={
                      newIncident.priority
                    }
                    onChange={(
                      event
                    ) =>
                      setNewIncident(
                        (
                          current
                        ) => ({
                          ...current,

                          priority:
                            event
                              .target
                              .value as IncidentPriority,
                        })
                      )
                    }
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 font-normal"
                  >
                    <option value="Critical">
                      Critical
                    </option>

                    <option value="High">
                      High
                    </option>

                    <option value="Medium">
                      Medium
                    </option>

                    <option value="Low">
                      Low
                    </option>
                  </select>
                </label>

                <Field
                  label="Incident Title"
                  value={
                    newIncident.title
                  }
                  onChange={(value) =>
                    setNewIncident(
                      (
                        current
                      ) => ({
                        ...current,

                        title:
                          value,
                      })
                    )
                  }
                />

                <Field
                  label="Location"
                  value={
                    newIncident.location
                  }
                  onChange={(value) =>
                    setNewIncident(
                      (
                        current
                      ) => ({
                        ...current,

                        location:
                          value,
                      })
                    )
                  }
                />

                <Field
                  label="County"
                  value={
                    newIncident.county
                  }
                  onChange={(value) =>
                    setNewIncident(
                      (
                        current
                      ) => ({
                        ...current,

                        county:
                          value,
                      })
                    )
                  }
                />

                <Field
                  label="Reporter Name"
                  value={
                    newIncident.reporterName
                  }
                  onChange={(value) =>
                    setNewIncident(
                      (
                        current
                      ) => ({
                        ...current,

                        reporterName:
                          value,
                      })
                    )
                  }
                />

                <Field
                  label="Reporter Phone"
                  value={
                    newIncident.reporterPhone
                  }
                  onChange={(value) =>
                    setNewIncident(
                      (
                        current
                      ) => ({
                        ...current,

                        reporterPhone:
                          value,
                      })
                    )
                  }
                />

                <Field
                  label="Casualties"
                  type="number"
                  value={
                    newIncident.casualties
                  }
                  onChange={(value) =>
                    setNewIncident(
                      (
                        current
                      ) => ({
                        ...current,

                        casualties:
                          value,
                      })
                    )
                  }
                />

                <Field
                  label="Affected People"
                  type="number"
                  value={
                    newIncident.affectedPeople
                  }
                  onChange={(value) =>
                    setNewIncident(
                      (
                        current
                      ) => ({
                        ...current,

                        affectedPeople:
                          value,
                      })
                    )
                  }
                />
              </div>

              <label className="mt-4 block text-sm font-bold text-slate-700">
                Description

                <textarea
                  rows={5}
                  value={
                    newIncident.description
                  }
                  onChange={(
                    event
                  ) =>
                    setNewIncident(
                      (
                        current
                      ) => ({
                        ...current,

                        description:
                          event
                            .target
                            .value,
                      })
                    )
                  }
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal outline-none focus:border-red-500"
                />
              </label>

              <button
                type="button"
                onClick={
                  createIncident
                }
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 font-bold text-white"
              >
                <FaPlus />

                Create Incident
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* =========================================================
   UI HELPERS
========================================================= */

function Metric({
  title,
  value,
  icon,
  className = "",
}: {
  title: string;

  value: string | number;

  icon: ReactNode;

  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ${className}`}
    >
      <div className="text-2xl text-red-600">
        {icon}
      </div>

      <p className="mt-4 text-sm font-semibold text-slate-500">
        {title}
      </p>

      <p className="mt-1 text-3xl font-extrabold text-slate-950">
        {value}
      </p>
    </div>
  );
}

function Info({
  label,
  value,
  icon,
}: {
  label: string;

  value: string;

  icon: ReactNode;
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">
      <div className="text-red-600">
        {icon}
      </div>

      <p className="mt-2 text-xs font-bold uppercase text-slate-500">
        {label}
      </p>

      <p className="mt-1 font-bold text-slate-900">
        {value}
      </p>
    </div>
  );
}

function Detail({
  label,
  value,
}: {
  label: string;

  value: string;
}) {
  return (
    <div className="flex justify-between gap-4 border-b border-slate-100 pb-3">
      <span className="text-slate-500">
        {label}
      </span>

      <span className="text-right font-bold text-slate-900">
        {value}
      </span>
    </div>
  );
}

function Timeline({
  title,
  time,
}: {
  title: string;

  time?: string;
}) {
  return (
    <div className="flex gap-3">
      <span
        className={`mt-1 h-3 w-3 shrink-0 rounded-full ${
          time
            ? "bg-emerald-500"
            : "bg-slate-300"
        }`}
      />

      <div>
        <p className="font-bold text-slate-800">
          {title}
        </p>

        <p className="mt-1 text-xs text-slate-500">
          {formatDateTime(
            time
          )}
        </p>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  type = "text",
  onChange,
}: {
  label: string;

  value: string;

  type?: string;

  onChange:
    (value: string) => void;
}) {
  return (
    <label className="text-sm font-bold text-slate-700">
      {label}

      <input
        type={type}
        value={value}
        onChange={(
          event
        ) =>
          onChange(
            event.target.value
          )
        }
        className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal outline-none focus:border-red-500 focus:ring-4 focus:ring-red-100"
      />
    </label>
  );
}