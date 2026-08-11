import { useMemo, useState } from "react";
import {
  FaCheckCircle,
  FaEdit,
  FaEnvelope,
  FaFilter,
  FaPhoneAlt,
  FaSearch,
  FaTimes,
  FaUserFriends,
  FaUserMd,
  FaUserShield,
} from "react-icons/fa";

import PageHeader from "../../../components/common/PageHeader";
import StatusBadge from "../../../components/common/StatusBadge";

type ResponderStatus =
  | "Available"
  | "Deployed"
  | "Off Duty"
  | "Training";

type ResponderRole =
  | "Volunteer"
  | "Paramedic"
  | "Nurse"
  | "Rescue Officer"
  | "Team Leader"
  | "Logistics Officer";

type Responder = {
  id: string;
  name: string;
  role: ResponderRole;
  specialty: string;
  phone: string;
  email: string;
  team: string;
  station: string;
  county: string;
  status: ResponderStatus;
  currentDeployment?: string;
  certifications: string[];
  yearsExperience: number;
};

const initialResponders: Responder[] = [
  {
    id: "R-001",
    name: "Peter Mwangi",
    role: "Team Leader",
    specialty: "Search & Rescue",
    phone: "+254 700 111 001",
    email: "peter.mwangi@example.org",
    team: "Rescue Team Alpha",
    station: "Mombasa Operations Centre",
    county: "Mombasa",
    status: "Available",
    certifications: [
      "First Aid",
      "Search & Rescue",
      "Incident Command",
    ],
    yearsExperience: 8,
  },
  {
    id: "R-002",
    name: "Dr. Amina Hassan",
    role: "Paramedic",
    specialty: "Emergency Medical Response",
    phone: "+254 700 111 002",
    email: "amina.hassan@example.org",
    team: "Emergency Health Team",
    station: "Nyali Response Unit",
    county: "Mombasa",
    status: "Deployed",
    currentDeployment: "KRCS-2026-002",
    certifications: [
      "Advanced First Aid",
      "Trauma Care",
      "Ambulance Operations",
    ],
    yearsExperience: 6,
  },
  {
    id: "R-003",
    name: "Grace Wanjiku",
    role: "Logistics Officer",
    specialty: "Relief Distribution",
    phone: "+254 700 111 003",
    email: "grace.wanjiku@example.org",
    team: "Relief Team 2",
    station: "Kisauni Relief Centre",
    county: "Mombasa",
    status: "Deployed",
    currentDeployment: "KRCS-2026-003",
    certifications: [
      "Relief Logistics",
      "Warehouse Operations",
    ],
    yearsExperience: 5,
  },
  {
    id: "R-004",
    name: "Ali Mohamed",
    role: "Volunteer",
    specialty: "Community Support",
    phone: "+254 700 111 004",
    email: "ali.mohamed@example.org",
    team: "Volunteer Response Team",
    station: "Likoni Response Unit",
    county: "Mombasa",
    status: "Available",
    certifications: [
      "Basic First Aid",
      "Community Mobilisation",
    ],
    yearsExperience: 3,
  },
  {
    id: "R-005",
    name: "Faith Atieno",
    role: "Nurse",
    specialty: "Emergency Health",
    phone: "+254 700 111 005",
    email: "faith.atieno@example.org",
    team: "Emergency Health Team",
    station: "Mombasa Operations Centre",
    county: "Mombasa",
    status: "Training",
    certifications: [
      "Emergency Nursing",
      "First Aid",
    ],
    yearsExperience: 4,
  },
];

