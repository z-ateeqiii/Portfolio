import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { Project, ProjectTier } from '../../../core/models';
import { AdminService } from '../../../core/services/admin.service';
import { DraftBar } from '../shared/draft-bar';

type ProjectForm = Omit<Project, 'status' | 'updatedAt' | 'publishedAt' | 'stack'> & {
  stackText: string;
};

const EMPTY: ProjectForm = {
  slug: '',
  name: '',
  tagline: '',
  tier: 'compact',
  order: 99,
  role: '',
  timeframe: '',
  stackText: '',
  liveUrl: '',
  githubUrl: '',
  problem: '',
  approach: '',
  build: '',
  aiDisclosure: '',
  dataHonestyNote: '',
  outcome: '',
  featuredOnHome: false,
};

/**
 * Project editor (05 §3.3) — every field from 04 §3.
 *
 * The tier selector explains what each tier MEANS rather than just naming it,
 * because 05 §3.3 asks for exactly that: "so Muhammed isn't guessing what
 * 'compact' implies for the live page". The descriptions come from 03 §3.
 *
 * `featuredOnHome` is a large, labelled toggle with its consequence spelled
 * out. 05 §3.3: "this single toggle controls whether a project shows on the
 * Home page, so it needs to be impossible to miss."
 *
 * The two honesty fields carry warnings rather than being ordinary textareas.
 * 09 §3 forbids skipping a disclosure on a project that needs one, and the
 * dashboard is where that decision actually gets made — a note at the point of
 * editing is worth more than a rule in a document nobody rereads.
 *
 * `stack` is edited as comma-separated text and split on save. 04 §3 stores an
 * array; a text field is the low-friction way in, and 03 §2 caps it at 3–5 tags
 * so a full tag editor would be machinery for a five-item list.
 */
@Component({
  selector: 'app-admin-project-editor',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, DraftBar],
  template: `
    <app-draft-bar
      [title]="form().name || 'New project'"
      [isLive]="isLive()"
      [hasDraft]="hasDraft()"
      [dirty]="dirty()"
      [busy]="busy()"
      [draftedAt]="draftedAt()"
      [previewLink]="['/admin/preview/projects', form().slug || 'new']"
      [extraLink]="mediaLink()"
      (save)="save()"
      (publish)="publish()"
      (discard)="discard()"
    />

    <div class="max-w-3xl space-y-6 p-8">
      @if (!isLive()) {
        <p class="text-caption text-fg-muted">
          Publish this project before adding images — media is stored under the project's slug.
        </p>
      }

      <!-- Snapshot (03 §2.1) -->
      <div class="grid gap-5 sm:grid-cols-2">
        @for (f of snapshotFields; track f.key) {
          <label class="block">
            <span class="font-mono text-label text-fg-muted uppercase">{{ f.label }}</span>
            <input
              [name]="f.key"
              [ngModel]="text(f.key)"
              (ngModelChange)="update(f.key, $event)"
              class="mt-2 w-full rounded-sm border border-fg/40 bg-surface px-3 py-2 text-body text-fg"
            />
            @if (f.hint) {
              <span class="mt-1 block text-caption text-fg-muted">{{ f.hint }}</span>
            }
          </label>
        }
      </div>

      <!-- Tier, with what each one actually does (05 §3.3, 03 §3) -->
      <fieldset class="rounded-md border border-fg/12 p-4">
        <legend class="px-2 font-mono text-label text-fg-muted uppercase">Depth tier</legend>
        @for (option of tiers; track option.value) {
          <label class="mt-2 flex gap-3">
            <input
              type="radio"
              name="tier"
              [value]="option.value"
              [ngModel]="form().tier"
              (ngModelChange)="update('tier', $event)"
              class="mt-1"
            />
            <span>
              <span class="text-body text-fg capitalize">{{ option.value }}</span>
              <span class="block text-caption text-fg-muted">{{ option.meaning }}</span>
            </span>
          </label>
        }
      </fieldset>

      <!-- featuredOnHome — impossible to miss, per 05 §3.3 -->
      <label class="flex items-start gap-3 rounded-md border border-fg/40 bg-surface p-4">
        <input
          type="checkbox"
          name="featuredOnHome"
          [ngModel]="form().featuredOnHome"
          (ngModelChange)="update('featuredOnHome', $event)"
          class="mt-1 size-5"
        />
        <span>
          <span class="text-body text-fg">Show on the Home page</span>
          <span class="block text-caption text-fg-muted">
            When on, this project appears in Home's Featured Work section.
          </span>
        </span>
      </label>

      <!-- Narrative blocks (03 §2.2–2.6) -->
      @for (f of narrativeFields; track f.key) {
        <label class="block">
          <span class="font-mono text-label text-fg-muted uppercase">{{ f.label }}</span>
          <textarea
            [name]="f.key"
            rows="6"
            [ngModel]="text(f.key)"
            (ngModelChange)="update(f.key, $event)"
            class="mt-2 w-full rounded-sm border border-fg/40 bg-surface px-3 py-2 text-body text-fg"
          ></textarea>
          <span class="mt-1 block text-caption text-fg-muted">{{ f.hint }}</span>
        </label>
      }

      <!-- Destructive, deliberately separated from the form fields above and
           from Save/Preview/Publish in the DraftBar (05 §3.3-style clarity —
           this is not an action to reach by accident). -->
      @if (isLive() || hasDraft()) {
        <div class="border-t border-fg/12 pt-6">
          <button
            type="button"
            [disabled]="busy()"
            (click)="deleteProject()"
            class="text-caption text-fg-muted hover:text-action disabled:opacity-40"
          >
            Delete this project
          </button>
        </div>
      }
    </div>
  `,
})
export class AdminProjectEditor {
  /** Route param. 'new' means a project that does not exist yet. */
  readonly slug = input<string>('new');

