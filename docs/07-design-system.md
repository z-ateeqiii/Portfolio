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

**Display sizes.** Five steps, all fluid via `clamp()`:

| Token | Range | Used for |
|---|---|---|
| `display-hero` | 2.75 → 9rem (11vw) | A page title or a short name. Always paired with `display-condensed`. |
| `display-1` | 2.75 → 5.5rem (7vw) | A section headline that is a full sentence. |
| `display-2` | 2 → 3.5rem (4.5vw) | Sub-section headings, a featured project name, a big number. |
| `display-3` | 1.5 → 2.25rem (2.75vw) | Sub-section headings, a card heading in a single- or two-column layout. |
| `display-4` | 1.25 → 1.625rem (1.8vw) | A card heading inside a multi-column grid. |

**`display-hero` is for a NAME, not a sentence.** The `display-condensed` utility that goes with it applies `scaleX(0.93)`, which reads as deliberate on a word and as broken on a paragraph. A section headline that is a full sentence stays at `display-1` however important it is — the Work index heading and the Home hero statement are both governed by this.

`display-hero` is sized on `min(11vw, 15vh)` — the smaller of width and height. 11vw alone is the reference's ratio and is right on a normal screen, but on a short one (a 720p laptop, or any window with browser chrome eating the viewport) a two-line title at that size pushed the Hero's actions below the fold. A hero headline should be proportionate to the space it actually has.

Its floor is 2.75rem rather than the reference's implied larger minimum, because at a 3.5rem floor the word "Scholarship" overflows a 320px viewport. See the note in `styles.css`.

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

**With one exception, and it is the Hero** (2026-09-20). Not clipping means a backdrop is free to spill below its section — and because the backdrop is a positioned `z-0` layer while the sections after it are static, whatever spills paints *on top of* that later content rather than behind it. The Hero's `lg` glow overhung the section by 255px at 1440x900 and washed both marquee strips and the whole Featured Work block orange. The Hero therefore sets `overflow-clip` (not `hidden`, which would make it a scroll container and capture any future sticky descendant), and its backdrop takes a `contained` flag.

`contained` moves the glow rather than cutting it: it pins the box's **vertical** edge to the section's, so the gradient reaches transparent exactly where the section ends, and leaves the horizontal offset alone because a section's left and right edges are the screen's and nobody ever sees where a horizontal spill stopped. Geometry first, clip as the guarantee — clipping a gradient still at ~65% alpha only trades a bleed for a hard line. Verified by toggling the Hero's backdrop and diffing the two screenshots: max channel delta 93 inside the Hero, **0 across every pixel below it**.

This is for a section that owns its own frame. A mid-page section header still wants to bleed into the prose below it, which is the continuity this component exists to provide.

The Hero's photo keeps its own inner clip regardless, because the photo and its scrim are a unit and an inner wrapper is what guarantees they stay aligned whatever the section's padding does.

**The parallax layer fades out at its own bottom** (added 2026-09-20). A translate-based parallax needs the moving layer to be bigger than the frame it moves inside, and the Hero's photo layer is `inset-0` — exactly its frame's size. Translating it up by `0.15 x scrollY` uncovers its own bottom by exactly that: measured 15px at scrollY 100, 45px at 300, 120px at 800, ending the photo on a dead-straight line across the full width. This predates the containment change above and was not caused by it — with the old uncontained glow restored in the live DOM the layer still slid 45px off its own bottom, so the bleeding glow had simply been painting over the strip.

It cannot be fixed by oversizing the layer, which is the usual answer. The source photo is 1024x410 in an 1885x979 box, so `cover` scales it by HEIGHT: the rendered image is exactly the box height, with no vertical slack and 559px of horizontal overflow. A taller box makes `cover` scale the photo up with it — 36% taller renders it 36% larger — so the hero would be re-framed. There is no more photograph below to slide into view; slack could only be invented by zooming.

