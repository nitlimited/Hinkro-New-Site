import React from "react";
import { useAuth } from "../../auth/useAuth";

/**
 * Phase 0 placeholder dashboards — prove the auth, routing, and role gates.
 * Phase 1 replaces the placeholder cards with live project data.
 */

function Placeholder({
  title,
  blurb,
  cards,
}: {
  title: string;
  blurb: string;
  cards: string[];
}) {
  const { profile } = useAuth();

  return (
    <section>
      <h1 className="portal-page-title">{title}</h1>
      <p className="portal-page-sub">
        Signed in as {profile?.full_name || profile?.email}. {blurb}
      </p>
      <div className="portal-card-grid">
        {cards.map((card) => (
          <article className="portal-card portal-card-empty" key={card}>
            <h3>{card}</h3>
            <p>Coming in Phase 1</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export function AdminDashboard() {
  return (
    <Placeholder
      title="Studio overview"
      blurb="Business statistics and project management will appear here."
      cards={[
        "Active projects",
        "Completed projects",
        "Delayed projects",
        "Total clients",
        "Total weavers",
        "Total products",
      ]}
    />
  );
}

export function ContentDashboard() {
  return (
    <Placeholder
      title="Content studio"
      blurb="Manage products, accessories, blog posts, and media."
      cards={["Products", "Accessories", "Blog posts", "Media library"]}
    />
  );
}

export function WeaverDashboard() {
  return (
    <Placeholder
      title="My weaving projects"
      blurb="Your assigned projects, deadlines, and progress updates will appear here."
      cards={["Assigned projects", "Due this week", "Work log"]}
    />
  );
}

export function ClientDashboard() {
  return (
    <Placeholder
      title="My Kente projects"
      blurb="Follow every step of your bespoke order — progress, photos, and updates."
      cards={["Current project", "Progress timeline", "Photo gallery"]}
    />
  );
}
