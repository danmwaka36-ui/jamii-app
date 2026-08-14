import { useMemo, useState } from "react";
import {
  FaArrowRight,
  FaBell,
  FaCheckCircle,
  FaChevronRight,
  FaClock,
  FaEdit,
  FaExclamationTriangle,
  FaFileAlt,
  FaHospital,
  FaMapMarkerAlt,
  FaNotesMedical,
  FaPlus,
  FaSearch,
  FaShieldAlt,
  FaStethoscope,
  FaTimes,
  FaTruck,
  FaUserMd,
  FaUserPlus,
  FaUsers,
  FaWheelchair,
} from "react-icons/fa";

type Priority = "Critical" | "High" | "Medium" | "Low";

type MedicalIncidentStatus =
  | "Incoming"
  | "Accepted"
  | "Team Assigned"
  | "En Route"
  | "On Scene"
  | "At Hospital"
  | "Completed"
  | "Cancelled";

type PatientStatus =
  | "Waiting"
  | "Under Treatment"
  | "Stable"
  | "Critical"
  | "Transferred"
  | "Discharged";

type ReferralStatus =
  | "Draft"
  | "Requested"
  | "Accepted"
  | "Transporting"
  | "Arrived"
  | "Completed"
  | "Cancelled";

type FleetRequestStatus =
  | "Requested"
  | "Acknowledged"
  | "Assigned"
  | "En Route"
  | "Completed"
  | "Cancelled";

type MedicalTeamStatus =
  | "Available"
  | "Assigned"
  | "On Scene"
  | "Off Duty";

type Severity =
  | "Immediate"
  | "Very Urgent"
  | "Urgent"
  | "Standard";

type IncidentType =
  | "Road Traffic Accident"
  | "Fire"
  | "Flood"
  | "Building Collapse"
  | "Mass Casualty Incident"
  | "Disease Outbreak"
  | "Water Rescue"
  | "Violence / Trauma"
  | "Maternal Emergency"
  | "Child Emergency"
  | "Medical Emergency"
  | "Missing / Vulnerable Person"
  | "Other";

type Patient = {
  id: string;
  patientNumber: string;
  fullName: string;
  dateOfBirth: string;
  age: string;
  sex: "Male" | "Female" | "Unknown";
  phone: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  nationality: string;
  location: string;
  incidentId: string;
  incidentReference: string;
  condition: string;
  allergies: string;
  medicalHistory: string;
  triage: Severity;
  status: PatientStatus;
  registeredAt: string;
  notes: string;
};

type MedicalIncident = {
  id: string;
  reference: string;
  title: string;
  type: IncidentType;
  location: string;
  latitude: number;
  longitude: number;
  priority: Priority;
  status: MedicalIncidentStatus;
  reportedAt: string;
  affectedPersons: number;
  assignedTeamId?: string;
  patientIds: string[];
  notes: string;
};

type MedicalTeam = {
  id: string;
  teamCode: string;
  name: string;
  leader: string;
  specialization: string;
  members: number;
  phone: string;
  baseStation: string;
  status: MedicalTeamStatus;
  certifications: string[];
  createdAt: string;
};

type Hospital = {
  id: string;
  name: string;
  facilityType: "National Referral" | "County Referral" | "Sub-County Hospital" | "Health Centre";
  county: string;
  subCounty: string;
  location: string;
  latitude: number;
  longitude: number;
  phone: string;
  emergencyPhone: string;
  ambulanceReception: boolean;
  traumaUnit: boolean;
  maternity: boolean;
  pediatric: boolean;
  bloodServices: boolean;
  verified: boolean;
  lastVerified: string;
  notes: string;
};

type TreatmentRecord = {
  id: string;
  patientId: string;
  incidentId: string;
  clinician: string;
  treatmentDate: string;
  diagnosis: string;
  interventions: string;
  medication: string;
  vitalSigns: string;
  response: string;
  followUp: string;
  status: "Open" | "Completed";
  createdAt: string;
};

type ReferralRecord = {
  id: string;
  patientId: string;
  incidentId: string;
  hospitalId: string;
  reason: string;
  urgency: Severity;
  requestedBy: string;
  requestedAt: string;
  acceptedBy: string;
  acceptedAt: string;
  status: ReferralStatus;
  clinicalNotes: string;
  destinationNotes: string;
};

type HandoverRecord = {
  id: string;
  patientId: string;
  incidentId: string;
  hospitalId: string;
  receivingClinician: string;
  receivingDepartment: string;
  handoverTime: string;
  conditionAtHandover: string;
  treatmentSummary: string;
  medicationGiven: string;
  outstandingNeeds: string;
  status: "Draft" | "Completed";
};

type FleetRequest = {
  id: string;
  incidentId: string;
  patientId: string;
  requestType: "Medical Transport" | "Rescue Support" | "Logistics Support";
  priority: Priority;
  requestedAt: string;
  requestedBy: string;
  destination?: string;
  status: FleetRequestStatus;
  alertStatus: "Pending" | "Sent" | "Acknowledged";
  notes: string;
};

type AuditEntry = {
  id: string;
  action: string;
  entity: string;
  entityId: string;
  actor: string;
  timestamp: string;
  details: string;
};

/* =========================================================
   CONSTANTS
========================================================= */

const SPECIALIZATIONS = [
  "Emergency & Trauma",
  "General Medicine",
  "Nursing",
  "First Aid",
  "Mental Health / Psychosocial Support",
  "Maternal & Newborn",
  "Pediatric",
  "Public Health",
  "Disaster Medicine",
  "Surgical Support",
  "Community Health",
  "Other",
];


const COUNTY_OPTIONS = [
  "Mombasa",
  "Kilifi",
  "Kwale",
  "Taita-Taveta",
  "Tana River",
  "Lamu",
  "Nairobi",
  "Kisumu",
  "Nakuru",
  "Machakos",
  "Kakamega",
  "Uasin Gishu",
  "Kiambu",
  "Kisii",
  "Meru",
  "Nyeri",
  "Garissa",
  "Wajir",
  "Mandera",
];

const INITIAL_INCIDENTS: MedicalIncident[] = [
  {
    id: "MED-001",
    reference: "KRCS-MED-2026-001",
    title: "Multiple casualty road traffic accident",
    type: "Road Traffic Accident",
    location: "Links Road, Nyali",
    latitude: -4.0207,
    longitude: 39.7067,
    priority: "Critical",
    status: "Incoming",
    reportedAt: "2026-08-13 14:22",
    affectedPersons: 6,
    patientIds: ["PAT-001", "PAT-002"],
    notes: "Multiple casualties reported. Immediate medical response required.",
  },
  {
    id: "MED-002",
    reference: "KRCS-MED-2026-002",
    title: "Flood-related medical assistance",
    type: "Flood",
    location: "Likoni, Mombasa",
    latitude: -4.0913,
    longitude: 39.6636,
    priority: "High",
    status: "Team Assigned",
    reportedAt: "2026-08-13 14:04",
    affectedPersons: 4,
    assignedTeamId: "TEAM-002",
    patientIds: ["PAT-003"],
    notes: "Residents require medical assessment following flooding.",
  },
  {
    id: "MED-003",
    reference: "KRCS-MED-2026-003",
    title: "Child medical emergency",
    type: "Child Emergency",
    location: "Bamburi, Mombasa",
    latitude: -3.997,
    longitude: 39.7303,
    priority: "High",
    status: "On Scene",
    reportedAt: "2026-08-13 13:38",
    affectedPersons: 1,
    assignedTeamId: "TEAM-001",
    patientIds: ["PAT-004"],
    notes: "Child experiencing respiratory distress.",
  },
];

const INITIAL_PATIENTS: Patient[] = [
  {
    id: "PAT-001",
    patientNumber: "PAT-001",
    fullName: "John Mwangi",
    dateOfBirth: "1988-04-12",
    age: "38",
    sex: "Male",
    phone: "+254 700 111 001",
    emergencyContactName: "Mary Mwangi",
    emergencyContactPhone: "+254 700 111 002",
    nationality: "Kenyan",
    location: "Nyali, Mombasa",
    incidentId: "MED-001",
    incidentReference: "KRCS-MED-2026-001",
    condition: "Multiple trauma following road traffic accident",
    allergies: "None reported",
    medicalHistory: "No known chronic condition",
    triage: "Immediate",
    status: "Under Treatment",
    registeredAt: "2026-08-13 14:26",
    notes: "Requires trauma assessment and possible referral.",
  },
  {
    id: "PAT-002",
    patientNumber: "PAT-002",
    fullName: "Asha Hassan",
    dateOfBirth: "1997-09-21",
    age: "28",
    sex: "Female",
    phone: "+254 700 111 003",
    emergencyContactName: "Hassan Ali",
    emergencyContactPhone: "+254 700 111 004",
    nationality: "Kenyan",
    location: "Nyali, Mombasa",
    incidentId: "MED-001",
    incidentReference: "KRCS-MED-2026-001",
    condition: "Soft tissue injuries and suspected fracture",
    allergies: "Penicillin",
    medicalHistory: "Asthma",
    triage: "Very Urgent",
    status: "Waiting",
    registeredAt: "2026-08-13 14:28",
    notes: "Monitor breathing and pain.",
  },
  {
    id: "PAT-003",
    patientNumber: "PAT-003",
    fullName: "Fatuma Ali",
    dateOfBirth: "1979-02-11",
    age: "47",
    sex: "Female",
    phone: "+254 711 220 001",
    emergencyContactName: "Ali Mohamed",
    emergencyContactPhone: "+254 711 220 002",
    nationality: "Kenyan",
    location: "Likoni, Mombasa",
    incidentId: "MED-002",
    incidentReference: "KRCS-MED-2026-002",
    condition: "Exposure and dehydration",
    allergies: "None reported",
    medicalHistory: "Hypertension",
    triage: "Urgent",
    status: "Stable",
    registeredAt: "2026-08-13 14:12",
    notes: "",
  },
  {
    id: "PAT-004",
    patientNumber: "PAT-004",
    fullName: "Brian Otieno",
    dateOfBirth: "2017-05-18",
    age: "9",
    sex: "Male",
    phone: "",
    emergencyContactName: "Jane Otieno",
    emergencyContactPhone: "+254 722 300 001",
    nationality: "Kenyan",
    location: "Bamburi, Mombasa",
    incidentId: "MED-003",
    incidentReference: "KRCS-MED-2026-003",
    condition: "Respiratory distress",
    allergies: "None reported",
    medicalHistory: "Previous asthma episodes",
    triage: "Immediate",
    status: "Critical",
    registeredAt: "2026-08-13 13:42",
    notes: "Guardian present.",
  },
];

const INITIAL_TEAMS: MedicalTeam[] = [
  {
    id: "TEAM-001",
    teamCode: "MED-TEAM-001",
    name: "Emergency Health Team Alpha",
    leader: "Dr. Amina Hassan",
    specialization: "Emergency & Trauma",
    members: 6,
    phone: "+254 700 500 001",
    baseStation: "Mombasa Operations Centre",
    status: "On Scene",
    certifications: ["Emergency Care", "First Aid", "Trauma Response"],
    createdAt: "2026-01-05",
  },
  {
    id: "TEAM-002",
    teamCode: "MED-TEAM-002",
    name: "Community Medical Team",
    leader: "Faith Atieno",
    specialization: "Community Health",
    members: 8,
    phone: "+254 700 500 002",
    baseStation: "Likoni Response Unit",
    status: "Assigned",
    certifications: ["Community Health", "First Aid"],
    createdAt: "2026-02-11",
  },
  {
    id: "TEAM-003",
    teamCode: "MED-TEAM-003",
    name: "Psychosocial Support Team",
    leader: "Grace Wanjiku",
    specialization: "Mental Health / Psychosocial Support",
    members: 5,
    phone: "+254 700 500 003",
    baseStation: "Mombasa Operations Centre",
    status: "Available",
    certifications: ["Psychosocial Support"],
    createdAt: "2026-03-18",
  },
];

const INITIAL_HOSPITALS: Hospital[] = [
  {
    id: "HOSP-001",
    name: "Coast General Teaching and Referral Hospital",
    facilityType: "National Referral",
    county: "Mombasa",
    subCounty: "Mvita",
    location: "Kisauni Road, Mombasa",
    latitude: -4.0528,
    longitude: 39.6653,
    phone: "+254 41 2314201",
    emergencyPhone: "+254 41 2314201",
    ambulanceReception: true,
    traumaUnit: true,
    maternity: true,
    pediatric: true,
    bloodServices: true,
    verified: true,
    lastVerified: "2026-08-01",
    notes: "Operational capability information requires periodic verification.",
  },
  {
    id: "HOSP-002",
    name: "Pandya Memorial Hospital",
    facilityType: "County Referral",
    county: "Mombasa",
    subCounty: "Mvita",
    location: "Dedan Kimathi Avenue, Mombasa",
    latitude: -4.0606,
    longitude: 39.6667,
    phone: "+254 41 2222231",
    emergencyPhone: "+254 41 2222231",
    ambulanceReception: true,
    traumaUnit: true,
    maternity: true,
    pediatric: true,
    bloodServices: false,
    verified: true,
    lastVerified: "2026-07-28",
    notes: "",
  },
  {
    id: "HOSP-003",
    name: "Likoni Sub-County Hospital",
    facilityType: "Sub-County Hospital",
    county: "Mombasa",
    subCounty: "Likoni",
    location: "Likoni, Mombasa",
    latitude: -4.091,
    longitude: 39.663,
    phone: "",
    emergencyPhone: "",
    ambulanceReception: true,
    traumaUnit: true,
    maternity: true,
    pediatric: true,
    bloodServices: false,
    verified: true,
    lastVerified: "2026-07-20",
    notes: "Confirm current operational capacity before referral.",
  },
  {
    id: "HOSP-004",
    name: "Malindi Sub-County Hospital",
    facilityType: "Sub-County Hospital",
    county: "Kilifi",
    subCounty: "Malindi",
    location: "Malindi, Kilifi",
    latitude: -3.2192,
    longitude: 40.1169,
    phone: "",
    emergencyPhone: "",
    ambulanceReception: true,
    traumaUnit: true,
    maternity: true,
    pediatric: true,
    bloodServices: false,
    verified: false,
    lastVerified: "",
    notes: "Facility capability should be verified before operational use.",
  },
];

