import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FaAmbulance,
  FaCheckCircle,
  FaClock,
  FaExclamationTriangle,
  FaMapMarkedAlt,
  FaRoute,
  FaTruck,
  FaUserFriends,
} from "react-icons/fa";

import PageHeader from "../../../components/common/PageHeader";
import StatusBadge from "../../../components/common/StatusBadge";

type DispatchStatus =
  | "Awaiting Assignment"
  | "Assigned"
  | "Dispatched"
  | "En Route"
  | "On Scene"
  | "Completed";

type Priority = "Critical" | "High" | "Medium" | "Low";

type ResponseTeamStatus = "Available" | "Busy" | "Offline";

type VehicleStatus = "Available" | "Assigned" | "Maintenance";

type DispatchIncident = {
  id: string;
  reference: string;
  title: string;
  location: string;
  ward: string;
  priority: Priority;
  status: DispatchStatus;
  reportedAt: string;
  assignedTeam?: string;
  assignedVehicle?: string;
  dispatchedAt?: string;
  arrivedAt?: string;
};

type ResponseTeam = {
  id: string;
  name: string;
  specialty: string;
  members: number;
  leader: string;
  status: ResponseTeamStatus;
};

type ResponseVehicle = {
  id: string;
  registration: string;
  type: string;
  driver: string;
  status: VehicleStatus;
};

const initialIncidents: DispatchIncident[] = [
  {
    id: "1",
    reference: "KRCS-2026-001",
    title: "Flood evacuation support",
    location: "Shelly Beach",
    ward: "Likoni",
    priority: "Critical",
    status: "Awaiting Assignment",
    reportedAt: "08:42",
  },
  {
    id: "2",
    reference: "KRCS-2026-002",
    title: "Multiple casualty medical response",
    location: "Links Road",
    ward: "Nyali",
    priority: "High",
    status: "Assigned",
    reportedAt: "09:06",
    assignedTeam: "Emergency Health Team",
  },
  {
    id: "3",
    reference: "KRCS-2026-003",
    title: "Relief distribution operation",
    location: "Bamburi",
    ward: "Kisauni",
    priority: "Medium",
    status: "Dispatched",
    reportedAt: "09:24",
    assignedTeam: "Relief Team 2",
    assignedVehicle: "KRCS Logistics 04",
    dispatchedAt: "09:31",
  },
  {
    id: "4",
    reference: "KRCS-2026-004",
    title: "Emergency rescue response",
    location: "Port Reitz",
    ward: "Changamwe",
    priority: "High",
    status: "En Route",
    reportedAt: "09:51",
    assignedTeam: "Rescue Team Alpha",
    assignedVehicle: "KRCS Rescue 02",
    dispatchedAt: "09:58",
  },
];

const initialTeams: ResponseTeam[] = [
  {
    id: "team-1",
    name: "Rescue Team Alpha",
    specialty: "Search & Rescue",
    members: 8,
    leader: "Peter Mwangi",
    status: "Available",
  },
  {
    id: "team-2",
    name: "Emergency Health Team",
    specialty: "Medical Response",
    members: 6,
    leader: "Dr. Amina Hassan",
    status: "Available",
  },
  {
    id: "team-3",
    name: "Relief Team 2",
    specialty: "Relief Distribution",
    members: 10,
    leader: "Grace Wanjiku",
    status: "Busy",
  },
  {
    id: "team-4",
    name: "Volunteer Response Team",
    specialty: "Community Support",
    members: 12,
    leader: "Ali Mohamed",
    status: "Available",
  },
];

const initialVehicles: ResponseVehicle[] = [
  {
    id: "vehicle-1",
    registration: "KRCS Ambulance 07",
    type: "Ambulance",
    driver: "James Otieno",
    status: "Available",
  },
  {
    id: "vehicle-2",
    registration: "KRCS Rescue 02",
    type: "Rescue Vehicle",
    driver: "Brian Kamau",
    status: "Assigned",
  },
  {
    id: "vehicle-3",
    registration: "KRCS Logistics 04",
    type: "Logistics Truck",
    driver: "Mohamed Salim",
    status: "Assigned",
  },
  {
    id: "vehicle-4",
    registration: "KRCS Ambulance 11",
    type: "Ambulance",
    driver: "Fatuma Noor",
    status: "Available",
  },
];

