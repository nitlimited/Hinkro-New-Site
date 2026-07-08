import React from "react";
import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";
import { AuthProvider } from "./auth/useAuth";
import { LoginPage } from "./auth/LoginPage";
import { RoleGate } from "./auth/RoleGate";
import { PortalShell } from "./layout/PortalShell";
import {
  AdminDashboard,
  ClientDashboard,
  ContentDashboard,
  WeaverDashboard,
} from "./features/dashboard/RoleDashboards";
import { CONTENT_ROLES, STAFF_ROLES } from "./types";
import "./portal.css";

const router = createBrowserRouter([
  { path: "/portal", element: <LoginPage /> },
  {
    path: "/portal/admin",
    element: (
      <RoleGate allow={STAFF_ROLES}>
        <PortalShell />
      </RoleGate>
    ),
    children: [
      { index: true, element: <AdminDashboard /> },
      { path: "*", element: <AdminDashboard /> },
    ],
  },
  {
    path: "/portal/content",
    element: (
      <RoleGate allow={CONTENT_ROLES}>
        <PortalShell />
      </RoleGate>
    ),
    children: [
      { index: true, element: <ContentDashboard /> },
      { path: "*", element: <ContentDashboard /> },
    ],
  },
  {
    path: "/portal/weaver",
    element: (
      <RoleGate allow={["weaver"]}>
        <PortalShell />
      </RoleGate>
    ),
    children: [
      { index: true, element: <WeaverDashboard /> },
      { path: "*", element: <WeaverDashboard /> },
    ],
  },
  {
    path: "/portal/client",
    element: (
      <RoleGate allow={["client"]}>
        <PortalShell />
      </RoleGate>
    ),
    children: [
      { index: true, element: <ClientDashboard /> },
      { path: "*", element: <ClientDashboard /> },
    ],
  },
  { path: "*", element: <Navigate to="/portal" replace /> },
]);

export default function PortalApp() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}
