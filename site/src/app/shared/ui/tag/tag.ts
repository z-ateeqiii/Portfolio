import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type UiTagIcon = 'diamond' | 'square' | 'circle';

/**
 * Tech-stack tags / pills (07 §7).
 *
 * Monospace utility face, muted foreground, hairline border — supporting
 * information that must never compete with headline text. This is one of the
 * fixed handful of places the mono face appears sitewide (07 §3), which is
 * what makes it read as an intentional system rather than a third font.
 *
 *   <ui-tag>Angular</ui-tag>
 *   <ui-tag icon="diamond">Angular</ui-tag>
 *
 * Renders as a plain span: a stack tag is a label, not a control. If a tag
 * ever needs to be clickable, that is a new component, not an input here —
 * interactive elements carry the orange accent and these deliberately do not.
 *
 * `icon` is optional and off by default — every existing call site (About's
 * Experience tags, the case-study body, etc.) is unaffected. It's the small
 * outlined shape from the visual-identity redesign (2026-09-06), used only on
 * the pages that got that treatment (Work Index, Case Study header, Home's
 * Featured Work). Stack is free-text (04 §3) — there is no real per-technology
 * meaning to assign a shape to, so callers cycle diamond/square/circle by
 * position, the same purely-rhythmic alternation the design reference itself
 * uses, rather than this component inventing a fake per-tech mapping.
 */
@Component({
  selector: 'ui-tag',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @switch (icon()) {
      @case ('diamond') {
        <span class="size-2.25 shrink-0 rotate-45 border border-action" aria-hidden="true"></span>
      }
      @case ('square') {
        <span class="size-2.25 shrink-0 border border-action" aria-hidden="true"></span>
      }
      @case ('circle') {
        <span class="size-2.25 shrink-0 rounded-full border border-action" aria-hidden="true"></span>
      }
    }
    <ng-content />
  `,
  host: {
    class:
      'inline-flex items-center gap-2 rounded-sm border border-fg/12 px-3 py-1 ' +
      'font-mono text-caption text-fg-muted whitespace-nowrap',
  },
})
export class UiTag {
  readonly icon = input<UiTagIcon | ''>('');
}
