# Hinkro Web Platform Extension — Architecture & Roadmap

Status: **Proposed — awaiting approval before Phase 1 implementation.**
Date: 2026-07-08

---

## 1. Current Architecture (as analyzed)

The existing site is a **static, client-rendered React SPA** built with Vite:

| Piece | Details |
|---|---|
| Build tool | Vite (`vite.config.js`, `base: "./"` → host-agnostic static output) |
| UI | React 19 + `lucide-react` icons, plain JSX (no TypeScript) |
| App code | `src/main.jsx` — **one 2,311-line file** containing all pages: Home/Hero, Inspiring Tradition, Design, Bespoke, Accessories, Graduation Stole, Store, Product Detail, Footer, Reviews/FAQ |
| Routing | **Hand-rolled** — `getCurrentPage()` reads `location.pathname` + `location.hash` (`#store`, `#design`, `/product/:slug/`, etc.); listens to `hashchange`/`popstate`. No router library. |
| Data | `src/storeProducts.js` — 6,306 lines of static product data exported from WooCommerce (67 products with prices, images, variations, SEO, `isAccessory` flag). File header: *"Admin panel can replace this data source later."* |
| Styling | `src/styles.css` — 5,776 lines of hand-written CSS. Brand tokens in `:root`: `--gold #cd8c23`, `--gold-bright #f0a01f`, `--navy #0c2141`, `--ink #121212`, `--bone #f6f1e8`, `--muted #70695f`. Fonts: Cinzel, Cormorant Garamond, Overpass. |
| SEO | Strong: JSON-LD, OG/Twitter meta, per-page `usePageSeo()` hook, keyword-rich alt text |
| Ordering | WhatsApp deep links (`wa.me/233209707235`) — no cart, no checkout, no backend |
| Backend | **None.** No server, no database, no auth. `.env.example` only has Google Maps keys. |
| Deploy | Dockerfile runs the Vite dev server (dev convenience); production is `vite build` → static files |
| Assets | `public/` is ~113 MB of images/video committed to git |

**Key implication:** there is no server to extend. The platform needs a backend, and the cleanest way to add one *without touching the current site's architecture or hosting model* is a Backend-as-a-Service that the browser talks to directly.

---

## 2. Recommended Improvements (independent of the platform)

1. **Split `main.jsx`** into `src/site/` modules (Header, Footer, one file per page). Pure mechanical refactor, zero behavior change — makes the codebase maintainable before it doubles in size.
2. **Introduce TypeScript incrementally** — Vite supports mixed `.jsx`/`.tsx`. All *new* platform code in TS; existing site files stay as-is until touched.
3. **Adopt React Router** for the portal only; keep the public site's existing URL scheme byte-for-byte identical (SEO is working — don't disturb it).
4. **Move heavy media out of git eventually** (113 MB and growing). Product/progress images belong in object storage + CDN. Not urgent, but the media library (Phase 3) is the natural moment.
5. **Pin dependency versions** — `"latest"` for react/vite is a time bomb; lock to the versions in `package-lock.json`.
6. **Add a proper production Dockerfile** (build → nginx serve) — current one ships the dev server.

---

## 3. Recommended Technology Stack

**Keep:** Vite + React (public site untouched). **Add:**

| Layer | Choice | Why |
|---|---|---|
| Language | **TypeScript** (new code only) | Brief requirement; safety for a data-heavy app |
| Routing | **React Router v7** (portal bundle only) | Protected routes, nested layouts, lazy loading |
| Styling | **Hand-written CSS with the existing brand tokens**, scoped under `.portal` — *not* Tailwind | Tailwind's preflight reset would fight 5,776 lines of existing CSS; the site already has a consistent token system. Dashboards get their own `portal.css` design system built on the same variables. |
| Backend | **Supabase** (Auth + Postgres + RLS + Storage + Realtime + Edge Functions) | The decisive fit: works entirely from the browser (no server to host), Postgres relational model matches the domain, **Row-Level Security = RBAC enforced at the database**, Realtime powers the client↔weaver live sync, Storage handles progress photos/videos, Edge Functions cover invites/push/scheduled posts. Free tier covers launch. |
| Database | **PostgreSQL** (via Supabase) | Brief requirement |
| PWA | **vite-plugin-pwa** | Home-screen install, offline shell, Web Push notifications |
| Forms/validation | **react-hook-form + zod** | Lightweight, typed validation shared between forms and API payloads |

**Why not Next.js:** it would force a full migration of the working site, a hosting change, and a server to operate — all explicitly against "build on top of what exists." The public site's SEO is already handled statically; the authenticated portal doesn't need SSR. Next.js remains an option later if the *public* site ever needs server rendering.

**Why not Firebase:** NoSQL fits this relational domain (projects ↔ stages ↔ updates ↔ logs ↔ media) poorly, and security rules are weaker than Postgres RLS for role matrices.

---

## 4. Database Schema

Roles enum: `super_admin | admin | editor | content_manager | weaver | client`

