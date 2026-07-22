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
import { WeaversPage } from "./features/weavers/WeaversPage";
import { WeaverProfilePage } from "./features/weavers/WeaverProfilePage";
import { NotificationsPage } from "./features/notifications/NotificationsPage";
import { MessagesPage } from "./features/messages/MessagesPage";
import { ComingSoon } from "./features/ComingSoon";
import { SettingsPage } from "./features/settings/SettingsPage";
import { ReportsPage } from "./features/reports/ReportsPage";
import {
  BlogPage,
  CategoriesPage,
  MediaLibraryPage,
  ProductsPage,
} from "./features/content/ContentManagementPages";
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
      { path: "projects/:projectId/edit", element: <ProjectCreatePage /> },
      { path: "projects/:projectId", element: <ProjectDetailPage /> },
      { path: "clients", element: <ClientsPage /> },
      { path: "weavers", element: <WeaversPage /> },
      { path: "weavers/:weaverId", element: <WeaverProfilePage base="admin" /> },
      { path: "users", element: <UsersPage /> },
      {
        path: "notifications",
        element: <NotificationsPage projectBase="/portal/admin/projects" />,
      },
      { path: "products", element: <ProductsPage /> },
      { path: "accessories", element: <ProductsPage accessories /> },
      { path: "blog", element: <BlogPage /> },
      { path: "media", element: <MediaLibraryPage /> },
      { path: "categories", element: <CategoriesPage /> },
      { path: "messages", element: <MessagesPage /> },
      { path: "settings", element: <SettingsPage /> },
      { path: "reports", element: <ReportsPage /> },
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
      { path: "products", element: <ProductsPage /> },
      { path: "accessories", element: <ProductsPage accessories /> },
      { path: "blog", element: <BlogPage /> },
      { path: "media", element: <MediaLibraryPage /> },
      { path: "categories", element: <CategoriesPage /> },
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
      { path: "profile", element: <WeaverProfilePage base="self" /> },
      {
        path: "notifications",
        element: <NotificationsPage projectBase="/portal/weaver/projects" />,
      },
      { path: "messages", element: <MessagesPage /> },
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
      { path: "messages", element: <MessagesPage /> },
      { path: "*", element: <Navigate to="/portal/client" replace /> },
    ],
  },
  { path: "*", element: <Navigate to="/portal" replace /> },
]);

// Register the service worker (push display + offline shell) in production.
if (import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {
      /* SW is progressive enhancement — the portal works without it */
    });
  });
}

export default function PortalApp() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}
