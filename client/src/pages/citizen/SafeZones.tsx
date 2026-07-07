import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

import {
  FaHospital,
  FaShieldAlt,
  FaFireExtinguisher,
  FaHome,
} from "react-icons/fa";

const zones = [
  {
    name: "Coast General Hospital",
    type: "Hospital",
    location: "Mombasa Island",
    lat: -4.0435,
    lng: 39.6682,
    color: "bg-emerald-100 text-emerald-700",
    icon: <FaHospital />,
  },
  {
    name: "Nyali Police Station",
    type: "Police Station",
    location: "Nyali",
    lat: -4.0439,
    lng: 39.7075,
    color: "bg-blue-100 text-blue-700",
    icon: <FaShieldAlt />,
  },
  {
    name: "Mombasa Fire Station",
    type: "Fire Station",
    location: "Mombasa CBD",
    lat: -4.0625,
    lng: 39.6707,
    color: "bg-red-100 text-red-700",
    icon: <FaFireExtinguisher />,
  },
  {
    name: "Bamburi Community Shelter",
    type: "Safe Shelter",
    location: "Bamburi",
    lat: -4.0069,
    lng: 39.7203,
    color: "bg-purple-100 text-purple-700",
    icon: <FaHome />,
  },
];

const markerIcon = new L.Icon({
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export default function SafeZones() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-950">
          📍 Safe Zones
        </h1>
        <p className="mt-2 text-slate-600">
          Nearby hospitals, police stations, fire stations and emergency shelters.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="font-bold text-slate-950">
              Emergency Facilities Map
            </h2>
          </div>

          <div className="h-[620px]">
            <MapContainer
              center={[-4.0435, 39.6682]}
              zoom={12}
              scrollWheelZoom
              className="h-full w-full"
            >
              <TileLayer
                attribution="&copy; OpenStreetMap contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {zones.map((zone) => (
                <Marker
                  key={zone.name}
                  position={[zone.lat, zone.lng]}
                  icon={markerIcon}
                >
                  <Popup>
                    <strong>{zone.name}</strong>
                    <br />
                    {zone.type}
                    <br />
                    {zone.location}
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-slate-950">
              Nearby Safe Locations
            </h2>

            <div className="mt-5 space-y-4">
              {zones.map((zone) => (
                <div
                  key={zone.name}
                  className="flex items-center gap-4 rounded-xl border border-slate-100 p-4"
                >
                  <div
                    className={`${zone.color} flex h-12 w-12 items-center justify-center rounded-xl text-xl`}
                  >
                    {zone.icon}
                  </div>

                  <div>
                    <p className="font-bold text-slate-900">
                      {zone.name}
                    </p>
                    <p className="text-sm text-slate-500">
                      {zone.type} • {zone.location}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}