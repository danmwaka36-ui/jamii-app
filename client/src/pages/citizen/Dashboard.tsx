import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";

import {
  FaAmbulance,
  FaBullhorn,
  FaCarCrash,
  FaFire,
  FaPhoneAlt,
  FaPlusCircle,
  FaShieldAlt,
  FaTint,
  FaTimes,
  FaCloudSun,
} from "react-icons/fa";

const stats = [
  {
    title: "Active Emergencies",
    value: "12",
    change: "+2 from yesterday",
    icon: <FaShieldAlt />,
    bg: "bg-red-50",
    iconBg: "bg-red-100",
    iconText: "text-red-600",
    changeText: "text-red-600",
  },
  {
    title: "Fire Incidents",
    value: "4",
    change: "+1 from yesterday",
    icon: <FaFire />,
    bg: "bg-orange-50",
    iconBg: "bg-orange-100",
    iconText: "text-orange-600",
    changeText: "text-orange-600",
  },
  {
    title: "Police Reports",
    value: "18",
    change: "+3 from yesterday",
    icon: <FaShieldAlt />,
    bg: "bg-blue-50",
    iconBg: "bg-blue-100",
    iconText: "text-blue-600",
    changeText: "text-blue-600",
  },
  {
    title: "Ambulances Dispatched",
    value: "9",
    change: "+2 from yesterday",
    icon: <FaAmbulance />,
    bg: "bg-emerald-50",
    iconBg: "bg-emerald-100",
    iconText: "text-emerald-600",
    changeText: "text-emerald-600",
  },
  {
    title: "Flood Alerts",
    value: "3",
    change: "No change",
    icon: <FaTint />,
    bg: "bg-purple-50",
    iconBg: "bg-purple-100",
    iconText: "text-purple-600",
    changeText: "text-slate-500",
  },
  {
    title: "Community Notices",
    value: "7",
    change: "+1 from yesterday",
    icon: <FaBullhorn />,
    bg: "bg-amber-50",
    iconBg: "bg-amber-100",
    iconText: "text-amber-600",
    changeText: "text-amber-600",
  },
];

const activities = [
  {
    title: "Fire reported at Bamburi",
    time: "5 mins ago",
    icon: <FaFire />,
    color: "text-red-600",
    bg: "bg-red-50",
    dot: "bg-red-500",
  },
  {
    title: "Ambulance dispatched to Nyali",
    time: "30 mins ago",
    icon: <FaAmbulance />,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    dot: "bg-emerald-500",
  },
  {
    title: "Police responding to robbery alert",
    time: "1 hour ago",
    icon: <FaShieldAlt />,
    color: "text-blue-600",
    bg: "bg-blue-50",
    dot: "bg-blue-500",
  },
  {
    title: "Heavy rainfall warning issued",
    time: "2 hours ago",
    icon: <FaTint />,
    color: "text-sky-600",
    bg: "bg-sky-50",
    dot: "bg-sky-500",
  },
  {
    title: "County emergency bulletin updated",
    time: "3 hours ago",
    icon: <FaBullhorn />,
    color: "text-amber-600",
    bg: "bg-amber-50",
    dot: "bg-amber-500",
  },
];

const reports = [
  {
    title: "Hit and Run Accident",
    location: "Nyali, Mombasa",
    date: "23 May 2025",
    time: "02:15 PM",
    status: "Resolved",
    icon: <FaCarCrash />,
    color: "text-red-600",
    bg: "bg-red-50",
  },
  {
    title: "Street Light Not Working",
    location: "Bamburi, Mombasa",
    date: "22 May 2025",
    time: "08:40 AM",
    status: "In Progress",
    icon: <FaBullhorn />,
    color: "text-orange-600",
    bg: "bg-orange-50",
  },
  {
    title: "Flooded Road",
    location: "Kisauni, Mombasa",
    date: "21 May 2025",
    time: "06:30 PM",
    status: "Reported",
    icon: <FaTint />,
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    title: "Suspicious Activity",
    location: "Tudor, Mombasa",
    date: "20 May 2025",
    time: "11:20 AM",
    status: "Resolved",
    icon: <FaShieldAlt />,
    color: "text-purple-600",
    bg: "bg-purple-50",
  },
];

