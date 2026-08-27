# 🎓 Engineering Syndicate Scholarship — Operation Dashboard

A role-based web dashboard for managing an engineering-scholarship program. Built with **Angular 21** and **Firebase** (Authentication + Firestore).

---

## ✨ What It Does

The dashboard serves two types of users:

| Role | Capabilities |
|------|-------------|
| **Admin / Super Admin** | View statistics, manage instructors & groups, monitor an activity feed, seed initial data |
| **Instructor** | View their own assigned groups, update lecture progress and checklists |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Angular 21 (standalone components, Signals, `@for`/`@if` control flow) |
| Backend | Firebase Authentication + Cloud Firestore |
| Realtime state | RxJS + Angular Signals (`toObservable` bridge) |
| Styling | Tailwind CSS v4, SCSS |
| Icons | Font Awesome 7 |
| Testing | Vitest |
| Build tool | Angular CLI 21 |

---

## 📁 Project Structure

```
src/app/
├── core/
│   ├── guards/              # Route guards: auth, role, redirect-if-authenticated
│   ├── models/              # TypeScript interfaces: AppUser, ScholarshipGroup, ActivityLog, roles
│   └── services/
│       ├── auth.service.ts                    # Login / logout + first-admin bootstrap
│       ├── user-store.service.ts              # Signal-based "who is logged in" state
│       ├── instructor-provisioning.service.ts # Creates instructor Auth account + Firestore doc
│       └── activity-log.service.ts            # Writes audit trail entries
│
├── firebase/
│   ├── firebase.providers.ts          # Angular DI tokens for Auth and Firestore
│   ├── firestore-repository.ts        # Generic CRUD + realtime base class
│   ├── repositories/                  # UsersRepository, GroupsRepository, ActivityLogsRepository
│   └── seed/
│       ├── seed.service.ts            # One-time database bootstrap writer
│       └── data/
│           ├── seed-users.json        # Initial instructor + admin roster
│           └── seed-groups.json       # Initial group roster
│
├── features/
│   ├── auth/login/                    # Login page
│   ├── admin-dashboard/               # Stats cards, user management, groups table, activity feed
│   └── instructor-dashboard/          # Group cards for the signed-in instructor
│
├── layout/shell/                      # Top nav + logout (wraps both dashboards)
├── app.routes.ts                      # Route table + guards
└── app.config.ts                      # Angular providers (Firebase init, router, etc.)

firestore.rules                        # Server-side security rules (real authorization logic)
firestore.indexes.json                 # Composite Firestore indexes
firebase.json                          # Firebase CLI config
```

---

## 🔥 Firestore Data Model

| Collection | Document ID | Purpose |
|------------|-------------|---------|
| `users` | slug or Auth UID | User profile: name, email, role, assigned groups, status |
| `adminEmails` | user's **email** (not UID) | Marker doc — its existence means "this email is an admin" |
| `groups` | group code (e.g. `G195`) | Group data: instructor, progress, checklist, links |
| `activityLogs` | auto-generated | Audit trail — admin-only read, append-only |
| `meta/seedStatus` | fixed | Flag to prevent the seed from running twice |

> **Why `adminEmails` is keyed by email, not UID?**
> Firestore security rules can do `exists(/adminEmails/$(request.auth.token.email))` directly from the auth token — no UID-to-doc-ID join needed. This handles legacy/seeded accounts whose Firestore doc IDs are readable slugs (e.g. `instr-nada-magdy`) rather than Firebase UIDs.

---

## 🚀 Getting Started

### Prerequisites

- Node.js ≥ 18
- npm ≥ 11
- Angular CLI: `npm install -g @angular/cli`
- Firebase CLI: `npm install -g firebase-tools`

---

### Step 1 — Create a Firebase Project

