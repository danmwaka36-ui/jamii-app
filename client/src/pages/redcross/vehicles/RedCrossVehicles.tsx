import {
  useEffect,
  useMemo,
  useState,
} from "react";

import type { ReactNode } from "react";

import { useNavigate } from "react-router-dom";

import {
  FaAmbulance,
  FaCar,
  FaCheckCircle,
  FaClipboardCheck,
  FaClock,
  FaEdit,
  FaGasPump,
  FaIdCard,
  FaMapMarkedAlt,
  FaMapMarkerAlt,
  FaPlus,
  FaSave,
  FaSearch,
  FaTimes,
  FaTools,
  FaTruck,
  FaUser,
  FaUsersCog,
  FaWrench,
} from "react-icons/fa";

import PageHeader from "../../../components/common/PageHeader";
import StatusBadge from "../../../components/common/StatusBadge";

import ReportActions from "../../../components/reporting/ReportActions";

import type {
  ReportColumn,
} from "../../../components/reporting/ReportActions";

/* =========================================================
   TYPES
========================================================= */

type FleetTab =
  | "overview"
  | "vehicles"
  | "drivers"
  | "assignments"
  | "maintenance"
  | "inspections";

type VehicleStatus =
  | "Available"
  | "Assigned"
  | "En Route"
  | "On Scene"
  | "Maintenance"
  | "Offline";

type VehicleType =
  | "Ambulance"
  | "Rescue Vehicle"
  | "Logistics Truck"
  | "Field Vehicle";

type GPSStatus =
  | "Online"
  | "Offline";

type DriverStatus =
  | "Available"
  | "Assigned"
  | "On Duty"
  | "Off Duty"
  | "Suspended";

type AssignmentStatus =
  | "Scheduled"
  | "Active"
  | "Completed"
  | "Cancelled";

type MaintenanceStatus =
  | "Scheduled"
  | "In Progress"
  | "Completed";

type InspectionStatus =
  | "Passed"
  | "Attention Required"
  | "Failed";

type Vehicle = {
  id: string;

  fleetNumber: string;
  registration: string;

  type: VehicleType;
  status: VehicleStatus;

  station: string;
  county: string;

  fuelLevel: number;
  odometer: number;
  serviceDueKm: number;

  gpsStatus: GPSStatus;

  latitude?: number;
  longitude?: number;

  currentDeployment?: string;

  insuranceExpiry: string;
  inspectionExpiry: string;

  lastServiceDate: string;
  nextServiceDate: string;

  createdAt: string;
};

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

  certifications: string[];

  createdAt: string;
};

type Responder = {
  id: string;

  name: string;

  role: string;

  status:
    | "Available"
    | "Deployed"
    | "Off Duty";
};

type FleetAssignment = {
  id: string;

  vehicleId: string;
  driverId: string;

  crewIds: string[];

  shiftStart: string;
  shiftEnd: string;

  startedAt?: string;
  completedAt?: string;

  incidentReference?: string;

  status: AssignmentStatus;
};

type MaintenanceRecord = {
  id: string;

  vehicleId: string;

  type: string;

  description: string;

  scheduledDate: string;

  provider: string;

  cost: number;

  status: MaintenanceStatus;

  completedDate?: string;
};

type InspectionRecord = {
  id: string;

  vehicleId: string;

  inspector: string;

  date: string;

  brakes: boolean;
  tyres: boolean;
  lights: boolean;
  siren: boolean;

  medicalEquipment: boolean;

  fuelChecked: boolean;

  notes: string;

  status: InspectionStatus;
};

type FuelTransaction = {
  id: string;

  vehicleId: string;

  litres: number;

  amount: number;

  odometer: number;

  station: string;

  recordedBy: string;

  date: string;
};

/* =========================================================
   INITIAL VEHICLES
========================================================= */

const initialVehicles: Vehicle[] = [
  {
    id: "V-001",

    fleetNumber: "KRCS-AMB-007",
    registration: "KDA 207A",

    type: "Ambulance",

    status: "Available",

    station: "Nyali Response Unit",
    county: "Mombasa",

    fuelLevel: 86,

    odometer: 48210,

    serviceDueKm: 50000,

    gpsStatus: "Online",

    latitude: -4.0365,
    longitude: 39.7011,

    insuranceExpiry: "2027-02-15",

    inspectionExpiry: "2026-12-20",

    lastServiceDate: "2026-07-10",

    nextServiceDate: "2026-09-10",

    createdAt: "2026-01-10",
  },

  {
    id: "V-002",

    fleetNumber: "KRCS-RSC-002",
    registration: "KDB 502R",

    type: "Rescue Vehicle",

    status: "Assigned",

    station: "Mombasa Operations Centre",
    county: "Mombasa",

    fuelLevel: 72,

    odometer: 61300,

    serviceDueKm: 65000,

    gpsStatus: "Online",

    latitude: -4.0435,
    longitude: 39.6682,

    currentDeployment: "KRCS-2026-004",

    insuranceExpiry: "2026-11-12",

    inspectionExpiry: "2026-10-01",

    lastServiceDate: "2026-06-28",

    nextServiceDate: "2026-08-28",

    createdAt: "2026-01-20",
  },

  {
    id: "V-003",

    fleetNumber: "KRCS-LOG-004",
    registration: "KCZ 404L",

    type: "Logistics Truck",

    status: "En Route",

    station: "Kisauni Relief Centre",
    county: "Mombasa",

    fuelLevel: 58,

    odometer: 79850,

    serviceDueKm: 82000,

    gpsStatus: "Online",

    currentDeployment: "KRCS-2026-003",

    insuranceExpiry: "2026-12-30",

    inspectionExpiry: "2026-09-15",

    lastServiceDate: "2026-07-02",

    nextServiceDate: "2026-09-02",

    createdAt: "2026-02-04",
  },

  {
    id: "V-004",

    fleetNumber: "KRCS-AMB-011",
    registration: "KDE 811M",

    type: "Ambulance",

    status: "Available",

    station: "Likoni Response Unit",
    county: "Mombasa",

    fuelLevel: 94,

    odometer: 36120,

    serviceDueKm: 40000,

    gpsStatus: "Online",

    insuranceExpiry: "2027-03-20",

    inspectionExpiry: "2027-01-10",

    lastServiceDate: "2026-07-18",

    nextServiceDate: "2026-09-18",

    createdAt: "2026-03-01",
  },
];

/* =========================================================
   DRIVERS
========================================================= */

const initialDrivers: Driver[] = [
  {
    id: "DRV-001",

    fullName: "James Otieno",

    phone: "+254 700 221 001",

    email:
      "james.otieno@example.org",

    licenceNumber:
      "DL-KRCS-001",

    licenceClass: "BCE",

    licenceExpiry: "2027-04-30",

    station: "Nyali Response Unit",

    status: "Available",

    certifications: [
      "Emergency Vehicle Driving",
      "First Aid",
    ],

    createdAt: "2026-01-10",
  },

  {
    id: "DRV-002",

    fullName: "Brian Kamau",

    phone: "+254 700 221 002",

    email:
      "brian.kamau@example.org",

    licenceNumber:
      "DL-KRCS-002",

    licenceClass: "BCE",

    licenceExpiry: "2027-01-18",

    station:
      "Mombasa Operations Centre",

    status: "Assigned",

    certifications: [
      "Rescue Vehicle Operations",
      "Defensive Driving",
    ],

    createdAt: "2026-01-14",
  },

  {
    id: "DRV-003",

    fullName: "Fatuma Noor",

    phone: "+254 700 221 004",

    email:
      "fatuma.noor@example.org",

    licenceNumber:
      "DL-KRCS-003",

    licenceClass: "BCE",

    licenceExpiry: "2028-03-14",

    station: "Likoni Response Unit",

    status: "Available",

    certifications: [
      "Emergency Vehicle Driving",
      "First Aid",
    ],

    createdAt: "2026-02-10",
  },
];

/* =========================================================
   RESPONDERS
========================================================= */

const responders: Responder[] = [
  {
    id: "RESP-001",

    name: "Dr. Amina Hassan",

    role: "Paramedic",

    status: "Available",
  },

  {
    id: "RESP-002",

    name: "Peter Mwangi",

    role: "Rescue Officer",

    status: "Available",
  },

  {
    id: "RESP-003",

    name: "Grace Wanjiku",

    role: "Relief Officer",

    status: "Available",
  },

  {
    id: "RESP-004",

    name: "Ali Mohamed",

    role: "Volunteer",

    status: "Available",
  },

  {
    id: "RESP-005",

    name: "Faith Atieno",

    role: "Nurse",

    status: "Available",
  },
];

/* =========================================================
   ASSIGNMENTS
========================================================= */

const initialAssignments: FleetAssignment[] = [
  {
    id: "ASG-001",

    vehicleId: "V-002",

    driverId: "DRV-002",

    crewIds: [
      "RESP-001",
      "RESP-002",
    ],

    shiftStart: "07:00",

    shiftEnd: "19:00",

    startedAt:
      "2026-08-11T07:00:00",

    incidentReference:
      "KRCS-2026-004",

    status: "Active",
  },
];

/* =========================================================
   MAINTENANCE
========================================================= */

const initialMaintenance: MaintenanceRecord[] = [
  {
    id: "MNT-001",

    vehicleId: "V-003",

    type: "Routine Service",

    description:
      "Oil, filters, brake inspection and fluid levels.",

    scheduledDate:
      "2026-08-20",

    provider:
      "KRCS Fleet Workshop",

    cost: 18500,

    status: "Scheduled",
  },
];

