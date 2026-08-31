# 10 — Open Items

## 0. Purpose

Every planning document from `00` to `09` flagged something as unresolved, deferred, or "verify before publishing." This document is the single place those all land, so nothing gets lost between "planning" and "design → Claude Code → build." Before starting a phase in `08-implementation-plan.md` that touches one of these areas, check here first.

---

## 1. Must-Resolve Before Build Starts

These block Phase 1 of `08-implementation-plan.md` — everything else can proceed around them, but these two shouldn't be left for the agent to guess.

- [~] **Real location line for the Hero.** The design-mockup pass invented "Kuwait — remote friendly" with no basis (per `08` §2). Confirm the actual line — location, remote availability, whatever's accurate — before it goes into the `Profile` content or the Hero component.
  - **Partially resolved (2026-08-27).** Shape confirmed: **remote availability only** — no city or country named. The exact wording is still outstanding. Nothing has been written into any component, and the invented line has not been replaced with a guess.
  - **No longer blocking (2026-08-27).** The Hero copy locked in `01` §5 carries no availability line at all, so the Hero renders complete without one and Phase 3 is unblocked. This is now an optional addition rather than a gap: if an availability line is wanted, `07` §6 suggests pairing it with the status dot ("available for opportunities"), and it stays a deliberate field addition — `04` §2's `Profile` schema has **no location/availability field**, and adding one is a schema change to raise (per `09` §2.3), not to slip in silently.
- [x] **Orange accent scope.** Decide between keeping `#FF6B00` strictly CTA-only, or formally widening `07-design-system.md` §2 to also cover labels/emphasis (per `08` §2, Option A vs B). Whichever is chosen, update `07` §2 itself so the rule stays accurate for whoever builds against it.
  - **Resolved (2026-08-27): Option A — strict.** Orange marks interactive elements only: buttons, links, focus rings. Section eyebrows, the "in plain English" label and the positioning pill use white / `#888888`, with the monospace face carrying their distinctiveness instead. `07` §2 was already written this way, so **no amendment was needed** — the rule stands as-is.
  - Enforced in code, not just documented: the token is named `--color-action` (role, not hue), and `UiStatusDot` has no colour/tone input at all, so the teal functional accent cannot be repurposed decoratively.

---

## 2. Content Verification Needed

Not blockers, but must be confirmed before the relevant content goes live (per `00` §22, `03` §8):

- [ ] Final combined social reach figure — real number, not "+1M" (currently ~986K per `03` §8)
- [x] Final Hero one-line identity statement — **locked 2026-08-27.** Directions A–D are removed from `01` §5, replaced by the final headline ("Building practical software for problems I live with") and subline. Seeded into `Profile.heroStatement` / `heroSubline`.
- [ ] Cyber50 Dashboard's full GitHub repo link — only the data-endpoint repo was provided during Discovery; the main application repo link is still missing
- [ ] Certification/workshop dates — a couple of entries in Discovery (e.g., a 2026-dated Coursera certificate) are worth a quick sanity check before they go on the Education page

---

## 3. Structural / Scope Decisions

Flagged as open in earlier documents, still undecided:

- [ ] **Contact page**: link-only (current default) or does it need an actual contact form? (`02` §14)
- [ ] **`/beyond/social`**: does it ship with a curated video archive in v1, or just platform links + story text? Depends on media readiness (`02` §14, `04` §8, `08` §6)
- [ ] **Resume format**: PDF-only download, or also an inline preview on the `/resume` route? (`02` §14)

---

## 4. Technical Decisions Deferred

Noted in `06-technical-architecture.md` as intentionally independent of the core architecture — can be decided any time without affecting anything already built:

