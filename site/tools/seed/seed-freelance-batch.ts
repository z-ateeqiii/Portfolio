import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { Timestamp, doc, getFirestore, writeBatch } from 'firebase/firestore';

import { firebaseConfig, isFirebaseConfigured } from '../../src/app/core/firebase/firebase.config';
import { COLLECTIONS } from '../../src/app/core/services/firestore-collection';
import { PROJECTS } from './seed-data';

/**
 * One-off: seeds ONLY the three freelance projects added 2026-09-06
 * (00 §12, 03 §6a) — magic-touch, creative-nails, grandpas-kitchen.
 *
 *   SEED_EMAIL=... SEED_PASSWORD=... npx tsx tools/seed/seed-freelance-batch.ts
 *
 * Deliberately NOT `seed.ts projects`: that command iterates the entire
 * `PROJECTS` array and would overwrite all 8 entries, including the 5
 * original projects — which may carry live edits published through the
 * dashboard since seed-data.ts was last synced (seed.ts's own header
 * comment documents exactly this danger). This script writes only the
 * three new slugs by name, so the other five are never touched regardless
 * of what seed-data.ts currently holds for them.
 *
 * Safe to delete once these three are confirmed live — it has no purpose
 * after this one run.
 */
const NEW_SLUGS = new Set(['magic-touch', 'creative-nails', 'grandpas-kitchen']);

const email = process.env['SEED_EMAIL'];
const password = process.env['SEED_PASSWORD'];

async function main(): Promise<void> {
  if (!isFirebaseConfigured()) {
    console.error('Firebase is not configured (10 §4a).');
    process.exitCode = 1;
    return;
  }
  if (!email || !password) {
    console.error('Set SEED_EMAIL and SEED_PASSWORD to the single admin account (05 §1).');
    process.exitCode = 1;
    return;
  }

  const projects = PROJECTS.filter((p) => NEW_SLUGS.has(p.slug));
  const missing = [...NEW_SLUGS].filter((slug) => !projects.some((p) => p.slug === slug));
  if (missing.length) {
    console.error(`Not found in seed-data.ts PROJECTS: ${missing.join(', ')}`);
    process.exitCode = 1;
    return;
  }

  const app = initializeApp(firebaseConfig, 'ateeqi-seed-freelance');
  await signInWithEmailAndPassword(getAuth(app), email, password);

  const store = getFirestore(app);
  const batch = writeBatch(store);
  const now = Timestamp.now();

  // Published, not draft: this is real, reviewed content from 03 §6a, not
  // scaffolding — same treatment the original five projects got in seed.ts.
  for (const project of projects) {
    batch.set(doc(store, COLLECTIONS.projects, project.slug), {
      ...project,
      status: 'published',
      updatedAt: now,
      publishedAt: now,
    });
  }

  await batch.commit();
  console.log(`Seeded ${projects.length} projects: ${projects.map((p) => p.slug).join(', ')}.`);
  console.log('No other project documents were touched.');
}

main().catch((error: unknown) => {
  console.error('Seed failed:', error);
  process.exitCode = 1;
});
