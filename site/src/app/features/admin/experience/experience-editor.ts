import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { Experience } from '../../../core/models';
import { AdminService } from '../../../core/services/admin.service';

type ExperienceForm = Omit<
  Experience,
  'status' | 'updatedAt' | 'publishedAt' | 'tech' | 'linkedProjectSlugs'
> & {
  techText: string;
  linkedText: string;
};

const EMPTY = (id: string): ExperienceForm => ({
  id,
  organization: '',
  role: '',
  timeframe: '',
  engagement: '',
  summary: '',
  techText: '',
  linkedText: '',
});

/**
 * Experience (05 §3.5) — an expandable accordion.
 *
 * ─── Why an accordion and not a flat list ────────────────────────────────────
 * Structural, not cosmetic. Each role carries a paragraph of prose plus tech
 * tags and project links; rendering four of those expanded at once produces a
 * wall where nothing is scannable and the ordering — which is the thing most
 * often being checked — disappears. Collapsed rows make the sequence of roles
 * readable at a glance, and expansion is where editing happens.
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * ON THE ONGOING ROLE: `timeframe` is free text and is rendered verbatim, so
 * "Apr 2026 – Present" stays present tense. Nothing here derives a tense, a
 * status, or an end date from it — there is no code path that can turn a
 * current job into a past one, which matters because Muhammed is still employed
 * while job-searching.
 *
 * Draftable (04 §12), so each role gets its own Save draft / Publish rather
 * than a single page-wide one: publishing an edit to one job should not push
 * out a half-finished edit to another.
 */
@Component({
  selector: 'app-admin-experience',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  template: `
    <div class="p-8">
      <div class="flex items-center justify-between">
        <h1 class="font-display text-display-3 text-fg">Experience</h1>
        <button
          type="button"
          (click)="addRole()"
          class="rounded-sm bg-action px-4 py-2 text-caption font-medium text-bg"
        >
          Add role
        </button>
      </div>

      @if (loading()) {
        <p class="mt-8 text-body text-fg-muted">Loading…</p>
      } @else {
        <ul class="mt-8 max-w-3xl">
          @for (role of roles(); track role.id) {
            <li class="border-b border-fg/12">
              <!-- Collapsed header: the scannable row -->
              <button
                type="button"
                (click)="toggle(role.id)"
                [attr.aria-expanded]="isOpen(role.id)"
                class="flex w-full items-baseline gap-4 py-4 text-left"
              >
                <span class="text-fg-muted" aria-hidden="true">{{
                  isOpen(role.id) ? '−' : '+'
                }}</span>
                <span class="min-w-0 flex-1">
                  <span class="block text-body text-fg">{{ role.role || 'Untitled role' }}</span>
                  <span class="block text-caption text-fg-muted">{{ role.organization }}</span>
                </span>
                <span class="font-mono text-label text-fg-muted whitespace-nowrap">{{
                  role.timeframe
                }}</span>
                @if (drafted().has(role.id)) {
                  <span class="font-mono text-label text-action">draft</span>
                }
              </button>

              @if (isOpen(role.id)) {
                <div class="space-y-4 pb-6 pl-8">
                  @for (f of fields; track f.key) {
                    <label class="block">
                      <span class="font-mono text-label text-fg-muted uppercase">{{ f.label }}</span>
                      @if (f.multiline) {
                        <textarea
                          [name]="f.key + role.id"
                          rows="5"
                          [ngModel]="text(role, f.key)"
                          (ngModelChange)="patch(role.id, f.key, $event)"
                          class="mt-2 w-full rounded-sm border border-fg/24 bg-surface px-3 py-2 text-body text-fg"
                        ></textarea>
                      } @else {
                        <input
                          [name]="f.key + role.id"
                          [ngModel]="text(role, f.key)"
                          (ngModelChange)="patch(role.id, f.key, $event)"
                          class="mt-2 w-full rounded-sm border border-fg/24 bg-surface px-3 py-2 text-body text-fg"
                        />
                      }
                      @if (f.hint) {
                        <span class="mt-1 block text-caption text-fg-muted">{{ f.hint }}</span>
                      }
                    </label>
                  }

                  <div class="flex flex-wrap items-center gap-3 pt-2">
                    <button
                      type="button"
                      [disabled]="busy()"
                      (click)="saveDraft(role)"
                      class="rounded-sm border border-fg/24 px-4 py-2 text-caption text-fg disabled:opacity-40"
                    >
                      Save draft
                    </button>
                    <button
                      type="button"
                      [disabled]="busy() || !drafted().has(role.id)"
                      (click)="publish(role)"
                      class="rounded-sm bg-action px-4 py-2 text-caption font-medium text-bg disabled:opacity-40"
                    >
                      Publish
                    </button>
                    @if (drafted().has(role.id)) {
                      <button
                        type="button"
                        [disabled]="busy()"
                        (click)="discard(role)"
                        class="text-caption text-fg-muted hover:text-fg"
                      >
                        Discard draft
                      </button>
                    }
                    <button
                      type="button"
                      (click)="remove(role)"
                      class="ml-auto text-caption text-fg-muted hover:text-action"
                    >
                      Delete role
                    </button>
                  </div>
                </div>
              }
            </li>
          }
        </ul>
      }
    </div>
  `,
})
export class AdminExperienceEditor {
  private readonly admin = inject(AdminService);

