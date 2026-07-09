import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { collection, onSnapshot, query } from "firebase/firestore";

import {
  FaUsers,
  FaUserShield,
  FaExclamationTriangle,
  FaBuilding,
  FaChartLine,
  FaMapMarkedAlt,
} from "react-icons/fa";

import { db } from "../../firebase/firebase";

type User = {
  id: string;
  role?: string;
};

type Report = {
  id: string;
};

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [reports, setReports] = useState<Report[]>([]);

  useEffect(() => {
    const unsubUsers = onSnapshot(query(collection(db, "users")), (snapshot) => {
      setUsers(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as User[]);
    });

    const unsubReports = onSnapshot(query(collection(db, "reports")), (snapshot) => {
      setReports(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Report[]);
    });

    return () => {
      unsubUsers();
      unsubReports();
    };
  }, []);

  const stats = useMemo(() => {
    const adminCount = users.filter((user) => user.role === "admin").length;

    return [
      {
        title: "Registered Users",
        value: users.length,
        icon: <FaUsers />,
        color: "bg-blue-100 text-blue-700",
      },
      {
        title: "Emergency Reports",
        value: reports.length,
        icon: <FaExclamationTriangle />,
        color: "bg-red-100 text-red-700",
      },
      {
        title: "Active Agencies",
        value: 7,
        icon: <FaBuilding />,
        color: "bg-emerald-100 text-emerald-700",
      },
      {
        title: "Administrators",
        value: adminCount,
        icon: <FaUserShield />,
        color: "bg-purple-100 text-purple-700",
      },
    ];
  }, [users, reports]);

  return (
    <div className="space-y-8">
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 to-purple-900 p-8 text-white">
        <h1 className="text-4xl font-extrabold">
          👨‍💼 Jamii Command Centre
        </h1>

        <p className="mt-3 text-slate-300">
          Manage users, emergency agencies, reports and the entire Jamii
          emergency response ecosystem.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => (
          <div
            key={item.title}
            className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">{item.title}</p>

                <h2 className="mt-3 text-4xl font-extrabold">
                  {item.value}
                </h2>
              </div>

              <div
                className={`${item.color} h-16 w-16 rounded-2xl flex items-center justify-center text-3xl`}
              >
                {item.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200">
          <FaUsers className="text-4xl text-blue-600" />

          <h2 className="mt-5 text-xl font-bold">User Management</h2>

          <p className="mt-2 text-slate-600">
            Register users, activate accounts, suspend accounts and manage
            profiles.
          </p>

          <Link
            to="/admin/users"
            className="mt-6 inline-block rounded-xl bg-blue-600 px-5 py-3 font-bold text-white hover:bg-blue-700"
          >
            Open Module
          </Link>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200">
          <FaMapMarkedAlt className="text-4xl text-red-600" />

          <h2 className="mt-5 text-xl font-bold">Emergency Command</h2>

          <p className="mt-2 text-slate-600">
            View all incidents and dispatch Police, Fire and Ambulance teams.
          </p>

          <Link
            to="/admin/emergencies"
            className="mt-6 inline-block rounded-xl bg-red-600 px-5 py-3 font-bold text-white hover:bg-red-700"
          >
            Open Module
          </Link>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200">
          <FaChartLine className="text-4xl text-emerald-600" />

          <h2 className="mt-5 text-xl font-bold">Analytics</h2>

          <p className="mt-2 text-slate-600">
            System performance, response times and county statistics.
          </p>

          <Link
            to="/admin/analytics"
            className="mt-6 inline-block rounded-xl bg-emerald-600 px-5 py-3 font-bold text-white hover:bg-emerald-700"
          >
            Open Module
          </Link>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200">
        <h2 className="text-xl font-bold">Admin Modules</h2>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Link to="/admin/users" className="rounded-xl bg-slate-50 p-5 hover:bg-blue-50">
            👥 User Management
          </Link>

          <Link to="/admin/roles" className="rounded-xl bg-slate-50 p-5 hover:bg-purple-50">
            🏷 Role Assignment
          </Link>

          <Link to="/admin/emergencies" className="rounded-xl bg-slate-50 p-5 hover:bg-red-50">
            🚨 Incident Control
          </Link>

          <Link to="/admin/settings" className="rounded-xl bg-slate-50 p-5 hover:bg-emerald-50">
            ⚙ System Settings
          </Link>
        </div>
      </div>
    </div>
  );
}