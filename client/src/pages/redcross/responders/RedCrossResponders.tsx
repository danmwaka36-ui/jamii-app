import { useMemo, useState } from "react";
import {
  FaBriefcase,
  FaCalendarAlt,
  FaCheckCircle,
  FaChevronRight,
  FaClock,
  FaDownload,
  FaEdit,
  FaEnvelope,
  FaEye,
  FaFileCsv,
  FaFilePdf,
  FaFilter,
  FaMapMarkerAlt,
  FaPhone,
  FaPlus,
  FaSearch,
  FaShieldAlt,
  FaTimes,
  FaTrash,
  FaUserFriends,
  FaUserPlus,
  FaUsers,
  FaUserShield,
} from "react-icons/fa";

type PersonType =
  | "Staff"
  | "Volunteer"
  | "Responder"
  | "Medical Responder"
  | "Driver"
  | "Team Leader"
  | "Coordinator"
  | "Other";

type PersonStatus =
  | "Active"
  | "Available"
  | "Unavailable"
  | "Deployed"
  | "On Leave"
  | "Suspended"
  | "Inactive";

type ScopeType =
  | "National"
  | "County"
  | "Sub-County"
  | "Ward"
  | "Branch"
  | "Team";

type PersonnelTab =
  | "overview"
  | "people"
  | "teams"
  | "training"
  | "deployments"
  | "reports"
  | "audit";

interface PermissionSet {
  dashboardView: boolean;
  peopleView: boolean;
  peopleCreate: boolean;
  peopleEdit: boolean;
  peopleDelete: boolean;
  peopleExport: boolean;
  teamsView: boolean;
  teamsCreate: boolean;
  teamsAssign: boolean;
  trainingView: boolean;
  trainingCreate: boolean;
  trainingEdit: boolean;
  deploymentsView: boolean;
  deploymentsCreate: boolean;
  deploymentsAssign: boolean;
  reportsView: boolean;
  reportsExport: boolean;
  auditView: boolean;
}

interface Person {
  id: string;
  personnelNo: string;
  fullName: string;
  type: PersonType;
  role: string;
  status: PersonStatus;
  phone: string;
  email: string;
  county: string;
  subCounty: string;
  branch: string;
  ward: string;
  scopeType: ScopeType;
  specialization: string;
  teamId: string;
  teamName: string;
  joinedDate: string;
  emergencyContact: string;
  emergencyPhone: string;
  trainingStatus: "Complete" | "Partial" | "Not Trained";
  certifications: string[];
  certificationExpiry?: string;
  deploymentCount: number;
  lastDeployment?: string;
  notes: string;
}

interface Team {
  id: string;
  name: string;
  code: string;
  leader: string;
  specialization: string;
  county: string;
  branch: string;
  status: "Available" | "Deployed" | "Standby" | "Inactive";
  memberCount: number;
  members: string[];
}

interface TrainingRecord {
  id: string;
  personId: string;
  personName: string;
  course: string;
  provider: string;
  completedDate: string;
  expiryDate?: string;
  status: "Valid" | "Expiring" | "Expired";
}

interface Deployment {
  id: string;
  personId: string;
  personName: string;
  incidentId: string;
  incidentType: string;
  location: string;
  assignedRole: string;
  deployedAt: string;
  completedAt?: string;
  status: "Active" | "Completed" | "Cancelled";
}

interface AuditEntry {
  id: string;
  user: string;
  action: string;
  target: string;
  timestamp: string;
  result: "Success" | "Denied";
}

const COUNTY_DATA: Record<string, string[]> = {
  Mombasa: [
    "Changamwe",
    "Jomvu",
    "Kisauni",
    "Likoni",
    "Mvita",
    "Nyali",
  ],
  Kilifi: [
    "Kilifi North",
    "Kilifi South",
    "Kaloleni",
    "Ganze",
    "Malindi",
    "Magarini",
    "Rabai",
  ],
  Kwale: [
    "Msambweni",
    "Lunga Lunga",
    "Matuga",
    "Kinango",
  ],
  "Taita Taveta": [
    "Taveta",
    "Wundanyi",
    "Mwatate",
    "Voi",
  ],
  Nairobi: [
    "Westlands",
    "Dagoretti North",
    "Dagoretti South",
    "Langata",
    "Kibra",
    "Roysambu",
    "Kasarani",
    "Ruaraka",
    "Embakasi",
  ],
};

const SPECIALIZATIONS = [
  "Emergency & Trauma",
  "First Aid",
  "Search & Rescue",
  "Disaster Response",
  "Flood Response",
  "Community Health",
  "Psychosocial Support",
  "WASH",
  "Relief Distribution",
  "Logistics",
  "GIS",
  "Communications",
  "Shelter Management",
  "Blood Services",
  "Medical Support",
  "Driver",
  "Administration",
  "Other",
];

const PERSON_TYPES: PersonType[] = [
  "Staff",
  "Volunteer",
  "Responder",
  "Medical Responder",
  "Driver",
  "Team Leader",
  "Coordinator",
  "Other",
];

const INITIAL_PEOPLE: Person[] = [
  {
    id: "P-001",
    personnelNo: "RCR-0001",
    fullName: "Amina Hassan",
    type: "Responder",
    role: "Emergency Response Officer",
    status: "Available",
    phone: "+254 700 100 001",
    email: "amina.hassan@redcross.example",
    county: "Mombasa",
    subCounty: "Nyali",
    branch: "Mombasa Branch",
    ward: "Kongowea",
    scopeType: "Branch",
    specialization: "Emergency & Trauma",
    teamId: "TEAM-001",
    teamName: "Mombasa Emergency Team",
    joinedDate: "2025-02-12",
    emergencyContact: "Hassan Ali",
    emergencyPhone: "+254 711 000 001",
    trainingStatus: "Complete",
    certifications: ["First Aid", "Disaster Response"],
    certificationExpiry: "2027-02-12",
    deploymentCount: 24,
    lastDeployment: "2026-07-29",
    notes: "Experienced emergency responder.",
  },
  {
    id: "P-002",
    personnelNo: "RCR-0002",
    fullName: "Brian Mwangi",
    type: "Volunteer",
    role: "Community Volunteer",
    status: "Active",
    phone: "+254 700 100 002",
    email: "brian.mwangi@redcross.example",
    county: "Mombasa",
    subCounty: "Kisauni",
    branch: "Mombasa Branch",
    ward: "Bamburi",
    scopeType: "Branch",
    specialization: "Relief Distribution",
    teamId: "TEAM-002",
    teamName: "Mombasa Relief Team",
    joinedDate: "2025-08-10",
    emergencyContact: "Mary Mwangi",
    emergencyPhone: "+254 711 000 002",
    trainingStatus: "Partial",
    certifications: ["Community First Aid"],
    certificationExpiry: "2026-11-10",
    deploymentCount: 12,
    lastDeployment: "2026-07-25",
    notes: "Community outreach volunteer.",
  },
  {
    id: "P-003",
    personnelNo: "RCR-0003",
    fullName: "Dr. Sarah Wanjiku",
    type: "Medical Responder",
    role: "Medical Team Lead",
    status: "Deployed",
    phone: "+254 700 100 003",
    email: "sarah.wanjiku@redcross.example",
    county: "Mombasa",
    subCounty: "Mvita",
    branch: "Mombasa Branch",
    ward: "Tononoka",
    scopeType: "County",
    specialization: "Medical Support",
    teamId: "TEAM-003",
    teamName: "Coastal Medical Response Team",
    joinedDate: "2024-04-15",
    emergencyContact: "David Wanjiku",
    emergencyPhone: "+254 711 000 003",
    trainingStatus: "Complete",
    certifications: ["Emergency Medicine", "First Aid"],
    certificationExpiry: "2028-04-15",
    deploymentCount: 41,
    lastDeployment: "2026-08-02",
    notes: "Medical response coordinator.",
  },
];

