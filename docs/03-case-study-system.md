# 03 — Case Study System

## 0. Purpose

This document defines ONE reusable structure that every project on the site follows, then applies it against the real raw material Muhammed provided — so the framework is tested against actual content, not theory.

Goal: nobody building a case study page later has to guess what goes where.

---

## 1. Why a System, Not Just "Project Pages"

Per `00-project-brief.md` §13 and the raw Discovery answers, a project card is not enough — each project needs to prove the same thing the Hero promises: Muhammed sees the real problem before he sees the tech.

A reusable system means:

- Every project is judged and told the same way → visitors learn to trust the pattern.
- Muhammed (or the dashboard) can add a 6th project later without inventing a new structure.
- Thin projects can use a short version of the template; strong projects (Scholarship Dashboard) can use the full version. The template scales down, not just up.

---

## 2. The Universal Case Study Structure

Six blocks, always in this order. Not every project needs all six at full depth — but the order never changes.

### 1. Snapshot
Name, one-line description, role, timeframe, live link, GitHub link, primary stack (3–5 tags max). This is what a recruiter skimming `/work` sees before clicking in.

### 2. The Problem
What was actually broken, for who, and how it showed up in real life. Concrete symptoms, not abstractions — per brand doc's "Evidence over adjectives" rule (§9, Rule 1).

### 3. The Approach
Why this solution, what else was considered (if anything), and why now / why this scope. This is where the 9-step philosophy from the brand doc (§4) becomes visible without being spelled out as a numbered list on the page.

### 4. The Build
What was actually built, the key technical decisions, and — where relevant — what was hard. Stack is contextualized here (per brand doc Rule 3: "Better: I built X with Y because Z"), not just listed.

### 5. AI Disclosure (where applicable)
One consistent, honest line per brief §14 — never hidden, never overstated. Standard phrasing pattern (reusable across projects):

> "AI tools supported the build process — [specific role, e.g. 'brainstorming architecture options' / 'accelerating implementation']. The problem framing, architectural decisions, and final implementation were Muhammed's."

### 6. Outcome
What changed, measured where possible, honest where not. Per brand doc Rule 4 — no invented metrics.

---

## 3. Depth Tiers

Not every project earns the same real estate. Three tiers, based on what raw material actually supports (per brief §12: curated, not equal weight):

| Tier | Projects | Depth |
|---|---|---|
| **Featured** | Scholarship Operation Dashboard | Full 6-block case study, most detail, appears first on `/work` and teased on Home |
| **Standard** | ST Employees Portal | Full 6-block, slightly more concise |
| **Compact** | Cybersecurity Dashboard, FreshCart, Nutella Digital Menu | Snapshot + Problem + Build + Outcome only — Approach folded into Problem/Build where the story is simpler |

This mapping isn't permanent — it's a starting point based on what Muhammed actually gave in Discovery. A project can be promoted later if there's more to say.

---

## 4. Worked Example — Scholarship Operation Dashboard (Featured)

This shows the template applied to real material, not filled with placeholder text — so it can go almost directly into `04-content-model.md` as structured content.

**Snapshot**
- Serverless full-stack operations dashboard for a scholarship program run in partnership with the Egyptian Engineers Syndicate
- Role: sole builder
- Built in ~7 days
- Stack: Angular, TypeScript, Firebase, Firestore, Tailwind
- Live: scholarship-operation-dashboard.vercel.app (public + `/admin` operation side)
- GitHub: z-ateeqiii/ScholarshipOperationDashboard

**The Problem**
The program ran dozens of lecture groups (52 at the time, tested up to 300) across Telegram, WhatsApp, and Drive links, tracked manually. When a customer asked something as simple as "where's my group's WhatsApp link" or "when does the recorded lecture go up," the operations team often couldn't answer fast — and that delay was directly causing refunds. Lecturers, meanwhile, kept having to ask which groups were assigned to them and which needed follow-up.

**The Approach**
The scope was deliberately kept small: this wasn't going to be a large system, so a serverless architecture was the right fit rather than over-engineering infrastructure for a dataset the size of ~50–300 groups. The build was scoped to solve the actual bottleneck — getting every piece of scattered information (links, assignments, upload status) into one connected view — rather than becoming a general-purpose LMS.

**The Build**
Built solo in about a week using Angular, TypeScript, and Tailwind on the frontend with Firebase/Firestore as a lightweight serverless backend. Lecturers get their own dashboard showing which groups they're teaching, what's been covered, what's pending, and which groups are missing follow-up on Telegram/WhatsApp. The moment a lecturer marks a recording as uploaded, that status is visible to the operations team immediately — replacing what used to live in scattered paper notes and spreadsheets. Adding a new group or lecturer takes one action ("Add New Group") instead of a manual, ad-hoc process.

The hardest part wasn't the code — it was compressing a genuinely messy, multi-channel operational problem into a single screen that a non-technical operations team could use immediately, with zero training.

**AI Disclosure**
> AI tools were used as a thinking partner for brainstorming architecture and to accelerate implementation once the approach was clear. The problem understanding, architectural decisions, and final implementation were Muhammed's — his existing Angular/Firebase experience is what let him verify and adjust the codebase directly.

