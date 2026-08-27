# 08 — Implementation Plan

## 0. Purpose

Everything up to `07` was planning. This document turns it into an actual build sequence — what gets built in what order, and what Claude Code needs in front of it at each step. `09-agent-guide.md` will turn this into literal instructions for the tool; this document is the roadmap those instructions follow.

---

## 1. Inputs Claude Code Needs

Before build starts, the project folder should contain:

- `docs/00-project-brief.md` through `docs/10-open-items.md`
- Real project screenshots per `03-case-study-system.md` §7 (per-project folders, once Muhammed has them ready)
- The resume file

`/design-references/` — the four validated mockup screenshots from the Claude Design pass — is deliberately **not** included in the first attempt. See §1a.

Nothing else is required to start — media gaps are never a blocker, per brief §32.

### 1a. Visual Reference Experiment

Phase 1 (Design Tokens & Shared Components) is run once **without** `/design-references/` first, working from `07-design-system.md`'s written rules alone. This is a deliberate test, not an oversight:

1. Build Phase 1 from the docs only.
2. Review the result against the four validated mockup screenshots (kept aside, not deleted).
3. Two outcomes:
   - **Close enough** — the written design system alone produced results consistent with the validated direction. Proceed without ever introducing the screenshots.
   - **Meaningfully off** — restart Phase 1 with `/design-references/` added to the project folder, and explicitly point the agent at the specific screenshot(s) that show what's missing (spacing feel, exact type scale, overall restraint) rather than re-explaining in words what the screenshots already show.

Either way, this comparison only happens once, at the start of Phase 1 — not repeated per component or per phase.

---

## 2. Pre-Build Checklist

Two things surfaced during the design mockup review that need a decision before Claude Code starts building, so they don't get baked into the codebase and need re-fixing later:

1. **Location line** — the mockup invented "Kuwait — remote friendly" on its own; this wasn't in any prompt we sent. Confirm the real location/remote-availability line before it goes into the Hero component.
2. **Orange accent scope** — the mockup used `#FF6B00` on a few non-CTA elements (section eyebrows like "01 — THE PROBLEM," the "IN PLAIN ENGLISH" label, the positioning pill). `07-design-system.md` §2 currently restricts orange to "act on this" only. Decide one of two ways before build:
   - **A**: Keep the rule strict — those elements move to white/gray, orange stays CTA-only
   - **B**: Formally widen the rule to include "labels/emphasis," and update `07` §2 to reflect it

Both are reasonable; the only wrong outcome is leaving it undecided and letting Claude Code guess component-by-component, since that produces exactly the inconsistency the color-role system was meant to prevent.

---

## 3. Build Phases

### Phase 0 — Scaffold
- Angular 21 project init, standalone components, Tailwind configured with the color tokens from `07` §2 as CSS variables/Tailwind theme extensions (not hardcoded hex scattered through components)
- Folder structure reflecting the IA in `02` §2
- Firebase project connected (Firestore, Storage, Auth, Hosting) per `06` §3

### Phase 1 — Design Tokens & Shared Components
- Typography scale, spacing scale, and the three type roles from `07` §3 set up as reusable, sitewide primitives
- Core components built once, reused everywhere: buttons (primary/secondary), tags/pills, cards, the status-dot signature element from `07` §6
- Built directly against the four validated mockup screenshots as ground truth — this phase is where the visual reference earns its keep
- Resolve the Pre-Build Checklist decisions here, before these components multiply across pages

### Phase 2 — Content Layer
- Firestore collections from `06` §3.1, matching the schema in `04-content-model.md`
- Seed with the real content already written: the Scholarship Dashboard and ST Employees Portal worked examples from `03` §4–5 go in close to verbatim; the Cyber50, FreshCart, and Nutella compact entries from `03` §6 go in as-is
- `Profile` singleton populated with the corrected location line and verified numbers (§4 below)

### Phase 3 — Public Routes: Static-Feel Pages
- Home, About/Story, Beyond Code hub + subpages, Contact — built against real seeded content, not placeholder text
- Draft/Publish filtering wired in from the start (per `06` §3.1) rather than retrofitted later

### Phase 4 — Case Study Dynamic Route
- `/work/:slug` template built once, driven by Firestore, per the tier system in `03` §3
- AI disclosure and data-honesty-note components built as reusable blocks (per `04` §3), not copy-pasted per project — this is what keeps the honesty standard consistent as projects are added later

### Phase 5 — Dashboard
- Auth-guarded `/admin` routes per `05` §3, one screen per entity
- Draft → Preview → Publish workflow wired end to end — this is worth building correctly here rather than bolting it on afterward, since every content screen depends on it

### Phase 6 — SEO Implementation
- Meta/OG tags, JSON-LD, sitemap.xml generation, robots.txt — per `06` §6, all driven from the same Firestore data the pages render

### Phase 7 — Motion Pass
- GSAP effects added last, against real finished pages — per the earlier decision not to pre-build speculative animated components
- Rules from `07` §5 apply: navigation clarity or storytelling only, `prefers-reduced-motion` respected, nothing delays content access

### Phase 8 — QA & Accessibility Pass
- Contrast check specifically on `#888888` and `#E59400` against both background colors, flagged as a likely trouble spot in `07` §8
- Keyboard focus states, responsive check down to small mobile
- Verify unpublished/draft content is genuinely unreachable, not just hidden from nav (per `05` §6)

### Phase 9 — Deploy
- Firebase Hosting per `06` §3.4
- Final sitemap/robots verification live, not just in staging

---

## 4. Content Accuracy Checklist (before Phase 2 seeding)

Carried forward from earlier documents so nothing gets seeded wrong:

- Social follower count: real combined figure or "nearing 1M" — never "+1M" (per `03` §8)
- Laptops sold / Ateeqi Tech net proceeds: 80+ laptops, ~80,000 EGP — usable as stated
- Cyber50 Dashboard outcome: scoped to what was built and delivered, no post-assessment hiring details (per the correction already made to `03` §6.1)
- Business name: "Ateeqi Tech" everywhere, not "عتيقتك" (per the correction already made to `02` and `04`)

---

## 5. What Claude Code Should Not Do Without Asking

- Invent metrics, dates, or outcomes not present in `03`/`04` — if a field is genuinely missing, it should render as absent, not filled with a plausible-sounding placeholder (this is exactly how "Kuwait — remote friendly" got invented in the mockup pass, and it's worth carrying the lesson into the real build)
- Skip the AI disclosure or data-honesty-note blocks on any project that needs them
- Change the color-role rules from `07` §2 without flagging it — if a component seems to need an exception, that's a design decision to surface, not one to make silently

---

## 6. What's Deferred

- Literal prompts/instructions for Claude Code itself → `09-agent-guide.md`
- Any remaining unresolved questions (e.g., exact resume format, whether social videos ship in v1) → `10-open-items.md`