export default function RedCrossDispatch() {
  const navigate = useNavigate();

  const [incidents, setIncidents] =
    useState<DispatchIncident[]>(initialIncidents);

  const [teams, setTeams] =
    useState<ResponseTeam[]>(initialTeams);

  const [vehicles, setVehicles] =
    useState<ResponseVehicle[]>(initialVehicles);

  const [selectedIncidentId, setSelectedIncidentId] =
    useState<string>(initialIncidents[0]?.id ?? "");

  const [selectedTeam, setSelectedTeam] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState("");

  const selectedIncident = useMemo(
    () =>
      incidents.find(
        (incident) => incident.id === selectedIncidentId
      ) ?? null,
    [incidents, selectedIncidentId]
  );

  const availableTeams = useMemo(
    () =>
      teams.filter((team) => team.status === "Available"),
    [teams]
  );

  const availableVehicles = useMemo(
    () =>
      vehicles.filter(
        (vehicle) => vehicle.status === "Available"
      ),
    [vehicles]
  );

  const stats = useMemo(
    () => ({
      awaiting: incidents.filter(
        (incident) =>
          incident.status === "Awaiting Assignment"
      ).length,
      active: incidents.filter(
        (incident) =>
          !["Completed", "Awaiting Assignment"].includes(
            incident.status
          )
      ).length,
      teamsAvailable: availableTeams.length,
      vehiclesAvailable: availableVehicles.length,
    }),
    [incidents, availableTeams, availableVehicles]
  );

  function currentTime() {
    return new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function updateIncident(
    incidentId: string,
    changes: Partial<DispatchIncident>
  ) {
    setIncidents((current) =>
      current.map((incident) =>
        incident.id === incidentId
          ? { ...incident, ...changes }
          : incident
      )
    );
  }

  function assignResources() {
    if (!selectedIncident || !selectedTeam) {
      return;
    }

    updateIncident(selectedIncident.id, {
      assignedTeam: selectedTeam,
      assignedVehicle: selectedVehicle || undefined,
      status: "Assigned",
    });

    setTeams((current) =>
      current.map((team) =>
        team.name === selectedTeam
          ? { ...team, status: "Busy" }
          : team
      )
    );

    if (selectedVehicle) {
      setVehicles((current) =>
        current.map((vehicle) =>
          vehicle.registration === selectedVehicle
            ? { ...vehicle, status: "Assigned" }
            : vehicle
        )
      );
    }

    setSelectedTeam("");
    setSelectedVehicle("");
  }

  function dispatchSelectedIncident() {
    if (!selectedIncident) {
      return;
    }

    updateIncident(selectedIncident.id, {
      status: "Dispatched",
      dispatchedAt: currentTime(),
    });
  }

  function markEnRoute() {
    if (!selectedIncident) {
      return;
    }

    updateIncident(selectedIncident.id, {
      status: "En Route",
    });
  }

  function markOnScene() {
    if (!selectedIncident) {
      return;
    }

    updateIncident(selectedIncident.id, {
      status: "On Scene",
      arrivedAt: currentTime(),
    });
  }

  function completeDispatch() {
    if (!selectedIncident) {
      return;
    }

    updateIncident(selectedIncident.id, {
      status: "Completed",
    });

    if (selectedIncident.assignedTeam) {
      setTeams((current) =>
        current.map((team) =>
          team.name === selectedIncident.assignedTeam
            ? { ...team, status: "Available" }
            : team
        )
      );
    }

    if (selectedIncident.assignedVehicle) {
      setVehicles((current) =>
        current.map((vehicle) =>
          vehicle.registration ===
          selectedIncident.assignedVehicle
            ? { ...vehicle, status: "Available" }
            : vehicle
        )
      );
    }
  }

  return (
    <div className="space-y-7">
      <PageHeader
        title="Emergency Dispatch Centre"
        subtitle="Assign response teams and vehicles, coordinate deployments and monitor humanitarian response progress."
        icon={<FaRoute />}
        badge="Live Dispatch"
        badgeColor="red"
        actions={
          <button
            type="button"
            onClick={() => navigate("/redcross/gis")}
            className="flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 font-bold text-white transition hover:bg-slate-800"
          >
            <FaMapMarkedAlt />
            Open Live GIS
          </button>
        }
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 shadow-sm">
          <FaExclamationTriangle className="text-xl text-red-600" />

          <p className="mt-4 text-sm font-semibold text-red-600">
            Awaiting Assignment
          </p>

          <p className="mt-1 text-3xl font-extrabold text-red-700">
            {stats.awaiting}
          </p>
        </div>

        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5 shadow-sm">
          <FaRoute className="text-xl text-blue-600" />

          <p className="mt-4 text-sm font-semibold text-blue-600">
            Active Dispatches
          </p>

          <p className="mt-1 text-3xl font-extrabold text-blue-700">
            {stats.active}
          </p>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
          <FaUserFriends className="text-xl text-emerald-600" />

          <p className="mt-4 text-sm font-semibold text-emerald-600">
            Teams Available
          </p>

          <p className="mt-1 text-3xl font-extrabold text-emerald-700">
            {stats.teamsAvailable}
          </p>
        </div>

        <div className="rounded-2xl border border-purple-200 bg-purple-50 p-5 shadow-sm">
          <FaAmbulance className="text-xl text-purple-600" />

          <p className="mt-4 text-sm font-semibold text-purple-600">
            Vehicles Available
          </p>

          <p className="mt-1 text-3xl font-extrabold text-purple-700">
            {stats.vehiclesAvailable}
          </p>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-5">
            <h2 className="text-xl font-bold text-slate-950">
              Dispatch Queue
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Select an incident to assign and deploy resources.
            </p>
          </div>

          <div className="divide-y divide-slate-100">
            {incidents.map((incident) => {
              const active =
                incident.id === selectedIncidentId;

              return (
                <button
                  key={incident.id}
                  type="button"
                  onClick={() =>
                    setSelectedIncidentId(incident.id)
                  }
                  className={`w-full p-5 text-left transition ${
                    active
                      ? "bg-red-50"
                      : "hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-extrabold text-slate-950">
                        {incident.reference}
                      </p>

                      <p className="mt-1 text-sm font-semibold text-slate-700">
                        {incident.title}
                      </p>

                      <p className="mt-2 text-xs text-slate-500">
                        {incident.location}, {incident.ward}
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <StatusBadge
                        status={incident.priority}
                      />

                      <StatusBadge
                        status={incident.status}
                      />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          {!selectedIncident ? (
            <div className="p-12 text-center">
              <FaRoute className="mx-auto text-5xl text-slate-300" />

              <h2 className="mt-5 text-xl font-bold text-slate-900">
                Select an incident
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Choose an incident from the dispatch queue.
              </p>
            </div>
          ) : (
            <>
              <div className="border-b border-slate-100 p-5 sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-red-600">
                      Selected Incident
                    </p>

                    <h2 className="mt-2 text-2xl font-extrabold text-slate-950">
                      {selectedIncident.reference}
                    </h2>

                    <p className="mt-2 text-slate-600">
                      {selectedIncident.title}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <StatusBadge
                      status={selectedIncident.priority}
                    />
                    <StatusBadge
                      status={selectedIncident.status}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-6 p-5 sm:p-6">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs font-bold uppercase text-slate-500">
                      Location
                    </p>

                    <p className="mt-2 font-bold text-slate-900">
                      {selectedIncident.location}
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      {selectedIncident.ward}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs font-bold uppercase text-slate-500">
                      Reported
                    </p>

                    <p className="mt-2 flex items-center gap-2 font-bold text-slate-900">
                      <FaClock />
                      {selectedIncident.reportedAt}
                    </p>
                  </div>
                </div>

                {selectedIncident.assignedTeam ? (
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
                      <p className="text-xs font-bold uppercase text-blue-600">
                        Assigned Team
                      </p>

                      <p className="mt-2 font-extrabold text-blue-950">
                        {selectedIncident.assignedTeam}
                      </p>
                    </div>

                    <div className="rounded-xl border border-purple-100 bg-purple-50 p-4">
                      <p className="text-xs font-bold uppercase text-purple-600">
                        Assigned Vehicle
                      </p>

                      <p className="mt-2 font-extrabold text-purple-950">
                        {selectedIncident.assignedVehicle ||
                          "No vehicle assigned"}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-slate-200 p-5">
                    <h3 className="font-bold text-slate-950">
                      Assign Response Resources
                    </h3>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <select
                        value={selectedTeam}
                        onChange={(event) =>
                          setSelectedTeam(
                            event.target.value
                          )
                        }
                        className="rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-red-500"
                      >
                        <option value="">
                          Select response team
                        </option>

                        {availableTeams.map((team) => (
                          <option
                            key={team.id}
                            value={team.name}
                          >
                            {team.name} · {team.specialty}
                          </option>
                        ))}
                      </select>

                      <select
                        value={selectedVehicle}
                        onChange={(event) =>
                          setSelectedVehicle(
                            event.target.value
                          )
                        }
                        className="rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-red-500"
                      >
                        <option value="">
                          Select vehicle (optional)
                        </option>

                        {availableVehicles.map(
                          (vehicle) => (
                            <option
                              key={vehicle.id}
                              value={vehicle.registration}
                            >
                              {vehicle.registration} ·{" "}
                              {vehicle.type}
                            </option>
                          )
                        )}
                      </select>
                    </div>

                    <button
                      type="button"
                      onClick={assignResources}
                      disabled={!selectedTeam}
                      className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <FaUserFriends />
                      Assign Resources
                    </button>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      `/redcross/gis?incident=${selectedIncident.id}`
                    )
                  }
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 font-bold text-slate-700 transition hover:bg-slate-50"
                >
                  <FaMapMarkedAlt />
                  View on Live GIS
                </button>

                <div className="rounded-2xl border border-slate-200 p-5">
                  <h3 className="font-bold text-slate-950">
                    Response Progress
                  </h3>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {[
                      "Assigned",
                      "Dispatched",
                      "En Route",
                      "On Scene",
                      "Completed",
                    ].map((stage) => {
                      const stages: DispatchStatus[] = [
                        "Awaiting Assignment",
                        "Assigned",
                        "Dispatched",
                        "En Route",
                        "On Scene",
                        "Completed",
                      ];

                      const currentIndex =
                        stages.indexOf(
                          selectedIncident.status
                        );

                      const stageIndex =
                        stages.indexOf(
                          stage as DispatchStatus
                        );

                      const reached =
                        currentIndex >= stageIndex;

                      return (
                        <div
                          key={stage}
                          className={`rounded-full px-3 py-2 text-xs font-bold ${
                            reached
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-slate-100 text-slate-400"
                          }`}
                        >
                          {stage}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="grid gap-2 border-t border-slate-100 bg-slate-50 p-5 sm:grid-cols-2">
                {selectedIncident.status === "Assigned" && (
                  <button
                    type="button"
                    onClick={dispatchSelectedIncident}
                    className="flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 font-bold text-white transition hover:bg-red-700"
                  >
                    <FaAmbulance />
                    Dispatch Now
                  </button>
                )}

                {selectedIncident.status === "Dispatched" && (
                  <button
                    type="button"
                    onClick={markEnRoute}
                    className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 font-bold text-white transition hover:bg-blue-700"
                  >
                    <FaTruck />
                    Mark En Route
                  </button>
                )}

                {selectedIncident.status === "En Route" && (
                  <button
                    type="button"
                    onClick={markOnScene}
                    className="flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-4 py-3 font-bold text-white transition hover:bg-orange-700"
                  >
                    <FaMapMarkedAlt />
                    Mark On Scene
                  </button>
                )}

                {selectedIncident.status === "On Scene" && (
                  <button
                    type="button"
                    onClick={completeDispatch}
                    className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 font-bold text-white transition hover:bg-emerald-700"
                  >
                    <FaCheckCircle />
                    Complete Response
                  </button>
                )}
              </div>
            </>
          )}
        </article>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-5">
            <h2 className="text-lg font-bold text-slate-950">
              Response Teams
            </h2>
          </div>

          <div className="divide-y divide-slate-100">
            {teams.map((team) => (
              <div
                key={team.id}
                className="flex items-center justify-between gap-4 p-5"
              >
                <div>
                  <p className="font-bold text-slate-950">
                    {team.name}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {team.specialty} · {team.members} members
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Lead: {team.leader}
                  </p>
                </div>

                <StatusBadge status={team.status} />
              </div>
            ))}
          </div>
        </article>

        <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-5">
            <h2 className="text-lg font-bold text-slate-950">
              Vehicle Readiness
            </h2>
          </div>

          <div className="divide-y divide-slate-100">
            {vehicles.map((vehicle) => (
              <div
                key={vehicle.id}
                className="flex items-center justify-between gap-4 p-5"
              >
                <div>
                  <p className="font-bold text-slate-950">
                    {vehicle.registration}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {vehicle.type}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Driver: {vehicle.driver}
                  </p>
                </div>

                <StatusBadge status={vehicle.status} />
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}