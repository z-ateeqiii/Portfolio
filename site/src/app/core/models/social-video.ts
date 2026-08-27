/**
 * Social Video (04 §8) — OPTIONAL, post-v1.
 *
 * Only needed if /beyond/social ships a curated video archive, which is still
 * open (02 §14, 10 §3). Modelled now because the shape is already agreed; no
 * documents are seeded and no route reads it. The whole site works without it
 * (10 §5).
 */
export type SocialVideoPlatform = 'youtube' | 'instagram' | 'facebook';

export interface SocialVideo {
  readonly id: string;
  readonly title: string;
  readonly platform: SocialVideoPlatform;
  readonly url: string;
  /** Why this video matters to the story — not just a caption (04 §8). */
  readonly context?: string;
  readonly order: number;
}
