import { useEffect, useMemo, useState } from "react";
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";

import {
  FaCarSide,
  FaCheckCircle,
  FaCog,
  FaExclamationTriangle,
  FaGasPump,
  FaMapMarkerAlt,
  FaPlus,
  FaRoad,
  FaSatelliteDish,
  FaSearch,
  FaTimes,
  FaTools,
} from "react-icons/fa";

import { db } from "../../../firebase/firebase";

type PoliceVehicle = {
  id: string;
  registrationNumber?: string;
  callSign?: string;
  vehicleType?: string;
  agencyRole?: string;
  status?: string;

  driverId?: string | null;
  driverName?: string | null;

  station?: string;
  county?: string;
  ward?: string;
  currentLocation?: string;

  fuelLevel?: number;
  mileage?: number;
  gpsOnline?: boolean;

  currentIncidentId?: string | null;
  maintenanceDue?: boolean;
  maintenanceNotes?: string;
  lastServiceDate?: string;
  nextServiceMileage?: number;

  createdAt?: unknown;
  updatedAt?: unknown;
};

type PoliceOfficer = {
  id: string;
  fullName?: string;
  role?: string;
  status?: string;
  dutyStatus?: string;
  station?: string;
};

type VehicleForm = {
  registrationNumber: string;
  callSign: string;
  vehicleType: string;
  status: string;

  driverId: string;
  station: string;
  county: string;
  ward: string;
  currentLocation: string;

  fuelLevel: number;
  mileage: number;
  gpsOnline: boolean;

  maintenanceDue: boolean;
  maintenanceNotes: string;
  lastServiceDate: string;
  nextServiceMileage: number;
};

const vehicleTypes = [
  "Patrol SUV",
  "Patrol Sedan",
  "Motorbike",
  "Police Van",
  "Traffic Vehicle",
  "Armoured Vehicle",
  "Prisoner Transport",
  "Command Vehicle",
  "Other",
];

const vehicleStatuses = [
  "Available",
  "Patrolling",
  "Dispatched",
  "Responding",
  "On Scene",
  "Maintenance",
  "Offline",
];

const emptyForm: VehicleForm = {
  registrationNumber: "",
  callSign: "",
  vehicleType: "Patrol SUV",
  status: "Available",

  driverId: "",
  station: "",
  county: "Mombasa",
  ward: "",
  currentLocation: "",

  fuelLevel: 100,
  mileage: 0,
  gpsOnline: true,

  maintenanceDue: false,
  maintenanceNotes: "",
  lastServiceDate: "",
  nextServiceMileage: 0,
};

function statusClass(status?: string) {
  switch (status) {
    case "Available":
      return "bg-emerald-100 text-emerald-700";

    case "Patrolling":
      return "bg-cyan-100 text-cyan-700";

    case "Dispatched":
      return "bg-purple-100 text-purple-700";

    case "Responding":
      return "bg-blue-100 text-blue-700";

    case "On Scene":
      return "bg-indigo-100 text-indigo-700";

    case "Maintenance":
      return "bg-orange-100 text-orange-700";

    case "Offline":
      return "bg-slate-200 text-slate-700";

    default:
      return "bg-slate-100 text-slate-700";
  }
}

function fuelClass(fuelLevel?: number) {
  const fuel = Number(fuelLevel || 0);

  if (fuel <= 20) {
    return "bg-red-500";
  }

  if (fuel <= 40) {
    return "bg-orange-500";
  }

  if (fuel <= 70) {
    return "bg-yellow-500";
  }

  return "bg-emerald-500";
}

function normalizeNumber(value: number, minimum = 0, maximum?: number) {
  if (!Number.isFinite(value)) {
    return minimum;
  }

  const lowerBound = Math.max(minimum, value);

  if (typeof maximum === "number") {
    return Math.min(maximum, lowerBound);
  }

  return lowerBound;
}

