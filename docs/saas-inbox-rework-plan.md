# SaaS Unified Inbox Rework Specification & Execution Plan

## 1. Overview & Objectives
Transform the demo inbox into an enterprise-grade, fully functional **Front / Linear style SaaS operations platform**:
- **Design Paradigm**: Dense, clean split-pane layout without bulky card-type containers; flush dividers, high information density, subtle hover indicators, clean typography.
- **Data Persistence**: JSON-backed local storage / state engine with pre-seeded rich multi-channel conversations and complete synchronization for settings, channel configs, webhook URLs, and API keys.
- **Key Modules**:
  1. **Omnichannel Linear/Front Style Workspace**:
     - Dense conversation row list with status pills (Open, Pending, Resolved), assignee, priority, unread counts, and channel brand icons.
     - Continuous, clean message stream (no card bubbles; compact avatar + inline name + timestamp + inline body + modern quoted replies).
     - Customer CRM right panel (Contact info, Company, Plan tier, Past tickets, notes).
     - Global Command palette (`Cmd+K` / `Ctrl+K`) for quick navigation, search, and action execution.
  2. **Channel Connections & Webhook / API Keys Hub**:
     - Real management interface for Slack, WhatsApp Cloud API, Email (IMAP/SMTP/SendGrid), Messenger, Telegram.
     - Live webhook simulator / tester to simulate inbound events.
     - API Key generation & management (create, revoke, copy).
  3. **Comprehensive Settings & Workspace Customization Dashboard**:
     - **General**: Workspace name, slug, timezone, company logo.
     - **Channel Priority & Ordering**: Drag-to-reorder channel routing priorities.
     - **Appearance & Theme**: Light / Dark / System themes, accent color selection, dense vs relaxed mode.
     - **Notification Preferences**: Sound, desktop push, email digest, channel-specific alerts.
     - **Tags & Taxonomies**: Create, edit, color-code custom tags (`#urgent`, `#billing`, `#enterprise`).
     - **AI & Copilot Settings**: Auto-translation toggle, default target language, smart reply suggestions toggle, sentiment analysis.
     - **Quick Replies & Templates**: Canned responses with dynamic macros (`{name}`, `{company}`).

## 2. File Architecture
```
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── features/
│   ├── inbox/
│   │   ├── types.ts                   # Extended SaaS types (Tickets, CRM, Settings, Channels, Webhooks)
│   │   ├── data.ts                    # Initial comprehensive JSON seed data
│   │   ├── storage.ts                 # JSON/LocalStorage sync engine
│   │   ├── components/
│   │   │   ├── workspace-layout.tsx   # Top navigation & module switcher (Inbox, Channels, Settings, Analytics)
│   │   │   ├── stream-thread.tsx      # Clean Linear-style continuous message thread (no cards)
│   │   │   ├── row-conversation-list.tsx # Dense table-row conversation list
│   │   │   ├── customer-context-sidebar.tsx # Right-side CRM customer telemetry
│   │   │   ├── composer.tsx           # Advanced composer with Attach, Emoji, Translate, Tagify, Reply Quote
│   │   │   ├── channel-icon.tsx       # Crisp brand icons (Slack, WhatsApp, Email, Telegram, Messenger)
│   │   │   ├── command-palette.tsx    # Cmd+K quick actions & search
│   │   │   ├── channels-manager.tsx   # Channel connections, Webhook & API key dashboard
│   │   │   └── settings-dashboard.tsx # Full SaaS Workspace settings
```

## 3. Verification & Milestones
- Run `npm run check` (TypeScript + ESLint) to ensure zero compilation or typing errors.
- Run `npm run build` to confirm production build passes cleanly.
- Verify user interactions across switching views, reordering priorities, configuring channels, saving settings, and composing replies.