**Outcome**
Questions that used to take minutes to resolve (which group, what link, what time) now resolve in seconds. Refund-driving support delays tied to lost information were eliminated. The system was stress-tested to 300 groups against an actual load of 52, so it has headroom to scale with the program.

---

## 5. Worked Example — ST Employees Portal (Standard)

**Snapshot**
- Internal onboarding platform built for Smart Technology (Engineering Education / EdTech company)
- Role: sole builder, self-initiated
- Live: st-employees-tutorial.vercel.app
- GitHub: z-ateeqiii/st-employees-portal

**The Problem**
New hires — engineers and customer-facing staff alike — had no structured onboarding. Every new employee needed existing engineers to stop their own work and explain the company from scratch: departments, course tracks (Arduino, Robotics with AI, Embedded Systems, IoT), age-group learning paths, branches — all of it lived in scattered, undocumented knowledge. It was costing the team real time and creating an inconsistent onboarding experience.

**The Build**
Muhammed mapped every department, course track, and process himself, then turned that into a structured video library — recording orientation content himself and coordinating with top performers across teams to record their sections. Rather than building a heavy internal app for what was purely internal use, the videos were hosted unlisted on YouTube and organized through a JSON-driven structure, delivering a Coursera/Udemy-style guided experience without the infrastructure cost of a full LMS — a deliberately proportionate technical choice.

**Outcome**
New employees now go through a structured, self-paced onboarding path instead of pulling engineers off their own work to explain the company from scratch. This also demonstrates something the Scholarship project doesn't: Muhammed noticing an organizational/people problem — not just a technical one — and building the right-sized solution for it without being asked.

---

## 6. Compact Tier Notes

Brief pointers only — full write-ups happen in `04-content-model.md`.

- **FreshCart**: capstone project for the Angular course; real, live API (not mocked) — worth noting explicitly since it separates it from a typical tutorial clone.
- **Nutella Digital Menu**: unprompted — Muhammed noticed a real, physical 221-item / 16-category menu was hard to use, scraped and restructured it himself into a QR-based digital menu, now actually in use at the café. This is the clearest "builds without being asked" evidence in the whole project set (brief §17) and should be framed that way even at compact depth.

### 6.1 Cyber50 Dashboard (Compact — now sourced from README)

**Snapshot**
- Interactive cyber-incident analytics dashboard, built as a technical assessment for a cybersecurity company that had extended Muhammed an offer and wanted to see him build something real
- Stack: Angular 17 (standalone components), D3.js v7, Tailwind CSS
- Data served as JSON from a separate GitHub Pages endpoint

**The Problem**
The assessment's real test wasn't "can you use D3" — it was whether Muhammed could turn a raw, messy incident dataset into something a security team could actually read at a glance: which attack types are trending, which countries and sectors are targeted, where attacks originate, without digging through a spreadsheet.

**The Build**
A full multi-view dashboard: bar charts and timelines for attack types, a sector breakdown, and a world map visualizing attack flow between initiator and target countries — plus a complete filterable data table with CSV export. All views share one reactive filter state (date range, free-text search, dropdowns), so every chart updates instantly together instead of each view filtering independently. Dark mode and responsive layout included.

**Data honesty note** — this one needs its own disclosure, distinct from the standard AI-build disclosure: the incident dataset itself is AI-generated dummy data, not live or real security data (confirmed directly in the project's README). Because this is a cybersecurity-themed dashboard, that has to be stated plainly on the page itself — the value being demonstrated is the ability to model, filter, and visualize complex data, not access to real threat intelligence. Implying otherwise, even by omission, would break the "no fake authority" rule (brand doc §9, Rule 4).

**Outcome**
Delivered as a complete, working multi-view analytics dashboard within the assessment window — shipped under real time pressure, not a take-home template. Post-assessment hiring-process details are not part of this project's story and stay off the page; the outcome here is scoped to what was built and delivered, not to what happened afterward.

---

## 7. Media Handling

Per Muhammed's Discovery answer: no personal portrait needed (confirmed, consistent with brief §26). Each project has its own folder containing its README plus screenshots — this maps directly onto the dashboard's per-project media model (`04-content-model.md` will define the exact schema). Nothing here should block development; missing media is never a reason to delay a case study going live, per brief §32.

---

## 8. Numbers That Need Care

Two figures from Discovery need honest framing before publishing, per brand doc Rule 4 (no unverifiable claims):

- **Social reach**: Instagram (100K) + Facebook (886K) totals ~986K — close to but not over 1M. Use the real combined figure or "nearing 1M," not "+1M."
- **Laptops sold**: 80+ laptops, ~80,000 EGP net from the business — both usable as stated, since they're specific and Muhammed-verified.

---

## 9. What's Deferred

- Exact JSON/data schema per project (fields, media arrays, ordering) → `04-content-model.md`
- Cybersecurity Dashboard full write-up, pending README review
- Final on-page copy/wording (this document organizes the truth, not the final sentences)
