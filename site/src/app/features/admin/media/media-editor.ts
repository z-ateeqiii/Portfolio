import { ChangeDetectionStrategy, Component, effect, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { imageUrl } from '../../../core/cloudinary/cloudinary.config';
import { CloudinaryUploadService } from '../../../core/cloudinary/upload.service';
import { Media } from '../../../core/models';
import { AdminService } from '../../../core/services/admin.service';
import { mediaPath } from '../../../core/services/firestore-collection';

/**
 * Per-project media (05 §3.4, §4).
 *
 * Upload, reorder, mark-as-featured, replace, remove — matching 04 §6.
 * Multi-file drag-and-drop, because 05 §3.4 asks for it specifically: Muhammed
 * already keeps screenshots in per-project folders, so the natural gesture is
 * dropping a folder's worth at once, not picking them one at a time.
 *
 * ─── alt text is required before an image can be saved ───────────────────────
 * 04 §6 makes `alt` required, and this screen is where that gets enforced in
 * practice. An uploaded file lands in a pending list and does NOT become a
 * Media document until alt text is written. Accessibility that depends on
 * remembering decays (07 §8), and case studies are carried by their
 * screenshots — an image nobody described is invisible to a screen reader.
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * No publish workflow: media inherits its parent project's state (04 §6), so a
 * draft project's images are unreachable simply because the project that would
 * yield their slug is never returned publicly.
 *
 * Deleting a Media document does NOT delete the Cloudinary asset — the accepted
 * orphan gap (04 §6). The `publicId` is kept on every record so that cleanup
 * stays possible in the Cloudinary console later.
 */
interface Pending {
  readonly file: File;
  readonly url: string;
  readonly publicId: string;
  alt: string;
  caption: string;
  /** Set when Save image fails, so the failure is visible on THIS card rather
   *  than silently doing nothing (found via manual testing: an unhandled
   *  setDoc rejection left a saved-looking pending item with no record ever
   *  created). */
  saveError?: string;
  saving?: boolean;
}

@Component({
  selector: 'app-admin-media',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="p-8">
      <a
        [routerLink]="['/admin/projects', slug()]"
        class="text-caption text-fg-muted no-underline hover:text-fg"
        >← Back to project</a
      >
      <h1 class="mt-2 font-display text-display-3 text-fg">Media — {{ slug() }}</h1>

      <!-- Drop zone (05 §3.4) -->
      <div
        (dragover)="$event.preventDefault(); dragging.set(true)"
        (dragleave)="dragging.set(false)"
        (drop)="onDrop($event)"
        class="mt-6 max-w-3xl rounded-md border border-dashed p-8 text-center"
        [class.border-action]="dragging()"
        [class.border-fg\\/24]="!dragging()"
      >
        <p class="text-body text-fg">Drop images here</p>
        <p class="mt-1 text-caption text-fg-muted">or</p>
        <label class="mt-3 inline-block cursor-pointer rounded-sm border border-fg/40 px-4 py-2 text-caption text-fg">
          Choose files
          <input type="file" multiple accept="image/*" hidden (change)="onPick($event)" />
        </label>
        @if (uploading()) {
          <p class="mt-4 font-mono text-label text-fg-muted uppercase">
            Uploading… {{ progress() }}%
          </p>
        }
        @if (error(); as message) {
          <p class="mt-4 text-caption text-action" role="alert">{{ message }}</p>
        }
      </div>

      <!-- Pending: uploaded to Cloudinary, not saved until alt text exists -->
      @if (pending().length) {
        <div class="mt-8 max-w-3xl">
          <h2 class="font-mono text-label text-fg uppercase">
            Needs alt text before saving ({{ pending().length }})
          </h2>
          @for (item of pending(); track item.publicId) {
            <div class="mt-4 flex gap-4 rounded-md border border-fg/40 p-4">
              <img [src]="thumb(item.publicId)" alt="" class="size-24 shrink-0 rounded-sm object-cover" />
              <div class="min-w-0 flex-1 space-y-2">
                <label class="block">
                  <span class="font-mono text-label text-fg-muted uppercase">Alt text (required)</span>
                  <input
                    [name]="'alt' + item.publicId"
                    [(ngModel)]="item.alt"
                    placeholder="What the screenshot shows"
                    class="mt-1 w-full rounded-sm border border-fg/40 bg-surface px-3 py-2 text-body text-fg"
                  />
                </label>
                <label class="block">
                  <span class="font-mono text-label text-fg-muted uppercase">Caption (optional)</span>
                  <input
                    [name]="'cap' + item.publicId"
                    [(ngModel)]="item.caption"
                    class="mt-1 w-full rounded-sm border border-fg/40 bg-surface px-3 py-2 text-body text-fg"
                  />
                </label>
                <button
                  type="button"
                  [disabled]="!item.alt.trim() || item.saving"
                  (click)="save(item)"
                  class="rounded-sm bg-action px-4 py-2 text-caption font-medium text-bg disabled:opacity-40"
                >
                  {{ item.saving ? 'Saving…' : 'Save image' }}
                </button>
                @if (item.saveError; as message) {
                  <p class="text-caption text-action" role="alert">{{ message }}</p>
                }
              </div>
            </div>
          }
        </div>
      }

      <!-- Saved media (04 §6), as a real grid rather than a stack of full-width
           rows -- Muhammed's report that images "aren't shown in an organized,
           clickable grid" once uploaded. Each thumbnail is wrapped in a plain
           link to the full-size image (no lightbox library needed, consistent
           with this being a plain, functional tool per 05 §7). -->
      @if (media().length) {
        <div class="mt-10 max-w-5xl">
          <h2 class="font-mono text-label text-fg uppercase">On this project ({{ media().length }})</h2>
          <p class="mt-1 text-caption text-fg-muted">
            Click a thumbnail to open it full-size. The cover image is what shows for this
            project on /work and its case study.
          </p>

          <div class="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            @for (item of media(); track item.id) {
              <div
                class="rounded-md border p-3"
                [class.border-action]="item.isFeatured"
                [class.border-fg\/12]="!item.isFeatured"
              >
                <a [href]="full(item.publicId)" target="_blank" rel="noopener" class="block">
                  <img
                    [src]="thumb(item.publicId)"
                    [alt]="item.alt"
                    class="aspect-video w-full rounded-sm object-cover"
                  />
                </a>

                <!--
                  The cover-image control (04 §6's isFeatured), made "impossible
                  to miss" rather than a small unlabeled checkbox buried among
                  other fields -- matching the bar 05 §3.3 sets for featuredOnHome.
                -->
                @if (item.isFeatured) {
                  <p class="mt-2 font-mono text-label text-action uppercase">Cover image</p>
                } @else {
                  <button
                    type="button"
                    (click)="setFeatured(item, true)"
                    class="mt-2 font-mono text-label text-fg-muted uppercase hover:text-action"
                  >
                    Set as cover
                  </button>
                }

                <label class="mt-2 block">
                  <span class="font-mono text-label text-fg-muted uppercase">Alt text</span>
                  <input
                    [name]="'a' + item.id"
                    [ngModel]="item.alt"
                    (ngModelChange)="patch(item, { alt: $event })"
                    class="mt-1 w-full rounded-sm border border-fg/40 bg-surface px-2 py-1 text-caption text-fg"
                  />
                </label>
                <label class="mt-2 block">
                  <span class="font-mono text-label text-fg-muted uppercase">Caption</span>
                  <input
                    [name]="'c' + item.id"
                    [ngModel]="item.caption ?? ''"
                    (ngModelChange)="patch(item, { caption: $event })"
                    placeholder="Optional"
                    class="mt-1 w-full rounded-sm border border-fg/40 bg-surface px-2 py-1 text-caption text-fg"
                  />
                </label>

                <div class="mt-2 flex items-center justify-between gap-2">
                  <label class="flex items-center gap-1 text-caption text-fg-muted">
                    Order
                    <input
                      type="number"
                      [name]="'o' + item.id"
                      [ngModel]="item.order"
                      (ngModelChange)="patch(item, { order: +$event || 0 })"
                      class="w-14 rounded-sm border border-fg/40 bg-surface px-1 py-1 text-caption text-fg"
                    />
                  </label>
                  <button
                    type="button"
                    (click)="remove(item)"
                    class="text-caption text-fg-muted hover:text-action"
                  >
                    Remove
                  </button>
                </div>
              </div>
            }
          </div>
        </div>
      }
    </div>
  `,
})
export class AdminMediaEditor {
  readonly slug = input<string>('');

  private readonly admin = inject(AdminService);
  private readonly uploader = inject(CloudinaryUploadService);

  protected readonly media = signal<Media[]>([]);
  protected readonly pending = signal<Pending[]>([]);
  protected readonly dragging = signal(false);
  protected readonly uploading = signal(false);
  protected readonly progress = signal(0);
  protected readonly error = signal('');

  constructor() {
    /**
     * effect(), not a constructor-time call -- same root cause and fix as
     * project-editor.ts: `this.slug()` read inside a constructor always holds
     * its DEFAULT ('') rather than the router-bound value, because
     * `withComponentInputBinding()` applies real route params via
     * `ComponentRef.setInput()` AFTER construction. The symptom here was
     * `mediaPath('') = 'projects//media'` -- a nonsense path -- so "On this
     * project" came back empty on cold page load even when media genuinely
     * existed, regardless of what was actually stored.
     */
    effect(() => {
      void this.load(this.slug());
    });
  }

  protected thumb(publicId: string): string {
    return imageUrl(publicId, 240);
  }

  protected full(publicId: string): string {
    return imageUrl(publicId, 1600);
  }

  private async load(slug: string): Promise<void> {
    this.media.set(await this.admin.list<Media>(mediaPath(slug), 'order'));
  }

  protected onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragging.set(false);
    void this.uploadAll(Array.from(event.dataTransfer?.files ?? []));
  }

  protected onPick(event: Event): void {
    const input = event.target as HTMLInputElement;
    void this.uploadAll(Array.from(input.files ?? []));
    input.value = '';
  }

  private async uploadAll(files: File[]): Promise<void> {
    const images = files.filter((f) => f.type.startsWith('image/'));
    if (!images.length) return;

    this.uploading.set(true);
    this.error.set('');

    for (const file of images) {
      try {
        const result = await this.uploader.upload(file, this.slug(), (p) => this.progress.set(p));
        /**
         * Lands in `pending`, not in Firestore. The record is only created once
         * alt text exists — 04 §6 makes it required, and this is where that is
         * actually enforced rather than hoped for.
         */
        this.pending.set([
          ...this.pending(),
          { file, url: result.url, publicId: result.publicId, alt: '', caption: '' },
        ]);
      } catch (e) {
        this.error.set(e instanceof Error ? e.message : 'Upload failed.');
      }
    }

    this.uploading.set(false);
    this.progress.set(0);
  }

  protected async save(item: Pending): Promise<void> {
    const alt = item.alt.trim();
    if (!alt) return;

    this.patchPending(item, { saving: true, saveError: undefined });

    const id = item.publicId.split('/').pop() ?? `media-${Date.now()}`;
    const caption = item.caption.trim();
    /**
     * `caption` is OMITTED, not set to `undefined`, when empty.
     *
     * Firestore's client SDK rejects `undefined` as a field value outright
     * (`invalid-argument`, thrown before any network call) unless the app was
     * initialised with `ignoreUndefinedProperties` — which this project does
     * not do. `caption: item.caption.trim() || undefined` therefore threw on
     * every image saved with no caption, and `save()` had no try/catch, so the
     * rejection was an unhandled promise: the button did nothing, the image
     * never became a Media document, and nothing on screen said why.
     * Confirmed directly against the SDK before this fix — the identical
     * object with the field omitted reaches the server.
     */
    const record: Media = {
      id,
      projectSlug: this.slug(),
      type: 'image',
      url: item.url,
      publicId: item.publicId,
      alt,
      ...(caption ? { caption } : {}),
      order: this.media().length,
      isFeatured: this.media().length === 0,
    };

    try {
      await this.persist(record);
      this.pending.set(this.pending().filter((p) => p.publicId !== item.publicId));
      await this.load(this.slug());
    } catch (e) {
      /**
       * Visible per-item, not just logged — a save that fails silently is what
       * caused this bug to go unnoticed in the first place.
       */
      this.patchPending(item, {
        saving: false,
        saveError: e instanceof Error ? e.message : 'Save failed. Try again.',
      });
    }
  }

  /** Updates one pending item in place, by publicId. */
  private patchPending(item: Pending, change: Partial<Pending>): void {
    this.pending.set(this.pending().map((p) => (p.publicId === item.publicId ? { ...p, ...change } : p)));
  }

  /** Media lives in a subcollection, so it is written by path, not by entity. */
  private async persist(record: Media): Promise<void> {
    await this.admin.saveAtPath(mediaPath(this.slug()), record.id, record);
  }

  protected async patch(item: Media, change: Partial<Media>): Promise<void> {
    const next = { ...item, ...change };
    this.media.set(this.media().map((m) => (m.id === item.id ? next : m)));
    await this.admin.saveAtPath(mediaPath(this.slug()), item.id, next);
  }

  /** At most one card image per project (04 §6), so setting one clears the rest. */
  protected async setFeatured(item: Media, value: boolean): Promise<void> {
    const updated = this.media().map((m) => ({ ...m, isFeatured: value && m.id === item.id }));
    this.media.set(updated);
    await Promise.all(
      updated.map((m) => this.admin.saveAtPath(mediaPath(this.slug()), m.id, m)),
    );
  }

  protected async remove(item: Media): Promise<void> {
    this.media.set(this.media().filter((m) => m.id !== item.id));
    await this.admin.remove(mediaPath(this.slug()), item.id);
  }
}
