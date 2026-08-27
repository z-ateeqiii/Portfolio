# 02 — Information Architecture

## 0. Purpose of This Document

This document translates the positioning and voice from `01-brand-and-voice.md` into an actual site structure: pages, sections, navigation, and the paths different visitors take through the site.

It answers:

> Where does everything live, and in what order does a visitor encounter it?

It does NOT define:

- Visual design (→ `07-design-system.md`)
- The internal structure of a single case study (→ `03-case-study-system.md`)
- The exact fields the dashboard manages (→ `04-content-model.md`)

---

## 1. IA Principles

These carry over directly from the brand doc and govern every decision below.

1. **Layer 1 (Professional) must work standalone.** A recruiter should never be forced through Layer 2 to get what they need.
2. **Progressive disclosure, not forced depth.** Each page should give a visitor an easy, obvious "go deeper" path — never a wall of everything at once.
3. **One primary action per audience.** Recruiter → Resume. Hiring manager → Case study. Client → Contact. The IA should make each of these a short, obvious path.
4. **The story is a spine, not a page.** Elements of the Computer → Gaming → ... → Software Engineering narrative appear across Home, About/Story, and Beyond Code — not dumped in one long biography block.
5. **Beyond Code is discovered, not pushed.** It's reachable from navigation and from natural link-outs in the story, but it never interrupts the professional flow uninvited.

---

## 2. Site Map (Top Level)

```
/                          Home
/work                      Work (project index)
/work/[project-slug]       Case Study (per project)
/about                     Story / About
/beyond                    Beyond Code (hub)
/beyond/social             Social Media World
/beyond/business           Business / Entrepreneurship
/beyond/teaching           Teaching
/contact                   Contact
/resume                    Resume (view/download, not a full page experience)
```

Supporting, non-navigational routes:

```
/resume.pdf (or equivalent direct asset link)
/sitemap.xml
/robots.txt
```

No `/blog`, no `/admin` exposed publicly (dashboard is a separate authenticated area, out of scope for the public IA).

---

## 3. Primary Navigation

Kept short — this is a story-driven site, not a documentation site.

```
[Muhammed Al-Ateeqi]     Work     About     Beyond Code     Contact     [Resume]
```

Notes:

- **Resume** is visually distinct (button-style, not a text link) — it's a top priority exit path for recruiters and should never require scrolling or exploring to find.
- **Beyond Code** is present but should not visually compete with Work/About — it's an invitation, not a headline item.
- Logo/name always returns Home.

### Footer Navigation

The footer repeats the core paths for anyone who scrolled to the bottom without using the header, plus contact channels:

```
Work · About · Beyond Code · Contact · Resume
Email · LinkedIn · GitHub · Instagram · Facebook
```

No WhatsApp, no Calendly — per the brief's explicit exclusions.

---

## 4. Home (`/`)

Home is the front door for every persona — it has to work as a fast professional summary AND as a hook toward exploration.

Section order (top to bottom):

1. **Hero**
   - One-line identity statement (final copy TBD per brand doc §5)
   - Primary positioning: Software Engineer & Builder
   - Two calls to action: primary (View Work / See Case Studies) and secondary (Resume)
   - No portrait required (per brief §26)

2. **Proof Strip** (optional, lightweight)
   - A few verified numbers only if confidently supportable (e.g., years building, projects shipped, laptops sold) — not a stat-wall, and nothing unverified per brief §22.

3. **Featured Work**
   - Leads with the Scholarship Operation Dashboard (per brief §15)
   - 2–3 project cards total, each linking to its full case study
   - Link to `/work` for the full list

4. **How I Work** (Philosophy)
   - Short, visual treatment of the 9-step process from brand doc §4 — condensed, not the full list
   - Signals product thinking before the visitor even opens a case study

5. **Story Teaser**
   - A short excerpt of the Computer → ... → Software Engineering journey
   - Ends with a link into `/about` for the full narrative — this is the bridge into Layer 2

6. **Beyond Code Teaser**
   - One short, confident line + visual hint (not a full section) that there's more beneath the surface
   - Links to `/beyond`

7. **Contact / Closing CTA**
   - Short, direct: how to reach him, resume link repeated

Home should be scannable in under a minute by a recruiter, while still offering three clear "go deeper" doors: Work, Story, Beyond Code.

---

## 5. Work (`/work`)

Purpose: the credibility layer for hiring managers and clients.

- Intro line reinforcing positioning (not a repeat of the Hero)
- Project list, curated and ordered by relevance (per brief §12) — not strictly chronological
- Each entry: name, one-line problem framing, primary technologies, link to case study
- Featured project (Scholarship Operation Dashboard) visually distinguished at the top
- No pagination/infinite scroll needed — this is a curated set, not a full archive

---

