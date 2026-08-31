import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { Profile } from '../../../core/models';
import { AdminService } from '../../../core/services/admin.service';
import { PROFILE_DOC_ID } from '../../../core/services/firestore-collection';
import { DraftBar } from '../shared/draft-bar';

type ProfileForm = Omit<Profile, 'status' | 'updatedAt' | 'publishedAt'>;

const EMPTY: ProfileForm = {
  name: '',
  heroStatement: '',
  heroSubline: '',
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
      @for (field of fields; track field.key) {
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
  protected readonly docId = PROFILE_DOC_ID;

  private readonly loaded = signal<ProfileForm>(EMPTY);
  private readonly form = signal<ProfileForm>(EMPTY);

  protected readonly isLive = signal(false);
  protected readonly hasDraft = signal(false);
  protected readonly draftedAt = signal<Date | null>(null);
  protected readonly busy = signal(false);

  /** Compared against what was loaded, so re-typing the same value is not dirty. */
  protected readonly dirty = computed(
    () => JSON.stringify(this.form()) !== JSON.stringify(this.loaded()),
  );

  protected readonly fields = [
    { key: 'name', label: 'Name', multiline: false, hint: '' },
    { key: 'heroStatement', label: 'Hero headline', multiline: false, hint: 'Locked copy — 01 §5' },
    { key: 'heroSubline', label: 'Hero subline', multiline: true, hint: '' },
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
    return (this.form() as Record<string, string | undefined>)[key] ?? '';
  }

  protected update(key: string, next: string): void {
    this.form.set({ ...this.form(), [key]: next });
  }

  private async load(): Promise<void> {
    const live = await this.admin.get<Profile>('profile', this.docId);
    this.isLive.set(live !== null);

    const draft = await this.admin.getDraft<ProfileForm>('profile', this.docId);
    if (draft) {
      this.hasDraft.set(true);
      this.draftedAt.set(draft.updatedAt);
      this.reset(draft.data);
      return;
    }

    if (live) {
      const { status: _s, updatedAt: _u, publishedAt: _p, ...rest } = live;
      this.reset({ ...EMPTY, ...rest });
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
