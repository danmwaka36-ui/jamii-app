import React, { useMemo, useState } from "react";
import {
  FaPlus,
  FaSearch,
  FaMapMarkerAlt,
  FaEye,
  FaEdit,
  FaTrash,
  FaTimes,
  FaCrosshairs,
  FaExternalLinkAlt,
  FaDownload,
  FaPrint,
  FaUsers,
  FaBed,
  FaCheckCircle,
  FaExclamationTriangle,
  FaHome,
  FaFilter,
} from "react-icons/fa";

type CenterStatus = "Operational" | "Temporarily Closed" | "Full" | "Inactive";

type ShelterCenter = {
  id: string;
  name: string;
  type: string;
  county: string;
  subCounty: string;
  ward: string;
  address: string;
  landmark: string;
  latitude: number | null;
  longitude: number | null;
  capacity: number;
  occupancy: number;
  contactPerson: string;
  phone: string;
  email: string;
  status: CenterStatus;
  services: string[];
  accessibility: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
};

type AdminData = {
  [county: string]: {
    [subCounty: string]: string[];
  };
};

/*
 * Starter administrative dataset.
 *
 * Keep this structure separate from the page so it can later be replaced
 * with a verified national administrative dataset or Firestore collection.
 */
const KENYA_ADMIN_DATA: AdminData = {
  Mombasa: {
    "Mvita": [
      "Mji wa Kale/Makadara",
      "Tudor",
      "Tononoka",
      "Majengo",
      "Ganjoni/Shimanzi",
    ],
    "Nyali": [
      "Frere Town",
      "Ziwa La Ng'ombe",
      "Mkomani",
      "Kongowea",
      "Kadzandani",
    ],
    "Likoni": [
      "Mtongwe",
      "Shika Adabu",
      "Bofu",
      "Likoni",
      "Timbwani",
    ],
    "Kisauni": [
      "Junda",
      "Bamburi",
      "Mwakirunge",
      "Mtopanga",
      "Magogoni",
      "Shanzu",
    ],
    "Changamwe": [
      "Port Reitz",
      "Kipevu",
      "Airport",
      "Changamwe",
      "Chaani",
    ],
    "Jomvu": [
      "Jomvu Kuu",
      "Mikindani",
      "Miritini",
    ],
  },

  Kilifi: {
    Kilifi: [
      "Tezo",
      "Sokoni",
      "Mnarani",
      "Shimo la Tewa",
      "Dabaso",
    ],
    "Kilifi North": [
      "Mnarani",
      "Tezo",
      "Sokoni",
      "Matsangoni",
    ],
    "Kilifi South": [
      "Junju",
      "Mtepeni",
      "Chasimba",
      "Mwarakaya",
    ],
  },

  Nairobi: {
    "Westlands": [
      "Kitisuru",
      "Parklands/Highridge",
      "Karura",
      "Kangemi",
      "Mountain View",
    ],
    "Dagoretti North": [
      "Kilimani",
      "Kawangware",
      "Gatina",
      "Kileleshwa",
      "Kabiro",
    ],
    "Dagoretti South": [
      "Mutu-ini",
      "Ngando",
      "Riruta",
      "Uthiru/Ruthimitu",
      "Waithaka",
    ],
    "Kibra": [
      "Laini Saba",
      "Lindi",
      "Makina",
      "Woodley/Kenyatta Golf Course",
      "Sarang'ombe",
    ],
    "Embakasi East": [
      "Upper Savannah",
      "Lower Savannah",
      "Embakasi",
      "Utawala",
      "Mihango",
    ],
    "Kasarani": [
      "Clay City",
      "Mwiki",
      "Kasarani",
      "Njiru",
      "Ruai",
    ],
  },

  Kwale: {
    "Msambweni": [
      "Bumamani",
      "Kinondo",
      "Ukunda",
      "Gombato Bongwe",
      "Ramisi",
    ],
    "Matuga": [
      "Tiwi",
      "Waa",
      "Kubo South",
      "Mkongani",
      "Vanga",
    ],
  },
};

const CENTER_TYPES = [
  "Emergency Shelter",
  "Temporary Evacuation Centre",
  "Relief Distribution Centre",
  "Community Shelter",
  "Child-Friendly Space",
  "Women & Protection Centre",
  "Humanitarian Service Centre",
  "Reception Centre",
  "Transit Centre",
  "Other",
];

const SERVICE_OPTIONS = [
  "Emergency shelter",
  "Food distribution",
  "Water",
  "Sanitation",
  "First aid",
  "Medical support",
  "Psychosocial support",
  "Child protection",
  "Women protection",
  "Information desk",
  "Registration",
  "Relief distribution",
  "Charging station",
  "Security coordination",
];

const STATUS_OPTIONS: CenterStatus[] = [
  "Operational",
  "Temporarily Closed",
  "Full",
  "Inactive",
];

const emptyForm: Omit<ShelterCenter, "id" | "createdAt" | "updatedAt"> = {
  name: "",
  type: "",
  county: "",
  subCounty: "",
  ward: "",
  address: "",
  landmark: "",
  latitude: null,
  longitude: null,
  capacity: 0,
  occupancy: 0,
  contactPerson: "",
  phone: "",
  email: "",
  status: "Operational",
  services: [],
  accessibility: "",
  notes: "",
};

