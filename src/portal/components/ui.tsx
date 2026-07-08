import React from "react";

export function ProgressBar({ value }: { value: number }) {
  return (
    <div
      className="portal-progress"
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div className="portal-progress-fill" style={{ width: `${value}%` }} />
      <span className="portal-progress-label">{value}%</span>
    </div>
  );
}

export function PriorityBadge({ level }: { level: string }) {
  return <span className={`portal-badge portal-badge-${level}`}>{level}</span>;
}

export function StagePill({ name }: { name?: string }) {
  if (!name) return null;
  return <span className="portal-stage">{name}</span>;
}

export function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="portal-field">
      <label>{label}</label>
      {children}
      {hint && <span className="portal-field-hint">{hint}</span>}
    </div>
  );
}

export function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="portal-modal-backdrop" onClick={onClose}>
      <div
        className="portal-modal"
        role="dialog"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="portal-modal-head">
          <h2>{title}</h2>
          <button type="button" aria-label="Close" onClick={onClose}>
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="portal-empty">
      <h3>{title}</h3>
      <p>{body}</p>
    </div>
  );
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}
