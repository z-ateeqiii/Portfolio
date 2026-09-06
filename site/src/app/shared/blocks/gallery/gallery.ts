import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  input,
  signal,
  viewChild,
} from '@angular/core';

import { imageUrl } from '../../../core/cloudinary/cloudinary.config';
import { Media } from '../../../core/models';

/**
 * Case-study image gallery (04 §6, brief §32) — Muhammed's manual-testing
 * report: the old vertical stack of full-width images wasn't a browsable
 * gallery and wasn't clickable.
 *
 * ─── Why a masonry grid + native <dialog>, and nothing installed ─────────────
 * The explicit ask was "as light and fast as opening Instagram" — not weighed
 * down by a carousel package. Both pieces here are free:
 *   - The grid is Tailwind's `columns-*` utility, pure CSS (verified by
 *     compiling it directly before relying on it) — no JS lays out the grid.
 *   - The lightbox is the browser's own `<dialog>` element (`showModal()`),
 *     which already gives focus-trapping, Esc-to-close, and a native backdrop
 *     for free. No carousel library, no added kilobytes beyond this file.
 * This is a case-study page in the public bundle, where 06 §7 and Phase 8's
 * bundle-size work make every added dependency a direct cost to a visitor —
 * unlike the admin-only Upload Widget, there is no lazy chunk to hide behind.
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Thumbnails are a capped width (480px) via Cloudinary's `imageUrl`; the
 * lightbox requests a larger one (1600px) only once an image is actually
 * opened, so browsing the grid never downloads full-size screenshots.
 */
@Component({
  selector: 'ui-gallery',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    dialog::backdrop {
      background: rgb(0 0 0 / 0.8);
    }
  `,
  template: `
    @if (items().length) {
      <div class="columns-2 gap-4 sm:columns-3">
        @for (item of items(); track item.id; let i = $index) {
          <button
            type="button"
            (click)="open(i)"
            class="mb-4 block w-full cursor-zoom-in break-inside-avoid overflow-hidden rounded-md border border-fg/12 p-0"
          >
            <img
              [src]="thumbSrc(item)"
              [alt]="item.alt"
              loading="lazy"
              decoding="async"
              class="w-full"
            />
          </button>
        }
      </div>

      <dialog
        #lightbox
        (close)="active.set(-1)"
        (click)="onBackdrop($event)"
        (keydown)="onKeydown($event)"
        class="m-auto max-h-[92vh] max-w-[92vw] overflow-visible rounded-md border border-fg/12 bg-surface p-0 backdrop:bg-transparent"
      >
        @if (activeItem(); as item) {
          <figure class="relative flex max-h-[92vh] flex-col items-center p-2 sm:p-4">
            <button
              type="button"
              (click)="close()"
              aria-label="Close"
              class="absolute top-2 right-2 rounded-sm bg-surface/80 px-2 py-1 text-body text-fg hover:text-action"
            >
              ✕
            </button>

            <img
              [src]="fullSrc(item)"
              [alt]="item.alt"
              class="max-h-[80vh] max-w-full rounded-sm object-contain"
            />

            <div class="mt-3 flex w-full items-center justify-between gap-4">
              @if (item.caption) {
                <figcaption class="text-caption text-fg-muted">{{ item.caption }}</figcaption>
              } @else {
                <span></span>
              }
              @if (items().length > 1) {
                <p class="shrink-0 font-mono text-label text-fg-muted uppercase">
                  {{ active() + 1 }} / {{ items().length }}
                </p>
              }
            </div>

            @if (items().length > 1) {
              <button
                type="button"
                (click)="prev()"
                aria-label="Previous image"
                class="absolute top-1/2 left-2 -translate-y-1/2 rounded-sm bg-surface/80 px-3 py-2 text-body text-fg hover:text-action"
              >
                ‹
              </button>
              <button
                type="button"
                (click)="next()"
                aria-label="Next image"
                class="absolute top-1/2 right-2 -translate-y-1/2 rounded-sm bg-surface/80 px-3 py-2 text-body text-fg hover:text-action"
              >
                ›
              </button>
            }
          </figure>
        }
      </dialog>
    }
  `,
})
export class UiGallery {
  readonly items = input<Media[]>([]);

  private readonly dialog = viewChild<ElementRef<HTMLDialogElement>>('lightbox');

  protected readonly active = signal(-1);
  protected readonly activeItem = computed(() => {
    const i = this.active();
    return i >= 0 ? (this.items()[i] ?? null) : null;
  });

  protected thumbSrc(item: Media): string {
    return imageUrl(item.publicId, 480);
  }

  protected fullSrc(item: Media): string {
    return imageUrl(item.publicId, 1600);
  }

  protected open(index: number): void {
    this.active.set(index);
    this.dialog()?.nativeElement.showModal();
  }

  protected close(): void {
    this.dialog()?.nativeElement.close();
  }

  protected prev(): void {
    const len = this.items().length;
    this.active.set((this.active() - 1 + len) % len);
  }

  protected next(): void {
    const len = this.items().length;
    this.active.set((this.active() + 1) % len);
  }

  /** Clicking the backdrop closes the dialog — only the <dialog> element
   *  itself is the click target there, since its content sits inside a
   *  child <figure> that stops the click from reaching it. */
  protected onBackdrop(event: MouseEvent): void {
    if (event.target === this.dialog()?.nativeElement) this.close();
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (event.key === 'ArrowLeft') this.prev();
    if (event.key === 'ArrowRight') this.next();
  }
}
