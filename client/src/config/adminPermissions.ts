export type PermissionAction =
  | "view"
  | "create"
  | "edit"
  | "delete"
  | "approve"
  | "assign"
  | "dispatch"
  | "export"
  | "manage";

export type PermissionModule = {
  id: string;
  name: string;
  description: string;
  group:
    | "Administration"
    | "Emergency Operations"
    | "Police"
    | "Analytics"
    | "System";
  actions: PermissionAction[];
};

export type RolePermissionMap = Record<
  string,
  PermissionAction[]
>;

export type PlatformRole = {
  id: string;
  name: string;
  description: string;
  status: "Active" | "Inactive";
  systemRole?: boolean;
  userCount: number;
  permissions: RolePermissionMap;
};

export const permissionModules: PermissionModule[] = [
  {
    id: "dashboard",
    name: "Dashboard",
    description:
      "Access the administration dashboard and operational overview.",
    group: "Administration",
    actions: ["view"],
  },
  {
    id: "users",
    name: "User Management",
    description:
      "Manage citizens, officers, responders and administrator accounts.",
    group: "Administration",
    actions: [
      "view",
      "create",
      "edit",
      "delete",
      "approve",
      "export",
      "manage",
    ],
  },
  {
    id: "roles",
    name: "Roles and Permissions",
    description:
      "Create roles and configure platform access permissions.",
    group: "Administration",
    actions: [
      "view",
      "create",
      "edit",
      "delete",
      "assign",
      "manage",
    ],
  },
  {
    id: "agencies",
    name: "Agency Management",
    description:
      "Manage emergency agencies, stations and coverage.",
    group: "Administration",
    actions: [
      "view",
      "create",
      "edit",
      "delete",
      "approve",
      "assign",
      "export",
      "manage",
    ],
  },
  {
    id: "emergencies",
    name: "Emergency Management",
    description:
      "Review, assign and coordinate emergency incidents.",
    group: "Emergency Operations",
    actions: [
      "view",
      "create",
      "edit",
      "delete",
      "approve",
      "assign",
      "dispatch",
      "export",
      "manage",
    ],
  },
  {
    id: "gis",
    name: "GIS Command Centre",
    description:
      "Access emergency maps, locations and response resources.",
    group: "Emergency Operations",
    actions: ["view", "edit", "assign", "dispatch", "manage"],
  },
  {
    id: "police-incidents",
    name: "Police Incidents",
    description:
      "Manage active Police incidents and response operations.",
    group: "Police",
    actions: [
      "view",
      "create",
      "edit",
      "delete",
      "assign",
      "dispatch",
      "export",
    ],
  },
  {
    id: "police-dispatch",
    name: "Police Dispatch",
    description:
      "Assign officers and vehicles to Police incidents.",
    group: "Police",
    actions: ["view", "edit", "assign", "dispatch", "manage"],
  },
  {
    id: "police-officers",
    name: "Police Officers",
    description:
      "Manage Police officers, shifts and assignments.",
    group: "Police",
    actions: [
      "view",
      "create",
      "edit",
      "delete",
      "assign",
      "export",
      "manage",
    ],
  },
  {
    id: "police-vehicles",
    name: "Police Vehicles",
    description:
      "Manage patrol vehicles, drivers and operational status.",
    group: "Police",
    actions: [
      "view",
      "create",
      "edit",
      "delete",
      "assign",
      "dispatch",
      "export",
    ],
  },
  {
    id: "police-cases",
    name: "Police Cases",
    description:
      "Manage investigations, suspects, victims and court status.",
    group: "Police",
    actions: [
      "view",
      "create",
      "edit",
      "delete",
      "assign",
      "approve",
      "export",
      "manage",
    ],
  },
  {
    id: "police-evidence",
    name: "Police Evidence",
    description:
      "Manage evidence records and chain of custody.",
    group: "Police",
    actions: [
      "view",
      "create",
      "edit",
      "delete",
      "approve",
      "assign",
      "export",
      "manage",
    ],
  },
  {
    id: "analytics",
    name: "System Analytics",
    description:
      "View and export platform and emergency analytics.",
    group: "Analytics",
    actions: ["view", "export", "manage"],
  },
  {
    id: "audit-logs",
    name: "Audit Logs",
    description:
      "Review security, user activity and operational history.",
    group: "System",
    actions: ["view", "export", "manage"],
  },
  {
    id: "settings",
    name: "System Settings",
    description:
      "Configure platform identity, notifications and security.",
    group: "System",
    actions: ["view", "edit", "manage"],
  },
];