So the edge is softened rather than hidden: a mask ramps the layer's last 12% to nothing, and it travels with the layer, so wherever the bottom lands there is no step to see. No clamp, no coupling to the parallax factor, and it holds at any viewport or hero height. Measured as the largest luminance step between adjacent pixel rows at the photo's bottom edge: **3.16 to 0.03 at scrollY 300, and 5.5 to 0.03 at 600**. It costs almost nothing at rest because it overlaps the vertical scrim already there — diffing the mask on against off in one page load gives max channel delta 0 everywhere above the fade band, 0 below the photo, and at most 10/255 inside a band already under 87-98% black.

**A glow's gradient must reach transparent before its box ends**, or the box itself shows as a hard-edged rectangle. Both the glow and the grain mask therefore use `closest-side` sizing, centred: that ties the gradient's end to the nearest edge by definition, so it cannot regress when a box is resized. The earlier off-centre `circle at 40% 60%` with a `68%` stop was still mid-colour when it hit the near edge, which drew a visible rectangle across the top-right of `/about`. It was invisible in the markup and obvious in a screenshot.

### 4b. The page-level ambient layer (added 2026-09-07)

One fixed layer in the app shell, outside the router outlet, holding a large weak glow and the grain that textures it.

It solves the half of the continuity problem that unclipping does not. Per-section backdrops are destroyed and rebuilt on every navigation, so moving from Work to About swapped the entire lit backdrop and each page felt like a separate document. This layer is never rebuilt — the light behind the site is literally the same element from the first page to the last — and being `position: fixed` it belongs to no section, so there is no edge for it to end at.

Section glows still exist, layered above it for emphasis. The ambient one is deliberately weaker and larger: it is the base light level, not a highlight.

**Why the grain lives with the glow rather than over the whole page**: `mix-blend-mode: overlay` against pure black resolves to black, because overlay doubles the backdrop when it is below 0.5 and twice zero is zero. Film grain is therefore only ever visible where something has already lit the area. Pairing it with a glow is not a stylistic preference; it is the only place it renders at all.

### 4c. The Hero (revised 2026-09-07)

**The contrast strip was built and then removed.** The idea was the reference's: a second copy of the photo, undarkened and clipped to a vertical band, painted above the headline so the giant word ran behind it and re-emerged. Rendered, it did not read the way it does in the reference — it cut SOFTWARE mid-word and the rest never came back, so the one line a visitor must be able to read was the one thing on the page they could not.

It is gone, and the lesson is recorded rather than the effect: **in the mockup that look was emergent**, white type crossing a brightly lit sleeve in a particular photograph at a particular size. Reproducing it as a deliberate layer meant it fired on every title at a fixed position, including the ones where it landed on top of a letter that mattered. An effect that depends on the content it covers cannot be applied by rule.

The headline is plain text. The identity is carried by the photograph, the glow, the grain and the type — which is enough.

**The horizontal scrim is what makes the hero readable.** All copy sits in a left column over a high-contrast portrait whose brightest region is a lit sleeve just right of centre. Without a scrim the subline crossed it and became white-on-white — and *variably* so, because the block's width changes with the length of the rotating word above it. A left-to-right dark gradient removes the variable instead of dodging it, fading out before the subject's face so the portrait is still a photograph.

**Composition and the fold.** Height is content-driven with a floor (`min-h-[76svh]`), not a fixed viewport fraction: a fixed height forced dead space below the actions on a tall screen. `svh` not `vh`, because `vh` on mobile means the *largest* viewport, the one you only get once the browser chrome retracts.

The rotating title reserves **two lines** of height (`min-h-[1.72em]`, two lines at the 0.86 line-height). Without it the hero grew and shrank on a timer — "Builder" is one line, "Frontend Specialist" is two — and every section below stepped up and down every few seconds. The reference's own note calls for this: bottom-anchored so the stack below never moves.

