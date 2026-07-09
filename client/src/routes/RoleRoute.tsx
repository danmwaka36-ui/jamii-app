import { Navigate } from "react-router-dom";
import type { ReactElement } from "react";

import { useAuth } from "../auth/AuthContext";
import { getDashboardPath } from "../utils/roleRedirect";

type Props = {
  children: ReactElement;
  allowedRoles: string[];
};

export default function RoleRoute({
  children,
  allowedRoles,
}: Props) {
  const { currentUser, userProfile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl font-semibold">
        Loading Jamii App...
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  const role = userProfile?.role || "citizen";

  if (!allowedRoles.includes(role)) {
    return <Navigate to={getDashboardPath(role)} replace />;
  }

  return children;
}