import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import {
  BusinessVenture,
  Education,
  EducationType,
  ProofPoint,
  SocialPlatform,
} from '../../../core/models';
import { AdminService } from '../../../core/services/admin.service';

/**
 * The four reference-data screens (05 §3.7, §3.9, §3.10, §3.11).
 *
 * These save directly with no Draft → Publish step, matching 04 §12, which
 * scopes that workflow to Project, Experience and Profile. A follower count or
 * a certificate date is either right or absent; there is no half-written state
 * a visitor needs protecting from.
 *
 * Kept in one file because they are one pattern — a flat list of records with
 * a handful of fields each. Splitting them into four near-identical files would
 * be filing, not structure.
 */

const FIELD =
  'mt-1 w-full rounded-sm border border-fg/24 bg-surface px-3 py-2 text-body text-fg';
const LABEL = 'font-mono text-label text-fg-muted uppercase';

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Social platforms (05 §3.7).
 *
 * The stale-date warning is the point of this screen. 05 §3.7 asks the
 * dashboard to "visibly flag when lastVerifiedDate is getting old … so a stale
 * number doesn't sit unnoticed indefinitely", tying back to 03 §8. It does not
 * hide or alter anything — it just says how long it has been, so an aging claim
 * is a visible decision rather than a silent one.
 */
@Component({
  selector: 'app-admin-social',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe, FormsModule],
  template: `
    <div class="p-8">
      <h1 class="font-display text-display-3 text-fg">Social platforms</h1>
      <p class="mt-2 max-w-2xl text-caption text-fg-muted">
        Counts are stored as raw numbers so the site can present them honestly. The combined figure
        is currently <strong class="text-fg">{{ combined() | number }}</strong> — under a million,
        so it must never render as "+1M" (brief §20).
      </p>

      @for (p of platforms(); track p.platform) {
        <div class="mt-6 max-w-xl rounded-md border border-fg/12 p-4">
          <p class="text-body text-fg capitalize">{{ p.platform }}</p>

          <label class="mt-3 block">
            <span class="{{ label }}">Profile URL</span>
            <input
              [name]="'url' + p.platform"
              [ngModel]="p.url"
              (ngModelChange)="patch(p, { url: $event })"
              class="{{ field }}"
            />
          </label>

          <div class="mt-3 grid gap-3 sm:grid-cols-2">
            <label class="block">
              <span class="{{ label }}">Followers</span>
              <input
                type="number"
                [name]="'count' + p.platform"
                [ngModel]="p.followerCount"
                (ngModelChange)="patch(p, { followerCount: +$event || 0 })"
                class="{{ field }}"
              />
            </label>
            <label class="block">
              <span class="{{ label }}">Last verified</span>
              <input
                type="date"
                [name]="'date' + p.platform"
                [ngModel]="isoDate(p.lastVerifiedDate)"
                (ngModelChange)="setVerified(p, $event)"
                class="{{ field }}"
              />
            </label>
          </div>

          @if (staleness(p.lastVerifiedDate); as note) {
            <p class="mt-3 text-caption" [class.text-action]="note.stale" [class.text-fg-muted]="!note.stale">
              {{ note.text }}
            </p>
          }
        </div>
      }
    </div>
  `,
})
export class AdminSocialEditor {
  private readonly admin = inject(AdminService);
  protected readonly field = FIELD;
  protected readonly label = LABEL;
  protected readonly platforms = signal<SocialPlatform[]>([]);

  constructor() {
    void this.load();
  }

  private async load(): Promise<void> {
    const rows = await this.admin.list<SocialPlatform>('socialPlatforms');
    this.platforms.set(
      rows.map((r) => ({ ...r, lastVerifiedDate: new Date(r.lastVerifiedDate) })),
    );
  }

  protected combined(): number {
    return this.platforms().reduce((sum, p) => sum + p.followerCount, 0);
  }

  protected isoDate(date: Date): string {
    return new Date(date).toISOString().slice(0, 10);
  }