const contacts = [
  {
    title: "Police",
    number: "999 / 112",
    callNumber: "999",
    icon: <FaShieldAlt />,
    bg: "bg-blue-50",
    color: "text-blue-600",
  },
  {
    title: "Ambulance",
    number: "998",
    callNumber: "998",
    icon: <FaAmbulance />,
    bg: "bg-emerald-50",
    color: "text-emerald-600",
  },
  {
    title: "Fire Brigade",
    number: "997",
    callNumber: "997",
    icon: <FaFire />,
    bg: "bg-red-50",
    color: "text-red-600",
  },
  {
    title: "County Emergency",
    number: "996",
    callNumber: "996",
    icon: <FaBullhorn />,
    bg: "bg-purple-50",
    color: "text-purple-600",
  },
];

export default function Dashboard() {
  const { userProfile } = useAuth();
  const [now, setNow] = useState(new Date());

  const firstName = userProfile?.fullName?.split(" ")[0] || "User";

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const currentDate = now.toLocaleDateString("en-KE", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const currentTime = now.toLocaleTimeString("en-KE", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[1fr_390px]">
        <section className="space-y-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-950">
                Welcome back, {firstName} 👋
              </h1>

              <p className="mt-2 text-slate-600">
                Stay informed. Stay safe. We're here for you.
              </p>
            </div>

            <div className="space-y-2 text-right text-sm text-slate-600">
              <p>{currentDate}</p>
              <p className="text-xl font-bold text-slate-900">
                {currentTime}
              </p>

              <div className="inline-flex items-center gap-2 rounded-xl bg-sky-50 px-4 py-2 text-sky-700">
                <FaCloudSun />
                <span className="font-semibold">Mombasa Weather</span>
              </div>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {stats.map((item) => (
              <div
                key={item.title}
                className={`${item.bg} rounded-2xl border border-slate-100 p-6 shadow-sm`}
              >
                <div className="flex items-center gap-5">
                  <div
                    className={`${item.iconBg} ${item.iconText} flex h-16 w-16 items-center justify-center rounded-full text-3xl`}
                  >
                    {item.icon}
                  </div>

                  <div>
                    <p className="text-3xl font-extrabold text-slate-950">
                      {item.value}
                    </p>
                    <p className="text-sm text-slate-700">{item.title}</p>
                  </div>
                </div>

                <p className={`mt-4 text-sm ${item.changeText}`}>
                  {item.change}
                </p>
              </div>
            ))}
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <h2 className="font-bold text-slate-950">
                  Live Emergency Map
                </h2>

                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                  ● Live
                </span>
              </div>

              <div className="relative h-[390px] bg-gradient-to-br from-blue-100 via-slate-100 to-emerald-100">
                <div className="absolute inset-0 opacity-40 bg-[linear-gradient(90deg,#cbd5e1_1px,transparent_1px),linear-gradient(#cbd5e1_1px,transparent_1px)] bg-[size:40px_40px]" />

                <div className="absolute left-[45%] top-[52%] text-3xl font-extrabold text-slate-900">
                  Mombasa
                </div>

                <div className="absolute left-[52%] top-[22%] flex h-14 w-14 items-center justify-center rounded-full bg-red-600 text-white shadow-xl">
                  <FaFire />
                </div>

                <div className="absolute left-[70%] top-[45%] flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white shadow-xl">
                  <FaShieldAlt />
                </div>

                <div className="absolute bottom-[22%] right-[16%] flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600 text-white shadow-xl">
                  <FaAmbulance />
                </div>

                <Link
                  to="/dashboard/safe-zones"
                  className="absolute bottom-5 left-5 rounded-xl bg-white px-4 py-3 text-sm font-bold text-blue-700 shadow"
                >
                  View Full Map
                </Link>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="font-bold text-slate-950">My Recent Reports</h2>

                <Link
                  to="/dashboard/reports"
                  className="text-sm font-semibold text-blue-600"
                >
                  View all
                </Link>
              </div>

              <div className="divide-y divide-slate-100">
                {reports.map((item) => (
                  <div
                    key={item.title}
                    className="flex items-center gap-4 py-4"
                  >
                    <div
                      className={`${item.bg} ${item.color} flex h-12 w-12 items-center justify-center rounded-xl text-xl`}
                    >
                      {item.icon}
                    </div>

                    <div className="flex-1">
                      <p className="font-bold text-slate-900">{item.title}</p>
                      <p className="text-sm text-slate-500">{item.location}</p>

                      <span
                        className={`mt-2 inline-block rounded-md px-2 py-1 text-xs font-semibold ${
                          item.status === "Resolved"
                            ? "bg-emerald-100 text-emerald-700"
                            : item.status === "In Progress"
                            ? "bg-orange-100 text-orange-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>

                    <div className="text-right text-sm text-slate-500">
                      <p>{item.date}</p>
                      <p>{item.time}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Link
                to="/dashboard/report"
                className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 font-bold text-white hover:bg-blue-700"
              >
                <FaPlusCircle />
                Report New Emergency
              </Link>
            </div>
          </div>
        </section>

        <aside className="space-y-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-950">
                Latest Activity
              </h2>

              <Link
                to="/dashboard/alerts"
                className="text-sm font-semibold text-blue-600"
              >
                View all
              </Link>
            </div>

            <div className="space-y-4">
              {activities.map((item) => (
                <div key={item.title} className="flex gap-4">
                  <div className="relative pt-2">
                    <span
                      className={`block h-2.5 w-2.5 rounded-full ${item.dot}`}
                    />
                  </div>

                  <div
                    className={`${item.bg} ${item.color} flex h-11 w-11 items-center justify-center rounded-xl text-lg`}
                  >
                    {item.icon}
                  </div>

                  <div>
                    <p className="font-bold text-slate-900">{item.title}</p>
                    <p className="text-sm text-slate-500">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>

            <Link
              to="/dashboard/alerts"
              className="mt-6 block w-full rounded-xl border border-slate-200 py-3 text-center text-sm font-bold text-blue-700"
            >
              View all activity
            </Link>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-5 text-lg font-bold text-slate-950">
              Emergency Contacts
            </h2>

            <div className="space-y-4">
              {contacts.map((item) => (
                <div key={item.title} className="flex items-center gap-4">
                  <div
                    className={`${item.bg} ${item.color} flex h-12 w-12 items-center justify-center rounded-xl`}
                  >
                    {item.icon}
                  </div>

                  <div className="flex-1">
                    <p className="font-bold text-slate-900">{item.title}</p>
                    <p className="text-sm text-slate-500">{item.number}</p>
                  </div>

                  <a
                    href={`tel:${item.callNumber}`}
                    className="rounded-lg border border-slate-200 p-3 text-blue-600 hover:bg-blue-50"
                  >
                    <FaPhoneAlt />
                  </a>
                </div>
              ))}
            </div>

            <Link
              to="/dashboard/contacts"
              className="mt-6 block w-full rounded-xl border border-slate-200 py-3 text-center text-sm font-bold text-blue-700"
            >
              View all contacts
            </Link>
          </div>

          <div className="rounded-2xl border border-red-100 bg-red-50 p-5">
            <h2 className="font-bold text-red-700">Quick SOS</h2>
            <p className="mt-2 text-sm text-red-700">
              Tap to call emergency services immediately.
            </p>

            <a
              href="tel:999"
              className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-red-600 py-3 font-bold text-white hover:bg-red-700"
            >
              <FaPhoneAlt />
              Call SOS
            </a>
          </div>
        </aside>
      </div>

      <div className="flex items-center justify-between rounded-xl border border-blue-100 bg-blue-50 px-5 py-4 text-sm text-slate-700">
        <p>
          <span className="font-bold text-blue-700">Safety Tip:</span> Always
          share your location when reporting an emergency for faster response.
        </p>

        <FaTimes className="text-slate-400" />
      </div>
    </div>
  );
}