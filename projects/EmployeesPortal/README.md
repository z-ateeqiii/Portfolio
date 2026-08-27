# 🎓 Smart Technology — Employee Training Portal

> An internal web platform built for **Smart Technology** employees to access training materials, course documentation, and video tutorials — all in one place.

![Angular](https://img.shields.io/badge/Angular-21-DD0031?style=flat-square&logo=angular&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.x-38BDF8?style=flat-square&logo=tailwindcss&logoColor=white)
![Status](https://img.shields.io/badge/Status-Active-8AC933?style=flat-square)

---

## 📌 Overview

The **ST Employees Guide** is a standalone Angular 21 application serving as an internal onboarding and training portal for Smart Technology staff. It provides a structured, Udemy-style interface for browsing categories, watching YouTube-embedded tutorials, and reading detailed course documentation — all behind a secure login wall.

---

## ✨ Features

- 🔐 **Internal Authentication** — Login with employee credentials; session persisted via LocalStorage
- 🏠 **Home Dashboard** — Overview of all training categories with live stats (videos, docs count)
- 🎬 **Video Player** — YouTube-embedded lessons organized per category
- 📄 **Documentation Pages** — Rich, structured course content with Table of Contents
- 📱 **Responsive Design** — Works on desktop and mobile
- 🌙 **Dark Theme** — Professional dark UI with Smart Technology brand colors (`#1A1A1A` / `#8AC933`)
- ⚡ **Static JSON Data** — No backend required; all content managed via `public/data/categories.json`

---

## 🗂️ Training Categories

| Category | Description |
|----------|-------------|
| 🏢 **Orientation** | Company intro, mission, values, HR policies |
| 🤖 **Robotics Club** | Kids curriculum (Ages 6–8, 9–13, 14–16) across 12+ levels |
| 🎓 **ST Smart (Adults)** | Professional adult courses — see courses below |
| ⚙️ **System (Daftara)** | Internal management system training |
| 👥 **Explain (Mawared HR)** | HR platform — attendance, payroll, employee management |
| 💬 **Feedback System** | How to submit and respond to internal feedback |

### 🎓 ST Smart — Adults Content Courses

| # | Course | Highlight |
|---|--------|-----------|
| 1 | **Arduino** | 5 sessions · 15 hrs · Engineers Syndicate accredited |
| 2 | ⭐ **Robotics With AI** | Best Seller · Arduino + Python + OpenCV + YOLO |
| 3 | **Smart Home IoT** | 10 sessions · 30 hrs · ESP32 + Firebase |
| 4 | **Embedded Systems Diploma** | 30 lectures · AVR + ARM + RTOS |
| 5 | **SOLIDWORKS** | 2 Levels · 30 hrs · 3D Design + Manufacturing |

---

## 🛠️ Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Angular | 21 | Core framework (Standalone Components) |
| TypeScript | 5.9 | Language |
| TailwindCSS | 4.x | Utility-first styling |
| RxJS | 7.8 | Reactive data streams |
| Angular Router | 21 | SPA routing with Auth Guard |
| Angular HttpClient | 21 | Fetching static JSON data |

---

## 📁 Project Structure

```
st-employees-guide/
├── public/
│   ├── data/
│   │   └── categories.json          # All content data (videos + docs)
│   └── SmartTechnolgy (Adults) Content/
│       ├── Arduino.md
│       ├── Robotics With AI.md
│       ├── Smart Home IoT.md
│       ├── Embedded Systems.md
│       └── SOLIDWORKS.md
├── src/
│   └── app/
│       ├── core/
│       │   ├── guards/              # authGuard — protects all routes
│       │   ├── models/              # Category, DocSection, Video interfaces
│       │   └── services/
│       │       ├── data.service.ts  # Loads & caches categories.json
│       │       └── auth.service.ts  # Login / session management
│       ├── features/
│       │   ├── home/                # Dashboard with category cards
│       │   ├── login/               # Auth page
│       │   ├── videos/              # Video player per category
│       │   └── docs/                # Documentation viewer per category
│       └── shared/
│           └── footer/              # Site-wide footer component
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js `>= 18`
- npm `>= 11`
- Angular CLI `>= 21`

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/st-employees-guide.git
cd st-employees-guide

# Install dependencies
npm install
```

### Run Locally

```bash
npm start
# or
ng serve -o
```

Open your browser at **`http://localhost:4200`**

### Build for Production

```bash
ng build
```

Output will be in the `dist/` directory.

---

## 🔑 Login Credentials

> ⚠️ For internal use only. Do not share externally.

```
Email:    emp-tutorial@smart.com
Password: be-z-smart-one
```

---

## 📡 How Content Works

All content is driven by a single static JSON file:

```
public/data/categories.json
```

Each category entry contains:
- `id` — used in the URL (e.g. `/category/st-smart/docs`)
- `title`, `description`, `icon`, `color`
- `videos[]` — list of YouTube-embedded lessons
- `docs[]` — list of documentation sections with `title`, `content`, and optional `links[]`

**To add or update content**, simply edit `categories.json` — no code changes required.

---

## 🌐 Routes

| Path | Description |
|------|-------------|
| `/login` | Public login page |
| `/home` | Main dashboard (protected) |
| `/category/:id/videos` | Video lessons for a category |
| `/category/:id/docs` | Documentation for a category |

---

## 🏢 About Smart Technology

**Smart Technology** is an Egyptian educational technology company specializing in STEM education, robotics training, embedded systems, and professional development programs. Our courses are officially accredited by the **Egyptian Engineers Syndicate**.

---

> Built with ❤️ by the Smart Technology team.
