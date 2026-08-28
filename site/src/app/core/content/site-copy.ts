/**
 * Editorial copy that is NOT in the content model.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * Why this file exists, and why it is deliberately small.
 *
 * 04-content-model.md models the FACTS — projects, profile, skills, ventures.
 * It does not model section framings, the process description, or navigation
 * microcopy, because none of those are facts about Muhammed that need editing
 * per-record. They are the site's own voice.
 *
 * Everything here traces to a specific line in the docs, cited inline. Nothing
 * here is a claim about Muhammed's work, a metric, or a date — those all come
 * from Firestore (09 §3). If a value in this file ever needs to become
 * editable, that is a content-model change to raise (09 §2.3), not a reason to
 * quietly move a fact out of Firestore and into code.
 *
 * Logged as a content-model gap in 10 §4b: 02 §4 asks Home for section framings
 * that 04 has no field for.
 * ─────────────────────────────────────────────────────────────────────────────
 */

/**
 * The process from brief §10, condensed.
 *
 * 02 §4.4 asks for "a short, visual treatment of the 9-step process —
 * condensed, not the full list". Rendering all nine as a numbered list is
 * exactly what that rules out, and 07 §7 cautions against decorative numbering.
 *
 * So the nine steps are grouped into four movements. The grouping is the only
 * authored part; every `steps` string below is brief §10 verbatim, so the
 * condensing never turns into rewriting.
 */
export const PROCESS = [
  {
    title: 'Understand',
    steps: [
      'Understand the entire process.',
      'Identify the actual problem.',
      'Understand who is affected.',
    ],
  },
  {
    title: 'Decide',
    steps: [
      'Explore multiple possible solutions.',
      'Consider trade-offs.',
      'Choose an appropriate solution.',
    ],
  },
  { title: 'Build', steps: ['Build it.'] },
  { title: 'Improve', steps: ['Observe the outcome.', 'Improve it.'] },
] as const;

/**
 * The journey arc from brief §8.
 *
 * Verbatim, in order. 02 §7.2 asks for it "told as a narrative arc, not a
 * bullet timeline" — the prose narrative is `Profile.bioLong` from Firestore;
 * this sequence is the visual spine that runs alongside it. 07 §7 permits
 * sequence markers here specifically because this genuinely is an ordered
 * timeline.
 */
export const JOURNEY = [
  'Computer',
  'Gaming',
  'Video Editing',
  'Content Creation',
  'Programming',
  'Computer Science',
  'Freelancing',
  'Business',
  'Leadership',
  'Setback',
  'Rebuilding',
  'Software Engineering',
] as const;

/**
 * Section framings.
 *
 * Each is derived from the IA's own description of that section rather than
 * invented as marketing copy. Cited so a reviewer can check the derivation.
 *
 * These are the one genuinely authored strings on the site — final on-page
 * wording is deferred in 03 §9, so treat them as good defaults to review, not
 * as locked copy.
 */
export const COPY = {
  /** 02 §4.3 — "Leads with the Scholarship Operation Dashboard" (brief §15). */
  featuredWork: 'A few projects that show the thinking, not just the stack.',

  /** 02 §4.4 — "Signals product thinking before the visitor opens a case study." */
  process: 'The problem comes first. The technology is whatever the problem turns out to need.',

  /** 02 §4.5 — "A short excerpt … ends with a link into /about". */
  storyTeaser: 'Computers have been the one constant — the role kept changing.',

  /** 02 §4.6 — "One short, confident line … that there's more beneath the surface." */
  beyondTeaser: 'There is a layer behind the engineer: creating, selling, teaching.',

  /** 02 §8 — "different room, same house" (brand doc §11–12). */
  beyondHub: 'The same person, away from the codebase.',

  /** 02 §9 — "short, direct framing", primary channels only (brief §27). */
  contact: 'The fastest way to reach me is email. LinkedIn and GitHub work too.',
} as const;

/**
 * Teaching (02 §8.3, brief §21).
 *
 * NOTE — this is the one Beyond Code page with NO seeded record behind it.
 * 04 has no Teaching entity, and docs 00–10 contain no specifics: no course
 * names, no institutions, no dates. brief §22 lists "300+ students taught" as a
 * POTENTIAL proof point and §22 closes with "Numbers must be verified before
 * publication" — it has never been verified, so it is not rendered anywhere.
 *
 * The page therefore says only what brief §21 actually states, and says it
 * once. That is honest and thin, rather than padded to look substantial.
 * Tracked in 10 §4b.
 */
export const TEACHING = {
  framing: 'Teaching, and helping other people get better at building things.',
  /** brief §21, verbatim in substance: the four things it says this evidences. */
  evidences: [
    'Communication',
    'Mentorship',
    'Technical understanding',
    'Desire to help others improve',
  ],
} as const;
