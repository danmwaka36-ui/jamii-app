import { useEffect, useMemo, useState } from "react";
import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";

import {
  FaClock,
  FaExclamationTriangle,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaSearch,
  FaShieldAlt,
  FaUserShield,
} from "react-icons/fa";

import { db } from "../../../firebase/firebase";

type Coordinates = {
  latitude?: number;
  longitude?: number;
};

type PoliceIncident = {
  id: string;
  reporterName?: string;
  reporterEmail?: string;
  phone?: string;
  type?: string;
  severity?: string;
  description?: string;
  location?: string;
  status?: string;
  assignedRole?: string;
  assignedResponderId?: string | null;
  assignedResponderName?: string | null;
  priority?: number;
  createdAt?: any;
  coordinates?: Coordinates | null;
};

type PoliceOfficer = {
  id: string;
  fullName?: string;
  role?: string;
  status?: string;
  dutyStatus?: string;
  station?: string;
};

const statuses = ["Pending", "Assigned", "Responding", "Resolved"];

const severityOptions = ["all", "Low", "Medium", "High", "Critical"];

function formatDateTime(timestamp: any) {
  if (!timestamp?.toDate) return "Time unavailable";

  return timestamp.toDate().toLocaleString("en-KE", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function timeAgo(timestamp: any) {
  if (!timestamp?.toDate) return "Unknown time";

  const difference = Date.now() - timestamp.toDate().getTime();
  const minutes = Math.floor(difference / 60000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;

  const hours = Math.floor(minutes / 60);

  if (hours < 24) return `${hours} hr ago`;

  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

function severityClass(severity?: string) {
  if (severity === "Critical") return "bg-red-100 text-red-700";
  if (severity === "High") return "bg-orange-100 text-orange-700";
  if (severity === "Medium") return "bg-yellow-100 text-yellow-700";
  return "bg-emerald-100 text-emerald-700";
}

function statusClass(status?: string) {
  if (status === "Resolved") return "bg-emerald-100 text-emerald-700";
  if (status === "Responding") return "bg-blue-100 text-blue-700";
  if (status === "Assigned") return "bg-purple-100 text-purple-700";
  return "bg-orange-100 text-orange-700";
}

function priorityClass(priority?: number) {
  if (priority === 1) return "bg-red-600 text-white";
  if (priority === 2) return "bg-orange-500 text-white";
  if (priority === 3) return "bg-yellow-400 text-slate-950";
  if (priority === 4) return "bg-blue-600 text-white";
  return "bg-slate-200 text-slate-700";
}

function hasCoordinates(incident: PoliceIncident) {
  const latitude = incident.coordinates?.latitude;
  const longitude = incident.coordinates?.longitude;

  return (
    typeof latitude === "number" &&
    typeof longitude === "number" &&
    Number.isFinite(latitude) &&
    Number.isFinite(longitude)
  );
}

export default function PoliceIncidents() {
  const [incidents, setIncidents] = useState<PoliceIncident[]>([]);
  const [officers, setOfficers] = useState<PoliceOfficer[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [selectedIncident, setSelectedIncident] =
    useState<PoliceIncident | null>(null);

  useEffect(() => {
    const incidentsQuery = query(
      collection(db, "reports"),
      where("assignedRole", "==", "police"),
      orderBy("createdAt", "desc")
    );

    const unsubscribeIncidents = onSnapshot(
      incidentsQuery,
      (snapshot) => {
        const data = snapshot.docs.map((item) => ({
          id: item.id,
          ...item.data(),
        })) as PoliceIncident[];

        setIncidents(data);
        setLoading(false);
        setError("");
      },
      (snapshotError) => {
        console.error(snapshotError);
        setLoading(false);
        setError(
          "Unable to load police incidents. Check Firestore rules or create the required index."
        );
      }
    );

    const officersQuery = query(
      collection(db, "users"),
      where("role", "==", "police")
    );

    const unsubscribeOfficers = onSnapshot(
      officersQuery,
      (snapshot) => {
        const data = snapshot.docs.map((item) => ({
          id: item.id,
          ...item.data(),
        })) as PoliceOfficer[];

        setOfficers(data);
      },
      (snapshotError) => {
        console.error(snapshotError);
      }
    );

    return () => {
      unsubscribeIncidents();
      unsubscribeOfficers();
    };
  }, []);

  const filteredIncidents = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return incidents.filter((incident) => {
      const matchesSearch =
        !normalizedSearch ||
        incident.type?.toLowerCase().includes(normalizedSearch) ||
        incident.description?.toLowerCase().includes(normalizedSearch) ||
        incident.location?.toLowerCase().includes(normalizedSearch) ||
        incident.reporterName?.toLowerCase().includes(normalizedSearch) ||
        incident.phone?.toLowerCase().includes(normalizedSearch) ||
        incident.id.toLowerCase().includes(normalizedSearch);

      const matchesStatus =
        statusFilter === "all" || incident.status === statusFilter;

      const matchesSeverity =
        severityFilter === "all" || incident.severity === severityFilter;

      return matchesSearch && matchesStatus && matchesSeverity;
    });
  }, [incidents, search, statusFilter, severityFilter]);

  const activeCount = incidents.filter(
    (incident) => incident.status !== "Resolved"
  ).length;

  const criticalCount = incidents.filter(
    (incident) =>
      incident.status !== "Resolved" &&
      incident.severity === "Critical"
  ).length;

  const respondingCount = incidents.filter(
    (incident) => incident.status === "Responding"
  ).length;

  const resolvedCount = incidents.filter(
    (incident) => incident.status === "Resolved"
  ).length;

  async function updateIncidentStatus(incidentId: string, status: string) {
    try {
      await updateDoc(doc(db, "reports", incidentId), {
        status,
        updatedAt: serverTimestamp(),
        ...(status === "Responding"
          ? { dispatchedAt: serverTimestamp() }
          : {}),
        ...(status === "Resolved"
          ? { resolvedAt: serverTimestamp() }
          : {}),
      });

      setMessage(`Incident status updated to ${status}.`);
    } catch (updateError) {
      console.error(updateError);
      setMessage("Failed to update incident status.");
    }
  }

  async function assignOfficer(
    incident: PoliceIncident,
    officerId: string
  ) {
    const officer = officers.find((item) => item.id === officerId);

    try {
      await updateDoc(doc(db, "reports", incident.id), {
        assignedResponderId: officer?.id || null,
        assignedResponderName: officer?.fullName || null,
        status: officer ? "Assigned" : incident.status || "Pending",
        updatedAt: serverTimestamp(),
      });

      setMessage(
        officer
          ? `Incident assigned to ${officer.fullName || "officer"}.`
          : "Officer assignment removed."
      );
    } catch (updateError) {
      console.error(updateError);
      setMessage("Failed to assign officer.");
    }
  }

  function getNavigationUrl(incident: PoliceIncident) {
    if (!hasCoordinates(incident)) return "#";

    return `https://www.google.com/maps/search/?api=1&query=${incident.coordinates!.latitude},${incident.coordinates!.longitude}`;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h1 className="flex items-center gap-3 text-3xl font-extrabold text-slate-950">
            <FaShieldAlt className="text-blue-700" />
            Active Police Incidents
          </h1>

          <p className="mt-2 text-slate-600">
            Monitor incoming incidents, assign officers, dispatch units and
            close resolved cases.
          </p>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
          <span className="h-3 w-3 animate-pulse rounded-full bg-emerald-500" />
          Live Firestore feed
        </div>
      </div>

      {message && (
        <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-blue-700">
          {message}
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <FaExclamationTriangle className="text-3xl text-red-600" />
          <p className="mt-4 text-sm text-slate-500">Active Incidents</p>
          <h2 className="text-3xl font-extrabold">{activeCount}</h2>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <FaShieldAlt className="text-3xl text-orange-600" />
          <p className="mt-4 text-sm text-slate-500">Critical</p>
          <h2 className="text-3xl font-extrabold text-orange-600">
            {criticalCount}
          </h2>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <FaUserShield className="text-3xl text-blue-600" />
          <p className="mt-4 text-sm text-slate-500">Responding</p>
          <h2 className="text-3xl font-extrabold text-blue-600">
            {respondingCount}
          </h2>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <FaShieldAlt className="text-3xl text-emerald-600" />
          <p className="mt-4 text-sm text-slate-500">Resolved</p>
          <h2 className="text-3xl font-extrabold text-emerald-600">
            {resolvedCount}
          </h2>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4 xl:grid-cols-[1fr_220px_220px]">
          <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <FaSearch className="text-slate-400" />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search incident, reporter, location or ID..."
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
          >
            <option value="all">All Statuses</option>
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>

          <select
            value={severityFilter}
            onChange={(event) => setSeverityFilter(event.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
          >
            {severityOptions.map((severity) => (
              <option key={severity} value={severity}>
                {severity === "all" ? "All Severities" : severity}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-6 py-5">
          <h2 className="text-xl font-bold text-slate-950">
            Incident Operations Queue
          </h2>
          <p className="text-sm text-slate-500">
            {filteredIncidents.length} incident
            {filteredIncidents.length === 1 ? "" : "s"} match the current
            filters.
          </p>
        </div>

        {loading ? (
          <div className="p-8 text-slate-500">Loading police incidents...</div>
        ) : filteredIncidents.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            No police incidents found.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredIncidents.map((incident) => (
              <div key={incident.id} className="p-6 hover:bg-slate-50">
                <div className="grid gap-6 2xl:grid-cols-[1fr_260px_220px]">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-xl text-blue-700">
                        <FaShieldAlt />
                      </div>

                      <div>
                        <h3 className="text-lg font-bold text-slate-950">
                          {incident.type || "Police Incident"}
                        </h3>

                        <p className="text-sm text-slate-500">
                          Reported by {incident.reporterName || "Unknown"}
                        </p>
                      </div>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${severityClass(
                          incident.severity
                        )}`}
                      >
                        {incident.severity || "Low"}
                      </span>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${statusClass(
                          incident.status
                        )}`}
                      >
                        {incident.status || "Pending"}
                      </span>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${priorityClass(
                          incident.priority
                        )}`}
                      >
                        Priority {incident.priority ?? "N/A"}
                      </span>
                    </div>

                    <p className="mt-4 text-slate-600">
                      {incident.description || "No description provided."}
                    </p>

                    <div className="mt-4 grid gap-3 text-sm text-slate-500 md:grid-cols-2">
                      <p className="flex items-center gap-2">
                        <FaMapMarkerAlt />
                        {incident.location || "No location provided"}
                      </p>

                      <p className="flex items-center gap-2">
                        <FaPhoneAlt />
                        {incident.phone || "No phone number"}
                      </p>

                      <p className="flex items-center gap-2">
                        <FaClock />
                        Submitted: {formatDateTime(incident.createdAt)}
                      </p>

                      <p className="font-bold text-red-600">
                        Waiting: {timeAgo(incident.createdAt)}
                      </p>
                    </div>

                    <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
                      <p>
                        <span className="font-semibold">Reporter email:</span>{" "}
                        {incident.reporterEmail || "Not available"}
                      </p>

                      <p className="mt-1">
                        <span className="font-semibold">Incident ID:</span>{" "}
                        <span className="font-mono text-xs">{incident.id}</span>
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-slate-500">
                      Assigned Officer
                    </p>

                    <select
                      value={incident.assignedResponderId || ""}
                      onChange={(event) =>
                        assignOfficer(incident, event.target.value)
                      }
                      className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
                    >
                      <option value="">Select officer</option>

                      {officers
                        .filter(
                          (officer) =>
                            officer.status !== "suspended" &&
                            officer.dutyStatus !== "off-duty"
                        )
                        .map((officer) => (
                          <option key={officer.id} value={officer.id}>
                            {officer.fullName || "Unnamed Officer"}
                          </option>
                        ))}
                    </select>

                    <div className="mt-5 rounded-xl bg-slate-50 p-4 text-sm">
                      <p className="text-slate-500">Current assignment</p>
                      <p className="mt-1 font-bold text-slate-900">
                        {incident.assignedResponderName || "Not assigned"}
                      </p>

                      <p className="mt-4 text-slate-500">
                        Registered officers
                      </p>
                      <p className="mt-1 font-bold text-slate-900">
                        {officers.length}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-slate-500">
                      Response Status
                    </p>

                    <select
                      value={incident.status || "Pending"}
                      onChange={(event) =>
                        updateIncidentStatus(
                          incident.id,
                          event.target.value
                        )
                      }
                      className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
                    >
                      {statuses.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>

                    <div className="mt-5 grid gap-3">
                      <a
                        href={`tel:${incident.phone || ""}`}
                        className="rounded-xl bg-blue-600 px-4 py-3 text-center text-sm font-bold text-white hover:bg-blue-700"
                      >
                        Call Reporter
                      </a>

                      {hasCoordinates(incident) ? (
                        <a
                          href={getNavigationUrl(incident)}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-xl bg-slate-950 px-4 py-3 text-center text-sm font-bold text-white hover:bg-slate-800"
                        >
                          Navigate
                        </a>
                      ) : (
                        <button
                          type="button"
                          disabled
                          className="cursor-not-allowed rounded-xl bg-slate-200 px-4 py-3 text-sm font-bold text-slate-500"
                        >
                          GPS Unavailable
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() =>
                          updateIncidentStatus(incident.id, "Responding")
                        }
                        className="rounded-xl bg-purple-600 px-4 py-3 text-sm font-bold text-white hover:bg-purple-700"
                      >
                        Dispatch
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          updateIncidentStatus(incident.id, "Resolved")
                        }
                        className="rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-700"
                      >
                        Close Incident
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setSelectedIncident(
                            selectedIncident?.id === incident.id
                              ? null
                              : incident
                          )
                        }
                        className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
                      >
                        {selectedIncident?.id === incident.id
                          ? "Hide Details"
                          : "View Details"}
                      </button>
                    </div>
                  </div>
                </div>

                {selectedIncident?.id === incident.id && (
                  <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-5">
                    <h4 className="font-bold text-blue-900">
                      Incident Details
                    </h4>

                    <div className="mt-4 grid gap-4 text-sm text-blue-800 md:grid-cols-2 xl:grid-cols-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-blue-500">
                          Type
                        </p>
                        <p className="mt-1 font-bold">
                          {incident.type || "Police Incident"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-blue-500">
                          Assigned officer
                        </p>
                        <p className="mt-1 font-bold">
                          {incident.assignedResponderName || "Not assigned"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-blue-500">
                          Status
                        </p>
                        <p className="mt-1 font-bold">
                          {incident.status || "Pending"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-blue-500">
                          GPS
                        </p>
                        <p className="mt-1 font-bold">
                          {hasCoordinates(incident)
                            ? `${incident.coordinates?.latitude}, ${incident.coordinates?.longitude}`
                            : "Not captured"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}