1. Go to [console.firebase.google.com](https://console.firebase.google.com) → **Add project**.
2. Give it any name (e.g. `scholarship-dashboard`), accept the defaults.

---

### Step 2 — Enable Email/Password Sign-in

1. Firebase Console → **Build → Authentication → Get started**.
2. **Sign-in method** tab → **Email/Password** → enable → **Save**.

---

### Step 3 — Create the Firestore Database

1. Firebase Console → **Build → Firestore Database → Create database**.
2. Choose a region close to you, start in **production mode** (the rules file already locks it down).

---

### Step 4 — Connect Firebase to the App

1. Firebase Console → gear icon → **Project settings**.
2. Scroll to **Your apps** → click **`</>`** (Web) → register an app (any nickname).
3. Copy the `firebaseConfig` object shown.
4. Open [`src/environments/environment.ts`](src/environments/environment.ts) and replace the `REPLACE_WITH_...` placeholders with your real values.

---

### Step 5 — Deploy Security Rules and Indexes

```bash
firebase login
firebase use --add        # select the project you just created
firebase deploy --only firestore:rules,firestore:indexes
```

---

### Step 6 — Create the First Super Admin Account

1. Firebase Console → **Authentication → Users → Add user**.
2. Use this exact email: `ateeqi@grant-admin.local`
   _(this email is baked into `seed-users.json` as the `super_admin` record)_
3. Set any password you like — you'll use it to log in.

---

### Step 7 — Install Dependencies and Run

```bash
npm install
ng serve
```

Open [http://localhost:4200](http://localhost:4200) and log in with the credentials from Step 6.

---

### Step 8 — Seed the Database (one-time)

After logging in, you'll see an amber **"Seed Database (one-time)"** button on the admin dashboard.
Click it once — it populates Firestore with the 7 instructors, 34 groups, and all their links/schedules.

> ✅ The button is **idempotent** — clicking it again after the seed is done is safe and does nothing.

---

### Step 9 — Give Instructors Real Logins

Seeded instructors have placeholder emails and **no password** — they cannot log in until you create Firebase Auth accounts for them.

Use the **"Create Instructor"** button in the admin dashboard's **User Management** section. It creates the Firebase Auth account and the Firestore profile in one step with whatever real email/password you provide.

---

## 🔐 Security Model

Authorization is enforced **server-side** via Firestore security rules — client-side role checks are UX only.

| Rule | Who can do it |
|------|--------------|
| Read `users` | Any signed-in user |
| Create/update `users` | Yourself (own doc) or an admin |
| Delete a `users` doc | Admin (instructors only) or super admin (anyone) |
| Read `adminEmails` | Nobody directly — rules use `exists()`/`get()` internally |
| Create `adminEmails` | Yourself (bootstrap escape hatch) or super admin |
| Update/delete `adminEmails` | Super admin only |
| Read/update `groups` | Signed-in instructor (own groups) or admin |
| Create/delete `groups` | Admin only |
| Read `activityLogs` | Admin only |
| Append to `activityLogs` | Any signed-in user |
| Edit/delete `activityLogs` | Nobody (audit trail integrity) |

### Bootstrap Chicken-and-Egg Problem

On a brand-new project, no `adminEmails` doc exists, so `isAdminLevel()` is false for everyone — including the first admin.

The rules solve this with a **"self-email-match" carve-out**: a signed-in user can always create a doc *for their own email*. `SeedService` relies on this: it first writes only the caller's own docs (phase 1, unlocking `isAdminLevel()`), then writes everyone else (phase 2).

> ⚠️ **Trap:** If you manually pre-create docs in the Firebase Console before running the seed, those writes become *updates* instead of *creates* — which have stricter rules and will fail with `Missing or insufficient permissions`. Always let `SeedService` initialize an empty database.

---

## 🧩 How Login Works

```
User submits credentials
  → AuthService.login(email, password)
      → signInWithEmailAndPassword()       ← proves password only
  → onAuthStateChanged fires (separate async chain)
      → reads Firestore profile by email   ← proves the user has a profile doc
      → UserStore.setProfile(profile)
      → UserStore.setAuthReady(true)
  → LoginComponent waits for profile signal (5s timeout)
  → reads role → routes to /admin or /instructor
```

---

## 📋 Available npm Scripts

| Command | Description |
|---------|-------------|
| `npm start` / `ng serve` | Start dev server at `http://localhost:4200` |
| `ng build` | Production build into `dist/` |
| `ng test` | Run unit tests with Vitest |
| `ng build --watch` | Watch mode build |

---

## ⚠️ Known Simplifications

- **"Groups Behind Schedule"** stat uses a `progress < 50%` heuristic — no real course calendar exists in the source data.
- **Progress %** is derived from `currentLecture / 12`, not entered independently.
- **Reassigning a group** to a different instructor updates the group's owner correctly, but does not retroactively clean up the previous instructor's `assignedGroups` array. This is cosmetic staleness only — the authoritative source is the group document's `instructorId`/`instructorEmail` fields.

---

## 📖 Where to Find What

| Question | File |
|----------|------|
| What can each role actually do? | [`firestore.rules`](firestore.rules) |
| How does login decide where to route you? | [`login.ts`](src/app/features/auth/login/login.ts) |
| How does the app know who's signed in? | [`user-store.service.ts`](src/app/core/services/user-store.service.ts) |
| How is the first admin created? | [`auth.service.ts`](src/app/core/services/auth.service.ts), [`seed.service.ts`](src/app/firebase/seed/seed.service.ts) |
| How is a new instructor created? | [`instructor-provisioning.service.ts`](src/app/core/services/instructor-provisioning.service.ts) |
| How does Firestore CRUD/realtime work generically? | [`firestore-repository.ts`](src/app/firebase/firestore-repository.ts) |

---

## 📄 License

Private project — all rights reserved.
