import { ChangeDetectionStrategy, Component } from '@angular/core';
import { UiButton, UiCard, UiEyebrow, UiStatusDot, UiTag } from '../../shared/ui';

interface Swatch {
  readonly token: string;
  readonly hex: string;
  readonly role: string;
  readonly rule: string;
  readonly onBg: string;
  readonly onSurface: string;
}

interface TypeSpec {
  readonly token: string;
  readonly face: string;
  readonly use: string;
  readonly cls: string;
}

/**
 * Phase 1 review page (09 §6 checkpoint discipline).
 *
 * Scaffolding, not a site page: it exists so the token and component decisions
 * can be looked at before they multiply across nine phases. Delete src/app/dev/
 * and its route before launch.
 *
 * Contrast figures below are measured, not estimated — computed with the WCAG
 * 2.x relative-luminance formula against both background tokens (07 §8).
 */
@Component({
  selector: 'app-styleguide',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [UiButton, UiCard, UiEyebrow, UiStatusDot, UiTag],
  templateUrl: './styleguide.html',
})
export class Styleguide {
  protected readonly swatches: readonly Swatch[] = [
    {
      token: '--color-bg',
      hex: '#000000',
      role: 'Primary background',
      rule: 'The base. Most of the site sits on true black.',
      onBg: '—',
      onSurface: '—',
    },
    {
      token: '--color-surface',
      hex: '#140A03',
      role: 'Secondary surface',
      rule: 'Cards, panels, raised sections. Warm near-black, so depth reads as surface — not opacity.',
      onBg: '—',
      onSurface: '—',
    },
    {
      token: '--color-fg',
      hex: '#FFFFFF',
      role: 'Primary text',
      rule: 'Headlines and primary body copy.',
      onBg: '21.00:1',
      onSurface: '19.54:1',
    },
    {
      token: '--color-fg-muted',
      hex: '#888888',
      role: 'Secondary text',
      rule: 'Captions, metadata, tags. Supporting information, never the main message.',
      onBg: '5.92:1',
      onSurface: '5.51:1',
    },
    {
      token: '--color-action',
      hex: '#FF6B00',
      role: 'Primary accent — "act on this"',
      rule: 'CTAs, links, focus rings. Interactive elements only (08 §2, Option A). Never a section eyebrow or a label.',
      onBg: '7.36:1',
      onSurface: '6.85:1',
    },
    {
      token: '--color-action-hover',
      hex: '#E59400',
      role: 'Secondary accent',
      rule: 'Hover and active states only. Never used alone as a standalone brand colour.',
      onBg: '8.57:1',
      onSurface: '7.97:1',
    },
    {
      token: '--color-live',
      hex: '#00D68F',
      role: 'Functional accent — status only',
      rule: '"Live", "verified", "working". Never decorative. If it is on screen, it is telling you something.',
      onBg: '11.02:1',
      onSurface: '10.25:1',
    },
  ];

  protected readonly typeSpecs: readonly TypeSpec[] = [
    {
      token: 'text-display-1',
      face: 'Clash Display',
      use: 'Hero statement. One per page, at most.',
      cls: 'font-display text-display-1',
    },
    {
      token: 'text-display-2',
      face: 'Clash Display',
      use: 'Section openers.',
      cls: 'font-display text-display-2',
    },
    {
      token: 'text-display-3',
      face: 'Clash Display',
      use: 'Card titles, sub-section headings.',
      cls: 'font-display text-display-3',
    },
    {
      token: 'text-body-lg',
      face: 'General Sans',
      use: 'Lead paragraphs, case-study intros.',
      cls: 'font-sans text-body-lg',
    },
    {
      token: 'text-body',
      face: 'General Sans',
      use: 'Long-form prose. The Story page and case-study body copy.',
      cls: 'font-sans text-body',
    },
    {
      token: 'text-caption',
      face: 'General Sans',
      use: 'Captions and secondary notes.',
      cls: 'font-sans text-caption text-fg-muted',
    },
    {
      token: 'text-label',
      face: 'JetBrains Mono',
      use: 'Stack tags, dates, stat labels, eyebrows. The fixed handful of places mono appears.',
      cls: 'font-mono text-label uppercase',
    },
  ];

  /** 8px rhythm from 07 §4, expressed in Tailwind's default 4px base. */
  protected readonly spacing: readonly { step: string; px: number }[] = [
    { step: '2', px: 8 },
    { step: '4', px: 16 },
    { step: '6', px: 24 },
    { step: '8', px: 32 },
    { step: '12', px: 48 },
    { step: '16', px: 64 },
    { step: '24', px: 96 },
  ];

  /** Real stack from the Scholarship Operation Dashboard (03 §4) — used here
   *  because demo tags should not invent technologies either. */
  protected readonly demoStack: readonly string[] = [
    'Angular',
    'TypeScript',
    'Firebase',
    'Firestore',
    'Tailwind',
  ];
}
