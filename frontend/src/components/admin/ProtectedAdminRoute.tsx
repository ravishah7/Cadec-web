// frontend/src/components/admin/ProtectedAdminRoute.tsx

import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

/**
 * Gate for all /admin/* routes.
 *
 * isLoading  → full-screen spinner (prevents flash redirect on refresh)
 * !isAuthenticated → /
 * !user.isAdmin    → /
 * otherwise        → render child routes via <Outlet />
 */
const ProtectedAdminRoute = () => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated || !user?.isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedAdminRoute;