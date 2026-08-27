# Nuttela Café — Digital Menu · كافيه نوتيلا

A bilingual (English / Arabic, LTR + RTL) digital menu web app for **Nuttela Café**, built with **Angular 19** using standalone components, signals, and lazy-loaded routes.

The whole menu is data-driven: a single JSON file describes every category, item, and price — no backend, no database, and no code change needed to update a price.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [How It Works](#how-it-works)
- [The Menu Data Model](#the-menu-data-model)
- [Editing the Menu](#editing-the-menu)
- [Design System](#design-system)
- [Building & Deploying](#building--deploying)
- [Notes & Gotchas](#notes--gotchas)

---

## Features

| Feature | Description |
|---|---|
| **Bilingual EN / AR** | One-tap language toggle. Sets `lang` + `dir` on `<html>`, persisted in `localStorage`. |
| **Full RTL support** | Layout, typography, and per-component RTL overrides. Arabic uses the *Cairo* font, English uses *Plus Jakarta Sans*. |
| **16 categories · 221 items** | Crepes, pancakes, waffles, hot & cold drinks, frappé, ice coffee, cocktails, milkshakes, ice cream, smoothies, desserts. |
| **Live search** | Debounced (300 ms) search across EN and AR titles, shown in a full-screen results overlay that deep-links into each item's category. |
| **Item detail modal** | Bottom-sheet style modal with focus management, body-scroll lock, Escape-to-close, and focus restore on exit. |
| **Variant pricing** | An item carries either a single `price` or several `variants` (e.g. Medium / Large); cards show the "starting from" price. |
| **Availability states** | `isAvailable: false` items render in a separate, non-clickable "unavailable" section instead of disappearing. |
| **Popular badges** | `isPopular: true` items get a highlight badge. |
| **Motion & polish** | View transitions between routes, staggered card entrances, 3D tilt-on-hover category cards, ambient blurred orbs, shimmering gradient headline. |
| **Mobile-first** | Responsive 1 → 2 → 3 → 4 column grid, safe-area insets, PWA-ish meta tags, `100dvh` layout. |
| **Accessible** | Semantic landmarks, ARIA labels on interactive elements, screen-reader-only labels, `role="dialog"` + `aria-modal` on overlays. |

---

## Tech Stack

- **Angular 19.2** — standalone components only (no `NgModule` anywhere)
- **Signals** — all state is signal-based (`signal`, `computed`, `toSignal`, `input()`, `output()`)
- **`ChangeDetectionStrategy.OnPush`** on every component
- **Angular Router** — lazy `loadComponent` routes, `withComponentInputBinding()`, `withViewTransitions()`
- **`HttpClient`** with `withFetch()` to load the menu JSON
- **RxJS 7.8** — used only for search debouncing and `shareReplay` on the menu request
- **Plain CSS** — a hand-rolled token-based design system in `src/styles.css`; component styles live inline in each `@Component`
- **TypeScript 5.7**, **Karma + Jasmine** (configured; no specs written yet)

No UI library, no CSS framework, no state-management library.

---

## Getting Started

```bash
# install
npm install

# dev server → http://localhost:4200/
npm start          # (= ng serve)

# production build → dist/nuttela-menu/
npm run build

# rebuild on change (development configuration)
npm run watch

# unit tests (Karma)
npm test
```

Requires Node 18.19+ / 20+ (Angular 19 requirement).

---

## Project Structure

```
src/
├─ index.html                     # meta, OG tags, font preconnect/preload
├─ main.ts                        # bootstrapApplication(AppComponent, appConfig)
├─ styles.css                     # design tokens + global/utility styles
└─ app/
   ├─ app.component.ts            # <router-outlet /> shell; boots the two root services
   ├─ app.config.ts               # router + http providers
   ├─ app.routes.ts               # '' → home, 'category/:id', '**' → 404
   │
   ├─ core/
   │  ├─ models/menu.model.ts     # MenuData / MenuCategory / MenuItem / MenuVariant + helpers
   │  └─ services/
   │     ├─ menu.service.ts       # loads menu.json, exposes signals, search
   │     └─ language.service.ts   # EN/AR signal, <html lang|dir>, localStorage
   │
   ├─ layout/
   │  └─ main-layout/             # fixed glass header (brand + search + lang), footer, outlet
   │
   ├─ features/
   │  ├─ home/                    # hero + stats + category grid
   │  ├─ category/                # sticky sub-header, item grid, modal host
   │  └─ not-found/               # 404
   │
   └─ shared/components/
      ├─ category-card/           # tilt-on-hover card, per-category gradient fallback
      ├─ item-card/               # thumbnail (or initial) fallback, price, badges
      ├─ item-modal/              # detail sheet with variant price list
      ├─ search-bar/              # debounced input (+ search-results-overlay.component.ts)
      ├─ lang-toggle/             # EN · ع pill
      └─ loader/                  # loading state

public/                           # copied to the site root at build time
├─ favicon.ico
└─ assets/
   ├─ logo.jpg
   ├─ data/menu.json              # ← the live menu the app fetches
   └─ images/categories/*.png     # category cover images
```

---

## How It Works

**Bootstrap.** [main.ts](src/main.ts) bootstraps `AppComponent`, whose only job is to render `<router-outlet />` and to `inject()` `LanguageService` and `MenuService` so both are instantiated at startup.

**Loading the menu.** [MenuService](src/app/core/services/menu.service.ts) issues a single `GET /assets/data/menu.json`, pipes it through `shareReplay(1)` (so it is fetched once) and `catchError(() => EMPTY)`, then converts it to a signal with `toSignal(..., { initialValue: null })`. Everything downstream — `categories()`, `restaurantName()`, `currency()` — is a `computed` off that one signal. While it is still `null`, the home and category pages render `<app-loader />`.

**Routing.** Every route lazy-loads its component. `MainLayoutComponent` is the parent route and owns the header, search overlay, and footer; `home` and `category/:id` render inside its `<router-outlet />`. Because of `withComponentInputBinding()`, `CategoryComponent` receives the route param straight as `readonly id = input<string>('')` — no `ActivatedRoute` subscription. `withViewTransitions()` adds cross-route animation where the browser supports it.

**Category page.** Parses `id()` to a number, resolves the category via `MenuService.getCategoryById()`, then splits its items into `availableItems()` and `unavailableItems()` computeds. Clicking an available card sets `selectedItem`, which renders `<app-item-modal>`. The page title is set imperatively in `ngOnInit` using the current language.

**Language.** [LanguageService](src/app/core/services/language.service.ts) holds a `signal<'en' | 'ar'>` initialised from `localStorage`. An `effect()` mirrors every change onto `document.documentElement` (`lang`, `dir`) and back into `localStorage`. Components read `langService.currentLang()` inline in templates to choose between `titleEn`/`titleAr`, `nameEn`/`nameAr`, and hard-coded UI strings — there is **no i18n library and no translation file**; copy is inlined at each usage site.

**Search.** `SearchBarComponent` pushes keystrokes into a `Subject` filtered by `debounceTime(300)` + `distinctUntilChanged()`, then emits upward. `MainLayoutComponent` stores the query in a signal; a non-empty query renders `SearchResultsOverlayComponent`, which calls `MenuService.searchItems()` — a case-insensitive substring match on `titleEn` plus a raw substring match on `titleAr` — and lists every hit alongside its parent category.

---

## The Menu Data Model

Defined in [menu.model.ts](src/app/core/models/menu.model.ts):

```ts
interface MenuData {
  restaurantName: string;
  currency: string;              // "EGP"
  categories: MenuCategory[];
}

interface MenuCategory {
  id: number;                    // used in the /category/:id route
  nameEn: string;
  nameAr: string;
  icon: string;                  // emoji
  coverImage?: string;           // 'assets/images/categories/....png'
  items: MenuItem[];
}

interface MenuItem {
  id: number;
  titleEn: string;
  titleAr: string;
  image?: string;                // falls back to a gradient tile + first letter
  description?: string;
  isPopular: boolean;
  isAvailable: boolean;
  price?: number;                // ─┐ exactly one of these two
  variants?: MenuVariant[];      // ─┘
}

interface MenuVariant {
  label: string;                 // "Medium"
  labelAr?: string;              // "وسط"
  price: number;
}
```

Two helpers ship with the model:

- `getStartingPrice(item)` — returns `price`, or the lowest variant price, or `0`.
- `hasVariants(item)` — type guard narrowing to an item with a non-empty `variants` array.

---

## Editing the Menu

**Edit [public/assets/data/menu.json](public/assets/data/menu.json).** That is the file the running app fetches. No component changes are needed — with the dev server running, save and reload.

Conventions used by the existing data:

- Category `id`s run `1…16`; item `id`s follow `<categoryId>NN` (Hot Drinks is category `6`, so its items are `601`, `602`, …). Keep item `id`s unique app-wide — grids, search results, and the modal all key off them.
- Give an item **either** `price` **or** `variants`, never both.
- `coverImage` paths are relative to the site root (`assets/images/categories/...`) and must match a file in `public/assets/images/categories/`. Some filenames contain spaces or typos (`Hot Drinks.png`, `ice coffe.png`) — copy them exactly.
- Set `isAvailable: false` to move an item into the greyed-out, unclickable "unavailable" block instead of deleting it.

---

## Design System

All tokens live at the top of [styles.css](src/styles.css) as CSS custom properties. The app is **dark-only by design** — a warm, near-black "luxury café" palette:

| Group | Examples |
|---|---|
| Surfaces | `--bg-primary: #090909`, `--surface-card: #181818`, `--surface-glass`, `--surface-modal` |
| Accents | `--color-accent: #B48766` (warm taupe), `--color-secondary: #CFA15D`, `--color-gold: #D8B15B`, `--color-amber: #E5C46A`, `--color-success: #7AA874` |
| Text | `--text-primary: #F7F5F2`, `--text-secondary`, `--text-muted`, `--text-gold` |
| Borders | `--border-subtle` … `--border-gold` |
| Spacing | `--space-1: 4px` → `--space-24: 96px` (4 px base) |
| Radius | `--radius-sm: 8px` → `--radius-2xl: 32px`, `--radius-full` |
| Shadows | `--shadow-card`, `--shadow-luxury`, `--shadow-hover`, `--shadow-glow`, `--shadow-modal`, `--shadow-float` |
| Motion | `--transition-fast` / `-base` / `-smooth` / `-spring` |
| Fonts | `--font-en` (Plus Jakarta Sans), `--font-ar` (Cairo), from Google Fonts |

[CategoryCardComponent](src/app/shared/components/category-card/category-card.component.ts) additionally holds a local `CATEGORY_GRADIENTS` array and picks a pair by `category.id % length`, so each category gets a stable gradient and glow even with no cover image.

Component-specific CSS is written inline in each component's `styles: []` — keep it there rather than growing `styles.css`. Mind the production budget: **8 kB max per component stylesheet**.

---

## Building & Deploying

```bash
npm run build          # defaults to the production configuration
```

Output lands in `dist/nuttela-menu/browser/` — a plain static bundle (hashed filenames, no SSR). Deploy that folder to any static host (Vercel, Netlify, GitHub Pages, nginx…).

Two deployment requirements:

1. **SPA fallback.** The router owns `/category/:id`, so the host must rewrite unknown paths to `index.html`; otherwise a direct link or a refresh 404s.
2. **`assets/` must be served from the root**, because `MenuService` requests the absolute path `/assets/data/menu.json`. To deploy under a sub-path, update `<base href>` in [index.html](src/index.html) *and* that URL in [menu.service.ts](src/app/core/services/menu.service.ts).

Production budgets are set in [angular.json](angular.json): 500 kB warn / 1 MB error for the initial bundle, 4 kB / 8 kB per component stylesheet.

---

## Notes & Gotchas

- **`src/assets/` is dead weight.** [angular.json](angular.json) copies assets only from `public/`, so the duplicate `menu.json` and category images under `src/assets/` are neither bundled nor served. The two `menu.json` files are currently identical — edit only the `src/` copy and nothing changes in the app.
- **No translation files.** Every UI string is a ternary on `langService.currentLang()` inside a template. Adding a third language means introducing real i18n, not adding a file.
- **Arabic search is exact-substring** (`item.titleAr.includes(query)`), with no normalisation of alef/hamza/taa-marbuta variants or diacritics, so close-but-not-exact Arabic spellings will not match.
- **`localStorage` and `document` are touched directly** in `LanguageService` (constructor and field initialiser). Fine for this browser-only build, but it would need guarding if SSR or prerendering were ever enabled. (`dist/` still contains a stale `prerendered-routes.json` from an earlier experiment; there is no server target in `angular.json` today.)
- **No tests yet.** Karma/Jasmine are wired up and the schematics are configured with `skipTests: true`, so the repo contains no `.spec.ts` files.
- **`dist/` is gitignored** but a build output exists locally — do not commit it.

---

## Credits

Built by **[Muhammed Al-Ateeqi](https://ateeqi.vercel.app/)** · Menu content © Nuttela Café · All prices in EGP.
