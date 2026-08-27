import { Profile, Project, Skill, SocialPlatform } from '../../src/app/core/models';

/**
 * Phase 2 seed content (08 §3, 08 §4).
 *
 * --- What is in here, and what is deliberately NOT --------------------------
 * Everything below is copied from the written record - 03-case-study-system.md
 * §4-6 and 00-project-brief.md §11, §20 - not paraphrased and not filled in.
 * The prose is verbatim from 03: those are Muhammed's own sentences about his
 * own work, and 09 §2.4 says not to rewrite their substance.
 *
 * All five projects are now seeded: 03 §6.2 and §6.3 supplied the FreshCart and
 * Nutella write-ups that were previously blocked.
 *
 * Several entities from 04-content-model.md are absent because the facts they
 * need do not exist anywhere in docs 00-10. Writing them would mean inventing
 * a fact on a credibility site, which 09 §3 rules out as the one thing not to
 * do. Each gap is listed in UNSEEDED at the bottom of this file and logged in
 * 10 §4a, rather than left as a silent omission.
 * ---------------------------------------------------------------------------
 */

/** An entity as authored here: status and timestamps are applied at write time. */
type Seed<T> = Omit<T, 'status' | 'updatedAt' | 'publishedAt'>;

export type ProjectSeed = Seed<Project>;

/**
 * Profile — the singleton (04 §2). Every field is final as of 2026-08-27.
 *
 * The Hero copy is the locked wording from 01 §5, headline and subline kept as
 * two fields rather than one string (see 04 §2's note on `heroSubline`).
 *
 * `resumeFile` is absent, not empty-stringed: no resume file has been uploaded
 * to Storage yet, and 10 §3 has not settled PDF-only vs inline preview. 04 §2
 * makes it optional so the site renders without a resume link rather than
 * offering a broken one.
 *
 * No availability or location line, deliberately. 04 §2 has no such field, the
 * locked Hero copy does not use one, and 10 §1 is explicit that adding it is a
 * schema change to raise rather than slip in. This is the field the mockup pass
 * invented "Kuwait — remote friendly" for (08 §2).
 */
export const PROFILE: Seed<Profile> = {
  name: 'Muhammed Al-Ateeqi',
  heroStatement: 'Building practical software for problems I live with',
  heroSubline:
    'I’m Muhammed, a software engineer and builder. I’m usually the one stuck in the problem myself — so I scope it, build the interface, wire it to real data, and ship it end to end.',
  positioning: 'Software Engineer & Builder',
  bioShort:
    'Software engineer and builder who finds real problems and builds the software that solves them — five shipped projects, most designed, built and deployed solo.',
  bioLong:
    'Muhammed’s relationship with computers started with gaming as a kid, then video editing at 14, then programming in high school with C++. Through university he balanced coursework with freelancing, content creation, and building Ateeqi Tech — a laptop reselling business built on understanding customer needs, not just selling hardware. A personal setback interrupted that momentum for a period; he rebuilt from it by finishing his degree, leading his graduation project, and moving into professional software engineering.\n\nToday he works primarily in Angular and TypeScript, starting every project with the actual problem rather than the technology — from serverless operational dashboards used by real teams, to a digital menu he built for a café simply because the printed one was hard to use. He’s expanding into backend development next.',
  contactEmail: 'mu.alateeqi@gmail.com',
  contactLinkedIn: 'https://www.linkedin.com/in/zateeqi/',
  contactGitHub: 'https://github.com/z-ateeqiii',
  socialInstagram: 'https://www.instagram.com/muhammed.alateeqi/',
  socialFacebook: 'https://www.facebook.com/3t3ota1/',
};

export const PROJECTS: readonly ProjectSeed[] = [
  // -- Featured (03 §3, §4) --------------------------------------------------
  {
    slug: 'scholarship-operation-dashboard',
    name: 'Scholarship Operation Dashboard',
    tagline:
      'Serverless full-stack operations dashboard for a scholarship program run in partnership with the Egyptian Engineers Syndicate',
    tier: 'featured',
    order: 1,
    role: 'Sole builder',
    timeframe: 'Built in ~7 days',
    stack: ['Angular', 'TypeScript', 'Firebase', 'Firestore', 'Tailwind'],
    liveUrl: 'https://scholarship-operation-dashboard.vercel.app',
    githubUrl: 'https://github.com/z-ateeqiii/ScholarshipOperationDashboard',
    problem:
      'The program ran dozens of lecture groups (52 at the time, tested up to 300) across Telegram, WhatsApp, and Drive links, tracked manually. When a customer asked something as simple as "where’s my group’s WhatsApp link" or "when does the recorded lecture go up," the operations team often couldn’t answer fast — and that delay was directly causing refunds. Lecturers, meanwhile, kept having to ask which groups were assigned to them and which needed follow-up.',
    approach:
      'The scope was deliberately kept small: this wasn’t going to be a large system, so a serverless architecture was the right fit rather than over-engineering infrastructure for a dataset the size of ~50–300 groups. The build was scoped to solve the actual bottleneck — getting every piece of scattered information (links, assignments, upload status) into one connected view — rather than becoming a general-purpose LMS.',
    build:
      'Built solo in about a week using Angular, TypeScript, and Tailwind on the frontend with Firebase/Firestore as a lightweight serverless backend. Lecturers get their own dashboard showing which groups they’re teaching, what’s been covered, what’s pending, and which groups are missing follow-up on Telegram/WhatsApp. The moment a lecturer marks a recording as uploaded, that status is visible to the operations team immediately — replacing what used to live in scattered paper notes and spreadsheets. Adding a new group or lecturer takes one action ("Add New Group") instead of a manual, ad-hoc process.\n\nThe hardest part wasn’t the code — it was compressing a genuinely messy, multi-channel operational problem into a single screen that a non-technical operations team could use immediately, with zero training.',
    aiDisclosure:
      'AI tools were used as a thinking partner for brainstorming architecture and to accelerate implementation once the approach was clear. The problem understanding, architectural decisions, and final implementation were Muhammed’s — his existing Angular/Firebase experience is what let him verify and adjust the codebase directly.',
    outcome:
      'Questions that used to take minutes to resolve (which group, what link, what time) now resolve in seconds. Refund-driving support delays tied to lost information were eliminated. The system was stress-tested to 300 groups against an actual load of 52, so it has headroom to scale with the program.',
    featuredOnHome: true,
  },

  // -- Standard (03 §3, §5) --------------------------------------------------
  {
    slug: 'st-employees-portal',
    name: 'ST Employees Portal',
    tagline:
      'Internal onboarding platform built for Smart Technology (Engineering Education / EdTech company)',
    tier: 'standard',
    order: 2,
    role: 'Sole builder, self-initiated',
    // 03 §5's Snapshot gives no duration and no dates for this project. Left
    // empty rather than estimated - 04 §3 keeps this as free text precisely so
    // a project with no real timeframe can carry none.
    timeframe: '',
    stack: ['Angular', 'TypeScript', 'Tailwind CSS', 'JSON'],
    liveUrl: 'https://st-employees-tutorial.vercel.app',
    githubUrl: 'https://github.com/z-ateeqiii/st-employees-portal',
    problem:
      'New hires — engineers and customer-facing staff alike — had no structured onboarding. Every new employee needed existing engineers to stop their own work and explain the company from scratch: departments, course tracks (Arduino, Robotics with AI, Embedded Systems, IoT), age-group learning paths, branches — all of it lived in scattered, undocumented knowledge. It was costing the team real time and creating an inconsistent onboarding experience.',
    // No approach block: 03 §5 does not write one. The tier system (03 §3) lets
    // the template scale down, so the field stays absent rather than being
    // padded out of the Problem and Build text.
    build:
      'Muhammed mapped every department, course track, and process himself, then turned that into a structured video library — recording orientation content himself and coordinating with top performers across teams to record their sections. Rather than building a heavy internal app for what was purely internal use, the videos were hosted unlisted on YouTube and organized through a JSON-driven structure, delivering a Coursera/Udemy-style guided experience without the infrastructure cost of a full LMS — a deliberately proportionate technical choice.',
    // No AI disclosure: 03 §5 states none, and 03 §2.5 scopes that block to
    // projects where AI was actually used. Adding a boilerplate one "for
    // consistency" would be a claim about how the work was done.
    outcome:
      'New employees now go through a structured, self-paced onboarding path instead of pulling engineers off their own work to explain the company from scratch. This also demonstrates something the Scholarship project doesn’t: Muhammed noticing an organizational/people problem — not just a technical one — and building the right-sized solution for it without being asked.',
    featuredOnHome: true,
  },

  // -- Compact (03 §3, §6.1) -------------------------------------------------
  {
    slug: 'cyber50-dashboard',
    name: 'Cyber50 Dashboard',
    tagline:
      'Interactive cyber-incident analytics dashboard, built as a technical assessment for a cybersecurity company',
    tier: 'compact',
    order: 3,
    role: 'Sole builder',
    timeframe: 'Built within the assessment window',
    stack: ['Angular 17', 'D3.js v7', 'Tailwind CSS'],
    // No liveUrl and no githubUrl. 10 §2 records that only the data-endpoint
    // repo was provided during Discovery and the main application repo link is
    // still missing. An absent link is honest; a guessed one is a broken
    // promise on the one page claiming the work exists.
    problem:
      'The assessment’s real test wasn’t "can you use D3" — it was whether Muhammed could turn a raw, messy incident dataset into something a security team could actually read at a glance: which attack types are trending, which countries and sectors are targeted, where attacks originate, without digging through a spreadsheet.',
    build:
      'A full multi-view dashboard: bar charts and timelines for attack types, a sector breakdown, and a world map visualizing attack flow between initiator and target countries — plus a complete filterable data table with CSV export. All views share one reactive filter state (date range, free-text search, dropdowns), so every chart updates instantly together instead of each view filtering independently. Dark mode and responsive layout included.',
    // Distinct from an AI *build* disclosure: this one is about the DATA
    // (03 §6.1, 04 §3). It has to render on the page, not sit in a footnote -
    // a cybersecurity dashboard that stays quiet about using dummy data
    // implies real threat intelligence by omission (01 §9, Rule 4).
    dataHonestyNote:
      'The incident dataset itself is AI-generated dummy data, not live or real security data. The value being demonstrated is the ability to model, filter, and visualize complex data — not access to real threat intelligence.',
    outcome:
      'Delivered as a complete, working multi-view analytics dashboard within the assessment window — shipped under real time pressure, not a take-home template.',
    featuredOnHome: false,
  },

  // -- Compact (03 §3, §6.2) -------------------------------------------------
  {
    slug: 'freshcart',
    name: 'FreshCart',
    tagline:
      'eCommerce web application, built as the capstone project for the Angular course Muhammed was taking',
    tier: 'compact',
    order: 4,
    // 03 §6.2's Snapshot names no role and no duration. Left empty rather than
    // inferred from "capstone project" - 04 §1.2 renders around a gap, and a
    // guessed "Sole builder" would be a claim the source does not make.
    role: '',
    timeframe: '',
    stack: ['Angular 17', 'SSR (Express)', 'JWT Authentication', 'Tailwind CSS', 'Flowbite'],
    liveUrl: 'https://freshcarteco.netlify.app/login',
    githubUrl: 'https://github.com/z-ateeqiii/eCommerceAngular',
    problem:
      'As a capstone assignment, the brief was to build a complete eCommerce flow — browsing, cart, checkout — against a real backend rather than static or mocked data, which is what separates a capstone from a course exercise.',
    // No approach block: compact tier folds it into Problem/Build (03 §3).
    build:
      'Built entirely against FreshCart’s live, real REST API — actual network requests, JWT-based authentication, and real response handling, not a simplified teaching dataset. The app is server-side rendered via Express, going beyond the course’s baseline requirements. This is the project where the foundational REST API integration skill used across every other project in this set was first proven.',
    outcome:
      'A completed, deployed capstone demonstrating full front-to-back integration against a real external API, with SSR handled correctly. There isn’t a dramatic before/after story here the way there is with the operational dashboards — its value in this set is as evidence of solid fundamentals, not a business outcome.',
    featuredOnHome: false,
  },

  // -- Compact (03 §3, §6.3) -------------------------------------------------
  {
    slug: 'nutella-digital-menu',
    name: 'Nutella Digital Menu',
    tagline:
      'QR-based digital menu for a café Muhammed frequents as a regular customer, built entirely unprompted',
    tier: 'compact',
    order: 5,
    // Directly supported by 03 §6.3: "built entirely unprompted" and
    // "decided to solve it himself". This is the one project in the set whose
    // self-initiation IS the story (brief §17), so the role field carries it.
    role: 'Sole builder, self-initiated',
    timeframe: '',
    stack: ['Angular 19', 'Signals'],
    liveUrl: 'https://nutella-one.vercel.app',
    // Trailing hyphen is part of the actual repository name, not a typo.
    githubUrl: 'https://github.com/z-ateeqiii/Nutella-',
    problem:
      'Nobody asked for this. The café’s printed menu crammed 221 items across 16 categories onto a page — cluttered and slow to scan for both Arabic- and English-speaking customers. Muhammed noticed the friction as a regular and decided to solve it himself.',
    build:
      'Scraped and restructured the entire printed menu into a JSON-driven data model, then built a clean, QR-accessible digital menu organized by category — built bilingually from the start, with proper RTL layout for Arabic rather than a bolted-on translation. The site is genuinely in use at the café today — not a portfolio mockup, a real tool customers interact with.',
    outcome:
      'Live at the café, with positive feedback from customers and staff. Of everything in this project set, this is the clearest evidence of Muhammed building a solution without being asked (per brief §17) — pure initiative, not a work assignment or paid engagement.',
    featuredOnHome: false,
  },
];

