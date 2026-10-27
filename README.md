# AdrOS — Interactive Portfolio

> A personal portfolio website designed as a fictional operating system. The experience simulates a desktop environment in the browser with draggable windows, a functional taskbar, and a boot sequence — all built with modern web technologies.

## ✨ Features

- **Boot animation** — Terminal-style startup sequence with progress bar and skip on click/space
- **Desktop environment** — Zoned layout (Android, Full-Stack, AI Tools) with folder icons
- **Draggable windows** — Project viewer with tabs (README, Screenshots, Stack, Links)
- **Profile window** — Avatar, bio, and social links
- **Safari bookmarks** — Curated project destinations from MDX, real public GitHub metadata, and external website previews with an explicit external-open fallback
- **Repository browser** — API-backed GitHub-style folders, breadcrumbs, real README previews, pinned snapshots and line-numbered source files within Safari
- **CV shortcut** — English PDF résumé in a separate browser-style window with a download action
- **Mail composer** — Gmail-inspired contact form, copyable recipient, subject, and in-memory draft retention while minimized
- **Terminal app** — Read-only virtual folders, project launching, public GitHub file browsing, filtered projects, guided tour, and recruiter overview
- **i18n** — Spanish / English toggle with smooth transition
- **List view** — Table view of all projects sorted by date
- **Easter eggs** — Konami code (high contrast theme), `ls` command, midnight clock glitch
- **Fully responsive** — Mobile-first layout with touch support

## 🚀 Quick Start

The Mail composer stores contact submissions through the existing Astro action; it does not send Gmail messages. Drafts are not written to localStorage. Safari fetches public GitHub metadata without tokens; network and rate-limit errors offer a direct GitHub link. External sites can prohibit iframe embedding, so an external-open action is always available. Opening the CV does not change Safari's default GitHub home. The versioned PDF in `public/documents/` is the canonical download and checksum fixture for automated checks. Its authoring input, `docs/EN_Adrian_Gomez_AI_Engineer.pdf`, is local-only and is not required by CI; publishing it does not run AdrBOT ingestion.

The CV uses pre-rendered WebP pages instead of relying on browser PDF plugins. After replacing the source PDF, run `python scripts/render-cv.py` with local Poppler (`pdftoppm` on PATH) and Pillow available. The Codex bundled runtime provides both. This regenerates `public/documents/cv/`, updates the checksum/page manifest in `src/data/cv-preview.json`, and copies the original PDF unchanged. Each preview is at most 1200px wide and below 150KB. Unit tests reject a stale checksum or oversized previews. The original PDF remains available for selectable/accessibility text and download; preview images are not a substitute for its text layer.

### Terminal usage

Open Terminal from the dock. Start with `help` or `tour`, then `tour next`, `tour back`, or `tour exit`. `/projects`, `/documents`, and `/about` form a **virtual, read-only** filesystem, never the visitor's computer or a server shell. Commands do not evaluate scripts, shell operators, or repository code. Example commands:

```text
ls /projects
projects AI --zone ai-tools
projects --stack Kotlin
open "Android Engineering Skill"
open androbox --github
repo androbox
ls
cd src
cat README.md
cd /documents
open CV.pdf
hire
contact
```

Use `help <command>` or `<command> --help` for usage. Tab completes commands and paths, quoted paths support spaces, ↑/↓ recall up to 100 commands, Ctrl+L clears output, and Ctrl+C cancels a pending request unless text is selected for copying. The mobile keyboard has a submit button and a visible cancel action. Session state survives minimization but is cleared on closing Terminal; raw commands are never stored in localStorage. The transcript retains at most 200 entries/approximately 200,000 characters.

GitHub exploration is on demand and unauthenticated, only for linked public repositories. Metadata resolves the default branch to a pinned commit/tree, and shallow Git Trees preserve file modes so symlinks and submodules cannot be followed. Text blobs are limited to 128 KiB and displayed as plain text, not executable HTML. Directories display at most 1,000 entries with an explicit limit notice. API responses have a 2 MiB download bound; a bounded 4 MiB/32-entry, five-minute cache deduplicates active requests. Requests time out after 12 seconds, support cancellation, and never retry automatically. Network failures, private/missing repositories, rate limits, malformed data, binary files and oversize files produce explicit errors. No GitHub token is shipped to the browser.

The traversal design follows GitHub's official [Git Trees](https://docs.github.com/en/rest/git/trees#get-a-tree) and [Git Blobs](https://docs.github.com/en/rest/git/blobs#get-a-blob) endpoints rather than following untrusted download URLs. Tree mode checks happen before any blob request.

### GitHub repositories in Safari

The three repository bookmarks open an API-backed, read-only repository browser, not an embedded copy of github.com. GitHub prohibits framing its original pages. The profile remains Safari's homepage; Avisia and Keyout retain their website destinations. Repository views show actual public metadata, directory-first file rows, breadcrumbs, a pinned default-branch commit and the real README from the current directory. File navigation participates in Safari Back/Forward history and survives minimization. Refresh clears the repository cache and reloads the current snapshot safely.