- [ ] Analytics tool selection (lightweight, privacy-respecting option) — not part of the content model by design (`06` §9)
- [ ] Final typeface licensing / self-hosting approach for the display, body, and monospace faces chosen in `07` §3
  - **Interim (2026-08-27):** the three faces named in `07` §3 are loading from CDNs — Clash Display and General Sans from Fontshare, JetBrains Mono from Google Fonts. Swapping to self-hosted `@font-face` later touches only the `<link>` block in `src/index.html` and the three `--font-*` tokens in `src/styles.css`. Nothing else in the codebase names a typeface.

---

## 4a. Surfaced During Build (Phase 0 / Phase 1, 2026-08-27)

New questions that came up while building and are not covered anywhere in `00`–`09`, logged here per §7 rather than left in a commit message.

- [ ] **Firebase project does not exist yet.** `08` Phase 0 calls for the project to be connected. It cannot be — there is no project and no credentials, and inventing placeholder values would violate `09` §3. `src/app/core/firebase/firebase.config.ts` holds deliberately empty values plus an `isFirebaseConfigured()` guard, so an unconfigured project degrades to "no content" rather than a crash (`04` §1.2). **Blocks Phase 2.** To unblock: create the project (Firestore, Storage, Auth, Hosting per `06` §3) and paste the web config into that one file.
- [x] **`@angular/fire` is unusable on Angular 21.** Its latest release (20.0.1) is peer-capped at Angular 20, and installing it needs `--legacy-peer-deps`. **Resolved:** using the modular Firebase Web SDK (`firebase`) directly behind typed service classes, which is what `09` §5 asks for anyway ("typed service classes matching `04`'s entities — no ad-hoc queries"). No functionality is lost; the DI-wrapper convenience is. Revisit only if `@angular/fire` ships Angular 21 support and there's a reason to switch.
- [ ] **Angular version: docs say 21, latest stable is now 22.** `06` §1 names Angular 21 but justifies it as "latest stable at build time … so this doesn't go stale," and `10` §6 records 21 as resolved. Built on **Angular 21.2** — the explicitly named version wins over the general rule, and 21 is current and supported. Flag if you'd rather be on 22 before more code accumulates; the cost of moving rises with every phase.
- [ ] **Delete the Phase 1 review scaffolding before launch.** `src/app/dev/styleguide/` and its route in `src/app/app.routes.ts` exist only to make the Phase 1 checkpoint reviewable (`09` §6). It is not a site page and is not in the IA (`02` §2).

---

## 4b. Content Gaps Blocking the Phase 2 Seed (2026-08-27)

Phase 2's data layer, security rules and seed content are built. Nothing below was filled in with a plausible-sounding placeholder (`09` §3, `08` §5) — each gap is a specific missing sentence or fact, and it is recorded in code as well, in `site/tools/seed/seed-data.ts`'s `UNSEEDED` array, which the seed script prints on every run.

**Seeded and ready** — verbatim from `03` §4–6: **all five projects.** Scholarship Operation Dashboard (featured, all six blocks), ST Employees Portal (standard), and Cyber50 Dashboard, FreshCart and Nutella Digital Menu (compact). Plus the full categorised skill list from brief §11 and both social follower counts from brief §20.

- [x] **FreshCart and Nutella write-ups — resolved (2026-08-27).** `03` §6.2 and §6.3 now carry full Snapshot / Problem / Build / Outcome blocks, replacing the one-line pointers. Both are seeded at `order` 4 and 5, `tier: 'compact'`, with Approach folded into Problem/Build per `03` §3. Nutella's `role` carries "Sole builder, self-initiated" because its self-initiation *is* the story (brief §17); FreshCart's `role` and both `timeframe` fields are empty, since `03` §6.2–6.3 state neither and `04` §1.2 renders around a gap.

Blocking, roughly in the order Phase 3 will hit them:

