export type AppRole =
  | "citizen"
  | "police"
  | "fire"
  | "ambulance"
  | "county"
  | "redcross"
  | "nyumbakumi"
  | "admin";

export const rolesConfig = {
  citizen: {
    label: "Citizen",
    dashboardPath: "/dashboard",
    color: "blue",
    permissions: [
      "reports.create",
      "reports.view_own",
      "alerts.view",
      "contacts.view",
      "safezones.view",
      "profile.manage",
    ],
  },

  police: {
    label: "Police",
    dashboardPath: "/police",
    color: "blue",
    permissions: [
      "reports.view_police",
      "dispatch.manage",
      "cases.manage",
      "analytics.view",
    ],
  },

  fire: {
    label: "Fire",
    dashboardPath: "/fire",
    color: "red",
    permissions: [
      "reports.view_fire",
      "rescue.manage",
      "stations.view",
      "analytics.view",
    ],
  },

  ambulance: {
    label: "Ambulance",
    dashboardPath: "/ambulance",
    color: "emerald",
    permissions: [
      "reports.view_medical",
      "dispatch.manage",
      "patients.manage",
      "hospitals.view",
    ],
  },

  county: {
    label: "County",
    dashboardPath: "/county",
    color: "purple",
    permissions: [
      "reports.view_all",
      "alerts.manage",
      "gis.view",
      "analytics.view",
    ],
  },

  redcross: {
    label: "Red Cross",
    dashboardPath: "/redcross",
    color: "red",
    permissions: [
      "relief.manage",
      "volunteers.manage",
      "shelters.manage",
      "reports.view_disaster",
    ],
  },

  nyumbakumi: {
    label: "Nyumba Kumi",
    dashboardPath: "/nyumbakumi",
    color: "amber",
    permissions: [
      "community.manage",
      "reports.view_community",
      "alerts.create_local",
    ],
  },

  admin: {
    label: "Admin",
    dashboardPath: "/admin",
    color: "purple",
    permissions: [
      "users.manage",
      "roles.manage",
      "reports.manage",
      "dispatch.manage",
      "analytics.view",
      "audit.view",
      "settings.manage",
    ],
  },
} as const;

export const roleOptions = Object.entries(rolesConfig).map(
  ([value, config]) => ({
    value,
    label: config.label,
  })
);

export function getRoleLabel(role?: string) {
  if (!role) return rolesConfig.citizen.label;

  return rolesConfig[role as AppRole]?.label || rolesConfig.citizen.label;
}

export function getRoleDashboardPath(role?: string) {
  if (!role) return rolesConfig.citizen.dashboardPath;

  return (
    rolesConfig[role as AppRole]?.dashboardPath ||
    rolesConfig.citizen.dashboardPath
  );
}

export function roleHasPermission(
  role: string | undefined,
  permission: string
) {
  if (!role) return false;

  return (
    rolesConfig[role as AppRole]?.permissions.includes(permission as never) ||
    false
  );
}