import { useMemo, useState } from "react";

import {
  FaCar,
  FaCheckCircle,
  FaFilter,
  FaIdCard,
  FaPhoneAlt,
  FaSearch,
  FaTimes,
  FaUser,
  FaUserPlus,
} from "react-icons/fa";

import PageHeader from "../../../components/common/PageHeader";
import StatusBadge from "../../../components/common/StatusBadge";

type DriverStatus =
  | "Available"
  | "Assigned"
  | "On Duty"
  | "Off Duty"
  | "Suspended";

type Driver = {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  licenceNumber: string;
  licenceClass: string;
  licenceExpiry: string;
  station: string;
  status: DriverStatus;
  assignedVehicle?: string;
  currentShift?: string;
  certifications: string[];
};

const initialDrivers: Driver[] = [
  {
    id: "DRV-001",
    fullName: "James Otieno",
    phone: "+254 700 221 001",
    email: "james.otieno@example.org",
    licenceNumber: "DL-KRCS-001",
    licenceClass: "BCE",
    licenceExpiry: "2027-04-30",
    station: "Nyali Response Unit",
    status: "On Duty",
    assignedVehicle: "KRCS Ambulance 07",
    currentShift: "08:00 - 20:00",
    certifications: [
      "Emergency Vehicle Driving",
      "First Aid",
    ],
  },
  {
    id: "DRV-002",
    fullName: "Brian Kamau",
    phone: "+254 700 221 002",
    email: "brian.kamau@example.org",
    licenceNumber: "DL-KRCS-002",
    licenceClass: "BCE",
    licenceExpiry: "2027-01-18",
    station: "Mombasa Operations Centre",
    status: "Assigned",
    assignedVehicle: "KRCS Rescue 02",
    currentShift: "07:00 - 19:00",
    certifications: [
      "Rescue Vehicle Operations",
      "Defensive Driving",
    ],
  },
  {
    id: "DRV-003",
    fullName: "Fatuma Noor",
    phone: "+254 700 221 004",
    email: "fatuma.noor@example.org",
    licenceNumber: "DL-KRCS-003",
    licenceClass: "BCE",
    licenceExpiry: "2028-03-14",
    station: "Likoni Response Unit",
    status: "Available",
    certifications: [
      "Emergency Vehicle Driving",
      "Basic First Aid",
    ],
  },
];

