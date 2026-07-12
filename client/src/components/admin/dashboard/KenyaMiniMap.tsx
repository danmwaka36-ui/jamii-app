import { useMemo, useState } from "react";
import {
  CircleMarker,
  MapContainer,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import {
  FaExpand,
  FaFire,
  FaHospital,
  FaMapMarkedAlt,
  FaShieldAlt,
} from "react-icons/fa";

import "leaflet/dist/leaflet.css";

export type MapLocationType =
  | "incident"
  | "police"
  | "fire"
  | "hospital"
  | "ambulance"
  | "flood";

export type KenyaMapLocation = {
  id: string;
  name: string;
  type: MapLocationType;
  latitude: number;
  longitude: number;
  description?: string;
  status?: string;
  severity?: string;
  county?: string;
  ward?: string;
};

type KenyaMiniMapProps = {
  locations?: KenyaMapLocation[];
  loading?: boolean;
  height?: number;
  title?: string;
  description?: string;
  onExpand?: () => void;
  onLocationClick?: (location: KenyaMapLocation) => void;
};

const defaultLocations: KenyaMapLocation[] = [
  {
    id: "incident-1",
    name: "Fire Incident",
    type: "incident",
    latitude: -4.0435,
    longitude: 39.6682,
    description: "Critical fire emergency reported.",
    status: "Dispatched",
    severity: "Critical",
    county: "Mombasa",
    ward: "Nyali",
  },
  {
    id: "police-1",
    name: "Nyali Police Station",
    type: "police",
    latitude: -4.0345,
    longitude: 39.6942,
    description: "Police response station.",
    status: "Online",
    county: "Mombasa",
    ward: "Nyali",
  },
  {
    id: "fire-1",
    name: "Mombasa Fire Brigade",
    type: "fire",
    latitude: -4.0622,
    longitude: 39.6663,
    description: "County fire response unit.",
    status: "Available",
    county: "Mombasa",
    ward: "Mvita",
  },
  {
    id: "hospital-1",
    name: "Coast General Hospital",
    type: "hospital",
    latitude: -4.0506,
    longitude: 39.6815,
    description: "Emergency hospital facility.",
    status: "Active",
    county: "Mombasa",
    ward: "Tononoka",
  },
  {
    id: "flood-1",
    name: "Flood Monitoring Zone",
    type: "flood",
    latitude: -4.0075,
    longitude: 39.696,
    description: "Flood-prone area under monitoring.",
    status: "Warning",
    severity: "High",
    county: "Mombasa",
    ward: "Kisauni",
  },
];

const mapCenter: [number, number] = [-4.0435, 39.6682];

function markerStyle(type: MapLocationType) {
  switch (type) {
    case "incident":
      return {
        color: "#dc2626",
        fillColor: "#ef4444",
        radius: 10,
      };

    case "police":
      return {
        color: "#1d4ed8",
        fillColor: "#3b82f6",
        radius: 8,
      };

    case "fire":
      return {
        color: "#c2410c",
        fillColor: "#f97316",
        radius: 8,
      };

    case "hospital":
      return {
        color: "#047857",
        fillColor: "#10b981",
        radius: 8,
      };

    case "ambulance":
      return {
        color: "#059669",
        fillColor: "#34d399",
        radius: 8,
      };

    case "flood":
      return {
        color: "#0369a1",
        fillColor: "#0ea5e9",
        radius: 9,
      };

    default:
      return {
        color: "#475569",
        fillColor: "#64748b",
        radius: 8,
      };
  }
}

function locationLabel(type: MapLocationType) {
  switch (type) {
    case "incident":
      return "Emergency Incident";

    case "police":
      return "Police Station";

    case "fire":
      return "Fire Station";

    case "hospital":
      return "Hospital";

    case "ambulance":
      return "Ambulance Unit";

    case "flood":
      return "Flood Zone";

    default:
      return "Map Location";
  }
}

function ResizeMap() {
  const map = useMap();

  setTimeout(() => {
    map.invalidateSize();
  }, 100);

  return null;
}

export default function KenyaMiniMap({
  locations = defaultLocations,
  loading = false,
  height = 460,
  title = "Live GIS Overview",
  description = "Emergency incidents, agencies and response facilities.",
  onExpand,
  onLocationClick,
}: KenyaMiniMapProps) {
  const [selectedType, setSelectedType] = useState<
    MapLocationType | "all"
  >("all");

  const filteredLocations = useMemo(() => {
    if (selectedType === "all") {
      return locations;
    }

    return locations.filter(
      (location) => location.type === selectedType
    );
  }, [locations, selectedType]);

  const statistics = useMemo(() => {
    return {
      incidents: locations.filter(
        (location) => location.type === "incident"
      ).length,
      police: locations.filter(
        (location) => location.type === "police"
      ).length,
      fire: locations.filter(
        (location) => location.type === "fire"
      ).length,
      hospitals: locations.filter(
        (location) => location.type === "hospital"
      ).length,
    };
  }, [locations]);

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div>
          <h2 className="flex items-center gap-3 text-xl font-bold text-slate-950">
            <FaMapMarkedAlt className="text-blue-700" />
            {title}
          </h2>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            {description}
          </p>
        </div>

        {onExpand && (
          <button
            type="button"
            onClick={onExpand}
            className="flex w-fit items-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
          >
            <FaExpand />
            Open Command Centre
          </button>
        )}
      </div>

      <div className="grid gap-3 border-b border-slate-100 bg-slate-50 p-5 sm:grid-cols-2 lg:grid-cols-4 sm:px-6">
        <button
          type="button"
          onClick={() => setSelectedType("incident")}
          className={`rounded-xl border p-4 text-left transition ${
            selectedType === "incident"
              ? "border-red-300 bg-red-50"
              : "border-slate-200 bg-white hover:border-red-200"
          }`}
        >
          <FaMapMarkedAlt className="text-xl text-red-600" />

          <p className="mt-3 text-xs font-semibold uppercase text-slate-500">
            Incidents
          </p>

          <p className="mt-1 text-2xl font-extrabold text-red-700">
            {statistics.incidents}
          </p>
        </button>

        <button
          type="button"
          onClick={() => setSelectedType("police")}
          className={`rounded-xl border p-4 text-left transition ${
            selectedType === "police"
              ? "border-blue-300 bg-blue-50"
              : "border-slate-200 bg-white hover:border-blue-200"
          }`}
        >
          <FaShieldAlt className="text-xl text-blue-600" />

          <p className="mt-3 text-xs font-semibold uppercase text-slate-500">
            Police
          </p>

          <p className="mt-1 text-2xl font-extrabold text-blue-700">
            {statistics.police}
          </p>
        </button>

        <button
          type="button"
          onClick={() => setSelectedType("fire")}
          className={`rounded-xl border p-4 text-left transition ${
            selectedType === "fire"
              ? "border-orange-300 bg-orange-50"
              : "border-slate-200 bg-white hover:border-orange-200"
          }`}
        >
          <FaFire className="text-xl text-orange-600" />

          <p className="mt-3 text-xs font-semibold uppercase text-slate-500">
            Fire Units
          </p>

          <p className="mt-1 text-2xl font-extrabold text-orange-700">
            {statistics.fire}
          </p>
        </button>

        <button
          type="button"
          onClick={() => setSelectedType("hospital")}
          className={`rounded-xl border p-4 text-left transition ${
            selectedType === "hospital"
              ? "border-emerald-300 bg-emerald-50"
              : "border-slate-200 bg-white hover:border-emerald-200"
          }`}
        >
          <FaHospital className="text-xl text-emerald-600" />

          <p className="mt-3 text-xs font-semibold uppercase text-slate-500">
            Hospitals
          </p>

          <p className="mt-1 text-2xl font-extrabold text-emerald-700">
            {statistics.hospitals}
          </p>
        </button>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-slate-100 px-5 py-4 sm:px-6">
        {(
          [
            "all",
            "incident",
            "police",
            "fire",
            "hospital",
            "ambulance",
            "flood",
          ] as const
        ).map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => setSelectedType(type)}
            className={`rounded-full px-4 py-2 text-xs font-bold capitalize transition ${
              selectedType === type
                ? "bg-blue-700 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {type === "all" ? "All Locations" : locationLabel(type)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="p-5 sm:p-6">
          <div
            className="animate-pulse rounded-2xl bg-slate-100"
            style={{ height }}
          />
        </div>
      ) : (
        <div className="relative">
          <MapContainer
            center={mapCenter}
            zoom={12}
            scrollWheelZoom
            style={{
              width: "100%",
              height,
            }}
          >
            <ResizeMap />

            <TileLayer
              attribution="© OpenStreetMap contributors"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {filteredLocations.map((location) => {
              const style = markerStyle(location.type);

              return (
                <CircleMarker
                  key={location.id}
                  center={[
                    location.latitude,
                    location.longitude,
                  ]}
                  radius={style.radius}
                  pathOptions={{
                    color: style.color,
                    fillColor: style.fillColor,
                    fillOpacity: 0.85,
                    weight: 3,
                  }}
                  eventHandlers={{
                    click: () => {
                      onLocationClick?.(location);
                    },
                  }}
                >
                  <Popup>
                    <div className="min-w-52">
                      <p className="text-xs font-bold uppercase text-slate-500">
                        {locationLabel(location.type)}
                      </p>

                      <h3 className="mt-1 text-base font-bold text-slate-950">
                        {location.name}
                      </h3>

                      {location.description && (
                        <p className="mt-2 text-sm text-slate-600">
                          {location.description}
                        </p>
                      )}

                      <div className="mt-3 space-y-1 text-xs text-slate-500">
                        {location.county && (
                          <p>
                            <strong>County:</strong>{" "}
                            {location.county}
                          </p>
                        )}

                        {location.ward && (
                          <p>
                            <strong>Ward:</strong> {location.ward}
                          </p>
                        )}

                        {location.severity && (
                          <p>
                            <strong>Severity:</strong>{" "}
                            {location.severity}
                          </p>
                        )}

                        {location.status && (
                          <p>
                            <strong>Status:</strong>{" "}
                            {location.status}
                          </p>
                        )}
                      </div>
                    </div>
                  </Popup>
                </CircleMarker>
              );
            })}
          </MapContainer>

          <button
            type="button"
            onClick={() => setSelectedType("all")}
            className="absolute bottom-5 left-5 z-[500] rounded-xl bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-lg transition hover:bg-slate-50"
          >
            Show All Markers
          </button>
        </div>
      )}

      <div className="border-t border-slate-100 bg-slate-50 px-5 py-4 sm:px-6">
        <p className="text-xs leading-5 text-slate-500">
          The map currently displays demonstration locations around Mombasa.
          Live Firestore incidents, stations, vehicles and responders will
          replace these markers.
        </p>
      </div>
    </section>
  );
}