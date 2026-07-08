import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";

import { db } from "../../firebase/firebase";

type Alert = {
  id: string;
  title: string;
  message: string;
  category: string;
  severity: string;
  location?: string;
  createdAt?: any;
};

const demoAlerts: Alert[] = [
  {
    id: "demo-1",
    title: "Heavy Rainfall Warning",
    message:
      "Residents in low-lying areas are advised to stay alert and avoid flooded roads.",
    category: "Weather",
    severity: "High",
    location: "Mombasa County",
  },
  {
    id: "demo-2",
    title: "Road Closure Notice",
    message:
      "Temporary road closure reported near Nyali Bridge due to emergency response activity.",
    category: "Transport",
    severity: "Medium",
    location: "Nyali",
  },
  {
    id: "demo-3",
    title: "Community Safety Alert",
    message:
      "Nyumba Kumi leaders are requested to report suspicious activity through Jamii App.",
    category: "Security",
    severity: "Low",
    location: "Bamburi",
  },
];

export default function Alerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, "alerts"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Alert[];

        setAlerts(data);
        setLoading(false);
      },
      (error) => {
        console.error(error);
        setAlerts([]);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const visibleAlerts = alerts.length > 0 ? alerts : demoAlerts;

  function severityClass(severity: string) {
    if (severity === "High" || severity === "Critical") {
      return "bg-red-100 text-red-700";
    }

    if (severity === "Medium") {
      return "bg-orange-100 text-orange-700";
    }

    return "bg-green-100 text-green-700";
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-950">
          🔔 Alerts & Notices
        </h1>

        <p className="mt-2 text-slate-600">
          Live emergency notices, weather warnings, county alerts and community
          updates.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <section className="space-y-4">
          {loading ? (
            <div className="rounded-2xl bg-white p-8 shadow-sm">
              Loading alerts...
            </div>
          ) : (
            visibleAlerts.map((alert) => (
              <div
                key={alert.id}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:bg-slate-50 transition"
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-slate-950">
                      {alert.title}
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      {alert.category} • {alert.location || "All areas"}
                    </p>
                  </div>

                  <span
                    className={`rounded-full px-4 py-2 text-sm font-bold ${severityClass(
                      alert.severity
                    )}`}
                  >
                    {alert.severity}
                  </span>
                </div>

                <p className="mt-4 text-slate-600 leading-7">
                  {alert.message}
                </p>
              </div>
            ))
          )}
        </section>

        <aside className="space-y-5">
          <div className="rounded-2xl border border-blue-100 bg-blue-50 p-6">
            <h2 className="text-lg font-bold text-blue-800">
              Alert Channels
            </h2>

            <ul className="mt-4 space-y-3 text-sm text-blue-700">
              <li>✅ County Emergency Notices</li>
              <li>✅ Weather & Flood Warnings</li>
              <li>✅ Security Alerts</li>
              <li>✅ Community Updates</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-950">
              How alerts work
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-600">
              Alerts will be created by County, Admin, Police, Fire or Nyumba
              Kumi dashboards and delivered instantly to citizens.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}