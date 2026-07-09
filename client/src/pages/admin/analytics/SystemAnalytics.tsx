import { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot, query } from "firebase/firestore";
import {
  FaAmbulance,
  FaChartLine,
  FaCheckCircle,
  FaClock,
  FaExclamationTriangle,
  FaFire,
  FaShieldAlt,
  FaUsers,
} from "react-icons/fa";

import { db } from "../../../firebase/firebase";

type User = {
  id: string;
  role?: string;
  status?: string;
};

type Report = {
  id: string;
  type?: string;
  status?: string;
  severity?: string;
  assignedRole?: string;
};

export default function SystemAnalytics() {
  const [users, setUsers] = useState<User[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const usersQuery = query(collection(db, "users"));
    const reportsQuery = query(collection(db, "reports"));

    const unsubscribeUsers = onSnapshot(usersQuery, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as User[];

      setUsers(data);
      setLoading(false);
    });

    const unsubscribeReports = onSnapshot(reportsQuery, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Report[];

      setReports(data);
      setLoading(false);
    });

    return () => {
      unsubscribeUsers();
      unsubscribeReports();
    };
  }, []);

  const analytics = useMemo(() => {
    const totalUsers = users.length;
    const totalReports = reports.length;

    const activeUsers = users.filter(
      (user) => user.status !== "suspended"
    ).length;

    const suspendedUsers = users.filter(
      (user) => user.status === "suspended"
    ).length;

    const pendingReports = reports.filter(
      (report) => report.status === "Pending"
    ).length;

    const respondingReports = reports.filter(
      (report) => report.status === "Responding"
    ).length;

    const resolvedReports = reports.filter(
      (report) => report.status === "Resolved"
    ).length;

    const fireReports = reports.filter(
      (report) => report.type === "Fire"
    ).length;

    const medicalReports = reports.filter(
      (report) => report.type === "Medical"
    ).length;

    const policeReports = reports.filter(
      (report) => report.type === "Police"
    ).length;

    const criticalReports = reports.filter(
      (report) => report.severity === "Critical"
    ).length;

    return {
      totalUsers,
      activeUsers,
      suspendedUsers,
      totalReports,
      pendingReports,
      respondingReports,
      resolvedReports,
      fireReports,
      medicalReports,
      policeReports,
      criticalReports,
    };
  }, [users, reports]);

  const cards = [
    {
      title: "Total Users",
      value: analytics.totalUsers,
      icon: <FaUsers />,
      color: "bg-blue-100 text-blue-700",
    },
    {
      title: "Active Users",
      value: analytics.activeUsers,
      icon: <FaCheckCircle />,
      color: "bg-emerald-100 text-emerald-700",
    },
    {
      title: "Suspended Users",
      value: analytics.suspendedUsers,
      icon: <FaShieldAlt />,
      color: "bg-red-100 text-red-700",
    },
    {
      title: "Total Reports",
      value: analytics.totalReports,
      icon: <FaExclamationTriangle />,
      color: "bg-orange-100 text-orange-700",
    },
    {
      title: "Pending Reports",
      value: analytics.pendingReports,
      icon: <FaClock />,
      color: "bg-yellow-100 text-yellow-700",
    },
    {
      title: "Responding",
      value: analytics.respondingReports,
      icon: <FaAmbulance />,
      color: "bg-purple-100 text-purple-700",
    },
    {
      title: "Resolved",
      value: analytics.resolvedReports,
      icon: <FaCheckCircle />,
      color: "bg-emerald-100 text-emerald-700",
    },
    {
      title: "Critical Reports",
      value: analytics.criticalReports,
      icon: <FaExclamationTriangle />,
      color: "bg-red-100 text-red-700",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-950">
          📊 System Analytics
        </h1>

        <p className="mt-2 text-slate-600">
          Real-time platform metrics from Firestore users and emergency reports.
        </p>
      </div>

      {loading ? (
        <div className="rounded-2xl bg-white p-8 text-slate-500 shadow-sm">
          Loading analytics...
        </div>
      ) : (
        <>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {cards.map((card) => (
              <div
                key={card.title}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div
                  className={`${card.color} flex h-14 w-14 items-center justify-center rounded-2xl text-2xl`}
                >
                  {card.icon}
                </div>

                <p className="mt-4 text-sm text-slate-500">{card.title}</p>
                <h2 className="text-3xl font-extrabold text-slate-950">
                  {card.value}
                </h2>
              </div>
            ))}
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="flex items-center gap-3 text-xl font-bold text-slate-950">
                <FaChartLine />
                Incident Breakdown
              </h2>

              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between rounded-xl bg-red-50 p-4">
                  <span className="flex items-center gap-3 font-bold text-red-700">
                    <FaFire />
                    Fire Reports
                  </span>
                  <span className="text-2xl font-extrabold text-red-700">
                    {analytics.fireReports}
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-xl bg-emerald-50 p-4">
                  <span className="flex items-center gap-3 font-bold text-emerald-700">
                    <FaAmbulance />
                    Medical Reports
                  </span>
                  <span className="text-2xl font-extrabold text-emerald-700">
                    {analytics.medicalReports}
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-xl bg-blue-50 p-4">
                  <span className="flex items-center gap-3 font-bold text-blue-700">
                    <FaShieldAlt />
                    Police Reports
                  </span>
                  <span className="text-2xl font-extrabold text-blue-700">
                    {analytics.policeReports}
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold text-slate-950">
                SaaS Analytics Roadmap
              </h2>

              <ul className="mt-5 space-y-3 text-sm text-slate-600">
                <li>✅ Real-time Firestore metrics</li>
                <li>✅ User and report counts</li>
                <li>✅ Incident category breakdown</li>
                <li>⏳ Charts and graphs</li>
                <li>⏳ Response time analytics</li>
                <li>⏳ Agency performance scoring</li>
                <li>⏳ County and ward heat maps</li>
              </ul>
            </div>
          </div>
        </>
      )}
    </div>
  );
}