import { useMemo, useState } from "react";
import {
  FaAmbulance,
  FaEye,
  FaFire,
  FaMapMarkerAlt,
  FaSearch,
  FaShieldAlt,
  FaWater,
} from "react-icons/fa";

import DataTable, {
  type DataTableColumn,
} from "../../common/DataTable";
import SearchBar from "../../common/SearchBar";
import StatusBadge from "../../common/StatusBadge";

export type EmergencyRecord = {
  id: string;
  reference?: string;
  type: string;
  county: string;
  ward: string;
  location?: string;
  severity: string;
  status: string;
  agency: string;
  submittedAt: string;
  reporterName?: string;
};

type EmergencyTableProps = {
  emergencies?: EmergencyRecord[];
  loading?: boolean;
  title?: string;
  description?: string;
  onViewEmergency?: (emergency: EmergencyRecord) => void;
  onViewAll?: () => void;
};

const defaultEmergencies: EmergencyRecord[] = [
  {
    id: "1",
    reference: "FIR-1024",
    type: "Fire",
    county: "Mombasa",
    ward: "Nyali",
    location: "Links Road",
    severity: "Critical",
    status: "Dispatched",
    agency: "Fire Brigade",
    submittedAt: "09:42 AM",
    reporterName: "Citizen Reporter",
  },
  {
    id: "2",
    reference: "POL-2081",
    type: "Police",
    county: "Mombasa",
    ward: "Kisauni",
    location: "Bamburi",
    severity: "High",
    status: "Responding",
    agency: "Police Service",
    submittedAt: "09:31 AM",
    reporterName: "Community Member",
  },
  {
    id: "3",
    reference: "MED-3147",
    type: "Medical",
    county: "Mombasa",
    ward: "Mvita",
    location: "Mombasa CBD",
    severity: "High",
    status: "On Scene",
    agency: "Ambulance Service",
    submittedAt: "09:18 AM",
    reporterName: "Business Owner",
  },
  {
    id: "4",
    reference: "FLD-4108",
    type: "Flood",
    county: "Mombasa",
    ward: "Likoni",
    location: "Shelly Beach",
    severity: "Medium",
    status: "Pending",
    agency: "County Disaster Unit",
    submittedAt: "08:54 AM",
    reporterName: "Resident",
  },
  {
    id: "5",
    reference: "POL-2092",
    type: "Police",
    county: "Kilifi",
    ward: "Mtwapa",
    location: "Mtwapa Centre",
    severity: "Medium",
    status: "Assigned",
    agency: "Police Service",
    submittedAt: "08:37 AM",
    reporterName: "Shop Owner",
  },
];

function emergencyIcon(type: string) {
  switch (type.toLowerCase()) {
    case "fire":
      return {
        icon: <FaFire />,
        classes: "bg-red-100 text-red-700",
      };

    case "police":
    case "crime":
      return {
        icon: <FaShieldAlt />,
        classes: "bg-blue-100 text-blue-700",
      };

    case "medical":
    case "ambulance":
      return {
        icon: <FaAmbulance />,
        classes: "bg-emerald-100 text-emerald-700",
      };

    case "flood":
      return {
        icon: <FaWater />,
        classes: "bg-cyan-100 text-cyan-700",
      };

    default:
      return {
        icon: <FaMapMarkerAlt />,
        classes: "bg-slate-100 text-slate-700",
      };
  }
}