const INITIAL_TREATMENTS: TreatmentRecord[] = [
  {
    id: "TRT-001",
    patientId: "PAT-001",
    incidentId: "MED-001",
    clinician: "Dr. Amina Hassan",
    treatmentDate: "2026-08-13 14:35",
    diagnosis: "Multiple trauma",
    interventions: "Primary trauma survey, bleeding control and immobilisation.",
    medication: "Analgesia administered.",
    vitalSigns: "BP 118/76 | Pulse 104 | SpO2 96%",
    response: "Patient stabilised for further assessment.",
    followUp: "Trauma referral recommended.",
    status: "Open",
    createdAt: "2026-08-13 14:36",
  },
];

const INITIAL_REFERRALS: ReferralRecord[] = [
  {
    id: "REF-001",
    patientId: "PAT-001",
    incidentId: "MED-001",
    hospitalId: "HOSP-001",
    reason: "Suspected multiple trauma requiring higher-level trauma care.",
    urgency: "Immediate",
    requestedBy: "Dr. Amina Hassan",
    requestedAt: "2026-08-13 14:42",
    acceptedBy: "",
    acceptedAt: "",
    status: "Requested",
    clinicalNotes: "Patient stabilised before transport.",
    destinationNotes: "",
  },
];

const INITIAL_HANDOVERS: HandoverRecord[] = [];

const INITIAL_FLEET_REQUESTS: FleetRequest[] = [];

const INITIAL_AUDIT: AuditEntry[] = [
  {
    id: "AUD-001",
    action: "Patient Record Viewed",
    entity: "Patient",
    entityId: "PAT-001",
    actor: "Medical Desk",
    timestamp: "2026-08-13 14:45",
    details: "Patient clinical record opened.",
  },
];

/* =========================================================
   HELPERS
========================================================= */

function nowString() {
  return new Date().toLocaleString("en-GB", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function mapsUrl(latitude: number, longitude: number) {
  return `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
}

function priorityClasses(priority: Priority) {
  if (priority === "Critical") {
    return "border-red-200 bg-red-50 text-red-700";
  }

  if (priority === "High") {
    return "border-orange-200 bg-orange-50 text-orange-700";
  }

  if (priority === "Medium") {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  return "border-slate-200 bg-slate-50 text-slate-700";
}

function statusClasses(status: string) {
  if (
    status === "Completed" ||
    status === "Stable" ||
    status === "Available" ||
    status === "Accepted"
  ) {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (
    status === "Critical" ||
    status === "Incoming" ||
    status === "Immediate" ||
    status === "Cancelled"
  ) {
    return "border-red-200 bg-red-50 text-red-700";
  }

  if (
    status === "En Route" ||
    status === "Under Treatment" ||
    status === "Assigned"
  ) {
    return "border-blue-200 bg-blue-50 text-blue-700";
  }

  return "border-slate-200 bg-slate-50 text-slate-700";
}

function Badge({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-bold ${className}`}
    >
      {children}
    </span>
  );
}

function SectionCard({
  title,
  subtitle,
  children,
  actions,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-extrabold text-slate-950">{title}</h2>
          {subtitle && (
            <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
          )}
        </div>

        {actions}
      </div>

      {children}
    </section>
  );
}

