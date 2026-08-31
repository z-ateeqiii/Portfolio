import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { Location } from '@angular/common';

import { Profile, Project } from '../../../core/models';
import { AdminService } from '../../../core/services/admin.service';
import { About } from '../../about/about';
import { CaseStudy } from '../../work/case-study/case-study';

/**
 * Preview (05 §2, step 2).
 *
 * "Muhammed can view the draft as it will actually appear on the site before
 * committing to it."
 *
 * ─── Why this reuses the real components ─────────────────────────────────────
 * It renders `CaseStudy` and `About` themselves, with draft data passed in —
 * not a preview-shaped copy of those templates. A separate preview template
 * would drift from the live one, and the drift would show up exactly where it
 * hurts: a read-through that looked right, published, then looked different.
 *
 * This works because the public page components take their content through
 * `input()` rather than fetching it themselves. That was a Phase 3 decision
 * made for SSR; it pays for itself again here.
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Sits behind the same authGuard as the rest of /admin, so a draft is never
 * rendered for anyone but the admin — and the underlying read is refused by
 * firestore.rules regardless of which route asks (05 §6).
 *
 * Fixed 2026-08-30: `About` now takes an optional profile input, so the Profile
 * draft previews through the REAL /about page rather than a copy of its markup.
 * The smoke test found the gap the right way round — publishing a bio edit
 * worked, but there was no way to read it through before committing, which is
 * the entire point of the Preview step.
 */
@Component({
  selector: 'app-admin-preview',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [About, CaseStudy],
  template: `
    <div
      class="sticky top-0 z-20 flex items-center gap-4 border-b border-fg/12 bg-surface px-8 py-3"
    >
      <p class="mr-auto font-mono text-label text-fg uppercase">
        Draft preview — not live
      </p>
      <button
        type="button"
        (click)="back()"
        class="rounded-sm border border-fg/40 px-4 py-2 text-caption text-fg"
      >
        Back to editor
      </button>
    </div>

    @if (loading()) {
      <p class="p-8 text-body text-fg-muted">Loading draft…</p>
    } @else if (!found()) {
      <p class="p-8 text-body text-fg-muted">
        No draft saved for this record yet. Save a draft first, then preview it.
      </p>
    } @else if (entity() === 'projects') {
      <app-case-study [project]="project()" [media]="[]" />
    } @else {
      <!-- The real /about page, rendered with the DRAFT profile. -->
      <app-about [profileInput]="profile()" />
    }
  `,
})
export class AdminPreview {
  /** Route params: /admin/preview/:entity/:id */
  readonly entity = input<string>('projects');
  readonly id = input<string>('');

  private readonly admin = inject(AdminService);
  private readonly location = inject(Location);

  protected readonly loading = signal(true);
  protected readonly found = signal(false);
  protected readonly project = signal<Project | null>(null);
  protected readonly profile = signal<Profile | null>(null);

  constructor() {
    void this.load();
  }

  protected back(): void {
    this.location.back();
  }

  protected bioParagraphs(): string[] {
    return this.profile()?.bioLong.split('\n\n') ?? [];
  }

  private async load(): Promise<void> {
    const entity = this.entity() === 'profile' ? 'profile' : 'projects';
    const draft = await this.admin.getDraft<Record<string, unknown>>(entity, this.id());

    if (draft) {
      this.found.set(true);
      /**
       * The draft is shaped like the form, not the model — `stackText` instead
       * of `stack` on a project. Normalised here so the real component receives
       * exactly what it would receive from Firestore.
       */
      const data = { ...draft.data };
      if (entity === 'projects' && typeof data['stackText'] === 'string') {
        data['stack'] = (data['stackText'] as string)
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
        delete data['stackText'];
      }

      if (entity === 'projects') this.project.set(data as unknown as Project);
      else this.profile.set(data as unknown as Profile);
    }

    this.loading.set(false);
  }
}
