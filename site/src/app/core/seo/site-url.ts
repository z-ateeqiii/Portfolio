import { REQUEST, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

/**
 * The site's absolute origin, for canonical URLs, Open Graph and the sitemap
 * (06 §6, brief §29).
 *
 * ─── Why this is derived rather than hardcoded ───────────────────────────────
 * No production domain exists yet — brief §29 says "the domain and technical
 * implementation should support discoverability" without naming one, and no
 * domain appears anywhere in docs 00–10. Hardcoding a guess would put a wrong
 * canonical tag on every page, which is worse than none: it actively tells
 * search engines the real page is somewhere else.
 *
 * So the origin is read from the incoming request on the server and from
 * `location` in the browser. That is correct in dev, on a preview deploy, and
 * in production, with nothing to configure.
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * SET `SITE_ORIGIN` ONCE THE DOMAIN EXISTS. Request-derived origins are right
 * per-request but cannot enforce ONE canonical form, which 06 §6 asks for: a
 * site reachable at both a custom domain and a *.web.app URL would
 * self-canonicalise each, and that is exactly the duplicate-content ambiguity
 * canonicals are meant to remove. Tracked in 10 §4g.
 */
export const SITE_ORIGIN = '';

/** Trailing slashes stripped so the origin always concatenates cleanly. */
function clean(origin: string): string {
  return origin.replace(/\/+$/, '');
}

/**
 * MUST be called from an injection context (a constructor or a factory) —
 * it uses `inject()`. SeoService resolves it once at construction and hands the
 * result around, so nothing else has to remember this.
 */
export function siteOrigin(): string {
  if (SITE_ORIGIN) return clean(SITE_ORIGIN);

  /**
   * On the server, `REQUEST` carries the actual inbound request. Angular's
   * SSRF host validation (NG_ALLOWED_HOSTS) has already run by this point, so
   * the host here has been checked rather than trusted blindly — which matters,
   * since an attacker-controlled Host header would otherwise end up inside a
   * canonical tag.
   */
  const request = inject(REQUEST, { optional: true });
  if (request) {
    try {
      return clean(new URL(request.url).origin);
    } catch {
      /* fall through to the document */
    }
  }

  const doc = inject(DOCUMENT, { optional: true });
  const origin = doc?.defaultView?.location?.origin;
  return origin ? clean(origin) : '';
}

/**
 * Joins an already-resolved origin with a route path.
 *
 * Pure, and deliberately takes the origin as an argument rather than calling
 * `siteOrigin()` itself: an earlier version did, which meant every caller
 * inherited the injection-context requirement. That surfaced as NG0203 thrown
 * from `ngOnInit` on exactly the pages that built JSON-LD, silently costing
 * them every meta tag. Found by grepping the served HTML, not by reading code.
 */
export function joinUrl(origin: string, path: string): string {
  const normalised = path.startsWith('/') ? path : `/${path}`;
  /**
   * One canonical form (06 §6): no trailing slash except on the root, so
   * `/about` and `/about/` never both claim to be canonical.
   */
  const trimmed = normalised.length > 1 ? normalised.replace(/\/+$/, '') : '/';
  return `${origin}${trimmed}`;
}
