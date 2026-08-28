import { Injectable, TransferState, inject, makeStateKey, signal } from '@angular/core';

import { Profile } from '../models';
import { ContentService } from './content.service';

const PROFILE_KEY = makeStateKey<Profile | null>('profile');

/**
 * The Profile singleton, loaded once and shared by every route.
 *
 * The header, the footer and several page sections all need it, so fetching it
 * per-route would mean the same Firestore read several times per navigation —
 * exactly what 06 §7 asks to avoid ("Firestore reads for public routes should
 * be minimal per page load").
 *
 * Loaded through an app initializer rather than a resolver because it is not
 * route-scoped: the shell needs it before any route renders.
 */
@Injectable({ providedIn: 'root' })
export class SiteState {
  private readonly content = inject(ContentService);
  private readonly transferState = inject(TransferState);

  private readonly _profile = signal<Profile | null>(null);

  /** Null while unloaded, or if the Profile is unpublished/unreachable. */
  readonly profile = this._profile.asReadonly();

  /**
   * Fetches on the server, then hands the result to the browser through
   * TransferState so hydration does not repeat the read. Without this the
   * Profile would be fetched twice for every first page view — once to render
   * the HTML, once again the moment Angular hydrates it.
   */
  async load(): Promise<void> {
    const cached = this.transferState.get(PROFILE_KEY, null);
    if (cached) {
      this._profile.set(reviveDates(cached));
      return;
    }

    const profile = await this.content.profile();
    this._profile.set(profile);
    this.transferState.set(PROFILE_KEY, profile);
  }
}

/**
 * TransferState serialises to JSON, which turns Dates into strings. The models
 * declare `updatedAt`/`publishedAt` as Date, so they are restored here rather
 * than left as strings that only fail later, at a `.getFullYear()` call in
 * some unrelated template.
 */
function reviveDates(profile: Profile): Profile {
  return {
    ...profile,
    updatedAt: new Date(profile.updatedAt),
    publishedAt: profile.publishedAt ? new Date(profile.publishedAt) : undefined,
  };
}
