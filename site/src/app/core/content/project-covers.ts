import { imageUrl } from '../cloudinary/cloudinary.config';
import { Project } from '../models';
import { ContentService } from '../services';

/**
 * Project cover images (04 §6's `isFeatured`) for Home and /work card templates.
 *
 * Lives here, not inside `app.routes.ts`, so that lazily-loaded feature
 * components (`Home`, `WorkIndex`) can import the TYPE without creating a
 * dependency pointing back up at the route config — the same reason `Media`,
 * `Project` etc. live in `core/models` rather than being declared inline
 * wherever a resolver first needed them.
 */

/** A project's Home/Work card image, chosen via 04 §6's `isFeatured`. */
export interface ProjectCover {
  readonly url: string;
  readonly alt: string;
}

/**
 * A project list plus each project's cover image, keyed by slug.
 *
 * Card templates look up `covers[project.slug]` and render nothing when a
 * project has no cover yet (brief §32: missing media never blocks a page) —
 * text-only cards are the existing, already-correct fallback.
 */
export interface ProjectsWithCovers {
  readonly projects: readonly Project[];
  readonly covers: Readonly<Record<string, ProjectCover>>;
}

/**
 * Attaches each project's cover image to an already-resolved project list.
 *
 * One extra Firestore read per project — bounded and small (five projects,
 * site-wide) rather than an unbounded N+1 pattern — and meant to be folded
 * into the SAME resolver as the project list itself (see `app.routes.ts`),
 * rather than a second independent one: a second resolver, keyed separately in
 * `transferred()`'s per-name cache, would quietly re-fetch the same collection
 * a second time, which is exactly the duplicate-read problem Phase 8 removed
 * elsewhere (06 §7).
 *
 * `content` is passed in rather than injected here: this function is called
 * from inside an already-running resolver, after that resolver's own
 * synchronous `inject(ContentService)` call — see the note at each call site
 * in `app.routes.ts` for why the injection has to happen there, not here.
 */
export async function withCovers(
  content: ContentService,
  projects: readonly Project[],
): Promise<ProjectsWithCovers> {
  const entries = await Promise.all(
    projects.map(async (p) => {
      const media = await content.featuredImage(p.slug);
      return media ? ([p.slug, { url: imageUrl(media.publicId, 640), alt: media.alt }] as const) : null;
    }),
  );
  return {
    projects,
    covers: Object.fromEntries(entries.filter((e): e is readonly [string, ProjectCover] => e !== null)),
  };
}
