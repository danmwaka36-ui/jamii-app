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
  FaAmbulance,
  FaClock,
  FaExclamationTriangle,
  FaFire,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaShieldAlt,
  FaTint,
} from "react-icons/fa";

import { db } from "../../../firebase/firebase";

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
  assignedResponderName?: string | null;
  priority?: number;
  createdAt?: any;
};

const roles = [
  "police",
  "fire",
  "ambulance",
  "county",
  "redcross",
  "nyumbakumi",
];

const statuses = ["Pending", "Assigned", "Responding", "Resolved"];

function typeIcon(type?: string) {
  if (type === "Fire") return <FaFire />;
  if (type === "Medical") return <FaAmbulance />;
  if (type === "Flood") return <FaTint />;
  if (type === "Police") return <FaShieldAlt />;
  return <FaExclamationTriangle />;
}

function severityColor(severity?: string) {
  if (severity === "Critical") return "bg-red-100 text-red-700";
  if (severity === "High") return "bg-orange-100 text-orange-700";
  if (severity === "Medium") return "bg-yellow-100 text-yellow-700";
  return "bg-green-100 text-green-700";
}

function statusColor(status?: string) {
  if (status === "Resolved") return "bg-emerald-100 text-emerald-700";
  if (status === "Responding") return "bg-blue-100 text-blue-700";
  if (status === "Assigned") return "bg-purple-100 text-purple-700";
  return "bg-orange-100 text-orange-700";
}

function priorityColor(priority?: number) {
  if (priority === 1) return "bg-red-600 text-white";
  if (priority === 2) return "bg-orange-500 text-white";
  if (priority === 3) return "bg-yellow-400 text-black";
  if (priority === 4) return "bg-blue-500 text-white";
  return "bg-green-500 text-white";
}

