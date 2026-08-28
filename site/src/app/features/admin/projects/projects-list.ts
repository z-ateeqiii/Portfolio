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
              @for (h of ['Order', 'Name', 'Tier', 'Home', 'State']; track h) {
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

  constructor() {
    void this.load();
  }

  protected name(draft: DraftRecord): string {
    return (draft.data as { name?: string }).name || draft.docId;
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
