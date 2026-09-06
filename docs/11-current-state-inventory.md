# 11 — Current State Inventory (2026-09-06)

## 0. Purpose

A snapshot of what actually exists in the codebase right now, for use alongside your own screenshots while storyboarding a visual redesign. Everything below is derived from reading the live source (`site/src/app`) and, where noted, from curling the running SSR server against real Firestore data — not from the planning docs (`00`–`10`) alone, since those describe intent and this describes what's built.

**This is inventory only. No design changes are proposed anywhere in this document.**

Snapshot conditions: `main` branch, commit range through the media-editor/hydrate() fixes (2026-09-06). Live data was read via the local dev/SSR server against the real Firestore project, not seed files — there are no seed files in the repo; all content is dashboard-authored.

---

## 1. Full Sitemap

### Public routes (SSR'd, in `app.routes.ts`)

| Path | Component | Notes |
|---|---|---|
| `/` | `Home` | |
| `/work` | `WorkIndex` | |
| `/work/:slug` | `CaseStudy` | Any slug matches; unknown/unpublished slugs render an in-page 404 (see below) rather than failing to match |
| `/about` | `About` | |
| `/beyond` | `BeyondHub` | |
| `/beyond/social` | `BeyondSocial` | |
| `/beyond/business` | `BeyondBusiness` | |
| `/beyond/teaching` | `BeyondTeaching` | |
| `/contact` | `Contact` | |

### Admin routes (auth-guarded, excluded from SSR and from any sitemap/robots output)

| Path | Component | Notes |
|---|---|---|
| `/admin/login` | `AdminLogin` | Guest-only guard (redirects away if already signed in) |
| `/admin` | `AdminOverview` | |
| `/admin/profile` | `AdminProfileEditor` | |
| `/admin/projects` | `AdminProjectsList` | |
| `/admin/projects/:slug` | `AdminProjectEditor` | `:slug = 'new'` for an unsaved project |
| `/admin/projects/:slug/media` | `AdminMediaEditor` | |
| `/admin/skills` | `AdminSkillsEditor` | |
| `/admin/experience` | `AdminExperienceEditor` | |
| `/admin/social` | `AdminSocialEditor` | |
| `/admin/business` | `AdminBusinessEditor` | |
| `/admin/education` | `AdminEducationEditor` | |
| `/admin/proof-points` | `AdminProofPointsEditor` | |
| `/admin/preview/:entity/:id` | `AdminPreview` | `:entity` is `profile` or `projects`; renders the real public component (`About` or `CaseStudy`) fed with draft data |

### Built but not in the IA — found in code, not linked from anywhere

| Path | Component | Status |
|---|---|---|
| `/styleguide` | `Styleguide` (`src/app/dev/styleguide/`) | Phase 1 scaffolding — a token/component reference page (color swatches, type specs, measured contrast ratios). Not in the nav, not in `02-information-architecture.md`'s IA, and its own code comment says to delete `src/app/dev/` and this route before launch. Still fully live at this URL right now. |

### Fallback behavior

- `**` (any unmatched path) → `redirectTo: ''` (silently lands on Home). There is **no dedicated top-level 404 page/route** — a mistyped URL like `/foo` redirects to Home rather than showing a "not found" page.
- The one real not-found *experience* on the site is inside `CaseStudy`: an unknown or unpublished `/work/:slug` renders an in-template 404 block (eyebrow "404", heading, link back to `/work`) rather than failing to match or redirecting — deliberate, so a draft project is indistinguishable from a typo from the outside.

---

## 2. Page-by-Page Content Breakdown

Each section listed in template order, with what data populates it.

### `/` — Home (`features/home/home.ts`)