  /** Template expressions cannot call `new`, so the conversion lives here. */
  protected setVerified(row: SocialPlatform, iso: string): Promise<void> {
    return this.patch(row, { lastVerifiedDate: new Date(iso) });
  }

  /** 05 §3.7 — flag, never auto-hide. */
  protected staleness(date: Date): { text: string; stale: boolean } {
    const months = Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24 * 30));
    if (months < 1) return { text: 'Checked this month.', stale: false };
    const text = `Last checked ${months} month${months === 1 ? '' : 's'} ago.`;
    return months >= 4 ? { text: `${text} Worth re-verifying.`, stale: true } : { text, stale: false };
  }

  protected async patch(row: SocialPlatform, change: Partial<SocialPlatform>): Promise<void> {
    const next = { ...row, ...change };
    this.platforms.set(this.platforms().map((p) => (p.platform === row.platform ? next : p)));
    await this.admin.saveDirect('socialPlatforms', row.platform, next);
  }
}

// ─────────────────────────────────────────────────────────────────────────────

/** Business ventures (05 §3.9) — narrative plus editable label/value metrics. */
@Component({
  selector: 'app-admin-business',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  template: `
    <div class="p-8">
      <h1 class="font-display text-display-3 text-fg">Business ventures</h1>

      @for (v of ventures(); track v.id) {
        <div class="mt-6 max-w-2xl space-y-4 rounded-md border border-fg/12 p-4">
          <label class="block">
            <span class="{{ label }}">Name</span>
            <input
              [name]="'n' + v.id"
              [ngModel]="v.name"
              (ngModelChange)="patch(v, { name: $event })"
              class="{{ field }}"
            />
          </label>

          <label class="block">
            <span class="{{ label }}">Summary</span>
            <textarea
              rows="8"
              [name]="'s' + v.id"
              [ngModel]="v.summary"
              (ngModelChange)="patch(v, { summary: $event })"
              class="{{ field }}"
            ></textarea>
          </label>

          <div>
            <span class="{{ label }}">Metrics</span>
            <p class="mt-1 text-caption text-fg-muted">
              Keep qualifiers like "80+" and "~80,000 EGP" — they are what makes the number honest.
            </p>
            @for (m of v.metrics; track $index) {
              <div class="mt-2 flex gap-2">
                <input
                  [name]="'ml' + v.id + $index"
                  [ngModel]="m.label"
                  (ngModelChange)="patchMetric(v, $index, { label: $event })"
                  class="{{ field }}"
                />
                <input
                  [name]="'mv' + v.id + $index"
                  [ngModel]="m.value"
                  (ngModelChange)="patchMetric(v, $index, { value: $event })"
                  class="{{ field }}"
                />
                <button
                  type="button"
                  (click)="removeMetric(v, $index)"
                  class="shrink-0 px-2 text-caption text-fg-muted hover:text-action"
                >
                  Remove
                </button>
              </div>
            }
            <button
              type="button"
              (click)="addMetric(v)"
              class="mt-3 rounded-sm border border-fg/24 px-3 py-1 text-caption text-fg"
            >
              Add metric
            </button>
          </div>
        </div>
      }
    </div>
  `,
})
export class AdminBusinessEditor {
  private readonly admin = inject(AdminService);
  protected readonly field = FIELD;
  protected readonly label = LABEL;
  protected readonly ventures = signal<BusinessVenture[]>([]);

  constructor() {
    void this.load();
  }

  private async load(): Promise<void> {
    this.ventures.set(await this.admin.list<BusinessVenture>('businessVentures'));
  }

  protected async patch(row: BusinessVenture, change: Partial<BusinessVenture>): Promise<void> {
    const next = { ...row, ...change };
    this.ventures.set(this.ventures().map((v) => (v.id === row.id ? next : v)));
    await this.admin.saveDirect('businessVentures', row.id, next);
  }

