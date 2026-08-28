import { RenderMode, ServerRoute } from '@angular/ssr';

/**
 * Rendering mode (06 §2).
 *
 * `Server`, not `Prerender`. Prerendering would run every Firestore read at
 * BUILD time and bake the result into static HTML — which 06 §2 rules out
 * directly: "full static generation at build time isn't quite right either —
 * new projects or bio edits published through the dashboard need to appear
 * without a full rebuild/redeploy cycle."
 *
 * Server rendering keeps both properties that matter: every response still
 * carries real HTML for crawlers and link-preview bots (brief §29), and a
 * Draft → Publish in the dashboard shows up on the next request rather than
 * the next deploy (brief §30–31).
 *
 * Phase 5 adds `/admin/**` as RenderMode.Client — it is authenticated, never
 * crawled and never shared as a link, so it does not need SSR (06 §2, §5).
 */
export const serverRoutes: ServerRoute[] = [
  /**
   * The dashboard is client-rendered (06 §2, §5): it is authenticated, never
   * crawled and never shared as a link, so server-rendering it would spend a
   * render on every request for no benefit — and would mean initialising the
   * Auth SDK on the server for a session that only exists in the browser.
   */
  {
    path: 'admin/**',
    renderMode: RenderMode.Client,
  },
  {
    path: '**',
    renderMode: RenderMode.Server,
  },
];
