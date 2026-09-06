import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { imageUrl, profileFolder } from '../../../core/cloudinary/cloudinary.config';
import { CloudinaryWidgetService } from '../../../core/cloudinary/upload-widget.service';
import { HeroImage, Profile } from '../../../core/models';
import { AdminService } from '../../../core/services/admin.service';
import { PROFILE_DOC_ID } from '../../../core/services/firestore-collection';
import { DraftBar } from '../shared/draft-bar';

type ProfileForm = Omit<Profile, 'status' | 'updatedAt' | 'publishedAt' | 'heroTitles'> & {
  heroTitlesText: string;
};

const EMPTY: ProfileForm = {
  name: '',
  heroStatement: '',
  heroSubline: '',
  heroTitlesText: '',
  heroImage: undefined,
  positioning: '',
  bioShort: '',
  bioLong: '',
  resumeFile: '',
  contactEmail: '',
  contactLinkedIn: '',
  contactGitHub: '',
  socialInstagram: '',
  socialFacebook: '',
};

/**
 * Profile editor (05 §3.2) — the singleton, edited never created.
 *
 * Loads the draft if one exists, otherwise the live record. That order matters:
 * reopening the screen after a half-finished edit must show the half-finished
 * edit, not silently discard it by showing the live copy instead.
 *
 * `resumeFile` is a Cloudinary URL field rather than an upload widget for now.
 * 05 §3.2 asks for upload-and-replace-in-place, and the Cloudinary config is
 * ready (core/cloudinary), but no upload UI is built yet — see 10 §4f. Pasting
 * a URL works today and does not pretend to be the finished flow.
 *
 * `heroTitles`/`heroImage` (04 §2, added 2026-09-06 for the visual-identity
 * redesign — see `00` §26) DO get real upload UI here, via the same
 * `CloudinaryWidgetService` the media editor uses. Home only switches into the
 * new photo Hero once BOTH are set (`features/home/home.ts`), so it is fine to
 * save one before the other — the site just keeps rendering the simpler Hero
 * until both are in place.
 */