export default function PoliceVehicles() {
  const [vehicles, setVehicles] = useState<PoliceVehicle[]>([]);
  const [officers, setOfficers] = useState<PoliceOfficer[]>([]);

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [stationFilter, setStationFilter] = useState("all");

  const [showForm, setShowForm] = useState(false);
  const [editingVehicleId, setEditingVehicleId] = useState<string | null>(null);
  const [selectedVehicle, setSelectedVehicle] =
    useState<PoliceVehicle | null>(null);

  const [form, setForm] = useState<VehicleForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const vehiclesQuery = query(
      collection(db, "vehicles"),
      where("agencyRole", "==", "police")
    );

    const unsubscribeVehicles = onSnapshot(
      vehiclesQuery,
      (snapshot) => {
        const data = snapshot.docs.map((item) => ({
          id: item.id,
          ...item.data(),
        })) as PoliceVehicle[];

        data.sort((first, second) =>
          (first.registrationNumber || "").localeCompare(
            second.registrationNumber || ""
          )
        );

        setVehicles(data);
        setLoading(false);
        setError("");
      },
      (snapshotError) => {
        console.error(snapshotError);
        setLoading(false);
        setError(
          "Unable to load Police vehicles. Check your Firestore security rules."
        );
      }
    );

    const officersQuery = query(
      collection(db, "users"),
      where("role", "==", "police")
    );

    const unsubscribeOfficers = onSnapshot(
      officersQuery,
      (snapshot) => {
        const data = snapshot.docs.map((item) => ({
          id: item.id,
          ...item.data(),
        })) as PoliceOfficer[];

        setOfficers(data);
      },
      (snapshotError) => {
        console.error(snapshotError);
      }
    );

    return () => {
      unsubscribeVehicles();
      unsubscribeOfficers();
    };
  }, []);

  const availableOfficers = useMemo(() => {
    return officers.filter(
      (officer) =>
        officer.status !== "suspended" &&
        officer.dutyStatus !== "off-duty"
    );
  }, [officers]);

  const stationOptions = useMemo(() => {
    const stations = vehicles
      .map((vehicle) => vehicle.station)
      .filter((station): station is string => Boolean(station));

    return Array.from(new Set(stations)).sort();
  }, [vehicles]);

  const filteredVehicles = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return vehicles.filter((vehicle) => {
      const matchesSearch =
        !normalizedSearch ||
        vehicle.registrationNumber
          ?.toLowerCase()
          .includes(normalizedSearch) ||
        vehicle.callSign?.toLowerCase().includes(normalizedSearch) ||
        vehicle.vehicleType?.toLowerCase().includes(normalizedSearch) ||
        vehicle.driverName?.toLowerCase().includes(normalizedSearch) ||
        vehicle.station?.toLowerCase().includes(normalizedSearch) ||
        vehicle.currentLocation
          ?.toLowerCase()
          .includes(normalizedSearch) ||
        vehicle.currentIncidentId
          ?.toLowerCase()
          .includes(normalizedSearch);

      const matchesStatus =
        statusFilter === "all" || vehicle.status === statusFilter;

      const matchesType =
        typeFilter === "all" || vehicle.vehicleType === typeFilter;

      const matchesStation =
        stationFilter === "all" || vehicle.station === stationFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesType &&
        matchesStation
      );
    });
  }, [vehicles, search, statusFilter, typeFilter, stationFilter]);

  const statistics = useMemo(() => {
    const available = vehicles.filter(
      (vehicle) => vehicle.status === "Available"
    ).length;

    const patrolling = vehicles.filter(
      (vehicle) => vehicle.status === "Patrolling"
    ).length;

    const responding = vehicles.filter((vehicle) =>
      ["Dispatched", "Responding", "On Scene"].includes(
        vehicle.status || ""
      )
    ).length;

    const maintenance = vehicles.filter(
      (vehicle) =>
        vehicle.status === "Maintenance" || vehicle.maintenanceDue
    ).length;

    const fuelAlerts = vehicles.filter(
      (vehicle) => Number(vehicle.fuelLevel || 0) <= 20
    ).length;

    const gpsOnline = vehicles.filter(
      (vehicle) => vehicle.gpsOnline === true
    ).length;

    return {
      total: vehicles.length,
      available,
      patrolling,
      responding,
      maintenance,
      fuelAlerts,
      gpsOnline,
    };
  }, [vehicles]);

  function updateForm<K extends keyof VehicleForm>(
    field: K,
    value: VehicleForm[K]
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingVehicleId(null);
    setShowForm(false);
  }

  function openCreateForm() {
    setMessage("");
    setEditingVehicleId(null);
    setForm(emptyForm);
    setShowForm(true);
  }

  function openEditForm(vehicle: PoliceVehicle) {
    setMessage("");

    setEditingVehicleId(vehicle.id);

    setForm({
      registrationNumber: vehicle.registrationNumber || "",
      callSign: vehicle.callSign || "",
      vehicleType: vehicle.vehicleType || "Patrol SUV",
      status: vehicle.status || "Available",

      driverId: vehicle.driverId || "",
      station: vehicle.station || "",
      county: vehicle.county || "Mombasa",
      ward: vehicle.ward || "",
      currentLocation: vehicle.currentLocation || "",

      fuelLevel: Number(vehicle.fuelLevel || 0),
      mileage: Number(vehicle.mileage || 0),
      gpsOnline: vehicle.gpsOnline !== false,

      maintenanceDue: vehicle.maintenanceDue === true,
      maintenanceNotes: vehicle.maintenanceNotes || "",
      lastServiceDate: vehicle.lastServiceDate || "",
      nextServiceMileage: Number(vehicle.nextServiceMileage || 0),
    });

    setShowForm(true);
  }

  async function saveVehicle(event: React.FormEvent) {
    event.preventDefault();

    const registrationNumber = form.registrationNumber.trim().toUpperCase();
    const callSign = form.callSign.trim();

    if (!registrationNumber) {
      setMessage("Vehicle registration number is required.");
      return;
    }

    if (!callSign) {
      setMessage("Vehicle call sign is required.");
      return;
    }

    const officer = officers.find(
      (item) => item.id === form.driverId
    );

    const vehicleData = {
      registrationNumber,
      callSign,
      vehicleType: form.vehicleType,
      agencyRole: "police",
      status: form.status,

      driverId: officer?.id || null,
      driverName: officer?.fullName || null,

      station: form.station.trim(),
      county: form.county.trim(),
      ward: form.ward.trim(),
      currentLocation: form.currentLocation.trim(),

      fuelLevel: normalizeNumber(form.fuelLevel, 0, 100),
      mileage: normalizeNumber(form.mileage),
      gpsOnline: form.gpsOnline,

      maintenanceDue: form.maintenanceDue,
      maintenanceNotes: form.maintenanceNotes.trim(),
      lastServiceDate: form.lastServiceDate,
      nextServiceMileage: normalizeNumber(form.nextServiceMileage),

      updatedAt: serverTimestamp(),
    };

    try {
      setSaving(true);
      setMessage("");

      if (editingVehicleId) {
        await updateDoc(
          doc(db, "vehicles", editingVehicleId),
          vehicleData
        );

        setMessage("Patrol vehicle updated successfully.");
      } else {
        await addDoc(collection(db, "vehicles"), {
          ...vehicleData,
          currentIncidentId: null,
          createdAt: serverTimestamp(),
        });

        setMessage("Patrol vehicle registered successfully.");
      }

      resetForm();
    } catch (saveError) {
      console.error(saveError);
      setMessage("Failed to save the patrol vehicle.");
    } finally {
      setSaving(false);
    }
  }

  async function updateVehicleStatus(
    vehicleId: string,
    status: string
  ) {
    try {
      await updateDoc(doc(db, "vehicles", vehicleId), {
        status,
        updatedAt: serverTimestamp(),
      });

      setMessage(`Vehicle status updated to ${status}.`);
    } catch (updateError) {
      console.error(updateError);
      setMessage("Failed to update vehicle status.");
    }
  }

  async function assignDriver(
    vehicleId: string,
    officerId: string
  ) {
    const officer = officers.find((item) => item.id === officerId);

    try {
      await updateDoc(doc(db, "vehicles", vehicleId), {
        driverId: officer?.id || null,
        driverName: officer?.fullName || null,
        updatedAt: serverTimestamp(),
      });

      setMessage(
        officer
          ? `Driver assigned: ${officer.fullName || "Police Officer"}.`
          : "Vehicle driver removed."
      );
    } catch (updateError) {
      console.error(updateError);
      setMessage("Failed to assign vehicle driver.");
    }
  }

  async function updateFuelLevel(
    vehicleId: string,
    fuelLevel: number
  ) {
    try {
      await updateDoc(doc(db, "vehicles", vehicleId), {
        fuelLevel: normalizeNumber(fuelLevel, 0, 100),
        updatedAt: serverTimestamp(),
      });

      setMessage("Vehicle fuel level updated.");
    } catch (updateError) {
      console.error(updateError);
      setMessage("Failed to update fuel level.");
    }
  }

  async function updateMileage(
    vehicleId: string,
    mileage: number
  ) {
    try {
      await updateDoc(doc(db, "vehicles", vehicleId), {
        mileage: normalizeNumber(mileage),
        updatedAt: serverTimestamp(),
      });

      setMessage("Vehicle mileage updated.");
    } catch (updateError) {
      console.error(updateError);
      setMessage("Failed to update vehicle mileage.");
    }
  }

  async function toggleGps(vehicle: PoliceVehicle) {
    try {
      await updateDoc(doc(db, "vehicles", vehicle.id), {
        gpsOnline: !vehicle.gpsOnline,
        updatedAt: serverTimestamp(),
      });

      setMessage(
        vehicle.gpsOnline
          ? "Vehicle GPS marked offline."
          : "Vehicle GPS marked online."
      );
    } catch (updateError) {
      console.error(updateError);
      setMessage("Failed to update GPS status.");
    }
  }

  async function toggleMaintenance(vehicle: PoliceVehicle) {
    const maintenanceDue = !vehicle.maintenanceDue;

    try {
      await updateDoc(doc(db, "vehicles", vehicle.id), {
        maintenanceDue,
        status: maintenanceDue
          ? "Maintenance"
          : vehicle.status === "Maintenance"
            ? "Available"
            : vehicle.status,
        updatedAt: serverTimestamp(),
      });

      setMessage(
        maintenanceDue
          ? "Vehicle moved to maintenance."
          : "Maintenance alert cleared."
      );
    } catch (updateError) {
      console.error(updateError);
      setMessage("Failed to update maintenance status.");
    }
  }

  function clearFilters() {
    setSearch("");
    setStatusFilter("all");
    setTypeFilter("all");
    setStationFilter("all");
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h1 className="flex items-center gap-3 text-3xl font-extrabold text-slate-950">
            <FaCarSide className="text-blue-700" />
            Police Patrol Vehicles
          </h1>

          <p className="mt-2 text-slate-600">
            Register patrol vehicles, assign drivers, manage readiness, monitor
            fuel, mileage, GPS and maintenance.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateForm}
          className="flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 py-3 font-bold text-white transition hover:bg-blue-800"
        >
          <FaPlus />
          Register Vehicle
        </button>
      </div>

      {message && (
        <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-blue-700">
          {message}
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      {showForm && (
        <form
          onSubmit={saveVehicle}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-950">
                {editingVehicleId
                  ? "Edit Patrol Vehicle"
                  : "Register Patrol Vehicle"}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Enter the vehicle profile and operational readiness details.
              </p>
            </div>

            <button
              type="button"
              onClick={resetForm}
              className="rounded-xl p-3 text-slate-500 hover:bg-slate-100"
              aria-label="Close vehicle form"
            >
              <FaTimes />
            </button>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            <div>
              <label className="text-sm font-semibold text-slate-700">
                Registration Number
              </label>

              <input
                value={form.registrationNumber}
                onChange={(event) =>
                  updateForm("registrationNumber", event.target.value)
                }
                placeholder="Example: GKB 123A"
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700">
                Call Sign
              </label>

              <input
                value={form.callSign}
                onChange={(event) =>
                  updateForm("callSign", event.target.value)
                }
                placeholder="Example: Alpha 12"
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700">
                Vehicle Type
              </label>

              <select
                value={form.vehicleType}
                onChange={(event) =>
                  updateForm("vehicleType", event.target.value)
                }
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-500"
              >
                {vehicleTypes.map((vehicleType) => (
                  <option key={vehicleType} value={vehicleType}>
                    {vehicleType}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700">
                Operational Status
              </label>

              <select
                value={form.status}
                onChange={(event) =>
                  updateForm("status", event.target.value)
                }
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-500"
              >
                {vehicleStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700">
                Assigned Driver
              </label>

              <select
                value={form.driverId}
                onChange={(event) =>
                  updateForm("driverId", event.target.value)
                }
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-500"
              >
                <option value="">No driver assigned</option>

                {availableOfficers.map((officer) => (
                  <option key={officer.id} value={officer.id}>
                    {officer.fullName || "Unnamed Officer"}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700">
                Police Station
              </label>

              <input
                value={form.station}
                onChange={(event) =>
                  updateForm("station", event.target.value)
                }
                placeholder="Example: Nyali Police Station"
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700">
                County
              </label>

              <input
                value={form.county}
                onChange={(event) =>
                  updateForm("county", event.target.value)
                }
                placeholder="Mombasa"
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700">
                Ward
              </label>

              <input
                value={form.ward}
                onChange={(event) =>
                  updateForm("ward", event.target.value)
                }
                placeholder="Example: Kazandani"
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700">
                Current Location
              </label>

              <input
                value={form.currentLocation}
                onChange={(event) =>
                  updateForm("currentLocation", event.target.value)
                }
                placeholder="Example: Bamburi patrol zone"
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700">
                Fuel Level (%)
              </label>

              <input
                type="number"
                min={0}
                max={100}
                value={form.fuelLevel}
                onChange={(event) =>
                  updateForm(
                    "fuelLevel",
                    Number(event.target.value)
                  )
                }
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700">
                Current Mileage
              </label>

              <input
                type="number"
                min={0}
                value={form.mileage}
                onChange={(event) =>
                  updateForm("mileage", Number(event.target.value))
                }
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700">
                Next Service Mileage
              </label>

              <input
                type="number"
                min={0}
                value={form.nextServiceMileage}
                onChange={(event) =>
                  updateForm(
                    "nextServiceMileage",
                    Number(event.target.value)
                  )
                }
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700">
                Last Service Date
              </label>

              <input
                type="date"
                value={form.lastServiceDate}
                onChange={(event) =>
                  updateForm("lastServiceDate", event.target.value)
                }
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            <label className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
              <span>
                <p className="font-bold text-slate-900">GPS Connected</p>
                <p className="text-sm text-slate-500">
                  Vehicle can transmit live location.
                </p>
              </span>

              <input
                type="checkbox"
                checked={form.gpsOnline}
                onChange={(event) =>
                  updateForm("gpsOnline", event.target.checked)
                }
                className="h-5 w-5"
              />
            </label>

            <label className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
              <span>
                <p className="font-bold text-slate-900">
                  Maintenance Required
                </p>
                <p className="text-sm text-slate-500">
                  Flag the vehicle for inspection.
                </p>
              </span>

              <input
                type="checkbox"
                checked={form.maintenanceDue}
                onChange={(event) =>
                  updateForm(
                    "maintenanceDue",
                    event.target.checked
                  )
                }
                className="h-5 w-5"
              />
            </label>

            <div className="md:col-span-2 xl:col-span-3">
              <label className="text-sm font-semibold text-slate-700">
                Maintenance Notes
              </label>

              <textarea
                rows={3}
                value={form.maintenanceNotes}
                onChange={(event) =>
                  updateForm(
                    "maintenanceNotes",
                    event.target.value
                  )
                }
                placeholder="Record mechanical issues, maintenance requirements or service notes."
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-blue-700 px-6 py-3 font-bold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving
                ? "Saving..."
                : editingVehicleId
                  ? "Update Vehicle"
                  : "Register Vehicle"}
            </button>

            <button
              type="button"
              onClick={resetForm}
              className="rounded-xl border border-slate-200 px-6 py-3 font-bold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-7">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <FaCarSide className="text-2xl text-blue-700" />
          <p className="mt-4 text-sm text-slate-500">Total Vehicles</p>
          <h2 className="mt-1 text-3xl font-extrabold">
            {statistics.total}
          </h2>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <FaCheckCircle className="text-2xl text-emerald-600" />
          <p className="mt-4 text-sm text-slate-500">Available</p>
          <h2 className="mt-1 text-3xl font-extrabold text-emerald-600">
            {statistics.available}
          </h2>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <FaRoad className="text-2xl text-cyan-600" />
          <p className="mt-4 text-sm text-slate-500">Patrolling</p>
          <h2 className="mt-1 text-3xl font-extrabold text-cyan-600">
            {statistics.patrolling}
          </h2>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <FaExclamationTriangle className="text-2xl text-purple-600" />
          <p className="mt-4 text-sm text-slate-500">Responding</p>
          <h2 className="mt-1 text-3xl font-extrabold text-purple-600">
            {statistics.responding}
          </h2>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <FaTools className="text-2xl text-orange-600" />
          <p className="mt-4 text-sm text-slate-500">Maintenance</p>
          <h2 className="mt-1 text-3xl font-extrabold text-orange-600">
            {statistics.maintenance}
          </h2>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <FaGasPump className="text-2xl text-red-600" />
          <p className="mt-4 text-sm text-slate-500">Fuel Alerts</p>
          <h2 className="mt-1 text-3xl font-extrabold text-red-600">
            {statistics.fuelAlerts}
          </h2>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <FaSatelliteDish className="text-2xl text-indigo-600" />
          <p className="mt-4 text-sm text-slate-500">GPS Online</p>
          <h2 className="mt-1 text-3xl font-extrabold text-indigo-600">
            {statistics.gpsOnline}
          </h2>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4 xl:grid-cols-[1fr_210px_220px_230px_auto]">
          <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <FaSearch className="text-slate-400" />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search registration, call sign, driver or station..."
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
          >
            <option value="all">All Statuses</option>

            {vehicleStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>

          <select
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
          >
            <option value="all">All Vehicle Types</option>

            {vehicleTypes.map((vehicleType) => (
              <option key={vehicleType} value={vehicleType}>
                {vehicleType}
              </option>
            ))}
          </select>

          <select
            value={stationFilter}
            onChange={(event) => setStationFilter(event.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
          >
            <option value="all">All Stations</option>

            {stationOptions.map((station) => (
              <option key={station} value={station}>
                {station}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={clearFilters}
            className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
          >
            Clear
          </button>
        </div>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-slate-500 shadow-sm">
          Loading patrol vehicles...
        </div>
      ) : filteredVehicles.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500 shadow-sm">
          No Police vehicles match the current filters.
        </div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-2">
          {filteredVehicles.map((vehicle) => {
            const fuelLevel = normalizeNumber(
              Number(vehicle.fuelLevel || 0),
              0,
              100
            );

            return (
              <div
                key={vehicle.id}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="flex flex-col gap-5">
                  <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-2xl text-blue-700">
                      <FaCarSide />
                    </div>

                    <div className="flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <h2 className="text-xl font-bold text-slate-950">
                            {vehicle.registrationNumber ||
                              "Unregistered Vehicle"}
                          </h2>

                          <p className="mt-1 text-sm font-semibold text-blue-700">
                            {vehicle.callSign || "No call sign"} ·{" "}
                            {vehicle.vehicleType || "Vehicle type not set"}
                          </p>
                        </div>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${statusClass(
                            vehicle.status
                          )}`}
                        >
                          {vehicle.status || "Unknown"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-xl bg-slate-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Assigned Driver
                      </p>

                      <p className="mt-2 font-bold text-slate-900">
                        {vehicle.driverName || "No driver assigned"}
                      </p>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Station
                      </p>

                      <p className="mt-2 font-bold text-slate-900">
                        {vehicle.station || "No station assigned"}
                      </p>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Current Location
                      </p>

                      <p className="mt-2 flex items-center gap-2 font-bold text-slate-900">
                        <FaMapMarkerAlt className="text-red-500" />
                        {vehicle.currentLocation || "Location unavailable"}
                      </p>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Current Incident
                      </p>

                      <p className="mt-2 break-all font-mono text-xs font-bold text-slate-900">
                        {vehicle.currentIncidentId || "No active incident"}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-4">
                    <div className="flex items-center justify-between">
                      <p className="flex items-center gap-2 text-sm font-bold text-slate-700">
                        <FaGasPump />
                        Fuel Level
                      </p>

                      <p
                        className={`font-extrabold ${
                          fuelLevel <= 20
                            ? "text-red-600"
                            : "text-slate-900"
                        }`}
                      >
                        {fuelLevel}%
                      </p>
                    </div>

                    <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-200">
                      <div
                        className={`h-full rounded-full transition-all ${fuelClass(
                          fuelLevel
                        )}`}
                        style={{
                          width: `${fuelLevel}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-xl border border-slate-200 p-4">
                      <p className="text-xs text-slate-500">Mileage</p>
                      <p className="mt-1 font-bold text-slate-900">
                        {Number(vehicle.mileage || 0).toLocaleString()} km
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-200 p-4">
                      <p className="text-xs text-slate-500">GPS</p>
                      <p
                        className={`mt-1 font-bold ${
                          vehicle.gpsOnline
                            ? "text-emerald-700"
                            : "text-red-700"
                        }`}
                      >
                        {vehicle.gpsOnline ? "Online" : "Offline"}
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-200 p-4">
                      <p className="text-xs text-slate-500">Maintenance</p>
                      <p
                        className={`mt-1 font-bold ${
                          vehicle.maintenanceDue
                            ? "text-orange-700"
                            : "text-emerald-700"
                        }`}
                      >
                        {vehicle.maintenanceDue ? "Required" : "Clear"}
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="text-sm font-semibold text-slate-600">
                        Vehicle Status
                      </label>

                      <select
                        value={vehicle.status || "Available"}
                        onChange={(event) =>
                          updateVehicleStatus(
                            vehicle.id,
                            event.target.value
                          )
                        }
                        className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
                      >
                        {vehicleStatuses.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-slate-600">
                        Assigned Driver
                      </label>

                      <select
                        value={vehicle.driverId || ""}
                        onChange={(event) =>
                          assignDriver(vehicle.id, event.target.value)
                        }
                        className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
                      >
                        <option value="">No driver assigned</option>

                        {availableOfficers.map((officer) => (
                          <option key={officer.id} value={officer.id}>
                            {officer.fullName || "Unnamed Officer"}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-slate-600">
                        Update Fuel %
                      </label>

                      <input
                        type="number"
                        min={0}
                        max={100}
                        defaultValue={fuelLevel}
                        onBlur={(event) => {
                          const value = Number(event.target.value);

                          if (value !== fuelLevel) {
                            void updateFuelLevel(vehicle.id, value);
                          }
                        }}
                        className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-slate-600">
                        Update Mileage
                      </label>

                      <input
                        type="number"
                        min={0}
                        defaultValue={Number(vehicle.mileage || 0)}
                        onBlur={(event) => {
                          const value = Number(event.target.value);

                          if (value !== Number(vehicle.mileage || 0)) {
                            void updateMileage(vehicle.id, value);
                          }
                        }}
                        className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {selectedVehicle?.id === vehicle.id && (
                    <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
                      <h3 className="font-bold text-blue-900">
                        Full Vehicle Profile
                      </h3>

                      <div className="mt-4 grid gap-4 text-sm text-blue-800 md:grid-cols-2">
                        <p>
                          <span className="font-semibold">County:</span>{" "}
                          {vehicle.county || "Not assigned"}
                        </p>

                        <p>
                          <span className="font-semibold">Ward:</span>{" "}
                          {vehicle.ward || "Not assigned"}
                        </p>

                        <p>
                          <span className="font-semibold">
                            Last service:
                          </span>{" "}
                          {vehicle.lastServiceDate || "Not recorded"}
                        </p>

                        <p>
                          <span className="font-semibold">
                            Next service:
                          </span>{" "}
                          {vehicle.nextServiceMileage
                            ? `${vehicle.nextServiceMileage.toLocaleString()} km`
                            : "Not recorded"}
                        </p>

                        <p className="md:col-span-2">
                          <span className="font-semibold">
                            Maintenance notes:
                          </span>{" "}
                          {vehicle.maintenanceNotes || "No notes recorded."}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => openEditForm(vehicle)}
                      className="flex items-center gap-2 rounded-xl bg-blue-700 px-4 py-3 text-sm font-bold text-white hover:bg-blue-800"
                    >
                      <FaCog />
                      Edit Vehicle
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setSelectedVehicle(
                          selectedVehicle?.id === vehicle.id
                            ? null
                            : vehicle
                        )
                      }
                      className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
                    >
                      {selectedVehicle?.id === vehicle.id
                        ? "Hide Details"
                        : "View Details"}
                    </button>

                    <button
                      type="button"
                      onClick={() => toggleGps(vehicle)}
                      className={`rounded-xl px-4 py-3 text-sm font-bold text-white ${
                        vehicle.gpsOnline
                          ? "bg-slate-700 hover:bg-slate-800"
                          : "bg-emerald-600 hover:bg-emerald-700"
                      }`}
                    >
                      {vehicle.gpsOnline
                        ? "Mark GPS Offline"
                        : "Mark GPS Online"}
                    </button>

                    <button
                      type="button"
                      onClick={() => toggleMaintenance(vehicle)}
                      className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-bold text-white ${
                        vehicle.maintenanceDue
                          ? "bg-emerald-600 hover:bg-emerald-700"
                          : "bg-orange-600 hover:bg-orange-700"
                      }`}
                    >
                      <FaTools />

                      {vehicle.maintenanceDue
                        ? "Clear Maintenance"
                        : "Send to Maintenance"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5 text-sm leading-6 text-blue-700">
        Vehicles registered here are saved in the Firestore
        <span className="mx-1 font-mono font-bold">vehicles</span>
        collection with
        <span className="mx-1 font-mono font-bold">
          agencyRole: police
        </span>
        and become available in the Police Dispatch Centre.
      </div>
    </div>
  );
}