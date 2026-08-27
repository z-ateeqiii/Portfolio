import { Project, Skill, SocialPlatform } from '../../src/app/core/models';

/**
 * Phase 2 seed content (08 §3, 08 §4).
 *
 * --- What is in here, and what is deliberately NOT --------------------------
 * Everything below is copied from the written record - 03-case-study-system.md
 * §4-6 and 00-project-brief.md §11, §20 - not paraphrased and not filled in.
 * The prose is verbatim from 03: those are Muhammed's own sentences about his
 * own work, and 09 §2.4 says not to rewrite their substance.
 *
 * Several entities from 04-content-model.md are absent because the facts they
 * need do not exist anywhere in docs 00-10. Writing them would mean inventing
 * a fact on a credibility site, which 09 §3 rules out as the one thing not to
 * do. Each gap is listed in UNSEEDED at the bottom of this file and logged in
 * 10 §4a, rather than left as a silent omission.
 * ---------------------------------------------------------------------------
 */

/** A project as authored here: status and timestamps are applied at write time. */
export type ProjectSeed = Omit<Project, 'status' | 'updatedAt' | 'publishedAt'>;

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
];

/**
 * Skills (04 §5), from the categorised stack in brief §11.
 *
 * The names and categories are real and complete. `level` is NOT: brief §11
 * lists every skill by category without stating a proficiency, and 04 §5's
 * four levels come from a Discovery framing that is not reproduced in docs
 * 00-10. Only the "Expanding Toward" group has a level the source supports -
 * the brief labels it aspirational, which maps cleanly onto `interested`.
 *
 * Everything else is seeded `good` as an explicit placeholder, not a claim.
 * Guessing `strong` would have Muhammed asserting a proficiency he has not
 * asserted - the exact failure mode 01 §9 Rule 4 is about - and guessing
 * `learning` would understate real experience. This is the one field in this
 * file that is not verified, it is listed in UNSEEDED, and it needs one pass
 * in the dashboard before the Skills section goes live.
 */
const skill = (
  name: string,
  category: Skill['category'],
  level: Skill['level'] = 'good',
): Skill => ({
  id: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
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
  // "Expanding Toward" (brief §11) - explicitly aspirational in the source.
  ...['.NET', 'C#', 'SQL Server', 'AI-assisted development tools'].map((n) =>
    skill(n, 'tooling', 'interested'),
  ),
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
    entity: 'Profile (04 §2)',
    blockedOn:
      'heroStatement is still unlocked (10 §2 - brand doc §5 left four directions open); bioShort and bioLong have never been written; contactEmail, contactLinkedIn, contactGitHub, socialInstagram and socialFacebook appear nowhere in docs 00-10. Blocks the Hero and the Contact page in Phase 3.',
  },
  {
    entity: 'Project: FreshCart (03 §6)',
    blockedOn:
      'Only a one-line pointer exists ("capstone project for the Angular course; real, live API, not mocked"). No Problem / Build / Outcome prose has been written, and 03 §9 defers final on-page copy. Facts available from projects/FreshCart/README.md: Angular 17 with SSR via Express, JWT auth, cart, Tailwind + Flowbite, repo github.com/muhammed-alateeqi1/eCommerceAngular.',
  },
  {
    entity: 'Project: Nutella Digital Menu (03 §6)',
    blockedOn:
      'Same as FreshCart - real facts, no authored case-study prose. Facts available: 221 items across 16 categories, bilingual EN/AR with full RTL, Angular 19 standalone + signals, JSON-driven, now in use at the cafe. 03 §6 notes this is the clearest "builds without being asked" evidence in the whole set and should be framed that way even at compact depth.',
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
    entity: 'Skill levels (04 §5)',
    blockedOn:
      'Names and categories are seeded from brief §11. Proficiency is not stated there for any skill except the aspirational "Expanding Toward" group, so every other record carries a placeholder `good`. Needs one editorial pass before the Skills section is published.',
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
