import { useEffect, useMemo, useState } from "react";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import {
  FaArchive,
  FaBox,
  FaCheckCircle,
  FaClock,
  FaEdit,
  FaEye,
  FaFilter,
  FaFolderOpen,
  FaLink,
  FaPlus,
  FaSearch,
  FaShieldAlt,
  FaTimes,
  FaUserShield,
} from "react-icons/fa";

import { db } from "../../../firebase/firebase";

type EvidenceType =
  | "Physical"
  | "Digital"
  | "Document"
  | "Photographic"
  | "Biological"
  | "Weapon"
  | "Other";

type CustodyStatus =
  | "Collected"
  | "In Transit"
  | "In Storage"
  | "Under Examination"
  | "Released"
  | "Disposed";

type VerificationStatus =
  | "Pending"
  | "Verified"
  | "Rejected"
  | "Requires Review";

interface PoliceCase {
  id: string;
  caseNumber: string;
  title: string;
  status?: string;
}

interface ChainOfCustodyEntry {
  id: string;
  action: string;
  handledBy: string;
  location: string;
  notes: string;
  date: string;
}

interface EvidenceFileMetadata {
  fileName: string;
  fileType: string;
  fileSize: number;
  fileUrl?: string;
}

interface EvidenceRecord {
  id: string;
  evidenceReference: string;
  caseId: string;
  caseNumber: string;
  caseTitle: string;
  evidenceType: EvidenceType;
  description: string;
  collectedBy: string;
  collectionDate: string;
  collectionLocation: string;
  storageLocation: string;
  custodyStatus: CustodyStatus;
  verificationStatus: VerificationStatus;
  chainOfCustody: ChainOfCustodyEntry[];
  files: EvidenceFileMetadata[];
  createdAt?: Timestamp | null;
  updatedAt?: Timestamp | null;
}

interface EvidenceFormData {
  evidenceReference: string;
  caseId: string;
  evidenceType: EvidenceType;
  description: string;
  collectedBy: string;
  collectionDate: string;
  collectionLocation: string;
  storageLocation: string;
  custodyStatus: CustodyStatus;
  verificationStatus: VerificationStatus;
}

const initialFormData: EvidenceFormData = {
  evidenceReference: "",
  caseId: "",
  evidenceType: "Physical",
  description: "",
  collectedBy: "",
  collectionDate: "",
  collectionLocation: "",
  storageLocation: "",
  custodyStatus: "Collected",
  verificationStatus: "Pending",
};

const evidenceTypes: EvidenceType[] = [
  "Physical",
  "Digital",
  "Document",
  "Photographic",
  "Biological",
  "Weapon",
  "Other",
];

const custodyStatuses: CustodyStatus[] = [
  "Collected",
  "In Transit",
  "In Storage",
  "Under Examination",
  "Released",
  "Disposed",
];

const verificationStatuses: VerificationStatus[] = [
  "Pending",
  "Verified",
  "Rejected",
  "Requires Review",
];

const formatDate = (dateValue?: string): string => {
  if (!dateValue) {
    return "Not provided";
  }

  const parsedDate = new Date(dateValue);

  if (Number.isNaN(parsedDate.getTime())) {
    return dateValue;
  }

  return parsedDate.toLocaleString();
};

const formatFileSize = (size: number): string => {
  if (size <= 0) {
    return "0 KB";
  }

  const kilobytes = size / 1024;

  if (kilobytes < 1024) {
    return `${kilobytes.toFixed(1)} KB`;
  }

  return `${(kilobytes / 1024).toFixed(1)} MB`;
};

const generateEvidenceReference = (): string => {
  const year = new Date().getFullYear();
  const randomNumber = Math.floor(100000 + Math.random() * 900000);

  return `EVD-${year}-${randomNumber}`;
};

