# AGENTS.md — Unified Inbox Architecture & Reusable Reference

Welcome to the Unified Inbox repository. This document serves as a reference for agents and developers on reusable services, components, design tokens, and patterns across the system.

---

## 1. Key Principles & Conventions

- **Next.js 16 (App Router) + React 19 + Tailwind CSS v4.**
- **Local Storage Driven State:** Mock data resides in `src/features/inbox/data.ts`. All interactive mutations persist to browser `localStorage` via the `useStoredState` hook (`src/features/inbox/storage.ts`).
- **No Unsanctioned Dependencies:** Per project guardrails, do not install or modify `package.json` / lockfiles without explicit user approval.
- **Bilingual i18n:** Every single user-facing text must be wrapped in `t(...)` from `useI18n()` (`src/features/inbox/i18n.tsx`). Every key must have English and Bangla translations with zero duplicate keys in the dictionary.

---

## 2. Reusable UI Components

### `ModuleShell` (`src/features/inbox/components/module-ui.tsx`)
Standard page frame for all workspace modules. Provides title, subtitle, top-right action buttons, walkthrough dialog, and responsive padding.
```tsx
<ModuleShell
  title="Module Name"
  subtitle="Brief descriptive subtitle"
  actions={<button className="bg-primary text-primary-foreground">Action</button>}
  walkthrough={{
    title: "How to use",
    steps: ["Step 1 description", "Step 2 description"]
  }}
>
  {children}
</ModuleShell>
```

### `TinyMceEditor` (`src/features/inbox/components/tinymce-editor.tsx`)
100% replica of TinyMCE rich text editor configuration from `C:\Navin\knowledge-bank-frontend\components\topic\AddTopic.tsx`.
- Loaded dynamically via official jsDelivr CDN (`tinymce@8.9.3`) with `oxide` skin and GPL license.
- No peer-dependency conflicts with React 19 / Next.js 16.
- Custom button positioning, tables, alignments, font sizes (`8pt`–`72pt`), line heights (`1`–`2.5`), context menu, and base64 image file picker / paste handlers.
```tsx
<TinyMceEditor
  value={content}
  onChange={(newHtml) => setContent(newHtml)}
  placeholder="Start writing..."
  height={420}
/>
```

### `ChannelIcon` (`src/features/inbox/components/channel-icon.tsx`)
SVG brand icons for omnichannel providers (`whatsapp`, `messenger`, `instagram`, `gmail`, `email`, `telegram`, `discord`, `slack`, `website`).
```tsx
<ChannelIcon channelId="whatsapp" size={16} />
```

### `StatCard`, `SectionCard`, `Pill`, `EmptyState` (`module-ui.tsx`)
Standard layout cards, status indicators, and empty states:
```tsx
<StatCard label="Total Topics" value="12" tone="success" />
<SectionCard title="Section Title" description="Helpful text">{children}</SectionCard>
<Pill tone="success">Ready</Pill>
<EmptyState icon={BookOpen} title="None found" text="Try another query." />
```

---

## 3. Chat Top Bar Features & Knowledge Bank

### Personal Notes (`src/features/inbox/components/chat-private-note-drawer.tsx`)
- Triggered by `StickyNote` icon in `ThreadPanel` header.
- **Privacy:** Isolated to the logged-in user (`unified_inbox_private_notes_v1`).
- Contains conversation notes and general scratchpad with debounced autosaving, timestamp indicators, copy to clipboard, and clear.
- Header button shows amber indicator dot if a note exists, and transforms into a cross (`X`) when opened so users can click the exact same spot to close.

### Shared Knowledge Bank Drawer (`src/features/inbox/components/chat-knowledge-bank-drawer.tsx`)
- Triggered by `BookOpen` icon in `ThreadPanel` header.
- **Team-Shared:** Searches all team knowledge topics (`unified_inbox_knowledge_topics_v1`).
- Supports debounced keyword & tag filtering, topic preview, and 1-click **"Insert into Reply"** that strips HTML into clean plain text for immediate customer replies.
- Header button transforms into a cross (`X`) when opened for immediate click-to-close.

### Knowledge Bank Dashboard (`src/features/inbox/components/modules/knowledge-bank-module.tsx`)
- Accessible at `/#knowledge` (nav label: "Knowledge Bank").
- **Dashboard View:** Hero search ("How can we help you?"), "+ Add Topic" action, "New Added Topics" list, "Most Researched Topics" list.
- **Topic Reader:** Formatted title, dates, authors, categories, rich HTML reader, file download, and edit/delete actions.
- **Add / Edit Forms:** Title, TinyMCE editor, Wrap-Up classification (Call Type, Category, Sub-category), tag chips with removal, and file attachment dropzone.
- Secondary tab retains legacy AI indexing sources.

---

## 4. Verification Workflow

Always verify before completing tasks:
```bash
npm run check    # runs next typegen, tsc --noEmit, and eslint .
```
Ensure code adheres to `rules.md` (thin controllers, minimal code, platform built-ins, zero lockfile churn).

