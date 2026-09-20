import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { skillIcon } from './skill-icons';

/**
 * One skill, as a brand mark plus its name — or as a plain tag when the skill
 * has no mark (07 §7c).
 *
 * The fallback is the point. More than half of Muhammed's seeded skills are
 * practices rather than products and have no logo, so "no icon" is the normal
 * case rather than an error: those render as the name alone, in the same tag
 * shape, and nothing is skipped or broken.
 *
 * The mark is `currentColor`, so it inherits whatever the surrounding text
 * uses and cannot introduce a colour outside the palette — a wall of brand
 * colours is exactly the "sticker sheet" look 00 §24 rules out.
 */
@Component({
  selector: 'ui-skill-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'inline-flex' },
  template: `
    <span
      class="inline-flex min-h-9 items-center gap-2.5 rounded-sm border border-fg/12 bg-surface
             px-3 transition-colors duration-(--duration-base) ease-out-strong
             hover:border-action/40"
    >
      @if (icon(); as mark) {
        <svg
          class="size-4 shrink-0 text-fg-muted"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path [attr.d]="mark.path" />
        </svg>
      }
      <span class="mono-mark text-fg-muted">{{ name() }}</span>
    </span>
  `,
})
export class UiSkillIcon {
  readonly name = input.required<string>();

  protected readonly icon = computed(() => skillIcon(this.name()));
}
