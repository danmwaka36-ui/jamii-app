import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";

import {
  FaBroadcastTower,
  FaCarSide,
  FaChartLine,
  FaClock,
  FaExclamationTriangle,
  FaFileAlt,
  FaFingerprint,
  FaMapMarkedAlt,
  FaMapMarkerAlt,
  FaShieldAlt,
  FaUserShield,
} from "react-icons/fa";

import { db } from "../../firebase/firebase";

type Coordinates = {
  latitude?: number;
  longitude?: number;
};

type PoliceIncident = {
  id: string;
  type?: string;
  severity?: string;
  description?: string;
  location?: string;
  status?: string;
  assignedRole?: string;
  assignedResponderName?: string | null;
  reporterName?: string;
  phone?: string;
  priority?: number;
  createdAt?: any;
  coordinates?: Coordinates | null;
};

type PoliceUser = {
  id: string;
  fullName?: string;
  role?: string;
  status?: string;
  dutyStatus?: string;
  currentAssignment?: string;
  station?: string;
};

type PoliceVehicle = {
  id: string;
  registrationNumber?: string;
  status?: string;
  driverName?: string;
  currentLocation?: string;
};

type PoliceCase = {
  id: string;
  status?: string;
};

type EvidenceItem = {
  id: string;
  status?: string;
};

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

