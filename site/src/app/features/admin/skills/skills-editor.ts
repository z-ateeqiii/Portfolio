import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { Skill, SkillCategory, SkillLevel } from '../../../core/models';
import { AdminService } from '../../../core/services/admin.service';

const CATEGORIES: SkillCategory[] = [
  'language',
  'framework',
  'state-data',
  'data-viz',
  'practice',
  'tooling',
];
const LEVELS: SkillLevel[] = ['strong', 'good', 'learning', 'interested'];

/**
 * Skills (05 §3.6).
 *
 * "Since this list changes often as Muhammed learns new things, this should be
 * the fastest, lowest-friction form in the whole dashboard — add a skill in a
 * few seconds, not a full multi-field form."
 *
 * So: one inline row to add, and every existing row editable in place with no
 * modal, no detail screen and no save button per row. Changing a level is a
 * single click that writes immediately.
 *
 * No Draft → Publish here, deliberately. 04 §12 scopes that workflow to
 * Project, Experience and Profile; a skill name is either right or absent, and
 * routing a two-second edit through a publish step would defeat the one
 * requirement this screen has.
 *
 * The level selector shows what each level MEANS, using the definitions the
 * levels were actually seeded against (brief §11, 10 §4b) — `strong` is
 * evidence-based, not a self-rating, and that is easy to forget a year later.
 */
@Component({
  selector: 'app-admin-skills',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  template: `
    <div class="p-8">
      <h1 class="font-display text-display-3 text-fg">Skills</h1>
      <p class="mt-2 max-w-2xl text-caption text-fg-muted">
        <strong class="text-fg">strong</strong> = actually used in a shipped project ·
        <strong class="text-fg">good</strong> = real knowledge, not yet shipped ·
        <strong class="text-fg">learning</strong> = in progress ·
        <strong class="text-fg">interested</strong> = not started. Changes save immediately.
      </p>

      <!-- Add row (05 §3.6: a few seconds, not a form) -->
      <form class="mt-8 flex flex-wrap items-end gap-3" (ngSubmit)="add()">
        <label class="block">
          <span class="font-mono text-label text-fg-muted uppercase">New skill</span>
          <input
            name="newName"
            [(ngModel)]="newName"
            placeholder="e.g. Playwright"
            class="mt-2 w-56 rounded-sm border border-fg/40 bg-surface px-3 py-2 text-body text-fg"
          />
        </label>
        <select
          name="newCategory"
          [(ngModel)]="newCategory"
          class="rounded-sm border border-fg/40 bg-surface px-3 py-2 text-body text-fg"
        >
          @for (c of categories; track c) {
            <option [value]="c">{{ c }}</option>
          }
        </select>
        <select
          name="newLevel"
          [(ngModel)]="newLevel"
          class="rounded-sm border border-fg/40 bg-surface px-3 py-2 text-body text-fg"
        >
          @for (l of levels; track l) {
            <option [value]="l">{{ l }}</option>
          }
        </select>
        <button
          type="submit"
          class="rounded-sm bg-action px-4 py-2 text-caption font-medium text-bg"
        >
          Add
        </button>
      </form>

      @if (loading()) {
        <p class="mt-8 text-body text-fg-muted">Loading…</p>
      } @else {
        <table class="mt-8 w-full max-w-3xl text-left">
          <tbody>
            @for (skill of skills(); track skill.id) {
              <tr class="border-b border-fg/12">
                <td class="py-2 text-body text-fg">{{ skill.name }}</td>
                <td class="py-2">
                  <select
                    [ngModel]="skill.category"
                    [name]="'cat-' + skill.id"
                    (ngModelChange)="patch(skill, { category: $event })"
                    class="rounded-sm border border-fg/40 bg-surface px-2 py-1 text-caption text-fg"
                  >
                    @for (c of categories; track c) {
                      <option [value]="c">{{ c }}</option>
                    }
                  </select>
                </td>
                <td class="py-2">
                  <select
                    [ngModel]="skill.level"
                    [name]="'lvl-' + skill.id"
                    (ngModelChange)="patch(skill, { level: $event })"
                    class="rounded-sm border border-fg/40 bg-surface px-2 py-1 text-caption text-fg"
                  >
                    @for (l of levels; track l) {
                      <option [value]="l">{{ l }}</option>
                    }
                  </select>
                </td>
                <td class="py-2 text-right">
                  <button
                    type="button"
                    (click)="remove(skill)"
                    class="text-caption text-fg-muted hover:text-action"
                  >
                    Remove
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
export class AdminSkillsEditor {
  private readonly admin = inject(AdminService);

  protected readonly categories = CATEGORIES;
  protected readonly levels = LEVELS;
  protected readonly loading = signal(true);
  protected readonly skills = signal<Skill[]>([]);

  protected newName = '';
  protected newCategory: SkillCategory = 'tooling';
  protected newLevel: SkillLevel = 'good';

  constructor() {
    void this.load();
  }

  private async load(): Promise<void> {
    this.skills.set(await this.admin.list<Skill>('skills'));
    this.loading.set(false);
  }

  /**
   * Matches the slug rule the seed uses, so an id created here and one created
   * by the seed script cannot disagree — "C#" must not become "c" (see
   * tools/seed/seed-data.ts).
   */
  private slugify(name: string): string {
    return name
      .toLowerCase()
      .replace(/^\./, 'dot-')
      .replace(/#/g, '-sharp')
      .replace(/\+/g, '-plus')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  protected async add(): Promise<void> {
    const name = this.newName.trim();
    if (!name) return;

    const skill: Skill = {
      id: this.slugify(name),
      name,
      category: this.newCategory,
      level: this.newLevel,
    };
    await this.admin.saveDirect('skills', skill.id, skill);
    this.newName = '';
    await this.load();
  }

  protected async patch(skill: Skill, change: Partial<Skill>): Promise<void> {
    const next = { ...skill, ...change };
    this.skills.set(this.skills().map((s) => (s.id === skill.id ? next : s)));
    await this.admin.saveDirect('skills', skill.id, next);
  }

  protected async remove(skill: Skill): Promise<void> {
    this.skills.set(this.skills().filter((s) => s.id !== skill.id));
    await this.admin.remove('skills', skill.id);
  }
}
