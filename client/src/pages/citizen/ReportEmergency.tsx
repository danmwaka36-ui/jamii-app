import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

import { db } from "../../firebase/firebase";
import { useAuth } from "../../auth/AuthContext";

type EmergencyType = {
  label: string;
  responder: string;
  responderLabel: string;
  icon: string;
  redcrossRelevant: boolean;
  description: string;
};

const emergencyTypes: EmergencyType[] = [
  {
    label: "Fire",
    responder: "fire",
    responderLabel: "Fire & Rescue",
    icon: "🚒",
    redcrossRelevant: true,
    description: "Fire incidents requiring rescue, first aid or humanitarian support.",
  },
  {
    label: "Medical",
    responder: "ambulance",
    responderLabel: "Ambulance / Medical Response",
    icon: "🚑",
    redcrossRelevant: true,
    description: "Medical emergencies, injuries and situations requiring emergency medical support.",
  },
  {
    label: "Police",
    responder: "police",
    responderLabel: "Police",
    icon: "🚔",
    redcrossRelevant: false,
    description: "Crime, security threats and incidents requiring police intervention.",
  },
  {
    label: "Flood",
    responder: "county",
    responderLabel: "County Emergency Response",
    icon: "🌊",
    redcrossRelevant: true,
    description: "Flooding, displacement, rescue and humanitarian emergencies.",
  },
  {
    label: "Accident",
    responder: "police",
    responderLabel: "Police / Emergency Response",
    icon: "🚗",
    redcrossRelevant: true,
    description: "Road and other accidents requiring rescue, medical or humanitarian support.",
  },
  {
    label: "Community Alert",
    responder: "nyumbakumi",
    responderLabel: "Nyumba Kumi / Community Response",
    icon: "📢",
    redcrossRelevant: true,
    description: "Community incidents that may require humanitarian or emergency support.",
  },
];

const severityLevels = ["Low", "Medium", "High", "Critical"] as const;

type Severity = (typeof severityLevels)[number];