export default function RedCrossResponders() {
  const [responders, setResponders] =
    useState<Responder[]>(initialResponders);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState("all");
  const [roleFilter, setRoleFilter] =
    useState("all");

  const [selectedResponder, setSelectedResponder] =
    useState<Responder | null>(null);

  const filteredResponders = useMemo(() => {
    const query = search.trim().toLowerCase();

    return responders.filter((responder) => {
      const matchesSearch =
        !query ||
        responder.name.toLowerCase().includes(query) ||
        responder.role.toLowerCase().includes(query) ||
        responder.specialty
          .toLowerCase()
          .includes(query) ||
        responder.team.toLowerCase().includes(query) ||
        responder.station.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "all" ||
        responder.status === statusFilter;

      const matchesRole =
        roleFilter === "all" ||
        responder.role === roleFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesRole
      );
    });
  }, [responders, roleFilter, search, statusFilter]);

  const stats = useMemo(
    () => ({
      total: responders.length,
      available: responders.filter(
        (responder) =>
          responder.status === "Available"
      ).length,
      deployed: responders.filter(
        (responder) =>
          responder.status === "Deployed"
      ).length,
      training: responders.filter(
        (responder) =>
          responder.status === "Training"
      ).length,
    }),
    [responders]
  );

  function updateResponder(
    responderId: string,
    changes: Partial<Responder>
  ) {
    setResponders((current) =>
      current.map((responder) =>
        responder.id === responderId
          ? {
              ...responder,
              ...changes,
            }
          : responder
      )
    );

    setSelectedResponder((current) =>
      current?.id === responderId
        ? {
            ...current,
            ...changes,
          }
        : current
    );
  }

  function clearFilters() {
    setSearch("");
    setStatusFilter("all");
    setRoleFilter("all");
  }

  return (
    <div className="space-y-7">
      <PageHeader
        title="Volunteers & Responders"
        subtitle="Manage humanitarian responders, duty status, teams, specialties, certifications and active deployments."
        icon={<FaUserFriends />}
        badge="Response Personnel"
        badgeColor="red"
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <FaUserFriends className="text-2xl text-slate-700" />

          <p className="mt-4 text-sm font-semibold text-slate-500">
            Total Responders
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
          <FaUserShield className="text-2xl text-blue-600" />

          <p className="mt-4 text-sm font-semibold text-blue-600">
            Deployed
          </p>

          <p className="mt-1 text-3xl font-extrabold text-blue-700">
            {stats.deployed}
          </p>
        </div>

        <div className="rounded-2xl border border-orange-200 bg-orange-50 p-5 shadow-sm">
          <FaUserMd className="text-2xl text-orange-600" />

          <p className="mt-4 text-sm font-semibold text-orange-600">
            In Training
          </p>

          <p className="mt-1 text-3xl font-extrabold text-orange-700">
            {stats.training}
          </p>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-3 xl:grid-cols-[1fr_220px_220px_auto]">
          <div className="relative">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

            <input
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search responder, team, station or specialty..."
              className="w-full rounded-xl border border-slate-200 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-100"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value)
            }
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
          >
            <option value="all">
              All Statuses
            </option>
            <option value="Available">
              Available
            </option>
            <option value="Deployed">
              Deployed
            </option>
            <option value="Off Duty">
              Off Duty
            </option>
            <option value="Training">
              Training
            </option>
          </select>

          <select
            value={roleFilter}
            onChange={(event) =>
              setRoleFilter(event.target.value)
            }
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
          >
            <option value="all">
              All Roles
            </option>
            <option value="Volunteer">
              Volunteer
            </option>
            <option value="Paramedic">
              Paramedic
            </option>
            <option value="Nurse">
              Nurse
            </option>
            <option value="Rescue Officer">
              Rescue Officer
            </option>
            <option value="Team Leader">
              Team Leader
            </option>
            <option value="Logistics Officer">
              Logistics Officer
            </option>
          </select>

          <button
            type="button"
            onClick={clearFilters}
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100"
          >
            <FaFilter />
            Reset
          </button>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-2 2xl:grid-cols-3">
        {filteredResponders.map((responder) => (
          <article
            key={responder.id}
            className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <div className="p-5">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-red-100 text-xl font-extrabold text-red-700">
                  {responder.name
                    .split(" ")
                    .map((part) => part[0])
                    .slice(0, 2)
                    .join("")}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-extrabold text-slate-950">
                        {responder.name}
                      </h2>

                      <p className="mt-1 text-sm font-semibold text-slate-600">
                        {responder.role}
                      </p>
                    </div>

                    <StatusBadge
                      status={responder.status}
                    />
                  </div>

                  <p className="mt-3 text-sm text-slate-500">
                    {responder.specialty}
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-3 rounded-xl bg-slate-50 p-4 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-slate-500">
                    Team
                  </span>

                  <span className="text-right font-semibold text-slate-800">
                    {responder.team}
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-slate-500">
                    Station
                  </span>

                  <span className="text-right font-semibold text-slate-800">
                    {responder.station}
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-slate-500">
                    Experience
                  </span>

                  <span className="font-semibold text-slate-800">
                    {responder.yearsExperience} years
                  </span>
                </div>

                {responder.currentDeployment && (
                  <div className="flex justify-between gap-4">
                    <span className="text-slate-500">
                      Deployment
                    </span>

                    <span className="font-bold text-red-700">
                      {responder.currentDeployment}
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-5 flex gap-2">
                <a
                  href={`tel:${responder.phone}`}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                >
                  <FaPhoneAlt />
                  Call
                </a>

                <button
                  type="button"
                  onClick={() =>
                    setSelectedResponder(responder)
                  }
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-slate-950 px-3 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
                >
                  <FaEdit />
                  Manage
                </button>
              </div>
            </div>
          </article>
        ))}
      </section>

      {filteredResponders.length === 0 && (
        <section className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <FaUserFriends className="mx-auto text-5xl text-slate-300" />

          <h2 className="mt-5 text-xl font-bold text-slate-900">
            No responders found
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Try changing your search or filters.
          </p>
        </section>
      )}

      {selectedResponder && (
        <>
          <button
            type="button"
            aria-label="Close responder details"
            onClick={() =>
              setSelectedResponder(null)
            }
            className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm"
          />

          <aside className="fixed bottom-0 right-0 top-0 z-50 flex w-full max-w-lg flex-col bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-200 bg-slate-950 p-6 text-white">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-red-300">
                  Responder Profile
                </p>

                <h2 className="mt-2 text-2xl font-extrabold">
                  {selectedResponder.name}
                </h2>

                <p className="mt-1 text-sm text-slate-300">
                  {selectedResponder.role}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedResponder(null)
                }
                className="rounded-xl p-3 text-slate-300 transition hover:bg-slate-800"
              >
                <FaTimes />
              </button>
            </div>

            <div className="flex-1 space-y-6 overflow-y-auto p-6">
              <div className="flex flex-wrap gap-2">
                <StatusBadge
                  status={selectedResponder.status}
                />

                <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700">
                  {selectedResponder.specialty}
                </span>
              </div>

              <div className="grid gap-3">
                <a
                  href={`tel:${selectedResponder.phone}`}
                  className="flex items-center gap-3 rounded-xl bg-slate-50 p-4"
                >
                  <FaPhoneAlt className="text-red-600" />

                  <div>
                    <p className="text-xs font-bold uppercase text-slate-500">
                      Phone
                    </p>

                    <p className="mt-1 font-semibold text-slate-900">
                      {selectedResponder.phone}
                    </p>
                  </div>
                </a>

                <a
                  href={`mailto:${selectedResponder.email}`}
                  className="flex items-center gap-3 rounded-xl bg-slate-50 p-4"
                >
                  <FaEnvelope className="text-blue-600" />

                  <div>
                    <p className="text-xs font-bold uppercase text-slate-500">
                      Email
                    </p>

                    <p className="mt-1 break-all font-semibold text-slate-900">
                      {selectedResponder.email}
                    </p>
                  </div>
                </a>
              </div>

              <div className="rounded-2xl border border-slate-200 p-5">
                <h3 className="font-bold text-slate-950">
                  Operational Assignment
                </h3>

                <div className="mt-4 space-y-3 text-sm">
                  <div className="flex justify-between gap-4">
                    <span className="text-slate-500">
                      Team
                    </span>

                    <span className="text-right font-bold text-slate-900">
                      {selectedResponder.team}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="text-slate-500">
                      Station
                    </span>

                    <span className="text-right font-bold text-slate-900">
                      {selectedResponder.station}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="text-slate-500">
                      County
                    </span>

                    <span className="font-bold text-slate-900">
                      {selectedResponder.county}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="text-slate-500">
                      Experience
                    </span>

                    <span className="font-bold text-slate-900">
                      {
                        selectedResponder.yearsExperience
                      }{" "}
                      years
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-slate-950">
                  Certifications
                </h3>

                <div className="mt-3 flex flex-wrap gap-2">
                  {selectedResponder.certifications.map(
                    (certification) => (
                      <span
                        key={certification}
                        className="rounded-full bg-emerald-100 px-3 py-2 text-xs font-bold text-emerald-700"
                      >
                        {certification}
                      </span>
                    )
                  )}
                </div>
              </div>

              {selectedResponder.currentDeployment && (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
                  <p className="text-xs font-bold uppercase tracking-wide text-red-600">
                    Active Deployment
                  </p>

                  <p className="mt-2 text-xl font-extrabold text-red-950">
                    {
                      selectedResponder.currentDeployment
                    }
                  </p>
                </div>
              )}

              <div>
                <label className="text-sm font-bold text-slate-700">
                  Duty Status
                </label>

                <select
                  value={selectedResponder.status}
                  onChange={(event) =>
                    updateResponder(
                      selectedResponder.id,
                      {
                        status:
                          event.target
                            .value as ResponderStatus,
                      }
                    )
                  }
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-red-500"
                >
                  <option value="Available">
                    Available
                  </option>
                  <option value="Deployed">
                    Deployed
                  </option>
                  <option value="Off Duty">
                    Off Duty
                  </option>
                  <option value="Training">
                    Training
                  </option>
                </select>
              </div>
            </div>
          </aside>
        </>
      )}
    </div>
  );
}