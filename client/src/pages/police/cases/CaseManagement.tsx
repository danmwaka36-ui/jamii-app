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
  FaArchive,
  FaBalanceScale,
  FaCheckCircle,
  FaClock,
  FaFileAlt,
  FaFolderOpen,
  FaMapMarkerAlt,
  FaPlus,
  FaSearch,
  FaTimes,
  FaUserShield,
  FaUsers,
} from "react-icons/fa";

import { db } from "../../../firebase/firebase";

type PoliceCase = {
  id: string;
  caseNumber?: string;
  title?: string;
  category?: string;
  description?: string;
  priority?: string;
  status?: string;

  linkedReportId?: string | null;

  investigatorId?: string | null;
  investigatorName?: string | null;

  complainantName?: string;
  complainantPhone?: string;

  victimNames?: string[];
  suspectNames?: string[];
  witnessNames?: string[];

  station?: string;
  county?: string;
  ward?: string;
  location?: string;

  arrestStatus?: string;
  courtStatus?: string;
  investigationNotes?: string;

  createdAt?: any;
  updatedAt?: any;
  closedAt?: any;
};

type PoliceOfficer = {
  id: string;
  fullName?: string;
  role?: string;
  status?: string;
  dutyStatus?: string;
  station?: string;
};

type PoliceReport = {
  id: string;
  type?: string;
  description?: string;
  location?: string;
  reporterName?: string;
  assignedRole?: string;
  status?: string;
};

type CaseForm = {
  title: string;
  category: string;
  description: string;
  priority: string;
  status: string;

  linkedReportId: string;
  investigatorId: string;

  complainantName: string;
  complainantPhone: string;

  victimNames: string;
  suspectNames: string;
  witnessNames: string;

  station: string;
  county: string;
  ward: string;
  location: string;

  arrestStatus: string;
  courtStatus: string;
  investigationNotes: string;
};

const caseCategories = [
  "Assault",
  "Robbery",
  "Burglary",
  "Theft",
  "Fraud",
  "Cybercrime",
  "Domestic Violence",
  "Sexual Offence",
  "Traffic Offence",
  "Drug Offence",
  "Missing Person",
  "Murder",
  "Public Disturbance",
  "Illegal Activity",
  "Other",
];

const casePriorities = ["Low", "Medium", "High", "Critical"];

const caseStatuses = [
  "Open",
  "Under Investigation",
  "Awaiting Evidence",
  "Suspect Arrested",
  "Court Process",
  "Closed",
];

const arrestStatuses = [
  "No Arrest",
  "Person of Interest",
  "Suspect Identified",
  "Warrant Issued",
  "Suspect Arrested",
  "Released",
  "Charged",
];

const courtStatuses = [
  "Not Filed",
  "File Under Review",
  "Filed in Court",
  "Mention Scheduled",
  "Hearing Ongoing",
  "Judgment Pending",
  "Case Concluded",
];

const emptyForm: CaseForm = {
  title: "",
  category: "Other",
  description: "",
  priority: "Medium",
  status: "Open",

  linkedReportId: "",
  investigatorId: "",

  complainantName: "",
  complainantPhone: "",

  victimNames: "",
  suspectNames: "",
  witnessNames: "",

  station: "",
  county: "Mombasa",
  ward: "",
  location: "",

  arrestStatus: "No Arrest",
  courtStatus: "Not Filed",
  investigationNotes: "",
};

