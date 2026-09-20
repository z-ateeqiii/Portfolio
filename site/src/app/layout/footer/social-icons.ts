export interface SocialMark {
  readonly path: string;
  /** Set when the glyph is drawn as a shape with a hole punched out of it. */
  readonly evenOdd?: boolean;
}

/**
 * Brand marks for the footer's contact channels (07 §7c).
 *
 * ─── WHY THESE ARE LITERALS AND NOT IMPORTS FROM simple-icons ────────────────
 * The skill marks import their icons by name from the package and the bundler
 * drops the rest, which works because every component that uses them is behind
 * a lazy route. The footer is not: it is in the app shell, loaded on the first
 * paint of every page. Importing from the package here gave esbuild an EAGER
 * dependency on the shared icon module, so the chunk holding all 24 skill
 * icons was promoted into the initial bundle — measured at +34.8 kB raw and
 * +12.1 kB transfer for what should have been four logos, with the Tailwind
 * mark (used only on About) sitting in the same initial chunk as GitHub's.
 *
 * Copying four paths costs about 3 kB and keeps the package out of the shell
 * entirely. The marks are CC0 and they are logos, so they do not change; the
 * lookup below names its source for anyone refreshing one.
 *
 * ─── LinkedIn is not in the library, and that is not an oversight ────────────
 * Searched the installed package by export name and by title across all 3,461
 * icons: there is no LinkedIn entry. Simple Icons removed it because LinkedIn
 * will not let the mark be redistributed under CC0, not because linking to a
 * profile with it is disallowed — LinkedIn's own brand guidelines ask for the
 * unaltered "in" bug used to point at LinkedIn content, which is exactly what
 * this is. So the glyph is here rather than the channel being dropped or given
 * a shape that is not its logo.
 *
 * ─── Email gets a drawn envelope ─────────────────────────────────────────────
 * Email is a protocol, not a product, so there is no mark to be faithful to.
 * This one is drawn to the site's own geometry — square corners, solid fill,
 * one chevron cut through it — so it sits in the row as a peer of the brand
 * marks instead of looking like a borrowed icon at a different weight.
 *
 * Everything renders in `currentColor`, like the skill marks: 00 §24 rules out
 * the sticker-sheet look, and five brand colours in a footer row is precisely
 * that. It is also the only way these read as one set rather than five logos.
 */
const MARKS: Readonly<Record<string, SocialMark>> = {
  Email: {
    path: 'M2 5H22V19H2Z M4 6.6L12 12.4L20 6.6L20 8.9L12 14.7L4 8.9Z',
    evenOdd: true,
  },
  LinkedIn: {
    path:
      'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v' +
      '5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6' +
      '.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.' +
      '925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H' +
      '1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.2' +
      '71V1.729C24 .774 23.2 0 22.222 0h.003z',
  },
  /** simple-icons: siGithub */
  GitHub: {
    path:
      'M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-' +
      '.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-' +
      '.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.10' +
      '8-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.3' +
      '03-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 ' +
      '.405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22' +
      ' 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.2' +
      '1.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12',
  },
  /** simple-icons: siInstagram */
  Instagram: {
    path:
      'M7.0301.084c-1.2768.0602-2.1487.264-2.911.5634-.7888.3075-1.4575.72-2.1228 1.3877-.6652.6677' +
      '-1.075 1.3368-1.3802 2.127-.2954.7638-.4956 1.6365-.552 2.914-.0564 1.2775-.0689 1.6882-.062' +
      '6 4.947.0062 3.2586.0206 3.6671.0825 4.9473.061 1.2765.264 2.1482.5635 2.9107.308.7889.72 1.' +
      '4573 1.388 2.1228.6679.6655 1.3365 1.0743 2.1285 1.38.7632.295 1.6361.4961 2.9134.552 1.2773' +
      '.056 1.6884.069 4.9462.0627 3.2578-.0062 3.668-.0207 4.9478-.0814 1.28-.0607 2.147-.2652 2.9' +
      '098-.5633.7889-.3086 1.4578-.72 2.1228-1.3881.665-.6682 1.0745-1.3378 1.3795-2.1284.2957-.76' +
      '32.4966-1.636.552-2.9124.056-1.2809.0692-1.6898.063-4.948-.0063-3.2583-.021-3.6668-.0817-4.9' +
      '465-.0607-1.2797-.264-2.1487-.5633-2.9117-.3084-.7889-.72-1.4568-1.3876-2.1228C21.2982 1.33 ' +
      '20.628.9208 19.8378.6165 19.074.321 18.2017.1197 16.9244.0645 15.6471.0093 15.236-.005 11.97' +
      '7.0014 8.718.0076 8.31.0215 7.0301.0839m.1402 21.6932c-1.17-.0509-1.8053-.2453-2.2287-.408-.' +
      '5606-.216-.96-.4771-1.3819-.895-.422-.4178-.6811-.8186-.9-1.378-.1644-.4234-.3624-1.058-.417' +
      '1-2.228-.0595-1.2645-.072-1.6442-.079-4.848-.007-3.2037.0053-3.583.0607-4.848.05-1.169.2456-' +
      '1.805.408-2.2282.216-.5613.4762-.96.895-1.3816.4188-.4217.8184-.6814 1.3783-.9003.423-.1651 ' +
      '1.0575-.3614 2.227-.4171 1.2655-.06 1.6447-.072 4.848-.079 3.2033-.007 3.5835.005 4.8495.060' +
      '8 1.169.0508 1.8053.2445 2.228.408.5608.216.96.4754 1.3816.895.4217.4194.6816.8176.9005 1.37' +
      '87.1653.4217.3617 1.056.4169 2.2263.0602 1.2655.0739 1.645.0796 4.848.0058 3.203-.0055 3.583' +
      '4-.061 4.848-.051 1.17-.245 1.8055-.408 2.2294-.216.5604-.4763.96-.8954 1.3814-.419.4215-.81' +
      '81.6811-1.3783.9-.4224.1649-1.0577.3617-2.2262.4174-1.2656.0595-1.6448.072-4.8493.079-3.2045' +
      '.007-3.5825-.006-4.848-.0608M16.953 5.5864A1.44 1.44 0 1 0 18.39 4.144a1.44 1.44 0 0 0-1.437' +
      ' 1.4424M5.8385 12.012c.0067 3.4032 2.7706 6.1557 6.173 6.1493 3.4026-.0065 6.157-2.7701 6.15' +
      '06-6.1733-.0065-3.4032-2.771-6.1565-6.174-6.1498-3.403.0067-6.156 2.771-6.1496 6.1738M8 12.0' +
      '077a4 4 0 1 1 4.008 3.9921A3.9996 3.9996 0 0 1 8 12.0077',
  },
  /** simple-icons: siFacebook */
  Facebook: {
    path:
      'M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 ' +
      '1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.7' +
      '33-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v' +
      '1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.' +
      '373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z',
  },
};

/**
 * The mark for a channel label, or null when there is none.
 *
 * Keyed on the label the footer already builds its channel list from, so a
 * channel added to that list without a mark here degrades to no icon rather
 * than to a wrong one — the same fallback rule the skill marks follow.
 */
export function socialMark(label: string): SocialMark | null {
  return MARKS[label] ?? null;
}
