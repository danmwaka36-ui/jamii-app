import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

import {
  FaAmbulance,
  FaExclamationTriangle,
  FaMapMarkerAlt,
  FaSearch,
  FaTruck,
  FaUserFriends,
} from "react-icons/fa";

import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
} from "react-leaflet";

import L from "leaflet";
import "leaflet/dist/leaflet.css";

import PageHeader from "../../../components/common/PageHeader";
import StatusBadge from "../../../components/common/StatusBadge";

type MapIncident = {
  id: string;
  reference: string;
  title: string;
  location: string;
  priority: "Critical" | "High" | "Medium" | "Low";
  status: string;
  latitude: number;
  longitude: number;
};

type MapVehicle = {
  id: string;
  name: string;
  type: string;
  status: string;
  latitude: number;
  longitude: number;
};

type MapTeam = {
  id: string;
  name: string;
  specialty: string;
  status: string;
  latitude: number;
  longitude: number;
};

delete (L.Icon.Default.prototype as unknown as {
  _getIconUrl?: unknown;
})._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const incidents: MapIncident[] = [
  {
    id: "1",
    reference: "KRCS-2026-001",
    title: "Flood evacuation support",
    location: "Shelly Beach, Likoni",
    priority: "Critical",
    status: "Dispatched",
    latitude: -4.0901,
    longitude: 39.6514,
  },
  {
    id: "2",
    reference: "KRCS-2026-002",
    title: "Medical emergency response",
    location: "Links Road, Nyali",
    priority: "High",
    status: "Responding",
    latitude: -4.0365,
    longitude: 39.7011,
  },
  {
    id: "3",
    reference: "KRCS-2026-003",
    title: "Relief distribution",
    location: "Bamburi",
    priority: "Medium",
    status: "Assigned",
    latitude: -3.995,
    longitude: 39.715,
  },
];

const vehicles: MapVehicle[] = [
  {
    id: "vehicle-1",
    name: "KRCS Ambulance 07",
    type: "Ambulance",
    status: "Available",
    latitude: -4.041,
    longitude: 39.695,
  },
  {
    id: "vehicle-2",
    name: "KRCS Rescue 02",
    type: "Rescue Vehicle",
    status: "Assigned",
    latitude: -4.072,
    longitude: 39.66,
  },
  {
    id: "vehicle-3",
    name: "KRCS Logistics 04",
    type: "Logistics Truck",
    status: "En Route",
    latitude: -4.005,
    longitude: 39.69,
  },
];

const teams: MapTeam[] = [
  {
    id: "team-1",
    name: "Rescue Team Alpha",
    specialty: "Search & Rescue",
    status: "Available",
    latitude: -4.045,
    longitude: 39.67,
  },
  {
    id: "team-2",
    name: "Emergency Health Team",
    specialty: "Medical Response",
    status: "Deployed",
    latitude: -4.034,
    longitude: 39.704,
  },
];

