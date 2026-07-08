import React, { useMemo, useState } from "react";
import { Check, ChevronDown, Sparkles, X } from "lucide-react";
import {
  analyzeSeo,
  buildSchema,
  type SchemaType,
  type SeoCheck,
  type SeoGroup,
  type SeoInput,
} from "../lib/seo";
import { Field } from "./ui";

const GROUP_LABELS: Record<SeoGroup, string> = {
  basic: "Basic SEO",
  additional: "Additional",
  title_readability: "Title readability",
  content_readability: "Content readability",
};

const GROUP_ORDER: SeoGroup[] = [
  "basic",
  "additional",
  "title_readability",
  "content_readability",
];

export function seoScoreColor(score: number): string {
  return score >= 81 ? "#2e7d4f" : score >= 51 ? "#cd8c23" : "#b3372c";
}

/** Small colored score chip for list rows. */
export function SeoScoreChip({ score }: { score: number }) {
  return (
    <span
      className="portal-seo-chip"
      style={{ borderColor: seoScoreColor(score), color: seoScoreColor(score) }}
      title="SEO score"
    >
      {score}/100
    </span>
  );
}

function ScoreGauge({ score }: { score: number }) {
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const color = seoScoreColor(score);
  return (
    <div className="portal-seo-gauge" role="img" aria-label={`SEO score ${score} out of 100`}>
      <svg viewBox="0 0 84 84" width="84" height="84">
        <circle cx="42" cy="42" r={radius} fill="none" stroke="#efe9dd" strokeWidth="7" />
        <circle
          cx="42"
          cy="42"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - score / 100)}
          transform="rotate(-90 42 42)"
        />
        <text x="42" y="40" textAnchor="middle" fontSize="19" fontWeight="800" fill={color}>
          {score}
        </text>
        <text x="42" y="55" textAnchor="middle" fontSize="9" fill="#70695f">
          / 100
        </text>
      </svg>
      <span className="portal-seo-rating" style={{ color }}>
        {score >= 81 ? "Great" : score >= 51 ? "Needs work" : "Poor"}
      </span>
    </div>
  );
}

function CheckRow({ check }: { check: SeoCheck }) {
  return (
    <li className={`portal-seo-check is-${check.status}`}>
      {check.status === "pass" ? (
        <Check size={14} />
      ) : check.status === "hint" ? (
        <Sparkles size={14} />
      ) : (
        <X size={14} />
      )}
      <span>{check.message}</span>
    </li>
  );
}

export function SeoPanel({
  focusKeyword,
  onFocusKeywordChange,
  schemaType,
  onSchemaTypeChange,
  input,
  schemaFields,
}: {
  focusKeyword: string;
  onFocusKeywordChange: (kw: string) => void;
  schemaType: SchemaType;
  onSchemaTypeChange: (t: SchemaType) => void;
  input: Omit<SeoInput, "focusKeyword">;
  schemaFields: Parameters<typeof buildSchema>[1];
}) {
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    basic: true,
  });
  const [showSchema, setShowSchema] = useState(false);

  const analysis = useMemo(
    () => analyzeSeo({ ...input, focusKeyword }),
    [input, focusKeyword],
  );
  const schema = useMemo(
    () => buildSchema(schemaType, schemaFields),
    [schemaType, schemaFields],
  );

  const displayTitle = input.seoTitle || schemaFields.name || "SEO title preview";
  const displayDesc =
    input.seoDescription ||
    "Add an SEO meta description to control how this page appears in search results.";

  return (
    <section className="portal-editor-panel portal-seo-panel">
      <div className="portal-editor-panel-head">
        <h3>SEO analysis</h3>
      </div>

      <div className="portal-seo-top">
        <ScoreGauge score={analysis.score} />
        <div className="portal-seo-fields">
          <Field
            label="Focus keyword"
            hint="The search phrase you want this page to rank for."
          >
            <input
              value={focusKeyword}
              onChange={(e) => onFocusKeywordChange(e.target.value)}
              placeholder="e.g. ombre kente"
            />
          </Field>
          <Field label="Schema (structured data)">
            <select
              value={schemaType}
              onChange={(e) => onSchemaTypeChange(e.target.value as SchemaType)}
            >
              <option value="Product">Product</option>
              <option value="Article">Article</option>
              <option value="BlogPosting">BlogPosting</option>
              <option value="None">None</option>
            </select>
          </Field>
        </div>
      </div>

      <div className="portal-seo-serp">
        <span className="portal-seo-serp-url">
          www.hinkrokente.com{input.urlPath}
        </span>
        <span className="portal-seo-serp-title">{displayTitle}</span>
        <span className="portal-seo-serp-desc">{displayDesc}</span>
      </div>

      {!focusKeyword.trim() && (
        <p className="portal-seo-empty">
          Set a focus keyword to unlock the full checklist and score.
        </p>
      )}

      {focusKeyword.trim() &&
        GROUP_ORDER.map((group) => {
          const checks = analysis.checks.filter((c) => c.group === group);
          const failed = checks.filter((c) => c.status === "fail").length;
          const open = openGroups[group] ?? false;
          return (
            <div className="portal-seo-group" key={group}>
              <button
                type="button"
                className="portal-seo-group-head"
                aria-expanded={open}
                onClick={() =>
                  setOpenGroups((g) => ({ ...g, [group]: !open }))
                }
              >
                <ChevronDown
                  size={15}
                  style={{ transform: open ? "none" : "rotate(-90deg)" }}
                />
                {GROUP_LABELS[group]}
                <span
                  className={`portal-seo-group-count ${failed ? "has-errors" : "all-good"}`}
                >
                  {failed ? `${failed} error${failed > 1 ? "s" : ""}` : "All good"}
                </span>
              </button>
              {open && (
                <ul className="portal-seo-checklist">
                  {checks.map((c) => (
                    <CheckRow key={c.id} check={c} />
                  ))}
                </ul>
              )}
            </div>
          );
        })}

      {schema && (
        <div className="portal-seo-group">
          <button
            type="button"
            className="portal-seo-group-head"
            aria-expanded={showSchema}
            onClick={() => setShowSchema(!showSchema)}
          >
            <ChevronDown
              size={15}
              style={{ transform: showSchema ? "none" : "rotate(-90deg)" }}
            />
            Schema preview
            <span className="portal-seo-group-count all-good">{schemaType}</span>
          </button>
          {showSchema && (
            <pre className="portal-seo-schema">
              {JSON.stringify(schema, null, 2)}
            </pre>
          )}
        </div>
      )}
    </section>
  );
}