Measured after the fix, at 390x844, 1280x720, 1366x640, 1440x900, 1536x864 and 1920x1080: the hero's height, the headline's height and the actions' position are **identical in all three title states**, and View Work and Resume are above the fold at every one of those sizes.

### 4d. The rotating-title transition (revised 2026-09-07)

A cross-fade, driven by one signal and one CSS transition.

An earlier version ran a GSAP timeline that swept a band across the word while it rolled out of a clipped frame odometer-style. It was more machinery than this needed and it depended on the contrast strip above, which is gone. Two CSS properties cannot break, need no library, and cost nothing to load.

Under `prefers-reduced-motion` the rotation does not start at all and the first title stays. The criterion is not only about how a transition looks but about content that changes on its own, and index 0 is a complete resting state rather than a loading one.

### 5c. The top progress bar (added 2026-09-20)

A 2px bar at the very top of the viewport, driven by a shared counter that route navigation and any tracked async work both feed.

**A counter, not a boolean.** Two overlapping loads finishing at different times would each set a boolean false, so the first to finish would hide the bar while the second was still running. Counting makes it disappear when the last thing finishes, which is the only moment it is honest.

**It fakes its own progress, and that is not a lie.** Neither a navigation nor a Firestore read reports how far along it is. The bar trickles toward 90% on a decelerating curve and stops there; only completion moves it to 100%. It says "still working", and a linear trickle that parks at 90% looks frozen where an easing one is always still moving.

**Nothing shows for a fast load.** The bar waits 120ms before appearing at all — a cached route resolves well inside that, and flashing a progress bar for 40ms reads as a glitch rather than as feedback.

Every terminal router event releases it, not only `NavigationEnd`: a guard redirecting to `/admin/login` cancels rather than completes, and handling only the success case would strand the bar at 90% in exactly the cases where something went wrong. `aria-hidden` and `pointer-events: none` — the routed content is what assistive tech should announce, not a busy indicator talking over it.

### 5b. The marquee strips (added 2026-09-19)

Two infinite horizontal strips sit between the Hero and Featured Work on Home: the stack the site is built with, and the terms Muhammed already uses to describe his work. Neither carries new content — the stack is this repository's own dependencies, and the identity terms come from the brief and `Profile.positioning`.

One component, `ui-marquee`, because the scrolling is the hard part and it is identical for both; only the payload differs, which is why items carry an optional icon rather than the component being forked.

**The seam is hidden by rendering the list exactly twice and translating the track by exactly -50%.** At the end of a cycle the second copy sits precisely where the first began, so the loop restarts on an identical frame. Render the list once, or three times, and -50% no longer lands on a matching frame. The duplicate is `aria-hidden`, so the content is announced once rather than twice.

Animated on `transform` via CSS, never JS. This is the one animation on the site that never stops, so it is the one place where a main-thread cost would be paid continuously rather than for a few hundred milliseconds.

**`prefers-reduced-motion` needs an explicit rule here**, not the global one. That global rule collapses animations to 0.01ms, which for a transition means "arrive instantly" but for a marquee means the track jumps to -50% and stays there — the strip would sit permanently offset with its first items scrolled off screen. So the stylesheet stops the animation outright, drops the clone, and turns the strip into something that can be scrolled by hand.

The strips run in opposite directions and fade out at both edges with a mask, because a strip that stops at a container edge reads as a component while one that runs off both sides reads as motion passing through the page.

**Pace is a speed, not a duration (2026-09-20).** A CSS animation's duration is time for a fixed distance, but a strip's distance is its own content width — so two strips given similar durations run at wildly different speeds. Measured at 1440px: the tech strip was 3,969px of content in 34s and the identity strip 1,279px in 42s, which is 117 px/s against 30 px/s, nearly four times faster, sitting directly above one another. `ui-marquee` now takes `speed` in px/s and derives the duration from the measured run width, so any two strips match by construction and adding a skill cannot desynchronise them. Server-side there is no layout, so the width is estimated from the items' own geometry and character counts; the estimate gives 132.43s and 42.68s where the browser then measures 132.4s and 42.7s, so there is no correction to see.

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