/* =========================================================
   INSPECTIONS
========================================================= */

const initialInspections: InspectionRecord[] = [
  {
    id: "INS-001",

    vehicleId: "V-001",

    inspector:
      "Fleet Supervisor",

    date: "2026-08-11",

    brakes: true,

    tyres: true,

    lights: true,

    siren: true,

    medicalEquipment: true,

    fuelChecked: true,

    notes:
      "Vehicle ready for emergency deployment.",

    status: "Passed",
  },
];

/* =========================================================
   FUEL
========================================================= */

const initialFuelTransactions: FuelTransaction[] = [
  {
    id: "FUEL-001",

    vehicleId: "V-001",

    litres: 45,

    amount: 8100,

    odometer: 48150,

    station: "Nyali Fuel Station",

    recordedBy:
      "Fleet Supervisor",

    date: "2026-08-10",
  },
];

/* =========================================================
   HELPERS
========================================================= */

function vehicleIcon(
  type: VehicleType
) {
  switch (type) {
    case "Ambulance":
      return <FaAmbulance />;

    case "Rescue Vehicle":
      return <FaCar />;

    case "Logistics Truck":
      return <FaTruck />;

    default:
      return <FaCar />;
  }
}

function vehicleColor(
  type: VehicleType
) {
  switch (type) {
    case "Ambulance":
      return "bg-red-100 text-red-700";

    case "Rescue Vehicle":
      return "bg-orange-100 text-orange-700";

    case "Logistics Truck":
      return "bg-blue-100 text-blue-700";

    default:
      return "bg-slate-100 text-slate-700";
  }
}

