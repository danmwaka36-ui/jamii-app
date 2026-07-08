import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

import { db } from "../../firebase/firebase";
import { useAuth } from "../../auth/AuthContext";

const emergencyTypes = [
  { label: "Fire", responder: "fire", icon: "🚒" },
  { label: "Medical", responder: "ambulance", icon: "🚑" },
  { label: "Police", responder: "police", icon: "🚔" },
  { label: "Flood", responder: "county", icon: "🌊" },
  { label: "Accident", responder: "police", icon: "🚗" },
  { label: "Community Alert", responder: "nyumbakumi", icon: "📢" },
];

const severityLevels = ["Low", "Medium", "High", "Critical"];

export default function ReportEmergency() {
  const navigate = useNavigate();
  const { currentUser, userProfile } = useAuth();

  const [type, setType] = useState("");
  const [assignedRole, setAssignedRole] = useState("");
  const [severity, setSeverity] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [phone, setPhone] = useState("");

  const [loading, setLoading] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [error, setError] = useState("");

  const [coordinates, setCoordinates] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  function handleTypeSelect(label: string, responder: string) {
    setType(label);
    setAssignedRole(responder);
  }

  function getLocation() {
    setGpsLoading(true);
    setError("");

    if (!navigator.geolocation) {
      setError("GPS is not supported on this device.");
      setGpsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        setCoordinates({ latitude, longitude });
        setLocation(`Lat: ${latitude}, Lng: ${longitude}`);
        setGpsLoading(false);
      },
      () => {
        setError("Unable to get GPS location. Please allow location access.");
        setGpsLoading(false);
      }
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!currentUser) {
      setError("You must be logged in to report an emergency.");
      return;
    }

    if (!type || !severity || !description || !phone) {
      setError("Please fill all required fields.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await addDoc(collection(db, "reports"), {
        reporterId: currentUser.uid,
        reporterName: userProfile?.fullName || "Unknown User",
        reporterEmail: currentUser.email,
        reporterRole: userProfile?.role || "citizen",

        phone,
        type,
        assignedRole,
        severity,
        description,
        location,
        coordinates,

        status: "Pending",
        priority:
          severity === "Critical"
            ? 1
            : severity === "High"
            ? 2
            : severity === "Medium"
            ? 3
            : 4,

        assignedResponderId: null,
        assignedResponderName: null,

        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      alert("Emergency report submitted successfully.");
      navigate("/dashboard/reports");
    } catch (err) {
      console.error(err);
      setError("Failed to submit report. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-950">
          🚨 Report Emergency
        </h1>
        <p className="mt-2 text-slate-600">
          Submit a verified emergency report to the correct response team.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">
              Select Emergency Type
            </h2>

            <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {emergencyTypes.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => handleTypeSelect(item.label, item.responder)}
                  className={`rounded-2xl border p-5 text-left transition ${
                    type === item.label
                      ? "border-red-500 bg-red-50 shadow"
                      : "border-slate-200 bg-white hover:border-blue-400 hover:bg-blue-50"
                  }`}
                >
                  <div className="text-3xl">{item.icon}</div>
                  <p className="mt-3 font-bold text-slate-900">{item.label}</p>
                  <p className="mt-1 text-sm text-slate-500 capitalize">
                    Routed to {item.responder}
                  </p>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">
              Emergency Details
            </h2>

            <div className="mt-6">
              <label className="text-sm font-semibold text-slate-700">
                Severity Level
              </label>

              <div className="mt-3 grid gap-3 md:grid-cols-4">
                {severityLevels.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setSeverity(item)}
                    className={`rounded-xl border px-4 py-3 font-semibold ${
                      severity === item
                        ? "border-red-500 bg-red-50 text-red-700"
                        : "border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5">
              <label className="text-sm font-semibold text-slate-700">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={6}
                placeholder="Describe what happened..."
                className="mt-2 w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-blue-500"
                required
              />
            </div>

            <div className="mt-5">
              <label className="text-sm font-semibold text-slate-700">
                Contact Phone Number
              </label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+254 7XX XXX XXX"
                className="mt-2 w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-blue-500"
                required
              />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">
              Location Information
            </h2>

            <div className="mt-5">
              <label className="text-sm font-semibold text-slate-700">
                Location / Landmark
              </label>
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Example: Bamburi, near Naivas"
                className="mt-2 w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-blue-500"
              />
            </div>

            <button
              type="button"
              onClick={getLocation}
              className="mt-5 rounded-xl bg-slate-900 px-5 py-3 font-bold text-white hover:bg-slate-800"
            >
              {gpsLoading ? "Getting GPS..." : "📍 Use My GPS Location"}
            </button>

            {coordinates && (
              <p className="mt-4 text-sm text-emerald-700">
                GPS captured: {coordinates.latitude}, {coordinates.longitude}
              </p>
            )}
          </div>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-red-600 px-6 py-4 font-bold text-white hover:bg-red-700 disabled:opacity-60"
          >
            {loading ? "Submitting Report..." : "Submit Emergency Report"}
          </button>
        </div>

        <aside className="space-y-5">
          <div className="rounded-2xl border border-red-100 bg-red-50 p-6">
            <h2 className="text-xl font-bold text-red-700">
              Emergency Notice
            </h2>
            <p className="mt-3 text-sm leading-6 text-red-700">
              For life-threatening emergencies, call emergency services immediately
              while submitting this report.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">
              Report Routing
            </h2>

            <div className="mt-4 rounded-xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Selected Type</p>
              <p className="font-bold text-slate-900">{type || "Not selected"}</p>

              <p className="mt-4 text-sm text-slate-500">Assigned Team</p>
              <p className="font-bold capitalize text-blue-700">
                {assignedRole || "Not assigned"}
              </p>

              <p className="mt-4 text-sm text-slate-500">Current Status</p>
              <p className="font-bold text-orange-600">Pending</p>
            </div>
          </div>
        </aside>
      </form>
    </div>
  );
}