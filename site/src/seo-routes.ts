import type { Request, Response } from 'express';

import { firebaseConfig, isFirebaseConfigured } from './app/core/firebase/firebase.config';

/**
 * `sitemap.xml` and `robots.txt` (06 §6, brief §29).
 *
 * ─── Why the sitemap is generated per request, not written at build time ──────
 * 06 §6 asks for it "generated server-side from the same Firestore data the
 * routes render from, so it never drifts out of sync with what's actually
 * published — new projects appear in the sitemap automatically once published,
 * without a manual step."
 *
 * A build-time file could not do that: the site is server-rendered precisely so
 * a dashboard publish appears without a redeploy (06 §2), and a sitemap frozen
 * at build time would keep advertising the old set of pages until someone
 * remembered to rebuild.
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Uses the Firestore REST API rather than the SDK. This module is loaded by
 * Express outside Angular's injector, and pulling the full SDK in here to run
 * one query per sitemap request would be a large dependency for a small job.
 * The REST endpoint honours the same security rules, so it can still only see
 * published documents.
 */

const PUBLIC_ROUTES = [
  { path: '/', priority: '1.0' },
  { path: '/work', priority: '0.9' },
  { path: '/about', priority: '0.8' },
  { path: '/beyond', priority: '0.6' },
  { path: '/beyond/social', priority: '0.5' },
  { path: '/beyond/business', priority: '0.5' },
  { path: '/beyond/teaching', priority: '0.5' },
  { path: '/contact', priority: '0.7' },
];

function originOf(req: Request): string {
  const proto = (req.headers['x-forwarded-proto'] as string)?.split(',')[0] ?? req.protocol ?? 'https';
  const host = (req.headers['x-forwarded-host'] as string)?.split(',')[0] ?? req.get('host') ?? '';
  return host ? `${proto}://${host}` : '';
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

interface SitemapEntry {
  readonly loc: string;
  readonly priority: string;
  readonly lastmod?: string;
}

/**
 * Published project slugs, straight from Firestore's REST API.
 *
 * Returns an empty list on any failure. A sitemap missing its case studies is
 * a recoverable SEO problem; a 500 on /sitemap.xml is a broken endpoint that
 * search engines will keep retrying — so this degrades the same way the read
 * layer does (04 §1.2).
 */
async function publishedProjects(): Promise<{ slug: string; updatedAt?: string }[]> {
  if (!isFirebaseConfigured()) return [];

  const url =
    `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}` +
    `/databases/(default)/documents:runQuery?key=${firebaseConfig.apiKey}`;

  const body = {
    structuredQuery: {
      from: [{ collectionId: 'projects' }],
      where: {
        fieldFilter: {
          field: { fieldPath: 'status' },
          op: 'EQUAL',
          value: { stringValue: 'published' },
        },
      },
      orderBy: [{ field: { fieldPath: 'order' }, direction: 'ASCENDING' }],
    },
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!response.ok) return [];

    const rows = (await response.json()) as {
      document?: { name?: string; fields?: Record<string, { stringValue?: string }>; updateTime?: string };
    }[];

    return rows
      .filter((row) => row.document?.name)
      .map((row) => ({
        slug: row.document!.name!.split('/').pop()!,
        updatedAt: row.document!.updateTime,
      }));
  } catch {
    return [];
  }
}

export async function sitemapHandler(req: Request, res: Response): Promise<void> {
  const origin = originOf(req);
  const projects = await publishedProjects();

  const entries: SitemapEntry[] = [
    ...PUBLIC_ROUTES.map((route) => ({ loc: `${origin}${route.path}`, priority: route.priority })),
    ...projects.map((project) => ({
      loc: `${origin}/work/${project.slug}`,
      priority: '0.8',
      lastmod: project.updatedAt?.slice(0, 10),
    })),
  ];

  /**
   * /admin is absent, and so is /styleguide — 05 §6 and 06 §4 keep the
   * dashboard out of anything crawlable, and the styleguide is Phase 1
   * scaffolding that is not a site page (10 §4a).
   */
  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    entries
      .map(
        (entry) =>
          `  <url>\n` +
          `    <loc>${escapeXml(entry.loc)}</loc>\n` +
          (entry.lastmod ? `    <lastmod>${entry.lastmod}</lastmod>\n` : '') +
          `    <priority>${entry.priority}</priority>\n` +
          `  </url>\n`,
      )
      .join('') +
    `</urlset>\n`;

  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  /** Short cache: the point of generating this live is that a publish shows up. */
  res.setHeader('Cache-Control', 'public, max-age=300');
  res.send(xml);
}

/**
 * Published slugs as a set, for the soft-404 guard in server.ts.
 *
 * Returns null (not an empty set) when the lookup fails, so the caller can tell
 * "no projects are published" apart from "we could not find out" — and a
 * transient Firestore hiccup never 404s a page that actually exists.
 */
export async function publishedSlugs(): Promise<Set<string> | null> {
  if (!isFirebaseConfigured()) return null;
  try {
    const projects = await publishedProjects();
    return projects.length ? new Set(projects.map((p) => p.slug)) : null;
  } catch {
    return null;
  }
}

export function robotsHandler(req: Request, res: Response): void {
  const origin = originOf(req);

  /**
   * Disallow /admin explicitly (06 §6). Also /styleguide, which exists only for
   * the Phase 1 review and should never appear in a search result for
   * Muhammed's name.
   */
  const body =
    `User-agent: *\n` +
    `Allow: /\n` +
    `Disallow: /admin\n` +
    `Disallow: /styleguide\n` +
    (origin ? `\nSitemap: ${origin}/sitemap.xml\n` : '');

  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.send(body);
}