  protected readonly loading = signal(true);
  protected readonly roles = signal<ExperienceForm[]>([]);
  protected readonly drafted = signal(new Set<string>());
  protected readonly busy = signal(false);
  private readonly open = signal(new Set<string>());

  protected readonly fields = [
    { key: 'role', label: 'Role', multiline: false, hint: '' },
    { key: 'organization', label: 'Organisation', multiline: false, hint: '' },
    {
      key: 'timeframe',
      label: 'Timeframe',
      multiline: false,
      hint: 'Free text. Use "– Present" for an ongoing role — it renders verbatim.',
    },
    {
      key: 'engagement',
      label: 'Engagement',
      multiline: false,
      hint: 'Optional, e.g. "Part-time" or "Apprenticeship · On-site, Cairo"',
    },
    { key: 'summary', label: 'Summary', multiline: true, hint: 'Prose, not bullets.' },
    { key: 'techText', label: 'Tech', multiline: false, hint: 'Comma separated. Only tech actually used.' },
    {
      key: 'linkedText',
      label: 'Linked project slugs',
      multiline: false,
      hint: 'Comma separated, e.g. st-employees-portal, scholarship-operation-dashboard',
    },
  ] as const;

  constructor() {
    void this.load();
  }

  protected isOpen(id: string): boolean {
    return this.open().has(id);
  }

  protected toggle(id: string): void {
    const next = new Set(this.open());
    next.has(id) ? next.delete(id) : next.add(id);
    this.open.set(next);
  }

  protected text(role: ExperienceForm, key: string): string {
    const value = (role as unknown as Record<string, unknown>)[key];
    return value === undefined || value === null ? '' : String(value);
  }

  protected patch(id: string, key: string, value: string): void {
    this.roles.set(this.roles().map((r) => (r.id === id ? { ...r, [key]: value } : r)));
  }

  private async load(): Promise<void> {
    const [live, drafts] = await Promise.all([
      this.admin.list<Experience>('experience'),
      this.admin.listDrafts(),
    ]);

    const roleDrafts = new Map(
      drafts.filter((d) => d.entity === 'experience').map((d) => [d.docId, d.data]),
    );

    const toForm = (e: Experience): ExperienceForm => ({
      id: e.id,
      organization: e.organization,
      role: e.role,
      timeframe: e.timeframe,
      engagement: e.engagement ?? '',
      summary: e.summary,
      techText: (e.tech ?? []).join(', '),
      linkedText: (e.linkedProjectSlugs ?? []).join(', '),
    });

    /** A saved draft wins over the live record, so reopening shows the edit. */
    this.roles.set(
      live.map((e) => (roleDrafts.has(e.id) ? (roleDrafts.get(e.id) as ExperienceForm) : toForm(e))),
    );
    this.drafted.set(new Set(roleDrafts.keys()));
    this.loading.set(false);
  }

  protected addRole(): void {
    const id = `role-${Date.now()}`;
    this.roles.set([...this.roles(), EMPTY(id)]);
    this.open.set(new Set([...this.open(), id]));
  }

  private toModel(form: ExperienceForm) {
    const { techText, linkedText, ...rest } = form;
    const split = (t: string) =>
      t
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    return { ...rest, tech: split(techText), linkedProjectSlugs: split(linkedText) };
  }

  protected async saveDraft(role: ExperienceForm): Promise<void> {
    await this.run(async () => {
      await this.admin.saveDraft('experience', role.id, role);
      this.drafted.set(new Set([...this.drafted(), role.id]));
    });
  }

  protected async publish(role: ExperienceForm): Promise<void> {
    await this.run(async () => {
      /** Form-only fields are converted back to the 04 §4 shape before publish. */
      await this.admin.saveDraft('experience', role.id, this.toModel(role));
      await this.admin.publish('experience', role.id);
      const next = new Set(this.drafted());
      next.delete(role.id);
      this.drafted.set(next);
    });
  }

  protected async discard(role: ExperienceForm): Promise<void> {
    await this.run(async () => {
      await this.admin.discardDraft('experience', role.id);
      const next = new Set(this.drafted());
      next.delete(role.id);
      this.drafted.set(next);
      await this.load();
    });
  }

  protected async remove(role: ExperienceForm): Promise<void> {
    await this.run(async () => {
      await this.admin.remove('experience', role.id);
      await this.admin.discardDraft('experience', role.id).catch(() => undefined);
      this.roles.set(this.roles().filter((r) => r.id !== role.id));
    });
  }

  private async run(action: () => Promise<void>): Promise<void> {
    this.busy.set(true);
    try {
      await action();
    } catch (error) {
      console.error('[admin/experience]', error);
    } finally {
      this.busy.set(false);
    }
  }
}
