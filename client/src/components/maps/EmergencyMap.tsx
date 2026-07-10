import { useEffect, useMemo, useState } from "react";
import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";

import L from "leaflet";
import "leaflet/dist/leaflet.css";

import { db } from "../../firebase/firebase";

type Coordinates = {
  latitude?: number;
  longitude?: number;
};

type Report = {
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
  priority?: number;
  coordinates?: Coordinates | null;
  createdAt?: any;
};

type Props = {
  statusFilter?: string;
  typeFilter?: string;
  agencyFilter?: string;
};

const agencyOptions = [
  "police",
  "fire",
  "ambulance",
  "county",
  "redcross",
  "nyumbakumi",
];

function formatDateTime(timestamp: any) {
  if (!timestamp?.toDate) return "Time not available";

  return timestamp.toDate().toLocaleString("en-KE", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function isValidCoordinates(report: Report) {
  const latitude = report.coordinates?.latitude;
  const longitude = report.coordinates?.longitude;

  return (
    typeof latitude === "number" &&
    typeof longitude === "number" &&
    Number.isFinite(latitude) &&
    Number.isFinite(longitude)
  );
}

function markerColor(type?: string) {
  switch (type) {
    case "Fire":
      return "#dc2626";

    case "Medical":
      return "#059669";

    case "Police":
      return "#2563eb";

    case "Flood":
      return "#0891b2";

    case "Accident":
      return "#ea580c";

    case "Community Alert":
      return "#7c3aed";

    default:
      return "#475569";
  }
}

function markerEmoji(type?: string) {
  switch (type) {
    case "Fire":
      return "🚒";

    case "Medical":
      return "🚑";

    case "Police":
      return "🚔";

    case "Flood":
      return "🌊";

    case "Accident":
      return "⚠️";

    case "Community Alert":
      return "📢";

    default:
      return "📍";
  }
}

function createEmergencyIcon(type?: string) {
  const color = markerColor(type);
  const emoji = markerEmoji(type);

  return L.divIcon({
    className: "",
    html: `
      <div
        style="
          width: 42px;
          height: 42px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: ${color};
          color: white;
          font-size: 21px;
          border: 3px solid white;
          box-shadow: 0 8px 18px rgba(15, 23, 42, 0.35);
        "
      >
        ${emoji}
      </div>
    `,
    iconSize: [42, 42],
    iconAnchor: [21, 42],
    popupAnchor: [0, -40],
  });
}

function FitMapToReports({ reports }: { reports: Report[] }) {
  const map = useMap();

  useEffect(() => {
    const coordinates = reports
      .filter(isValidCoordinates)
      .map((report) => [
        report.coordinates!.latitude!,
        report.coordinates!.longitude!,
      ]) as [number, number][];

    if (coordinates.length === 0) return;

    if (coordinates.length === 1) {
      map.setView(coordinates[0], 14);
      return;
    }

    map.fitBounds(coordinates, {
      padding: [40, 40],
    });
  }, [map, reports]);

  return null;
}

export default function EmergencyMap({
  statusFilter = "all",
  typeFilter = "all",
  agencyFilter = "all",
}: Props) {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const reportsQuery = query(
      collection(db, "reports"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      reportsQuery,
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
        setError("Unable to load live incident markers.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const mappedReports = useMemo(() => {
    return reports.filter((report) => {
      const matchesStatus =
        statusFilter === "all" || report.status === statusFilter;

      const matchesType =
        typeFilter === "all" || report.type === typeFilter;

      const matchesAgency =
        agencyFilter === "all" || report.assignedRole === agencyFilter;

      return (
        isValidCoordinates(report) &&
        matchesStatus &&
        matchesType &&
        matchesAgency
      );
    });
  }, [reports, statusFilter, typeFilter, agencyFilter]);

  async function assignAgency(reportId: string, assignedRole: string) {
    if (!assignedRole) return;

    try {
      await updateDoc(doc(db, "reports", reportId), {
        assignedRole,
        status: "Assigned",
        updatedAt: serverTimestamp(),
      });
    } catch (updateError) {
      console.error(updateError);
      alert("Failed to assign agency.");
    }
  }

  async function updateStatus(reportId: string, status: string) {
    try {
      await updateDoc(doc(db, "reports", reportId), {
        status,
        updatedAt: serverTimestamp(),
      });
    } catch (updateError) {
      console.error(updateError);
      alert("Failed to update incident status.");
    }
  }

  if (loading) {
    return (
      <div className="flex h-[650px] items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 shadow-sm">
        Loading live GIS incidents...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[650px] items-center justify-center rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
        {error}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <MapContainer
        center={[-4.0435, 39.6682]}
        zoom={12}
        scrollWheelZoom
        style={{
          height: "650px",
          width: "100%",
        }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <FitMapToReports reports={mappedReports} />

        {mappedReports.map((report) => {
          const latitude = report.coordinates!.latitude!;
          const longitude = report.coordinates!.longitude!;

          const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;

          return (
            <Marker
              key={report.id}
              position={[latitude, longitude]}
              icon={createEmergencyIcon(report.type)}
            >
              <Popup minWidth={300}>
                <div style={{ minWidth: 280 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      marginBottom: "10px",
                    }}
                  >
                    <span style={{ fontSize: "24px" }}>
                      {markerEmoji(report.type)}
                    </span>

                    <div>
                      <strong style={{ fontSize: "16px" }}>
                        {report.type || "Emergency"}
                      </strong>

                      <div style={{ fontSize: "12px", color: "#64748b" }}>
                        {report.severity || "Unknown severity"} •{" "}
                        {report.status || "Pending"}
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      background: "#f8fafc",
                      borderRadius: "10px",
                      padding: "10px",
                      marginBottom: "10px",
                    }}
                  >
                    <p style={{ margin: "0 0 6px" }}>
                      <strong>Reporter:</strong>{" "}
                      {report.reporterName || "Unknown"}
                    </p>

                    <p style={{ margin: "0 0 6px" }}>
                      <strong>Phone:</strong>{" "}
                      {report.phone || "Not available"}
                    </p>

                    <p style={{ margin: "0 0 6px" }}>
                      <strong>Location:</strong>{" "}
                      {report.location || "GPS location"}
                    </p>

                    <p style={{ margin: "0 0 6px" }}>
                      <strong>Submitted:</strong>{" "}
                      {formatDateTime(report.createdAt)}
                    </p>

                    <p style={{ margin: 0 }}>
                      <strong>Assigned:</strong>{" "}
                      {report.assignedRole || "Not assigned"}
                    </p>
                  </div>

                  <p
                    style={{
                      margin: "0 0 12px",
                      color: "#475569",
                    }}
                  >
                    {report.description || "No description provided."}
                  </p>

                  <label
                    style={{
                      display: "block",
                      fontSize: "12px",
                      fontWeight: 700,
                      marginBottom: "4px",
                    }}
                  >
                    Assign agency
                  </label>

                  <select
                    defaultValue={report.assignedRole || ""}
                    onChange={(event) =>
                      assignAgency(report.id, event.target.value)
                    }
                    style={{
                      width: "100%",
                      padding: "8px",
                      borderRadius: "8px",
                      border: "1px solid #cbd5e1",
                      marginBottom: "10px",
                    }}
                  >
                    <option value="">Select agency</option>

                    {agencyOptions.map((agency) => (
                      <option key={agency} value={agency}>
                        {agency}
                      </option>
                    ))}
                  </select>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "8px",
                    }}
                  >
                    <a
                      href={`tel:${report.phone || ""}`}
                      style={{
                        textAlign: "center",
                        padding: "9px",
                        background: "#2563eb",
                        color: "white",
                        textDecoration: "none",
                        borderRadius: "8px",
                        fontWeight: 700,
                      }}
                    >
                      Call
                    </a>

                    <a
                      href={googleMapsUrl}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        textAlign: "center",
                        padding: "9px",
                        background: "#0f172a",
                        color: "white",
                        textDecoration: "none",
                        borderRadius: "8px",
                        fontWeight: 700,
                      }}
                    >
                      Navigate
                    </a>

                    <button
                      type="button"
                      onClick={() =>
                        updateStatus(report.id, "Responding")
                      }
                      style={{
                        padding: "9px",
                        background: "#7c3aed",
                        color: "white",
                        border: 0,
                        borderRadius: "8px",
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      Dispatch
                    </button>

                    <button
                      type="button"
                      onClick={() => updateStatus(report.id, "Resolved")}
                      style={{
                        padding: "9px",
                        background: "#059669",
                        color: "white",
                        border: 0,
                        borderRadius: "8px",
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      Resolve
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-5 py-4">
        <p className="text-sm text-slate-600">
          Showing{" "}
          <span className="font-bold text-slate-950">
            {mappedReports.length}
          </span>{" "}
          mapped incident{mappedReports.length === 1 ? "" : "s"}.
        </p>

        <p className="text-xs text-slate-500">
          Reports without valid GPS coordinates are excluded from the map.
        </p>
      </div>
    </div>
  );
}