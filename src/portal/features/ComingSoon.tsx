import React from "react";
import { EmptyState } from "../components/ui";

export function ComingSoon({ phase, what }: { phase: number; what: string }) {
  return (
    <section>
      <h1 className="portal-page-title">{what}</h1>
      <EmptyState
        title={`Coming in Phase ${phase}`}
        body="This area is planned and the database is already designed for it — it arrives in an upcoming phase of the rollout."
      />
    </section>
  );
}
