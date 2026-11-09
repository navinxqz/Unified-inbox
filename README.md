# Unified Inbox

One inbox for every conversation. A responsive, four-pane inbox UI built from the
provided design, with working filtering, conversation threads, reactions, replies
and attachments.

Built with **Next.js 16** (App Router), **React 19**, **TypeScript**, **Tailwind CSS v4**
and **Lucide** icons.

## Getting started

```bash
npm install
cp .env.example .env.local   # optional, for local overrides
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Script              | Purpose                                       |
| ------------------- | --------------------------------------------- |
| `npm run dev`       | Start the development server (Turbopack)      |
| `npm run check`     | Validate the project: TypeScript, then ESLint |
| `npm run typecheck` | Type-check without emitting files             |
| `npm run lint`      | Run ESLint across the project                 |
| `npm run build`     | Create an optimized production build          |
| `npm run start`     | Serve the production build                    |

Run `npm run check` before pushing and `npm run build` to verify a production build.

## Project structure

```
.
├─ public/                        # Static assets served from /
├─ src/
│  ├─ app/                        # App Router: layouts, pages, route handlers
│  │  ├─ layout.tsx               # Root layout (Inter, metadata, viewport)
│  │  ├─ page.tsx                 # Inbox route
│  │  ├─ not-found.tsx            # 404 route
│  │  └─ globals.css              # Tailwind entry + design tokens
│  ├─ config/                     # App-wide configuration
│  ├─ features/
│  │  └─ inbox/                   # Inbox domain
│  │     ├─ components/           # Rail, list, thread, composer, channels…
│  │     ├─ data.ts               # Sample channels, people and messages
│  │     ├─ inbox-workspace.tsx   # Client state + four-pane layout
│  │     └─ types.ts              # Domain types
│  └─ lib/                        # Framework-agnostic helpers (cn, utils)
├─ eslint.config.mjs
├─ next.config.ts
└─ tsconfig.json
```

Add new folders only when they earn their place, e.g. `src/features/<feature>/`
for domain code, `src/hooks/` for reusable client hooks, `src/server/` for data access.

## Implemented interactions

- Filter the timeline by channel from the right sidebar (drawer below `xl`).
- Filter people and messages by rail view: All, Priority, Tagify, Ignored, Bots.
- Search people with the `/` shortcut; toggle newest/oldest sorting.
- Open a person's thread, send replies, attach a file, insert suggested replies.
- Toggle reactions on messages and replies.
- Dismiss or act on the "New in Telegram" banner.
- Responsive: four panes on `xl`, three on `md`, single pane with back navigation on mobile.

State is local to the client and seeded from `src/features/inbox/data.ts`, which is the
place to swap in real API data.

## Design tokens

Colors, surfaces and borders live in `src/app/globals.css` as CSS variables and are
exposed through Tailwind's `@theme`. Use tokens by intent (`bg-surface`,
`text-muted-foreground`, `bg-primary-soft`), not raw hex values.

## Environment variables

| Variable              | Description                                  |
| --------------------- | -------------------------------------------- |
| `NEXT_PUBLIC_APP_URL` | Public base URL used for metadata and links. |

Secrets belong in `.env.local` (git-ignored). Only `NEXT_PUBLIC_*` values are
available in the browser.

## Conventions

- Use the `@/*` import alias instead of deep relative paths.
- Keep components server-first; add `"use client"` only where interactivity requires it.
- Keep domain UI inside `src/features/<feature>`; extract shared primitives when a second
  feature needs them.
- Use `cn()` from `src/lib/utils` to compose conditional class names.

## Deploy

The app builds as a standard Next.js project and can be deployed to any Node.js host
or platform that supports Next.js.
