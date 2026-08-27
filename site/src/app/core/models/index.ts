/**
 * Domain models (04-content-model.md), one per entity.
 *
 * These are plain TypeScript — no Firebase import anywhere in this folder, so
 * components, tests and the Phase 6 SEO layer can depend on the shape of the
 * content without depending on where it is stored. Firestore conversion lives
 * in core/services.
 */
export type { ContentStatus, Editable, Published, Timestamped } from './content-status';
export type { BusinessVenture, MetricPair } from './business-venture';
export type { Education, EducationType } from './education';
export type { Experience } from './experience';
export type { Media, MediaType } from './media';
export type { Profile } from './profile';
export type { Project, ProjectTier } from './project';
export type { ProofPoint } from './proof-point';
export type { Skill, SkillCategory, SkillLevel } from './skill';
export type { SocialPlatform, SocialPlatformName } from './social-platform';
export type { SocialVideo, SocialVideoPlatform } from './social-video';
