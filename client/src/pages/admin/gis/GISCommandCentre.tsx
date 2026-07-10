import { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot, query } from "firebase/firestore";
import {
  FaCheckCircle,
  FaClock,
  FaExclamationTriangle,
  FaMapMarkedAlt,
  FaMapMarkerAlt,
} from "react-icons/fa";

import EmergencyMap from "../../../components/maps/EmergencyMap";
import MapLegend from "../../../components/maps/MapLegend";
import { db } from "../../../firebase/firebase";

type Coordinates = {
  latitude?: number;
  longitude?: number;
};

type Report = {
  id: string;
  type?: string;
  status?: string;
  assignedRole?: string;
  coordinates?: Coordinates | null;
};

const statusOptions = [
  "all",
  "Pending",
  "Assigned",
  "Responding",
  "Resolved",
];

const typeOptions = [
  "all",
  "Fire",
  "Medical",
  "Police",
  "Flood",
  "Accident",
  "Community Alert",
];

const agencyOptions = [
  "all",
  "police",
  "fire",
  "ambulance",
  "county",
  "redcross",
  "nyumbakumi",
];

function hasValidCoordinates(report: Report) {
  const latitude = report.coordinates?.latitude;
  const longitude = report.coordinates?.longitude;

  return (
    typeof latitude === "number" &&
    typeof longitude === "number" &&
    Number.isFinite(latitude) &&
    Number.isFinite(longitude)
  );
}

export default function GISCommandCentre() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [agencyFilter, setAgencyFilter] = useState("all");

  useEffect(() => {
    const unsubscribe = onSnapshot(
      query(collection(db, "reports")),
      (snapshot) => {
        const data = snapshot.docs.map((item) => ({
          id: item.id,
          ...item.data(),
        })) as Report[];

        setReports(data);
        setLoading(false);
        setError("");
      },
      (snapshotError) => {
        console.error(snapshotError);
        setError("Unable to load GIS report statistics.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const statistics = useMemo(() => {
    const mappedReports = reports.filter(hasValidCoordinates);

    const pending = mappedReports.filter(
      (report) => report.status === "Pending"
    ).length;

    const responding = mappedReports.filter(
      (report) => report.status === "Responding"
    ).length;

    const resolved = mappedReports.filter(
      (report) => report.status === "Resolved"
    ).length;

    const withoutGps = reports.filter(
      (report) => !hasValidCoordinates(report)
    ).length;

    return {
      totalMapped: mappedReports.length,
      pending,
      responding,
      resolved,
      withoutGps,
    };
  }, [reports]);

  function clearFilters() {
    setStatusFilter("all");
    setTypeFilter("all");
    setAgencyFilter("all");
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h1 className="flex items-center gap-3 text-3xl font-extrabold text-slate-950">
            <FaMapMarkedAlt className="text-purple-600" />
            GIS Command Centre
          </h1>

          <p className="mt-2 text-slate-600">
            Monitor live emergency locations, dispatch agencies and manage
            incidents across Mombasa County.
          </p>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
          <span className="h-3 w-3 animate-pulse rounded-full bg-emerald-500" />
          Live Firestore connection
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <FaMapMarkerAlt className="text-2xl text-purple-600" />
          <p className="mt-4 text-sm text-slate-500">Mapped Incidents</p>
          <h2 className="mt-1 text-3xl font-extrabold text-slate-950">
            {loading ? "..." : statistics.totalMapped}
          </h2>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <FaClock className="text-2xl text-orange-600" />
          <p className="mt-4 text-sm text-slate-500">Pending</p>
          <h2 className="mt-1 text-3xl font-extrabold text-orange-600">
            {loading ? "..." : statistics.pending}
          </h2>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <FaExclamationTriangle className="text-2xl text-blue-600" />
          <p className="mt-4 text-sm text-slate-500">Responding</p>
          <h2 className="mt-1 text-3xl font-extrabold text-blue-600">
            {loading ? "..." : statistics.responding}
          </h2>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <FaCheckCircle className="text-2xl text-emerald-600" />
          <p className="mt-4 text-sm text-slate-500">Resolved</p>
          <h2 className="mt-1 text-3xl font-extrabold text-emerald-600">
            {loading ? "..." : statistics.resolved}
          </h2>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <FaExclamationTriangle className="text-2xl text-red-600" />
          <p className="mt-4 text-sm text-slate-500">Reports Without GPS</p>
          <h2 className="mt-1 text-3xl font-extrabold text-red-600">
            {loading ? "..." : statistics.withoutGps}
          </h2>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div className="grid flex-1 gap-4 md:grid-cols-3">
            <div>
              <label className="text-sm font-semibold text-slate-700">
                Incident Status
              </label>

              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-purple-500"
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status === "all" ? "All Statuses" : status}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700">
                Emergency Type
              </label>

              <select
                value={typeFilter}
                onChange={(event) => setTypeFilter(event.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-purple-500"
              >
                {typeOptions.map((type) => (
                  <option key={type} value={type}>
                    {type === "all" ? "All Emergency Types" : type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700">
                Assigned Agency
              </label>

              <select
                value={agencyFilter}
                onChange={(event) => setAgencyFilter(event.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 capitalize outline-none focus:border-purple-500"
              >
                {agencyOptions.map((agency) => (
                  <option key={agency} value={agency}>
                    {agency === "all" ? "All Agencies" : agency}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="button"
            onClick={clearFilters}
            className="rounded-xl border border-slate-200 px-5 py-3 font-bold text-slate-700 transition hover:bg-slate-50"
          >
            Clear Filters
          </button>
        </div>
      </div>

      <div className="grid gap-6 2xl:grid-cols-[280px_1fr]">
        <MapLegend />

        <EmergencyMap
          statusFilter={statusFilter}
          typeFilter={typeFilter}
          agencyFilter={agencyFilter}
        />
      </div>

      <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5 text-sm leading-6 text-blue-700">
        Only reports containing valid GPS latitude and longitude values appear
        on the map. Citizens should use the “Use My GPS Location” button when
        submitting an emergency report.
      </div>
    </div>
  );
}