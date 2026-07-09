import { useMemo, useState } from "react";
import {
  FaAmbulance,
  FaBuilding,
  FaFire,
  FaHospital,
  FaPhoneAlt,
  FaPlus,
  FaSearch,
  FaShieldAlt,
  FaUsers,
} from "react-icons/fa";

type Agency = {
  id: string;
  name: string;
  type: string;
  location: string;
  phone: string;
  status: string;
  responders: number;
};

const demoAgencies: Agency[] = [
  {
    id: "police-nyali",
    name: "Nyali Police Station",
    type: "Police",
    location: "Nyali, Mombasa",
    phone: "999 / 112",
    status: "Active",
    responders: 12,
  },
  {
    id: "fire-mombasa",
    name: "Mombasa Fire Brigade",
    type: "Fire",
    location: "Mombasa CBD",
    phone: "997",
    status: "Active",
    responders: 8,
  },
  {
    id: "ambulance-county",
    name: "County Ambulance Unit",
    type: "Ambulance",
    location: "Mombasa County",
    phone: "998",
    status: "Active",
    responders: 15,
  },
  {
    id: "coast-general",
    name: "Coast General Hospital",
    type: "Hospital",
    location: "Mombasa Island",
    phone: "+254 700 000 000",
    status: "Active",
    responders: 20,
  },
  {
    id: "nyumba-kumi",
    name: "Nyumba Kumi Community Desk",
    type: "Community",
    location: "Bamburi",
    phone: "+254 711 000 000",
    status: "Active",
    responders: 6,
  },
];

function agencyIcon(type: string) {
  if (type === "Police") return <FaShieldAlt />;
  if (type === "Fire") return <FaFire />;
  if (type === "Ambulance") return <FaAmbulance />;
  if (type === "Hospital") return <FaHospital />;
  return <FaUsers />;
}

function agencyColor(type: string) {
  if (type === "Police") return "bg-blue-100 text-blue-700";
  if (type === "Fire") return "bg-red-100 text-red-700";
  if (type === "Ambulance") return "bg-emerald-100 text-emerald-700";
  if (type === "Hospital") return "bg-purple-100 text-purple-700";
  return "bg-amber-100 text-amber-700";
}

export default function AgencyManagement() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const filteredAgencies = useMemo(() => {
    return demoAgencies.filter((agency) => {
      const matchesSearch =
        agency.name.toLowerCase().includes(search.toLowerCase()) ||
        agency.location.toLowerCase().includes(search.toLowerCase());

      const matchesType = typeFilter === "all" || agency.type === typeFilter;

      return matchesSearch && matchesType;
    });
  }, [search, typeFilter]);

  const totalAgencies = demoAgencies.length;
  const totalResponders = demoAgencies.reduce(
    (sum, agency) => sum + agency.responders,
    0
  );
  const activeAgencies = demoAgencies.filter(
    (agency) => agency.status === "Active"
  ).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-950">
            🏢 Agency Management
          </h1>

          <p className="mt-2 text-slate-600">
            Manage emergency agencies, stations, responders and operational coverage.
          </p>
        </div>

        <button className="flex items-center justify-center gap-2 rounded-xl bg-purple-600 px-5 py-3 font-bold text-white hover:bg-purple-700">
          <FaPlus />
          Add Agency
        </button>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <FaBuilding className="text-3xl text-purple-600" />
          <p className="mt-4 text-sm text-slate-500">Total Agencies</p>
          <h2 className="text-3xl font-extrabold">{totalAgencies}</h2>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <FaUsers className="text-3xl text-blue-600" />
          <p className="mt-4 text-sm text-slate-500">Responders</p>
          <h2 className="text-3xl font-extrabold">{totalResponders}</h2>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <FaShieldAlt className="text-3xl text-emerald-600" />
          <p className="mt-4 text-sm text-slate-500">Active Agencies</p>
          <h2 className="text-3xl font-extrabold">{activeAgencies}</h2>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 lg:w-96">
            <FaSearch className="text-slate-400" />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search agencies or locations..."
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
          >
            <option value="all">All Agency Types</option>
            <option value="Police">Police</option>
            <option value="Fire">Fire</option>
            <option value="Ambulance">Ambulance</option>
            <option value="Hospital">Hospital</option>
            <option value="Community">Community</option>
          </select>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        {filteredAgencies.map((agency) => (
          <div
            key={agency.id}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <div className="flex items-start gap-4">
              <div
                className={`${agencyColor(
                  agency.type
                )} flex h-14 w-14 items-center justify-center rounded-2xl text-2xl`}
              >
                {agencyIcon(agency.type)}
              </div>

              <div className="flex-1">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-slate-950">
                      {agency.name}
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      {agency.type} • {agency.location}
                    </p>
                  </div>

                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                    {agency.status}
                  </span>
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs text-slate-500">Contact Number</p>
                    <p className="mt-1 font-bold text-slate-900">
                      {agency.phone}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs text-slate-500">Responders</p>
                    <p className="mt-1 font-bold text-slate-900">
                      {agency.responders}
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex gap-3">
                  <a
                    href={`tel:${agency.phone.replaceAll(" ", "")}`}
                    className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white hover:bg-blue-700"
                  >
                    <FaPhoneAlt />
                    Call
                  </a>

                  <button className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {filteredAgencies.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">
            No agencies found.
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-blue-100 bg-blue-50 p-6">
        <h2 className="text-lg font-bold text-blue-800">
          Agency Management Roadmap
        </h2>

        <p className="mt-3 text-sm leading-6 text-blue-700">
          The next version will connect this module to Firestore so admins can
          create agencies, register stations, assign responders, manage vehicles
          and map agency coverage zones.
        </p>
      </div>
    </div>
  );
}