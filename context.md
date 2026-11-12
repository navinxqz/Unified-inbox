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
  inbox, notifications, and setup progress.
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

## Changes — 2026-11-12

- **Hydration-safe persistence**: `storage.ts` now reads `localStorage` through a
  cached, subscribable snapshot store (`useSyncExternalStore`), with the seed data
  as the server snapshot. Server markup and the first client render match; stored
  state (notifications count, collapsed sidebar, module slices) applies right
  after hydration. Setters write through immediately, so the workspace no longer
  mirrors six domains with save effects. Cross-tab `storage` events invalidate the
  cache. Typed hooks (`useStoredChannels/People/Messages/Settings/ApiKeys/
  WebhookEvents`) replace the workspace's `useState(loadStored*)` blocks.
- **Collapsible sidebar**: `PrimaryNav` gains `collapsed` + `onToggleCollapsed`;
  desktop remembers 236px ↔ 68px in `unified_inbox_nav_collapsed_v1`. The toggle
  lives at the **top** and reveals on sidebar hover only: expanded shows a
  `PanelLeftClose` ghost button at the header's right edge; collapsed fades the
  logo out and fades in a `PanelLeftOpen` button in the same top slot. It also
  reveals on keyboard focus, carries an instant tooltip, and sits at y≈16–20 in
  both states. Collapsed mode keeps icon-only items with instant hover/focus
  tooltips (custom `role=tooltip`, not native `title`), count bubbles, group
  dividers, a live dot and quick actions. The mobile drawer always renders
  expanded (no toggle).
- **Footer utility dock**: realtime status now lives at the bottom with the other
  utilities instead of the top — `Live`/`Practice mode` plus `synced Ns ago` in
  expanded mode, a dot with a tooltip in collapsed mode, with `whitespace-nowrap`
  and a fixed `2ch` digit slot so 9s → 10s never reflows.
- **Nav scope for now**: `hiddenModules` in `data.ts` (`leads`, `orders`,
  `followups`, `products`) filters the sidebar and `⌘K` jumps; the Setup guide
  step shows a disabled “Soon”, and Overview hides “Add product”. All module code
  and types stay in place; direct `#hash` links still render them.
- **Conversation list redesign**: uniform three-line rows (name/time, preview +
  unread count, mode + compact SLA), AI/human/reverting labels, priority star only
  when set, active-row accent, channel summary under the title, and a calmer
  sort bar (Waiting toggle + Newest/Oldest).
- **Thread header**: title area is `min-w-0 flex-1`; copilot, pin, and channels
  actions live in a right-aligned `shrink-0` group on every breakpoint.
- **Brand marks**: Messenger now uses the official Simple Icons glyph.
- **Bilingual localization**: `i18n.tsx` adds an SSR/hydration-safe bilingual
  English / বাংলা localization engine with dynamic variable interpolation and
  stored language preference.
- **Site analysis & workflow specification**: added
  `docs/unified-inbox-site-analysis-and-workflow.md` documenting the complete
  production architecture, 23 application modules, 5 core implicit state machines
  (AI ⟷ Human handoff and auto-revert sweeper, SLA waiting queue, Order
  fulfillment, Lead pipeline, Practice ↔ Live mode), end-to-end operational
  workflows, and UX/DX/AX triad evaluation per Rule 11.

## Verification — 2026-11-12 (Specification & i18n)

- `npm run check` (`next typegen && tsc --noEmit && eslint .`) — exit 0 (zero errors, zero warnings).

## Changes — 2026-11-12 (Language Switcher & Chat Composer Alignment)

- **Language change UI**: added an interactive English ↔ বাংলা switcher to `PrimaryNav`
  footer utility dock (segmented `EN` / `বাংলা` pill in expanded view, `Languages` icon
  with instant tooltip in collapsed view). Hooked up `useI18n()` across `PrimaryNav`,
  `ConversationList`, and `Composer` for real-time localization.
