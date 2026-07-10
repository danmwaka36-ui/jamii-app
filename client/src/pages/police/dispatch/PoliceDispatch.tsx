import { useEffect, useMemo, useState } from "react";
import {
  addDoc,
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
  FaBroadcastTower,
  FaCarSide,
  FaClock,
  FaExclamationTriangle,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaRoute,
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
  assignedVehicleId?: string | null;
  assignedVehicleRegistration?: string | null;
  priority?: number;
  etaMinutes?: number | null;
  createdAt?: any;
  dispatchedAt?: any;
  coordinates?: Coordinates | null;
};

type PoliceOfficer = {
  id: string;
  fullName?: string;
  role?: string;
  status?: string;
  dutyStatus?: string;
  station?: string;
  phone?: string;
};

type PoliceVehicle = {
  id: string;
  registrationNumber?: string;
  agencyRole?: string;
  status?: string;
  driverName?: string;
  currentLocation?: string;
};

type DispatchRecord = {
  id: string;
  reportId?: string;
  incidentType?: string;
  officerName?: string;
  vehicleRegistration?: string;
  status?: string;
  etaMinutes?: number;
  createdAt?: any;
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
  if (status === "On Scene") return "bg-cyan-100 text-cyan-700";
  if (status === "Responding") return "bg-blue-100 text-blue-700";
  if (status === "Dispatched") return "bg-purple-100 text-purple-700";

  return "bg-orange-100 text-orange-700";
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

export default function PoliceDispatch() {
  const [incidents, setIncidents] = useState<PoliceIncident[]>([]);
  const [officers, setOfficers] = useState<PoliceOfficer[]>([]);
  const [vehicles, setVehicles] = useState<PoliceVehicle[]>([]);
  const [dispatches, setDispatches] = useState<DispatchRecord[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");

  const [selectedOfficers, setSelectedOfficers] = useState<
    Record<string, string>
  >({});

  const [selectedVehicles, setSelectedVehicles] = useState<
    Record<string, string>
  >({});

  const [selectedEtas, setSelectedEtas] = useState<Record<string, number>>({});

  const [busyIncidentId, setBusyIncidentId] = useState<string | null>(null);

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
          "Unable to load dispatch incidents. Check Firestore rules or create the required assignedRole + createdAt index."
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
      },
      (snapshotError) => {
        console.error(snapshotError);
      }
    );

    const dispatchHistoryQuery = query(
      collection(db, "dispatches"),
      where("agencyRole", "==", "police"),
      orderBy("createdAt", "desc")
    );

    const unsubscribeDispatches = onSnapshot(
      dispatchHistoryQuery,
      (snapshot) => {
        const data = snapshot.docs.map((item) => ({
          id: item.id,
          ...item.data(),
        })) as DispatchRecord[];

        setDispatches(data);
      },
      (snapshotError) => {
        console.error(snapshotError);
      }
    );

    return () => {
      unsubscribeIncidents();
      unsubscribeOfficers();
      unsubscribeVehicles();
      unsubscribeDispatches();
    };
  }, []);

  const filteredIncidents = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return incidents.filter((incident) => {
      const activeStatus =
        incident.status !== "Resolved" && incident.status !== "Closed";

      const matchesSearch =
        !normalizedSearch ||
        incident.type?.toLowerCase().includes(normalizedSearch) ||
        incident.location?.toLowerCase().includes(normalizedSearch) ||
        incident.description?.toLowerCase().includes(normalizedSearch) ||
        incident.reporterName?.toLowerCase().includes(normalizedSearch) ||
        incident.id.toLowerCase().includes(normalizedSearch);

      return activeStatus && matchesSearch;
    });
  }, [incidents, search]);

  const availableOfficers = useMemo(
    () =>
      officers.filter(
        (officer) =>
          officer.status !== "suspended" &&
          officer.dutyStatus !== "off-duty" &&
          officer.dutyStatus !== "busy"
      ),
    [officers]
  );

  const availableVehicles = useMemo(
    () =>
      vehicles.filter((vehicle) =>
        ["Available", "available", "Ready", "ready"].includes(
          vehicle.status || ""
        )
      ),
    [vehicles]
  );

  const statistics = useMemo(() => {
    const pending = incidents.filter(
      (incident) =>
        incident.status === "Pending" || incident.status === "Assigned"
    ).length;

    const dispatched = incidents.filter(
      (incident) => incident.status === "Dispatched"
    ).length;

    const responding = incidents.filter(
      (incident) => incident.status === "Responding"
    ).length;

    const onScene = incidents.filter(
      (incident) => incident.status === "On Scene"
    ).length;

    return {
      pending,
      dispatched,
      responding,
      onScene,
      availableOfficers: availableOfficers.length,
      availableVehicles: availableVehicles.length,
    };
  }, [incidents, availableOfficers, availableVehicles]);

  async function createDispatch(incident: PoliceIncident) {
    const officerId =
      selectedOfficers[incident.id] || incident.assignedResponderId || "";

    const vehicleId =
      selectedVehicles[incident.id] || incident.assignedVehicleId || "";

    const etaMinutes = selectedEtas[incident.id] || incident.etaMinutes || 10;

    const officer = officers.find((item) => item.id === officerId);
    const vehicle = vehicles.find((item) => item.id === vehicleId);

    if (!officer) {
      setMessage("Select an available police officer before dispatching.");
      return;
    }

    try {
      setBusyIncidentId(incident.id);
      setMessage("");

      await updateDoc(doc(db, "reports", incident.id), {
        assignedResponderId: officer.id,
        assignedResponderName: officer.fullName || "Police Officer",
        assignedVehicleId: vehicle?.id || null,
        assignedVehicleRegistration: vehicle?.registrationNumber || null,
        etaMinutes,
        status: "Dispatched",
        dispatchedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      await addDoc(collection(db, "dispatches"), {
        reportId: incident.id,
        agencyRole: "police",
        incidentType: incident.type || "Police Incident",
        incidentLocation: incident.location || "",
        officerId: officer.id,
        officerName: officer.fullName || "Police Officer",
        vehicleId: vehicle?.id || null,
        vehicleRegistration: vehicle?.registrationNumber || null,
        etaMinutes,
        status: "Dispatched",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      await updateDoc(doc(db, "users", officer.id), {
        dutyStatus: "busy",
        currentAssignment: incident.id,
        updatedAt: serverTimestamp(),
      });

      if (vehicle) {
        await updateDoc(doc(db, "vehicles", vehicle.id), {
          status: "Dispatched",
          currentIncidentId: incident.id,
          updatedAt: serverTimestamp(),
        });
      }

      setMessage(
        `Incident dispatched to ${officer.fullName || "selected officer"}.`
      );
    } catch (dispatchError) {
      console.error(dispatchError);
      setMessage("Failed to dispatch the incident.");
    } finally {
      setBusyIncidentId(null);
    }
  }

  async function updateDispatchStatus(
    incident: PoliceIncident,
    status: string
  ) {
    try {
      setBusyIncidentId(incident.id);
      setMessage("");

      const updatePayload: Record<string, unknown> = {
        status,
        updatedAt: serverTimestamp(),
      };

      if (status === "Responding") {
        updatePayload.respondingAt = serverTimestamp();
      }

      if (status === "On Scene") {
        updatePayload.arrivedAt = serverTimestamp();
      }

      if (status === "Resolved") {
        updatePayload.resolvedAt = serverTimestamp();
      }

      await updateDoc(doc(db, "reports", incident.id), updatePayload);

      await addDoc(collection(db, "dispatches"), {
        reportId: incident.id,
        agencyRole: "police",
        incidentType: incident.type || "Police Incident",
        officerId: incident.assignedResponderId || null,
        officerName: incident.assignedResponderName || null,
        vehicleId: incident.assignedVehicleId || null,
        vehicleRegistration:
          incident.assignedVehicleRegistration || null,
        etaMinutes: incident.etaMinutes || null,
        status,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      if (status === "Resolved") {
        if (incident.assignedResponderId) {
          await updateDoc(
            doc(db, "users", incident.assignedResponderId),
            {
              dutyStatus: "available",
              currentAssignment: null,
              updatedAt: serverTimestamp(),
            }
          );
        }

        if (incident.assignedVehicleId) {
          await updateDoc(
            doc(db, "vehicles", incident.assignedVehicleId),
            {
              status: "Available",
              currentIncidentId: null,
              updatedAt: serverTimestamp(),
            }
          );
        }
      }

      setMessage(`Dispatch status updated to ${status}.`);
    } catch (updateError) {
      console.error(updateError);
      setMessage("Failed to update dispatch status.");
    } finally {
      setBusyIncidentId(null);
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
            <FaBroadcastTower className="text-blue-700" />
            Police Dispatch Centre
          </h1>

          <p className="mt-2 text-slate-600">
            Assign officers and patrol vehicles, set ETA, dispatch units and
            track the live response lifecycle.
          </p>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
          <span className="h-3 w-3 animate-pulse rounded-full bg-emerald-500" />
          Live operations feed
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

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <FaExclamationTriangle className="text-2xl text-orange-600" />
          <p className="mt-4 text-sm text-slate-500">Awaiting Dispatch</p>
          <h2 className="mt-1 text-3xl font-extrabold">
            {statistics.pending}
          </h2>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <FaBroadcastTower className="text-2xl text-purple-600" />
          <p className="mt-4 text-sm text-slate-500">Dispatched</p>
          <h2 className="mt-1 text-3xl font-extrabold text-purple-600">
            {statistics.dispatched}
          </h2>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <FaRoute className="text-2xl text-blue-600" />
          <p className="mt-4 text-sm text-slate-500">Responding</p>
          <h2 className="mt-1 text-3xl font-extrabold text-blue-600">
            {statistics.responding}
          </h2>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <FaMapMarkerAlt className="text-2xl text-cyan-600" />
          <p className="mt-4 text-sm text-slate-500">On Scene</p>
          <h2 className="mt-1 text-3xl font-extrabold text-cyan-600">
            {statistics.onScene}
          </h2>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <FaUserShield className="text-2xl text-emerald-600" />
          <p className="mt-4 text-sm text-slate-500">Available Officers</p>
          <h2 className="mt-1 text-3xl font-extrabold text-emerald-600">
            {statistics.availableOfficers}
          </h2>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <FaCarSide className="text-2xl text-indigo-600" />
          <p className="mt-4 text-sm text-slate-500">Available Vehicles</p>
          <h2 className="mt-1 text-3xl font-extrabold text-indigo-600">
            {statistics.availableVehicles}
          </h2>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
          <FaSearch className="text-slate-400" />

          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search incident, reporter, location or ID..."
            className="w-full bg-transparent text-sm outline-none"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-6 py-5">
          <h2 className="text-xl font-bold text-slate-950">
            Live Dispatch Queue
          </h2>

          <p className="text-sm text-slate-500">
            {filteredIncidents.length} active incident
            {filteredIncidents.length === 1 ? "" : "s"} available for police
            dispatch.
          </p>
        </div>

        {loading ? (
          <div className="p-8 text-slate-500">
            Loading dispatch operations...
          </div>
        ) : filteredIncidents.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            No police incidents are currently waiting for dispatch.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredIncidents.map((incident) => {
              const selectedOfficerId =
                selectedOfficers[incident.id] ||
                incident.assignedResponderId ||
                "";

              const selectedVehicleId =
                selectedVehicles[incident.id] ||
                incident.assignedVehicleId ||
                "";

              const etaMinutes =
                selectedEtas[incident.id] || incident.etaMinutes || 10;

              const isBusy = busyIncidentId === incident.id;

              return (
                <div
                  key={incident.id}
                  className="p-6 transition hover:bg-slate-50"
                >
                  <div className="grid gap-6 2xl:grid-cols-[1fr_300px_240px]">
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
                          <span className="font-semibold">Incident ID:</span>{" "}
                          <span className="font-mono text-xs">
                            {incident.id}
                          </span>
                        </p>

                        <p className="mt-1">
                          <span className="font-semibold">
                            Current officer:
                          </span>{" "}
                          {incident.assignedResponderName || "Not assigned"}
                        </p>

                        <p className="mt-1">
                          <span className="font-semibold">
                            Current vehicle:
                          </span>{" "}
                          {incident.assignedVehicleRegistration ||
                            "Not assigned"}
                        </p>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-bold text-slate-950">
                        Dispatch Resources
                      </h4>

                      <div className="mt-4 space-y-4">
                        <div>
                          <label className="text-sm font-semibold text-slate-600">
                            Police Officer
                          </label>

                          <select
                            value={selectedOfficerId}
                            onChange={(event) =>
                              setSelectedOfficers((current) => ({
                                ...current,
                                [incident.id]: event.target.value,
                              }))
                            }
                            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
                          >
                            <option value="">Select officer</option>

                            {availableOfficers.map((officer) => (
                              <option key={officer.id} value={officer.id}>
                                {officer.fullName || "Unnamed Officer"}
                                {officer.station
                                  ? ` — ${officer.station}`
                                  : ""}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="text-sm font-semibold text-slate-600">
                            Patrol Vehicle
                          </label>

                          <select
                            value={selectedVehicleId}
                            onChange={(event) =>
                              setSelectedVehicles((current) => ({
                                ...current,
                                [incident.id]: event.target.value,
                              }))
                            }
                            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
                          >
                            <option value="">No vehicle</option>

                            {availableVehicles.map((vehicle) => (
                              <option key={vehicle.id} value={vehicle.id}>
                                {vehicle.registrationNumber ||
                                  "Unregistered vehicle"}
                                {vehicle.currentLocation
                                  ? ` — ${vehicle.currentLocation}`
                                  : ""}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="text-sm font-semibold text-slate-600">
                            Estimated Arrival
                          </label>

                          <div className="mt-2 flex items-center gap-3">
                            <input
                              type="number"
                              min={1}
                              max={180}
                              value={etaMinutes}
                              onChange={(event) =>
                                setSelectedEtas((current) => ({
                                  ...current,
                                  [incident.id]: Number(event.target.value),
                                }))
                              }
                              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
                            />

                            <span className="whitespace-nowrap text-sm font-semibold text-slate-500">
                              minutes
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-bold text-slate-950">
                        Dispatch Actions
                      </h4>

                      <div className="mt-4 grid gap-3">
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => createDispatch(incident)}
                          className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {isBusy ? "Processing..." : "Dispatch Unit"}
                        </button>

                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() =>
                            updateDispatchStatus(incident, "Responding")
                          }
                          className="rounded-xl bg-purple-600 px-4 py-3 text-sm font-bold text-white hover:bg-purple-700 disabled:opacity-60"
                        >
                          Mark Responding
                        </button>

                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() =>
                            updateDispatchStatus(incident, "On Scene")
                          }
                          className="rounded-xl bg-cyan-600 px-4 py-3 text-sm font-bold text-white hover:bg-cyan-700 disabled:opacity-60"
                        >
                          Mark On Scene
                        </button>

                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() =>
                            updateDispatchStatus(incident, "Resolved")
                          }
                          className="rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-60"
                        >
                          Resolve Incident
                        </button>

                        <a
                          href={`tel:${incident.phone || ""}`}
                          className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-center text-sm font-bold text-blue-700 hover:bg-blue-100"
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
                            Open Navigation
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
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-6 py-5">
          <h2 className="text-xl font-bold text-slate-950">
            Recent Dispatch History
          </h2>

          <p className="text-sm text-slate-500">
            Latest Police dispatch events recorded in Firestore.
          </p>
        </div>

        {dispatches.length === 0 ? (
          <div className="p-8 text-slate-500">
            No Police dispatch records have been created yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-6 py-4">Incident</th>
                  <th className="px-6 py-4">Officer</th>
                  <th className="px-6 py-4">Vehicle</th>
                  <th className="px-6 py-4">ETA</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Time</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {dispatches.slice(0, 10).map((dispatch) => (
                  <tr key={dispatch.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900">
                        {dispatch.incidentType || "Police Incident"}
                      </p>

                      <p className="font-mono text-xs text-slate-400">
                        {dispatch.reportId || "No report ID"}
                      </p>
                    </td>

                    <td className="px-6 py-4 text-slate-600">
                      {dispatch.officerName || "Not assigned"}
                    </td>

                    <td className="px-6 py-4 text-slate-600">
                      {dispatch.vehicleRegistration || "No vehicle"}
                    </td>

                    <td className="px-6 py-4 text-slate-600">
                      {dispatch.etaMinutes
                        ? `${dispatch.etaMinutes} min`
                        : "—"}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${statusClass(
                          dispatch.status
                        )}`}
                      >
                        {dispatch.status || "Unknown"}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-slate-500">
                      {formatDateTime(dispatch.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5 text-sm leading-6 text-blue-700">
        A dispatch creates a permanent record in the Firestore{" "}
        <span className="font-mono font-bold">dispatches</span> collection and
        updates the selected officer, vehicle and emergency report in real time.
      </div>
    </div>
  );
}