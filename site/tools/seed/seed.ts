import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { Timestamp, doc, getFirestore, writeBatch } from 'firebase/firestore';

import { firebaseConfig, isFirebaseConfigured } from '../../src/app/core/firebase/firebase.config';
import { COLLECTIONS, PROFILE_DOC_ID } from '../../src/app/core/services/firestore-collection';
import {
  BUSINESS_VENTURES,
  EDUCATION,
  EXPERIENCE,
  PROFILE,
  PROJECTS,
  SKILLS,
  SOCIAL_PLATFORMS,
  UNSEEDED,
} from './seed-data';

/**
 * Phase 2 seed runner (08 §3).
 *
 *   SEED_EMAIL=... SEED_PASSWORD=... npx tsx tools/seed/seed.ts
 *
 * Uses the Firebase Web SDK signed in as the single admin account, NOT the
 * Admin SDK. Two reasons, and the second is the important one:
 *
 *  1. No new dependency and no service-account key to store, which keeps the
 *     credential surface of this repo at zero (see .gitignore).
 *  2. The Admin SDK bypasses security rules entirely. Running the seed through
 *     the same rules the dashboard will use means this script actually
 *     exercises firestore.rules - if the rules are wrong, the seed fails here,
 *     rather than the mistake surfacing later as drafts being publicly
 *     readable (05 §6).
 *
 * Idempotent: every document is written at a deterministic id, so re-running
 * updates in place rather than duplicating.
 *
 * ─── Why it no longer seeds everything by default ────────────────────────────
 * Idempotent also means DESTRUCTIVE once content is being edited in the
 * dashboard. On 2026-08-30 the live hero statement had been changed and
 * published through /admin, while seed-data.ts still carried the older copy —
 * so a blanket re-run to add Experience and Education would have silently
 * reverted a published edit.
 *
 * Entities are therefore named explicitly:
 *
 *   npx tsx tools/seed/seed.ts experience education
 *   npx tsx tools/seed/seed.ts --all        (everything, overwrites live edits)
 *
 * Running it bare lists the choices and writes nothing. This is a one-way
 * operation on real content, so it asks rather than assumes.
 */

const ENTITIES = [
  'profile',
  'projects',
  'experience',
  'education',
  'skills',
  'socialPlatforms',
  'businessVentures',
];

const email = process.env['SEED_EMAIL'];
const password = process.env['SEED_PASSWORD'];

function reportGaps(): void {
  console.log(`\nNOT seeded - ${UNSEEDED.length} entities are waiting on facts (09 §3):\n`);
  for (const { entity, blockedOn } of UNSEEDED) {
    console.log(`  - ${entity}\n      ${blockedOn}\n`);
  }
  console.log('These are logged in docs/10-open-items.md §4a. None of them is a bug.\n');
}

async function main(): Promise<void> {
  if (!isFirebaseConfigured()) {
    console.error(
      'Firebase is not configured yet (10 §4a).\n' +
        'Create the project (Firestore, Auth, Hosting per 06 §3), then paste\n' +
        'the web config into src/app/core/firebase/firebase.config.ts and re-run.\n',
    );
    reportGaps();
    process.exitCode = 1;
    return;
  }

  if (!email || !password) {
    console.error('Set SEED_EMAIL and SEED_PASSWORD to the single admin account (05 §1).');
    process.exitCode = 1;
    return;
  }

  const requested = new Set(process.argv.slice(2).filter((a) => !a.startsWith('--')));
  const all = process.argv.includes('--all');
  const wants = (entity: string) => all || requested.has(entity);

  if (!all && requested.size === 0) {
    console.log(
      [
        'Name the entities to seed, or pass --all.',
        '',
        ...ENTITIES.map((e) => `  ${e}`),
        '',
        'Example:  npx tsx tools/seed/seed.ts experience education',
        '',
        'Nothing was written. Seeding overwrites whatever is live for that entity,',
        'including edits published through the dashboard.',
      ].join('\n'),
    );
    return;
  }

  const unknown = [...requested].filter((r) => !ENTITIES.includes(r));
  if (unknown.length) {
    console.error(`Unknown entity: ${unknown.join(', ')}. Known: ${ENTITIES.join(', ')}`);
    process.exitCode = 1;
    return;
  }

  const app = initializeApp(firebaseConfig, 'ateeqi-seed');
  await signInWithEmailAndPassword(getAuth(app), email, password);

  const store = getFirestore(app);
  const batch = writeBatch(store);
  const now = Timestamp.now();

  // Profile is a singleton at a fixed document id (04 §2): it is edited, never
  // created or deleted, so re-running the seed updates the one record.
  const written: string[] = [];

  if (wants('profile')) {
    batch.set(doc(store, COLLECTIONS.profile, PROFILE_DOC_ID), {
      ...PROFILE,
      status: 'published',
      updatedAt: now,
      publishedAt: now,
    });
    written.push('profile');
  }

  // Projects are seeded as PUBLISHED: this is real, reviewed content from
  // 03 §4-6, not scaffolding. Anything not ready to be public is absent from
  // seed-data.ts entirely rather than parked here as a draft.
  if (wants('projects')) {
    for (const project of PROJECTS) {
      batch.set(doc(store, COLLECTIONS.projects, project.slug), {
        ...project,
        status: 'published',
        updatedAt: now,
        publishedAt: now,
      });
    }
    written.push(`${PROJECTS.length} projects`);
  }

  // Experience is draftable (04 §12), so it seeds published like Projects.
  if (wants('experience')) {
    for (const role of EXPERIENCE) {
      batch.set(doc(store, COLLECTIONS.experience, role.id), {
        ...role,
        status: 'published',
        updatedAt: now,
        publishedAt: now,
      });
    }
    written.push(`${EXPERIENCE.length} roles`);
  }

  // Reference data - no publish workflow (04 §12).
  if (wants('education')) {
    for (const entry of EDUCATION) {
      batch.set(doc(store, COLLECTIONS.education, entry.id), entry);
    }
    written.push(`${EDUCATION.length} education/certifications`);
  }

  if (wants('skills')) {
    for (const skill of SKILLS) {
      batch.set(doc(store, COLLECTIONS.skills, skill.id), skill);
    }
    written.push(`${SKILLS.length} skills`);
  }

  if (wants('socialPlatforms')) {
    for (const platform of SOCIAL_PLATFORMS) {
      batch.set(doc(store, COLLECTIONS.socialPlatforms, platform.platform), {
        ...platform,
        lastVerifiedDate: Timestamp.fromDate(platform.lastVerifiedDate),
      });
    }
    written.push(`${SOCIAL_PLATFORMS.length} social platforms`);
  }

  if (wants('businessVentures')) {
    for (const venture of BUSINESS_VENTURES) {
      batch.set(doc(store, COLLECTIONS.businessVentures, venture.id), venture);
    }
    written.push(`${BUSINESS_VENTURES.length} business venture(s)`);
  }

  await batch.commit();

  console.log(`Seeded: ${written.join(', ')}.`);
  reportGaps();
}

main().catch((error: unknown) => {
  console.error('Seed failed:', error);
  process.exitCode = 1;
});
