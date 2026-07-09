import { useEffect, useMemo, useState } from "react";
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

import {
  FaAmbulance,
  FaBuilding,
  FaFire,
  FaHospital,
  FaPhoneAlt,
  FaPlus,
  FaSearch,
  FaShieldAlt,
  FaTimes,
  FaUsers,
} from "react-icons/fa";

import { db } from "../../../firebase/firebase";

type Agency = {
  id: string;
  name: string;
  type: string;
  location: string;
  phone: string;
  status: string;
  responders: number;
  contactPerson?: string;
  coverageArea?: string;
  notes?: string;
};

const agencyTypes = [
  "Police",
  "Fire",
  "Ambulance",
  "Hospital",
  "Community",
  "County",
  "Red Cross",
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
  if (type === "Red Cross") return "bg-red-100 text-red-700";
  if (type === "County") return "bg-indigo-100 text-indigo-700";
  return "bg-amber-100 text-amber-700";
}

export default function AgencyManagement() {
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [selectedAgency, setSelectedAgency] = useState<Agency | null>(null);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [message, setMessage] = useState("");

  const [name, setName] = useState("");
  const [type, setType] = useState("Police");
  const [location, setLocation] = useState("");
  const [phone, setPhone] = useState("");
  const [responders, setResponders] = useState(0);
  const [contactPerson, setContactPerson] = useState("");
  const [coverageArea, setCoverageArea] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    const q = query(collection(db, "agencies"), orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((item) => ({
          id: item.id,
          ...item.data(),
        })) as Agency[];

        setAgencies(data);
        setLoading(false);
      },
      (error) => {
        console.error(error);
        setLoading(false);
        setMessage("Unable to load agencies. Check Firestore rules.");
      }
    );

    return () => unsubscribe();
  }, []);

  const filteredAgencies = useMemo(() => {
    return agencies.filter((agency) => {
      const matchesSearch =
        agency.name?.toLowerCase().includes(search.toLowerCase()) ||
        agency.location?.toLowerCase().includes(search.toLowerCase()) ||
        agency.phone?.toLowerCase().includes(search.toLowerCase());

      const matchesType = typeFilter === "all" || agency.type === typeFilter;

      return matchesSearch && matchesType;
    });
  }, [agencies, search, typeFilter]);

  const totalAgencies = agencies.length;
  const totalResponders = agencies.reduce(
    (sum, agency) => sum + Number(agency.responders || 0),
    0
  );
  const activeAgencies = agencies.filter(
    (agency) => agency.status === "Active"
  ).length;

  function resetForm() {
    setName("");
    setType("Police");
    setLocation("");
    setPhone("");
    setResponders(0);
    setContactPerson("");
    setCoverageArea("");
    setNotes("");
  }

  async function handleAddAgency(e: React.FormEvent) {
    e.preventDefault();

    if (!name || !location || !phone) {
      setMessage("Please fill agency name, location and phone number.");
      return;
    }

    try {
      await addDoc(collection(db, "agencies"), {
        name,
        type,
        location,
        phone,
        responders: Number(responders || 0),
        contactPerson,
        coverageArea,
        notes,
        status: "Active",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      setMessage("Agency added successfully.");
      resetForm();
      setShowForm(false);
    } catch (error) {
      console.error(error);
      setMessage("Failed to add agency.");
    }
  }

  async function updateAgencyStatus(agencyId: string, status: string) {
    await updateDoc(doc(db, "agencies", agencyId), {
      status,
      updatedAt: serverTimestamp(),
    });
  }

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

        <button
          onClick={() => setShowForm(true)}
          className="flex items-center justify-center gap-2 rounded-xl bg-purple-600 px-5 py-3 font-bold text-white hover:bg-purple-700"
        >
          <FaPlus />
          Add Agency
        </button>
      </div>

      {message && (
        <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-blue-700">
          {message}
        </div>
      )}

      {showForm && (
        <form
          onSubmit={handleAddAgency}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-950">
              Add New Agency
            </h2>

            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
            >
              <FaTimes />
            </button>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            <div>
              <label className="text-sm font-semibold text-slate-700">
                Agency Name
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Example: Nyali Police Station"
                className="mt-2 w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700">
                Agency Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-purple-500"
              >
                {agencyTypes.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700">
                Location
              </label>
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Example: Bamburi, Mombasa"
                className="mt-2 w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700">
                Phone Number
              </label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+254 7XX XXX XXX"
                className="mt-2 w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700">
                Responders
              </label>
              <input
                type="number"
                value={responders}
                onChange={(e) => setResponders(Number(e.target.value))}
                className="mt-2 w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700">
                Contact Person
              </label>
              <input
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                placeholder="Officer / Coordinator name"
                className="mt-2 w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700">
                Coverage Area
              </label>
              <input
                value={coverageArea}
                onChange={(e) => setCoverageArea(e.target.value)}
                placeholder="Example: Nyali, Bamburi, Kisauni"
                className="mt-2 w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-purple-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-semibold text-slate-700">
                Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Operational notes..."
                className="mt-2 w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <button
            type="submit"
            className="mt-6 rounded-xl bg-purple-600 px-6 py-3 font-bold text-white hover:bg-purple-700"
          >
            Save Agency
          </button>
        </form>
      )}

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
              placeholder="Search agencies, phone or location..."
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
          >
            <option value="all">All Agency Types</option>
            {agencyTypes.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="rounded-2xl bg-white p-8 text-slate-500 shadow-sm">
          Loading agencies...
        </div>
      ) : (
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

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        agency.status === "Active"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
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
                        {agency.responders || 0}
                      </p>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-4">
                      <p className="text-xs text-slate-500">Contact Person</p>
                      <p className="mt-1 font-bold text-slate-900">
                        {agency.contactPerson || "Not set"}
                      </p>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-4">
                      <p className="text-xs text-slate-500">Coverage Area</p>
                      <p className="mt-1 font-bold text-slate-900">
                        {agency.coverageArea || "Not set"}
                      </p>
                    </div>
                  </div>

                  {selectedAgency?.id === agency.id && (
                    <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                      <p>
                        <span className="font-semibold">Notes:</span>{" "}
                        {agency.notes || "No notes available."}
                      </p>
                    </div>
                  )}

                  <div className="mt-5 flex flex-wrap gap-3">
                    <a
                      href={`tel:${agency.phone.replaceAll(" ", "")}`}
                      className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white hover:bg-blue-700"
                    >
                      <FaPhoneAlt />
                      Call
                    </a>

                    <button
                      onClick={() =>
                        setSelectedAgency(
                          selectedAgency?.id === agency.id ? null : agency
                        )
                      }
                      className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
                    >
                      {selectedAgency?.id === agency.id
                        ? "Hide Details"
                        : "View Details"}
                    </button>

                    {agency.status === "Active" ? (
                      <button
                        onClick={() =>
                          updateAgencyStatus(agency.id, "Inactive")
                        }
                        className="rounded-xl bg-red-600 px-4 py-3 text-sm font-bold text-white hover:bg-red-700"
                      >
                        Deactivate
                      </button>
                    ) : (
                      <button
                        onClick={() =>
                          updateAgencyStatus(agency.id, "Active")
                        }
                        className="rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-700"
                      >
                        Activate
                      </button>
                    )}
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
      )}
    </div>
  );
}