### 7c. Skill marks (added 2026-09-20)

45 Skill records were seeded and had no public surface at all — they existed only in the dashboard. They now drive the Home tech strip and a Stack section on About.

**Logos come from Simple Icons through an explicit map, not a slug guess.** Deriving a slug from a skill name matched 12 of 36, and the near-misses were worse than the misses: "sharp" is a real Simple Icons entry for an image-resizing library, so a naive guess would have put its logo beside C#.

**Most skills have no logo, deliberately.** Over half of what Muhammed lists is practice rather than product — Accessibility, Lazy Loading, Code Reviews, SDLC. None has a mark, and inventing one would either say nothing or say something false. Those render as plain text tags in the same shape; nothing is skipped or broken. On About all 45 appear, 24 with a mark and 21 without.

The Home strip carries only the skills that **have** a mark, because a scrolling row of logos is a visual device and a text item drifting past it has nothing to look at. Both surfaces read the same icon map, so they cannot disagree about what has a logo.

**Footer brand marks (added 2026-09-20).** The footer's five contact channels had abstract diamond/square/circle shapes cycling by position — rhythm that works on a tag but says nothing beside "LinkedIn". They now carry real marks, in `currentColor` like the skill marks, because five brand colours in a footer row is the sticker-sheet look `00` §24 rules out.

Two things had to be handled rather than papered over. **LinkedIn is not in Simple Icons** — searched by export name and by title across all 3,461 icons, there is no entry, because LinkedIn will not allow the mark under CC0. That is a redistribution restriction, not a prohibition on linking to a profile with the unaltered bug, so the glyph is inlined rather than the channel being dropped or given a shape that is not its logo. **Email is a protocol, not a product**, so its envelope is drawn to the site's own geometry.

**The footer does not import `simple-icons`, and that is a bundle decision.** The skill marks import by name and the bundler drops the rest, which works because every component using them is behind a lazy route. The footer is in the app shell. Importing from the package there gave esbuild an eager dependency on the shared icon module and promoted the chunk holding all 24 skill icons into the initial bundle — measured at +34.8 kB raw and +12.1 kB transfer for what should have been four logos, with About's Tailwind mark sitting in the same initial chunk as GitHub's. The four paths are copied into the footer's own file instead: about 3 kB, each one naming its source. Measure the initial total after adding an icon set to anything eagerly loaded.

Marks render in `currentColor`, so they inherit surrounding text and cannot introduce a colour outside the palette — a wall of brand colours is the sticker-sheet look `00` §24 rules out.

Only the 24 icons used are imported by name; the other ~3,300 in the package are dropped. Verified against the built bundle, which grew 0.57 kB transfer for the icons, the progress bar and both skill surfaces together.

### 7b. The /work filter tabs (added 2026-09-20)

**The tabs are built from the data, never hardcoded.** A fixed list of four would show an empty Personal tab the moment that project is deleted, and would silently miss a category added later. The row derives from the categories actually present, in the order `04` §3 defines them, so deleting a project removes its tab when it was the last of its kind and nothing here needs editing when the set changes. The counts come from the same computation as the cards, so they cannot disagree with what is on screen.

**One tab is a label, not a filter**, so the row renders only when more than one category is present. `Project.category` is optional and every live document predates it, which means before seeding there are no category tabs and the page is simply unfiltered — correct rather than broken.

**Filtering is a signal, not a route param.** `02` §5 rules out anything that makes a curated set look like an archive, and a filter that writes to the URL turns seven projects into a browsable query. It also keeps every project in the server-rendered HTML, so a crawler and a visitor without JavaScript both get the whole set rather than one slice.

