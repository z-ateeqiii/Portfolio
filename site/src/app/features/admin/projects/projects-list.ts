import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Project } from '../../../core/models';
import { AdminService, DraftRecord } from '../../../core/services/admin.service';

/**
 * Projects list (05 §3.3).
 *
 * Shows every project regardless of status — the dashboard's job is the whole
 * picture, not the public subset. A project with a pending draft is marked, so
 * "what did I leave half-finished" is answerable at a glance rather than by
 * opening each one.
 *
 * `order` is shown and editable as a number rather than by drag-and-drop.
 * 05 §3.3 asks for drag-order; a numeric field is the honest interim — it
 * writes the same field and is not pretending to be the finished interaction.
 * Logged in 10 §4f.
 *
 * A "Media" link on every live row, so reaching the upload screen never
 * requires opening the project editor first. Muhammed reported no way in from
 * either this list or the editor and had to type the /media URL directly —
 * this is the other half of that fix (the editor gets its own link in its
 * sticky DraftBar). Absent on never-published drafts, matching the project
 * editor's own rule: media is stored under the project's slug, so there is
 * nowhere for it to attach until the project is live.
 *
 * A "Delete" action on every row, live and draft-only alike — there was
 * previously no way to remove a project from this screen at all (Muhammed
 * had a test project he could not clean up). Behind a plain confirm(), and
 * routed through AdminService.deleteProject() so a project's media is
 * cleaned up along with it rather than left as orphaned Firestore documents.
 */
@Component({
  selector: 'app-admin-projects',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <div class="p-8">
      <div class="flex items-center justify-between">
        <h1 class="font-display text-display-3 text-fg">Projects</h1>
        <a
          routerLink="/admin/projects/new"
          class="rounded-sm bg-action px-4 py-2 text-caption font-medium text-bg no-underline"
          >New project</a
        >
      </div>

      @if (loading()) {
        <p class="mt-8 text-body text-fg-muted">Loading…</p>
      } @else {
        <table class="mt-8 w-full text-left">
          <thead>
            <tr class="border-b border-fg/12">
              @for (h of ['Order', 'Name', 'Tier', 'Home', 'State', 'Media', '']; track h) {
                <th class="pb-2 font-mono text-label font-normal text-fg-muted uppercase">{{ h }}</th>
              }
            </tr>
          </thead>
          <tbody>
            @for (project of projects(); track project.slug) {
              <tr class="border-b border-fg/12">
                <td class="py-3 font-mono text-caption text-fg-muted">{{ project.order }}</td>
                <td class="py-3">
                  <a
                    [routerLink]="['/admin/projects', project.slug]"
                    class="text-body text-fg no-underline hover:text-action"
                    >{{ project.name }}</a
                  >
                </td>
                <td class="py-3 font-mono text-caption text-fg-muted">{{ project.tier }}</td>
                <td class="py-3 font-mono text-caption text-fg-muted">
                  {{ project.featuredOnHome ? 'yes' : '—' }}
                </td>
                <td class="py-3 font-mono text-caption">
                  @if (draftSlugs().has(project.slug)) {
                    <span class="text-action">draft pending</span>
                  } @else {
                    <span class="text-fg-muted">live</span>
                  }
                </td>
                <td class="py-3">
                  <a
                    [routerLink]="['/admin/projects', project.slug, 'media']"
                    class="text-caption text-fg-muted no-underline hover:text-action"
                    >Manage →</a
                  >
                </td>
                <td class="py-3 text-right">
                  <button
                    type="button"
                    [disabled]="deleting().has(project.slug)"
                    (click)="deleteProject(project.slug, project.name)"
                    class="text-caption text-fg-muted hover:text-action disabled:opacity-40"
                  >
                    {{ deleting().has(project.slug) ? 'Deleting…' : 'Delete' }}
                  </button>
                </td>
              </tr>
            }

            <!-- Drafts for projects that have never been published have no live
                 row above, so they are listed separately rather than hidden. -->
            @for (draft of unpublishedDrafts(); track draft.docId) {
              <tr class="border-b border-fg/12">
                <td class="py-3 font-mono text-caption text-fg-muted">—</td>
                <td class="py-3">
                  <a
                    [routerLink]="['/admin/projects', draft.docId]"
                    class="text-body text-fg no-underline hover:text-action"
                    >{{ name(draft) }}</a
                  >
                </td>
                <td class="py-3 font-mono text-caption text-fg-muted">—</td>
                <td class="py-3 font-mono text-caption text-fg-muted">—</td>
                <td class="py-3 font-mono text-caption text-action">never published</td>
                <td class="py-3 font-mono text-caption text-fg-muted">—</td>
                <td class="py-3 text-right">
                  <button
                    type="button"
                    [disabled]="deleting().has(draft.docId)"
                    (click)="deleteProject(draft.docId, name(draft))"
                    class="text-caption text-fg-muted hover:text-action disabled:opacity-40"
                  >
                    {{ deleting().has(draft.docId) ? 'Deleting…' : 'Delete' }}
                  </button>
                </td>
              </tr>
            }
          </tbody>
        </table>
      }
    </div>
  `,
})
export class AdminProjectsList {
  private readonly admin = inject(AdminService);

  protected readonly loading = signal(true);
  protected readonly projects = signal<Project[]>([]);
  protected readonly draftSlugs = signal(new Set<string>());
  protected readonly unpublishedDrafts = signal<DraftRecord[]>([]);
  /** Slugs/docIds currently being deleted, so the button disables per-row
   *  rather than the whole list, and cannot be double-clicked into a
   *  duplicate delete. */
  protected readonly deleting = signal(new Set<string>());

  constructor() {
    void this.load();
  }

  protected name(draft: DraftRecord): string {
    return (draft.data as { name?: string }).name || draft.docId;
  }

  protected async deleteProject(slug: string, label: string): Promise<void> {
    if (
      !confirm(
        `Delete "${label}"? This removes it — and its images — from the site immediately. This cannot be undone.`,
      )
    ) {
      return;
    }

    this.deleting.set(new Set([...this.deleting(), slug]));
    try {
      await this.admin.deleteProject(slug);
      this.projects.set(this.projects().filter((p) => p.slug !== slug));
      this.unpublishedDrafts.set(this.unpublishedDrafts().filter((d) => d.docId !== slug));
      const nextDrafts = new Set(this.draftSlugs());
      nextDrafts.delete(slug);
      this.draftSlugs.set(nextDrafts);
    } catch (error) {
      console.error('[admin/projects] delete failed', error);
    } finally {
      const next = new Set(this.deleting());
      next.delete(slug);
      this.deleting.set(next);
    }
  }

  private async load(): Promise<void> {
    const [projects, drafts] = await Promise.all([
      this.admin.list<Project>('projects', 'order'),
      this.admin.listDrafts(),
    ]);

    const projectDrafts = drafts.filter((d) => d.entity === 'projects');
    const liveSlugs = new Set(projects.map((p) => p.slug ?? ''));

    this.projects.set(projects);
    this.draftSlugs.set(new Set(projectDrafts.map((d) => d.docId)));
    this.unpublishedDrafts.set(projectDrafts.filter((d) => !liveSlugs.has(d.docId)));
    this.loading.set(false);
  }
}