- **Chat box alignment & message list responsiveness**:
  - Dynamically shrink the conversation list from 320px to `lg:w-[260px] xl:w-[275px]`
    when the primary sidebar is maximized, returning 45–60px of breathing room to the chat box.
  - Re-architected the composer action bar to `flex justify-between gap-1` with tools
    in an auto-scrolling container and the Send button locked as `shrink-0` on the same
    line, eliminating the layout break where the Send button wrapped below options.

## Changes — 2026-11-12 (Comprehensive Bangla Localization & UX Refinements)

- **Comprehensive Bangla localization across entire workspace**:
  - **Walkthroughs & Onboarding ("Watch how · 1 min")**: All 20 modules' walkthrough dialogs, headers, titles, 60+ individual instruction steps, and "Got it" buttons are translated into Bangla with exact dictionary matching and zero missing keys.
  - **Thread Panel & Timeline**: Localized banner action buttons (`View` / `Ignore`), "Today" timeline separator, empty state message, customer info trigger, handoff badges, and countdown indicators.
  - **Message Cards**: Localized `Translated:` indicator, reaction pill triggers, and hover action tooltips (`React`, `Reply`, `Tag`, `More`).
  - **Channel Sidebar**: Localized headers, `All channels` filter, reorder instructions, `Connect channel` CTA, and connection status count.
  - **Customer CRM Sidebar & User Details Modal**: Fully translated ticket triage controls (`Status`: Open / Pending / Resolved, `Priority`: Low / Medium / High / Urgent, `Assignee`), Account Tier & SLA telemetry, and team notes input.
  - **AI Copilot Drawer**: Localized header, intent classification badges (Product question, Delivery, Payment, Order tracking, After-sales, General enquiry), summary cards, suggested replies, and inline next actions.
  - **Command Palette (`⌘K`)**: Localized search placeholder, category headers (`Navigation`, `Channel`), quick module jumps, channel filters, and empty state.
  - **Overview Module**: Localized practice mode onboarding banner, responsive stat cards, longest waiting queue, needs attention queue, channel health indicators, and quick action shortcuts.
  - **Shared Module UI Primitives**: Added automatic `t()` translation bindings inside `Field` (label & hint), `Toggle` (accessible labels), and `DataBar` (segment labels).
- **Language Switcher & Chat Composer Alignment**:
  - Segmented `EN` / `বাংলা` toggle pill in the primary navigation dock (expanded) and `Languages` tooltip button (collapsed).
  - Responsive conversation list width (`lg:w-[260px] xl:w-[275px]` when navigation is expanded) + `flex-nowrap` composer toolbar with `shrink-0` Send button, completely preventing Send button wrapping.

## Verification — 2026-11-12 (Deep Localization & Layout)

- `npm run check` (`next typegen && tsc --noEmit && eslint .`) — exit 0 (zero errors, zero warnings).


## Verification — 2026-11-12

- `node node_modules/next/dist/bin/next typegen && tsc --noEmit && eslint .` — exit 0.
- `next build` — exit 0 (static `/` and `/_not-found`).
- Playwright (Edge, production build): seeded a 7-item notifications list in
  `localStorage` and reloaded — badge renders 7 with 0 console errors (hydration
  fixed); sidebar collapse → 68px, persists across reload, 19 items carry
  `aria-label`s and Inbox/Notifications show bubbles; the top toggle is hidden at
  rest (opacity 0) and reveals on sidebar hover in both states — expanded header
  button at y=20 on the right, collapsed logo-slot button at y=16 — restores
  236px, clears its tooltip on toggle, and also reveals on keyboard Tab with a
  focus ring; icon hover shows an instant tooltip (`Inbox 9`,
  `Practice mode · synced 5s ago`, `Quick actions (⌘K)`), tooltips stay inside
  the viewport; status reads `synced 2s ago` at the footer, not the top; live row
  width stays stable across 10s → 2s (no reflow); conversation rows are 84–88px
  tall with no horizontal overflow; mobile drawer 236px expanded with no toggle
  and body width 390px; thread header actions end 16px from the right edge on mobile and
  24px on desktop; Nav shows no Leads/Orders/Follow-ups/Products, Setup shows one
  disabled “Soon”, Overview has no “Add product”; console errors 0.
