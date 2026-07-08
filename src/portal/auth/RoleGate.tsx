import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./useAuth";
import { ROLE_HOME, type UserRole } from "../types";

/**
 * Route guard. Renders children only when the signed-in user's role is in
 * `allow`; otherwise redirects to login or to the user's own dashboard.
 * This is UX-level protection — real enforcement is Postgres RLS.
 */
export function RoleGate({
  allow,
  children,
}: {
  allow: UserRole[];
  children: React.ReactNode;
}) {
  const { session, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="portal-loading">Loading…</div>;
  }

  if (!session || !profile) {
    return <Navigate to="/portal" replace state={{ from: location }} />;
  }

  if (profile.status === "suspended") {
    return (
      <div className="portal-loading">
        This account has been suspended. Contact Hinkro Kente for help.
      </div>
    );
  }

  if (!allow.includes(profile.role)) {
    return <Navigate to={ROLE_HOME[profile.role]} replace />;
  }

  return <>{children}</>;
}
