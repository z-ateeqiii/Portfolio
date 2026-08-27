/**
 * Shared UI primitives (Phase 1, 08 §3).
 *
 * Built once, reused everywhere (09 §5). A page that needs a button, a tag, a
 * card, a status dot or a section eyebrow imports it from here rather than
 * re-styling one locally — that is what keeps the visual system consistent as
 * the site grows past the five pages it launches with.
 */
export { UiButton, type UiButtonVariant } from './button/button';
export { UiCard } from './card/card';
export { UiEyebrow } from './eyebrow/eyebrow';
export { UiStatusDot } from './status-dot/status-dot';
export { UiTag } from './tag/tag';
