# Project Context

## Current state

- **Next.js 16.4.5** App Router, **React 19.3**, TypeScript, **Tailwind CSS v4**, Lucide icons.
- Scripts: `dev`, `check` (`next typegen` + `tsc --noEmit` + `eslint .`), `build`, `start`, `lint`, `typecheck`.
- The UI is a four-pane unified inbox matching `C:\Navin\Random\Unified inbox-html`.

## Changes — 2026-11-09

- Replaced the starter landing page with the unified inbox workspace.
- Added the `src/features/inbox` domain:
  - `data.ts` — sample channels, people, messages, suggested replies, banner.
  - `types.ts` — channel/person/message/reaction/attachment types.
  - `inbox-workspace.tsx` — client state, filtering, responsive pane layout, drawer.
  - `components/` — rail, conversation list, thread panel, message card, composer,
    channel sidebar, avatar, channel dot, source badge.
- Mapped the reference palette into CSS variables / Tailwind `@theme` tokens in
  `src/app/globals.css`; switched typography to Inter via `next/font`.
- Added working interactions: channel and rail filtering, `/` search shortcut,
  newest/oldest sort, person threads, reactions, replies, attachments, suggested
  replies, banner View/Ignore, pin toggle, responsive back navigation.
- Removed the starter site header/footer and unused Button primitive.

## Decisions

- The default center pane is the unified "All messages" timeline; selecting a person
  filters the thread to that person. This preserves the reference's multi-channel
  timeline while making the conversation list functional.
- State is local and seeded from sample data. `data.ts` is the swap point for an API.
- Tokens are light-only to match the reference; add a `.dark` scope later if needed.
- Responsive: 4 panes at `xl`, 3 at `md`, single pane + back button below `md`;
  channel sidebar becomes a drawer below `xl`.

## Verification

- `npm run check` — exit 0.
- `npm run build` — exit 0 (static `/` and `/_not-found`).
- Playwright smoke test at 1440×900: columns are 64 / 320 / 784 / 272, no horizontal
  overflow; search, filtering, person threads, sending, reactions, banner, mobile
  back navigation, tablet drawer and Escape close all pass; no console errors.
- Computed colors match the reference tokens (rail `#F4F5F8`, accent `#4F46E5`,
  banner `#312E81`, active channel `#EEF0FF`).

## Remaining / notes

- Placeholder-only actions: message toolbar Tag/More, composer Translate/Bot/Tagify,
  and "Connect channel" (shows a coming-soon hint).
- All content is sample data; no backend or persistence yet.
