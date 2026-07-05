import { Navigate } from "react-router-dom";

type Props = {
  children: JSX.Element;
};

export default function ProtectedRoute({ children }: Props) {
  const isAuthenticated = true;

  return isAuthenticated ? children : <Navigate to="/login" replace />;
}