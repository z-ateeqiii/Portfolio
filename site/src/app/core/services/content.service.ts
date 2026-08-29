import { Injectable } from '@angular/core';
import { orderBy, where } from 'firebase/firestore';

import {
  BusinessVenture,
  Education,
  Experience,
  Media,
  Profile,
  Project,
  ProofPoint,
  Skill,
  SocialPlatform,
} from '../models';
import {
  COLLECTIONS,
  PROFILE_DOC_ID,
  mediaPath,
  publishedDoc,
  publishedQuery,
  referenceQuery,
} from './firestore-collection';

/**
 * Typed read access to published content, for the public site (09 §5).
 *
 * Components call these methods; they never build a query themselves. That is
 * what keeps the published-only rule (05 §6) in one auditable place instead of
 * spread across every route that happens to need data.
 *
 * Every method resolves to a value — `[]` or `null` — rather than throwing, so
 * a page renders around missing content instead of failing (04 §1.2). The
 * Firebase project does not exist yet (10 §4a), so today every call returns
 * empty; connecting the project is the only change needed to make them real.
 *
 * Writes are NOT here. The dashboard's create/update/publish operations are
 * Phase 5 and belong behind the auth guard — a public-site service that can
 * write is a public-site service that can be made to write.
 */
@Injectable({ providedIn: 'root' })
export class ContentService {
  /** The Profile singleton (04 §2), or null if unpublished/unconfigured. */
  profile(): Promise<Profile | null> {
    return publishedDoc<Profile>(COLLECTIONS.profile, PROFILE_DOC_ID);
  }

  /** All published projects in curated order (brief §12, 04 §3). */
  projects(): Promise<Project[]> {
    return publishedQuery<Project>(COLLECTIONS.projects, orderBy('order'));
  }

  /** The subset teased on Home's Featured Work section (02 §4). */
  featuredProjects(): Promise<Project[]> {
    return publishedQuery<Project>(
      COLLECTIONS.projects,
      where('featuredOnHome', '==', true),
      orderBy('order'),
    );
  }

  /**
   * One project for /work/:slug (06 §4).
   *
   * The document id IS the slug (06 §3.1), so this needs no slug index and no
   * second lookup. Returns null for an unknown or unpublished slug — which the
   * route must render as a 404, not as an empty case study.
   */
  project(slug: string): Promise<Project | null> {
    return publishedDoc<Project>(COLLECTIONS.projects, slug);
  }

  /** A project's screenshots, in manual order (04 §6). */
  media(slug: string): Promise<Media[]> {
    return referenceQuery<Media>(mediaPath(slug), orderBy('order'));
  }

  /**
   * Professional history (04 §4), in stored order — reverse-chronological as
   * 02 §7 asks. `timeframe` is free text and cannot be sorted, so the order is
   * an explicit field rather than something derived from prose.
   */
  experience(): Promise<Experience[]> {
    return publishedQuery<Experience>(COLLECTIONS.experience, orderBy('order'));
  }

  /** Skills, for grouping by level in the UI (04 §5). */
  skills(): Promise<Skill[]> {
    return referenceQuery<Skill>(COLLECTIONS.skills);
  }

  /** Social reach, for /beyond/social (04 §7). */
  socialPlatforms(): Promise<SocialPlatform[]> {
    return referenceQuery<SocialPlatform>(COLLECTIONS.socialPlatforms);
  }

  /** Ateeqi Tech, for /beyond/business (04 §9). */
  businessVentures(): Promise<BusinessVenture[]> {
    return referenceQuery<BusinessVenture>(COLLECTIONS.businessVentures);
  }

  /**
   * Education and certifications (04 §10).
   *
   * Filters on `visible` at the query level for the same reason drafts are
   * filtered at the query level: "not shown" should mean not sent (brief §9).
   */
  education(): Promise<Education[]> {
    return referenceQuery<Education>(COLLECTIONS.education, where('visible', '==', true));
  }

  /** Home's Proof Strip numbers (02 §4.2, 04 §11). */
  proofPoints(): Promise<ProofPoint[]> {
    return referenceQuery<ProofPoint>(COLLECTIONS.proofPoints);
  }
}
