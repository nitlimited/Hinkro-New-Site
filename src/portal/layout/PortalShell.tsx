import React, { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import {
  Bell,
  FileText,
  FolderKanban,
  Image,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Package,
  Settings,
  ShoppingBag,
  Users,
  X,
} from "lucide-react";
import { useAuth } from "../auth/useAuth";
import type { UserRole } from "../types";

const logoUrl = "/images/hinkro-kente-bespoke-kente-weaving-services-logo.png";

interface NavEntry {
  to: string;
  label: string;
  icon: React.ReactNode;
  end?: boolean;
}

const NAV: Record<string, NavEntry[]> = {
  admin: [
    { to: "/portal/admin", label: "Dashboard", icon: <LayoutDashboard size={18} />, end: true },
    { to: "/portal/admin/projects", label: "Projects", icon: <FolderKanban size={18} /> },
    { to: "/portal/admin/clients", label: "Clients", icon: <Users size={18} /> },
    { to: "/portal/admin/users", label: "Users & roles", icon: <Users size={18} /> },
    { to: "/portal/admin/products", label: "Products", icon: <ShoppingBag size={18} /> },
    { to: "/portal/admin/blog", label: "Blog", icon: <FileText size={18} /> },
    { to: "/portal/admin/media", label: "Media library", icon: <Image size={18} /> },
    { to: "/portal/admin/messages", label: "Messages", icon: <MessageSquare size={18} /> },
    { to: "/portal/admin/settings", label: "Settings", icon: <Settings size={18} /> },
  ],
  content: [
    { to: "/portal/content", label: "Dashboard", icon: <LayoutDashboard size={18} />, end: true },
    { to: "/portal/content/products", label: "Products", icon: <ShoppingBag size={18} /> },
    { to: "/portal/content/blog", label: "Blog", icon: <FileText size={18} /> },
    { to: "/portal/content/media", label: "Media library", icon: <Image size={18} /> },
  ],
  weaver: [
    { to: "/portal/weaver", label: "My projects", icon: <FolderKanban size={18} />, end: true },
    { to: "/portal/weaver/notifications", label: "Notifications", icon: <Bell size={18} /> },
  ],
  client: [
    { to: "/portal/client", label: "My projects", icon: <Package size={18} />, end: true },
    { to: "/portal/client/notifications", label: "Notifications", icon: <Bell size={18} /> },
  ],
};

function sectionForRole(role: UserRole): keyof typeof NAV {
  if (role === "super_admin" || role === "admin") return "admin";
  if (role === "editor" || role === "content_manager") return "content";
  return role;
}

const ROLE_LABEL: Record<UserRole, string> = {
  super_admin: "Super Admin",
  admin: "Administrator",
  editor: "Editor",
  content_manager: "Content Manager",
  weaver: "Weaver",
  client: "Client",
};

export function PortalShell() {
  const { profile, signOut, isDemo } = useAuth();
  const [navOpen, setNavOpen] = useState(false);

  if (!profile) return null;
  const entries = NAV[sectionForRole(profile.role)];

  return (
    <div className="portal-shell">
      <aside className={`portal-sidebar ${navOpen ? "is-open" : ""}`}>
        <div className="portal-sidebar-brand">
          <img src={logoUrl} alt="Hinkro Kente" />
          <button
            className="portal-nav-close"
            type="button"
            aria-label="Close menu"
            onClick={() => setNavOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <nav aria-label="Portal navigation">
          {entries.map((entry) => (
            <NavLink
              key={entry.to}
              to={entry.to}
              end={entry.end}
              onClick={() => setNavOpen(false)}
              className={({ isActive }) => (isActive ? "is-active" : "")}
            >
              {entry.icon}
              <span>{entry.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="portal-sidebar-footer">
          <div className="portal-user">
            <span className="portal-user-name">
              {profile.full_name || profile.email}
            </span>
            <span className="portal-user-role">{ROLE_LABEL[profile.role]}</span>
          </div>
          <button
            className="portal-signout"
            type="button"
            onClick={() => void signOut()}
          >
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </aside>

      <div className="portal-main">
        <header className="portal-topbar">
          <button
            className="portal-nav-toggle"
            type="button"
            aria-label="Open menu"
            onClick={() => setNavOpen(true)}
          >
            <Menu size={22} />
          </button>
          <span className="portal-topbar-title">Hinkro Kente Studio</span>
          {isDemo && (
            <span className="portal-demo-badge">
              Preview mode — sample data
            </span>
          )}
        </header>
        <div className="portal-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
