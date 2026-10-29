import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <div className="py-32 text-center text-muted-foreground">Loading…</div>;
  if (user) return <Outlet />;
  const redirect = encodeURIComponent(location.pathname + location.search);
  return <Navigate to={`/auth?redirect=${redirect}`} replace />;
}