  private readonly admin = inject(AdminService);
  private readonly router = inject(Router);

  private readonly loaded = signal<ProjectForm>(EMPTY);
  protected readonly form = signal<ProjectForm>(EMPTY);

  protected readonly isLive = signal(false);
  protected readonly hasDraft = signal(false);
  protected readonly draftedAt = signal<Date | null>(null);
  protected readonly busy = signal(false);

  protected readonly dirty = computed(
    () => JSON.stringify(this.form()) !== JSON.stringify(this.loaded()),
  );

  /**
   * Surfaced in the sticky DraftBar rather than the scrolling form body — a
   * link that only appeared once, above a long form, is what Muhammed reported
   * never finding; he had to type the /media URL by hand. `null` before the
   * project is live: media is stored under the project's slug (03 §2.1's
   * Snapshot), so there is nowhere for it to attach yet.
   */
  protected readonly mediaLink = computed(() =>
    this.isLive() ? { label: 'Manage images', route: ['/admin/projects', this.form().slug, 'media'] } : null,
  );

  protected readonly tiers: { value: ProjectTier; meaning: string }[] = [
    {
      value: 'featured',
      meaning: 'Full six-block case study, most detail. Leads the Work index.',
    },
    { value: 'standard', meaning: 'Full six-block case study, slightly more concise.' },
    {
      value: 'compact',
      meaning: 'Snapshot, Problem, Build, Outcome only — leave Approach empty.',
    },
  ];

  protected readonly snapshotFields = [
    { key: 'name', label: 'Name', hint: '' },
    { key: 'slug', label: 'Slug', hint: 'URL segment. Cannot change after publishing.' },
    { key: 'tagline', label: 'Tagline', hint: 'One line, shown on /work cards' },
    { key: 'order', label: 'Order', hint: 'Lower sorts first. Curation, not chronology.' },
    { key: 'role', label: 'Role', hint: 'Leave empty if not stated anywhere' },
    { key: 'timeframe', label: 'Timeframe', hint: 'Free text, e.g. "Built in ~7 days"' },
    { key: 'stackText', label: 'Stack', hint: 'Comma separated. 3–5 tags.' },
    { key: 'liveUrl', label: 'Live URL', hint: 'Leave empty rather than guessing' },
    { key: 'githubUrl', label: 'GitHub URL', hint: 'Leave empty rather than guessing' },
  ] as const;

  protected readonly narrativeFields = [
    { key: 'problem', label: 'The Problem', hint: 'Concrete symptoms, not abstractions.' },
    { key: 'approach', label: 'The Approach', hint: 'Leave empty on compact tier.' },
    { key: 'build', label: 'The Build', hint: 'What was built, and the key decisions.' },
    {
      key: 'aiDisclosure',
      label: 'AI disclosure',
      hint: 'Required if AI was used in the build. Never leave blank to make a project look better.',
    },
    {
      key: 'dataHonestyNote',
      label: 'Data honesty note',
      hint: 'For when the DATA needs disclosing, not the build — e.g. dummy datasets.',
    },
    { key: 'outcome', label: 'Outcome', hint: 'What changed. No invented metrics.' },
  ] as const;