export const defaultRoles: PlatformRole[] = [
  {
    id: "super-admin",
    name: "Super Administrator",
    description:
      "Full access to all Jamii App modules and platform settings.",
    status: "Active",
    systemRole: true,
    userCount: 1,
    permissions: permissionModules.reduce<RolePermissionMap>(
      (result, module) => {
        result[module.id] = [...module.actions];
        return result;
      },
      {}
    ),
  },
  {
    id: "system-admin",
    name: "System Administrator",
    description:
      "Manages users, agencies, incidents, analytics and system operations.",
    status: "Active",
    systemRole: true,
    userCount: 2,
    permissions: {
      dashboard: ["view"],
      users: [
        "view",
        "create",
        "edit",
        "approve",
        "export",
        "manage",
      ],
      roles: ["view", "assign"],
      agencies: [
        "view",
        "create",
        "edit",
        "approve",
        "assign",
        "export",
      ],
      emergencies: [
        "view",
        "edit",
        "approve",
        "assign",
        "dispatch",
        "export",
      ],
      gis: ["view", "edit", "assign", "dispatch"],
      analytics: ["view", "export"],
      "audit-logs": ["view", "export"],
      settings: ["view", "edit"],
    },
  },
  {
    id: "police-commander",
    name: "Police Commander",
    description:
      "Manages Police incidents, dispatch, officers, vehicles and investigations.",
    status: "Active",
    systemRole: false,
    userCount: 4,
    permissions: {
      dashboard: ["view"],
      emergencies: ["view", "assign", "dispatch", "export"],
      gis: ["view", "assign", "dispatch"],
      "police-incidents": [
        "view",
        "create",
        "edit",
        "assign",
        "dispatch",
        "export",
      ],
      "police-dispatch": [
        "view",
        "edit",
        "assign",
        "dispatch",
        "manage",
      ],
      "police-officers": [
        "view",
        "create",
        "edit",
        "assign",
        "export",
      ],
      "police-vehicles": [
        "view",
        "create",
        "edit",
        "assign",
        "dispatch",
        "export",
      ],
      "police-cases": [
        "view",
        "create",
        "edit",
        "assign",
        "approve",
        "export",
      ],
      "police-evidence": [
        "view",
        "create",
        "edit",
        "approve",
        "assign",
        "export",
      ],
      analytics: ["view", "export"],
    },
  },
  {
    id: "police-officer",
    name: "Police Officer",
    description:
      "Responds to assigned incidents and manages authorized case records.",
    status: "Active",
    systemRole: false,
    userCount: 12,
    permissions: {
      dashboard: ["view"],
      emergencies: ["view"],
      gis: ["view"],
      "police-incidents": ["view", "edit"],
      "police-dispatch": ["view"],
      "police-officers": ["view"],
      "police-vehicles": ["view"],
      "police-cases": ["view", "create", "edit"],
      "police-evidence": ["view", "create", "edit"],
    },
  },
  {
    id: "dispatcher",
    name: "Emergency Dispatcher",
    description:
      "Assigns incidents, responders and vehicles across emergency agencies.",
    status: "Active",
    systemRole: false,
    userCount: 5,
    permissions: {
      dashboard: ["view"],
      emergencies: ["view", "edit", "assign", "dispatch"],
      gis: ["view", "assign", "dispatch"],
      agencies: ["view"],
      "police-incidents": ["view", "assign", "dispatch"],
      "police-dispatch": ["view", "assign", "dispatch"],
      "police-officers": ["view"],
      "police-vehicles": ["view", "assign", "dispatch"],
    },
  },
];

export const permissionActionLabels: Record<
  PermissionAction,
  string
> = {
  view: "View",
  create: "Create",
  edit: "Edit",
  delete: "Delete",
  approve: "Approve",
  assign: "Assign",
  dispatch: "Dispatch",
  export: "Export",
  manage: "Manage",
};

export function roleHasPermission(
  role: PlatformRole,
  moduleId: string,
  action: PermissionAction
) {
  return role.permissions[moduleId]?.includes(action) ?? false;
}

export function countRolePermissions(role: PlatformRole) {
  return Object.values(role.permissions).reduce(
    (total, actions) => total + actions.length,
    0
  );
}