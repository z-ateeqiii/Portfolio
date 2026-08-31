import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { Meta } from '@angular/platform-browser';

import { joinUrl, siteOrigin } from './site-url';

export interface PageSeo {
  /** Route path, e.g. `/work/freshcart`. Used for the canonical URL. */
  readonly path: string;
  readonly title: string;
  readonly description: string;
  /** Absolute image URL for Open Graph. Case studies pass a screenshot. */
  readonly image?: string;
  /** `website` for pages, `article` for a case study. */
  readonly type?: 'website' | 'article';
  /** JSON-LD object. `Person` on Home/About, `CreativeWork` on case studies. */
  readonly jsonLd?: Record<string, unknown>;
}

const JSON_LD_ID = 'seo-json-ld';

/**
 * Per-route metadata (06 §6, brief §29).
 *
 * ─── Why this runs where it does ─────────────────────────────────────────────
 * Called from page components, which run during SSR — so the tags are in the
 * HTML of the first response, which is the only version a crawler or a
 * link-preview bot ever sees. Setting them after hydration would be invisible
 * to exactly the audience brief §29 is about.
 *
 * Every tag is REPLACED, not appended. Angular reuses component instances
 * across navigations, and appending would leave the previous page's description
 * and OG image behind — so a recruiter forwarding one case study would preview
 * a different one.
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Descriptions come from Firestore (a project's tagline, the profile's
 * bioShort), never from hand-written duplicates that would drift from the
 * content they summarise.
 */
@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly meta = inject(Meta);
  private readonly doc = inject(DOCUMENT);

  /**
   * Resolved once, here, because `siteOrigin()` uses `inject()` and this
   * constructor is the injection context. Every later call — including from
   * `ngOnInit`, where `inject()` would throw NG0203 — reads this instead.
   */
  private readonly origin = siteOrigin();

  /** Absolute URL for a route path. Safe to call from anywhere. */
  absolute(path: string): string {
    return joinUrl(this.origin, path);
  }

  apply(seo: PageSeo): void {
    const url = this.absolute(seo.path);
    const type = seo.type ?? 'website';

    this.set('description', seo.description);

    // Open Graph — what LinkedIn and Facebook read when a link is shared.
    this.setProperty('og:title', seo.title);
    this.setProperty('og:description', seo.description);
    this.setProperty('og:type', type);
    this.setProperty('og:url', url);
    this.setProperty('og:site_name', 'Muhammed Al-Ateeqi');

    /**
     * Only emitted when there is a real image. An `og:image` pointing at
     * nothing renders a broken preview, which is worse than the text-only card
     * a missing tag produces — and no case study has screenshots yet (04 §6).
     */
    if (seo.image) {
      this.setProperty('og:image', seo.image);
      this.set('twitter:card', 'summary_large_image');
      this.set('twitter:image', seo.image);
    } else {
      this.remove('property', 'og:image');
      this.set('twitter:card', 'summary');
      this.remove('name', 'twitter:image');
    }

    this.set('twitter:title', seo.title);
    this.set('twitter:description', seo.description);

    this.setCanonical(url);
    this.setJsonLd(seo.jsonLd);
  }

  private set(name: string, content: string): void {
    this.meta.updateTag({ name, content });
  }

  private setProperty(property: string, content: string): void {
    this.meta.updateTag({ property, content });
  }

  private remove(attribute: 'name' | 'property', value: string): void {
    this.meta.removeTag(`${attribute}='${value}'`);
  }

  /** One canonical link element, rewritten per navigation (06 §6). */
  private setCanonical(url: string): void {
    if (!url) return;
    const head = this.doc.head;
    let link = head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = this.doc.createElement('link');
      link.setAttribute('rel', 'canonical');
      head.appendChild(link);
    }
    link.setAttribute('href', url);
  }

  /**
   * A single JSON-LD script, replaced per route.
   *
   * Given an id so it can be found and swapped rather than accumulating — two
   * competing `Person` blocks on one page is worse than none, because it makes
   * the structured data ambiguous instead of absent.
   */
  private setJsonLd(data: Record<string, unknown> | undefined): void {
    const head = this.doc.head;
    const existing = head.querySelector(`#${JSON_LD_ID}`);
    if (existing) existing.remove();
    if (!data) return;

    const script = this.doc.createElement('script');
    script.id = JSON_LD_ID;
    script.setAttribute('type', 'application/ld+json');
    script.textContent = JSON.stringify(data);
    head.appendChild(script);
  }

  /**
   * `Person` schema for Home and About (06 §6).
   *
   * `sameAs` is what ties this site to the verified social profiles brief §29
   * asks for — it is how a search engine connects the site, the LinkedIn
   * profile and the GitHub account into one identity. Only links that actually
   * exist are included; an empty entry would assert a profile that is not there.
   */
  personSchema(profile: {
    name: string;
    positioning: string;
    bioShort: string;
    contactEmail: string;
    contactLinkedIn: string;
    contactGitHub: string;
    socialInstagram?: string;
    socialFacebook?: string;
  }): Record<string, unknown> {
    const sameAs = [
      profile.contactLinkedIn,
      profile.contactGitHub,
      profile.socialInstagram,
      profile.socialFacebook,
    ].filter((url): url is string => Boolean(url));

    return {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: profile.name,
      jobTitle: profile.positioning,
      description: profile.bioShort,
      ...(profile.contactEmail ? { email: `mailto:${profile.contactEmail}` } : {}),
      url: this.absolute('/'),
      sameAs,
    };
  }

  /**
   * `CreativeWork` for a case study (06 §6).
   *
   * Not `SoftwareApplication`: that describes software a visitor can install
   * and run, and expects fields like `operatingSystem`. These pages are
   * write-ups ABOUT built software, which is what `CreativeWork` describes.
   * 06 §6 offers either "where appropriate" — this is the appropriate one.
   */
  caseStudySchema(project: {
    name: string;
    tagline: string;
    slug: string;
    stack: readonly string[];
    liveUrl?: string;
    publishedAt?: Date;
  }): Record<string, unknown> {
    return {
      '@context': 'https://schema.org',
      '@type': 'CreativeWork',
      name: project.name,
      abstract: project.tagline,
      url: this.absolute(`/work/${project.slug}`),
      keywords: project.stack.join(', '),
      author: { '@type': 'Person', name: 'Muhammed Al-Ateeqi', url: this.absolute('/') },
      ...(project.liveUrl ? { sameAs: project.liveUrl } : {}),
      ...(project.publishedAt ? { datePublished: project.publishedAt.toISOString() } : {}),
    };
  }
}
