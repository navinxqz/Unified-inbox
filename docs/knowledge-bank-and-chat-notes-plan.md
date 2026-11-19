# Plan: Knowledge Bank Dashboard, Chat Notes & TinyMCE Replica

## 1. Executive Summary
This document outlines the architecture, UX, and implementation strategy for three major features requested in `unified-inbox`:
1. **Chat Top Bar Personal Note:** A private, user-isolated note option in every chat header visible and editable only by the individual user.
2. **Chat Top Bar Knowledge Bank Quick Access:** A shared team knowledge bank flyout in every chat header for quick searching, previewing, and 1-click inserting canned knowledge articles into customer replies.
3. **Knowledge Bank Dashboard (Replacing `/#knowledge`):** A dedicated Knowledge Bank page featuring the dashboard layout from `C:\Navin\knowledge-bank-frontend`, including hero search ("How can we help you?"), "New Added Topics", "Most Researched Topics", full topic browser/reader, and article CRUD.
4. **TinyMCE Exact Replica:** An exact replica of the TinyMCE rich text editor design, toolbar button layout, styling, and functionality as implemented in `C:\Navin\knowledge-bank-frontend\components\topic\AddTopic.tsx`.

---

## 2. Technical Architecture & Constraints Compliance

### Rule Compliance (rules.md & user_global)
- **Zero Package Bloat / No Lockfile Modifications:** Per Rule 4 ("Don't modify package.json/lockfiles without permission"), TinyMCE will be loaded dynamically using official CDN script `https://cdn.jsdelivr.net/npm/tinymce@8.9.3/tinymce.min.js` and oxide skin, avoiding React 19 peer-dependency conflicts with `@tinymce/tinymce-react`.
- **Surgical Execution:** Reuses existing project components (`Button`, `Input`, `Dialog`, `Avatar`, `ChannelDot`, `useStoredState`) and design tokens (`hsl(--background)`, `hsl(--border)`, `hsl(--primary)`, `hsl(--secondary)`).
- **Storage Isolation:**
  - *Personal Notes:* Scoped to `unified_inbox_private_notes_v1:{userId}:{conversationId}`, ensuring individual privacy.
  - *Knowledge Bank Topics:* Scoped to shared team storage `unified_inbox_knowledge_topics_v1`, accessible to all agents/users.
- **Bilingual i18n (EN/BN):** Every new UI string, tooltip, placeholder, and status label will be registered in `src/features/inbox/i18n.tsx`.

---

## 3. TinyMCE Exact Replica Specification

Directly mirroring `C:\Navin\knowledge-bank-frontend\components\topic\AddTopic.tsx`:

| Parameter | Reference Implementation | Replica Target in `unified-inbox` |
| :--- | :--- | :--- |
| **Engine Version** | TinyMCE `8.9.3` via jsdelivr | `https://cdn.jsdelivr.net/npm/tinymce@8.9.3/tinymce.min.js` |
| **License & Promotion** | `license_key: "gpl"`, `promotion: false` | Identical |
| **Height & Menubar** | `height: 420`, `menubar: false`, `statusbar: true` | Identical |
| **Skin & CSS** | `skin: "oxide"`, oxide skin URL, default content CSS | Identical |
| **Plugins** | `advlist autolink lists image table paste searchreplace wordcount spellchecker print lineheight preview` | Identical |
| **Toolbar** | `bold italic underline strikethrough \| alignleft aligncenter alignright \| bullist numlist \| table \| fontfamily fontsize lineheight \| image \| spellcheckdialog \| undo redo \| preview \| print \| removeformat` | Exact replica matching button positioning and order |
| **Font Sizes** | `8pt 10pt 12pt 14pt 16pt 18pt 20pt 24pt 28pt 32pt 36pt 48pt 72pt` | Identical |
| **Line Heights** | `1 1.2 1.5 1.6 2 2.5` | Identical |
| **Context Menu** | `link image table spellchecker` | Identical |
| **Image Handling** | Base64 URI paste + file picker callback via `FileReader` | Native base64 URI encoding & direct inline pasting |
| **Content Styling** | Sans-serif typography, clean bordered tables, padding 6px 10px, responsive images | Embedded in TinyMCE `content_style` |

---

## 4. Feature Specifications

### A. Chat Top Bar Personal Note (`ThreadPanel`)
- **Location:** Header action bar next to Copilot and Pin buttons.
- **Icon / Trigger:** `StickyNote` icon with badge counter if active note exists.
- **Access Scope:** Personal/Individual only. Not visible to other team members or customers.
- **Drawer / Popover UX:**
  - Conversation-specific note tab + general scratchpad tab.
  - Textarea with autosave to localStorage (`unified_inbox_private_notes_v1`).
  - "Last edited at [timestamp]" indicator.
  - Quick action to copy note into clipboard or clear.

