import React from "react";
import { useTeam } from "../../lib/data";
import { isSupabaseConfigured } from "../../lib/supabaseClient";
import { formatDate } from "../../components/ui";

const ROLE_LABEL: Record<string, string> = {
  super_admin: "Super Admin",
  admin: "Administrator",
  editor: "Editor",
  content_manager: "Content Manager",
  weaver: "Weaver",
  client: "Client",
};

export function UsersPage() {
  const { team } = useTeam();

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
          connected, new team members are invited by email from here (via the
          admin-create-user function), and only Super Admins can change roles.
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
            </tr>
          </thead>
          <tbody>
            {team.map((member) => (
              <tr key={member.id}>
                <td className="portal-td-strong">{member.full_name}</td>
                <td>{member.email}</td>
                <td>
                  <span className="portal-stage">
                    {ROLE_LABEL[member.role] ?? member.role}
                  </span>
                </td>
                <td>{member.status === "active" ? "Active" : "Suspended"}</td>
                <td>{formatDate(member.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
