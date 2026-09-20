import { Editable } from './content-status';

/** Depth tier (03 §3) — controls how much of the six-block template renders. */
export type ProjectTier = 'featured' | 'standard' | 'compact';

/**
 * What kind of work this was (04 §3, added 2026-09-19) — powers the /work
 * filter tabs.
 *
 * Orthogonal to `tier`, and deliberately so: `tier` is how much page a project
 * earns, `category` is who it was for. A freelance site can be compact and a
 * company project featured, but neither fact implies the other.
 */
export type ProjectCategory = 'company' | 'freelance' | 'personal';

/**
 * Project (04 §3). One document per project at /projects/{slug} (06 §3.1).
 *
 * `problem` / `approach` / `build` / `outcome` map 1:1 onto the six-block
 * structure in 03 §2, so the worked examples in 03 §4–5 drop straight in.
 *
 * `timeframe` is free text on purpose (04 §3): several projects have a
 * duration ("Built in ~7 days") but no real calendar dates, and forcing
 * start/end fields would mean inventing one.
 */
export interface Project extends Editable {
  readonly slug: string;
  readonly name: string;
  /** One-line description for /work cards. */
  readonly tagline: string;
  readonly tier: ProjectTier;

  /**
   * OPTIONAL, because the field is newer than the documents.
   *
   * Every published Project in Firestore predates it, so a live record simply
   * does not have one until it is seeded or set in the dashboard. Declaring it
   * required would make TypeScript agree it is always present while the actual
   * data disagrees — the same class of lie that made `publishedAt` look like a
   * Date after a TransferState round trip.
   *
   * The /work filter is built from the categories actually present, so an
   * uncategorised project appears under "All" and nowhere else, and a category
   * nothing uses grows no tab. Nothing breaks before it is seeded; there is
   * just one tab.
   */
  readonly category?: ProjectCategory;
  /** Manual curation order — curation over chronology (brief §12). */
  readonly order: number;
  readonly role: string;
  readonly timeframe: string;
  /** 3–5 tags (03 §2, Snapshot). Rendered as <ui-tag>. */
  readonly stack: readonly string[];
  /** Optional — not every project has a live deployment. */
  readonly liveUrl?: string;
  /** Optional — e.g. Cyber50's main repo is still missing (10 §2). */
  readonly githubUrl?: string;

  /** Block 2 — what was actually broken, for who (03 §2). */
  readonly problem: string;
  /** Block 3 — omitted on compact tier, where it folds into problem/build. */
  readonly approach?: string;
  /** Block 4 — what was built and why those decisions. */
  readonly build: string;
  /**
   * Block 5 — present only where AI was actually used (03 §2.5).
   * Never skip this on a project that has one defined (09 §3).
   */
  readonly aiDisclosure?: string;
  /**
   * Separate from `aiDisclosure`: for cases where the DATA needs disclosing,
   * not the build process. Surfaced by Cyber50, whose incident dataset is
   * AI-generated dummy data (03 §6.1, 04 §3).
   */
  readonly dataHonestyNote?: string;
  /** Block 6 — always present, scoped honestly, no invented metrics. */
  readonly outcome: string;

  /** Whether this appears in Home's Featured Work section (02 §4). */
  readonly featuredOnHome: boolean;
}