A real `<button>` in a labelled group, not a link — it filters what is already on the page and never navigates. The active tab carries `aria-pressed`, because colour alone is not a state for anyone who cannot see it.

**The lead card resolves within the active tab.** Filtering to a category whose projects are all compact simply has no lead and renders as an even grid, which is better than promoting a compact project into a slot that expects a cover image, a role and a timeframe it does not have. `tier` still decides prominence; the filter only decides the candidate set.

**Verified against the reveal directive.** `RevealDirective` captures its children once and sets them to `opacity: 0`, so a filter that swaps those children could plausibly strand a card invisible. Measured across every tab after scrolling the page: zero cards in the viewport below full opacity.

**Sharp, not pills (revised 2026-09-20).** The tabs shipped as `rounded-full` with a solid orange fill on the active one, and they were the only pill on the site — every other control is `rounded-sm` with a hairline border and a mono uppercase label, so a pill row above a grid of hard-cornered cards read as a component borrowed from elsewhere. The active fill went with the shape: §2 keeps orange on borders, marks and controls rather than as a field, and a filled tab was the largest orange area on the page, louder than the featured card beneath it. Active is now a tinted panel behind orange text plus a filled square mark, against an outlined mark when inactive — so state is carried by a shape as well as by colour. `min-h-11` and wrapping (not horizontal scrolling) keep every tab reachable on a phone.

### 7a. Project cards (revised 2026-09-19)

**Cards in a row line up, and so do their contents.** Grid items stretch by default, so the cards were always equal height — but their contents were not, and a project with a one-line tagline put its tags halfway up the card while its neighbour put them at the bottom. `UiCard` is now a flex column and the body claims the leftover space, so the tag lists share a baseline. This matters more as the set grows: at eight projects and rising, every difference in tagline length was another misaligned row.

**The grid goes to three columns at `xl`.** Two was right for five projects; a two-wide column of eight is a scroll, not an index. Verified by cloning the grid to 18 cards in a live browser: 3/2/1 columns at 1440/1024/390, zero ragged rows, no horizontal overflow.

**Card type is set for reading, not for compression** (2026-09-20). Card names dropped `display-condensed`: a 7% horizontal squeeze is legible at 9rem and costs real clarity at 1.6rem, and the utility was always documented as the partner to `display-hero`. Padding went to `p-7` and the gaps between name, tagline and tags widened with it. This is the section a visitor came for, so it is the one place where comfort outranks density.

**The whole card is the link (2026-09-20).** The card's one destination link carries a `stretched-link` utility whose `::after` grows to the card's bounds, so a pointer can click anywhere. It is not an anchor wrapped around the card: cards contain other links, HTML forbids nesting them, and the parser silently closes the outer one. It keeps exactly one tab stop per card and the focus ring still draws around the words. Anything else interactive inside a card must be raised with `relative z-10`.

  One trap, and it is silent: `position: absolute` resolves against the nearest ancestor that is positioned **or transformed**, so a `display-condensed` heading between the link and its card captures the overlay and shrinks it to the heading. The card looks identical and only the title is clickable. The Work lead card was the last heading still carrying that utility and has now dropped it, which both fixes the click and settles the inconsistency with Home's lead card. Verify a card by clicking its body, not by reading its markup.

**Covers get more height on a phone (2026-09-20).** Cards go to `3:2` below `sm` and back to `16:9` above it. Cover images are desktop screenshots, and at 342px wide a 16:9 crop is a 191px band in which a dense product UI reads as a smudge; 3:2 shows the same image 19% larger and made FreshCart's nav, logo and product grid legible in a 390px screenshot. `4:3` was tried first and rejected — it is larger still, but `object-cover` takes the extra height out of the width and it cropped the product's own name off the image. Card padding drops to `p-6` at the same breakpoint, which is the 8px rhythm's step rather than a new value.

