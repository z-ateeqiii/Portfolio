# 06 — Technical Architecture

## 0. Purpose

`02` defined the pages. `04` defined the data. `05` defined the admin tool. This document decides how it's actually built — framework choices, rendering strategy, Firebase architecture, and routing — so `08-implementation-plan.md` can turn this into an actual build sequence.

Per brief §25: technology choice follows design and content requirements, not the other way around. Every decision below traces back to something already established in `00`–`05`.

---

## 1. Stack Summary

| Layer | Choice | Why |
|---|---|---|
| Framework | Angular 21 (latest stable, standalone components) | Already Muhammed's strongest stack (per `04` §5); matches the "Expanding Toward" list in the brief without forcing a new framework onto a personal-brand project. Pinned to "latest stable at build time" rather than a fixed number, so this doesn't go stale between planning and implementation |
| Animation | GSAP | Framework-agnostic, so it works identically in Angular; directly fulfills the motion philosophy already set in `00` §25 and `01` §21 (subtle scroll reveals, restrained micro-interactions, respects `prefers-reduced-motion`) |
| Styling | Tailwind CSS | Matches existing skill set; supports the restrained visual direction from brief §23–24 without a heavy custom CSS framework |
| Data viz (where needed) | D3.js / Chart.js | Already used on real projects (Cyber50, Scholarship Dashboard) — proven, not speculative |
| Backend | Firebase (Firestore + Storage + Auth + Hosting) | Same serverless pattern Muhammed already used successfully on the Scholarship Dashboard at similar or smaller data scale — no new infrastructure paradigm to learn mid-project |
| State | Angular Signals + RxJS where async streams are genuinely needed | Consistent with current skill level (`04` §5); avoids introducing NgRx or similar for a dataset this size |

This is a continuation of Muhammed's existing stack, not a stack chosen for the portfolio in isolation — which matters, since the site is itself proof of his technical judgment (brief §10).

---

## 2. Rendering Strategy

**Decision: Angular SSR with prerendering for public routes.**

Reasoning, tied directly back to earlier documents:

- Brief §29 makes discoverability a first-class requirement — becoming the top search result for "Muhammed Al-Ateeqi." A pure client-side SPA is a real handicap here: crawlers and link-preview bots (LinkedIn, Facebook shares) need real HTML on first response, not a JS-rendered shell.
- Content is dashboard-driven (Firestore), so full static generation at build time isn't quite right either — new projects or bio edits published through the dashboard need to appear without a full rebuild/redeploy cycle.
- The middle path: SSR (or prerendering with periodic regeneration) for public routes — Home, Work, each case study, About, Beyond Code, Contact — so every page returns real content in its initial HTML.

**The dashboard itself does not need SSR** — it's authenticated, never crawled, never shared as a link. It can be a standard client-rendered Angular route (see §5).

---

## 3. Firebase Architecture

### 3.1 Firestore Collections

Maps directly onto `04-content-model.md`, one collection per entity:

```
/profile/{singleton}
/projects/{slug}
/projects/{slug}/media/{mediaId}
/experience/{id}
/skills/{id}
/socialPlatforms/{platform}
/socialVideos/{id}
/businessVentures/{id}
/education/{id}
/proofPoints/{id}
```

Notes:

- `media` as a subcollection under `projects` (rather than a flat top-level collection) mirrors the mental model Muhammed already uses locally — one folder per project — and keeps queries scoped naturally (per `04` §6).
- Every document that supports Draft/Preview/Publish (`04` §12) carries `status`, `updatedAt`, `publishedAt`. Public-facing queries always filter `status == 'published'` — draft content is structurally excluded from what the public site can ever fetch, not just hidden by the UI (this satisfies the security requirement in `05` §6: unpublished must actually mean unpublished).

### 3.2 Storage

- `/resume/` — current resume file, referenced by `Profile.resumeFile`
- `/projects/{slug}/` — screenshots, images, video thumbnails, matching the per-project folder structure Muhammed already uses locally, so migrating existing assets is a near-direct copy

