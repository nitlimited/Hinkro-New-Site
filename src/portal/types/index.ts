export type UserRole =
  | "super_admin"
  | "admin"
  | "editor"
  | "content_manager"
  | "weaver"
  | "client";

export type UserStatus = "active" | "suspended";

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  role: UserRole;
  status: UserStatus;
  avatar_url: string | null;
  created_at: string;
}

/** Where each role lands after login. */
export const ROLE_HOME: Record<UserRole, string> = {
  super_admin: "/portal/admin",
  admin: "/portal/admin",
  editor: "/portal/content",
  content_manager: "/portal/content",
  weaver: "/portal/weaver",
  client: "/portal/client",
};

export const STAFF_ROLES: UserRole[] = ["super_admin", "admin"];
export const CONTENT_ROLES: UserRole[] = [
  "super_admin",
  "admin",
  "editor",
  "content_manager",
];
