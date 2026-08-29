# 04 — Content Model

## 0. Purpose

`02` defined where things live. `03` defined how a project is told. This document defines the actual **fields** — the schema the dashboard will read from and write to, so `05-dashboard-requirements.md` and `06-technical-architecture.md` have something concrete to build against.

Nothing here is final UI. This is data shape only.

---

## 1. Modeling Principles

1. **Every entity here maps to something in the dashboard** (per brief §30) — if a field exists below, someone can edit it without touching code.
2. **Optional over required, wherever true.** Missing media or an unset field should never break a page (brief §32) — the frontend renders gracefully around gaps.
3. **Content is separate from presentation** (brief §33) — this schema never stores layout, color, or component choices, only facts.
4. **Every field traces back to something Muhammed actually said.** Nothing here is invented structure for structure's sake.

---

## 2. Profile

Singleton entity — one record, edited not created/deleted.

| Field | Type | Notes |
|---|---|---|
| `name` | string | "Muhammed Al-Ateeqi" |
| `heroStatement` | string | The locked Hero headline — final copy, per `01` §5 |
| `heroSubline` | string | The locked Hero subline — separate field, not concatenated into `heroStatement`, since headline and subline render in different type roles (display vs body face, per `07` §3). Added when the Hero copy was locked; this row was previously dropped from this doc by mistake during an unrelated edit and is restored here |
| `positioning` | string | "Software Engineer & Builder" |
| `bioShort` | string | Used in meta tags, previews |
| `bioLong` | rich text | Full About/Story narrative content |
| `resumeFile` | media ref | PDF, replaceable without redeploying |
| `contactEmail` | string | |
| `contactLinkedIn` | url | |
| `contactGitHub` | url | |
| `socialInstagram` | url | |
| `socialFacebook` | url | |

Explicitly **not** modeled here: WhatsApp, Calendly (excluded per brief §27).

---

## 3. Project

One record per project, ordered manually (curation over chronology, per brief §12).

| Field | Type | Notes |
|---|---|---|
| `slug` | string | URL segment, e.g. `scholarship-operation-dashboard` |
| `name` | string | |
| `tagline` | string | One-line description for `/work` cards |
| `tier` | enum | `featured` \| `standard` \| `compact` — controls depth shown (per `03` §3) |
| `order` | number | Manual curation order |
| `role` | string | e.g. "Sole builder" |
| `timeframe` | string | e.g. "Built in ~7 days" — kept as free text, not forced into start/end dates, since several projects only have a duration, not real calendar dates |
| `stack` | string[] | Tags, e.g. `["Angular", "Firebase", "Tailwind"]` |
| `liveUrl` | url? | Optional — not every project has one |
| `githubUrl` | url? | Optional |
| `problem` | rich text | Block 2 of the case study template |
| `approach` | rich text? | Block 3 — optional, folded into `problem`/`build` for compact-tier projects |
| `build` | rich text | Block 4 |
| `aiDisclosure` | rich text? | Block 5 — only present where AI was actually used |
| `dataHonestyNote` | rich text? | New field, surfaced by the Cyber50 project — for cases where the *data*, not the build process, needs disclosure (per `03` §6.1) |
| `outcome` | rich text | Block 6 — always present, scoped honestly (per `03` §4–6) |
| `media` | Media[] | See §6 below |
| `featuredOnHome` | boolean | Whether this appears in Home's Featured Work section |

Each project's `problem/approach/build/outcome` fields correspond 1:1 to the worked examples already written in `03-case-study-system.md` — that document's content can be copied directly into these fields as the first real data.

---

## 4. Experience (Professional)

One record per role/engagement (per brief §11 note that most of this lives in the CV, plus the Nutella café exception called out in Discovery).

| Field | Type | Notes |
|---|---|---|
| `organization` | string | |
| `role` | string | |
| `timeframe` | string | Free text, including ongoing roles verbatim (e.g. "Apr 2026 – Present") — never derive a tense or an end date from this string |
| `summary` | rich text | What was actually done — kept distinct from a CV bullet list |
| `tech` | string[]? | Optional — tech stack tags shown on the Experience accordion |
| `linkedProjectSlugs` | string[]? | Optional — links to `Project` records where the role produced one. Plural: a single role (e.g. Smart Technology) can link more than one seeded project |

---

## 5. Skill

Flat list, grouped by proficiency — matches the Discovery answer's own framing ("Strong / Good / Learning / Interested in").

| Field | Type | Notes |
|---|---|---|
| `name` | string | e.g. "Angular" |
| `category` | enum | `language` \| `framework` \| `state-data` \| `data-viz` \| `practice` \| `tooling` |
| `level` | enum | `strong` \| `good` \| `learning` \| `interested` |

This directly reflects the categorized stack from the project brief (§11), rebuilt as editable records instead of a hardcoded list — the brief itself already flags that this should live in the dashboard, not be hardcoded (brief §11, closing line).

