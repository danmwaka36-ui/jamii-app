import type { ReactNode } from "react";
import {
  FaAmbulance,
  FaBuilding,
  FaFire,
  FaHeartbeat,
  FaShieldAlt,
  FaUsers,
} from "react-icons/fa";

type AgencyStatusItem = {
  id: string;
  name: string;
  type: string;
  icon?: ReactNode;
  online: number;
  busy: number;
  offline: number;
  total?: number;
};

type AgencyStatusProps = {
  agencies?: AgencyStatusItem[];
  loading?: boolean;
  title?: string;
  description?: string;
};

const defaultAgencies: AgencyStatusItem[] = [
  {
    id: "police",
    name: "National Police Service",
    type: "Police",
    icon: <FaShieldAlt />,
    online: 32,
    busy: 12,
    offline: 4,
  },
  {
    id: "fire",
    name: "County Fire Brigade",
    type: "Fire",
    icon: <FaFire />,
    online: 15,
    busy: 5,
    offline: 1,
  },
  {
    id: "ambulance",
    name: "County Ambulance Service",
    type: "Ambulance",
    icon: <FaAmbulance />,
    online: 20,
    busy: 8,
    offline: 2,
  },
  {
    id: "hospital",
    name: "Emergency Hospitals",
    type: "Hospital",
    icon: <FaHeartbeat />,
    online: 18,
    busy: 6,
    offline: 3,
  },
  {
    id: "county",
    name: "County Operations Centre",
    type: "County",
    icon: <FaBuilding />,
    online: 10,
    busy: 3,
    offline: 1,
  },
  {
    id: "community",
    name: "Community Response Teams",
    type: "Community",
    icon: <FaUsers />,
    online: 24,
    busy: 7,
    offline: 5,
  },
];

function agencyStyle(type: string) {
  switch (type.toLowerCase()) {
    case "police":
      return {
        icon: "bg-blue-100 text-blue-700",
        bar: "bg-blue-600",
      };

    case "fire":
      return {
        icon: "bg-red-100 text-red-700",
        bar: "bg-red-600",
      };

    case "ambulance":
      return {
        icon: "bg-emerald-100 text-emerald-700",
        bar: "bg-emerald-600",
      };

    case "hospital":
      return {
        icon: "bg-purple-100 text-purple-700",
        bar: "bg-purple-600",
      };

    case "county":
      return {
        icon: "bg-indigo-100 text-indigo-700",
        bar: "bg-indigo-600",
      };

    default:
      return {
        icon: "bg-amber-100 text-amber-700",
        bar: "bg-amber-600",
      };
  }
}

export default function AgencyStatus({
  agencies = defaultAgencies,
  loading = false,
  title = "Agency Availability",
  description = "Current responder and operational status across emergency agencies.",
}: AgencyStatusProps) {
  const totalOnline = agencies.reduce(
    (sum, agency) => sum + agency.online,
    0
  );

  const totalBusy = agencies.reduce(
    (sum, agency) => sum + agency.busy,
    0
  );

  const totalOffline = agencies.reduce(
    (sum, agency) => sum + agency.offline,
    0
  );

  const totalResponders =
    totalOnline + totalBusy + totalOffline;

  const operationalPercentage =
    totalResponders === 0
      ? 0
      : Math.round(
          ((totalOnline + totalBusy) / totalResponders) * 100
        );

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div>
          <h2 className="text-xl font-bold text-slate-950">
            {title}
          </h2>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            {description}
          </p>
        </div>

        <div className="rounded-xl bg-emerald-50 px-4 py-3">
          <p className="text-xs font-bold uppercase tracking-wide text-emerald-600">
            Operational capacity
          </p>

          <p className="mt-1 text-2xl font-extrabold text-emerald-700">
            {operationalPercentage}%
          </p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4 p-5 sm:p-6">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="h-28 animate-pulse rounded-2xl bg-slate-100"
            />
          ))}
        </div>
      ) : agencies.length === 0 ? (
        <div className="p-8 text-center text-slate-500">
          No emergency agencies are currently available.
        </div>
      ) : (
        <div className="space-y-4 p-5 sm:p-6">
          {agencies.map((agency) => {
            const total =
              agency.total ??
              agency.online + agency.busy + agency.offline;

            const availabilityPercentage =
              total === 0
                ? 0
                : Math.round((agency.online / total) * 100);

            const styles = agencyStyle(agency.type);

            return (
              <div
                key={agency.id}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-slate-300 hover:bg-white hover:shadow-sm sm:p-5"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-xl ${styles.icon}`}
                  >
                    {agency.icon ?? <FaBuilding />}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h3 className="font-bold text-slate-950">
                          {agency.name}
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                          {agency.type}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-700">
                        <span className="h-2 w-2 rounded-full bg-emerald-500" />
                        {availabilityPercentage}% available
                      </div>
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                      <div className="rounded-xl bg-emerald-50 p-3">
                        <p className="text-xs font-semibold text-emerald-600">
                          Online
                        </p>

                        <p className="mt-1 text-xl font-extrabold text-emerald-700">
                          {agency.online}
                        </p>
                      </div>

                      <div className="rounded-xl bg-orange-50 p-3">
                        <p className="text-xs font-semibold text-orange-600">
                          Busy
                        </p>

                        <p className="mt-1 text-xl font-extrabold text-orange-700">
                          {agency.busy}
                        </p>
                      </div>

                      <div className="rounded-xl bg-slate-200/70 p-3">
                        <p className="text-xs font-semibold text-slate-600">
                          Offline
                        </p>

                        <p className="mt-1 text-xl font-extrabold text-slate-700">
                          {agency.offline}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4">
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>Live availability</span>
                        <span>{availabilityPercentage}%</span>
                      </div>

                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
                        <div
                          className={`h-full rounded-full transition-all ${styles.bar}`}
                          style={{
                            width: `${availabilityPercentage}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="grid gap-3 border-t border-slate-100 bg-slate-50 p-5 sm:grid-cols-3 sm:px-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Online
          </p>

          <p className="mt-1 text-2xl font-extrabold text-emerald-700">
            {totalOnline}
          </p>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Busy
          </p>

          <p className="mt-1 text-2xl font-extrabold text-orange-700">
            {totalBusy}
          </p>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Offline
          </p>

          <p className="mt-1 text-2xl font-extrabold text-slate-700">
            {totalOffline}
          </p>
        </div>
      </div>
    </section>
  );
}