- [x] **`Profile` — resolved (2026-08-27).** All fields final and seeded: locked Hero headline + subline from `01` §5, `bioShort`, `bioLong`, and the full contact set (email, LinkedIn, GitHub, Instagram, Facebook). **This was the last blocker on Phase 3, which can now start.**
  - Schema change made, not slipped in: locking `01` §5 produced a headline *and* a subline, and `04` §2 had modelled the identity statement as one line. `heroSubline` was added to `04` §2 and to the `Profile` model, kept separate rather than concatenated because the two are different display roles (display face vs body face, per `07` §3). Flagged here per `09` §2.3.
  - `resumeFile` is the one Profile field still open — see below.
- [ ] **`Profile.resumeFile` not set.** No resume file has been uploaded to Cloudinary (`06` §3.2), and `§3` below hasn't settled PDF-only vs inline preview. The field is optional so the site renders without a resume link rather than a broken one — but `02` §3 and brief §28 put Resume in both header and footer as a top-priority recruiter exit path, so this is worth closing before launch.
- [ ] **`Experience` records were never captured.** Smart Technology recurs throughout as the ST Portal's context and `04` §4 names it as the `linkedProjectSlug` example, but no role title, timeframe or summary exists for it or any other engagement.
- [~] **Skill *levels* — narrowed again (2026-08-28), still not closed.** Levels are now assigned on a stated evidence rule: a skill is `strong` when it was **used in one of the five shipped projects**, so every strong claim is checkable against a real case study rather than taken on trust (`01` §9, Rule 1). 16 are strong; **Firebase and Firestore were added as new records** — absent from brief §11's list, but the Scholarship dashboard's actual backend (`03` §4), so better evidenced than several skills the brief does list. C#/.NET/SQL Server Databases are `good`, Node.js `learning`, AI-assisted development tools `interested`. brief §11 was updated so its tier labels use `04` §5's exact enum values and can't drift from the data again.
  - **Still open — and now a mild misstatement, not just a gap:** 20 brief §11 skills weren't named in any tier and stay at `good`, which now reads as "real knowledge, not yet applied in a shipped project." That is demonstrably wrong for **Netlify** (hosts FreshCart), **Responsive Design** and **Lazy Loading** (both claimed in project READMEs), and arguably Reactive Forms, JSON, Component Architecture and Accessibility. Not promoted, because the strong list was given explicitly and inferring past it would be the self-assessment the evidence rule exists to avoid. One editorial pass before the Skills section publishes.
  - Framing note for Phase 3/4, from the same `§11` edit: the serverless/Firebase choice on the Scholarship dashboard was a deliberate scope decision made partly because backend depth is still developing — "not a limitation to hide," and consistent with the philosophy in `§10`. That's guidance for how the About/Skills copy and the case-study Approach block should *frame* the backend story; it does not change any project prose already seeded.
- [x] **Social profile URLs — resolved (2026-08-28).** Instagram and Facebook URLs seeded onto both `SocialPlatform` records. Combined reach is **986,000** — under a million, so it must render as the real figure or "nearing 1M", never "+1M" (brief §20, `03` §8).
- [x] **`BusinessVenture` — resolved (2026-08-28).** Ateeqi Tech seeded with its full narrative plus three labeled metrics (`80+` laptops, `~80,000 EGP` net proceeds, `~1 year`). Qualifiers preserved deliberately: the source says "more than 80" and "roughly 80,000", and rounding those to exact figures would turn a careful claim into a precise one nobody made.
- [ ] **`Education` entries live only in Discovery**, and `10` §2's certificate-date check still applies before any reach the page.
- [ ] **`ProofPoint` deliberately left empty**, not blocked — `04` §11 frames it as a curated subset, so which numbers earn a slot on Home is an editorial call in the dashboard, not something to seed by dumping every available figure.
- [ ] **Media not uploaded.** Five Scholarship screenshots exist under `projects/ScholarshipOperationDashboard/Media/`, but `04` §6 stores a Cloudinary `secure_url` plus a `publicId`, so they need uploading to Cloudinary first (`06` §3.2). None of the other four projects has media. Missing media never blocks a case study going live (brief §32).

---