@Component({
  selector: 'app-admin-profile',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, DraftBar],
  template: `
    <app-draft-bar
      title="Profile"
      [isLive]="isLive()"
      [hasDraft]="hasDraft()"
      [dirty]="dirty()"
      [busy]="busy()"
      [draftedAt]="draftedAt()"
      [previewLink]="['/admin/preview/profile', docId]"
      previewLabel="Preview /about"
      (save)="save()"
      (publish)="publish()"
      (discard)="discard()"
    />

    <div class="max-w-2xl space-y-5 p-8">
      <p class="rounded-md border border-fg/12 bg-surface p-4 text-caption text-fg-muted">
        These fields feed several pages. The hero headline and subline appear on
        <strong class="text-fg">/</strong>; the short and long bio appear on
        <strong class="text-fg">/about</strong>; the contact links appear in the footer of every
        page and on <strong class="text-fg">/contact</strong>. Preview opens /about, which carries
        the most of this content.
      </p>

      @for (field of topFields; track field.key) {
        <label class="block">
          <span class="font-mono text-label text-fg-muted uppercase">{{ field.label }}</span>
          @if (field.multiline) {
            <textarea
              [name]="field.key"
              rows="6"
              [ngModel]="value(field.key)"
              (ngModelChange)="update(field.key, $event)"
              class="mt-2 w-full rounded-sm border border-fg/40 bg-surface px-3 py-2 text-body text-fg"
            ></textarea>
          } @else {
            <input
              [name]="field.key"
              [ngModel]="value(field.key)"
              (ngModelChange)="update(field.key, $event)"
              class="mt-2 w-full rounded-sm border border-fg/40 bg-surface px-3 py-2 text-body text-fg"
            />
          }
          @if (field.hint) {
            <span class="mt-1 block text-caption text-fg-muted">{{ field.hint }}</span>
          }
        </label>
      }

      <!-- Hero rotating titles (04 §2, added 2026-09-06) -->
      <label class="block">
        <span class="font-mono text-label text-fg-muted uppercase">Hero rotating titles</span>
        <input
          name="heroTitlesText"
          [ngModel]="form().heroTitlesText"
          (ngModelChange)="update('heroTitlesText', $event)"
          placeholder="Software Engineer, Frontend Specialist, Builder"
          class="mt-2 w-full rounded-sm border border-fg/40 bg-surface px-3 py-2 text-body text-fg"
        />
        <span class="mt-1 block text-caption text-fg-muted">
          Comma separated, in the order they should cycle. Both this AND the hero photo below
          have to be set before the Hero switches out of its current simpler form.
        </span>
      </label>

      <!-- Hero photo (04 §2, reverses 00 §26's original "no portrait" rule) -->
      <div class="rounded-md border border-fg/40 bg-surface p-4">
        <span class="font-mono text-label text-fg-muted uppercase">Hero photo</span>

        @if (form().heroImage; as image) {
          <img
            [src]="heroThumb(image.publicId)"
            [alt]="image.alt"
            class="mt-3 aspect-video w-full max-w-sm rounded-sm object-cover grayscale"
          />
        }

        <div class="mt-3 flex flex-wrap items-center gap-3">
          <button
            type="button"
            (click)="uploadHeroPhoto()"
            class="rounded-sm border border-fg/40 px-4 py-2 text-caption text-fg hover:border-action hover:text-action"
          >
            {{ form().heroImage ? 'Replace photo' : 'Upload photo' }}
          </button>
          @if (form().heroImage) {
            <button
              type="button"
              (click)="removeHeroPhoto()"
              class="text-caption text-fg-muted hover:text-action"
            >
              Remove
            </button>
          }
        </div>

        @if (form().heroImage; as image) {
          <label class="mt-3 block">
            <span class="font-mono text-label text-fg-muted uppercase">Alt text</span>
            <input
              name="heroImageAlt"
              [ngModel]="image.alt"
              (ngModelChange)="updateHeroImageAlt($event)"
              placeholder="What the photo shows"
              class="mt-2 w-full rounded-sm border border-fg/40 bg-surface px-3 py-2 text-body text-fg"
            />
          </label>
        }

        @if (heroUploadError(); as message) {
          <p class="mt-2 text-caption text-action" role="alert">{{ message }}</p>
        }
      </div>

      @for (field of restFields; track field.key) {
        <label class="block">
          <span class="font-mono text-label text-fg-muted uppercase">{{ field.label }}</span>
          @if (field.multiline) {
            <textarea
              [name]="field.key"
              rows="6"
              [ngModel]="value(field.key)"
              (ngModelChange)="update(field.key, $event)"
              class="mt-2 w-full rounded-sm border border-fg/40 bg-surface px-3 py-2 text-body text-fg"
            ></textarea>
          } @else {
            <input
              [name]="field.key"
              [ngModel]="value(field.key)"
              (ngModelChange)="update(field.key, $event)"
              class="mt-2 w-full rounded-sm border border-fg/40 bg-surface px-3 py-2 text-body text-fg"
            />
          }
          @if (field.hint) {
            <span class="mt-1 block text-caption text-fg-muted">{{ field.hint }}</span>
          }
        </label>
      }
    </div>
  `,
})
export class AdminProfileEditor {
  private readonly admin = inject(AdminService);
  private readonly widget = inject(CloudinaryWidgetService);
  protected readonly docId = PROFILE_DOC_ID;

  private readonly loaded = signal<ProfileForm>(EMPTY);
  protected readonly form = signal<ProfileForm>(EMPTY);

  protected readonly isLive = signal(false);
  protected readonly hasDraft = signal(false);
  protected readonly draftedAt = signal<Date | null>(null);
  protected readonly busy = signal(false);
  protected readonly heroUploadError = signal('');

  /** Compared against what was loaded, so re-typing the same value is not dirty. */
  protected readonly dirty = computed(
    () => JSON.stringify(this.form()) !== JSON.stringify(this.loaded()),
  );

  protected readonly topFields = [
    { key: 'name', label: 'Name', multiline: false, hint: '' },
    { key: 'heroStatement', label: 'Hero headline', multiline: false, hint: 'Locked copy — 01 §5' },
    { key: 'heroSubline', label: 'Hero subline', multiline: true, hint: '' },
  ] as const;

