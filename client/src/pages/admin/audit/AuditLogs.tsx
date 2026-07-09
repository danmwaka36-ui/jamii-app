import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";

import { FaClipboardList } from "react-icons/fa";
import { db } from "../../../firebase/firebase";

type AuditLog = {
  id: string;
  action: string;
  targetUserName: string;
  targetUserEmail: string;
  oldValue: string;
  newValue: string;
  performedByName: string;
  performedByEmail: string;
  createdAt?: any;
};

export default function AuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, "auditLogs"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as AuditLog[];

      setLogs(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-3 text-3xl font-extrabold text-slate-950">
          <FaClipboardList />
          Audit Logs
        </h1>
        <p className="mt-2 text-slate-600">
          Track admin actions, role changes and account status updates.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="p-8 text-slate-500">Loading audit logs...</div>
        ) : logs.length === 0 ? (
          <div className="p-8 text-slate-500">No audit logs yet.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {logs.map((log) => (
              <div key={log.id} className="p-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h2 className="font-bold text-slate-950">
                      {log.action}
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Target: {log.targetUserName} ({log.targetUserEmail})
                    </p>
                  </div>

                  <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-bold text-purple-700">
                    {log.oldValue} → {log.newValue}
                  </span>
                </div>

                <p className="mt-4 text-sm text-slate-600">
                  Performed by{" "}
                  <span className="font-bold">
                    {log.performedByName}
                  </span>{" "}
                  ({log.performedByEmail})
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}