```
profiles              id (=auth.users.id), full_name, email, phone, role, status(active|suspended),
                      avatar_url, created_at
clients               id, profile_id → profiles (null until first login), name, email, phone,
                      country, notes, created_by, created_at

workflow_stages       id, name, position, is_active, created_at        -- seeded with the 12 default stages, admin-editable

projects              id, reference (unique, e.g. HK-2026-0041), title, client_id → clients,
                      weaver_id → profiles, product_id → products (nullable),
                      pattern, measurements jsonb, thread_colors text[], accessories jsonb,
                      quantity, priority(low|normal|high|urgent),
                      current_stage_id → workflow_stages, progress_pct (0-100),
                      est_start date, est_completion date, actual_completion date,
                      design_notes, delivery_status(pending|in_transit|delivered),
                      payment_status(unpaid|partial|paid),           -- future-ready
                      is_paused bool, created_by, created_at, updated_at

project_updates       id, project_id, author_id, type(status_change|progress|note|media|milestone|
                      pause|resume|completed|question|reply), stage_id, progress_pct, body,
                      new_est_completion, parent_update_id (threading for Q&A), created_at
work_logs             id, project_id, weaver_id, log_date, hours_worked, progress_made,
                      materials_used, challenges, notes, created_at
project_media         id, project_id, update_id?, work_log_id?, storage_path, kind(image|video|doc),
                      caption, uploaded_by, created_at

notifications         id, user_id, type, title, body, data jsonb (project_id etc.), read_at, created_at
push_subscriptions    id, user_id, endpoint, keys jsonb, created_at
messages              id, project_id?, sender_id, recipient_id? (null = broadcast scope),
                      audience(user|clients|weavers|all), body, read_at, created_at

products              migrated from storeProducts.js: id, slug, name, type, categories,
                      colors, is_accessory, is_featured, stock_text, prices jsonb,
                      short_description, description, seo jsonb, status(draft|published), sort
product_images        id, product_id, storage_path/src, alt, position
product_variations    id, product_id, attributes jsonb, prices jsonb
categories            id, name, slug, kind(product|accessory|blog), position

blog_posts            id, slug, title, excerpt, content, featured_image, status(draft|scheduled|published),
                      publish_at, seo jsonb, author_id, created_at, updated_at
media_library         id, storage_path, kind, title, alt, folder, size_bytes, uploaded_by, created_at

audit_logs            id, actor_id, action, entity_type, entity_id, diff jsonb, created_at
project_invites       id, project_id, client_id, email, token_hash, expires_at, accepted_at
```

### RLS / RBAC matrix (enforced in the database, not just the UI)

| Table | client | weaver | editor/content_mgr | admin | super_admin |
|---|---|---|---|---|---|
| projects | read own (via client_id → profile) | read/update assigned | — | full | full |
| project_updates / media / work_logs | read own project; insert `question` | full on assigned projects | — | full | full |
| products / accessories / blog / media_library / categories | read published | read published | **full** | full | full |
| clients / profiles (user mgmt) | own row | own row | own row | full (except role escalation) | full |
| workflow_stages | read | read | — | full | full |
| notifications / push_subscriptions | own | own | own | own + send | full |
| audit_logs | — | — | — | read | full |

Every mutating admin action also inserts an `audit_logs` row (Postgres trigger).

---

## 5. Application Architecture

```
Browser
├── Public site (existing bundle — unchanged, no Supabase code loaded)
│     hinkrokente.com/  #store  #design  /product/:slug/ ...
│
└── /portal (lazy-loaded chunk, only fetched when visited)
      Login (one page for all roles)
        └─ role-based redirect after auth
      ├── /portal/admin    – Admin/Super-admin dashboard (sidebar CMS)
      ├── /portal/content  – Editor / Content-manager dashboard
      ├── /portal/weaver   – Weaver dashboard
      └── /portal/client   – Client project dashboard
             │
             ▼ (supabase-js over HTTPS/WSS)
Supabase
├── Auth      – email+password (staff), email OTP / magic link (clients), RBAC via profiles.role
├── Postgres  – schema above, RLS policies per role
├── Realtime  – postgres_changes subscriptions → live dashboard sync
├── Storage   – buckets: project-media, products, media-library (policy-guarded)
└── Edge Functions – invite-client, send-push (Web Push), publish-scheduled-posts (cron)
```

**Entry point wiring** (the only change to existing code): `src/main.jsx` checks for the portal path and lazy-loads the portal app; otherwise renders the existing `<App/>` exactly as today. Public visitors download zero portal code.

### Authentication design

- **One login screen** (`/portal`), Hinkro-branded.
- **Staff (super_admin/admin/editor/content_manager/weaver):** email + password, optional TOTP later.
- **Clients — recommended: secure invitation link + email OTP.** Admin creates the project → system emails the client a one-time invitation link → the link establishes their account → thereafter they log in with email + 6-digit OTP (passwordless). Rationale: project codes alone are guessable/shareable and can't be revoked per-person; passwords are friction clients forget. OTP ties access to inbox ownership, is revocable, and Supabase supports it natively. A read-only *project reference* can still be displayed for support conversations, but it is never a credential.
- After login, `profiles.role` drives redirect; every route is wrapped in a `RoleGate`; every query is *additionally* enforced by RLS, so even a tampered client cannot read foreign data.

