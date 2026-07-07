import { Navigate } from "react-router-dom";
import type { ReactElement } from "react";

import { useAuth } from "../auth/AuthContext";

type Props = {
  children: ReactElement;
};

export default function ProtectedRoute({
  children,
}: Props) {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl font-semibold">
        Loading...
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return children;
}