1. **Hero** — `Profile.heroStatement` (headline), `Profile.heroSubline` (optional), `Profile.positioning` (small label above headline). Two CTAs: "View Work" (always), "Resume" button (only if `Profile.resumeFile` is set).
2. **Proof Strip** — `ProofPoint[]`, each rendered as `{value}` / `{label}`. Entire section is `@if (proofPoints().length)` — currently **absent** (no ProofPoint records exist, see §5).
3. **Featured Work** — `Project[]` where `featuredOnHome === true`, up to a 2-column grid. Each card: cover image (`Media.isFeatured`, only if set — currently 1 of the live projects has one), name (links to case study), timeframe, tagline, stack tags. Section framing heading is `COPY.featuredWork` (static site-copy, not a content-model field).
4. **How I Work** — static, from `PROCESS` (`site-copy.ts`): 4 grouped "movements" (Understand / Decide / Build / Improve), each with a short list of steps. Not content-model data.
5. **Story Teaser** — first paragraph of `Profile.bioLong` (split on blank line), heading from `COPY.storyTeaser`, links to `/about`.
6. **Beyond Code Teaser** — one line from `COPY.beyondTeaser`, link to `/beyond`.
7. **Contact / Closing CTA** — `Profile.contactEmail` (mailto button), Resume button again if `resumeFile` set.

### `/work` — Work Index (`features/work/work-index/work-index.ts`)

1. Eyebrow "Work" + static heading ("Five projects, each built to fix something specific.").
2. **Featured lead card** — the one `Project` with `tier === 'featured'`, larger treatment: cover image (if any), "Featured" label, name, tagline, role/timeframe, stack tags.
3. **Remaining projects grid** — every other published `Project` (2-column), each: cover image (if any), name, tagline, stack tags. Order follows each project's stored `order` field, not chronology.

### `/work/:slug` — Case Study (`features/work/case-study/case-study.ts`)

One template for every project, block order fixed regardless of tier:

1. **Snapshot** (header) — `tier`, `name`, `tagline`, `role`/`timeframe` (each optional), `stack` tags, `liveUrl`/`githubUrl` buttons (each rendered only if present).
2. **Media gallery** — `Media[]` for the project, rendered via the `ui-gallery` component (masonry grid + `<dialog>` lightbox). Absent entirely if the project has no media yet.
3. **The Problem** — `problem` (paragraphs split on blank line).
4. **The Approach** — `approach`, only if present (absent on `compact`-tier projects).
5. **The Build** — `build`.
6. **Disclosures** — `aiDisclosure` and/or `dataHonestyNote`, each rendered independently if present, via `ui-disclosure`.
7. **Outcome** — `outcome`.
8. Footer nav — links back to `/work` and to `/contact`.
9. **404 variant** (when `project` resolves `null`): eyebrow "404", heading, link back to `/work`. Replaces the entire article, nothing else renders.

### `/about` — About (`features/about/about.ts`)

1. Eyebrow "About" + static heading ("The long version").
2. `Profile.bioShort` as an intro line.
3. **Journey spine** — static `JOURNEY` array (`site-copy.ts`, 12 stages: Computer → Gaming → Video Editing → Content Creation → Programming → Computer Science → Freelancing → Business → Leadership → Setback → Rebuilding → Software Engineering), rendered as a horizontal wrapped sequence with arrow separators. Not content-model data.
4. **Full narrative** — `Profile.bioLong`, split into paragraphs.
5. **Experience** (`ExperienceList` sub-component) — `Experience[]` as a `<details>` accordion, first (current) role open by default. Each row: role, organization, engagement (optional), timeframe, summary prose, tech tags (optional), links to any `linkedProjectSlugs`.
6. Footer nav — links to `/work`, `/beyond`, `/contact`.

### `/beyond` — Beyond Code Hub (`features/beyond/beyond-hub/beyond-hub.ts`)

1. Eyebrow + static heading (`COPY.beyondHub`).
2. **Three static entry cards** (title + blurb, hardcoded in the component, not content-model data): Social Media World → `/beyond/social`, Business → `/beyond/business`, Teaching → `/beyond/teaching`.

### `/beyond/social` — Social Media World (`features/beyond/social/social.ts`)

1. Eyebrow + heading + a fixed intro paragraph (hardcoded copy).
2. **Combined reach** — sum of `SocialPlatform.followerCount` across all platforms, formatted honestly (never rounds up across the 1M boundary). Section only renders if platforms exist.
3. **Platform list** — one row per `SocialPlatform`: name (links out), formatted follower count, `lastVerifiedDate`, a `ui-status-dot` "Live" indicator.
4. No video archive section — `SocialVideo` entity exists in the model but has zero seeded records and this page never queries it (see §5).