  protected patchMetric(row: BusinessVenture, index: number, change: Partial<{ label: string; value: string }>) {
    const metrics = row.metrics.map((m, i) => (i === index ? { ...m, ...change } : m));
    return this.patch(row, { metrics });
  }

  protected addMetric(row: BusinessVenture) {
    return this.patch(row, { metrics: [...row.metrics, { label: '', value: '' }] });
  }

  protected removeMetric(row: BusinessVenture, index: number) {
    return this.patch(row, { metrics: row.metrics.filter((_, i) => i !== index) });
  }
}

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Education and certifications (05 §3.10).
 *
 * The `visible` toggle is the reason this screen exists in this shape: brief §9
 * notes not everything collected has to be shown, so an entry can be hidden
 * without being deleted. Hidden means unreadable, not merely unrendered — the
 * public query filters on `visible` and firestore.rules enforces it.
 */
@Component({
  selector: 'app-admin-education',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  template: `
    <div class="p-8">
      <div class="flex items-center justify-between">
        <h1 class="font-display text-display-3 text-fg">Education & certifications</h1>
        <button
          type="button"
          (click)="add()"
          class="rounded-sm bg-action px-4 py-2 text-caption font-medium text-bg"
        >
          Add entry
        </button>
      </div>

      <table class="mt-8 w-full max-w-4xl text-left">
        <tbody>
          @for (e of entries(); track e.id) {
            <tr class="border-b border-fg/12 align-top">
              <td class="py-2 pr-3">
                <select
                  [name]="'t' + e.id"
                  [ngModel]="e.type"
                  (ngModelChange)="patch(e, { type: $event })"
                  class="rounded-sm border border-fg/24 bg-surface px-2 py-1 text-caption text-fg"
                >
                  @for (t of types; track t) {
                    <option [value]="t">{{ t }}</option>
                  }
                </select>
              </td>
              <td class="py-2 pr-3">
                <input
                  [name]="'ti' + e.id"
                  [ngModel]="e.title"
                  (ngModelChange)="patch(e, { title: $event })"
                  class="w-full rounded-sm border border-fg/24 bg-surface px-2 py-1 text-caption text-fg"
                />
              </td>
              <td class="py-2 pr-3">
                <input
                  [name]="'i' + e.id"
                  [ngModel]="e.issuer"
                  (ngModelChange)="patch(e, { issuer: $event })"
                  class="w-full rounded-sm border border-fg/24 bg-surface px-2 py-1 text-caption text-fg"
                />
              </td>
              <td class="py-2 pr-3">
                <input
                  [name]="'d' + e.id"
                  [ngModel]="e.date"
                  (ngModelChange)="patch(e, { date: $event })"
                  class="w-32 rounded-sm border border-fg/24 bg-surface px-2 py-1 text-caption text-fg"
                />
              </td>
              <td class="py-2 pr-3">
                <label class="flex items-center gap-2 text-caption text-fg-muted">
                  <input
                    type="checkbox"
                    [name]="'v' + e.id"
                    [ngModel]="e.visible"
                    (ngModelChange)="patch(e, { visible: $event })"
                  />
                  visible
                </label>
              </td>
              <td class="py-2 text-right">
                <button
                  type="button"
                  (click)="remove(e)"
                  class="text-caption text-fg-muted hover:text-action"
                >
                  Remove
                </button>
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  `,
})
export class AdminEducationEditor {
  private readonly admin = inject(AdminService);
  protected readonly entries = signal<Education[]>([]);
  protected readonly types: EducationType[] = ['degree', 'certification', 'workshop'];

  constructor() {
    void this.load();
  }

  private async load(): Promise<void> {
    this.entries.set(await this.admin.list<Education>('education'));
  }

  protected async add(): Promise<void> {
    const entry: Education = {
      id: `entry-${Date.now()}`,
      type: 'certification',
      title: '',
      issuer: '',
      date: '',
      visible: true,
    };
    this.entries.set([...this.entries(), entry]);
    await this.admin.saveDirect('education', entry.id, entry);
  }

