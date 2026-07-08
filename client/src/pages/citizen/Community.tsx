import { FaBullhorn, FaCalendarAlt, FaHandsHelping, FaUsers } from "react-icons/fa";

const communityItems = [
  {
    title: "Nyumba Kumi Security Briefing",
    type: "Community Notice",
    location: "Bamburi",
    time: "Today • 5:00 PM",
    icon: <FaUsers />,
    color: "bg-blue-100 text-blue-700",
  },
  {
    title: "Flood Preparedness Meeting",
    type: "Public Safety",
    location: "Kisauni",
    time: "Tomorrow • 10:00 AM",
    icon: <FaBullhorn />,
    color: "bg-amber-100 text-amber-700",
  },
  {
    title: "Volunteer Emergency Response Drive",
    type: "Volunteer",
    location: "Mombasa County",
    time: "This Week",
    icon: <FaHandsHelping />,
    color: "bg-emerald-100 text-emerald-700",
  },
];

export default function Community() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-950">
          👥 Community
        </h1>
        <p className="mt-2 text-slate-600">
          Community safety updates, Nyumba Kumi notices, meetings and volunteer opportunities.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <section className="space-y-4">
          {communityItems.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex gap-4">
                <div className={`${item.color} flex h-14 w-14 items-center justify-center rounded-2xl text-2xl`}>
                  {item.icon}
                </div>

                <div className="flex-1">
                  <h2 className="text-xl font-bold text-slate-950">
                    {item.title}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {item.type} • {item.location}
                  </p>

                  <div className="mt-4 flex items-center gap-2 text-sm text-slate-600">
                    <FaCalendarAlt />
                    {item.time}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </section>

        <aside className="space-y-5">
          <div className="rounded-2xl border border-blue-100 bg-blue-50 p-6">
            <h2 className="text-lg font-bold text-blue-800">
              Community Role
            </h2>
            <p className="mt-3 text-sm leading-6 text-blue-700">
              This section will connect citizens with Nyumba Kumi leaders, safety volunteers,
              ward notices and community emergency updates.
            </p>
          </div>

          <button className="w-full rounded-xl bg-blue-600 py-4 font-bold text-white hover:bg-blue-700">
            Join Volunteer Network
          </button>
        </aside>
      </div>
    </div>
  );
}