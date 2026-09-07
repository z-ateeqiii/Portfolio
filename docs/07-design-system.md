# 07 — Design System

## 0. Purpose

`00` and `01` set the constraints (palette, no-gos, motion philosophy, personality). This document turns those constraints into an actual, opinionated system: named color roles, a real typography pairing, a layout rhythm, and one signature element the site will be remembered by.

Nothing here is generic-safe by default. Every choice below is justified against something specific to Muhammed — his actual palette, his actual projects, his actual story — not a template that would work for any developer portfolio.

### 0.1 Source of truth for visual direction (2026-09-07)

**`design-reference/` is now the source of truth for visual direction.** Where anything in this document conflicted with fully matching that reference, this document has been updated to match it — not the other way round. The specific supersessions are marked inline below:

| What changed | Where | Superseded |
|---|---|---|
| Orange now covers section markers, not only controls | §2 | `08` §2 "Option A" (strict) |
| Oversized condensed display size + a mono tracking scale | §3, §3a | §3 had no size scale at all |
| The photo-strip layered composition | §4a, §5a | — (new) |
| Hero parallax is permitted; reveals have three modes; ambient motion exists | §5 | §5's "no parallax stacking" |
| Media framing is the viewfinder + desaturation, not browser chrome | §7 | §7's "browser-chrome or device frame" |

Two rules did **not** move, and are not open to a visual argument: `prefers-reduced-motion` is respected without exception (§5, §8), and the performance budget in §8a holds. Every effect below was chosen to fit inside both.

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

**Rule** (restated 2026-09-07, superseding `08` §2 "Option A"): orange (`#FF6B00`/`#E59400`) marks **the spine of a page** — both the things a visitor can act on, and the markers that say where they are in the structure. Teal (`#00D68F`) means "this is confirmed / working." The two accents are never used interchangeably.

Concretely, orange is for:

- **Controls** — buttons, links, focus rings, control edges on hover. Unchanged.
- **Section markers** — the eyebrow label that opens a section, its ordinal, and the small 6px square that precedes it. This is what changed.
- **Rhythm marks** — the 9px outlined diamond/square/circle on stack tags, the journey-spine dots, the disclosure toggle.

And orange is **never**:

- a large filled area — it appears as a border, a 6-9px mark, or 12px of text, never as a panel background;
- anywhere in body prose, a paragraph, or a heading;
- a second meaning for "live" or "verified" — that is teal's job and only teal's.

**Why the change.** Option A made eyebrows deliberately grey so orange could mean exactly one thing. The reference is unambiguous that every section-opening label is `#FF6B00` with an orange square before it, while secondary metadata in the same frames stays `#888888`. The distinction the reference actually draws is **section-opener vs. metadata**, not interactive vs. non-interactive — and the thing that stops an eyebrow being mistaken for a button is its shape and size, not its colour. Twelve pixels of letter-spaced monospace has never been mistaken for a control.

The discipline that mattered in Option A is preserved by the "never" list above: orange stays small, sparse and structural. What it no longer does is stay off the one element the reference most consistently paints with it.

---

## 3. Typography

Three roles, per the design-principles standard of a characterful display face used with restraint, a complementary body face, and a utility face.

| Role | Direction | Why |
|---|---|---|
| **Display** | A bold, geometric sans with real character (e.g. Clash Display or a comparable expressive grotesk) | Carries the "confident" personality trait in headlines and section openers — used sparingly, large sizes only, never for body copy |
| **Body** | A clean, highly legible neutral sans (e.g. General Sans or Inter) | Long-form reading — the Story page and case study prose need a face that disappears and lets the writing carry the weight (per brand doc §8–9) |
| **Utility / Data** | A monospace face (e.g. JetBrains Mono or Space Mono) | Used specifically for tech stack tags, timestamps, proof-point numbers, and code-adjacent labels — this is not a random third font choice, it's a direct nod to Muhammed's actual identity as an engineer, and it's the typographic half of the signature element in §6 |

The monospace utility face should appear consistently in the same handful of places sitewide (stack tags, stat labels, dates) so it reads as an intentional system, not an inconsistent flourish.

### 3a. Scale (added 2026-09-07)

**Display sizes.** Four steps, all fluid via `clamp()`:

