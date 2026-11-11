"use client";

import { useMemo, useState } from "react";
import { Archive, ArchiveRestore, Pencil, Plus, Search, Zap } from "lucide-react";

import {
  EmptyState,
  Field,
  inputClass,
  ModuleShell,
  Pill,
  SectionCard,
} from "@/features/inbox/components/module-ui";
import type { SavedReply, SavedReplyCategory } from "@/features/inbox/types";
import { cn } from "@/lib/utils";

const categories: Array<{ id: SavedReplyCategory | "all"; label: string }> = [
  { id: "all", label: "All" },
  { id: "greeting", label: "Greeting" },
  { id: "delivery", label: "Delivery" },
  { id: "payment", label: "Payment" },
  { id: "support", label: "Support" },
  { id: "sales", label: "Sales" },
  { id: "custom", label: "Custom" },
];

type Draft = {
  name: string;
  shortcut: string;
  category: SavedReplyCategory;
  body: string;
  autoTrigger: string;
};

const emptyDraft: Draft = {
  name: "",
  shortcut: "",
  category: "support",
  body: "",
  autoTrigger: "",
};

type SavedRepliesProps = {
  replies: SavedReply[];
  onUpdate: (replies: SavedReply[]) => void;
};

export function SavedRepliesModule({ replies, onUpdate }: SavedRepliesProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<SavedReplyCategory | "all">("all");
  const [showArchived, setShowArchived] = useState(false);
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft>(emptyDraft);

  const visible = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return replies.filter((reply) => {
      if (Boolean(reply.archived) !== showArchived) return false;
      if (category !== "all" && reply.category !== category) return false;
      if (!normalized) return true;
      return (
        reply.name.toLowerCase().includes(normalized) ||
        reply.shortcut.toLowerCase().includes(normalized) ||
        reply.body.toLowerCase().includes(normalized)
      );
    });
  }, [replies, query, category, showArchived]);

  function startCreate() {
    setDraft(emptyDraft);
    setCreating(true);
    setEditingId(null);
  }

  function startEdit(reply: SavedReply) {
    setDraft({
      name: reply.name,
      shortcut: reply.shortcut,
      category: reply.category,
      body: reply.body,
      autoTrigger: reply.autoTrigger ?? "",
    });
    setEditingId(reply.id);
    setCreating(false);
  }

  function cancelEdit() {
    setCreating(false);
    setEditingId(null);
    setDraft(emptyDraft);
  }

  function saveDraft() {
    const name = draft.name.trim();
    const body = draft.body.trim();
    const shortcut = draft.shortcut.trim().toLowerCase().replace(/^\//, "");
    if (!name || !body || !shortcut) return;

    const autoTrigger = draft.autoTrigger.trim();

    if (editingId) {
      onUpdate(
        replies.map((reply) =>
          reply.id === editingId
            ? {
                ...reply,
                name,
                shortcut,
                category: draft.category,
                body,
                autoTrigger: autoTrigger || undefined,
                auto: autoTrigger.length > 0,
              }
            : reply,
        ),
      );
    } else {
      onUpdate([
        {
          id: `sr-${Date.now()}`,
          name,
          shortcut,
          category: draft.category,
          body,
          autoTrigger: autoTrigger || undefined,
          auto: autoTrigger.length > 0,
          useCount: 0,
        },
        ...replies,
      ]);
    }

    cancelEdit();
  }

  function toggleArchive(reply: SavedReply) {
    onUpdate(
      replies.map((item) =>
        item.id === reply.id ? { ...item, archived: !item.archived } : item,
      ),
    );
  }

  return (
    <ModuleShell
      title="Saved replies"
      subtitle="Type / in the composer to insert one. Keyword triggers answer common questions automatically."
      actions={
        <button
          type="button"
          onClick={startCreate}
          className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-3 text-[13px] font-semibold text-white hover:bg-primary/90"
        >
          <Plus className="size-4" />
          New reply
        </button>
      }
      walkthrough={{
        title: "Set up saved replies in 1 minute",
        steps: [
          "Create a reply with a name, a /shortcut, and the message body.",
          "Add a keyword trigger to answer that question automatically — the ⚡Auto chip marks it.",
          "In any conversation, type / and pick the reply to insert it.",
          "Archived replies stay searchable but are never offered in the composer.",
        ],
      }}
    >
      <div className="flex flex-wrap items-center gap-2">
        <label className="flex h-9 min-w-[220px] flex-1 items-center gap-2 rounded-lg border border-border bg-background px-2.5 text-muted-foreground">
          <Search className="size-4 shrink-0" />
          <span className="sr-only">Search saved replies</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search replies, shortcuts, or text"
            className="min-w-0 flex-1 bg-transparent text-[13px] text-foreground outline-none placeholder:text-muted-foreground"
          />
        </label>
        <div className="flex flex-wrap gap-1">
          {categories.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setCategory(item.id)}
              className={cn(
                "rounded-full border px-2.5 py-1 text-xs font-semibold transition-colors",
                category === item.id
                  ? "border-primary bg-primary-soft text-primary-strong"
                  : "border-border text-muted-foreground hover:bg-surface",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setShowArchived((value) => !value)}
          className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border px-2.5 text-xs font-semibold text-ink-soft hover:bg-surface"
        >
          {showArchived ? <ArchiveRestore className="size-3.5" /> : <Archive className="size-3.5" />}
          {showArchived ? "Show active" : "Show archived"}
        </button>
      </div>

      {creating || editingId ? (
        <SectionCard
          title={editingId ? "Edit saved reply" : "New saved reply"}
          description="Macros {{name}} and {{company}} are filled in automatically."
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Name">
              <input
                value={draft.name}
                onChange={(event) => setDraft({ ...draft, name: event.target.value })}
                className={inputClass}
                placeholder="Delivery timeline"
              />
            </Field>
            <Field label="Slash shortcut" hint="Typed as /delivery in the composer.">
              <input
                value={draft.shortcut}
                onChange={(event) => setDraft({ ...draft, shortcut: event.target.value })}
                className={inputClass}
                placeholder="delivery"
              />
            </Field>
            <Field label="Category">
              <select
                value={draft.category}
                onChange={(event) =>
                  setDraft({ ...draft, category: event.target.value as SavedReplyCategory })
                }
                className={inputClass}
              >
                {categories
                  .filter((item) => item.id !== "all")
                  .map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.label}
                    </option>
                  ))}
              </select>
            </Field>
            <Field
              label="Keyword auto-trigger (optional)"
              hint="Inbound message containing this keyword gets the reply automatically."
            >
              <input
                value={draft.autoTrigger}
                onChange={(event) => setDraft({ ...draft, autoTrigger: event.target.value })}
                className={inputClass}
                placeholder="delivery charge"
              />
            </Field>
          </div>
          <div className="mt-3">
            <Field label="Message body">
              <textarea
                value={draft.body}
                onChange={(event) => setDraft({ ...draft, body: event.target.value })}
                rows={4}
                className={inputClass}
                placeholder="Hi {{name}}, delivery inside Dhaka takes 1–2 days…"
              />
            </Field>
          </div>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={saveDraft}
              disabled={!draft.name.trim() || !draft.body.trim() || !draft.shortcut.trim()}
              className="h-9 rounded-lg bg-primary px-3.5 text-[13px] font-semibold text-white hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {editingId ? "Save changes" : "Create reply"}
            </button>
            <button
              type="button"
              onClick={cancelEdit}
              className="h-9 rounded-lg border border-border px-3.5 text-[13px] font-semibold text-ink-soft hover:bg-surface"
            >
              Cancel
            </button>
          </div>
        </SectionCard>
      ) : null}

      <div className="overflow-hidden rounded-xl border border-border">
        {visible.length === 0 ? (
          <EmptyState
            icon={Zap}
            title="No saved replies here"
            text="Create one, or switch the filter to see another category."
          />
        ) : (
          <div className="divide-y divide-border-subtle">
            {visible.map((reply) => (
              <div key={reply.id} className="flex items-start gap-3 px-4 py-3">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary-strong">
                  <Zap className="size-4" strokeWidth={2.2} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <p className="text-sm font-semibold">{reply.name}</p>
                    <code className="rounded bg-surface px-1.5 py-0.5 text-[11px] font-semibold text-ink-soft">
                      /{reply.shortcut}
                    </code>
                    <Pill tone="neutral">{reply.category}</Pill>
                    {reply.autoTrigger ? (
                      <Pill tone="warning">
                        <Zap className="size-3" strokeWidth={2.5} />
                        Auto · “{reply.autoTrigger}”
                      </Pill>
                    ) : null}
                    {reply.archived ? <Pill tone="neutral">Archived</Pill> : null}
                  </div>
                  <p className="mt-1 line-clamp-2 text-[13px] text-muted-foreground">
                    {reply.body}
                  </p>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    Used {reply.useCount} times
                  </p>
                </div>
                <div className="flex shrink-0 gap-1">
                  <button
                    type="button"
                    onClick={() => startEdit(reply)}
                    aria-label={`Edit ${reply.name}`}
                    className="rounded-lg p-1.5 text-muted-foreground hover:bg-surface hover:text-foreground"
                  >
                    <Pencil className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleArchive(reply)}
                    aria-label={reply.archived ? `Restore ${reply.name}` : `Archive ${reply.name}`}
                    className="rounded-lg p-1.5 text-muted-foreground hover:bg-surface hover:text-foreground"
                  >
                    {reply.archived ? (
                      <ArchiveRestore className="size-4" />
                    ) : (
                      <Archive className="size-4" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ModuleShell>
  );
}
