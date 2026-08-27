# 10 — Open Items

## 0. Purpose

Every planning document from `00` to `09` flagged something as unresolved, deferred, or "verify before publishing." This document is the single place those all land, so nothing gets lost between "planning" and "design → Claude Code → build." Before starting a phase in `08-implementation-plan.md` that touches one of these areas, check here first.

---

## 1. Must-Resolve Before Build Starts

These block Phase 1 of `08-implementation-plan.md` — everything else can proceed around them, but these two shouldn't be left for the agent to guess.

- [~] **Real location line for the Hero.** The design-mockup pass invented "Kuwait — remote friendly" with no basis (per `08` §2). Confirm the actual line — location, remote availability, whatever's accurate — before it goes into the `Profile` content or the Hero component.
  - **Partially resolved (2026-08-27).** Shape confirmed: **remote availability only** — no city or country named. The exact wording is still outstanding. Nothing has been written into any component, and the invented line has not been replaced with a guess. Did not block Phase 1; **blocks the Hero in Phase 3** and the `Profile` seed in Phase 2.
  - Note for whoever writes it: `04` §2's `Profile` schema has **no location/availability field**. Adding one is a schema change to raise deliberately (per `09` §2.3), not to slip in silently.
- [x] **Orange accent scope.** Decide between keeping `#FF6B00` strictly CTA-only, or formally widening `07-design-system.md` §2 to also cover labels/emphasis (per `08` §2, Option A vs B). Whichever is chosen, update `07` §2 itself so the rule stays accurate for whoever builds against it.
  - **Resolved (2026-08-27): Option A — strict.** Orange marks interactive elements only: buttons, links, focus rings. Section eyebrows, the "in plain English" label and the positioning pill use white / `#888888`, with the monospace face carrying their distinctiveness instead. `07` §2 was already written this way, so **no amendment was needed** — the rule stands as-is.
  - Enforced in code, not just documented: the token is named `--color-action` (role, not hue), and `UiStatusDot` has no colour/tone input at all, so the teal functional accent cannot be repurposed decoratively.

---

## 2. Content Verification Needed

Not blockers, but must be confirmed before the relevant content goes live (per `00` §22, `03` §8):

- [ ] Final combined social reach figure — real number, not "+1M" (currently ~986K per `03` §8)
- [ ] Final Hero one-line identity statement — brand doc §5 left four directions (A–D) open; none has been locked yet
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

Phase 2's data layer, security rules and seed content are built. Writing the seed against `03`/`04` surfaced a clear split: **three of five projects have real, written case-study prose, and the rest of the content model does not.** Nothing below was filled in with a plausible-sounding placeholder (`09` §3, `08` §5) — each gap is a specific missing sentence or fact, and it is recorded in code as well, in `site/tools/seed/seed-data.ts`'s `UNSEEDED` array, which the seed script prints on every run.

**Seeded and ready** — verbatim from `03` §4–6: Scholarship Operation Dashboard (featured, all six blocks), ST Employees Portal (standard), Cyber50 Dashboard (compact, with its data-honesty note). Plus the full categorised skill list from brief §11 and both social follower counts from brief §20.

Blocking, roughly in the order Phase 3 will hit them:

- [ ] **`Profile` cannot be seeded at all.** `heroStatement` is still unlocked (§2 above), `bioShort` / `bioLong` have never been written, and **no contact details exist anywhere in `00`–`10`** — no email, no LinkedIn URL, no GitHub URL, no Instagram or Facebook URL. `02` §3 puts Email/LinkedIn/GitHub in the footer of every page, so this blocks the Hero, the Contact page and the footer.
- [ ] **FreshCart and Nutella Digital Menu have facts but no prose.** `03` §6 gives one pointer line each and defers the write-ups to `04`, which never wrote them; `03` §9 separately defers "final on-page copy." Both READMEs supply real technical detail (see `UNSEEDED` for what's usable). Two compact-tier write-ups are needed — and per `03` §6, Nutella's should be framed as the clearest "builds without being asked" evidence in the set.
- [ ] **`Experience` records were never captured.** Smart Technology recurs throughout as the ST Portal's context and `04` §4 names it as the `linkedProjectSlug` example, but no role title, timeframe or summary exists for it or any other engagement.
- [ ] **Skill *levels* are placeholders.** Names and categories are real (brief §11), but the brief states no proficiency per skill, and `04` §5's Strong/Good/Learning/Interested framing comes from Discovery, which isn't reproduced in `00`–`10`. Everything except the aspirational "Expanding Toward" group is seeded `good` as a marked placeholder. Needs one editorial pass — guessing `strong` would assert a proficiency Muhammed hasn't asserted (`01` §9, Rule 4).
- [ ] **Social profile URLs missing.** Counts are verified; the Instagram and Facebook URLs are recorded nowhere, so `/beyond/social` can state reach but can't link out.
- [ ] **`BusinessVenture` summary missing.** The metrics are verified and usable ("80+ laptops", "~80,000 EGP net proceeds"), but the customer-first laptop narrative `04` §9 calls for hasn't been written.
- [ ] **`Education` entries live only in Discovery**, and `10` §2's certificate-date check still applies before any reach the page.
- [ ] **`ProofPoint` deliberately left empty**, not blocked — `04` §11 frames it as a curated subset, so which numbers earn a slot on Home is an editorial call in the dashboard, not something to seed by dumping every available figure.
- [ ] **Media not uploaded.** Five Scholarship screenshots exist under `projects/ScholarshipOperationDashboard/Media/`, but `04` §6 stores a URL, so they need to go to Storage first (`06` §3.2). None of the other four projects has media. Missing media never blocks a case study going live (brief §32).

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
