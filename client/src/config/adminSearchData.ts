export type AdminSearchCategory =
  | "Admin"
  | "Emergency"
  | "Police"
  | "Analytics"
  | "System";

export type AdminSearchItem = {
  id: string;
  title: string;
  description: string;
  path: string;
  category: AdminSearchCategory;
  keywords: string[];
};

export const adminSearchItems: AdminSearchItem[] = [
  {
    id: "admin-dashboard",
    title: "Master Administration Dashboard",
    description:
      "View platform statistics, emergency activity, agencies and system health.",
    path: "/admin",
    category: "Admin",
    keywords: [
      "dashboard",
      "admin",
      "master administration",
      "command centre",
      "overview",
      "statistics",
    ],
  },
  {
    id: "user-management",
    title: "User Management",
    description:
      "Register users, approve accounts, suspend users and manage profiles.",
    path: "/admin/users",
    category: "Admin",
    keywords: [
      "users",
      "citizens",
      "officers",
      "accounts",
      "registration",
      "profiles",
    ],
  },
  {
    id: "role-management",
    title: "Role Management",
    description:
      "Create roles, assign access and configure platform responsibilities.",
    path: "/admin/roles",
    category: "Admin",
    keywords: [
      "roles",
      "permissions",
      "access",
      "rbac",
      "authorization",
      "security",
    ],
  },
  {
    id: "emergency-management",
    title: "Emergency Management",
    description:
      "View incidents, assign agencies and monitor emergency response.",
    path: "/admin/emergencies",
    category: "Emergency",
    keywords: [
      "emergency",
      "incidents",
      "reports",
      "dispatch",
      "fire",
      "crime",
      "ambulance",
      "flood",
    ],
  },
  {
    id: "agency-management",
    title: "Agency Management",
    description:
      "Manage emergency agencies, stations, responders and coverage.",
    path: "/admin/agencies",
    category: "Admin",
    keywords: [
      "agency",
      "agencies",
      "stations",
      "responders",
      "police",
      "fire",
      "ambulance",
      "hospital",
    ],
  },
  {
    id: "gis-command-centre",
    title: "GIS Command Centre",
    description:
      "Open the live emergency map and view incidents, vehicles and stations.",
    path: "/admin/gis",
    category: "Emergency",
    keywords: [
      "gis",
      "map",
      "gps",
      "location",
      "vehicles",
      "markers",
      "incidents",
      "stations",
    ],
  },
  {
    id: "system-analytics",
    title: "System Analytics",
    description:
      "Review emergency trends, response times and platform performance.",
    path: "/admin/analytics",
    category: "Analytics",
    keywords: [
      "analytics",
      "charts",
      "performance",
      "statistics",
      "response time",
      "reports",
    ],
  },
  {
    id: "audit-logs",
    title: "Audit Logs",
    description:
      "Review system actions, user activity and administrative changes.",
    path: "/admin/audit-logs",
    category: "System",
    keywords: [
      "audit",
      "logs",
      "activity",
      "history",
      "security",
      "actions",
      "changes",
    ],
  },
  {
    id: "admin-settings",
    title: "Admin Settings",
    description:
      "Configure notifications, emergency contacts and platform preferences.",
    path: "/admin/settings",
    category: "System",
    keywords: [
      "settings",
      "configuration",
      "notifications",
      "email",
      "sms",
      "push",
      "security",
    ],
  },
  {
    id: "police-dashboard",
    title: "Police Command Centre",
    description:
      "Open the Police dashboard for incidents, dispatch and investigations.",
    path: "/police",
    category: "Police",
    keywords: [
      "police",
      "dashboard",
      "command centre",
      "officers",
      "crime",
      "patrol",
    ],
  },
  {
    id: "police-incidents",
    title: "Police Active Incidents",
    description:
      "View incoming Police incidents and current response activity.",
    path: "/police/incidents",
    category: "Police",
    keywords: [
      "police incidents",
      "active incidents",
      "crime reports",
      "responding",
    ],
  },
  {
    id: "police-dispatch",
    title: "Police Dispatch Centre",
    description:
      "Assign officers and patrol vehicles to active incidents.",
    path: "/police/dispatch",
    category: "Police",
    keywords: [
      "dispatch",
      "assign officers",
      "patrol",
      "vehicle",
      "eta",
      "response",
    ],
  },
  {
    id: "police-officers",
    title: "Police Officers",
    description:
      "Manage officer profiles, shifts, assignments and availability.",
    path: "/police/officers",
    category: "Police",
    keywords: [
      "officers",
      "police staff",
      "shifts",
      "availability",
      "assignments",
    ],
  },
  {
    id: "police-vehicles",
    title: "Police Patrol Vehicles",
    description:
      "Manage patrol vehicles, drivers, fuel, maintenance and GPS status.",
    path: "/police/vehicles",
    category: "Police",
    keywords: [
      "vehicles",
      "patrol cars",
      "fleet",
      "fuel",
      "maintenance",
      "gps",
    ],
  },
  {
    id: "police-cases",
    title: "Police Case Management",
    description:
      "Open cases, assign investigators and manage investigation progress.",
    path: "/police/cases",
    category: "Police",
    keywords: [
      "cases",
      "investigation",
      "investigators",
      "suspects",
      "victims",
      "court",
    ],
  },
  {
    id: "police-evidence",
    title: "Police Evidence Management",
    description:
      "Manage evidence records, verification and chain of custody.",
    path: "/police/evidence",
    category: "Police",
    keywords: [
      "evidence",
      "photos",
      "videos",
      "documents",
      "custody",
      "verification",
    ],
  },
  {
    id: "police-settings",
    title: "Police Settings",
    description:
      "Configure Police notifications, emergency sound and device registration.",
    path: "/police/settings",
    category: "Police",
    keywords: [
      "police settings",
      "notifications",
      "sound",
      "device",
      "alerts",
    ],
  },
];

export function searchAdminItems(
  searchValue: string,
  limit = 8
): AdminSearchItem[] {
  const query = searchValue.trim().toLowerCase();

  if (!query) {
    return [];
  }

  return adminSearchItems
    .map((item) => {
      const title = item.title.toLowerCase();
      const description = item.description.toLowerCase();
      const category = item.category.toLowerCase();
      const keywords = item.keywords.join(" ").toLowerCase();

      let score = 0;

      if (title === query) score += 100;
      if (title.startsWith(query)) score += 50;
      if (title.includes(query)) score += 30;
      if (category.includes(query)) score += 15;
      if (keywords.includes(query)) score += 12;
      if (description.includes(query)) score += 5;

      return {
        item,
        score,
      };
    })
    .filter((result) => result.score > 0)
    .sort((first, second) => second.score - first.score)
    .slice(0, limit)
    .map((result) => result.item);
}