### `/beyond/business` — Business (`features/beyond/business/business.ts`)

1. Eyebrow + heading.
2. Per `BusinessVenture` (currently one — "Ateeqi Tech"): name heading, metrics (`MetricPair[]`, label/value pairs rendered verbatim including qualifiers like "80+"), summary paragraphs.
3. Footer nav link back to `/work`.

### `/beyond/teaching` — Teaching (`features/beyond/teaching/teaching.ts`)

Deliberately the thinnest page on the site — no content-model entity backs it at all.

1. Eyebrow + heading.
2. One paragraph — static `TEACHING.framing` (`site-copy.ts`).
3. A row of tags — static `TEACHING.evidences` (4 items: Communication, Mentorship, Technical understanding, Desire to help others improve).
4. Back-link to `/beyond`.

### `/contact` — Contact (`features/contact/contact.ts`)

1. Eyebrow + heading + fixed intro line (`COPY.contact`).
2. Primary CTA — `mailto:` button using `Profile.contactEmail`.
3. **Channel list** — LinkedIn and GitHub only (from `Profile.contactLinkedIn`/`contactGitHub`), each rendered only if present. No WhatsApp, no Calendly, no social platforms repeated here.
4. Resume download button, only if `Profile.resumeFile` is set.

### Global layout (every public page)

- **Header** (`layout/header/header.ts`) — sticky, blurred background. Site name (from `Profile.name`, links home), 4 nav links (Work / About / Beyond Code / Contact), Resume button (only if `resumeUrl` present).
- **Footer** (`layout/footer/footer.ts`) — nav links repeated, channel list built dynamically from whichever of `Profile.contactEmail`/`contactLinkedIn`/`contactGitHub`/`socialInstagram`/`socialFacebook` are actually set, copyright line with current year + `Profile.name`.

---

## 3. Component Inventory

### Shared UI primitives (`shared/ui/`) — used across multiple public pages

| Component | Selector | Used on | Notes |
|---|---|---|---|
| `UiButton` | `button[uiButton]`, `a[uiButton]` | Home, Contact, header, case study, login | Attribute directive, not a wrapper — host stays a real `<button>`/`<a>`. `variant: 'primary' \| 'secondary'` |
| `UiCard` | `ui-card` | Home (Featured Work), Work Index, Beyond hub | `interactive` input warms border on hover |
| `UiEyebrow` | `ui-eyebrow` | Every public page's section headers, case study block headers | Optional `index` (e.g. "01") for genuinely ordered sequences only |
| `UiTag` | `ui-tag` | Home, Work Index, case study, About (Experience), Teaching | Plain span, monospace, non-interactive |
| `UiStatusDot` | `ui-status-dot` | `/beyond/social` (per-platform "Live" marker) only, currently | The site's one signature/motif element (07 §6) — deliberately single-purpose, no color/tone input |

### Shared blocks (`shared/blocks/`) — composite, still cross-page-reusable

| Component | Selector | Used on | Notes |
|---|---|---|---|
| `UiDisclosure` | `ui-disclosure` | Case study only (AI disclosure / data honesty note) | `kind: 'ai' \| 'data'` required, no default |
| `UiGallery` | `ui-gallery` | Case study only (media gallery) | Masonry grid (`columns-*`) + native `<dialog>` lightbox, arrow-key nav. Newest component, added this session. Zero external dependencies. |

### Motion

| Item | Type | Used on |
|---|---|---|
| `RevealDirective` (`appReveal`) | Directive | Home (Featured Work, How I Work, Story, Beyond teaser, Contact sections), Work Index (grid cards), case study (Problem/Approach/Build/Outcome sections), About (Experience section) |

### Layout (site-wide, not page components)

| Component | Notes |
|---|---|
| `AppHeader` | Sticky site header, every public page |
| `AppFooter` | Every public page |

### Page-specific components (not reused elsewhere)

| Component | Used on |
|---|---|
| `ExperienceList` (`app-experience-list`) | `/about` only — the accordion of roles |

### Admin-only components (dashboard, separate lazy-loaded area — 05 §7, does not share the public visual system by design)

