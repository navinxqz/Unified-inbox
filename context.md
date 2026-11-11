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

## Changes — 2026-11-10 (Restored 4-Pane Unified Inbox Layout)

- **Restored Exact 4-Pane Architecture**:
  1. **1st Part (Far Left)**: Icon navigation rail ([app-rail.tsx](file:///c:/Navin/unified-inbox/src/features/inbox/components/app-rail.tsx)) for All messages, Priority, Tagify, Ignored, and Bots.
  2. **2nd Part (Left Center)**: Conversation list ([conversation-list.tsx](file:///c:/Navin/unified-inbox/src/features/inbox/components/conversation-list.tsx)) with avatars, live channel badges, message previews, unread stars, search shortcut (`/`), and newest/oldest sort.
  3. **3rd Part (Main Center)**: Chat thread panel ([thread-panel.tsx](file:///c:/Navin/unified-inbox/src/features/inbox/components/thread-panel.tsx)) with full message stream, suggested replies, pinned state, banner, reply quotes, reactions, hover highlights, and composer.
  4. **4th Part (Right Side)**: Connected channels sidebar ([channel-sidebar.tsx](file:///c:/Navin/unified-inbox/src/features/inbox/components/channel-sidebar.tsx)) with clean brand icons (Slack, WhatsApp, Email, Messenger, Telegram), draggable priority ordering, and channel message counts.
- **Removed Unwanted Priority Tag Boxes & Generic Names**:
  - Completely removed the bulky `P1`, `P2` priority tags that cluttered the channel items.
  - Removed "Acme Customer Operations" placeholder naming and restored "Unified Inbox".
- **User Details Moved to Dedicated Interactive Modal** ([user-details-modal.tsx](file:///c:/Navin/unified-inbox/src/features/inbox/components/user-details-modal.tsx)):
  - Clicking on the user in the chat header opens the comprehensive Customer Details Modal with company info, contact phone/email, SLA status, ticket triage controls, and internal notes without disrupting the 4-pane layout.
- **Rich Composer Features Retained**:
  - File attachment picker with clear button.
  - Categorized emoji popover picker.
  - Translate dropdown with target language selection.
  - Tagify popover with custom tag addition.
  - Modern quoted reply banner (`Replying to...`) and hover-highlighting across replies.
- **Settings & Webhook Tools via Quick Access (`⌘K` / `Ctrl+K`)**:
  - Accessible via command palette without cluttering the main 4-pane inbox view.

## Verification

- `npm run check` — exit 0 (TypeScript + ESLint).
- `npm run build` — exit 0 (compiled and prerendered static build in 1.9s).

## Repository — 2026-11-09

- Initialized git on `main` and connected the remote
  `https://github.com/navinxqz/Unified-inbox.git`.
- `.gitignore` covers dependencies, `.next`, build outputs, env files (with
  `.env.example` kept), logs, TypeScript build info and editor/OS files.
  `rules.md` and `context.md` are explicitly kept tracked.
- Pushed the initial project commit; remote already had a LICENSE commit, so the
  local branch was rebased onto `origin/main` before pushing.

## Changes — 2026-11-11 (AiPraktor feature parity)

- **Shell**: replaced the 44px icon `AppRail` (deleted) with a labeled, grouped
  sidebar (`primary-nav.tsx`: Work / Grow / AI / Set up) carrying live badges for
  inbox, notifications, and setup progress, plus a realtime "Live · synced" pill.
  Modules switch by state + hash deep-link (`#orders`, `#agent-desk`, …) so the app
  stays a single page; the mobile drawer reuses the same nav.
- **Conversation model** (AI ⟷ human state machine): `mode` = `ai | human |
  reverting` with `handoff.reason`, `revertAtMs`, `claimedBy`, `waitingSinceMs`.
  Handoff from the thread header (5 reasons), claim, `.`-shortcut takeover, return
  to AI, and a 5-second sweeper that auto-reverts unanswered human chats and logs
  it to Activity. Answering from the inbox implicitly takes the chat to human.
- **Inbox UX**: rail views moved into the conversation list as tabs; waiting
  customers sort first with a live SLA badge; per-row AI/human dots; slash (`/`)
  saved-reply autocomplete in the composer; AI copilot drawer with summary,
  intent detection, saved-reply suggestions, insert-into-composer, and capture
  lead / draft order actions.
- **23 modules** behind the nav, all persisted in `localStorage`: overview, inbox,
  saved replies, comments (classification queue + moderation rules/blocklist),
  notifications, activity, analytics, leads (drag-and-drop pipeline), orders +
  coupons, follow-ups, broadcasts, products, posts + moderation, Agent Desk,
  knowledge base, setup guide (practice → live), channels, website chat, business,
  team, groups, billing (card + bKash/Nagad top-up), settings.
- **Channels**: provider + health surfaced in `channels-manager.tsx`; new
  `channel-connect-dialog.tsx` simulates a second-account OAuth connect and
  updates counts/handles; `channel-sidebar.tsx` now navigates to the module.
- **Settings**: new AI & handoff section — auto-revert window (30–1440m), SLA target
  (5–60m), wait-before-answer batching (0–15s).
- **Command palette** (`⌘K`) now jumps to every module and channel filter.
- **Types/data/storage**: extended `ChannelId` (Instagram, Discord, Gmail, website)
  and added all module domain types; `_v3` storage keys with default-merged
  settings; generic `useStoredState` + `MODULE_STORAGE_KEYS` for module slices.
- **Shared UI**: `module-ui.tsx` (ModuleShell, Walkthrough dialog, tabs, cards,
  stats, ModeBadge, SlaBadge, Toggle, Field, DataBar, EmptyState, SavedFlash) and
  `use-now.ts` (SSR-safe shared clock via `useSyncExternalStore`).

## Verification — 2026-11-11

- `npm run check` — exit 0 (typegen + tsc + eslint, no warnings).
- `npm run build` — exit 0 (static `/` and `/_not-found`).
- Playwright smoke (Edge, `next start`): all 23 modules render without errors;
  billing top-up modal adds credits + ledger row and persists; handoff → claim →
  return-to-AI and `.` takeover behave correctly with a live countdown; sweeper
  clears expired human chats; `/` saved-reply insert, copilot insert, slash
  autocomplete, channel connect dialog, mobile nav drawer, and 390px layout all
  pass; `console error` reports 0 errors.
- Note: `docs/aipraktor-competitor-analysis.md`, `docs/aipraktor-evidence/`, the two
  reference PNGs, and `.playwright-cli/` remain untracked; `.env.example` and
  `rules.md` are pre-existing user edits.