export default function EmergencyTable({
  emergencies = defaultEmergencies,
  loading = false,
  title = "Active Emergencies",
  description = "Latest emergency reports requiring monitoring or agency action.",
  onViewEmergency,
  onViewAll,
}: EmergencyTableProps) {
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [agencyFilter, setAgencyFilter] = useState("all");

  const agencyOptions = useMemo(() => {
    return Array.from(
      new Set(emergencies.map((emergency) => emergency.agency))
    ).sort();
  }, [emergencies]);

  const filteredEmergencies = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return emergencies.filter((emergency) => {
      const matchesSearch =
        !normalizedSearch ||
        emergency.reference
          ?.toLowerCase()
          .includes(normalizedSearch) ||
        emergency.type.toLowerCase().includes(normalizedSearch) ||
        emergency.county.toLowerCase().includes(normalizedSearch) ||
        emergency.ward.toLowerCase().includes(normalizedSearch) ||
        emergency.location
          ?.toLowerCase()
          .includes(normalizedSearch) ||
        emergency.agency.toLowerCase().includes(normalizedSearch) ||
        emergency.reporterName
          ?.toLowerCase()
          .includes(normalizedSearch);

      const matchesSeverity =
        severityFilter === "all" ||
        emergency.severity === severityFilter;

      const matchesStatus =
        statusFilter === "all" ||
        emergency.status === statusFilter;

      const matchesAgency =
        agencyFilter === "all" ||
        emergency.agency === agencyFilter;

      return (
        matchesSearch &&
        matchesSeverity &&
        matchesStatus &&
        matchesAgency
      );
    });
  }, [
    emergencies,
    search,
    severityFilter,
    statusFilter,
    agencyFilter,
  ]);

  const columns: DataTableColumn<EmergencyRecord>[] = [
    {
      key: "reference",
      label: "Incident",
      sortable: true,
      render: (emergency) => {
        const typeStyle = emergencyIcon(emergency.type);

        return (
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg ${typeStyle.classes}`}
            >
              {typeStyle.icon}
            </div>

            <div>
              <p className="font-bold text-slate-950">
                {emergency.reference || emergency.id}
              </p>

              <p className="text-xs text-slate-500">
                {emergency.type}
              </p>
            </div>
          </div>
        );
      },
      sortValue: (emergency) =>
        emergency.reference || emergency.id,
    },
    {
      key: "location",
      label: "Location",
      sortable: true,
      render: (emergency) => (
        <div>
          <p className="font-semibold text-slate-900">
            {emergency.county}
          </p>

          <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
            <FaMapMarkerAlt />
            {emergency.ward}
            {emergency.location
              ? ` · ${emergency.location}`
              : ""}
          </p>
        </div>
      ),
      sortValue: (emergency) =>
        `${emergency.county} ${emergency.ward}`,
    },
    {
      key: "severity",
      label: "Severity",
      sortable: true,
      render: (emergency) => (
        <StatusBadge status={emergency.severity} />
      ),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (emergency) => (
        <StatusBadge status={emergency.status} />
      ),
    },
    {
      key: "agency",
      label: "Agency",
      sortable: true,
      render: (emergency) => (
        <div>
          <p className="font-semibold text-slate-900">
            {emergency.agency}
          </p>

          <p className="text-xs text-slate-500">
            Assigned response unit
          </p>
        </div>
      ),
    },
    {
      key: "submittedAt",
      label: "Submitted",
      sortable: true,
    },
    {
      key: "actions",
      label: "Actions",
      render: (emergency) => (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onViewEmergency?.(emergency);
          }}
          className="flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2 text-xs font-bold text-white transition hover:bg-slate-800"
        >
          <FaEye />
          View
        </button>
      ),
    },
  ];

  function clearFilters() {
    setSearch("");
    setSeverityFilter("all");
    setStatusFilter("all");
    setAgencyFilter("all");
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div>
          <h2 className="text-xl font-bold text-slate-950">
            {title}
          </h2>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            {description}
          </p>
        </div>

        {onViewAll && (
          <button
            type="button"
            onClick={onViewAll}
            className="w-fit rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
          >
            View All Emergencies
          </button>
        )}
      </div>

      <div className="space-y-4 border-b border-slate-100 bg-slate-50 p-5 sm:p-6">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search incident, county, ward, agency or reporter..."
          ariaLabel="Search emergency reports"
        />

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <select
            value={severityFilter}
            onChange={(event) =>
              setSeverityFilter(event.target.value)
            }
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
          >
            <option value="all">All Severities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value)
            }
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
          >
            <option value="all">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Assigned">Assigned</option>
            <option value="Dispatched">Dispatched</option>
            <option value="Responding">Responding</option>
            <option value="On Scene">On Scene</option>
            <option value="Resolved">Resolved</option>
          </select>

          <select
            value={agencyFilter}
            onChange={(event) =>
              setAgencyFilter(event.target.value)
            }
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
          >
            <option value="all">All Agencies</option>

            {agencyOptions.map((agency) => (
              <option key={agency} value={agency}>
                {agency}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={clearFilters}
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100"
          >
            <FaSearch />
            Clear Filters
          </button>
        </div>
      </div>

      <div className="p-0">
        <DataTable
          data={filteredEmergencies}
          columns={columns}
          getRowId={(emergency) => emergency.id}
          loading={loading}
          pageSize={5}
          pageSizeOptions={[5, 10, 20]}
          emptyMessage="No emergency reports match the current filters."
          caption="Active emergency reports"
          onRowClick={onViewEmergency}
          className="rounded-none border-0 shadow-none"
        />
      </div>

      <div className="border-t border-slate-100 bg-slate-50 px-5 py-4 sm:px-6">
        <p className="text-xs leading-5 text-slate-500">
          This table currently accepts demonstration data. The Master Dashboard
          will later pass live Firestore reports, including their true
          submission timestamps and assigned agencies.
        </p>
      </div>
    </section>
  );
}