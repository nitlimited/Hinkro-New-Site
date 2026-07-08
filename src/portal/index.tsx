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
import { ProjectsListPage } from "./features/projects/ProjectsListPage";
import { ProjectCreatePage } from "./features/projects/ProjectCreatePage";
import { ProjectDetailPage } from "./features/projects/ProjectDetailPage";
import { ClientsPage } from "./features/clients/ClientsPage";
import { UsersPage } from "./features/users/UsersPage";
import { NotificationsPage } from "./features/notifications/NotificationsPage";
import { ComingSoon } from "./features/ComingSoon";
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
      { path: "projects", element: <ProjectsListPage /> },
      { path: "projects/new", element: <ProjectCreatePage /> },
      { path: "projects/:projectId", element: <ProjectDetailPage /> },
      { path: "clients", element: <ClientsPage /> },
      { path: "users", element: <UsersPage /> },
      {
        path: "notifications",
        element: <NotificationsPage projectBase="/portal/admin/projects" />,
      },
      { path: "products", element: <ComingSoon phase={3} what="Products" /> },
      { path: "blog", element: <ComingSoon phase={3} what="Blog" /> },
      { path: "media", element: <ComingSoon phase={3} what="Media library" /> },
      { path: "messages", element: <ComingSoon phase={2} what="Messages" /> },
      { path: "settings", element: <ComingSoon phase={4} what="Settings" /> },
      { path: "*", element: <Navigate to="/portal/admin" replace /> },
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
      { path: "products", element: <ComingSoon phase={3} what="Products" /> },
      { path: "blog", element: <ComingSoon phase={3} what="Blog" /> },
      { path: "media", element: <ComingSoon phase={3} what="Media library" /> },
      { path: "*", element: <Navigate to="/portal/content" replace /> },
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
      { path: "projects/:projectId", element: <ProjectDetailPage /> },
      {
        path: "notifications",
        element: <NotificationsPage projectBase="/portal/weaver/projects" />,
      },
      { path: "*", element: <Navigate to="/portal/weaver" replace /> },
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
      { path: "projects/:projectId", element: <ProjectDetailPage /> },
      {
        path: "notifications",
        element: <NotificationsPage projectBase="/portal/client/projects" />,
      },
      { path: "*", element: <Navigate to="/portal/client" replace /> },
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