  protected async patch(row: Education, change: Partial<Education>): Promise<void> {
    const next = { ...row, ...change };
    this.entries.set(this.entries().map((e) => (e.id === row.id ? next : e)));
    await this.admin.saveDirect('education', row.id, next);
  }

  protected async remove(row: Education): Promise<void> {
    this.entries.set(this.entries().filter((e) => e.id !== row.id));
    await this.admin.remove('education', row.id);
  }
}

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Proof points (05 §3.11) — Home's proof strip.
 *
 * `value` is free text so qualifiers survive ("80+", "~986K"). 04 §11 stores it
 * as a string for exactly that reason; typing it as a number would force the
 * qualifiers out and turn a careful claim into an overstated one.
 *
 * `sourceRef` records which underlying record a number came from, so it can be
 * re-verified later rather than going stale silently.
 */
@Component({
  selector: 'app-admin-proof-points',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  template: `
    <div class="p-8">
      <div class="flex items-center justify-between">
        <h1 class="font-display text-display-3 text-fg">Proof points</h1>
        <button
          type="button"
          (click)="add()"
          class="rounded-sm bg-action px-4 py-2 text-caption font-medium text-bg"
        >
          Add
        </button>
      </div>
      <p class="mt-2 max-w-2xl text-caption text-fg-muted">
        A curated subset for Home — not every number available. Every figure must be verified
        before it appears here (brief §22).
      </p>

      <table class="mt-8 w-full max-w-3xl text-left">
        <tbody>
          @for (p of points(); track p.id) {
            <tr class="border-b border-fg/12">
              <td class="py-2 pr-3">
                <input
                  [name]="'l' + p.id"
                  [ngModel]="p.label"
                  (ngModelChange)="patch(p, { label: $event })"
                  placeholder="Laptops sold"
                  class="w-full rounded-sm border border-fg/24 bg-surface px-2 py-1 text-caption text-fg"
                />
              </td>
              <td class="py-2 pr-3">
                <input
                  [name]="'v' + p.id"
                  [ngModel]="p.value"
                  (ngModelChange)="patch(p, { value: $event })"
                  placeholder="80+"
                  class="w-32 rounded-sm border border-fg/24 bg-surface px-2 py-1 text-caption text-fg"
                />
              </td>
              <td class="py-2 pr-3">
                <input
                  [name]="'s' + p.id"
                  [ngModel]="p.sourceRef ?? ''"
                  (ngModelChange)="patch(p, { sourceRef: $event })"
                  placeholder="source, e.g. businessVentures/ateeqi-tech"
                  class="w-full rounded-sm border border-fg/24 bg-surface px-2 py-1 text-caption text-fg"
                />
              </td>
              <td class="py-2 text-right">
                <button
                  type="button"
                  (click)="remove(p)"
                  class="text-caption text-fg-muted hover:text-action"
                >
                  Remove
                </button>
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  `,
})
export class AdminProofPointsEditor {
  private readonly admin = inject(AdminService);
  protected readonly points = signal<ProofPoint[]>([]);

  constructor() {
    void this.load();
  }

  private async load(): Promise<void> {
    this.points.set(await this.admin.list<ProofPoint>('proofPoints'));
  }

  protected async add(): Promise<void> {
    const point: ProofPoint = { id: `pp-${Date.now()}`, label: '', value: '' };
    this.points.set([...this.points(), point]);
    await this.admin.saveDirect('proofPoints', point.id, point);
  }

  protected async patch(row: ProofPoint, change: Partial<ProofPoint>): Promise<void> {
    const next = { ...row, ...change };
    this.points.set(this.points().map((p) => (p.id === row.id ? next : p)));
    await this.admin.saveDirect('proofPoints', row.id, next);
  }

  protected async remove(row: ProofPoint): Promise<void> {
    this.points.set(this.points().filter((p) => p.id !== row.id));
    await this.admin.remove('proofPoints', row.id);
  }
}
