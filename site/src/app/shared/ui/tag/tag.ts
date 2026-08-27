import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * Tech-stack tags / pills (07 §7).
 *
 * Monospace utility face, muted foreground, hairline border — supporting
 * information that must never compete with headline text. This is one of the
 * fixed handful of places the mono face appears sitewide (07 §3), which is
 * what makes it read as an intentional system rather than a third font.
 *
 *   <ui-tag>Angular</ui-tag>
 *
 * Renders as a plain span: a stack tag is a label, not a control. If a tag
 * ever needs to be clickable, that is a new component, not an input here —
 * interactive elements carry the orange accent and these deliberately do not.
 */
@Component({
  selector: 'ui-tag',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content />',
  host: {
    class:
      'inline-flex items-center rounded-sm border border-fg/12 px-3 py-1 ' +
      'font-mono text-caption text-fg-muted whitespace-nowrap',
  },
})
export class UiTag {}
