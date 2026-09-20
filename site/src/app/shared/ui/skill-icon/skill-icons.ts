import {
  siAngular,
  siBootstrap,
  siChartdotjs,
  siCss,
  siD3,
  siDotnet,
  siFigma,
  siFirebase,
  siGit,
  siGithub,
  siGithubactions,
  siHtml5,
  siJavascript,
  siJquery,
  siJson,
  siJsonwebtokens,
  siNetlify,
  siNodedotjs,
  siPostman,
  siReactivex,
  siTailwindcss,
  siTypescript,
  siVercel,
} from 'simple-icons';

/**
 * Skill name to brand mark (04 §5, 07 §7c).
 *
 * ─── Why an explicit map and not a slug guess ───────────────────────────────
 * Deriving a Simple Icons slug from a skill name matched 12 of 36 seeded
 * skills. Real names carry versions ("Angular 17+"), punctuation ("D3.js",
 * ".NET", "C#") and spacing the slugs do not, and the near-misses are worse
 * than the misses: "sharp" is a real Simple Icons entry for an image-resizing
 * library, so a naive guess would have put its logo next to C#.
 *
 * ─── Why most skills have no entry, deliberately ────────────────────────────
 * Over half of what Muhammed lists is practice rather than product —
 * Accessibility, Lazy Loading, Code Reviews, Modular Architecture, SDLC. None
 * has a logo, and inventing one (a generic gear, a nearby brand) would either
 * say nothing or say something false. Those render as plain text tags, which
 * is what `UiSkillIcon` falls back to for anything absent here.
 *
 * Two entries are judgement calls worth naming:
 *  - Firestore uses the Firebase mark, because Firestore is a Firebase
 *    product and ships under that brand.
 *  - RxJS uses the ReactiveX mark, which is the logo RxJS itself uses.
 *
 * And two deliberate omissions: "Angular Material" is not given Angular's or
 * Material Design's logo (it is neither), and "C#" is left without one
 * because Simple Icons has no C# mark and .NET's would be a different thing.
 *
 * Only these icons are imported by name, so the bundler keeps their path data
 * and drops the other ~3,300 in the package — verified against the built
 * bundle rather than assumed.
 */
const ICONS: Readonly<Record<string, { readonly path: string; readonly title: string }>> = {
  'HTML5': siHtml5,
  'CSS3': siCss,
  'JavaScript (ES6+)': siJavascript,
  'TypeScript': siTypescript,
  'Angular 17+': siAngular,
  'Tailwind CSS': siTailwindcss,
  'Bootstrap 5': siBootstrap,
  'jQuery': siJquery,
  'RxJS': siReactivex,
  'JSON': siJson,
  'JWT Authentication': siJsonwebtokens,
  'Firebase': siFirebase,
  'Firestore': siFirebase,
  'D3.js': siD3,
  'Chart.js': siChartdotjs,
  'Git': siGit,
  'GitHub': siGithub,
  'CI Workflows': siGithubactions,
  'Postman': siPostman,
  'Figma': siFigma,
  'Netlify': siNetlify,
  'Vercel': siVercel,
  '.NET': siDotnet,
  'Node.js': siNodedotjs,
};

/** The mark for a skill, or null when it has none — never a stand-in. */
export function skillIcon(name: string): { readonly path: string; readonly title: string } | null {
  return ICONS[name] ?? null;
}
