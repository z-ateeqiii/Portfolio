import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

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
  imports: [FormsModule, RouterLink, DraftBar],
  template: `
    <app-draft-bar
      [title]="form().name || 'New project'"
      [isLive]="isLive()"
      [hasDraft]="hasDraft()"
      [dirty]="dirty()"
      [busy]="busy()"
      [draftedAt]="draftedAt()"
      [previewLink]="['/admin/preview/projects', form().slug || 'new']"
      (save)="save()"
      (publish)="publish()"
      (discard)="discard()"
    />

    <div class="max-w-3xl space-y-6 p-8">
      @if (isLive()) {
        <a
          [routerLink]="['/admin/projects', form().slug, 'media']"
          class="inline-block rounded-sm border border-fg/24 px-4 py-2 text-caption text-fg no-underline"
          >Manage images →</a
        >
      } @else {
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
              class="mt-2 w-full rounded-sm border border-fg/24 bg-surface px-3 py-2 text-body text-fg"
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
      <label class="flex items-start gap-3 rounded-md border border-fg/24 bg-surface p-4">
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
            class="mt-2 w-full rounded-sm border border-fg/24 bg-surface px-3 py-2 text-body text-fg"
          ></textarea>
          <span class="mt-1 block text-caption text-fg-muted">{{ f.hint }}</span>
        </label>
      }
    </div>
  `,
})
export class AdminProjectEditor {
  /** Route param. 'new' means a project that does not exist yet. */
  readonly slug = input<string>('new');

  private readonly admin = inject(AdminService);

  private readonly loaded = signal<ProjectForm>(EMPTY);
  protected readonly form = signal<ProjectForm>(EMPTY);

  protected readonly isLive = signal(false);
  protected readonly hasDraft = signal(false);
  protected readonly draftedAt = signal<Date | null>(null);
  protected readonly busy = signal(false);

  protected readonly dirty = computed(
    () => JSON.stringify(this.form()) !== JSON.stringify(this.loaded()),
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
    void this.load();
  }

  protected text(key: string): string {
    const value = (this.form() as unknown as Record<string, unknown>)[key];
    return value === undefined || value === null ? '' : String(value);
  }

  protected update(key: string, next: unknown): void {
    const value = key === 'order' ? Number(next) || 0 : next;
    this.form.set({ ...this.form(), [key]: value });
  }

  private async load(): Promise<void> {
    const slug = this.slug();
    if (slug === 'new') return;

    const live = await this.admin.get<Project>('projects', slug);
    this.isLive.set(live !== null);

    const draft = await this.admin.getDraft<ProjectForm>('projects', slug);
    if (draft) {
      this.hasDraft.set(true);
      this.draftedAt.set(draft.updatedAt);
      this.reset({ ...EMPTY, ...draft.data });
      return;
    }

    if (live) {
      const { status: _s, updatedAt: _u, publishedAt: _p, stack, ...rest } = live;
      this.reset({ ...EMPTY, ...rest, stackText: (stack ?? []).join(', ') });
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
      console.error('[admin/project]', error);
    } finally {
      this.busy.set(false);
    }
  }
}