| Component | Used on | Layout pattern |
|---|---|---|
| `DraftBar` (`app-draft-bar`) | Profile editor, Project editor | Shared sticky action bar: Save draft / Preview / Discard / Publish, plus an optional `extraLink` slot |
| `AdminShell` | Wraps every `/admin/*` route (except `/admin/login`) | Persistent left sidebar (9 entity links) + content pane |

### Dev-only (not part of the shipped site's IA)

| Component | Notes |
|---|---|
| `Styleguide` (`app-styleguide`) | `/styleguide` — renders every color swatch, type spec, and the shared UI components together for review. Flagged for deletion pre-launch. |

---

## 4. Design Tokens — As Actually Implemented (`site/src/styles.css`)

All tokens live in one `@theme` block; the file's own header comment states the rule "no raw hex may appear in any template or component style — every hex in the entire codebase lives here." Confirmed true by grep — no other file defines a hex color.

### Color roles

| Token | Hex | Role |
|---|---|---|
| `--color-bg` | `#000000` | Primary background |
| `--color-surface` | `#140a03` | Warm near-black — cards, panels, raised sections |
| `--color-fg` | `#ffffff` | Headlines, primary body copy |
| `--color-fg-muted` | `#888888` | Captions, metadata, tags |
| `--color-action` | `#ff6b00` | Primary accent — interactive elements only ("act on this") |
| `--color-action-hover` | `#e59400` | Hover/active state for `--color-action`, never standalone |
| `--color-live` | `#00d68f` | Functional accent — status/"live" indicators only (currently: `UiStatusDot`'s pulse) |

**Matches `docs/07-design-system.md` §2 exactly** — same 7 hex values, same role assignments, same "orange = interactive, teal = live/verified" discipline. No drift found.

### Typography

| Role | Token(s) | Implemented stack |
|---|---|---|
| Display | `--font-display` | `'Clash Display', 'General Sans', ui-sans-serif, system-ui, sans-serif` |
| Body | `--font-sans` | `'General Sans', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif` |
| Utility/mono | `--font-mono` | `'JetBrains Mono', ui-monospace, 'SFMono-Regular', 'Cascadia Mono', monospace` |

Font files are loaded from CDNs (Fontshare for Clash Display/General Sans, Google Fonts for JetBrains Mono) via `<link>` tags in `index.html`, **not self-hosted**. This matches `docs/10-open-items.md`'s own note that self-hosting is still an open item — not undocumented drift, just worth knowing before a redesign touches font loading.

Size/weight scale, all fluid (`clamp()`) except the reading sizes:

| Token | Value | Line-height | Letter-spacing | Weight |
|---|---|---|---|---|
| `--text-display-1` | `clamp(2.75rem, 7vw, 5.5rem)` | 1 | -0.012em | 600 |
| `--text-display-2` | `clamp(2rem, 4.5vw, 3.5rem)` | 1.06 | -0.012em | 600 |
| `--text-display-3` | `clamp(1.5rem, 2.75vw, 2.25rem)` | 1.15 | -0.008em | 600 |
| `--text-body-lg` | `1.125rem` | 1.7 | — | — |
| `--text-body` | `1rem` | 1.7 | — | — |
| `--text-caption` | `0.875rem` | 1.6 | — | — |
| `--text-label` (mono) | `0.75rem` | 1.4 | 0.12em | — |

**Matches `docs/07` §3's three-role structure exactly** (display/body/mono, mono reserved for tags/dates/stat labels/eyebrows). No drift.

### Layout / spacing

- Two container widths: `--container-content: 44rem` (Story, case studies, contact — narrow reading column), `--container-wide: 78rem` (Home sections, Work grid).
- **No custom spacing scale defined.** The file's own comment explains why: Tailwind's default 4px base already expresses the docs' target 8px rhythm (8/16/24/32/48/64/96 → 2/4/6/8/12/16/24 in Tailwind's units) exactly, so redefining `--spacing` was deliberately skipped to avoid silently changing what every existing utility class means. Not drift — a documented decision.
- Two hairline-border alpha values in active use, chosen from a measured WCAG 1.4.11 contrast table in the CSS file's own comments: `border-fg/12` (card edges — decorative, card is identified by its surface-color shift, not the border) vs `border-fg/40` (control edges — inputs, selects, secondary buttons, where the border is the only thing identifying the control).

### Motion