## 6. Case Study (`/work/[project-slug]`)

Full internal structure is defined in `03-case-study-system.md`. For IA purposes, each case study page needs to:

- Stand alone (shareable link a recruiter can forward without context)
- Always show: Problem → Approach → Build → Outcome, in that order
- Always offer a way back to `/work` and forward to `/contact` or `/resume`
- Where AI-assisted development was used, disclose it accurately per brief §14 — not buried, not overstated

---

## 7. About / Story (`/about`)

This is where the full narrative from brief §9 and brand doc §16 lives — the one place someone can get the complete picture in one sitting.

Section order:

1. **Framing intro** — who this page is for (the curious, hiring managers who want more than a resume, founders evaluating fit)
2. **The Journey** — Computer → Gaming → Video Editing → Content Creation → Programming → CS → Freelancing → Business → Leadership → Setback → Rebuilding → Software Engineering, told as a narrative arc, not a bullet timeline
3. **The Setback** — referenced honestly as a turning point/rebuilding period, with zero personal/romantic detail (hard boundary from brief §9 and brand §17)
4. **Where it leads today** — bridges into current professional identity and links to `/work`
5. **Link out to Beyond Code** — for anyone who wants the social/business/teaching threads in full

---

## 8. Beyond Code (`/beyond`)

Hub page, not a deep page itself.

- Short framing: this is the layer behind the engineer
- Three entry cards: Social Media World, Business, Teaching
- Visually should feel like a shift in register from the professional layer (per brand doc §11–12) while staying recognizably part of the same site — "different room, same house"

### 8.1 `/beyond/social`

- The creator journey: storytelling + context, not just a follower counter
- Verified numbers only (Instagram ~100K, Facebook ~886K — confirm exact figures before publish, per brief §20)
- Platform links out to actual profiles
- Optional video/content archive if media is available (not a blocker if not — per brief §32)

### 8.2 `/beyond/business`

- The "Ateeqi Tech" laptop business story: customer-first approach, 80+ laptops sold (verify figure)
- Framed as evidence of ownership, sales, operational thinking — ties back to the professional philosophy, not a separate persona

### 8.3 `/beyond/teaching`

- Teaching/mentorship experience, framed as communication and technical depth (per brand doc §15)
- Kept proportionate — supporting evidence, not a competing career narrative

---

## 9. Contact (`/contact`)

- Primary channels only: Email, LinkedIn, GitHub (per brief §27)
- Short, direct framing — no contact form complexity required unless later decided
- Resume link repeated here as well

---

## 10. Resume

Resume is treated as an **asset accessible from multiple entry points**, not a standalone page experience (per brief §28):

- Hero (Home)
- Primary navigation (persistent button)
- Footer
- Contact page

Clicking it should be fast — direct view/download, not a detour through another storytelling page.

---

## 11. Persona Journeys Mapped to IA

Restating brief §35 against the actual site map:

| Persona | Path |
|---|---|
| Recruiter | `/` → `/work` → `/resume` |
| Hiring Manager | `/` → `/work` → `/work/[project]` → `/resume` |
| Client | `/` → `/work` → `/work/[project]` → `/contact` |
| Founder / Business Owner | `/` → `/work` → `/about` → `/beyond` → `/contact` |
| Curious Visitor | `/` → `/about` → `/beyond` → `/beyond/social` |

Every path above is reachable in 3 clicks or fewer from Home.

---

## 12. Routing & Technical IA Notes

(High-level only — full technical architecture in `06-technical-architecture.md`.)

- Clean, human-readable slugs for projects (`/work/scholarship-operation-dashboard`, not IDs)
- `/beyond/*` kept under one path prefix so the "different layer" feeling can be reflected in routing/analytics later
- Dashboard-managed content (projects, bio, social links) should populate these routes dynamically — the IA itself stays stable even as content changes, per brief §30
- Sitemap should include Home, Work, all case studies, About, Beyond Code hub + subpages, Contact — dashboard-generated where possible so new projects auto-appear

---

## 13. What This IA Deliberately Avoids

Per brief §38 (Non-Goals):

- No `/blog` — this isn't a content/writing platform (content creation lives inside Beyond Code as story, not as a publishing feed)
- No public-facing `/dashboard` or admin surface
- No separate "Skills" or "Certifications" top-level pages — these are supporting content that lives inside Work/About/Case Studies, not standalone destinations that fragment the story
- No infinite project archive — Work stays curated

---

## 14. Open Questions for Later Documents

- Exact case-study section order and depth per project → `03-case-study-system.md`
- Whether `/beyond/social` needs a full video archive or a curated selection → depends on media availability (`04-content-model.md`)
- Whether Contact needs a form or stays link-only → decide during design phase
- Final resume format (PDF only, or also inline preview) → `06-technical-architecture.md`