## 4c. Surfaced During Phase 3 (2026-08-28)

Phase 3 built Home, About/Story, Beyond Code hub + all three subpages, and Contact, against the live seeded content. All seven routes were verified by fetching them from the SSR server and grepping the returned HTML for real values — hero copy, project names, the ~986K combined figure, the Ateeqi Tech metrics, contact channels — not by checking that the build succeeded.

**Corrected while building:**

- [x] **Render mode was wrong.** `app.routes.server.ts` had `RenderMode.Prerender` for `**`, which runs every Firestore read at *build* time and bakes the result into static HTML. `06` §2 rules that out directly — "new projects or bio edits published through the dashboard need to appear without a full rebuild/redeploy cycle." Changed to `RenderMode.Server`, which keeps real HTML in the first response (brief §29) while letting a dashboard publish appear on the next request rather than the next deploy (brief §30–31).
- [x] **Resolver results now cross to the client via `TransferState`.** Angular's hydration transfer cache only covers `HttpClient`, and the Firestore SDK does not use it — so nothing was carried over and the browser would re-read Firestore right after hydrating HTML that already had the answer. `06` §7 asks for minimal reads per page load.

**Open:**

- [x] **`/work` and `/work/:slug` — built (Phase 4, 2026-08-28).** Every nav link now resolves. One template drives all five case studies; the tier system needs no branching, since a compact project simply has no `approach` field.
- [ ] **445 kB of Firestore SDK ships in the initial browser bundle** (measured: `chunk-7QQ67RC2.js`; initial total 768 kB against a 500 kB budget). With SSR + TransferState the browser does not need Firestore for the first paint, but the imports are static so it is bundled anyway. The fix is to load the SDK through a dynamic `import()` behind the data layer, which requires `ContentService` to stop importing `where`/`orderBy` at module scope and pass query descriptors instead. Real work, not a one-liner — flagged for the Phase 8 performance pass rather than done at the end of Phase 3. Relevant to `06` §7 and brief §37, point 10.
- [ ] **Section framings are not in the content model.** `02` §4 asks Home for framing copy per section (Featured Work, How I Work, Story teaser, Beyond teaser, Contact) that `04` has no field for. These live in `src/app/core/content/site-copy.ts`, each traced to the doc line it derives from, alongside the brief §10 process and brief §8 journey arc. No fact about Muhammed is in that file — those all still come from Firestore. If any of it should become dashboard-editable, that is a `04` change to raise (`09` §2.3). `03` §9 also still defers final on-page wording, so treat these as reviewable defaults rather than locked copy.
- [ ] **`/beyond/teaching` is the thinnest page on the site, by necessity.** `04` has no Teaching entity and docs `00`–`10` carry no specifics — no courses, institutions, dates. brief §22 lists "300+ students taught" as a *potential* proof point and then says numbers must be verified before publication; it never was, so it is not rendered. The page says what brief §21 actually states and stops. `02` §8.3 asks for this to stay "proportionate," so thin is correct here rather than a gap to pad — but real material would improve it.

---

## 4d. Surfaced During Phase 4 (2026-08-28)

`/work` and `/work/:slug` built and verified over SSR: all five case studies, both tiers' block ordering, the not-found path, and every `<title>`.

**Corrected while building:**

- [x] **Per-project `<title>` was silently falling back.** A `title:` ResolveFn on the route runs in the *same* resolve step as the data resolvers, so it could not read them — `route.data['project']` was still empty and every case study came out titled "Case study — Muhammed Al-Ateeqi". Caught by grepping the served HTML rather than trusting the route config. Replaced with a `TitleStrategy`, which runs after resolution. This is not cosmetic: `02` §6 requires a case study to stand alone as a forwardable link, and brief §29 makes search presence a first-class goal — the `<title>` is what a search result and a link preview lead with. Verified: all five now carry their project name; the not-found page stays generic so a guessed slug is never confirmed as an existing draft (`05` §6).