export default function PoliceDashboard() {
  const [incidents, setIncidents] = useState<PoliceIncident[]>([]);
  const [officers, setOfficers] = useState<PoliceUser[]>([]);
  const [vehicles, setVehicles] = useState<PoliceVehicle[]>([]);
  const [cases, setCases] = useState<PoliceCase[]>([]);
  const [evidence, setEvidence] = useState<EvidenceItem[]>([]);

  const [loadingIncidents, setLoadingIncidents] = useState(true);
  const [loadingOfficers, setLoadingOfficers] = useState(true);
  const [loadingVehicles, setLoadingVehicles] = useState(true);

  const [error, setError] = useState("");

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
        setLoadingIncidents(false);
        setError("");
      },
      (snapshotError) => {
        console.error(snapshotError);
        setLoadingIncidents(false);
        setError(
          "Unable to load police incidents. Firestore may require a composite index for assignedRole and createdAt."
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
        })) as PoliceUser[];

        setOfficers(data);
        setLoadingOfficers(false);
      },
      (snapshotError) => {
        console.error(snapshotError);
        setLoadingOfficers(false);
      }
    );

    const vehiclesQuery = query(
      collection(db, "vehicles"),
      where("agencyRole", "==", "police")
    );

    const unsubscribeVehicles = onSnapshot(
      vehiclesQuery,
      (snapshot) => {
        const data = snapshot.docs.map((item) => ({
          id: item.id,
          ...item.data(),
        })) as PoliceVehicle[];

        setVehicles(data);
        setLoadingVehicles(false);
      },
      (snapshotError) => {
        console.error(snapshotError);
        setLoadingVehicles(false);
      }
    );

    const unsubscribeCases = onSnapshot(
      query(collection(db, "policeCases")),
      (snapshot) => {
        const data = snapshot.docs.map((item) => ({
          id: item.id,
          ...item.data(),
        })) as PoliceCase[];

        setCases(data);
      }
    );

    const unsubscribeEvidence = onSnapshot(
      query(collection(db, "evidence")),
      (snapshot) => {
        const data = snapshot.docs.map((item) => ({
          id: item.id,
          ...item.data(),
        })) as EvidenceItem[];

        setEvidence(data);
      }
    );

    return () => {
      unsubscribeIncidents();
      unsubscribeOfficers();
      unsubscribeVehicles();
      unsubscribeCases();
      unsubscribeEvidence();
    };
  }, []);

  const statistics = useMemo(() => {
    const activeIncidents = incidents.filter(
      (incident) => incident.status !== "Resolved"
    ).length;

    const criticalIncidents = incidents.filter(
      (incident) =>
        incident.status !== "Resolved" &&
        incident.severity === "Critical"
    ).length;

    const officersOnDuty = officers.filter(
      (officer) =>
        officer.status !== "suspended" &&
        officer.dutyStatus !== "off-duty"
    ).length;

    const officersOnline = officers.filter(
      (officer) =>
        officer.status !== "suspended" &&
        (officer.dutyStatus === "online" ||
          officer.dutyStatus === "available" ||
          officer.dutyStatus === "patrolling")
    ).length;

    const availableVehicles = vehicles.filter(
      (vehicle) =>
        vehicle.status === "Available" ||
        vehicle.status === "available"
    ).length;

    const openCases = cases.filter(
      (item) =>
        item.status !== "Closed" &&
        item.status !== "closed"
    ).length;

    const pendingEvidence = evidence.filter(
      (item) =>
        item.status === "Pending" ||
        item.status === "pending" ||
        !item.status
    ).length;

    const mappedIncidents = incidents.filter((incident) => {
      const latitude = incident.coordinates?.latitude;
      const longitude = incident.coordinates?.longitude;

      return (
        typeof latitude === "number" &&
        typeof longitude === "number" &&
        Number.isFinite(latitude) &&
        Number.isFinite(longitude)
      );
    }).length;

    return {
      activeIncidents,
      criticalIncidents,
      officersOnDuty,
      officersOnline,
      availableVehicles,
      openCases,
      pendingEvidence,
      mappedIncidents,
    };
  }, [incidents, officers, vehicles, cases, evidence]);

  const recentIncidents = incidents.slice(0, 5);
  const activeOfficers = officers
    .filter((officer) => officer.status !== "suspended")
    .slice(0, 5);

  const cards = [
    {
      title: "Active Incidents",
      value: statistics.activeIncidents,
      icon: <FaExclamationTriangle />,
      iconClass: "bg-red-100 text-red-700",
    },
    {
      title: "Critical Incidents",
      value: statistics.criticalIncidents,
      icon: <FaShieldAlt />,
      iconClass: "bg-orange-100 text-orange-700",
    },
    {
      title: "Officers On Duty",
      value: statistics.officersOnDuty,
      icon: <FaUserShield />,
      iconClass: "bg-blue-100 text-blue-700",
    },
    {
      title: "Officers Online",
      value: statistics.officersOnline,
      icon: <FaBroadcastTower />,
      iconClass: "bg-emerald-100 text-emerald-700",
    },
    {
      title: "Available Vehicles",
      value: statistics.availableVehicles,
      icon: <FaCarSide />,
      iconClass: "bg-purple-100 text-purple-700",
    },
    {
      title: "Open Cases",
      value: statistics.openCases,
      icon: <FaFileAlt />,
      iconClass: "bg-indigo-100 text-indigo-700",
    },
    {
      title: "Pending Evidence",
      value: statistics.pendingEvidence,
      icon: <FaFingerprint />,
      iconClass: "bg-amber-100 text-amber-700",
    },
    {
      title: "Mapped Incidents",
      value: statistics.mappedIncidents,
      icon: <FaMapMarkerAlt />,
      iconClass: "bg-cyan-100 text-cyan-700",
    },
  ];

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-blue-950 to-slate-900 p-8 text-white shadow-xl">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-blue-300">
              Police Operations Management System
            </p>

            <h1 className="mt-3 text-4xl font-extrabold">
              🚔 Police Command Centre
            </h1>

            <p className="mt-4 max-w-3xl text-slate-300">
              Monitor police incidents, coordinate officers and patrol vehicles,
              manage investigations, track evidence and maintain station-wide
              operational awareness.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Link
              to="/police/dispatch"
              className="rounded-xl bg-blue-600 px-5 py-3 text-center font-bold text-white transition hover:bg-blue-500"
            >
              Open Dispatch
            </Link>

            <Link
              to="/police/cases"
              className="rounded-xl border border-blue-400/40 bg-white/10 px-5 py-3 text-center font-bold text-white transition hover:bg-white/20"
            >
              Create Case
            </Link>
          </div>
        </div>
      </section>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
          {error}
        </div>
      )}

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.title}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-500">
                  {card.title}
                </p>

                <h2 className="mt-3 text-4xl font-extrabold text-slate-950">
                  {card.value}
                </h2>
              </div>

              <div
                className={`${card.iconClass} flex h-14 w-14 items-center justify-center rounded-2xl text-2xl`}
              >
                {card.icon}
              </div>
            </div>
          </div>
        ))}
      </section>

      <section className="grid gap-6 2xl:grid-cols-[1.35fr_0.65fr]">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-100 px-6 py-5 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-950">
                Live Police Incident Queue
              </h2>

              <p className="text-sm text-slate-500">
                Real-time incidents currently assigned to Police.
              </p>
            </div>

            <Link
              to="/police/incidents"
              className="text-sm font-bold text-blue-700 hover:text-blue-800"
            >
              View all incidents
            </Link>
          </div>

          {loadingIncidents ? (
            <div className="p-8 text-slate-500">
              Loading police incidents...
            </div>
          ) : recentIncidents.length === 0 ? (
            <div className="p-8 text-slate-500">
              No incidents are currently assigned to Police.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentIncidents.map((incident) => (
                <div
                  key={incident.id}
                  className="p-6 transition hover:bg-slate-50"
                >
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                    <div className="flex gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-xl text-blue-700">
                        <FaShieldAlt />
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-bold text-slate-950">
                            {incident.type || "Police Incident"}
                          </h3>

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
                        </div>

                        <p className="mt-2 text-sm text-slate-600">
                          {incident.description || "No description provided."}
                        </p>

                        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-500">
                          <span className="flex items-center gap-2">
                            <FaMapMarkerAlt />
                            {incident.location || "No location"}
                          </span>

                          <span className="flex items-center gap-2">
                            <FaClock />
                            {timeAgo(incident.createdAt)}
                          </span>

                          <span>
                            {formatDateTime(incident.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Link
                        to="/police/dispatch"
                        className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700"
                      >
                        Dispatch
                      </Link>

                      <Link
                        to="/police/incidents"
                        className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                      >
                        View
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-950">
                  Officer Status
                </h2>

                <p className="text-sm text-slate-500">
                  Current duty and availability overview.
                </p>
              </div>

              <Link
                to="/police/officers"
                className="text-sm font-bold text-blue-700"
              >
                Manage
              </Link>
            </div>

            {loadingOfficers ? (
              <p className="mt-6 text-sm text-slate-500">
                Loading officers...
              </p>
            ) : activeOfficers.length === 0 ? (
              <p className="mt-6 text-sm text-slate-500">
                No police officers registered yet.
              </p>
            ) : (
              <div className="mt-6 space-y-4">
                {activeOfficers.map((officer) => {
                  const dutyStatus =
                    officer.dutyStatus || "available";

                  const isOnline =
                    dutyStatus === "online" ||
                    dutyStatus === "available" ||
                    dutyStatus === "patrolling";

                  return (
                    <div
                      key={officer.id}
                      className="flex items-center justify-between rounded-xl bg-slate-50 p-4"
                    >
                      <div>
                        <p className="font-bold text-slate-900">
                          {officer.fullName || "Unnamed Officer"}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {officer.station || "Station not assigned"}
                        </p>
                      </div>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${
                          isOnline
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-200 text-slate-700"
                        }`}
                      >
                        {dutyStatus}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-950">
                  Patrol Fleet
                </h2>

                <p className="text-sm text-slate-500">
                  Police vehicle readiness.
                </p>
              </div>

              <Link
                to="/police/vehicles"
                className="text-sm font-bold text-blue-700"
              >
                View fleet
              </Link>
            </div>

            {loadingVehicles ? (
              <p className="mt-6 text-sm text-slate-500">
                Loading patrol vehicles...
              </p>
            ) : vehicles.length === 0 ? (
              <div className="mt-6 rounded-xl bg-slate-50 p-5 text-sm text-slate-500">
                No police vehicles are registered in Firestore yet.
              </div>
            ) : (
              <div className="mt-6 space-y-4">
                {vehicles.slice(0, 4).map((vehicle) => (
                  <div
                    key={vehicle.id}
                    className="flex items-center justify-between rounded-xl bg-slate-50 p-4"
                  >
                    <div>
                      <p className="font-bold text-slate-900">
                        {vehicle.registrationNumber || "Unregistered vehicle"}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {vehicle.currentLocation || "Location unavailable"}
                      </p>
                    </div>

                    <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
                      {vehicle.status || "Unknown"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="flex items-center gap-3 text-xl font-bold text-slate-950">
                <FaMapMarkedAlt className="text-blue-700" />
                Police GIS Operations
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                View live police incidents, patrol units and crime locations.
              </p>
            </div>

            <Link
              to="/police/gis"
              className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white hover:bg-slate-800"
            >
              Open Live Map
            </Link>
          </div>

          <div className="mt-6 flex h-80 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-50 via-slate-100 to-emerald-50">
            <div className="text-center">
              <FaMapMarkedAlt className="mx-auto text-5xl text-blue-600" />

              <p className="mt-4 text-lg font-bold text-slate-800">
                Live Police GIS Workspace
              </p>

              <p className="mt-2 text-sm text-slate-500">
                {statistics.mappedIncidents} mapped police incident
                {statistics.mappedIncidents === 1 ? "" : "s"} available.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-950">
            Quick Actions
          </h2>

          <div className="mt-6 grid gap-3">
            <Link
              to="/police/dispatch"
              className="rounded-xl bg-blue-600 px-4 py-3 text-center text-sm font-bold text-white hover:bg-blue-700"
            >
              Dispatch Officers
            </Link>

            <Link
              to="/police/cases"
              className="rounded-xl bg-indigo-600 px-4 py-3 text-center text-sm font-bold text-white hover:bg-indigo-700"
            >
              Open New Case
            </Link>

            <Link
              to="/police/evidence"
              className="rounded-xl bg-amber-500 px-4 py-3 text-center text-sm font-bold text-white hover:bg-amber-600"
            >
              Upload Evidence
            </Link>

            <Link
              to="/police/communication"
              className="rounded-xl bg-purple-600 px-4 py-3 text-center text-sm font-bold text-white hover:bg-purple-700"
            >
              Station Communication
            </Link>

            <Link
              to="/police/crime-analytics"
              className="rounded-xl border border-slate-200 px-4 py-3 text-center text-sm font-bold text-slate-700 hover:bg-slate-50"
            >
              Crime Analytics
            </Link>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="flex items-center gap-3 text-xl font-bold text-slate-950">
              <FaChartLine className="text-emerald-600" />
              Operational Readiness
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Live readiness indicators based on registered Police resources.
            </p>
          </div>

          <Link
            to="/police/analytics"
            className="text-sm font-bold text-blue-700"
          >
            Open analytics
          </Link>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl bg-slate-50 p-5">
            <p className="text-sm text-slate-500">Incident Load</p>
            <p className="mt-2 text-2xl font-extrabold text-red-700">
              {statistics.activeIncidents}
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 p-5">
            <p className="text-sm text-slate-500">Officer Availability</p>
            <p className="mt-2 text-2xl font-extrabold text-blue-700">
              {statistics.officersOnline}
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 p-5">
            <p className="text-sm text-slate-500">Fleet Availability</p>
            <p className="mt-2 text-2xl font-extrabold text-purple-700">
              {statistics.availableVehicles}
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 p-5">
            <p className="text-sm text-slate-500">Investigation Workload</p>
            <p className="mt-2 text-2xl font-extrabold text-amber-700">
              {statistics.openCases}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}