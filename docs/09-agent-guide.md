# 09 — Agent Guide

## 0. Purpose

This document is written TO the agent building this project (Claude Code or equivalent), not about it. Read this first, in full, before writing any code. Everything else in `docs/` is reference material this guide tells you how to use.

---

## 1. Reading Order

Before touching code:

1. `00-project-brief.md` — why this site exists, who it's for
2. `01-brand-and-voice.md` — tone, positioning, writing rules
3. `02-information-architecture.md` — the sitemap and page structure
4. `03-case-study-system.md` — the actual project content (this is real, near-final copy, not placeholder)
5. `04-content-model.md` — the data schema
6. `05-dashboard-requirements.md` — the admin tool's requirements
7. `06-technical-architecture.md` — stack, rendering strategy, Firebase structure
8. `07-design-system.md` — color roles, typography, layout, the signature element
9. `08-implementation-plan.md` — the build sequence you're executing, including the Pre-Build Checklist and the Visual Reference Experiment in §1a
10. `10-open-items.md` — anything still unresolved; check before starting a phase that touches an open item

Do not skip to code because a request sounds simple. A "add a button" task still inherits the color-role rules, the component patterns, and the writing rules from the docs above.

**On `/design-references/`**: per `08` §1a, this folder is deliberately absent on the first Phase 1 attempt. If it isn't in the project folder, that's not a missing input — build Phase 1 from `07-design-system.md`'s written rules alone. Only treat `/design-references/` as ground truth if and when it's added after a review round.

---

## 2. Source of Truth Hierarchy

When two things seem to conflict, resolve in this order:

1. **Explicit corrections logged in this doc set** (e.g., "Ateeqi Tech" not "عتيقتك"; social numbers per `03` §8) always win over anything that reads otherwise elsewhere.
2. **`07-design-system.md`**, as amended by the Pre-Build Checklist resolution in `08` §2, governs all visual decisions.
3. **`04-content-model.md`** governs data shape. If the design mockups show a field that isn't in the schema, that's a signal to raise, not to silently add.
4. **`03-case-study-system.md`**'s worked examples are the actual content for the two featured/standard projects — don't rewrite their substance, only adapt formatting as the component structure requires.
5. If `/design-references/` is present (post-review round, per `08` §1a), the screenshots show visual intent but were generated from partial content — e.g., they once invented a location line that isn't real. **Never treat something in a screenshot as fact just because it's rendered.** Cross-check anything that looks like a specific claim (locations, numbers, dates) against `03`/`04` before using it.

---

## 3. Hard Rules — Do Not Deviate Without Asking

These come directly from decisions already made earlier in planning. Violating them silently is a bigger problem than asking a clarifying question.

- **Never invent a fact.** Not a location, not a metric, not an outcome, not a company name. If content model + case study docs don't have it, leave the field empty or flag it — don't fill it with something plausible-sounding. (This is not hypothetical: the design-mockup pass already did this once with an invented location line — see `08` §2.)
- **Never skip an AI disclosure or data-honesty-note block** on a project that has one defined in `03`.
- **Never use the functional accent (`#00D68F`) decoratively.** It means "live/verified/working" — nowhere else.
- **Never widen or narrow the primary accent (`#FF6B00`) usage** beyond whatever the Pre-Build Checklist resolved in `08` §2, without flagging the change explicitly.
- **Never expose draft/unpublished content** at a reachable URL, even unlinked (per `05` §6) — check this is actually true at the query level, not just the UI level.
- **Never build the two-tier auth, comments, or any multi-user feature.** This is explicitly single-admin (`05` §1). Adding "just in case" user infrastructure is scope creep, not thoroughness.

---

## 4. Handling Ambiguity

When something isn't specified:

1. Check if `03` or `04` already answers it in different words before assuming it's genuinely undefined.
2. If it's genuinely undefined and low-stakes (a spacing value, a hover transition duration), make a reasonable choice consistent with `07`'s stated principles and move on — don't stall on trivial decisions.
3. If it's genuinely undefined and touches content accuracy, visual identity rules, or scope — stop and ask, rather than guessing. The cost of a wrong guess here (a fabricated detail on a personal credibility site) is much higher than the cost of a question.

---

## 5. Code Conventions

- Angular 21, standalone components throughout — no NgModules unless a specific library requires one
- `OnPush` change detection as the default (per `06` §7), not an exception
- Tailwind for styling, using the color tokens from `07` §2 as named theme values — never a raw hex code typed directly into a template or component style
- Component structure mirrors the IA (`02`): route-level components per page, shared components (button, tag, card, status-dot) in a common/shared folder used everywhere rather than reimplemented per page
- Firestore access goes through typed service classes matching `04`'s entities — no ad-hoc queries scattered through components

---

## 6. Commit & Checkpoint Discipline

- Commit at the end of each logical unit of work (a component, a route, a Firestore service) with a message that says what changed and why in plain language — not "wip" or "fixes"
- **Pause for review at the end of each Phase in `08-implementation-plan.md`**, not just at the very end of the whole build. This project represents Muhammed professionally — a wrong assumption compounding silently across 9 phases is much worse than a short pause every phase to confirm direction.
- Phase 1 (design tokens/components) and Phase 2 (content seeding) are the two highest-value checkpoints — visual identity and factual accuracy are the two things most expensive to fix after they've spread across many files.

---

## 7. Definition of Done (per phase, applies throughout)

A phase isn't done when the code compiles. It's done when:

- It matches the relevant doc(s) above, not just "looks reasonable"
- Nothing in it was invented (§3)
- It respects the color-role and typography rules from `07`
- Accessibility basics from `07` §8 hold for anything newly built (contrast, focus states, reduced motion)

---

## 8. What's Deferred

- Any specific open question not yet resolved anywhere in `00`–`08` → `10-open-items.md`, which should be checked before starting a phase that touches the unresolved area