**The hover is the card coming alive.** Every cover sits in greyscale until touched; on hover the desaturation lifts all the way off, the image pushes in and drifts up behind its own crop, and a single pass of light crosses it. Colour arriving is the real signal and needs no shadow or outline to announce it — it says the project is a live thing rather than a screenshot of one. The previous hover only went to `grayscale(0.35)`, a half-measure that read as a rendering artefact rather than an intention.

### 7d. The case-study lightbox (revised 2026-09-20)

The lightbox requests a 1600px render where the thumbnail it opened from was 480px, so there is always a real wait. With nothing on screen during it the dialog opened to an empty box and read as a hang.

**The loading state layers under the image rather than replacing it.** Removing the `<img>` while it loads and re-adding it on load would restart the download each time and collapse the figure to nothing in between, so the dialog would jump size on every arrow press. A spinner sits behind; the image fades in over it.

**Neighbours are preloaded.** Stepping through a gallery is almost always sequential, so by the time an arrow is pressed the next image has usually been in flight for as long as the current one has been on screen — the wait disappears rather than being decorated. Both directions, because the arrow keys go both ways. Browser-only, and only ever triggered by opening the lightbox, so a visitor who never opens it downloads none of it.

An image already fetched shows **no spinner at all**, because a flash of loading state for something painting from cache is worse than none. `(error)` clears the state too, so a blocked image ends as a broken-image icon rather than a spinner that never stops.

Measured on a throttled connection (300 kbps, 300ms latency): opening the first image shows the spinner immediately and clears it on load; advancing to a preloaded neighbour shows no spinner and completes in 81ms.

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

**No horizontal scroll, ever.** `overflow-x: clip` on **both** the root and `body`, now that section glows are deliberately unclipped (§4a) and genuinely extend past the right edge — measured at 233px on a 1440 viewport. `body` alone stopped the scrollbar, but `documentElement.scrollWidth` still exceeded its client width, which is the difference between "cannot scroll sideways" and "happens not to have a scrollbar". `clip` never `hidden`: clip creates no scroll container, so `position: sticky` on the header keeps working — verified by measuring the header's position after a 600px scroll at six viewport sizes. Note that clipping means an overflowing element is *cut off*, not scrollable — so oversized type has to be sized to fit rather than relying on the clip (see §3a).

**Focus is never hidden behind the sticky header.** `scroll-padding-top: 6rem` on the root reserves the header's height on every scroll-into-view, including the browser's own focus scrolling and the skip link. Without it, following the skip link put `#main` flush against the viewport top where the header covered it — a WCAG 2.2 AA failure ("Focus Not Obscured (Minimum)"), fixed 2026-09-07.

**Typographic polish is set once at the base**, not per heading: `text-wrap: balance` on `h1`–`h3` so a short heading does not orphan its last word at display sizes, and `text-wrap: pretty` on paragraphs and list items. Both are progressive — an engine without them simply wraps normally, and nothing depends on an exact line count.

**Performance.** Below-the-fold images are `loading="lazy" decoding="async"`; images sit in aspect-ratio boxes so they reserve their space and do not shift layout. No effect in this system animates a layout property. GSAP stays dynamically imported and out of the initial bundle, and is never fetched at all by a visitor who asked for reduced motion. Where the skill-recommended technique and the budget disagreed, the lighter option was taken — the hover system is the main instance, and the grain's `steps()` timing the other.

**Measured cost of the full visual pass** (2026-09-07, final): initial bundle 352.39 kB → 374.75 kB raw, 101.46 kB → 105.96 kB estimated transfer. **+4.50 kB transfer sitewide, and no new dependency.** The Hero no longer imports GSAP at all; it is still lazy-loaded by the scroll-reveal directive.

---

## 9. What's Deferred

- Exact animated component implementations → design/build phase, against real content
- Final typeface licensing/self-hosting decisions → `08-implementation-plan.md`
- Dashboard (admin) visual treatment — per `05` §7, it doesn't need to share this system at all; it can use a plainer, purely functional UI
