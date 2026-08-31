import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';

import { publishedSlugs, robotsHandler, sitemapHandler } from './seo-routes';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();

/**
 * SEO endpoints (06 §6). Registered before the static handler and before
 * Angular, so they answer directly rather than falling through to a rendered
 * page. Both are generated per request from live Firestore data, so a
 * dashboard publish appears without a redeploy.
 */
app.get('/sitemap.xml', (req, res, next) => {
  sitemapHandler(req, res).catch(next);
});
app.get('/robots.txt', robotsHandler);

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
/**
 * Unknown project slugs must answer 404, not 200 (10 §4d).
 *
 * `/work/:slug` matches any slug and renders a proper not-found view, but the
 * status line said 200 — a "soft 404". Search engines index those as real
 * content, which works directly against brief §29's goal of this site being the
 * top result for Muhammed's name.
 *
 * Implemented by intercepting `writeHead` rather than by calling `res.status()`
 * first: `writeResponseToNodeResponse` writes the render's own 200 and would
 * overwrite anything set beforehand. Patching the one call that commits the
 * status line is the only point where the override survives.
 *
 * The slug list comes from the same Firestore data the page renders from, so
 * there is no second list to keep in sync. `publishedSlugs` returns null when
 * the lookup fails, and null means "do not touch the status" — a transient
 * Firestore hiccup must never 404 a page that genuinely exists.
 */
app.use(async (req, res, next) => {
  const match = /^\/work\/([^/?#]+)\/?$/.exec(req.path);
  if (!match) return next();

  const published = await publishedSlugs();
  if (published && !published.has(decodeURIComponent(match[1]))) {
    const writeHead = res.writeHead.bind(res);
    res.writeHead = ((_status: number, ...rest: unknown[]) =>
      (writeHead as (...args: unknown[]) => unknown)(404, ...rest)) as typeof res.writeHead;
  }
  next();
});

app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) => (response ? writeResponseToNodeResponse(response, res) : next()))
    .catch(next);
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
