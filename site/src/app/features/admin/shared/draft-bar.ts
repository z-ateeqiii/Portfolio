import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';

/**
 * The Draft → Preview → Publish control (05 §2).
 *
 * One component, reused by every draftable screen, for the same reason the
 * disclosure blocks are one component (08 §4): a workflow that behaves slightly
 * differently on the Profile screen than on the Projects screen is a workflow
 * nobody trusts. This is the single place the three actions are defined.
 *
 * "Nothing goes public silently" (05 §2) is enforced by shape: Publish is an
 * explicit button, never a side effect of saving, and it is disabled unless
 * there is actually a draft to publish. Save writes only to `drafts/` — there
 * is no code path from typing in a field to changing the live site.
 */
@Component({
  selector: 'app-draft-bar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, RouterLink],
  host: {
    class:
      'sticky top-0 z-10 flex flex-wrap items-center gap-3 border-b border-fg/12 bg-surface px-8 py-4',
  },
  template: `
    <div class="mr-auto">
      <p class="text-body text-fg">{{ title() }}</p>
      <p class="mt-1 font-mono text-label text-fg-muted uppercase">
        @if (dirty()) {
          Unsaved changes
        } @else if (draftedAt(); as at) {
          Draft saved {{ at | date: 'd MMM, HH:mm' }}
        } @else if (isLive()) {
          Live · no pending changes
        } @else {
          Not published yet
        }
      </p>
    </div>

    <button
      type="button"
      [disabled]="busy() || !dirty()"
      (click)="save.emit()"
      class="rounded-sm border border-fg/40 px-4 py-2 text-caption text-fg disabled:opacity-40"
    >
      Save draft
    </button>

    <!-- Preview renders the real public component with draft data (05 §2) —
         not a separate preview template that could drift from the live one. -->
    <a
      [routerLink]="previewLink()"
      class="rounded-sm border border-fg/40 px-4 py-2 text-caption no-underline"
      [class.pointer-events-none]="!hasDraft()"
      [class.opacity-40]="!hasDraft()"
      [class.text-fg]="hasDraft()"
      >{{ previewLabel() }}</a
    >

    @if (hasDraft()) {
      <button
        type="button"
        [disabled]="busy()"
        (click)="discard.emit()"
        class="rounded-sm px-4 py-2 text-caption text-fg-muted hover:text-fg disabled:opacity-40"
      >
        Discard
      </button>
    }

    <button
      type="button"
      [disabled]="busy() || !hasDraft()"
      (click)="publish.emit()"
      class="rounded-sm bg-action px-4 py-2 text-caption font-medium text-bg disabled:opacity-40"
    >
      Publish
    </button>
  `,
})
export class DraftBar {
  readonly title = input('');
  /** True once a live document exists — distinguishes edit from first publish. */
  readonly isLive = input(false);
  readonly hasDraft = input(false);
  readonly dirty = input(false);
  readonly busy = input(false);
  readonly draftedAt = input<Date | null>(null);
  readonly previewLink = input<unknown[]>([]);
  /**
   * Names the page the preview actually opens, e.g. "Preview /about".
   * A bare "Preview" is ambiguous on the Profile screen, whose fields feed
   * several public pages — which is exactly the confusion the Phase 5 smoke
   * test surfaced.
   */
  readonly previewLabel = input('Preview');

  readonly save = output<void>();
  readonly publish = output<void>();
  readonly discard = output<void>();
}