### B. Chat Top Bar Knowledge Bank Quick Access (`ThreadPanel`)
- **Location:** Header action bar next to Personal Note button.
- **Icon / Trigger:** `BookOpen` icon.
- **Access Scope:** Team-shared repository.
- **Drawer UX:**
  - Instant debounced search bar.
  - Category / tag filter pills.
  - Topic preview card with title, author, date, and rendered HTML snippet.
  - **Action 1: "Insert into Reply"** — Automatically pastes the snippet/answer into the message reply box.
  - **Action 2: "+ Clip to Knowledge Bank"** — Creates a draft KB article from selected chat messages.
  - **Action 3: "Open in Knowledge Bank"** — Navigates to the full Knowledge Bank page for that article.

### C. Knowledge Bank Page (`/#knowledge`)
Replaces the existing demo `KnowledgeModule` with a comprehensive 3-view system:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Knowledge Bank Module                           │
├────────────────────────────────────────────────────────────────────────┤
│  [1. Dashboard View]                                                   │
│   - Hero Banner: "How can we help you?" with SearchBar                 │
│   - Top Actions: "+ Add Topic" button                                  │
│   - Grid: "New Added Topics" (left) | "Most Researched Topics" (right) │
│                                                                        │
│  [2. Topic Browser & Detail View]                                      │
│   - Split-view: Left side Topic Cards list, Right side Topic Reader    │
│   - Topic Reader: Capitalized Title, Date, Rich HTML, File Download    │
│   - Action bar: Edit Topic, Delete Topic, Copy Link, Share             │
│                                                                        │
│  [3. Add / Edit Topic Form]                                            │
│   - Title input (required)                                             │
│   - Description editor with exact TinyMCE replica                      │
│   - Wrap-up classification (Type, Category, Subcategory)               │
│   - Tag Input (interactive chip pills with remove button)              │
│   - File attachment dropzone with file preview                         │
│   - Actions: Cancel, Submit ("Publish Topic" / "Update Topic")         │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Data Models (`types.ts`)

```typescript
export interface KnowledgeTopic {
  id: string;
  uuid: string;
  title: string;
  content: string; // Rich HTML produced by TinyMCE
  call_type_name?: string;
  category?: string;
  sub_category?: string;
  tags: string[];
  file_name?: string | null;
  file_url?: string | null;
  file_size?: number | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  views_count: number;
}

export interface PrivateNote {
  conversationId: string;
  content: string;
  updatedAt: string;
}
```

---

## 6. Implementation Steps

1. **Step 1: TinyMCE Component (`src/features/knowledge-bank/components/tinymce-editor.tsx`)**
   - Dynamic script loader for `tinymce.min.js` 8.9.3.
   - Container `div`/`textarea` initialization with exact toolbar, plugins, and options.
   - Controlled value synchronization and base64 image picker support.
2. **Step 2: Knowledge Bank Module (`src/features/knowledge-bank/`)**
   - Implement `KnowledgeBankModule` containing Dashboard view, Topic Cards list, Topic Reader view, and Add/Edit Topic form.
   - Pre-populate default seeded articles so the dashboard is immediately populated and usable.
   - Connect topic search, tag filtering, view counter increment, and CRUD actions.
3. **Step 3: Replace `/#knowledge` in Workspace**
   - Swap `KnowledgeModule` in `inbox-workspace.tsx` with `KnowledgeBankModule`.
   - Update navigation label in `primary-nav.tsx` to "Knowledge Bank" (Bangla: "নলেজ ব্যাংক").
4. **Step 4: Chat Top Bar Note & KB Drawers (`thread-panel.tsx`)**
   - Add `StickyNote` button with slide-out Private Note drawer.
   - Add `BookOpen` button with slide-out Knowledge Bank quick-lookup drawer.
   - Connect "Insert into Reply" trigger into chat composer via `onInsertText` or `insertion`.
5. **Step 5: Bilingual i18n Dictionary (`i18n.tsx`)**
   - Add all English and Bangla translations for headers, buttons, placeholders, dialogs, and labels.
6. **Step 6: Verification & Validation**
   - Run `npm run check` (TypeScript + Biome checks).
   - Test responsive layout with maximized/minimized sidebars.
   - Verify TinyMCE styling, toolbar buttons, table insertions, and base64 image uploading.
   - Update `context.md` with new reusable services and components.