export default function ReportEmergency() {
  const navigate = useNavigate();
  const { currentUser, userProfile } = useAuth();

  const [type, setType] = useState("");
  const [assignedRole, setAssignedRole] = useState("");
  const [severity, setSeverity] = useState<Severity | "">("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [phone, setPhone] = useState("");

  const [redcrossRelevant, setRedcrossRelevant] = useState(false);

  const [loading, setLoading] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [error, setError] = useState("");

  const [coordinates, setCoordinates] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const [successMessage, setSuccessMessage] = useState("");

  function handleTypeSelect(item: EmergencyType) {
    setType(item.label);
    setAssignedRole(item.responder);
    setRedcrossRelevant(item.redcrossRelevant);
    setError("");
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

        setCoordinates({
          latitude,
          longitude,
        });

        setLocation(
          `GPS Location: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
        );

        setGpsLoading(false);
      },
      (positionError) => {
        console.error("GPS error:", positionError);

        setError(
          "Unable to get GPS location. Please allow location access and try again."
        );

        setGpsLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");
    setSuccessMessage("");

    if (!currentUser) {
      setError("You must be logged in to report an emergency.");
      return;
    }

    if (!type) {
      setError("Please select an emergency type.");
      return;
    }

    if (!severity) {
      setError("Please select a severity level.");
      return;
    }

    if (!description.trim()) {
      setError("Please describe what happened.");
      return;
    }

    if (!phone.trim()) {
      setError("Please provide a contact phone number.");
      return;
    }

    if (!coordinates) {
      setError(
        "Please capture your GPS location before submitting the emergency."
      );
      return;
    }

    try {
      setLoading(true);

      const selectedEmergency = emergencyTypes.find(
        (item) => item.label === type
      );

      const priority =
        severity === "Critical"
          ? 1
          : severity === "High"
          ? 2
          : severity === "Medium"
          ? 3
          : 4;

      /*
       * IMPORTANT:
       * The reports collection remains the single source of truth.
       *
       * redcrossRelevant determines whether Red Cross should receive
       * the incident through its real-time listener.
       */
      const reportData = {
        reporterId: currentUser.uid,

        reporterName:
          userProfile?.fullName ||
          currentUser.displayName ||
          "Unknown User",

        reporterEmail: currentUser.email || null,

        reporterRole: userProfile?.role || "citizen",

        phone: phone.trim(),

        type,

        assignedRole,

        assignedTeam: selectedEmergency?.responderLabel || assignedRole,

        redcrossRelevant,

        severity,

        priority,

        description: description.trim(),

        location: location.trim(),

        coordinates: {
          latitude: coordinates.latitude,
          longitude: coordinates.longitude,
        },

        /*
         * This gives the response teams a consistent status lifecycle.
         */
        status: "Pending",

        acknowledged: false,

        acknowledgedAt: null,

        acknowledgedBy: null,

        assignedResponderId: null,

        assignedResponderName: null,

        dispatchedAt: null,

        resolvedAt: null,

        /*
         * Useful for incident tracing and audit.
         */
        source: "Citizen Dashboard",

        sourceChannel: "web",

        createdAt: serverTimestamp(),

        updatedAt: serverTimestamp(),
      };

      const reportRef = await addDoc(
        collection(db, "reports"),
        reportData
      );

      console.log("Emergency report created:", reportRef.id);

      setSuccessMessage(
        `Emergency submitted successfully. Reference: ${reportRef.id}`
      );

      /*
       * Give the user a short confirmation before navigating.
       */
      setTimeout(() => {
        navigate("/dashboard/reports");
      }, 1200);
    } catch (err) {
      console.error("Emergency submission error:", err);

      setError(
        "Failed to submit emergency report. Please check your connection and try again."
      );
    } finally {
      setLoading(false);
    }
  }

  const selectedEmergency = emergencyTypes.find(
    (item) => item.label === type
  );

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-950">
          🚨 Report Emergency
        </h1>

        <p className="mt-2 text-slate-600">
          Submit an emergency report and Jamii will route it to the
          appropriate response teams.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid gap-6 xl:grid-cols-[1fr_360px]"
      >
        <div className="space-y-6">
          {/* EMERGENCY TYPE */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">
              Select Emergency Type
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Select the type that best describes the emergency.
            </p>

            <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {emergencyTypes.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => handleTypeSelect(item)}
                  className={`rounded-2xl border p-5 text-left transition ${
                    type === item.label
                      ? "border-red-500 bg-red-50 shadow-md ring-2 ring-red-100"
                      : "border-slate-200 bg-white hover:border-blue-400 hover:bg-blue-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="text-3xl">{item.icon}</div>

                    {item.redcrossRelevant && (
                      <span className="rounded-full bg-red-100 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-red-700">
                        Red Cross
                      </span>
                    )}
                  </div>

                  <p className="mt-3 font-bold text-slate-900">
                    {item.label}
                  </p>

                  <p className="mt-1 text-sm font-semibold text-blue-700">
                    Routed to {item.responderLabel}
                  </p>

                  <p className="mt-2 text-xs leading-5 text-slate-500">
                    {item.description}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* EMERGENCY DETAILS */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">
              Emergency Details
            </h2>

            {/* SEVERITY */}
            <div className="mt-6">
              <label className="text-sm font-semibold text-slate-700">
                Severity Level
              </label>

              <div className="mt-3 grid gap-3 md:grid-cols-4">
                {severityLevels.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => {
                      setSeverity(item);
                      setError("");
                    }}
                    className={`rounded-xl border px-4 py-3 font-semibold transition ${
                      severity === item
                        ? "border-red-500 bg-red-50 text-red-700 shadow-sm"
                        : "border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            {/* DESCRIPTION */}
            <div className="mt-5">
              <label className="text-sm font-semibold text-slate-700">
                Description
              </label>

              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={6}
                placeholder="Describe what happened, number of people affected, injuries, hazards or any other useful information..."
                className="mt-2 w-full rounded-xl border border-slate-200 p-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                required
              />
            </div>

            {/* PHONE */}
            <div className="mt-5">
              <label className="text-sm font-semibold text-slate-700">
                Contact Phone Number
              </label>

              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+254 7XX XXX XXX"
                className="mt-2 w-full rounded-xl border border-slate-200 p-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                required
              />
            </div>
          </div>

          {/* LOCATION */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">
              Location Information
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Accurate location helps response teams trace and reach the
              incident faster.
            </p>

            <div className="mt-5">
              <label className="text-sm font-semibold text-slate-700">
                Location / Landmark
              </label>

              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Example: Bamburi, near Naivas"
                className="mt-2 w-full rounded-xl border border-slate-200 p-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <button
              type="button"
              onClick={getLocation}
              disabled={gpsLoading}
              className="mt-5 rounded-xl bg-slate-900 px-5 py-3 font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {gpsLoading
                ? "📍 Getting GPS..."
                : "📍 Capture My GPS Location"}
            </button>

            {coordinates && (
              <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                <p className="text-sm font-bold text-emerald-800">
                  ✓ GPS location captured
                </p>

                <p className="mt-1 text-xs text-emerald-700">
                  Latitude: {coordinates.latitude.toFixed(6)}
                </p>

                <p className="text-xs text-emerald-700">
                  Longitude: {coordinates.longitude.toFixed(6)}
                </p>

                <a
                  href={`https://www.google.com/maps?q=${coordinates.latitude},${coordinates.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-block text-sm font-bold text-blue-700 hover:underline"
                >
                  Open location on Google Maps →
                </a>
              </div>
            )}
          </div>

          {/* ERROR */}
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
              <p className="font-semibold">Unable to submit report</p>

              <p className="mt-1 text-sm">{error}</p>
            </div>
          )}

          {/* SUCCESS */}
          {successMessage && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-700">
              <p className="font-bold">✓ Emergency submitted</p>

              <p className="mt-1 text-sm">{successMessage}</p>
            </div>
          )}

          {/* SUBMIT */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-red-600 px-6 py-4 font-bold text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading
              ? "Submitting Emergency..."
              : "🚨 Submit Emergency Report"}
          </button>
        </div>

        {/* RIGHT SIDEBAR */}
        <aside className="space-y-5">
          {/* NOTICE */}
          <div className="rounded-2xl border border-red-100 bg-red-50 p-6">
            <h2 className="text-xl font-bold text-red-700">
              Emergency Notice
            </h2>

            <p className="mt-3 text-sm leading-6 text-red-700">
              For life-threatening emergencies, call emergency services
              immediately while submitting this report.
            </p>
          </div>

          {/* ROUTING */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">
              Report Routing
            </h2>

            <div className="mt-4 space-y-4 rounded-xl bg-slate-50 p-4">
              <div>
                <p className="text-sm text-slate-500">
                  Selected Type
                </p>

                <p className="font-bold text-slate-900">
                  {type || "Not selected"}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-500">
                  Primary Response Team
                </p>

                <p className="font-bold text-blue-700">
                  {selectedEmergency?.responderLabel ||
                    "Not assigned"}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-500">
                  Red Cross Notification
                </p>

                <p
                  className={`font-bold ${
                    redcrossRelevant
                      ? "text-red-600"
                      : "text-slate-500"
                  }`}
                >
                  {redcrossRelevant
                    ? "✓ Red Cross will receive this incident"
                    : "Not routed to Red Cross"}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-500">
                  Severity
                </p>

                <p className="font-bold text-slate-900">
                  {severity || "Not selected"}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-500">
                  Current Status
                </p>

                <p className="font-bold text-orange-600">
                  Pending
                </p>
              </div>
            </div>
          </div>

          {/* RED CROSS INFO */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="font-bold text-slate-900">
              Humanitarian Response
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              Incidents involving medical emergencies, floods, accidents,
              fires and community emergencies may also be made available
              to authorized Red Cross responders for humanitarian
              assistance.
            </p>
          </div>
        </aside>
      </form>
    </div>
  );
}