const initialCenters: ShelterCenter[] = [
  {
    id: "RC-SRC-000001",
    name: "Sample Emergency Shelter",
    type: "Emergency Shelter",
    county: "Mombasa",
    subCounty: "Nyali",
    ward: "Kongowea",
    address: "Kongowea",
    landmark: "Community centre",
    latitude: -4.0435,
    longitude: 39.6682,
    capacity: 250,
    occupancy: 86,
    contactPerson: "Shelter Coordinator",
    phone: "",
    email: "",
    status: "Operational",
    services: [
      "Emergency shelter",
      "Food distribution",
      "Water",
      "First aid",
    ],
    accessibility: "Accessible",
    notes: "Demo record. Replace with verified operational data.",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

function generateCenterId(existing: ShelterCenter[]) {
  const highest = existing.reduce((max, item) => {
    const match = item.id.match(/(\d+)$/);
    const number = match ? Number(match[1]) : 0;
    return Math.max(max, number);
  }, 0);

  return `RC-SRC-${String(highest + 1).padStart(6, "0")}`;
}

function formatDate(value: string) {
  if (!value) return "-";

  return new Intl.DateTimeFormat("en-KE", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function escapeCsv(value: unknown) {
  const text = String(value ?? "");
  return `"${text.replace(/"/g, '""')}"`;
}

const SheltersReliefCenters: React.FC = () => {
  const [centers, setCenters] = useState<ShelterCenter[]>(initialCenters);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [countyFilter, setCountyFilter] = useState("All");

  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const [selectedCenter, setSelectedCenter] =
    useState<ShelterCenter | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState(emptyForm);

  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState("");

  const counties = Object.keys(KENYA_ADMIN_DATA);

  const subCounties = useMemo(() => {
    if (!form.county) return [];

    return Object.keys(KENYA_ADMIN_DATA[form.county] || {});
  }, [form.county]);

  const wards = useMemo(() => {
    if (!form.county || !form.subCounty) return [];

    return (
      KENYA_ADMIN_DATA[form.county]?.[form.subCounty] || []
    );
  }, [form.county, form.subCounty]);

  const filteredCenters = useMemo(() => {
    const query = search.trim().toLowerCase();

    return centers.filter((center) => {
      const searchable = [
        center.id,
        center.name,
        center.type,
        center.county,
        center.subCounty,
        center.ward,
        center.address,
        center.contactPerson,
        center.phone,
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !query || searchable.includes(query);

      const matchesStatus =
        statusFilter === "All" ||
        center.status === statusFilter;

      const matchesType =
        typeFilter === "All" ||
        center.type === typeFilter;

      const matchesCounty =
        countyFilter === "All" ||
        center.county === countyFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesType &&
        matchesCounty
      );
    });
  }, [
    centers,
    search,
    statusFilter,
    typeFilter,
    countyFilter,
  ]);

  const statistics = useMemo(() => {
    const totalCapacity = centers.reduce(
      (sum, item) => sum + Number(item.capacity || 0),
      0
    );

    const occupancy = centers.reduce(
      (sum, item) => sum + Number(item.occupancy || 0),
      0
    );

    const operational = centers.filter(
      (item) => item.status === "Operational"
    ).length;

    const full = centers.filter(
      (item) => item.status === "Full"
    ).length;

    return {
      total: centers.length,
      operational,
      full,
      capacity: totalCapacity,
      occupancy,
      available: Math.max(totalCapacity - occupancy, 0),
    };
  }, [centers]);

  const updateForm = (
    field: keyof typeof emptyForm,
    value: any
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const handleCountyChange = (county: string) => {
    setForm((previous) => ({
      ...previous,
      county,
      subCounty: "",
      ward: "",
    }));
  };

  const handleSubCountyChange = (subCounty: string) => {
    setForm((previous) => ({
      ...previous,
      subCounty,
      ward: "",
    }));
  };

  const toggleService = (service: string) => {
    setForm((previous) => {
      const exists = previous.services.includes(service);

      return {
        ...previous,
        services: exists
          ? previous.services.filter((item) => item !== service)
          : [...previous.services, service],
      };
    });
  };

  const getCurrentLocation = () => {
    setGpsError("");

    if (!navigator.geolocation) {
      setGpsError(
        "Geolocation is not supported by this browser."
      );
      return;
    }

    setGpsLoading(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setForm((previous) => ({
          ...previous,
          latitude: Number(
            position.coords.latitude.toFixed(7)
          ),
          longitude: Number(
            position.coords.longitude.toFixed(7)
          ),
        }));

        setGpsLoading(false);
      },
      (error) => {
        setGpsLoading(false);

        if (error.code === error.PERMISSION_DENIED) {
          setGpsError(
            "Location permission was denied. Allow browser location access and try again."
          );
        } else {
          setGpsError(
            "Unable to obtain the current location."
          );
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  };

  const openGoogleMaps = (
    latitude: number | null,
    longitude: number | null
  ) => {
    if (
      latitude === null ||
      longitude === null ||
      Number.isNaN(latitude) ||
      Number.isNaN(longitude)
    ) {
      return;
    }

    const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;

    window.open(url, "_blank", "noopener,noreferrer");
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setGpsError("");
  };

  const openCreateForm = () => {
    resetForm();
    setShowForm(true);
  };

  const openEditForm = (center: ShelterCenter) => {
    setEditingId(center.id);

    setForm({
      name: center.name,
      type: center.type,
      county: center.county,
      subCounty: center.subCounty,
      ward: center.ward,
      address: center.address,
      landmark: center.landmark,
      latitude: center.latitude,
      longitude: center.longitude,
      capacity: center.capacity,
      occupancy: center.occupancy,
      contactPerson: center.contactPerson,
      phone: center.phone,
      email: center.email,
      status: center.status,
      services: [...center.services],
      accessibility: center.accessibility,
      notes: center.notes,
    });

    setShowForm(true);
  };

  const validateForm = () => {
    if (!form.name.trim()) {
      alert("Enter the center name.");
      return false;
    }

    if (!form.type) {
      alert("Select the center type.");
      return false;
    }

    if (!form.county) {
      alert("Select the county.");
      return false;
    }

    if (!form.subCounty) {
      alert("Select the sub-county.");
      return false;
    }

    if (!form.ward) {
      alert("Select the ward.");
      return false;
    }

    if (form.capacity < 0) {
      alert("Capacity cannot be negative.");
      return false;
    }

    if (form.occupancy < 0) {
      alert("Occupancy cannot be negative.");
      return false;
    }

    if (form.occupancy > form.capacity) {
      alert(
        "Occupancy cannot be greater than the registered capacity."
      );
      return false;
    }

    if (
      form.latitude !== null &&
      (form.latitude < -90 || form.latitude > 90)
    ) {
      alert("Latitude must be between -90 and 90.");
      return false;
    }

    if (
      form.longitude !== null &&
      (form.longitude < -180 || form.longitude > 180)
    ) {
      alert("Longitude must be between -180 and 180.");
      return false;
    }

    return true;
  };

  const saveCenter = (event: React.FormEvent) => {
    event.preventDefault();

    if (!validateForm()) return;

    const now = new Date().toISOString();

    if (editingId) {
      setCenters((previous) =>
        previous.map((center) =>
          center.id === editingId
            ? {
                ...center,
                ...form,
                updatedAt: now,
              }
            : center
        )
      );
    } else {
      const newCenter: ShelterCenter = {
        id: generateCenterId(centers),
        ...form,
        createdAt: now,
        updatedAt: now,
      };

      setCenters((previous) => [
        newCenter,
        ...previous,
      ]);
    }

    setShowForm(false);
    resetForm();
  };

  const deleteCenter = (center: ShelterCenter) => {
    const confirmed = window.confirm(
      `Delete "${center.name}"? This action should only be performed by an authorised administrator.`
    );

    if (!confirmed) return;

    setCenters((previous) =>
      previous.filter((item) => item.id !== center.id)
    );

    if (selectedCenter?.id === center.id) {
      setSelectedCenter(null);
      setShowDetails(false);
    }
  };

  const exportCsv = () => {
    const headers = [
      "ID",
      "Center Name",
      "Center Type",
      "County",
      "Sub County",
      "Ward",
      "Address",
      "Landmark",
      "Latitude",
      "Longitude",
      "Capacity",
      "Occupancy",
      "Available",
      "Contact Person",
      "Phone",
      "Email",
      "Status",
      "Services",
      "Accessibility",
      "Notes",
      "Created At",
      "Updated At",
    ];

    const rows = filteredCenters.map((center) => [
      center.id,
      center.name,
      center.type,
      center.county,
      center.subCounty,
      center.ward,
      center.address,
      center.landmark,
      center.latitude,
      center.longitude,
      center.capacity,
      center.occupancy,
      Math.max(
        center.capacity - center.occupancy,
        0
      ),
      center.contactPerson,
      center.phone,
      center.email,
      center.status,
      center.services.join("; "),
      center.accessibility,
      center.notes,
      center.createdAt,
      center.updatedAt,
    ]);

    const csv = [
      headers.map(escapeCsv).join(","),
      ...rows.map((row) =>
        row.map(escapeCsv).join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `redcross-shelters-relief-centers-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  const printReport = () => {
    const reportWindow = window.open(
      "",
      "_blank",
      "width=1200,height=800"
    );

    if (!reportWindow) {
      alert(
        "Please allow pop-ups to print the report."
      );
      return;
    }

    const rows = filteredCenters
      .map(
        (center) => `
          <tr>
            <td>${center.id}</td>
            <td>${center.name}</td>
            <td>${center.type}</td>
            <td>${center.county}</td>
            <td>${center.subCounty}</td>
            <td>${center.ward}</td>
            <td>${center.capacity}</td>
            <td>${center.occupancy}</td>
            <td>${Math.max(
              center.capacity - center.occupancy,
              0
            )}</td>
            <td>${center.status}</td>
          </tr>
        `
      )
      .join("");

    reportWindow.document.write(`
      <!doctype html>
      <html>
        <head>
          <title>Red Cross Shelters & Relief Centers Report</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 30px;
              color: #222;
            }

            h1 {
              margin-bottom: 4px;
            }

            .meta {
              color: #666;
              margin-bottom: 20px;
            }

            .summary {
              display: flex;
              gap: 20px;
              margin-bottom: 20px;
            }

            .card {
              border: 1px solid #ddd;
              padding: 12px;
              border-radius: 6px;
            }

            table {
              width: 100%;
              border-collapse: collapse;
              font-size: 11px;
            }

            th,
            td {
              border: 1px solid #ddd;
              padding: 7px;
              text-align: left;
            }

            th {
              background: #f3f4f6;
            }

            @media print {
              body {
                padding: 10px;
              }
            }
          </style>
        </head>

        <body>
          <h1>Red Cross Shelters & Relief Centers</h1>

          <div class="meta">
            Generated: ${new Date().toLocaleString(
              "en-KE"
            )}
          </div>

          <div class="summary">
            <div class="card">
              <strong>Total Centers</strong><br/>
              ${filteredCenters.length}
            </div>

            <div class="card">
              <strong>Operational</strong><br/>
              ${
                filteredCenters.filter(
                  (item) =>
                    item.status === "Operational"
                ).length
              }
            </div>

            <div class="card">
              <strong>Total Capacity</strong><br/>
              ${filteredCenters.reduce(
                (sum, item) =>
                  sum + Number(item.capacity || 0),
                0
              )}
            </div>

            <div class="card">
              <strong>Occupancy</strong><br/>
              ${filteredCenters.reduce(
                (sum, item) =>
                  sum + Number(item.occupancy || 0),
                0
              )}
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Center</th>
                <th>Type</th>
                <th>County</th>
                <th>Sub-County</th>
                <th>Ward</th>
                <th>Capacity</th>
                <th>Occupancy</th>
                <th>Available</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              ${rows}
            </tbody>
          </table>
        </body>
      </html>
    `);

    reportWindow.document.close();
    reportWindow.focus();

    setTimeout(() => {
      reportWindow.print();
    }, 300);
  };

  const openDetails = (center: ShelterCenter) => {
    setSelectedCenter(center);
    setShowDetails(true);
  };

  return (
    <div className="shelters-page">
      <style>
        {`
          .shelters-page {
            padding: 24px;
            min-height: 100%;
            background: #f6f8fb;
            color: #172033;
          }

          .shelters-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 20px;
            margin-bottom: 22px;
          }

          .shelters-title {
            margin: 0;
            font-size: 27px;
            font-weight: 800;
          }

          .shelters-subtitle {
            margin: 7px 0 0;
            color: #667085;
            max-width: 780px;
            line-height: 1.5;
          }

          .primary-button,
          .secondary-button,
          .danger-button {
            border: 0;
            border-radius: 9px;
            padding: 11px 15px;
            cursor: pointer;
            font-weight: 700;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
          }

          .primary-button {
            background: #d71920;
            color: white;
          }

          .secondary-button {
            background: white;
            color: #344054;
            border: 1px solid #d0d5dd;
          }

          .danger-button {
            background: #fff1f1;
            color: #c1121f;
          }

          .primary-button:hover,
          .secondary-button:hover,
          .danger-button:hover {
            transform: translateY(-1px);
          }

          .stats-grid {
            display: grid;
            grid-template-columns: repeat(5, minmax(0, 1fr));
            gap: 14px;
            margin-bottom: 20px;
          }

          .stat-card {
            background: white;
            border: 1px solid #e4e7ec;
            border-radius: 14px;
            padding: 17px;
            box-shadow: 0 2px 8px rgba(16, 24, 40, 0.04);
          }

          .stat-label {
            color: #667085;
            font-size: 13px;
            font-weight: 600;
          }

          .stat-value {
            margin-top: 8px;
            font-size: 24px;
            font-weight: 800;
          }

          .stat-icon {
            width: 35px;
            height: 35px;
            border-radius: 9px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #f3f4f6;
            margin-bottom: 12px;
          }

          .toolbar {
            background: white;
            border: 1px solid #e4e7ec;
            border-radius: 14px;
            padding: 15px;
            margin-bottom: 18px;
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
          }

          .search-box {
            flex: 1 1 280px;
            position: relative;
          }

          .search-box svg {
            position: absolute;
            left: 12px;
            top: 50%;
            transform: translateY(-50%);
            color: #98a2b3;
          }

          .search-input,
          .select-input,
          .form-input,
          .form-select,
          .form-textarea {
            width: 100%;
            box-sizing: border-box;
            border: 1px solid #d0d5dd;
            border-radius: 9px;
            padding: 11px 12px;
            background: white;
            color: #101828;
            outline: none;
            font-size: 14px;
          }

          .search-input {
            padding-left: 37px;
          }

          .search-input:focus,
          .select-input:focus,
          .form-input:focus,
          .form-select:focus,
          .form-textarea:focus {
            border-color: #d71920;
            box-shadow: 0 0 0 3px rgba(215, 25, 32, 0.08);
          }

          .filter-item {
            min-width: 160px;
            flex: 0 1 180px;
          }

          .table-card {
            background: white;
            border: 1px solid #e4e7ec;
            border-radius: 14px;
            overflow: hidden;
          }

          .table-header {
            padding: 16px 18px;
            border-bottom: 1px solid #eaecf0;
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 10px;
          }

          .table-title {
            font-weight: 800;
          }

          .table-scroll {
            overflow-x: auto;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            min-width: 1050px;
          }

          th,
          td {
            padding: 13px 14px;
            border-bottom: 1px solid #eaecf0;
            text-align: left;
            white-space: nowrap;
            font-size: 13px;
          }

          th {
            background: #f9fafb;
            color: #475467;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.03em;
          }

          .center-name {
            font-weight: 750;
          }

          .muted {
            color: #667085;
          }

          .status {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            border-radius: 999px;
            padding: 5px 9px;
            font-size: 11px;
            font-weight: 800;
          }

          .status-operational {
            background: #ecfdf3;
            color: #027a48;
          }

          .status-full {
            background: #fff7ed;
            color: #c2410c;
          }

          .status-closed,
          .status-inactive {
            background: #f2f4f7;
            color: #475467;
          }

          .actions {
            display: flex;
            gap: 6px;
          }

          .icon-button {
            width: 34px;
            height: 34px;
            border-radius: 8px;
            border: 1px solid #d0d5dd;
            background: white;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .icon-button:hover {
            background: #f9fafb;
          }

          .modal-backdrop {
            position: fixed;
            inset: 0;
            background: rgba(16, 24, 40, 0.55);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            z-index: 9999;
          }

          .modal {
            width: min(1050px, 100%);
            max-height: 92vh;
            overflow-y: auto;
            background: white;
            border-radius: 16px;
            box-shadow: 0 20px 50px rgba(0,0,0,.25);
          }

          .modal-header {
            padding: 18px 20px;
            border-bottom: 1px solid #eaecf0;
            display: flex;
            justify-content: space-between;
            align-items: center;
            position: sticky;
            top: 0;
            background: white;
            z-index: 2;
          }

          .modal-title {
            margin: 0;
            font-size: 19px;
            font-weight: 800;
          }

          .close-button {
            border: 0;
            background: #f2f4f7;
            width: 34px;
            height: 34px;
            border-radius: 8px;
            cursor: pointer;
          }

          .modal-body {
            padding: 20px;
          }

          .form-grid {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 15px;
          }

          .form-group {
            display: flex;
            flex-direction: column;
            gap: 7px;
          }

          .form-group.full {
            grid-column: 1 / -1;
          }

          .form-label {
            font-size: 13px;
            font-weight: 750;
            color: #344054;
          }

          .required {
            color: #d71920;
          }

          .location-panel {
            background: #f8fafc;
            border: 1px solid #e4e7ec;
            border-radius: 12px;
            padding: 14px;
          }

          .coordinate-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
            margin-top: 12px;
          }

          .location-actions {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            margin-top: 12px;
          }

          .gps-error {
            color: #b42318;
            font-size: 12px;
            margin-top: 8px;
          }

          .services-grid {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 8px;
          }

          .service-option {
            border: 1px solid #d0d5dd;
            padding: 9px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            gap: 8px;
            cursor: pointer;
            font-size: 12px;
          }

          .service-option.selected {
            border-color: #d71920;
            background: #fff5f5;
          }

          .modal-footer {
            border-top: 1px solid #eaecf0;
            padding: 15px 20px;
            display: flex;
            justify-content: flex-end;
            gap: 10px;
            position: sticky;
            bottom: 0;
            background: white;
          }

          .detail-grid {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 14px;
          }

          .detail-card {
            border: 1px solid #eaecf0;
            border-radius: 11px;
            padding: 13px;
          }

          .detail-label {
            color: #667085;
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
          }

          .detail-value {
            margin-top: 5px;
            font-weight: 700;
          }

          .map-button {
            margin-top: 10px;
          }

          .service-tags {
            display: flex;
            flex-wrap: wrap;
            gap: 6px;
            margin-top: 7px;
          }

          .service-tag {
            background: #f2f4f7;
            padding: 5px 8px;
            border-radius: 999px;
            font-size: 11px;
          }

          @media (max-width: 1050px) {
            .stats-grid {
              grid-template-columns: repeat(3, minmax(0, 1fr));
            }
          }

          @media (max-width: 760px) {
            .shelters-page {
              padding: 14px;
            }

            .shelters-header {
              flex-direction: column;
            }

            .shelters-header .primary-button {
              width: 100%;
            }

            .stats-grid {
              grid-template-columns: repeat(2, minmax(0, 1fr));
            }

            .form-grid,
            .detail-grid {
              grid-template-columns: 1fr;
            }

            .services-grid {
              grid-template-columns: 1fr 1fr;
            }

            .coordinate-grid {
              grid-template-columns: 1fr;
            }

            .filter-item {
              flex: 1 1 100%;
            }

            .toolbar .secondary-button {
              flex: 1;
            }
          }

          @media (max-width: 460px) {
            .stats-grid {
              grid-template-columns: 1fr;
            }

            .services-grid {
              grid-template-columns: 1fr;
            }

            .shelters-title {
              font-size: 22px;
            }

            .modal-backdrop {
              padding: 0;
            }

            .modal {
              border-radius: 0;
              max-height: 100vh;
              height: 100vh;
            }
          }
        `}
      </style>

      <div className="shelters-header">
        <div>
          <h1 className="shelters-title">
            Shelters & Relief Centers
          </h1>

          <p className="shelters-subtitle">
            Register, monitor and coordinate emergency
            shelters, evacuation centres and humanitarian
            relief locations across the Red Cross response
            network.
          </p>
        </div>

        <button
          className="primary-button"
          onClick={openCreateForm}
        >
          <FaPlus />
          Register Center
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <FaHome />
          </div>
          <div className="stat-label">
            Registered Centers
          </div>
          <div className="stat-value">
            {statistics.total}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <FaCheckCircle />
          </div>
          <div className="stat-label">
            Operational
          </div>
          <div className="stat-value">
            {statistics.operational}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <FaBed />
          </div>
          <div className="stat-label">
            Total Capacity
          </div>
          <div className="stat-value">
            {statistics.capacity.toLocaleString()}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <FaUsers />
          </div>
          <div className="stat-label">
            Current Occupancy
          </div>
          <div className="stat-value">
            {statistics.occupancy.toLocaleString()}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <FaExclamationTriangle />
          </div>
          <div className="stat-label">
            Available Spaces
          </div>
          <div className="stat-value">
            {statistics.available.toLocaleString()}
          </div>
        </div>
      </div>

      <div className="toolbar">
        <div className="search-box">
          <FaSearch />
          <input
            className="search-input"
            placeholder="Search center, location, ID, contact..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />
        </div>

        <div className="filter-item">
          <select
            className="select-input"
            value={countyFilter}
            onChange={(event) =>
              setCountyFilter(event.target.value)
            }
          >
            <option value="All">All counties</option>
            {counties.map((county) => (
              <option key={county} value={county}>
                {county}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-item">
          <select
            className="select-input"
            value={typeFilter}
            onChange={(event) =>
              setTypeFilter(event.target.value)
            }
          >
            <option value="All">All center types</option>
            {CENTER_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-item">
          <select
            className="select-input"
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value)
            }
          >
            <option value="All">All statuses</option>
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        <button
          className="secondary-button"
          onClick={exportCsv}
        >
          <FaDownload />
          Export
        </button>

        <button
          className="secondary-button"
          onClick={printReport}
        >
          <FaPrint />
          Print
        </button>

        <button
          className="secondary-button"
          onClick={() => {
            setSearch("");
            setCountyFilter("All");
            setTypeFilter("All");
            setStatusFilter("All");
          }}
        >
          <FaFilter />
          Clear
        </button>
      </div>

      <div className="table-card">
        <div className="table-header">
          <div>
            <div className="table-title">
              Registered Relief Locations
            </div>
            <div className="muted">
              Showing {filteredCenters.length} of{" "}
              {centers.length} centers
            </div>
          </div>
        </div>

        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Center</th>
                <th>Type</th>
                <th>Location</th>
                <th>Capacity</th>
                <th>Occupancy</th>
                <th>Available</th>
                <th>Status</th>
                <th>GPS</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredCenters.length === 0 ? (
                <tr>
                  <td colSpan={10}>
                    <div
                      style={{
                        padding: "40px",
                        textAlign: "center",
                      }}
                    >
                      <FaSearch
                        style={{
                          fontSize: 28,
                          color: "#98a2b3",
                        }}
                      />

                      <div
                        style={{
                          marginTop: 10,
                          fontWeight: 700,
                        }}
                      >
                        No centers found
                      </div>

                      <div className="muted">
                        Try changing your search or filters.
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredCenters.map((center) => {
                  const available = Math.max(
                    center.capacity - center.occupancy,
                    0
                  );

                  const statusClass =
                    center.status === "Operational"
                      ? "status-operational"
                      : center.status === "Full"
                      ? "status-full"
                      : center.status ===
                        "Temporarily Closed"
                      ? "status-closed"
                      : "status-inactive";

                  return (
                    <tr key={center.id}>
                      <td>
                        <strong>{center.id}</strong>
                      </td>

                      <td>
                        <div className="center-name">
                          {center.name}
                        </div>
                        <div className="muted">
                          {center.contactPerson || "-"}
                        </div>
                      </td>

                      <td>{center.type}</td>

                      <td>
                        <strong>{center.county}</strong>
                        <div className="muted">
                          {center.subCounty} •{" "}
                          {center.ward}
                        </div>
                      </td>

                      <td>
                        {center.capacity.toLocaleString()}
                      </td>

                      <td>
                        {center.occupancy.toLocaleString()}
                      </td>

                      <td>
                        <strong>{available}</strong>
                      </td>

                      <td>
                        <span
                          className={`status ${statusClass}`}
                        >
                          {center.status ===
                          "Operational" ? (
                            <FaCheckCircle />
                          ) : (
                            <FaExclamationTriangle />
                          )}

                          {center.status}
                        </span>
                      </td>

                      <td>
                        {center.latitude !== null &&
                        center.longitude !== null ? (
                          <button
                            className="icon-button"
                            title="Open location in Google Maps"
                            onClick={() =>
                              openGoogleMaps(
                                center.latitude,
                                center.longitude
                              )
                            }
                          >
                            <FaMapMarkerAlt />
                          </button>
                        ) : (
                          <span className="muted">
                            Not set
                          </span>
                        )}
                      </td>

                      <td>
                        <div className="actions">
                          <button
                            className="icon-button"
                            title="View center"
                            onClick={() =>
                              openDetails(center)
                            }
                          >
                            <FaEye />
                          </button>

                          <button
                            className="icon-button"
                            title="Edit center"
                            onClick={() =>
                              openEditForm(center)
                            }
                          >
                            <FaEdit />
                          </button>

                          <button
                            className="icon-button"
                            title="Delete center"
                            onClick={() =>
                              deleteCenter(center)
                            }
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE / EDIT MODAL */}

      {showForm && (
        <div
          className="modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setShowForm(false);
            }
          }}
        >
          <form
            className="modal"
            onSubmit={saveCenter}
          >
            <div className="modal-header">
              <h2 className="modal-title">
                {editingId
                  ? "Edit Relief Center"
                  : "Register Relief Center"}
              </h2>

              <button
                type="button"
                className="close-button"
                onClick={() => setShowForm(false)}
              >
                <FaTimes />
              </button>
            </div>

            <div className="modal-body">
              <div className="form-grid">
                <div className="form-group full">
                  <label className="form-label">
                    Center Name{" "}
                    <span className="required">*</span>
                  </label>

                  <input
                    className="form-input"
                    placeholder="Enter official center name"
                    value={form.name}
                    onChange={(event) =>
                      updateForm(
                        "name",
                        event.target.value
                      )
                    }
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Center Type{" "}
                    <span className="required">*</span>
                  </label>

                  <select
                    className="form-select"
                    value={form.type}
                    onChange={(event) =>
                      updateForm(
                        "type",
                        event.target.value
                      )
                    }
                  >
                    <option value="">
                      Select center type
                    </option>

                    {CENTER_TYPES.map((type) => (
                      <option
                        key={type}
                        value={type}
                      >
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Operating Status
                  </label>

                  <select
                    className="form-select"
                    value={form.status}
                    onChange={(event) =>
                      updateForm(
                        "status",
                        event.target.value as CenterStatus
                      )
                    }
                  >
                    {STATUS_OPTIONS.map(
                      (status) => (
                        <option
                          key={status}
                          value={status}
                        >
                          {status}
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    County{" "}
                    <span className="required">*</span>
                  </label>

                  <select
                    className="form-select"
                    value={form.county}
                    onChange={(event) =>
                      handleCountyChange(
                        event.target.value
                      )
                    }
                  >
                    <option value="">
                      Select county
                    </option>

                    {counties.map((county) => (
                      <option
                        key={county}
                        value={county}
                      >
                        {county}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Sub-County{" "}
                    <span className="required">*</span>
                  </label>

                  <select
                    className="form-select"
                    value={form.subCounty}
                    disabled={!form.county}
                    onChange={(event) =>
                      handleSubCountyChange(
                        event.target.value
                      )
                    }
                  >
                    <option value="">
                      {form.county
                        ? "Select sub-county"
                        : "Select county first"}
                    </option>

                    {subCounties.map(
                      (subCounty) => (
                        <option
                          key={subCounty}
                          value={subCounty}
                        >
                          {subCounty}
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Ward{" "}
                    <span className="required">*</span>
                  </label>

                  <select
                    className="form-select"
                    value={form.ward}
                    disabled={!form.subCounty}
                    onChange={(event) =>
                      updateForm(
                        "ward",
                        event.target.value
                      )
                    }
                  >
                    <option value="">
                      {form.subCounty
                        ? "Select ward"
                        : "Select sub-county first"}
                    </option>

                    {wards.map((ward) => (
                      <option
                        key={ward}
                        value={ward}
                      >
                        {ward}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Address / Physical Location
                  </label>

                  <input
                    className="form-input"
                    placeholder="Building, road or area"
                    value={form.address}
                    onChange={(event) =>
                      updateForm(
                        "address",
                        event.target.value
                      )
                    }
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Landmark
                  </label>

                  <input
                    className="form-input"
                    placeholder="Nearby landmark"
                    value={form.landmark}
                    onChange={(event) =>
                      updateForm(
                        "landmark",
                        event.target.value
                      )
                    }
                  />
                </div>

                <div className="form-group full">
                  <label className="form-label">
                    Center Location
                  </label>

                  <div className="location-panel">
                    <div
                      className="muted"
                      style={{
                        fontSize: 13,
                      }}
                    >
                      GPS coordinates can be captured
                      automatically from the device or
                      entered manually when authorised.
                    </div>

                    <div className="location-actions">
                      <button
                        type="button"
                        className="primary-button"
                        onClick={getCurrentLocation}
                        disabled={gpsLoading}
                      >
                        <FaCrosshairs />

                        {gpsLoading
                          ? "Getting location..."
                          : "Use Current Location"}
                      </button>

                      {form.latitude !== null &&
                        form.longitude !== null && (
                          <button
                            type="button"
                            className="secondary-button"
                            onClick={() =>
                              openGoogleMaps(
                                form.latitude,
                                form.longitude
                              )
                            }
                          >
                            <FaExternalLinkAlt />
                            Open Google Maps
                          </button>
                        )}
                    </div>

                    {gpsError && (
                      <div className="gps-error">
                        {gpsError}
                      </div>
                    )}

                    <div className="coordinate-grid">
                      <div>
                        <label className="form-label">
                          Latitude
                        </label>

                        <input
                          className="form-input"
                          type="number"
                          step="any"
                          placeholder="-4.0435"
                          value={
                            form.latitude ?? ""
                          }
                          onChange={(event) =>
                            updateForm(
                              "latitude",
                              event.target.value ===
                                ""
                                ? null
                                : Number(
                                    event.target
                                      .value
                                  )
                            )
                          }
                        />
                      </div>

                      <div>
                        <label className="form-label">
                          Longitude
                        </label>

                        <input
                          className="form-input"
                          type="number"
                          step="any"
                          placeholder="39.6682"
                          value={
                            form.longitude ?? ""
                          }
                          onChange={(event) =>
                            updateForm(
                              "longitude",
                              event.target.value ===
                                ""
                                ? null
                                : Number(
                                    event.target
                                      .value
                                  )
                            )
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Registered Capacity
                  </label>

                  <input
                    className="form-input"
                    type="number"
                    min="0"
                    value={form.capacity}
                    onChange={(event) =>
                      updateForm(
                        "capacity",
                        Number(event.target.value)
                      )
                    }
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Current Verified Occupancy
                  </label>

                  <input
                    className="form-input"
                    type="number"
                    min="0"
                    value={form.occupancy}
                    onChange={(event) =>
                      updateForm(
                        "occupancy",
                        Number(event.target.value)
                      )
                    }
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Contact Person
                  </label>

                  <input
                    className="form-input"
                    placeholder="Shelter coordinator"
                    value={form.contactPerson}
                    onChange={(event) =>
                      updateForm(
                        "contactPerson",
                        event.target.value
                      )
                    }
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Phone
                  </label>

                  <input
                    className="form-input"
                    placeholder="+254..."
                    value={form.phone}
                    onChange={(event) =>
                      updateForm(
                        "phone",
                        event.target.value
                      )
                    }
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Email
                  </label>

                  <input
                    className="form-input"
                    type="email"
                    placeholder="center@example.org"
                    value={form.email}
                    onChange={(event) =>
                      updateForm(
                        "email",
                        event.target.value
                      )
                    }
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Accessibility
                  </label>

                  <select
                    className="form-select"
                    value={form.accessibility}
                    onChange={(event) =>
                      updateForm(
                        "accessibility",
                        event.target.value
                      )
                    }
                  >
                    <option value="">
                      Select
                    </option>
                    <option value="Accessible">
                      Accessible
                    </option>
                    <option value="Partially Accessible">
                      Partially Accessible
                    </option>
                    <option value="Not Verified">
                      Not Verified
                    </option>
                  </select>
                </div>

                <div className="form-group full">
                  <label className="form-label">
                    Services Available
                  </label>

                  <div className="services-grid">
                    {SERVICE_OPTIONS.map(
                      (service) => {
                        const selected =
                          form.services.includes(
                            service
                          );

                        return (
                          <label
                            key={service}
                            className={`service-option ${
                              selected
                                ? "selected"
                                : ""
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={selected}
                              onChange={() =>
                                toggleService(
                                  service
                                )
                              }
                            />

                            {service}
                          </label>
                        );
                      }
                    )}
                  </div>
                </div>

                <div className="form-group full">
                  <label className="form-label">
                    Operational Notes
                  </label>

                  <textarea
                    className="form-textarea"
                    rows={4}
                    placeholder="Additional verified operational information..."
                    value={form.notes}
                    onChange={(event) =>
                      updateForm(
                        "notes",
                        event.target.value
                      )
                    }
                  />
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="secondary-button"
                onClick={() =>
                  setShowForm(false)
                }
              >
                Cancel
              </button>

              <button
                type="submit"
                className="primary-button"
              >
                {editingId
                  ? "Save Changes"
                  : "Register Center"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* DETAILS MODAL */}

      {showDetails && selectedCenter && (
        <div
          className="modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setShowDetails(false);
            }
          }}
        >
          <div className="modal">
            <div className="modal-header">
              <div>
                <h2 className="modal-title">
                  {selectedCenter.name}
                </h2>

                <div className="muted">
                  {selectedCenter.id}
                </div>
              </div>

              <button
                className="close-button"
                onClick={() =>
                  setShowDetails(false)
                }
              >
                <FaTimes />
              </button>
            </div>

            <div className="modal-body">
              <div className="detail-grid">
                <div className="detail-card">
                  <div className="detail-label">
                    Center Type
                  </div>
                  <div className="detail-value">
                    {selectedCenter.type}
                  </div>
                </div>

                <div className="detail-card">
                  <div className="detail-label">
                    Status
                  </div>
                  <div className="detail-value">
                    {selectedCenter.status}
                  </div>
                </div>

                <div className="detail-card">
                  <div className="detail-label">
                    Administrative Location
                  </div>
                  <div className="detail-value">
                    {selectedCenter.county}
                    <br />
                    {selectedCenter.subCounty}
                    <br />
                    {selectedCenter.ward}
                  </div>
                </div>

                <div className="detail-card">
                  <div className="detail-label">
                    Physical Location
                  </div>
                  <div className="detail-value">
                    {selectedCenter.address ||
                      "Not provided"}

                    {selectedCenter.landmark && (
                      <>
                        <br />
                        <span className="muted">
                          Landmark:{" "}
                          {selectedCenter.landmark}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="detail-card">
                  <div className="detail-label">
                    Capacity
                  </div>
                  <div className="detail-value">
                    {selectedCenter.capacity.toLocaleString()}
                  </div>
                </div>

                <div className="detail-card">
                  <div className="detail-label">
                    Verified Occupancy
                  </div>
                  <div className="detail-value">
                    {selectedCenter.occupancy.toLocaleString()}
                  </div>
                </div>

                <div className="detail-card">
                  <div className="detail-label">
                    Available Spaces
                  </div>
                  <div className="detail-value">
                    {Math.max(
                      selectedCenter.capacity -
                        selectedCenter.occupancy,
                      0
                    ).toLocaleString()}
                  </div>
                </div>

                <div className="detail-card">
                  <div className="detail-label">
                    Contact
                  </div>
                  <div className="detail-value">
                    {selectedCenter.contactPerson ||
                      "Not provided"}
                    <br />
                    {selectedCenter.phone ||
                      "No phone"}
                    <br />
                    {selectedCenter.email ||
                      "No email"}
                  </div>
                </div>

                <div className="detail-card">
                  <div className="detail-label">
                    GPS Coordinates
                  </div>

                  <div className="detail-value">
                    {selectedCenter.latitude !==
                      null &&
                    selectedCenter.longitude !==
                      null ? (
                      <>
                        {selectedCenter.latitude},{" "}
                        {selectedCenter.longitude}

                        <br />

                        <button
                          className="secondary-button map-button"
                          onClick={() =>
                            openGoogleMaps(
                              selectedCenter.latitude,
                              selectedCenter.longitude
                            )
                          }
                        >
                          <FaMapMarkerAlt />
                          Open Google Maps
                        </button>
                      </>
                    ) : (
                      "Location not recorded"
                    )}
                  </div>
                </div>

                <div className="detail-card">
                  <div className="detail-label">
                    Accessibility
                  </div>

                  <div className="detail-value">
                    {selectedCenter.accessibility ||
                      "Not verified"}
                  </div>
                </div>

                <div className="detail-card">
                  <div className="detail-label">
                    Services
                  </div>

                  <div className="service-tags">
                    {selectedCenter.services
                      .length > 0 ? (
                      selectedCenter.services.map(
                        (service) => (
                          <span
                            className="service-tag"
                            key={service}
                          >
                            {service}
                          </span>
                        )
                      )
                    ) : (
                      <span className="muted">
                        No services recorded
                      </span>
                    )}
                  </div>
                </div>

                <div className="detail-card">
                  <div className="detail-label">
                    Operational Notes
                  </div>

                  <div className="detail-value">
                    {selectedCenter.notes ||
                      "No additional notes"}
                  </div>
                </div>

                <div className="detail-card">
                  <div className="detail-label">
                    Record Dates
                  </div>

                  <div className="detail-value">
                    Created:{" "}
                    {formatDate(
                      selectedCenter.createdAt
                    )}
                    <br />
                    Updated:{" "}
                    {formatDate(
                      selectedCenter.updatedAt
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="secondary-button"
                onClick={() =>
                  printReport()
                }
              >
                <FaPrint />
                Print Report
              </button>

              <button
                className="secondary-button"
                onClick={() => {
                  setShowDetails(false);
                  openEditForm(selectedCenter);
                }}
              >
                <FaEdit />
                Edit
              </button>

              <button
                className="primary-button"
                onClick={() =>
                  setShowDetails(false)
                }
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SheltersReliefCenters;