function formatDateTime(timestamp: any) {
  if (!timestamp?.toDate) return "Time not available";

  return timestamp.toDate().toLocaleString("en-KE", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function timeAgo(timestamp: any) {
  if (!timestamp?.toDate) return "Unknown";

  const diff = Date.now() - timestamp.toDate().getTime();
  const mins = Math.floor(diff / 60000);

  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min ago`;

  const hrs = Math.floor(mins / 60);

  if (hrs < 24) return `${hrs} hr ago`;

  return `${Math.floor(hrs / 24)} day(s) ago`;
}

export default function EmergencyManagement() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");

  useEffect(() => {
    const q = query(collection(db, "reports"), orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((item) => ({
        id: item.id,
        ...item.data(),
      })) as Report[];

      setReports(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      const matchesStatus =
        statusFilter === "all" || report.status === statusFilter;

      const matchesRole =
        roleFilter === "all" || report.assignedRole === roleFilter;

      return matchesStatus && matchesRole;
    });
  }, [reports, statusFilter, roleFilter]);

  async function updateReportStatus(reportId: string, status: string) {
    await updateDoc(doc(db, "reports", reportId), {
      status,
      updatedAt: serverTimestamp(),
    });
  }

  async function updateAssignedRole(reportId: string, assignedRole: string) {
    await updateDoc(doc(db, "reports", reportId), {
      assignedRole,
      status: "Assigned",
      updatedAt: serverTimestamp(),
    });
  }

  const totalReports = reports.length;
  const pendingReports = reports.filter((r) => r.status === "Pending").length;
  const assignedReports = reports.filter((r) => r.status === "Assigned").length;
  const respondingReports = reports.filter((r) => r.status === "Responding").length;
  const resolvedReports = reports.filter((r) => r.status === "Resolved").length;
  const criticalReports = reports.filter((r) => r.severity === "Critical").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-950">
          🚨 Emergency Management
        </h1>
        <p className="mt-2 text-slate-600">
          Monitor live emergency reports, assign agencies, update status, and track response progress.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Total Reports</p>
          <h2 className="mt-3 text-3xl font-extrabold">{totalReports}</h2>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Critical</p>
          <h2 className="mt-3 text-3xl font-extrabold text-red-600">
            {criticalReports}
          </h2>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Pending</p>
          <h2 className="mt-3 text-3xl font-extrabold text-orange-600">
            {pendingReports}
          </h2>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Assigned</p>
          <h2 className="mt-3 text-3xl font-extrabold text-purple-600">
            {assignedReports}
          </h2>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Resolved</p>
          <h2 className="mt-3 text-3xl font-extrabold text-emerald-600">
            {resolvedReports}
          </h2>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-slate-200 px-4 py-3 outline-none"
          >
            <option value="all">All Statuses</option>
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="rounded-xl border border-slate-200 px-4 py-3 outline-none"
          >
            <option value="all">All Agencies</option>
            {roles.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-6 py-5">
          <h2 className="text-xl font-bold text-slate-950">
            Live Incident Queue
          </h2>
          <p className="text-sm text-slate-500">
            Real-time reports from Firestore reports collection.
          </p>
        </div>

        {loading ? (
          <div className="p-8 text-slate-500">Loading emergency reports...</div>
        ) : filteredReports.length === 0 ? (
          <div className="p-8 text-slate-500">No emergency reports found.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredReports.map((report) => (
              <div key={report.id} className="p-6 hover:bg-slate-50">
                <div className="grid gap-5 xl:grid-cols-[1fr_240px_240px]">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-xl text-red-600">
                        {typeIcon(report.type)}
                      </div>

                      <div>
                        <h3 className="text-lg font-bold text-slate-950">
                          {report.type || "Emergency"}
                        </h3>
                        <p className="text-sm text-slate-500">
                          Reported by {report.reporterName || "Unknown"}
                        </p>
                      </div>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${severityColor(
                          report.severity
                        )}`}
                      >
                        {report.severity || "Low"}
                      </span>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${statusColor(
                          report.status
                        )}`}
                      >
                        {report.status || "Pending"}
                      </span>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${priorityColor(
                          report.priority
                        )}`}
                      >
                        Priority {report.priority ?? "N/A"}
                      </span>
                    </div>

                    <p className="mt-4 text-slate-600">
                      {report.description || "No description provided."}
                    </p>

                    <div className="mt-4 grid gap-2 text-sm text-slate-500 md:grid-cols-2">
                      <p className="flex items-center gap-2">
                        <FaMapMarkerAlt />
                        {report.location || "No location provided"}
                      </p>

                      <p className="flex items-center gap-2">
                        <FaPhoneAlt />
                        {report.phone || "No phone"}
                      </p>

                      <p className="flex items-center gap-2">
                        <FaClock />
                        Submitted: {formatDateTime(report.createdAt)}
                      </p>

                      <p className="font-bold text-red-600">
                        Waiting: {timeAgo(report.createdAt)}
                      </p>
                    </div>

                    <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
                      <p>
                        <span className="font-semibold">Reporter Email:</span>{" "}
                        {report.reporterEmail || "Not available"}
                      </p>
                      <p className="mt-1">
                        <span className="font-semibold">Incident ID:</span>{" "}
                        <span className="font-mono text-xs">{report.id}</span>
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-slate-500">
                      Assigned Agency
                    </p>

                    <select
                      value={report.assignedRole || ""}
                      onChange={(e) =>
                        updateAssignedRole(report.id, e.target.value)
                      }
                      className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none"
                    >
                      <option value="">Assign agency</option>
                      {roles.map((role) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                    </select>

                    <div className="mt-5 rounded-xl bg-slate-50 p-4 text-sm">
                      <p className="text-slate-500">Responder</p>
                      <p className="mt-1 font-bold text-slate-900">
                        {report.assignedResponderName || "Not Assigned"}
                      </p>

                      <p className="mt-4 text-slate-500">Vehicle</p>
                      <p className="mt-1 font-bold text-slate-900">--</p>

                      <p className="mt-4 text-slate-500">ETA</p>
                      <p className="mt-1 font-bold text-slate-900">--</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-slate-500">
                      Response Status
                    </p>

                    <select
                      value={report.status || "Pending"}
                      onChange={(e) =>
                        updateReportStatus(report.id, e.target.value)
                      }
                      className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none"
                    >
                      {statuses.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>

                    <div className="mt-5 grid gap-3">
                      <a
                        href={`tel:${report.phone || ""}`}
                        className="rounded-xl bg-blue-600 px-4 py-3 text-center text-sm font-bold text-white hover:bg-blue-700"
                      >
                        Call Reporter
                      </a>

                      <button className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50">
                        View Map
                      </button>

                      <button
                        onClick={() => updateReportStatus(report.id, "Responding")}
                        className="rounded-xl bg-purple-600 px-4 py-3 text-sm font-bold text-white hover:bg-purple-700"
                      >
                        Dispatch
                      </button>

                      <button
                        onClick={() => updateReportStatus(report.id, "Resolved")}
                        className="rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-700"
                      >
                        Close Incident
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5 text-sm text-blue-700">
        Admin changes here update Firestore immediately. Responder dashboards
        will later read reports filtered by their assigned agency.
      </div>
    </div>
  );
}