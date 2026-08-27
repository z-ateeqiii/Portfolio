import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { Timestamp, doc, getFirestore, writeBatch } from 'firebase/firestore';

import { firebaseConfig, isFirebaseConfigured } from '../../src/app/core/firebase/firebase.config';
import { COLLECTIONS, PROFILE_DOC_ID } from '../../src/app/core/services/firestore-collection';
import { PROFILE, PROJECTS, SKILLS, SOCIAL_PLATFORMS, UNSEEDED } from './seed-data';

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
 * updates in place rather than duplicating. Safe to run repeatedly while
 * content is still being corrected.
 */

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
        'Create the project (Firestore, Storage, Auth, Hosting per 06 §3), then paste\n' +
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

  const app = initializeApp(firebaseConfig, 'ateeqi-seed');
  await signInWithEmailAndPassword(getAuth(app), email, password);

  const store = getFirestore(app);
  const batch = writeBatch(store);
  const now = Timestamp.now();

  // Profile is a singleton at a fixed document id (04 §2): it is edited, never
  // created or deleted, so re-running the seed updates the one record.
  batch.set(doc(store, COLLECTIONS.profile, PROFILE_DOC_ID), {
    ...PROFILE,
    status: 'published',
    updatedAt: now,
    publishedAt: now,
  });

  // Projects are seeded as PUBLISHED: this is real, reviewed content from
  // 03 §4-6, not scaffolding. Anything not ready to be public is absent from
  // seed-data.ts entirely rather than parked here as a draft.
  for (const project of PROJECTS) {
    batch.set(doc(store, COLLECTIONS.projects, project.slug), {
      ...project,
      status: 'published',
      updatedAt: now,
      publishedAt: now,
    });
  }

  // Reference data - no publish workflow (04 §12).
  for (const s of SKILLS) {
    batch.set(doc(store, COLLECTIONS.skills, s.id), s);
  }

  for (const platform of SOCIAL_PLATFORMS) {
    batch.set(doc(store, COLLECTIONS.socialPlatforms, platform.platform), {
      ...platform,
      lastVerifiedDate: Timestamp.fromDate(platform.lastVerifiedDate),
    });
  }

  await batch.commit();

  console.log(
    `Seeded profile, ${PROJECTS.length} projects, ${SKILLS.length} skills, ` +
      `${SOCIAL_PLATFORMS.length} social platforms.`,
  );
  reportGaps();
}

main().catch((error: unknown) => {
  console.error('Seed failed:', error);
  process.exitCode = 1;
});
