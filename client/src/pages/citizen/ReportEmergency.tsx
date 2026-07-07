import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

import { db } from "../../firebase/firebase";
import { useAuth } from "../../auth/AuthContext";

const emergencyTypes = [
  "Fire",
  "Medical",
  "Police",
  "Flood",
  "Accident",
  "Community Alert",
];

const severityLevels = ["Low", "Medium", "High", "Critical"];

export default function ReportEmergency() {
  const navigate = useNavigate();
  const { currentUser, userProfile } = useAuth();

  const [type, setType] = useState("");
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
        setCoordinates({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });

        setLocation(
          `Lat: ${position.coords.latitude}, Lng: ${position.coords.longitude}`
        );

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
        userId: currentUser.uid,
        reporterName: userProfile?.fullName || "Unknown User",
        reporterEmail: currentUser.email,
        phone,
        type,
        severity,
        description,
        location,
        coordinates,
        status: "Pending",
        createdAt: serverTimestamp(),
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
          Submit a real-time emergency report to Jamii App responders.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid gap-6 xl:grid-cols-[1fr_360px]"
      >
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">
              Emergency Details
            </h2>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <div>
                <label className="text-sm font-semibold text-slate-700">
                  Emergency Type
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-blue-500"
                  required
                >
                  <option value="">Select emergency type</option>
                  {emergencyTypes.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700">
                  Severity Level
                </label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-blue-500"
                  required
                >
                  <option value="">Select severity</option>
                  {severityLevels.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
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
              If this is a life-threatening emergency, call emergency services
              immediately while also submitting this report.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">
              What happens next?
            </h2>

            <ul className="mt-4 space-y-3 text-sm text-slate-600">
              <li>✅ Your report is saved securely.</li>
              <li>✅ Emergency teams receive the alert.</li>
              <li>✅ You can track it in My Reports.</li>
              <li>✅ Responders update the status.</li>
            </ul>
          </div>
        </aside>
      </form>
    </div>
  );
}