---

## 6. Media

Attached to a `Project` (one project → many media items), matching Muhammed's own stated organization (a folder per project containing its README and screenshots). **Updated 2026-08-28** to match `06` §3.2's Cloudinary migration — media inherits its parent project's publish state, so it is not independently `Editable`.

| Field | Type | Notes |
|---|---|---|
| `projectSlug` | string | Parent reference |
| `type` | enum | `image` — narrowed from the original `image \| video \| thumbnail`; project media is images-only now that video hosting inside the portfolio is a locked non-goal (media doc §6, §15) and `SocialVideo` (§8 below) already covers video via external links |
| `url` | string | Cloudinary `secure_url` |
| `publicId` | string | **Required** — the Cloudinary asset identifier. Without it, an asset can never be deleted from Cloudinary later; capturing it at upload time is the only chance to have it |
| `alt` | string | **Required** — accessibility (per `07` §8), not optional |
| `caption` | string? | Optional |
| `order` | number | Manual ordering |
| `isFeatured` | boolean | Used as the card/preview image |

**Known gap, accepted deliberately**: deleting a `Media` doc from Firestore does not delete the underlying Cloudinary asset (unsigned uploads have no client-side delete capability by design — no secret in the browser). For a five-project portfolio this is expected to stay negligible; occasional manual cleanup in the Cloudinary console is the accepted approach rather than building a server-side delete endpoint pre-emptively.

---

## 7. Social Platform

| Field | Type | Notes |
|---|---|---|
| `platform` | enum | `instagram` \| `facebook` \| (extensible later per brief §20) |
| `url` | string | |
| `followerCount` | number | Stored as a raw number, not a pre-formatted string — so "100,000" vs "~986K combined" is a presentation decision, not a content decision (ties to the §8 numbers-honesty note in `03`) |
| `lastVerifiedDate` | date | So a stale follower count is visible/flaggable rather than silently aging |

---

## 8. Social Video (optional, Beyond Code)

Only needed if `/beyond/social` ends up with a curated video archive (still open per `02` §14).

| Field | Type | Notes |
|---|---|---|
| `title` | string | |
| `platform` | enum | `youtube` \| `instagram` \| `facebook` |
| `url` | url | |
| `context` | rich text? | Why this video matters to the story, not just a caption |
| `order` | number | |

---

## 9. Business Venture (Beyond Code)

Models "Ateeqi Tech" specifically, but kept generic in case a future venture is added.

| Field | Type | Notes |
|---|---|---|
| `name` | string | e.g. "Ateeqi Tech" |
| `summary` | rich text | The customer-first laptop business narrative |
| `metrics` | KeyValue[] | e.g. `{ "Laptops sold": "80+", "Net proceeds": "~80,000 EGP" }` — stored as labeled pairs so numbers stay attributable and editable individually, not buried in prose |

---

## 10. Education / Certification

| Field | Type | Notes |
|---|---|---|
| `type` | enum | `degree` \| `certification` \| `workshop` |
| `title` | string | |
| `issuer` | string | |
| `date` | string | |
| `visible` | boolean | Per brief §9's note: not everything collected has to be shown |

---

## 11. Proof Point (Numbers)

A dedicated small model — deliberately separate from where the numbers live substantively (Social Platform, Business Venture), so Home's "Proof Strip" (per `02` §4.2) can pull a short, curated subset without duplicating data entry.

| Field | Type | Notes |
|---|---|---|
| `label` | string | e.g. "Laptops sold" |
| `value` | string | e.g. "80+" |
| `sourceRef` | string? | Which underlying record this number traces back to, so it can be re-verified rather than going stale silently |

---

## 12. Draft / Publish State

Applies to `Project`, `Experience`, `Profile`, and any other editable entity, per the Draft → Preview → Publish workflow confirmed in Discovery.

| Field | Type | Notes |
|---|---|---|
| `status` | enum | `draft` \| `published` |
| `updatedAt` | timestamp | |
| `publishedAt` | timestamp? | |

Full workflow mechanics (preview links, permissions) belong in `05-dashboard-requirements.md` — this just establishes that every content type needs the state field to hang that workflow off of.

---

## 13. What This Model Deliberately Leaves Out

- No comments, likes, or any visitor-generated content — this is a curated personal site, not a platform (brief §38)
- No analytics data stored in-model — that belongs in an actual analytics tool, not the content schema
- No visual/layout fields (colors, component variants) anywhere — enforced per §1.3 above

---

## 14. What's Deferred

- Exact Firestore collection/document shape (this is entity design, not database design) → `06-technical-architecture.md`
- Dashboard UI for editing each of these → `05-dashboard-requirements.md`
- Whether `SocialVideo` ships in v1 or later → depends on media readiness