**Open:**

- [x] **Soft 404 fixed (2026-08-31).** `/work/<unknown>` now returns a real 404 while still rendering the not-found view. Implemented by intercepting `writeHead`, not `res.status()`: `writeResponseToNodeResponse` writes the render's own 200 and overwrites anything set beforehand — the first attempt did exactly that and silently kept returning 200. The slug list comes from the same Firestore data the page renders from, and a failed lookup leaves the status alone so a transient hiccup never 404s a real page. Verified: real slugs 200, unknown slugs 404.
- [x] ~~The not-found case study returns HTTP 200, not 404.~~ `/work/<anything>` matches the route and resolves to `null`, so the component renders a proper not-found view — but the status line still says 200. That is a "soft 404", which search engines treat poorly and which conflicts with brief §29's discoverability goal. Fixing it means setting the response status from inside SSR. **Belongs with the Phase 6 SEO work**, alongside meta/OG tags and the sitemap.
- [ ] **A transient Firestore `permission-denied` was observed once during SSR** (server log: `[firestore] read failed for "projects"`), on the first request after a server restart. Not reproducible — the same four queries ran 3/3 clean immediately afterward, and the page rendered fully on the next request. `ContentService` caught it and returned `[]`, which is the designed degradation (`04` §1.2), so nothing crashed. **But that is exactly the risk worth naming:** a transient read failure produces a page that is silently missing a section — a Home with no Featured Work — with only a line in a server log to say so. Worth a retry-once on read failure, or at minimum log-based alerting, in the Phase 8 pass.

---

## 4e. RESOLVED — the draft model (2026-08-28)

Phase 5's auth foundation is built — sign-in, route guard, client-rendered `/admin`, the shell, and an overview. Building the first content screen surfaced a **genuine conflict between two documents**, not a gap:

- **`05` §2 requires:** "any change (new project, edited bio, updated skill list) saves as a draft. **The live site is unaffected.**"
- **`04` §12 provides:** one `status` field per document (`draft | published`), and `06` §3.1 restates it — public queries filter `status == 'published'`.