### Client ↔ Weaver ↔ Admin synchronization (the core loop)

1. Admin creates project (wizard: client → weaver → product → threads/pattern/accessories → dates → auto-generated `HK-YYYY-NNNN` reference) → invite email fires → weaver's dashboard shows it instantly (Realtime).
2. Weaver posts an update (progress %, stage change, photos, work log) → single insert into `project_updates` (+ storage upload).
3. A Postgres trigger fans out `notifications` rows to the client and admins; the `send-push` edge function delivers Web Push to subscribed browsers.
4. Client's dashboard, subscribed via Realtime, re-renders the timeline immediately; client can reply with a question, which notifies the weaver and admins the same way.
5. Admin sees everything, everywhere, live.

One write path, one notification fan-out, three role-filtered views of the same tables.

---

## 6. Folder Structure

```
/
├── index.html                    (unchanged)
├── src/
│   ├── main.jsx                  (existing site; gains only the lazy /portal mount)
│   ├── storeProducts.js          (kept as-is until Phase 3 migrates it to the DB)
│   ├── styles.css                (unchanged)
│   └── portal/
│       ├── index.tsx             (portal entry: router + providers)
│       ├── portal.css            (dashboard design system on existing brand tokens)
│       ├── lib/                  (supabaseClient.ts, permissions.ts, notify.ts, format.ts)
│       ├── types/                (database.types.ts — generated from schema)
│       ├── auth/                 (LoginPage, AcceptInvite, useAuth, RoleGate)
│       ├── layout/               (PortalShell, Sidebar, Topbar, MobileNav)
│       ├── components/           (Button, Card, Table, Modal, StatusBadge, ProgressBar,
│       │                          Timeline, FileUpload, EmptyState…)
│       └── features/
│           ├── dashboard/        (role-specific home screens + stats)
│           ├── projects/         (list, detail, create wizard, timeline, stage editor)
│           ├── worklogs/
│           ├── updates/          (progress updates, Q&A threads)
│           ├── users/            (user management, roles, suspension)
│           ├── clients/
│           ├── products/         (products + accessories CRUD)
│           ├── blog/
│           ├── media/            (media library)
│           ├── messages/
│           ├── notifications/
│           └── settings/         (workflow stages, business profile)
├── supabase/
│   ├── migrations/               (versioned SQL: schema, RLS, triggers, seeds)
│   └── functions/                (invite-client, send-push, publish-scheduled-posts)
└── docs/
    └── ARCHITECTURE.md           (this file)
```

---

## 7. Phased Roadmap

**Phase 0 — Foundations** *(no visible change to the site)*
TS + React Router + vite-plugin-pwa configured; Supabase project; full schema + RLS + seed migrations; portal shell with branded login, role redirect, protected routes; deploy pipeline decision. ✅ *Exit: all six roles can log in and land on an empty, correctly-gated dashboard; public site byte-identical.*

**Phase 1 — Core project loop** *(the product)*
Admin: client/weaver creation, project creation wizard, reference generation, client invite. Weaver: assigned-projects dashboard, stage/progress updates, photo/video upload, pause/resume/complete, work logs. Client: project dashboard with live timeline, media gallery, details, update history. Realtime sync + in-app notifications. Audit logging. ✅ *Exit: the full Admin → Weaver → Client flow works end-to-end on phone and desktop.*

**Phase 2 — Communication & PWA**
Q&A threads on updates; admin messaging (individual/group/broadcast); Web Push via edge function; notification preferences; home-screen install experience (manifest, icons, offline shell); deadline-approaching reminders. 

**Phase 3 — Content management**
Products & accessories CRUD migrated from `storeProducts.js` to the DB (public store reads DB with static fallback — zero downtime); categories; blog with scheduling + SEO fields; media library; editor/content-manager role surfaces.

**Phase 4 — Management polish**
Business stats dashboard (active/completed/delayed, totals); reports (per-project, per-weaver, date-range exports); user management polish (suspension flows, audit log viewer); configurable workflow stages UI.

**Phase 5+ — Future modules** *(schema already accommodates)*
Payments (`payment_status` + Paystack — logo already in the repo), inventory/materials, CRM, analytics, order management, ERP.

---

## 8. Risks & Open Questions

1. **Hosting/deployment target is unknown.** `base: "./"` suggests static hosting. The portal uses path-based URLs (`/portal/...`), which needs an SPA rewrite rule (trivial on Vercel/Netlify/Cloudflare; one `.htaccess` line on cPanel). If the host can't do rewrites, the portal falls back to hash routing (`/#/portal/...`) with no other changes.
2. **The live hinkrokente.com is still WordPress/WooCommerce** (product `sourceUrl`s point there). Cut-over plan for the new site needs confirming.
3. **Email delivery** for OTP/invites: Supabase's built-in email works for launch; a custom SMTP (e.g. Resend) is recommended before real client traffic.
4. **Web Push on iOS** requires the site to be installed to the Home Screen (iOS 16.4+) — in-app notifications always work regardless.
5. **113 MB of media in git** — fine today, moves to Storage/CDN in Phase 3.