  constructor() {
    /**
     * effect(), not a constructor-time call. Found by Muhammed testing an
     * existing published project: opening its editor showed "New project" /
     * "NOT PUBLISHED YET" with every field empty.
     *
     * `withComponentInputBinding()` sets router-bound inputs via
     * `ComponentRef.setInput()` AFTER the component is constructed — confirmed
     * by reading the installed Angular Router source
     * (`RoutedComponentInputBinder.subscribeToRouteData`), which runs from the
     * outlet's activation sequence, strictly after `createComponent()` returns.
     * So `this.slug()` read synchronously in a constructor always held its
     * DEFAULT value ('new'), never the real route param — `load()` saw
     * `slug === 'new'`, returned immediately, and the form stayed at `EMPTY`
     * (whose `order: 99` is exactly the "order defaulting to 99" symptom).
     *
     * `effect()` runs for the first time AFTER construction, once `setInput()`
     * has already applied the real value, and re-runs whenever `slug()`
     * changes — which also fixes a second bug this shared: Angular reuses this
     * component instance when navigating between two different projects'
     * editors (e.g. clicking "New project" while already editing one), and a
     * constructor never runs again on reuse, so the OLD project's data would
     * otherwise persist onto the next slug indefinitely.
     */
    effect(() => {
      void this.load(this.slug());
    });
  }

  protected text(key: string): string {
    const value = (this.form() as unknown as Record<string, unknown>)[key];
    return value === undefined || value === null ? '' : String(value);
  }

  protected update(key: string, next: unknown): void {
    const value = key === 'order' ? Number(next) || 0 : next;
    this.form.set({ ...this.form(), [key]: value });
  }

  private async load(slug: string): Promise<void> {
    if (slug === 'new') {
      this.isLive.set(false);
      this.hasDraft.set(false);
      this.draftedAt.set(null);
      this.reset(EMPTY);
      return;
    }

    const live = await this.admin.get<Project>('projects', slug);
    this.isLive.set(live !== null);

    const draft = await this.admin.getDraft<ProjectForm>('projects', slug);
    if (draft) {
      this.hasDraft.set(true);
      this.draftedAt.set(draft.updatedAt);
      this.reset({ ...EMPTY, ...draft.data });
      return;
    }

    this.hasDraft.set(false);
    this.draftedAt.set(null);
    if (live) {
      const { status: _s, updatedAt: _u, publishedAt: _p, stack, ...rest } = live;
      this.reset({ ...EMPTY, ...rest, stackText: (stack ?? []).join(', ') });
    } else {
      this.reset(EMPTY);
    }
  }

  private reset(data: ProjectForm): void {
    this.loaded.set(data);
    this.form.set(data);
  }

  protected async save(): Promise<void> {
    const form = this.form();
    if (!form.slug) {
      console.error('[admin/project] a slug is required before saving');
      return;
    }
    await this.run(async () => {
      await this.admin.saveDraft('projects', form.slug, form);
      this.loaded.set(form);
      this.hasDraft.set(true);
      this.draftedAt.set(new Date());
    });
  }

  protected async publish(): Promise<void> {
    await this.run(async () => {
      /**
       * `stackText` is a form-only field. It is converted back to the array
       * 04 §3 defines, and the text field is not written to the live document —
       * otherwise the public shape would quietly gain a field the model does
       * not have.
       */
      const { stackText, ...rest } = this.form();
      const stack = stackText
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      await this.admin.saveDraft('projects', rest.slug, { ...rest, stack });
      await this.admin.publish('projects', rest.slug);

      this.hasDraft.set(false);
      this.draftedAt.set(null);
      this.isLive.set(true);
    });
  }

  protected async discard(): Promise<void> {
    await this.run(async () => {
      await this.admin.discardDraft('projects', this.form().slug);
      await this.load(this.slug());
    });
  }

  /**
   * Deletes the project entirely — live document, any pending draft, and its
   * media (05 §3.3's counterpart to the list screen's own delete action; see
   * projects-list.ts for the same operation there). Only shown once there is
   * something to delete (isLive() or hasDraft()) — a brand-new, never-saved
   * 'new' screen has nothing to remove.
   */
  protected async deleteProject(): Promise<void> {
    const form = this.form();
    const label = form.name || form.slug;
    if (!confirm(`Delete "${label}"? This removes it — and its images — from the site immediately. This cannot be undone.`)) {
      return;
    }
    await this.run(async () => {
      await this.admin.deleteProject(form.slug || this.slug());
      await this.router.navigateByUrl('/admin/projects');
    });
  }

  private async run(action: () => Promise<void>): Promise<void> {
    this.busy.set(true);
    try {
      await action();
    } catch (error) {
      console.error('[admin/project]', error);
    } finally {
      this.busy.set(false);
    }
  }
}