### 3.3 Auth

- Firebase Auth, single admin account (email/password or Google sign-in — either is sufficient for a one-person system per `05` §1)
- No public-facing auth flows anywhere on the site — confirmed non-goal per `05` §5

### 3.4 Hosting

- Firebase Hosting (or a platform with equivalent SSR support) — keeps the whole stack under one provider, one deploy pipeline, one thing to maintain long-term, which matters for a project meant to stay maintainable for years (brief §37, point 10)

---

## 4. Routing

Directly implements the sitemap from `02-information-architecture.md` §2:

```
/                          → Home
/work                      → Work index
/work/:slug                → Case Study (dynamic, Firestore-backed)
/about                     → Story
/beyond                    → Beyond Code hub
/beyond/social              → Social Media World
/beyond/business             → Business
/beyond/teaching             → Teaching
/contact                   → Contact
/resume                    → Redirects to the current Storage file (not a rendered page)

/admin/**                  → Dashboard, auth-guarded, client-rendered only
```

- Lazy loading per top-level route (already a named practice in Muhammed's skill set, per `04` §5) — keeps initial bundle small, which also helps the performance/SEO goals in §2.
- `/admin/**` sits behind an `authGuard` and is explicitly excluded from the sitemap and from SSR prerendering — it should never be crawlable or linkable (per `05` §6).

---

## 5. Dashboard: Same App, Protected Route — Not a Separate App

Decision, with reasoning:

- A separate app would mean two codebases, two deploy pipelines, and duplicated Firebase config — real ongoing maintenance cost for a solo-maintained project.
- Since the dashboard doesn't need SSR (§2) and doesn't need to share the public site's art direction (`05` §7), it can live as a lazily-loaded, auth-guarded route group within the same Angular application without compromising either side.
- This also means dashboard and public site share the same TypeScript models generated from `04-content-model.md` — one source of truth for the shape of the data, not two definitions that can drift apart.

---

## 6. SEO Implementation

Directly implements brief §29:

- **Meta tags**: per-route, dynamically set from Firestore content (project name/tagline for case studies, bio summary for Home/About) via Angular's `Meta` and `Title` services
- **Structured data**: JSON-LD `Person` schema on Home/About (name, jobTitle, sameAs links to LinkedIn/GitHub/social), `CreativeWork` or `SoftwareApplication` schema on case studies where appropriate
- **Open Graph**: per-route OG tags, with project screenshots used as OG images on case study pages — makes shared links (recruiter forwarding a case study, per `02` §6) look intentional, not blank
- **Canonical URLs**: one canonical form per route, no duplicate-content ambiguity between trailing slashes etc.
- **Sitemap.xml**: generated server-side from the same Firestore data the routes render from, so it never drifts out of sync with what's actually published — new projects appear in the sitemap automatically once published, without a manual step
- **Robots.txt**: allow all public routes, explicitly disallow `/admin/**`

---

## 7. Performance Notes

- `OnPush` change detection as default (already a practice from the Cyber50 project, per `03` §6.1) — carries over project-wide, not just for chart-heavy views
- Image assets served appropriately sized/compressed — screenshots from case studies are the heaviest asset type on the site
- Firestore reads for public routes should be minimal per page load — fetch what a route needs, not entire collections, especially for the Work index and case study pages

---

## 8. Environments

Given the solo-maintainer scope (per `05` §1), a full dev/staging/prod split is unnecessary overhead. Two environments are enough:

- **Local/dev** — local Firebase emulators where practical, so dashboard changes can be tested without touching live data
- **Production** — single live Firebase project

---

## 9. What's Deferred

- Exact CI/deploy steps and sequencing → `08-implementation-plan.md`
- Visual/component implementation details → `07-design-system.md`
- Analytics tool selection (explicitly not part of the content model, per `04` §13) — a lightweight, privacy-respecting option can be decided independently of this architecture at any point without affecting anything above