export default function RedCrossDrivers() {
  const [drivers, setDrivers] =
    useState<Driver[]>(initialDrivers);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState("all");

  const [selectedDriver, setSelectedDriver] =
    useState<Driver | null>(null);

  const [registrationOpen, setRegistrationOpen] =
    useState(false);

  const [newDriver, setNewDriver] = useState({
    fullName: "",
    phone: "",
    email: "",
    licenceNumber: "",
    licenceClass: "",
    licenceExpiry: "",
    station: "",
  });

  const filteredDrivers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return drivers.filter((driver) => {
      const matchesSearch =
        !query ||
        driver.fullName
          .toLowerCase()
          .includes(query) ||
        driver.phone.includes(query) ||
        driver.licenceNumber
          .toLowerCase()
          .includes(query) ||
        driver.station
          .toLowerCase()
          .includes(query);

      const matchesStatus =
        statusFilter === "all" ||
        driver.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [drivers, search, statusFilter]);

  const stats = useMemo(
    () => ({
      total: drivers.length,
      available: drivers.filter(
        (driver) =>
          driver.status === "Available"
      ).length,
      assigned: drivers.filter(
        (driver) =>
          driver.status === "Assigned" ||
          driver.status === "On Duty"
      ).length,
      offDuty: drivers.filter(
        (driver) =>
          driver.status === "Off Duty"
      ).length,
    }),
    [drivers]
  );

  function updateDriver(
    driverId: string,
    changes: Partial<Driver>
  ) {
    setDrivers((current) =>
      current.map((driver) =>
        driver.id === driverId
          ? { ...driver, ...changes }
          : driver
      )
    );

    setSelectedDriver((current) =>
      current?.id === driverId
        ? { ...current, ...changes }
        : current
    );
  }

  function registerDriver() {
    if (
      !newDriver.fullName.trim() ||
      !newDriver.phone.trim() ||
      !newDriver.licenceNumber.trim()
    ) {
      return;
    }

    const driver: Driver = {
      id: `DRV-${String(
        drivers.length + 1
      ).padStart(3, "0")}`,
      fullName: newDriver.fullName.trim(),
      phone: newDriver.phone.trim(),
      email: newDriver.email.trim(),
      licenceNumber:
        newDriver.licenceNumber.trim(),
      licenceClass:
        newDriver.licenceClass.trim(),
      licenceExpiry:
        newDriver.licenceExpiry,
      station: newDriver.station.trim(),
      status: "Available",
      certifications: [],
    };

    setDrivers((current) => [
      driver,
      ...current,
    ]);

    setNewDriver({
      fullName: "",
      phone: "",
      email: "",
      licenceNumber: "",
      licenceClass: "",
      licenceExpiry: "",
      station: "",
    });

    setRegistrationOpen(false);
  }

  return (
    <div className="space-y-7">
      <PageHeader
        title="Driver Registry"
        subtitle="Register emergency drivers, manage licence information, duty status and vehicle assignments."
        icon={<FaIdCard />}
        badge="Fleet Personnel"
        badgeColor="red"
        actions={
          <button
            type="button"
            onClick={() =>
              setRegistrationOpen(true)
            }
            className="flex items-center gap-2 rounded-xl bg-red-600 px-5 py-3 font-bold text-white transition hover:bg-red-700"
          >
            <FaUserPlus />
            Register Driver
          </button>
        }
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <FaUser className="text-2xl text-slate-700" />

          <p className="mt-4 text-sm font-semibold text-slate-500">
            Registered Drivers
          </p>

          <p className="mt-1 text-3xl font-extrabold text-slate-950">
            {stats.total}
          </p>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
          <FaCheckCircle className="text-2xl text-emerald-600" />

          <p className="mt-4 text-sm font-semibold text-emerald-600">
            Available
          </p>

          <p className="mt-1 text-3xl font-extrabold text-emerald-700">
            {stats.available}
          </p>
        </div>

        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5 shadow-sm">
          <FaCar className="text-2xl text-blue-600" />

          <p className="mt-4 text-sm font-semibold text-blue-600">
            Assigned / Duty
          </p>

          <p className="mt-1 text-3xl font-extrabold text-blue-700">
            {stats.assigned}
          </p>
        </div>

        <div className="rounded-2xl border border-orange-200 bg-orange-50 p-5 shadow-sm">
          <FaTimes className="text-2xl text-orange-600" />

          <p className="mt-4 text-sm font-semibold text-orange-600">
            Off Duty
          </p>

          <p className="mt-1 text-3xl font-extrabold text-orange-700">
            {stats.offDuty}
          </p>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-3 lg:grid-cols-[1fr_220px_auto]">
          <div className="relative">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

            <input
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search driver, licence, station or phone..."
              className="w-full rounded-xl border border-slate-200 py-3 pl-11 pr-4 outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-100"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target.value
              )
            }
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none"
          >
            <option value="all">
              All Statuses
            </option>
            <option value="Available">
              Available
            </option>
            <option value="Assigned">
              Assigned
            </option>
            <option value="On Duty">
              On Duty
            </option>
            <option value="Off Duty">
              Off Duty
            </option>
            <option value="Suspended">
              Suspended
            </option>
          </select>

          <button
            type="button"
            onClick={() => {
              setSearch("");
              setStatusFilter("all");
            }}
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-5 py-3 font-bold text-slate-700 hover:bg-slate-100"
          >
            <FaFilter />
            Reset
          </button>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-2 2xl:grid-cols-3">
        {filteredDrivers.map((driver) => (
          <article
            key={driver.id}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-red-100 text-xl font-extrabold text-red-700">
                {driver.fullName
                  .split(" ")
                  .map((name) => name[0])
                  .slice(0, 2)
                  .join("")}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap justify-between gap-3">
                  <div>
                    <h2 className="font-extrabold text-slate-950">
                      {driver.fullName}
                    </h2>

                    <p className="mt-1 text-xs font-bold text-slate-500">
                      {driver.id}
                    </p>
                  </div>

                  <StatusBadge
                    status={driver.status}
                  />
                </div>

                <p className="mt-3 text-sm text-slate-500">
                  {driver.station}
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-3 rounded-xl bg-slate-50 p-4 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-slate-500">
                  Licence
                </span>

                <span className="font-bold text-slate-900">
                  {driver.licenceNumber}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-slate-500">
                  Class
                </span>

                <span className="font-bold text-slate-900">
                  {driver.licenceClass ||
                    "Not specified"}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-slate-500">
                  Vehicle
                </span>

                <span className="text-right font-bold text-slate-900">
                  {driver.assignedVehicle ||
                    "Unassigned"}
                </span>
              </div>

              {driver.currentShift && (
                <div className="flex justify-between gap-4">
                  <span className="text-slate-500">
                    Shift
                  </span>

                  <span className="font-bold text-blue-700">
                    {driver.currentShift}
                  </span>
                </div>
              )}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <a
                href={`tel:${driver.phone}`}
                className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
              >
                <FaPhoneAlt />
                Call
              </a>

              <button
                type="button"
                onClick={() =>
                  setSelectedDriver(driver)
                }
                className="rounded-xl bg-slate-950 px-4 py-3 text-sm font-bold text-white hover:bg-slate-800"
              >
                Manage
              </button>
            </div>
          </article>
        ))}
      </section>

      {registrationOpen && (
        <>
          <button
            type="button"
            aria-label="Close registration"
            onClick={() =>
              setRegistrationOpen(false)
            }
            className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm"
          />

          <div className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-2xl -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between bg-slate-950 p-6 text-white">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-red-300">
                  Fleet Personnel
                </p>

                <h2 className="mt-2 text-2xl font-extrabold">
                  Register Driver
                </h2>
              </div>

              <button
                type="button"
                onClick={() =>
                  setRegistrationOpen(false)
                }
                className="rounded-xl p-3 hover:bg-slate-800"
              >
                <FaTimes />
              </button>
            </div>

            <div className="max-h-[70vh] overflow-y-auto p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  ["Full Name", "fullName"],
                  ["Phone", "phone"],
                  ["Email", "email"],
                  [
                    "Driving Licence Number",
                    "licenceNumber",
                  ],
                  [
                    "Licence Class",
                    "licenceClass",
                  ],
                  ["Station", "station"],
                ].map(([label, field]) => (
                  <label
                    key={field}
                    className="text-sm font-bold text-slate-700"
                  >
                    {label}

                    <input
                      value={
                        newDriver[
                          field as keyof typeof newDriver
                        ]
                      }
                      onChange={(event) =>
                        setNewDriver(
                          (current) => ({
                            ...current,
                            [field]:
                              event.target.value,
                          })
                        )
                      }
                      className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal outline-none focus:border-red-500"
                    />
                  </label>
                ))}

                <label className="text-sm font-bold text-slate-700">
                  Licence Expiry

                  <input
                    type="date"
                    value={
                      newDriver.licenceExpiry
                    }
                    onChange={(event) =>
                      setNewDriver((current) => ({
                        ...current,
                        licenceExpiry:
                          event.target.value,
                      }))
                    }
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal outline-none focus:border-red-500"
                  />
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-200 bg-slate-50 p-5">
              <button
                type="button"
                onClick={() =>
                  setRegistrationOpen(false)
                }
                className="rounded-xl border border-slate-200 bg-white px-5 py-3 font-bold text-slate-700"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={registerDriver}
                className="rounded-xl bg-red-600 px-6 py-3 font-bold text-white hover:bg-red-700"
              >
                Register Driver
              </button>
            </div>
          </div>
        </>
      )}

      {selectedDriver && (
        <>
          <button
            type="button"
            aria-label="Close driver"
            onClick={() =>
              setSelectedDriver(null)
            }
            className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm"
          />

          <aside className="fixed bottom-0 right-0 top-0 z-50 flex w-full max-w-lg flex-col bg-white shadow-2xl">
            <div className="flex items-start justify-between bg-slate-950 p-6 text-white">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-red-300">
                  Driver Profile
                </p>

                <h2 className="mt-2 text-2xl font-extrabold">
                  {selectedDriver.fullName}
                </h2>

                <p className="mt-1 text-sm text-slate-300">
                  {selectedDriver.id}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedDriver(null)
                }
                className="rounded-xl p-3 hover:bg-slate-800"
              >
                <FaTimes />
              </button>
            </div>

            <div className="flex-1 space-y-6 overflow-y-auto p-6">
              <StatusBadge
                status={selectedDriver.status}
              />

              <div className="rounded-2xl border border-slate-200 p-5">
                <h3 className="font-bold text-slate-950">
                  Driving Licence
                </h3>

                <div className="mt-4 space-y-3 text-sm">
                  <p>
                    Number:{" "}
                    <strong>
                      {
                        selectedDriver.licenceNumber
                      }
                    </strong>
                  </p>

                  <p>
                    Class:{" "}
                    <strong>
                      {
                        selectedDriver.licenceClass
                      }
                    </strong>
                  </p>

                  <p>
                    Expiry:{" "}
                    <strong>
                      {
                        selectedDriver.licenceExpiry
                      }
                    </strong>
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
                <p className="text-xs font-bold uppercase text-blue-600">
                  Current Vehicle
                </p>

                <p className="mt-2 text-lg font-extrabold text-blue-950">
                  {selectedDriver.assignedVehicle ||
                    "No vehicle assigned"}
                </p>

                {selectedDriver.currentShift && (
                  <p className="mt-2 text-sm text-blue-700">
                    Shift:{" "}
                    {
                      selectedDriver.currentShift
                    }
                  </p>
                )}
              </div>

              <div>
                <h3 className="font-bold text-slate-950">
                  Certifications
                </h3>

                <div className="mt-3 flex flex-wrap gap-2">
                  {selectedDriver.certifications.length ? (
                    selectedDriver.certifications.map(
                      (certification) => (
                        <span
                          key={certification}
                          className="rounded-full bg-emerald-100 px-3 py-2 text-xs font-bold text-emerald-700"
                        >
                          {certification}
                        </span>
                      )
                    )
                  ) : (
                    <p className="text-sm text-slate-500">
                      No certifications recorded.
                    </p>
                  )}
                </div>
              </div>

              <label className="block text-sm font-bold text-slate-700">
                Duty Status

                <select
                  value={selectedDriver.status}
                  onChange={(event) =>
                    updateDriver(
                      selectedDriver.id,
                      {
                        status:
                          event.target
                            .value as DriverStatus,
                      }
                    )
                  }
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 font-normal outline-none focus:border-red-500"
                >
                  <option value="Available">
                    Available
                  </option>
                  <option value="Assigned">
                    Assigned
                  </option>
                  <option value="On Duty">
                    On Duty
                  </option>
                  <option value="Off Duty">
                    Off Duty
                  </option>
                  <option value="Suspended">
                    Suspended
                  </option>
                </select>
              </label>
            </div>
          </aside>
        </>
      )}
    </div>
  );
}