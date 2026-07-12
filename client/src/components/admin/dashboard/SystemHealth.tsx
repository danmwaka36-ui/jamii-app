import {
  FaBell,
  FaCloud,
  FaDatabase,
  FaEnvelope,
  FaMapMarkedAlt,
  FaServer,
  FaShieldAlt,
  FaSms,
} from "react-icons/fa";

type ServiceStatus =
  | "online"
  | "healthy"
  | "active"
  | "warning"
  | "offline"
  | "planned";

type SystemService = {
  id: string;
  name: string;
  description: string;
  status: ServiceStatus;
  icon: React.ReactNode;
};

type SystemHealthProps = {
  services?: SystemService[];
  loading?: boolean;
};

const defaultServices: SystemService[] = [
  {
    id: "firebase-auth",
    name: "Firebase Authentication",
    description: "User authentication and access control",
    status: "online",
    icon: <FaShieldAlt />,
  },
  {
    id: "firestore",
    name: "Firestore Database",
    description: "Real-time operational data",
    status: "healthy",
    icon: <FaDatabase />,
  },
  {
    id: "cloudflare",
    name: "Cloudflare Hosting",
    description: "Web application hosting and delivery",
    status: "online",
    icon: <FaCloud />,
  },
  {
    id: "emergency-api",
    name: "Emergency API",
    description: "Incident and dispatch services",
    status: "active",
    icon: <FaServer />,
  },
  {
    id: "notifications",
    name: "Notification Service",
    description: "Firebase push notifications",
    status: "active",
    icon: <FaBell />,
  },
  {
    id: "maps",
    name: "GPS & Maps",
    description: "GIS and responder location services",
    status: "online",
    icon: <FaMapMarkedAlt />,
  },
  {
    id: "email",
    name: "Email Service",
    description: "System and emergency email alerts",
    status: "planned",
    icon: <FaEnvelope />,
  },
  {
    id: "sms",
    name: "SMS Gateway",
    description: "Emergency SMS delivery",
    status: "warning",
    icon: <FaSms />,
  },
];

const statusStyles: Record<
  ServiceStatus,
  {
    label: string;
    badge: string;
    dot: string;
    icon: string;
  }
> = {
  online: {
    label: "Online",
    badge: "bg-emerald-100 text-emerald-700",
    dot: "bg-emerald-500",
    icon: "bg-emerald-100 text-emerald-700",
  },
  healthy: {
    label: "Healthy",
    badge: "bg-emerald-100 text-emerald-700",
    dot: "bg-emerald-500",
    icon: "bg-emerald-100 text-emerald-700",
  },
  active: {
    label: "Active",
    badge: "bg-blue-100 text-blue-700",
    dot: "bg-blue-500",
    icon: "bg-blue-100 text-blue-700",
  },
  warning: {
    label: "Attention",
    badge: "bg-amber-100 text-amber-700",
    dot: "bg-amber-500",
    icon: "bg-amber-100 text-amber-700",
  },
  offline: {
    label: "Offline",
    badge: "bg-red-100 text-red-700",
    dot: "bg-red-500",
    icon: "bg-red-100 text-red-700",
  },
  planned: {
    label: "Planned",
    badge: "bg-purple-100 text-purple-700",
    dot: "bg-purple-500",
    icon: "bg-purple-100 text-purple-700",
  },
};

export default function SystemHealth({
  services = defaultServices,
  loading = false,
}: SystemHealthProps) {
  const operationalServices = services.filter((service) =>
    ["online", "healthy", "active"].includes(service.status)
  ).length;

  const healthPercentage =
    services.length === 0
      ? 0
      : Math.round((operationalServices / services.length) * 100);

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div>
          <h2 className="text-xl font-bold text-slate-950">
            System Health
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Current status of Jamii platform services.
          </p>
        </div>

        <div className="flex items-center gap-3 rounded-xl bg-emerald-50 px-4 py-3">
          <span className="h-3 w-3 animate-pulse rounded-full bg-emerald-500" />

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
              Operational health
            </p>

            <p className="font-extrabold text-emerald-700">
              {healthPercentage}%
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="h-24 animate-pulse rounded-2xl bg-slate-100"
            />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-6">
          {services.map((service) => {
            const style = statusStyles[service.status];

            return (
              <div
                key={service.id}
                className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-slate-300 hover:bg-white hover:shadow-sm"
              >
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-xl ${style.icon}`}
                >
                  {service.icon}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <h3 className="font-bold text-slate-900">
                      {service.name}
                    </h3>

                    <span
                      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold ${style.badge}`}
                    >
                      <span
                        className={`h-2 w-2 rounded-full ${style.dot}`}
                      />

                      {style.label}
                    </span>
                  </div>

                  <p className="mt-2 text-sm leading-5 text-slate-500">
                    {service.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="border-t border-slate-100 bg-slate-50 px-5 py-4 sm:px-6">
        <p className="text-xs leading-5 text-slate-500">
          These indicators currently represent configured service status.
          Automated uptime checks and outage monitoring will be connected
          later.
        </p>
      </div>
    </section>
  );
}