# 07 — Design System

## 0. Purpose

`00` and `01` set the constraints (palette, no-gos, motion philosophy, personality). This document turns those constraints into an actual, opinionated system: named color roles, a real typography pairing, a layout rhythm, and one signature element the site will be remembered by.

Nothing here is generic-safe by default. Every choice below is justified against something specific to Muhammed — his actual palette, his actual projects, his actual story — not a template that would work for any developer portfolio.

---

## 1. Where This Has to Avoid the Obvious

Worth naming directly: a near-black background with a single bright accent color is one of the most common AI-generated design defaults right now. Muhammed's palette (§23 in the brief) genuinely is dark-plus-accent — so the risk here isn't the base direction, it's executing it generically. The way this system avoids that:

- The dark isn't pure, cold black everywhere — `#140A03` (a warm near-black) does real work as a secondary surface, giving the palette warmth instead of the flat "dark mode default" feel.
- The accent isn't a single decorative color — orange, amber, and teal each have a distinct, functional job (§2), not just "the brand color used everywhere."
- The signature element (§6) comes directly from Muhammed's actual project pattern (he's built three dashboards), not from a decorative flourish unrelated to his work.

---

## 2. Color System

Six roles, built from the exact palette in `00-project-brief.md` §23 — nothing added, nothing dropped.

| Hex | Role | Reasoning |
|---|---|---|
| `#000000` | Primary background | The base — most of the site sits on true black |
| `#140A03` | Secondary surface | Cards, project panels, raised sections — a warm near-black instead of a flat gray, so surfaces feel like depth, not just opacity layers |
| `#FF6B00` | Primary accent | CTAs, links, the one color that says "this is interactive" — carries the confident/energetic side of the personality (brand doc §6) |
| `#E59400` | Secondary accent | Hover/active states, gradients paired with the primary accent — never used alone as a standalone brand color |
| `#00D68F` | Functional accent — status only | Reserved specifically for "live," "verified," "working" indicators — chosen deliberately because three of Muhammed's five projects are literally operational dashboards that use status color to mean something real. This color is never decorative; if it's on screen, it's telling the visitor something is active/confirmed |
| `#FFFFFF` | Primary text | Headlines, primary body copy on dark surfaces |
| `#888888` | Secondary text | Captions, metadata, timestamps, tech tags — anything that should read as supporting information, not the main message |

**Rule**: orange (`#FF6B00`/`#E59400`) means "act on this." Teal (`#00D68F`) means "this is confirmed/working." The two accents are never used interchangeably — that discipline is what keeps the palette from reading as decoration.

---

## 3. Typography

Three roles, per the design-principles standard of a characterful display face used with restraint, a complementary body face, and a utility face.

| Role | Direction | Why |
|---|---|---|
| **Display** | A bold, geometric sans with real character (e.g. Clash Display or a comparable expressive grotesk) | Carries the "confident" personality trait in headlines and section openers — used sparingly, large sizes only, never for body copy |
| **Body** | A clean, highly legible neutral sans (e.g. General Sans or Inter) | Long-form reading — the Story page and case study prose need a face that disappears and lets the writing carry the weight (per brand doc §8–9) |
| **Utility / Data** | A monospace face (e.g. JetBrains Mono or Space Mono) | Used specifically for tech stack tags, timestamps, proof-point numbers, and code-adjacent labels — this is not a random third font choice, it's a direct nod to Muhammed's actual identity as an engineer, and it's the typographic half of the signature element in §6 |

The monospace utility face should appear consistently in the same handful of places sitewide (stack tags, stat labels, dates) so it reads as an intentional system, not an inconsistent flourish.

---

## 4. Layout & Spacing

- **Base spacing unit**: 8px scale (8/16/24/32/48/64/96...) — predictable rhythm, easy to reason about across a project this size
- **Container**: a single max-width content column for readability on Story/Case Study pages; Work index and Home sections can break wider for project grids
- **Grid**: 12-column on desktop, collapsing to a single column well before mobile — no exotic asymmetric grid system needed; the personality comes from typography and motion, not layout gymnastics (consistent with brief §24's rejection of "overly decorative UI")
- **Breakpoints**: mobile-first, with the usual tablet/desktop/wide steps — nothing unusual required here given the content types involved (text, project cards, media)

---

## 5. Motion System

Builds directly on `06-technical-architecture.md`'s confirmed choice of GSAP, and the philosophy already locked in `00` §25 and `01` §21. This document does not pre-specify individual animated components (per the earlier decision not to over-build speculative effects) — it sets the rules those future decisions have to follow:

- Every animation must support either **navigation clarity** or **storytelling** — nothing decorative-only
- Scroll-based reveals: subtle, single-direction, no parallax stacking
- `prefers-reduced-motion` is respected everywhere motion is used, without exception
- No animation should delay a visitor's access to real content (brief §25) — a page must be usable the instant it renders, motion or not

Specific effects (what animates, when, how) get decided during actual build against real content — not speculated here.

---

## 6. Signature Element: The Status Indicator

Per the design-principles standard of one memorable, justified risk rather than scattered decoration.

**The choice**: a small, deliberate "live status" motif — a subtle dot/pulse using the teal functional accent (`#00D68F`) — used as a recurring visual signature across the site, not just inside literal dashboards.

**Why this, specifically, for Muhammed**: three of his five projects are operational dashboards where a status indicator means something real — a group that's covered, a lecture that's uploaded, an attack that's detected. Instead of inventing an unrelated decorative signature, this system borrows that exact visual language and lets it recur quietly outside the case studies themselves — e.g. next to "available for opportunities" in the Hero, next to a project's live-demo link, next to a resume's last-updated date.

It's a small detail, used with restraint (a handful of appearances, never as a dominant graphic), but it's the one thing on the site that's unmistakably drawn from Muhammed's actual body of work rather than from a generic UI kit.

---

## 7. Component Patterns

High-level only — full specs belong in implementation, not this planning document.

- **Buttons**: primary (solid orange, used for the one main action per section — Resume, View Work), secondary (outline/ghost, on `#140A03` surfaces)
- **Tags/pills**: monospace utility face, used for tech stack labels on project cards and case studies — small, muted (`#888888` text), never competing with headline text
- **Cards**: `#140A03` surface, minimal border, no drop-shadow-heavy "floating card" cliché — depth comes from the surface color shift, not shadow stacking
- **Timeline** (for the Story page's journey, per `02` §7): a simple vertical or horizontal sequence — this is one of the rare cases where numbered/sequential markers are actually justified, since the content genuinely is a real ordered timeline (per the design-principles caution against decorative numbering)
- **Media framing**: project screenshots shown in a clean, minimal browser-chrome or device frame — consistent across all five projects so the case studies feel like one system, not five different treatments

---

## 8. Accessibility & Quality Floor

Non-negotiable baseline, regardless of how the visual direction evolves further:

- Text contrast meets WCAG AA against both background colors (`#000000` and `#140A03`) — worth double-checking specifically for `#888888` secondary text and `#E59400` on dark, since mid-tone colors on dark backgrounds are the most common place contrast quietly fails
- Visible keyboard focus states on every interactive element
- `prefers-reduced-motion` respected sitewide (already stated in §5, repeated here because it's a hard requirement, not a nice-to-have)
- Fully responsive down to small mobile screens

---

## 9. What's Deferred

- Exact animated component implementations → design/build phase, against real content
- Final typeface licensing/self-hosting decisions → `08-implementation-plan.md`
- Dashboard (admin) visual treatment — per `05` §7, it doesn't need to share this system at all; it can use a plainer, purely functional UI