const INITIAL_TEAMS: Team[] = [
  {
    id: "TEAM-001",
    name: "Mombasa Emergency Team",
    code: "MET-01",
    leader: "Amina Hassan",
    specialization: "Emergency & Trauma",
    county: "Mombasa",
    branch: "Mombasa Branch",
    status: "Available",
    memberCount: 8,
    members: ["Amina Hassan"],
  },
  {
    id: "TEAM-002",
    name: "Mombasa Relief Team",
    code: "MRT-01",
    leader: "Brian Mwangi",
    specialization: "Relief Distribution",
    county: "Mombasa",
    branch: "Mombasa Branch",
    status: "Standby",
    memberCount: 15,
    members: ["Brian Mwangi"],
  },
  {
    id: "TEAM-003",
    name: "Coastal Medical Response Team",
    code: "CMRT-01",
    leader: "Dr. Sarah Wanjiku",
    specialization: "Medical Support",
    county: "Mombasa",
    branch: "Mombasa Branch",
    status: "Deployed",
    memberCount: 7,
    members: ["Dr. Sarah Wanjiku"],
  },
];

const INITIAL_TRAINING: TrainingRecord[] = [
  {
    id: "TR-001",
    personId: "P-001",
    personName: "Amina Hassan",
    course: "Disaster Response",
    provider: "Red Cross",
    completedDate: "2026-02-12",
    expiryDate: "2027-02-12",
    status: "Valid",
  },
  {
    id: "TR-002",
    personId: "P-002",
    personName: "Brian Mwangi",
    course: "Community First Aid",
    provider: "Red Cross",
    completedDate: "2025-11-10",
    expiryDate: "2026-11-10",
    status: "Valid",
  },
  {
    id: "TR-003",
    personId: "P-003",
    personName: "Dr. Sarah Wanjiku",
    course: "Emergency Medicine",
    provider: "Red Cross",
    completedDate: "2025-04-15",
    expiryDate: "2028-04-15",
    status: "Valid",
  },
];

const INITIAL_DEPLOYMENTS: Deployment[] = [
  {
    id: "DEP-001",
    personId: "P-001",
    personName: "Amina Hassan",
    incidentId: "INC-2026-071",
    incidentType: "Flood Response",
    location: "Mombasa",
    assignedRole: "Response Officer",
    deployedAt: "2026-07-29 08:20",
    completedAt: "2026-07-29 17:40",
    status: "Completed",
  },
  {
    id: "DEP-002",
    personId: "P-003",
    personName: "Dr. Sarah Wanjiku",
    incidentId: "MED-2026-018",
    incidentType: "Medical Emergency",
    location: "Mvita",
    assignedRole: "Medical Team Lead",
    deployedAt: "2026-08-02 10:15",
    status: "Active",
  },
];

const INITIAL_AUDIT: AuditEntry[] = [
  {
    id: "AUD-001",
    user: "Super Admin",
    action: "Viewed personnel profile",
    target: "Amina Hassan",
    timestamp: "2026-08-03 09:12",
    result: "Success",
  },
  {
    id: "AUD-002",
    user: "Volunteer Coordinator",
    action: "Exported volunteer report",
    target: "Mombasa Branch",
    timestamp: "2026-08-03 10:04",
    result: "Success",
  },
];

const FULL_PERMISSIONS: PermissionSet = {
  dashboardView: true,
  peopleView: true,
  peopleCreate: true,
  peopleEdit: true,
  peopleDelete: true,
  peopleExport: true,
  teamsView: true,
  teamsCreate: true,
  teamsAssign: true,
  trainingView: true,
  trainingCreate: true,
  trainingEdit: true,
  deploymentsView: true,
  deploymentsCreate: true,
  deploymentsAssign: true,
  reportsView: true,
  reportsExport: true,
  auditView: true,
};

function createPersonnelNumber(type: PersonType, count: number) {
  const prefix =
    type === "Volunteer"
      ? "VOL"
      : type === "Staff"
        ? "STF"
        : type === "Driver"
          ? "DRV"
          : type === "Medical Responder"
            ? "MED"
            : "RSP";

  return `${prefix}-${String(count + 1).padStart(4, "0")}`;
}

