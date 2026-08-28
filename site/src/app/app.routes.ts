import { inject } from '@angular/core';
import { ResolveFn, Routes } from '@angular/router';

import { BusinessVenture, Media, Project, ProofPoint, SocialPlatform } from './core/models';
import { ContentService } from './core/services';
import { transferred } from './core/services/transfer';

/**
 * Public routes (02 §2, 06 §4).
 *
 * Phase 3 builds Home, About, Beyond Code hub + subpages, and Contact (08 §3).
 * `/work` and `/work/:slug` are Phase 4 and are NOT here yet — see the note at
 * the bottom of this file, because the nav links to them today.
 *
 * Every route lazy-loads its component (06 §4), so a visitor who only reads the
 * Home page never downloads the Beyond Code pages.
 *
 * Data is loaded by resolvers rather than inside components. That matters for
 * SSR specifically: the router awaits a resolver before rendering, so the
 * server emits HTML that already contains the content. A component that fetched
 * in `ngOnInit` would serve an empty shell to crawlers and link-preview bots,
 * which is the one thing 06 §2 is trying to prevent (brief §29).
 */

const featuredProjects: ResolveFn<Project[]> = transferred('featuredProjects', () =>
  inject(ContentService).featuredProjects(),
);
const proofPoints: ResolveFn<ProofPoint[]> = transferred('proofPoints', () =>
  inject(ContentService).proofPoints(),
);
const socialPlatforms: ResolveFn<SocialPlatform[]> = transferred('socialPlatforms', () =>
  inject(ContentService).socialPlatforms(),
);
const businessVentures: ResolveFn<BusinessVenture[]> = transferred('businessVentures', () =>
  inject(ContentService).businessVentures(),
);
const allProjects: ResolveFn<Project[]> = transferred('projects', () =>
  inject(ContentService).projects(),
);

/**
 * A single case study. Keyed per slug so two different case studies visited in
 * one session do not collide in the transfer cache.
 *
 * Resolves to `null` for an unknown OR unpublished slug — the component renders
 * a not-found view for both, which is deliberate: from the outside a draft must
 * be indistinguishable from a typo (05 §6).
 */
const caseStudy: ResolveFn<Project | null> = (route) => {
  const slug = route.paramMap.get('slug') ?? '';
  return transferred(`project:${slug}`, () => inject(ContentService).project(slug))(
    route,
    {} as never,
  );
};

const caseStudyMedia: ResolveFn<Media[]> = (route) => {
  const slug = route.paramMap.get('slug') ?? '';
  return transferred(`media:${slug}`, () => inject(ContentService).media(slug))(route, {} as never);
};


export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    title: 'Muhammed Al-Ateeqi — Software Engineer & Builder',
    loadComponent: () => import('./features/home/home').then((m) => m.Home),
    resolve: { featured: featuredProjects, proofPoints },
  },
  {
    path: 'work',
    children: [
      {
        path: '',
        pathMatch: 'full',
        title: 'Work — Muhammed Al-Ateeqi',
        loadComponent: () =>
          import('./features/work/work-index/work-index').then((m) => m.WorkIndex),
        resolve: { projects: allProjects },
      },
      {
        path: ':slug',
        loadComponent: () =>
          import('./features/work/case-study/case-study').then((m) => m.CaseStudy),
        resolve: { project: caseStudy, media: caseStudyMedia },
        // Title comes from SiteTitleStrategy, which can see the resolved
        // project; a `title` ResolveFn here could not.
      },
    ],
  },
  {
    path: 'about',
    title: 'About — Muhammed Al-Ateeqi',
    loadComponent: () => import('./features/about/about').then((m) => m.About),
  },
  {
    path: 'beyond',
    children: [
      {
        path: '',
        pathMatch: 'full',
        title: 'Beyond Code — Muhammed Al-Ateeqi',
        loadComponent: () =>
          import('./features/beyond/beyond-hub/beyond-hub').then((m) => m.BeyondHub),
      },
      {
        path: 'social',
        title: 'Social Media World — Muhammed Al-Ateeqi',
        loadComponent: () => import('./features/beyond/social/social').then((m) => m.BeyondSocial),
        resolve: { platforms: socialPlatforms },
      },
      {
        path: 'business',
        title: 'Business — Muhammed Al-Ateeqi',
        loadComponent: () =>
          import('./features/beyond/business/business').then((m) => m.BeyondBusiness),
        resolve: { ventures: businessVentures },
      },
      {
        path: 'teaching',
        title: 'Teaching — Muhammed Al-Ateeqi',
        loadComponent: () =>
          import('./features/beyond/teaching/teaching').then((m) => m.BeyondTeaching),
      },
    ],
  },
  {
    path: 'contact',
    title: 'Contact — Muhammed Al-Ateeqi',
    loadComponent: () => import('./features/contact/contact').then((m) => m.Contact),
  },

  /**
   * Phase 1 review scaffolding. Not a site page and not in the IA (02 §2) —
   * delete this and src/app/dev/ before launch (10 §4a).
   */
  {
    path: 'styleguide',
    title: 'Design system — Phase 1',
    loadComponent: () => import('./dev/styleguide/styleguide').then((m) => m.Styleguide),
  },

  /**
   * Unmatched paths fall back to Home.
   *
   * Note this does NOT catch an unknown project slug: `/work/:slug` matches any
   * slug and resolves to `null`, so the case-study component renders its own
   * not-found view instead. That is the better outcome — it keeps the visitor
   * on the route they asked for and offers a way back to /work, rather than
   * silently teleporting them to the homepage.
   */
  { path: '**', redirectTo: '' },
];