| Token | Range | Used for |
|---|---|---|
| `display-hero` | 2.75 → 9rem (11vw) | A page title or a short name. Always paired with `display-condensed`. |
| `display-1` | 2.75 → 5.5rem (7vw) | A section headline that is a full sentence. |
| `display-2` | 2 → 3.5rem (4.5vw) | Sub-section headings, a featured project name, a big number. |
| `display-3` | 1.5 → 2.25rem (2.75vw) | Card headings. |

**`display-hero` is for a NAME, not a sentence.** The `display-condensed` utility that goes with it applies `scaleX(0.93)`, which reads as deliberate on a word and as broken on a paragraph. A section headline that is a full sentence stays at `display-1` however important it is — the Work index heading and the Home hero statement are both governed by this.

`display-hero`'s floor is 2.75rem rather than the reference's implied larger minimum, because at a 3.5rem floor the word "Scholarship" overflows a 320px viewport. See the note in `styles.css`.

**Mono tracking.** Letter-spacing is a hierarchy of its own on the utility face, and there are exactly three steps. A fourth arbitrary value is a bug:

| Token | Value | Used for |
|---|---|---|
| `tracking-wordmark` | 0.38em | The name, in the header and nowhere else. |
| `tracking-label` | 0.24em | Section markers, metadata rows, stat labels. |
| `tracking-mark` | 0.16em | Stack tags — inside a card, where it has to stay readable. |

Templates pick a step through the `mono-wordmark` / `mono-label` / `mono-mark` utilities rather than writing letter-spacing directly.

**Floor**: 12px (`text-label`). The reference sets some labels at 10px; that is below the small-text guidance and is not adopted.

---

## 4. Layout & Spacing

- **Base spacing unit**: 8px scale (8/16/24/32/48/64/96...) — predictable rhythm, easy to reason about across a project this size
- **Container**: two frame widths — `container-content` (58rem) for secondary pages, `container-wide` (78rem) for Home, the Work grid and the case-study frame

**The frame and the measure are two different things** (corrected 2026-09-07). `container-content` was 44rem and was doing both jobs at once: it sized the page frame *and* capped the paragraph. The result was that every element on `/about` — eyebrow, title, rules, the experience list — was pinched to a reading measure none of them needed, and the page read as a narrow strip against the reference's proportions.

They are now separate:

- the **frame** is the container, and it sets where a page's content starts and how wide its structure runs;
- the **measure** is `prose-measure`, capped at `min(100%, 68ch)` — by character count, so it tracks the font rather than the layout and sits inside the 65–75 character band. Widening a frame therefore cannot lengthen a line of prose.

The reference draws exactly this distinction: a 1440px case-study frame with a ~620px text column inside it.

**A page's header and its body must share one container.** Both are centred, so a 58rem body inside a 78rem header steps inward by 10rem on a wide screen and the section headings visibly indent from the page title they belong to. The case study hit this and now uses `container-wide` throughout, with `prose-measure` doing the reading work.

**Page rhythm**, so secondary pages do not each invent their own: header `pt-20 pb-12`, body ending `pb-24`, eyebrow to title `mt-5`.

