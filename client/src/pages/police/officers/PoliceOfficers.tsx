import { useEffect, useMemo, useState } from "react";
import {
  collection,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";

import {
  FaBan,
  FaCheckCircle,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaSearch,
  FaShieldAlt,
  FaUserShield,
  FaUsers,
} from "react-icons/fa";

import { db } from "../../../firebase/firebase";

type PoliceOfficer = {
  id: string;
  uid?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  role?: string;
  rank?: string;
  badgeNumber?: string;
  station?: string;
  county?: string;
  ward?: string;
  status?: string;
  dutyStatus?: string;
  currentAssignment?: string | null;
  yearsOfService?: number;
  createdAt?: unknown;
};

const dutyStatuses = [
  "available",
  "online",
  "patrolling",
  "busy",
  "off-duty",
];

const ranks = [
  "Police Constable",
  "Corporal",
  "Sergeant",
  "Senior Sergeant",
  "Inspector",
  "Chief Inspector",
  "Assistant Superintendent",
  "Superintendent",
  "Senior Superintendent",
  "Commander",
];

function dutyStatusClass(status?: string) {
  switch (status) {
    case "available":
      return "bg-emerald-100 text-emerald-700";

    case "online":
      return "bg-blue-100 text-blue-700";

    case "patrolling":
      return "bg-cyan-100 text-cyan-700";

    case "busy":
      return "bg-orange-100 text-orange-700";

    case "off-duty":
      return "bg-slate-200 text-slate-700";

    default:
      return "bg-slate-100 text-slate-600";
  }
}

function accountStatusClass(status?: string) {
  return status === "suspended"
    ? "bg-red-100 text-red-700"
    : "bg-emerald-100 text-emerald-700";
}

export default function PoliceOfficers() {
  const [officers, setOfficers] = useState<PoliceOfficer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [search, setSearch] = useState("");
  const [dutyFilter, setDutyFilter] = useState("all");
  const [stationFilter, setStationFilter] = useState("all");
  const [selectedOfficer, setSelectedOfficer] =
    useState<PoliceOfficer | null>(null);

  useEffect(() => {
    const officersQuery = query(
      collection(db, "users"),
      where("role", "==", "police")
    );

    const unsubscribe = onSnapshot(
      officersQuery,
      (snapshot) => {
        const data = snapshot.docs.map((item) => ({
          id: item.id,
          ...item.data(),
        })) as PoliceOfficer[];

        setOfficers(data);
        setLoading(false);
        setError("");
      },
      (snapshotError) => {
        console.error(snapshotError);
        setError("Unable to load police officers. Check Firestore rules.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const stationOptions = useMemo(() => {
    const stations = officers
      .map((officer) => officer.station)
      .filter((station): station is string => Boolean(station));

    return Array.from(new Set(stations)).sort();
  }, [officers]);

  const filteredOfficers = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return officers.filter((officer) => {
      const matchesSearch =
        !normalizedSearch ||
        officer.fullName?.toLowerCase().includes(normalizedSearch) ||
        officer.email?.toLowerCase().includes(normalizedSearch) ||
        officer.phone?.toLowerCase().includes(normalizedSearch) ||
        officer.rank?.toLowerCase().includes(normalizedSearch) ||
        officer.badgeNumber?.toLowerCase().includes(normalizedSearch) ||
        officer.station?.toLowerCase().includes(normalizedSearch);

      const matchesDuty =
        dutyFilter === "all" || officer.dutyStatus === dutyFilter;

      const matchesStation =
        stationFilter === "all" || officer.station === stationFilter;

      return matchesSearch && matchesDuty && matchesStation;
    });
  }, [officers, search, dutyFilter, stationFilter]);

  const statistics = useMemo(() => {
    const active = officers.filter(
      (officer) => officer.status !== "suspended"
    ).length;

    const available = officers.filter(
      (officer) =>
        officer.status !== "suspended" &&
        officer.dutyStatus === "available"
    ).length;

    const patrolling = officers.filter(
      (officer) =>
        officer.status !== "suspended" &&
        officer.dutyStatus === "patrolling"
    ).length;

    const busy = officers.filter(
      (officer) =>
        officer.status !== "suspended" &&
        officer.dutyStatus === "busy"
    ).length;

    const offDuty = officers.filter(
      (officer) => officer.dutyStatus === "off-duty"
    ).length;

    const suspended = officers.filter(
      (officer) => officer.status === "suspended"
    ).length;

    return {
      total: officers.length,
      active,
      available,
      patrolling,
      busy,
      offDuty,
      suspended,
    };
  }, [officers]);

  async function updateDutyStatus(
    officerId: string,
    dutyStatus: string
  ) {
    try {
      await updateDoc(doc(db, "users", officerId), {
        dutyStatus,
        updatedAt: serverTimestamp(),
      });

      setMessage(`Officer duty status updated to ${dutyStatus}.`);
    } catch (updateError) {
      console.error(updateError);
      setMessage("Failed to update duty status.");
    }
  }

  async function updateOfficerStatus(
    officerId: string,
    status: string
  ) {
    try {
      await updateDoc(doc(db, "users", officerId), {
        status,
        updatedAt: serverTimestamp(),
      });

      setMessage(
        status === "suspended"
          ? "Officer account suspended."
          : "Officer account activated."
      );
    } catch (updateError) {
      console.error(updateError);
      setMessage("Failed to update officer account status.");
    }
  }

  async function updateOfficerField(
    officerId: string,
    field: string,
    value: string | number
  ) {
    try {
      await updateDoc(doc(db, "users", officerId), {
        [field]: value,
        updatedAt: serverTimestamp(),
      });

      setMessage("Officer profile updated successfully.");
    } catch (updateError) {
      console.error(updateError);
      setMessage("Failed to update officer profile.");
    }
  }

  function clearFilters() {
    setSearch("");
    setDutyFilter("all");
    setStationFilter("all");
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h1 className="flex items-center gap-3 text-3xl font-extrabold text-slate-950">
            <FaUserShield className="text-blue-700" />
            Police Officer Management
          </h1>

          <p className="mt-2 text-slate-600">
            Manage officer profiles, ranks, stations, duty status and current
            operational assignments.
          </p>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
          <span className="h-3 w-3 animate-pulse rounded-full bg-emerald-500" />
          Live Firestore officer directory
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

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-7">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <FaUsers className="text-2xl text-blue-600" />
          <p className="mt-4 text-sm text-slate-500">Total Officers</p>
          <h2 className="mt-1 text-3xl font-extrabold">
            {statistics.total}
          </h2>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <FaCheckCircle className="text-2xl text-emerald-600" />
          <p className="mt-4 text-sm text-slate-500">Active</p>
          <h2 className="mt-1 text-3xl font-extrabold text-emerald-600">
            {statistics.active}
          </h2>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <FaUserShield className="text-2xl text-green-600" />
          <p className="mt-4 text-sm text-slate-500">Available</p>
          <h2 className="mt-1 text-3xl font-extrabold text-green-600">
            {statistics.available}
          </h2>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <FaMapMarkerAlt className="text-2xl text-cyan-600" />
          <p className="mt-4 text-sm text-slate-500">Patrolling</p>
          <h2 className="mt-1 text-3xl font-extrabold text-cyan-600">
            {statistics.patrolling}
          </h2>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <FaShieldAlt className="text-2xl text-orange-600" />
          <p className="mt-4 text-sm text-slate-500">Busy</p>
          <h2 className="mt-1 text-3xl font-extrabold text-orange-600">
            {statistics.busy}
          </h2>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <FaUsers className="text-2xl text-slate-500" />
          <p className="mt-4 text-sm text-slate-500">Off Duty</p>
          <h2 className="mt-1 text-3xl font-extrabold text-slate-700">
            {statistics.offDuty}
          </h2>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <FaBan className="text-2xl text-red-600" />
          <p className="mt-4 text-sm text-slate-500">Suspended</p>
          <h2 className="mt-1 text-3xl font-extrabold text-red-600">
            {statistics.suspended}
          </h2>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4 xl:grid-cols-[1fr_220px_240px_auto]">
          <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <FaSearch className="text-slate-400" />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search officer, badge, rank, phone or station..."
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>

          <select
            value={dutyFilter}
            onChange={(event) => setDutyFilter(event.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
          >
            <option value="all">All Duty Statuses</option>

            {dutyStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>

          <select
            value={stationFilter}
            onChange={(event) => setStationFilter(event.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
          >
            <option value="all">All Stations</option>

            {stationOptions.map((station) => (
              <option key={station} value={station}>
                {station}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={clearFilters}
            className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
          >
            Clear
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-6 py-5">
          <h2 className="text-xl font-bold text-slate-950">
            Registered Police Officers
          </h2>

          <p className="text-sm text-slate-500">
            {filteredOfficers.length} officer
            {filteredOfficers.length === 1 ? "" : "s"} match the current
            filters.
          </p>
        </div>

        {loading ? (
          <div className="p-8 text-slate-500">
            Loading police officers...
          </div>
        ) : filteredOfficers.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            No police officers found.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredOfficers.map((officer) => (
              <div
                key={officer.id}
                className="p-6 transition hover:bg-slate-50"
              >
                <div className="grid gap-6 2xl:grid-cols-[1fr_260px_230px]">
                  <div>
                    <div className="flex items-start gap-4">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-2xl text-blue-700">
                        <FaUserShield />
                      </div>

                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="text-lg font-bold text-slate-950">
                            {officer.fullName || "Unnamed Officer"}
                          </h3>

                          <span
                            className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${accountStatusClass(
                              officer.status
                            )}`}
                          >
                            {officer.status || "active"}
                          </span>

                          <span
                            className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${dutyStatusClass(
                              officer.dutyStatus
                            )}`}
                          >
                            {officer.dutyStatus || "available"}
                          </span>
                        </div>

                        <p className="mt-1 text-sm font-semibold text-blue-700">
                          {officer.rank || "Rank not assigned"}
                        </p>

                        <div className="mt-4 grid gap-3 text-sm text-slate-500 md:grid-cols-2 xl:grid-cols-3">
                          <p>
                            <span className="font-semibold text-slate-700">
                              Badge:
                            </span>{" "}
                            {officer.badgeNumber || "Not assigned"}
                          </p>

                          <p className="flex items-center gap-2">
                            <FaPhoneAlt />
                            {officer.phone || "No phone"}
                          </p>

                          <p className="flex items-center gap-2">
                            <FaMapMarkerAlt />
                            {officer.station || "No station"}
                          </p>

                          <p>
                            <span className="font-semibold text-slate-700">
                              Email:
                            </span>{" "}
                            {officer.email || "Not available"}
                          </p>

                          <p>
                            <span className="font-semibold text-slate-700">
                              County:
                            </span>{" "}
                            {officer.county || "Not assigned"}
                          </p>

                          <p>
                            <span className="font-semibold text-slate-700">
                              Ward:
                            </span>{" "}
                            {officer.ward || "Not assigned"}
                          </p>
                        </div>

                        <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
                          <p>
                            <span className="font-semibold">
                              Current assignment:
                            </span>{" "}
                            {officer.currentAssignment ||
                              "No active assignment"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-950">
                      Officer Details
                    </h4>

                    <div className="mt-4 space-y-4">
                      <div>
                        <label className="text-sm font-semibold text-slate-600">
                          Duty Status
                        </label>

                        <select
                          value={officer.dutyStatus || "available"}
                          onChange={(event) =>
                            updateDutyStatus(
                              officer.id,
                              event.target.value
                            )
                          }
                          className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
                        >
                          {dutyStatuses.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-sm font-semibold text-slate-600">
                          Rank
                        </label>

                        <select
                          value={officer.rank || ""}
                          onChange={(event) =>
                            updateOfficerField(
                              officer.id,
                              "rank",
                              event.target.value
                            )
                          }
                          className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
                        >
                          <option value="">Select rank</option>

                          {ranks.map((rank) => (
                            <option key={rank} value={rank}>
                              {rank}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-sm font-semibold text-slate-600">
                          Station
                        </label>

                        <input
                          defaultValue={officer.station || ""}
                          onBlur={(event) => {
                            const value = event.target.value.trim();

                            if (value !== (officer.station || "")) {
                              void updateOfficerField(
                                officer.id,
                                "station",
                                value
                              );
                            }
                          }}
                          placeholder="Assign station"
                          className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-950">
                      Account Actions
                    </h4>

                    <div className="mt-4 grid gap-3">
                      <a
                        href={`tel:${officer.phone || ""}`}
                        className="rounded-xl bg-blue-600 px-4 py-3 text-center text-sm font-bold text-white hover:bg-blue-700"
                      >
                        Call Officer
                      </a>

                      <button
                        type="button"
                        onClick={() =>
                          setSelectedOfficer(
                            selectedOfficer?.id === officer.id
                              ? null
                              : officer
                          )
                        }
                        className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
                      >
                        {selectedOfficer?.id === officer.id
                          ? "Hide Profile"
                          : "View Profile"}
                      </button>

                      {officer.status === "suspended" ? (
                        <button
                          type="button"
                          onClick={() =>
                            updateOfficerStatus(officer.id, "active")
                          }
                          className="rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-700"
                        >
                          Activate Account
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() =>
                            updateOfficerStatus(officer.id, "suspended")
                          }
                          className="rounded-xl bg-red-600 px-4 py-3 text-sm font-bold text-white hover:bg-red-700"
                        >
                          Suspend Account
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {selectedOfficer?.id === officer.id && (
                  <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-5">
                    <h4 className="font-bold text-blue-900">
                      Officer Profile
                    </h4>

                    <div className="mt-4 grid gap-4 text-sm text-blue-800 md:grid-cols-2 xl:grid-cols-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-blue-500">
                          Officer ID
                        </p>
                        <p className="mt-1 break-all font-mono text-xs">
                          {officer.uid || officer.id}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-blue-500">
                          Rank
                        </p>
                        <p className="mt-1 font-bold">
                          {officer.rank || "Not assigned"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-blue-500">
                          Station
                        </p>
                        <p className="mt-1 font-bold">
                          {officer.station || "Not assigned"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-blue-500">
                          Assignment
                        </p>
                        <p className="mt-1 font-bold">
                          {officer.currentAssignment || "Available"}
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

      <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5 text-sm leading-6 text-blue-700">
        Police officers are users whose Firestore role is set to
        <span className="mx-1 font-mono font-bold">police</span>.
        Rank, station and duty status changes update their user records
        immediately.
      </div>
    </div>
  );
}