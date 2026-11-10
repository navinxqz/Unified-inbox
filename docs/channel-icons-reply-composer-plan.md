# Implementation Plan: Channel Icons, Modern Reply Previews, and Rich Composer Options

## Summary
Transform the unified inbox with:
1. Brand channel icons (SVG/Lucide) replacing generic dot points across sidebar, badges, thread headers, and cards.
2. Channel drag-and-drop ordering in the sidebar to define channel priority.
3. Modern reply mechanics (WhatsApp / Messenger / Discord style):
   - Hovering over a reply or quote highlights/previews the parent message.
   - Reply composer banner with cancel action.
   - Quoted message snippet embedded in replies.
4. Rich composer options:
   - File attachment with preview and clear action.
   - Emoji picker popover with categorized emojis.
   - Translate selector popover with target language selection.
   - Tagify popover with quick tag chips + custom tag input.

## Steps
1. Create `src/features/inbox/components/channel-icon.tsx` with dedicated brand SVG/vector icons for Slack, WhatsApp, Email, Messenger, Telegram.
2. Update `channel-dot.tsx`, `source-badge.tsx`, `channel-sidebar.tsx`, `conversation-list.tsx`, `thread-panel.tsx`, and `message-card.tsx` to use `ChannelIcon`.
3. Update `ChannelSidebar` to support HTML5 drag-and-drop reordering with `GripVertical` handles and priority ranking.
4. Update `types.ts` to support message reply references (`replyTo?: { id: string; authorName: string; text: string }`), tags, attachments, and translations in composer.
5. Create composer popovers for Emoji, Translate, and Tagify.
6. Enhance `message-card.tsx` to render quoted reply bubbles with hover-to-highlight parent message references.
7. Verify with `npm run check` and `npm run build`.
