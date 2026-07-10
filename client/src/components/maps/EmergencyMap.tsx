import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

import L from "leaflet";

delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export default function EmergencyMap() {
  return (
    <MapContainer
      center={[-4.0435, 39.6682]}
      zoom={12}
      scrollWheelZoom
      style={{
        height: "650px",
        width: "100%",
        borderRadius: "20px",
      }}
    >
      <TileLayer
        attribution="© OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <Marker position={[-4.0435, 39.6682]}>
        <Popup>
          <b>Jamii Command Centre</b>

          <br />

          Mombasa County
        </Popup>
      </Marker>
    </MapContainer>
  );
}