import React, { useState } from "react";
import { useAuth } from "../../auth/useAuth";
import { updateProfileFields, useTeam } from "../../lib/data";
import { isSupabaseConfigured } from "../../lib/supabaseClient";
import { formatDate } from "../../components/ui";
import type { UserRole } from "../../types";

const ROLE_LABEL: Record<string, string> = {
  super_admin: "Super Admin",
  admin: "Administrator",
  editor: "Editor",
  content_manager: "Content Manager",
  weaver: "Weaver",
  client: "Client",
};

const ASSIGNABLE_ROLES: UserRole[] = [
  "admin",
  "editor",
  "content_manager",
  "weaver",
];

export function UsersPage() {
  const { profile } = useAuth();
  const { team } = useTeam();
  const [busyId, setBusyId] = useState("");
  const isSuperAdmin = profile?.role === "super_admin";

  const toggleStatus = async (id: string, status: string) => {
    setBusyId(id);
    await updateProfileFields(id, {
      status: status === "active" ? "suspended" : "active",
    });
    setBusyId("");
  };

  const changeRole = async (id: string, role: UserRole) => {
    setBusyId(id);
    await updateProfileFields(id, { role });
    setBusyId("");
  };

  return (
    <section>
      <div className="portal-page-head">
        <div>
          <h1 className="portal-page-title">Users &amp; roles</h1>
          <p className="portal-page-sub">
            Team accounts for the studio. Clients are managed on the Clients
            page and invited automatically with their projects.
          </p>
        </div>
      </div>

      {!isSupabaseConfigured && (
        <div className="portal-alert" style={{ marginBottom: 16 }}>
          In preview mode this list is sample data. Once the backend is
          connected, new team members are invited by email (via the
          admin-create-user function). Role changes are restricted to Super
          Admins and enforced by the database.
        </div>
      )}

      <div className="portal-card portal-table-card">
        <table className="portal-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {team.map((member) => {
              const isSelf = member.id === profile?.id;
              return (
                <tr
                  key={member.id}
                  style={{ opacity: member.status === "active" ? 1 : 0.55 }}
                >
                  <td className="portal-td-strong">{member.full_name}</td>
                  <td>{member.email}</td>
                  <td>
                    {isSuperAdmin && !isSelf && member.role !== "super_admin" ? (
                      <select
                        className="portal-inline-input"
                        value={member.role}
                        disabled={busyId === member.id}
                        onChange={(e) =>
                          void changeRole(member.id, e.target.value as UserRole)
                        }
                      >
                        {ASSIGNABLE_ROLES.map((r) => (
                          <option key={r} value={r}>
                            {ROLE_LABEL[r]}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className="portal-stage">
                        {ROLE_LABEL[member.role] ?? member.role}
                      </span>
                    )}
                  </td>
                  <td>{member.status === "active" ? "Active" : "Suspended"}</td>
                  <td>{formatDate(member.created_at)}</td>
                  <td>
                    {!isSelf && member.role !== "super_admin" && (
                      <button
                        className="portal-btn-secondary"
                        type="button"
                        disabled={busyId === member.id}
                        onClick={() => void toggleStatus(member.id, member.status)}
                      >
                        {member.status === "active" ? "Suspend" : "Reactivate"}
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
