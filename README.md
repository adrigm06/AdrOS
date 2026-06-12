# AdrOS — Interactive Portfolio

> A personal portfolio website designed as a fictional operating system. The experience simulates a desktop environment in the browser with draggable windows, a functional taskbar, and a boot sequence — all built with modern web technologies.

## ✨ Features

- **Boot animation** — Terminal-style startup sequence with progress bar and skip on click/space
- **Desktop environment** — Zoned layout (Android, Full-Stack, AI Tools) with folder icons
- **Draggable windows** — Project viewer with tabs (README, Screenshots, Stack, Links)
- **Profile window** — Avatar, bio, and social links
- **i18n** — Spanish / English toggle with smooth transition
- **List view** — Table view of all projects sorted by date
- **Easter eggs** — Konami code (high contrast theme), `ls` command, midnight clock glitch
- **Fully responsive** — Mobile-first layout with touch support

## 🚀 Quick Start

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # Static output → dist/
npm run preview    # Preview build locally
```

## 🏗️ Stack

| Layer | Technology |
|---|---|
| Framework | Astro 6 |
| Interactive UI | React 19 |
| Animations | Framer Motion |
| Scroll | GSAP + Lenis |
| Styling | TailwindCSS 3 |
| Content | MDX (Astro Content Collections) |
| Fonts | JetBrains Mono + Inter (self-hosted) |

## 📁 Structure

```
src/
├── components/
│   ├── os/           # OS shell (BootScreen, Desktop, Taskbar, Window, FolderIcon...)
│   ├── project/      # Project detail components (README, Gallery, Stack, Links)
│   └── widgets/      # Profile, QuickLinks
├── content/          # MDX project entries (7 projects)
├── data/             # Zone definitions
├── hooks/            # useWindowManager, useDrag, useLanguage, useEasterEggs
├── i18n/             # ES/EN translations
├── layouts/          # BaseLayout with meta tags
├── pages/            # Single page: index.astro
└── styles/           # CSS variables, reset, animations
```

## 📦 Deploy

Builds to a static `dist/` folder. Ready for Vercel, Netlify, or any static host.

```bash
npm run build    # → dist/
```