function downloadCSV(filename: string, rows: Record<string, unknown>[]) {
  if (!rows.length) return;

  const headers = Object.keys(rows[0]);

  const escapeCSV = (value: unknown) => {
    const text = String(value ?? "");
    return `"${text.replace(/"/g, '""')}"`;
  };

  const csv = [
    headers.join(","),
    ...rows.map((row) =>
      headers.map((header) => escapeCSV(row[header])).join(","),
    ),
  ].join("\n");

  const blob = new Blob([csv], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  link.click();

  URL.revokeObjectURL(url);
}

function printReport(title: string, people: Person[]) {
  const popup = window.open("", "_blank", "width=1100,height=800");

  if (!popup) return;

  popup.document.write(`
    <html>
      <head>
        <title>${title}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 30px;
            color: #111827;
          }
          h1 { margin-bottom: 4px; }
          p { color: #6b7280; }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          th, td {
            border: 1px solid #d1d5db;
            padding: 8px;
            font-size: 12px;
            text-align: left;
          }
          th {
            background: #f3f4f6;
          }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        <p>Generated ${new Date().toLocaleString()}</p>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Type</th>
              <th>Role</th>
              <th>Status</th>
              <th>County</th>
              <th>Specialization</th>
              <th>Team</th>
            </tr>
          </thead>
          <tbody>
            ${people
              .map(
                (person) => `
                <tr>
                  <td>${person.personnelNo}</td>
                  <td>${person.fullName}</td>
                  <td>${person.type}</td>
                  <td>${person.role}</td>
                  <td>${person.status}</td>
                  <td>${person.county}</td>
                  <td>${person.specialization}</td>
                  <td>${person.teamName}</td>
                </tr>
              `,
              )
              .join("")}
          </tbody>
        </table>
      </body>
    </html>
  `);

  popup.document.close();
  popup.focus();
  popup.print();
}

function StatCard({
  icon,
  label,
  value,
  detail,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  detail: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
          <p className="mt-1 text-xs text-gray-500">{detail}</p>
        </div>

        <div className="rounded-xl bg-red-50 p-3 text-red-600">
          {icon}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Active: "bg-green-100 text-green-700",
    Available: "bg-green-100 text-green-700",
    Valid: "bg-green-100 text-green-700",
    Completed: "bg-blue-100 text-blue-700",
    Deployed: "bg-orange-100 text-orange-700",
    Expiring: "bg-yellow-100 text-yellow-700",
    Expired: "bg-red-100 text-red-700",
    Unavailable: "bg-gray-100 text-gray-700",
    "On Leave": "bg-purple-100 text-purple-700",
    Suspended: "bg-red-100 text-red-700",
    Inactive: "bg-gray-100 text-gray-500",
    Standby: "bg-blue-100 text-blue-700",
    Cancelled: "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
        styles[status] ?? "bg-gray-100 text-gray-700"
      }`}
    >
      {status}
    </span>
  );
}

export default function RedCrossResponders() {
  /*
   * Temporary development identity.
   *
   * This is intentionally centralized so that when Firebase Authentication
   * and Firestore Security Rules are connected later, this can be replaced
   * with the authenticated user's role/permission object.
   *
   * Super Admin has unrestricted access.
   */
  const currentUser = {
    name: "Super Admin",
    role: "Super Admin",
    scopeType: "All" as const,
    scopeId: "ALL",
    permissions: FULL_PERMISSIONS,
  };

  const [activeTab, setActiveTab] =
    useState<PersonnelTab>("overview");

  const [people, setPeople] =
    useState<Person[]>(INITIAL_PEOPLE);

  const [teams, setTeams] =
    useState<Team[]>(INITIAL_TEAMS);

  const [training] =
    useState<TrainingRecord[]>(INITIAL_TRAINING);

  const [deployments] =
    useState<Deployment[]>(INITIAL_DEPLOYMENTS);

  const [audit] =
    useState<AuditEntry[]>(INITIAL_AUDIT);

  const [search, setSearch] = useState("");

  const [typeFilter, setTypeFilter] =
    useState<"All" | PersonType>("All");

  const [statusFilter, setStatusFilter] =
    useState<"All" | PersonStatus>("All");

  const [countyFilter, setCountyFilter] =
    useState("All");

  const [specializationFilter] =
    useState("All");

  const [selectedPersonId, setSelectedPersonId] =
    useState<string | null>(null);

  const [showPersonModal, setShowPersonModal] =
    useState(false);

  const [showTeamModal, setShowTeamModal] =
    useState(false);

  const [editingPersonId, setEditingPersonId] =
    useState<string | null>(null);

  const [newPerson, setNewPerson] = useState({
    fullName: "",
    type: "Volunteer" as PersonType,
    role: "",
    phone: "",
    email: "",
    county: "Mombasa",
    subCounty: "Nyali",
    branch: "Mombasa Branch",
    ward: "",
    scopeType: "Branch" as ScopeType,
    specialization: "First Aid",
    status: "Active" as PersonStatus,
    emergencyContact: "",
    emergencyPhone: "",
    notes: "",
  });

  const [newTeam, setNewTeam] = useState({
    name: "",
    code: "",
    leader: "",
    specialization: "Emergency & Trauma",
    county: "Mombasa",
    branch: "Mombasa Branch",
  });

  const can = (permission: keyof PermissionSet) =>
    currentUser.permissions[permission];

  const filteredPeople = useMemo(() => {
    const query = search.trim().toLowerCase();

    return people.filter((person) => {
      const matchesSearch =
        !query ||
        [
          person.fullName,
          person.personnelNo,
          person.phone,
          person.email,
          person.role,
          person.county,
          person.subCounty,
          person.branch,
          person.specialization,
          person.teamName,
        ]
          .join(" ")
          .toLowerCase()
          .includes(query);

      const matchesType =
        typeFilter === "All" || person.type === typeFilter;

      const matchesStatus =
        statusFilter === "All" || person.status === statusFilter;

      const matchesCounty =
        countyFilter === "All" || person.county === countyFilter;

      const matchesSpecialization =
        specializationFilter === "All" ||
        person.specialization === specializationFilter;

      return (
        matchesSearch &&
        matchesType &&
        matchesStatus &&
        matchesCounty &&
        matchesSpecialization
      );
    });
  }, [
    people,
    search,
    typeFilter,
    statusFilter,
    countyFilter,
    specializationFilter,
  ]);

  const selectedPerson = people.find(
    (person) => person.id === selectedPersonId,
  );

  const stats = useMemo(() => {
    return {
      total: people.length,
      volunteers: people.filter(
        (p) => p.type === "Volunteer",
      ).length,
      responders: people.filter(
        (p) =>
          p.type === "Responder" ||
          p.type === "Medical Responder",
      ).length,
      staff: people.filter(
        (p) => p.type === "Staff",
      ).length,
      available: people.filter(
        (p) => p.status === "Available",
      ).length,
      deployed: people.filter(
        (p) => p.status === "Deployed",
      ).length,
      teams: teams.length,
      activeDeployments: deployments.filter(
        (d) => d.status === "Active",
      ).length,
    };
  }, [people, teams, deployments]);

  const openAddPerson = () => {
    setEditingPersonId(null);

    setNewPerson({
      fullName: "",
      type: "Volunteer",
      role: "",
      phone: "",
      email: "",
      county: "Mombasa",
      subCounty: "Nyali",
      branch: "Mombasa Branch",
      ward: "",
      scopeType: "Branch",
      specialization: "First Aid",
      status: "Active",
      emergencyContact: "",
      emergencyPhone: "",
      notes: "",
    });

    setShowPersonModal(true);
  };

  const openEditPerson = (person: Person) => {
    if (!can("peopleEdit")) return;

    setEditingPersonId(person.id);

    setNewPerson({
      fullName: person.fullName,
      type: person.type,
      role: person.role,
      phone: person.phone,
      email: person.email,
      county: person.county,
      subCounty: person.subCounty,
      branch: person.branch,
      ward: person.ward,
      scopeType: person.scopeType,
      specialization: person.specialization,
      status: person.status,
      emergencyContact: person.emergencyContact,
      emergencyPhone: person.emergencyPhone,
      notes: person.notes,
    });

    setShowPersonModal(true);
  };

  const savePerson = () => {
    if (!newPerson.fullName.trim()) return;

    if (editingPersonId) {
      setPeople((current) =>
        current.map((person) =>
          person.id === editingPersonId
            ? {
                ...person,
                ...newPerson,
              }
            : person,
        ),
      );
    } else {
      const person: Person = {
        id: `P-${String(people.length + 1).padStart(3, "0")}`,
        personnelNo: createPersonnelNumber(
          newPerson.type,
          people.length,
        ),
        fullName: newPerson.fullName,
        type: newPerson.type,
        role: newPerson.role,
        status: newPerson.status,
        phone: newPerson.phone,
        email: newPerson.email,
        county: newPerson.county,
        subCounty: newPerson.subCounty,
        branch: newPerson.branch,
        ward: newPerson.ward,
        scopeType: newPerson.scopeType,
        specialization: newPerson.specialization,
        teamId: "",
        teamName: "Unassigned",
        joinedDate: new Date()
          .toISOString()
          .slice(0, 10),
        emergencyContact: newPerson.emergencyContact,
        emergencyPhone: newPerson.emergencyPhone,
        trainingStatus: "Not Trained",
        certifications: [],
        deploymentCount: 0,
        notes: newPerson.notes,
      };

      setPeople((current) => [person, ...current]);
    }

    setShowPersonModal(false);
  };

  const deletePerson = (id: string) => {
    if (!can("peopleDelete")) return;

    const person = people.find((p) => p.id === id);

    if (!person) return;

    if (
      !window.confirm(
        `Remove ${person.fullName} from the personnel registry?`,
      )
    ) {
      return;
    }

    setPeople((current) =>
      current.filter((person) => person.id !== id),
    );

    if (selectedPersonId === id) {
      setSelectedPersonId(null);
    }
  };

  const createTeam = () => {
    if (!newTeam.name.trim()) return;

    const team: Team = {
      id: `TEAM-${String(teams.length + 1).padStart(3, "0")}`,
      name: newTeam.name,
      code:
        newTeam.code ||
        `TEAM-${String(teams.length + 1).padStart(2, "0")}`,
      leader: newTeam.leader || "Not assigned",
      specialization: newTeam.specialization,
      county: newTeam.county,
      branch: newTeam.branch,
      status: "Standby",
      memberCount: 0,
      members: [],
    };

    setTeams((current) => [team, ...current]);

    setNewTeam({
      name: "",
      code: "",
      leader: "",
      specialization: "Emergency & Trauma",
      county: "Mombasa",
      branch: "Mombasa Branch",
    });

    setShowTeamModal(false);
  };

  const exportPeopleCSV = () => {
    if (!can("peopleExport")) return;

    downloadCSV("redcross-personnel-registry.csv", filteredPeople.map((p) => ({
      Personnel_ID: p.personnelNo,
      Name: p.fullName,
      Type: p.type,
      Role: p.role,
      Status: p.status,
      Phone: p.phone,
      Email: p.email,
      County: p.county,
      Sub_County: p.subCounty,
      Branch: p.branch,
      Ward: p.ward,
      Scope: p.scopeType,
      Specialization: p.specialization,
      Team: p.teamName,
      Training_Status: p.trainingStatus,
      Deployment_Count: p.deploymentCount,
    })));
  };

  const exportTeamsCSV = () => {
    if (!can("reportsExport")) return;

    downloadCSV(
      "redcross-teams.csv",
      teams.map((team) => ({
        Team_ID: team.id,
        Code: team.code,
        Team: team.name,
        Leader: team.leader,
        Specialization: team.specialization,
        County: team.county,
        Branch: team.branch,
        Status: team.status,
        Members: team.memberCount,
      })),
    );
  };

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          icon={<FaUsers />}
          label="Total Personnel"
          value={stats.total}
          detail="Registered people"
        />

        <StatCard
          icon={<FaUserPlus />}
          label="Volunteers"
          value={stats.volunteers}
          detail="Community volunteers"
        />

        <StatCard
          icon={<FaUserShield />}
          label="Responders"
          value={stats.responders}
          detail="Emergency & medical"
        />

        <StatCard
          icon={<FaBriefcase />}
          label="Staff"
          value={stats.staff}
          detail="Red Cross personnel"
        />
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          icon={<FaCheckCircle />}
          label="Available"
          value={stats.available}
          detail="Ready for assignment"
        />

        <StatCard
          icon={<FaClock />}
          label="Deployed"
          value={stats.deployed}
          detail="Currently deployed"
        />

        <StatCard
          icon={<FaUsers />}
          label="Teams"
          value={stats.teams}
          detail="Operational teams"
        />

        <StatCard
          icon={<FaShieldAlt />}
          label="Active Deployments"
          value={stats.activeDeployments}
          detail="Current operations"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-gray-900">
                Personnel readiness
              </h2>
              <p className="text-sm text-gray-500">
                Current operational availability
              </p>
            </div>

            <button
              onClick={() => setActiveTab("people")}
              className="text-sm font-semibold text-red-600"
            >
              View registry
            </button>
          </div>

          <div className="space-y-4">
            {[
              ["Available", stats.available],
              ["Deployed", stats.deployed],
              [
                "Inactive",
                people.filter(
                  (p) =>
                    p.status === "Inactive" ||
                    p.status === "Suspended",
                ).length,
              ],
              [
                "On Leave",
                people.filter(
                  (p) => p.status === "On Leave",
                ).length,
              ],
            ].map(([label, value]) => (
              <div
                key={String(label)}
                className="flex items-center justify-between"
              >
                <span className="text-sm text-gray-600">
                  {label}
                </span>
                <span className="font-bold text-gray-900">
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h2 className="font-bold text-gray-900">
              Current deployments
            </h2>
            <p className="text-sm text-gray-500">
              Personnel currently assigned to operations
            </p>
          </div>

          <div className="space-y-3">
            {deployments
              .filter((d) => d.status === "Active")
              .map((deployment) => (
                <div
                  key={deployment.id}
                  className="rounded-xl border border-gray-100 bg-gray-50 p-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">
                        {deployment.personName}
                      </p>
                      <p className="text-sm text-gray-500">
                        {deployment.incidentType} ·{" "}
                        {deployment.location}
                      </p>
                    </div>

                    <StatusBadge status={deployment.status} />
                  </div>
                </div>
              ))}

            {!deployments.some(
              (d) => d.status === "Active",
            ) && (
              <p className="py-6 text-center text-sm text-gray-500">
                No active deployments.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderPeople = () => (
    <div className="space-y-5">
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 lg:grid-cols-[1fr_auto_auto_auto_auto]">
          <div className="relative">
            <FaSearch className="absolute left-3 top-3.5 text-gray-400" />

            <input
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search name, ID, phone, role, team, county..."
              className="w-full rounded-xl border border-gray-300 py-3 pl-10 pr-4 text-sm outline-none focus:border-red-500"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(event) =>
              setTypeFilter(
                event.target.value as
                  | "All"
                  | PersonType,
              )
            }
            className="rounded-xl border border-gray-300 px-4 py-3 text-sm"
          >
            <option value="All">All types</option>
            {PERSON_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target.value as
                  | "All"
                  | PersonStatus,
              )
            }
            className="rounded-xl border border-gray-300 px-4 py-3 text-sm"
          >
            <option value="All">All statuses</option>
            {[
              "Active",
              "Available",
              "Unavailable",
              "Deployed",
              "On Leave",
              "Suspended",
              "Inactive",
            ].map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>

          <select
            value={countyFilter}
            onChange={(event) =>
              setCountyFilter(event.target.value)
            }
            className="rounded-xl border border-gray-300 px-4 py-3 text-sm"
          >
            <option value="All">All counties</option>
            {Object.keys(COUNTY_DATA).map((county) => (
              <option key={county} value={county}>
                {county}
              </option>
            ))}
          </select>

          {can("peopleCreate") && (
            <button
              onClick={openAddPerson}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white hover:bg-red-700"
            >
              <FaPlus />
              Register person
            </button>
          )}
        </div>

        <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
          <FaFilter />
          <span>
            {filteredPeople.length} of {people.length} records
            shown
          </span>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-[1100px] w-full">
            <thead className="bg-gray-50">
              <tr className="border-b border-gray-200 text-left text-xs uppercase tracking-wide text-gray-500">
                <th className="px-5 py-4">Personnel</th>
                <th className="px-5 py-4">Type</th>
                <th className="px-5 py-4">Role</th>
                <th className="px-5 py-4">Specialization</th>
                <th className="px-5 py-4">Location</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Team</th>
                <th className="px-5 py-4 text-right">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredPeople.map((person) => (
                <tr
                  key={person.id}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="px-5 py-4">
                    <div>
                      <p className="font-semibold text-gray-900">
                        {person.fullName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {person.personnelNo}
                      </p>
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <span className="rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700">
                      {person.type}
                    </span>
                  </td>

                  <td className="px-5 py-4 text-sm text-gray-600">
                    {person.role}
                  </td>

                  <td className="px-5 py-4 text-sm text-gray-600">
                    {person.specialization}
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex items-start gap-2 text-sm text-gray-600">
                      <FaMapMarkerAlt className="mt-1 text-red-500" />
                      <span>
                        {person.county}
                        <br />
                        <span className="text-xs text-gray-400">
                          {person.subCounty}
                        </span>
                      </span>
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <StatusBadge status={person.status} />
                  </td>

                  <td className="px-5 py-4 text-sm text-gray-600">
                    {person.teamName}
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() =>
                          setSelectedPersonId(person.id)
                        }
                        title="View profile"
                        className="rounded-lg border border-gray-200 p-2 text-gray-600 hover:bg-gray-100"
                      >
                        <FaEye />
                      </button>

                      {can("peopleEdit") && (
                        <button
                          onClick={() =>
                            openEditPerson(person)
                          }
                          title="Edit"
                          className="rounded-lg border border-gray-200 p-2 text-gray-600 hover:bg-gray-100"
                        >
                          <FaEdit />
                        </button>
                      )}

                      {can("peopleDelete") && (
                        <button
                          onClick={() =>
                            deletePerson(person.id)
                          }
                          title="Delete"
                          className="rounded-lg border border-gray-200 p-2 text-red-600 hover:bg-red-50"
                        >
                          <FaTrash />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {!filteredPeople.length && (
            <div className="p-12 text-center">
              <FaUsers className="mx-auto text-3xl text-gray-300" />
              <p className="mt-3 font-semibold text-gray-700">
                No personnel found
              </p>
              <p className="text-sm text-gray-500">
                Try changing your search or filters.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderTeams = () => (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">
            Response teams
          </h2>
          <p className="text-sm text-gray-500">
            Organize personnel into operational teams.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={exportTeamsCSV}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            <FaFileCsv />
            CSV
          </button>

          {can("teamsCreate") && (
            <button
              onClick={() => setShowTeamModal(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white"
            >
              <FaPlus />
              Create team
            </button>
          )}
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {teams.map((team) => (
          <div
            key={team.id}
            className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div className="rounded-xl bg-red-50 p-3 text-red-600">
                <FaUserFriends />
              </div>

              <StatusBadge status={team.status} />
            </div>

            <h3 className="mt-4 font-bold text-gray-900">
              {team.name}
            </h3>

            <p className="text-xs text-gray-500">
              {team.code}
            </p>

            <div className="mt-4 space-y-2 text-sm">
              <p>
                <span className="text-gray-500">
                  Leader:
                </span>{" "}
                <strong>{team.leader}</strong>
              </p>

              <p>
                <span className="text-gray-500">
                  Specialization:
                </span>{" "}
                {team.specialization}
              </p>

              <p>
                <span className="text-gray-500">
                  Location:
                </span>{" "}
                {team.county} · {team.branch}
              </p>

              <p>
                <span className="text-gray-500">
                  Members:
                </span>{" "}
                {team.memberCount}
              </p>
            </div>

            <button className="mt-5 flex w-full items-center justify-between rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50">
              View team profile
              <FaChevronRight />
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderTraining = () => (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-200 p-5">
        <h2 className="font-bold text-gray-900">
          Training & certifications
        </h2>
        <p className="text-sm text-gray-500">
          Track operational training and certification
          validity.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-[850px] w-full">
          <thead className="bg-gray-50">
            <tr className="text-left text-xs uppercase tracking-wide text-gray-500">
              <th className="px-5 py-4">Person</th>
              <th className="px-5 py-4">Course</th>
              <th className="px-5 py-4">Provider</th>
              <th className="px-5 py-4">Completed</th>
              <th className="px-5 py-4">Expiry</th>
              <th className="px-5 py-4">Status</th>
            </tr>
          </thead>

          <tbody>
            {training.map((record) => (
              <tr
                key={record.id}
                className="border-t border-gray-100"
              >
                <td className="px-5 py-4 font-semibold text-gray-900">
                  {record.personName}
                </td>

                <td className="px-5 py-4 text-sm text-gray-600">
                  {record.course}
                </td>

                <td className="px-5 py-4 text-sm text-gray-600">
                  {record.provider}
                </td>

                <td className="px-5 py-4 text-sm text-gray-600">
                  {record.completedDate}
                </td>

                <td className="px-5 py-4 text-sm text-gray-600">
                  {record.expiryDate ?? "No expiry"}
                </td>

                <td className="px-5 py-4">
                  <StatusBadge status={record.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderDeployments = () => (
    <div className="space-y-5">
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-red-50 p-3 text-red-600">
            <FaShieldAlt />
          </div>

          <div>
            <h2 className="font-bold text-gray-900">
              Deployment management
            </h2>
            <p className="text-sm text-gray-500">
              Track personnel assigned to emergency operations.
            </p>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-[1000px] w-full">
            <thead className="bg-gray-50">
              <tr className="text-left text-xs uppercase tracking-wide text-gray-500">
                <th className="px-5 py-4">Person</th>
                <th className="px-5 py-4">Incident</th>
                <th className="px-5 py-4">Type</th>
                <th className="px-5 py-4">Location</th>
                <th className="px-5 py-4">Role</th>
                <th className="px-5 py-4">Deployed</th>
                <th className="px-5 py-4">Status</th>
              </tr>
            </thead>

            <tbody>
              {deployments.map((deployment) => (
                <tr
                  key={deployment.id}
                  className="border-t border-gray-100"
                >
                  <td className="px-5 py-4 font-semibold text-gray-900">
                    {deployment.personName}
                  </td>

                  <td className="px-5 py-4 text-sm text-gray-600">
                    {deployment.incidentId}
                  </td>

                  <td className="px-5 py-4 text-sm text-gray-600">
                    {deployment.incidentType}
                  </td>

                  <td className="px-5 py-4 text-sm text-gray-600">
                    {deployment.location}
                  </td>

                  <td className="px-5 py-4 text-sm text-gray-600">
                    {deployment.assignedRole}
                  </td>

                  <td className="px-5 py-4 text-sm text-gray-600">
                    {deployment.deployedAt}
                  </td>

                  <td className="px-5 py-4">
                    <StatusBadge status={deployment.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderReports = () => (
    <div className="grid gap-5 md:grid-cols-2">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <FaFilePdf className="text-3xl text-red-600" />

        <h2 className="mt-4 font-bold text-gray-900">
          Personnel register
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Generate a printable personnel report using the
          current filters.
        </p>

        <div className="mt-5 flex gap-2">
          <button
            disabled={!can("reportsExport")}
            onClick={() =>
              printReport(
                "Red Cross Personnel Register",
                filteredPeople,
              )
            }
            className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FaDownload />
            PDF / Print
          </button>

          <button
            disabled={!can("peopleExport")}
            onClick={exportPeopleCSV}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FaFileCsv />
            CSV
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <FaFileCsv className="text-3xl text-green-600" />

        <h2 className="mt-4 font-bold text-gray-900">
          Operational team report
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Export team structure, leaders, specialization and
          operational status.
        </p>

        <button
          disabled={!can("reportsExport")}
          onClick={exportTeamsCSV}
          className="mt-5 inline-flex items-center gap-2 rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <FaFileCsv />
          Download CSV
        </button>
      </div>
    </div>
  );

  const renderAudit = () => (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-200 p-5">
        <h2 className="font-bold text-gray-900">
          Personnel audit trail
        </h2>
        <p className="text-sm text-gray-500">
          Sensitive personnel actions should be auditable.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-[850px] w-full">
          <thead className="bg-gray-50">
            <tr className="text-left text-xs uppercase tracking-wide text-gray-500">
              <th className="px-5 py-4">User</th>
              <th className="px-5 py-4">Action</th>
              <th className="px-5 py-4">Target</th>
              <th className="px-5 py-4">Time</th>
              <th className="px-5 py-4">Result</th>
            </tr>
          </thead>

          <tbody>
            {audit.map((entry) => (
              <tr
                key={entry.id}
                className="border-t border-gray-100"
              >
                <td className="px-5 py-4 font-semibold text-gray-900">
                  {entry.user}
                </td>

                <td className="px-5 py-4 text-sm text-gray-600">
                  {entry.action}
                </td>

                <td className="px-5 py-4 text-sm text-gray-600">
                  {entry.target}
                </td>

                <td className="px-5 py-4 text-sm text-gray-600">
                  {entry.timestamp}
                </td>

                <td className="px-5 py-4">
                  <StatusBadge status={entry.result} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const tabs: {
    id: PersonnelTab;
    label: string;
    permission: keyof PermissionSet;
  }[] = [
    {
      id: "overview",
      label: "Overview",
      permission: "dashboardView",
    },
    {
      id: "people",
      label: "People Registry",
      permission: "peopleView",
    },
    {
      id: "teams",
      label: "Teams",
      permission: "teamsView",
    },
    {
      id: "training",
      label: "Training & Certifications",
      permission: "trainingView",
    },
    {
      id: "deployments",
      label: "Deployments",
      permission: "deploymentsView",
    },
    {
      id: "reports",
      label: "Reports",
      permission: "reportsView",
    },
    {
      id: "audit",
      label: "Audit",
      permission: "auditView",
    },
  ];

  const visibleTabs = tabs.filter((tab) =>
    can(tab.permission),
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1600px] space-y-6">
        {/* Header */}
        <div className="rounded-3xl bg-gradient-to-r from-red-700 via-red-600 to-red-500 p-6 text-white shadow-lg lg:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2 text-sm text-red-100">
                <FaShieldAlt />
                Red Cross Operations
              </div>

              <h1 className="text-2xl font-bold sm:text-3xl">
                People & Responders
              </h1>

              <p className="mt-2 max-w-3xl text-sm text-red-100 sm:text-base">
                Central personnel registry for staff,
                volunteers, responders, medical responders,
                drivers, team leaders and coordinators.
              </p>
            </div>

            <div className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur">
              <div className="flex items-center gap-3">
                <FaUserShield className="text-2xl" />

                <div>
                  <p className="text-xs text-red-100">
                    Signed in as
                  </p>
                  <p className="font-bold">
                    {currentUser.name}
                  </p>
                  <p className="text-xs text-red-100">
                    {currentUser.role} · Full access
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Permission notice */}
        <div className="flex items-start gap-3 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-blue-800">
          <FaShieldAlt className="mt-0.5" />

          <div>
            <p className="font-semibold">
              Role-based access architecture enabled
            </p>

            <p className="mt-1 text-sm">
              Super Admin has unrestricted access. Other
              personnel will later receive access based on
              role, permission, geographic/data scope and
              operational responsibility. Firebase Security
              Rules will enforce these permissions when the
              live backend is connected.
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="flex min-w-max">
            {visibleTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`border-b-2 px-5 py-4 text-sm font-semibold transition ${
                  activeTab === tab.id
                    ? "border-red-600 text-red-600"
                    : "border-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Main content */}
        {activeTab === "overview" && renderOverview()}
        {activeTab === "people" && renderPeople()}
        {activeTab === "teams" && renderTeams()}
        {activeTab === "training" && renderTraining()}
        {activeTab === "deployments" && renderDeployments()}
        {activeTab === "reports" && renderReports()}
        {activeTab === "audit" && renderAudit()}

        {/* Person profile drawer */}
        {selectedPerson && (
          <div className="fixed inset-0 z-50 bg-black/40">
            <div className="absolute right-0 top-0 h-full w-full max-w-2xl overflow-y-auto bg-white shadow-2xl">
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white p-5">
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500">
                    Personnel profile
                  </p>
                  <h2 className="text-xl font-bold text-gray-900">
                    {selectedPerson.fullName}
                  </h2>
                </div>

                <button
                  onClick={() => setSelectedPersonId(null)}
                  className="rounded-xl border border-gray-200 p-3 text-gray-600 hover:bg-gray-100"
                >
                  <FaTimes />
                </button>
              </div>

              <div className="space-y-6 p-5">
                <div className="rounded-2xl bg-gray-50 p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100 text-2xl font-bold text-red-600">
                      {selectedPerson.fullName
                        .split(" ")
                        .map((word) => word[0])
                        .slice(0, 2)
                        .join("")}
                    </div>

                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900">
                        {selectedPerson.fullName}
                      </h3>

                      <p className="text-sm text-gray-500">
                        {selectedPerson.personnelNo}
                      </p>

                      <div className="mt-2 flex flex-wrap gap-2">
                        <StatusBadge
                          status={selectedPerson.status}
                        />

                        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-gray-600">
                          {selectedPerson.type}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <section>
                  <h3 className="mb-3 font-bold text-gray-900">
                    Professional information
                  </h3>

                  <div className="grid gap-3 sm:grid-cols-2">
                    {[
                      ["Role", selectedPerson.role],
                      [
                        "Specialization",
                        selectedPerson.specialization,
                      ],
                      ["Team", selectedPerson.teamName],
                      [
                        "Training",
                        selectedPerson.trainingStatus,
                      ],
                      [
                        "Deployments",
                        String(selectedPerson.deploymentCount),
                      ],
                      [
                        "Joined",
                        selectedPerson.joinedDate,
                      ],
                    ].map(([label, value]) => (
                      <div
                        key={label}
                        className="rounded-xl border border-gray-200 p-4"
                      >
                        <p className="text-xs text-gray-500">
                          {label}
                        </p>
                        <p className="mt-1 font-semibold text-gray-900">
                          {value}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>

                <section>
                  <h3 className="mb-3 font-bold text-gray-900">
                    Contact information
                  </h3>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-4">
                      <FaPhone className="text-red-600" />
                      <div>
                        <p className="text-xs text-gray-500">
                          Phone
                        </p>
                        <p className="font-semibold">
                          {selectedPerson.phone || "Not provided"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-4">
                      <FaEnvelope className="text-red-600" />
                      <div>
                        <p className="text-xs text-gray-500">
                          Email
                        </p>
                        <p className="font-semibold">
                          {selectedPerson.email || "Not provided"}
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="mb-3 font-bold text-gray-900">
                    Geographic scope
                  </h3>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border border-gray-200 p-4">
                      <p className="text-xs text-gray-500">
                        Scope
                      </p>
                      <p className="font-semibold">
                        {selectedPerson.scopeType}
                      </p>
                    </div>

                    <div className="rounded-xl border border-gray-200 p-4">
                      <p className="text-xs text-gray-500">
                        County
                      </p>
                      <p className="font-semibold">
                        {selectedPerson.county}
                      </p>
                    </div>

                    <div className="rounded-xl border border-gray-200 p-4">
                      <p className="text-xs text-gray-500">
                        Sub-County
                      </p>
                      <p className="font-semibold">
                        {selectedPerson.subCounty}
                      </p>
                    </div>

                    <div className="rounded-xl border border-gray-200 p-4">
                      <p className="text-xs text-gray-500">
                        Branch
                      </p>
                      <p className="font-semibold">
                        {selectedPerson.branch}
                      </p>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="mb-3 font-bold text-gray-900">
                    Certifications
                  </h3>

                  <div className="flex flex-wrap gap-2">
                    {selectedPerson.certifications.length ? (
                      selectedPerson.certifications.map(
                        (certificate) => (
                          <span
                            key={certificate}
                            className="rounded-lg bg-green-50 px-3 py-2 text-xs font-semibold text-green-700"
                          >
                            {certificate}
                          </span>
                        ),
                      )
                    ) : (
                      <p className="text-sm text-gray-500">
                        No certifications recorded.
                      </p>
                    )}
                  </div>
                </section>

                <section>
                  <h3 className="mb-3 font-bold text-gray-900">
                    Emergency contact
                  </h3>

                  <div className="rounded-xl border border-gray-200 p-4">
                    <p className="font-semibold">
                      {selectedPerson.emergencyContact ||
                        "Not provided"}
                    </p>

                    <p className="text-sm text-gray-500">
                      {selectedPerson.emergencyPhone ||
                        "No phone number"}
                    </p>
                  </div>
                </section>

                <section>
                  <h3 className="mb-3 font-bold text-gray-900">
                    Notes
                  </h3>

                  <p className="rounded-xl bg-gray-50 p-4 text-sm leading-6 text-gray-600">
                    {selectedPerson.notes ||
                      "No additional notes."}
                  </p>
                </section>

                <div className="flex flex-wrap gap-2 border-t border-gray-200 pt-5">
                  {can("peopleEdit") && (
                    <button
                      onClick={() => {
                        openEditPerson(selectedPerson);
                        setSelectedPersonId(null);
                      }}
                      className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white"
                    >
                      <FaEdit />
                      Edit profile
                    </button>
                  )}

                  <button
                    onClick={() => {
                      const personDeployments =
                        deployments.filter(
                          (deployment) =>
                            deployment.personId ===
                            selectedPerson.id,
                        );

                      if (!personDeployments.length) {
                        alert(
                          "No deployment history recorded for this person.",
                        );
                        return;
                      }

                      setSelectedPersonId(null);
                      setActiveTab("deployments");
                    }}
                    className="inline-flex items-center gap-2 rounded-xl border border-gray-300 px-4 py-3 text-sm font-semibold text-gray-700"
                  >
                    <FaCalendarAlt />
                    Deployment history
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Person modal */}
        {showPersonModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="max-h-[95vh] w-full max-w-4xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white p-5">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {editingPersonId
                      ? "Edit personnel profile"
                      : "Register personnel"}
                  </h2>

                  <p className="text-sm text-gray-500">
                    Capture only information required for the
                    person's operational duties.
                  </p>
                </div>

                <button
                  onClick={() =>
                    setShowPersonModal(false)
                  }
                  className="rounded-xl border border-gray-200 p-3"
                >
                  <FaTimes />
                </button>
              </div>

              <div className="space-y-6 p-6">
                <section>
                  <h3 className="mb-4 font-bold text-gray-900">
                    Identity & role
                  </h3>

                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="block">
                      <span className="mb-1 block text-sm font-semibold text-gray-700">
                        Full name *
                      </span>
                      <input
                        value={newPerson.fullName}
                        onChange={(event) =>
                          setNewPerson((current) => ({
                            ...current,
                            fullName:
                              event.target.value,
                          }))
                        }
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-red-500"
                        placeholder="Enter full name"
                      />
                    </label>

                    <label className="block">
                      <span className="mb-1 block text-sm font-semibold text-gray-700">
                        Personnel type
                      </span>

                      <select
                        value={newPerson.type}
                        onChange={(event) =>
                          setNewPerson((current) => ({
                            ...current,
                            type: event.target
                              .value as PersonType,
                          }))
                        }
                        className="w-full rounded-xl border border-gray-300 px-4 py-3"
                      >
                        {PERSON_TYPES.map((type) => (
                          <option
                            key={type}
                            value={type}
                          >
                            {type}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="block">
                      <span className="mb-1 block text-sm font-semibold text-gray-700">
                        Role
                      </span>
                      <input
                        value={newPerson.role}
                        onChange={(event) =>
                          setNewPerson((current) => ({
                            ...current,
                            role: event.target.value,
                          }))
                        }
                        className="w-full rounded-xl border border-gray-300 px-4 py-3"
                        placeholder="Operational role"
                      />
                    </label>

                    <label className="block">
                      <span className="mb-1 block text-sm font-semibold text-gray-700">
                        Specialization
                      </span>

                      <select
                        value={newPerson.specialization}
                        onChange={(event) =>
                          setNewPerson((current) => ({
                            ...current,
                            specialization:
                              event.target.value,
                          }))
                        }
                        className="w-full rounded-xl border border-gray-300 px-4 py-3"
                      >
                        {SPECIALIZATIONS.map(
                          (specialization) => (
                            <option
                              key={specialization}
                              value={specialization}
                            >
                              {specialization}
                            </option>
                          ),
                        )}
                      </select>
                    </label>

                    <label className="block">
                      <span className="mb-1 block text-sm font-semibold text-gray-700">
                        Operational status
                      </span>

                      <select
                        value={newPerson.status}
                        onChange={(event) =>
                          setNewPerson((current) => ({
                            ...current,
                            status: event.target
                              .value as PersonStatus,
                          }))
                        }
                        className="w-full rounded-xl border border-gray-300 px-4 py-3"
                      >
                        {[
                          "Active",
                          "Available",
                          "Unavailable",
                          "Deployed",
                          "On Leave",
                          "Suspended",
                          "Inactive",
                        ].map((status) => (
                          <option
                            key={status}
                            value={status}
                          >
                            {status}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="block">
                      <span className="mb-1 block text-sm font-semibold text-gray-700">
                        Data scope
                      </span>

                      <select
                        value={newPerson.scopeType}
                        onChange={(event) =>
                          setNewPerson((current) => ({
                            ...current,
                            scopeType:
                              event.target
                                .value as ScopeType,
                          }))
                        }
                        className="w-full rounded-xl border border-gray-300 px-4 py-3"
                      >
                        {[
                          "National",
                          "County",
                          "Sub-County",
                          "Ward",
                          "Branch",
                          "Team",
                        ].map((scope) => (
                          <option
                            key={scope}
                            value={scope}
                          >
                            {scope}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                </section>

                <section>
                  <h3 className="mb-4 font-bold text-gray-900">
                    Contact
                  </h3>

                  <div className="grid gap-4 md:grid-cols-2">
                    <input
                      value={newPerson.phone}
                      onChange={(event) =>
                        setNewPerson((current) => ({
                          ...current,
                          phone: event.target.value,
                        }))
                      }
                      className="rounded-xl border border-gray-300 px-4 py-3"
                      placeholder="Phone number"
                    />

                    <input
                      value={newPerson.email}
                      onChange={(event) =>
                        setNewPerson((current) => ({
                          ...current,
                          email: event.target.value,
                        }))
                      }
                      className="rounded-xl border border-gray-300 px-4 py-3"
                      placeholder="Email address"
                    />

                    <input
                      value={newPerson.emergencyContact}
                      onChange={(event) =>
                        setNewPerson((current) => ({
                          ...current,
                          emergencyContact:
                            event.target.value,
                        }))
                      }
                      className="rounded-xl border border-gray-300 px-4 py-3"
                      placeholder="Emergency contact name"
                    />

                    <input
                      value={newPerson.emergencyPhone}
                      onChange={(event) =>
                        setNewPerson((current) => ({
                          ...current,
                          emergencyPhone:
                            event.target.value,
                        }))
                      }
                      className="rounded-xl border border-gray-300 px-4 py-3"
                      placeholder="Emergency contact phone"
                    />
                  </div>
                </section>

                <section>
                  <h3 className="mb-4 font-bold text-gray-900">
                    Geographic assignment
                  </h3>

                  <div className="grid gap-4 md:grid-cols-2">
                    <select
                      value={newPerson.county}
                      onChange={(event) => {
                        const county =
                          event.target.value;

                        setNewPerson((current) => ({
                          ...current,
                          county,
                          subCounty:
                            COUNTY_DATA[county]?.[0] ??
                            "",
                        }));
                      }}
                      className="rounded-xl border border-gray-300 px-4 py-3"
                    >
                      {Object.keys(COUNTY_DATA).map(
                        (county) => (
                          <option
                            key={county}
                            value={county}
                          >
                            {county}
                          </option>
                        ),
                      )}
                    </select>

                    <select
                      value={newPerson.subCounty}
                      onChange={(event) =>
                        setNewPerson((current) => ({
                          ...current,
                          subCounty:
                            event.target.value,
                        }))
                      }
                      className="rounded-xl border border-gray-300 px-4 py-3"
                    >
                      {(
                        COUNTY_DATA[
                          newPerson.county
                        ] ?? []
                      ).map((subCounty) => (
                        <option
                          key={subCounty}
                          value={subCounty}
                        >
                          {subCounty}
                        </option>
                      ))}
                    </select>

                    <input
                      value={newPerson.branch}
                      onChange={(event) =>
                        setNewPerson((current) => ({
                          ...current,
                          branch: event.target.value,
                        }))
                      }
                      className="rounded-xl border border-gray-300 px-4 py-3"
                      placeholder="Branch"
                    />

                    <input
                      value={newPerson.ward}
                      onChange={(event) =>
                        setNewPerson((current) => ({
                          ...current,
                          ward: event.target.value,
                        }))
                      }
                      className="rounded-xl border border-gray-300 px-4 py-3"
                      placeholder="Ward"
                    />
                  </div>
                </section>

                <section>
                  <h3 className="mb-4 font-bold text-gray-900">
                    Notes
                  </h3>

                  <textarea
                    value={newPerson.notes}
                    onChange={(event) =>
                      setNewPerson((current) => ({
                        ...current,
                        notes: event.target.value,
                      }))
                    }
                    rows={4}
                    className="w-full rounded-xl border border-gray-300 px-4 py-3"
                    placeholder="Operational notes..."
                  />
                </section>

                <div className="flex justify-end gap-3 border-t border-gray-200 pt-5">
                  <button
                    onClick={() =>
                      setShowPersonModal(false)
                    }
                    className="rounded-xl border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={savePerson}
                    disabled={!newPerson.fullName.trim()}
                    className="rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {editingPersonId
                      ? "Save changes"
                      : "Register personnel"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Team modal */}
        {showTeamModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-2xl rounded-3xl bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-gray-200 p-5">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Create response team
                  </h2>
                  <p className="text-sm text-gray-500">
                    Create an operational team for future
                    assignments.
                  </p>
                </div>

                <button
                  onClick={() => setShowTeamModal(false)}
                  className="rounded-xl border border-gray-200 p-3"
                >
                  <FaTimes />
                </button>
              </div>

              <div className="space-y-4 p-6">
                <input
                  value={newTeam.name}
                  onChange={(event) =>
                    setNewTeam((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-gray-300 px-4 py-3"
                  placeholder="Team name"
                />

                <input
                  value={newTeam.code}
                  onChange={(event) =>
                    setNewTeam((current) => ({
                      ...current,
                      code: event.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-gray-300 px-4 py-3"
                  placeholder="Team code"
                />

                <input
                  value={newTeam.leader}
                  onChange={(event) =>
                    setNewTeam((current) => ({
                      ...current,
                      leader: event.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-gray-300 px-4 py-3"
                  placeholder="Team leader"
                />

                <select
                  value={newTeam.specialization}
                  onChange={(event) =>
                    setNewTeam((current) => ({
                      ...current,
                      specialization:
                        event.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-gray-300 px-4 py-3"
                >
                  {SPECIALIZATIONS.map(
                    (specialization) => (
                      <option
                        key={specialization}
                        value={specialization}
                      >
                        {specialization}
                      </option>
                    ),
                  )}
                </select>

                <select
                  value={newTeam.county}
                  onChange={(event) =>
                    setNewTeam((current) => ({
                      ...current,
                      county: event.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-gray-300 px-4 py-3"
                >
                  {Object.keys(COUNTY_DATA).map(
                    (county) => (
                      <option
                        key={county}
                        value={county}
                      >
                        {county}
                      </option>
                    ),
                  )}
                </select>

                <input
                  value={newTeam.branch}
                  onChange={(event) =>
                    setNewTeam((current) => ({
                      ...current,
                      branch: event.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-gray-300 px-4 py-3"
                  placeholder="Branch"
                />

                <div className="flex justify-end gap-3 pt-3">
                  <button
                    onClick={() => setShowTeamModal(false)}
                    className="rounded-xl border border-gray-300 px-5 py-3 font-semibold text-gray-700"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={createTeam}
                    disabled={!newTeam.name.trim()}
                    className="rounded-xl bg-red-600 px-5 py-3 font-semibold text-white disabled:opacity-50"
                  >
                    Create team
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}