  protected readonly restFields = [
    { key: 'positioning', label: 'Positioning', multiline: false, hint: '' },
    { key: 'bioShort', label: 'Bio (short)', multiline: true, hint: 'Used in meta tags and previews' },
    {
      key: 'bioLong',
      label: 'Bio (long)',
      multiline: true,
      hint: 'Blank line between paragraphs. Renders on /about.',
    },
    {
      key: 'resumeFile',
      label: 'Resume URL',
      multiline: false,
      hint: 'Cloudinary URL. Upload widget not built yet — see 10 §4f.',
    },
    { key: 'contactEmail', label: 'Email', multiline: false, hint: '' },
    { key: 'contactLinkedIn', label: 'LinkedIn', multiline: false, hint: '' },
    { key: 'contactGitHub', label: 'GitHub', multiline: false, hint: '' },
    { key: 'socialInstagram', label: 'Instagram', multiline: false, hint: '' },
    { key: 'socialFacebook', label: 'Facebook', multiline: false, hint: '' },
  ] as const;

  constructor() {
    void this.load();
  }

  protected value(key: string): string {
    return (this.form() as unknown as Record<string, string | undefined>)[key] ?? '';
  }

  protected update(key: string, next: string): void {
    this.form.set({ ...this.form(), [key]: next });
  }

  protected heroThumb(publicId: string): string {
    return imageUrl(publicId, 480);
  }

  protected async uploadHeroPhoto(): Promise<void> {
    this.heroUploadError.set('');
    try {
      await this.widget.openWidget(
        profileFolder(),
        (result) => {
          const previousAlt = this.form().heroImage?.alt ?? '';
          const image: HeroImage = { url: result.url, publicId: result.publicId, alt: previousAlt };
          this.form.set({ ...this.form(), heroImage: image });
        },
        // Full-bleed background, not a fixed-ratio card — free-form crop.
        { croppingAspectRatio: null, multiple: false },
      );
    } catch (e) {
      this.heroUploadError.set(e instanceof Error ? e.message : 'Could not open the uploader.');
    }
  }

  protected removeHeroPhoto(): void {
    this.form.set({ ...this.form(), heroImage: undefined });
  }

  protected updateHeroImageAlt(alt: string): void {
    const image = this.form().heroImage;
    if (!image) return;
    this.form.set({ ...this.form(), heroImage: { ...image, alt } });
  }

  private async load(): Promise<void> {
    const live = await this.admin.get<Profile>('profile', this.docId);
    this.isLive.set(live !== null);

    const draft = await this.admin.getDraft<ProfileForm>('profile', this.docId);
    if (draft) {
      this.hasDraft.set(true);
      this.draftedAt.set(draft.updatedAt);
      this.reset({ ...EMPTY, ...draft.data });
      return;
    }

    if (live) {
      const { status: _s, updatedAt: _u, publishedAt: _p, heroTitles, ...rest } = live;
      this.reset({ ...EMPTY, ...rest, heroTitlesText: (heroTitles ?? []).join(', ') });
    }
  }

  private reset(data: ProfileForm): void {
    this.loaded.set(data);
    this.form.set(data);
  }

  protected async save(): Promise<void> {
    await this.run(async () => {
      await this.admin.saveDraft('profile', this.docId, this.form());
      this.loaded.set(this.form());
      this.hasDraft.set(true);
      this.draftedAt.set(new Date());
    });
  }

  protected async publish(): Promise<void> {
    await this.run(async () => {
      /**
       * `heroTitlesText` is form-only, converted back to the array 04 §2
       * defines — same treatment Project.stackText already gets — so the
       * live document never gains a field the model doesn't have.
       */
      const { heroTitlesText, ...rest } = this.form();
      const heroTitles = heroTitlesText
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      await this.admin.saveDraft('profile', this.docId, {
        ...rest,
        ...(heroTitles.length ? { heroTitles } : {}),
      });
      await this.admin.publish('profile', this.docId);

      this.hasDraft.set(false);
      this.draftedAt.set(null);
      this.isLive.set(true);
    });
  }

  protected async discard(): Promise<void> {
    await this.run(async () => {
      await this.admin.discardDraft('profile', this.docId);
      this.hasDraft.set(false);
      this.draftedAt.set(null);
      await this.load();
    });
  }

  private async run(action: () => Promise<void>): Promise<void> {
    this.busy.set(true);
    try {
      await action();
    } catch (error) {
      console.error('[admin/profile]', error);
    } finally {
      this.busy.set(false);
    }
  }
}
