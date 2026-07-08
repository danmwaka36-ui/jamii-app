import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";

import { db } from "../../firebase/firebase";
import { useAuth } from "../../auth/AuthContext";

type Report = {
  id: string;
  type: string;
  severity: string;
  description: string;
  location: string;
  phone: string;
  status: string;
  assignedRole: string;
  createdAt?: any;
};

export default function MyReports() {
  const { currentUser } = useAuth();

  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, "reports"),
      where("reporterId", "==", currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Report[];

      data.sort((a, b) => {
        const aTime = a.createdAt?.seconds || 0;
        const bTime = b.createdAt?.seconds || 0;
        return bTime - aTime;
      });

      setReports(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  function statusColor(status: string) {
    switch (status) {
      case "Pending":
        return "bg-orange-100 text-orange-700";

      case "Responding":
        return "bg-blue-100 text-blue-700";

      case "Resolved":
        return "bg-emerald-100 text-emerald-700";

      default:
        return "bg-slate-100 text-slate-700";
    }
  }

  function severityColor(severity: string) {
    switch (severity) {
      case "Critical":
        return "bg-red-100 text-red-700";

      case "High":
        return "bg-orange-100 text-orange-700";

      case "Medium":
        return "bg-yellow-100 text-yellow-700";

      default:
        return "bg-green-100 text-green-700";
    }
  }

  return (
    <div className="space-y-6">

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">
            📋 My Reports
          </h1>

          <p className="mt-2 text-slate-500">
            View and track all emergency reports submitted from your account.
          </p>
        </div>

        <div className="rounded-xl bg-blue-100 px-5 py-3">
          <p className="text-sm text-slate-500">
            Total Reports
          </p>

          <p className="text-2xl font-bold text-blue-700">
            {reports.length}
          </p>
        </div>
      </div>

      <div className="rounded-2xl bg-white shadow-sm border border-slate-200">

        {loading ? (

          <div className="p-10 text-center text-slate-500">
            Loading reports...
          </div>

        ) : reports.length === 0 ? (

          <div className="p-10 text-center">
            <h2 className="text-xl font-bold text-slate-700">
              No Reports Found
            </h2>

            <p className="mt-2 text-slate-500">
              Submit your first emergency report to see it here.
            </p>
          </div>

        ) : (

          <div className="divide-y">

            {reports.map((report) => (

              <div
                key={report.id}
                className="p-6 hover:bg-slate-50 transition"
              >

                <div className="flex justify-between items-start">

                  <div>

                    <div className="flex items-center gap-3">

                      <h2 className="text-xl font-bold text-slate-900">
                        {report.type}
                      </h2>

                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${severityColor(
                          report.severity
                        )}`}
                      >
                        {report.severity}
                      </span>

                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${statusColor(
                          report.status
                        )}`}
                      >
                        {report.status}
                      </span>

                    </div>

                    <p className="mt-4 text-slate-600">
                      {report.description}
                    </p>

                    <div className="mt-4 space-y-1 text-sm text-slate-500">

                      <p>
                        📍 {report.location || "No location"}
                      </p>

                      <p>
                        📞 {report.phone}
                      </p>

                      <p>
                        👮 Assigned Team:
                        <span className="ml-2 capitalize font-semibold text-blue-700">
                          {report.assignedRole}
                        </span>
                      </p>

                    </div>

                  </div>

                  <div className="text-right">

                    <p className="text-xs text-slate-400">
                      Report ID
                    </p>

                    <p className="font-mono text-xs">
                      {report.id}
                    </p>

                  </div>

                </div>

              </div>

            ))}

          </div>

        )}

      </div>

    </div>
  );
}