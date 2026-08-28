import { Injectable, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRouteSnapshot, RouterStateSnapshot, TitleStrategy } from '@angular/router';

import { Project } from '../models';

const SUFFIX = 'Muhammed Al-Ateeqi';

/**
 * Page titles, including the per-project case-study title.
 *
 * ─── Why this is not just a `title:` ResolveFn on the route ──────────────────
 * A `title` ResolveFn runs as part of the SAME resolve step as the data
 * resolvers, so it cannot read their results — `route.data['project']` is still
 * empty when it executes, and every case study silently came out titled
 * "Case study — Muhammed Al-Ateeqi". Caught by checking the actual <title> in
 * the served HTML rather than trusting the route config to be doing its job.
 *
 * `TitleStrategy.updateTitle` runs AFTER resolution, so the resolved project is
 * available here.
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * This matters more than a nicety: 02 §6 requires a case study to stand alone
 * as "a shareable link a recruiter can forward without context", and brief §29
 * makes search presence a first-class goal. The <title> is what a search result
 * and a link preview lead with.
 */
@Injectable({ providedIn: 'root' })
export class SiteTitleStrategy extends TitleStrategy {
  private readonly title = inject(Title);

  override updateTitle(snapshot: RouterStateSnapshot): void {
    this.title.setTitle(this.resolve(snapshot));
  }

  private resolve(snapshot: RouterStateSnapshot): string {
    let route: ActivatedRouteSnapshot | undefined = snapshot.root;
    while (route?.firstChild) route = route.firstChild;

    /**
     * A resolved-but-null project means an unknown or unpublished slug. The
     * title stays generic in that case — naming a project that did not resolve
     * would confirm to a fisher that the slug they guessed exists as a draft
     * (05 §6).
     */
    const project = route?.data['project'] as Project | undefined | null;
    if (project?.name) return `${project.name} — ${SUFFIX}`;

    return this.buildTitle(snapshot) ?? SUFFIX;
  }
}