A single `status` field on a single document **cannot represent both states at once.** Editing a live project means flipping it to `draft`, which removes it from the public site until republished — the opposite of "the live site is unaffected". The current model works for *new* content going live for the first time; it breaks the moment Muhammed edits something already published, which is the ordinary case two years from now (`05` §0's own test).

**Resolved: option A.** A pending edit lives in `/drafts/{entity}__{docId}`, admin-only for read and write; Publish copies it over the live document and deletes the draft. Recorded in `04` §12.1 and verified live — an unauthenticated client gets `permission-denied` both listing `drafts/` and reading a specific draft. The three options considered:

- **A — separate `drafts/` collection (recommended).** A pending edit is written to `drafts/{collection}/{id}`; the live document is untouched until Publish copies the draft over it and deletes it. Satisfies `05` §2 *and* `05` §6, because `drafts/` gets admin-only read rules — draft content is genuinely unreachable, not merely unrendered. Cost: one extra collection, a merge-on-publish step, and an addition to `04` §12.
- **B — a `draft` map field on the same document.** Simplest to write, but **fails `05` §6**: Firestore rules grant or deny whole documents and cannot hide a field, so anything in `draft` would be readable by any visitor who opens a console. Recorded here so it is rejected on the record rather than rediscovered later.
- **C — keep `04` §12 exactly as written.** Editing a live entity takes it off the public site until republished. Honest to the current schema, but it contradicts `05` §2 and makes routine edits risky on a site whose whole premise is credibility.

Preview is already cheap under any of these: the public page components take their data through `input()`, so `/admin/preview/...` can render the real `CaseStudy` or `Home` component with draft data passed in — no duplicate "preview version" of any template.

---

## 4f. Phase 5 status (2026-08-28, updated 2026-08-30)

**Built and building clean:** sign-in (email/password + Google), route guard, client-rendered `/admin`, the shell, Overview, **Profile editor**, **Projects list + editor**, **Skills editor**, **Preview**, and the whole Draft → Preview → Publish machine in `AdminService`.

Verified against live Firestore, unauthenticated: `drafts/` refuses both list and read; writes to `drafts/`, `projects/`, `profile/` and `skills/` are all refused. `/admin` and `/admin/login` return only the app shell from the server, with no dashboard markup.

**Update 2026-08-30 — smoke test passed, and the rest of the phase is built.** Publish works end to end (confirmed by Muhammed: a Profile edit went live). Since then: the `/about` preview gap is fixed, Experience is built as an accordion, the four reference screens exist, and Cloudinary upload is built. All nine `05` §3 sections now have a screen.

- [x] **The `/about` preview gap — fixed.** `About` now takes an optional profile input, so the Profile draft previews through the real page instead of a copy of its markup, matching how `/work/:slug` already worked. The Profile screen also states which public page each field feeds, since those fields drive Home, About, the footer and Contact — which is what made a bare "Preview" button ambiguous.
- [x] **Seed made entity-selective — this was a live hazard.** The hero statement had been edited and published through `/admin`, while `seed-data.ts` still carried the older copy. A blanket re-run to add Experience and Education would have silently reverted a published edit. Entities must now be named (`npx tsx tools/seed/seed.ts experience education`) or `--all` passed; running it bare lists options and writes nothing.
- [ ] **`seed-data.ts` PROFILE is now stale against production**, and so is `01` §5. Live hero reads *"Building immersive web apps from concept to cloud"*; the doc and the seed still carry *"Building practical software for problems I live with"*. Not reconciled either way, because which one is intended is Muhammed's call — but they should not stay divergent, since `01` §5 still says "FINAL — locked".
- [ ] **Experience and Education are written but not seeded.** Needs one run: `npx tsx tools/seed/seed.ts experience education skills` (skills included for the three new production practices). Safe — it touches only those three collections.
- [ ] **The authenticated write path beyond Profile publish is still untested.** Every check above proves what a *signed-out* client cannot do. Saving a draft, publishing, and discarding have only been type-checked and built — not run against the live project, because that needs the admin credentials. **First thing to do: sign in at `/admin`, edit the Profile, Save draft → Preview → Publish, and confirm the change appears on `/about`.**
- [x] **All five remaining entity screens built** (2026-08-30): Experience as an expandable accordion (structural — four roles expanded at once buries the ordering, which is the thing most often being checked), plus Social Platforms with the stale-date flag `05` §3.7 asks for, Business Ventures, Education and Proof Points.
- [x] **Media upload built** (`05` §3.4, §4): multi-file drag-and-drop straight from the browser to Cloudinary via the unsigned preset, with per-file progress. **Alt text is required before an image becomes a `Media` document** — an upload lands in a pending list until it is described, which is where `04` §6's required `alt` gets enforced in practice rather than hoped for. Still no images on any case study until someone actually uploads some.
- [ ] **Media upload has not been run against Cloudinary.** Same limitation as the write path — it type-checks and builds, but no file has actually been uploaded through it.
- [ ] **Project ordering is a number field, not drag-and-drop** (`05` §3.3). It writes the same `order` field; the honest interim rather than a fake affordance.
- [ ] **`Profile.resumeFile` is still a URL text field** (`05` §3.2 wants upload-and-replace-in-place). The upload service now exists and is project-scoped; pointing it at a resume path is small but not done.
- [x] **Experience now renders on `/about`** (2026-08-30), appended after the journey narrative per `02` §7 item 4. Built on native `<details>` rather than a click handler: that gives keyboard support, ARIA semantics and screen-reader announcement for free, and it works in the server-rendered HTML before any JavaScript loads — which matters on the page whose whole job is being read. First role open by default (it is the current one); the rest collapsed so the sequence stays scannable.
- [x] **Cloudinary upload verified end to end** (2026-08-30): unsigned upload accepted, `public_id` and `secure_url` returned, and the derived `f_auto,q_auto,w_1200` delivery URL serves HTTP 200. **One orphan to clean up** — the test asset is at `ateeqi-portfolio/projects/_upload-test/akteoollvqyvo74elul3` and has to be deleted from the Cloudinary console, since unsigned uploads carry no delete capability (`04` §6's accepted gap, working exactly as described).
- [ ] **A third `04` §4 schema change: `order: number` on Experience.** `02` §7 asks for reverse-chronological order, but `timeframe` is free text ("Apr 2026 – Present", "Sep 2023 – Dec 2023") and cannot be sorted — parsing dates out of prose breaks the first time a format varies — and Firestore returns documents unordered without an explicit `orderBy`. So the intended order is stored, exactly as `Project` does for the same reason (`04` §3). Needs adding to `04` §4's table.
- [ ] **Old blocker, kept for the record: Experience had no public home.** Four roles are about to be seeded, but `02`'s IA has no Experience page — `02` §13 says this kind of supporting content lives inside Work/About rather than as its own destination. Where it surfaces (probably `/about`) is an open design decision, not an oversight.
- [ ] **Two `04` §4 schema changes made on 2026-08-30**, raised per `09` §2.3: `tech?: string[]` added to Experience, and `linkedProjectSlug` widened to `linkedProjectSlugs: string[]` because the Smart Technology role produced two of the seeded projects and a singular field would have to drop one.

---

## 4g. Phase 6 — SEO (2026-08-31)

Built and verified by fetching all eleven public routes from the SSR server and parsing the returned `<head>`: canonical, description, Open Graph and JSON-LD are present on every one. `Person` on `/` and `/about`, `CreativeWork` on each case study, none on the rest.

- `sitemap.xml` is generated per request from live Firestore via the REST API, so a dashboard publish appears in it without a redeploy (`06` §6). `/admin` and `/styleguide` are excluded.
- `robots.txt` allows everything public and disallows `/admin` and `/styleguide`, and advertises the sitemap.
- Descriptions come from Firestore (`bioShort`, a project's `tagline`), never hand-written duplicates that would drift from the content they summarise.

**Two bugs caught by checking the served HTML rather than trusting the code:**

- **NG0203 — `inject()` outside an injection context.** `absoluteUrl()` called `inject(REQUEST)`, which is fine in a constructor but throws from `ngOnInit`. It failed on exactly the three pages that build JSON-LD, and the thrown error cost them *every* meta tag while the page still rendered normally — so nothing looked wrong. Fixed by resolving the origin once in `SeoService`'s constructor and making the URL joiner pure.
- **Effects do not flush before SSR serialises the HTML.** An effect-based first version emitted no tags at all on the first response — the only response a crawler sees. Now `ngOnInit`.

**Open:**

- [ ] **No production domain, so `SITE_ORIGIN` is empty and the origin is derived per request.** That is correct in dev and on any preview deploy, but it cannot enforce ONE canonical form, which `06` §6 asks for: a site reachable at both a custom domain and a `*.web.app` URL would self-canonicalise each. **Set `SITE_ORIGIN` in `src/app/core/seo/site-url.ts` once the domain exists** — before launch, not after.
- [ ] **No OG images.** The case-study OG image is wired to the project's featured screenshot, but no project has media yet, so shared links preview as text cards. Resolves itself once images are uploaded through the Phase 5 media screen.

---

## 4h. Phase 7 — Motion (2026-08-31)

GSAP added against the finished pages, per `08` Phase 7. Applied sparingly: five Home sections, four case-study narrative blocks, the Work index's secondary cards (small stagger), and the Experience section on `/about`. Plus native view transitions for navigation clarity.

**The rule the implementation is built around** is `07` §5's "a page must be usable the instant it renders, motion or not". The usual scroll-reveal pattern breaks it — `opacity: 0` in CSS, animate to 1 on scroll — because if the JavaScript is slow, blocked or broken, the content is invisible permanently. On a server-rendered site whose premise is being readable and indexable (brief §29), shipping real content and then hiding it with CSS is the worst available failure mode.

So nothing is hidden in CSS. Elements render visible; the directive hides one only *after* JavaScript has run, confirmed motion is wanted, and loaded GSAP. Verified against the served HTML: no `opacity: 0`, `visibility: hidden` or `display: none` on any content. (The one `opacity: 0` present is the status-dot's pulse keyframe — the signature element, correctly disabled under reduced motion.)

Three consequences of the same rule, each deliberate:

- **Elements already in the viewport are never animated.** Hiding what the visitor is looking at to fade it back in is a flicker that delays reading for no storytelling gain. The Hero is therefore never animated at all.
- **`prefers-reduced-motion` exits before GSAP is fetched**, so a visitor who asked for less motion does not download an animation library either.
- **The AI disclosure and data-honesty blocks are not revealed.** brief §14 says the site "should not hide this"; starting them at `opacity: 0`, even briefly, sits against that. They are the one part of a case study that renders instantly, always.

GSAP is dynamically imported and stays out of the initial bundle — verified: the initial total grew 4 kB, and no 68 kB GSAP chunk appears in the initial list.

Page transitions use the browser's native View Transition API rather than a GSAP page transition: it respects reduced motion at the platform level, costs no bundle weight, and degrades to an instant navigation where unsupported.

---

## 4i. Hosting: Vercel, not Firebase Hosting (2026-08-31)

Decision recorded in `06` §3.4. Firebase keeps Firestore + Auth; Cloudinary keeps media; Vercel hosts.

- [ ] **Phase 9 deployment risk, flagged early.** Vercel's default behaviour can silently serve a static `index.html` instead of routing through the Angular SSR server — which would look like a working site while actually shipping an empty shell to crawlers, undoing Phase 6 entirely. Needs an explicit serverless function wrapper plus a `vercel.json` rewrite, **verified by checking the actual served HTML**, not by the deploy reporting success.
- [ ] **Domain:** none yet; a Vercel subdomain temporarily. `SITE_ORIGIN` handling is unchanged — still empty, still derived per request, still needs setting once a real domain exists (§4g).

---

## 5. Post-v1 / Not Blocking Launch

Safe to leave until after the site is live:

- [ ] `SocialVideo` entity (`04` §8) — only needed if/when a curated video archive is ready; the whole site works without it
- [ ] Promoting a compact-tier project to standard/featured later, if more material becomes available for Cyber50, FreshCart, or Nutella (`03` §3)

---

## 6. Resolved During Planning (for reference)

Closed here so they don't get re-litigated during build — the reasoning lives in the referenced section if it needs revisiting:

- Business name is "Ateeqi Tech," not "عتيقتك" (`02`, `04`)
- Angular version target is 21 (latest stable), not a pinned 17 (`06` §1)
- GSAP confirmed as the animation library; specific animated components deliberately left unspecified until build (`06` §1, `07` §5)
- Cyber50's underlying incident data is AI-generated dummy data — disclosed on-page via its own honesty note, separate from the standard AI-build disclosure (`03` §6.1)
- Cyber50's outcome section stays scoped to what was built/delivered — post-assessment hiring details excluded entirely (`03` §6.1, resolved in chat)
- Dashboard doesn't need to share the public site's visual system — it's a functional tool, not a brand surface (`05` §7, `07` §9)

---

## 7. How to Use This File Going Forward

Once build starts, this file should keep working as a living checklist — check items off as they're resolved rather than leaving them ambiguous inside a phase. If a new open question comes up mid-build that isn't covered by `00`–`09`, it belongs here too, not buried in a commit message or a one-off conversation with the agent.