| Token | Value |
|---|---|
| `--ease-out-soft` | `cubic-bezier(0.22, 1, 0.36, 1)` |
| `--duration-fast` | `150ms` |
| `--duration-base` | `250ms` |

`prefers-reduced-motion: reduce` is enforced globally in `@layer base` (forces all animation/transition durations to `0.01ms`), not left to individual components to remember.

### Global base rules worth knowing before restyling

- `color-scheme: dark` set on `<html>`; body background/color pinned to the tokens (not relying on inherited browser defaults).
- `:focus-visible` — 2px solid `--color-action` outline, 3px offset, on every interactive element site-wide (one global rule, not per-component).
- `::selection` — `--color-action` background, `--color-bg` text.
- `<meta name="theme-color">` in `index.html` is hardcoded to `#000000` separately from the CSS (a `<meta>` tag can't read a CSS variable) — the file has a comment flagging it must be kept in sync with `--color-bg` by hand if that token ever changes.

**Overall drift assessment: none found.** Every token, role, and rule in `styles.css` traces directly to a specific line in `docs/07-design-system.md`, and the file's own comments cite the source section for nearly every block. The only things not yet "finished" relative to the docs (self-hosted fonts, a defined type-scale-in-practice for admin) are already logged as open items elsewhere, not silent drift.

---

## 5. Content Model — Entity Status

Per `docs/04-content-model.md`. "Live" below means confirmed via the actual running site/SSR output against real Firestore data, not assumed.

| Entity | Draft/Publish? | Public page(s) that read it | Live status (confirmed) |
|---|---|---|---|
| **Profile** | Yes (Editable) | Home, About, Contact, header, footer | Populated: name, heroStatement, positioning, bioShort, bioLong, contactEmail/LinkedIn/GitHub, resumeFile, and both social URLs all confirmed present in rendered HTML |
| **Project** | Yes (Editable) | Home (featured subset), `/work`, `/work/:slug` | 5 live, published projects confirmed: `cyber50-dashboard`, `freshcart`, `nutella-digital-menu`, `scholarship-operation-dashboard`, `st-employees-portal`. One is `tier: 'featured'`. A 6th test project (`dddddddd`, flagged in a previous session) is no longer present — appears to have been deleted since |
| **Media** | No (inherits parent Project's state) | `/work/:slug` gallery, cover images on Home/`/work` cards | Only `scholarship-operation-dashboard` has real uploaded screenshots (several) with real alt text. The other 4 live projects currently have **no media at all** — their case studies render with the gallery section absent, and their cards show the text-only fallback |
| **Experience** | Yes (Editable) | `/about` (accordion) | 4 roles confirmed live: Software Engineer — Frontend, Coding Instructor, Frontend Instructor, Front-End Web Developer |
| **Skill** | No (direct-write) | **None.** `ContentService.skills()` exists and is called only by `AdminOverview`/`AdminSkillsEditor` — no public route or component resolves or renders `Skill` data anywhere | Full CRUD exists in the dashboard; data presumably exists (grouped by category/level) but has **zero public surface right now** — worth remembering before a redesign, since there's no current page layout to reference for it |
| **SocialPlatform** | No (direct-write) | `/beyond/social` | 2 platforms live: Instagram, Facebook, combined reach rendered and confirmed under the 1M honesty rule |
| **BusinessVenture** | No (direct-write) | `/beyond/business` | 1 live: "Ateeqi Tech", with metrics and summary confirmed rendering |
| **Education** | No (direct-write, filtered on `visible`) | **None.** Same situation as Skill — `ContentService.education()` exists, only the admin screen calls it | Full CRUD exists (type/title/issuer/date/visible toggle); zero public rendering surface currently |
| **ProofPoint** | No (direct-write) | Home (Proof Strip) | **Empty** — confirmed by absence of the "Combined reach"-style proof-strip markup on Home's rendered HTML. The section is coded to simply not render rather than show a placeholder |
| **SocialVideo** | No (direct-write) | None — no admin screen exists for it either | **Fully unbuilt beyond the TypeScript interface.** Modeled in `core/models/social-video.ts` because the shape was agreed during planning, but zero seeded documents, zero admin UI, zero route reads it. Purely a placeholder for a future curated-video-archive feature that is still an open decision |

**Fields worth flagging as still empty on populated entities:**
- `Profile.heroSubline` — optional field; not confirmed present or absent from this pass, worth checking directly in the dashboard
- `Project.liveUrl`/`githubUrl` — optional per-project; several projects are known (from `docs/10-open-items.md`) to be missing a GitHub link (e.g. Cyber50)
- 4 of 5 live projects have no `Media` at all yet — the single biggest visible content gap on the current site

---

## 6. Admin Dashboard — Screens and Layout Patterns

All admin screens share the same shell (`AdminShell`: fixed left sidebar + content pane) and the same design tokens as the public site, but deliberately not its visual language (05 §7) — plain, functional, no motion, no hero treatment anywhere.

| Screen | Route | Layout pattern | Save model |
|---|---|---|---|
| **Overview** | `/admin` | Table (3 columns: Section / Live count / Last updated), one row per entity, links out to each editor | Read-only |
| **Profile** | `/admin/profile` | Single long form, one field per row (label above input/textarea) | Draft → Publish (`DraftBar`) |
| **Projects list** | `/admin/projects` | Table (Order / Name / Tier / Home / State / Media link / Delete), plus a second table section for never-published drafts | — (list/nav screen) |
| **Project editor** | `/admin/projects/:slug` | Form: 2-column grid for Snapshot fields, a `fieldset`/radio group for tier (with inline meaning descriptions), one "impossible to miss" bordered checkbox block for `featuredOnHome`, then full-width textareas for the 6 narrative blocks. Delete action separated at the bottom | Draft → Publish (`DraftBar`, with an extra "Manage images" link) |
| **Media editor** | `/admin/projects/:slug/media` | Upload button (opens Cloudinary's widget) → pending-items list (flex row: thumbnail + fields) awaiting alt text → a responsive **grid** (2/3/4 columns) of saved media, drag-and-drop reorderable via `@angular/cdk`, with an explicit "Save order" action | Direct-write (immediate per-field autosave for alt/caption/featured; explicit batch save for reorder) |
| **Skills** | `/admin/skills` | Inline add-row form + flat table (name / category select / level select / remove), no per-row save button | Direct-write, immediate |
| **Experience** | `/admin/experience` | **Accordion** — collapsed rows (role/org/timeframe), first role's fields shown on expand: form fields + per-role Save draft/Publish/Discard/Delete action row | Draft → Publish, per-row (not page-wide) |
| **Social platforms** | `/admin/social` | List of bordered cards, one per platform, each with URL/follower-count/last-verified-date fields and a computed staleness warning | Direct-write, immediate |
| **Business ventures** | `/admin/business` | List of bordered cards, one per venture, with a nested repeatable metrics list (add/remove label-value pairs) | Direct-write, immediate |
| **Education** | `/admin/education` | Flat table (type select / title / issuer / date / visible checkbox / remove), "Add entry" button above | Direct-write, immediate |
| **Proof points** | `/admin/proof-points` | Flat table (label / value / sourceRef / remove), "Add" button above | Direct-write, immediate |
| **Draft preview** | `/admin/preview/:entity/:id` | Not really a screen of its own — renders the *actual* public `About` or `CaseStudy` component fed with draft data, behind a thin sticky "Draft preview — not live / Back to editor" bar | Read-only |
| **Login** | `/admin/login` | Centered single-column form (email/password) + a "Continue with Google" button below | — |

**Recurring dashboard patterns across screens:**
- Two save models coexist by design: entities with a Draft/Publish workflow (Profile, Project, Experience) always show the shared `DraftBar`; everything else (Skill, SocialPlatform, BusinessVenture, Education, ProofPoint, and Media's alt/caption/featured fields) autosaves immediately with no separate save button, each screen carrying its own small "changes save immediately" note.
- Tables are the default list pattern (Overview, Projects, Education, Proof points); cards are used where each record has enough fields to need visual separation (Social platforms, Business ventures); the accordion is used exactly once, for Experience, where collapsing is what keeps a multi-paragraph-per-role list scannable.
- Destructive actions (Delete) are consistently text-only muted buttons that turn `text-action` (orange) on hover, always behind a plain `confirm()`, never a modal.
