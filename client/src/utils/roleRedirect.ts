import { getRoleDashboardPath } from "../config/roles";

/**
 * Returns the correct dashboard path
 * based on the authenticated user's role.
 */
export function getDashboardPath(role?: string): string {
  return getRoleDashboardPath(role);
}