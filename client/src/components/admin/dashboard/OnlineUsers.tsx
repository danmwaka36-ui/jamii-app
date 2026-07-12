import type { ReactNode } from "react";
import {
  FaAmbulance,
  FaBuilding,
  FaFire,
  FaShieldAlt,
  FaUserShield,
  FaUsers,
} from "react-icons/fa";

export type OnlineUser = {
  id: string;
  name: string;
  role: string;
  agency: string;
  location: string;
  status: "Online" | "Busy" | "Offline";
  avatar?: string;
  icon?: ReactNode;
};

type OnlineUsersProps = {
  users?: OnlineUser[];
  loading?: boolean;
};

const defaultUsers: OnlineUser[] = [
  {
    id: "1",
    name: "Inspector Jane Mwangi",
    role: "Police Commander",
    agency: "Police",
    location: "Nyali Station",
    status: "Online",
    icon: <FaShieldAlt />,
  },
  {
    id: "2",
    name: "Peter Otieno",
    role: "Fire Officer",
    agency: "Fire",
    location: "Mombasa Fire HQ",
    status: "Busy",
    icon: <FaFire />,
  },
  {
    id: "3",
    name: "Dr. Amina Hassan",
    role: "Paramedic",
    agency: "Ambulance",
    location: "Coast General",
    status: "Online",
    icon: <FaAmbulance />,
  },
  {
    id: "4",
    name: "Ali Mohamed",
    role: "County Officer",
    agency: "County",
    location: "County HQ",
    status: "Online",
    icon: <FaBuilding />,
  },
  {
    id: "5",
    name: "Grace Wanjiku",
    role: "Administrator",
    agency: "Administration",
    location: "Jamii Command Centre",
    status: "Online",
    icon: <FaUserShield />,
  },
  {
    id: "6",
    name: "Community Team",
    role: "Nyumba Kumi",
    agency: "Community",
    location: "Kisauni",
    status: "Offline",
    icon: <FaUsers />,
  },
];

function statusStyle(status: string) {
  switch (status) {
    case "Online":
      return {
        badge: "bg-emerald-100 text-emerald-700",
        dot: "bg-emerald-500 animate-pulse",
      };

    case "Busy":
      return {
        badge: "bg-orange-100 text-orange-700",
        dot: "bg-orange-500",
      };

    default:
      return {
        badge: "bg-slate-100 text-slate-700",
        dot: "bg-slate-500",
      };
  }
}

export default function OnlineUsers({
  users = defaultUsers,
  loading = false,
}: OnlineUsersProps) {
  const online = users.filter((u) => u.status === "Online").length;
  const busy = users.filter((u) => u.status === "Busy").length;
  const offline = users.filter((u) => u.status === "Offline").length;

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 p-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Online Users
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Connected responders across all agencies.
          </p>
        </div>

        <div className="rounded-xl bg-emerald-50 px-4 py-3">
          <p className="text-xs font-bold uppercase text-emerald-600">
            Connected
          </p>

          <p className="text-2xl font-extrabold text-emerald-700">
            {online}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4 p-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="h-20 animate-pulse rounded-xl bg-slate-100"
            />
          ))}
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {users.map((user) => {
            const style = statusStyle(user.status);

            return (
              <div
                key={user.id}
                className="flex items-center justify-between p-5 transition hover:bg-slate-50"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-xl text-blue-700">
                    {user.icon}
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-900">
                      {user.name}
                    </h3>

                    <p className="text-sm text-slate-500">
                      {user.role}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      {user.location}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold ${style.badge}`}
                  >
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${style.dot}`}
                    />

                    {user.status}
                  </span>

                  <p className="mt-2 text-xs text-slate-500">
                    {user.agency}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="grid grid-cols-3 border-t border-slate-100 bg-slate-50 p-5 text-center">
        <div>
          <p className="text-xs uppercase text-slate-500">
            Online
          </p>

          <p className="text-2xl font-bold text-emerald-700">
            {online}
          </p>
        </div>

        <div>
          <p className="text-xs uppercase text-slate-500">
            Busy
          </p>

          <p className="text-2xl font-bold text-orange-700">
            {busy}
          </p>
        </div>

        <div>
          <p className="text-xs uppercase text-slate-500">
            Offline
          </p>

          <p className="text-2xl font-bold text-slate-700">
            {offline}
          </p>
        </div>
      </div>
    </section>
  );
}