/**
 * Skills (04 §5), from the categorised stack in brief §11.
 *
 * --- Where `level` comes from, field by field ------------------------------
 * brief §11 splits into two parts, and they support different amounts:
 *
 *  - "Current technical focus" (the first six groups) is stated as current and
 *    actively used, but the brief draws no line between `strong` and `good`
 *    within it. These seed as `good`: a floor the source supports, not a claim
 *    it does not. Promoting any of them to `strong` would have Muhammed
 *    asserting a proficiency he has not asserted (01 §9, Rule 4).
 *
 *  - "Expanding Toward" is now explicitly two-tier in the brief, and those
 *    tiers map exactly onto 04 §5's bottom two levels:
 *      "Learning - course basics completed, not yet applied in a real
 *      project"  ->  `learning`
 *      "Interested in - clear next step, not yet started"  ->  `interested`
 *    Seeded as that literal split. Collapsing it back into one blended tier
 *    would erase a distinction the brief makes deliberately: §11 ties it to the
 *    serverless/Firebase scope decision on the Scholarship dashboard, which was
 *    a reasoned engineering choice made partly because backend depth is still
 *    developing - "not a limitation to hide" (brief §11, §10). "Course basics
 *    done" and "not yet started" are different claims and must stay different.
 *
 * So the only thing still unverified here is which current-focus skills are
 * `strong` rather than `good`. That narrower gap is what UNSEEDED now records.
 * ---------------------------------------------------------------------------
 *
 * Categories for the Expanding Toward entries are inferred: the brief lists
 * that group under one heading without sub-categories, unlike the current-focus
 * groups whose headings map 1:1 onto 04 §5's enum. These are classifications of
 * the technologies themselves, not claims about Muhammed.
 */