function Modal({
  title,
  subtitle,
  onClose,
  children,
  wide = false,
}: {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-3 backdrop-blur-sm sm:p-6">
      <div
        className={`max-h-[94vh] w-full overflow-hidden rounded-2xl bg-white shadow-2xl ${
          wide ? "max-w-6xl" : "max-w-3xl"
        }`}
      >
        <div className="flex items-start justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <h2 className="text-lg font-extrabold text-slate-950">{title}</h2>
            {subtitle && (
              <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close"
          >
            <FaTimes />
          </button>
        </div>

        <div className="max-h-[calc(94vh-80px)] overflow-y-auto p-5">
          {children}
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold text-slate-600">
        {label} {required && <span className="text-red-500">*</span>}
      </span>

      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold text-slate-600">
        {label} {required && <span className="text-red-500">*</span>}
      </span>

      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
      >
        <option value="">Select...</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold text-slate-600">
        {label}
      </span>

      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        rows={3}
        className="w-full resize-y rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
      />
    </label>
  );
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function MedicalSupport() {
  const [activeTab, setActiveTab] = useState<
    | "overview"
    | "incidents"
    | "patients"
    | "teams"
    | "hospitals"
    | "treatments"
    | "referrals"
    | "handovers"
    | "fleet"
    | "audit"
  >("overview");

  const [incidents, setIncidents] =
    useState<MedicalIncident[]>(INITIAL_INCIDENTS);

  const [patients, setPatients] =
    useState<Patient[]>(INITIAL_PATIENTS);

  const [teams, setTeams] =
    useState<MedicalTeam[]>(INITIAL_TEAMS);

  const [hospitals, setHospitals] =
    useState<Hospital[]>(INITIAL_HOSPITALS);

  const [treatments, setTreatments] =
    useState<TreatmentRecord[]>(INITIAL_TREATMENTS);

  const [referrals, setReferrals] =
    useState<ReferralRecord[]>(INITIAL_REFERRALS);

  const [handovers, setHandovers] =
    useState<HandoverRecord[]>(INITIAL_HANDOVERS);

  const [fleetRequests, setFleetRequests] =
    useState<FleetRequest[]>(INITIAL_FLEET_REQUESTS);

  const [audit, setAudit] =
    useState<AuditEntry[]>(INITIAL_AUDIT);

  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] =
    useState<"All" | Priority>("All");

  const [selectedIncidentId, setSelectedIncidentId] =
    useState<string | null>("MED-001");

  const [selectedPatientId, setSelectedPatientId] =
    useState<string | null>("PAT-001");

  const [selectedTeamId, setSelectedTeamId] =
    useState<string | null>(null);

  const [selectedHospitalId, setSelectedHospitalId] =
    useState<string | null>(null);

  const [selectedTreatmentId, setSelectedTreatmentId] =
    useState<string | null>(null);

  const [selectedReferralId, setSelectedReferralId] =
    useState<string | null>(null);

  const [selectedHandoverId, setSelectedHandoverId] =
    useState<string | null>(null);

  const [showPatientModal, setShowPatientModal] =
    useState(false);

  const [showTeamModal, setShowTeamModal] =
    useState(false);

  const [showTreatmentModal, setShowTreatmentModal] =
    useState(false);

  const [showHandoverModal, setShowHandoverModal] =
    useState(false);

  const [showHospitalModal, setShowHospitalModal] =
    useState(false);

  const [showReferralModal, setShowReferralModal] =
    useState(false);

  const [showFleetModal, setShowFleetModal] =
    useState(false);

  const [editingPatientId, setEditingPatientId] =
    useState<string | null>(null);

  const [editingTeamId, setEditingTeamId] =
    useState<string | null>(null);

  const [message, setMessage] = useState("");

  /* =========================================================
     FORM STATE
  ========================================================= */

  const emptyPatient = {
    fullName: "",
    dateOfBirth: "",
    age: "",
    sex: "Unknown" as Patient["sex"],
    phone: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    nationality: "Kenyan",
    location: "",
    incidentId: "MED-001",
    condition: "",
    allergies: "",
    medicalHistory: "",
    triage: "Urgent" as Severity,
    status: "Waiting" as PatientStatus,
    notes: "",
  };

  const [newPatient, setNewPatient] =
    useState(emptyPatient);

  const [newTeam, setNewTeam] = useState({
    name: "",
    leader: "",
    specialization: "",
    members: "1",
    phone: "",
    baseStation: "",
    status: "Available" as MedicalTeamStatus,
    certifications: "",
  });

  const [newTreatment, setNewTreatment] = useState({
    patientId: "PAT-001",
    clinician: "",
    diagnosis: "",
    interventions: "",
    medication: "",
    vitalSigns: "",
    response: "",
    followUp: "",
  });

  const [newHandover, setNewHandover] = useState({
    patientId: "PAT-001",
    hospitalId: "HOSP-001",
    receivingClinician: "",
    receivingDepartment: "",
    conditionAtHandover: "",
    treatmentSummary: "",
    medicationGiven: "",
    outstandingNeeds: "",
  });

  const [newReferral, setNewReferral] = useState({
    patientId: "PAT-001",
    hospitalId: "HOSP-001",
    reason: "",
    urgency: "Immediate" as Severity,
    clinicalNotes: "",
    destinationNotes: "",
  });

  const [newFleetRequest, setNewFleetRequest] = useState({
    patientId: "PAT-001",
    requestType: "Medical Transport" as FleetRequest["requestType"],
    priority: "High" as Priority,
    destination: "",
    notes: "",
  });

  const [newHospital, setNewHospital] = useState({
    name: "",
    facilityType: "County Referral" as Hospital["facilityType"],
    county: "",
    subCounty: "",
    location: "",
    latitude: "",
    longitude: "",
    phone: "",
    emergencyPhone: "",
    ambulanceReception: false,
    traumaUnit: false,
    maternity: false,
    pediatric: false,
    bloodServices: false,
    notes: "",
  });

  /* =========================================================
     DERIVED DATA
  ========================================================= */


  const selectedPatient = patients.find(
    (patient) => patient.id === selectedPatientId
  );






  const filteredIncidents = useMemo(() => {
    const normalized = search.toLowerCase().trim();

    return incidents.filter((incident) => {
      const matchesSearch =
        !normalized ||
        incident.reference.toLowerCase().includes(normalized) ||
        incident.title.toLowerCase().includes(normalized) ||
        incident.location.toLowerCase().includes(normalized) ||
        incident.type.toLowerCase().includes(normalized);

      const matchesPriority =
        priorityFilter === "All" ||
        incident.priority === priorityFilter;

      return matchesSearch && matchesPriority;
    });
  }, [incidents, search, priorityFilter]);

  const filteredPatients = useMemo(() => {
    const normalized = search.toLowerCase().trim();

    return patients.filter((patient) => {
      if (!normalized) return true;

      return (
        patient.fullName.toLowerCase().includes(normalized) ||
        patient.patientNumber.toLowerCase().includes(normalized) ||
        patient.phone.toLowerCase().includes(normalized) ||
        patient.condition.toLowerCase().includes(normalized)
      );
    });
  }, [patients, search]);

  const filteredHospitals = useMemo(() => {
    const normalized = search.toLowerCase().trim();

    return hospitals.filter((hospital) => {
      if (!normalized) return true;

      return (
        hospital.name.toLowerCase().includes(normalized) ||
        hospital.county.toLowerCase().includes(normalized) ||
        hospital.subCounty.toLowerCase().includes(normalized) ||
        hospital.location.toLowerCase().includes(normalized)
      );
    });
  }, [hospitals, search]);

  const openIncidents = incidents.filter(
    (incident) =>
      !["Completed", "Cancelled"].includes(incident.status)
  );

  const criticalPatients = patients.filter(
    (patient) =>
      patient.triage === "Immediate" ||
      patient.status === "Critical"
  );

  const availableTeams = teams.filter(
    (team) => team.status === "Available"
  );

  /* =========================================================
     AUDIT
  ========================================================= */

  function addAudit(
    action: string,
    entity: string,
    entityId: string,
    details: string
  ) {
    const entry: AuditEntry = {
      id: `AUD-${Date.now()}`,
      action,
      entity,
      entityId,
      actor: "Medical Desk",
      timestamp: nowString(),
      details,
    };

    setAudit((current) => [entry, ...current]);
  }

  /* =========================================================
     PATIENTS
  ========================================================= */

  function openNewPatient() {
    setEditingPatientId(null);

    setNewPatient({
      ...emptyPatient,
      incidentId:
        selectedIncidentId || "MED-001",
    });

    setShowPatientModal(true);
  }

  function openEditPatient(patient: Patient) {
    setEditingPatientId(patient.id);

    setNewPatient({
      fullName: patient.fullName,
      dateOfBirth: patient.dateOfBirth,
      age: patient.age,
      sex: patient.sex,
      phone: patient.phone,
      emergencyContactName:
        patient.emergencyContactName,
      emergencyContactPhone:
        patient.emergencyContactPhone,
      nationality: patient.nationality,
      location: patient.location,
      incidentId: patient.incidentId,
      condition: patient.condition,
      allergies: patient.allergies,
      medicalHistory: patient.medicalHistory,
      triage: patient.triage,
      status: patient.status,
      notes: patient.notes,
    });

    setShowPatientModal(true);
  }

  function savePatient() {
    if (!newPatient.fullName.trim()) {
      setMessage("Patient full name is required.");
      return;
    }

    const incident = incidents.find(
      (item) => item.id === newPatient.incidentId
    );

    if (editingPatientId) {
      setPatients((current) =>
        current.map((patient) =>
          patient.id === editingPatientId
            ? {
                ...patient,
                ...newPatient,
                incidentReference:
                  incident?.reference || "",
              }
            : patient
        )
      );

      addAudit(
        "Patient Record Updated",
        "Patient",
        editingPatientId,
        `Updated clinical record for ${newPatient.fullName}.`
      );

      setMessage("Patient record updated successfully.");
    } else {
      const id = `PAT-${String(
        patients.length + 1
      ).padStart(3, "0")}`;

      const patient: Patient = {
        id,
        patientNumber: id,
        ...newPatient,
        incidentReference:
          incident?.reference || "",
        registeredAt: nowString(),
      };

      setPatients((current) => [
        patient,
        ...current,
      ]);

      if (incident) {
        setIncidents((current) =>
          current.map((item) =>
            item.id === incident.id
              ? {
                  ...item,
                  patientIds: [
                    ...item.patientIds,
                    patient.id,
                  ],
                  affectedPersons:
                    Math.max(
                      item.affectedPersons,
                      item.patientIds.length + 1
                    ),
                }
              : item
          )
        );
      }

      addAudit(
        "Patient Registered",
        "Patient",
        id,
        `Registered patient ${newPatient.fullName}.`
      );

      setSelectedPatientId(id);
      setMessage("Patient registered successfully.");
    }

    setShowPatientModal(false);
    setEditingPatientId(null);
  }

  /* =========================================================
     MEDICAL TEAMS
  ========================================================= */

  function saveTeam() {
    if (
      !newTeam.name.trim() ||
      !newTeam.leader.trim() ||
      !newTeam.specialization
    ) {
      setMessage(
        "Team name, leader and specialization are required."
      );
      return;
    }

    if (editingTeamId) {
      setTeams((current) =>
        current.map((team) =>
          team.id === editingTeamId
            ? {
                ...team,
                name: newTeam.name,
                leader: newTeam.leader,
                specialization:
                  newTeam.specialization,
                members: Number(newTeam.members) || 1,
                phone: newTeam.phone,
                baseStation:
                  newTeam.baseStation,
                status: newTeam.status,
                certifications:
                  newTeam.certifications
                    .split(",")
                    .map((item) => item.trim())
                    .filter(Boolean),
              }
            : team
        )
      );

      addAudit(
        "Medical Team Updated",
        "MedicalTeam",
        editingTeamId,
        `Updated ${newTeam.name}.`
      );

      setMessage("Medical team updated.");
    } else {
      const id = `TEAM-${String(
        teams.length + 1
      ).padStart(3, "0")}`;

      const team: MedicalTeam = {
        id,
        teamCode: `MED-TEAM-${String(
          teams.length + 1
        ).padStart(3, "0")}`,
        name: newTeam.name,
        leader: newTeam.leader,
        specialization:
          newTeam.specialization,
        members: Number(newTeam.members) || 1,
        phone: newTeam.phone,
        baseStation: newTeam.baseStation,
        status: newTeam.status,
        certifications:
          newTeam.certifications
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean),
        createdAt: nowString(),
      };

      setTeams((current) => [
        ...current,
        team,
      ]);

      addAudit(
        "Medical Team Registered",
        "MedicalTeam",
        id,
        `Registered ${team.name}.`
      );

      setMessage("Medical team registered.");
    }

    setShowTeamModal(false);
    setEditingTeamId(null);
  }

  function editTeam(team: MedicalTeam) {
    setEditingTeamId(team.id);

    setNewTeam({
      name: team.name,
      leader: team.leader,
      specialization:
        team.specialization,
      members: String(team.members),
      phone: team.phone,
      baseStation:
        team.baseStation,
      status: team.status,
      certifications:
        team.certifications.join(", "),
    });

    setShowTeamModal(true);
  }

  function assignTeamToIncident(
    incidentId: string,
    teamId: string
  ) {
    const team = teams.find(
      (item) => item.id === teamId
    );

    if (!team) return;

    setIncidents((current) =>
      current.map((incident) =>
        incident.id === incidentId
          ? {
              ...incident,
              assignedTeamId: teamId,
              status: "Team Assigned",
            }
          : incident
      )
    );

    setTeams((current) =>
      current.map((item) =>
        item.id === teamId
          ? {
              ...item,
              status: "Assigned",
            }
          : item
      )
    );

    addAudit(
      "Medical Team Assigned",
      "MedicalIncident",
      incidentId,
      `${team.name} assigned to incident.`
    );

    setMessage(
      `${team.name} assigned successfully.`
    );
  }

  /* =========================================================
     INCIDENT ACTIONS
  ========================================================= */

  function acceptIncident(incidentId: string) {
    setIncidents((current) =>
      current.map((incident) =>
        incident.id === incidentId
          ? {
              ...incident,
              status: "Accepted",
            }
          : incident
      )
    );

    addAudit(
      "Incident Accepted",
      "MedicalIncident",
      incidentId,
      "Incoming medical incident accepted by medical desk."
    );

    setMessage("Medical incident accepted.");
  }

  function updateIncidentStatus(
    incidentId: string,
    status: MedicalIncidentStatus
  ) {
    setIncidents((current) =>
      current.map((incident) =>
        incident.id === incidentId
          ? {
              ...incident,
              status,
            }
          : incident
      )
    );

    addAudit(
      "Incident Status Updated",
      "MedicalIncident",
      incidentId,
      `Incident status changed to ${status}.`
    );

    setMessage(
      `Incident status changed to ${status}.`
    );
  }

  function openIncidentLocation(
    incident: MedicalIncident
  ) {
    addAudit(
      "GIS Location Opened",
      "MedicalIncident",
      incident.id,
      `Opened location for ${incident.reference}.`
    );

    window.open(
      mapsUrl(
        incident.latitude,
        incident.longitude
      ),
      "_blank",
      "noopener,noreferrer"
    );
  }

  /* =========================================================
     TREATMENT
  ========================================================= */

  function saveTreatment() {
    const patient = patients.find(
      (item) => item.id === newTreatment.patientId
    );

    if (
      !patient ||
      !newTreatment.clinician.trim() ||
      !newTreatment.diagnosis.trim()
    ) {
      setMessage(
        "Patient, clinician and diagnosis are required."
      );
      return;
    }

    const treatment: TreatmentRecord = {
      id: `TRT-${String(
        treatments.length + 1
      ).padStart(3, "0")}`,
      patientId: patient.id,
      incidentId: patient.incidentId,
      clinician: newTreatment.clinician,
      treatmentDate: nowString(),
      diagnosis: newTreatment.diagnosis,
      interventions:
        newTreatment.interventions,
      medication:
        newTreatment.medication,
      vitalSigns:
        newTreatment.vitalSigns,
      response:
        newTreatment.response,
      followUp:
        newTreatment.followUp,
      status: "Open",
      createdAt: nowString(),
    };

    setTreatments((current) => [
      treatment,
      ...current,
    ]);

    setPatients((current) =>
      current.map((item) =>
        item.id === patient.id
          ? {
              ...item,
              status: "Under Treatment",
            }
          : item
      )
    );

    addAudit(
      "Treatment Record Created",
      "Treatment",
      treatment.id,
      `Treatment record created for ${patient.fullName}.`
    );

    setSelectedTreatmentId(
      treatment.id
    );

    setShowTreatmentModal(false);

    setMessage(
      "Treatment record saved successfully."
    );
  }

  /* =========================================================
     HOSPITALS
  ========================================================= */

  function saveHospital() {
    if (
      !newHospital.name.trim() ||
      !newHospital.county ||
      !newHospital.subCounty
    ) {
      setMessage(
        "Facility name, county and sub-county are required."
      );
      return;
    }

    const latitude =
      Number(newHospital.latitude) || 0;

    const longitude =
      Number(newHospital.longitude) || 0;

    const hospital: Hospital = {
      id: `HOSP-${String(
        hospitals.length + 1
      ).padStart(3, "0")}`,
      name: newHospital.name,
      facilityType:
        newHospital.facilityType,
      county: newHospital.county,
      subCounty:
        newHospital.subCounty,
      location:
        newHospital.location,
      latitude,
      longitude,
      phone:
        newHospital.phone,
      emergencyPhone:
        newHospital.emergencyPhone,
      ambulanceReception:
        newHospital.ambulanceReception,
      traumaUnit:
        newHospital.traumaUnit,
      maternity:
        newHospital.maternity,
      pediatric:
        newHospital.pediatric,
      bloodServices:
        newHospital.bloodServices,
      verified: false,
      lastVerified: "",
      notes: newHospital.notes,
    };

    setHospitals((current) => [
      ...current,
      hospital,
    ]);

    addAudit(
      "Referral Facility Added",
      "Hospital",
      hospital.id,
      `Added ${hospital.name} to referral directory.`
    );

    setShowHospitalModal(false);

    setNewHospital({
      name: "",
      facilityType:
        "County Referral",
      county: "",
      subCounty: "",
      location: "",
      latitude: "",
      longitude: "",
      phone: "",
      emergencyPhone: "",
      ambulanceReception: false,
      traumaUnit: false,
      maternity: false,
      pediatric: false,
      bloodServices: false,
      notes: "",
    });

    setMessage(
      "Referral facility added. Operational capabilities remain subject to verification."
    );
  }

  /* =========================================================
     REFERRALS
  ========================================================= */

  function startReferral() {
    const patient = patients.find(
      (item) => item.id === newReferral.patientId
    );

    const hospital = hospitals.find(
      (item) => item.id === newReferral.hospitalId
    );

    if (
      !patient ||
      !hospital ||
      !newReferral.reason.trim()
    ) {
      setMessage(
        "Patient, destination hospital and referral reason are required."
      );
      return;
    }

    const referral: ReferralRecord = {
      id: `REF-${String(
        referrals.length + 1
      ).padStart(3, "0")}`,
      patientId: patient.id,
      incidentId: patient.incidentId,
      hospitalId: hospital.id,
      reason: newReferral.reason,
      urgency: newReferral.urgency,
      requestedBy: "Medical Desk",
      requestedAt: nowString(),
      acceptedBy: "",
      acceptedAt: "",
      status: "Requested",
      clinicalNotes:
        newReferral.clinicalNotes,
      destinationNotes:
        newReferral.destinationNotes,
    };

    setReferrals((current) => [
      referral,
      ...current,
    ]);

    addAudit(
      "Referral Started",
      "Referral",
      referral.id,
      `Referral started for ${patient.fullName} to ${hospital.name}.`
    );

    setSelectedReferralId(
      referral.id
    );

    setShowReferralModal(false);

    setMessage(
      `Referral request sent to ${hospital.name}.`
    );
  }

  function updateReferralStatus(
    referralId: string,
    status: ReferralStatus
  ) {
    setReferrals((current) =>
      current.map((referral) =>
        referral.id === referralId
          ? {
              ...referral,
              status,
              acceptedBy:
                status === "Accepted"
                  ? "Receiving Facility"
                  : referral.acceptedBy,
              acceptedAt:
                status === "Accepted"
                  ? nowString()
                  : referral.acceptedAt,
            }
          : referral
      )
    );

    addAudit(
      "Referral Status Updated",
      "Referral",
      referralId,
      `Referral status changed to ${status}.`
    );

    setMessage(
      `Referral status changed to ${status}.`
    );
  }

  /* =========================================================
     HANDOVER
  ========================================================= */

  function saveHandover() {
    const patient = patients.find(
      (item) => item.id === newHandover.patientId
    );

    const hospital = hospitals.find(
      (item) => item.id === newHandover.hospitalId
    );

    if (
      !patient ||
      !hospital ||
      !newHandover.receivingClinician.trim()
    ) {
      setMessage(
        "Patient, hospital and receiving clinician are required."
      );
      return;
    }

    const handover: HandoverRecord = {
      id: `HAND-${String(
        handovers.length + 1
      ).padStart(3, "0")}`,
      patientId: patient.id,
      incidentId: patient.incidentId,
      hospitalId: hospital.id,
      receivingClinician:
        newHandover.receivingClinician,
      receivingDepartment:
        newHandover.receivingDepartment,
      handoverTime: nowString(),
      conditionAtHandover:
        newHandover.conditionAtHandover,
      treatmentSummary:
        newHandover.treatmentSummary,
      medicationGiven:
        newHandover.medicationGiven,
      outstandingNeeds:
        newHandover.outstandingNeeds,
      status: "Completed",
    };

    setHandovers((current) => [
      handover,
      ...current,
    ]);

    setPatients((current) =>
      current.map((item) =>
        item.id === patient.id
          ? {
              ...item,
              status: "Transferred",
            }
          : item
      )
    );

    const referral = referrals.find(
      (item) =>
        item.patientId === patient.id &&
        item.hospitalId === hospital.id &&
        item.status !== "Completed"
    );

    if (referral) {
      setReferrals((current) =>
        current.map((item) =>
          item.id === referral.id
            ? {
                ...item,
                status: "Completed",
              }
            : item
        )
      );
    }

    addAudit(
      "Hospital Handover Completed",
      "Handover",
      handover.id,
      `Hospital handover completed for ${patient.fullName}.`
    );

    setSelectedHandoverId(
      handover.id
    );

    setShowHandoverModal(false);

    setMessage(
      "Hospital handover recorded successfully."
    );
  }

  /* =========================================================
     FLEET REQUEST / ALERT ARCHITECTURE
  ========================================================= */

  function requestFleetSupport() {
    const patient = patients.find(
      (item) => item.id === newFleetRequest.patientId
    );

    if (!patient) {
      setMessage("Select a patient first.");
      return;
    }

    const request: FleetRequest = {
      id: `FLTREQ-${String(
        fleetRequests.length + 1
      ).padStart(3, "0")}`,
      incidentId: patient.incidentId,
      patientId: patient.id,
      requestType:
        newFleetRequest.requestType,
      priority:
        newFleetRequest.priority,
      requestedAt: nowString(),
      requestedBy: "Medical Desk",
      destination:
        newFleetRequest.destination,
      status: "Requested",
      alertStatus: "Sent",
      notes:
        newFleetRequest.notes,
    };

    setFleetRequests((current) => [
      request,
      ...current,
    ]);

    addAudit(
      "Fleet Support Requested",
      "FleetRequest",
      request.id,
      `Medical fleet request created for ${patient.fullName}.`
    );

    setShowFleetModal(false);

    setMessage(
      "Fleet Control request created. The architecture is ready for Firebase Cloud Messaging to alert fleet control, drivers and responders."
    );
  }

  function updateFleetRequestStatus(
    requestId: string,
    status: FleetRequestStatus
  ) {
    setFleetRequests((current) =>
      current.map((request) =>
        request.id === requestId
          ? {
              ...request,
              status,
            }
          : request
      )
    );

    addAudit(
      "Fleet Request Updated",
      "FleetRequest",
      requestId,
      `Fleet request status changed to ${status}.`
    );

    setMessage(
      `Fleet request updated to ${status}.`
    );
  }

  /* =========================================================
     REPORTS
  ========================================================= */

  function exportCsv(
    filename: string,
    rows: Record<string, string | number>[]
  ) {
    if (!rows.length) {
      setMessage("There is no data to export.");
      return;
    }

    const headers = Object.keys(rows[0]);

    const csv = [
      headers.join(","),
      ...rows.map((row) =>
        headers
          .map((header) => {
            const value =
              row[header] ?? "";

            return `"${String(value)
              .replace(/"/g, '""')}"`;
          })
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url =
      URL.createObjectURL(blob);

    const anchor =
      document.createElement("a");

    anchor.href = url;
    anchor.download = filename;
    anchor.click();

    URL.revokeObjectURL(url);

    setMessage(
      `${filename} downloaded successfully.`
    );
  }

  function exportMedicalReport() {
    exportCsv(
      "redcross-medical-report.csv",
      patients.map((patient) => ({
        PatientID:
          patient.patientNumber,
        FullName:
          patient.fullName,
        Age: patient.age,
        Sex: patient.sex,
        Phone: patient.phone,
        Incident:
          patient.incidentReference,
        Condition:
          patient.condition,
        Triage:
          patient.triage,
        Status:
          patient.status,
        RegisteredAt:
          patient.registeredAt,
      }))
    );
  }

  function exportIncidentReport() {
    exportCsv(
      "redcross-medical-incidents.csv",
      incidents.map((incident) => ({
        Reference:
          incident.reference,
        Incident:
          incident.title,
        Type: incident.type,
        Location:
          incident.location,
        Priority:
          incident.priority,
        Status:
          incident.status,
        AffectedPersons:
          incident.affectedPersons,
        ReportedAt:
          incident.reportedAt,
      }))
    );
  }

  function exportHospitalReport() {
    exportCsv(
      "redcross-referral-facilities.csv",
      hospitals.map((hospital) => ({
        Facility:
          hospital.name,
        Type:
          hospital.facilityType,
        County:
          hospital.county,
        SubCounty:
          hospital.subCounty,
        Location:
          hospital.location,
        Verified:
          hospital.verified
            ? "Yes"
            : "No",
        LastVerified:
          hospital.lastVerified,
      }))
    );
  }

  function printCurrentModule() {
    window.print();
  }

  /* =========================================================
     TABS
  ========================================================= */

  const tabs = [
    {
      id: "overview",
      label: "Overview",
      icon: <FaNotesMedical />,
    },
    {
      id: "incidents",
      label: "Incidents",
      icon: <FaExclamationTriangle />,
    },
    {
      id: "patients",
      label: "Patients",
      icon: <FaWheelchair />,
    },
    {
      id: "teams",
      label: "Medical Teams",
      icon: <FaUserMd />,
    },
    {
      id: "hospitals",
      label: "Hospitals",
      icon: <FaHospital />,
    },
    {
      id: "treatments",
      label: "Treatment",
      icon: <FaStethoscope />,
    },
    {
      id: "referrals",
      label: "Referrals",
      icon: <FaArrowRight />,
    },
    {
      id: "handovers",
      label: "Handover",
      icon: <FaCheckCircle />,
    },
    {
      id: "fleet",
      label: "Fleet Requests",
      icon: <FaTruck />,
    },
    {
      id: "audit",
      label: "Audit Trail",
      icon: <FaShieldAlt />,
    },
  ] as const;

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="min-h-full space-y-6 bg-slate-50 p-3 sm:p-5 lg:p-6">
      {/* HEADER */}

      <header className="overflow-hidden rounded-3xl bg-gradient-to-r from-red-700 via-red-600 to-rose-600 text-white shadow-lg">
        <div className="flex flex-col gap-5 p-5 sm:p-7 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-white/15 p-3 text-2xl backdrop-blur">
              <FaNotesMedical />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-black sm:text-3xl">
                  Medical Support
                </h1>

                <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider">
                  Humanitarian Medical Operations
                </span>
              </div>

              <p className="mt-2 max-w-3xl text-sm leading-6 text-red-50">
                Manage incoming medical incidents, patient records,
                triage, medical teams, referrals, treatment,
                hospital handovers and requests to Fleet Control.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={exportMedicalReport}
              className="rounded-xl bg-white px-4 py-2.5 text-xs font-extrabold text-red-700 shadow-sm transition hover:bg-red-50"
            >
              <FaFileAlt className="mr-2 inline" />
              Patient Report
            </button>

            <button
              type="button"
              onClick={printCurrentModule}
              className="rounded-xl border border-white/30 bg-white/10 px-4 py-2.5 text-xs font-extrabold text-white transition hover:bg-white/20"
            >
              Print
            </button>
          </div>
        </div>
      </header>

      {/* MESSAGE */}

      {message && (
        <div className="flex items-center justify-between rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-800">
          <span>{message}</span>

          <button
            type="button"
            onClick={() => setMessage("")}
            className="rounded-lg p-1 hover:bg-blue-100"
          >
            <FaTimes />
          </button>
        </div>
      )}

      {/* KPI */}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <button
          type="button"
          onClick={() =>
            setActiveTab("incidents")
          }
          className="rounded-2xl border border-red-100 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <span className="rounded-xl bg-red-50 p-3 text-red-600">
              <FaBell />
            </span>

            <Badge
              className={
                openIncidents.length
                  ? "border-red-200 bg-red-50 text-red-700"
                  : "border-emerald-200 bg-emerald-50 text-emerald-700"
              }
            >
              Live Queue
            </Badge>
          </div>

          <p className="mt-5 text-3xl font-black text-slate-950">
            {openIncidents.length}
          </p>

          <p className="mt-1 text-xs font-bold text-slate-500">
            Open Medical Incidents
          </p>
        </button>

        <button
          type="button"
          onClick={() =>
            setActiveTab("patients")
          }
          className="rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <span className="inline-flex rounded-xl bg-blue-50 p-3 text-blue-600">
            <FaWheelchair />
          </span>

          <p className="mt-5 text-3xl font-black text-slate-950">
            {patients.length}
          </p>

          <p className="mt-1 text-xs font-bold text-slate-500">
            Registered Patients
          </p>
        </button>

        <button
          type="button"
          onClick={() =>
            setActiveTab("patients")
          }
          className="rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <span className="inline-flex rounded-xl bg-red-50 p-3 text-red-600">
            <FaExclamationTriangle />
          </span>

          <p className="mt-5 text-3xl font-black text-slate-950">
            {criticalPatients.length}
          </p>

          <p className="mt-1 text-xs font-bold text-slate-500">
            Immediate / Critical
          </p>
        </button>

        <button
          type="button"
          onClick={() =>
            setActiveTab("teams")
          }
          className="rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <span className="inline-flex rounded-xl bg-emerald-50 p-3 text-emerald-600">
            <FaUsers />
          </span>

          <p className="mt-5 text-3xl font-black text-slate-950">
            {availableTeams.length}
          </p>

          <p className="mt-1 text-xs font-bold text-slate-500">
            Teams Available
          </p>
        </button>

        <button
          type="button"
          onClick={() =>
            setActiveTab("referrals")
          }
          className="rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <span className="inline-flex rounded-xl bg-purple-50 p-3 text-purple-600">
            <FaHospital />
          </span>

          <p className="mt-5 text-3xl font-black text-slate-950">
            {
              referrals.filter(
                (item) =>
                  item.status !== "Completed" &&
                  item.status !== "Cancelled"
              ).length
            }
          </p>

          <p className="mt-1 text-xs font-bold text-slate-500">
            Active Referrals
          </p>
        </button>
      </section>

      {/* TABS */}

      <div className="sticky top-0 z-20 overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex min-w-max gap-1 p-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() =>
                setActiveTab(tab.id)
              }
              className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-extrabold transition sm:px-4 ${
                activeTab === tab.id
                  ? "bg-red-600 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* =====================================================
          OVERVIEW
      ===================================================== */}

      {activeTab === "overview" && (
        <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
          <SectionCard
            title="Incoming Medical Incident Queue"
            subtitle="Medical requests requiring review, acceptance or response."
            actions={
              <button
                type="button"
                onClick={() =>
                  setActiveTab("incidents")
                }
                className="rounded-xl bg-red-600 px-4 py-2 text-xs font-extrabold text-white hover:bg-red-700"
              >
                Open Queue
              </button>
            }
          >
            <div className="divide-y divide-slate-100">
              {openIncidents
                .slice(0, 5)
                .map((incident) => (
                  <div
                    key={incident.id}
                    className="p-5"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex gap-4">
                        <div
                          className={`mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                            incident.priority ===
                            "Critical"
                              ? "bg-red-100 text-red-600"
                              : "bg-blue-50 text-blue-600"
                          }`}
                        >
                        </div>

                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-extrabold text-slate-950">
                              {incident.title}
                            </h3>

                            <Badge
                              className={priorityClasses(
                                incident.priority
                              )}
                            >
                              {incident.priority}
                            </Badge>

                            <Badge
                              className={statusClasses(
                                incident.status
                              )}
                            >
                              {incident.status}
                            </Badge>
                          </div>

                          <p className="mt-1 text-xs font-semibold text-slate-500">
                            {incident.reference}
                          </p>

                          <div className="mt-2 flex flex-wrap gap-4 text-xs text-slate-500">
                            <span>
                              <FaMapMarkerAlt className="mr-1 inline text-red-500" />
                              {incident.location}
                            </span>

                            <span>
                              <FaClock className="mr-1 inline" />
                              {incident.reportedAt}
                            </span>

                            <span>
                              <FaUsers className="mr-1 inline" />
                              {incident.affectedPersons} affected
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedIncidentId(
                              incident.id
                            );
                            setActiveTab(
                              "incidents"
                            );
                          }}
                          className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                        >
                          Details
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            openIncidentLocation(
                              incident
                            )
                          }
                          className="rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700 hover:bg-blue-100"
                        >
                          <FaMapMarkerAlt className="mr-1 inline" />
                          GIS
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </SectionCard>

          <SectionCard
            title="Medical Operations"
            subtitle="Quick access to operational records."
          >
            <div className="grid gap-3 p-5">
              <button
                type="button"
                onClick={openNewPatient}
                className="flex items-center justify-between rounded-xl border border-slate-200 p-4 text-left hover:border-red-200 hover:bg-red-50"
              >
                <span className="flex items-center gap-3">
                  <FaUserPlus className="text-red-600" />
                  <span>
                    <strong className="block text-sm">
                      Register Patient
                    </strong>
                    <small className="text-xs text-slate-500">
                      Create a complete patient record.
                    </small>
                  </span>
                </span>

                <FaChevronRight className="text-slate-400" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab("teams");
                  setShowTeamModal(true);
                }}
                className="flex items-center justify-between rounded-xl border border-slate-200 p-4 text-left hover:border-red-200 hover:bg-red-50"
              >
                <span className="flex items-center gap-3">
                  <FaUsers className="text-red-600" />
                  <span>
                    <strong className="block text-sm">
                      Register Medical Team
                    </strong>
                    <small className="text-xs text-slate-500">
                      Add specialist response teams.
                    </small>
                  </span>
                </span>

                <FaChevronRight className="text-slate-400" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab("hospitals");
                  setShowHospitalModal(true);
                }}
                className="flex items-center justify-between rounded-xl border border-slate-200 p-4 text-left hover:border-red-200 hover:bg-red-50"
              >
                <span className="flex items-center gap-3">
                  <FaHospital className="text-red-600" />
                  <span>
                    <strong className="block text-sm">
                      Add Referral Facility
                    </strong>
                    <small className="text-xs text-slate-500">
                      Expand the referral directory.
                    </small>
                  </span>
                </span>

                <FaChevronRight className="text-slate-400" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab("fleet");
                  setShowFleetModal(true);
                }}
                className="flex items-center justify-between rounded-xl border border-slate-200 p-4 text-left hover:border-red-200 hover:bg-red-50"
              >
                <span className="flex items-center gap-3">
                  <FaTruck className="text-red-600" />
                  <span>
                    <strong className="block text-sm">
                      Request Fleet Support
                    </strong>
                    <small className="text-xs text-slate-500">
                      Send transport request to Fleet Control.
                    </small>
                  </span>
                </span>

                <FaChevronRight className="text-slate-400" />
              </button>
            </div>
          </SectionCard>
        </div>
      )}

      {/* =====================================================
          INCIDENTS
      ===================================================== */}

      {activeTab === "incidents" && (
        <div className="space-y-6">
          <SectionCard
            title="Medical Incident Queue"
            subtitle="All medical incident types are supported."
            actions={
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={exportIncidentReport}
                  className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  <FaFileAlt className="mr-1 inline" />
                  Export
                </button>

                <button
                  type="button"
                  onClick={printCurrentModule}
                  className="rounded-xl bg-slate-900 px-3 py-2 text-xs font-bold text-white hover:bg-slate-800"
                >
                  Print
                </button>
              </div>
            }
          >
            <div className="flex flex-col gap-3 border-b border-slate-100 p-4 lg:flex-row">
              <div className="relative flex-1">
                <FaSearch className="absolute left-3 top-3.5 text-slate-400" />

                <input
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Search incident reference, type, title or location..."
                  className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-3 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                />
              </div>

              <select
                value={priorityFilter}
                onChange={(event) =>
                  setPriorityFilter(
                    event.target.value as
                      | "All"
                      | Priority
                  )
                }
                className="rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-red-500"
              >
                <option value="All">
                  All Priorities
                </option>
                <option value="Critical">
                  Critical
                </option>
                <option value="High">
                  High
                </option>
                <option value="Medium">
                  Medium
                </option>
                <option value="Low">
                  Low
                </option>
              </select>
            </div>

            <div className="grid gap-4 p-4">
              {filteredIncidents.map(
                (incident) => {
                  const team =
                    teams.find(
                      (item) =>
                        item.id ===
                        incident.assignedTeamId
                    );

                  return (
                    <article
                      key={incident.id}
                      className={`rounded-2xl border p-5 transition ${
                        selectedIncidentId ===
                        incident.id
                          ? "border-red-300 bg-red-50/40"
                          : "border-slate-200 bg-white"
                      }`}
                    >
                      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                        <div className="flex gap-4">
                          <div className="rounded-xl bg-red-100 p-3 text-red-600">
                            <FaExclamationTriangle />
                          </div>

                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-base font-black text-slate-950">
                                {incident.title}
                              </h3>

                              <Badge
                                className={priorityClasses(
                                  incident.priority
                                )}
                              >
                                {incident.priority}
                              </Badge>

                              <Badge
                                className={statusClasses(
                                  incident.status
                                )}
                              >
                                {incident.status}
                              </Badge>
                            </div>

                            <p className="mt-1 text-xs font-bold text-slate-500">
                              {incident.reference} •{" "}
                              {incident.type}
                            </p>

                            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                              <div>
                                <small className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                  Location
                                </small>
                                <span className="text-xs font-semibold text-slate-700">
                                  {incident.location}
                                </span>
                              </div>

                              <div>
                                <small className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                  Reported
                                </small>
                                <span className="text-xs font-semibold text-slate-700">
                                  {incident.reportedAt}
                                </span>
                              </div>

                              <div>
                                <small className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                  Affected
                                </small>
                                <span className="text-xs font-semibold text-slate-700">
                                  {incident.affectedPersons}
                                </span>
                              </div>

                              <div>
                                <small className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                  Medical Team
                                </small>
                                <span className="text-xs font-semibold text-slate-700">
                                  {team?.name ||
                                    "Not assigned"}
                                </span>
                              </div>
                            </div>

                            <p className="mt-4 rounded-xl bg-slate-50 p-3 text-xs leading-5 text-slate-600">
                              {incident.notes}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 xl:max-w-xs xl:justify-end">
                          {incident.status ===
                            "Incoming" && (
                            <button
                              type="button"
                              onClick={() =>
                                acceptIncident(
                                  incident.id
                                )
                              }
                              className="rounded-xl bg-red-600 px-3 py-2 text-xs font-bold text-white hover:bg-red-700"
                            >
                              Accept
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => {
                              setSelectedIncidentId(
                                incident.id
                              );
                              setActiveTab(
                                "incidents"
                              );
                            }}
                            className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                          >
                            Details
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              openIncidentLocation(
                                incident
                              )
                            }
                            className="rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700"
                          >
                            <FaMapMarkerAlt className="mr-1 inline" />
                            Open GIS
                          </button>

                          <select
                            value={
                              incident.assignedTeamId ||
                              ""
                            }
                            onChange={(event) => {
                              if (
                                event.target.value
                              ) {
                                assignTeamToIncident(
                                  incident.id,
                                  event.target.value
                                );
                              }
                            }}
                            className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold"
                          >
                            <option value="">
                              Assign team
                            </option>

                            {teams.map((team) => (
                              <option
                                key={team.id}
                                value={team.id}
                              >
                                {team.name}
                              </option>
                            ))}
                          </select>

                          <button
                            type="button"
                            onClick={() =>
                              setShowFleetModal(
                                true
                              )
                            }
                            className="rounded-xl border border-orange-200 bg-orange-50 px-3 py-2 text-xs font-bold text-orange-700"
                          >
                            <FaTruck className="mr-1 inline" />
                            Fleet Request
                          </button>
                        </div>
                      </div>

                      {selectedIncidentId ===
                        incident.id && (
                        <div className="mt-5 border-t border-slate-200 pt-5">
                          <div className="grid gap-4 lg:grid-cols-3">
                            <div>
                              <p className="mb-2 text-xs font-black uppercase tracking-wide text-slate-400">
                                Status
                              </p>

                              <select
                                value={
                                  incident.status
                                }
                                onChange={(event) =>
                                  updateIncidentStatus(
                                    incident.id,
                                    event.target
                                      .value as MedicalIncidentStatus
                                  )
                                }
                                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
                              >
                                <option value="Incoming">
                                  Incoming
                                </option>
                                <option value="Accepted">
                                  Accepted
                                </option>
                                <option value="Team Assigned">
                                  Team Assigned
                                </option>
                                <option value="En Route">
                                  En Route
                                </option>
                                <option value="On Scene">
                                  On Scene
                                </option>
                                <option value="At Hospital">
                                  At Hospital
                                </option>
                                <option value="Completed">
                                  Completed
                                </option>
                                <option value="Cancelled">
                                  Cancelled
                                </option>
                              </select>
                            </div>

                            <div className="lg:col-span-2">
                              <p className="mb-2 text-xs font-black uppercase tracking-wide text-slate-400">
                                Patient Records
                              </p>

                              <div className="flex flex-wrap gap-2">
                                {incident.patientIds.map(
                                  (patientId) => {
                                    const patient =
                                      patients.find(
                                        (item) =>
                                          item.id ===
                                          patientId
                                      );

                                    if (!patient)
                                      return null;

                                    return (
                                      <button
                                        key={
                                          patient.id
                                        }
                                        type="button"
                                        onClick={() => {
                                          setSelectedPatientId(
                                            patient.id
                                          );
                                          setActiveTab(
                                            "patients"
                                          );
                                        }}
                                        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:border-red-200 hover:bg-red-50"
                                      >
                                        {patient.fullName}
                                      </button>
                                    );
                                  }
                                )}

                                <button
                                  type="button"
                                  onClick={() => {
                                    setNewPatient(
                                      (current) => ({
                                        ...current,
                                        incidentId:
                                          incident.id,
                                      })
                                    );
                                    setShowPatientModal(
                                      true
                                    );
                                  }}
                                  className="rounded-xl border border-dashed border-red-300 bg-red-50 px-3 py-2 text-xs font-bold text-red-700"
                                >
                                  <FaPlus className="mr-1 inline" />
                                  Add Patient
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </article>
                  );
                }
              )}
            </div>
          </SectionCard>
        </div>
      )}

      {/* =====================================================
          PATIENTS
      ===================================================== */}

      {activeTab === "patients" && (
        <div className="grid gap-6 xl:grid-cols-[1fr_0.8fr]">
          <SectionCard
            title="Patient & Affected-Person Registry"
            subtitle="Complete identifiable patient records instead of generic affected-person placeholders."
            actions={
              <button
                type="button"
                onClick={openNewPatient}
                className="rounded-xl bg-red-600 px-4 py-2.5 text-xs font-extrabold text-white hover:bg-red-700"
              >
                <FaUserPlus className="mr-2 inline" />
                Register Patient
              </button>
            }
          >
            <div className="border-b border-slate-100 p-4">
              <div className="relative">
                <FaSearch className="absolute left-3 top-3.5 text-slate-400" />

                <input
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Search patient name, ID, phone or condition..."
                  className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-3 text-sm outline-none focus:border-red-500"
                />
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {filteredPatients.map(
                (patient) => (
                  <button
                    type="button"
                    key={patient.id}
                    onClick={() =>
                      setSelectedPatientId(
                        patient.id
                      )
                    }
                    className={`block w-full p-5 text-left transition ${
                      selectedPatientId ===
                      patient.id
                        ? "bg-red-50"
                        : "hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-extrabold text-slate-950">
                            {patient.fullName}
                          </h3>

                          <Badge className={statusClasses(patient.status)}>
                            {patient.status}
                          </Badge>

                          <Badge className={statusClasses(patient.triage)}>
                            {patient.triage}
                          </Badge>
                        </div>

                        <p className="mt-1 text-xs font-bold text-slate-500">
                          {patient.patientNumber} •{" "}
                          {patient.age} years •{" "}
                          {patient.sex}
                        </p>

                        <p className="mt-2 text-xs text-slate-600">
                          {patient.condition}
                        </p>
                      </div>

                      <FaChevronRight className="mt-2 text-slate-300" />
                    </div>
                  </button>
                )
              )}
            </div>
          </SectionCard>

          {selectedPatient && (
            <SectionCard
              title="Patient Profile"
              subtitle={selectedPatient.patientNumber}
              actions={
                <button
                  type="button"
                  onClick={() =>
                    openEditPatient(
                      selectedPatient
                    )
                  }
                  className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  <FaEdit className="mr-1 inline" />
                  Edit
                </button>
              }
            >
              <div className="space-y-5 p-5">
                <div className="rounded-2xl bg-slate-950 p-5 text-white">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Patient
                  </p>

                  <h3 className="mt-1 text-xl font-black">
                    {selectedPatient.fullName}
                  </h3>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <Badge
                      className={statusClasses(
                        selectedPatient.triage
                      )}
                    >
                      {selectedPatient.triage}
                    </Badge>

                    <Badge
                      className={statusClasses(
                        selectedPatient.status
                      )}
                    >
                      {selectedPatient.status}
                    </Badge>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Info
                    label="Age / Sex"
                    value={`${selectedPatient.age} / ${selectedPatient.sex}`}
                  />

                  <Info
                    label="Phone"
                    value={
                      selectedPatient.phone ||
                      "Not provided"
                    }
                  />

                  <Info
                    label="Emergency Contact"
                    value={`${selectedPatient.emergencyContactName || "Not provided"} ${selectedPatient.emergencyContactPhone ? `• ${selectedPatient.emergencyContactPhone}` : ""}`}
                  />

                  <Info
                    label="Location"
                    value={selectedPatient.location || "Not provided"}
                  />

                  <Info
                    label="Incident"
                    value={selectedPatient.incidentReference}
                  />

                  <Info
                    label="Nationality"
                    value={selectedPatient.nationality}
                  />
                </div>

                <div className="rounded-xl border border-red-100 bg-red-50 p-4">
                  <p className="text-xs font-black uppercase tracking-wide text-red-600">
                    Current Condition
                  </p>

                  <p className="mt-2 text-sm font-semibold text-slate-800">
                    {selectedPatient.condition ||
                      "No condition recorded."}
                  </p>
                </div>

                <div className="grid gap-4">
                  <Info
                    label="Allergies"
                    value={
                      selectedPatient.allergies ||
                      "None reported"
                    }
                  />

                  <Info
                    label="Medical History"
                    value={
                      selectedPatient.medicalHistory ||
                      "No history recorded."
                    }
                  />

                  <Info
                    label="Clinical Notes"
                    value={
                      selectedPatient.notes ||
                      "No additional notes."
                    }
                  />
                </div>

                <div className="grid gap-2 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => {
                      setNewTreatment(
                        (current) => ({
                          ...current,
                          patientId:
                            selectedPatient.id,
                        })
                      );
                      setShowTreatmentModal(
                        true
                      );
                    }}
                    className="rounded-xl bg-red-600 px-4 py-3 text-xs font-extrabold text-white hover:bg-red-700"
                  >
                    <FaStethoscope className="mr-2 inline" />
                    Add Treatment
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setNewReferral(
                        (current) => ({
                          ...current,
                          patientId:
                            selectedPatient.id,
                        })
                      );
                      setShowReferralModal(
                        true
                      );
                    }}
                    className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-extrabold text-red-700 hover:bg-red-100"
                  >
                    Start Referral
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setNewHandover(
                        (current) => ({
                          ...current,
                          patientId:
                            selectedPatient.id,
                        })
                      );
                      setShowHandoverModal(
                        true
                      );
                    }}
                    className="rounded-xl border border-slate-200 px-4 py-3 text-xs font-extrabold text-slate-700 hover:bg-slate-50"
                  >
                    Hospital Handover
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setNewFleetRequest(
                        (current) => ({
                          ...current,
                          patientId:
                            selectedPatient.id,
                        })
                      );
                      setShowFleetModal(
                        true
                      );
                    }}
                    className="rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-xs font-extrabold text-orange-700 hover:bg-orange-100"
                  >
                    <FaTruck className="mr-2 inline" />
                    Request Fleet
                  </button>
                </div>
              </div>
            </SectionCard>
          )}
        </div>
      )}

      {/* =====================================================
          TEAMS
      ===================================================== */}

      {activeTab === "teams" && (
        <SectionCard
          title="Medical Team Registry"
          subtitle="Register and manage specialist medical response teams."
          actions={
            <button
              type="button"
              onClick={() => {
                setEditingTeamId(null);
                setNewTeam({
                  name: "",
                  leader: "",
                  specialization: "",
                  members: "1",
                  phone: "",
                  baseStation: "",
                  status: "Available",
                  certifications: "",
                });
                setShowTeamModal(true);
              }}
              className="rounded-xl bg-red-600 px-4 py-2.5 text-xs font-extrabold text-white hover:bg-red-700"
            >
              <FaPlus className="mr-2 inline" />
              Register Team
            </button>
          }
        >
          <div className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-3">
            {teams.map((team) => (
              <article
                key={team.id}
                className="rounded-2xl border border-slate-200 p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="rounded-xl bg-red-50 p-3 text-red-600">
                    <FaUserMd />
                  </div>

                  <Badge
                    className={statusClasses(
                      team.status
                    )}
                  >
                    {team.status}
                  </Badge>
                </div>

                <h3 className="mt-4 font-black text-slate-950">
                  {team.name}
                </h3>

                <p className="mt-1 text-xs font-bold text-red-600">
                  {team.specialization}
                </p>

                <div className="mt-4 space-y-2 text-xs text-slate-600">
                  <p>
                    <strong>Leader:</strong>{" "}
                    {team.leader}
                  </p>

                  <p>
                    <strong>Members:</strong>{" "}
                    {team.members}
                  </p>

                  <p>
                    <strong>Base:</strong>{" "}
                    {team.baseStation}
                  </p>

                  <p>
                    <strong>Phone:</strong>{" "}
                    {team.phone || "Not provided"}
                  </p>
                </div>

                <div className="mt-4 flex flex-wrap gap-1">
                  {team.certifications.map(
                    (certification) => (
                      <span
                        key={certification}
                        className="rounded-lg bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-600"
                      >
                        {certification}
                      </span>
                    )
                  )}
                </div>

                <div className="mt-5 flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedTeamId(
                        team.id
                      );
                    }}
                    className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                  >
                    View Profile
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      editTeam(team)
                    }
                    className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700"
                  >
                    <FaEdit />
                  </button>
                </div>

                {selectedTeamId ===
                  team.id && (
                  <div className="mt-4 rounded-xl bg-slate-50 p-4 text-xs text-slate-600">
                    <p>
                      <strong>Team Code:</strong>{" "}
                      {team.teamCode}
                    </p>

                    <p className="mt-1">
                      <strong>Created:</strong>{" "}
                      {team.createdAt}
                    </p>
                  </div>
                )}
              </article>
            ))}
          </div>
        </SectionCard>
      )}

      {/* =====================================================
          HOSPITALS
      ===================================================== */}

      {activeTab === "hospitals" && (
        <SectionCard
          title="Hospital & Referral Directory"
          subtitle="Referral destinations. Operational capability information must be verified before relying on it for live capacity decisions."
          actions={
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={exportHospitalReport}
                className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700"
              >
                Export
              </button>

              <button
                type="button"
                onClick={() =>
                  setShowHospitalModal(
                    true
                  )
                }
                className="rounded-xl bg-red-600 px-4 py-2.5 text-xs font-extrabold text-white hover:bg-red-700"
              >
                <FaPlus className="mr-2 inline" />
                Add Facility
              </button>
            </div>
          }
        >
          <div className="border-b border-slate-100 p-4">
            <div className="relative">
              <FaSearch className="absolute left-3 top-3.5 text-slate-400" />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search hospitals, county, sub-county or location..."
                className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-3 text-sm outline-none focus:border-red-500"
              />
            </div>
          </div>

          <div className="grid gap-4 p-5 md:grid-cols-2">
            {filteredHospitals.map(
              (hospital) => (
                <article
                  key={hospital.id}
                  className="rounded-2xl border border-slate-200 p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex gap-3">
                      <div className="rounded-xl bg-red-50 p-3 text-red-600">
                        <FaHospital />
                      </div>

                      <div>
                        <h3 className="font-black text-slate-950">
                          {hospital.name}
                        </h3>

                        <p className="mt-1 text-xs font-semibold text-slate-500">
                          {hospital.facilityType}
                        </p>
                      </div>
                    </div>

                    <Badge
                      className={
                        hospital.verified
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                          : "border-amber-200 bg-amber-50 text-amber-700"
                      }
                    >
                      {hospital.verified
                        ? "Verified"
                        : "Verification Required"}
                    </Badge>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <Info
                      label="County"
                      value={
                        hospital.county
                      }
                    />

                    <Info
                      label="Sub-County"
                      value={
                        hospital.subCounty
                      }
                    />

                    <Info
                      label="Location"
                      value={
                        hospital.location
                      }
                    />

                    <Info
                      label="Last Verified"
                      value={
                        hospital.lastVerified ||
                        "Not verified"
                      }
                    />
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {hospital.traumaUnit && (
                      <Badge className="border-red-100 bg-red-50 text-red-700">
                        Trauma
                      </Badge>
                    )}

                    {hospital.maternity && (
                      <Badge className="border-pink-100 bg-pink-50 text-pink-700">
                        Maternity
                      </Badge>
                    )}

                    {hospital.pediatric && (
                      <Badge className="border-blue-100 bg-blue-50 text-blue-700">
                        Pediatric
                      </Badge>
                    )}

                    {hospital.bloodServices && (
                      <Badge className="border-purple-100 bg-purple-50 text-purple-700">
                        Blood Services
                      </Badge>
                    )}
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedHospitalId(
                          hospital.id
                        )
                      }
                      className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700"
                    >
                      View Facility
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        window.open(
                          mapsUrl(
                            hospital.latitude,
                            hospital.longitude
                          ),
                          "_blank",
                          "noopener,noreferrer"
                        )
                      }
                      className="rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700"
                    >
                      <FaMapMarkerAlt className="mr-1 inline" />
                      Maps
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setNewReferral(
                          (current) => ({
                            ...current,
                            hospitalId:
                              hospital.id,
                          })
                        );
                        setShowReferralModal(
                          true
                        );
                      }}
                      className="rounded-xl bg-red-600 px-3 py-2 text-xs font-bold text-white"
                    >
                      Start Referral
                    </button>
                  </div>

                  {selectedHospitalId ===
                    hospital.id && (
                    <div className="mt-4 rounded-xl bg-slate-50 p-4 text-xs text-slate-600">
                      <p>
                        <strong>Emergency:</strong>{" "}
                        {hospital.emergencyPhone ||
                          "Not recorded"}
                      </p>

                      <p className="mt-1">
                        <strong>Phone:</strong>{" "}
                        {hospital.phone ||
                          "Not recorded"}
                      </p>

                      <p className="mt-2">
                        {hospital.notes ||
                          "No additional facility notes."}
                      </p>
                    </div>
                  )}
                </article>
              )
            )}
          </div>
        </SectionCard>
      )}

      {/* =====================================================
          TREATMENTS
      ===================================================== */}

      {activeTab === "treatments" && (
        <SectionCard
          title="Treatment & Intervention Records"
          subtitle="Open and review clinical intervention records linked to patients and incidents."
          actions={
            <button
              type="button"
              onClick={() =>
                setShowTreatmentModal(
                  true
                )
              }
              className="rounded-xl bg-red-600 px-4 py-2.5 text-xs font-extrabold text-white"
            >
              <FaPlus className="mr-2 inline" />
              New Treatment
            </button>
          }
        >
          <div className="grid gap-4 p-5 lg:grid-cols-2">
            {treatments.map(
              (treatment) => {
                const patient =
                  patients.find(
                    (item) =>
                      item.id ===
                      treatment.patientId
                  );

                return (
                  <article
                    key={treatment.id}
                    className="rounded-2xl border border-slate-200 p-5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-wider text-red-600">
                          {treatment.id}
                        </p>

                        <h3 className="mt-1 font-black text-slate-950">
                          {patient?.fullName ||
                            "Unknown Patient"}
                        </h3>
                      </div>

                      <Badge
                        className={statusClasses(
                          treatment.status
                        )}
                      >
                        {treatment.status}
                      </Badge>
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <Info
                        label="Clinician"
                        value={
                          treatment.clinician
                        }
                      />

                      <Info
                        label="Date"
                        value={
                          treatment.treatmentDate
                        }
                      />

                      <Info
                        label="Diagnosis"
                        value={
                          treatment.diagnosis
                        }
                      />

                      <Info
                        label="Vital Signs"
                        value={
                          treatment.vitalSigns ||
                          "Not recorded"
                        }
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedTreatmentId(
                          treatment.id
                        );
                      }}
                      className="mt-5 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
                    >
                      Open Treatment Record
                    </button>

                    {selectedTreatmentId ===
                      treatment.id && (
                      <div className="mt-4 space-y-3 rounded-xl bg-slate-50 p-4 text-xs text-slate-600">
                        <Info
                          label="Interventions"
                          value={
                            treatment.interventions ||
                            "Not recorded"
                          }
                        />

                        <Info
                          label="Medication"
                          value={
                            treatment.medication ||
                            "None recorded"
                          }
                        />

                        <Info
                          label="Response"
                          value={
                            treatment.response ||
                            "Not recorded"
                          }
                        />

                        <Info
                          label="Follow-up"
                          value={
                            treatment.followUp ||
                            "Not recorded"
                          }
                        />
                      </div>
                    )}
                  </article>
                );
              }
            )}
          </div>
        </SectionCard>
      )}

      {/* =====================================================
          REFERRALS
      ===================================================== */}

      {activeTab === "referrals" && (
        <SectionCard
          title="Hospital Referrals"
          subtitle="Create, track and complete patient referral workflows."
          actions={
            <button
              type="button"
              onClick={() =>
                setShowReferralModal(
                  true
                )
              }
              className="rounded-xl bg-red-600 px-4 py-2.5 text-xs font-extrabold text-white"
            >
              <FaPlus className="mr-2 inline" />
              Start Referral
            </button>
          }
        >
          <div className="space-y-4 p-5">
            {referrals.map(
              (referral) => {
                const patient =
                  patients.find(
                    (item) =>
                      item.id ===
                      referral.patientId
                  );

                const hospital =
                  hospitals.find(
                    (item) =>
                      item.id ===
                      referral.hospitalId
                  );

                return (
                  <article
                    key={referral.id}
                    className="rounded-2xl border border-slate-200 p-5"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-black text-red-600">
                            {referral.id}
                          </span>

                          <Badge
                            className={statusClasses(
                              referral.status
                            )}
                          >
                            {referral.status}
                          </Badge>

                          <Badge
                            className={statusClasses(
                              referral.urgency
                            )}
                          >
                            {referral.urgency}
                          </Badge>
                        </div>

                        <h3 className="mt-2 font-black text-slate-950">
                          {patient?.fullName ||
                            "Unknown Patient"}
                        </h3>

                        <p className="mt-1 text-xs font-semibold text-slate-500">
                          Destination:{" "}
                          {hospital?.name ||
                            "Unknown facility"}
                        </p>

                        <p className="mt-3 text-xs leading-5 text-slate-600">
                          {referral.reason}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedReferralId(
                              referral.id
                            )
                          }
                          className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700"
                        >
                          View Referral
                        </button>

                        <select
                          value={
                            referral.status
                          }
                          onChange={(event) =>
                            updateReferralStatus(
                              referral.id,
                              event.target
                                .value as ReferralStatus
                            )
                          }
                          className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold"
                        >
                          <option value="Draft">
                            Draft
                          </option>
                          <option value="Requested">
                            Requested
                          </option>
                          <option value="Accepted">
                            Accepted
                          </option>
                          <option value="Transporting">
                            Transporting
                          </option>
                          <option value="Arrived">
                            Arrived
                          </option>
                          <option value="Completed">
                            Completed
                          </option>
                          <option value="Cancelled">
                            Cancelled
                          </option>
                        </select>
                      </div>
                    </div>

                    {selectedReferralId ===
                      referral.id && (
                      <div className="mt-5 grid gap-4 border-t border-slate-100 pt-5 md:grid-cols-3">
                        <Info
                          label="Requested By"
                          value={
                            referral.requestedBy
                          }
                        />

                        <Info
                          label="Requested At"
                          value={
                            referral.requestedAt
                          }
                        />

                        <Info
                          label="Accepted By"
                          value={
                            referral.acceptedBy ||
                            "Pending"
                          }
                        />

                        <div className="md:col-span-3">
                          <Info
                            label="Clinical Notes"
                            value={
                              referral.clinicalNotes ||
                              "None recorded."
                            }
                          />
                        </div>
                      </div>
                    )}
                  </article>
                );
              }
            )}
          </div>
        </SectionCard>
      )}

      {/* =====================================================
          HANDOVERS
      ===================================================== */}

      {activeTab === "handovers" && (
        <SectionCard
          title="Hospital Handover"
          subtitle="Document formal transfer of patient care to the receiving facility."
          actions={
            <button
              type="button"
              onClick={() =>
                setShowHandoverModal(
                  true
                )
              }
              className="rounded-xl bg-red-600 px-4 py-2.5 text-xs font-extrabold text-white"
            >
              <FaPlus className="mr-2 inline" />
              Record Handover
            </button>
          }
        >
          {handovers.length === 0 ? (
            <div className="p-10 text-center">
              <FaHospital className="mx-auto text-3xl text-slate-300" />

              <h3 className="mt-3 font-black text-slate-800">
                No handovers recorded
              </h3>

              <p className="mt-1 text-xs text-slate-500">
                Completed hospital handovers will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-4 p-5">
              {handovers.map(
                (handover) => {
                  const patient =
                    patients.find(
                      (item) =>
                        item.id ===
                        handover.patientId
                    );

                  const hospital =
                    hospitals.find(
                      (item) =>
                        item.id ===
                        handover.hospitalId
                    );

                  return (
                    <article
                      key={handover.id}
                      className="rounded-2xl border border-slate-200 p-5"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-xs font-black text-red-600">
                            {handover.id}
                          </p>

                          <h3 className="mt-1 font-black text-slate-950">
                            {patient?.fullName}
                          </h3>

                          <p className="mt-1 text-xs text-slate-500">
                            {hospital?.name}
                          </p>
                        </div>

                        <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">
                          {handover.status}
                        </Badge>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          setSelectedHandoverId(
                            handover.id
                          )
                        }
                        className="mt-4 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700"
                      >
                        View Handover
                      </button>

                      {selectedHandoverId ===
                        handover.id && (
                        <div className="mt-4 grid gap-3 border-t border-slate-100 pt-4 sm:grid-cols-2">
                          <Info
                            label="Receiving Clinician"
                            value={
                              handover.receivingClinician
                            }
                          />

                          <Info
                            label="Department"
                            value={
                              handover.receivingDepartment
                            }
                          />

                          <Info
                            label="Condition"
                            value={
                              handover.conditionAtHandover
                            }
                          />

                          <Info
                            label="Handover Time"
                            value={
                              handover.handoverTime
                            }
                          />

                          <div className="sm:col-span-2">
                            <Info
                              label="Treatment Summary"
                              value={
                                handover.treatmentSummary
                              }
                            />
                          </div>

                          <div className="sm:col-span-2">
                            <Info
                              label="Outstanding Needs"
                              value={
                                handover.outstandingNeeds ||
                                "None recorded."
                              }
                            />
                          </div>
                        </div>
                      )}
                    </article>
                  );
                }
              )}
            </div>
          )}
        </SectionCard>
      )}

      {/* =====================================================
          FLEET REQUESTS
      ===================================================== */}

      {activeTab === "fleet" && (
        <SectionCard
          title="Fleet Control Requests"
          subtitle="Medical Support requests transport from Fleet Control instead of maintaining duplicate vehicle and driver records."
          actions={
            <button
              type="button"
              onClick={() =>
                setShowFleetModal(
                  true
                )
              }
              className="rounded-xl bg-red-600 px-4 py-2.5 text-xs font-extrabold text-white"
            >
              <FaTruck className="mr-2 inline" />
              Request Fleet Support
            </button>
          }
        >
          <div className="mb-5 rounded-2xl border border-blue-100 bg-blue-50 p-5 text-sm text-blue-800">
            <div className="flex gap-3">
              <FaBell className="mt-1 shrink-0" />

              <div>
                <p className="font-black">
                  Driver / Fleet Alert Architecture
                </p>

                <p className="mt-1 text-xs leading-5">
                  A medical transport request creates a structured
                  fleet request. Later, Firebase Cloud Messaging can
                  route the alert to Fleet Control, eligible drivers,
                  responders and the assigned vehicle team without
                  creating duplicate fleet records inside Medical Support.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4 p-5">
            {fleetRequests.length ===
            0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center">
                <FaTruck className="mx-auto text-3xl text-slate-300" />

                <h3 className="mt-3 font-black text-slate-800">
                  No fleet requests
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  Medical transport and response requests will appear here.
                </p>
              </div>
            ) : (
              fleetRequests.map(
                (request) => {
                  const patient =
                    patients.find(
                      (item) =>
                        item.id ===
                        request.patientId
                    );

                  return (
                    <article
                      key={request.id}
                      className="rounded-2xl border border-slate-200 p-5"
                    >
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                          <div className="flex flex-wrap gap-2">
                            <span className="text-xs font-black text-red-600">
                              {request.id}
                            </span>

                            <Badge
                              className={priorityClasses(
                                request.priority
                              )}
                            >
                              {request.priority}
                            </Badge>

                            <Badge
                              className={statusClasses(
                                request.status
                              )}
                            >
                              {request.status}
                            </Badge>

                            <Badge className="border-blue-200 bg-blue-50 text-blue-700">
                              Alert{" "}
                              {request.alertStatus}
                            </Badge>
                          </div>

                          <h3 className="mt-2 font-black text-slate-950">
                            {request.requestType}
                          </h3>

                          <p className="mt-1 text-xs text-slate-500">
                            Patient:{" "}
                            {patient?.fullName ||
                              request.patientId}
                          </p>

                          <p className="mt-2 text-xs text-slate-600">
                            {request.notes}
                          </p>
                        </div>

                        <select
                          value={
                            request.status
                          }
                          onChange={(event) =>
                            updateFleetRequestStatus(
                              request.id,
                              event.target
                                .value as FleetRequestStatus
                            )
                          }
                          className="rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-bold"
                        >
                          <option value="Requested">
                            Requested
                          </option>
                          <option value="Acknowledged">
                            Acknowledged
                          </option>
                          <option value="Assigned">
                            Assigned
                          </option>
                          <option value="En Route">
                            En Route
                          </option>
                          <option value="Completed">
                            Completed
                          </option>
                          <option value="Cancelled">
                            Cancelled
                          </option>
                        </select>
                      </div>
                    </article>
                  );
                }
              )
            )}
          </div>
        </SectionCard>
      )}

      {/* =====================================================
          AUDIT
      ===================================================== */}

      {activeTab === "audit" && (
        <SectionCard
          title="Medical Audit Trail"
          subtitle="Sensitive patient, treatment, referral and handover actions should be auditable."
        >
          <div className="divide-y divide-slate-100">
            {audit.map((entry) => (
              <div
                key={entry.id}
                className="p-5"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge className="border-slate-200 bg-slate-50 text-slate-700">
                        {entry.action}
                      </Badge>

                      <span className="text-xs font-bold text-slate-400">
                        {entry.entity} /{" "}
                        {entry.entityId}
                      </span>
                    </div>

                    <p className="mt-2 text-xs text-slate-600">
                      {entry.details}
                    </p>
                  </div>

                  <div className="text-xs text-slate-400">
                    {entry.timestamp}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {/* =====================================================
          PATIENT MODAL
      ===================================================== */}

      {showPatientModal && (
        <Modal
          title={
            editingPatientId
              ? "Edit Patient Record"
              : "Register Patient"
          }
          subtitle="Create a complete patient record. Do not rely on generic affected-person identifiers."
          onClose={() =>
            setShowPatientModal(
              false
            )
          }
          wide
        >
          <div className="grid gap-5 lg:grid-cols-3">
            <Field
              label="Full Name"
              value={
                newPatient.fullName
              }
              onChange={(value) =>
                setNewPatient(
                  (current) => ({
                    ...current,
                    fullName: value,
                  })
                )
              }
              required
            />

            <Field
              label="Date of Birth"
              type="date"
              value={
                newPatient.dateOfBirth
              }
              onChange={(value) =>
                setNewPatient(
                  (current) => ({
                    ...current,
                    dateOfBirth: value,
                  })
                )
              }
            />

            <Field
              label="Age"
              type="number"
              value={newPatient.age}
              onChange={(value) =>
                setNewPatient(
                  (current) => ({
                    ...current,
                    age: value,
                  })
                )
              }
            />

            <SelectField
              label="Sex"
              value={newPatient.sex}
              onChange={(value) =>
                setNewPatient(
                  (current) => ({
                    ...current,
                    sex: value as Patient["sex"],
                  })
                )
              }
              options={[
                "Male",
                "Female",
                "Unknown",
              ]}
            />

            <Field
              label="Phone"
              value={newPatient.phone}
              onChange={(value) =>
                setNewPatient(
                  (current) => ({
                    ...current,
                    phone: value,
                  })
                )
              }
            />

            <Field
              label="Nationality"
              value={
                newPatient.nationality
              }
              onChange={(value) =>
                setNewPatient(
                  (current) => ({
                    ...current,
                    nationality: value,
                  })
                )
              }
            />

            <Field
              label="Emergency Contact Name"
              value={
                newPatient.emergencyContactName
              }
              onChange={(value) =>
                setNewPatient(
                  (current) => ({
                    ...current,
                    emergencyContactName:
                      value,
                  })
                )
              }
            />

            <Field
              label="Emergency Contact Phone"
              value={
                newPatient.emergencyContactPhone
              }
              onChange={(value) =>
                setNewPatient(
                  (current) => ({
                    ...current,
                    emergencyContactPhone:
                      value,
                  })
                )
              }
            />

            <Field
              label="Location"
              value={
                newPatient.location
              }
              onChange={(value) =>
                setNewPatient(
                  (current) => ({
                    ...current,
                    location: value,
                  })
                )
              }
            />

            <SelectField
              label="Incident"
              value={
                newPatient.incidentId
              }
              onChange={(value) =>
                setNewPatient(
                  (current) => ({
                    ...current,
                    incidentId: value,
                  })
                )
              }
              options={incidents.map(
                (incident) =>
                  incident.id
              )}
              required
            />

            <SelectField
              label="Triage / Severity"
              value={
                newPatient.triage
              }
              onChange={(value) =>
                setNewPatient(
                  (current) => ({
                    ...current,
                    triage:
                      value as Severity,
                  })
                )
              }
              options={[
                "Immediate",
                "Very Urgent",
                "Urgent",
                "Standard",
              ]}
              required
            />

            <SelectField
              label="Patient Status"
              value={
                newPatient.status
              }
              onChange={(value) =>
                setNewPatient(
                  (current) => ({
                    ...current,
                    status:
                      value as PatientStatus,
                  })
                )
              }
              options={[
                "Waiting",
                "Under Treatment",
                "Stable",
                "Critical",
                "Transferred",
                "Discharged",
              ]}
            />

            <div className="lg:col-span-3">
              <Field
                label="Current Condition"
                value={
                  newPatient.condition
                }
                onChange={(value) =>
                  setNewPatient(
                    (current) => ({
                      ...current,
                      condition: value,
                    })
                  )
                }
              />
            </div>

            <div className="lg:col-span-3">
              <TextAreaField
                label="Allergies"
                value={
                  newPatient.allergies
                }
                onChange={(value) =>
                  setNewPatient(
                    (current) => ({
                      ...current,
                      allergies: value,
                    })
                  )
                }
              />
            </div>

            <div className="lg:col-span-3">
              <TextAreaField
                label="Medical History"
                value={
                  newPatient.medicalHistory
                }
                onChange={(value) =>
                  setNewPatient(
                    (current) => ({
                      ...current,
                      medicalHistory:
                        value,
                    })
                  )
                }
              />
            </div>

            <div className="lg:col-span-3">
              <TextAreaField
                label="Clinical Notes"
                value={
                  newPatient.notes
                }
                onChange={(value) =>
                  setNewPatient(
                    (current) => ({
                      ...current,
                      notes: value,
                    })
                  )
                }
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-2 border-t border-slate-100 pt-5">
            <button
              type="button"
              onClick={() =>
                setShowPatientModal(
                  false
                )
              }
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-700"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={savePatient}
              className="rounded-xl bg-red-600 px-5 py-2.5 text-xs font-extrabold text-white"
            >
              <FaCheckCircle className="mr-2 inline" />
              {editingPatientId
                ? "Update Patient"
                : "Register Patient"}
            </button>
          </div>
        </Modal>
      )}

      {/* =====================================================
          TEAM MODAL
      ===================================================== */}

      {showTeamModal && (
        <Modal
          title={
            editingTeamId
              ? "Edit Medical Team"
              : "Register Medical Team"
          }
          subtitle="Select a predefined specialization rather than relying on free-text classifications."
          onClose={() =>
            setShowTeamModal(
              false
            )
          }
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              label="Team Name"
              value={newTeam.name}
              onChange={(value) =>
                setNewTeam(
                  (current) => ({
                    ...current,
                    name: value,
                  })
                )
              }
              required
            />

            <Field
              label="Team Leader"
              value={newTeam.leader}
              onChange={(value) =>
                setNewTeam(
                  (current) => ({
                    ...current,
                    leader: value,
                  })
                )
              }
              required
            />

            <SelectField
              label="Specialization"
              value={
                newTeam.specialization
              }
              onChange={(value) =>
                setNewTeam(
                  (current) => ({
                    ...current,
                    specialization:
                      value,
                  })
                )
              }
              options={
                SPECIALIZATIONS
              }
              required
            />

            <Field
              label="Number of Members"
              type="number"
              value={
                newTeam.members
              }
              onChange={(value) =>
                setNewTeam(
                  (current) => ({
                    ...current,
                    members: value,
                  })
                )
              }
            />

            <Field
              label="Team Phone"
              value={newTeam.phone}
              onChange={(value) =>
                setNewTeam(
                  (current) => ({
                    ...current,
                    phone: value,
                  })
                )
              }
            />

            <Field
              label="Base Station"
              value={
                newTeam.baseStation
              }
              onChange={(value) =>
                setNewTeam(
                  (current) => ({
                    ...current,
                    baseStation:
                      value,
                  })
                )
              }
            />

            <SelectField
              label="Operational Status"
              value={newTeam.status}
              onChange={(value) =>
                setNewTeam(
                  (current) => ({
                    ...current,
                    status:
                      value as MedicalTeamStatus,
                  })
                )
              }
              options={[
                "Available",
                "Assigned",
                "On Scene",
                "Off Duty",
              ]}
            />

            <Field
              label="Certifications"
              value={
                newTeam.certifications
              }
              onChange={(value) =>
                setNewTeam(
                  (current) => ({
                    ...current,
                    certifications:
                      value,
                  })
                )
              }
              placeholder="Emergency Care, First Aid, Trauma Response"
            />
          </div>

          <div className="mt-6 flex justify-end gap-2 border-t border-slate-100 pt-5">
            <button
              type="button"
              onClick={() =>
                setShowTeamModal(
                  false
                )
              }
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-700"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={saveTeam}
              className="rounded-xl bg-red-600 px-5 py-2.5 text-xs font-extrabold text-white"
            >
              Save Team
            </button>
          </div>
        </Modal>
      )}

      {/* =====================================================
          TREATMENT MODAL
      ===================================================== */}

      {showTreatmentModal && (
        <Modal
          title="Create Treatment Record"
          subtitle="Record clinical intervention against a specific patient."
          onClose={() =>
            setShowTreatmentModal(
              false
            )
          }
          wide
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <SelectField
              label="Patient"
              value={
                newTreatment.patientId
              }
              onChange={(value) =>
                setNewTreatment(
                  (current) => ({
                    ...current,
                    patientId:
                      value,
                  })
                )
              }
              options={patients.map(
                (patient) =>
                  `${patient.id} — ${patient.fullName}`
              )}
              required
            />

            <Field
              label="Clinician"
              value={
                newTreatment.clinician
              }
              onChange={(value) =>
                setNewTreatment(
                  (current) => ({
                    ...current,
                    clinician: value,
                  })
                )
              }
              required
            />

            <Field
              label="Diagnosis"
              value={
                newTreatment.diagnosis
              }
              onChange={(value) =>
                setNewTreatment(
                  (current) => ({
                    ...current,
                    diagnosis: value,
                  })
                )
              }
              required
            />

            <Field
              label="Vital Signs"
              value={
                newTreatment.vitalSigns
              }
              onChange={(value) =>
                setNewTreatment(
                  (current) => ({
                    ...current,
                    vitalSigns:
                      value,
                  })
                )
              }
              placeholder="BP / Pulse / SpO2 / Temperature"
            />

            <div className="sm:col-span-2">
              <TextAreaField
                label="Interventions"
                value={
                  newTreatment.interventions
                }
                onChange={(value) =>
                  setNewTreatment(
                    (current) => ({
                      ...current,
                      interventions:
                        value,
                    })
                  )
                }
              />
            </div>

            <div className="sm:col-span-2">
              <TextAreaField
                label="Medication"
                value={
                  newTreatment.medication
                }
                onChange={(value) =>
                  setNewTreatment(
                    (current) => ({
                      ...current,
                      medication:
                        value,
                    })
                  )
                }
              />
            </div>

            <TextAreaField
              label="Patient Response"
              value={
                newTreatment.response
              }
              onChange={(value) =>
                setNewTreatment(
                  (current) => ({
                    ...current,
                    response:
                      value,
                  })
                )
              }
            />

            <TextAreaField
              label="Follow-Up"
              value={
                newTreatment.followUp
              }
              onChange={(value) =>
                setNewTreatment(
                  (current) => ({
                    ...current,
                    followUp:
                      value,
                  })
                )
              }
            />
          </div>

          <div className="mt-6 flex justify-end gap-2 border-t border-slate-100 pt-5">
            <button
              type="button"
              onClick={() =>
                setShowTreatmentModal(
                  false
                )
              }
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={saveTreatment}
              className="rounded-xl bg-red-600 px-5 py-2.5 text-xs font-extrabold text-white"
            >
              Save Treatment
            </button>
          </div>
        </Modal>
      )}

      {/* =====================================================
          HOSPITAL MODAL
      ===================================================== */}

      {showHospitalModal && (
        <Modal
          title="Add Referral Facility"
          subtitle="Facility directory only. Live bed capacity and operational availability must be verified separately."
          onClose={() =>
            setShowHospitalModal(
              false
            )
          }
          wide
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              label="Facility Name"
              value={newHospital.name}
              onChange={(value) =>
                setNewHospital(
                  (current) => ({
                    ...current,
                    name: value,
                  })
                )
              }
              required
            />

            <SelectField
              label="Facility Type"
              value={
                newHospital.facilityType
              }
              onChange={(value) =>
                setNewHospital(
                  (current) => ({
                    ...current,
                    facilityType:
                      value as Hospital["facilityType"],
                  })
                )
              }
              options={[
                "National Referral",
                "County Referral",
                "Sub-County Hospital",
                "Health Centre",
              ]}
            />

            <SelectField
              label="County"
              value={
                newHospital.county
              }
              onChange={(value) =>
                setNewHospital(
                  (current) => ({
                    ...current,
                    county: value,
                  })
                )
              }
              options={
                COUNTY_OPTIONS
              }
              required
            />

            <Field
              label="Sub-County"
              value={
                newHospital.subCounty
              }
              onChange={(value) =>
                setNewHospital(
                  (current) => ({
                    ...current,
                    subCounty:
                      value,
                  })
                )
              }
              required
            />

            <Field
              label="Location"
              value={
                newHospital.location
              }
              onChange={(value) =>
                setNewHospital(
                  (current) => ({
                    ...current,
                    location:
                      value,
                  })
                )
              }
            />

            <Field
              label="Phone"
              value={
                newHospital.phone
              }
              onChange={(value) =>
                setNewHospital(
                  (current) => ({
                    ...current,
                    phone: value,
                  })
                )
              }
            />

            <Field
              label="Emergency Phone"
              value={
                newHospital.emergencyPhone
              }
              onChange={(value) =>
                setNewHospital(
                  (current) => ({
                    ...current,
                    emergencyPhone:
                      value,
                  })
                )
              }
            />

            <Field
              label="Latitude"
              value={
                newHospital.latitude
              }
              onChange={(value) =>
                setNewHospital(
                  (current) => ({
                    ...current,
                    latitude:
                      value,
                  })
                )
              }
              placeholder="-4.0528"
            />

            <Field
              label="Longitude"
              value={
                newHospital.longitude
              }
              onChange={(value) =>
                setNewHospital(
                  (current) => ({
                    ...current,
                    longitude:
                      value,
                  })
                )
              }
              placeholder="39.6653"
            />

            <div className="sm:col-span-2">
              <p className="mb-3 text-xs font-black uppercase tracking-wide text-slate-500">
                Operational Capabilities
              </p>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                {[
                  [
                    "ambulanceReception",
                    "Ambulance Reception",
                  ],
                  [
                    "traumaUnit",
                    "Trauma",
                  ],
                  [
                    "maternity",
                    "Maternity",
                  ],
                  [
                    "pediatric",
                    "Pediatric",
                  ],
                  [
                    "bloodServices",
                    "Blood Services",
                  ],
                ].map(
                  ([key, label]) => (
                    <label
                      key={key}
                      className="flex items-center gap-2 rounded-xl border border-slate-200 p-3 text-xs font-bold text-slate-700"
                    >
                      <input
                        type="checkbox"
                        checked={
                          Boolean(
                            newHospital[
                              key as keyof typeof newHospital
                            ]
                          )
                        }
                        onChange={(
                          event
                        ) =>
                          setNewHospital(
                            (current) => ({
                              ...current,
                              [key]:
                                event
                                  .target
                                  .checked,
                            })
                          )
                        }
                        className="h-4 w-4 accent-red-600"
                      />

                      {label}
                    </label>
                  )
                )}
              </div>
            </div>

            <div className="sm:col-span-2">
              <TextAreaField
                label="Facility Notes"
                value={
                  newHospital.notes
                }
                onChange={(value) =>
                  setNewHospital(
                    (current) => ({
                      ...current,
                      notes:
                        value,
                    })
                  )
                }
              />
            </div>
          </div>

          <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs leading-5 text-amber-800">
            <strong>Operational data warning:</strong>{" "}
            selecting a capability does not mean the service is
            currently available. Later, Firestore should store
            verification history, verification officer, timestamp
            and source.
          </div>

          <div className="mt-6 flex justify-end gap-2 border-t border-slate-100 pt-5">
            <button
              type="button"
              onClick={() =>
                setShowHospitalModal(
                  false
                )
              }
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={saveHospital}
              className="rounded-xl bg-red-600 px-5 py-2.5 text-xs font-extrabold text-white"
            >
              Add Facility
            </button>
          </div>
        </Modal>
      )}

      {/* =====================================================
          REFERRAL MODAL
      ===================================================== */}

      {showReferralModal && (
        <Modal
          title="Start Hospital Referral"
          subtitle="Create a referral request and track it through acceptance, transport, arrival and completion."
          onClose={() =>
            setShowReferralModal(
              false
            )
          }
        >
          <div className="grid gap-5">
            <SelectField
              label="Patient"
              value={
                newReferral.patientId
              }
              onChange={(value) =>
                setNewReferral(
                  (current) => ({
                    ...current,
                    patientId:
                      value,
                  })
                )
              }
              options={patients.map(
                (patient) =>
                  `${patient.id} — ${patient.fullName}`
              )}
              required
            />

            <SelectField
              label="Referral Facility"
              value={
                newReferral.hospitalId
              }
              onChange={(value) =>
                setNewReferral(
                  (current) => ({
                    ...current,
                    hospitalId:
                      value,
                  })
                )
              }
              options={hospitals.map(
                (hospital) =>
                  `${hospital.id} — ${hospital.name}`
              )}
              required
            />

            <SelectField
              label="Urgency"
              value={
                newReferral.urgency
              }
              onChange={(value) =>
                setNewReferral(
                  (current) => ({
                    ...current,
                    urgency:
                      value as Severity,
                  })
                )
              }
              options={[
                "Immediate",
                "Very Urgent",
                "Urgent",
                "Standard",
              ]}
              required
            />

            <TextAreaField
              label="Referral Reason"
              value={
                newReferral.reason
              }
              onChange={(value) =>
                setNewReferral(
                  (current) => ({
                    ...current,
                    reason:
                      value,
                  })
                )
              }
            />

            <TextAreaField
              label="Clinical Notes"
              value={
                newReferral.clinicalNotes
              }
              onChange={(value) =>
                setNewReferral(
                  (current) => ({
                    ...current,
                    clinicalNotes:
                      value,
                  })
                )
              }
            />

            <TextAreaField
              label="Destination Notes"
              value={
                newReferral.destinationNotes
              }
              onChange={(value) =>
                setNewReferral(
                  (current) => ({
                    ...current,
                    destinationNotes:
                      value,
                  })
                )
              }
            />
          </div>

          <div className="mt-6 flex justify-end gap-2 border-t border-slate-100 pt-5">
            <button
              type="button"
              onClick={() =>
                setShowReferralModal(
                  false
                )
              }
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={startReferral}
              className="rounded-xl bg-red-600 px-5 py-2.5 text-xs font-extrabold text-white"
            >
              Start Referral
            </button>
          </div>
        </Modal>
      )}

      {/* =====================================================
          HANDOVER MODAL
      ===================================================== */}

      {showHandoverModal && (
        <Modal
          title="Record Hospital Handover"
          subtitle="Complete the clinical transfer record when the receiving facility takes over care."
          onClose={() =>
            setShowHandoverModal(
              false
            )
          }
          wide
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <SelectField
              label="Patient"
              value={
                newHandover.patientId
              }
              onChange={(value) =>
                setNewHandover(
                  (current) => ({
                    ...current,
                    patientId:
                      value,
                  })
                )
              }
              options={patients.map(
                (patient) =>
                  `${patient.id} — ${patient.fullName}`
              )}
              required
            />

            <SelectField
              label="Receiving Hospital"
              value={
                newHandover.hospitalId
              }
              onChange={(value) =>
                setNewHandover(
                  (current) => ({
                    ...current,
                    hospitalId:
                      value,
                  })
                )
              }
              options={hospitals.map(
                (hospital) =>
                  `${hospital.id} — ${hospital.name}`
              )}
              required
            />

            <Field
              label="Receiving Clinician"
              value={
                newHandover.receivingClinician
              }
              onChange={(value) =>
                setNewHandover(
                  (current) => ({
                    ...current,
                    receivingClinician:
                      value,
                  })
                )
              }
              required
            />

            <Field
              label="Receiving Department"
              value={
                newHandover.receivingDepartment
              }
              onChange={(value) =>
                setNewHandover(
                  (current) => ({
                    ...current,
                    receivingDepartment:
                      value,
                  })
                )
              }
            />

            <div className="sm:col-span-2">
              <TextAreaField
                label="Condition at Handover"
                value={
                  newHandover.conditionAtHandover
                }
                onChange={(value) =>
                  setNewHandover(
                    (current) => ({
                      ...current,
                      conditionAtHandover:
                        value,
                    })
                  )
                }
              />
            </div>

            <div className="sm:col-span-2">
              <TextAreaField
                label="Treatment Summary"
                value={
                  newHandover.treatmentSummary
                }
                onChange={(value) =>
                  setNewHandover(
                    (current) => ({
                      ...current,
                      treatmentSummary:
                        value,
                    })
                  )
                }
              />
            </div>

            <TextAreaField
              label="Medication Given"
              value={
                newHandover.medicationGiven
              }
              onChange={(value) =>
                setNewHandover(
                  (current) => ({
                    ...current,
                    medicationGiven:
                      value,
                  })
                )
              }
            />

            <TextAreaField
              label="Outstanding Needs"
              value={
                newHandover.outstandingNeeds
              }
              onChange={(value) =>
                setNewHandover(
                  (current) => ({
                    ...current,
                    outstandingNeeds:
                      value,
                  })
                )
              }
            />
          </div>

          <div className="mt-6 flex justify-end gap-2 border-t border-slate-100 pt-5">
            <button
              type="button"
              onClick={() =>
                setShowHandoverModal(
                  false
                )
              }
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={saveHandover}
              className="rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-extrabold text-white"
            >
              <FaCheckCircle className="mr-2 inline" />
              Complete Handover
            </button>
          </div>
        </Modal>
      )}

      {/* =====================================================
          FLEET MODAL
      ===================================================== */}

      {showFleetModal && (
        <Modal
          title="Request Fleet Control Support"
          subtitle="This does not register an ambulance or driver here. Fleet Control remains the authoritative vehicle and driver module."
          onClose={() =>
            setShowFleetModal(
              false
            )
          }
        >
          <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
            <div className="flex gap-3">
              <FaTruck className="mt-1 text-blue-600" />

              <p className="text-xs leading-5 text-blue-800">
                Once Firebase Cloud Messaging is connected,
                this request can generate a targeted alert to
                Fleet Control and eligible drivers/responders.
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-5">
            <SelectField
              label="Patient"
              value={
                newFleetRequest.patientId
              }
              onChange={(value) =>
                setNewFleetRequest(
                  (current) => ({
                    ...current,
                    patientId:
                      value,
                  })
                )
              }
              options={patients.map(
                (patient) =>
                  `${patient.id} — ${patient.fullName}`
              )}
              required
            />

            <SelectField
              label="Request Type"
              value={
                newFleetRequest.requestType
              }
              onChange={(value) =>
                setNewFleetRequest(
                  (current) => ({
                    ...current,
                    requestType:
                      value as FleetRequest["requestType"],
                  })
                )
              }
              options={[
                "Medical Transport",
                "Rescue Support",
                "Logistics Support",
              ]}
            />

            <SelectField
              label="Priority"
              value={
                newFleetRequest.priority
              }
              onChange={(value) =>
                setNewFleetRequest(
                  (current) => ({
                    ...current,
                    priority:
                      value as Priority,
                  })
                )
              }
              options={[
                "Critical",
                "High",
                "Medium",
                "Low",
              ]}
            />

            <Field
              label="Destination"
              value={
                newFleetRequest.destination
              }
              onChange={(value) =>
                setNewFleetRequest(
                  (current) => ({
                    ...current,
                    destination:
                      value,
                  })
                )
              }
              placeholder="Hospital / facility / operational destination"
            />

            <TextAreaField
              label="Request Notes"
              value={
                newFleetRequest.notes
              }
              onChange={(value) =>
                setNewFleetRequest(
                  (current) => ({
                    ...current,
                    notes:
                      value,
                  })
                )
              }
            />
          </div>

          <div className="mt-6 flex justify-end gap-2 border-t border-slate-100 pt-5">
            <button
              type="button"
              onClick={() =>
                setShowFleetModal(
                  false
                )
              }
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={
                requestFleetSupport
              }
              className="rounded-xl bg-red-600 px-5 py-2.5 text-xs font-extrabold text-white"
            >
              <FaBell className="mr-2 inline" />
              Send Fleet Request
            </button>
          </div>
        </Modal>
      )}

      {/* =====================================================
          PRINT CSS
      ===================================================== */}

      <style>{`
        @media print {
          body {
            background: white !important;
          }

          button,
          input,
          select,
          textarea {
            display: none !important;
          }

          .sticky {
            position: static !important;
          }

          header {
            background: white !important;
            color: black !important;
            box-shadow: none !important;
          }

          * {
            box-shadow: none !important;
          }
        }
      `}</style>
    </div>
  );
}

/* =========================================================
   INFO COMPONENT
========================================================= */

function Info({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-xs font-semibold leading-5 text-slate-700">
        {value}
      </p>
    </div>
  );
}