function splitNames(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function joinNames(values?: string[]) {
  return values?.join(", ") || "";
}

function formatDateTime(timestamp: any) {
  if (!timestamp?.toDate) return "Time unavailable";

  return timestamp.toDate().toLocaleString("en-KE", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function statusClass(status?: string) {
  switch (status) {
    case "Open":
      return "bg-blue-100 text-blue-700";

    case "Under Investigation":
      return "bg-purple-100 text-purple-700";

    case "Awaiting Evidence":
      return "bg-amber-100 text-amber-700";

    case "Suspect Arrested":
      return "bg-orange-100 text-orange-700";

    case "Court Process":
      return "bg-cyan-100 text-cyan-700";

    case "Closed":
      return "bg-emerald-100 text-emerald-700";

    default:
      return "bg-slate-100 text-slate-700";
  }
}

function priorityClass(priority?: string) {
  switch (priority) {
    case "Critical":
      return "bg-red-100 text-red-700";

    case "High":
      return "bg-orange-100 text-orange-700";

    case "Medium":
      return "bg-yellow-100 text-yellow-700";

    default:
      return "bg-emerald-100 text-emerald-700";
  }
}

function generateCaseNumber() {
  const year = new Date().getFullYear();
  const timestamp = Date.now().toString().slice(-6);

  return `JAMII-POL-${year}-${timestamp}`;
}

export default function CaseManagement() {
  const [cases, setCases] = useState<PoliceCase[]>([]);
  const [officers, setOfficers] = useState<PoliceOfficer[]>([]);
  const [reports, setReports] = useState<PoliceReport[]>([]);

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const [showForm, setShowForm] = useState(false);
  const [editingCaseId, setEditingCaseId] = useState<string | null>(null);
  const [selectedCase, setSelectedCase] = useState<PoliceCase | null>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<CaseForm>(emptyForm);

  useEffect(() => {
    const unsubscribeCases = onSnapshot(
      query(collection(db, "policeCases")),
      (snapshot) => {
        const data = snapshot.docs.map((item) => ({
          id: item.id,
          ...item.data(),
        })) as PoliceCase[];

        data.sort((first, second) => {
          const firstTime = first.createdAt?.toDate?.()?.getTime?.() || 0;
          const secondTime = second.createdAt?.toDate?.()?.getTime?.() || 0;

          return secondTime - firstTime;
        });

        setCases(data);
        setLoading(false);
        setError("");
      },
      (snapshotError) => {
        console.error(snapshotError);
        setLoading(false);
        setError(
          "Unable to load police cases. Check your Firestore security rules."
        );
      }
    );

    const unsubscribeOfficers = onSnapshot(
      query(collection(db, "users"), where("role", "==", "police")),
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

    const unsubscribeReports = onSnapshot(
      query(collection(db, "reports"), where("assignedRole", "==", "police")),
      (snapshot) => {
        const data = snapshot.docs.map((item) => ({
          id: item.id,
          ...item.data(),
        })) as PoliceReport[];

        setReports(data);
      },
      (snapshotError) => {
        console.error(snapshotError);
      }
    );

    return () => {
      unsubscribeCases();
      unsubscribeOfficers();
      unsubscribeReports();
    };
  }, []);

  const activeOfficers = useMemo(() => {
    return officers.filter((officer) => officer.status !== "suspended");
  }, [officers]);

  const filteredCases = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return cases.filter((policeCase) => {
      const matchesSearch =
        !normalizedSearch ||
        policeCase.caseNumber?.toLowerCase().includes(normalizedSearch) ||
        policeCase.title?.toLowerCase().includes(normalizedSearch) ||
        policeCase.category?.toLowerCase().includes(normalizedSearch) ||
        policeCase.description?.toLowerCase().includes(normalizedSearch) ||
        policeCase.location?.toLowerCase().includes(normalizedSearch) ||
        policeCase.station?.toLowerCase().includes(normalizedSearch) ||
        policeCase.investigatorName
          ?.toLowerCase()
          .includes(normalizedSearch) ||
        policeCase.complainantName
          ?.toLowerCase()
          .includes(normalizedSearch) ||
        policeCase.suspectNames?.some((name) =>
          name.toLowerCase().includes(normalizedSearch)
        );

      const matchesStatus =
        statusFilter === "all" || policeCase.status === statusFilter;

      const matchesPriority =
        priorityFilter === "all" ||
        policeCase.priority === priorityFilter;

      const matchesCategory =
        categoryFilter === "all" ||
        policeCase.category === categoryFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPriority &&
        matchesCategory
      );
    });
  }, [cases, search, statusFilter, priorityFilter, categoryFilter]);

  const statistics = useMemo(() => {
    const open = cases.filter(
      (policeCase) => policeCase.status !== "Closed"
    ).length;

    const underInvestigation = cases.filter(
      (policeCase) => policeCase.status === "Under Investigation"
    ).length;

    const awaitingEvidence = cases.filter(
      (policeCase) => policeCase.status === "Awaiting Evidence"
    ).length;

    const arrested = cases.filter(
      (policeCase) =>
        policeCase.arrestStatus === "Suspect Arrested" ||
        policeCase.arrestStatus === "Charged"
    ).length;

    const court = cases.filter(
      (policeCase) =>
        policeCase.status === "Court Process" ||
        policeCase.courtStatus === "Filed in Court" ||
        policeCase.courtStatus === "Hearing Ongoing"
    ).length;

    const closed = cases.filter(
      (policeCase) => policeCase.status === "Closed"
    ).length;

    return {
      total: cases.length,
      open,
      underInvestigation,
      awaitingEvidence,
      arrested,
      court,
      closed,
    };
  }, [cases]);

  function updateForm<K extends keyof CaseForm>(
    field: K,
    value: CaseForm[K]
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingCaseId(null);
    setShowForm(false);
  }

  function openCreateForm() {
    setMessage("");
    setEditingCaseId(null);
    setForm(emptyForm);
    setShowForm(true);
  }

  function openEditForm(policeCase: PoliceCase) {
    setMessage("");
    setEditingCaseId(policeCase.id);

    setForm({
      title: policeCase.title || "",
      category: policeCase.category || "Other",
      description: policeCase.description || "",
      priority: policeCase.priority || "Medium",
      status: policeCase.status || "Open",

      linkedReportId: policeCase.linkedReportId || "",
      investigatorId: policeCase.investigatorId || "",

      complainantName: policeCase.complainantName || "",
      complainantPhone: policeCase.complainantPhone || "",

      victimNames: joinNames(policeCase.victimNames),
      suspectNames: joinNames(policeCase.suspectNames),
      witnessNames: joinNames(policeCase.witnessNames),

      station: policeCase.station || "",
      county: policeCase.county || "Mombasa",
      ward: policeCase.ward || "",
      location: policeCase.location || "",

      arrestStatus: policeCase.arrestStatus || "No Arrest",
      courtStatus: policeCase.courtStatus || "Not Filed",
      investigationNotes: policeCase.investigationNotes || "",
    });

    setShowForm(true);
  }

  async function saveCase(event: React.FormEvent) {
    event.preventDefault();

    const title = form.title.trim();
    const description = form.description.trim();

    if (!title) {
      setMessage("Case title is required.");
      return;
    }

    if (!description) {
      setMessage("Case description is required.");
      return;
    }

    const investigator = officers.find(
      (officer) => officer.id === form.investigatorId
    );

    const caseData = {
      title,
      category: form.category,
      description,
      priority: form.priority,
      status: form.status,

      linkedReportId: form.linkedReportId || null,

      investigatorId: investigator?.id || null,
      investigatorName: investigator?.fullName || null,

      complainantName: form.complainantName.trim(),
      complainantPhone: form.complainantPhone.trim(),

      victimNames: splitNames(form.victimNames),
      suspectNames: splitNames(form.suspectNames),
      witnessNames: splitNames(form.witnessNames),

      station: form.station.trim(),
      county: form.county.trim(),
      ward: form.ward.trim(),
      location: form.location.trim(),

      arrestStatus: form.arrestStatus,
      courtStatus: form.courtStatus,
      investigationNotes: form.investigationNotes.trim(),

      updatedAt: serverTimestamp(),
      closedAt:
        form.status === "Closed"
          ? serverTimestamp()
          : null,
    };

    try {
      setSaving(true);
      setMessage("");

      if (editingCaseId) {
        await updateDoc(
          doc(db, "policeCases", editingCaseId),
          caseData
        );

        setMessage("Police case updated successfully.");
      } else {
        await addDoc(collection(db, "policeCases"), {
          ...caseData,
          caseNumber: generateCaseNumber(),
          createdAt: serverTimestamp(),
        });

        setMessage("Police case opened successfully.");
      }

      resetForm();
    } catch (saveError) {
      console.error(saveError);
      setMessage("Failed to save the police case.");
    } finally {
      setSaving(false);
    }
  }

  async function updateCaseStatus(caseId: string, status: string) {
    try {
      await updateDoc(doc(db, "policeCases", caseId), {
        status,
        updatedAt: serverTimestamp(),
        closedAt:
          status === "Closed"
            ? serverTimestamp()
            : null,
      });

      setMessage(`Case status updated to ${status}.`);
    } catch (updateError) {
      console.error(updateError);
      setMessage("Failed to update case status.");
    }
  }

  async function assignInvestigator(
    caseId: string,
    investigatorId: string
  ) {
    const investigator = officers.find(
      (officer) => officer.id === investigatorId
    );

    try {
      await updateDoc(doc(db, "policeCases", caseId), {
        investigatorId: investigator?.id || null,
        investigatorName: investigator?.fullName || null,
        updatedAt: serverTimestamp(),
      });

      setMessage(
        investigator
          ? `Investigator assigned: ${
              investigator.fullName || "Police Officer"
            }.`
          : "Investigator removed."
      );
    } catch (updateError) {
      console.error(updateError);
      setMessage("Failed to assign investigator.");
    }
  }

  function clearFilters() {
    setSearch("");
    setStatusFilter("all");
    setPriorityFilter("all");
    setCategoryFilter("all");
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h1 className="flex items-center gap-3 text-3xl font-extrabold text-slate-950">
            <FaFolderOpen className="text-blue-700" />
            Police Case Management
          </h1>

          <p className="mt-2 text-slate-600">
            Open investigations, assign investigators, manage suspects,
            victims, witnesses, arrests and court progress.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateForm}
          className="flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 py-3 font-bold text-white hover:bg-blue-800"
        >
          <FaPlus />
          Open New Case
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
          onSubmit={saveCase}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-950">
                {editingCaseId ? "Edit Police Case" : "Open New Police Case"}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Record investigation, people involved and legal progress.
              </p>
            </div>

            <button
              type="button"
              onClick={resetForm}
              className="rounded-xl p-3 text-slate-500 hover:bg-slate-100"
              aria-label="Close case form"
            >
              <FaTimes />
            </button>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            <div>
              <label className="text-sm font-semibold text-slate-700">
                Case Title
              </label>

              <input
                value={form.title}
                onChange={(event) =>
                  updateForm("title", event.target.value)
                }
                placeholder="Example: Robbery at Bamburi"
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700">
                Crime Category
              </label>

              <select
                value={form.category}
                onChange={(event) =>
                  updateForm("category", event.target.value)
                }
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-500"
              >
                {caseCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700">
                Priority
              </label>

              <select
                value={form.priority}
                onChange={(event) =>
                  updateForm("priority", event.target.value)
                }
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-500"
              >
                {casePriorities.map((priority) => (
                  <option key={priority} value={priority}>
                    {priority}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700">
                Case Status
              </label>

              <select
                value={form.status}
                onChange={(event) =>
                  updateForm("status", event.target.value)
                }
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-500"
              >
                {caseStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700">
                Linked Incident
              </label>

              <select
                value={form.linkedReportId}
                onChange={(event) =>
                  updateForm("linkedReportId", event.target.value)
                }
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-500"
              >
                <option value="">No linked incident</option>

                {reports.map((report) => (
                  <option key={report.id} value={report.id}>
                    {report.type || "Police Incident"} —{" "}
                    {report.location || report.id}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700">
                Assigned Investigator
              </label>

              <select
                value={form.investigatorId}
                onChange={(event) =>
                  updateForm("investigatorId", event.target.value)
                }
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-500"
              >
                <option value="">No investigator assigned</option>

                {activeOfficers.map((officer) => (
                  <option key={officer.id} value={officer.id}>
                    {officer.fullName || "Unnamed Officer"}
                    {officer.station ? ` — ${officer.station}` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2 xl:col-span-3">
              <label className="text-sm font-semibold text-slate-700">
                Case Description
              </label>

              <textarea
                rows={4}
                value={form.description}
                onChange={(event) =>
                  updateForm("description", event.target.value)
                }
                placeholder="Describe the offence, facts and initial investigation findings."
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700">
                Complainant Name
              </label>

              <input
                value={form.complainantName}
                onChange={(event) =>
                  updateForm("complainantName", event.target.value)
                }
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700">
                Complainant Phone
              </label>

              <input
                value={form.complainantPhone}
                onChange={(event) =>
                  updateForm("complainantPhone", event.target.value)
                }
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700">
                Victims
              </label>

              <input
                value={form.victimNames}
                onChange={(event) =>
                  updateForm("victimNames", event.target.value)
                }
                placeholder="Separate names with commas"
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700">
                Suspects
              </label>

              <input
                value={form.suspectNames}
                onChange={(event) =>
                  updateForm("suspectNames", event.target.value)
                }
                placeholder="Separate names with commas"
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700">
                Witnesses
              </label>

              <input
                value={form.witnessNames}
                onChange={(event) =>
                  updateForm("witnessNames", event.target.value)
                }
                placeholder="Separate names with commas"
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
              />
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
                placeholder="Example: Bamburi Police Station"
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
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700">
                Offence Location
              </label>

              <input
                value={form.location}
                onChange={(event) =>
                  updateForm("location", event.target.value)
                }
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700">
                Arrest Status
              </label>

              <select
                value={form.arrestStatus}
                onChange={(event) =>
                  updateForm("arrestStatus", event.target.value)
                }
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-500"
              >
                {arrestStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700">
                Court Status
              </label>

              <select
                value={form.courtStatus}
                onChange={(event) =>
                  updateForm("courtStatus", event.target.value)
                }
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-500"
              >
                {courtStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2 xl:col-span-3">
              <label className="text-sm font-semibold text-slate-700">
                Investigation Notes
              </label>

              <textarea
                rows={4}
                value={form.investigationNotes}
                onChange={(event) =>
                  updateForm("investigationNotes", event.target.value)
                }
                placeholder="Record investigator notes, interviews, leads and follow-up actions."
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
                : editingCaseId
                  ? "Update Case"
                  : "Open Case"}
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
          <FaFileAlt className="text-2xl text-blue-700" />
          <p className="mt-4 text-sm text-slate-500">Total Cases</p>
          <h2 className="mt-1 text-3xl font-extrabold">{statistics.total}</h2>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <FaFolderOpen className="text-2xl text-blue-600" />
          <p className="mt-4 text-sm text-slate-500">Open Cases</p>
          <h2 className="mt-1 text-3xl font-extrabold text-blue-600">
            {statistics.open}
          </h2>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <FaUserShield className="text-2xl text-purple-600" />
          <p className="mt-4 text-sm text-slate-500">Investigating</p>
          <h2 className="mt-1 text-3xl font-extrabold text-purple-600">
            {statistics.underInvestigation}
          </h2>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <FaClock className="text-2xl text-amber-600" />
          <p className="mt-4 text-sm text-slate-500">Awaiting Evidence</p>
          <h2 className="mt-1 text-3xl font-extrabold text-amber-600">
            {statistics.awaitingEvidence}
          </h2>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <FaUsers className="text-2xl text-orange-600" />
          <p className="mt-4 text-sm text-slate-500">Arrests</p>
          <h2 className="mt-1 text-3xl font-extrabold text-orange-600">
            {statistics.arrested}
          </h2>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <FaBalanceScale className="text-2xl text-cyan-600" />
          <p className="mt-4 text-sm text-slate-500">Court Cases</p>
          <h2 className="mt-1 text-3xl font-extrabold text-cyan-600">
            {statistics.court}
          </h2>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <FaCheckCircle className="text-2xl text-emerald-600" />
          <p className="mt-4 text-sm text-slate-500">Closed Cases</p>
          <h2 className="mt-1 text-3xl font-extrabold text-emerald-600">
            {statistics.closed}
          </h2>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4 xl:grid-cols-[1fr_220px_220px_230px_auto]">
          <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <FaSearch className="text-slate-400" />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search case number, title, suspect or investigator..."
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
          >
            <option value="all">All Statuses</option>

            {caseStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>

          <select
            value={priorityFilter}
            onChange={(event) => setPriorityFilter(event.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
          >
            <option value="all">All Priorities</option>

            {casePriorities.map((priority) => (
              <option key={priority} value={priority}>
                {priority}
              </option>
            ))}
          </select>

          <select
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
          >
            <option value="all">All Categories</option>

            {caseCategories.map((category) => (
              <option key={category} value={category}>
                {category}
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
          Loading police cases...
        </div>
      ) : filteredCases.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500 shadow-sm">
          No police cases match the current filters.
        </div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-2">
          {filteredCases.map((policeCase) => (
            <div
              key={policeCase.id}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-2xl text-blue-700">
                  <FaFileAlt />
                </div>

                <div className="flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-mono text-xs font-bold text-blue-700">
                        {policeCase.caseNumber || "No case number"}
                      </p>

                      <h2 className="mt-1 text-xl font-bold text-slate-950">
                        {policeCase.title || "Untitled Case"}
                      </h2>

                      <p className="mt-1 text-sm text-slate-500">
                        {policeCase.category || "Other"}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${priorityClass(
                          policeCase.priority
                        )}`}
                      >
                        {policeCase.priority || "Medium"}
                      </span>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${statusClass(
                          policeCase.status
                        )}`}
                      >
                        {policeCase.status || "Open"}
                      </span>
                    </div>
                  </div>

                  <p className="mt-4 text-sm leading-6 text-slate-600">
                    {policeCase.description || "No description provided."}
                  </p>

                  <div className="mt-5 grid gap-4 md:grid-cols-2">
                    <div className="rounded-xl bg-slate-50 p-4">
                      <p className="text-xs text-slate-500">
                        Assigned Investigator
                      </p>

                      <p className="mt-1 font-bold text-slate-900">
                        {policeCase.investigatorName || "Not assigned"}
                      </p>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-4">
                      <p className="text-xs text-slate-500">Station</p>

                      <p className="mt-1 font-bold text-slate-900">
                        {policeCase.station || "Not assigned"}
                      </p>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-4">
                      <p className="text-xs text-slate-500">Location</p>

                      <p className="mt-1 flex items-center gap-2 font-bold text-slate-900">
                        <FaMapMarkerAlt className="text-red-500" />
                        {policeCase.location || "Not recorded"}
                      </p>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-4">
                      <p className="text-xs text-slate-500">Opened</p>

                      <p className="mt-1 font-bold text-slate-900">
                        {formatDateTime(policeCase.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="text-sm font-semibold text-slate-600">
                        Case Status
                      </label>

                      <select
                        value={policeCase.status || "Open"}
                        onChange={(event) =>
                          updateCaseStatus(
                            policeCase.id,
                            event.target.value
                          )
                        }
                        className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
                      >
                        {caseStatuses.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-slate-600">
                        Investigator
                      </label>

                      <select
                        value={policeCase.investigatorId || ""}
                        onChange={(event) =>
                          assignInvestigator(
                            policeCase.id,
                            event.target.value
                          )
                        }
                        className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
                      >
                        <option value="">No investigator assigned</option>

                        {activeOfficers.map((officer) => (
                          <option key={officer.id} value={officer.id}>
                            {officer.fullName || "Unnamed Officer"}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {selectedCase?.id === policeCase.id && (
                    <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50 p-5 text-sm text-blue-800">
                      <div className="grid gap-4 md:grid-cols-2">
                        <p>
                          <span className="font-semibold">Complainant:</span>{" "}
                          {policeCase.complainantName || "Not recorded"}
                        </p>

                        <p>
                          <span className="font-semibold">Phone:</span>{" "}
                          {policeCase.complainantPhone || "Not recorded"}
                        </p>

                        <p>
                          <span className="font-semibold">Victims:</span>{" "}
                          {joinNames(policeCase.victimNames) || "None recorded"}
                        </p>

                        <p>
                          <span className="font-semibold">Suspects:</span>{" "}
                          {joinNames(policeCase.suspectNames) || "None recorded"}
                        </p>

                        <p>
                          <span className="font-semibold">Witnesses:</span>{" "}
                          {joinNames(policeCase.witnessNames) || "None recorded"}
                        </p>

                        <p>
                          <span className="font-semibold">Arrest status:</span>{" "}
                          {policeCase.arrestStatus || "No Arrest"}
                        </p>

                        <p>
                          <span className="font-semibold">Court status:</span>{" "}
                          {policeCase.courtStatus || "Not Filed"}
                        </p>

                        <p>
                          <span className="font-semibold">
                            Linked incident:
                          </span>{" "}
                          {policeCase.linkedReportId || "None"}
                        </p>

                        <p className="md:col-span-2">
                          <span className="font-semibold">
                            Investigation notes:
                          </span>{" "}
                          {policeCase.investigationNotes ||
                            "No investigation notes recorded."}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="mt-5 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => openEditForm(policeCase)}
                      className="rounded-xl bg-blue-700 px-4 py-3 text-sm font-bold text-white hover:bg-blue-800"
                    >
                      Edit Case
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setSelectedCase(
                          selectedCase?.id === policeCase.id
                            ? null
                            : policeCase
                        )
                      }
                      className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
                    >
                      {selectedCase?.id === policeCase.id
                        ? "Hide Details"
                        : "View Details"}
                    </button>

                    {policeCase.status === "Closed" ? (
                      <button
                        type="button"
                        onClick={() =>
                          updateCaseStatus(policeCase.id, "Open")
                        }
                        className="rounded-xl bg-amber-600 px-4 py-3 text-sm font-bold text-white hover:bg-amber-700"
                      >
                        Reopen Case
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          updateCaseStatus(policeCase.id, "Closed")
                        }
                        className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-700"
                      >
                        <FaArchive />
                        Close Case
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5 text-sm leading-6 text-blue-700">
        Police cases are saved in the Firestore{" "}
        <span className="font-mono font-bold">policeCases</span> collection.
        Evidence uploads will later link to each case using the case document ID.
      </div>
    </div>
  );
}