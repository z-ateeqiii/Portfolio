# 05 — Dashboard Requirements

## 0. Purpose

`04` defined the data. This document defines the tool Muhammed actually uses to manage it — the screens, the workflow, and the boundaries — so `06-technical-architecture.md` can decide how to build it.

The test for everything in this document, per Discovery: *"Two years from now, when I open the dashboard, what do I expect to be able to do?"*

---

## 1. Who Uses This

Single-user, single-admin. Muhammed is the only person who ever logs in.

This simplifies almost everything:

- No roles/permissions system beyond "authenticated or not."
- No multi-user conflict handling, no comment/review flows.
- Auth just needs to keep everyone else out — not manage a team.

If this ever changes (a collaborator, an assistant managing content), that's a future revision, not a v1 requirement.

---

## 2. Core Workflow: Draft → Preview → Publish

Confirmed directly in Discovery — Muhammed explicitly prefers this over a blunt Edit → Save → Live, since the dashboard is meant to be a long-term tool, not a quick patch mechanism.

1. **Draft** — any change (new project, edited bio, updated skill list) saves as a draft. The live site is unaffected.
2. **Preview** — Muhammed can view the draft as it will actually appear on the site before committing to it. This matters most for content-heavy entities (Project, Profile) where wording and structure need a real read-through, not just a form check.
3. **Publish** — an explicit action moves the draft state to live. Nothing goes public silently.

This maps directly onto the `status` / `updatedAt` / `publishedAt` fields defined in `04-content-model.md` §12 — every entity that can be edited needs this state machine, not just projects.

### Why this matters here specifically

A personal brand site is often edited in short, distracted bursts — updating one project between other things. Draft/Preview prevents a half-finished edit from going live by accident, which matters more here than on a typical CRUD admin panel because *this specific site's entire premise is credibility* (per brief §29, §37).

---

## 3. Dashboard Sections

One section per entity from `04-content-model.md`, plus a home/overview screen.

### 3.1 Overview (landing screen)
- At-a-glance: what's in draft, what's live, last-updated timestamps
- Quick links into each section
- Not a page anyone else ever sees — purely operational

### 3.2 Profile
- Single-record edit form: hero statement, positioning, bio (short + long), resume file upload, contact links
- Resume upload should replace the file in place — no separate "resume versions" list needed for v1

### 3.3 Projects
- List view, manually reorderable (drag-order, maps to `Project.order`)
- Per-project edit screen covering every field from `04` §3: snapshot fields, tier selector, the four narrative blocks (problem/approach/build/outcome), AI disclosure, data honesty note
- Tier selector should visibly explain what each tier means (per `03` §3) so Muhammed isn't guessing what "compact" implies for the live page
- `featuredOnHome` toggle, visible and obvious — this single toggle controls whether a project shows on the Home page, so it needs to be impossible to miss

### 3.4 Media (per project)
- Upload, reorder, mark-as-featured, replace, remove — matching `04` §6 exactly
- Since Muhammed already organizes screenshots in per-project folders locally, the upload flow should support multi-file drag-and-drop rather than one-at-a-time uploads

### 3.5 Experience
- List + edit form matching `04` §4
- Optional link to a `Project` record (e.g. Smart Technology → ST Employees Portal) — when linked, the dashboard should show that connection so it's visible the two are related

### 3.6 Skills
- Grouped by category, with level as a simple selector (`strong/good/learning/interested`)
- Since this list changes often as Muhammed learns new things, this should be the fastest, lowest-friction form in the whole dashboard — add a skill in a few seconds, not a full multi-field form

### 3.7 Social Platforms
- Per-platform: URL, follower count, last-verified date
- The dashboard should visibly flag when `lastVerifiedDate` is getting old (e.g. a simple "last checked 4 months ago" note) — not to auto-hide anything, just so a stale number doesn't sit unnoticed indefinitely (ties directly to the numbers-honesty concern raised in `03` §8)

### 3.8 Social Videos (optional, per `04` §8)
- Simple list + add form, only needed if `/beyond/social` ends up with a curated archive
- Can ship after v1 if media isn't ready — not a blocker

### 3.9 Business Ventures
- Matches `04` §9 — name, narrative, and a small repeatable key/value list for metrics (so "Laptops sold: 80+" stays an editable pair, not buried in prose)

### 3.10 Education & Certifications
- List + edit form matching `04` §10, including the `visible` toggle so collected-but-unused entries don't need to be deleted, just hidden

### 3.11 Proof Points
- Short list of label/value pairs for Home's proof strip, with an optional `sourceRef` note — lets Muhammed keep the headline numbers curated separately from the fuller data they're drawn from

---

## 4. Media Handling

- Direct upload from the dashboard (drag-and-drop, multi-file)
- Per `04` §6: type, caption, order, and featured flag editable per item
- No in-dashboard image editing (crop/filter) needed for v1 — Muhammed already prepares screenshots before upload

---

## 5. What the Dashboard Does NOT Do

Explicit non-goals, per brief §38 ("a dashboard exposed to public users" is a stated non-goal) and general scope discipline:

- No public-facing account system — this is a private admin tool, never surfaced to site visitors
- No built-in analytics dashboard — traffic/analytics stays in a dedicated tool, not rebuilt here (consistent with `04` §13)
- No comment moderation, no visitor-submitted content of any kind — there isn't any
- No multi-language content management — out of scope unless it comes up explicitly later

---

## 6. Access & Security (high-level only)

Full mechanics belong in `06-technical-architecture.md`. At the requirements level:

- Single authenticated admin account — no public sign-up
- Draft content must never be reachable via a guessable public URL — "unpublished" has to actually mean unpublished, not just hidden from navigation

---

## 7. What's Deferred

- Actual auth mechanism (Firebase Auth vs. alternative) → `06-technical-architecture.md`
- UI framework/component choices for the dashboard itself → `06` and `07-design-system.md` (dashboard doesn't need to share the public site's art direction — it's a tool, not a brand surface)
- Whether the dashboard is a separate app or a protected route within the same Angular app → `06-technical-architecture.md`