export default function RedCrossGIS() {
  const [searchParams] = useSearchParams();

  const [search, setSearch] = useState("");

  const [showIncidents, setShowIncidents] =
    useState(true);

  const [showVehicles, setShowVehicles] =
    useState(true);

  const [showTeams, setShowTeams] =
    useState(true);

  const selectedIncidentId =
    searchParams.get("incident");

  const filteredIncidents = useMemo(() => {
    const query = search.trim().toLowerCase();

    return incidents.filter((incident) => {
      if (!query) {
        return true;
      }

      return (
        incident.reference
          .toLowerCase()
          .includes(query) ||
        incident.title
          .toLowerCase()
          .includes(query) ||
        incident.location
          .toLowerCase()
          .includes(query)
      );
    });
  }, [search]);

  const mapCenter: [number, number] =
    [-4.0435, 39.6682];

  const selectedIncident =
    incidents.find(
      (incident) =>
        incident.id === selectedIncidentId
    ) ?? null;

  const effectiveCenter: [number, number] =
    selectedIncident
      ? [
          selectedIncident.latitude,
          selectedIncident.longitude,
        ]
      : mapCenter;

  return (
    <div className="space-y-7">
      <PageHeader
        title="Live Humanitarian GIS"
        subtitle="Monitor humanitarian incidents, response teams and emergency vehicles across Mombasa County."
        icon={<FaMapMarkerAlt />}
        badge="Live Map"
        badgeColor="red"
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 shadow-sm">
          <FaExclamationTriangle className="text-xl text-red-600" />

          <p className="mt-4 text-sm font-semibold text-red-600">
            Active Incidents
          </p>

          <p className="mt-1 text-3xl font-extrabold text-red-700">
            {incidents.length}
          </p>
        </div>

        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5 shadow-sm">
          <FaAmbulance className="text-xl text-blue-600" />

          <p className="mt-4 text-sm font-semibold text-blue-600">
            Vehicles Tracked
          </p>

          <p className="mt-1 text-3xl font-extrabold text-blue-700">
            {vehicles.length}
          </p>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
          <FaUserFriends className="text-xl text-emerald-600" />

          <p className="mt-4 text-sm font-semibold text-emerald-600">
            Teams Tracked
          </p>

          <p className="mt-1 text-3xl font-extrabold text-emerald-700">
            {teams.length}
          </p>
        </div>

        <div className="rounded-2xl border border-purple-200 bg-purple-50 p-5 shadow-sm">
          <FaTruck className="text-xl text-purple-600" />

          <p className="mt-4 text-sm font-semibold text-purple-600">
            Map Status
          </p>

          <p className="mt-1 text-xl font-extrabold text-purple-700">
            Operational
          </p>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="relative w-full max-w-xl">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

            <input
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search incident reference or location..."
              className="w-full rounded-xl border border-slate-200 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-100"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() =>
                setShowIncidents(
                  (current) => !current
                )
              }
              className={`rounded-xl px-4 py-3 text-sm font-bold transition ${
                showIncidents
                  ? "bg-red-600 text-white"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              Incidents
            </button>

            <button
              type="button"
              onClick={() =>
                setShowVehicles(
                  (current) => !current
                )
              }
              className={`rounded-xl px-4 py-3 text-sm font-bold transition ${
                showVehicles
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              Vehicles
            </button>

            <button
              type="button"
              onClick={() =>
                setShowTeams(
                  (current) => !current
                )
              }
              className={`rounded-xl px-4 py-3 text-sm font-bold transition ${
                showTeams
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              Response Teams
            </button>
          </div>
        </div>
      </section>

      <section className="grid gap-6 2xl:grid-cols-[1fr_340px]">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="h-[650px] w-full">
            <MapContainer
              center={effectiveCenter}
              zoom={
                selectedIncident ? 15 : 12
              }
              scrollWheelZoom
              className="h-full w-full"
            >
              <TileLayer
                attribution="&copy; OpenStreetMap contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {showIncidents &&
                filteredIncidents.map(
                  (incident) => (
                    <Marker
                      key={incident.id}
                      position={[
                        incident.latitude,
                        incident.longitude,
                      ]}
                    >
                      <Popup>
                        <div className="min-w-[220px]">
                          <p className="font-bold">
                            {incident.reference}
                          </p>

                          <p className="mt-1">
                            {incident.title}
                          </p>

                          <p className="mt-2 text-sm">
                            {incident.location}
                          </p>

                          <p className="mt-2">
                            Priority:{" "}
                            {incident.priority}
                          </p>

                          <p>
                            Status:{" "}
                            {incident.status}
                          </p>
                        </div>
                      </Popup>
                    </Marker>
                  )
                )}

              {showVehicles &&
                vehicles.map((vehicle) => (
                  <Marker
                    key={vehicle.id}
                    position={[
                      vehicle.latitude,
                      vehicle.longitude,
                    ]}
                  >
                    <Popup>
                      <div className="min-w-[200px]">
                        <p className="font-bold">
                          {vehicle.name}
                        </p>

                        <p className="mt-1">
                          {vehicle.type}
                        </p>

                        <p className="mt-2">
                          Status:{" "}
                          {vehicle.status}
                        </p>
                      </div>
                    </Popup>
                  </Marker>
                ))}

              {showTeams &&
                teams.map((team) => (
                  <Marker
                    key={team.id}
                    position={[
                      team.latitude,
                      team.longitude,
                    ]}
                  >
                    <Popup>
                      <div className="min-w-[200px]">
                        <p className="font-bold">
                          {team.name}
                        </p>

                        <p className="mt-1">
                          {team.specialty}
                        </p>

                        <p className="mt-2">
                          Status: {team.status}
                        </p>
                      </div>
                    </Popup>
                  </Marker>
                ))}
            </MapContainer>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-slate-950">
              Live Incident Feed
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Current humanitarian incidents visible on the map.
            </p>

            <div className="mt-5 space-y-3">
              {filteredIncidents.map(
                (incident) => (
                  <div
                    key={incident.id}
                    className={`rounded-xl border p-4 ${
                      selectedIncidentId ===
                      incident.id
                        ? "border-red-300 bg-red-50"
                        : "border-slate-200 bg-slate-50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-bold text-slate-950">
                          {incident.reference}
                        </p>

                        <p className="mt-1 text-sm text-slate-600">
                          {incident.title}
                        </p>

                        <p className="mt-2 text-xs text-slate-500">
                          {incident.location}
                        </p>
                      </div>

                      <StatusBadge
                        status={incident.priority}
                      />
                    </div>
                  </div>
                )
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-slate-950">
              Map Legend
            </h2>

            <div className="mt-4 space-y-3 text-sm">
              <div className="flex items-center gap-3">
                <span className="h-3 w-3 rounded-full bg-red-600" />
                Humanitarian Incidents
              </div>

              <div className="flex items-center gap-3">
                <span className="h-3 w-3 rounded-full bg-blue-600" />
                Emergency Vehicles
              </div>

              <div className="flex items-center gap-3">
                <span className="h-3 w-3 rounded-full bg-emerald-600" />
                Response Teams
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-red-100 bg-red-50 p-5">
            <h2 className="font-bold text-red-950">
              GPS integration
            </h2>

            <p className="mt-2 text-sm leading-6 text-red-800">
              The current coordinates are demonstration values. Later this
              module will consume live GPS positions from responder devices and
              emergency vehicles.
            </p>
          </div>
        </aside>
      </section>
    </div>
  );
}