export default function EvidenceManagement() {
  const [evidenceRecords, setEvidenceRecords] = useState<EvidenceRecord[]>([]);
  const [policeCases, setPoliceCases] = useState<PoliceCase[]>([]);
  const [formData, setFormData] =
    useState<EvidenceFormData>(initialFormData);

  const [selectedEvidence, setSelectedEvidence] =
    useState<EvidenceRecord | null>(null);

  const [editingEvidence, setEditingEvidence] =
    useState<EvidenceRecord | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [custodyFilter, setCustodyFilter] = useState("All");
  const [verificationFilter, setVerificationFilter] = useState("All");

  const [showEvidenceForm, setShowEvidenceForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showCustodyForm, setShowCustodyForm] = useState(false);

  const [custodyAction, setCustodyAction] = useState("");
  const [custodyHandledBy, setCustodyHandledBy] = useState("");
  const [custodyLocation, setCustodyLocation] = useState("");
  const [custodyNotes, setCustodyNotes] = useState("");

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const loadPoliceCases = async () => {
    try {
      const casesSnapshot = await getDocs(collection(db, "policeCases"));

      const caseRecords: PoliceCase[] = casesSnapshot.docs.map(
        (caseDocument) => {
          const data = caseDocument.data();

          return {
            id: caseDocument.id,
            caseNumber:
              data.caseNumber ||
              data.referenceNumber ||
              data.caseReference ||
              caseDocument.id,
            title:
              data.title ||
              data.caseTitle ||
              data.incidentType ||
              data.description ||
              "Untitled police case",
            status: data.status || "Unknown",
          };
        },
      );

      setPoliceCases(caseRecords);
    } catch (error) {
      console.error("Failed to load police cases:", error);
      setErrorMessage("Police cases could not be loaded.");
    }
  };

  const loadEvidenceRecords = async () => {
    setLoading(true);
    setErrorMessage("");

    try {
      let evidenceSnapshot;

      try {
        const evidenceQuery = query(
          collection(db, "policeEvidence"),
          orderBy("createdAt", "desc"),
        );

        evidenceSnapshot = await getDocs(evidenceQuery);
      } catch {
        evidenceSnapshot = await getDocs(
          collection(db, "policeEvidence"),
        );
      }

      const records: EvidenceRecord[] = evidenceSnapshot.docs.map(
        (evidenceDocument) => {
          const data = evidenceDocument.data();

          return {
            id: evidenceDocument.id,
            evidenceReference:
              data.evidenceReference || evidenceDocument.id,
            caseId: data.caseId || "",
            caseNumber: data.caseNumber || "Unlinked",
            caseTitle: data.caseTitle || "No linked case",
            evidenceType: data.evidenceType || "Other",
            description: data.description || "",
            collectedBy: data.collectedBy || "",
            collectionDate: data.collectionDate || "",
            collectionLocation: data.collectionLocation || "",
            storageLocation: data.storageLocation || "",
            custodyStatus: data.custodyStatus || "Collected",
            verificationStatus:
              data.verificationStatus || "Pending",
            chainOfCustody: Array.isArray(data.chainOfCustody)
              ? data.chainOfCustody
              : [],
            files: Array.isArray(data.files) ? data.files : [],
            createdAt: data.createdAt || null,
            updatedAt: data.updatedAt || null,
          };
        },
      );

      records.sort((firstRecord, secondRecord) => {
        const firstTime =
          firstRecord.createdAt?.toMillis?.() ?? 0;
        const secondTime =
          secondRecord.createdAt?.toMillis?.() ?? 0;

        return secondTime - firstTime;
      });

      setEvidenceRecords(records);
    } catch (error) {
      console.error("Failed to load evidence:", error);
      setErrorMessage("Evidence records could not be loaded.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void Promise.all([loadPoliceCases(), loadEvidenceRecords()]);
  }, []);

  const filteredEvidence = useMemo(() => {
    const normalizedSearch = searchTerm.toLowerCase().trim();

    return evidenceRecords.filter((record) => {
      const matchesSearch =
        !normalizedSearch ||
        record.evidenceReference
          .toLowerCase()
          .includes(normalizedSearch) ||
        record.caseNumber.toLowerCase().includes(normalizedSearch) ||
        record.caseTitle.toLowerCase().includes(normalizedSearch) ||
        record.description.toLowerCase().includes(normalizedSearch) ||
        record.collectedBy.toLowerCase().includes(normalizedSearch) ||
        record.collectionLocation
          .toLowerCase()
          .includes(normalizedSearch) ||
        record.storageLocation
          .toLowerCase()
          .includes(normalizedSearch);

      const matchesType =
        typeFilter === "All" ||
        record.evidenceType === typeFilter;

      const matchesCustody =
        custodyFilter === "All" ||
        record.custodyStatus === custodyFilter;

      const matchesVerification =
        verificationFilter === "All" ||
        record.verificationStatus === verificationFilter;

      return (
        matchesSearch &&
        matchesType &&
        matchesCustody &&
        matchesVerification
      );
    });
  }, [
    evidenceRecords,
    searchTerm,
    typeFilter,
    custodyFilter,
    verificationFilter,
  ]);

  const dashboardStatistics = useMemo(() => {
    return {
      total: evidenceRecords.length,
      verified: evidenceRecords.filter(
        (record) => record.verificationStatus === "Verified",
      ).length,
      pending: evidenceRecords.filter(
        (record) => record.verificationStatus === "Pending",
      ).length,
      inStorage: evidenceRecords.filter(
        (record) => record.custodyStatus === "In Storage",
      ).length,
    };
  }, [evidenceRecords]);

  const handleInputChange = (
    event:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLTextAreaElement>
      | React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const { name, value } = event.target;

    setFormData((currentFormData) => ({
      ...currentFormData,
      [name]: value,
    }));
  };

  const openCreateForm = () => {
    setEditingEvidence(null);
    setSelectedFiles([]);
    setFormData({
      ...initialFormData,
      evidenceReference: generateEvidenceReference(),
    });
    setErrorMessage("");
    setShowEvidenceForm(true);
  };

  const openEditForm = (record: EvidenceRecord) => {
    setEditingEvidence(record);
    setSelectedFiles([]);
    setFormData({
      evidenceReference: record.evidenceReference,
      caseId: record.caseId,
      evidenceType: record.evidenceType,
      description: record.description,
      collectedBy: record.collectedBy,
      collectionDate: record.collectionDate,
      collectionLocation: record.collectionLocation,
      storageLocation: record.storageLocation,
      custodyStatus: record.custodyStatus,
      verificationStatus: record.verificationStatus,
    });
    setErrorMessage("");
    setShowEvidenceForm(true);
  };

  const closeEvidenceForm = () => {
    setShowEvidenceForm(false);
    setEditingEvidence(null);
    setSelectedFiles([]);
    setFormData(initialFormData);
  };

  const handleFileSelection = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = Array.from(event.target.files ?? []);
    setSelectedFiles(files);
  };

  const saveEvidence = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    setErrorMessage("");

    if (!formData.evidenceReference.trim()) {
      setErrorMessage("Evidence reference number is required.");
      return;
    }

    if (!formData.caseId) {
      setErrorMessage("Select a police case.");
      return;
    }

    if (!formData.description.trim()) {
      setErrorMessage("Evidence description is required.");
      return;
    }

    if (!formData.collectedBy.trim()) {
      setErrorMessage("Collected by is required.");
      return;
    }

    if (!formData.collectionDate) {
      setErrorMessage("Collection date is required.");
      return;
    }

    const linkedCase = policeCases.find(
      (policeCase) => policeCase.id === formData.caseId,
    );

    if (!linkedCase) {
      setErrorMessage("The selected police case could not be found.");
      return;
    }

    const newFileMetadata: EvidenceFileMetadata[] =
      selectedFiles.map((file) => ({
        fileName: file.name,
        fileType: file.type || "Unknown",
        fileSize: file.size,
      }));

    setSaving(true);

    try {
      if (editingEvidence) {
        const updatedFiles = [
          ...editingEvidence.files,
          ...newFileMetadata,
        ];

        await updateDoc(
          doc(db, "policeEvidence", editingEvidence.id),
          {
            evidenceReference:
              formData.evidenceReference.trim(),
            caseId: linkedCase.id,
            caseNumber: linkedCase.caseNumber,
            caseTitle: linkedCase.title,
            evidenceType: formData.evidenceType,
            description: formData.description.trim(),
            collectedBy: formData.collectedBy.trim(),
            collectionDate: formData.collectionDate,
            collectionLocation:
              formData.collectionLocation.trim(),
            storageLocation: formData.storageLocation.trim(),
            custodyStatus: formData.custodyStatus,
            verificationStatus:
              formData.verificationStatus,
            files: updatedFiles,
            updatedAt: serverTimestamp(),
          },
        );
      } else {
        const initialCustodyEntry: ChainOfCustodyEntry = {
          id: crypto.randomUUID(),
          action: "Evidence collected and registered",
          handledBy: formData.collectedBy.trim(),
          location:
            formData.collectionLocation.trim() ||
            "Collection location not provided",
          notes: "Initial evidence registration",
          date: new Date().toISOString(),
        };

        await addDoc(collection(db, "policeEvidence"), {
          evidenceReference:
            formData.evidenceReference.trim(),
          caseId: linkedCase.id,
          caseNumber: linkedCase.caseNumber,
          caseTitle: linkedCase.title,
          evidenceType: formData.evidenceType,
          description: formData.description.trim(),
          collectedBy: formData.collectedBy.trim(),
          collectionDate: formData.collectionDate,
          collectionLocation:
            formData.collectionLocation.trim(),
          storageLocation: formData.storageLocation.trim(),
          custodyStatus: formData.custodyStatus,
          verificationStatus:
            formData.verificationStatus,
          chainOfCustody: [initialCustodyEntry],
          files: newFileMetadata,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }

      closeEvidenceForm();
      await loadEvidenceRecords();
    } catch (error) {
      console.error("Failed to save evidence:", error);
      setErrorMessage(
        "The evidence record could not be saved. Check Firestore permissions.",
      );
    } finally {
      setSaving(false);
    }
  };

  const openEvidenceDetails = (record: EvidenceRecord) => {
    setSelectedEvidence(record);
    setShowDetails(true);
    setShowCustodyForm(false);
    resetCustodyForm();
  };

  const resetCustodyForm = () => {
    setCustodyAction("");
    setCustodyHandledBy("");
    setCustodyLocation("");
    setCustodyNotes("");
  };

  const addCustodyEntry = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (!selectedEvidence) {
      return;
    }

    if (!custodyAction.trim() || !custodyHandledBy.trim()) {
      setErrorMessage(
        "Custody action and handler name are required.",
      );
      return;
    }

    const newEntry: ChainOfCustodyEntry = {
      id: crypto.randomUUID(),
      action: custodyAction.trim(),
      handledBy: custodyHandledBy.trim(),
      location: custodyLocation.trim(),
      notes: custodyNotes.trim(),
      date: new Date().toISOString(),
    };

    const updatedChainOfCustody = [
      ...selectedEvidence.chainOfCustody,
      newEntry,
    ];

    setSaving(true);

    try {
      await updateDoc(
        doc(db, "policeEvidence", selectedEvidence.id),
        {
          chainOfCustody: updatedChainOfCustody,
          updatedAt: serverTimestamp(),
        },
      );

      const updatedEvidence = {
        ...selectedEvidence,
        chainOfCustody: updatedChainOfCustody,
      };

      setSelectedEvidence(updatedEvidence);
      setEvidenceRecords((currentRecords) =>
        currentRecords.map((record) =>
          record.id === updatedEvidence.id
            ? updatedEvidence
            : record,
        ),
      );

      resetCustodyForm();
      setShowCustodyForm(false);
      setErrorMessage("");
    } catch (error) {
      console.error("Failed to update chain of custody:", error);
      setErrorMessage(
        "The chain-of-custody entry could not be saved.",
      );
    } finally {
      setSaving(false);
    }
  };

  const updateEvidenceStatus = async (
    record: EvidenceRecord,
    field: "custodyStatus" | "verificationStatus",
    value: CustodyStatus | VerificationStatus,
  ) => {
    setSaving(true);
    setErrorMessage("");

    try {
      await updateDoc(doc(db, "policeEvidence", record.id), {
        [field]: value,
        updatedAt: serverTimestamp(),
      });

      const updatedRecord = {
        ...record,
        [field]: value,
      } as EvidenceRecord;

      setEvidenceRecords((currentRecords) =>
        currentRecords.map((currentRecord) =>
          currentRecord.id === record.id
            ? updatedRecord
            : currentRecord,
        ),
      );

      if (selectedEvidence?.id === record.id) {
        setSelectedEvidence(updatedRecord);
      }
    } catch (error) {
      console.error("Failed to update evidence status:", error);
      setErrorMessage("The evidence status could not be updated.");
    } finally {
      setSaving(false);
    }
  };

  const getVerificationClass = (
    status: VerificationStatus,
  ): string => {
    if (status === "Verified") {
      return "evidence-status evidence-status-success";
    }

    if (status === "Rejected") {
      return "evidence-status evidence-status-danger";
    }

    if (status === "Requires Review") {
      return "evidence-status evidence-status-warning";
    }

    return "evidence-status evidence-status-pending";
  };

  const getCustodyClass = (status: CustodyStatus): string => {
    if (status === "In Storage") {
      return "evidence-status evidence-status-success";
    }

    if (
      status === "Under Examination" ||
      status === "In Transit"
    ) {
      return "evidence-status evidence-status-warning";
    }

    if (status === "Disposed") {
      return "evidence-status evidence-status-danger";
    }

    return "evidence-status evidence-status-pending";
  };

  return (
    <div className="evidence-page">
      <style>
        {`
          .evidence-page {
            min-height: 100%;
            padding: 28px;
            background:
              radial-gradient(circle at top right, rgba(37, 99, 235, 0.10), transparent 30%),
              #f4f7fb;
            color: #182033;
            font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          }

          .evidence-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 20px;
            margin-bottom: 24px;
          }

          .evidence-header h1 {
            margin: 0 0 8px;
            font-size: clamp(25px, 3vw, 36px);
            letter-spacing: -0.03em;
          }

          .evidence-header p {
            margin: 0;
            color: #657089;
            max-width: 720px;
            line-height: 1.6;
          }

          .evidence-primary-button,
          .evidence-secondary-button,
          .evidence-icon-button {
            border: 0;
            cursor: pointer;
            font: inherit;
            transition: 0.2s ease;
          }

          .evidence-primary-button {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 9px;
            padding: 12px 18px;
            border-radius: 12px;
            background: linear-gradient(135deg, #1d4ed8, #2563eb);
            color: white;
            font-weight: 700;
            box-shadow: 0 10px 25px rgba(37, 99, 235, 0.22);
          }

          .evidence-primary-button:hover {
            transform: translateY(-1px);
            box-shadow: 0 14px 30px rgba(37, 99, 235, 0.28);
          }

          .evidence-primary-button:disabled {
            opacity: 0.65;
            cursor: not-allowed;
            transform: none;
          }

          .evidence-secondary-button {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            padding: 11px 16px;
            border-radius: 11px;
            background: #eef2f8;
            color: #26334d;
            font-weight: 700;
          }

          .evidence-secondary-button:hover {
            background: #e3e9f2;
          }

          .evidence-stat-grid {
            display: grid;
            grid-template-columns: repeat(4, minmax(0, 1fr));
            gap: 16px;
            margin-bottom: 22px;
          }

          .evidence-stat-card {
            padding: 20px;
            background: rgba(255, 255, 255, 0.94);
            border: 1px solid #e6eaf1;
            border-radius: 18px;
            box-shadow: 0 12px 35px rgba(37, 46, 68, 0.07);
          }

          .evidence-stat-top {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 14px;
          }

          .evidence-stat-icon {
            width: 42px;
            height: 42px;
            display: grid;
            place-items: center;
            border-radius: 13px;
            background: #edf4ff;
            color: #2563eb;
          }

          .evidence-stat-card span {
            color: #748096;
            font-size: 13px;
            font-weight: 600;
          }

          .evidence-stat-card strong {
            display: block;
            font-size: 30px;
            letter-spacing: -0.03em;
          }

          .evidence-panel {
            background: rgba(255, 255, 255, 0.96);
            border: 1px solid #e4e9f1;
            border-radius: 20px;
            box-shadow: 0 16px 45px rgba(31, 42, 68, 0.08);
            overflow: hidden;
          }

          .evidence-toolbar {
            display: grid;
            grid-template-columns: minmax(240px, 1.7fr) repeat(3, minmax(150px, 0.7fr));
            gap: 12px;
            padding: 18px;
            border-bottom: 1px solid #e9edf3;
          }

          .evidence-search-wrapper,
          .evidence-filter-wrapper {
            position: relative;
          }

          .evidence-search-wrapper svg,
          .evidence-filter-wrapper svg {
            position: absolute;
            left: 14px;
            top: 50%;
            transform: translateY(-50%);
            color: #8390a5;
            pointer-events: none;
          }

          .evidence-search-wrapper input,
          .evidence-filter-wrapper select {
            width: 100%;
            box-sizing: border-box;
            min-height: 45px;
            border: 1px solid #dfe5ee;
            border-radius: 12px;
            padding: 10px 13px 10px 40px;
            background: #f9fbfd;
            color: #1f2937;
            outline: none;
            font: inherit;
          }

          .evidence-search-wrapper input:focus,
          .evidence-filter-wrapper select:focus,
          .evidence-form-group input:focus,
          .evidence-form-group select:focus,
          .evidence-form-group textarea:focus {
            border-color: #2563eb;
            box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.11);
          }

          .evidence-table-wrapper {
            overflow-x: auto;
          }

          .evidence-table {
            width: 100%;
            border-collapse: collapse;
            min-width: 1100px;
          }

          .evidence-table th {
            padding: 15px 18px;
            text-align: left;
            background: #f8fafc;
            color: #6d788c;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.06em;
            border-bottom: 1px solid #e6eaf0;
          }

          .evidence-table td {
            padding: 16px 18px;
            border-bottom: 1px solid #edf0f5;
            vertical-align: middle;
            font-size: 14px;
          }

          .evidence-table tbody tr:hover {
            background: #fbfdff;
          }

          .evidence-reference {
            font-weight: 800;
            color: #1d4ed8;
          }

          .evidence-case-title {
            margin-top: 4px;
            color: #7a8598;
            font-size: 12px;
            max-width: 220px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .evidence-type-badge {
            display: inline-flex;
            padding: 7px 10px;
            border-radius: 999px;
            background: #edf4ff;
            color: #245bc7;
            font-size: 12px;
            font-weight: 700;
          }

          .evidence-status {
            display: inline-flex;
            align-items: center;
            padding: 7px 10px;
            border-radius: 999px;
            font-size: 12px;
            font-weight: 800;
          }

          .evidence-status-success {
            background: #e8f8ef;
            color: #16804b;
          }

          .evidence-status-warning {
            background: #fff5da;
            color: #9a6700;
          }

          .evidence-status-danger {
            background: #ffe9e9;
            color: #c63333;
          }

          .evidence-status-pending {
            background: #edf1f6;
            color: #596579;
          }

          .evidence-actions {
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .evidence-icon-button {
            width: 36px;
            height: 36px;
            display: grid;
            place-items: center;
            border-radius: 10px;
            background: #eef3f9;
            color: #34435c;
          }

          .evidence-icon-button:hover {
            background: #dfe9f6;
            color: #1d4ed8;
          }

          .evidence-empty-state {
            padding: 70px 20px;
            text-align: center;
            color: #6d788a;
          }

          .evidence-empty-state svg {
            font-size: 45px;
            color: #b7c0cf;
            margin-bottom: 15px;
          }

          .evidence-empty-state h3 {
            margin: 0 0 8px;
            color: #28344a;
          }

          .evidence-error {
            margin-bottom: 16px;
            padding: 13px 15px;
            border-radius: 12px;
            background: #fff0f0;
            color: #b42318;
            border: 1px solid #ffd2d2;
          }

          .evidence-modal-overlay {
            position: fixed;
            inset: 0;
            z-index: 1000;
            display: grid;
            place-items: center;
            padding: 20px;
            background: rgba(16, 24, 40, 0.62);
            backdrop-filter: blur(4px);
          }

          .evidence-modal {
            width: min(860px, 100%);
            max-height: 92vh;
            overflow-y: auto;
            background: white;
            border-radius: 22px;
            box-shadow: 0 30px 90px rgba(0, 0, 0, 0.28);
          }

          .evidence-modal-large {
            width: min(1050px, 100%);
          }

          .evidence-modal-header {
            position: sticky;
            top: 0;
            z-index: 2;
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 15px;
            padding: 20px 22px;
            background: rgba(255, 255, 255, 0.96);
            border-bottom: 1px solid #e7ebf1;
            backdrop-filter: blur(10px);
          }

          .evidence-modal-header h2 {
            margin: 0 0 5px;
            font-size: 22px;
          }

          .evidence-modal-header p {
            margin: 0;
            color: #727e91;
            font-size: 14px;
          }

          .evidence-close-button {
            width: 38px;
            height: 38px;
            border: 0;
            border-radius: 11px;
            background: #eef2f7;
            color: #49566c;
            cursor: pointer;
          }

          .evidence-modal-body {
            padding: 22px;
          }

          .evidence-form-grid {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 16px;
          }

          .evidence-form-group {
            display: flex;
            flex-direction: column;
            gap: 7px;
          }

          .evidence-form-group-full {
            grid-column: 1 / -1;
          }

          .evidence-form-group label {
            color: #3c475a;
            font-size: 13px;
            font-weight: 800;
          }

          .evidence-form-group input,
          .evidence-form-group select,
          .evidence-form-group textarea {
            width: 100%;
            box-sizing: border-box;
            border: 1px solid #dce3ec;
            border-radius: 11px;
            padding: 11px 12px;
            background: #fbfcfe;
            color: #1f2937;
            outline: none;
            font: inherit;
          }

          .evidence-form-group textarea {
            resize: vertical;
            min-height: 105px;
          }

          .evidence-file-note {
            margin-top: 6px;
            color: #748096;
            font-size: 12px;
            line-height: 1.5;
          }

          .evidence-selected-files {
            margin: 8px 0 0;
            padding-left: 18px;
            color: #506078;
            font-size: 13px;
          }

          .evidence-modal-footer {
            display: flex;
            justify-content: flex-end;
            gap: 10px;
            padding: 18px 22px;
            border-top: 1px solid #e7ebf1;
          }

          .evidence-details-grid {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 14px;
            margin-bottom: 24px;
          }

          .evidence-detail-card {
            padding: 16px;
            border: 1px solid #e4e9f0;
            border-radius: 14px;
            background: #fafcfe;
          }

          .evidence-detail-card span {
            display: block;
            margin-bottom: 7px;
            color: #7a8699;
            font-size: 12px;
            font-weight: 700;
          }

          .evidence-detail-card strong {
            display: block;
            color: #263247;
            line-height: 1.45;
            word-break: break-word;
          }

          .evidence-detail-section {
            margin-top: 22px;
          }

          .evidence-section-heading {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 15px;
            margin-bottom: 12px;
          }

          .evidence-section-heading h3 {
            margin: 0;
          }

          .evidence-description-box {
            padding: 16px;
            border-radius: 14px;
            background: #f7f9fc;
            color: #46536a;
            line-height: 1.7;
            white-space: pre-wrap;
          }

          .evidence-status-update-grid {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 14px;
          }

          .evidence-timeline {
            position: relative;
            display: flex;
            flex-direction: column;
            gap: 14px;
          }

          .evidence-timeline-item {
            position: relative;
            padding: 16px 16px 16px 48px;
            border: 1px solid #e3e8ef;
            border-radius: 14px;
            background: #fbfcfe;
          }

          .evidence-timeline-icon {
            position: absolute;
            left: 14px;
            top: 17px;
            width: 24px;
            height: 24px;
            display: grid;
            place-items: center;
            border-radius: 50%;
            background: #2563eb;
            color: white;
            font-size: 11px;
          }

          .evidence-timeline-item h4 {
            margin: 0 0 7px;
          }

          .evidence-timeline-item p {
            margin: 3px 0;
            color: #667287;
            font-size: 13px;
            line-height: 1.5;
          }

          .evidence-file-list {
            display: grid;
            gap: 10px;
          }

          .evidence-file-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 15px;
            padding: 13px 15px;
            border: 1px solid #e3e8ef;
            border-radius: 12px;
            background: #fbfcfe;
          }

          .evidence-file-name {
            display: flex;
            align-items: center;
            gap: 10px;
            font-weight: 700;
          }

          .evidence-file-meta {
            color: #7b879a;
            font-size: 12px;
          }

          @media (max-width: 1050px) {
            .evidence-stat-grid {
              grid-template-columns: repeat(2, minmax(0, 1fr));
            }

            .evidence-toolbar {
              grid-template-columns: repeat(2, minmax(0, 1fr));
            }

            .evidence-search-wrapper {
              grid-column: 1 / -1;
            }

            .evidence-details-grid {
              grid-template-columns: repeat(2, minmax(0, 1fr));
            }
          }

          @media (max-width: 700px) {
            .evidence-page {
              padding: 16px;
            }

            .evidence-header {
              flex-direction: column;
            }

            .evidence-primary-button {
              width: 100%;
            }

            .evidence-stat-grid,
            .evidence-toolbar,
            .evidence-form-grid,
            .evidence-details-grid,
            .evidence-status-update-grid {
              grid-template-columns: 1fr;
            }

            .evidence-search-wrapper,
            .evidence-form-group-full {
              grid-column: auto;
            }

            .evidence-modal-overlay {
              padding: 8px;
            }

            .evidence-modal {
              max-height: 96vh;
              border-radius: 16px;
            }

            .evidence-modal-footer {
              flex-direction: column-reverse;
            }

            .evidence-modal-footer button {
              width: 100%;
            }
          }
        `}
      </style>

      <header className="evidence-header">
        <div>
          <h1>Evidence Management</h1>
          <p>
            Register, secure and track evidence connected to police
            cases, including custody movement, verification and file
            metadata.
          </p>
        </div>

        <button
          type="button"
          className="evidence-primary-button"
          onClick={openCreateForm}
        >
          <FaPlus />
          Register Evidence
        </button>
      </header>

      {errorMessage && (
        <div className="evidence-error">{errorMessage}</div>
      )}

      <section className="evidence-stat-grid">
        <article className="evidence-stat-card">
          <div className="evidence-stat-top">
            <span>Total evidence</span>
            <div className="evidence-stat-icon">
              <FaBox />
            </div>
          </div>
          <strong>{dashboardStatistics.total}</strong>
        </article>

        <article className="evidence-stat-card">
          <div className="evidence-stat-top">
            <span>Verified</span>
            <div className="evidence-stat-icon">
              <FaCheckCircle />
            </div>
          </div>
          <strong>{dashboardStatistics.verified}</strong>
        </article>

        <article className="evidence-stat-card">
          <div className="evidence-stat-top">
            <span>Pending verification</span>
            <div className="evidence-stat-icon">
              <FaClock />
            </div>
          </div>
          <strong>{dashboardStatistics.pending}</strong>
        </article>

        <article className="evidence-stat-card">
          <div className="evidence-stat-top">
            <span>In secure storage</span>
            <div className="evidence-stat-icon">
              <FaArchive />
            </div>
          </div>
          <strong>{dashboardStatistics.inStorage}</strong>
        </article>
      </section>

      <section className="evidence-panel">
        <div className="evidence-toolbar">
          <div className="evidence-search-wrapper">
            <FaSearch />
            <input
              type="search"
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(event.target.value)
              }
              placeholder="Search reference, case, officer or location"
            />
          </div>

          <div className="evidence-filter-wrapper">
            <FaFilter />
            <select
              value={typeFilter}
              onChange={(event) =>
                setTypeFilter(event.target.value)
              }
            >
              <option value="All">All evidence types</option>
              {evidenceTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div className="evidence-filter-wrapper">
            <FaShieldAlt />
            <select
              value={custodyFilter}
              onChange={(event) =>
                setCustodyFilter(event.target.value)
              }
            >
              <option value="All">All custody statuses</option>
              {custodyStatuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          <div className="evidence-filter-wrapper">
            <FaCheckCircle />
            <select
              value={verificationFilter}
              onChange={(event) =>
                setVerificationFilter(event.target.value)
              }
            >
              <option value="All">All verification statuses</option>
              {verificationStatuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="evidence-empty-state">
            <FaClock />
            <h3>Loading evidence records</h3>
            <p>Fetching police evidence from Firestore.</p>
          </div>
        ) : filteredEvidence.length === 0 ? (
          <div className="evidence-empty-state">
            <FaFolderOpen />
            <h3>No evidence records found</h3>
            <p>
              Register evidence or adjust the search and filters.
            </p>
          </div>
        ) : (
          <div className="evidence-table-wrapper">
            <table className="evidence-table">
              <thead>
                <tr>
                  <th>Evidence reference</th>
                  <th>Linked case</th>
                  <th>Type</th>
                  <th>Collected by</th>
                  <th>Storage</th>
                  <th>Custody</th>
                  <th>Verification</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredEvidence.map((record) => (
                  <tr key={record.id}>
                    <td>
                      <div className="evidence-reference">
                        {record.evidenceReference}
                      </div>
                    </td>

                    <td>
                      <strong>{record.caseNumber}</strong>
                      <div className="evidence-case-title">
                        {record.caseTitle}
                      </div>
                    </td>

                    <td>
                      <span className="evidence-type-badge">
                        {record.evidenceType}
                      </span>
                    </td>

                    <td>
                      <strong>
                        {record.collectedBy || "Not provided"}
                      </strong>
                      <div className="evidence-case-title">
                        {formatDate(record.collectionDate)}
                      </div>
                    </td>

                    <td>
                      {record.storageLocation || "Not assigned"}
                    </td>

                    <td>
                      <span
                        className={getCustodyClass(
                          record.custodyStatus,
                        )}
                      >
                        {record.custodyStatus}
                      </span>
                    </td>

                    <td>
                      <span
                        className={getVerificationClass(
                          record.verificationStatus,
                        )}
                      >
                        {record.verificationStatus}
                      </span>
                    </td>

                    <td>
                      <div className="evidence-actions">
                        <button
                          type="button"
                          className="evidence-icon-button"
                          title="View evidence"
                          onClick={() =>
                            openEvidenceDetails(record)
                          }
                        >
                          <FaEye />
                        </button>

                        <button
                          type="button"
                          className="evidence-icon-button"
                          title="Edit evidence"
                          onClick={() => openEditForm(record)}
                        >
                          <FaEdit />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {showEvidenceForm && (
        <div className="evidence-modal-overlay">
          <div className="evidence-modal">
            <div className="evidence-modal-header">
              <div>
                <h2>
                  {editingEvidence
                    ? "Update Evidence"
                    : "Register Evidence"}
                </h2>
                <p>
                  Record evidence information and connect it to a
                  police case.
                </p>
              </div>

              <button
                type="button"
                className="evidence-close-button"
                onClick={closeEvidenceForm}
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={saveEvidence}>
              <div className="evidence-modal-body">
                {errorMessage && (
                  <div className="evidence-error">
                    {errorMessage}
                  </div>
                )}

                <div className="evidence-form-grid">
                  <div className="evidence-form-group">
                    <label htmlFor="evidenceReference">
                      Evidence reference number
                    </label>
                    <input
                      id="evidenceReference"
                      name="evidenceReference"
                      value={formData.evidenceReference}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="evidence-form-group">
                    <label htmlFor="caseId">Linked case</label>
                    <select
                      id="caseId"
                      name="caseId"
                      value={formData.caseId}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select police case</option>
                      {policeCases.map((policeCase) => (
                        <option
                          key={policeCase.id}
                          value={policeCase.id}
                        >
                          {policeCase.caseNumber} —{" "}
                          {policeCase.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="evidence-form-group">
                    <label htmlFor="evidenceType">
                      Evidence type
                    </label>
                    <select
                      id="evidenceType"
                      name="evidenceType"
                      value={formData.evidenceType}
                      onChange={handleInputChange}
                    >
                      {evidenceTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="evidence-form-group">
                    <label htmlFor="collectedBy">
                      Collected by
                    </label>
                    <input
                      id="collectedBy"
                      name="collectedBy"
                      value={formData.collectedBy}
                      onChange={handleInputChange}
                      placeholder="Officer name or badge number"
                      required
                    />
                  </div>

                  <div className="evidence-form-group">
                    <label htmlFor="collectionDate">
                      Collection date and time
                    </label>
                    <input
                      id="collectionDate"
                      name="collectionDate"
                      type="datetime-local"
                      value={formData.collectionDate}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="evidence-form-group">
                    <label htmlFor="collectionLocation">
                      Collection location
                    </label>
                    <input
                      id="collectionLocation"
                      name="collectionLocation"
                      value={formData.collectionLocation}
                      onChange={handleInputChange}
                      placeholder="Incident scene or collection point"
                    />
                  </div>

                  <div className="evidence-form-group">
                    <label htmlFor="storageLocation">
                      Storage location
                    </label>
                    <input
                      id="storageLocation"
                      name="storageLocation"
                      value={formData.storageLocation}
                      onChange={handleInputChange}
                      placeholder="Evidence room, locker or shelf"
                    />
                  </div>

                  <div className="evidence-form-group">
                    <label htmlFor="custodyStatus">
                      Custody status
                    </label>
                    <select
                      id="custodyStatus"
                      name="custodyStatus"
                      value={formData.custodyStatus}
                      onChange={handleInputChange}
                    >
                      {custodyStatuses.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="evidence-form-group">
                    <label htmlFor="verificationStatus">
                      Verification status
                    </label>
                    <select
                      id="verificationStatus"
                      name="verificationStatus"
                      value={formData.verificationStatus}
                      onChange={handleInputChange}
                    >
                      {verificationStatuses.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="evidence-form-group">
                    <label htmlFor="evidenceFiles">
                      Evidence files
                    </label>
                    <input
                      id="evidenceFiles"
                      type="file"
                      multiple
                      onChange={handleFileSelection}
                    />

                    <div className="evidence-file-note">
                      This first version saves file names, types and
                      sizes as Firestore metadata. Actual Firebase
                      Storage upload will be connected next.
                    </div>

                    {selectedFiles.length > 0 && (
                      <ul className="evidence-selected-files">
                        {selectedFiles.map((file) => (
                          <li
                            key={`${file.name}-${file.lastModified}`}
                          >
                            {file.name} —{" "}
                            {formatFileSize(file.size)}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="evidence-form-group evidence-form-group-full">
                    <label htmlFor="description">
                      Evidence description
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Describe the item, condition, identifying marks and relevance to the case"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="evidence-modal-footer">
                <button
                  type="button"
                  className="evidence-secondary-button"
                  onClick={closeEvidenceForm}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="evidence-primary-button"
                  disabled={saving}
                >
                  <FaShieldAlt />
                  {saving
                    ? "Saving..."
                    : editingEvidence
                      ? "Update Evidence"
                      : "Save Evidence"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDetails && selectedEvidence && (
        <div className="evidence-modal-overlay">
          <div className="evidence-modal evidence-modal-large">
            <div className="evidence-modal-header">
              <div>
                <h2>{selectedEvidence.evidenceReference}</h2>
                <p>
                  Linked to {selectedEvidence.caseNumber} —{" "}
                  {selectedEvidence.caseTitle}
                </p>
              </div>

              <button
                type="button"
                className="evidence-close-button"
                onClick={() => {
                  setShowDetails(false);
                  setSelectedEvidence(null);
                  setShowCustodyForm(false);
                  setErrorMessage("");
                }}
              >
                <FaTimes />
              </button>
            </div>

            <div className="evidence-modal-body">
              {errorMessage && (
                <div className="evidence-error">
                  {errorMessage}
                </div>
              )}

              <div className="evidence-details-grid">
                <div className="evidence-detail-card">
                  <span>Evidence type</span>
                  <strong>
                    {selectedEvidence.evidenceType}
                  </strong>
                </div>

                <div className="evidence-detail-card">
                  <span>Collected by</span>
                  <strong>
                    {selectedEvidence.collectedBy ||
                      "Not provided"}
                  </strong>
                </div>

                <div className="evidence-detail-card">
                  <span>Collection date</span>
                  <strong>
                    {formatDate(
                      selectedEvidence.collectionDate,
                    )}
                  </strong>
                </div>

                <div className="evidence-detail-card">
                  <span>Collection location</span>
                  <strong>
                    {selectedEvidence.collectionLocation ||
                      "Not provided"}
                  </strong>
                </div>

                <div className="evidence-detail-card">
                  <span>Storage location</span>
                  <strong>
                    {selectedEvidence.storageLocation ||
                      "Not assigned"}
                  </strong>
                </div>

                <div className="evidence-detail-card">
                  <span>Uploaded files</span>
                  <strong>
                    {selectedEvidence.files.length}
                  </strong>
                </div>
              </div>

              <div className="evidence-detail-section">
                <div className="evidence-section-heading">
                  <h3>Description</h3>
                </div>

                <div className="evidence-description-box">
                  {selectedEvidence.description ||
                    "No description provided."}
                </div>
              </div>

              <div className="evidence-detail-section">
                <div className="evidence-section-heading">
                  <h3>Status Management</h3>
                </div>

                <div className="evidence-status-update-grid">
                  <div className="evidence-form-group">
                    <label htmlFor="detailCustodyStatus">
                      Custody status
                    </label>
                    <select
                      id="detailCustodyStatus"
                      value={selectedEvidence.custodyStatus}
                      disabled={saving}
                      onChange={(event) =>
                        void updateEvidenceStatus(
                          selectedEvidence,
                          "custodyStatus",
                          event.target.value as CustodyStatus,
                        )
                      }
                    >
                      {custodyStatuses.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="evidence-form-group">
                    <label htmlFor="detailVerificationStatus">
                      Verification status
                    </label>
                    <select
                      id="detailVerificationStatus"
                      value={
                        selectedEvidence.verificationStatus
                      }
                      disabled={saving}
                      onChange={(event) =>
                        void updateEvidenceStatus(
                          selectedEvidence,
                          "verificationStatus",
                          event.target
                            .value as VerificationStatus,
                        )
                      }
                    >
                      {verificationStatuses.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="evidence-detail-section">
                <div className="evidence-section-heading">
                  <h3>File Metadata</h3>
                </div>

                {selectedEvidence.files.length === 0 ? (
                  <div className="evidence-description-box">
                    No file metadata has been added.
                  </div>
                ) : (
                  <div className="evidence-file-list">
                    {selectedEvidence.files.map(
                      (file, index) => (
                        <div
                          className="evidence-file-item"
                          key={`${file.fileName}-${index}`}
                        >
                          <div className="evidence-file-name">
                            <FaFolderOpen />
                            <div>
                              <div>{file.fileName}</div>
                              <div className="evidence-file-meta">
                                {file.fileType || "Unknown type"}
                              </div>
                            </div>
                          </div>

                          <div className="evidence-file-meta">
                            {formatFileSize(file.fileSize)}
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                )}
              </div>

              <div className="evidence-detail-section">
                <div className="evidence-section-heading">
                  <h3>Chain of Custody</h3>

                  <button
                    type="button"
                    className="evidence-secondary-button"
                    onClick={() =>
                      setShowCustodyForm(
                        (currentValue) => !currentValue,
                      )
                    }
                  >
                    <FaPlus />
                    Add Custody Entry
                  </button>
                </div>

                {showCustodyForm && (
                  <form
                    onSubmit={addCustodyEntry}
                    className="evidence-description-box"
                    style={{ marginBottom: "15px" }}
                  >
                    <div className="evidence-form-grid">
                      <div className="evidence-form-group">
                        <label htmlFor="custodyAction">
                          Action
                        </label>
                        <input
                          id="custodyAction"
                          value={custodyAction}
                          onChange={(event) =>
                            setCustodyAction(
                              event.target.value,
                            )
                          }
                          placeholder="Transferred, examined, stored..."
                          required
                        />
                      </div>

                      <div className="evidence-form-group">
                        <label htmlFor="custodyHandledBy">
                          Handled by
                        </label>
                        <input
                          id="custodyHandledBy"
                          value={custodyHandledBy}
                          onChange={(event) =>
                            setCustodyHandledBy(
                              event.target.value,
                            )
                          }
                          placeholder="Officer or authorized person"
                          required
                        />
                      </div>

                      <div className="evidence-form-group">
                        <label htmlFor="custodyLocation">
                          Location
                        </label>
                        <input
                          id="custodyLocation"
                          value={custodyLocation}
                          onChange={(event) =>
                            setCustodyLocation(
                              event.target.value,
                            )
                          }
                          placeholder="Evidence room or laboratory"
                        />
                      </div>

                      <div className="evidence-form-group">
                        <label htmlFor="custodyNotes">
                          Notes
                        </label>
                        <input
                          id="custodyNotes"
                          value={custodyNotes}
                          onChange={(event) =>
                            setCustodyNotes(
                              event.target.value,
                            )
                          }
                          placeholder="Condition or transfer notes"
                        />
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "flex-end",
                        gap: "10px",
                        marginTop: "15px",
                      }}
                    >
                      <button
                        type="button"
                        className="evidence-secondary-button"
                        onClick={() => {
                          setShowCustodyForm(false);
                          resetCustodyForm();
                        }}
                      >
                        Cancel
                      </button>

                      <button
                        type="submit"
                        className="evidence-primary-button"
                        disabled={saving}
                      >
                        <FaUserShield />
                        {saving
                          ? "Saving..."
                          : "Save Custody Entry"}
                      </button>
                    </div>
                  </form>
                )}

                {selectedEvidence.chainOfCustody.length === 0 ? (
                  <div className="evidence-description-box">
                    No chain-of-custody entries are available.
                  </div>
                ) : (
                  <div className="evidence-timeline">
                    {[...selectedEvidence.chainOfCustody]
                      .reverse()
                      .map((entry) => (
                        <article
                          className="evidence-timeline-item"
                          key={entry.id}
                        >
                          <div className="evidence-timeline-icon">
                            <FaLink />
                          </div>

                          <h4>{entry.action}</h4>
                          <p>
                            <strong>Handled by:</strong>{" "}
                            {entry.handledBy}
                          </p>
                          <p>
                            <strong>Location:</strong>{" "}
                            {entry.location ||
                              "Not provided"}
                          </p>
                          <p>
                            <strong>Date:</strong>{" "}
                            {formatDate(entry.date)}
                          </p>

                          {entry.notes && (
                            <p>
                              <strong>Notes:</strong>{" "}
                              {entry.notes}
                            </p>
                          )}
                        </article>
                      ))}
                  </div>
                )}
              </div>
            </div>

            <div className="evidence-modal-footer">
              <button
                type="button"
                className="evidence-secondary-button"
                onClick={() => openEditForm(selectedEvidence)}
              >
                <FaEdit />
                Edit Evidence
              </button>

              <button
                type="button"
                className="evidence-primary-button"
                onClick={() => {
                  setShowDetails(false);
                  setSelectedEvidence(null);
                }}
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}