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
  reporterName: string;
  reporterEmail: string;
  phone: string;
  type: string;
  severity: string;
  description: string;
  location: string;
  status: string;
  assignedRole: string;
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

function typeIcon(type: string) {
  if (type === "Fire") return <FaFire />;
  if (type === "Medical") return <FaAmbulance />;
  if (type === "Flood") return <FaTint />;
  if (type === "Police") return <FaShieldAlt />;
  return <FaExclamationTriangle />;
}

function severityColor(severity: string) {
  if (severity === "Critical") return "bg-red-100 text-red-700";
  if (severity === "High") return "bg-orange-100 text-orange-700";
  if (severity === "Medium") return "bg-yellow-100 text-yellow-700";
  return "bg-green-100 text-green-700";
}

function statusColor(status: string) {
  if (status === "Resolved") return "bg-emerald-100 text-emerald-700";
  if (status === "Responding") return "bg-blue-100 text-blue-700";
  if (status === "Assigned") return "bg-purple-100 text-purple-700";
  return "bg-orange-100 text-orange-700";
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
  const respondingReports = reports.filter(
    (r) => r.status === "Responding"
  ).length;
  const resolvedReports = reports.filter((r) => r.status === "Resolved").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-950">
          🚨 Emergency Management
        </h1>
        <p className="mt-2 text-slate-600">
          Monitor live emergency reports, assign agencies, and update response status.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Total Reports</p>
          <h2 className="mt-3 text-3xl font-extrabold">{totalReports}</h2>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Pending</p>
          <h2 className="mt-3 text-3xl font-extrabold text-orange-600">
            {pendingReports}
          </h2>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Responding</p>
          <h2 className="mt-3 text-3xl font-extrabold text-blue-600">
            {respondingReports}
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
                <div className="grid gap-5 xl:grid-cols-[1fr_220px_220px]">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-xl text-red-600">
                        {typeIcon(report.type)}
                      </div>

                      <div>
                        <h3 className="text-lg font-bold text-slate-950">
                          {report.type}
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
                        {report.severity}
                      </span>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${statusColor(
                          report.status
                        )}`}
                      >
                        {report.status || "Pending"}
                      </span>
                    </div>

                    <p className="mt-4 text-slate-600">{report.description}</p>

                    <div className="mt-4 grid gap-2 text-sm text-slate-500 md:grid-cols-2">
                      <p className="flex items-center gap-2">
                        <FaMapMarkerAlt />
                        {report.location || "No location provided"}
                      </p>

                      <p className="flex items-center gap-2">
                        <FaPhoneAlt />
                        {report.phone || "No phone"}
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

                    <p className="mt-4 break-all font-mono text-xs text-slate-400">
                      {report.id}
                    </p>
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