Text files offer a line-numbered source view and pinned raw/original GitHub links. Markdown offers a restricted React preview (headings, paragraphs, emphasis, links, lists, quotes, fenced code and tables), with a source toggle. Raw HTML is never executed: wrappers lose their tags while readable text and safe links remain. Images and badges are link-only fallbacks, with no automatic remote image requests. Relative paths stay within the repository; local heading anchors work within the current preview. Unsupported Markdown remains readable text rather than requiring an untrusted compiler. The shared terminal transport enforces the same cancellation, cache, response/file limits and symlink/submodule restrictions; no recursive crawl, credentials, repository writes or HTML proxy is used.

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

## Continuous integration

Every push and pull request runs three independent GitHub Actions jobs. Any failed
check fails CI. Permissions are read-only; newer runs cancel older runs for the
same branch/event or pull request. Actions are pinned to verified commit SHAs.

| Check | Purpose |
|---|---|
| `npm ci` with npm cache | Reproduce the committed lockfile without committing `node_modules`. |
| `npm run lint` | Catch non-style correctness issues in Astro, TypeScript, React and scripts. |
| `npm run type-check:ci` | Run `astro check` without reading local environment files. |
| `npm run type-check:scripts` | Check ingestion and Node tests, excluded by the app's tsconfig. |
| `npm test` | Run deterministic Vitest ingestion and embedding-schema contract tests. |
| `npm run build:ci` | Compile the actual Astro/Vercel production build without application secrets. |
| Deno check/test | Check the complete Edge Function and test chat validation/prompt assembly. |
| Gitleaks | Scan all fetched Git history; redact findings and fail if a secret is found. |

### Run locally

Use Node **24** (see `.nvmrc`; compatible with the project's `>=22.12.0` engine).
Install [Deno 2.9.8](https://github.com/denoland/deno/releases/tag/v2.9.8) from its
official release or installer. Deno is separate from Node because Supabase Edge
Functions run in Deno. No global npm package installation is required.

```sh
npm ci
npm run lint
npm run type-check:ci
npm run type-check:scripts
npm test
npm run build:ci
cd supabase/functions
deno task check
deno task test
```

`type-check:ci` and `build:ci` use a small launcher that forwards only host runtime
settings, sets `ASTRO_CI=1`, disables Astro/Vite `.env` loading (`envDir: false`),
and supplies fake loopback Supabase settings. The fake values only allow module
initialization; no service is called. Using `--mode ci` alone would still load
the base `.env`. Normal `dev`, `build` and `type-check` behavior is unchanged.
Vitest also disables `.env` loading. Do not deploy the CI build artifact: it
intentionally contains placeholder public configuration.

Tests never execute ingestion, query Supabase or call Gemini/Groq. The PDF parser
is stubbed. Deno tests grant no network, environment, filesystem or subprocess
permissions. Dependency downloads during setup/check are not model API calls.

### Contracts and safe schema rollout

- MDX chunks retain bilingual metadata and content. PDF sections are trimmed,
  discarded at **60 characters or less**, and sanitized as before. **There is no
  800-character cap today**: tests preserve sections above that size rather than
  silently changing ingestion behavior.
- Chat accepts only `user`/`assistant` history with non-empty string content.
  Current and historical messages have a **4000-character inclusive limit**;
  invalid bodies return HTTP 400 before secrets or APIs are accessed. Valid text,
  the system prompt, language detection, context order and last-six history stay
  unchanged. Gemini key prefixes are never logged.
- The embedding test compares both actual producers with the effective table
  **and** RPC declarations across ordered migrations. It reproduces the old
  **768 versus 384** failure and catches table-only/RPC-only fixes.
- The new migration changes the column, cosine index and RPC declaration to
  768. It takes an exclusive lock and **aborts transactionally if incompatible
  non-null vectors exist**. It never deletes, pads or truncates vectors. Review
  a backup and plan an explicitly authorized re-embedding/data migration first
  if that guard triggers; vectors from different embedding models are not
  interchangeable. Creating this file does not apply it anywhere. CI does not
  deploy, migrate, ingest or prove the current remote database schema.

ESLint plus its TypeScript/Astro adapters catch errors a compiler does not;
`globals` supplies browser/Node names. Vitest provides deterministic module mocks
for the existing TypeScript/PDF dependencies; `@types/pdf-parse` lets scripts be
checked without `any`. These are development-only dependencies, pinned in the
manifest and lockfile. Deno uses its native test runner and a frozen lockfile,
avoiding a second testing framework there.

Optional follow-ups (not enabled): Dependabot for dependency PRs and a separately
approved manual RAG evaluation workflow. Paid-provider evaluation must never run
on every push. Making these checks required before merging is a separate GitHub
branch-protection/ruleset setting; a failed workflow alone does not forbid a merge.