function formatDuration(
  startedAt?: string
) {
  if (!startedAt) {
    return "Not started";
  }

  const start =
    new Date(startedAt).getTime();

  const difference =
    Math.max(
      0,
      Date.now() - start
    );

  const totalMinutes =
    Math.floor(
      difference / 60000
    );

  const hours =
    Math.floor(
      totalMinutes / 60
    );

  const minutes =
    totalMinutes % 60;

  return `${hours}h ${minutes}m`;
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function RedCrossVehicles() {
  const navigate = useNavigate();

  const [
    activeTab,
    setActiveTab,
  ] =
    useState<FleetTab>("overview");

  const [vehicles, setVehicles] =
    useState<Vehicle[]>(() => {
      const saved =
        localStorage.getItem(
          "jamii-redcross-fleet"
        );

      return saved
        ? JSON.parse(saved)
        : initialVehicles;
    });

  const [drivers, setDrivers] =
    useState<Driver[]>(() => {
      const saved =
        localStorage.getItem(
          "jamii-redcross-drivers"
        );

      return saved
        ? JSON.parse(saved)
        : initialDrivers;
    });

  const [
    assignments,
    setAssignments,
  ] =
    useState<FleetAssignment[]>(() => {
      const saved =
        localStorage.getItem(
          "jamii-redcross-assignments"
        );

      return saved
        ? JSON.parse(saved)
        : initialAssignments;
    });

  const [
    maintenance,
    setMaintenance,
  ] =
    useState<MaintenanceRecord[]>(() => {
      const saved =
        localStorage.getItem(
          "jamii-redcross-maintenance"
        );

      return saved
        ? JSON.parse(saved)
        : initialMaintenance;
    });

  const [
    inspections,
    setInspections,
  ] =
    useState<InspectionRecord[]>(() => {
      const saved =
        localStorage.getItem(
          "jamii-redcross-inspections"
        );

      return saved
        ? JSON.parse(saved)
        : initialInspections;
    });

  const [
    fuelTransactions,
    setFuelTransactions,
  ] =
    useState<FuelTransaction[]>(() => {
      const saved =
        localStorage.getItem(
          "jamii-redcross-fuel"
        );

      return saved
        ? JSON.parse(saved)
        : initialFuelTransactions;
    });

  const [, setClock] =
    useState(Date.now());

  const [search, setSearch] =
    useState("");

  const [
    statusFilter,
    setStatusFilter,
  ] =
    useState("all");

  const [
    selectedVehicle,
    setSelectedVehicle,
  ] =
    useState<Vehicle | null>(null);

  const [
    selectedDriver,
    setSelectedDriver,
  ] =
    useState<Driver | null>(null);

  const [
    vehicleModalOpen,
    setVehicleModalOpen,
  ] =
    useState(false);

  const [
    driverModalOpen,
    setDriverModalOpen,
  ] =
    useState(false);

  const [
    assignmentModalOpen,
    setAssignmentModalOpen,
  ] =
    useState(false);

  const [
    maintenanceModalOpen,
    setMaintenanceModalOpen,
  ] =
    useState(false);

  const [
    inspectionModalOpen,
    setInspectionModalOpen,
  ] =
    useState(false);

  const [
    fuelModalOpen,
    setFuelModalOpen,
  ] =
    useState(false);

  /* ======================================================
     FORM STATE
  ====================================================== */

  const [
    newVehicle,
    setNewVehicle,
  ] = useState({
    fleetNumber: "",

    registration: "",

    type:
      "Ambulance" as VehicleType,

    station: "",

    county: "Mombasa",

    fuelLevel: "100",

    odometer: "0",

    serviceDueKm: "5000",

    insuranceExpiry: "",

    inspectionExpiry: "",
  });

  const [
    newDriver,
    setNewDriver,
  ] = useState({
    fullName: "",

    phone: "",

    email: "",

    licenceNumber: "",

    licenceClass: "",

    licenceExpiry: "",

    station: "",

    certifications: "",
  });

  const [
    newAssignment,
    setNewAssignment,
  ] = useState({
    vehicleId: "",

    driverId: "",

    crewIds:
      [] as string[],

    shiftStart: "",

    shiftEnd: "",

    incidentReference: "",
  });

  const [
    newMaintenance,
    setNewMaintenance,
  ] = useState({
    vehicleId: "",

    type: "",

    description: "",

    scheduledDate: "",

    provider: "",

    cost: "",
  });

  const [
    newInspection,
    setNewInspection,
  ] = useState({
    vehicleId: "",

    inspector: "",

    date: "",

    brakes: true,

    tyres: true,

    lights: true,

    siren: true,

    medicalEquipment: true,

    fuelChecked: true,

    notes: "",
  });

  const [
    newFuel,
    setNewFuel,
  ] = useState({
    vehicleId: "",

    litres: "",

    amount: "",

    odometer: "",

    station: "",

    recordedBy: "",
  });

  /* ======================================================
     PERSISTENCE
  ====================================================== */

  useEffect(() => {
    const timer =
      window.setInterval(() => {
        setClock(Date.now());
      }, 60000);

    return () =>
      window.clearInterval(timer);
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "jamii-redcross-fleet",
      JSON.stringify(vehicles)
    );
  }, [vehicles]);

  useEffect(() => {
    localStorage.setItem(
      "jamii-redcross-drivers",
      JSON.stringify(drivers)
    );
  }, [drivers]);

  useEffect(() => {
    localStorage.setItem(
      "jamii-redcross-assignments",
      JSON.stringify(assignments)
    );
  }, [assignments]);

  useEffect(() => {
    localStorage.setItem(
      "jamii-redcross-maintenance",
      JSON.stringify(maintenance)
    );
  }, [maintenance]);

  useEffect(() => {
    localStorage.setItem(
      "jamii-redcross-inspections",
      JSON.stringify(inspections)
    );
  }, [inspections]);

  useEffect(() => {
    localStorage.setItem(
      "jamii-redcross-fuel",
      JSON.stringify(
        fuelTransactions
      )
    );
  }, [fuelTransactions]);

  /* ======================================================
     LOOKUPS
  ====================================================== */

  function vehicleName(
    vehicleId: string
  ) {
    const vehicle =
      vehicles.find(
        (item) =>
          item.id === vehicleId
      );

    return vehicle
      ? `${vehicle.fleetNumber} · ${vehicle.registration}`
      : "Unknown Vehicle";
  }

  function driverName(
    driverId: string
  ) {
    return (
      drivers.find(
        (driver) =>
          driver.id === driverId
      )?.fullName ||
      "Unknown Driver"
    );
  }

  function crewNames(
    crewIds: string[]
  ) {
    return crewIds
      .map(
        (id) =>
          responders.find(
            (responder) =>
              responder.id === id
          )?.name
      )
      .filter(Boolean)
      .join(", ");
  }

  /* ======================================================
     FILTERING
  ====================================================== */

  const filteredVehicles =
    useMemo(() => {
      const value =
        search
          .trim()
          .toLowerCase();

      return vehicles.filter(
        (vehicle) => {
          const searchMatches =
            !value ||
            vehicle.fleetNumber
              .toLowerCase()
              .includes(value) ||
            vehicle.registration
              .toLowerCase()
              .includes(value) ||
            vehicle.type
              .toLowerCase()
              .includes(value) ||
            vehicle.station
              .toLowerCase()
              .includes(value);

          const statusMatches =
            statusFilter === "all" ||
            vehicle.status ===
              statusFilter;

          return (
            searchMatches &&
            statusMatches
          );
        }
      );
    }, [
      vehicles,
      search,
      statusFilter,
    ]);

  const filteredDrivers =
    useMemo(() => {
      const value =
        search
          .trim()
          .toLowerCase();

      return drivers.filter(
        (driver) =>
          !value ||
          driver.fullName
            .toLowerCase()
            .includes(value) ||
          driver.licenceNumber
            .toLowerCase()
            .includes(value) ||
          driver.station
            .toLowerCase()
            .includes(value)
      );
    }, [drivers, search]);

  const availableVehicles =
    vehicles.filter(
      (vehicle) =>
        vehicle.status ===
        "Available"
    );

  const availableDrivers =
    drivers.filter(
      (driver) =>
        driver.status ===
        "Available"
    );

  const activeAssignments =
    assignments.filter(
      (assignment) =>
        assignment.status ===
        "Active"
    );

  /* ======================================================
     KPI
  ====================================================== */

  const stats = useMemo(
    () => ({
      total:
        vehicles.length,

      available:
        vehicles.filter(
          (vehicle) =>
            vehicle.status ===
            "Available"
        ).length,

      deployed:
        vehicles.filter(
          (vehicle) =>
            [
              "Assigned",
              "En Route",
              "On Scene",
            ].includes(
              vehicle.status
            )
        ).length,

      maintenance:
        vehicles.filter(
          (vehicle) =>
            vehicle.status ===
            "Maintenance"
        ).length,

      drivers:
        drivers.length,

      activeAssignments:
        activeAssignments.length,

      gpsOnline:
        vehicles.filter(
          (vehicle) =>
            vehicle.gpsStatus ===
            "Online"
        ).length,

      lowFuel:
        vehicles.filter(
          (vehicle) =>
            vehicle.fuelLevel <= 30
        ).length,
    }),
    [
      vehicles,
      drivers,
      activeAssignments,
    ]
  );

  /* ======================================================
     CRUD
  ====================================================== */

  function registerVehicle() {
    if (
      !newVehicle.fleetNumber ||
      !newVehicle.registration ||
      !newVehicle.station
    ) {
      window.alert(
        "Fleet number, registration and station are required."
      );

      return;
    }

    const vehicle: Vehicle = {
      id: `V-${String(
        vehicles.length + 1
      ).padStart(
        3,
        "0"
      )}`,

      fleetNumber:
        newVehicle.fleetNumber,

      registration:
        newVehicle.registration,

      type:
        newVehicle.type,

      status:
        "Available",

      station:
        newVehicle.station,

      county:
        newVehicle.county,

      fuelLevel:
        Number(
          newVehicle.fuelLevel
        ),

      odometer:
        Number(
          newVehicle.odometer
        ),

      serviceDueKm:
        Number(
          newVehicle.serviceDueKm
        ),

      gpsStatus:
        "Offline",

      insuranceExpiry:
        newVehicle.insuranceExpiry,

      inspectionExpiry:
        newVehicle.inspectionExpiry,

      lastServiceDate: "",

      nextServiceDate: "",

      createdAt:
        new Date()
          .toISOString()
          .slice(
            0,
            10
          ),
    };

    setVehicles(
      (current) => [
        vehicle,
        ...current,
      ]
    );

    setVehicleModalOpen(
      false
    );
  }

  function registerDriver() {
    if (
      !newDriver.fullName ||
      !newDriver.phone ||
      !newDriver.licenceNumber
    ) {
      window.alert(
        "Driver name, phone and licence number are required."
      );

      return;
    }

    const driver: Driver = {
      id: `DRV-${String(
        drivers.length + 1
      ).padStart(
        3,
        "0"
      )}`,

      fullName:
        newDriver.fullName,

      phone:
        newDriver.phone,

      email:
        newDriver.email,

      licenceNumber:
        newDriver.licenceNumber,

      licenceClass:
        newDriver.licenceClass,

      licenceExpiry:
        newDriver.licenceExpiry,

      station:
        newDriver.station,

      status:
        "Available",

      certifications:
        newDriver.certifications
          .split(",")
          .map(
            (item) =>
              item.trim()
          )
          .filter(Boolean),

      createdAt:
        new Date()
          .toISOString()
          .slice(
            0,
            10
          ),
    };

    setDrivers(
      (current) => [
        driver,
        ...current,
      ]
    );

    setDriverModalOpen(
      false
    );
  }

  function createAssignment() {
    if (
      !newAssignment.vehicleId ||
      !newAssignment.driverId ||
      !newAssignment.shiftStart ||
      !newAssignment.shiftEnd
    ) {
      window.alert(
        "Vehicle, driver and shift times are required."
      );

      return;
    }

    const vehicleBusy =
      activeAssignments.some(
        (assignment) =>
          assignment.vehicleId ===
          newAssignment.vehicleId
      );

    const driverBusy =
      activeAssignments.some(
        (assignment) =>
          assignment.driverId ===
          newAssignment.driverId
      );

    if (
      vehicleBusy ||
      driverBusy
    ) {
      window.alert(
        "The driver or vehicle already has an active assignment."
      );

      return;
    }

    const assignment: FleetAssignment = {
      id: `ASG-${String(
        assignments.length + 1
      ).padStart(
        3,
        "0"
      )}`,

      vehicleId:
        newAssignment.vehicleId,

      driverId:
        newAssignment.driverId,

      crewIds:
        newAssignment.crewIds,

      shiftStart:
        newAssignment.shiftStart,

      shiftEnd:
        newAssignment.shiftEnd,

      startedAt:
        new Date().toISOString(),

      incidentReference:
        newAssignment.incidentReference ||
        undefined,

      status:
        "Active",
    };

    setAssignments(
      (current) => [
        assignment,
        ...current,
      ]
    );

    setVehicles(
      (current) =>
        current.map(
          (vehicle) =>
            vehicle.id ===
            assignment.vehicleId
              ? {
                  ...vehicle,

                  status:
                    "Assigned",

                  currentDeployment:
                    assignment.incidentReference,
                }
              : vehicle
        )
    );

    setDrivers(
      (current) =>
        current.map(
          (driver) =>
            driver.id ===
            assignment.driverId
              ? {
                  ...driver,

                  status:
                    "Assigned",
                }
              : driver
        )
    );

    setAssignmentModalOpen(
      false
    );
  }

  function endAssignment(
    assignment: FleetAssignment
  ) {
    setAssignments(
      (current) =>
        current.map(
          (item) =>
            item.id ===
            assignment.id
              ? {
                  ...item,

                  status:
                    "Completed",

                  completedAt:
                    new Date().toISOString(),
                }
              : item
        )
    );

    setVehicles(
      (current) =>
        current.map(
          (vehicle) =>
            vehicle.id ===
            assignment.vehicleId
              ? {
                  ...vehicle,

                  status:
                    "Available",

                  currentDeployment:
                    undefined,
                }
              : vehicle
        )
    );

    setDrivers(
      (current) =>
        current.map(
          (driver) =>
            driver.id ===
            assignment.driverId
              ? {
                  ...driver,

                  status:
                    "Available",
                }
              : driver
        )
    );
  }

  function createMaintenance() {
    if (
      !newMaintenance.vehicleId ||
      !newMaintenance.type ||
      !newMaintenance.scheduledDate
    ) {
      return;
    }

    const record: MaintenanceRecord = {
      id: `MNT-${String(
        maintenance.length + 1
      ).padStart(
        3,
        "0"
      )}`,

      vehicleId:
        newMaintenance.vehicleId,

      type:
        newMaintenance.type,

      description:
        newMaintenance.description,

      scheduledDate:
        newMaintenance.scheduledDate,

      provider:
        newMaintenance.provider,

      cost:
        Number(
          newMaintenance.cost
        ) || 0,

      status:
        "Scheduled",
    };

    setMaintenance(
      (current) => [
        record,
        ...current,
      ]
    );

    setVehicles(
      (current) =>
        current.map(
          (vehicle) =>
            vehicle.id ===
            record.vehicleId
              ? {
                  ...vehicle,

                  status:
                    "Maintenance",
                }
              : vehicle
        )
    );

    setMaintenanceModalOpen(
      false
    );
  }

  function completeMaintenance(
    record: MaintenanceRecord
  ) {
    setMaintenance(
      (current) =>
        current.map(
          (item) =>
            item.id ===
            record.id
              ? {
                  ...item,

                  status:
                    "Completed",

                  completedDate:
                    new Date()
                      .toISOString()
                      .slice(
                        0,
                        10
                      ),
                }
              : item
        )
    );

    setVehicles(
      (current) =>
        current.map(
          (vehicle) =>
            vehicle.id ===
            record.vehicleId
              ? {
                  ...vehicle,

                  status:
                    "Available",

                  lastServiceDate:
                    new Date()
                      .toISOString()
                      .slice(
                        0,
                        10
                      ),

                  serviceDueKm:
                    vehicle.odometer +
                    5000,
                }
              : vehicle
        )
    );
  }

  function createInspection() {
    if (
      !newInspection.vehicleId ||
      !newInspection.inspector ||
      !newInspection.date
    ) {
      return;
    }

    const checks = [
      newInspection.brakes,

      newInspection.tyres,

      newInspection.lights,

      newInspection.siren,

      newInspection.medicalEquipment,

      newInspection.fuelChecked,
    ];

    const failures =
      checks.filter(
        (check) => !check
      ).length;

    const status: InspectionStatus =
      failures === 0
        ? "Passed"
        : failures <= 2
          ? "Attention Required"
          : "Failed";

    const record: InspectionRecord = {
      id: `INS-${String(
        inspections.length + 1
      ).padStart(
        3,
        "0"
      )}`,

      vehicleId:
        newInspection.vehicleId,

      inspector:
        newInspection.inspector,

      date:
        newInspection.date,

      brakes:
        newInspection.brakes,

      tyres:
        newInspection.tyres,

      lights:
        newInspection.lights,

      siren:
        newInspection.siren,

      medicalEquipment:
        newInspection.medicalEquipment,

      fuelChecked:
        newInspection.fuelChecked,

      notes:
        newInspection.notes,

      status,
    };

    setInspections(
      (current) => [
        record,
        ...current,
      ]
    );

    if (
      status ===
      "Failed"
    ) {
      setVehicles(
        (current) =>
          current.map(
            (vehicle) =>
              vehicle.id ===
              record.vehicleId
                ? {
                    ...vehicle,

                    status:
                      "Maintenance",
                  }
                : vehicle
          )
      );
    }

    setInspectionModalOpen(
      false
    );
  }

  function recordFuel() {
    if (
      !newFuel.vehicleId ||
      !newFuel.litres
    ) {
      return;
    }

    const transaction: FuelTransaction = {
      id: `FUEL-${String(
        fuelTransactions.length + 1
      ).padStart(
        3,
        "0"
      )}`,

      vehicleId:
        newFuel.vehicleId,

      litres:
        Number(
          newFuel.litres
        ),

      amount:
        Number(
          newFuel.amount
        ) || 0,

      odometer:
        Number(
          newFuel.odometer
        ) || 0,

      station:
        newFuel.station,

      recordedBy:
        newFuel.recordedBy,

      date:
        new Date()
          .toISOString()
          .slice(
            0,
            10
          ),
    };

    setFuelTransactions(
      (current) => [
        transaction,
        ...current,
      ]
    );

    setVehicles(
      (current) =>
        current.map(
          (vehicle) =>
            vehicle.id ===
            transaction.vehicleId
              ? {
                  ...vehicle,

                  fuelLevel:
                    100,

                  odometer:
                    Math.max(
                      vehicle.odometer,
                      transaction.odometer
                    ),
                }
              : vehicle
        )
    );

    setFuelModalOpen(
      false
    );
  }

  /* ======================================================
     REPORT DEFINITIONS
  ====================================================== */

  const vehicleReportColumns:
    ReportColumn<Vehicle>[] = [
      {
        label: "Fleet Number",

        value: (vehicle) =>
          vehicle.fleetNumber,
      },

      {
        label: "Registration",

        value: (vehicle) =>
          vehicle.registration,
      },

      {
        label: "Type",

        value: (vehicle) =>
          vehicle.type,
      },

      {
        label: "Status",

        value: (vehicle) =>
          vehicle.status,
      },

      {
        label: "Station",

        value: (vehicle) =>
          vehicle.station,
      },

      {
        label: "County",

        value: (vehicle) =>
          vehicle.county,
      },

      {
        label: "Fuel %",

        value: (vehicle) =>
          vehicle.fuelLevel,
      },

      {
        label: "Odometer",

        value: (vehicle) =>
          vehicle.odometer,
      },

      {
        label: "GPS",

        value: (vehicle) =>
          vehicle.gpsStatus,
      },

      {
        label: "Deployment",

        value: (vehicle) =>
          vehicle.currentDeployment ||
          "Standby",
      },
    ];

  const driverReportColumns:
    ReportColumn<Driver>[] = [
      {
        label: "Driver ID",

        value: (driver) =>
          driver.id,
      },

      {
        label: "Driver",

        value: (driver) =>
          driver.fullName,
      },

      {
        label: "Phone",

        value: (driver) =>
          driver.phone,
      },

      {
        label: "Licence",

        value: (driver) =>
          driver.licenceNumber,
      },

      {
        label: "Class",

        value: (driver) =>
          driver.licenceClass,
      },

      {
        label: "Licence Expiry",

        value: (driver) =>
          driver.licenceExpiry,
      },

      {
        label: "Station",

        value: (driver) =>
          driver.station,
      },

      {
        label: "Status",

        value: (driver) =>
          driver.status,
      },
    ];

  const assignmentReportColumns:
    ReportColumn<FleetAssignment>[] = [
      {
        label: "Assignment",

        value: (assignment) =>
          assignment.id,
      },

      {
        label: "Vehicle",

        value: (assignment) =>
          vehicleName(
            assignment.vehicleId
          ),
      },

      {
        label: "Driver",

        value: (assignment) =>
          driverName(
            assignment.driverId
          ),
      },

      {
        label: "Crew",

        value: (assignment) =>
          crewNames(
            assignment.crewIds
          ) ||
          "No Crew",
      },

      {
        label: "Shift Start",

        value: (assignment) =>
          assignment.shiftStart,
      },

      {
        label: "Shift End",

        value: (assignment) =>
          assignment.shiftEnd,
      },

      {
        label: "Incident",

        value: (assignment) =>
          assignment.incidentReference ||
          "Standby",
      },

      {
        label: "Status",

        value: (assignment) =>
          assignment.status,
      },
    ];

  const maintenanceReportColumns:
    ReportColumn<MaintenanceRecord>[] = [
      {
        label: "Record",

        value: (record) =>
          record.id,
      },

      {
        label: "Vehicle",

        value: (record) =>
          vehicleName(
            record.vehicleId
          ),
      },

      {
        label: "Type",

        value: (record) =>
          record.type,
      },

      {
        label: "Scheduled",

        value: (record) =>
          record.scheduledDate,
      },

      {
        label: "Provider",

        value: (record) =>
          record.provider,
      },

      {
        label: "Cost KES",

        value: (record) =>
          record.cost,
      },

      {
        label: "Status",

        value: (record) =>
          record.status,
      },
    ];

  const inspectionReportColumns:
    ReportColumn<InspectionRecord>[] = [
      {
        label: "Inspection",

        value: (inspection) =>
          inspection.id,
      },

      {
        label: "Vehicle",

        value: (inspection) =>
          vehicleName(
            inspection.vehicleId
          ),
      },

      {
        label: "Inspector",

        value: (inspection) =>
          inspection.inspector,
      },

      {
        label: "Date",

        value: (inspection) =>
          inspection.date,
      },

      {
        label: "Brakes",

        value: (inspection) =>
          inspection.brakes,
      },

      {
        label: "Tyres",

        value: (inspection) =>
          inspection.tyres,
      },

      {
        label: "Lights",

        value: (inspection) =>
          inspection.lights,
      },

      {
        label: "Siren",

        value: (inspection) =>
          inspection.siren,
      },

      {
        label: "Medical Equipment",

        value: (inspection) =>
          inspection.medicalEquipment,
      },

      {
        label: "Status",

        value: (inspection) =>
          inspection.status,
      },
    ];

  function reportActions() {
    switch (activeTab) {
      case "vehicles":
        return (
          <ReportActions
            title="Kenya Red Cross Vehicle Registry Report"
            subtitle="Registered ambulances, rescue vehicles and operational fleet."
            fileName="red-cross-vehicle-registry"
            data={filteredVehicles}
            columns={vehicleReportColumns}
          />
        );

      case "drivers":
        return (
          <ReportActions
            title="Kenya Red Cross Driver Registry Report"
            subtitle="Registered drivers and fleet licence records."
            fileName="red-cross-driver-registry"
            data={filteredDrivers}
            columns={driverReportColumns}
          />
        );

      case "assignments":
        return (
          <ReportActions
            title="Kenya Red Cross Fleet Assignment Report"
            subtitle="Vehicle, driver, crew and operational shift assignments."
            fileName="red-cross-fleet-assignments"
            data={assignments}
            columns={assignmentReportColumns}
          />
        );

      case "maintenance":
        return (
          <ReportActions
            title="Kenya Red Cross Fleet Maintenance Report"
            subtitle="Vehicle servicing, repairs and maintenance history."
            fileName="red-cross-fleet-maintenance"
            data={maintenance}
            columns={maintenanceReportColumns}
          />
        );

      case "inspections":
        return (
          <ReportActions
            title="Kenya Red Cross Vehicle Inspection Report"
            subtitle="Vehicle safety and operational readiness inspections."
            fileName="red-cross-fleet-inspections"
            data={inspections}
            columns={inspectionReportColumns}
          />
        );

      default:
        return (
          <ReportActions
            title="Kenya Red Cross Fleet Operations Report"
            subtitle="Fleet operational overview and registered vehicles."
            fileName="red-cross-fleet-operations"
            data={vehicles}
            columns={vehicleReportColumns}
          />
        );
    }
  }

  /* ======================================================
     TABS
  ====================================================== */

  const tabs: {
    id: FleetTab;

    label: string;

    icon: ReactNode;
  }[] = [
    {
      id: "overview",

      label: "Overview",

      icon:
        <FaAmbulance />,
    },

    {
      id: "vehicles",

      label:
        "Vehicle Registry",

      icon:
        <FaTruck />,
    },

    {
      id: "drivers",

      label:
        "Driver Registry",

      icon:
        <FaIdCard />,
    },

    {
      id: "assignments",

      label:
        "Assignments",

      icon:
        <FaUsersCog />,
    },

    {
      id: "maintenance",

      label:
        "Maintenance",

      icon:
        <FaWrench />,
    },

    {
      id: "inspections",

      label:
        "Inspections",

      icon:
        <FaClipboardCheck />,
    },
  ];

  return (
    <div className="space-y-7">
      <PageHeader
        title="Fleet Operations"
        subtitle="Manage ambulances, rescue vehicles, drivers, crews, shifts, assignments, maintenance, fuel, GPS and inspections."
        icon={<FaAmbulance />}
        badge="Fleet Command"
        badgeColor="red"
        actions={reportActions()}
      />

      {/* ===================================================
          TABS
      =================================================== */}

      <section className="rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
        <div className="flex gap-2 overflow-x-auto">
          {tabs.map(
            (tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveTab(
                    tab.id
                  );

                  setSearch("");

                  setStatusFilter(
                    "all"
                  );
                }}
                className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition ${
                  activeTab ===
                  tab.id
                    ? "bg-red-600 text-white"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                }`}
              >
                {tab.icon}

                {tab.label}
              </button>
            )
          )}
        </div>
      </section>

      {/* ===================================================
          OVERVIEW
      =================================================== */}

      {activeTab ===
        "overview" && (
        <>
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Metric
              title="Registered Fleet"
              value={stats.total}
              icon={<FaTruck />}
            />

            <Metric
              title="Available"
              value={stats.available}
              icon={
                <FaCheckCircle />
              }
            />

            <Metric
              title="Active Deployment"
              value={stats.deployed}
              icon={
                <FaMapMarkerAlt />
              }
            />

            <Metric
              title="Maintenance"
              value={
                stats.maintenance
              }
              icon={<FaTools />}
            />

            <Metric
              title="Drivers"
              value={stats.drivers}
              icon={<FaUser />}
            />

            <Metric
              title="Active Shifts"
              value={
                stats.activeAssignments
              }
              icon={<FaClock />}
            />

            <Metric
              title="GPS Online"
              value={`${stats.gpsOnline}/${stats.total}`}
              icon={
                <FaMapMarkedAlt />
              }
            />

            <Metric
              title="Low Fuel"
              value={stats.lowFuel}
              icon={
                <FaGasPump />
              }
            />
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 p-5">
                <h2 className="text-xl font-extrabold text-slate-950">
                  Active Fleet Shifts
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Vehicles, drivers and crews currently assigned.
                </p>
              </div>

              <div className="divide-y divide-slate-100">
                {activeAssignments.length ===
                0 ? (
                  <div className="p-8 text-center text-sm text-slate-500">
                    No active assignments.
                  </div>
                ) : (
                  activeAssignments.map(
                    (
                      assignment
                    ) => (
                      <div
                        key={
                          assignment.id
                        }
                        className="p-5"
                      >
                        <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
                          <div>
                            <p className="font-extrabold text-slate-950">
                              {vehicleName(
                                assignment.vehicleId
                              )}
                            </p>

                            <p className="mt-2 text-sm text-slate-600">
                              Driver:{" "}
                              {driverName(
                                assignment.driverId
                              )}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              Crew:{" "}
                              {crewNames(
                                assignment.crewIds
                              ) ||
                                "No crew assigned"}
                            </p>
                          </div>

                          <div>
                            <StatusBadge
                              status="Active"
                            />

                            <p className="mt-2 text-sm font-bold text-blue-700">
                              {formatDuration(
                                assignment.startedAt
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    )
                  )
                )}
              </div>
            </article>

            <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-extrabold text-slate-950">
                Quick Actions
              </h2>

              <div className="mt-5 grid gap-3">
                <QuickAction
                  label="Register Vehicle"
                  icon={<FaTruck />}
                  onClick={() =>
                    setVehicleModalOpen(
                      true
                    )
                  }
                />

                <QuickAction
                  label="Register Driver"
                  icon={<FaIdCard />}
                  onClick={() =>
                    setDriverModalOpen(
                      true
                    )
                  }
                />

                <QuickAction
                  label="Create Assignment"
                  icon={
                    <FaUsersCog />
                  }
                  onClick={() =>
                    setAssignmentModalOpen(
                      true
                    )
                  }
                />

                <QuickAction
                  label="Record Fuel"
                  icon={
                    <FaGasPump />
                  }
                  onClick={() =>
                    setFuelModalOpen(
                      true
                    )
                  }
                />
              </div>
            </article>
          </section>
        </>
      )}

      {/* ===================================================
          VEHICLES
      =================================================== */}

      {activeTab ===
        "vehicles" && (
        <>
          <Toolbar
            search={search}
            onSearch={setSearch}
            statusFilter={
              statusFilter
            }
            onStatus={
              setStatusFilter
            }
            button="Register Vehicle"
            onButton={() =>
              setVehicleModalOpen(
                true
              )
            }
          />

          <section className="grid gap-5 lg:grid-cols-2 2xl:grid-cols-3">
            {filteredVehicles.map(
              (vehicle) => (
                <article
                  key={vehicle.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex gap-4">
                    <div
                      className={`flex h-14 w-14 items-center justify-center rounded-2xl text-2xl ${vehicleColor(
                        vehicle.type
                      )}`}
                    >
                      {vehicleIcon(
                        vehicle.type
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-400">
                        {
                          vehicle.fleetNumber
                        }
                      </p>

                      <h2 className="mt-1 text-lg font-extrabold text-slate-950">
                        {
                          vehicle.registration
                        }
                      </h2>

                      <p className="text-sm text-slate-500">
                        {vehicle.type}
                      </p>

                      <div className="mt-3">
                        <StatusBadge
                          status={
                            vehicle.status
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <InfoCard
                      label="Fuel"
                      value={`${vehicle.fuelLevel}%`}
                      icon={
                        <FaGasPump />
                      }
                    />

                    <InfoCard
                      label="GPS"
                      value={
                        vehicle.gpsStatus
                      }
                      icon={
                        <FaMapMarkedAlt />
                      }
                    />
                  </div>

                  <div className="mt-4 space-y-2 rounded-xl bg-slate-50 p-4 text-sm">
                    <p>
                      Station:{" "}
                      <strong>
                        {vehicle.station}
                      </strong>
                    </p>

                    <p>
                      Odometer:{" "}
                      <strong>
                        {vehicle.odometer.toLocaleString()}{" "}
                        km
                      </strong>
                    </p>

                    <p>
                      Deployment:{" "}
                      <strong>
                        {vehicle.currentDeployment ||
                          "Standby"}
                      </strong>
                    </p>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          `/redcross/gis?vehicle=${vehicle.id}`
                        )
                      }
                      className="rounded-xl border border-slate-200 px-4 py-3 font-bold text-slate-700"
                    >
                      GIS
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setSelectedVehicle(
                          vehicle
                        )
                      }
                      className="flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 font-bold text-white"
                    >
                      <FaEdit />

                      Manage
                    </button>
                  </div>
                </article>
              )
            )}
          </section>
        </>
      )}

      {/* ===================================================
          DRIVERS
      =================================================== */}

      {activeTab ===
        "drivers" && (
        <>
          <Toolbar
            search={search}
            onSearch={setSearch}
            button="Register Driver"
            onButton={() =>
              setDriverModalOpen(
                true
              )
            }
          />

          <section className="grid gap-5 lg:grid-cols-2 2xl:grid-cols-3">
            {filteredDrivers.map(
              (driver) => (
                <article
                  key={driver.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 font-extrabold text-red-700">
                      {driver.fullName
                        .split(" ")
                        .map(
                          (word) =>
                            word[0]
                        )
                        .slice(
                          0,
                          2
                        )
                        .join("")}
                    </div>

                    <div>
                      <h2 className="font-extrabold text-slate-950">
                        {
                          driver.fullName
                        }
                      </h2>

                      <p className="text-xs text-slate-500">
                        {driver.id}
                      </p>

                      <div className="mt-2">
                        <StatusBadge
                          status={
                            driver.status
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 space-y-2 rounded-xl bg-slate-50 p-4 text-sm">
                    <p>
                      Licence:{" "}
                      <strong>
                        {
                          driver.licenceNumber
                        }
                      </strong>
                    </p>

                    <p>
                      Class:{" "}
                      <strong>
                        {
                          driver.licenceClass
                        }
                      </strong>
                    </p>

                    <p>
                      Expiry:{" "}
                      <strong>
                        {
                          driver.licenceExpiry
                        }
                      </strong>
                    </p>

                    <p>
                      Station:{" "}
                      <strong>
                        {
                          driver.station
                        }
                      </strong>
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setSelectedDriver(
                        driver
                      )
                    }
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 font-bold text-white"
                  >
                    <FaEdit />

                    Manage Driver
                  </button>
                </article>
              )
            )}
          </section>
        </>
      )}

      {/* ===================================================
          ASSIGNMENTS
      =================================================== */}

      {activeTab ===
        "assignments" && (
        <>
          <SectionHeader
            title="Driver, Vehicle & Crew Assignments"
            description="Assign drivers and response crews to fleet vehicles."
            button="New Assignment"
            onClick={() =>
              setAssignmentModalOpen(
                true
              )
            }
          />

          <DataTable>
            <thead>
              <tr>
                <TableHead>
                  Assignment
                </TableHead>

                <TableHead>
                  Vehicle
                </TableHead>

                <TableHead>
                  Driver
                </TableHead>

                <TableHead>
                  Crew
                </TableHead>

                <TableHead>
                  Shift
                </TableHead>

                <TableHead>
                  Incident
                </TableHead>

                <TableHead>
                  Status
                </TableHead>

                <TableHead>
                  Action
                </TableHead>
              </tr>
            </thead>

            <tbody>
              {assignments.map(
                (
                  assignment
                ) => (
                  <tr
                    key={
                      assignment.id
                    }
                    className="border-t border-slate-100"
                  >
                    <TableCell>
                      {
                        assignment.id
                      }
                    </TableCell>

                    <TableCell>
                      {vehicleName(
                        assignment.vehicleId
                      )}
                    </TableCell>

                    <TableCell>
                      {driverName(
                        assignment.driverId
                      )}
                    </TableCell>

                    <TableCell>
                      {crewNames(
                        assignment.crewIds
                      ) ||
                        "No Crew"}
                    </TableCell>

                    <TableCell>
                      {
                        assignment.shiftStart
                      }{" "}
                      -{" "}
                      {
                        assignment.shiftEnd
                      }
                    </TableCell>

                    <TableCell>
                      {assignment.incidentReference ||
                        "Standby"}
                    </TableCell>

                    <TableCell>
                      <StatusBadge
                        status={
                          assignment.status
                        }
                      />
                    </TableCell>

                    <TableCell>
                      {assignment.status ===
                        "Active" && (
                        <button
                          type="button"
                          onClick={() =>
                            endAssignment(
                              assignment
                            )
                          }
                          className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white"
                        >
                          End Shift
                        </button>
                      )}
                    </TableCell>
                  </tr>
                )
              )}
            </tbody>
          </DataTable>
        </>
      )}

      {/* ===================================================
          MAINTENANCE
      =================================================== */}

      {activeTab ===
        "maintenance" && (
        <>
          <SectionHeader
            title="Fleet Maintenance"
            description="Schedule vehicle servicing, repairs and workshop operations."
            button="Schedule Maintenance"
            onClick={() =>
              setMaintenanceModalOpen(
                true
              )
            }
          />

          <section className="grid gap-5 lg:grid-cols-2">
            {maintenance.map(
              (record) => (
                <article
                  key={record.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex justify-between gap-4">
                    <div>
                      <p className="text-xs text-slate-400">
                        {record.id}
                      </p>

                      <h2 className="mt-1 text-lg font-extrabold text-slate-950">
                        {record.type}
                      </h2>

                      <p className="text-sm text-slate-500">
                        {vehicleName(
                          record.vehicleId
                        )}
                      </p>
                    </div>

                    <StatusBadge
                      status={
                        record.status
                      }
                    />
                  </div>

                  <p className="mt-4 text-sm text-slate-600">
                    {
                      record.description
                    }
                  </p>

                  <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm">
                    <p>
                      Date:{" "}
                      {
                        record.scheduledDate
                      }
                    </p>

                    <p className="mt-2">
                      Provider:{" "}
                      {
                        record.provider
                      }
                    </p>

                    <p className="mt-2">
                      Cost: KES{" "}
                      {record.cost.toLocaleString()}
                    </p>
                  </div>

                  {record.status !==
                    "Completed" && (
                    <button
                      type="button"
                      onClick={() =>
                        completeMaintenance(
                          record
                        )
                      }
                      className="mt-4 w-full rounded-xl bg-emerald-600 px-4 py-3 font-bold text-white"
                    >
                      Complete Maintenance
                    </button>
                  )}
                </article>
              )
            )}
          </section>
        </>
      )}

      {/* ===================================================
          INSPECTIONS
      =================================================== */}

      {activeTab ===
        "inspections" && (
        <>
          <SectionHeader
            title="Vehicle Inspections"
            description="Pre-deployment safety and operational readiness checks."
            button="New Inspection"
            onClick={() =>
              setInspectionModalOpen(
                true
              )
            }
          />

          <section className="grid gap-5 lg:grid-cols-2">
            {inspections.map(
              (
                inspection
              ) => (
                <article
                  key={
                    inspection.id
                  }
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex justify-between gap-4">
                    <div>
                      <p className="text-xs text-slate-400">
                        {
                          inspection.id
                        }
                      </p>

                      <h2 className="font-extrabold text-slate-950">
                        {vehicleName(
                          inspection.vehicleId
                        )}
                      </h2>

                      <p className="text-sm text-slate-500">
                        {
                          inspection.date
                        }
                      </p>
                    </div>

                    <StatusBadge
                      status={
                        inspection.status
                      }
                    />
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                    <CheckItem
                      label="Brakes"
                      passed={
                        inspection.brakes
                      }
                    />

                    <CheckItem
                      label="Tyres"
                      passed={
                        inspection.tyres
                      }
                    />

                    <CheckItem
                      label="Lights"
                      passed={
                        inspection.lights
                      }
                    />

                    <CheckItem
                      label="Siren"
                      passed={
                        inspection.siren
                      }
                    />

                    <CheckItem
                      label="Medical Equipment"
                      passed={
                        inspection.medicalEquipment
                      }
                    />

                    <CheckItem
                      label="Fuel"
                      passed={
                        inspection.fuelChecked
                      }
                    />
                  </div>
                </article>
              )
            )}
          </section>
        </>
      )}

      {/* ===================================================
          VEHICLE MODAL
      =================================================== */}

      {vehicleModalOpen && (
        <Modal
          title="Register Vehicle"
          onClose={() =>
            setVehicleModalOpen(
              false
            )
          }
        >
          <Field
            label="Fleet Number"
            value={
              newVehicle.fleetNumber
            }
            onChange={(value) =>
              setNewVehicle(
                (current) => ({
                  ...current,
                  fleetNumber:
                    value,
                })
              )
            }
          />

          <Field
            label="Registration Number"
            value={
              newVehicle.registration
            }
            onChange={(value) =>
              setNewVehicle(
                (current) => ({
                  ...current,
                  registration:
                    value,
                })
              )
            }
          />

          <label className="block text-sm font-bold text-slate-700">
            Vehicle Type

            <select
              value={
                newVehicle.type
              }
              onChange={(
                event
              ) =>
                setNewVehicle(
                  (current) => ({
                    ...current,

                    type:
                      event
                        .target
                        .value as VehicleType,
                  })
                )
              }
              className="mt-2 w-full rounded-xl border border-slate-200 p-3"
            >
              <option value="Ambulance">
                Ambulance
              </option>

              <option value="Rescue Vehicle">
                Rescue Vehicle
              </option>

              <option value="Logistics Truck">
                Logistics Truck
              </option>

              <option value="Field Vehicle">
                Field Vehicle
              </option>
            </select>
          </label>

          <Field
            label="Station"
            value={
              newVehicle.station
            }
            onChange={(value) =>
              setNewVehicle(
                (current) => ({
                  ...current,
                  station:
                    value,
                })
              )
            }
          />

          <Field
            label="County"
            value={
              newVehicle.county
            }
            onChange={(value) =>
              setNewVehicle(
                (current) => ({
                  ...current,
                  county:
                    value,
                })
              )
            }
          />

          <Field
            label="Fuel %"
            type="number"
            value={
              newVehicle.fuelLevel
            }
            onChange={(value) =>
              setNewVehicle(
                (current) => ({
                  ...current,
                  fuelLevel:
                    value,
                })
              )
            }
          />

          <Field
            label="Odometer"
            type="number"
            value={
              newVehicle.odometer
            }
            onChange={(value) =>
              setNewVehicle(
                (current) => ({
                  ...current,
                  odometer:
                    value,
                })
              )
            }
          />

          <Field
            label="Service Due KM"
            type="number"
            value={
              newVehicle.serviceDueKm
            }
            onChange={(value) =>
              setNewVehicle(
                (current) => ({
                  ...current,
                  serviceDueKm:
                    value,
                })
              )
            }
          />

          <Field
            label="Insurance Expiry"
            type="date"
            value={
              newVehicle.insuranceExpiry
            }
            onChange={(value) =>
              setNewVehicle(
                (current) => ({
                  ...current,
                  insuranceExpiry:
                    value,
                })
              )
            }
          />

          <Field
            label="Inspection Expiry"
            type="date"
            value={
              newVehicle.inspectionExpiry
            }
            onChange={(value) =>
              setNewVehicle(
                (current) => ({
                  ...current,
                  inspectionExpiry:
                    value,
                })
              )
            }
          />

          <SaveButton
            label="Register Vehicle"
            onClick={
              registerVehicle
            }
          />
        </Modal>
      )}

      {/* ===================================================
          DRIVER MODAL
      =================================================== */}

      {driverModalOpen && (
        <Modal
          title="Register Driver"
          onClose={() =>
            setDriverModalOpen(
              false
            )
          }
        >
          <Field
            label="Full Name"
            value={
              newDriver.fullName
            }
            onChange={(value) =>
              setNewDriver(
                (current) => ({
                  ...current,
                  fullName:
                    value,
                })
              )
            }
          />

          <Field
            label="Phone"
            value={
              newDriver.phone
            }
            onChange={(value) =>
              setNewDriver(
                (current) => ({
                  ...current,
                  phone: value,
                })
              )
            }
          />

          <Field
            label="Email"
            value={
              newDriver.email
            }
            onChange={(value) =>
              setNewDriver(
                (current) => ({
                  ...current,
                  email: value,
                })
              )
            }
          />

          <Field
            label="Licence Number"
            value={
              newDriver.licenceNumber
            }
            onChange={(value) =>
              setNewDriver(
                (current) => ({
                  ...current,
                  licenceNumber:
                    value,
                })
              )
            }
          />

          <Field
            label="Licence Class"
            value={
              newDriver.licenceClass
            }
            onChange={(value) =>
              setNewDriver(
                (current) => ({
                  ...current,
                  licenceClass:
                    value,
                })
              )
            }
          />

          <Field
            label="Licence Expiry"
            type="date"
            value={
              newDriver.licenceExpiry
            }
            onChange={(value) =>
              setNewDriver(
                (current) => ({
                  ...current,
                  licenceExpiry:
                    value,
                })
              )
            }
          />

          <Field
            label="Station"
            value={
              newDriver.station
            }
            onChange={(value) =>
              setNewDriver(
                (current) => ({
                  ...current,
                  station:
                    value,
                })
              )
            }
          />

          <Field
            label="Certifications"
            value={
              newDriver.certifications
            }
            onChange={(value) =>
              setNewDriver(
                (current) => ({
                  ...current,
                  certifications:
                    value,
                })
              )
            }
          />

          <SaveButton
            label="Register Driver"
            onClick={
              registerDriver
            }
          />
        </Modal>
      )}

      {/* ===================================================
          ASSIGNMENT MODAL
      =================================================== */}

      {assignmentModalOpen && (
        <Modal
          title="Create Fleet Assignment"
          onClose={() =>
            setAssignmentModalOpen(
              false
            )
          }
        >
          <Select
            label="Vehicle"
            value={
              newAssignment.vehicleId
            }
            onChange={(value) =>
              setNewAssignment(
                (current) => ({
                  ...current,
                  vehicleId:
                    value,
                })
              )
            }
            options={availableVehicles.map(
              (vehicle) => ({
                value:
                  vehicle.id,

                label: `${vehicle.fleetNumber} · ${vehicle.registration}`,
              })
            )}
          />

          <Select
            label="Driver"
            value={
              newAssignment.driverId
            }
            onChange={(value) =>
              setNewAssignment(
                (current) => ({
                  ...current,
                  driverId:
                    value,
                })
              )
            }
            options={availableDrivers.map(
              (driver) => ({
                value:
                  driver.id,

                label:
                  driver.fullName,
              })
            )}
          />

          <Field
            label="Shift Start"
            type="time"
            value={
              newAssignment.shiftStart
            }
            onChange={(value) =>
              setNewAssignment(
                (current) => ({
                  ...current,
                  shiftStart:
                    value,
                })
              )
            }
          />

          <Field
            label="Shift End"
            type="time"
            value={
              newAssignment.shiftEnd
            }
            onChange={(value) =>
              setNewAssignment(
                (current) => ({
                  ...current,
                  shiftEnd:
                    value,
                })
              )
            }
          />

          <Field
            label="Incident Reference"
            value={
              newAssignment.incidentReference
            }
            onChange={(value) =>
              setNewAssignment(
                (current) => ({
                  ...current,
                  incidentReference:
                    value,
                })
              )
            }
          />

          <p className="mt-5 font-bold text-slate-700">
            Crew Members
          </p>

          <div className="mt-3 grid gap-2">
            {responders.map(
              (responder) => (
                <label
                  key={
                    responder.id
                  }
                  className="flex items-center justify-between rounded-xl bg-slate-50 p-4"
                >
                  <div>
                    <p className="font-bold">
                      {
                        responder.name
                      }
                    </p>

                    <p className="text-xs text-slate-500">
                      {
                        responder.role
                      }
                    </p>
                  </div>

                  <input
                    type="checkbox"
                    checked={newAssignment.crewIds.includes(
                      responder.id
                    )}
                    onChange={(
                      event
                    ) =>
                      setNewAssignment(
                        (
                          current
                        ) => ({
                          ...current,

                          crewIds:
                            event
                              .target
                              .checked
                              ? [
                                  ...current.crewIds,
                                  responder.id,
                                ]
                              : current.crewIds.filter(
                                  (
                                    id
                                  ) =>
                                    id !==
                                    responder.id
                                ),
                        })
                      )
                    }
                    className="h-5 w-5"
                  />
                </label>
              )
            )}
          </div>

          <SaveButton
            label="Activate Assignment"
            onClick={
              createAssignment
            }
          />
        </Modal>
      )}

      {/* ===================================================
          MAINTENANCE MODAL
      =================================================== */}

      {maintenanceModalOpen && (
        <Modal
          title="Schedule Maintenance"
          onClose={() =>
            setMaintenanceModalOpen(
              false
            )
          }
        >
          <Select
            label="Vehicle"
            value={
              newMaintenance.vehicleId
            }
            onChange={(value) =>
              setNewMaintenance(
                (current) => ({
                  ...current,
                  vehicleId:
                    value,
                })
              )
            }
            options={vehicles.map(
              (vehicle) => ({
                value:
                  vehicle.id,

                label:
                  vehicleName(
                    vehicle.id
                  ),
              })
            )}
          />

          <Field
            label="Maintenance Type"
            value={
              newMaintenance.type
            }
            onChange={(value) =>
              setNewMaintenance(
                (current) => ({
                  ...current,
                  type: value,
                })
              )
            }
          />

          <Field
            label="Scheduled Date"
            type="date"
            value={
              newMaintenance.scheduledDate
            }
            onChange={(value) =>
              setNewMaintenance(
                (current) => ({
                  ...current,
                  scheduledDate:
                    value,
                })
              )
            }
          />

          <Field
            label="Provider"
            value={
              newMaintenance.provider
            }
            onChange={(value) =>
              setNewMaintenance(
                (current) => ({
                  ...current,
                  provider:
                    value,
                })
              )
            }
          />

          <Field
            label="Cost"
            type="number"
            value={
              newMaintenance.cost
            }
            onChange={(value) =>
              setNewMaintenance(
                (current) => ({
                  ...current,
                  cost: value,
                })
              )
            }
          />

          <TextArea
            label="Description"
            value={
              newMaintenance.description
            }
            onChange={(value) =>
              setNewMaintenance(
                (current) => ({
                  ...current,
                  description:
                    value,
                })
              )
            }
          />

          <SaveButton
            label="Schedule Maintenance"
            onClick={
              createMaintenance
            }
          />
        </Modal>
      )}

      {/* ===================================================
          INSPECTION MODAL
      =================================================== */}

      {inspectionModalOpen && (
        <Modal
          title="Vehicle Inspection"
          onClose={() =>
            setInspectionModalOpen(
              false
            )
          }
        >
          <Select
            label="Vehicle"
            value={
              newInspection.vehicleId
            }
            onChange={(value) =>
              setNewInspection(
                (current) => ({
                  ...current,
                  vehicleId:
                    value,
                })
              )
            }
            options={vehicles.map(
              (vehicle) => ({
                value:
                  vehicle.id,

                label:
                  vehicleName(
                    vehicle.id
                  ),
              })
            )}
          />

          <Field
            label="Inspector"
            value={
              newInspection.inspector
            }
            onChange={(value) =>
              setNewInspection(
                (current) => ({
                  ...current,
                  inspector:
                    value,
                })
              )
            }
          />

          <Field
            label="Date"
            type="date"
            value={
              newInspection.date
            }
            onChange={(value) =>
              setNewInspection(
                (current) => ({
                  ...current,
                  date: value,
                })
              )
            }
          />

          <InspectionChecks
            inspection={
              newInspection
            }
            setInspection={
              setNewInspection
            }
          />

          <TextArea
            label="Notes"
            value={
              newInspection.notes
            }
            onChange={(value) =>
              setNewInspection(
                (current) => ({
                  ...current,
                  notes: value,
                })
              )
            }
          />

          <SaveButton
            label="Save Inspection"
            onClick={
              createInspection
            }
          />
        </Modal>
      )}

      {/* ===================================================
          FUEL MODAL
      =================================================== */}

      {fuelModalOpen && (
        <Modal
          title="Record Fuel Transaction"
          onClose={() =>
            setFuelModalOpen(
              false
            )
          }
        >
          <Select
            label="Vehicle"
            value={
              newFuel.vehicleId
            }
            onChange={(value) =>
              setNewFuel(
                (current) => ({
                  ...current,
                  vehicleId:
                    value,
                })
              )
            }
            options={vehicles.map(
              (vehicle) => ({
                value:
                  vehicle.id,

                label:
                  vehicleName(
                    vehicle.id
                  ),
              })
            )}
          />

          <Field
            label="Litres"
            type="number"
            value={
              newFuel.litres
            }
            onChange={(value) =>
              setNewFuel(
                (current) => ({
                  ...current,
                  litres:
                    value,
                })
              )
            }
          />

          <Field
            label="Amount KES"
            type="number"
            value={
              newFuel.amount
            }
            onChange={(value) =>
              setNewFuel(
                (current) => ({
                  ...current,
                  amount:
                    value,
                })
              )
            }
          />

          <Field
            label="Odometer"
            type="number"
            value={
              newFuel.odometer
            }
            onChange={(value) =>
              setNewFuel(
                (current) => ({
                  ...current,
                  odometer:
                    value,
                })
              )
            }
          />

          <Field
            label="Fuel Station"
            value={
              newFuel.station
            }
            onChange={(value) =>
              setNewFuel(
                (current) => ({
                  ...current,
                  station:
                    value,
                })
              )
            }
          />

          <Field
            label="Recorded By"
            value={
              newFuel.recordedBy
            }
            onChange={(value) =>
              setNewFuel(
                (current) => ({
                  ...current,
                  recordedBy:
                    value,
                })
              )
            }
          />

          <SaveButton
            label="Record Fuel"
            onClick={
              recordFuel
            }
          />
        </Modal>
      )}

      {/* ===================================================
          VEHICLE DRAWER
      =================================================== */}

      {selectedVehicle && (
        <SimpleDrawer
          title={
            selectedVehicle.registration
          }
          subtitle={
            selectedVehicle.fleetNumber
          }
          onClose={() =>
            setSelectedVehicle(
              null
            )
          }
        >
          <StatusBadge
            status={
              selectedVehicle.status
            }
          />

          <div className="mt-5 space-y-3 rounded-xl bg-slate-50 p-4 text-sm">
            <p>
              Type:{" "}
              <strong>
                {
                  selectedVehicle.type
                }
              </strong>
            </p>

            <p>
              Station:{" "}
              <strong>
                {
                  selectedVehicle.station
                }
              </strong>
            </p>

            <p>
              Fuel:{" "}
              <strong>
                {
                  selectedVehicle.fuelLevel
                }
                %
              </strong>
            </p>

            <p>
              GPS:{" "}
              <strong>
                {
                  selectedVehicle.gpsStatus
                }
              </strong>
            </p>

            <p>
              Odometer:{" "}
              <strong>
                {selectedVehicle.odometer.toLocaleString()}{" "}
                km
              </strong>
            </p>

            <p>
              Deployment:{" "}
              <strong>
                {selectedVehicle.currentDeployment ||
                  "Standby"}
              </strong>
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              navigate(
                `/redcross/gis?vehicle=${selectedVehicle.id}`
              )
            }
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 font-bold text-white"
          >
            <FaMapMarkedAlt />

            Open on GIS
          </button>
        </SimpleDrawer>
      )}

      {/* ===================================================
          DRIVER DRAWER
      =================================================== */}

      {selectedDriver && (
        <SimpleDrawer
          title={
            selectedDriver.fullName
          }
          subtitle={
            selectedDriver.id
          }
          onClose={() =>
            setSelectedDriver(
              null
            )
          }
        >
          <StatusBadge
            status={
              selectedDriver.status
            }
          />

          <div className="mt-5 space-y-3 rounded-xl bg-slate-50 p-4 text-sm">
            <p>
              Phone:{" "}
              <strong>
                {
                  selectedDriver.phone
                }
              </strong>
            </p>

            <p>
              Email:{" "}
              <strong>
                {
                  selectedDriver.email
                }
              </strong>
            </p>

            <p>
              Licence:{" "}
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

            <p>
              Station:{" "}
              <strong>
                {
                  selectedDriver.station
                }
              </strong>
            </p>
          </div>
        </SimpleDrawer>
      )}
    </div>
  );
}

/* =========================================================
   REUSABLE UI
========================================================= */

function Metric({
  title,
  value,
  icon,
}: {
  title: string;

  value: string | number;

  icon: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="text-2xl text-red-600">
        {icon}
      </div>

      <p className="mt-4 text-sm font-semibold text-slate-500">
        {title}
      </p>

      <p className="mt-1 text-3xl font-extrabold text-slate-950">
        {value}
      </p>
    </div>
  );
}

function InfoCard({
  label,
  value,
  icon,
}: {
  label: string;

  value: string;

  icon: ReactNode;
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">
      <div className="text-blue-600">
        {icon}
      </div>

      <p className="mt-2 text-xs font-bold uppercase text-slate-500">
        {label}
      </p>

      <p className="mt-1 font-extrabold text-slate-950">
        {value}
      </p>
    </div>
  );
}

function QuickAction({
  label,
  icon,
  onClick,
}: {
  label: string;

  icon: ReactNode;

  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-3 rounded-xl border border-slate-200 p-4 text-left font-bold text-slate-800 transition hover:bg-red-50"
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-red-700">
        {icon}
      </span>

      {label}
    </button>
  );
}

function Toolbar({
  search,
  onSearch,
  statusFilter,
  onStatus,
  button,
  onButton,
}: {
  search: string;

  onSearch:
    (value: string) => void;

  statusFilter?: string;

  onStatus?:
    (value: string) => void;

  button: string;

  onButton: () => void;
}) {
  return (
    <section className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:flex-row">
      <div className="relative flex-1">
        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

        <input
          type="search"
          value={search}
          onChange={(event) =>
            onSearch(
              event.target.value
            )
          }
          placeholder="Search records..."
          className="w-full rounded-xl border border-slate-200 py-3 pl-11 pr-4 outline-none focus:border-red-500"
        />
      </div>

      {statusFilter !==
        undefined &&
        onStatus && (
          <select
            value={
              statusFilter
            }
            onChange={(
              event
            ) =>
              onStatus(
                event.target.value
              )
            }
            className="rounded-xl border border-slate-200 bg-white px-4 py-3"
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

            <option value="En Route">
              En Route
            </option>

            <option value="On Scene">
              On Scene
            </option>

            <option value="Maintenance">
              Maintenance
            </option>

            <option value="Offline">
              Offline
            </option>
          </select>
        )}

      <button
        type="button"
        onClick={onButton}
        className="flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 font-bold text-white"
      >
        <FaPlus />

        {button}
      </button>
    </section>
  );
}

function SectionHeader({
  title,
  description,
  button,
  onClick,
}: {
  title: string;

  description: string;

  button: string;

  onClick: () => void;
}) {
  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="text-xl font-extrabold text-slate-950">
          {title}
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          {description}
        </p>
      </div>

      <button
        type="button"
        onClick={onClick}
        className="flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 font-bold text-white"
      >
        <FaPlus />

        {button}
      </button>
    </section>
  );
}

function DataTable({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[950px] text-left text-sm">
          {children}
        </table>
      </div>
    </section>
  );
}

function TableHead({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <th className="bg-slate-50 px-5 py-4 font-bold text-slate-700">
      {children}
    </th>
  );
}

function TableCell({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <td className="px-5 py-4 text-slate-700">
      {children}
    </td>
  );
}

function CheckItem({
  label,
  passed,
}: {
  label: string;

  passed: boolean;
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <p className="text-xs text-slate-500">
        {label}
      </p>

      <p
        className={`mt-1 font-bold ${
          passed
            ? "text-emerald-700"
            : "text-red-700"
        }`}
      >
        {passed
          ? "Passed"
          : "Attention"}
      </p>
    </div>
  );
}

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;

  onClose: () => void;

  children: ReactNode;
}) {
  return (
    <>
      <button
        type="button"
        onClick={onClose}
        aria-label="Close modal"
        className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm"
      />

      <div className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-3xl -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between bg-slate-950 p-6 text-white">
          <h2 className="text-2xl font-extrabold">
            {title}
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-3 hover:bg-slate-800"
          >
            <FaTimes />
          </button>
        </div>

        <div className="max-h-[72vh] overflow-y-auto p-6">
          {children}
        </div>
      </div>
    </>
  );
}

function Field({
  label,
  value,
  type = "text",
  onChange,
}: {
  label: string;

  value: string;

  type?: string;

  onChange:
    (value: string) => void;
}) {
  return (
    <label className="mt-4 block text-sm font-bold text-slate-700">
      {label}

      <input
        type={type}
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal outline-none focus:border-red-500"
      />
    </label>
  );
}

function TextArea({
  label,
  value,
  onChange,
}: {
  label: string;

  value: string;

  onChange:
    (value: string) => void;
}) {
  return (
    <label className="mt-4 block text-sm font-bold text-slate-700">
      {label}

      <textarea
        value={value}
        rows={4}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal outline-none"
      />
    </label>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;

  value: string;

  onChange:
    (value: string) => void;

  options: {
    value: string;
    label: string;
  }[];
}) {
  return (
    <label className="mt-4 block text-sm font-bold text-slate-700">
      {label}

      <select
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 font-normal"
      >
        <option value="">
          Select {label}
        </option>

        {options.map(
          (option) => (
            <option
              key={
                option.value
              }
              value={
                option.value
              }
            >
              {
                option.label
              }
            </option>
          )
        )}
      </select>
    </label>
  );
}

function SaveButton({
  label,
  onClick,
}: {
  label: string;

  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 font-bold text-white"
    >
      <FaSave />

      {label}
    </button>
  );
}

function InspectionChecks({
  inspection,
  setInspection,
}: {
  inspection: {
    vehicleId: string;
    inspector: string;
    date: string;

    brakes: boolean;
    tyres: boolean;
    lights: boolean;
    siren: boolean;

    medicalEquipment: boolean;

    fuelChecked: boolean;

    notes: string;
  };

  setInspection:
    React.Dispatch<
      React.SetStateAction<{
        vehicleId: string;
        inspector: string;
        date: string;

        brakes: boolean;
        tyres: boolean;
        lights: boolean;
        siren: boolean;

        medicalEquipment: boolean;

        fuelChecked: boolean;

        notes: string;
      }>
    >;
}) {
  const checks = [
    {
      label: "Brakes",
      field: "brakes",
    },

    {
      label: "Tyres",
      field: "tyres",
    },

    {
      label: "Lights",
      field: "lights",
    },

    {
      label: "Siren",
      field: "siren",
    },

    {
      label:
        "Medical Equipment",

      field:
        "medicalEquipment",
    },

    {
      label: "Fuel Checked",

      field:
        "fuelChecked",
    },
  ] as const;

  return (
    <div className="mt-5 grid gap-3 sm:grid-cols-2">
      {checks.map(
        (check) => (
          <label
            key={
              check.field
            }
            className="flex items-center justify-between rounded-xl bg-slate-50 p-4 font-bold text-slate-700"
          >
            {
              check.label
            }

            <input
              type="checkbox"
              checked={
                inspection[
                  check.field
                ]
              }
              onChange={(
                event
              ) =>
                setInspection(
                  (
                    current
                  ) => ({
                    ...current,

                    [check.field]:
                      event
                        .target
                        .checked,
                  })
                )
              }
              className="h-5 w-5"
            />
          </label>
        )
      )}
    </div>
  );
}

function SimpleDrawer({
  title,
  subtitle,
  onClose,
  children,
}: {
  title: string;

  subtitle: string;

  onClose: () => void;

  children: ReactNode;
}) {
  return (
    <>
      <button
        type="button"
        onClick={onClose}
        className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm"
      />

      <aside className="fixed bottom-0 right-0 top-0 z-50 flex w-full max-w-lg flex-col bg-white shadow-2xl">
        <div className="flex items-start justify-between bg-slate-950 p-6 text-white">
          <div>
            <h2 className="text-2xl font-extrabold">
              {title}
            </h2>

            <p className="mt-1 text-sm text-slate-300">
              {subtitle}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-3 hover:bg-slate-800"
          >
            <FaTimes />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>
      </aside>
    </>
  );
}