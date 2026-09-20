import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  effect,
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

    /* A ring that spins, in the accent. Component-scoped rather than a global
       utility because nothing else on the site has a spinner — the rest of
       the page loads with the top progress bar instead. */
    .gallery-spinner {
      display: block;
      width: 1.75rem;
      height: 1.75rem;
      border: 2px solid rgb(255 255 255 / 0.18);
      border-top-color: var(--color-action);
      border-radius: 9999px;
      animation: gallery-spin 0.7s linear infinite;
    }

    @keyframes gallery-spin {
      to {
        transform: rotate(360deg);
      }
    }

    /* Reduced motion gets a pulse instead of a rotation — the point is "still
       working", and that does not require something to go round. */
    @media (prefers-reduced-motion: reduce) {
      .gallery-spinner {
        animation: gallery-pulse 1.2s ease-in-out infinite;
        border-top-color: var(--color-action);
      }

      @keyframes gallery-pulse {
        0%,
        100% {
          opacity: 0.35;
        }
        50% {
          opacity: 1;
        }
      }
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

            <!--
              The loading state is layered UNDER the image rather than swapped
              with it. Removing the <img> while it loads and re-adding it on
              load would restart the download every time, and would collapse
              the figure to nothing in between, so the dialog would jump size
              on every arrow press.
            -->
            <div class="relative flex min-h-40 w-full items-center justify-center">
              @if (!loaded()) {
                <div
                  class="absolute inset-0 flex items-center justify-center"
                  role="status"
                  aria-live="polite"
                >
                  <span class="sr-only">Loading image</span>
                  <span class="gallery-spinner" aria-hidden="true"></span>
                </div>
              }

              <img
                [src]="fullSrc(item)"
                [alt]="item.alt"
                (load)="loaded.set(true)"
                (error)="loaded.set(true)"
                [class.opacity-0]="!loaded()"
                class="max-h-[80vh] max-w-full rounded-sm object-contain
                       transition-opacity duration-(--duration-base) ease-out-soft"
              />
            </div>

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

  /**
   * Whether the CURRENT full-size image has decoded.
   *
   * The lightbox requests a 1600px render and the thumbnail it opened from was
   * 480px, so there is always a real wait — and with nothing on screen during
   * it, the dialog opened to an empty box and read as a hang. This drives a
   * spinner under the image and a fade in when it arrives.
   *
   * `(error)` also sets it, so a broken or blocked image ends as a visible
   * broken-image icon rather than as a spinner that never stops.
   */
  protected readonly loaded = signal(false);

  /**
   * Full-size renders already fetched, so re-opening or stepping back to an
   * image never shows the spinner twice. Keyed by URL rather than by index
   * because the index means nothing once the set is reordered.
   */
  private readonly warmed = new Set<string>();

  constructor() {
    /**
     * Preloads the NEIGHBOURS of whatever is open.
     *
     * Stepping through a gallery is almost always sequential, so by the time
     * an arrow is pressed the next image has usually been in flight for as
     * long as the current one has been on screen — the wait disappears
     * instead of being decorated. Both directions, because the arrow keys go
     * both ways.
     *
     * Runs only in the browser: `new Image()` does not exist during SSR, and
     * prefetching screenshots on the server would spend the server's
     * bandwidth on something no visitor asked for. Only ever triggered by
     * opening the lightbox, so a visitor who never opens it downloads none
     * of this.
     */
    effect(() => {
      const index = this.active();
      if (index < 0 || typeof Image === 'undefined') return;

      const items = this.items();
      const total = items.length;
      if (!total) return;

      for (const offset of [1, -1]) {
        const neighbour = items[(index + offset + total) % total];
        if (!neighbour) continue;
        const url = this.fullSrc(neighbour);
        if (this.warmed.has(url)) continue;
        this.warmed.add(url);
        new Image().src = url;
      }
    });
  }

  protected thumbSrc(item: Media): string {
    return imageUrl(item.publicId, 480);
  }

  protected fullSrc(item: Media): string {
    return imageUrl(item.publicId, 1600);
  }

  protected open(index: number): void {
    this.show(index);
    this.dialog()?.nativeElement.showModal();
  }

  /**
   * Moves to an image and decides whether a spinner is even needed. An image
   * already fetched paints from cache in the same frame, so showing a spinner
   * for it would be a flash of loading state for something that is not
   * loading.
   */
  private show(index: number): void {
    const item = this.items()[index];
    this.loaded.set(item ? this.warmed.has(this.fullSrc(item)) : false);
    this.active.set(index);
    if (item) this.warmed.add(this.fullSrc(item));
  }

  protected close(): void {
    this.dialog()?.nativeElement.close();
  }

  protected prev(): void {
    const len = this.items().length;
    this.show((this.active() - 1 + len) % len);
  }

  protected next(): void {
    const len = this.items().length;
    this.show((this.active() + 1) % len);
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