/**
 * The id becomes the Firestore document id, so it has to survive punctuation
 * that a naive slug would silently eat: "C#" would collapse to "c" and ".NET"
 * to "net". Both are lossy, and one is ambiguous against a future "C". Ids are
 * effectively permanent once seeded - changing one later orphans a document
 * rather than renaming it - so the substitutions happen before slugifying.
 * "+" is handled for the same reason, ahead of a C++ entry that brief §9's
 * history makes plausible.
 */
const slugify = (name: string): string =>
  name
    .toLowerCase()
    .replace(/^\./, 'dot-')
    .replace(/#/g, '-sharp')
    .replace(/\+/g, '-plus')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const skill = (
  name: string,
  category: Skill['category'],
  level: Skill['level'] = 'good',
): Skill => ({
  id: slugify(name),
  name,
  category,
  level,
});

export const SKILLS: readonly Skill[] = [
  ...['HTML5', 'CSS3', 'JavaScript (ES6+)', 'TypeScript'].map((n) => skill(n, 'language')),
  ...[
    'Angular 17+',
    'Angular Material',
    'Tailwind CSS',
    'Bootstrap 5',
    'jQuery',
    'Responsive Design',
  ].map((n) => skill(n, 'framework')),
  ...[
    'RxJS',
    'Angular Signals',
    'Reactive Forms',
    'REST API Integration',
    'JSON',
    'JWT Authentication',
  ].map((n) => skill(n, 'state-data')),
  ...['D3.js', 'Chart.js'].map((n) => skill(n, 'data-viz')),
  ...[
    'Component Architecture',
    'Lazy Loading',
    'Reusable Components',
    'Cross-Browser Compatibility',
    'Accessibility',
    'Web Performance Optimization',
    'Clean and documented code',
    'Code Reviews',
  ].map((n) => skill(n, 'practice')),
  ...['Git', 'GitHub', 'CI Workflows', 'Postman', 'Figma', 'Netlify', 'Agile / Scrum', 'SDLC'].map(
    (n) => skill(n, 'tooling'),
  ),
  // -- "Expanding Toward", tier 1 (brief §11) -------------------------------
  // "Learning - course basics completed, not yet applied in a real project."
  skill('C#', 'language', 'learning'),
  skill('.NET', 'framework', 'learning'),
  skill('SQL Server Databases', 'state-data', 'learning'),

  // -- "Expanding Toward", tier 2 (brief §11) -------------------------------
  // "Interested in - clear next step, not yet started."
  skill('Node.js', 'framework', 'interested'),
  skill('AI-assisted development tools', 'tooling', 'interested'),
];

/**
 * Social platforms (04 §7, brief §20, 03 §8).
 *
 * Counts are stored raw so "~986K combined" stays a presentation decision.
 * "+1M" must never be rendered from these: 986,000 is under a million, and
 * brief §20 forbids the claim outright.
 *
 * `lastVerifiedDate` is the date these figures were recorded in the planning
 * docs, not today's date. Post-dating it would defeat the entire point of the
 * field, which exists so a stale number stays visible rather than silently
 * aging into a false claim.
 *
 * `url` is absent from both records - no profile URL appears anywhere in docs
 * 00-10. See UNSEEDED.
 */
export const SOCIAL_PLATFORMS: readonly Omit<SocialPlatform, 'url'>[] = [
  { platform: 'instagram', followerCount: 100_000, lastVerifiedDate: new Date('2026-08-27') },
  { platform: 'facebook', followerCount: 886_000, lastVerifiedDate: new Date('2026-08-27') },
];

/**
 * Entities from 04 that are NOT seeded, and the exact fact each one waits on.
 *
 * Kept in code, beside the data, so the gap is visible to whoever runs the
 * seed instead of living only in a document. The seed script prints this list
 * on every run.
 */
export const UNSEEDED: readonly { entity: string; blockedOn: string }[] = [
  {
    entity: 'Profile.resumeFile (04 §2)',
    blockedOn:
      'Every other Profile field is final as of 2026-08-27. Only the resume is outstanding: no file has been uploaded to Storage (06 §3.2), and 10 §3 has not settled PDF-only download vs an inline preview on /resume. The field is optional, so the site renders without a resume link rather than offering a broken one - but 02 §3 puts Resume in the header AND footer as a top-priority recruiter exit path (brief §28), so this is worth closing before launch.',
  },
  {
    entity: 'Experience (04 §4)',
    blockedOn:
      'No role / organization / timeframe records are written out in docs 00-10. Smart Technology recurs throughout as the ST Employees Portal’s context, and 04 §4 names it as the linkedProjectSlug example, but the role title, timeframe and summary were never captured.',
  },
  {
    entity: 'Education (04 §10)',
    blockedOn:
      'Entries live in Discovery, not in docs 00-10. 10 §2 additionally flags that a 2026-dated Coursera certificate needs a sanity check before any of these reach the Education page.',
  },
  {
    entity: 'BusinessVenture: Ateeqi Tech (04 §9)',
    blockedOn:
      'Metrics are verified and usable ("80+ laptops", "~80,000 EGP net proceeds" per 03 §8), but the customer-first laptop business narrative that 04 §9 calls for as `summary` has not been written. Name is "Ateeqi Tech", never the Arabic form (09 §2.1).',
  },
  {
    entity: 'SocialPlatform URLs (04 §7)',
    blockedOn:
      'Follower counts are verified; the Instagram and Facebook profile URLs are recorded nowhere. Both records seed without `url`, so /beyond/social can state reach but cannot yet link out.',
  },
  {
    entity: 'Skill levels: `strong` vs `good` (04 §5)',
    blockedOn:
      'NARROWED, not closed. brief §11 now states the bottom two levels outright - "Learning" (C#, .NET, SQL Server Databases) and "Interested in" (Node.js, AI-assisted development tools) - and both are seeded as that literal split. What the brief still does not state is which "Current technical focus" skills are `strong` rather than `good`; all 34 of them seed as `good`, a floor the source supports. Needs one editorial pass before the Skills section is published.',
  },
  {
    entity: 'ProofPoint (04 §11)',
    blockedOn:
      'Deliberately empty rather than blocked. 04 §11 describes this as a curated subset chosen for Home’s Proof Strip; which numbers earn that slot is an editorial decision for Muhammed in the dashboard, not one to make by seeding every available figure.',
  },
  {
    entity: 'Media (04 §6)',
    blockedOn:
      'Five screenshots exist for the Scholarship dashboard under projects/ScholarshipOperationDashboard/Media/, but they need uploading to Storage first (06 §3.2) - the model stores a URL, not a local path. No media exists for the other four projects. Missing media never blocks a case study going live (brief §32).',
  },
];
