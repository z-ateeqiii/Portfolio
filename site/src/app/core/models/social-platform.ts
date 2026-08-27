/**
 * Social Platform (04 §7).
 *
 * `followerCount` is a raw number, never a pre-formatted string. That keeps
 * "~986K combined" vs "nearing 1M" a presentation decision rather than a
 * content one — and it is what stops "+1M" from ever being typed into the
 * database, which 03 §8 explicitly rules out as it is not true.
 *
 * `lastVerifiedDate` exists so a stale count is visible and flaggable in the
 * dashboard rather than silently aging into a false claim.
 */
export type SocialPlatformName = 'instagram' | 'facebook';

export interface SocialPlatform {
  readonly platform: SocialPlatformName;
  readonly url: string;
  readonly followerCount: number;
  readonly lastVerifiedDate: Date;
}