**Heading sizes follow the content, not the page**: `display-hero` for a title (About, Business, Teaching, Contact, Social Media World, a project name), `display-1` for a heading that is a full sentence (the Work index, the Beyond hub, the Home statement).
- **Grid**: 12-column on desktop, collapsing to a single column well before mobile — no exotic asymmetric grid system needed; the personality comes from typography and motion, not layout gymnastics (consistent with brief §24's rejection of "overly decorative UI")
- **Breakpoints**: mobile-first, with the usual tablet/desktop/wide steps — nothing unusual required here given the content types involved (text, project cards, media)

### 4a. The strip composition (added 2026-09-07)

Every page opens with the same three-layer stack, which is what makes the reference read as one language rather than three similar pages:

1. **Backdrop** — a blurred orange glow anchored off one corner, plus a film-grain overlay. Both decorative, both `pointer-events: none`. Shipped as one component (`ui-strip-backdrop`) with a fixed set of corners and three sizes, so a new page can choose a corner but cannot invent a fourth glow geometry.
2. **Content** — the eyebrow, the title, the supporting line, then the metadata row.
3. **Optional media panel** — a desaturated screenshot with the viewfinder frame, on the opposite side at `lg` and stacked below it under that.

The one requirement on a section using it is `relative`, or the glow anchors to the nearest positioned ancestor instead.

**Nothing clips the glow, and that is the point** (corrected 2026-09-07). Sections used to be `overflow-hidden`, which sliced the glow mid-gradient at the exact pixel the section ended and drew a hard horizontal seam across every page — so a page read as stacked boxes rather than one continuous surface. It was worst on `/about`, where a short header sits above a long column of prose. The glow now ends the way light ends, through its own gradient, and is free to spill into whatever sits above or below. `body { overflow-x: clip }` is what stops the horizontal spill from widening the page; that is the mechanism, not a safety net.

Where a section genuinely must clip — the Hero's parallaxing photo — the clip goes on an inner wrapper around the photo, never on the section itself.

### 4b. The page-level ambient layer (added 2026-09-07)

One fixed layer in the app shell, outside the router outlet, holding a large weak glow and the grain that textures it.

It solves the half of the continuity problem that unclipping does not. Per-section backdrops are destroyed and rebuilt on every navigation, so moving from Work to About swapped the entire lit backdrop and each page felt like a separate document. This layer is never rebuilt — the light behind the site is literally the same element from the first page to the last — and being `position: fixed` it belongs to no section, so there is no edge for it to end at.

Section glows still exist, layered above it for emphasis. The ambient one is deliberately weaker and larger: it is the base light level, not a highlight.

**Why the grain lives with the glow rather than over the whole page**: `mix-blend-mode: overlay` against pure black resolves to black, because overlay doubles the backdrop when it is below 0.5 and twice zero is zero. Film grain is therefore only ever visible where something has already lit the area. Pairing it with a glow is not a stylistic preference; it is the only place it renders at all.

**Intensity varies by content, application does not.** Long-form prose pages (`/about`, the case-study body, `/beyond/*`) get the treatment on the page frame and keep it off the reading column: a glow behind two thousand words fights the reading. That is a decision about how much, not about whether.

---

## 5. Motion System

Builds directly on `06-technical-architecture.md`'s confirmed choice of GSAP, and the philosophy already locked in `00` §25 and `01` §21. This document does not pre-specify individual animated components (per the earlier decision not to over-build speculative effects) — it sets the rules those future decisions have to follow:

- Every animation must support either **navigation clarity** or **storytelling** — nothing decorative-only
- Scroll-based reveals: subtle, single-direction, revealed once
- `prefers-reduced-motion` is respected everywhere motion is used, without exception
- No animation should delay a visitor's access to real content (brief §25) — a page must be usable the instant it renders, motion or not

The last rule has a specific implementation consequence that is easy to get wrong: **nothing is hidden in CSS.** Server-rendered content ships visible and is hidden only after JavaScript has run, confirmed motion is wanted, and loaded GSAP. If any of that fails the page stays exactly as the server sent it. The common alternative — `opacity: 0` in the stylesheet, animated to 1 on scroll — makes content permanently invisible when the JS is slow, blocked or broken, which on an SSR site whose premise is being readable and indexable (brief §29) is the worst available failure mode.

### 5a. The motion system in practice (added 2026-09-07)

The original single fade-and-rise was applied to every section, so an eight-section page performed the identical gesture eight times. That is "one duration for every transition" — motion as a coat of paint rather than as information. What replaced it:

**Scroll reveals — three modes, one directive** (`appReveal`). Elements already in the viewport on load are never animated: hiding what the visitor is currently looking at, to fade it back in, is a flicker that delays reading for nothing.

| Mode | What moves | Where |
|---|---|---|
| `item` | the block, 16px rise | a single section |
| `children` | its children in sequence, 24px, 0.08s apart | prose blocks, metric lists, link rows |
| `grid` | the children as a diagonal wave, using GSAP's grid inference | card grids |

A container with more than 8 children falls back to revealing as one block — staggering twenty cards is 1.6s before the last appears, which stops being a reveal and becomes a queue.

**Hover states — CSS, not GSAP, and deliberately so.** Every hoverable element has a designed transition: cards lift 4px and warm their border, cover images push in and let go of their desaturation, links grow an underline from the left, nav links draw a rule that the active route keeps. All of it animates `transform`, `opacity` and `border-color` only — the same properties, curve and durations a GSAP hover preset would use, on the same compositor path, for zero added bytes, with no first-hover load delay, and working before or without JavaScript. GSAP is kept for what it is genuinely better at: scroll-triggered, staggered, sequenced reveals, where it is already lazy-loaded.

**Hover is never the only feedback.** Every hover state has a `:focus-visible` or `:focus-within` twin, so a keyboard user sees what a mouse user sees.

**Ambient motion — two effects, both slow enough to be atmosphere.** The film grain shimmers on a `steps()` timing function (six discrete repaints in six seconds, which is how real film grain behaves and costs nothing, unlike smoothly interpolating `background-position` on a full-viewport layer at 60fps). The glow breathes over 14 seconds on `opacity` and `scale`, both compositor properties on a layer the blur has already promoted.

**Parallax is permitted, on the Hero only.** Superseding the earlier "no parallax stacking": the photo layer translates against the scroll, transform-only, rAF-throttled, and disabled outright under `prefers-reduced-motion` before a single scroll listener is attached. It is one layer moving against static text, which is what "no stacking" was guarding against.

**Durations are a system**: `fast` 150ms (colour only), `base` 250ms (hovers, reveals), `slow` 420ms (the hero title crossfade, media push-in), plus two ambient durations measured in seconds. Easing is `ease-out-soft` for entrances and `ease-out-strong` for feedback — a hover should arrive decisively rather than glide.

**How to reference a token from a Tailwind class, and the one way that silently fails.** Tailwind v4 takes a CSS variable in *parentheses*: `duration-(--duration-base)` compiles to `transition-duration: var(--duration-base)`. The square-bracket form does not — `duration-[--duration-base]` compiles to `transition-duration: --duration-base`, which is not a valid duration, so the browser discards the declaration and the transition falls back to `0s`.

That bracket form was used in 42 places across the site and every one of those transitions was dead: the Hero's rotating title changed instantly, and so did every hover state. Nothing looked broken, because an instant transition looks like no transition rather than like an error. Fixed 2026-09-07 by moving to `duration-(--duration-base)` and to the bare `ease-out-soft` / `ease-out-strong` utilities, which Tailwind generates automatically from the `--ease-*` names in `@theme`.

**The same trap applies to any two utilities that write one property.** They are single-class selectors of equal specificity, so the winner is whichever Tailwind emitted last — a property of Tailwind's output order, not of the template. Two real instances, both found by checking the built stylesheet rather than by reading the markup:

- `class="p-0"` passed to `<ui-card>` against the component's own `p-6`. Tailwind emits `.p-0` before `.p-6`, so the card kept its padding and every "flush" cover image was silently inset by 24px. Fixed with a real `flush` input.
- `translate-y-3` on a heading that `display-condensed` had already given a `scaleX` transform. The rise did nothing. Fixed by moving the crossfade to an inner span, so each element owns one transform.

The rule: **when a component owns a property, expose an input for it — never pass a competing utility from outside.**

---

## 6. Signature Element: The Status Indicator

Per the design-principles standard of one memorable, justified risk rather than scattered decoration.

**The choice**: a small, deliberate "live status" motif — a subtle dot/pulse using the teal functional accent (`#00D68F`) — used as a recurring visual signature across the site, not just inside literal dashboards.

**Why this, specifically, for Muhammed**: three of his five projects are operational dashboards where a status indicator means something real — a group that's covered, a lecture that's uploaded, an attack that's detected. Instead of inventing an unrelated decorative signature, this system borrows that exact visual language and lets it recur quietly outside the case studies themselves — e.g. next to "available for opportunities" in the Hero, next to a project's live-demo link, next to a resume's last-updated date.

It's a small detail, used with restraint (a handful of appearances, never as a dominant graphic), but it's the one thing on the site that's unmistakably drawn from Muhammed's actual body of work rather than from a generic UI kit.

---

## 7. Component Patterns

High-level only — full specs belong in implementation, not this planning document.

- **Buttons**: primary (solid orange, used for the one main action per section — Resume, View Work), secondary (outline/ghost, on `#140A03` surfaces). Minimum 44px tall, 2px lift on hover, returning to rest on press
- **Tags/pills**: monospace utility face at `tracking-mark`, used for tech stack labels — small, muted (`#888888`), never competing with headline text. Optionally prefixed by a 9px outlined diamond/square/circle cycling by position. The shapes are rhythm, not taxonomy: stack is free text, so there is no real per-technology meaning to map a shape onto, and inventing one would be a fake signal
- **Cards**: `#140A03` surface, minimal border, no drop-shadow-heavy "floating card" cliché — depth comes from the surface color shift, not shadow stacking. Interactive cards lift 4px and warm their border on hover *and* focus-within. A featured card tints its border orange rather than its fill
- **Timeline** (for the Story page's journey, per `02` §7): a simple vertical or horizontal sequence — this is one of the rare cases where numbered/sequential markers are actually justified, since the content genuinely is a real ordered timeline (per the design-principles caution against decorative numbering). Connectors are drawn hairlines, not "→" glyphs: a rule reads as a spine, an arrow reads as punctuation
- **Media framing** (superseding the earlier browser-chrome direction, 2026-09-07): screenshots and photos are **desaturated** (`grayscale` + slight contrast lift) and, where they anchor a page, overlaid with the **viewfinder** — a 1px white crop-mark rectangle, decorative and `pointer-events: none`. On a card, hovering releases the desaturation: colour returning is the reward, which lets the card respond without spending the orange accent on it. The viewfinder is desktop-only; across a phone-sized image it reads as clutter rather than as a photographic reference
- **Disclosure rows** (`<details>`): native element, so keyboard support and screen-reader announcement come from the platform and the content is present before JavaScript. The toggle affordance is the same small orange square used everywhere else, rotated 45° when open — not a "+" glyph

---

## 8. Accessibility & Quality Floor

Non-negotiable baseline, regardless of how the visual direction evolves further:

- Text contrast meets WCAG AA against both background colors (`#000000` and `#140A03`) — worth double-checking specifically for `#888888` secondary text and `#E59400` on dark, since mid-tone colors on dark backgrounds are the most common place contrast quietly fails
- Visible keyboard focus states on every interactive element
- `prefers-reduced-motion` respected sitewide (already stated in §5, repeated here because it's a hard requirement, not a nice-to-have)
- Fully responsive down to small mobile screens

### 8a. Touch, responsive and performance floor (added 2026-09-07)

These are not aspirations; a change that breaks one of them is a regression.

**Touch targets.** Every control is at least 44px in its smallest dimension — comfortably past the WCAG 2.2 AA 24px floor and matching platform guidance. Adjacent targets keep at least 8px between them. `touch-action: manipulation` on `a`, `button` and `summary` removes the ~300ms synthetic click delay without disabling pinch-zoom over ordinary text.

**Mobile is designed, not shrunk.** Below `sm` the header's four links plus Resume become a disclosure panel of full-width 48px rows, because five targets in one row at 375px produced roughly 30px tap areas packed against each other. Card grids, the featured two-column split, and the case-study header all collapse to a single column. The viewfinder frames are desktop-only.

**No horizontal scroll, ever.** `body { overflow-x: clip }` is the sole mechanism now that section glows are deliberately unclipped (§4a). Clipped on `body` rather than `html` because `overflow` on the scrolling root silently kills `position: sticky` on the header. Note that clipping means an overflowing element is *cut off*, not scrollable — so oversized type has to be sized to fit rather than relying on the clip (see §3a).

**Focus is never hidden behind the sticky header.** `scroll-padding-top: 6rem` on the root reserves the header's height on every scroll-into-view, including the browser's own focus scrolling and the skip link. Without it, following the skip link put `#main` flush against the viewport top where the header covered it — a WCAG 2.2 AA failure ("Focus Not Obscured (Minimum)"), fixed 2026-09-07.

**Typographic polish is set once at the base**, not per heading: `text-wrap: balance` on `h1`–`h3` so a short heading does not orphan its last word at display sizes, and `text-wrap: pretty` on paragraphs and list items. Both are progressive — an engine without them simply wraps normally, and nothing depends on an exact line count.

**Performance.** Below-the-fold images are `loading="lazy" decoding="async"`; images sit in aspect-ratio boxes so they reserve their space and do not shift layout. No effect in this system animates a layout property. GSAP stays dynamically imported and out of the initial bundle, and is never fetched at all by a visitor who asked for reduced motion. Where the skill-recommended technique and the budget disagreed, the lighter option was taken — the hover system is the main instance, and the grain's `steps()` timing the other.

**Measured cost of the full visual pass** (2026-09-07, including the continuity and polish corrections): initial bundle 352.39 kB → 374.88 kB raw, 101.46 kB → 105.93 kB estimated transfer. **+4.47 kB transfer sitewide, and no new dependency.** The stylesheet accounts for about a kilobyte of that, the header's mobile disclosure and the shared backdrop component for most of the rest.

---

## 9. What's Deferred

- Exact animated component implementations → design/build phase, against real content
- Final typeface licensing/self-hosting decisions → `08-implementation-plan.md`
- Dashboard (admin) visual treatment — per `05` §7, it doesn't need to share this system at all; it can use a plainer, purely functional UI
